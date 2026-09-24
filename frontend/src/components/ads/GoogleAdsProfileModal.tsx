"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Building2,
  Globe,
  ShoppingBag,
  Smartphone,
  ShieldCheck,
  User,
  Mail,
  Clock,
  Coins,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Plus,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  MapPin,
  FileText,
  Target,
  Layers,
  Save,
  Award,
  Phone,
  MessageSquare,
  Languages,
  Briefcase,
  Package,
  Edit3,
  Power,
  Users,
  Palette,
  Swords,
  Search,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon
} from "lucide-react";
import { MediaAssetsLibraryTab, MediaAssetItem } from "./MediaAssetsLibraryTab";
import { GoogleAdsAccountHealthSection } from "./GoogleAdsAccountHealthSection";

// Native SVG representation of YouTube icon
const Youtube = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.866.553 9.388.553 9.388.553s7.522 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export interface SubPageEntry {
  text: string;
  url: string;
}

export interface WebsiteEntry {
  url: string;
  title?: string;
  description?: string;
  subPages: SubPageEntry[];
  analyzedAt?: string;
}

export interface AppDetailEntry {
  id: string;
  platform: "ANDROID" | "IOS";
  appId: string;
  appName?: string;
  appUrl?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: string | number;
  currency?: string;
  productUrl?: string;
  features?: string[];
  benefits?: string[];
  usp?: string;
  targetAudience?: string;
  isActive: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: string | number;
  currency?: string;
  serviceUrl?: string;
  features?: string[];
  benefits?: string[];
  usp?: string;
  targetAudience?: string;
  isActive: boolean;
}

export interface TargetAudienceItem {
  id: string;
  name: string;
  ageRange?: string;
  gender?: "All" | "Male" | "Female" | string;
  customerType?: "B2B" | "B2C" | "Both" | string;
  locations?: string[];
  languages?: string[];
  interests?: string[];
  painPoints?: string[];
  needs?: string[];
  buyingIntent?: string;
  purchaseBehavior?: string;
  additionalNotes?: string;
  isActive: boolean;
}

export interface CustomerPersonaItem {
  id: string;
  name: string;
  shortDescription?: string;
  ageRange?: string;
  gender?: "All" | "Male" | "Female" | string;
  occupation?: string;
  customerType?: "B2B" | "B2C" | "Both" | string;
  locations?: string[];
  languages?: string[];
  interests?: string[];
  painPoints?: string[];
  needs?: string[];
  buyingIntent?: string;
  purchaseBehavior?: string;
  preferredOfferings?: string[];
  additionalNotes?: string;
  isActive: boolean;
}

export interface LocationItem {
  id: string;
  locationName: string;
  country: string;
  state: string;
  city: string;
  areaLocality?: string;
  pincode?: string;
  fullAddress?: string;
  locationType: "Headquarters" | "Branch" | "Store" | "Service Area" | string;
  latitude?: string | number;
  longitude?: string | number;
  radius?: string;
  languages?: string[];
  additionalNotes?: string;
  isActive: boolean;
}

export type ConversionType =
  | "Website Purchase"
  | "Lead Form"
  | "Phone Call"
  | "WhatsApp"
  | "Contact"
  | "Sign-up"
  | "Booking"
  | "App Install"
  | "App Purchase"
  | "Store Visit"
  | "Get Directions"
  | "Other"
  | string;

export type ConversionSource = "Website" | "Phone" | "App" | "Store" | "Other" | string;

export interface ConversionGoalItem {
  id: string;
  goalName: string;
  conversionType: ConversionType;
  source: ConversionSource;
  description?: string;
  conversionValue?: string | number;
  currency?: string;
  isPrimary: boolean;
  isActive: boolean;
  additionalNotes?: string;
}

export interface BrandProfileData {
  // Brand Identity
  brandName?: string;
  brandTagline?: string;
  brandDescription?: string;
  brandWebsite?: string;
  logoUrl?: string;
  brandColors?: string[];
  brandKeywords?: string[];

  // Brand Voice
  brandVoice?: string[];

  // Messaging Guidelines
  preferredCta?: string;
  preferredMessaging?: string;
  brandUsps?: string[];
  wordsToPrefer?: string[];
  wordsToAvoid?: string[];
  advertisingDos?: string[];
  advertisingDonts?: string[];
  promotionalStyle?: string;
  discountRules?: string;
  priceRules?: string;
  additionalNotes?: string;
}

export interface CompetitorItem {
  id: string;
  competitorName: string;
  competitorWebsite?: string;
  competitorDescription?: string;
  industry?: string;
  products?: string[];
  services?: string[];
  targetMarket?: string;
  locations?: string[];
  mainUsps?: string[];
  competitorNotes?: string;
  isActive: boolean;
}

export type KeywordType =
  | "Primary"
  | "Secondary"
  | "Long-tail"
  | "Branded"
  | "Product"
  | "Service"
  | "Location"
  | string;

export type SearchIntentType =
  | "Informational"
  | "Commercial"
  | "Transactional"
  | "Navigational"
  | string;

export interface SeoKeywordItem {
  id: string;
  keyword: string;
  keywordType: KeywordType;
  relatedOffering?: string;
  targetLocation?: string;
  searchIntent?: SearchIntentType;
  notes?: string;
  isActive: boolean;
}

export type NegativeMatchScore = "Broad" | "Phrase" | "Exact" | string;

export interface NegativeKeywordItem {
  id: string;
  keyword: string;
  matchType: NegativeMatchScore;
  reason?: string;
  isActive: boolean;
}

export interface BusinessFaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  relatedProduct?: string;
  relatedService?: string;
  relatedLocation?: string;
  keywords?: string[];
  isActive: boolean;
  internalNotes?: string;
}

export type AiSuggestionSection =
  | "business"
  | "products"
  | "services"
  | "target_audience"
  | "locations"
  | "brand_profile"
  | "competitors"
  | "seo_keywords"
  | "faqs";

export type AiSuggestionStatus = "new" | "existing" | "conflict";

export interface AiSuggestionItem {
  id: string;
  section: AiSuggestionSection;
  field: string;
  label: string;
  suggestedValue: any;
  currentValue?: any;
  sourceUrl: string;
  status: AiSuggestionStatus;
  explanation?: string;
  applied?: boolean;
  rejected?: boolean;
}

export interface CustomerProfileData {
  success: boolean;
  customerId: string;
  formattedCustomerId: string;
  accountName: string;
  businessName: string;
  legalBusinessName?: string | null;
  businessCategory?: string | null;
  customerType?: string | null;
  businessModel?: string | null;
  businessEmail?: string | null;
  businessPhone?: string | null;
  whatsappNumber?: string | null;
  businessAddress?: string | null;
  serviceAreas?: string[];
  languagesServed?: string[];
  organizationName: string;
  userName: string;
  userEmail: string;
  userRole: string;
  locationName?: string;
  currencyCode: string;
  timeZone: string;
  status: string;
  isManager: boolean;
  optimizationScore?: number | null;
  // Capabilities
  hasMerchantAccount: boolean;
  merchantCenterId?: string | null;
  merchantDetails?: Record<string, any> | null;
  hasAppAccount: boolean;
  appId?: string | null;
  appDetails?: AppDetailEntry[];
  billingStatus?: string | null;
  googleTagId?: string | null;
  // Marketing & Business Profile Fields
  primaryWebsite?: string | null;
  additionalWebsites?: WebsiteEntry[];
  youtubeLinks?: string[];
  businessDescription?: string | null;
  industry?: string | null;
  products?: (ProductItem | string)[];
  services?: (ServiceItem | string)[];
  targetAudiences?: TargetAudienceItem[];
  customerPersonas?: CustomerPersonaItem[];
  locationRecords?: LocationItem[];
  locationsMaster?: LocationItem[];
  conversionGoals?: ConversionGoalItem[];
  brandProfile?: BrandProfileData;
  competitors?: CompetitorItem[];
  seoKeywords?: SeoKeywordItem[];
  negativeKeywords?: NegativeKeywordItem[];
  faqs?: BusinessFaqItem[];
  aiSuggestions?: AiSuggestionItem[];
  mediaAssets?: MediaAssetItem[];
  targetAudience?: string | null;
  keyOfferings?: string[];
  locations?: string[];
  isApproved?: boolean;
  approvedAt?: string | null;
}

interface GoogleAdsProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  orgId?: string;
}

type TabKey = "overview" | "business" | "products_services" | "target_audience" | "locations" | "conversion_goals" | "brand_profile" | "competitors" | "seo_keywords" | "faqs" | "ai_suggestions" | "media_assets" | "websites" | "merchant_apps";

