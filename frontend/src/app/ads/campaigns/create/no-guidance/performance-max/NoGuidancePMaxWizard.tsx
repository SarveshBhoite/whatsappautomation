"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Search, LayoutGrid, Zap, AlertCircle, ChevronDown, ChevronUp, Info, Sparkles, Image as ImageIcon, Video as VideoIcon, Upload, Phone, DollarSign, Tag, FileText, MessageSquare, Smartphone, SlidersHorizontal, Globe, Users, Settings, Edit3, Lock, ShieldAlert, Layers
} from "lucide-react";

export default function NoGuidancePMaxWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  // Wizard Step State: "BIDDING" | "CAMPAIGN_SETTINGS" | "ASSET_GROUP" | "BUDGET" | "SUMMARY"
  const [wizardStep, setWizardStep] = useState<"BIDDING" | "CAMPAIGN_SETTINGS" | "ASSET_GROUP" | "BUDGET" | "SUMMARY">("BIDDING");

  // Step 1: Bidding State
  const [biddingFocus, setBiddingFocus] = useState<"Maximize conversions" | "Target CPA" | "Maximize conversion value" | "Target ROAS">("Maximize conversions");
  const [setTargetCpa, setSetTargetCpa] = useState<boolean>(false);
  const [targetCpaValue, setTargetCpaValue] = useState<string>("166.11");
  const [targetRoasValue, setTargetRoasValue] = useState<string>("200");
  const [onlyBidNewCustomers, setOnlyBidNewCustomers] = useState<boolean>(false);
  const [adjustLapsedCustomers, setAdjustLapsedCustomers] = useState<boolean>(false);

  // Step 2: Campaign Settings State
  const [selectedLocation, setSelectedLocation] = useState<"ALL" | "INDIA" | "CUSTOM">("ALL");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [locationTargetingType, setLocationTargetingType] = useState<"PRESENCE_INTEREST" | "PRESENCE">("PRESENCE_INTEREST");
  const [showLocationOptions, setShowLocationOptions] = useState<boolean>(true);
  
  // Language Selection State with API simulation
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
  const [isSearchingLanguages, setIsSearchingLanguages] = useState<boolean>(false);
  const [languageSearchResults, setLanguageSearchResults] = useState<string[]>([]);

  const allAvailableLanguages = [
    "English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu",
    "Kannada", "Odia", "Malayalam", "Punjabi", "Spanish", "French", "German",
    "Chinese (simplified)", "Japanese", "Arabic", "Portuguese", "Russian", "Italian", "Dutch"
  ];

  useEffect(() => {
    if (languageSearchInput.trim()) {
      setIsSearchingLanguages(true);
      const timer = setTimeout(() => {
        const filtered = allAvailableLanguages.filter(l =>
          l.toLowerCase().includes(languageSearchInput.toLowerCase()) && !selectedLanguages.includes(l)
        );
        setLanguageSearchResults(filtered);
        setIsSearchingLanguages(false);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setLanguageSearchResults([]);
    }
  }, [languageSearchInput, selectedLanguages]);

  const [euPoliticalAds, setEuPoliticalAds] = useState<"YES" | "NO">("NO");
  const [showMoreCampaignSettings, setShowMoreCampaignSettings] = useState<boolean>(false);

  // Dynamic Ad Schedules State
  const [adScheduleList, setAdScheduleList] = useState<Array<{ day: string; start: string; end: string }>>([
    { day: "All days", start: "00:00", end: "00:00" }
  ]);

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

  // Start and End Dates State
  const [startDate, setStartDate] = useState<string>("2026-08-10");
  const [endDate, setEndDate] = useState<string>("");

  // Campaign URL options & Custom Parameters
  const [trackingTemplate, setTrackingTemplate] = useState<string>("");
  const [finalUrlSuffix, setFinalUrlSuffix] = useState<string>("");
  const [customParameters, setCustomParameters] = useState<Array<{ id: string; name: string; value: string }>>([
    { id: "1", name: "", value: "" }
  ]);

  const handleAddCustomParameter = () => {
    setCustomParameters(prev => [...prev, { id: Date.now().toString(), name: "", value: "" }]);
  };

  // Brand Exclusions Modal State
  const availableBrands = [
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

  const [showBrandListModal, setShowBrandListModal] = useState<boolean>(false);
  const [newBrandListName, setNewBrandListName] = useState<string>("");
  const [selectedBrandsList, setSelectedBrandsList] = useState<Array<{ name: string; url: string }>>([]);
  const [brandSearchTerm, setBrandSearchTerm] = useState<string>("");
  const [createdBrandLists, setCreatedBrandLists] = useState<Array<{ name: string; brands: string[] }>>([]);

  // Devices & Exclusions State
  const [dataExclusionsTab, setDataExclusionsTab] = useState<"SEARCH" | "BROWSE">("SEARCH");
  const [dataExclusionsSearchTerm, setDataExclusionsSearchTerm] = useState<string>("");
  const [selectedDataExclusions, setSelectedDataExclusions] = useState<string[]>([]);
  const [devicesSelection, setDevicesSelection] = useState({
    computers: true,
    mobile: true,
    tablets: true,
    tv: true
  });
  const [turnOnAgeExclusions, setTurnOnAgeExclusions] = useState<boolean>(false);
  const [turnOnGenderExclusions, setTurnOnGenderExclusions] = useState<boolean>(false);

  // Step 3: Asset Group State
  const [assetGroupName, setAssetGroupName] = useState<string>("Asset Group 1");
  const [finalUrl, setFinalUrl] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");

  // Brand Guidelines State
  const [showBrandGuidelinesDetails, setShowBrandGuidelinesDetails] = useState<boolean>(false);
  const [brandLogos, setBrandLogos] = useState<string[]>([]);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const [mainColor, setMainColor] = useState<string>("#ffffff");
  const [accentColor, setAccentColor] = useState<string>("#4285f4");
  const [selectedFont, setSelectedFont] = useState<string>("Any font");
  const [termExclusionsInput, setTermExclusionsInput] = useState<string>("");
  const [termExclusionsList, setTermExclusionsList] = useState<string[]>([]);
  const [messagingRestrictions, setMessagingRestrictions] = useState<string[]>([""]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const localUrl = URL.createObjectURL(file);
    const cdnUrl = `https://ik.imagekit.io/whatsappdemo/logos/${Date.now()}_${file.name}`;

    setTimeout(() => {
      setBrandLogos(prev => [...prev, cdnUrl || localUrl]);
      setIsUploadingLogo(false);
    }, 400);
  };
  const [headlines, setHeadlines] = useState<string[]>(["", "", ""]);
  const [longHeadlines, setLongHeadlines] = useState<string[]>([""]);
  const [descriptions, setDescriptions] = useState<string[]>(["", ""]);
  const [ctaOption, setCtaOption] = useState<string>("Automated (recommended)");

  // Uploaded Media State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [uploadedClips, setUploadedClips] = useState<string[]>([]);

  // Saved Asset Extensions State
  const [savedSitelinks, setSavedSitelinks] = useState<Array<{ text: string; desc1: string; desc2: string; url: string }>>([]);
  const [savedPromotions, setSavedPromotions] = useState<Array<{ occasion: string; item: string; discount: string; url: string }>>([]);
  const [savedPrices, setSavedPrices] = useState<Array<{ type: string; price: string }>>([]);
  const [savedMessages, setSavedMessages] = useState<Array<{ platform: string }>>([]);
  const [savedSnippets, setSavedSnippets] = useState<Array<{ header: string; values: string[] }>>([]);
  const [savedLeadForms, setSavedLeadForms] = useState<Array<{ headline: string; business: string }>>([]);
  const [savedCallouts, setSavedCallouts] = useState<string[]>([]);

  // Modals & Calls State
  const [activeModal, setActiveModal] = useState<
    "SITELINKS" | "CALLS" | "PROMOTIONS" | "PRICES" | "SNIPPETS" | "LEAD_FORMS" | "APPS" | "BRAND_GUIDELINES" | "AUDIENCE_SIGNAL" | null
  >(null);
  const [callCountry, setCallCountry] = useState<string>("India (+91)");
  const [callPhone, setCallPhone] = useState<string>("");
  const [callConvAction, setCallConvAction] = useState<string>("Use account settings (Calls from ads)");
  const [callSchedules, setCallSchedules] = useState<Array<{ id: string; day: string; start: string; end: string }>>([
    { id: "cs-1", day: "All days", start: "00:00", end: "00:00" }
  ]);

  // Detailed Promotion Asset Modal State
  const [promoOccasion, setPromoOccasion] = useState<string>("None");
  const [promoLanguage, setPromoLanguage] = useState<string>("English");
  const [promoCurrency, setPromoCurrency] = useState<string>("INR");
  const [promoType, setPromoType] = useState<string>("Monetary discount");
  const [promoAmountValue, setPromoAmountValue] = useState<string>("");
  const [promoDetailsType, setPromoDetailsType] = useState<string>("None");
  const [promoDetailsValue, setPromoDetailsValue] = useState<string>("");
  const [promoItem, setPromoItem] = useState<string>("");
  const [promoFinalUrl, setPromoFinalUrl] = useState<string>("");

  // Detailed Prices Asset Modal State
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
  const [priceCustomParams, setPriceCustomParams] = useState<Array<{ id: string; name: string; value: string }>>([
    { id: "pcp-1", name: "", value: "" }
  ]);

  // Detailed Messages Asset Modal State
  const [msgPlatform, setMsgPlatform] = useState<"WhatsApp" | "Messenger" | "Zalo">("WhatsApp");
  const [msgCustomUrlName, setMsgCustomUrlName] = useState<string>("");
  const [msgStarterMessage, setMsgStarterMessage] = useState<string>("Can I get started with a delivery?");
  const [msgCallToAction, setMsgCallToAction] = useState<string>("Get started");
  const [msgCtaDescription, setMsgCtaDescription] = useState<string>("");

  // Detailed Structured Snippets Modal State
  const [snippetLanguage, setSnippetLanguage] = useState<string>("English");
  const [snippetHeaderType, setSnippetHeaderType] = useState<string>("Amenities");
  const [snippetValues, setSnippetValues] = useState<string[]>(["", "", ""]);

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

  // Dates
  const [promoStartDate, setPromoStartDate] = useState<string>("");
  const [promoEndDate, setPromoEndDate] = useState<string>("");

  // URL Options
  const [promoTrackingTemplate, setPromoTrackingTemplate] = useState<string>("");
  const [promoFinalUrlSuffix, setPromoFinalUrlSuffix] = useState<string>("");
  const [promoCustomParams, setPromoCustomParams] = useState<Array<{ id: string; name: string; value: string }>>([
    { id: "pcp-1", name: "", value: "" }
  ]);

  // Advanced Options
  const [showPromoAdvanced, setShowPromoAdvanced] = useState<boolean>(false);
  const [promoTermsConditions, setPromoTermsConditions] = useState<string>("");
  const [promoAdditionalTermsLink, setPromoAdditionalTermsLink] = useState<string>("");
  const [assetSchedStartDate, setAssetSchedStartDate] = useState<string>("");
  const [assetSchedEndDate, setAssetSchedEndDate] = useState<string>("");
  const [assetSchedules, setAssetSchedules] = useState<Array<{ id: string; day: string; start: string; end: string }>>([
    { id: "as-1", day: "All days", start: "12:00 AM", end: "12:00 AM" }
  ]);

  // Asset Optimization Toggles
  const [enableTextCustomization, setEnableTextCustomization] = useState<boolean>(true);
  const [enableFinalUrlExpansion, setEnableFinalUrlExpansion] = useState<boolean>(true);

  // Signals State
  const [searchThemes, setSearchThemes] = useState<string[]>([]);
  const [searchThemeInput, setSearchThemeInput] = useState<string>("");
  const [audienceName, setAudienceName] = useState<string>("");

  // Step 4: Budget State
  const [budgetType, setBudgetType] = useState<"DAILY" | "TOTAL">("DAILY");
  const [dailyBudgetValue, setDailyBudgetValue] = useState<string>("");

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
            <span className="text-slate-400">No Guidance</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Performance Max Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "779-100-4787 Google Ads Account"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-400 cursor-pointer hover:text-white" />
        </div>
      </header>

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-72 border-r border-slate-800 p-4 space-y-4 shrink-0 bg-slate-950/80 hidden md:flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span>Performance Max</span>
            </div>

            <nav className="space-y-1.5 text-xs font-sans">
              {/* 1. Bidding */}
              <div className="space-y-1">
                <div
                  onClick={() => setWizardStep("BIDDING")}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${
                    wizardStep === "BIDDING"
                      ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span>1. Bidding</span>
                </div>
                {wizardStep === "BIDDING" && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-400 border-l border-slate-800 pl-3 py-1">
                    <p className="text-primary font-medium">Bidding</p>
                    <p className="hover:text-slate-200">Customer acquisition</p>
                    <p className="hover:text-slate-200">Customer retention</p>
                  </div>
                )}
              </div>

              {/* 2. Campaign settings */}
              <div className="space-y-1">
                <div
                  onClick={() => setWizardStep("CAMPAIGN_SETTINGS")}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${
                    wizardStep === "CAMPAIGN_SETTINGS"
                      ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span>2. Campaign settings</span>
                </div>
                {wizardStep === "CAMPAIGN_SETTINGS" && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-400 border-l border-slate-800 pl-3 py-1">
                    <p className="hover:text-slate-200">Locations</p>
                    <p className="hover:text-slate-200">Languages</p>
                    <p className="hover:text-slate-200">EU political ads</p>
                    <div className="pt-1">
                      <p className="text-slate-300 font-semibold">more settings</p>
                      <div className="ml-2 space-y-0.5 text-[10px] text-slate-400">
                        <p>Ad Schedule</p>
                        <p>Start and end dates</p>
                        <p>Campaign URL options</p>
                        <p>Page Feeds</p>
                        <p>Devices</p>
                        <p>Brand exclusions</p>
                        <p>Demographic exclusions</p>
                        <p>Audience exclusions</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Asset group */}
              <div className="space-y-1">
                <div
                  onClick={() => setWizardStep("ASSET_GROUP")}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${
                    wizardStep === "ASSET_GROUP"
                      ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span>3. Asset group</span>
                </div>
                {wizardStep === "ASSET_GROUP" && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-400 border-l border-slate-800 pl-3 py-1">
                    <p className="hover:text-slate-200">Name</p>
                    <p className="hover:text-slate-200">Final URL</p>
                    <p className="hover:text-slate-200">Assets</p>
                    <p className="hover:text-slate-200">Asset optimization</p>
                    <p className="hover:text-slate-200">Search themes</p>
                    <p className="hover:text-slate-200">Audience signal</p>
                  </div>
                )}
              </div>

              {/* 4. Budget */}
              <div
                onClick={() => setWizardStep("BUDGET")}
                className={`p-2 rounded-lg font-medium cursor-pointer transition-all ${
                  wizardStep === "BUDGET"
                    ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <span>4. Budget</span>
              </div>

              {/* 5. Summary */}
              <div
                onClick={() => setWizardStep("SUMMARY")}
                className={`p-2 rounded-lg font-medium cursor-pointer transition-all ${
                  wizardStep === "SUMMARY"
                    ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <span>5. Summary</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 max-w-4xl mx-auto">
          
          {/* STEP 1: BIDDING */}
          {wizardStep === "BIDDING" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Bidding</h1>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <h2 className="text-sm font-semibold text-white border-b border-slate-800 pb-2">Bidding</h2>
                
                <div className="space-y-3">
                  <label className="block text-slate-300 font-semibold">What do you want to focus on?</label>
                  <select
                    value={biddingFocus}
                    onChange={(e) => setBiddingFocus(e.target.value as any)}
                    className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-medium"
                  >
                    <option value="Maximize conversions">Maximize conversions</option>
                    <option value="Target CPA">Target CPA</option>
                    <option value="Maximize conversion value">Maximize conversion value</option>
                    <option value="Target ROAS">Target ROAS</option>
                  </select>

                  {biddingFocus === "Target CPA" && (
                    <div className="pt-2 space-y-1.5 animate-in fade-in duration-150">
                      <label className="block text-slate-300 font-semibold">Target CPA</label>
                      <div className="relative max-w-md">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                        <input
                          type="number"
                          value={targetCpaValue}
                          onChange={(e) => setTargetCpaValue(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  {biddingFocus === "Target ROAS" && (
                    <div className="pt-2 space-y-1.5 animate-in fade-in duration-150">
                      <label className="block text-slate-300 font-semibold">Target ROAS</label>
                      <div className="relative max-w-md">
                        <input
                          type="number"
                          value={targetRoasValue}
                          onChange={(e) => setTargetRoasValue(e.target.value)}
                          placeholder="200"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-8 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Acquisition */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h3 className="font-semibold text-slate-200">Customer acquisition</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyBidNewCustomers}
                      onChange={(e) => setOnlyBidNewCustomers(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">Only bid for new customers</span>
                  </label>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Your campaign will be limited to only new customers, regardless of your bid strategy. By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more about customer acquisition</a>
                  </p>
                </div>

                {/* Customer Retention */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h3 className="font-semibold text-slate-200">Customer retention</h3>
                  <div className="space-y-2">
                    <label
                      onClick={() => {
                        setAdjustLapsedCustomers(true);
                      }}
                      className="flex items-center gap-3 cursor-not-allowed group w-fit"
                    >
                      <input
                        type="checkbox"
                        disabled
                        checked={false}
                        className="rounded bg-slate-950 border-slate-700 text-slate-600 h-4 w-4 cursor-not-allowed disabled:opacity-60"
                      />
                      <span className="text-slate-400 group-hover:text-slate-300 font-medium">
                        Adjust your bidding to help re-engage lapsed customers
                      </span>
                    </label>

                    {adjustLapsedCustomers && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs animate-in fade-in duration-150">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                        <span>You can’t bid higher for lapsed customers because you don’t have a purchase goal in your account.</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[11px] leading-relaxed space-y-1">
                    <p>You can’t bid higher for lapsed customers because you don’t have a purchase goal in your account. Add a purchase goal to run campaigns that bid higher for specific customer types.</p>
                    <p className="text-slate-400 pt-1">By default, your campaign does not adjust bidding to re-engage lapsed customers. However, you can configure your customer acquisition settings to optimize for winning back lapsed customers. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more about how to re-engage lapsed customers</a></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CAMPAIGN SETTINGS */}
          {wizardStep === "CAMPAIGN_SETTINGS" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign settings</h1>
              <p className="text-slate-400">To reach the right people, start by defining key settings for your campaign</p>

              {/* Locations */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h2 className="text-sm font-semibold text-slate-100">Locations</h2>
                <p className="text-slate-400">Select locations for this campaign</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="noGuidancePmaxLoc" checked={selectedLocation === "ALL"} onChange={() => setSelectedLocation("ALL")} className="text-primary h-4 w-4" />
                    <span>All countries and territories</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="noGuidancePmaxLoc" checked={selectedLocation === "INDIA"} onChange={() => setSelectedLocation("INDIA")} className="text-primary h-4 w-4" />
                    <span>India</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="noGuidancePmaxLoc" checked={selectedLocation === "CUSTOM"} onChange={() => setSelectedLocation("CUSTOM")} className="text-primary h-4 w-4" />
                    <span>Enter another location</span>
                  </label>
                </div>

                {/* Location Options Accordion */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowLocationOptions(!showLocationOptions)}
                    className="flex items-center justify-between w-full py-1 text-slate-300 font-semibold cursor-pointer"
                  >
                    <span>Location options</span>
                    {showLocationOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {showLocationOptions && (
                    <div className="mt-3 p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3 animate-in fade-in duration-150">
                      <span className="font-semibold text-slate-200 block">Include</span>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="locTargetType"
                          checked={locationTargetingType === "PRESENCE_INTEREST"}
                          onChange={() => setLocationTargetingType("PRESENCE_INTEREST")}
                          className="mt-0.5 text-primary h-4 w-4"
                        />
                        <div>
                          <span className="font-semibold text-slate-200 block">Presence or interest: People in, regularly in, or who've shown interest in your included locations (recommended)</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer border-t border-slate-800/60 pt-2">
                        <input
                          type="radio"
                          name="locTargetType"
                          checked={locationTargetingType === "PRESENCE"}
                          onChange={() => setLocationTargetingType("PRESENCE")}
                          className="mt-0.5 text-primary h-4 w-4"
                        />
                        <div>
                          <span className="font-semibold text-slate-200 block">Presence: People in or regularly in your included locations</span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h2 className="text-sm font-semibold text-slate-100">Languages</h2>
                <p className="text-slate-400">Select the languages your customers speak.</p>

                <div className="relative max-w-md">
                  <input
                    type="text"
                    value={languageSearchInput}
                    onChange={(e) => setLanguageSearchInput(e.target.value)}
                    placeholder="Start typing or select a language"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                  />

                  {/* API search results popup */}
                  {languageSearchInput.trim() !== "" && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto py-1 text-xs">
                      {isSearchingLanguages ? (
                        <p className="px-4 py-2 text-slate-400 font-mono">Searching languages...</p>
                      ) : languageSearchResults.length > 0 ? (
                        languageSearchResults.map((lang, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedLanguages(prev => [...prev, lang]);
                              setLanguageSearchInput("");
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200 cursor-pointer flex items-center justify-between"
                          >
                            <span>{lang}</span>
                            <Plus className="h-3.5 w-3.5 text-primary" />
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-2 text-slate-500">No matching languages found</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedLanguages.map((lang, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary font-semibold">
                      {lang}
                      <button type="button" onClick={() => setSelectedLanguages(prev => prev.filter((_, i) => i !== idx))}>
                        <X className="h-3 w-3 hover:text-rose-400" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* EU political ads */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-100">EU political ads</h2>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded">Required</span>
                </div>
                <p className="text-slate-300">Does your campaign have European Union political ads?</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="euPolNoGuidance" checked={euPoliticalAds === "YES"} onChange={() => setEuPoliticalAds("YES")} className="text-primary h-4 w-4" />
                  <span>Yes, this campaign has EU political ads</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="euPolNoGuidance" checked={euPoliticalAds === "NO"} onChange={() => setEuPoliticalAds("NO")} className="text-primary h-4 w-4" />
                  <span>No, this campaign doesn't have EU political ads</span>
                </label>
                <p className="text-[11px] text-slate-500 pt-1">EU regulation requires Google to ask this question. Learn how an EU political ad is defined</p>
              </div>

              {/* More settings Toggle Button */}
              {!showMoreCampaignSettings ? (
                <div className="pt-2 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setShowMoreCampaignSettings(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all hover:bg-slate-800"
                  >
                    <span>More settings</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              ) : (
                /* More settings Section */
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-slate-200 text-sm">More settings</h3>
                    <button
                      type="button"
                      onClick={() => setShowMoreCampaignSettings(false)}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Fewer settings</span>
                      <ChevronUp className="h-4 w-4" />
                    </button>
                  </div>

                {/* Ad schedule */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-300">Ad schedule</h4>
                  
                  {adScheduleList.map((sched, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <select
                        value={sched.day}
                        onChange={(e) => {
                          const updated = [...adScheduleList];
                          updated[idx].day = e.target.value;
                          setAdScheduleList(updated);
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-medium"
                      >
                        {dayOptions.map((day, i) => (
                          <option key={i} value={day}>{day}</option>
                        ))}
                      </select>

                      <select
                        value={sched.start}
                        onChange={(e) => {
                          const updated = [...adScheduleList];
                          updated[idx].start = e.target.value;
                          setAdScheduleList(updated);
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                      >
                        {timeOptions.map((t, i) => (
                          <option key={i} value={t}>{t}</option>
                        ))}
                      </select>

                      <span className="text-slate-400">to</span>

                      <select
                        value={sched.end}
                        onChange={(e) => {
                          const updated = [...adScheduleList];
                          updated[idx].end = e.target.value;
                          setAdScheduleList(updated);
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                      >
                        {timeOptions.map((t, i) => (
                          <option key={i} value={t}>{t}</option>
                        ))}
                      </select>

                      {adScheduleList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setAdScheduleList(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-rose-400 ml-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setAdScheduleList(prev => [...prev, { day: "All days", start: "00:00", end: "00:00" }])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add ad schedule
                  </button>

                  <p className="text-[11px] text-slate-400 leading-relaxed">To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. Learn more</p>
                  <p className="text-[11px] text-slate-500 font-mono">Based on account time zone: (GMT+05:30) India Standard Time</p>
                </div>

                {/* Start and end dates with Date Inputs */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-300">Start and end dates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-400 font-semibold">Start date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-400 font-semibold">End date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">Your ads will continue to run unless you specify an end date.</p>
                </div>

                {/* Campaign URL options & Custom Parameters */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-300">Campaign URL options</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold">Tracking template</label>
                      <input
                        type="text"
                        value={trackingTemplate}
                        onChange={(e) => setTrackingTemplate(e.target.value)}
                        placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold">Final URL suffix</label>
                      <input
                        type="text"
                        value={finalUrlSuffix}
                        onChange={(e) => setFinalUrlSuffix(e.target.value)}
                        placeholder="Example: param1=value1&param2=value2"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="block text-[11px] text-slate-400 font-semibold">Custom parameters</label>
                      {customParameters.map((param, idx) => (
                        <div key={param.id} className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono">{`{_`}</span>
                          <input
                            type="text"
                            value={param.name}
                            onChange={(e) => {
                              const updated = [...customParameters];
                              updated[idx].name = e.target.value;
                              setCustomParameters(updated);
                            }}
                            placeholder="Name"
                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 w-32 font-mono"
                          />
                          <span className="text-slate-500 font-mono">{`}`} =</span>
                          <input
                            type="text"
                            value={param.value}
                            onChange={(e) => {
                              const updated = [...customParameters];
                              updated[idx].value = e.target.value;
                              setCustomParameters(updated);
                            }}
                            placeholder="Value"
                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 flex-1 font-mono"
                          />
                          {customParameters.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setCustomParameters(prev => prev.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-rose-400 p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddCustomParameter}
                        className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline pt-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add custom parameters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Page feeds */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-300">Page feeds</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Add page feeds to specify which URLs to use in your campaign. With Final URL expansion on, you will use all URLs Google knows about your website, including any page feeds. By turning Final URL expansion off, you will only use URLs from your page feeds. Learn more about page feeds</p>
                </div>

                {/* Devices */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-300">Devices</h4>
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded">Required</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Choose the devices where your ads can appear.</p>
                  <div className="flex flex-wrap gap-4 pt-1">
                    {[
                      { key: "computers", label: "Computers" },
                      { key: "mobile", label: "Mobile phones" },
                      { key: "tablets", label: "Tablets" },
                      { key: "tv", label: "TV screens" }
                    ].map((d) => (
                      <label key={d.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(devicesSelection as any)[d.key]}
                          onChange={(e) => setDevicesSelection({ ...devicesSelection, [d.key]: e.target.checked })}
                          className="rounded text-primary h-4 w-4"
                        />
                        <span>{d.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brand exclusions */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-300">Brand exclusions</h4>
                  <p className="text-[11px] text-slate-400">Exclude brands so your ads won't show on searches that mention those brands. Learn more about brand exclusions</p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowBrandListModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:bg-secondary cursor-pointer transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New account-level brand list
                    </button>
                  </div>

                  {/* Display Created Brand Lists */}
                  {createdBrandLists.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <span className="text-[11px] text-slate-400 font-semibold">Active Excluded Brand Lists:</span>
                      <div className="flex flex-wrap gap-2">
                        {createdBrandLists.map((bl, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200">
                            {bl.name} ({bl.brands.length} brands)
                            <button type="button" onClick={() => setCreatedBrandLists(prev => prev.filter((_, idx) => idx !== i))}>
                              <X className="h-3 w-3 hover:text-rose-400" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Demographic exclusions */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-300">Demographic exclusions</h4>
                  <p className="text-[11px] text-slate-400">Exclude specific age groups or genders from seeing your ads across Display, Video, and Search.</p>

                  <div className="space-y-3 pt-1">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={turnOnAgeExclusions}
                        onChange={(e) => setTurnOnAgeExclusions(e.target.checked)}
                        className="rounded text-primary h-4 w-4"
                      />
                      <span className="font-medium text-slate-200">Turn on age exclusions</span>
                    </label>

                    {turnOnAgeExclusions && (
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 animate-in fade-in duration-150">
                        <span className="text-[11px] text-slate-400 font-semibold">Select ages to exclude:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {["18-24", "25-34", "35-44", "45-54", "55-64", "65+"].map((age, idx) => (
                            <label key={idx} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                              <input type="checkbox" className="rounded text-primary h-3.5 w-3.5" />
                              <span>{age}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={turnOnGenderExclusions}
                        onChange={(e) => setTurnOnGenderExclusions(e.target.checked)}
                        className="rounded text-primary h-4 w-4"
                      />
                      <span className="font-medium text-slate-200">Turn on gender exclusions</span>
                    </label>

                    {turnOnGenderExclusions && (
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 animate-in fade-in duration-150">
                        <span className="text-[11px] text-slate-400 font-semibold">Select genders to exclude:</span>
                        <div className="flex gap-4">
                          {["Female", "Male", "Unknown"].map((gen, idx) => (
                            <label key={idx} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                              <input type="checkbox" className="rounded text-primary h-3.5 w-3.5" />
                              <span>{gen}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Your data exclusions */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div>
                    <h4 className="font-semibold text-slate-300">Your data exclusions</h4>
                    <p className="text-[11px] text-slate-400">Exclude your data segments from this campaign.</p>
                  </div>

                  {/* Tabs: Search & Browse */}
                  <div className="border border-slate-800 bg-slate-950 rounded-2xl p-4 space-y-3">
                    <div className="flex border-b border-slate-800">
                      <button
                        type="button"
                        onClick={() => setDataExclusionsTab("SEARCH")}
                        className={`px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
                          dataExclusionsTab === "SEARCH"
                            ? "border-primary text-primary font-bold"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Search
                      </button>
                      <button
                        type="button"
                        onClick={() => setDataExclusionsTab("BROWSE")}
                        className={`px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
                          dataExclusionsTab === "BROWSE"
                            ? "border-primary text-primary font-bold"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Browse
                      </button>
                    </div>

                    {/* SEARCH TAB */}
                    {dataExclusionsTab === "SEARCH" && (
                      <div className="space-y-3 pt-1">
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            value={dataExclusionsSearchTerm}
                            onChange={(e) => setDataExclusionsSearchTerm(e.target.value)}
                            placeholder="Search your data segments..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                          />
                        </div>
                        {dataExclusionsSearchTerm.trim() === "" ? (
                          <p className="text-[11px] text-slate-500 py-4 text-center font-mono">Start typing to search your data segments</p>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {[
                              "Website visitors",
                              "All converters",
                              `Google-engaged audiences - for Account ${customerId || "6587355041"}`
                            ]
                              .filter(item => item.toLowerCase().includes(dataExclusionsSearchTerm.toLowerCase()))
                              .map((item, idx) => {
                                const isChecked = selectedDataExclusions.includes(item);
                                return (
                                  <label key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 hover:bg-slate-800/80 cursor-pointer text-xs">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        if (isChecked) {
                                          setSelectedDataExclusions(prev => prev.filter(i => i !== item));
                                        } else {
                                          setSelectedDataExclusions(prev => [...prev, item]);
                                        }
                                      }}
                                      className="rounded text-primary h-4 w-4"
                                    />
                                    <span className="text-slate-200">{item}</span>
                                  </label>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* BROWSE TAB */}
                    {dataExclusionsTab === "BROWSE" && (
                      <div className="space-y-2 pt-1">
                        {[
                          "Website visitors",
                          "All converters",
                          `Google-engaged audiences - for Account ${customerId || "6587355041"}`
                        ].map((category, idx) => {
                          const isChecked = selectedDataExclusions.includes(category);
                          return (
                            <label key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:bg-slate-800/80 cursor-pointer transition-all">
                              <span className="text-xs font-semibold text-slate-200">{category}</span>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedDataExclusions(prev => prev.filter(i => i !== category));
                                  } else {
                                    setSelectedDataExclusions(prev => [...prev, category]);
                                  }
                                }}
                                className="rounded text-primary h-4 w-4"
                              />
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
        )}

          {/* STEP 3: ASSET GROUP */}
          {wizardStep === "ASSET_GROUP" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Asset group</h1>
              <p className="text-slate-400">Create assets for your performance max campaign</p>

              {/* Asset Group Name */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-2 shadow-xl">
                <label className="block text-slate-300 font-semibold">Asset group name</label>
                <input
                  type="text"
                  value={assetGroupName}
                  onChange={(e) => setAssetGroupName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-primary"
                />
              </div>

              {/* Final URL */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Final URL</label>
                  <input
                    type="url"
                    value={finalUrl}
                    onChange={(e) => setFinalUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Brand Guidelines */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-semibold text-white">Brand guidelines</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Control how your brand appears in ads for this campaign. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more about brand guidelines</a></p>
                </div>

                {!showBrandGuidelinesDetails ? (
                  /* Basic Brand Guidelines View */
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <label className="block text-slate-300 font-semibold">Business name</label>
                        <span className="text-rose-400 font-bold">*</span>
                      </div>
                      <input
                        type="text"
                        maxLength={25}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Business name"
                        className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                      />
                      <span className="text-[10px] text-slate-500 block">Text is {businessName.length} characters out of 25</span>
                    </div>

                    {/* Logos */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <label className="block text-slate-300 font-semibold">Logos</label>
                        <span className="text-[11px] text-slate-500">{brandLogos.length}/5</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {brandLogos.map((logo, idx) => (
                          <div key={idx} className="relative h-16 w-16 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden group">
                            <img src={logo} alt="Logo" className="h-full w-full object-contain p-1" />
                            <button
                              type="button"
                              onClick={() => setBrandLogos(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 p-1 bg-slate-900/90 rounded-md text-slate-300 hover:text-rose-400"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {brandLogos.length < 5 && (
                          <label className="h-16 w-28 rounded-xl border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-900 flex flex-col items-center justify-center gap-1 text-slate-400 cursor-pointer transition-all">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <Plus className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-semibold">{isUploadingLogo ? "Uploading..." : "Add logo"}</span>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* More options button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowBrandGuidelinesDetails(true)}
                        className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all hover:bg-slate-900"
                      >
                        <span>Add visual and text guidelines</span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Full Brand Guidelines Expanded Details View */
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-slate-200 text-xs">Add brand guidelines</h4>
                      <button
                        type="button"
                        onClick={() => setShowBrandGuidelinesDetails(false)}
                        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Hide details</span>
                        <ChevronUp className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Brand Identity */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-300 text-xs">Brand identity</h4>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <label className="block text-slate-300 font-semibold">Business name</label>
                          <span className="text-rose-400 font-bold">*</span>
                        </div>
                        <input
                          type="text"
                          maxLength={25}
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Business name"
                          className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                        />
                        <span className="text-[10px] text-slate-500 block">Text is {businessName.length} characters out of 25</span>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center justify-between max-w-md">
                          <label className="block text-slate-300 font-semibold">Logos</label>
                          <span className="text-[11px] text-slate-500">{brandLogos.length}/5</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {brandLogos.map((logo, idx) => (
                            <div key={idx} className="relative h-16 w-16 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden group">
                              <img src={logo} alt="Logo" className="h-full w-full object-contain p-1" />
                              <button
                                type="button"
                                onClick={() => setBrandLogos(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 p-1 bg-slate-900/90 rounded-md text-slate-300 hover:text-rose-400"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          {brandLogos.length < 5 && (
                            <label className="h-16 w-28 rounded-xl border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-900 flex flex-col items-center justify-center gap-1 text-slate-400 cursor-pointer transition-all">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                              <Plus className="h-4 w-4 text-primary" />
                              <span className="text-[10px] font-semibold">{isUploadingLogo ? "Uploading..." : "Add logo"}</span>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Visual Guidelines */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div>
                        <h4 className="font-semibold text-slate-300 text-xs">Visual guidelines</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Add your brand colors and fonts to help Google AI generate on-brand videos and responsive display ads.</p>
                      </div>

                      {/* Custom Colors */}
                      <div className="space-y-3 p-4 bg-slate-950 border border-slate-800 rounded-xl max-w-md">
                        <span className="text-xs font-semibold text-slate-200 block">Custom colors</span>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-400">Main color</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={mainColor}
                                onChange={(e) => setMainColor(e.target.value)}
                                className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                              />
                              <input
                                type="text"
                                value={mainColor}
                                onChange={(e) => setMainColor(e.target.value)}
                                placeholder="#ffffff"
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-mono"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-400">Accent color</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                              />
                              <input
                                type="text"
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                placeholder="#4285f4"
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Font */}
                      <div className="space-y-1 max-w-md">
                        <label className="block text-slate-300 font-semibold">Font</label>
                        <select
                          value={selectedFont}
                          onChange={(e) => setSelectedFont(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 font-medium"
                        >
                          <option value="Any font">Any font</option>
                          <option value="Other fonts">Other fonts</option>
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

                    {/* Text Guidelines */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-300 text-xs">Text guidelines</h4>
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded">Beta</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Tell Google AI the rules it needs to follow when it creates relevant, on-brand headlines and descriptions for you. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more about text guidelines</a></p>
                      </div>

                      {/* Term exclusions */}
                      <div className="space-y-2 max-w-md">
                        <div className="flex justify-between items-center">
                          <label className="block text-slate-300 font-semibold">Term exclusions</label>
                          <span className="text-[10px] text-slate-500">{termExclusionsList.length}/25</span>
                        </div>
                        <input
                          type="text"
                          value={termExclusionsInput}
                          onChange={(e) => setTermExclusionsInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && termExclusionsInput.trim()) {
                              e.preventDefault();
                              if (termExclusionsList.length < 25) {
                                setTermExclusionsList(prev => [...prev, termExclusionsInput.trim()]);
                                setTermExclusionsInput("");
                              }
                            }
                          }}
                          placeholder="For example: Cheap, free shipping, etc. Press Enter after each word or phrase."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                        />
                        {termExclusionsList.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {termExclusionsList.map((term, i) => (
                              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200 font-medium">
                                <span>{term}</span>
                                <button type="button" onClick={() => setTermExclusionsList(prev => prev.filter((_, idx) => idx !== i))}>
                                  <X className="h-3 w-3 hover:text-rose-400" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Messaging restrictions */}
                      <div className="space-y-3 max-w-md pt-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-slate-300 font-semibold">Messaging restrictions</label>
                          <span className="text-[10px] text-slate-500">{messagingRestrictions.length}/40</span>
                        </div>
                        {messagingRestrictions.map((restriction, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="relative">
                              <textarea
                                rows={2}
                                maxLength={300}
                                value={restriction}
                                onChange={(e) => {
                                  const updated = [...messagingRestrictions];
                                  updated[idx] = e.target.value;
                                  setMessagingRestrictions(updated);
                                }}
                                placeholder={
                                  idx === 0
                                    ? "Example: Don't mention competitor names, such as Acme Corp or Plants 4 You"
                                    : idx === 1
                                    ? "Example: Don't use specific prices, such as $550 per night or $99 intro offer"
                                    : "Example: Don't use 'only' or 'just for' language, such as 'for high-performance athletes only'"
                                }
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                              />
                              {messagingRestrictions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setMessagingRestrictions(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block text-right font-mono">{restriction.length} / 300 (Text is {restriction.length} characters out of 300)</span>
                          </div>
                        ))}

                        {messagingRestrictions.length < 40 && (
                          <button
                            type="button"
                            onClick={() => setMessagingRestrictions(prev => [...prev, ""])}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add another restriction
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Assets: Headlines, Long Headlines, Descriptions */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-5 shadow-xl">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Ad Text Assets</h3>

                {/* Headlines */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-300 font-semibold">Headlines (Add up to 15)</label>
                    <span className="text-slate-500 text-[10px]">{headlines.length}/15</span>
                  </div>
                  {headlines.map((hl, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={30}
                        value={hl}
                        onChange={(e) => {
                          const updated = [...headlines];
                          updated[i] = e.target.value;
                          setHeadlines(updated);
                        }}
                        placeholder={`Headline ${i + 1}`}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                      <span className="text-[10px] text-slate-500 font-mono w-10 text-right">{hl.length}/30</span>
                      {headlines.length > 3 && (
                        <button type="button" onClick={() => setHeadlines(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {headlines.length < 15 && (
                    <button type="button" onClick={() => setHeadlines(prev => [...prev, ""])} className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline pt-1">
                      <Plus className="h-3.5 w-3.5" /> Add headline
                    </button>
                  )}
                </div>

                {/* Long Headlines */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-300 font-semibold">Long headlines (Add up to 5)</label>
                    <span className="text-slate-500 text-[10px]">{longHeadlines.length}/5</span>
                  </div>
                  {longHeadlines.map((lhl, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={90}
                        value={lhl}
                        onChange={(e) => {
                          const updated = [...longHeadlines];
                          updated[i] = e.target.value;
                          setLongHeadlines(updated);
                        }}
                        placeholder={`Long Headline ${i + 1}`}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                      <span className="text-[10px] text-slate-500 font-mono w-10 text-right">{lhl.length}/90</span>
                      {longHeadlines.length > 1 && (
                        <button type="button" onClick={() => setLongHeadlines(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {longHeadlines.length < 5 && (
                    <button type="button" onClick={() => setLongHeadlines(prev => [...prev, ""])} className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline pt-1">
                      <Plus className="h-3.5 w-3.5" /> Add long headline
                    </button>
                  )}
                </div>

                {/* Descriptions */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-300 font-semibold">Descriptions (Add up to 5)</label>
                    <span className="text-slate-500 text-[10px]">{descriptions.length}/5</span>
                  </div>
                  {descriptions.map((desc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <textarea
                        rows={2}
                        maxLength={90}
                        value={desc}
                        onChange={(e) => {
                          const updated = [...descriptions];
                          updated[i] = e.target.value;
                          setDescriptions(updated);
                        }}
                        placeholder={`Description ${i + 1}`}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                      />
                      <span className="text-[10px] text-slate-500 font-mono w-10 text-right">{desc.length}/90</span>
                      {descriptions.length > 2 && (
                        <button type="button" onClick={() => setDescriptions(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {descriptions.length < 5 && (
                    <button type="button" onClick={() => setDescriptions(prev => [...prev, ""])} className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline pt-1">
                      <Plus className="h-3.5 w-3.5" /> Add description
                    </button>
                  )}
                </div>
              </div>

              {/* Media Uploads: Images & Videos */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Media Assets</h3>

                {/* Images Upload simulation */}
                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">Images (Up to 20 images)</label>
                  <div className="flex flex-wrap gap-3">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
                        <img src={img} alt="Uploaded" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-slate-900/80 rounded-md text-slate-300 hover:text-rose-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setUploadedImages(prev => [...prev, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"])}
                      className="h-20 w-32 rounded-xl border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-900 flex flex-col items-center justify-center gap-1 text-slate-400 cursor-pointer"
                    >
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <span className="text-[10px] font-semibold">+ Add Image</span>
                    </button>
                  </div>
                </div>

                {/* Videos Upload simulation */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <label className="block text-slate-300 font-semibold">Videos (Up to 5 videos)</label>
                  <div className="flex flex-wrap gap-3">
                    {uploadedVideos.map((vid, idx) => (
                      <div key={idx} className="relative h-20 w-32 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group flex items-center justify-center">
                        <VideoIcon className="h-6 w-6 text-rose-500" />
                        <button
                          type="button"
                          onClick={() => setUploadedVideos(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-slate-900/80 rounded-md text-slate-300 hover:text-rose-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setUploadedVideos(prev => [...prev, "https://youtube.com/watch?v=demo"])}
                      className="h-20 w-32 rounded-xl border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-900 flex flex-col items-center justify-center gap-1 text-slate-400 cursor-pointer"
                    >
                      <VideoIcon className="h-5 w-5 text-primary" />
                      <span className="text-[10px] font-semibold">+ Add Video</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* More Assets & Extensions Modals Launcher */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">More Assets & Asset Extensions</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <button type="button" onClick={() => setActiveModal("SITELINKS")} className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-primary/50 text-left space-y-1">
                    <span className="font-semibold text-slate-200 block">Sitelinks</span>
                    <span className="text-[10px] text-slate-500 block">{savedSitelinks.length} saved</span>
                  </button>

                  <button type="button" onClick={() => setActiveModal("CALLS")} className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-primary/50 text-left space-y-1">
                    <span className="font-semibold text-slate-200 block">Call Extensions</span>
                    <span className="text-[10px] text-slate-500 block">{callPhone ? callPhone : "Not configured"}</span>
                  </button>

                  <button type="button" onClick={() => setActiveModal("PROMOTIONS")} className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-primary/50 text-left space-y-1">
                    <span className="font-semibold text-slate-200 block">Promotions</span>
                    <span className="text-[10px] text-slate-500 block">{savedPromotions.length} saved</span>
                  </button>

                  <button type="button" onClick={() => setActiveModal("PRICES")} className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-primary/50 text-left space-y-1">
                    <span className="font-semibold text-slate-200 block">Prices</span>
                    <span className="text-[10px] text-slate-500 block">{savedPrices.length} saved</span>
                  </button>

                  <button type="button" onClick={() => setActiveModal("SNIPPETS")} className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-primary/50 text-left space-y-1">
                    <span className="font-semibold text-slate-200 block">Structured Snippets</span>
                    <span className="text-[10px] text-slate-500 block">{savedSnippets.length} saved</span>
                  </button>

                  <button type="button" onClick={() => setActiveModal("LEAD_FORMS")} className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-primary/50 text-left space-y-1">
                    <span className="font-semibold text-slate-200 block">Lead Forms</span>
                    <span className="text-[10px] text-slate-500 block">{savedLeadForms.length} saved</span>
                  </button>

                  <button type="button" onClick={() => setActiveModal("BRAND_GUIDELINES")} className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-primary/50 text-left space-y-1">
                    <span className="font-semibold text-slate-200 block">Callouts</span>
                    <span className="text-[10px] text-slate-500 block">{savedCallouts.length} saved</span>
                  </button>
                </div>
              </div>

              {/* Signals */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Audience Signals & Search Themes</h3>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">Search Themes</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchThemeInput}
                      onChange={(e) => setSearchThemeInput(e.target.value)}
                      placeholder="Add search theme..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (searchThemeInput.trim()) {
                          setSearchThemes(prev => [...prev, searchThemeInput.trim()]);
                          setSearchThemeInput("");
                        }
                      }}
                      className="px-4 py-2 bg-primary text-slate-950 font-bold rounded-xl text-xs hover:bg-secondary cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {searchThemes.map((st, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200">
                        {st}
                        <button type="button" onClick={() => setSearchThemes(prev => prev.filter((_, idx) => idx !== i))}>
                          <X className="h-3 w-3 hover:text-rose-400" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BUDGET */}
          {wizardStep === "BUDGET" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Budget</h1>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h2 className="text-sm font-semibold text-white border-b border-slate-800 pb-2">Set your daily budget</h2>
                <div className="space-y-3 max-w-md">
                  <label className="block text-slate-300 font-semibold">Average daily budget (₹)</label>
                  <input
                    type="number"
                    value={dailyBudgetValue}
                    onChange={(e) => setDailyBudgetValue(e.target.value)}
                    placeholder="Enter daily budget in INR"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary"
                  />
                  <p className="text-[11px] text-slate-400">For the month, you won't pay more than your daily budget times 30.4 days. Learn more</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUMMARY */}
          {wizardStep === "SUMMARY" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign Summary & Review</h1>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h2 className="text-sm font-semibold text-white border-b border-slate-800 pb-2">Review Campaign Configuration</h2>

                <div className="space-y-3 text-slate-300">
                  <p><strong className="text-slate-100">Bidding Focus:</strong> {biddingFocus}</p>
                  <p><strong className="text-slate-100">Locations:</strong> {selectedLocation}</p>
                  <p><strong className="text-slate-100">Languages:</strong> {selectedLanguages.join(", ")}</p>
                  <p><strong className="text-slate-100">Asset Group Name:</strong> {assetGroupName}</p>
                  <p><strong className="text-slate-100">Daily Budget:</strong> ₹{dailyBudgetValue || "0"}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => alert("Performance Max Campaign submitted successfully!")}
                    className="px-6 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all shadow-lg shadow-primary/20"
                  >
                    Publish Campaign
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Fixed Footer Navigation Controls ── */}
      <footer className="h-16 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between fixed bottom-0 left-0 right-0 z-40">
        <button
          type="button"
          onClick={() => {
            if (wizardStep === "CAMPAIGN_SETTINGS") setWizardStep("BIDDING");
            else if (wizardStep === "ASSET_GROUP") setWizardStep("CAMPAIGN_SETTINGS");
            else if (wizardStep === "BUDGET") setWizardStep("ASSET_GROUP");
            else if (wizardStep === "SUMMARY") setWizardStep("BUDGET");
          }}
          disabled={wizardStep === "BIDDING"}
          className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          Back
        </button>

        <button
          type="button"
          onClick={() => {
            if (wizardStep === "BIDDING") setWizardStep("CAMPAIGN_SETTINGS");
            else if (wizardStep === "CAMPAIGN_SETTINGS") setWizardStep("ASSET_GROUP");
            else if (wizardStep === "ASSET_GROUP") setWizardStep("BUDGET");
            else if (wizardStep === "BUDGET") setWizardStep("SUMMARY");
          }}
          disabled={wizardStep === "SUMMARY"}
          className="px-6 py-2 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:bg-secondary cursor-pointer transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <span>Next</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </footer>

      {/* ── Brand Exclusions Modal ── */}
      {showBrandListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">Create a brand list</h3>
              <button type="button" onClick={() => setShowBrandListModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold">Brand list name</label>
              <input
                type="text"
                value={newBrandListName}
                onChange={(e) => setNewBrandListName(e.target.value)}
                placeholder="e.g. My Excluded Brands"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>

            {/* Search & Brands Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-slate-300 font-semibold">Brands</label>
                <span className="text-[11px] text-slate-500">{selectedBrandsList.length} brand(s) selected</span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={brandSearchTerm}
                  onChange={(e) => setBrandSearchTerm(e.target.value)}
                  placeholder="Search brand by name or URL..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Selected Brands Chips */}
              {selectedBrandsList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950/60 border border-slate-800 rounded-xl max-h-28 overflow-y-auto">
                  {selectedBrandsList.map((b, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-[11px] text-primary font-semibold">
                      <span>{b.name}</span>
                      <button type="button" onClick={() => setSelectedBrandsList(prev => prev.filter((_, i) => i !== idx))}>
                        <X className="h-3 w-3 hover:text-rose-400" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Brands Scrollable List */}
              <div className="border border-slate-800 bg-slate-950 rounded-xl max-h-60 overflow-y-auto divide-y divide-slate-800/60">
                {availableBrands
                  .filter(b => b.name.toLowerCase().includes(brandSearchTerm.toLowerCase()) || b.url.toLowerCase().includes(brandSearchTerm.toLowerCase()))
                  .map((b, i) => {
                    const isSelected = selectedBrandsList.some(sb => sb.name === b.name);
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedBrandsList(prev => prev.filter(sb => sb.name !== b.name));
                          } else {
                            setSelectedBrandsList(prev => [...prev, b]);
                          }
                        }}
                        className={`p-2.5 flex items-center justify-between hover:bg-slate-900 cursor-pointer transition-all ${isSelected ? "bg-primary/5" : ""}`}
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{b.name}</p>
                          <a
                            href={b.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-slate-500 hover:text-primary underline font-mono block truncate max-w-sm"
                          >
                            {b.url}
                          </a>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-primary h-4 w-4 pointer-events-none"
                        />
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBrandListModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newBrandListName.trim() || selectedBrandsList.length === 0}
                onClick={() => {
                  if (newBrandListName.trim() && selectedBrandsList.length > 0) {
                    setCreatedBrandLists(prev => [...prev, { name: newBrandListName, brands: selectedBrandsList.map(sb => sb.name) }]);
                    setNewBrandListName("");
                    setSelectedBrandsList([]);
                    setShowBrandListModal(false);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary disabled:opacity-40 cursor-pointer transition-all shadow-md shadow-primary/20"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sitelinks Modal ── */}
      {activeModal === "SITELINKS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">Add sitelinks</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Sitelink text</label>
                <input id="slTextInp" type="text" maxLength={25} placeholder="Sitelink text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100" />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Description line 1</label>
                <input id="slDesc1Inp" type="text" maxLength={35} placeholder="Description line 1" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100" />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Description line 2</label>
                <input id="slDesc2Inp" type="text" maxLength={35} placeholder="Description line 2" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100" />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Final URL</label>
                <input id="slUrlInp" type="url" placeholder="https://example.com/page" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  const txt = (document.getElementById("slTextInp") as HTMLInputElement)?.value || "New Sitelink";
                  const d1 = (document.getElementById("slDesc1Inp") as HTMLInputElement)?.value || "";
                  const d2 = (document.getElementById("slDesc2Inp") as HTMLInputElement)?.value || "";
                  const url = (document.getElementById("slUrlInp") as HTMLInputElement)?.value || "";
                  setSavedSitelinks(prev => [...prev, { text: txt, desc1: d1, desc2: d2, url }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Call Extensions Modal ── */}
      {activeModal === "CALLS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">Add call extension</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Country</label>
                <select value={callCountry} onChange={(e) => setCallCountry(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100">
                  <option value="India (+91)">India (+91)</option>
                  <option value="United States (+1)">United States (+1)</option>
                  <option value="United Kingdom (+44)">United Kingdom (+44)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Phone number</label>
                <input
                  type="tel"
                  value={callPhone}
                  onChange={(e) => setCallPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium">Cancel</button>
              <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Promotions Modal ── */}
      {activeModal === "PROMOTIONS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Add promotions to your campaign</h3>
                <p className="text-[11px] text-slate-400">Campaign-level promotions: Add promotions to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-1 text-xs">Add new promotion</h4>

              {/* Occasion & Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Occasion</label>
                  <select
                    value={promoOccasion}
                    onChange={(e) => setPromoOccasion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {[
                      "None", "Back to school", "Black Friday", "Boxing Day", "Carnival", "Chinese New Year",
                      "Christmas", "Cyber Monday", "Diwali", "Easter", "Eid al-Adha", "Eid al-Fitr", "End of Season",
                      "Epiphany", "Fall Sale", "Father's Day", "Halloween", "Hanukkah", "Holi", "Independence Day",
                      "Labor Day", "Mother's Day", "National Day", "Navratri", "New Year's", "Parent's Day", "Passover",
                      "Ramadan", "Rosh Hashanah", "Singles Day", "Spring Sale", "St. Nicholas Day", "Summer Sale",
                      "Valentine's Day", "Winter Sale", "Women's Day"
                    ].map((occ, i) => (
                      <option key={i} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Language</label>
                  <select
                    value={promoLanguage}
                    onChange={(e) => setPromoLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {[
                      "Chinese (Simplified)", "Chinese (Traditional)", "Croatian", "Czech", "Danish", "Dutch", "English",
                      "English (Australia)", "English (United Kingdom)", "Estonian", "Filipino", "Finnish", "French", "German",
                      "Greek", "Hebrew", "Hindi", "Hungarian", "Indonesian", "Italian", "Japanese", "Korean", "Latvian",
                      "Lithuanian", "Malay", "Norwegian", "Polish", "Portuguese (Brazil)", "Portuguese (Portugal)", "Romanian",
                      "Russian", "Serbian", "Slovak", "Slovenian", "Spanish (Latin America)", "Spanish (Spain)", "Swedish",
                      "Thai", "Turkish", "Ukrainian", "Vietnamese"
                    ].map((lang, i) => (
                      <option key={i} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Currency & Promotion Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Currency</label>
                  <select
                    value={promoCurrency}
                    onChange={(e) => setPromoCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                  >
                    {[
                      "AED", "ARS", "AUD", "BGN", "BND", "BOB", "BRL", "CAD", "CHF", "CLP", "CNY", "COP", "CZK", "DKK",
                      "EGP", "EUR", "FJD", "GBP", "HKD", "HRK", "HUF", "IDR", "ILS", "INR", "JPY", "KES", "KRW", "MAD",
                      "MXN", "MYR", "NOK", "NZD", "PEN", "PHP", "PKR", "PLN", "RON", "RSD", "RUB", "SAR", "SEK", "SGD",
                      "THB", "TRY", "TWD", "UAH", "USD", "VND", "ZAR"
                    ].map((curr, i) => (
                      <option key={i} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Promotion type</label>
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="Monetary discount">Monetary discount</option>
                    <option value="Percent discount">Percent discount</option>
                    <option value="Up to monetary discount">Up to monetary discount</option>
                    <option value="Up to percent discount">Up to percent discount</option>
                  </select>
                </div>
              </div>

              {/* Item & Final URL */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Item</label>
                  <input
                    type="text"
                    maxLength={20}
                    value={promoItem}
                    onChange={(e) => setPromoItem(e.target.value)}
                    placeholder="Item name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Text is {promoItem.length} characters out of 20</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Final URL</label>
                  <input
                    type="url"
                    value={promoFinalUrl}
                    onChange={(e) => setPromoFinalUrl(e.target.value)}
                    placeholder="https://www.example.com/promo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
              </div>

              {/* Promotion Details */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-semibold mb-1">Promotion details</label>
                <select
                  value={promoDetailsType}
                  onChange={(e) => setPromoDetailsType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="None">None</option>
                  <option value="On orders over">On orders over</option>
                  <option value="Promo code (Alphanumeric)">Promo code (Alphanumeric)</option>
                  <option value="Promo code (Barcode)">Promo code (Barcode)</option>
                  <option value="Promo code (QR code)">Promo code (QR code)</option>
                </select>
                {promoDetailsType !== "None" && (
                  <input
                    type="text"
                    value={promoDetailsValue}
                    onChange={(e) => setPromoDetailsValue(e.target.value)}
                    placeholder={promoDetailsType === "On orders over" ? "Minimum order amount" : "Enter promo code"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 mt-2"
                  />
                )}
              </div>

              {/* Displayed promotion dates */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-semibold">Displayed promotion dates</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Start date</span>
                    <input
                      type="date"
                      value={promoStartDate}
                      onChange={(e) => setPromoStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">End date</span>
                    <input
                      type="date"
                      value={promoEndDate}
                      onChange={(e) => setPromoEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* URL Options */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h5 className="font-semibold text-slate-200">URL Options</h5>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold">Tracking template</label>
                    <input
                      type="text"
                      value={promoTrackingTemplate}
                      onChange={(e) => setPromoTrackingTemplate(e.target.value)}
                      placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold">Final URL suffix</label>
                    <input
                      type="text"
                      value={promoFinalUrlSuffix}
                      onChange={(e) => setPromoFinalUrlSuffix(e.target.value)}
                      placeholder="Example: param1=value1&param2=value2"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] text-slate-400 font-semibold">Custom parameters</label>
                    {promoCustomParams.map((param, idx) => (
                      <div key={param.id} className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono">{`{_`}</span>
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => {
                            const updated = [...promoCustomParams];
                            updated[idx].name = e.target.value;
                            setPromoCustomParams(updated);
                          }}
                          placeholder="Name"
                          className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                        />
                        <span className="text-slate-500 font-mono">{`}`}</span>
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => {
                            const updated = [...promoCustomParams];
                            updated[idx].value = e.target.value;
                            setPromoCustomParams(updated);
                          }}
                          placeholder="Value"
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                        />
                        {promoCustomParams.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPromoCustomParams(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-400 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPromoCustomParams(prev => [...prev, { id: `pcp-${Date.now()}`, name: "", value: "" }])}
                      className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline pt-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add custom parameters
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPromoAdvanced(!showPromoAdvanced)}
                  className="flex items-center justify-between w-full text-slate-300 font-bold text-xs hover:text-white py-1 cursor-pointer"
                >
                  <span>Advanced options</span>
                  {showPromoAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showPromoAdvanced && (
                  <div className="space-y-4 pt-3 border-t border-slate-800/80 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-semibold">Promo terms and conditions</label>
                      <textarea
                        rows={2}
                        maxLength={250}
                        value={promoTermsConditions}
                        onChange={(e) => setPromoTermsConditions(e.target.value)}
                        placeholder="Promo terms and conditions"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                      />
                      <span className="text-[10px] text-slate-500 block text-right font-mono">{promoTermsConditions.length} / 250 (Text is {promoTermsConditions.length} characters out of 250)</span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-semibold">Link to additional terms and conditions</label>
                      <input
                        type="url"
                        maxLength={100}
                        value={promoAdditionalTermsLink}
                        onChange={(e) => setPromoAdditionalTermsLink(e.target.value)}
                        placeholder="https://example.com/terms"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                      />
                      <span className="text-[10px] text-slate-500 block text-right font-mono">{promoAdditionalTermsLink.length} / 100 (Text is {promoAdditionalTermsLink.length} characters out of 100)</span>
                    </div>

                    {/* Asset scheduling */}
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div>
                        <h5 className="font-semibold text-slate-200">Asset scheduling</h5>
                        <p className="text-[11px] text-slate-400">Select when your assets will be eligible to show</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-1">Start date</span>
                          <input
                            type="date"
                            value={assetSchedStartDate}
                            onChange={(e) => setAssetSchedStartDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-1">End date</span>
                          <input
                            type="date"
                            value={assetSchedEndDate}
                            onChange={(e) => setAssetSchedEndDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                          />
                        </div>
                      </div>

                      {/* Days and hours */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <label className="block text-slate-300 font-semibold">Days and hours</label>
                        {assetSchedules.map((sch, idx) => (
                          <div key={sch.id} className="flex items-center gap-2">
                            <select
                              value={sch.day}
                              onChange={(e) => {
                                const updated = [...assetSchedules];
                                updated[idx].day = e.target.value;
                                setAssetSchedules(updated);
                              }}
                              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                            >
                              <option value="All days">All days</option>
                              <option value="Mondays">Mondays</option>
                              <option value="Tuesdays">Tuesdays</option>
                              <option value="Wednesdays">Wednesdays</option>
                              <option value="Thursdays">Thursdays</option>
                              <option value="Fridays">Fridays</option>
                              <option value="Saturdays">Saturdays</option>
                              <option value="Sundays">Sundays</option>
                              <option value="Mondays to Fridays">Mondays to Fridays</option>
                            </select>
                            <input
                              type="time"
                              value={sch.start}
                              onChange={(e) => {
                                const updated = [...assetSchedules];
                                updated[idx].start = e.target.value;
                                setAssetSchedules(updated);
                              }}
                              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                            />
                            <span className="text-slate-400">to</span>
                            <input
                              type="time"
                              value={sch.end}
                              onChange={(e) => {
                                const updated = [...assetSchedules];
                                updated[idx].end = e.target.value;
                                setAssetSchedules(updated);
                              }}
                              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                            />
                            {assetSchedules.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setAssetSchedules(prev => prev.filter((_, i) => i !== idx))}
                                className="text-slate-400 hover:text-rose-400 p-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => setAssetSchedules(prev => [...prev, { id: `as-${Date.now()}`, day: "All days", start: "12:00 AM", end: "12:00 AM" }])}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all mt-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add schedule
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                        To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more</a>
                        <br />
                        Based on account time zone: (GMT+05:30) India Standard Time
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSavedPromotions(prev => [...prev, { occasion: promoOccasion, item: promoItem || "Special Discount", discount: promoType, url: promoFinalUrl }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Promotion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Prices Modal ── */}
      {activeModal === "PRICES" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Add prices to your campaign</h3>
                <p className="text-[11px] text-slate-400">Campaign-level prices: Add prices to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-1 text-xs">Add new price</h4>

              {/* Language, Type, Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Language</label>
                  <select
                    value={priceLanguage}
                    onChange={(e) => setPriceLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {[
                      "Chinese (Simplified)", "Chinese (Traditional)", "Croatian", "Czech", "Danish", "Dutch", "English",
                      "English (Australia)", "English (United Kingdom)", "Estonian", "Filipino", "Finnish", "French", "German",
                      "Greek", "Hebrew", "Hindi", "Hungarian", "Indonesian", "Italian", "Japanese", "Korean", "Latvian",
                      "Lithuanian", "Malay", "Norwegian", "Polish", "Portuguese (Brazil)", "Portuguese (Portugal)", "Romanian",
                      "Russian", "Serbian", "Slovak", "Slovenian", "Spanish (Latin America)", "Spanish (Spain)", "Swedish",
                      "Thai", "Turkish", "Ukrainian", "Vietnamese"
                    ].map((lang, i) => (
                      <option key={i} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Type</label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {[
                      "Brands", "Events", "Locations", "Neighborhoods", "Product categories",
                      "Product tiers", "Service categories", "Service tiers", "Services"
                    ].map((t, i) => (
                      <option key={i} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Currency</label>
                  <select
                    value={priceCurrency}
                    onChange={(e) => setPriceCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                  >
                    {[
                      "AED", "ARS", "AUD", "BGN", "BND", "BOB", "BRL", "CAD", "CHF", "CLP", "CNY", "COP", "CZK", "DKK",
                      "EGP", "EUR", "FJD", "GBP", "HKD", "HRK", "HUF", "IDR", "ILS", "INR", "JPY", "KES", "KRW", "MAD",
                      "MXN", "MYR", "NOK", "NZD", "PEN", "PHP", "PKR", "PLN", "RON", "RSD", "RUB", "SAR", "SEK", "SGD",
                      "THB", "TRY", "TWD", "UAH", "USD", "VND", "ZAR"
                    ].map((curr, i) => (
                      <option key={i} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Qualifier */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Price qualifier</label>
                <select
                  value={priceQualifier}
                  onChange={(e) => setPriceQualifier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="No qualifier">No qualifier</option>
                  <option value="From">From</option>
                  <option value="Up to">Up to</option>
                  <option value="Average">Average</option>
                </select>
              </div>

              {/* Price Assets */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h5 className="font-semibold text-slate-200">Price assets</h5>
                {priceItems.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-300 text-xs">Price item {idx + 1}</span>
                      {priceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPriceItems(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-400 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 font-semibold mb-1">Header</label>
                        <input
                          type="text"
                          maxLength={25}
                          value={item.header}
                          onChange={(e) => {
                            const updated = [...priceItems];
                            updated[idx].header = e.target.value;
                            setPriceItems(updated);
                          }}
                          placeholder="Header"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-400 font-semibold mb-1">Price (₹)</label>
                          <input
                            type="text"
                            value={item.amount}
                            onChange={(e) => {
                              const updated = [...priceItems];
                              updated[idx].amount = e.target.value;
                              setPriceItems(updated);
                            }}
                            placeholder="Price"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 font-semibold mb-1">Units</label>
                          <select
                            value={item.unit}
                            onChange={(e) => {
                              const updated = [...priceItems];
                              updated[idx].unit = e.target.value;
                              setPriceItems(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-100"
                          >
                            <option value="No units">No units</option>
                            <option value="Per hour">Per hour</option>
                            <option value="Per day">Per day</option>
                            <option value="Per week">Per week</option>
                            <option value="Per month">Per month</option>
                            <option value="Per year">Per year</option>
                            <option value="Per night">Per night</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">Description</label>
                      <input
                        type="text"
                        maxLength={25}
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...priceItems];
                          updated[idx].description = e.target.value;
                          setPriceItems(updated);
                        }}
                        placeholder="Description"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 font-semibold mb-1">Final URL</label>
                        <input
                          type="url"
                          value={item.finalUrl}
                          onChange={(e) => {
                            const updated = [...priceItems];
                            updated[idx].finalUrl = e.target.value;
                            setPriceItems(updated);
                          }}
                          placeholder="https://example.com"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 font-semibold mb-1">Mobile Final URL (optional)</label>
                        <input
                          type="url"
                          value={item.mobileFinalUrl}
                          onChange={(e) => {
                            const updated = [...priceItems];
                            updated[idx].mobileFinalUrl = e.target.value;
                            setPriceItems(updated);
                          }}
                          placeholder="https://m.example.com"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setPriceItems(prev => [...prev, { id: `pi-${Date.now()}`, header: "", amount: "", unit: "No units", description: "", finalUrl: "", mobileFinalUrl: "" }])}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Add price asset
                </button>
              </div>

              {/* URL Options */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h5 className="font-semibold text-slate-200">URL Options</h5>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold">Tracking template</label>
                    <input
                      type="text"
                      value={priceTrackingTemplate}
                      onChange={(e) => setPriceTrackingTemplate(e.target.value)}
                      placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold">Final URL suffix</label>
                    <input
                      type="text"
                      value={priceFinalUrlSuffix}
                      onChange={(e) => setPriceFinalUrlSuffix(e.target.value)}
                      placeholder="Example: param1=value1&param2=value2"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] text-slate-400 font-semibold">Custom parameters</label>
                    {priceCustomParams.map((param, idx) => (
                      <div key={param.id} className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono">{`{_`}</span>
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => {
                            const updated = [...priceCustomParams];
                            updated[idx].name = e.target.value;
                            setPriceCustomParams(updated);
                          }}
                          placeholder="Name"
                          className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                        />
                        <span className="text-slate-500 font-mono">{`}`}</span>
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => {
                            const updated = [...priceCustomParams];
                            updated[idx].value = e.target.value;
                            setPriceCustomParams(updated);
                          }}
                          placeholder="Value"
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                        />
                        {priceCustomParams.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPriceCustomParams(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-400 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPriceCustomParams(prev => [...prev, { id: `pcp-${Date.now()}`, name: "", value: "" }])}
                      className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline pt-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add custom parameters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const firstHeader = priceItems[0]?.header || "Price Extension";
                  const firstPrice = priceItems[0]?.amount ? `₹${priceItems[0].amount}` : "₹0";
                  setSavedPrices(prev => [...prev, { type: priceType, price: `${firstHeader} (${firstPrice})` }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Prices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Messages Modal ── */}
      {activeModal === "APPS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Add messages to your campaign</h3>
                <p className="text-[11px] text-slate-400">Campaign-level messages: Add messages to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-1 text-xs">Set up your message asset</h4>

              {/* Platform Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Select message platform</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "WhatsApp", label: "WhatsApp", icon: "💬" },
                    { key: "Messenger", label: "Messenger", icon: "⚡" },
                    { key: "Zalo", label: "Zalo", icon: "🔵" }
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setMsgPlatform(p.key as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        msgPlatform === p.key
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-md shadow-primary/10"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span className="text-xs">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Platform Form */}
              <div className="space-y-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 text-slate-300 font-semibold">
                  <span>Icon for the message platform provider:</span>
                  <span className="text-primary font-bold">{msgPlatform}</span>
                </div>

                {/* Custom URL Name & ID */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">
                    {msgPlatform === "WhatsApp" ? "WhatsApp Business Phone / Custom URL name" : msgPlatform === "Messenger" ? "Messenger Page Username / Custom URL name" : "Zalo ID / Custom URL name"}
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={msgCustomUrlName}
                    onChange={(e) => setMsgCustomUrlName(e.target.value)}
                    placeholder="Custom URL name"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>
                      Official account URL: <code className="text-primary font-mono">{msgPlatform === "WhatsApp" ? `https://wa.me/${msgCustomUrlName || "[Custom URL name]"}` : msgPlatform === "Messenger" ? `https://m.me/${msgCustomUrlName || "[Custom URL name]"}` : `https://zalo.me/${msgCustomUrlName || "[Custom URL name]"}`}</code>
                    </span>
                    <span>0 / 20 (Text is {msgCustomUrlName.length} characters out of 20)</span>
                  </div>
                </div>

                {/* Starter Message */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Starter message</label>
                  <textarea
                    rows={2}
                    maxLength={140}
                    value={msgStarterMessage}
                    onChange={(e) => setMsgStarterMessage(e.target.value)}
                    placeholder="Can I get started with a delivery?"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-slate-500 block text-right font-mono">{msgStarterMessage.length} / 140 (Text is {msgStarterMessage.length} characters out of 140)</span>
                </div>

                {/* Call To Action */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="block text-slate-300 font-semibold">Select a call-to-action for your ad</label>
                    <p className="text-[11px] text-slate-400">Select a compelling call-to-action that empowers people to engage with your business or service</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-400 font-semibold">Call-to-action</label>
                    <select
                      value={msgCallToAction}
                      onChange={(e) => setMsgCallToAction(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      {["None", "Apply now", "Book now", "Contact us", "Get info", "Get offer", "Get quote", "Get started", "Learn more"].map((cta, idx) => (
                        <option key={idx} value={cta}>{cta}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="block text-[11px] text-slate-400 font-semibold">Call-to-action description</label>
                    <input
                      type="text"
                      maxLength={30}
                      value={msgCtaDescription}
                      onChange={(e) => setMsgCtaDescription(e.target.value)}
                      placeholder="Call-to-action description"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                    <span className="text-[10px] text-slate-500 block text-right font-mono">{msgCtaDescription.length} / 30 (Text is {msgCtaDescription.length} characters out of 30)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSavedMessages(prev => [...prev, { platform: msgPlatform }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Structured Snippets Modal ── */}
      {activeModal === "SNIPPETS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Create structured snippet</h3>
                <p className="text-[11px] text-slate-400">Campaign-level structured snippets: Add snippets to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              {/* Header Language & Select Header Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Header Language</label>
                  <select
                    value={snippetLanguage}
                    onChange={(e) => setSnippetLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
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

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select header type</label>
                  <select
                    value={snippetHeaderType}
                    onChange={(e) => setSnippetHeaderType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {[
                      "Amenities", "Brands", "Courses", "Degree programs", "Destinations", "Featured hotels",
                      "Insurance coverage", "Models", "Neighborhoods", "Service catalog", "Shows", "Styles", "Types"
                    ].map((ht, idx) => (
                      <option key={idx} value={ht}>{ht}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Values */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-semibold">Values</label>
                {snippetValues.map((val, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                      />
                      {snippetValues.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setSnippetValues(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-400 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block font-mono">{val.length} / 25 (Text is {val.length} characters out of 25)</span>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setSnippetValues(prev => [...prev, ""])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all mt-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add value
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const filtered = snippetValues.filter(v => v.trim() !== "");
                  setSavedSnippets(prev => [...prev, { header: snippetHeaderType, values: filtered.length > 0 ? filtered : ["Value 1", "Value 2"] }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Structured Snippet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lead Forms Modal ── */}
      {activeModal === "LEAD_FORMS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Add a lead form to your campaign</h3>
                <p className="text-[11px] text-slate-400">Campaign-level lead forms: Add lead forms to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-5">
              {/* Create your lead form */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-1 text-xs">Create your lead form</h4>
                
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Headline</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={lfHeadline}
                    onChange={(e) => setLfHeadline(e.target.value)}
                    placeholder="Headline"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-slate-500 block font-mono">{lfHeadline.length} / 30 (Text is {lfHeadline.length} characters out of 30)</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Business name</label>
                  <input
                    type="text"
                    maxLength={25}
                    value={lfBusinessName}
                    onChange={(e) => setLfBusinessName(e.target.value)}
                    placeholder="Business name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-slate-500 block font-mono">{lfBusinessName.length} / 25 (Text is {lfBusinessName.length} characters out of 25)</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Description</label>
                  <textarea
                    rows={2}
                    maxLength={200}
                    value={lfDescription}
                    onChange={(e) => setLfDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-slate-500 block text-right font-mono">{lfDescription.length} / 200 (Text is {lfDescription.length} characters out of 200)</span>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h4 className="font-bold text-slate-200 text-xs">Questions</h4>

                {/* Contact information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-slate-300">Contact information</h5>
                    <span className="text-[11px] text-slate-400">Add Field (Optional)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.keys(lfContactFields).map((field) => (
                      <div key={field} className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <label className="flex items-center justify-between hover:bg-slate-900 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={lfContactFields[field]}
                              onChange={(e) => setLfContactFields({ ...lfContactFields, [field]: e.target.checked })}
                              className="rounded text-primary h-3.5 w-3.5"
                            />
                            <span className="text-slate-200 font-medium">{field}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Pre-filled</span>
                        </label>

                        {/* Name Options */}
                        {field === "Name" && lfContactFields["Name"] && (
                          <div className="pl-6 pt-1 flex items-center gap-3 text-[10px] text-slate-400 border-t border-slate-900 mt-1">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name="lfNameOptNoG"
                                checked={lfNameFormat === "FULL_NAME"}
                                onChange={() => setLfNameFormat("FULL_NAME")}
                                className="text-primary"
                              />
                              <span>Full name</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name="lfNameOptNoG"
                                checked={lfNameFormat === "FIRST_LAST_NAME"}
                                onChange={() => setLfNameFormat("FIRST_LAST_NAME")}
                                className="text-primary"
                              />
                              <span>First name and last name</span>
                            </label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Phone number verification notice */}
                  {lfContactFields["Phone number"] && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300/90 space-y-1 mt-2">
                      <p className="font-semibold">Phone number verification is only supported for Search campaigns.</p>
                      <p className="text-[10px] text-amber-400/80">Both email and phone number can't be optional at the same time.</p>
                    </div>
                  )}
                </div>

                {/* Work information */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-slate-300">Work information</h5>
                    <span className="text-[11px] text-slate-400">Add Field (Optional)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.keys(lfWorkFields).map((field) => (
                      <label key={field} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 hover:bg-slate-900 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={lfWorkFields[field]}
                            onChange={(e) => setLfWorkFields({ ...lfWorkFields, [field]: e.target.checked })}
                            className="rounded text-primary h-3.5 w-3.5"
                          />
                          <span className="text-slate-200 font-medium">{field}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Optional</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional information */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-slate-300">Additional information</h5>
                    <span className="text-[11px] text-slate-400">Add Field (Optional)</span>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 cursor-pointer max-w-md">
                      <input
                        type="checkbox"
                        checked={lfAgeQuestion}
                        onChange={(e) => setLfAgeQuestion(e.target.checked)}
                        className="rounded text-primary h-3.5 w-3.5"
                      />
                      <span className="text-slate-200 text-xs">Are you over</span>
                      <select
                        value={lfAgeYears}
                        onChange={(e) => setLfAgeYears(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-100 font-mono"
                      >
                        {["18", "19", "20", "21", "25"].map((yr) => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                      <span className="text-slate-200 text-xs">years of age?</span>
                    </label>
                  </div>
                </div>

                {/* Custom questions */}
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-slate-300">Custom questions</h5>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Language:</span>
                      <select
                        value={lfCustomLanguage}
                        onChange={(e) => setLfCustomLanguage(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100"
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

                  <p className="text-[11px] text-slate-400">Setup lead scoring by choosing 1 question to qualify form submits as a strong lead for your business.</p>

                  {/* Preset Question Picker & Dynamic List */}
                  <div className="space-y-2">
                    <label className="block text-[11px] text-slate-400 font-semibold">Choose preset question or type custom</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setLfCustomQuestions(prev => [...prev, { id: `cq-${Date.now()}`, question: e.target.value }]);
                          e.target.value = "";
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="">-- Select a question preset --</option>
                      <optgroup label="Your questions">
                        <option value="What is your vehicle year?">What is your vehicle year?</option>
                      </optgroup>
                      <optgroup label="New questions">
                        <option value="Have you used any POS before?">Have you used any POS before?</option>
                        <option value="Do you have Alberta Blue Cross or CDHCI coverage?">Do you have Alberta Blue Cross or CDHCI coverage?</option>
                        <option value="Which Vedic Aura would you like?">Which Vedic Aura would you like?</option>
                        <option value="Which Appletree Medical location are you planning to visit?">Which Appletree Medical location are you planning to visit?</option>
                        <option value="What are you reaching out regarding?">What are you reaching out regarding?</option>
                        <option value="Which POS subscription plan do you prefer?">Which POS subscription plan do you prefer?</option>
                        <option value="Could you please select which of these events your inquiry is related to?">Could you please select which of these events your inquiry is related to?</option>
                        <option value="Are you a teacher?">Are you a teacher?</option>
                        <option value="When are you planning to visit Bir Billing?">When are you planning to visit Bir Billing?</option>
                        <option value="What is your internet connection speed?">What is your internet connection speed?</option>
                      </optgroup>
                      <optgroup label="Auto">
                        <option value="Which vehicle make are you interested in?">Which vehicle make are you interested in?</option>
                        <option value="Which type of vehicle are you interested in?">Which type of vehicle are you interested in?</option>
                        <option value="Which state was the vehicle purchased from?">Which state was the vehicle purchased from?</option>
                        <option value="Which model are you interested in?">Which model are you interested in?</option>
                        <option value="When do you plan on purchasing a vehicle?">When do you plan on purchasing a vehicle?</option>
                        <option value="When did you last purchase a vehicle?">When did you last purchase a vehicle?</option>
                        <option value="What vehicle ownership option are you interested in?">What vehicle ownership option are you interested in?</option>
                        <option value="What type of vehicle condition are you interested in?">What type of vehicle condition are you interested in?</option>
                        <option value="What kind of vehicle do you have?">What kind of vehicle do you have?</option>
                      </optgroup>
                      <optgroup label="Business">
                        <option value="What size is your company?">What size is your company?</option>
                        <option value="What is your proposed website URL?">What is your proposed website URL?</option>
                        <option value="What is your job role?">What is your job role?</option>
                        <option value="What is your job department?">What is your job department?</option>
                        <option value="What is your annual sales volume?">What is your annual sales volume?</option>
                        <option value="How many years have you been in business?">How many years have you been in business?</option>
                        <option value="Do you operate in the EU?">Do you operate in the EU?</option>
                        <option value="Do you have a forwarder or any shipping agent in China?">Do you have a forwarder or any shipping agent in China?</option>
                        <option value="Do you do RO service?">Do you do RO service?</option>
                        <option value="Do you currently take card payments?">Do you currently take card payments?</option>
                      </optgroup>
                      <optgroup label="Education">
                        <option value="Which program are you interested in?">Which program are you interested in?</option>
                        <option value="Which educational degree are you interested in?">Which educational degree are you interested in?</option>
                        <option value="Which course are you interested in?">Which course are you interested in?</option>
                        <option value="When do you want to enroll?">When do you want to enroll?</option>
                        <option value="When do you want to begin your classes?">When do you want to begin your classes?</option>
                        <option value="When do you plan to start further education?">When do you plan to start further education?</option>
                        <option value="What program are you interested in?">What program are you interested in?</option>
                        <option value="What is your salary range?">What is your salary range?</option>
                        <option value="Are you looking for a property visa in UAE?">Are you looking for a property visa in UAE?</option>
                      </optgroup>
                      <optgroup label="General">
                        <option value="Zurn Elkay Product(s) Installed">Zurn Elkay Product(s) Installed</option>
                        <option value="ZIP code you're moving to">ZIP code you're moving to</option>
                        <option value="Zip Code for Delivery:">Zip Code for Delivery:</option>
                        <option value="Your Website/Domain (Optional):">Your Website/Domain (Optional):</option>
                        <option value="Your Website/Domain">Your Website/Domain</option>
                        <option value="Your Website URL">Your Website URL</option>
                        <option value="Your website type?">Your website type?</option>
                        <option value="Your Website Address">Your Website Address</option>
                        <option value="Your Website">Your Website</option>
                        <option value="Your Venue Name">Your Venue Name</option>
                      </optgroup>
                      <optgroup label="Insurance">
                        <option value="When do you need insurance by?">When do you need insurance by?</option>
                        <option value="What type of insurance do you need?">What type of insurance do you need?</option>
                      </optgroup>
                      <optgroup label="Jobs">
                        <option value="What is your highest level of education?">What is your highest level of education?</option>
                        <option value="What industry do you work in?">What industry do you work in?</option>
                        <option value="How many years of work experience do you have?">How many years of work experience do you have?</option>
                        <option value="Are you actively searching for jobs?">Are you actively searching for jobs?</option>
                      </optgroup>
                      <optgroup label="Real estate">
                        <option value="What type of property are you looking for?">What type of property are you looking for?</option>
                        <option value="What price range are you looking for?">What price range are you looking for?</option>
                        <option value="What neighborhood are you interested in?">What neighborhood are you interested in?</option>
                        <option value="What kind of loft construction would you like?">What kind of loft construction would you like?</option>
                        <option value="What do you need a realtor's help with?">What do you need a realtor's help with?</option>
                        <option value="How much area is required for gym setup?">How much area is required for gym setup?</option>
                        <option value="How many bedrooms are you looking for?">How many bedrooms are you looking for?</option>
                        <option value="Do you need a floor plan?">Do you need a floor plan?</option>
                        <option value="Are you looking for properties that allow pets?">Are you looking for properties that allow pets?</option>
                        <option value="Are you looking for a fully furnished property?">Are you looking for a fully furnished property?</option>
                      </optgroup>
                      <optgroup label="Retail">
                        <option value="Would you like to sign up for an event?">Would you like to sign up for an event?</option>
                        <option value="Where are you interested in shopping?">Where are you interested in shopping?</option>
                        <option value="What is your favorite brand?">What is your favorite brand?</option>
                        <option value="What is the next product you plan to purchase?">What is the next product you plan to purchase?</option>
                        <option value="Are you interested in product samples?">Are you interested in product samples?</option>
                      </optgroup>
                      <optgroup label="Technology">
                        <option value="Who is your current phone service provider?">Who is your current phone service provider?</option>
                        <option value="Who is your current internet service provider?">Who is your current internet service provider?</option>
                        <option value="Do you want to develop a website or an application?">Do you want to develop a website or an application?</option>
                        <option value="Do you have experience in importing from China?">Do you have experience in importing from China?</option>
                        <option value="Are you planning to get a smartphone with your plan?">Are you planning to get a smartphone with your plan?</option>
                      </optgroup>
                      <optgroup label="Transportation">
                        <option value="Which type of valid commercial license do you have?">Which type of valid commercial license do you have?</option>
                        <option value="How many vehicles are in your fleet?">How many vehicles are in your fleet?</option>
                      </optgroup>
                      <optgroup label="Travel">
                        <option value="Where do you want to stay during your travel?">Where do you want to stay during your travel?</option>
                        <option value="What is your travel budget?">What is your travel budget?</option>
                        <option value="What is your return date?">What is your return date?</option>
                        <option value="What is your preferred date for stay?">What is your preferred date for stay?</option>
                        <option value="What is your destination country?">What is your destination country?</option>
                        <option value="What is your destination city?">What is your destination city?</option>
                        <option value="What is your departure date?">What is your departure date?</option>
                        <option value="What is your departure country?">What is your departure country?</option>
                        <option value="What is your departure city?">What is your departure city?</option>
                        <option value="Interested in booking an event?">Interested in booking an event?</option>
                      </optgroup>
                    </select>
                  </div>

                  {lfCustomQuestions.map((cq, idx) => (
                    <div key={cq.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cq.question}
                        onChange={(e) => {
                          const updated = [...lfCustomQuestions];
                          updated[idx].question = e.target.value;
                          setLfCustomQuestions(updated);
                        }}
                        placeholder={`Question ${idx + 1}`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100"
                      />
                      <button type="button" onClick={() => setLfCustomQuestions(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-400">
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

              {/* Privacy policy & Background Image */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Privacy policy URL</label>
                  <input
                    type="url"
                    value={lfPrivacyPolicyUrl}
                    onChange={(e) => setLfPrivacyPolicyUrl(e.target.value)}
                    placeholder="https://example.com/privacy"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Background image</label>
                  <input
                    type="url"
                    value={lfBackgroundImage}
                    onChange={(e) => setLfBackgroundImage(e.target.value)}
                    placeholder="https://example.com/bg-image.jpg"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
              </div>

              {/* Form Submission Message */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="font-bold text-slate-200 text-xs">Create form submission message</h4>
                
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Headline</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={lfSubHeadline}
                    onChange={(e) => setLfSubHeadline(e.target.value)}
                    placeholder="Thank you."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100"
                  />
                  <span className="text-[10px] text-slate-500 block font-mono">{lfSubHeadline.length} / 30 (Text is {lfSubHeadline.length} characters out of 30)</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Description</label>
                  <textarea
                    rows={2}
                    maxLength={200}
                    value={lfSubDescription}
                    onChange={(e) => setLfSubDescription(e.target.value)}
                    placeholder="We'll contact you soon."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                  />
                  <span className="text-[10px] text-slate-500 block text-right font-mono">{lfSubDescription.length} / 200 (Text is {lfSubDescription.length} characters out of 200)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Call-to-action</label>
                    <select
                      value={lfSubCta}
                      onChange={(e) => setLfSubCta(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      {["None", "Visit site", "Download", "Learn more", "Shop now"].map((cta, idx) => (
                        <option key={idx} value={cta}>{cta}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Call-to-action URL</label>
                    <input
                      type="url"
                      value={lfSubCtaUrl}
                      onChange={(e) => setLfSubCtaUrl(e.target.value)}
                      placeholder="https://example.com/thank-you"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Select Call-To-Action for your ad */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Select a call-to-action for your ad</h4>
                  <p className="text-[11px] text-slate-400">Select a compelling call-to-action that empowers people to engage with your business or service</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Call-to-action</label>
                    <select
                      value={lfAdCta}
                      onChange={(e) => setLfAdCta(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
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
                    <label className="block text-slate-300 font-semibold mb-1">Call-to-action description</label>
                    <input
                      type="text"
                      maxLength={30}
                      value={lfAdCtaDescription}
                      onChange={(e) => setLfAdCtaDescription(e.target.value)}
                      placeholder="Call-to-action description"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                    <span className="text-[10px] text-slate-500 block text-right font-mono">{lfAdCtaDescription.length} / 30 (Text is {lfAdCtaDescription.length} characters out of 30)</span>
                  </div>
                </div>
              </div>

              {/* Lead Delivery Option */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="font-bold text-slate-200 text-xs">Lead delivery option</h4>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 space-y-1">
                  <span className="font-semibold block">Download collected leads in ad extensions table</span>
                  <p className="text-slate-400">You can only download leads that've been collected within the last 30 days</p>
                </div>

                {/* Webhook integration */}
                <div className="space-y-2 pt-2">
                  <h5 className="font-semibold text-slate-300">Webhook integration (optional)</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Send lead form data directly to your CDM or CRM software in real time. Otherwise, you can download data within the last 30 days from the extensions table. <a href="https://support.google.com/google-ads/answer/10089407?hl=en_US" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">Learn more</a>
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">Webhook URL</label>
                      <input
                        type="url"
                        value={lfWebhookUrl}
                        onChange={(e) => setLfWebhookUrl(e.target.value)}
                        placeholder="https://example.com/webhook"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">Key</label>
                      <input
                        type="text"
                        maxLength={50}
                        value={lfWebhookKey}
                        onChange={(e) => setLfWebhookKey(e.target.value)}
                        placeholder="Key"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                      <span className="text-[10px] text-slate-500 block text-right font-mono">{lfWebhookKey.length} / 50 (Text is {lfWebhookKey.length} characters out of 50)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="font-semibold text-slate-300 text-xs">Don't have a webhook?</span>
                    <p className="text-[11px] text-slate-400">
                      Zapier allows you to quickly connect your lead form with over 3,000 apps. <a href="https://zapier.com/apps/google-ads/integrations" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">Connect your lead form with Zapier</a>
                    </p>
                  </div>
                </div>

                {/* Notifications */}
                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <h5 className="font-semibold text-slate-300">Notifications (optional)</h5>
                  <p className="text-[11px] text-slate-400">To get an email notification for every received lead, enter 1 or more email addresses.</p>
                  <input
                    type="text"
                    value={lfNotificationEmails}
                    onChange={(e) => setLfNotificationEmails(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* Lead form type */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Lead form type</h4>
                  <p className="text-[11px] text-slate-400">Optimize for leads with higher intent or for more leads overall. <a href="https://support.google.com/google-ads/answer/10089406?hl=en_US#optimization" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">Learn more</a></p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${lfFormType === "MORE_VOLUME" ? "border-primary bg-primary/10" : "border-slate-800 bg-slate-950 hover:bg-slate-900"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="lfType" checked={lfFormType === "MORE_VOLUME"} onChange={() => setLfFormType("MORE_VOLUME")} className="text-primary" />
                      <span className="font-bold text-slate-200 text-xs">More volume</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">This may result in leads with lower intent.</p>
                  </label>

                  <label className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${lfFormType === "MORE_QUALIFIED" ? "border-primary bg-primary/10" : "border-slate-800 bg-slate-950 hover:bg-slate-900"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="lfType" checked={lfFormType === "MORE_QUALIFIED"} onChange={() => setLfFormType("MORE_QUALIFIED")} className="text-primary" />
                      <span className="font-bold text-slate-200 text-xs">More qualified</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">This may result in fewer leads or a higher cost per lead.</p>
                  </label>
                </div>

                <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
                  To create new lead form extensions, accept the Terms of Service.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSavedLeadForms(prev => [...prev, { headline: lfHeadline || "Lead Form", business: lfBusinessName || "Business" }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Lead Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Callouts Modal ── */}
      {activeModal === "BRAND_GUIDELINES" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Add callouts to your campaign</h3>
                <p className="text-[11px] text-slate-400">Campaign-level callouts: Add callouts to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-200">Add new callout</h4>
              {["Callout text 1", "Callout text 2", "Callout text 3", "Callout text 4"].map((ct, idx) => (
                <div key={idx} className="space-y-1">
                  <input id={`calloutInp-${idx}`} type="text" maxLength={25} placeholder={ct} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100" />
                  <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 25</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <h5 className="font-semibold text-slate-300">Advanced options - Days and hours</h5>
                <div className="flex flex-wrap items-center gap-3">
                  <select defaultValue="All days" className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100"><option>All days</option></select>
                  <select defaultValue="00:00" className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"><option>00:00</option></select>
                  <span className="text-slate-400">to</span>
                  <select defaultValue="00:00" className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"><option>00:00</option></select>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button type="button" className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline">+ Add schedules</button>
              <button
                type="button"
                onClick={() => {
                  const co1 = (document.getElementById("calloutInp-0") as HTMLInputElement)?.value || "Fast Shipping";
                  setSavedCallouts(prev => [...prev, co1]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
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