export function GoogleAdsProfileModal({
  isOpen,
  onClose,
  customerId,
  orgId = "demo-org-123"
}: GoogleAdsProfileModalProps) {
  const [profile, setProfile] = useState<CustomerProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [mediaAssets, setMediaAssets] = useState<MediaAssetItem[]>([]);

  // Editable form state - Business Information
  const [businessName, setBusinessName] = useState("");
  const [legalBusinessName, setLegalBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [customerType, setCustomerType] = useState<string>("Both");
  const [businessModel, setBusinessModel] = useState<string>("Product");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [languagesServed, setLanguagesServed] = useState<string[]>([]);
  const [newServiceAreaInput, setNewServiceAreaInput] = useState("");
  const [newLanguageServedInput, setNewLanguageServedInput] = useState("");
  const [billingStatus, setBillingStatus] = useState<string>("ACTIVE");
  const [googleTagId, setGoogleTagId] = useState<string>("");

  // Marketing Intelligence arrays
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [keyOfferings, setKeyOfferings] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  // Products & Services Master state
  const [psSubTab, setPsSubTab] = useState<"products" | "services">("products");
  const [isPsModalOpen, setIsPsModalOpen] = useState<boolean>(false);
  const [psModalType, setPsModalType] = useState<"product" | "service">("product");
  const [psModalMode, setPsModalMode] = useState<"add" | "edit">("add");
  const [editingPsId, setEditingPsId] = useState<string | null>(null);

  // Modal form data (all 11 fields for Product / Service)
  const [psFormName, setPsFormName] = useState("");
  const [psFormDescription, setPsFormDescription] = useState("");
  const [psFormCategory, setPsFormCategory] = useState("");
  const [psFormPrice, setPsFormPrice] = useState("");
  const [psFormCurrency, setPsFormCurrency] = useState("INR");
  const [psFormUrl, setPsFormUrl] = useState("");
  const [psFormFeatures, setPsFormFeatures] = useState<string[]>([]);
  const [psFormBenefits, setPsFormBenefits] = useState<string[]>([]);
  const [psFormUsp, setPsFormUsp] = useState("");
  const [psFormTargetAudience, setPsFormTargetAudience] = useState("");
  const [psFormIsActive, setPsFormIsActive] = useState<boolean>(true);

  const [psTempFeature, setPsTempFeature] = useState("");
  const [psTempBenefit, setPsTempBenefit] = useState("");

  // Target Audience & Customer Personas state
  const [targetAudiences, setTargetAudiences] = useState<TargetAudienceItem[]>([]);
  const [customerPersonas, setCustomerPersonas] = useState<CustomerPersonaItem[]>([]);
  const [tapSubTab, setTapSubTab] = useState<"audiences" | "personas">("audiences");
  const [isTapModalOpen, setIsTapModalOpen] = useState<boolean>(false);
  const [tapModalType, setTapModalType] = useState<"audience" | "persona">("audience");
  const [tapModalMode, setTapModalMode] = useState<"add" | "edit">("add");
  const [editingTapId, setEditingTapId] = useState<string | null>(null);

  // Audience form fields (13 fields)
  const [audName, setAudName] = useState("");
  const [audAgeRange, setAudAgeRange] = useState("");
  const [audGender, setAudGender] = useState<"All" | "Male" | "Female">("All");
  const [audCustomerType, setAudCustomerType] = useState<string>("Both");
  const [audLocations, setAudLocations] = useState<string[]>([]);
  const [audLanguages, setAudLanguages] = useState<string[]>([]);
  const [audInterests, setAudInterests] = useState<string[]>([]);
  const [audPainPoints, setAudPainPoints] = useState<string[]>([]);
  const [audNeeds, setAudNeeds] = useState<string[]>([]);
  const [audBuyingIntent, setAudBuyingIntent] = useState("");
  const [audPurchaseBehavior, setAudPurchaseBehavior] = useState("");
  const [audAdditionalNotes, setAudAdditionalNotes] = useState("");
  const [audIsActive, setAudIsActive] = useState<boolean>(true);

  // Audience temp chip inputs
  const [audTempLocation, setAudTempLocation] = useState("");
  const [audTempLanguage, setAudTempLanguage] = useState("");
  const [audTempInterest, setAudTempInterest] = useState("");
  const [audTempPainPoint, setAudTempPainPoint] = useState("");
  const [audTempNeed, setAudTempNeed] = useState("");

  // Persona form fields (16 fields)
  const [perName, setPerName] = useState("");
  const [perShortDescription, setPerShortDescription] = useState("");
  const [perAgeRange, setPerAgeRange] = useState("");
  const [perGender, setPerGender] = useState<string>("All");
  const [perOccupation, setPerOccupation] = useState("");
  const [perCustomerType, setPerCustomerType] = useState<string>("Both");
  const [perLocations, setPerLocations] = useState<string[]>([]);
  const [perLanguages, setPerLanguages] = useState<string[]>([]);
  const [perInterests, setPerInterests] = useState<string[]>([]);
  const [perPainPoints, setPerPainPoints] = useState<string[]>([]);
  const [perNeeds, setPerNeeds] = useState<string[]>([]);
  const [perBuyingIntent, setPerBuyingIntent] = useState("");
  const [perPurchaseBehavior, setPerPurchaseBehavior] = useState("");
  const [perPreferredOfferings, setPerPreferredOfferings] = useState<string[]>([]);
  const [perAdditionalNotes, setPerAdditionalNotes] = useState("");
  const [perIsActive, setPerIsActive] = useState<boolean>(true);

  // Persona temp chip inputs
  const [perTempLocation, setPerTempLocation] = useState("");
  const [perTempLanguage, setPerTempLanguage] = useState("");
  const [perTempInterest, setPerTempInterest] = useState("");
  const [perTempPainPoint, setPerTempPainPoint] = useState("");
  const [perTempNeed, setPerTempNeed] = useState("");
  const [perTempOffering, setPerTempOffering] = useState("");

  // Locations & Service Areas Master state
  const [locationRecords, setLocationRecords] = useState<LocationItem[]>([]);
  const [isLocModalOpen, setIsLocModalOpen] = useState<boolean>(false);
  const [locModalMode, setLocModalMode] = useState<"add" | "edit">("add");
  const [editingLocId, setEditingLocId] = useState<string | null>(null);

  // Location form fields (14 fields)
  const [locName, setLocName] = useState("");
  const [locCountry, setLocCountry] = useState("India");
  const [locState, setLocState] = useState("");
  const [locCity, setLocCity] = useState("");
  const [locAreaLocality, setLocAreaLocality] = useState("");
  const [locPincode, setLocPincode] = useState("");
  const [locFullAddress, setLocFullAddress] = useState("");
  const [locType, setLocType] = useState<"Headquarters" | "Branch" | "Store" | "Service Area">("Branch");
  const [locLatitude, setLocLatitude] = useState("");
  const [locLongitude, setLocLongitude] = useState("");
  const [locRadius, setLocRadius] = useState("");
  const [locLanguages, setLocLanguages] = useState<string[]>([]);
  const [locTempLanguage, setLocTempLanguage] = useState("");
  const [locAdditionalNotes, setLocAdditionalNotes] = useState("");
  const [locIsActive, setLocIsActive] = useState<boolean>(true);

  // Conversion Goals Master state
  const [conversionGoals, setConversionGoals] = useState<ConversionGoalItem[]>([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [goalModalMode, setGoalModalMode] = useState<"add" | "edit">("add");
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Goal Form fields
  const [goalName, setGoalName] = useState("");
  const [goalType, setGoalType] = useState<ConversionType>("Lead Form");
  const [goalSource, setGoalSource] = useState<ConversionSource>("Website");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalValue, setGoalValue] = useState("");
  const [goalCurrency, setGoalCurrency] = useState("INR");
  const [goalIsPrimary, setGoalIsPrimary] = useState<boolean>(true);
  const [goalIsActive, setGoalIsActive] = useState<boolean>(true);
  const [goalNotes, setGoalNotes] = useState("");

  // Brand Profile State
  const [brandName, setBrandName] = useState("");
  const [brandTagline, setBrandTagline] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [brandWebsite, setBrandWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [brandColorInput, setBrandColorInput] = useState("");
  const [brandKeywords, setBrandKeywords] = useState<string[]>([]);
  const [brandKeywordInput, setBrandKeywordInput] = useState("");

  // Brand Voice (multi-select)
  const [brandVoice, setBrandVoice] = useState<string[]>([]);

  // Messaging Guidelines
  const [preferredCta, setPreferredCta] = useState("");
  const [preferredMessaging, setPreferredMessaging] = useState("");
  const [brandUsps, setBrandUsps] = useState<string[]>([]);
  const [brandUspInput, setBrandUspInput] = useState("");
  const [wordsToPrefer, setWordsToPrefer] = useState<string[]>([]);
  const [wordPreferInput, setWordPreferInput] = useState("");
  const [wordsToAvoid, setWordsToAvoid] = useState<string[]>([]);
  const [wordAvoidInput, setWordAvoidInput] = useState("");
  const [advertisingDos, setAdvertisingDos] = useState<string[]>([]);
  const [adDoInput, setAdDoInput] = useState("");
  const [advertisingDonts, setAdvertisingDonts] = useState<string[]>([]);
  const [adDontInput, setAdDontInput] = useState("");
  const [promotionalStyle, setPromotionalStyle] = useState("");
  const [discountRules, setDiscountRules] = useState("");
  const [priceRules, setPriceRules] = useState("");
  const [brandAdditionalNotes, setBrandAdditionalNotes] = useState("");

  // Competitor Intelligence state
  const [competitors, setCompetitors] = useState<CompetitorItem[]>([]);
  const [isCompModalOpen, setIsCompModalOpen] = useState<boolean>(false);
  const [compModalMode, setCompModalMode] = useState<"add" | "edit">("add");
  const [editingCompId, setEditingCompId] = useState<string | null>(null);

  // Competitor form fields
  const [compName, setCompName] = useState("");
  const [compWebsite, setCompWebsite] = useState("");
  const [compDescription, setCompDescription] = useState("");
  const [compIndustry, setCompIndustry] = useState("");
  const [compProducts, setCompProducts] = useState<string[]>([]);
  const [compProductInput, setCompProductInput] = useState("");
  const [compServices, setCompServices] = useState<string[]>([]);
  const [compServiceInput, setCompServiceInput] = useState("");
  const [compTargetMarket, setCompTargetMarket] = useState("");
  const [compLocations, setCompLocations] = useState<string[]>([]);
  const [compLocationInput, setCompLocationInput] = useState("");
  const [compMainUsps, setCompMainUsps] = useState<string[]>([]);
  const [compUspInput, setCompUspInput] = useState("");
  const [compNotes, setCompNotes] = useState("");
  const [compIsActive, setCompIsActive] = useState<boolean>(true);

  // SEO & Keywords State
  const [seoSubTab, setSeoSubTab] = useState<"keywords" | "negative">("keywords");

  // Target Keywords Master state
  const [seoKeywords, setSeoKeywords] = useState<SeoKeywordItem[]>([]);
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState<boolean>(false);
  const [keywordModalMode, setKeywordModalMode] = useState<"add" | "edit">("add");
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);

  // Keyword form fields
  const [kwText, setKwText] = useState("");
  const [kwType, setKwType] = useState<KeywordType>("Primary");
  const [kwRelatedOffering, setKwRelatedOffering] = useState("");
  const [kwTargetLocation, setKwTargetLocation] = useState("");
  const [kwSearchIntent, setKwSearchIntent] = useState<SearchIntentType>("Commercial");
  const [kwNotes, setKwNotes] = useState("");
  const [kwIsActive, setKwIsActive] = useState<boolean>(true);

  // Negative Keywords Master state
  const [negativeKeywords, setNegativeKeywords] = useState<NegativeKeywordItem[]>([]);
  const [isNegModalOpen, setIsNegModalOpen] = useState<boolean>(false);
  const [negModalMode, setNegModalMode] = useState<"add" | "edit">("add");
  const [editingNegId, setEditingNegId] = useState<string | null>(null);

  // Negative Keyword form fields
  const [negText, setNegText] = useState("");
  const [negMatchType, setNegMatchType] = useState<NegativeMatchScore>("Phrase");
  const [negReason, setNegReason] = useState("");
  const [negIsActive, setNegIsActive] = useState<boolean>(true);

  // Business FAQs & Key Information state
  const [faqs, setFaqs] = useState<BusinessFaqItem[]>([]);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState<boolean>(false);
  const [faqModalMode, setFaqModalMode] = useState<"add" | "edit">("add");
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  // FAQ form fields
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("");
  const [faqRelatedProduct, setFaqRelatedProduct] = useState("");
  const [faqRelatedService, setFaqRelatedService] = useState("");
  const [faqRelatedLocation, setFaqRelatedLocation] = useState("");
  const [faqKeywords, setFaqKeywords] = useState<string[]>([]);
  const [faqKeywordInput, setFaqKeywordInput] = useState("");
  const [faqIsActive, setFaqIsActive] = useState<boolean>(true);
  const [faqInternalNotes, setFaqInternalNotes] = useState("");

  // AI Suggestions & Discovered Intelligence state
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestionItem[]>([]);
  const [suggestionFilterSection, setSuggestionFilterSection] = useState<string>("all");
  const [suggestionFilterStatus, setSuggestionFilterStatus] = useState<string>("all");
  const [suggestionSuccessMsg, setSuggestionSuccessMsg] = useState<string | null>(null);

  // Websites state (Primary + up to 14 additional = max 15 total)
  const [primaryWebsite, setPrimaryWebsite] = useState("");
  const [primarySubPages, setPrimarySubPages] = useState<SubPageEntry[]>([]);
  const [additionalWebsites, setAdditionalWebsites] = useState<WebsiteEntry[]>([]);
  const [newWebsiteInput, setNewWebsiteInput] = useState("");
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
  const [newYoutubeInput, setNewYoutubeInput] = useState("");
  const [youtubeInputError, setYoutubeInputError] = useState<string | null>(null);
  const [analyzingUrl, setAnalyzingUrl] = useState<string | null>(null);
  const [expandedWebsiteUrl, setExpandedWebsiteUrl] = useState<string | null>(null);

  // Merchant Center state
  const [hasMerchantAccount, setHasMerchantAccount] = useState(false);
  const [merchantCenterId, setMerchantCenterId] = useState("");
  const [merchantStoreName, setMerchantStoreName] = useState("");
  const [isSyncingMerchant, setIsSyncingMerchant] = useState(false);
  const [merchantSyncMsg, setMerchantSyncMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Mobile Apps state
  const [hasAppAccount, setHasAppAccount] = useState(false);
  const [appDetails, setAppDetails] = useState<AppDetailEntry[]>([]);
  const [newAppPlatform, setNewAppPlatform] = useState<"ANDROID" | "IOS">("ANDROID");
  const [newAppId, setNewAppId] = useState("");
  const [newAppName, setNewAppName] = useState("");
  const [newAppUrl, setNewAppUrl] = useState("");
  const [isSyncingApps, setIsSyncingApps] = useState(false);
  const [appSyncMsg, setAppSyncMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Tag inputs
  const [newProductInput, setNewProductInput] = useState("");
  const [newServiceInput, setNewServiceInput] = useState("");
  const [newOfferingInput, setNewOfferingInput] = useState("");
  const [newLocationInput, setNewLocationInput] = useState("");

  // Approval and Saving state
  const [isApproved, setIsApproved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const totalWebsitesCount = (primaryWebsite.trim() ? 1 : 0) + additionalWebsites.length;

  useEffect(() => {
    if (!isOpen || !customerId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setSaveSuccessMsg(null);

    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const cleanCid = customerId.replace(/-/g, "").trim();

    fetch(`${BACKEND}/api/ads/customer-profile?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(cleanCid)}`, {
      headers: {
        "x-organization-id": orgId
      }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load Google Ads profile");
        }
        if (isMounted) {
          setProfile(data);
          // Populate editable state
          setBusinessName(data.businessName || "");
          setLegalBusinessName(data.legalBusinessName || "");
          setIndustry(data.industry || "");
          setBusinessCategory(data.businessCategory || "");
          setBusinessDescription(data.businessDescription || "");
          setTargetAudience(data.targetAudience || "");
          setCustomerType(data.customerType || "Both");
          setBusinessModel(data.businessModel || "Product");
          setBusinessEmail(data.businessEmail || "");
          setBusinessPhone(data.businessPhone || "");
          setWhatsappNumber(data.whatsappNumber || "");
          setBusinessAddress(data.businessAddress || "");
          setServiceAreas(Array.isArray(data.serviceAreas) ? data.serviceAreas : []);
          setLanguagesServed(Array.isArray(data.languagesServed) ? data.languagesServed : []);
          setBillingStatus(data.billingStatus || "ACTIVE");
          setGoogleTagId(data.googleTagId || "");

          const defaultCurr = data.currencyCode || "INR";
          const loadedProducts: ProductItem[] = Array.isArray(data.products)
            ? data.products.map((p: any, idx: number): ProductItem => {
                if (typeof p === "string") {
                  return {
                    id: `prod-${idx}-${Date.now()}`,
                    name: p,
                    description: "",
                    category: "",
                    price: "",
                    currency: defaultCurr,
                    productUrl: "",
                    features: [],
                    benefits: [],
                    usp: "",
                    targetAudience: "",
                    isActive: true
                  };
                }
                return {
                  id: p.id || `prod-${idx}-${Date.now()}`,
                  name: p.name || "",
                  description: p.description || "",
                  category: p.category || "",
                  price: p.price !== undefined && p.price !== null ? String(p.price) : "",
                  currency: p.currency || defaultCurr,
                  productUrl: p.productUrl || "",
                  features: Array.isArray(p.features) ? p.features : [],
                  benefits: Array.isArray(p.benefits) ? p.benefits : [],
                  usp: p.usp || "",
                  targetAudience: p.targetAudience || "",
                  isActive: p.isActive !== undefined ? Boolean(p.isActive) : true
                };
              })
            : [];
          setProducts(loadedProducts);

          const loadedServices: ServiceItem[] = Array.isArray(data.services)
            ? data.services.map((s: any, idx: number): ServiceItem => {
                if (typeof s === "string") {
                  return {
                    id: `serv-${idx}-${Date.now()}`,
                    name: s,
                    description: "",
                    category: "",
                    price: "",
                    currency: defaultCurr,
                    serviceUrl: "",
                    features: [],
                    benefits: [],
                    usp: "",
                    targetAudience: "",
                    isActive: true
                  };
                }
                return {
                  id: s.id || `serv-${idx}-${Date.now()}`,
                  name: s.name || "",
                  description: s.description || "",
                  category: s.category || "",
                  price: s.price !== undefined && s.price !== null ? String(s.price) : "",
                  currency: s.currency || defaultCurr,
                  serviceUrl: s.serviceUrl || "",
                  features: Array.isArray(s.features) ? s.features : [],
                  benefits: Array.isArray(s.benefits) ? s.benefits : [],
                  usp: s.usp || "",
                  targetAudience: s.targetAudience || "",
                  isActive: s.isActive !== undefined ? Boolean(s.isActive) : true
                };
              })
            : [];
          setServices(loadedServices);

          const loadedAudiences: TargetAudienceItem[] = Array.isArray(data.targetAudiences)
            ? data.targetAudiences.map((a: any, idx: number): TargetAudienceItem => ({
                id: a.id || `aud-${idx}-${Date.now()}`,
                name: a.name || "",
                ageRange: a.ageRange || "",
                gender: a.gender || "All",
                customerType: a.customerType || "Both",
                locations: Array.isArray(a.locations) ? a.locations : [],
                languages: Array.isArray(a.languages) ? a.languages : [],
                interests: Array.isArray(a.interests) ? a.interests : [],
                painPoints: Array.isArray(a.painPoints) ? a.painPoints : [],
                needs: Array.isArray(a.needs) ? a.needs : [],
                buyingIntent: a.buyingIntent || "",
                purchaseBehavior: a.purchaseBehavior || "",
                additionalNotes: a.additionalNotes || "",
                isActive: a.isActive !== undefined ? Boolean(a.isActive) : true
              }))
            : [];
          setTargetAudiences(loadedAudiences);

          const loadedPersonas: CustomerPersonaItem[] = Array.isArray(data.customerPersonas)
            ? data.customerPersonas.map((p: any, idx: number): CustomerPersonaItem => ({
                id: p.id || `per-${idx}-${Date.now()}`,
                name: p.name || "",
                shortDescription: p.shortDescription || "",
                ageRange: p.ageRange || "",
                gender: p.gender || "All",
                occupation: p.occupation || "",
                customerType: p.customerType || "Both",
                locations: Array.isArray(p.locations) ? p.locations : [],
                languages: Array.isArray(p.languages) ? p.languages : [],
                interests: Array.isArray(p.interests) ? p.interests : [],
                painPoints: Array.isArray(p.painPoints) ? p.painPoints : [],
                needs: Array.isArray(p.needs) ? p.needs : [],
                buyingIntent: p.buyingIntent || "",
                purchaseBehavior: p.purchaseBehavior || "",
                preferredOfferings: Array.isArray(p.preferredOfferings) ? p.preferredOfferings : [],
                additionalNotes: p.additionalNotes || "",
                isActive: p.isActive !== undefined ? Boolean(p.isActive) : true
              }))
            : [];
          setCustomerPersonas(loadedPersonas);

          const loadedLocations: LocationItem[] = Array.isArray(data.locationRecords || data.locationsMaster)
            ? (data.locationRecords || data.locationsMaster).map((loc: any, idx: number): LocationItem => ({
                id: loc.id || `loc-${idx}-${Date.now()}`,
                locationName: loc.locationName || loc.name || "",
                country: loc.country || "India",
                state: loc.state || "",
                city: loc.city || "",
                areaLocality: loc.areaLocality || loc.area || "",
                pincode: loc.pincode ? String(loc.pincode) : "",
                fullAddress: loc.fullAddress || loc.address || "",
                locationType: ["Headquarters", "Branch", "Store", "Service Area"].includes(loc.locationType) ? loc.locationType : "Branch",
                latitude: loc.latitude !== undefined && loc.latitude !== null ? String(loc.latitude) : "",
                longitude: loc.longitude !== undefined && loc.longitude !== null ? String(loc.longitude) : "",
                radius: loc.radius ? String(loc.radius) : "",
                languages: Array.isArray(loc.languages) ? loc.languages : [],
                additionalNotes: loc.additionalNotes || loc.notes || "",
                isActive: loc.isActive !== undefined ? Boolean(loc.isActive) : true
              }))
            : [];
          setLocationRecords(loadedLocations);

          const loadedGoals: ConversionGoalItem[] = Array.isArray(data.conversionGoals)
            ? data.conversionGoals.map((g: any, idx: number): ConversionGoalItem => ({
                id: g.id || `goal-${idx}-${Date.now()}`,
                goalName: g.goalName || "",
                conversionType: g.conversionType || "Lead Form",
                source: g.source || "Website",
                description: g.description || "",
                conversionValue: g.conversionValue !== undefined && g.conversionValue !== null ? String(g.conversionValue) : "",
                currency: g.currency || data.currencyCode || "INR",
                isPrimary: g.isPrimary !== undefined ? Boolean(g.isPrimary) : true,
                isActive: g.isActive !== undefined ? Boolean(g.isActive) : true,
                additionalNotes: g.additionalNotes || ""
              }))
            : [];
          setConversionGoals(loadedGoals);

          const bp = data.brandProfile;
          if (bp) {
            setBrandName(bp.brandName || "");
            setBrandTagline(bp.brandTagline || "");
            setBrandDescription(bp.brandDescription || "");
            setBrandWebsite(bp.brandWebsite || "");
            setLogoUrl(bp.logoUrl || "");
            setBrandColors(Array.isArray(bp.brandColors) ? bp.brandColors : []);
            setBrandKeywords(Array.isArray(bp.brandKeywords) ? bp.brandKeywords : []);
            setBrandVoice(Array.isArray(bp.brandVoice) ? bp.brandVoice : []);
            setPreferredCta(bp.preferredCta || "");
            setPreferredMessaging(bp.preferredMessaging || "");
            setBrandUsps(Array.isArray(bp.brandUsps) ? bp.brandUsps : []);
            setWordsToPrefer(Array.isArray(bp.wordsToPrefer) ? bp.wordsToPrefer : []);
            setWordsToAvoid(Array.isArray(bp.wordsToAvoid) ? bp.wordsToAvoid : []);
            setAdvertisingDos(Array.isArray(bp.advertisingDos) ? bp.advertisingDos : []);
            setAdvertisingDonts(Array.isArray(bp.advertisingDonts) ? bp.advertisingDonts : []);
            setPromotionalStyle(bp.promotionalStyle || "");
            setDiscountRules(bp.discountRules || "");
            setPriceRules(bp.priceRules || "");
            setBrandAdditionalNotes(bp.additionalNotes || "");
          } else {
            setBrandName(data.businessName || "");
            setBrandWebsite(data.primaryWebsite || "");
          }

          const loadedCompetitors: CompetitorItem[] = Array.isArray(data.competitors)
            ? data.competitors.map((c: any, idx: number): CompetitorItem => ({
                id: c.id || `comp-${idx}-${Date.now()}`,
                competitorName: c.competitorName || c.name || "",
                competitorWebsite: c.competitorWebsite || c.website || "",
                competitorDescription: c.competitorDescription || c.description || "",
                industry: c.industry || "",
                products: Array.isArray(c.products) ? c.products : [],
                services: Array.isArray(c.services) ? c.services : [],
                targetMarket: c.targetMarket || "",
                locations: Array.isArray(c.locations) ? c.locations : [],
                mainUsps: Array.isArray(c.mainUsps) ? c.mainUsps : [],
                competitorNotes: c.competitorNotes || c.notes || "",
                isActive: c.isActive !== undefined ? Boolean(c.isActive) : true
              }))
            : [];
          setCompetitors(loadedCompetitors);

          const loadedKeywords: SeoKeywordItem[] = Array.isArray(data.seoKeywords)
            ? data.seoKeywords.map((k: any, idx: number): SeoKeywordItem => ({
                id: k.id || `kw-${idx}-${Date.now()}`,
                keyword: k.keyword || k.name || "",
                keywordType: k.keywordType || "Primary",
                relatedOffering: k.relatedOffering || k.offering || "",
                targetLocation: k.targetLocation || k.location || "",
                searchIntent: k.searchIntent || "Commercial",
                notes: k.notes || "",
                isActive: k.isActive !== undefined ? Boolean(k.isActive) : true
              }))
            : [];
          setSeoKeywords(loadedKeywords);

          const loadedNegative: NegativeKeywordItem[] = Array.isArray(data.negativeKeywords)
            ? data.negativeKeywords.map((nk: any, idx: number): NegativeKeywordItem => ({
                id: nk.id || `nkw-${idx}-${Date.now()}`,
                keyword: nk.keyword || nk.name || "",
                matchType: nk.matchType || "Phrase",
                reason: nk.reason || nk.notes || "",
                isActive: nk.isActive !== undefined ? Boolean(nk.isActive) : true
              }))
            : [];
          setNegativeKeywords(loadedNegative);

          const loadedFaqs: BusinessFaqItem[] = Array.isArray(data.faqs)
            ? data.faqs.map((f: any, idx: number): BusinessFaqItem => ({
                id: f.id || `faq-${idx}-${Date.now()}`,
                question: f.question || f.q || "",
                answer: f.answer || f.a || "",
                category: f.category || "",
                relatedProduct: f.relatedProduct || "",
                relatedService: f.relatedService || "",
                relatedLocation: f.relatedLocation || "",
                keywords: Array.isArray(f.keywords) ? f.keywords : [],
                isActive: f.isActive !== undefined ? Boolean(f.isActive) : true,
                internalNotes: f.internalNotes || f.notes || ""
              }))
            : [];
          setFaqs(loadedFaqs);

          const loadedSuggestions: AiSuggestionItem[] = Array.isArray(data.aiSuggestions)
            ? data.aiSuggestions
            : [];
          setAiSuggestions(loadedSuggestions);

          setMediaAssets(Array.isArray(data.mediaAssets) ? data.mediaAssets : []);

          setKeyOfferings(Array.isArray(data.keyOfferings) ? data.keyOfferings : []);
          setLocations(Array.isArray(data.locations) ? data.locations : []);

          setPrimaryWebsite(data.primaryWebsite || "");
          setAdditionalWebsites(Array.isArray(data.additionalWebsites) ? data.additionalWebsites : []);
          setYoutubeLinks(Array.isArray(data.youtubeLinks) ? data.youtubeLinks : []);

          setHasMerchantAccount(Boolean(data.hasMerchantAccount));
          setMerchantCenterId(data.merchantCenterId || "");
          setMerchantStoreName(data.merchantDetails?.storeName || "");

          setHasAppAccount(Boolean(data.hasAppAccount));
          setAppDetails(Array.isArray(data.appDetails) ? data.appDetails : []);

          setIsApproved(Boolean(data.isApproved));
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || "Failed to fetch customer profile");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, customerId, orgId]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, field: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // AI Website Analysis handler
  const handleAnalyzeWebsite = async (targetUrl: string, isPrimary = false) => {
    if (!targetUrl || !targetUrl.trim()) return;
    const cleanCid = customerId.replace(/-/g, "").trim();
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    setAnalyzingUrl(targetUrl);
    setError(null);

    try {
      const res = await fetch(`${BACKEND}/api/ads/customer-profile/analyze-website`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          url: targetUrl.trim(),
          isPrimary,
          currentProfile: {
            businessName,
            industry,
            businessDescription,
            targetAudience,
            products,
            services,
            customerPersonas,
            locations,
            brandProfile: {
              brandTagline,
              brandVoice,
              brandUsps
            },
            competitors,
            seoKeywords,
            faqs
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Website analysis failed");
      }

      // Update subpages
      const subPages: SubPageEntry[] = data.website?.subPages || [];
      if (isPrimary) {
        setPrimarySubPages(subPages);
      } else {
        setAdditionalWebsites((prev) =>
          prev.map((w) =>
            w.url === targetUrl
              ? {
                  ...w,
                  title: data.website?.title || w.title,
                  description: data.website?.description || w.description,
                  subPages,
                  analyzedAt: new Date().toISOString()
                }
              : w
          )
        );
      }
      setExpandedWebsiteUrl(targetUrl);

      // AUTOFILL PARAMETERS DIRECTLY INTO PROFILE (For empty fields, or primary website analysis)
      let autofilledCount = 0;
      if (data.aiIntelligence) {
        const intel = data.aiIntelligence;

        if (intel.businessName && typeof intel.businessName === "string" && intel.businessName.trim() && (!businessName || isPrimary)) {
          setBusinessName(intel.businessName.trim());
          setLegalBusinessName(intel.businessName.trim());
          autofilledCount++;
        }
        if (intel.industry && typeof intel.industry === "string" && intel.industry.trim() && (!industry || isPrimary)) {
          setIndustry(intel.industry.trim());
          setBusinessCategory(intel.industry.trim());
          autofilledCount++;
        }
        if (intel.businessDescription && typeof intel.businessDescription === "string" && intel.businessDescription.trim() && (!businessDescription || isPrimary)) {
          setBusinessDescription(intel.businessDescription.trim());
          autofilledCount++;
        }
        if (intel.targetAudience && typeof intel.targetAudience === "string" && intel.targetAudience.trim() && (!targetAudience || isPrimary)) {
          setTargetAudience(intel.targetAudience.trim());
          autofilledCount++;
        }
        if (intel.businessEmail && typeof intel.businessEmail === "string" && intel.businessEmail.trim() && (!businessEmail || isPrimary)) {
          setBusinessEmail(intel.businessEmail.trim());
          autofilledCount++;
        }
        if (intel.businessPhone && typeof intel.businessPhone === "string" && intel.businessPhone.trim() && (!businessPhone || isPrimary)) {
          setBusinessPhone(intel.businessPhone.trim());
          autofilledCount++;
        }
        if (intel.whatsappNumber && typeof intel.whatsappNumber === "string" && intel.whatsappNumber.trim() && (!whatsappNumber || isPrimary)) {
          setWhatsappNumber(intel.whatsappNumber.trim());
          autofilledCount++;
        }
        if (intel.businessAddress && typeof intel.businessAddress === "string" && intel.businessAddress.trim() && (!businessAddress || isPrimary)) {
          setBusinessAddress(intel.businessAddress.trim());
          autofilledCount++;
        }
        if (Array.isArray(intel.youtubeLinks) && intel.youtubeLinks.length > 0) {
          const validYt = intel.youtubeLinks.map((y: any) => String(y).trim()).filter(Boolean);
          if (validYt.length > 0) {
            setYoutubeLinks((prev) => {
              const combined = [...prev];
              validYt.forEach((link: string) => {
                if (!combined.some((ex) => ex.toLowerCase() === link.toLowerCase())) {
                  combined.push(link);
                }
              });
              return combined;
            });
            autofilledCount++;
          }
        }
        if (Array.isArray(intel.serviceAreas) && intel.serviceAreas.length > 0 && (serviceAreas.length === 0 || isPrimary)) {
          const validAreas = intel.serviceAreas.map((a: any) => String(a).trim()).filter(Boolean);
          if (validAreas.length > 0) {
            setServiceAreas(validAreas);
            autofilledCount++;
          }
        }

        // Products
        if (Array.isArray(intel.products) && intel.products.length > 0 && (products.length === 0 || isPrimary)) {
          const newProds: ProductItem[] = intel.products
            .map((p: any, idx: number) => {
              const pName = typeof p === "object" ? p?.name : String(p);
              const pDesc = typeof p === "object" ? p?.description : undefined;
              return {
                id: `prod-ai-${Date.now()}-${idx}`,
                name: pName?.trim() || "",
                description: pDesc?.trim() || undefined,
                currency: profile?.currencyCode || "INR",
                isActive: true
              };
            })
            .filter((p: ProductItem) => Boolean(p.name));
          if (newProds.length > 0) {
            setProducts(newProds);
            autofilledCount++;
          }
        }

        // Services
        if (Array.isArray(intel.services) && intel.services.length > 0 && (services.length === 0 || isPrimary)) {
          const newServs: ServiceItem[] = intel.services
            .map((s: any, idx: number) => {
              const sName = typeof s === "object" ? s?.name : String(s);
              const sDesc = typeof s === "object" ? s?.description : undefined;
              return {
                id: `serv-ai-${Date.now()}-${idx}`,
                name: sName?.trim() || "",
                description: sDesc?.trim() || undefined,
                currency: profile?.currencyCode || "INR",
                isActive: true
              };
            })
            .filter((s: ServiceItem) => Boolean(s.name));
          if (newServs.length > 0) {
            setServices(newServs);
            autofilledCount++;
          }
        }

        // Customer Personas
        if (Array.isArray(intel.customerPersonas) && intel.customerPersonas.length > 0 && (customerPersonas.length === 0 || isPrimary)) {
          const newPersonas: CustomerPersonaItem[] = intel.customerPersonas
            .map((cp: any, idx: number) => {
              const title = typeof cp === "object" ? cp?.personaTitle || cp?.name : String(cp);
              const desc = typeof cp === "object" ? cp?.description || cp?.summary : undefined;
              return {
                id: `pers-ai-${Date.now()}-${idx}`,
                name: title?.trim() || "Target Customer",
                shortDescription: desc?.trim() || title?.trim() || "Target Audience Persona",
                painPoints: [],
                needs: [],
                isActive: true
              };
            })
            .filter((cp: CustomerPersonaItem) => Boolean(cp.name));
          if (newPersonas.length > 0) {
            setCustomerPersonas(newPersonas);
            autofilledCount++;
          }
        }

        // Locations
        if (Array.isArray(intel.locations) && intel.locations.length > 0 && (locations.length === 0 || isPrimary)) {
          const validLocs = intel.locations.map((l: any) => String(l).trim()).filter(Boolean);
          if (validLocs.length > 0) {
            setLocations(validLocs);
            const newLocRecords: LocationItem[] = validLocs.map((locName: string, idx: number) => ({
              id: `loc-ai-${Date.now()}-${idx}`,
              locationName: locName,
              country: "India",
              city: locName,
              locationType: "Service Area",
              isActive: true
            }));
            setLocationRecords(newLocRecords);
            autofilledCount++;
          }
        }

        // Brand Profile
        if (intel.brandTagline && typeof intel.brandTagline === "string" && intel.brandTagline.trim() && (!brandTagline || isPrimary)) {
          setBrandTagline(intel.brandTagline.trim());
          autofilledCount++;
        }
        if (intel.brandVoice && typeof intel.brandVoice === "string" && intel.brandVoice.trim() && (brandVoice.length === 0 || isPrimary)) {
          setBrandVoice([intel.brandVoice.trim()]);
          autofilledCount++;
        }
        if (Array.isArray(intel.brandUsps) && intel.brandUsps.length > 0 && (brandUsps.length === 0 || isPrimary)) {
          const usps = intel.brandUsps.map((u: any) => String(u).trim()).filter(Boolean);
          if (usps.length > 0) {
            setBrandUsps(usps);
            setKeyOfferings(usps);
            autofilledCount++;
          }
        }
        if (Array.isArray(intel.brandColors) && intel.brandColors.length > 0 && (brandColors.length === 0 || isPrimary)) {
          const colors = intel.brandColors.map((c: any) => String(c).trim()).filter((c: string) => /^#[0-9a-fA-F]{3,8}$/.test(c));
          if (colors.length > 0) {
            setBrandColors(colors);
            autofilledCount++;
          }
        }

        // Competitors
        if (Array.isArray(intel.competitors) && intel.competitors.length > 0 && (competitors.length === 0 || isPrimary)) {
          const newComps: CompetitorItem[] = intel.competitors
            .map((c: any, idx: number) => {
              const cName = typeof c === "object" ? c?.competitorName || c?.name : String(c);
              const cDesc = typeof c === "object" ? c?.notes || c?.description : undefined;
              return {
                id: `comp-ai-${Date.now()}-${idx}`,
                competitorName: cName?.trim() || "Competitor",
                competitorDescription: cDesc?.trim() || undefined,
                isActive: true
              };
            })
            .filter((c: CompetitorItem) => Boolean(c.competitorName));
          if (newComps.length > 0) {
            setCompetitors(newComps);
            autofilledCount++;
          }
        }

        // SEO Keywords
        if (Array.isArray(intel.seoKeywords) && intel.seoKeywords.length > 0 && (seoKeywords.length === 0 || isPrimary)) {
          const newKws: SeoKeywordItem[] = intel.seoKeywords
            .map((k: any, idx: number) => {
              const kw = typeof k === "object" ? k?.keyword : String(k);
              const kwType = (typeof k === "object" && k?.keywordType) || "Primary";
              const searchIntent = (typeof k === "object" && k?.searchIntent) || "Commercial";
              return {
                id: `kw-ai-${Date.now()}-${idx}`,
                keyword: kw?.trim() || "Keyword",
                keywordType: kwType,
                searchIntent: searchIntent,
                isActive: true
              };
            })
            .filter((k: SeoKeywordItem) => Boolean(k.keyword));
          if (newKws.length > 0) {
            setSeoKeywords(newKws);
            autofilledCount++;
          }
        }

        // FAQs
        if (Array.isArray(intel.faqs) && intel.faqs.length > 0 && (faqs.length === 0 || isPrimary)) {
          const newFaqs: BusinessFaqItem[] = intel.faqs
            .map((f: any, idx: number) => ({
              id: `faq-ai-${Date.now()}-${idx}`,
              question: f?.question?.trim() || "FAQ Question",
              answer: f?.answer?.trim() || "FAQ Answer",
              category: f?.category?.trim() || "General",
              isActive: true
            }))
            .filter((f: BusinessFaqItem) => Boolean(f.question && f.answer));
          if (newFaqs.length > 0) {
            setFaqs(newFaqs);
            autofilledCount++;
          }
        }
      }

      // Collect AI Suggestions for user review
      const newSuggestions: AiSuggestionItem[] = Array.isArray(data.aiSuggestions) ? data.aiSuggestions : [];
      if (newSuggestions.length > 0) {
        setAiSuggestions((prev) => {
          const filtered = prev.filter((s) => s.sourceUrl !== targetUrl || s.applied);
          return [...filtered, ...newSuggestions];
        });
        const newCount = newSuggestions.filter((s) => s.status === "new").length;
        const conflictCount = newSuggestions.filter((s) => s.status === "conflict").length;
        if (autofilledCount > 0) {
          setSuggestionSuccessMsg(
            `✨ Grok AI analyzed ${targetUrl}! Autofilled ${autofilledCount} fields (Email, Phone, WhatsApp, Address, Services, Products, etc.) and discovered ${newSuggestions.length} suggestions (${newCount} new, ${conflictCount} potential conflicts).`
          );
        } else {
          setSuggestionSuccessMsg(
            `Analysis complete! ${newSuggestions.length} AI suggestions discovered (${newCount} new, ${conflictCount} potential conflicts). Review them in the AI Suggestions tab.`
          );
        }
        setTimeout(() => setSuggestionSuccessMsg(null), 8000);
      } else {
        if (autofilledCount > 0) {
          setSaveSuccessMsg(`✨ Grok AI analyzed ${targetUrl}! Autofilled ${autofilledCount} profile fields and discovered ${subPages.length} relevant sub-pages!`);
        } else {
          setSaveSuccessMsg(`AI analyzed ${targetUrl} and discovered ${subPages.length} relevant sub-pages!`);
        }
        setTimeout(() => setSaveSuccessMsg(null), 5000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze website");
    } finally {
      setAnalyzingUrl(null);
    }
  };

  // Approve a single AI Suggestion and merge into active profile state
  const handleApproveSuggestion = (suggestionId: string) => {
    const sugg = aiSuggestions.find((s) => s.id === suggestionId);
    if (!sugg || sugg.applied) return;

    const val = sugg.suggestedValue;

    if (sugg.section === "business") {
      if (sugg.field === "businessName") setBusinessName(String(val));
      else if (sugg.field === "industry") setIndustry(String(val));
      else if (sugg.field === "businessDescription") setBusinessDescription(String(val));
      else if (sugg.field === "businessCategory") setBusinessCategory(String(val));
      else if (sugg.field === "businessEmail") setBusinessEmail(String(val));
      else if (sugg.field === "businessPhone") setBusinessPhone(String(val));
      else if (sugg.field === "whatsappNumber") setWhatsappNumber(String(val));
      else if (sugg.field === "businessAddress") setBusinessAddress(String(val));
      else if (sugg.field === "serviceAreas") {
        const areaStr = String(val).trim();
        if (areaStr) setServiceAreas((prev) => (prev.includes(areaStr) ? prev : [...prev, areaStr]));
      }
    } else if (sugg.section === "products") {
      const pName = typeof val === "object" ? val?.name : String(val);
      const pDesc = typeof val === "object" ? val?.description : undefined;
      if (pName) {
        setProducts((prev) => [
          ...prev,
          {
            id: `prod-sugg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: pName,
            description: pDesc,
            currency: profile?.currencyCode || "INR",
            isActive: true
          }
        ]);
      }
    } else if (sugg.section === "services") {
      const sName = typeof val === "object" ? val?.name : String(val);
      const sDesc = typeof val === "object" ? val?.description : undefined;
      if (sName) {
        setServices((prev) => [
          ...prev,
          {
            id: `serv-sugg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: sName,
            description: sDesc,
            currency: profile?.currencyCode || "INR",
            isActive: true
          }
        ]);
      }
    } else if (sugg.section === "target_audience") {
      if (sugg.field === "targetAudience") {
        setTargetAudience(String(val));
      } else if (sugg.field === "customerPersonas") {
        const title = typeof val === "object" ? val?.personaTitle || val?.name : String(val);
        const summary = typeof val === "object" ? val?.summary || val?.shortDescription : undefined;
        if (title) {
          setCustomerPersonas((prev) => [
            ...prev,
            {
              id: `pers-sugg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name: title,
              shortDescription: summary || title,
              painPoints: [],
              needs: [],
              isActive: true
            }
          ]);
        }
      }
    } else if (sugg.section === "locations") {
      const locStr = typeof val === "object" ? val?.locationName || val?.name : String(val);
      if (locStr) {
        setLocations((prev) => (prev.includes(locStr) ? prev : [...prev, locStr]));
        setLocationRecords((prev) => [
          ...prev,
          {
            id: `loc-sugg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            locationName: locStr,
            country: "India",
            state: "",
            city: locStr,
            locationType: "Service Area",
            isActive: true
          }
        ]);
      }
    } else if (sugg.section === "brand_profile") {
      if (sugg.field === "brandTagline") setBrandTagline(String(val));
      else if (sugg.field === "brandVoice") {
        const voiceStr = String(val).trim();
        if (voiceStr) {
          setBrandVoice((prev) => (prev.includes(voiceStr) ? prev : [...prev, voiceStr]));
        }
      } else if (sugg.field === "brandUsps") {
        const uspStr = String(val).trim();
        if (uspStr) {
          setBrandUsps((prev) => (prev.includes(uspStr) ? prev : [...prev, uspStr]));
          setKeyOfferings((prev) => (prev.includes(uspStr) ? prev : [...prev, uspStr]));
        }
      } else if (sugg.field === "brandColors") {
        const colorStr = String(val).trim();
        if (colorStr && /^#[0-9a-fA-F]{3,8}$/.test(colorStr)) {
          setBrandColors((prev) => (prev.includes(colorStr) ? prev : [...prev, colorStr]));
        }
      }
    } else if (sugg.section === "competitors") {
      const cName = typeof val === "object" ? val?.competitorName : String(val);
      const cDesc = typeof val === "object" ? val?.competitorDescription : undefined;
      if (cName) {
        setCompetitors((prev) => [
          ...prev,
          {
            id: `comp-sugg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            competitorName: cName,
            competitorDescription: cDesc || "",
            isActive: true
          }
        ]);
      }
    } else if (sugg.section === "seo_keywords") {
      const kw = typeof val === "object" ? val?.keyword : String(val);
      const kwType = typeof val === "object" ? val?.keywordType || "Primary" : "Primary";
      const kwIntent = typeof val === "object" ? val?.searchIntent || "Commercial" : "Commercial";
      if (kw) {
        setSeoKeywords((prev) => [
          ...prev,
          {
            id: `kw-sugg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            keyword: kw,
            keywordType: kwType,
            searchIntent: kwIntent,
            isActive: true
          }
        ]);
      }
    } else if (sugg.section === "faqs") {
      const q = typeof val === "object" ? val?.question : "";
      const a = typeof val === "object" ? val?.answer : "";
      const cat = typeof val === "object" ? val?.category : "General";
      if (q && a) {
        setFaqs((prev) => [
          ...prev,
          {
            id: `faq-sugg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            question: q,
            answer: a,
            category: cat,
            isActive: true
          }
        ]);
      }
    }

    setAiSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, applied: true, rejected: false } : s))
    );
  };

  // Reject a single AI Suggestion without modifying profile data
  const handleRejectSuggestion = (suggestionId: string) => {
    setAiSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, rejected: true, applied: false } : s))
    );
  };

  // Approve all new suggestions
  const handleApproveAllNewSuggestions = () => {
    const pendingNew = aiSuggestions.filter((s) => s.status === "new" && !s.applied && !s.rejected);
    pendingNew.forEach((s) => handleApproveSuggestion(s.id));
  };

  // Add Additional Website (Max 14 additional = max 15 total)
  const handleAddAdditionalWebsite = () => {
    const trimmed = newWebsiteInput.trim();
    if (!trimmed) return;

    if (totalWebsitesCount >= 15) {
      setError("Maximum limit of 15 websites reached.");
      return;
    }

    // Check duplicate
    if (
      trimmed.toLowerCase() === primaryWebsite.toLowerCase() ||
      additionalWebsites.some((w) => w.url.toLowerCase() === trimmed.toLowerCase())
    ) {
      setError("This website URL is already added.");
      return;
    }

    const newEntry: WebsiteEntry = {
      url: trimmed,
      subPages: [],
      analyzedAt: new Date().toISOString()
    };

    setAdditionalWebsites((prev) => [...prev, newEntry]);
    setNewWebsiteInput("");
    setError(null);

    // Trigger analysis automatically
    handleAnalyzeWebsite(trimmed, false);
  };

  // Remove Additional Website
  const handleRemoveAdditionalWebsite = (urlToRemove: string) => {
    setAdditionalWebsites((prev) => prev.filter((w) => w.url !== urlToRemove));
  };

  // YouTube Links Handlers
  const handleAddYoutubeLink = () => {
    setYoutubeInputError(null);
    const trimmed = newYoutubeInput.trim();
    if (!trimmed) return;

    // Validate YouTube URL
    const isYtUrl = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:channel\/|c\/|user\/|@|watch\?v=|embed\/|shorts\/)[\w\-_?&=%]+|youtu\.be\/[\w\-_?&=%]+)/i.test(trimmed);
    if (!isYtUrl && !trimmed.toLowerCase().includes("youtube.com") && !trimmed.toLowerCase().includes("youtu.be")) {
      setYoutubeInputError("Please enter a valid YouTube channel, video, or shorts URL.");
      return;
    }

    const formatted = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    if (youtubeLinks.some((l) => l.toLowerCase() === formatted.toLowerCase())) {
      setYoutubeInputError("This YouTube URL is already added.");
      return;
    }

    setYoutubeLinks((prev) => [...prev, formatted]);
    setNewYoutubeInput("");
    setYoutubeInputError(null);
  };

  const handleRemoveYoutubeLink = (linkToRemove: string) => {
    setYoutubeLinks((prev) => prev.filter((l) => l !== linkToRemove));
  };

  // Add App Detail
  const handleAddApp = () => {
    if (!newAppId.trim()) return;
    const newEntry: AppDetailEntry = {
      id: `app-${Date.now()}`,
      platform: newAppPlatform,
      appId: newAppId.trim(),
      appName: newAppName.trim() || undefined,
      appUrl: newAppUrl.trim() || undefined
    };
    setAppDetails((prev) => [...prev, newEntry]);
    setNewAppId("");
    setNewAppName("");
    setNewAppUrl("");
  };

  // Products & Services Master Handlers
  const openAddProductModal = () => {
    setPsModalType("product");
    setPsModalMode("add");
    setEditingPsId(null);
    setPsFormName("");
    setPsFormDescription("");
    setPsFormCategory("");
    setPsFormPrice("");
    setPsFormCurrency(profile?.currencyCode || "INR");
    setPsFormUrl("");
    setPsFormFeatures([]);
    setPsFormBenefits([]);
    setPsFormUsp("");
    setPsFormTargetAudience("");
    setPsFormIsActive(true);
    setPsTempFeature("");
    setPsTempBenefit("");
    setIsPsModalOpen(true);
  };

  const openAddServiceModal = () => {
    setPsModalType("service");
    setPsModalMode("add");
    setEditingPsId(null);
    setPsFormName("");
    setPsFormDescription("");
    setPsFormCategory("");
    setPsFormPrice("");
    setPsFormCurrency(profile?.currencyCode || "INR");
    setPsFormUrl("");
    setPsFormFeatures([]);
    setPsFormBenefits([]);
    setPsFormUsp("");
    setPsFormTargetAudience("");
    setPsFormIsActive(true);
    setPsTempFeature("");
    setPsTempBenefit("");
    setIsPsModalOpen(true);
  };

  const openEditProductModal = (prod: ProductItem) => {
    setPsModalType("product");
    setPsModalMode("edit");
    setEditingPsId(prod.id);
    setPsFormName(prod.name || "");
    setPsFormDescription(prod.description || "");
    setPsFormCategory(prod.category || "");
    setPsFormPrice(prod.price !== undefined && prod.price !== null ? String(prod.price) : "");
    setPsFormCurrency(prod.currency || profile?.currencyCode || "INR");
    setPsFormUrl(prod.productUrl || "");
    setPsFormFeatures(Array.isArray(prod.features) ? prod.features : []);
    setPsFormBenefits(Array.isArray(prod.benefits) ? prod.benefits : []);
    setPsFormUsp(prod.usp || "");
    setPsFormTargetAudience(prod.targetAudience || "");
    setPsFormIsActive(prod.isActive !== false);
    setPsTempFeature("");
    setPsTempBenefit("");
    setIsPsModalOpen(true);
  };

  const openEditServiceModal = (serv: ServiceItem) => {
    setPsModalType("service");
    setPsModalMode("edit");
    setEditingPsId(serv.id);
    setPsFormName(serv.name || "");
    setPsFormDescription(serv.description || "");
    setPsFormCategory(serv.category || "");
    setPsFormPrice(serv.price !== undefined && serv.price !== null ? String(serv.price) : "");
    setPsFormCurrency(serv.currency || profile?.currencyCode || "INR");
    setPsFormUrl(serv.serviceUrl || "");
    setPsFormFeatures(Array.isArray(serv.features) ? serv.features : []);
    setPsFormBenefits(Array.isArray(serv.benefits) ? serv.benefits : []);
    setPsFormUsp(serv.usp || "");
    setPsFormTargetAudience(serv.targetAudience || "");
    setPsFormIsActive(serv.isActive !== false);
    setPsTempFeature("");
    setPsTempBenefit("");
    setIsPsModalOpen(true);
  };

  const handleSavePsItem = () => {
    const trimmedName = psFormName.trim();
    if (!trimmedName) {
      setError("Item name is required.");
      return;
    }

    if (psModalType === "product") {
      if (psModalMode === "add") {
        const newProduct: ProductItem = {
          id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: trimmedName,
          description: psFormDescription.trim() || undefined,
          category: psFormCategory.trim() || undefined,
          price: psFormPrice.trim() || undefined,
          currency: psFormCurrency.trim() || profile?.currencyCode || "INR",
          productUrl: psFormUrl.trim() || undefined,
          features: psFormFeatures,
          benefits: psFormBenefits,
          usp: psFormUsp.trim() || undefined,
          targetAudience: psFormTargetAudience.trim() || undefined,
          isActive: psFormIsActive
        };
        setProducts((prev) => [...prev, newProduct]);
      } else {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingPsId
              ? {
                  ...p,
                  name: trimmedName,
                  description: psFormDescription.trim() || undefined,
                  category: psFormCategory.trim() || undefined,
                  price: psFormPrice.trim() || undefined,
                  currency: psFormCurrency.trim() || profile?.currencyCode || "INR",
                  productUrl: psFormUrl.trim() || undefined,
                  features: psFormFeatures,
                  benefits: psFormBenefits,
                  usp: psFormUsp.trim() || undefined,
                  targetAudience: psFormTargetAudience.trim() || undefined,
                  isActive: psFormIsActive
                }
              : p
          )
        );
      }
    } else {
      if (psModalMode === "add") {
        const newService: ServiceItem = {
          id: `serv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: trimmedName,
          description: psFormDescription.trim() || undefined,
          category: psFormCategory.trim() || undefined,
          price: psFormPrice.trim() || undefined,
          currency: psFormCurrency.trim() || profile?.currencyCode || "INR",
          serviceUrl: psFormUrl.trim() || undefined,
          features: psFormFeatures,
          benefits: psFormBenefits,
          usp: psFormUsp.trim() || undefined,
          targetAudience: psFormTargetAudience.trim() || undefined,
          isActive: psFormIsActive
        };
        setServices((prev) => [...prev, newService]);
      } else {
        setServices((prev) =>
          prev.map((s) =>
            s.id === editingPsId
              ? {
                  ...s,
                  name: trimmedName,
                  description: psFormDescription.trim() || undefined,
                  category: psFormCategory.trim() || undefined,
                  price: psFormPrice.trim() || undefined,
                  currency: psFormCurrency.trim() || profile?.currencyCode || "INR",
                  serviceUrl: psFormUrl.trim() || undefined,
                  features: psFormFeatures,
                  benefits: psFormBenefits,
                  usp: psFormUsp.trim() || undefined,
                  targetAudience: psFormTargetAudience.trim() || undefined,
                  isActive: psFormIsActive
                }
              : s
          )
        );
      }
    }

    setIsPsModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDeleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleProductActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleToggleServiceActive = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleAddFeature = () => {
    if (psTempFeature.trim()) {
      setPsFormFeatures((prev) => [...prev, psTempFeature.trim()]);
      setPsTempFeature("");
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setPsFormFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddBenefit = () => {
    if (psTempBenefit.trim()) {
      setPsFormBenefits((prev) => [...prev, psTempBenefit.trim()]);
      setPsTempBenefit("");
    }
  };

  const handleRemoveBenefit = (idx: number) => {
    setPsFormBenefits((prev) => prev.filter((_, i) => i !== idx));
  };

  // Target Audience & Personas Handlers
  const openAddAudienceModal = () => {
    setTapModalType("audience");
    setTapModalMode("add");
    setEditingTapId(null);
    setAudName("");
    setAudAgeRange("");
    setAudGender("All");
    setAudCustomerType("Both");
    setAudLocations([]);
    setAudLanguages([]);
    setAudInterests([]);
    setAudPainPoints([]);
    setAudNeeds([]);
    setAudBuyingIntent("");
    setAudPurchaseBehavior("");
    setAudAdditionalNotes("");
    setAudIsActive(true);
    setAudTempLocation("");
    setAudTempLanguage("");
    setAudTempInterest("");
    setAudTempPainPoint("");
    setAudTempNeed("");
    setIsTapModalOpen(true);
  };

  const openEditAudienceModal = (aud: TargetAudienceItem) => {
    setTapModalType("audience");
    setTapModalMode("edit");
    setEditingTapId(aud.id);
    setAudName(aud.name || "");
    setAudAgeRange(aud.ageRange || "");
    setAudGender((aud.gender as any) || "All");
    setAudCustomerType(aud.customerType || "Both");
    setAudLocations(Array.isArray(aud.locations) ? aud.locations : []);
    setAudLanguages(Array.isArray(aud.languages) ? aud.languages : []);
    setAudInterests(Array.isArray(aud.interests) ? aud.interests : []);
    setAudPainPoints(Array.isArray(aud.painPoints) ? aud.painPoints : []);
    setAudNeeds(Array.isArray(aud.needs) ? aud.needs : []);
    setAudBuyingIntent(aud.buyingIntent || "");
    setAudPurchaseBehavior(aud.purchaseBehavior || "");
    setAudAdditionalNotes(aud.additionalNotes || "");
    setAudIsActive(aud.isActive !== undefined ? Boolean(aud.isActive) : true);
    setAudTempLocation("");
    setAudTempLanguage("");
    setAudTempInterest("");
    setAudTempPainPoint("");
    setAudTempNeed("");
    setIsTapModalOpen(true);
  };

  const handleDeleteAudience = (id: string) => {
    setTargetAudiences((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleAudienceActive = (id: string) => {
    setTargetAudiences((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const openAddPersonaModal = () => {
    setTapModalType("persona");
    setTapModalMode("add");
    setEditingTapId(null);
    setPerName("");
    setPerShortDescription("");
    setPerAgeRange("");
    setPerGender("All");
    setPerOccupation("");
    setPerCustomerType("Both");
    setPerLocations([]);
    setPerLanguages([]);
    setPerInterests([]);
    setPerPainPoints([]);
    setPerNeeds([]);
    setPerBuyingIntent("");
    setPerPurchaseBehavior("");
    setPerPreferredOfferings([]);
    setPerAdditionalNotes("");
    setPerIsActive(true);
    setPerTempLocation("");
    setPerTempLanguage("");
    setPerTempInterest("");
    setPerTempPainPoint("");
    setPerTempNeed("");
    setPerTempOffering("");
    setIsTapModalOpen(true);
  };

  const openEditPersonaModal = (per: CustomerPersonaItem) => {
    setTapModalType("persona");
    setTapModalMode("edit");
    setEditingTapId(per.id);
    setPerName(per.name || "");
    setPerShortDescription(per.shortDescription || "");
    setPerAgeRange(per.ageRange || "");
    setPerGender(per.gender || "All");
    setPerOccupation(per.occupation || "");
    setPerCustomerType(per.customerType || "Both");
    setPerLocations(Array.isArray(per.locations) ? per.locations : []);
    setPerLanguages(Array.isArray(per.languages) ? per.languages : []);
    setPerInterests(Array.isArray(per.interests) ? per.interests : []);
    setPerPainPoints(Array.isArray(per.painPoints) ? per.painPoints : []);
    setPerNeeds(Array.isArray(per.needs) ? per.needs : []);
    setPerBuyingIntent(per.buyingIntent || "");
    setPerPurchaseBehavior(per.purchaseBehavior || "");
    setPerPreferredOfferings(Array.isArray(per.preferredOfferings) ? per.preferredOfferings : []);
    setPerAdditionalNotes(per.additionalNotes || "");
    setPerIsActive(per.isActive !== undefined ? Boolean(per.isActive) : true);
    setPerTempLocation("");
    setPerTempLanguage("");
    setPerTempInterest("");
    setPerTempPainPoint("");
    setPerTempNeed("");
    setPerTempOffering("");
    setIsTapModalOpen(true);
  };

  const handleDeletePersona = (id: string) => {
    setCustomerPersonas((prev) => prev.filter((p) => p.id !== id));
  };

  const handleTogglePersonaActive = (id: string) => {
    setCustomerPersonas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleSaveTapItem = () => {
    if (tapModalType === "audience") {
      const trimmedName = audName.trim();
      if (!trimmedName) {
        setError("Audience name is required.");
        return;
      }

      if (tapModalMode === "add") {
        const newAud: TargetAudienceItem = {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: trimmedName,
          ageRange: audAgeRange.trim() || undefined,
          gender: audGender,
          customerType: audCustomerType,
          locations: audLocations,
          languages: audLanguages,
          interests: audInterests,
          painPoints: audPainPoints,
          needs: audNeeds,
          buyingIntent: audBuyingIntent.trim() || undefined,
          purchaseBehavior: audPurchaseBehavior.trim() || undefined,
          additionalNotes: audAdditionalNotes.trim() || undefined,
          isActive: audIsActive
        };
        setTargetAudiences((prev) => [...prev, newAud]);
      } else {
        setTargetAudiences((prev) =>
          prev.map((a) =>
            a.id === editingTapId
              ? {
                  ...a,
                  name: trimmedName,
                  ageRange: audAgeRange.trim() || undefined,
                  gender: audGender,
                  customerType: audCustomerType,
                  locations: audLocations,
                  languages: audLanguages,
                  interests: audInterests,
                  painPoints: audPainPoints,
                  needs: audNeeds,
                  buyingIntent: audBuyingIntent.trim() || undefined,
                  purchaseBehavior: audPurchaseBehavior.trim() || undefined,
                  additionalNotes: audAdditionalNotes.trim() || undefined,
                  isActive: audIsActive
                }
              : a
          )
        );
      }
    } else {
      const trimmedName = perName.trim();
      if (!trimmedName) {
        setError("Persona name is required.");
        return;
      }

      if (tapModalMode === "add") {
        const newPer: CustomerPersonaItem = {
          id: `per-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: trimmedName,
          shortDescription: perShortDescription.trim() || undefined,
          ageRange: perAgeRange.trim() || undefined,
          gender: perGender.trim() || undefined,
          occupation: perOccupation.trim() || undefined,
          customerType: perCustomerType,
          locations: perLocations,
          languages: perLanguages,
          interests: perInterests,
          painPoints: perPainPoints,
          needs: perNeeds,
          buyingIntent: perBuyingIntent.trim() || undefined,
          purchaseBehavior: perPurchaseBehavior.trim() || undefined,
          preferredOfferings: perPreferredOfferings,
          additionalNotes: perAdditionalNotes.trim() || undefined,
          isActive: perIsActive
        };
        setCustomerPersonas((prev) => [...prev, newPer]);
      } else {
        setCustomerPersonas((prev) =>
          prev.map((p) =>
            p.id === editingTapId
              ? {
                  ...p,
                  name: trimmedName,
                  shortDescription: perShortDescription.trim() || undefined,
                  ageRange: perAgeRange.trim() || undefined,
                  gender: perGender.trim() || undefined,
                  occupation: perOccupation.trim() || undefined,
                  customerType: perCustomerType,
                  locations: perLocations,
                  languages: perLanguages,
                  interests: perInterests,
                  painPoints: perPainPoints,
                  needs: perNeeds,
                  buyingIntent: perBuyingIntent.trim() || undefined,
                  purchaseBehavior: perPurchaseBehavior.trim() || undefined,
                  preferredOfferings: perPreferredOfferings,
                  additionalNotes: perAdditionalNotes.trim() || undefined,
                  isActive: perIsActive
                }
              : p
          )
        );
      }
    }

    setIsTapModalOpen(false);
  };

  // Locations & Service Areas Master Handlers
  const openAddLocationModal = () => {
    setLocModalMode("add");
    setEditingLocId(null);
    setLocName("");
    setLocCountry("India");
    setLocState("");
    setLocCity("");
    setLocAreaLocality("");
    setLocPincode("");
    setLocFullAddress("");
    setLocType("Branch");
    setLocLatitude("");
    setLocLongitude("");
    setLocRadius("");
    setLocLanguages([]);
    setLocTempLanguage("");
    setLocAdditionalNotes("");
    setLocIsActive(true);
    setIsLocModalOpen(true);
  };

  const openEditLocationModal = (loc: LocationItem) => {
    setLocModalMode("edit");
    setEditingLocId(loc.id);
    setLocName(loc.locationName || "");
    setLocCountry(loc.country || "India");
    setLocState(loc.state || "");
    setLocCity(loc.city || "");
    setLocAreaLocality(loc.areaLocality || "");
    setLocPincode(loc.pincode || "");
    setLocFullAddress(loc.fullAddress || "");
    setLocType(
      ["Headquarters", "Branch", "Store", "Service Area"].includes(loc.locationType)
        ? (loc.locationType as any)
        : "Branch"
    );
    setLocLatitude(loc.latitude !== undefined && loc.latitude !== null ? String(loc.latitude) : "");
    setLocLongitude(loc.longitude !== undefined && loc.longitude !== null ? String(loc.longitude) : "");
    setLocRadius(loc.radius || "");
    setLocLanguages(Array.isArray(loc.languages) ? loc.languages : []);
    setLocTempLanguage("");
    setLocAdditionalNotes(loc.additionalNotes || "");
    setLocIsActive(loc.isActive !== undefined ? Boolean(loc.isActive) : true);
    setIsLocModalOpen(true);
  };

  const handleDeleteLocation = (id: string) => {
    setLocationRecords((prev) => prev.filter((l) => l.id !== id));
  };

  const handleToggleLocationActive = (id: string) => {
    setLocationRecords((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l))
    );
  };

  const handleSaveLocationItem = () => {
    const trimmedName = locName.trim();
    if (!trimmedName) {
      setError("Location Name is required.");
      return;
    }
    if (!locCity.trim()) {
      setError("City is required.");
      return;
    }

    if (locModalMode === "add") {
      const newLoc: LocationItem = {
        id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        locationName: trimmedName,
        country: locCountry.trim() || "India",
        state: locState.trim(),
        city: locCity.trim(),
        areaLocality: locAreaLocality.trim() || undefined,
        pincode: locPincode.trim() || undefined,
        fullAddress: locFullAddress.trim() || undefined,
        locationType: locType,
        latitude: locLatitude.trim() || undefined,
        longitude: locLongitude.trim() || undefined,
        radius: locRadius.trim() || undefined,
        languages: locLanguages,
        additionalNotes: locAdditionalNotes.trim() || undefined,
        isActive: locIsActive
      };
      setLocationRecords((prev) => [...prev, newLoc]);
    } else {
      setLocationRecords((prev) =>
        prev.map((l) =>
          l.id === editingLocId
            ? {
                ...l,
                locationName: trimmedName,
                country: locCountry.trim() || "India",
                state: locState.trim(),
                city: locCity.trim(),
                areaLocality: locAreaLocality.trim() || undefined,
                pincode: locPincode.trim() || undefined,
                fullAddress: locFullAddress.trim() || undefined,
                locationType: locType,
                latitude: locLatitude.trim() || undefined,
                longitude: locLongitude.trim() || undefined,
                radius: locRadius.trim() || undefined,
                languages: locLanguages,
                additionalNotes: locAdditionalNotes.trim() || undefined,
                isActive: locIsActive
              }
            : l
        )
      );
    }

    setIsLocModalOpen(false);
  };

  // Conversion Goals Master Handlers
  const openAddGoalModal = () => {
    setGoalModalMode("add");
    setEditingGoalId(null);
    setGoalName("");
    setGoalType("Lead Form");
    setGoalSource("Website");
    setGoalDescription("");
    setGoalValue("");
    setGoalCurrency(profile?.currencyCode || "INR");
    setGoalIsPrimary(true);
    setGoalIsActive(true);
    setGoalNotes("");
    setIsGoalModalOpen(true);
  };

  const openEditGoalModal = (goal: ConversionGoalItem) => {
    setGoalModalMode("edit");
    setEditingGoalId(goal.id);
    setGoalName(goal.goalName || "");
    setGoalType(goal.conversionType || "Lead Form");
    setGoalSource(goal.source || "Website");
    setGoalDescription(goal.description || "");
    setGoalValue(goal.conversionValue !== undefined && goal.conversionValue !== null ? String(goal.conversionValue) : "");
    setGoalCurrency(goal.currency || profile?.currencyCode || "INR");
    setGoalIsPrimary(goal.isPrimary !== undefined ? Boolean(goal.isPrimary) : true);
    setGoalIsActive(goal.isActive !== undefined ? Boolean(goal.isActive) : true);
    setGoalNotes(goal.additionalNotes || "");
    setIsGoalModalOpen(true);
  };

  const handleDeleteGoal = (id: string) => {
    setConversionGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleToggleGoalActive = (id: string) => {
    setConversionGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isActive: !g.isActive } : g))
    );
  };

  const handleSaveGoalItem = () => {
    const trimmedName = goalName.trim();
    if (!trimmedName) {
      setError("Conversion Goal Name is required.");
      return;
    }

    if (goalModalMode === "add") {
      const newGoal: ConversionGoalItem = {
        id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        goalName: trimmedName,
        conversionType: goalType,
        source: goalSource,
        description: goalDescription.trim() || undefined,
        conversionValue: goalValue.trim() || undefined,
        currency: goalCurrency.trim() || "INR",
        isPrimary: goalIsPrimary,
        isActive: goalIsActive,
        additionalNotes: goalNotes.trim() || undefined
      };
      setConversionGoals((prev) => [...prev, newGoal]);
    } else {
      setConversionGoals((prev) =>
        prev.map((g) =>
          g.id === editingGoalId
            ? {
                ...g,
                goalName: trimmedName,
                conversionType: goalType,
                source: goalSource,
                description: goalDescription.trim() || undefined,
                conversionValue: goalValue.trim() || undefined,
                currency: goalCurrency.trim() || "INR",
                isPrimary: goalIsPrimary,
                isActive: goalIsActive,
                additionalNotes: goalNotes.trim() || undefined
              }
            : g
        )
      );
    }

    setIsGoalModalOpen(false);
  };

  // Brand Profile Helpers
  const BRAND_VOICE_OPTIONS = [
    "Professional",
    "Friendly",
    "Premium",
    "Casual",
    "Technical",
    "Trustworthy",
    "Bold",
    "Minimal",
    "Other"
  ];

  const handleToggleBrandVoice = (voice: string) => {
    setBrandVoice((prev) =>
      prev.includes(voice) ? prev.filter((v) => v !== voice) : [...prev, voice]
    );
  };

  const handleAddBrandColor = () => {
    const val = brandColorInput.trim();
    if (val && !brandColors.includes(val)) {
      setBrandColors((prev) => [...prev, val]);
      setBrandColorInput("");
    }
  };
  const handleRemoveBrandColor = (c: string) => {
    setBrandColors((prev) => prev.filter((item) => item !== c));
  };

  const handleAddBrandKeyword = () => {
    const val = brandKeywordInput.trim();
    if (val && !brandKeywords.includes(val)) {
      setBrandKeywords((prev) => [...prev, val]);
      setBrandKeywordInput("");
    }
  };
  const handleRemoveBrandKeyword = (k: string) => {
    setBrandKeywords((prev) => prev.filter((item) => item !== k));
  };

  const handleAddBrandUsp = () => {
    const val = brandUspInput.trim();
    if (val && !brandUsps.includes(val)) {
      setBrandUsps((prev) => [...prev, val]);
      setBrandUspInput("");
    }
  };
  const handleRemoveBrandUsp = (u: string) => {
    setBrandUsps((prev) => prev.filter((item) => item !== u));
  };

  const handleAddWordToPrefer = () => {
    const val = wordPreferInput.trim();
    if (val && !wordsToPrefer.includes(val)) {
      setWordsToPrefer((prev) => [...prev, val]);
      setWordPreferInput("");
    }
  };
  const handleRemoveWordToPrefer = (w: string) => {
    setWordsToPrefer((prev) => prev.filter((item) => item !== w));
  };

  const handleAddWordToAvoid = () => {
    const val = wordAvoidInput.trim();
    if (val && !wordsToAvoid.includes(val)) {
      setWordsToAvoid((prev) => [...prev, val]);
      setWordAvoidInput("");
    }
  };
  const handleRemoveWordToAvoid = (w: string) => {
    setWordsToAvoid((prev) => prev.filter((item) => item !== w));
  };

  const handleAddAdDo = () => {
    const val = adDoInput.trim();
    if (val && !advertisingDos.includes(val)) {
      setAdvertisingDos((prev) => [...prev, val]);
      setAdDoInput("");
    }
  };
  const handleRemoveAdDo = (d: string) => {
    setAdvertisingDos((prev) => prev.filter((item) => item !== d));
  };

  const handleAddAdDont = () => {
    const val = adDontInput.trim();
    if (val && !advertisingDonts.includes(val)) {
      setAdvertisingDonts((prev) => [...prev, val]);
      setAdDontInput("");
    }
  };
  const handleRemoveAdDont = (d: string) => {
    setAdvertisingDonts((prev) => prev.filter((item) => item !== d));
  };

  // Competitor Intelligence Handlers
  const openAddCompModal = () => {
    setCompModalMode("add");
    setEditingCompId(null);
    setCompName("");
    setCompWebsite("");
    setCompDescription("");
    setCompIndustry("");
    setCompProducts([]);
    setCompProductInput("");
    setCompServices([]);
    setCompServiceInput("");
    setCompTargetMarket("");
    setCompLocations([]);
    setCompLocationInput("");
    setCompMainUsps([]);
    setCompUspInput("");
    setCompNotes("");
    setCompIsActive(true);
    setIsCompModalOpen(true);
  };

  const openEditCompModal = (comp: CompetitorItem) => {
    setCompModalMode("edit");
    setEditingCompId(comp.id);
    setCompName(comp.competitorName || "");
    setCompWebsite(comp.competitorWebsite || "");
    setCompDescription(comp.competitorDescription || "");
    setCompIndustry(comp.industry || "");
    setCompProducts(Array.isArray(comp.products) ? comp.products : []);
    setCompProductInput("");
    setCompServices(Array.isArray(comp.services) ? comp.services : []);
    setCompServiceInput("");
    setCompTargetMarket(comp.targetMarket || "");
    setCompLocations(Array.isArray(comp.locations) ? comp.locations : []);
    setCompLocationInput("");
    setCompMainUsps(Array.isArray(comp.mainUsps) ? comp.mainUsps : []);
    setCompUspInput("");
    setCompNotes(comp.competitorNotes || "");
    setCompIsActive(comp.isActive !== undefined ? Boolean(comp.isActive) : true);
    setIsCompModalOpen(true);
  };

  const handleDeleteComp = (id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleCompActive = (id: string) => {
    setCompetitors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleAddCompProduct = () => {
    const val = compProductInput.trim();
    if (val && !compProducts.includes(val)) {
      setCompProducts((prev) => [...prev, val]);
      setCompProductInput("");
    }
  };
  const handleRemoveCompProduct = (p: string) => {
    setCompProducts((prev) => prev.filter((item) => item !== p));
  };

  const handleAddCompService = () => {
    const val = compServiceInput.trim();
    if (val && !compServices.includes(val)) {
      setCompServices((prev) => [...prev, val]);
      setCompServiceInput("");
    }
  };
  const handleRemoveCompService = (s: string) => {
    setCompServices((prev) => prev.filter((item) => item !== s));
  };

  const handleAddCompLocation = () => {
    const val = compLocationInput.trim();
    if (val && !compLocations.includes(val)) {
      setCompLocations((prev) => [...prev, val]);
      setCompLocationInput("");
    }
  };
  const handleRemoveCompLocation = (l: string) => {
    setCompLocations((prev) => prev.filter((item) => item !== l));
  };

  const handleAddCompUsp = () => {
    const val = compUspInput.trim();
    if (val && !compMainUsps.includes(val)) {
      setCompMainUsps((prev) => [...prev, val]);
      setCompUspInput("");
    }
  };
  const handleRemoveCompUsp = (u: string) => {
    setCompMainUsps((prev) => prev.filter((item) => item !== u));
  };

  const handleSaveCompItem = () => {
    const trimmedName = compName.trim();
    if (!trimmedName) {
      setError("Competitor Name is required.");
      return;
    }

    let finalProducts = [...compProducts];
    if (compProductInput.trim() && !finalProducts.includes(compProductInput.trim())) {
      finalProducts.push(compProductInput.trim());
    }

    let finalServices = [...compServices];
    if (compServiceInput.trim() && !finalServices.includes(compServiceInput.trim())) {
      finalServices.push(compServiceInput.trim());
    }

    let finalLocations = [...compLocations];
    if (compLocationInput.trim() && !finalLocations.includes(compLocationInput.trim())) {
      finalLocations.push(compLocationInput.trim());
    }

    let finalUsps = [...compMainUsps];
    if (compUspInput.trim() && !finalUsps.includes(compUspInput.trim())) {
      finalUsps.push(compUspInput.trim());
    }

    if (compModalMode === "add") {
      const newComp: CompetitorItem = {
        id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        competitorName: trimmedName,
        competitorWebsite: compWebsite.trim() || undefined,
        competitorDescription: compDescription.trim() || undefined,
        industry: compIndustry.trim() || undefined,
        products: finalProducts,
        services: finalServices,
        targetMarket: compTargetMarket.trim() || undefined,
        locations: finalLocations,
        mainUsps: finalUsps,
        competitorNotes: compNotes.trim() || undefined,
        isActive: compIsActive
      };
      setCompetitors((prev) => [...prev, newComp]);
    } else {
      setCompetitors((prev) =>
        prev.map((c) =>
          c.id === editingCompId
            ? {
                ...c,
                competitorName: trimmedName,
                competitorWebsite: compWebsite.trim() || undefined,
                competitorDescription: compDescription.trim() || undefined,
                industry: compIndustry.trim() || undefined,
                products: finalProducts,
                services: finalServices,
                targetMarket: compTargetMarket.trim() || undefined,
                locations: finalLocations,
                mainUsps: finalUsps,
                competitorNotes: compNotes.trim() || undefined,
                isActive: compIsActive
              }
            : c
        )
      );
    }

    setIsCompModalOpen(false);
  };

  // SEO & Target Keyword Handlers
  const openAddKeywordModal = () => {
    setKeywordModalMode("add");
    setEditingKeywordId(null);
    setKwText("");
    setKwType("Primary");
    setKwRelatedOffering("");
    setKwTargetLocation("");
    setKwSearchIntent("Commercial");
    setKwNotes("");
    setKwIsActive(true);
    setIsKeywordModalOpen(true);
  };

  const openEditKeywordModal = (kw: SeoKeywordItem) => {
    setKeywordModalMode("edit");
    setEditingKeywordId(kw.id);
    setKwText(kw.keyword || "");
    setKwType(kw.keywordType || "Primary");
    setKwRelatedOffering(kw.relatedOffering || "");
    setKwTargetLocation(kw.targetLocation || "");
    setKwSearchIntent(kw.searchIntent || "Commercial");
    setKwNotes(kw.notes || "");
    setKwIsActive(kw.isActive !== undefined ? Boolean(kw.isActive) : true);
    setIsKeywordModalOpen(true);
  };

  const handleDeleteKeyword = (id: string) => {
    setSeoKeywords((prev) => prev.filter((k) => k.id !== id));
  };

  const handleToggleKeywordActive = (id: string) => {
    setSeoKeywords((prev) =>
      prev.map((k) => (k.id === id ? { ...k, isActive: !k.isActive } : k))
    );
  };

  const handleSaveKeywordItem = () => {
    const trimmedKw = kwText.trim();
    if (!trimmedKw) {
      setError("Keyword is required.");
      return;
    }

    if (keywordModalMode === "add") {
      const newKw: SeoKeywordItem = {
        id: `kw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        keyword: trimmedKw,
        keywordType: kwType,
        relatedOffering: kwRelatedOffering.trim() || undefined,
        targetLocation: kwTargetLocation.trim() || undefined,
        searchIntent: kwSearchIntent,
        notes: kwNotes.trim() || undefined,
        isActive: kwIsActive
      };
      setSeoKeywords((prev) => [...prev, newKw]);
    } else {
      setSeoKeywords((prev) =>
        prev.map((k) =>
          k.id === editingKeywordId
            ? {
                ...k,
                keyword: trimmedKw,
                keywordType: kwType,
                relatedOffering: kwRelatedOffering.trim() || undefined,
                targetLocation: kwTargetLocation.trim() || undefined,
                searchIntent: kwSearchIntent,
                notes: kwNotes.trim() || undefined,
                isActive: kwIsActive
              }
            : k
        )
      );
    }
    setIsKeywordModalOpen(false);
  };

  // Negative Keyword Handlers
  const openAddNegModal = () => {
    setNegModalMode("add");
    setEditingNegId(null);
    setNegText("");
    setNegMatchType("Phrase");
    setNegReason("");
    setNegIsActive(true);
    setIsNegModalOpen(true);
  };

  const openEditNegModal = (nk: NegativeKeywordItem) => {
    setNegModalMode("edit");
    setEditingNegId(nk.id);
    setNegText(nk.keyword || "");
    setNegMatchType(nk.matchType || "Phrase");
    setNegReason(nk.reason || "");
    setNegIsActive(nk.isActive !== undefined ? Boolean(nk.isActive) : true);
    setIsNegModalOpen(true);
  };

  const handleDeleteNeg = (id: string) => {
    setNegativeKeywords((prev) => prev.filter((nk) => nk.id !== id));
  };

  const handleToggleNegActive = (id: string) => {
    setNegativeKeywords((prev) =>
      prev.map((nk) => (nk.id === id ? { ...nk, isActive: !nk.isActive } : nk))
    );
  };

  const handleSaveNegItem = () => {
    const trimmed = negText.trim();
    if (!trimmed) {
      setError("Negative Keyword is required.");
      return;
    }

    if (negModalMode === "add") {
      const newNeg: NegativeKeywordItem = {
        id: `nkw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        keyword: trimmed,
        matchType: negMatchType,
        reason: negReason.trim() || undefined,
        isActive: negIsActive
      };
      setNegativeKeywords((prev) => [...prev, newNeg]);
    } else {
      setNegativeKeywords((prev) =>
        prev.map((nk) =>
          nk.id === editingNegId
            ? {
                ...nk,
                keyword: trimmed,
                matchType: negMatchType,
                reason: negReason.trim() || undefined,
                isActive: negIsActive
              }
            : nk
        )
      );
    }
    setIsNegModalOpen(false);
  };

  // Business FAQs & Key Information Handlers
  const openAddFaqModal = () => {
    setFaqModalMode("add");
    setEditingFaqId(null);
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqCategory("");
    setFaqRelatedProduct("");
    setFaqRelatedService("");
    setFaqRelatedLocation("");
    setFaqKeywords([]);
    setFaqKeywordInput("");
    setFaqIsActive(true);
    setFaqInternalNotes("");
    setIsFaqModalOpen(true);
  };

  const openEditFaqModal = (faq: BusinessFaqItem) => {
    setFaqModalMode("edit");
    setEditingFaqId(faq.id);
    setFaqQuestion(faq.question || "");
    setFaqAnswer(faq.answer || "");
    setFaqCategory(faq.category || "");
    setFaqRelatedProduct(faq.relatedProduct || "");
    setFaqRelatedService(faq.relatedService || "");
    setFaqRelatedLocation(faq.relatedLocation || "");
    setFaqKeywords(Array.isArray(faq.keywords) ? faq.keywords : []);
    setFaqKeywordInput("");
    setFaqIsActive(faq.isActive !== undefined ? Boolean(faq.isActive) : true);
    setFaqInternalNotes(faq.internalNotes || "");
    setIsFaqModalOpen(true);
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const handleToggleFaqActive = (id: string) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f))
    );
  };

  const handleAddFaqKeyword = () => {
    const val = faqKeywordInput.trim();
    if (val && !faqKeywords.includes(val)) {
      setFaqKeywords((prev) => [...prev, val]);
      setFaqKeywordInput("");
    }
  };

  const handleRemoveFaqKeyword = (kw: string) => {
    setFaqKeywords((prev) => prev.filter((item) => item !== kw));
  };

  const handleSaveFaqItem = () => {
    const trimmedQ = faqQuestion.trim();
    if (!trimmedQ) {
      setError("FAQ Question is required.");
      return;
    }
    const trimmedA = faqAnswer.trim();
    if (!trimmedA) {
      setError("FAQ Answer is required.");
      return;
    }

    let finalKeywords = [...faqKeywords];
    if (faqKeywordInput.trim() && !finalKeywords.includes(faqKeywordInput.trim())) {
      finalKeywords.push(faqKeywordInput.trim());
    }

    if (faqModalMode === "add") {
      const newFaq: BusinessFaqItem = {
        id: `faq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        question: trimmedQ,
        answer: trimmedA,
        category: faqCategory.trim() || undefined,
        relatedProduct: faqRelatedProduct.trim() || undefined,
        relatedService: faqRelatedService.trim() || undefined,
        relatedLocation: faqRelatedLocation.trim() || undefined,
        keywords: finalKeywords,
        isActive: faqIsActive,
        internalNotes: faqInternalNotes.trim() || undefined
      };
      setFaqs((prev) => [...prev, newFaq]);
    } else {
      setFaqs((prev) =>
        prev.map((f) =>
          f.id === editingFaqId
            ? {
                ...f,
                question: trimmedQ,
                answer: trimmedA,
                category: faqCategory.trim() || undefined,
                relatedProduct: faqRelatedProduct.trim() || undefined,
                relatedService: faqRelatedService.trim() || undefined,
                relatedLocation: faqRelatedLocation.trim() || undefined,
                keywords: finalKeywords,
                isActive: faqIsActive,
                internalNotes: faqInternalNotes.trim() || undefined
              }
            : f
        )
      );
    }
    setIsFaqModalOpen(false);
  };

  // Save / Approve Profile Handler
  const handleSaveProfile = async (approve = false) => {
    const cleanCid = customerId.replace(/-/g, "").trim();
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    setIsSaving(true);
    setError(null);
    setSaveSuccessMsg(null);

    const payload = {
      customerId: cleanCid,
      businessName: businessName.trim() || undefined,
      legalBusinessName: legalBusinessName.trim() || undefined,
      industry: industry.trim() || undefined,
      businessCategory: businessCategory.trim() || undefined,
      businessDescription: businessDescription.trim() || undefined,
      targetAudience: targetAudience.trim() || undefined,
      customerType: customerType.trim() || undefined,
      businessModel: businessModel.trim() || undefined,
      businessEmail: businessEmail.trim() || undefined,
      businessPhone: businessPhone.trim() || undefined,
      whatsappNumber: whatsappNumber.trim() || undefined,
      businessAddress: businessAddress.trim() || undefined,
      serviceAreas,
      languagesServed,
      primaryWebsite: primaryWebsite.trim() || undefined,
      additionalWebsites,
      youtubeLinks,
      products,
      services,
      targetAudiences,
      customerPersonas,
      locationRecords,
      conversionGoals,
      brandProfile: {
        brandName: brandName.trim() || undefined,
        brandTagline: brandTagline.trim() || undefined,
        brandDescription: brandDescription.trim() || undefined,
        brandWebsite: brandWebsite.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        brandColors,
        brandKeywords,
        brandVoice,
        preferredCta: preferredCta.trim() || undefined,
        preferredMessaging: preferredMessaging.trim() || undefined,
        brandUsps,
        wordsToPrefer,
        wordsToAvoid,
        advertisingDos,
        advertisingDonts,
        promotionalStyle: promotionalStyle.trim() || undefined,
        discountRules: discountRules.trim() || undefined,
        priceRules: priceRules.trim() || undefined,
        additionalNotes: brandAdditionalNotes.trim() || undefined
      },
      competitors,
      seoKeywords,
      negativeKeywords,
      faqs,
      aiSuggestions,
      mediaAssets,
      keyOfferings,
      locations,
      hasMerchantAccount,
      merchantCenterId: hasMerchantAccount ? merchantCenterId.trim() || undefined : undefined,
      merchantDetails: hasMerchantAccount ? { storeName: merchantStoreName.trim() } : undefined,
      hasAppAccount,
      appDetails: hasAppAccount ? appDetails : [],
      billingStatus: billingStatus.trim() || "ACTIVE",
      googleTagId: googleTagId.trim() || undefined,
      isApproved: approve
    };

    try {
      const res = await fetch(`${BACKEND}/api/ads/customer-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      setIsApproved(approve);
      setSaveSuccessMsg(
        approve
          ? "Profile approved! Business intelligence is now active for AI Guided Campaign Creation."
          : "Draft profile saved successfully."
      );
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Sync / Query Google Merchant Center accounts via Content API
  const handleSyncMerchantAccounts = async () => {
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    setIsSyncingMerchant(true);
    setMerchantSyncMsg(null);

    try {
      const res = await fetch(`${BACKEND}/api/ads/merchant-accounts?orgId=${encodeURIComponent(orgId)}`, {
        headers: { "x-organization-id": orgId }
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to query Google Merchant Center accounts");
      }

      const accounts = data.accounts || [];
      if (accounts.length > 0) {
        const first = accounts[0];
        setHasMerchantAccount(true);
        setMerchantCenterId(first.merchantId);
        setMerchantStoreName(first.name || "");
        setMerchantSyncMsg({
          type: "success",
          text: `Found ${accounts.length} Google Merchant Center account(s)! Populated ID ${first.merchantId} (${first.name}).`
        });
      } else {
        setMerchantSyncMsg({
          type: "info",
          text: "Google is connected, but no Merchant Center accounts were found for this Google login. You can create one at merchants.google.com or enter your ID manually."
        });
      }
    } catch (err: any) {
      setMerchantSyncMsg({
        type: "error",
        text: err.message || "Failed to detect Merchant Center accounts."
      });
    } finally {
      setIsSyncingMerchant(false);
    }
  };

  // Sync / Query connected mobile apps via Google Ads API & Database
  const handleSyncConnectedApps = async () => {
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    setIsSyncingApps(true);
    setAppSyncMsg(null);

    try {
      const res = await fetch(`${BACKEND}/api/ads/connected-apps?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(customerId)}`, {
        headers: { "x-organization-id": orgId }
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to query connected apps");
      }

      const apps = data.apps || [];
      if (apps.length > 0) {
        setHasAppAccount(true);
        // Merge with existing apps, avoiding duplicate appIds
        setAppDetails((prev) => {
          const existingIds = new Set(prev.map((a) => a.appId.toLowerCase()));
          const newOnes = apps.filter((a: any) => !existingIds.has(a.appId.toLowerCase()));
          return [...prev, ...newOnes];
        });
        setAppSyncMsg({
          type: "success",
          text: `Successfully discovered ${apps.length} connected app(s)! Displayed in your app library below.`
        });
      } else {
        setAppSyncMsg({
          type: "info",
          text: "Google is connected, but no mobile app assets or campaigns were found in this account. You can register your Google Play package ID or App Store ID below."
        });
      }
    } catch (err: any) {
      setAppSyncMsg({
        type: "error",
        text: err.message || "Failed to detect connected apps."
      });
    } finally {
      setIsSyncingApps(false);
    }
  };

  // Disconnect Google Merchant Center
  const [isDisconnectingMerchant, setIsDisconnectingMerchant] = useState(false);
  const handleDisconnectMerchant = async () => {
    if (!confirm("Are you sure you want to disconnect Google Merchant Center from this account?")) return;
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    setIsDisconnectingMerchant(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/customer-profile/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({ customerId, type: "merchant" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disconnect Merchant Center");

      setHasMerchantAccount(false);
      setMerchantCenterId("");
      setMerchantStoreName("");
      setMerchantSyncMsg({
        type: "info",
        text: "Google Merchant Center has been disconnected from this profile."
      });
      setTimeout(() => setMerchantSyncMsg(null), 5000);
    } catch (err: any) {
      setMerchantSyncMsg({
        type: "error",
        text: err.message || "Failed to disconnect Merchant Center."
      });
    } finally {
      setIsDisconnectingMerchant(false);
    }
  };

  // Disconnect Google Mobile Apps
  const [isDisconnectingApps, setIsDisconnectingApps] = useState(false);
  const handleDisconnectApps = async () => {
    if (!confirm("Are you sure you want to disconnect all linked Mobile Apps from this account?")) return;
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    setIsDisconnectingApps(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/customer-profile/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({ customerId, type: "apps" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disconnect Mobile Apps");

      setHasAppAccount(false);
      setAppDetails([]);
      setAppSyncMsg({
        type: "info",
        text: "Mobile Apps have been disconnected from this profile."
      });
      setTimeout(() => setAppSyncMsg(null), 5000);
    } catch (err: any) {
      setAppSyncMsg({
        type: "error",
        text: err.message || "Failed to disconnect Mobile Apps."
      });
    } finally {
      setIsDisconnectingApps(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/60 via-white to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Business &amp; Marketing Profile
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wide">
                  ID: {profile?.formattedCustomerId || customerId}
                </span>
                {isApproved ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3" /> Approved &amp; Synced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    Draft / In Review
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Customer-scoped credentials, websites, AI marketing intelligence &amp; app links
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/80 flex items-center gap-1 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1.5" />
            Identity &amp; Account
          </button>

          <button
            onClick={() => setActiveTab("business")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "business"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-blue-600" />
            Business Intelligence
          </button>

          <button
            onClick={() => setActiveTab("products_services")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "products_services"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package className="w-3.5 h-3.5 inline mr-1.5 text-indigo-600" />
            Products &amp; Services ({products.length + services.length})
          </button>

          <button
            onClick={() => setActiveTab("target_audience")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "target_audience"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5 inline mr-1.5 text-purple-600" />
            Target Audience &amp; Personas ({targetAudiences.length + customerPersonas.length})
          </button>

          <button
            onClick={() => setActiveTab("locations")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "locations"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-blue-600" />
            Locations &amp; Service Areas ({locationRecords.length})
          </button>

          <button
            onClick={() => setActiveTab("conversion_goals")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "conversion_goals"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Target className="w-3.5 h-3.5 inline mr-1.5 text-blue-600" />
            Conversion Goals ({conversionGoals.length})
          </button>

          <button
            onClick={() => setActiveTab("brand_profile")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "brand_profile"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Palette className="w-3.5 h-3.5 inline mr-1.5 text-indigo-600" />
            Brand Profile
          </button>

          <button
            onClick={() => setActiveTab("competitors")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "competitors"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Swords className="w-3.5 h-3.5 inline mr-1.5 text-rose-600" />
            Competitor Intelligence ({competitors.length})
          </button>

          <button
            onClick={() => setActiveTab("seo_keywords")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "seo_keywords"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="w-3.5 h-3.5 inline mr-1.5 text-indigo-600" />
            SEO &amp; Keywords ({seoKeywords.length + negativeKeywords.length})
          </button>

          <button
            onClick={() => setActiveTab("faqs")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "faqs"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 inline mr-1.5 text-blue-600" />
            FAQs &amp; Key Info ({faqs.length})
          </button>

          <button
            onClick={() => setActiveTab("ai_suggestions")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "ai_suggestions"
                ? "border-purple-600 text-purple-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-purple-600" />
            AI Suggestions ({aiSuggestions.filter((s) => !s.applied && !s.rejected).length})
          </button>

          <button
            onClick={() => setActiveTab("websites")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "websites"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe className="w-3.5 h-3.5 inline mr-1.5" />
            Websites &amp; Sub-Pages ({totalWebsitesCount}/15)
          </button>

          <button
            onClick={() => setActiveTab("merchant_apps")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "merchant_apps"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 inline mr-1.5 text-emerald-600" />
            Merchant &amp; Apps
          </button>

          <button
            onClick={() => setActiveTab("media_assets")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "media_assets"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 inline mr-1.5 text-blue-600" />
            Media &amp; Creative Assets ({mediaAssets.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Notifications */}
          {saveSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 font-semibold">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-600">Loading Business &amp; Marketing Profile…</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & GOOGLE ADS ACCOUNT DETAILS */}
              {activeTab === "overview" && profile && (
                <div className="space-y-6">
                  {/* Google Ads Account Health & Compliance (Client-friendly with admin diagnostics) */}
                  <GoogleAdsAccountHealthSection
                    customerId={customerId}
                    orgId={orgId}
                    primaryWebsite={primaryWebsite}
                    onNavigateToBusinessProfile={() => setActiveTab("business")}
                    userRole={profile.userRole}
                  />

                  {/* Account Identity Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-slate-900 truncate">
                          {profile.accountName || businessName || profile.businessName}
                        </span>
                        {profile.isManager && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Manager (MCC)
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            profile.status === "ENABLED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-slate-200 text-slate-700 border border-slate-300"
                          }`}
                        >
                          {profile.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                        <span>Customer ID: {profile.formattedCustomerId}</span>
                        <button
                          onClick={() => copyToClipboard(profile.customerId, "cid")}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                          title="Copy Customer ID"
                        >
                          {copiedField === "cid" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-right shadow-2xs">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Currency</span>
                        <span className="text-xs font-bold text-slate-800">{profile.currencyCode}</span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-right shadow-2xs">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Timezone</span>
                        <span className="text-xs font-bold text-slate-800">{profile.timeZone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Common Business Details */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Organization Credentials
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-[11px] text-slate-400">Organization</span>
                          <span className="font-semibold text-slate-800">{profile.organizationName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-[11px] text-slate-400">Team Member / Role</span>
                          <span className="font-semibold text-slate-800">
                            {profile.userName} ({profile.userRole})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-[11px] text-slate-400">Email Address</span>
                          <span className="font-semibold text-slate-800">{profile.userEmail || "—"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-[11px] text-slate-400">Connected GMB Location</span>
                          <span className="font-semibold text-slate-800">{profile.locationName || "None Linked"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Isolation Notice */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-900 space-y-1">
                      <p className="font-bold">Strict Customer Isolation Active</p>
                      <p className="text-blue-800/80 leading-relaxed text-[11px]">
                        This Business &amp; Marketing Profile is strictly scoped to Customer ID{" "}
                        <strong className="font-mono">{profile.formattedCustomerId}</strong>. Marketing copy,
                        websites, sub-pages, products, and campaign intelligence will never leak across different accounts.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BUSINESS & MARKETING INTELLIGENCE (EDITABLE) */}
              {activeTab === "business" && (
                <div className="space-y-6">
                  {/* 1. Business Information Card */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Business Information</h3>
                        <p className="text-[11px] text-slate-500">Customer-scoped legal identity, categories, and contact details.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Business Name</label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Acme Agency"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Legal Business Name</label>
                        <input
                          type="text"
                          value={legalBusinessName}
                          onChange={(e) => setLegalBusinessName(e.target.value)}
                          placeholder="e.g. Acme Innovations Private Limited"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Industry</label>
                        <input
                          type="text"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          placeholder="e.g. Technology, Healthcare, Retail"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Business Category</label>
                        <input
                          type="text"
                          value={businessCategory}
                          onChange={(e) => setBusinessCategory(e.target.value)}
                          placeholder="e.g. B2B Enterprise Software, Dental Clinic"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Customer Type</label>
                        <select
                          value={customerType}
                          onChange={(e) => setCustomerType(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold bg-white"
                        >
                          <option value="B2B">B2B (Business to Business)</option>
                          <option value="B2C">B2C (Business to Consumer)</option>
                          <option value="Both">Both (B2B &amp; B2C)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Business Model</label>
                        <select
                          value={businessModel}
                          onChange={(e) => setBusinessModel(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold bg-white"
                        >
                          <option value="Product">Product</option>
                          <option value="Service">Service</option>
                          <option value="E-commerce">E-commerce</option>
                          <option value="SaaS">SaaS</option>
                          <option value="Local Business">Local Business</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Account Billing Status</span>
                          <span className="text-[10px] text-slate-400 font-normal">Google Ads Status</span>
                        </label>
                        <select
                          value={billingStatus}
                          onChange={(e) => setBillingStatus(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold bg-white"
                        >
                          <option value="ACTIVE">ACTIVE (Good Standing)</option>
                          <option value="PENDING_BILLING_INFO">PENDING_BILLING_INFO (Setup Required)</option>
                          <option value="BILLING_HOLD">BILLING_HOLD (Payment Pending)</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Google Tag ID (gtag.js / Conversion Tag)</span>
                          <span className="text-[10px] text-slate-400 font-normal">e.g. AW-123456789</span>
                        </label>
                        <input
                          type="text"
                          value={googleTagId}
                          onChange={(e) => setGoogleTagId(e.target.value)}
                          placeholder="AW-XXXXXXXXX or GT-XXXXXXX"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>Business Email</span>
                        </label>
                        <input
                          type="email"
                          value={businessEmail}
                          onChange={(e) => setBusinessEmail(e.target.value)}
                          placeholder="contact@company.com"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Business Phone</span>
                        </label>
                        <input
                          type="tel"
                          value={businessPhone}
                          onChange={(e) => setBusinessPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                          <span>WhatsApp Number</span>
                        </label>
                        <input
                          type="tel"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Business Address</span>
                        </label>
                        <textarea
                          rows={2}
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          placeholder="Street Address, Building, City, State, ZIP Code, Country"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-medium"
                        />
                      </div>
                    </div>

                    {/* Service Areas & Languages Served */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      {/* Service Areas */}
                      <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            <span>Service Areas ({serviceAreas.length})</span>
                          </span>
                        </label>
                        <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                          {serviceAreas.map((area, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs"
                            >
                              {area}
                              <button
                                type="button"
                                onClick={() => setServiceAreas((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          <input
                            type="text"
                            value={newServiceAreaInput}
                            onChange={(e) => setNewServiceAreaInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newServiceAreaInput.trim()) {
                                e.preventDefault();
                                setServiceAreas((prev) => [...prev, newServiceAreaInput.trim()]);
                                setNewServiceAreaInput("");
                              }
                            }}
                            placeholder="Add area (e.g. Mumbai)..."
                            className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newServiceAreaInput.trim()) {
                                setServiceAreas((prev) => [...prev, newServiceAreaInput.trim()]);
                                setNewServiceAreaInput("");
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Languages Served */}
                      <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Languages className="w-3.5 h-3.5 text-blue-600" />
                            <span>Languages Served ({languagesServed.length})</span>
                          </span>
                        </label>
                        <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                          {languagesServed.map((lang, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs"
                            >
                              {lang}
                              <button
                                type="button"
                                onClick={() => setLanguagesServed((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          <input
                            type="text"
                            value={newLanguageServedInput}
                            onChange={(e) => setNewLanguageServedInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newLanguageServedInput.trim()) {
                                e.preventDefault();
                                setLanguagesServed((prev) => [...prev, newLanguageServedInput.trim()]);
                                setNewLanguageServedInput("");
                              }
                            }}
                            placeholder="Add language (e.g. English)..."
                            className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newLanguageServedInput.trim()) {
                                setLanguagesServed((prev) => [...prev, newLanguageServedInput.trim()]);
                                setNewLanguageServedInput("");
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* YouTube Channel & Video Links */}
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Youtube className="w-4 h-4 text-red-600" />
                          <span>YouTube Links ({youtubeLinks.length})</span>
                          <span className="text-[10px] font-normal text-slate-500">
                            (Channels, Videos, or Shorts for video ads &amp; reach)
                          </span>
                        </label>
                        {youtubeLinks.length > 0 && (
                          <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                            {youtubeLinks.length} {youtubeLinks.length === 1 ? "Link" : "Links"} connected
                          </span>
                        )}
                      </div>

                      {youtubeLinks.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          {youtubeLinks.map((link, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:bg-slate-100/60 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Youtube className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-slate-800 hover:text-red-600 truncate hover:underline flex items-center gap-1"
                                >
                                  <span>{link}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                </a>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveYoutubeLink(link)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Remove YouTube link"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic py-0.5">
                          No YouTube links added yet. Enter your YouTube channel or video link below, or auto-extract with website screening.
                        </p>
                      )}

                      <div className="space-y-1">
                        <div className="flex gap-1.5">
                          <input
                            type="url"
                            value={newYoutubeInput}
                            onChange={(e) => {
                              setNewYoutubeInput(e.target.value);
                              if (youtubeInputError) setYoutubeInputError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddYoutubeLink();
                              }
                            }}
                            placeholder="https://youtube.com/@yourchannel or https://youtu.be/..."
                            className={`flex-1 px-3 py-1.5 text-xs rounded-xl border bg-white font-mono ${
                              youtubeInputError ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-red-500"
                            } focus:outline-none`}
                          />
                          <button
                            type="button"
                            onClick={handleAddYoutubeLink}
                            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1.5 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Link</span>
                          </button>
                        </div>
                        {youtubeInputError && (
                          <p className="text-[11px] text-rose-600 font-medium px-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {youtubeInputError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Brand & Market Intelligence Card */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Brand &amp; Market Intelligence</h3>
                        <p className="text-[11px] text-slate-500">Core offerings, audience persona, and campaign prefill data.</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Business Description</label>
                      <textarea
                        rows={3}
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                        placeholder="1-2 concise sentences summarizing your brand, offerings, and value..."
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Target Audience &amp; Buyer Persona</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("target_audience")}
                          className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Manage Master ({targetAudiences.length + customerPersonas.length})</span> &rarr;
                        </button>
                      </label>
                      <textarea
                        rows={2}
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="e.g. Fitness enthusiasts, trail runners, and everyday comfort seekers..."
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                  {/* Tag Groups: Products, Services, Key Offerings, Locations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    {/* Products */}
                    <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>Core Products ({products.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("products_services");
                            setPsSubTab("products");
                          }}
                          className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Master</span> &rarr;
                        </button>
                      </label>
                      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                        {products.map((p, idx) => {
                          const name = typeof p === "string" ? p : p.name;
                          const id = typeof p === "string" ? `idx-${idx}` : p.id;
                          return (
                            <span
                              key={id || idx}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs"
                            >
                              <span>{name}</span>
                              <button
                                type="button"
                                onClick={() => setProducts((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={newProductInput}
                          onChange={(e) => setNewProductInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newProductInput.trim()) {
                              e.preventDefault();
                              const curr = profile?.currencyCode || "INR";
                              setProducts((prev) => [
                                ...prev,
                                {
                                  id: `prod-${Date.now()}`,
                                  name: newProductInput.trim(),
                                  currency: curr,
                                  isActive: true
                                }
                              ]);
                              setNewProductInput("");
                            }
                          }}
                          placeholder="Add quick product..."
                          className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newProductInput.trim()) {
                              const curr = profile?.currencyCode || "INR";
                              setProducts((prev) => [
                                ...prev,
                                {
                                  id: `prod-${Date.now()}`,
                                  name: newProductInput.trim(),
                                  currency: curr,
                                  isActive: true
                                }
                              ]);
                              setNewProductInput("");
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>Services ({services.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("products_services");
                            setPsSubTab("services");
                          }}
                          className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Master</span> &rarr;
                        </button>
                      </label>
                      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                        {services.map((s, idx) => {
                          const name = typeof s === "string" ? s : s.name;
                          const id = typeof s === "string" ? `idx-${idx}` : s.id;
                          return (
                            <span
                              key={id || idx}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs"
                            >
                              <span>{name}</span>
                              <button
                                type="button"
                                onClick={() => setServices((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={newServiceInput}
                          onChange={(e) => setNewServiceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newServiceInput.trim()) {
                              e.preventDefault();
                              const curr = profile?.currencyCode || "INR";
                              setServices((prev) => [
                                ...prev,
                                {
                                  id: `serv-${Date.now()}`,
                                  name: newServiceInput.trim(),
                                  currency: curr,
                                  isActive: true
                                }
                              ]);
                              setNewServiceInput("");
                            }
                          }}
                          placeholder="Add quick service..."
                          className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newServiceInput.trim()) {
                              const curr = profile?.currencyCode || "INR";
                              setServices((prev) => [
                                ...prev,
                                {
                                  id: `serv-${Date.now()}`,
                                  name: newServiceInput.trim(),
                                  currency: curr,
                                  isActive: true
                                }
                              ]);
                              setNewServiceInput("");
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Key Offerings / USPs */}
                    <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>Key Offerings &amp; USPs ({keyOfferings.length})</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                        {keyOfferings.map((k, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs"
                          >
                            {k}
                            <button
                              type="button"
                              onClick={() => setKeyOfferings((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={newOfferingInput}
                          onChange={(e) => setNewOfferingInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newOfferingInput.trim()) {
                              e.preventDefault();
                              setKeyOfferings((prev) => [...prev, newOfferingInput.trim()]);
                              setNewOfferingInput("");
                            }
                          }}
                          placeholder="Add key offering..."
                          className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newOfferingInput.trim()) {
                              setKeyOfferings((prev) => [...prev, newOfferingInput.trim()]);
                              setNewOfferingInput("");
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Target Locations */}
                    <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>Target Locations ({locations.length})</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("locations")}
                          className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Manage Master ({locationRecords.length})</span> &rarr;
                        </button>
                      </label>
                      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                        {locations.map((loc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs"
                          >
                            <MapPin className="w-3 h-3 text-blue-600" />
                            {loc}
                            <button
                              type="button"
                              onClick={() => setLocations((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={newLocationInput}
                          onChange={(e) => setNewLocationInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newLocationInput.trim()) {
                              e.preventDefault();
                              setLocations((prev) => [...prev, newLocationInput.trim()]);
                              setNewLocationInput("");
                            }
                          }}
                          placeholder="Add location (e.g. India, Pune)..."
                          className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newLocationInput.trim()) {
                              setLocations((prev) => [...prev, newLocationInput.trim()]);
                              setNewLocationInput("");
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRODUCTS & SERVICES MASTER */}
            {activeTab === "products_services" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Products &amp; Services Master</h3>
                    <p className="text-[11px] text-slate-500">
                      Customer-scoped reusable product &amp; service catalog for targeted ad campaigns, AI headlines, and ad copy.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {psSubTab === "products" ? (
                      <button
                        type="button"
                        onClick={openAddProductModal}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-500/20 inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Product</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={openAddServiceModal}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-500/20 inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Service</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-tabs switcher */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPsSubTab("products")}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      psSubTab === "products"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>Products</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        psSubTab === "products"
                          ? "bg-slate-800 text-slate-200"
                          : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {products.length} ({products.filter((p) => p.isActive).length} active)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPsSubTab("services")}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      psSubTab === "services"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>Services</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        psSubTab === "services"
                          ? "bg-slate-800 text-slate-200"
                          : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {services.length} ({services.filter((s) => s.isActive).length} active)
                    </span>
                  </button>
                </div>

                {/* PRODUCTS TAB CONTENT */}
                {psSubTab === "products" && products.length === 0 && (
                  <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-3">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">No Products in Catalog</p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        Add your physical or digital products with pricing, features, benefits, and URLs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openAddProductModal}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Product</span>
                    </button>
                  </div>
                )}

                {psSubTab === "products" && products.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          prod.isActive
                            ? "bg-white border-slate-200 shadow-2xs hover:shadow-xs"
                            : "bg-slate-50/70 border-slate-200/80 opacity-75"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{prod.name}</h4>
                              {prod.category && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                  {prod.category}
                                </span>
                              )}
                            </div>
                            {(prod.price || prod.productUrl) && (
                              <div className="flex items-center gap-2 text-[11px] text-slate-600 flex-wrap">
                                {prod.price && (
                                  <span className="font-bold text-slate-900">
                                    {prod.currency || profile?.currencyCode || "INR"} {prod.price}
                                  </span>
                                )}
                                {prod.price && prod.productUrl && <span>•</span>}
                                {prod.productUrl && (
                                  <a
                                    href={prod.productUrl.startsWith("http") ? prod.productUrl : `https://${prod.productUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center gap-1 truncate max-w-[160px]"
                                  >
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{prod.productUrl}</span>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleProductActive(prod.id)}
                            className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              prod.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                            }`}
                            title={prod.isActive ? "Click to disable" : "Click to enable"}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                prod.isActive ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            <span>{prod.isActive ? "Active" : "Inactive"}</span>
                          </button>
                        </div>

                        {prod.description && (
                          <p className="text-[11px] text-slate-600 mb-2.5 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>
                        )}

                        {(prod.usp || prod.targetAudience) && (
                          <div className="space-y-1 mb-2.5 text-[11px] p-2 rounded-xl bg-slate-50 border border-slate-150">
                            {prod.usp && (
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-bold text-slate-700 shrink-0">USP:</span>
                                <span className="text-slate-600 italic truncate">{prod.usp}</span>
                              </div>
                            )}
                            {prod.targetAudience && (
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-bold text-slate-700 shrink-0">Audience:</span>
                                <span className="text-slate-600 truncate">{prod.targetAudience}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Features & Benefits tags */}
                        {((prod.features && prod.features.length > 0) ||
                          (prod.benefits && prod.benefits.length > 0)) && (
                          <div className="space-y-1 mb-2.5">
                            {prod.features && prod.features.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                                  Features:
                                </span>
                                {prod.features.map((feat, fIdx) => (
                                  <span
                                    key={fIdx}
                                    className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100"
                                  >
                                    {feat}
                                  </span>
                                ))}
                              </div>
                            )}
                            {prod.benefits && prod.benefits.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                                  Benefits:
                                </span>
                                {prod.benefits.map((ben, bIdx) => (
                                  <span
                                    key={ben + bIdx}
                                    className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-100"
                                  >
                                    {ben}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Card Footer Actions */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => handleToggleProductActive(prod.id)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Power className="w-3 h-3" />
                            <span>{prod.isActive ? "Disable" : "Enable"}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditProductModal(prod)}
                              className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SERVICES TAB CONTENT */}
                {psSubTab === "services" && services.length === 0 && (
                  <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-3">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">No Services in Catalog</p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        Add your consulting, professional, or digital services with pricing, features, benefits, and URLs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openAddServiceModal}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Service</span>
                    </button>
                  </div>
                )}

                {psSubTab === "services" && services.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {services.map((serv) => (
                      <div
                        key={serv.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          serv.isActive
                            ? "bg-white border-slate-200 shadow-2xs hover:shadow-xs"
                            : "bg-slate-50/70 border-slate-200/80 opacity-75"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{serv.name}</h4>
                              {serv.category && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                  {serv.category}
                                </span>
                              )}
                            </div>
                            {(serv.price || serv.serviceUrl) && (
                              <div className="flex items-center gap-2 text-[11px] text-slate-600 flex-wrap">
                                {serv.price && (
                                  <span className="font-bold text-slate-900">
                                    {serv.currency || profile?.currencyCode || "INR"} {serv.price}
                                  </span>
                                )}
                                {serv.price && serv.serviceUrl && <span>•</span>}
                                {serv.serviceUrl && (
                                  <a
                                    href={serv.serviceUrl.startsWith("http") ? serv.serviceUrl : `https://${serv.serviceUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center gap-1 truncate max-w-[160px]"
                                  >
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{serv.serviceUrl}</span>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleServiceActive(serv.id)}
                            className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              serv.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                            }`}
                            title={serv.isActive ? "Click to disable" : "Click to enable"}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                serv.isActive ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            <span>{serv.isActive ? "Active" : "Inactive"}</span>
                          </button>
                        </div>

                        {serv.description && (
                          <p className="text-[11px] text-slate-600 mb-2.5 line-clamp-2 leading-relaxed">
                            {serv.description}
                          </p>
                        )}

                        {(serv.usp || serv.targetAudience) && (
                          <div className="space-y-1 mb-2.5 text-[11px] p-2 rounded-xl bg-slate-50 border border-slate-150">
                            {serv.usp && (
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-bold text-slate-700 shrink-0">USP:</span>
                                <span className="text-slate-600 italic truncate">{serv.usp}</span>
                              </div>
                            )}
                            {serv.targetAudience && (
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-bold text-slate-700 shrink-0">Audience:</span>
                                <span className="text-slate-600 truncate">{serv.targetAudience}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Features & Benefits tags */}
                        {((serv.features && serv.features.length > 0) ||
                          (serv.benefits && serv.benefits.length > 0)) && (
                          <div className="space-y-1 mb-2.5">
                            {serv.features && serv.features.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                                  Features:
                                </span>
                                {serv.features.map((feat, fIdx) => (
                                  <span
                                    key={fIdx}
                                    className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100"
                                  >
                                    {feat}
                                  </span>
                                ))}
                              </div>
                            )}
                            {serv.benefits && serv.benefits.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                                  Benefits:
                                </span>
                                {serv.benefits.map((ben, bIdx) => (
                                  <span
                                    key={ben + bIdx}
                                    className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-100"
                                  >
                                    {ben}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Card Footer Actions */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => handleToggleServiceActive(serv.id)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Power className="w-3 h-3" />
                            <span>{serv.isActive ? "Disable" : "Enable"}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditServiceModal(serv)}
                              className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Edit Service"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(serv.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADD / EDIT PRODUCT OR SERVICE MODAL */}
            {isPsModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-fadeIn">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {psModalMode === "add"
                            ? `Add New ${psModalType === "product" ? "Product" : "Service"}`
                            : `Edit ${psModalType === "product" ? "Product" : "Service"}`}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Define catalog details to use across Google Ads campaigns and AI generation.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPsModalOpen(false)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700">
                          {psModalType === "product" ? "Product Name" : "Service Name"}{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={psFormName}
                          onChange={(e) => setPsFormName(e.target.value)}
                          placeholder={
                            psModalType === "product"
                              ? "e.g. Ergonomic Office Chair Pro"
                              : "e.g. Full-Stack Web Development"
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Category</label>
                        <input
                          type="text"
                          value={psFormCategory}
                          onChange={(e) => setPsFormCategory(e.target.value)}
                          placeholder="e.g. Furniture, SaaS, Consulting"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">
                          {psModalType === "product" ? "Product URL" : "Service URL"}
                        </label>
                        <input
                          type="text"
                          value={psFormUrl}
                          onChange={(e) => setPsFormUrl(e.target.value)}
                          placeholder="https://example.com/item"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Price</label>
                        <input
                          type="text"
                          value={psFormPrice}
                          onChange={(e) => setPsFormPrice(e.target.value)}
                          placeholder="e.g. 1999 or 49.99"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Currency</label>
                        <select
                          value={psFormCurrency}
                          onChange={(e) => setPsFormCurrency(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="AED">AED (د.إ)</option>
                          <option value="AUD">AUD (A$)</option>
                          <option value="CAD">CAD (C$)</option>
                          <option value="SGD">SGD (S$)</option>
                          {profile?.currencyCode &&
                            !["INR", "USD", "EUR", "GBP", "AED", "AUD", "CAD", "SGD"].includes(
                              profile.currencyCode
                            ) && <option value={profile.currencyCode}>{profile.currencyCode}</option>}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Description</label>
                      <textarea
                        rows={2}
                        value={psFormDescription}
                        onChange={(e) => setPsFormDescription(e.target.value)}
                        placeholder="Detailed description of the product or service..."
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Unique Selling Proposition (USP)</label>
                        <input
                          type="text"
                          value={psFormUsp}
                          onChange={(e) => setPsFormUsp(e.target.value)}
                          placeholder="e.g. 10-year warranty, Lifetime free support"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Target Audience</label>
                        <input
                          type="text"
                          value={psFormTargetAudience}
                          onChange={(e) => setPsFormTargetAudience(e.target.value)}
                          placeholder="e.g. Remote professionals, IT startups"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Features ({psFormFeatures.length})</label>
                      <div className="flex flex-wrap gap-1.5 mb-1.5 min-h-[28px]">
                        {psFormFeatures.map((feat, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold"
                          >
                            <span>{feat}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(idx)}
                              className="text-blue-400 hover:text-rose-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={psTempFeature}
                          onChange={(e) => setPsTempFeature(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddFeature();
                            }
                          }}
                          placeholder="Type a key feature and press Enter or Add..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={handleAddFeature}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Benefits ({psFormBenefits.length})</label>
                      <div className="flex flex-wrap gap-1.5 mb-1.5 min-h-[28px]">
                        {psFormBenefits.map((ben, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold"
                          >
                            <span>{ben}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBenefit(idx)}
                              className="text-emerald-400 hover:text-rose-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={psTempBenefit}
                          onChange={(e) => setPsTempBenefit(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddBenefit();
                            }
                          }}
                          placeholder="Type a key customer benefit and press Enter or Add..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={handleAddBenefit}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <label className="text-xs font-bold text-slate-800">Active in Campaigns</label>
                        <p className="text-[11px] text-slate-500">
                          Only active items will be recommended for campaign generation and ad extensions.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPsFormIsActive(!psFormIsActive)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          psFormIsActive
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{psFormIsActive ? "Active" : "Inactive"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsPsModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePsItem}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 cursor-pointer"
                    >
                      {psModalMode === "add"
                        ? `Save ${psModalType === "product" ? "Product" : "Service"}`
                        : "Update Item"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TARGET AUDIENCE & CUSTOMER PERSONAS */}
            {activeTab === "target_audience" && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <h2 className="text-sm font-bold text-slate-900">Target Audience &amp; Customer Personas</h2>
                      </div>
                      <p className="text-xs text-slate-500">
                        Customer-scoped audience segments and buyer personas to guide Google Ads targeting, audience signals, and campaign resonance.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {tapSubTab === "audiences" ? (
                        <button
                          type="button"
                          onClick={openAddAudienceModal}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-purple-500/20 inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Target Audience</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={openAddPersonaModal}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-purple-500/20 inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Customer Persona</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sub-tabs switcher */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTapSubTab("audiences")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        tapSubTab === "audiences"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>Target Audiences</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          tapSubTab === "audiences"
                            ? "bg-slate-800 text-slate-200"
                            : "bg-white text-slate-700 border border-slate-200"
                        }`}
                      >
                        {targetAudiences.length} ({targetAudiences.filter((a) => a.isActive).length} active)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTapSubTab("personas")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        tapSubTab === "personas"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>Customer Personas</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          tapSubTab === "personas"
                            ? "bg-slate-800 text-slate-200"
                            : "bg-white text-slate-700 border border-slate-200"
                        }`}
                      >
                        {customerPersonas.length} ({customerPersonas.filter((p) => p.isActive).length} active)
                      </span>
                    </button>
                  </div>

                  {/* TARGET AUDIENCES VIEW */}
                  {tapSubTab === "audiences" && targetAudiences.length === 0 && (
                    <div className="py-14 text-center border border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">No Target Audiences Defined</p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Create targeted demographic segments with pain points, buying intent, and location targeting to power Google Ads campaigns.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={openAddAudienceModal}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Your First Audience</span>
                      </button>
                    </div>
                  )}

                  {tapSubTab === "audiences" && targetAudiences.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {targetAudiences.map((aud) => (
                        <div
                          key={aud.id}
                          className={`p-5 rounded-2xl border transition-all space-y-4 ${
                            aud.isActive
                              ? "bg-white border-slate-200 hover:border-purple-300 shadow-2xs"
                              : "bg-slate-50/60 border-slate-200 opacity-60"
                          }`}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xs font-bold text-slate-900 truncate">{aud.name}</h3>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    aud.isActive
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-slate-100 text-slate-500 border border-slate-200"
                                  }`}
                                >
                                  {aud.isActive ? "Active" : "Inactive"}
                                </span>
                                {aud.customerType && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    {aud.customerType}
                                  </span>
                                )}
                                {aud.gender && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                    {aud.gender}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleAudienceActive(aud.id)}
                                title={aud.isActive ? "Disable Audience" : "Enable Audience"}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  aud.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                }`}
                              >
                                <Power className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditAudienceModal(aud)}
                                title="Edit Audience"
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAudience(aud.id)}
                                title="Delete Audience"
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Demographics Bar */}
                          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-600">
                            {aud.ageRange && (
                              <span className="px-2 py-1 rounded-lg bg-slate-100 font-semibold">
                                Age: {aud.ageRange}
                              </span>
                            )}
                            {aud.buyingIntent && (
                              <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                                Intent: {aud.buyingIntent}
                              </span>
                            )}
                            {aud.purchaseBehavior && (
                              <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
                                Behavior: {aud.purchaseBehavior}
                              </span>
                            )}
                          </div>

                          {/* Chips: Locations & Languages */}
                          {((aud.locations && aud.locations.length > 0) || (aud.languages && aud.languages.length > 0)) && (
                            <div className="space-y-1.5 pt-1 border-t border-slate-100 text-[11px]">
                              {aud.locations && aud.locations.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  {aud.locations.map((loc, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                      {loc}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {aud.languages && aud.languages.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Languages className="w-3 h-3 text-slate-400 shrink-0" />
                                  {aud.languages.map((lng, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                      {lng}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Interests, Pain Points, Needs */}
                          <div className="space-y-2 pt-1 border-t border-slate-100 text-[11px]">
                            {aud.interests && aud.interests.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interests</span>
                                <div className="flex flex-wrap gap-1">
                                  {aud.interests.map((it, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-medium">
                                      {it}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {aud.painPoints && aud.painPoints.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pain Points</span>
                                <div className="flex flex-wrap gap-1">
                                  {aud.painPoints.map((pp, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-medium">
                                      {pp}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {aud.needs && aud.needs.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Needs &amp; Desires</span>
                                <div className="flex flex-wrap gap-1">
                                  {aud.needs.map((nd, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-medium">
                                      {nd}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {aud.additionalNotes && (
                              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl">
                                {aud.additionalNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CUSTOMER PERSONAS VIEW */}
                  {tapSubTab === "personas" && customerPersonas.length === 0 && (
                    <div className="py-14 text-center border border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">No Customer Personas Created</p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Create detailed customer personas including occupation, goals, preferred offerings, and purchase habits to craft hyper-relevant ad copies.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={openAddPersonaModal}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Your First Persona</span>
                      </button>
                    </div>
                  )}

                  {tapSubTab === "personas" && customerPersonas.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customerPersonas.map((per) => (
                        <div
                          key={per.id}
                          className={`p-5 rounded-2xl border transition-all space-y-4 ${
                            per.isActive
                              ? "bg-white border-slate-200 hover:border-indigo-300 shadow-2xs"
                              : "bg-slate-50/60 border-slate-200 opacity-60"
                          }`}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xs font-bold text-slate-900 truncate">{per.name}</h3>
                                {per.occupation && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    {per.occupation}
                                  </span>
                                )}
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    per.isActive
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-slate-100 text-slate-500 border border-slate-200"
                                  }`}
                                >
                                  {per.isActive ? "Active" : "Inactive"}
                                </span>
                                {per.customerType && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    {per.customerType}
                                  </span>
                                )}
                                {per.gender && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {per.gender}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleTogglePersonaActive(per.id)}
                                title={per.isActive ? "Disable Persona" : "Enable Persona"}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  per.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                }`}
                              >
                                <Power className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditPersonaModal(per)}
                                title="Edit Persona"
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePersona(per.id)}
                                title="Delete Persona"
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Short Description */}
                          {per.shortDescription && (
                            <p className="text-xs text-slate-600 bg-slate-50/90 p-2.5 rounded-xl leading-relaxed">
                              {per.shortDescription}
                            </p>
                          )}

                          {/* Demographics Bar */}
                          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-600">
                            {per.ageRange && (
                              <span className="px-2 py-1 rounded-lg bg-slate-100 font-semibold">
                                Age: {per.ageRange}
                              </span>
                            )}
                            {per.buyingIntent && (
                              <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                                Intent: {per.buyingIntent}
                              </span>
                            )}
                            {per.purchaseBehavior && (
                              <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
                                Behavior: {per.purchaseBehavior}
                              </span>
                            )}
                          </div>

                          {/* Preferred Products & Services */}
                          {per.preferredOfferings && per.preferredOfferings.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px]">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preferred Products / Services</span>
                              <div className="flex flex-wrap gap-1">
                                {per.preferredOfferings.map((off, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold">
                                    {off}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Locations & Languages */}
                          {((per.locations && per.locations.length > 0) || (per.languages && per.languages.length > 0)) && (
                            <div className="space-y-1.5 pt-1 border-t border-slate-100 text-[11px]">
                              {per.locations && per.locations.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  {per.locations.map((loc, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                      {loc}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {per.languages && per.languages.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Languages className="w-3 h-3 text-slate-400 shrink-0" />
                                  {per.languages.map((lng, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                      {lng}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Interests, Pain Points, Needs / Goals */}
                          <div className="space-y-2 pt-1 border-t border-slate-100 text-[11px]">
                            {per.interests && per.interests.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interests</span>
                                <div className="flex flex-wrap gap-1">
                                  {per.interests.map((it, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-medium">
                                      {it}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {per.painPoints && per.painPoints.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pain Points</span>
                                <div className="flex flex-wrap gap-1">
                                  {per.painPoints.map((pp, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-medium">
                                      {pp}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {per.needs && per.needs.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Needs &amp; Goals</span>
                                <div className="flex flex-wrap gap-1">
                                  {per.needs.map((nd, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-medium">
                                      {nd}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {per.additionalNotes && (
                              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl">
                                {per.additionalNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TARGET AUDIENCE & PERSONAS ADD/EDIT MODAL */}
            {isTapModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {tapModalMode === "add"
                            ? tapModalType === "audience"
                              ? "Add Target Audience"
                              : "Add Customer Persona"
                            : tapModalType === "audience"
                            ? "Edit Target Audience"
                            : "Edit Customer Persona"}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Configure customer segment details to power automated campaign targeting.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTapModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                    {tapModalType === "audience" ? (
                      /* AUDIENCE FORM (13 Fields) */
                      <div className="space-y-4">
                        {/* Name & Active Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-slate-700">
                              Audience Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={audName}
                              onChange={(e) => setAudName(e.target.value)}
                              placeholder="e.g. Growth Marketing Directors in India"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Status</label>
                            <button
                              type="button"
                              onClick={() => setAudIsActive(!audIsActive)}
                              className={`w-full py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                audIsActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : "bg-slate-100 text-slate-600 border-slate-300"
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>{audIsActive ? "Active" : "Inactive"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Demographics: Age Range, Gender, Customer Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Age Range</label>
                            <input
                              type="text"
                              value={audAgeRange}
                              onChange={(e) => setAudAgeRange(e.target.value)}
                              placeholder="e.g. 25-45 or 18-35"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Gender</label>
                            <select
                              value={audGender}
                              onChange={(e) => setAudGender(e.target.value as any)}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
                            >
                              <option value="All">All Genders</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Customer Type</label>
                            <select
                              value={audCustomerType}
                              onChange={(e) => setAudCustomerType(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
                            >
                              <option value="Both">Both (B2B &amp; B2C)</option>
                              <option value="B2B">B2B (Business)</option>
                              <option value="B2C">B2C (Consumer)</option>
                            </select>
                          </div>
                        </div>

                        {/* Buying Intent & Purchase Behavior */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Buying Intent</label>
                            <input
                              type="text"
                              value={audBuyingIntent}
                              onChange={(e) => setAudBuyingIntent(e.target.value)}
                              placeholder="e.g. High Intent, Comparing Solutions, Ready to buy"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Purchase Behavior</label>
                            <input
                              type="text"
                              value={audPurchaseBehavior}
                              onChange={(e) => setAudPurchaseBehavior(e.target.value)}
                              placeholder="e.g. Price-conscious, Quality-driven, Fast turnaround"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        {/* Locations Chip Manager */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Target Locations</label>
                          <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-xl bg-slate-50 border border-slate-200">
                            {audLocations.map((loc, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold"
                              >
                                <span>{loc}</span>
                                <button
                                  type="button"
                                  onClick={() => setAudLocations((prev) => prev.filter((_, i) => i !== idx))}
                                  className="text-slate-400 hover:text-rose-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                            {audLocations.length === 0 && (
                              <span className="text-slate-400 text-[11px]">No specific locations added</span>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={audTempLocation}
                              onChange={(e) => setAudTempLocation(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && audTempLocation.trim()) {
                                  e.preventDefault();
                                  setAudLocations((prev) => [...prev, audTempLocation.trim()]);
                                  setAudTempLocation("");
                                }
                              }}
                              placeholder="Add location (e.g. Mumbai, California, Pan-India)..."
                              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (audTempLocation.trim()) {
                                  setAudLocations((prev) => [...prev, audTempLocation.trim()]);
                                  setAudTempLocation("");
                                }
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Languages Chip Manager */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Languages</label>
                          <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-xl bg-slate-50 border border-slate-200">
                            {audLanguages.map((lng, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold"
                              >
                                <span>{lng}</span>
                                <button
                                  type="button"
                                  onClick={() => setAudLanguages((prev) => prev.filter((_, i) => i !== idx))}
                                  className="text-slate-400 hover:text-rose-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                            {audLanguages.length === 0 && (
                              <span className="text-slate-400 text-[11px]">No languages added</span>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={audTempLanguage}
                              onChange={(e) => setAudTempLanguage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && audTempLanguage.trim()) {
                                  e.preventDefault();
                                  setAudLanguages((prev) => [...prev, audTempLanguage.trim()]);
                                  setAudTempLanguage("");
                                }
                              }}
                              placeholder="Add language (e.g. English, Hindi, Spanish)..."
                              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (audTempLanguage.trim()) {
                                  setAudLanguages((prev) => [...prev, audTempLanguage.trim()]);
                                  setAudTempLanguage("");
                                }
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Interests Chip Manager */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Interests &amp; Affinities</label>
                          <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-xl bg-purple-50/50 border border-purple-100">
                            {audInterests.map((it, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-purple-200 text-purple-800 text-[11px] font-semibold"
                              >
                                <span>{it}</span>
                                <button
                                  type="button"
                                  onClick={() => setAudInterests((prev) => prev.filter((_, i) => i !== idx))}
                                  className="text-slate-400 hover:text-rose-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                            {audInterests.length === 0 && (
                              <span className="text-slate-400 text-[11px]">No interests added</span>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={audTempInterest}
                              onChange={(e) => setAudTempInterest(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && audTempInterest.trim()) {
                                  e.preventDefault();
                                  setAudInterests((prev) => [...prev, audTempInterest.trim()]);
                                  setAudTempInterest("");
                                }
                              }}
                              placeholder="Add interest (e.g. Digital Marketing, SaaS tools, E-commerce)..."
                              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (audTempInterest.trim()) {
                                  setAudInterests((prev) => [...prev, audTempInterest.trim()]);
                                  setAudTempInterest("");
                                }
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-600 text-white cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Pain Points Chip Manager */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Pain Points</label>
                          <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-xl bg-rose-50/50 border border-rose-100">
                            {audPainPoints.map((pp, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-rose-200 text-rose-800 text-[11px] font-semibold"
                              >
                                <span>{pp}</span>
                                <button
                                  type="button"
                                  onClick={() => setAudPainPoints((prev) => prev.filter((_, i) => i !== idx))}
                                  className="text-slate-400 hover:text-rose-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                            {audPainPoints.length === 0 && (
                              <span className="text-slate-400 text-[11px]">No pain points added</span>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={audTempPainPoint}
                              onChange={(e) => setAudTempPainPoint(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && audTempPainPoint.trim()) {
                                  e.preventDefault();
                                  setAudPainPoints((prev) => [...prev, audTempPainPoint.trim()]);
                                  setAudTempPainPoint("");
                                }
                              }}
                              placeholder="Add pain point (e.g. Low ROI on ads, slow support)..."
                              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (audTempPainPoint.trim()) {
                                  setAudPainPoints((prev) => [...prev, audTempPainPoint.trim()]);
                                  setAudTempPainPoint("");
                                }
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 text-white cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Needs & Desires Chip Manager */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Needs &amp; Desired Outcomes</label>
                          <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-xl bg-emerald-50/50 border border-emerald-100">
                            {audNeeds.map((nd, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-[11px] font-semibold"
                              >
                                <span>{nd}</span>
                                <button
                                  type="button"
                                  onClick={() => setAudNeeds((prev) => prev.filter((_, i) => i !== idx))}
                                  className="text-slate-400 hover:text-rose-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                            {audNeeds.length === 0 && (
                              <span className="text-slate-400 text-[11px]">No needs added</span>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={audTempNeed}
                              onChange={(e) => setAudTempNeed(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && audTempNeed.trim()) {
                                  e.preventDefault();
                                  setAudNeeds((prev) => [...prev, audTempNeed.trim()]);
                                  setAudTempNeed("");
                                }
                              }}
                              placeholder="Add need (e.g. Automated reporting, fast lead follow-up)..."
                              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (audTempNeed.trim()) {
                                  setAudNeeds((prev) => [...prev, audTempNeed.trim()]);
                                  setAudTempNeed("");
                                }
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Additional Notes</label>
                          <textarea
                            rows={2}
                            value={audAdditionalNotes}
                            onChange={(e) => setAudAdditionalNotes(e.target.value)}
                            placeholder="Any context, seasonality, or specialized segment instructions..."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    ) : (
                      /* PERSONA FORM (16 Fields) */
                      <div className="space-y-4">
                        {/* Name, Occupation & Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">
                              Persona Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={perName}
                              onChange={(e) => setPerName(e.target.value)}
                              placeholder="e.g. Growth Marketing Maya"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Occupation / Role</label>
                            <input
                              type="text"
                              value={perOccupation}
                              onChange={(e) => setPerOccupation(e.target.value)}
                              placeholder="e.g. VP of Marketing, Small Business Owner"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Status</label>
                            <button
                              type="button"
                              onClick={() => setPerIsActive(!perIsActive)}
                              className={`w-full py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                perIsActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : "bg-slate-100 text-slate-600 border-slate-300"
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>{perIsActive ? "Active" : "Inactive"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Short Description */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Short Description</label>
                          <textarea
                            rows={2}
                            value={perShortDescription}
                            onChange={(e) => setPerShortDescription(e.target.value)}
                            placeholder="Brief persona overview: background, daily responsibilities, and key decision-making criteria..."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        {/* Demographics: Age Range, Gender, Customer Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Age Range</label>
                            <input
                              type="text"
                              value={perAgeRange}
                              onChange={(e) => setPerAgeRange(e.target.value)}
                              placeholder="e.g. 28-40"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Gender</label>
                            <select
                              value={perGender}
                              onChange={(e) => setPerGender(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
                            >
                              <option value="All">All Genders</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Customer Type</label>
                            <select
                              value={perCustomerType}
                              onChange={(e) => setPerCustomerType(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
                            >
                              <option value="Both">Both (B2B &amp; B2C)</option>
                              <option value="B2B">B2B (Business)</option>
                              <option value="B2C">B2C (Consumer)</option>
                            </select>
                          </div>
                        </div>

                        {/* Buying Intent & Purchase Behavior */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Buying Intent</label>
                            <input
                              type="text"
                              value={perBuyingIntent}
                              onChange={(e) => setPerBuyingIntent(e.target.value)}
                              placeholder="e.g. Comparing tools, Budget approved, Exploring"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Purchase Behavior</label>
                            <input
                              type="text"
                              value={perPurchaseBehavior}
                              onChange={(e) => setPerPurchaseBehavior(e.target.value)}
                              placeholder="e.g. Consults team, Prefers annual billing, Values free trial"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        {/* Preferred Offerings Chip Manager */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Preferred Products &amp; Services</label>
                          <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-xl bg-blue-50/50 border border-blue-100">
                            {perPreferredOfferings.map((off, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-blue-200 text-blue-800 text-[11px] font-semibold"
                              >
                                <span>{off}</span>
                                <button
                                  type="button"
                                  onClick={() => setPerPreferredOfferings((prev) => prev.filter((_, i) => i !== idx))}
                                  className="text-slate-400 hover:text-rose-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                            {perPreferredOfferings.length === 0 && (
                              <span className="text-slate-400 text-[11px]">No offerings tagged</span>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={perTempOffering}
                              onChange={(e) => setPerTempOffering(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && perTempOffering.trim()) {
                                  e.preventDefault();
                                  setPerPreferredOfferings((prev) => [...prev, perTempOffering.trim()]);
                                  setPerTempOffering("");
                                }
                              }}
                              placeholder="Add offering (e.g. Growth Engine Pro, Performance Max Management)..."
                              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (perTempOffering.trim()) {
                                  setPerPreferredOfferings((prev) => [...prev, perTempOffering.trim()]);
                                  setPerTempOffering("");
                                }
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Locations & Languages Chips */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Locations</label>
                            <div className="flex flex-wrap gap-1 min-h-[28px] p-2 rounded-xl bg-slate-50 border border-slate-200">
                              {perLocations.map((loc, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold">
                                  <span>{loc}</span>
                                  <button type="button" onClick={() => setPerLocations((prev) => prev.filter((_, i) => i !== idx))}><X className="w-2.5 h-2.5" /></button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={perTempLocation}
                                onChange={(e) => setPerTempLocation(e.target.value)}
                                placeholder="Add location..."
                                className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (perTempLocation.trim()) {
                                    setPerLocations((prev) => [...prev, perTempLocation.trim()]);
                                    setPerTempLocation("");
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 text-white"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Languages</label>
                            <div className="flex flex-wrap gap-1 min-h-[28px] p-2 rounded-xl bg-slate-50 border border-slate-200">
                              {perLanguages.map((lng, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold">
                                  <span>{lng}</span>
                                  <button type="button" onClick={() => setPerLanguages((prev) => prev.filter((_, i) => i !== idx))}><X className="w-2.5 h-2.5" /></button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={perTempLanguage}
                                onChange={(e) => setPerTempLanguage(e.target.value)}
                                placeholder="Add language..."
                                className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (perTempLanguage.trim()) {
                                    setPerLanguages((prev) => [...prev, perTempLanguage.trim()]);
                                    setPerTempLanguage("");
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 text-white"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Interests, Pain Points, Needs / Goals */}
                        <div className="space-y-3">
                          {/* Interests */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Interests</label>
                            <div className="flex flex-wrap gap-1 min-h-[28px] p-2 rounded-xl bg-purple-50/50 border border-purple-100">
                              {perInterests.map((it, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-purple-200 text-purple-700 text-[10px] font-semibold">
                                  <span>{it}</span>
                                  <button type="button" onClick={() => setPerInterests((prev) => prev.filter((_, i) => i !== idx))}><X className="w-2.5 h-2.5" /></button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={perTempInterest}
                                onChange={(e) => setPerTempInterest(e.target.value)}
                                placeholder="Add interest..."
                                className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (perTempInterest.trim()) {
                                    setPerInterests((prev) => [...prev, perTempInterest.trim()]);
                                    setPerTempInterest("");
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-600 text-white"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Pain Points */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Pain Points</label>
                            <div className="flex flex-wrap gap-1 min-h-[28px] p-2 rounded-xl bg-rose-50/50 border border-rose-100">
                              {perPainPoints.map((pp, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-rose-200 text-rose-700 text-[10px] font-semibold">
                                  <span>{pp}</span>
                                  <button type="button" onClick={() => setPerPainPoints((prev) => prev.filter((_, i) => i !== idx))}><X className="w-2.5 h-2.5" /></button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={perTempPainPoint}
                                onChange={(e) => setPerTempPainPoint(e.target.value)}
                                placeholder="Add pain point..."
                                className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (perTempPainPoint.trim()) {
                                    setPerPainPoints((prev) => [...prev, perTempPainPoint.trim()]);
                                    setPerTempPainPoint("");
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Needs / Goals */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Needs &amp; Goals</label>
                            <div className="flex flex-wrap gap-1 min-h-[28px] p-2 rounded-xl bg-emerald-50/50 border border-emerald-100">
                              {perNeeds.map((nd, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                                  <span>{nd}</span>
                                  <button type="button" onClick={() => setPerNeeds((prev) => prev.filter((_, i) => i !== idx))}><X className="w-2.5 h-2.5" /></button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={perTempNeed}
                                onChange={(e) => setPerTempNeed(e.target.value)}
                                placeholder="Add need or goal..."
                                className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (perTempNeed.trim()) {
                                    setPerNeeds((prev) => [...prev, perTempNeed.trim()]);
                                    setPerTempNeed("");
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Additional Notes</label>
                          <textarea
                            rows={2}
                            value={perAdditionalNotes}
                            onChange={(e) => setPerAdditionalNotes(e.target.value)}
                            placeholder="Additional nuances, tone preferences, or persona attributes..."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsTapModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveTapItem}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-500/20 cursor-pointer"
                    >
                      {tapModalMode === "add"
                        ? `Save ${tapModalType === "audience" ? "Audience" : "Persona"}`
                        : `Update ${tapModalType === "audience" ? "Audience" : "Persona"}`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: LOCATIONS & SERVICE AREAS MASTER */}
            {activeTab === "locations" && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>Locations &amp; Service Areas Master</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Customer-scoped locations, headquarters, retail branches, and target service areas.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {locationRecords.length} ({locationRecords.filter((l) => l.isActive).length} active)
                    </span>
                    <button
                      type="button"
                      onClick={openAddLocationModal}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-500/20 inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Location</span>
                    </button>
                  </div>
                </div>

                {locationRecords.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">No Locations Configured</h4>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Add headquarters, branches, retail stores, or service radius areas to build reusable location records.
                    </p>
                    <button
                      type="button"
                      onClick={openAddLocationModal}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Location</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {locationRecords.map((loc) => {
                      const typeBadgeStyles = {
                        Headquarters: "bg-purple-100 text-purple-800 border-purple-200",
                        Branch: "bg-blue-100 text-blue-800 border-blue-200",
                        Store: "bg-emerald-100 text-emerald-800 border-emerald-200",
                        "Service Area": "bg-amber-100 text-amber-800 border-amber-200"
                      }[loc.locationType] || "bg-slate-100 text-slate-800 border-slate-200";

                      return (
                        <div
                          key={loc.id}
                          className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                            loc.isActive
                              ? "bg-white border-slate-200 shadow-2xs hover:border-slate-300"
                              : "bg-slate-50/70 border-slate-200/60 opacity-75"
                          }`}
                        >
                          {/* Card Top */}
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${typeBadgeStyles}`}>
                                {loc.locationType}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                  loc.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                }`}
                              >
                                {loc.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleLocationActive(loc.id)}
                                className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                                  loc.isActive
                                    ? "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                                    : "text-slate-400 hover:bg-slate-100 border-slate-200"
                                }`}
                                title={loc.isActive ? "Deactivate" : "Activate"}
                              >
                                <Power className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditLocationModal(loc)}
                                className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                                title="Edit Location"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLocation(loc.id)}
                                className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete Location"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Name & Geographic info */}
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug">{loc.locationName}</h4>
                            <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5">
                              <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="font-semibold">
                                {[loc.city, loc.state, loc.country].filter(Boolean).join(", ")}
                              </span>
                              {loc.pincode && <span className="text-slate-400 font-mono text-[10px]">({loc.pincode})</span>}
                            </div>
                            {loc.areaLocality && (
                              <p className="text-[10px] text-slate-500 font-medium pl-4">
                                Locality: {loc.areaLocality}
                              </p>
                            )}
                          </div>

                          {/* Full Address */}
                          {loc.fullAddress && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg leading-relaxed">
                              {loc.fullAddress}
                            </p>
                          )}

                          {/* Coordinates & Radius */}
                          {((loc.latitude && loc.longitude) || loc.radius) && (
                            <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-600">
                              {loc.latitude && loc.longitude && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[9px]">
                                  Lat: {loc.latitude}, Lng: {loc.longitude}
                                </span>
                              )}
                              {loc.radius && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-[9px]">
                                  Radius: {loc.radius}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Languages */}
                          {loc.languages && loc.languages.length > 0 && (
                            <div className="space-y-0.5 pt-1 border-t border-slate-100 text-[10px]">
                              <div className="flex items-center gap-1 flex-wrap">
                                <Languages className="w-3 h-3 text-slate-400 shrink-0" />
                                {loc.languages.map((lng, i) => (
                                  <span key={i} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[9px] font-semibold">
                                    {lng}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Additional Notes */}
                          {loc.additionalNotes && (
                            <p className="text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded-lg">
                              {loc.additionalNotes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LOCATIONS & SERVICE AREAS ADD/EDIT MODAL */}
            {isLocModalOpen && (
              <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3">
                <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-fadeIn">
                  {/* Modal Header */}
                  <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          {locModalMode === "add" ? "Add Location & Service Area" : "Edit Location & Service Area"}
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          Configure customer business location or service area coverage.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLocModalOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
                    {/* Row 1: Name, Type, Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-1 space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Location Name *</label>
                        <input
                          type="text"
                          value={locName}
                          onChange={(e) => setLocName(e.target.value)}
                          placeholder="e.g. Pune Tech Hub"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Location Type</label>
                        <select
                          value={locType}
                          onChange={(e) => setLocType(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="Headquarters">Headquarters</option>
                          <option value="Branch">Branch</option>
                          <option value="Store">Store</option>
                          <option value="Service Area">Service Area</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Status</label>
                        <button
                          type="button"
                          onClick={() => setLocIsActive(!locIsActive)}
                          className={`w-full py-1.5 px-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            locIsActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : "bg-slate-100 text-slate-600 border-slate-300"
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{locIsActive ? "Active" : "Inactive"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Row 2: City, State, Country */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">City *</label>
                        <input
                          type="text"
                          value={locCity}
                          onChange={(e) => setLocCity(e.target.value)}
                          placeholder="e.g. Mumbai"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">State / Region</label>
                        <input
                          type="text"
                          value={locState}
                          onChange={(e) => setLocState(e.target.value)}
                          placeholder="e.g. Maharashtra"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Country</label>
                        <input
                          type="text"
                          value={locCountry}
                          onChange={(e) => setLocCountry(e.target.value)}
                          placeholder="e.g. India"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Row 3: Area, Pincode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Area / Locality</label>
                        <input
                          type="text"
                          value={locAreaLocality}
                          onChange={(e) => setLocAreaLocality(e.target.value)}
                          placeholder="e.g. Baner, Bandra West"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Pincode / Postal Code</label>
                        <input
                          type="text"
                          value={locPincode}
                          onChange={(e) => setLocPincode(e.target.value)}
                          placeholder="e.g. 411045"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Row 4: Full Address */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Full Address</label>
                      <textarea
                        rows={2}
                        value={locFullAddress}
                        onChange={(e) => setLocFullAddress(e.target.value)}
                        placeholder="Complete street address, landmark, building..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>

                    {/* Row 5: Coordinates & Radius */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Latitude</label>
                        <input
                          type="text"
                          value={locLatitude}
                          onChange={(e) => setLocLatitude(e.target.value)}
                          placeholder="e.g. 18.5204"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Longitude</label>
                        <input
                          type="text"
                          value={locLongitude}
                          onChange={(e) => setLocLongitude(e.target.value)}
                          placeholder="e.g. 73.8567"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Service Radius</label>
                        <input
                          type="text"
                          value={locRadius}
                          onChange={(e) => setLocRadius(e.target.value)}
                          placeholder="e.g. 25 km"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Row 6: Languages */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Languages Served</label>
                      <div className="flex flex-wrap gap-1 min-h-[28px] p-1.5 rounded-xl bg-slate-50 border border-slate-200">
                        {locLanguages.map((lng, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold">
                            <span>{lng}</span>
                            <button
                              type="button"
                              onClick={() => setLocLanguages((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={locTempLanguage}
                          onChange={(e) => setLocTempLanguage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && locTempLanguage.trim()) {
                              e.preventDefault();
                              if (!locLanguages.includes(locTempLanguage.trim())) {
                                setLocLanguages((prev) => [...prev, locTempLanguage.trim()]);
                              }
                              setLocTempLanguage("");
                            }
                          }}
                          placeholder="Add language..."
                          className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (locTempLanguage.trim()) {
                              if (!locLanguages.includes(locTempLanguage.trim())) {
                                setLocLanguages((prev) => [...prev, locTempLanguage.trim()]);
                              }
                              setLocTempLanguage("");
                            }
                          }}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Row 7: Additional Notes */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Additional Notes</label>
                      <textarea
                        rows={2}
                        value={locAdditionalNotes}
                        onChange={(e) => setLocAdditionalNotes(e.target.value)}
                        placeholder="Operating hours, regional nuances..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLocModalOpen(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveLocationItem}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 cursor-pointer"
                    >
                      {locModalMode === "add" ? "Save Location" : "Update Location"}
                    </button>
                  </div>
                </div>
              </div>
            )}

              {/* TAB CONTENT: CONVERSION GOALS MASTER */}
              {activeTab === "conversion_goals" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                          <Target className="w-4 h-4" />
                        </span>
                        <h3 className="text-xs font-bold text-slate-900">Conversion Goals Master</h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Configure customer-scoped reusable conversion goals (e.g. Website Purchase, Lead Form, Phone Call, WhatsApp, Bookings) to configure Google Ads conversion tracking and bidding.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openAddGoalModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Conversion Goal</span>
                    </button>
                  </div>

                  {/* Empty state */}
                  {conversionGoals.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                        <Target className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-700">No Conversion Goals Added Yet</h4>
                      <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                        Add primary and secondary conversion goals such as Website Purchases, Lead Forms, WhatsApp inquiries, or Phone Calls to streamline campaign tracking.
                      </p>
                      <button
                        type="button"
                        onClick={openAddGoalModal}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Conversion Goal</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {conversionGoals.map((goal) => (
                        <div
                          key={goal.id}
                          className={`p-3.5 rounded-2xl border transition-all space-y-3 ${
                            goal.isActive
                              ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                              : "bg-slate-50/60 border-slate-200/60 opacity-75"
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                  goal.isPrimary
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                    : "bg-slate-100 text-slate-600 border border-slate-200/60"
                                }`}
                              >
                                {goal.isPrimary ? "Primary Goal" : "Secondary Goal"}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                                {goal.conversionType}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleGoalActive(goal.id)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  goal.isActive
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                }`}
                                title={goal.isActive ? "Click to Deactivate" : "Click to Activate"}
                              >
                                {goal.isActive ? "Active" : "Inactive"}
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditGoalModal(goal)}
                                className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                                title="Edit Goal"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                                title="Delete Goal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Goal Name & Source */}
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug">{goal.goalName}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                              <span className="font-medium text-[11px]">Source:</span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold text-[10px]">
                                {goal.source}
                              </span>
                              {(goal.conversionValue !== undefined && goal.conversionValue !== null && String(goal.conversionValue).trim() !== "") && (
                                <span className="ml-auto font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                                  {goal.currency || "INR"} {goal.conversionValue}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          {goal.description && (
                            <p className="text-[11px] text-slate-600 bg-slate-50/90 p-2 rounded-xl leading-relaxed">
                              {goal.description}
                            </p>
                          )}

                          {/* Additional Notes */}
                          {goal.additionalNotes && (
                            <p className="text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded-lg">
                              Notes: {goal.additionalNotes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CONVERSION GOALS ADD/EDIT MODAL */}
              {isGoalModalOpen && (
                <div className="fixed inset-0 z-[280] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
                    {/* Modal Header */}
                    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Target className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {goalModalMode === "add" ? "Add Conversion Goal" : "Edit Conversion Goal"}
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Configure customer reusable conversion goal and attribution properties.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsGoalModalOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
                      {/* Goal Name & Active toggle */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Conversion Goal Name *</label>
                          <input
                            type="text"
                            value={goalName}
                            onChange={(e) => setGoalName(e.target.value)}
                            placeholder="e.g. Lead Form Submit, WhatsApp Click"
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Status</label>
                          <button
                            type="button"
                            onClick={() => setGoalIsActive(!goalIsActive)}
                            className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              goalIsActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            <span>{goalIsActive ? "Active" : "Inactive"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Conversion Type & Source */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Conversion Type</label>
                          <select
                            value={goalType}
                            onChange={(e) => setGoalType(e.target.value as ConversionType)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="Website Purchase">Website Purchase</option>
                            <option value="Lead Form">Lead Form</option>
                            <option value="Phone Call">Phone Call</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Contact">Contact</option>
                            <option value="Sign-up">Sign-up</option>
                            <option value="Booking">Booking</option>
                            <option value="App Install">App Install</option>
                            <option value="App Purchase">App Purchase</option>
                            <option value="Store Visit">Store Visit</option>
                            <option value="Get Directions">Get Directions</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Source</label>
                          <select
                            value={goalSource}
                            onChange={(e) => setGoalSource(e.target.value as ConversionSource)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="Website">Website</option>
                            <option value="Phone">Phone</option>
                            <option value="App">App</option>
                            <option value="Store">Store</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Value & Currency & Primary/Secondary */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Conversion Value</label>
                          <input
                            type="text"
                            value={goalValue}
                            onChange={(e) => setGoalValue(e.target.value)}
                            placeholder="e.g. 500 or 29.99"
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Currency</label>
                          <input
                            type="text"
                            value={goalCurrency}
                            onChange={(e) => setGoalCurrency(e.target.value)}
                            placeholder="INR, USD..."
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono uppercase"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Optimization Goal</label>
                          <div className="flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
                            <button
                              type="button"
                              onClick={() => setGoalIsPrimary(true)}
                              className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                goalIsPrimary
                                  ? "bg-white text-blue-700 shadow-2xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Primary
                            </button>
                            <button
                              type="button"
                              onClick={() => setGoalIsPrimary(false)}
                              className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                !goalIsPrimary
                                  ? "bg-white text-blue-700 shadow-2xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Secondary
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Description</label>
                        <textarea
                          rows={2}
                          value={goalDescription}
                          onChange={(e) => setGoalDescription(e.target.value)}
                          placeholder="What counts as a successful conversion for this goal?"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                        />
                      </div>

                      {/* Additional Notes */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Additional Notes</label>
                        <textarea
                          rows={2}
                          value={goalNotes}
                          onChange={(e) => setGoalNotes(e.target.value)}
                          placeholder="Tracking instructions, URL trigger rules, thank-you page path, or offline sync notes..."
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsGoalModalOpen(false)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveGoalItem}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 cursor-pointer"
                      >
                        {goalModalMode === "add" ? "Save Conversion Goal" : "Update Conversion Goal"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: BRAND PROFILE */}
              {activeTab === "brand_profile" && (
                <div className="space-y-5">
                  {/* 1. Brand Identity Card */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                        <Palette className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Brand Identity</h3>
                        <p className="text-[11px] text-slate-500">
                          Core brand identification, visual identity assets, logo URL, colors, and keywords.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Brand Name */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Brand Name</label>
                        <input
                          type="text"
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          placeholder="e.g. Acme Studio, Nike, Salesforce"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Brand Tagline */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Brand Tagline</label>
                        <input
                          type="text"
                          value={brandTagline}
                          onChange={(e) => setBrandTagline(e.target.value)}
                          placeholder="e.g. Just Do It / Innovation Simplified"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Brand Description */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Brand Description</label>
                      <textarea
                        rows={2}
                        value={brandDescription}
                        onChange={(e) => setBrandDescription(e.target.value)}
                        placeholder="Concise overview of what the brand stands for, its mission, and brand positioning..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Brand Website */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Brand Website</label>
                        <input
                          type="url"
                          value={brandWebsite}
                          onChange={(e) => setBrandWebsite(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Logo URL with preview */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Logo URL</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                          />
                          {logoUrl.trim() && (
                            <div className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={logoUrl.trim()}
                                alt="Logo preview"
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Brand Colors */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700">Brand Colors</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={brandColorInput}
                          onChange={(e) => setBrandColorInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddBrandColor();
                            }
                          }}
                          placeholder="e.g. #2563EB, Royal Blue, Gold"
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleAddBrandColor}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                        >
                          Add Color
                        </button>
                      </div>
                      {brandColors.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {brandColors.map((color, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span>{color}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveBrandColor(color)}
                                className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Brand Keywords */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700">Brand Keywords</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={brandKeywordInput}
                          onChange={(e) => setBrandKeywordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddBrandKeyword();
                            }
                          }}
                          placeholder="e.g. luxury skincare, enterprise CRM"
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddBrandKeyword}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                        >
                          Add Keyword
                        </button>
                      </div>
                      {brandKeywords.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {brandKeywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100"
                            >
                              <span>{keyword}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveBrandKeyword(keyword)}
                                className="text-blue-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Brand Voice Card */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Brand Voice &amp; Tone</h3>
                        <p className="text-[11px] text-slate-500">
                          Select tone and personality attributes that best represent how the brand communicates in Google Ads creatives.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {BRAND_VOICE_OPTIONS.map((voice) => {
                        const isSelected = brandVoice.includes(voice);
                        return (
                          <button
                            key={voice}
                            type="button"
                            onClick={() => handleToggleBrandVoice(voice)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 shrink-0" />}
                            <span>{voice}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Messaging Guidelines & Rules Card */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <MessageSquare className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Messaging Guidelines &amp; Advertising Rules</h3>
                        <p className="text-[11px] text-slate-500">
                          Define CTAs, core value propositions, pricing/discount rules, and advertising do&apos;s and don&apos;ts.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Preferred CTA */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Preferred CTA</label>
                        <input
                          type="text"
                          value={preferredCta}
                          onChange={(e) => setPreferredCta(e.target.value)}
                          placeholder="e.g. Book Free Consultation, Shop Now"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Promotional Style */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Promotional Style</label>
                        <input
                          type="text"
                          value={promotionalStyle}
                          onChange={(e) => setPromotionalStyle(e.target.value)}
                          placeholder="e.g. Value-driven / Direct Response"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Preferred Messaging */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Preferred Messaging</label>
                      <textarea
                        rows={2}
                        value={preferredMessaging}
                        onChange={(e) => setPreferredMessaging(e.target.value)}
                        placeholder="Core elevator pitch, brand slogan, or primary value proposition..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>

                    {/* Key Brand USPs */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700">Key Brand USPs</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={brandUspInput}
                          onChange={(e) => setBrandUspInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddBrandUsp();
                            }
                          }}
                          placeholder="e.g. 24/7 Support, 100% Organic"
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddBrandUsp}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                        >
                          Add USP
                        </button>
                      </div>
                      {brandUsps.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {brandUsps.map((usp, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100"
                            >
                              <span>{usp}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveBrandUsp(usp)}
                                className="text-emerald-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Words Prefer & Avoid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Prefer */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700">Words / Phrases to Prefer</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={wordPreferInput}
                            onChange={(e) => setWordPreferInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddWordToPrefer();
                              }
                            }}
                            placeholder="e.g. Certified, Authentic"
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddWordToPrefer}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        {wordsToPrefer.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {wordsToPrefer.map((w, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100"
                              >
                                <span>{w}</span>
                                <button
                                type="button"
                                onClick={() => handleRemoveWordToPrefer(w)}
                                className="text-blue-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Avoid */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700">Words / Phrases to Avoid</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={wordAvoidInput}
                            onChange={(e) => setWordAvoidInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddWordToAvoid();
                              }
                            }}
                            placeholder="e.g. Cheap, Risk-free"
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddWordToAvoid}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        {wordsToAvoid.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {wordsToAvoid.map((w, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-100"
                              >
                                <span>{w}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveWordToAvoid(w)}
                                  className="text-rose-400 hover:text-rose-700 ml-0.5 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Do's & Don'ts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Do's */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700">Advertising Do&apos;s</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={adDoInput}
                            onChange={(e) => setAdDoInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddAdDo();
                              }
                            }}
                            placeholder="e.g. Highlight ISO certification"
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddAdDo}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                          >
                            Add Do
                          </button>
                        </div>
                        {advertisingDos.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {advertisingDos.map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100"
                              >
                                <span>{item}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAdDo(item)}
                                  className="text-emerald-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Don'ts */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700">Advertising Don&apos;ts</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={adDontInput}
                            onChange={(e) => setAdDontInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddAdDont();
                              }
                            }}
                            placeholder="e.g. Do not compare with competitors directly"
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddAdDont}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                          >
                            Add Don&apos;t
                          </button>
                        </div>
                        {advertisingDonts.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {advertisingDonts.map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200"
                              >
                                <span>{item}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAdDont(item)}
                                  className="text-amber-500 hover:text-rose-700 ml-0.5 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rules */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Discount / Offer Messaging Rules</label>
                        <textarea
                          rows={2}
                          value={discountRules}
                          onChange={(e) => setDiscountRules(e.target.value)}
                          placeholder="e.g. Never advertise discounts > 25%; include 'T&C Apply'..."
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Price Messaging Rules</label>
                        <textarea
                          rows={2}
                          value={priceRules}
                          onChange={(e) => setPriceRules(e.target.value)}
                          placeholder="e.g. Always display 'Starting at ₹499'..."
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Additional Brand Notes */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Additional Brand Notes</label>
                      <textarea
                        rows={2}
                        value={brandAdditionalNotes}
                        onChange={(e) => setBrandAdditionalNotes(e.target.value)}
                        placeholder="Any additional brand voice or compliance instructions..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: COMPETITOR INTELLIGENCE */}
              {activeTab === "competitors" && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                            <Swords className="w-4 h-4" />
                          </span>
                          <h2 className="text-sm font-bold text-slate-900">Competitor Intelligence</h2>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Track and manage key competitors, their market positioning, core offerings, key USPs, and target markets to sharpen your advertising strategy.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={openAddCompModal}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Competitor</span>
                      </button>
                    </div>

                    {/* Empty state */}
                    {competitors.length === 0 ? (
                      <div className="p-10 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                          <Swords className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-700">No Competitors Added Yet</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Add direct and indirect competitors to monitor their products, services, USPs, and market positioning.
                        </p>
                        <button
                          type="button"
                          onClick={openAddCompModal}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add First Competitor</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {competitors.map((comp) => (
                          <div
                            key={comp.id}
                            className={`p-4 rounded-2xl border transition-all space-y-3.5 ${
                              comp.isActive
                                ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                                : "bg-slate-50/60 border-slate-200/60 opacity-75"
                            }`}
                          >
                            {/* Header: Status Pill, Industry Badge, Actions */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {comp.industry && (
                                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-100">
                                    {comp.industry}
                                  </span>
                                )}
                                {comp.targetMarket && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-100">
                                    {comp.targetMarket}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCompActive(comp.id)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                                    comp.isActive
                                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                  }`}
                                  title={comp.isActive ? "Click to Deactivate" : "Click to Activate"}
                                >
                                  {comp.isActive ? "Active" : "Inactive"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditCompModal(comp)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                                  title="Edit Competitor"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComp(comp.id)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                                  title="Delete Competitor"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Competitor Name & Website */}
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 leading-snug">{comp.competitorName}</h3>
                              {comp.competitorWebsite && (
                                <a
                                  href={comp.competitorWebsite.startsWith("http") ? comp.competitorWebsite : `https://${comp.competitorWebsite}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-0.5"
                                >
                                  <span>{comp.competitorWebsite.replace(/^https?:\/\//, "")}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>
                              )}
                            </div>

                            {/* Description */}
                            {comp.competitorDescription && (
                              <p className="text-xs text-slate-600 bg-slate-50/90 p-2.5 rounded-xl leading-relaxed">
                                {comp.competitorDescription}
                              </p>
                            )}

                            {/* Offerings: Products & Services */}
                            {((comp.products && comp.products.length > 0) || (comp.services && comp.services.length > 0)) && (
                              <div className="space-y-1.5 pt-1 border-t border-slate-100 text-xs">
                                {comp.products && comp.products.length > 0 && (
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Products</span>
                                    <div className="flex flex-wrap gap-1">
                                      {comp.products.map((p, idx) => (
                                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                                          {p}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {comp.services && comp.services.length > 0 && (
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Services</span>
                                    <div className="flex flex-wrap gap-1">
                                      {comp.services.map((s, idx) => (
                                        <span key={idx} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100/60">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Main USPs */}
                            {comp.mainUsps && comp.mainUsps.length > 0 && (
                              <div className="pt-1 border-t border-slate-100">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Main USPs</span>
                                <ul className="text-xs text-slate-600 space-y-0.5 pl-3 list-disc marker:text-emerald-500">
                                  {comp.mainUsps.map((usp, idx) => (
                                    <li key={idx} className="text-[11px] leading-tight">{usp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Locations */}
                            {comp.locations && comp.locations.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{comp.locations.join(", ")}</span>
                              </div>
                            )}

                            {/* Notes */}
                            {comp.competitorNotes && (
                              <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-xl border border-amber-100/60">
                                Notes: {comp.competitorNotes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* COMPETITOR ADD / EDIT MODAL */}
              {isCompModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                          <Swords className="w-5 h-5" />
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {compModalMode === "add" ? "Add Competitor" : "Edit Competitor"}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Record competitor intelligence, offerings, positioning, and USPs.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCompModalOpen(false)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(92vh-140px)]">
                      {/* Competitor Name & Website */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Competitor Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={compName}
                            onChange={(e) => setCompName(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Competitor Website</label>
                          <input
                            type="text"
                            value={compWebsite}
                            onChange={(e) => setCompWebsite(e.target.value)}
                            placeholder="e.g. https://competitor.com"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Industry & Target Market */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Industry / Category</label>
                          <input
                            type="text"
                            value={compIndustry}
                            onChange={(e) => setCompIndustry(e.target.value)}
                            placeholder="e.g. Enterprise SaaS, Logistics, Healthcare"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Target Market</label>
                          <input
                            type="text"
                            value={compTargetMarket}
                            onChange={(e) => setCompTargetMarket(e.target.value)}
                            placeholder="e.g. Mid-Market B2B, Urban Direct-to-Consumer"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Competitor Description */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Competitor Description</label>
                        <textarea
                          rows={2}
                          value={compDescription}
                          onChange={(e) => setCompDescription(e.target.value)}
                          placeholder="Brief summary of their market footprint, positioning, and scale..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                        />
                      </div>

                      {/* Products Tag Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Products</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={compProductInput}
                            onChange={(e) => setCompProductInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCompProduct();
                              }
                            }}
                            placeholder="Add competitor product and press Enter..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddCompProduct}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                        {compProducts.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {compProducts.map((p, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs"
                              >
                                <span>{p}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCompProduct(p)}
                                  className="hover:text-rose-500 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Services Tag Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Services</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={compServiceInput}
                            onChange={(e) => setCompServiceInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCompService();
                              }
                            }}
                            placeholder="Add competitor service and press Enter..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddCompService}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                        {compServices.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {compServices.map((s, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs border border-blue-100"
                              >
                                <span>{s}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCompService(s)}
                                  className="hover:text-rose-500 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Locations Tag Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Locations / Operating Areas</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={compLocationInput}
                            onChange={(e) => setCompLocationInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCompLocation();
                              }
                            }}
                            placeholder="e.g. Mumbai, North America, Pan-India..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddCompLocation}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                        {compLocations.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {compLocations.map((l, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs border border-emerald-100"
                              >
                                <span>{l}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCompLocation(l)}
                                  className="hover:text-rose-500 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Main USPs Tag Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Main USPs</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={compUspInput}
                            onChange={(e) => setCompUspInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCompUsp();
                              }
                            }}
                            placeholder="e.g. 24/7 support, Zero onboarding fee, Free delivery..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddCompUsp}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                        {compMainUsps.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {compMainUsps.map((u, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs border border-amber-100"
                              >
                                <span>{u}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCompUsp(u)}
                                  className="hover:text-rose-500 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Competitor Notes */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Competitor Notes</label>
                        <textarea
                          rows={2}
                          value={compNotes}
                          onChange={(e) => setCompNotes(e.target.value)}
                          placeholder="Any specific observations, pricing weaknesses, ad creative angles to counter..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                        />
                      </div>

                      {/* Active / Inactive Status */}
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Competitor Status</span>
                          <span className="text-[11px] text-slate-500">Enable or disable this competitor in intelligence views</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={compIsActive}
                            onChange={(e) => setCompIsActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0 bg-slate-50/50">
                      <button
                        type="button"
                        onClick={() => setIsCompModalOpen(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCompItem}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
                      >
                        {compModalMode === "add" ? "Add Competitor" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SEO & KEYWORD INTELLIGENCE */}
              {activeTab === "seo_keywords" && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                    {/* Header & Subtab Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                            <Search className="w-4 h-4" />
                          </span>
                          <h2 className="text-sm font-bold text-slate-900">SEO &amp; Keyword Intelligence</h2>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Build and manage customer-scoped target keywords, search intents, offerings alignment, and negative keyword lists.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setSeoSubTab("keywords")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              seoSubTab === "keywords"
                                ? "bg-white text-slate-800 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Target Keywords ({seoKeywords.length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSeoSubTab("negative")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              seoSubTab === "negative"
                                ? "bg-white text-slate-800 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Negative Keywords ({negativeKeywords.length})</span>
                          </button>
                        </div>

                        {seoSubTab === "keywords" ? (
                          <button
                            type="button"
                            onClick={openAddKeywordModal}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Keyword</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={openAddNegModal}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm shadow-rose-500/20 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Negative Keyword</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Subtab 1: Target Keywords */}
                    {seoSubTab === "keywords" && (
                      <div className="space-y-4">
                        {seoKeywords.length === 0 ? (
                          <div className="p-10 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                              <Search className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-700">No Target Keywords Added Yet</h3>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                              Add reusable search keywords with type classifications (Primary, Long-tail, Branded, Service, etc.) and search intents.
                            </p>
                            <button
                              type="button"
                              onClick={openAddKeywordModal}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add First Keyword</span>
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {seoKeywords.map((kw) => {
                              const typeColorMap: Record<string, string> = {
                                Primary: "bg-blue-50 text-blue-700 border-blue-100",
                                Secondary: "bg-slate-100 text-slate-700 border-slate-200",
                                "Long-tail": "bg-cyan-50 text-cyan-700 border-cyan-100",
                                Branded: "bg-purple-50 text-purple-700 border-purple-100",
                                Product: "bg-emerald-50 text-emerald-700 border-emerald-100",
                                Service: "bg-indigo-50 text-indigo-700 border-indigo-100",
                                Location: "bg-amber-50 text-amber-800 border-amber-100"
                              };

                              const intentColorMap: Record<string, string> = {
                                Commercial: "bg-emerald-50 text-emerald-700 border-emerald-100",
                                Transactional: "bg-blue-50 text-blue-700 border-blue-100",
                                Informational: "bg-amber-50 text-amber-800 border-amber-100",
                                Navigational: "bg-purple-50 text-purple-700 border-purple-100"
                              };

                              return (
                                <div
                                  key={kw.id}
                                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                                    kw.isActive
                                      ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                                      : "bg-slate-50/60 border-slate-200/60 opacity-75"
                                  }`}
                                >
                                  {/* Header: Badges & Action Buttons */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                          typeColorMap[kw.keywordType] || "bg-slate-100 text-slate-700 border-slate-200"
                                        }`}
                                      >
                                        {kw.keywordType}
                                      </span>
                                      {kw.searchIntent && (
                                        <span
                                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                            intentColorMap[kw.searchIntent] || "bg-slate-100 text-slate-700 border-slate-200"
                                          }`}
                                        >
                                          {kw.searchIntent}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleKeywordActive(kw.id)}
                                        title={kw.isActive ? "Deactivate Keyword" : "Activate Keyword"}
                                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                          kw.isActive
                                            ? "text-emerald-600 hover:bg-emerald-50"
                                            : "text-slate-400 hover:bg-slate-200"
                                        }`}
                                      >
                                        <Power className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openEditKeywordModal(kw)}
                                        title="Edit Keyword"
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteKeyword(kw.id)}
                                        title="Delete Keyword"
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Keyword Text */}
                                  <div>
                                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                                      {kw.keyword}
                                    </h3>
                                  </div>

                                  {/* Details / Alignment */}
                                  {(kw.relatedOffering || kw.targetLocation) && (
                                    <div className="space-y-1.5 pt-1">
                                      {kw.relatedOffering && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                          <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                          <span className="truncate">{kw.relatedOffering}</span>
                                        </div>
                                      )}
                                      {kw.targetLocation && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                          <span className="truncate">{kw.targetLocation}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Notes */}
                                  {kw.notes && (
                                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-3">
                                      {kw.notes}
                                    </p>
                                  )}

                                  {/* Footer Status indicator */}
                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400">Status</span>
                                    <span
                                      className={`inline-flex items-center gap-1 font-semibold ${
                                        kw.isActive ? "text-emerald-700" : "text-slate-400"
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          kw.isActive ? "bg-emerald-500" : "bg-slate-300"
                                        }`}
                                      />
                                      {kw.isActive ? "Active" : "Disabled"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Subtab 2: Negative Keywords */}
                    {seoSubTab === "negative" && (
                      <div className="space-y-4">
                        {negativeKeywords.length === 0 ? (
                          <div className="p-10 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-700">No Negative Keywords Added Yet</h3>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                              Add negative search terms with Broad, Phrase, or Exact match types to prevent ads from showing on irrelevant queries.
                            </p>
                            <button
                              type="button"
                              onClick={openAddNegModal}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add First Negative Keyword</span>
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {negativeKeywords.map((nk) => {
                              const matchBadgeMap: Record<string, string> = {
                                Exact: "bg-purple-50 text-purple-700 border-purple-100",
                                Phrase: "bg-amber-50 text-amber-800 border-amber-100",
                                Broad: "bg-sky-50 text-sky-700 border-sky-100"
                              };

                              const formattedKeywordDisplay =
                                nk.matchType === "Exact"
                                ? `[${nk.keyword}]`
                                : nk.matchType === "Phrase"
                                ? `"${nk.keyword}"`
                                : nk.keyword;

                              return (
                                <div
                                  key={nk.id}
                                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                                    nk.isActive
                                      ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                                      : "bg-slate-50/60 border-slate-200/60 opacity-75"
                                  }`}
                                >
                                  {/* Header: Match Type & Actions */}
                                  <div className="flex items-start justify-between gap-2">
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                        matchBadgeMap[nk.matchType] || "bg-slate-100 text-slate-700 border-slate-200"
                                      }`}
                                    >
                                      {nk.matchType} Match
                                    </span>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleNegActive(nk.id)}
                                        title={nk.isActive ? "Deactivate Negative Keyword" : "Activate Negative Keyword"}
                                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                          nk.isActive
                                            ? "text-emerald-600 hover:bg-emerald-50"
                                            : "text-slate-400 hover:bg-slate-200"
                                        }`}
                                      >
                                        <Power className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openEditNegModal(nk)}
                                        title="Edit Negative Keyword"
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteNeg(nk.id)}
                                        title="Delete Negative Keyword"
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Keyword Text */}
                                  <div>
                                    <h3 className="text-sm font-bold text-rose-700 font-mono tracking-tight flex items-center gap-1.5">
                                      <span className="text-xs text-rose-400 font-bold">-</span>
                                      <span>{formattedKeywordDisplay}</span>
                                    </h3>
                                  </div>

                                  {/* Reason / Notes */}
                                  {nk.reason && (
                                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-3">
                                      <span className="font-semibold text-slate-600">Reason: </span>
                                      {nk.reason}
                                    </p>
                                  )}

                                  {/* Footer Status indicator */}
                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400">Status</span>
                                    <span
                                      className={`inline-flex items-center gap-1 font-semibold ${
                                        nk.isActive ? "text-emerald-700" : "text-slate-400"
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          nk.isActive ? "bg-emerald-500" : "bg-slate-300"
                                        }`}
                                      />
                                      {nk.isActive ? "Active" : "Disabled"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TARGET KEYWORD ADD/EDIT MODAL */}
              {isKeywordModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                          <Search className="w-4 h-4" />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {keywordModalMode === "add" ? "Add Target Keyword" : "Edit Target Keyword"}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Configure search terms, classification, intent, and location targeting
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsKeywordModalOpen(false)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4 overflow-y-auto flex-1">
                      {/* Keyword Text */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">
                          Keyword <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={kwText}
                          onChange={(e) => setKwText(e.target.value)}
                          placeholder="e.g. industrial water purification system"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                        />
                      </div>

                      {/* Keyword Type & Search Intent */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Keyword Type</label>
                          <select
                            value={kwType}
                            onChange={(e) => setKwType(e.target.value as KeywordType)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="Primary">Primary</option>
                            <option value="Secondary">Secondary</option>
                            <option value="Long-tail">Long-tail</option>
                            <option value="Branded">Branded</option>
                            <option value="Product">Product</option>
                            <option value="Service">Service</option>
                            <option value="Location">Location</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Search Intent</label>
                          <select
                            value={kwSearchIntent}
                            onChange={(e) => setKwSearchIntent(e.target.value as SearchIntentType)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="Commercial">Commercial</option>
                            <option value="Transactional">Transactional</option>
                            <option value="Informational">Informational</option>
                            <option value="Navigational">Navigational</option>
                          </select>
                        </div>
                      </div>

                      {/* Related Offering */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Related Product / Service</label>
                        <input
                          type="text"
                          value={kwRelatedOffering}
                          onChange={(e) => setKwRelatedOffering(e.target.value)}
                          placeholder="e.g. Water Treatment Plant / Commercial RO"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Target Location */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Target Location</label>
                        <input
                          type="text"
                          value={kwTargetLocation}
                          onChange={(e) => setKwTargetLocation(e.target.value)}
                          placeholder="e.g. Maharashtra, India or All India"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Notes */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Notes / Context</label>
                        <textarea
                          rows={2}
                          value={kwNotes}
                          onChange={(e) => setKwNotes(e.target.value)}
                          placeholder="Specific competitive notes, target landing page, or high-intent nuances..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                        />
                      </div>

                      {/* Active / Inactive Status */}
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Keyword Status</span>
                          <span className="text-[11px] text-slate-500">Enable or disable this keyword in active targeting</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={kwIsActive}
                            onChange={(e) => setKwIsActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0 bg-slate-50/50">
                      <button
                        type="button"
                        onClick={() => setIsKeywordModalOpen(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveKeywordItem}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
                      >
                        {keywordModalMode === "add" ? "Add Keyword" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* NEGATIVE KEYWORD ADD/EDIT MODAL */}
              {isNegModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                          <AlertCircle className="w-4 h-4" />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {negModalMode === "add" ? "Add Negative Keyword" : "Edit Negative Keyword"}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Define terms to exclude unwanted or non-converting searches
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNegModalOpen(false)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4 overflow-y-auto flex-1">
                      {/* Keyword Text */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">
                          Negative Keyword <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={negText}
                          onChange={(e) => setNegText(e.target.value)}
                          placeholder="e.g. free, cracks, pdf download, tutorial, salary"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                        />
                      </div>

                      {/* Match Type */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Match Type</label>
                        <select
                          value={negMatchType}
                          onChange={(e) => setNegMatchType(e.target.value as NegativeMatchScore)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-white"
                        >
                          <option value="Phrase">Phrase Match ("keyword")</option>
                          <option value="Exact">Exact Match ([keyword])</option>
                          <option value="Broad">Broad Match (keyword)</option>
                        </select>
                        <p className="text-[11px] text-slate-400 pt-0.5">
                          {negMatchType === "Phrase" && "Blocks queries containing this phrase in the specified order."}
                          {negMatchType === "Exact" && "Blocks queries matching exactly this term without extra words."}
                          {negMatchType === "Broad" && "Blocks queries containing all words in any order."}
                        </p>
                      </div>

                      {/* Reason / Notes */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Reason / Notes</label>
                        <textarea
                          rows={2}
                          value={negReason}
                          onChange={(e) => setNegReason(e.target.value)}
                          placeholder="e.g. Job hunters or students searching for free downloads..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed"
                        />
                      </div>

                      {/* Active / Inactive Status */}
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Negative Keyword Status</span>
                          <span className="text-[11px] text-slate-500">Enable or disable this exclusion in profile lists</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={negIsActive}
                            onChange={(e) => setNegIsActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0 bg-slate-50/50">
                      <button
                        type="button"
                        onClick={() => setIsNegModalOpen(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveNegItem}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm shadow-rose-500/20 cursor-pointer"
                      >
                        {negModalMode === "add" ? "Add Negative Keyword" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: BUSINESS FAQS & KEY INFORMATION */}
              {activeTab === "faqs" && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                            <HelpCircle className="w-4 h-4" />
                          </span>
                          <h2 className="text-sm font-bold text-slate-900">Business FAQs &amp; Key Information</h2>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Curate customer-scoped frequently asked questions, verified answers, product/service alignment, and keyword associations.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={openAddFaqModal}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add FAQ</span>
                      </button>
                    </div>

                    {/* Empty state */}
                    {faqs.length === 0 ? (
                      <div className="p-10 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-700">No Business FAQs Added Yet</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Add common customer questions, authoritative answers, related products/services, and target keywords to empower high-converting marketing campaigns.
                        </p>
                        <button
                          type="button"
                          onClick={openAddFaqModal}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add First FAQ</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {faqs.map((faq) => (
                          <div
                            key={faq.id}
                            className={`p-5 rounded-2xl border transition-all space-y-3.5 flex flex-col justify-between ${
                              faq.isActive
                                ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                                : "bg-slate-50/60 border-slate-200/60 opacity-75"
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Header: Category Badge & Actions */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {faq.category ? (
                                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold border bg-blue-50 text-blue-700 border-blue-100">
                                      {faq.category}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border bg-slate-100 text-slate-600 border-slate-200">
                                      General FAQ
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFaqActive(faq.id)}
                                    title={faq.isActive ? "Deactivate FAQ" : "Activate FAQ"}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                      faq.isActive
                                        ? "text-emerald-600 hover:bg-emerald-50"
                                        : "text-slate-400 hover:bg-slate-200"
                                    }`}
                                  >
                                    <Power className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openEditFaqModal(faq)}
                                    title="Edit FAQ"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteFaq(faq.id)}
                                    title="Delete FAQ"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Question */}
                              <div>
                                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                                  {faq.question}
                                </h3>
                              </div>

                              {/* Answer */}
                              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                  {faq.answer}
                                </p>
                              </div>

                              {/* Related Offering / Location Details */}
                              {(faq.relatedProduct || faq.relatedService || faq.relatedLocation) && (
                                <div className="space-y-1.5 pt-1">
                                  {faq.relatedProduct && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                      <Package className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      <span className="truncate">Product: <strong className="font-semibold text-slate-800">{faq.relatedProduct}</strong></span>
                                    </div>
                                  )}
                                  {faq.relatedService && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                      <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                      <span className="truncate">Service: <strong className="font-semibold text-slate-800">{faq.relatedService}</strong></span>
                                    </div>
                                  )}
                                  {faq.relatedLocation && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                      <span className="truncate">Location: <strong className="font-semibold text-slate-800">{faq.relatedLocation}</strong></span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Keywords */}
                              {faq.keywords && faq.keywords.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                  {faq.keywords.map((kw, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                                    >
                                      #{kw}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Internal Notes */}
                              {faq.internalNotes && (
                                <p className="text-xs text-slate-500 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/70">
                                  <span className="font-semibold text-amber-900">Internal Note: </span>
                                  {faq.internalNotes}
                                </p>
                              )}
                            </div>

                            {/* Footer: Status */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Status</span>
                              <span
                                className={`inline-flex items-center gap-1 font-semibold ${
                                  faq.isActive ? "text-emerald-700" : "text-slate-400"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    faq.isActive ? "bg-emerald-500" : "bg-slate-300"
                                  }`}
                                />
                                {faq.isActive ? "Active" : "Disabled"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* BUSINESS FAQ ADD/EDIT MODAL */}
              {isFaqModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                          <HelpCircle className="w-4 h-4" />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {faqModalMode === "add" ? "Add Business FAQ" : "Edit Business FAQ"}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Define verified questions, answers, and context for campaign targeting
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsFaqModalOpen(false)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4 overflow-y-auto flex-1">
                      {/* Question */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">
                          Question <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={faqQuestion}
                          onChange={(e) => setFaqQuestion(e.target.value)}
                          placeholder="e.g. Do you offer warranty or on-site service support?"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                        />
                      </div>

                      {/* Answer */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">
                          Answer <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          value={faqAnswer}
                          onChange={(e) => setFaqAnswer(e.target.value)}
                          placeholder="e.g. Yes, all equipment includes a 1-year comprehensive on-site warranty with 24-hour technician support across India."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Category</label>
                        <input
                          type="text"
                          value={faqCategory}
                          onChange={(e) => setFaqCategory(e.target.value)}
                          placeholder="e.g. Warranty & Support, Pricing & Quotations, Delivery, Installation"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Related Product & Service */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Related Product</label>
                          <input
                            type="text"
                            value={faqRelatedProduct}
                            onChange={(e) => setFaqRelatedProduct(e.target.value)}
                            placeholder="e.g. Industrial RO Plant"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Related Service</label>
                          <input
                            type="text"
                            value={faqRelatedService}
                            onChange={(e) => setFaqRelatedService(e.target.value)}
                            placeholder="e.g. Annual Maintenance Contract"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Related Location */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Related Location</label>
                        <input
                          type="text"
                          value={faqRelatedLocation}
                          onChange={(e) => setFaqRelatedLocation(e.target.value)}
                          placeholder="e.g. Maharashtra, Mumbai, or Pan-India"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Keywords */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Associated Keywords</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={faqKeywordInput}
                            onChange={(e) => setFaqKeywordInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddFaqKeyword();
                              }
                            }}
                            placeholder="Type keyword and press Enter or Add"
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddFaqKeyword}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        {faqKeywords.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {faqKeywords.map((kw, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                              >
                                <span>{kw}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFaqKeyword(kw)}
                                  className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Internal Notes */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Internal Notes</label>
                        <textarea
                          rows={2}
                          value={faqInternalNotes}
                          onChange={(e) => setFaqInternalNotes(e.target.value)}
                          placeholder="Internal guidelines or marketing tips for this FAQ..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                        />
                      </div>

                      {/* Active Status Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">FAQ Status</span>
                          <span className="text-[11px] text-slate-500">Enable or disable this FAQ record</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={faqIsActive}
                            onChange={(e) => setFaqIsActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0 bg-slate-50/50">
                      <button
                        type="button"
                        onClick={() => setIsFaqModalOpen(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveFaqItem}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
                      >
                        {faqModalMode === "add" ? "Add FAQ" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: AI SUGGESTIONS & INTELLIGENCE MAPPING */}
              {activeTab === "ai_suggestions" && (
                <div className="space-y-6">
                  {/* Header & Quick Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                          <Sparkles className="w-4 h-4" />
                        </span>
                        <h2 className="text-sm font-bold text-slate-900">AI Discovered Profile Suggestions</h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                        Intelligence extracted from verified websites and sub-pages. Every value is categorized as New, Existing Match, or Potential Conflict. Existing profile data is never overwritten without your explicit approval.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {aiSuggestions.some((s) => s.status === "new" && !s.applied && !s.rejected) && (
                        <button
                          type="button"
                          onClick={handleApproveAllNewSuggestions}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm shadow-purple-500/20 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve All New ({aiSuggestions.filter((s) => s.status === "new" && !s.applied && !s.rejected).length})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Feedback message */}
                  {suggestionSuccessMsg && (
                    <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs font-medium text-purple-800 flex items-center gap-2 animate-in fade-in">
                      <Sparkles className="w-4 h-4 shrink-0 text-purple-600" />
                      <span>{suggestionSuccessMsg}</span>
                    </div>
                  )}

                  {/* Metrics & Statistics summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[11px] font-semibold text-slate-500 block">Total Suggestions</span>
                      <span className="text-base font-bold text-slate-800">{aiSuggestions.length}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                      <span className="text-[11px] font-semibold text-emerald-700 block">New Information</span>
                      <span className="text-base font-bold text-emerald-900">
                        {aiSuggestions.filter((s) => s.status === "new").length}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                      <span className="text-[11px] font-semibold text-amber-700 block">Potential Conflicts</span>
                      <span className="text-base font-bold text-amber-900">
                        {aiSuggestions.filter((s) => s.status === "conflict").length}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-600 block">Existing Matches</span>
                      <span className="text-base font-bold text-slate-700">
                        {aiSuggestions.filter((s) => s.status === "existing").length}
                      </span>
                    </div>
                  </div>

                  {/* Filter controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500 mr-1">Status:</span>
                      {[
                        { id: "all", label: "All Statuses" },
                        { id: "new", label: "New Only" },
                        { id: "conflict", label: "Conflicts Only" },
                        { id: "existing", label: "Existing Matches" }
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSuggestionFilterStatus(st.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            suggestionFilterStatus === st.id
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    {/* Section Filter */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500 mr-1">Section:</span>
                      <select
                        value={suggestionFilterSection}
                        onChange={(e) => setSuggestionFilterSection(e.target.value)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none focus:border-purple-500"
                      >
                        <option value="all">All Sections</option>
                        <option value="business">Business Information</option>
                        <option value="products">Products</option>
                        <option value="services">Services</option>
                        <option value="target_audience">Target Audience &amp; Personas</option>
                        <option value="locations">Locations</option>
                        <option value="brand_profile">Brand Profile &amp; USPs</option>
                        <option value="competitors">Competitor Intelligence</option>
                        <option value="seo_keywords">SEO Keywords</option>
                        <option value="faqs">Business FAQs</option>
                      </select>
                    </div>
                  </div>

                  {/* Suggestions List / Empty State */}
                  {aiSuggestions.length === 0 ? (
                    <div className="p-10 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-400 flex items-center justify-center mx-auto">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-700">No AI Suggestions Discovered Yet</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Analyze a website URL on the Websites &amp; Sub-Pages tab. Groq AI will inspect page content and discover high-accuracy suggestions for review.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("websites")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Go to Websites &amp; Sub-Pages Tab</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {aiSuggestions
                        .filter((s) => {
                          if (suggestionFilterStatus !== "all" && s.status !== suggestionFilterStatus) return false;
                          if (suggestionFilterSection !== "all" && s.section !== suggestionFilterSection) return false;
                          return true;
                        })
                        .map((sugg) => {
                          const formatVal = (v: any) => {
                            if (v === null || v === undefined) return "";
                            if (typeof v === "string") return v;
                            if (typeof v === "number" || typeof v === "boolean") return String(v);
                            if (Array.isArray(v)) {
                              return v.map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item))).join(", ");
                            }
                            if (typeof v === "object") {
                              if (v.question && v.answer) {
                                return `Q: ${v.question}\nA: ${v.answer}`;
                              }
                              if (v.name) {
                                return `${v.name}${v.description ? ` — ${v.description}` : ""}`;
                              }
                              if (v.keyword) {
                                return `${v.keyword} (${v.keywordType || "Primary"}, ${v.searchIntent || "Commercial"})`;
                              }
                              if (v.competitorName) {
                                return `${v.competitorName}${v.competitorDescription ? ` — ${v.competitorDescription}` : ""}`;
                              }
                              if (v.personaTitle) {
                                return `${v.personaTitle}${v.summary ? ` — ${v.summary}` : ""}`;
                              }
                              return JSON.stringify(v, null, 2);
                            }
                            return String(v);
                          };

                          return (
                            <div
                              key={sugg.id}
                              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                                sugg.applied
                                  ? "bg-emerald-50/30 border-emerald-200/60"
                                  : sugg.rejected
                                  ? "bg-slate-50/50 border-slate-200/60 opacity-60"
                                  : "bg-white border-slate-200 hover:border-purple-200 shadow-2xs"
                              }`}
                            >
                              {/* Top Bar: Section badge, Status badge, Source link, Actions */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
                                    {sugg.section.replace(/_/g, " ")}
                                  </span>

                                  {sugg.status === "new" && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      New Information
                                    </span>
                                  )}

                                  {sugg.status === "conflict" && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                      Potential Conflict
                                    </span>
                                  )}

                                  {sugg.status === "existing" && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                      Existing Match
                                    </span>
                                  )}

                                  {sugg.sourceUrl && (
                                    <a
                                      href={sugg.sourceUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                                    >
                                      <Globe className="w-3 h-3 text-slate-400" />
                                      <span className="truncate max-w-[200px]">{sugg.sourceUrl}</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {sugg.applied ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                                      <Check className="w-3.5 h-3.5" />
                                      Approved &amp; Merged
                                    </span>
                                  ) : sugg.rejected ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold">
                                      <X className="w-3.5 h-3.5" />
                                      Rejected
                                    </span>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleRejectSuggestion(sugg.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Reject</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleApproveSuggestion(sugg.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Approve</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Title & Explanation */}
                              <div>
                                <h3 className="text-xs font-bold text-slate-900">{sugg.label}</h3>
                                {sugg.explanation && (
                                  <p className="text-[11px] text-slate-500 mt-0.5">{sugg.explanation}</p>
                                )}
                              </div>

                              {/* Value Display / Comparison */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                                    AI Suggested Value
                                  </span>
                                  <div className="text-xs font-medium text-slate-800 whitespace-pre-line leading-relaxed">
                                    {formatVal(sugg.suggestedValue)}
                                  </div>
                                </div>

                                {sugg.currentValue !== undefined && sugg.currentValue !== null && (
                                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                      Current Profile Value
                                    </span>
                                    <div className="text-xs font-medium text-slate-600 whitespace-pre-line leading-relaxed">
                                      {formatVal(sugg.currentValue)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: WEBSITES & SUB-PAGES MANAGER (UP TO 15 WEBSITES TOTAL) */}
              {activeTab === "websites" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Websites &amp; Discovered Sub-Pages
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Configure up to 15 websites (1 primary + 14 additional). Groq AI discovers up to 15 sub-pages per site.
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        totalWebsitesCount >= 15
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {totalWebsitesCount} / 15 Websites
                    </span>
                  </div>

                  {/* Primary Website Card */}
                  <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900">Primary Website</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          Main Landing
                        </span>
                      </div>
                      {primaryWebsite && (
                        <button
                          type="button"
                          onClick={() => handleAnalyzeWebsite(primaryWebsite, true)}
                          disabled={analyzingUrl === primaryWebsite}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all cursor-pointer shadow-2xs"
                        >
                          {analyzingUrl === primaryWebsite ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          <span>Analyze with Groq AI</span>
                        </button>
                      )}
                    </div>

                    <input
                      type="url"
                      value={primaryWebsite}
                      onChange={(e) => setPrimaryWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    />

                    {/* Primary Discovered Sub-Pages Preview */}
                    {primarySubPages.length > 0 && (
                      <div className="pt-2 border-t border-blue-100">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedWebsiteUrl(expandedWebsiteUrl === primaryWebsite ? null : primaryWebsite)
                          }
                          className="text-xs font-bold text-blue-800 flex items-center justify-between w-full py-1"
                        >
                          <span>Discovered Sub-Pages ({primarySubPages.length} pages found)</span>
                          {expandedWebsiteUrl === primaryWebsite ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        {expandedWebsiteUrl === primaryWebsite && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-blue-100/60 max-h-56 overflow-y-auto">
                            {primarySubPages.map((sp, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded-xl bg-white border border-blue-100 text-xs flex flex-col justify-between"
                              >
                                <span className="font-semibold text-slate-800 truncate">{sp.text}</span>
                                <a
                                  href={sp.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-blue-600 truncate flex items-center gap-1 hover:underline"
                                >
                                  {sp.url}
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Additional Websites List */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-800 block">
                      Additional Websites ({additionalWebsites.length} of max 14)
                    </label>

                    {additionalWebsites.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        No additional websites added yet. Add product microsites, regional domains, or subsidiary stores below.
                      </div>
                    ) : (
                      additionalWebsites.map((w, index) => {
                        const isExpanded = expandedWebsiteUrl === w.url;
                        const isAnalyzing = analyzingUrl === w.url;
                        return (
                          <div
                            key={index}
                            className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                                <span className="text-xs font-bold text-slate-800 truncate">{w.url}</span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  {w.subPages?.length || 0} sub-pages
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleAnalyzeWebsite(w.url, false)}
                                  disabled={isAnalyzing}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all cursor-pointer"
                                >
                                  {isAnalyzing ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                  )}
                                  <span>Analyze</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setExpandedWebsiteUrl(isExpanded ? null : w.url)}
                                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveAdditionalWebsite(w.url)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                  title="Remove Website"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Sub-Pages Accordion */}
                            {isExpanded && (
                              <div className="pt-2 border-t border-slate-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                                  {w.subPages.length === 0 ? (
                                    <p className="text-[11px] text-slate-400 italic">No sub-pages discovered. Click Analyze.</p>
                                  ) : (
                                    w.subPages.map((sp, sIdx) => (
                                      <div
                                        key={sIdx}
                                        className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between"
                                      >
                                        <span className="font-semibold text-slate-800 truncate">{sp.text}</span>
                                        <a
                                          href={sp.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[10px] text-blue-600 truncate flex items-center gap-1 hover:underline"
                                        >
                                          {sp.url}
                                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                        </a>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Add Website Input */}
                    {totalWebsitesCount < 15 ? (
                      <div className="flex gap-2 pt-2">
                        <input
                          type="url"
                          value={newWebsiteInput}
                          onChange={(e) => setNewWebsiteInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddAdditionalWebsite();
                            }
                          }}
                          placeholder="https://secondary-shop.com or https://blog.domain.com"
                          className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddAdditionalWebsite}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Add Website
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-700 font-semibold p-3 rounded-xl bg-amber-50 border border-amber-200">
                        Maximum website quota reached (15 websites). Remove an additional website to add a new one.
                      </p>
                    )}
                  </div>

                  {/* YouTube Channel & Video Links Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-bold text-slate-900">YouTube Channel &amp; Video Links</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                          {youtubeLinks.length} {youtubeLinks.length === 1 ? "Link" : "Links"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Essential for Google Video Campaigns &amp; Demand Gen ads
                      </span>
                    </div>

                    {youtubeLinks.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        No YouTube links connected yet. Add your brand channel, product overview videos, or Shorts below.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {youtubeLinks.map((yt, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Youtube className="w-4 h-4 text-red-600 shrink-0" />
                              <a
                                href={yt}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-slate-800 hover:text-red-600 truncate hover:underline flex items-center gap-1"
                              >
                                <span className="truncate">{yt}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveYoutubeLink(yt)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Remove YouTube Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add YouTube URL Input */}
                    <div className="space-y-1 pt-1">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={newYoutubeInput}
                          onChange={(e) => {
                            setNewYoutubeInput(e.target.value);
                            if (youtubeInputError) setYoutubeInputError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddYoutubeLink();
                            }
                          }}
                          placeholder="https://youtube.com/@channel or https://youtu.be/..."
                          className={`flex-1 px-3.5 py-2 text-xs rounded-xl border bg-white font-mono text-slate-800 ${
                            youtubeInputError ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-red-500"
                          } focus:outline-none`}
                        />
                        <button
                          type="button"
                          onClick={handleAddYoutubeLink}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Plus className="w-4 h-4" /> Add YouTube Link
                        </button>
                      </div>
                      {youtubeInputError && (
                        <p className="text-[11px] text-rose-600 font-medium px-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {youtubeInputError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MERCHANT ACCOUNT & MOBILE APPS */}
              {activeTab === "merchant_apps" && (
                <div className="space-y-6">
                  {/* Google Merchant Center Card */}
                  <div
                    className={`p-5 rounded-2xl border transition-all ${
                      hasMerchantAccount ? "bg-emerald-50/40 border-emerald-300" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            hasMerchantAccount ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">Google Merchant Center</h4>
                            {hasMerchantAccount ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Connected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                                Disconnected
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">Shopping product feeds and local inventory feeds</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap ml-auto">
                        <a
                          href="https://merchants.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                          title="Open Google Merchant Center Console in a new tab"
                        >
                          <span>Console</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>

                        {hasMerchantAccount ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSyncMerchantAccounts}
                              disabled={isSyncingMerchant}
                              className="px-2.5 py-1 rounded-xl border border-emerald-300 hover:border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold inline-flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                              title="Detect and auto-populate your Google Merchant Center accounts"
                            >
                              {isSyncingMerchant ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                              <span>{isSyncingMerchant ? "Syncing..." : "Live Sync"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleDisconnectMerchant}
                              disabled={isDisconnectingMerchant}
                              className="px-2.5 py-1 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold inline-flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                              title="Disconnect Google Merchant Center"
                            >
                              {isDisconnectingMerchant ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 text-rose-500" />
                              )}
                              <span>{isDisconnectingMerchant ? "Disconnecting..." : "Disconnect"}</span>
                            </button>
                          </>
                        ) : (
                          <a
                            href={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/gmb/oauth/connect?orgId=${encodeURIComponent(orgId)}&redirect=${encodeURIComponent(`/ads/profile?customerId=${customerId}&tab=merchant_apps`)}&source=google_ads`}
                            className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-black text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            title="Authorize Google Merchant Center scope via OAuth"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Connect Merchant</span>
                          </a>
                        )}

                        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                          <span className="text-[11px] font-bold text-slate-500">Enable:</span>
                          <button
                            type="button"
                            onClick={() => setHasMerchantAccount(!hasMerchantAccount)}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                              hasMerchantAccount
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-slate-200 text-slate-700 border-slate-300"
                            }`}
                          >
                            {hasMerchantAccount ? "Yes" : "No"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {merchantSyncMsg && (
                      <div
                        className={`mb-3 p-3 rounded-xl border text-xs flex items-start justify-between gap-2 animate-fadeIn ${
                          merchantSyncMsg.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                            : merchantSyncMsg.type === "error"
                            ? "bg-rose-50 border-rose-200 text-rose-900"
                            : "bg-blue-50 border-blue-200 text-blue-900"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {merchantSyncMsg.type === "success" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : merchantSyncMsg.type === "error" ? (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          ) : (
                            <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                          <p>{merchantSyncMsg.text}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMerchantSyncMsg(null)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {hasMerchantAccount ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-emerald-200/60 animate-fadeIn">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                            <span>Merchant Center Account ID</span>
                            <span className="text-[11px] font-normal text-slate-400 font-mono">Numeric ID</span>
                          </label>
                          <input
                            type="text"
                            value={merchantCenterId}
                            onChange={(e) => setMerchantCenterId(e.target.value)}
                            placeholder="e.g. 123456789"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:border-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                            <span>Primary Feed / Store Name</span>
                            <span className="text-[11px] font-normal text-slate-400">Store / Product Catalog</span>
                          </label>
                          <input
                            type="text"
                            value={merchantStoreName}
                            onChange={(e) => setMerchantStoreName(e.target.value)}
                            placeholder="e.g. Main Online Store Feed"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100">
                        Merchant Center is disconnected. Connect with Google or enable the switch to configure product catalogs.
                      </p>
                    )}
                  </div>

                  {/* Mobile Apps Card */}
                  <div
                    className={`p-5 rounded-2xl border transition-all ${
                      hasAppAccount ? "bg-blue-50/40 border-blue-300" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            hasAppAccount ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">Mobile App Campaigns</h4>
                            {hasAppAccount ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                {appDetails.length > 0 ? `${appDetails.length} App${appDetails.length > 1 ? "s" : ""} Linked` : "Connected"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                                Disconnected
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">Android and iOS App Store / Firebase links</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap ml-auto">
                        <a
                          href="https://play.google.com/console"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                          title="Open Google Play Console in a new tab"
                        >
                          <span>Play Console</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>

                        {hasAppAccount ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSyncConnectedApps}
                              disabled={isSyncingApps}
                              className="px-2.5 py-1 rounded-xl border border-blue-300 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-semibold inline-flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                              title="Detect and auto-populate your connected mobile apps"
                            >
                              {isSyncingApps ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                              <span>{isSyncingApps ? "Discovering..." : "Live Sync"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleDisconnectApps}
                              disabled={isDisconnectingApps}
                              className="px-2.5 py-1 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold inline-flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                              title="Disconnect all Mobile Apps"
                            >
                              {isDisconnectingApps ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 text-rose-500" />
                              )}
                              <span>{isDisconnectingApps ? "Disconnecting..." : "Disconnect"}</span>
                            </button>
                          </>
                        ) : (
                          <a
                            href={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/gmb/oauth/connect?orgId=${encodeURIComponent(orgId)}&redirect=${encodeURIComponent(`/ads/profile?customerId=${customerId}&tab=merchant_apps`)}&source=google_ads`}
                            className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-black text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            title="Authorize Google account via OAuth"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Connect Apps</span>
                          </a>
                        )}

                        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                          <span className="text-[11px] font-bold text-slate-500">Enable:</span>
                          <button
                            type="button"
                            onClick={() => setHasAppAccount(!hasAppAccount)}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                              hasAppAccount
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : "bg-slate-200 text-slate-700 border-slate-300"
                            }`}
                          >
                            {hasAppAccount ? "Yes" : "No"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {appSyncMsg && (
                      <div
                        className={`mb-3 p-3 rounded-xl border text-xs flex items-start justify-between gap-2 animate-fadeIn ${
                          appSyncMsg.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                            : appSyncMsg.type === "error"
                            ? "bg-rose-50 border-rose-200 text-rose-900"
                            : "bg-blue-50 border-blue-200 text-blue-900"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {appSyncMsg.type === "success" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : appSyncMsg.type === "error" ? (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          ) : (
                            <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                          <p>{appSyncMsg.text}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAppSyncMsg(null)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {hasAppAccount && (
                      <div className="space-y-4 pt-3 border-t border-blue-200/60 animate-fadeIn">
                        {/* Connected Apps Table / Cards */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-800 block">
                            Connected Mobile Applications ({appDetails.length})
                          </label>

                          {appDetails.length === 0 ? (
                            <p className="text-xs text-slate-400 italic p-3 rounded-xl bg-white border border-slate-200">
                              No apps added yet. Add your Android or iOS app below.
                            </p>
                          ) : (
                            appDetails.map((app, aIdx) => (
                              <div
                                key={app.id || aIdx}
                                className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                                      app.platform === "IOS"
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-emerald-600 text-white border-emerald-600"
                                    }`}
                                  >
                                    {app.platform === "IOS" ? "iOS" : "Android"}
                                  </span>
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-slate-900 block truncate">
                                      {app.appName || app.appId}
                                    </span>
                                    <span className="text-[11px] font-mono text-slate-500 truncate block">
                                      ID: {app.appId}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {app.appUrl && (
                                    <a
                                      href={app.appUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50"
                                      title="Open Store Link"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setAppDetails((prev) => prev.filter((_, i) => i !== aIdx))}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                    title="Remove App"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add Mobile App Sub-form */}
                        <div className="p-3.5 rounded-2xl bg-white border border-blue-200 space-y-3">
                          <span className="text-xs font-bold text-slate-800 block">Add New Application</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-600">Platform</label>
                              <select
                                value={newAppPlatform}
                                onChange={(e) => setNewAppPlatform(e.target.value as "ANDROID" | "IOS")}
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50"
                              >
                                <option value="ANDROID">Google Play (Android)</option>
                                <option value="IOS">Apple App Store (iOS)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-600">App ID / Package</label>
                              <input
                                type="text"
                                value={newAppId}
                                onChange={(e) => setNewAppId(e.target.value)}
                                placeholder={newAppPlatform === "ANDROID" ? "com.example.app" : "123456789"}
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-600">App Display Name</label>
                              <input
                                type="text"
                                value={newAppName}
                                onChange={(e) => setNewAppName(e.target.value)}
                                placeholder="e.g. MyBrand Pro"
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <input
                              type="url"
                              value={newAppUrl}
                              onChange={(e) => setNewAppUrl(e.target.value)}
                              placeholder="Direct store link (optional)..."
                              className="flex-1 mr-3 px-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-700"
                            />
                            <button
                              type="button"
                              onClick={handleAddApp}
                              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add App
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: MEDIA & CREATIVE ASSETS */}
              {activeTab === "media_assets" && (
                <MediaAssetsLibraryTab
                  customerId={customerId}
                  orgId={orgId}
                  mediaAssets={mediaAssets}
                  onUpdateMediaAssets={setMediaAssets}
                  isProfileApproved={Boolean(profile?.isApproved)}
                />
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/70 gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Award className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Approved profile automatically prefills AI Guided campaign sessions.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => handleSaveProfile(false)}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveProfile(true)}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/20 inline-flex items-center gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Approve &amp; Save Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
