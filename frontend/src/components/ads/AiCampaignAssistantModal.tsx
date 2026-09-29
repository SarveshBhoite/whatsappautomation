"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Upload,
  Calendar,
  Layers,
  Image as ImageIcon,
  Check,
  Users,
  TrendingUp,
  BarChart3,
  Lightbulb
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
  budgetType?: "DAILY" | "TOTAL" | string;
  dailyBudget?: number | null;
  locations?: string[];
  language?: string;
  startDate?: string;
  endDate?: string;
  biddingStrategy?: string;
  targetCpa?: number | null;
  targetRoas?: number | null;
  keywords?: string[];
  campaignNegativeKeywords?: string[];
  linkedSharedNegativeSetIds?: string[];
  keywordIntelligence?: KeywordIntelligenceItem[];
  availableSharedNegativeLists?: SharedNegativeSetSummary[];
  audienceSignalIds?: string[];
  audienceIntelligence?: AudienceIntelligenceItem[];
  headlines?: string[];
  descriptions?: string[];
  longHeadlines?: string[];
  images?: Array<string | { url?: string; data?: string; fieldType?: string; name?: string }>;
  logos?: Array<string | { url?: string; data?: string; fieldType?: string; name?: string }>;
  videos?: Array<string | { url?: string; data?: string; name?: string }>;
  appId?: string;
  appName?: string;
  platform?: "ANDROID" | "IOS" | string;
  appStore?: "GOOGLE_APP_STORE" | "APPLE_APP_STORE";
  merchantCenterId?: string;
  readyForReview?: boolean;
  readyForPublish?: boolean;
  stage?: string;
  forecastSummary?: PerformanceForecastSummary | null;
  recommendationInsights?: RecommendationInsight[];
  extensionsAndAssets?: CampaignExtensionInsight[];
}

export interface AudienceIntelligenceItem {
  id: string;
  name: string;
  source: "CRM_PROFILE" | "CUSTOMER_MATCH" | "CUSTOM_AUDIENCE" | "USER_LIST" | "AI";
  type: string;
  status: string;
  memberCount?: number;
  relevanceReason: string;
  recommended: boolean;
  approved: boolean;
  resourceName?: string;
}

export interface ProfileNegativeKeywordItem {
  id: string;
  keyword: string;
  matchType: string;
  reason?: string;
}

export interface KeywordIntelligenceItem {
  keyword: string;
  matchType?: "EXACT" | "PHRASE" | "BROAD";
  source: "USER" | "AI" | "KEYWORD_PLANNER" | "EXISTING_ACCOUNT" | "SEARCH_TERM" | "DISPLAY_CONTEXTUAL";
  searchVolume?: number;
  competition?: string;
  competitionIndex?: number;
  lowTopOfPageBid?: number;
  highTopOfPageBid?: number;
  existingCampaignName?: string;
  existingStatus?: string;
  isNegative?: boolean;
  approved?: boolean;
}

export interface SharedNegativeSetSummary {
  id: string;
  name: string;
  memberCount: number;
  referenceCount?: number;
  resourceName?: string;
  isAttachedToCampaign?: boolean;
}

export interface PerformanceForecastSummary {
  status: "SUCCESS" | "UNAVAILABLE" | "UNSUPPORTED" | "INVALID_CONFIGURATION";
  currencyCode?: string;
  forecastPeriod?: {
    startDate: string;
    endDate: string;
  };
  dailyBudget?: number;
  metrics?: {
    clicks?: number;
    cost?: number;
    averageCpc?: number;
    conversions?: number;
    averageCpa?: number;
  };
  assumptions?: string[];
  warnings?: string[];
  notice?: string;
  isCached?: boolean;
}

export interface RecommendationInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  impact?: {
    hasImpact?: boolean;
    deltaClicks?: number;
    deltaCost?: number;
    deltaConversions?: number;
  };
  campaignId?: string;
  campaignName?: string;
  resourceName?: string;
  recommendationType?: string;
  recommended: boolean;
  approved: boolean;
}

export interface CampaignExtensionInsight {
  id: string;
  type: string;
  name: string;
  description: string;
  source: "GOOGLE_ADS" | "AI" | "USER" | "PROFILE";
  campaignId?: string;
  campaignName?: string;
  resourceName?: string;
  fileUrl?: string;
  aspectRatio?: string;
  status?: string;
  recommended: boolean;
  approved: boolean;
}

export interface CampaignReviewSummary {
  customerId: string;
  businessName: string;
  objective: string;
  campaignType: string;
  campaignName: string;
  dailyBudget: number;
  biddingStrategy: string;
  targetCpa?: number;
  targetRoas?: number;
  locations: string[];
  languages: string[];
  retailConfig?: {
    merchantCenterId: string;
    salesCountry?: string;
    feedLabel?: string;
    campaignPriority?: string;
    productGroupFilter?: string;
  };
  appConfig?: {
    platform: string;
    appId: string;
    appName?: string;
    appStore?: string;
  };
  youtubeVideosCount?: number;
  marketingImagesCount?: number;
  approvedKeywordsCount: number;
  approvedNegativeKeywordsCount: number;
  approvedAudienceCount: number;
  approvedRecommendationsCount: number;
  approvedExtensionsAssetsCount: number;
  approvedKeywords: string[];
  approvedNegativeKeywords: string[];
  approvedAudienceSignals: string[];
  approvedRecommendations: Array<{ id: string; type: string; title: string; description: string }>;
  approvedExtensionsAssets: Array<{ id: string; type: string; name: string; description: string }>;
  performanceForecast?: PerformanceForecastSummary;
  preflightStatus: "PASSED" | "BLOCKED";
  warnings: string[];
  blockingIssues: string[];
  readyForPublish: boolean;
}

export interface PreflightCheckResult {
  passed: boolean;
  conversionTrackingActive: boolean;
  billingActive: boolean;
  merchantCenterLinked: boolean;
  issues: Array<{
    field?: string;
    level: "ERROR" | "WARNING";
    message: string;
    code?: string;
  }>;
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
  readyForReview?: boolean;
  readyForPublish?: boolean;
  timestamp: string;
}

interface AiCampaignAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

export function AiCampaignAssistantModal({
  isOpen,
  onClose,
  customerId
}: AiCampaignAssistantModalProps) {
  const router = useRouter();
  const todayIso = new Date().toISOString().split("T")[0];

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [preflightData, setPreflightData] = useState<PreflightCheckResult | null>(null);
  const [isValidatingPreflight, setIsValidatingPreflight] = useState<boolean>(false);
  const [forecastResult, setForecastResult] = useState<PerformanceForecastSummary | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState<boolean>(false);
  const [recommendationsResult, setRecommendationsResult] = useState<{
    status: string;
    recommendationsCount: number;
    recommendations: RecommendationInsight[];
    notice?: string;
  } | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);
  const [extensionsAssetsResult, setExtensionsAssetsResult] = useState<{
    status: string;
    itemsCount: number;
    items: CampaignExtensionInsight[];
    notice?: string;
  } | null>(null);
  const [isLoadingExtensionsAssets, setIsLoadingExtensionsAssets] = useState<boolean>(false);

  // Phase 2C: Merchant Center & Retail Intelligence and App Promotion Intelligence states
  const [shoppingIntelResult, setShoppingIntelResult] = useState<any | null>(null);
  const [isLoadingShoppingIntel, setIsLoadingShoppingIntel] = useState<boolean>(false);
  const [appIntelResult, setAppIntelResult] = useState<any | null>(null);
  const [isLoadingAppIntel, setIsLoadingAppIntel] = useState<boolean>(false);

  // Phase 2D: Conversion Goal Intelligence states
  const [conversionGoalIntelResult, setConversionGoalIntelResult] = useState<any | null>(null);
  const [isLoadingConversionGoalIntel, setIsLoadingConversionGoalIntel] = useState<boolean>(false);

  // Phase 5: Final Review & Confirmation Hardening states
  const [finalReview, setFinalReview] = useState<CampaignReviewSummary | null>(null);
  const [isLoadingFinalReview, setIsLoadingFinalReview] = useState<boolean>(false);
  const [userConfirmed, setUserConfirmed] = useState<boolean>(false);
  const [creationResultData, setCreationResultData] = useState<any>(null);

  // Phase 1 & 3: Customer Profile Hydration, Isolation & Save-Back states
  const [customerProfileData, setCustomerProfileData] = useState<any | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<string | null>(null);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [showSaveProfileModal, setShowSaveProfileModal] = useState<boolean>(false);
  const profileAbortRef = useRef<AbortController | null>(null);
  const keywordIntelAbortRef = useRef<AbortController | null>(null);
  const audienceIntelAbortRef = useRef<AbortController | null>(null);
  const extensionsAssetsAbortRef = useRef<AbortController | null>(null);
  const shoppingIntelAbortRef = useRef<AbortController | null>(null);
  const appIntelAbortRef = useRef<AbortController | null>(null);
  const conversionGoalIntelAbortRef = useRef<AbortController | null>(null);
  const forecastAbortRef = useRef<AbortController | null>(null);
  const recommendationsAbortRef = useRef<AbortController | null>(null);

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (isOpen && messages.length === 0 && !isLoadingProfile) {
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
  }, [isOpen, messages.length, isLoadingProfile]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen, isLoading]);

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
        setCampaignState(prev => ({
          ...prev,
          website: urlStr,
          businessName: prev.businessName || data.title?.split(/[-|]/)[0]?.trim() || prev.businessName,
          business: {
            ...(prev.business || {}),
            name: prev.business?.name || data.title?.split(/[-|]/)[0]?.trim() || "",
            website: urlStr,
            description: prev.business?.description || data.description || ""
          }
        }));
      }
    } catch (e) {
      console.warn("Website analysis background notice:", e);
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

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

  const applyProposedCampaignState = (proposed: CampaignState, messageId?: string) => {
    if (!proposed) return;
    setCampaignState(prev => ({
      ...prev,
      ...proposed,
      startDate: proposed.startDate || prev.startDate || todayIso,
      endDate: proposed.endDate || prev.endDate,
      images: (proposed.images && proposed.images.length > 0) ? proposed.images : prev.images,
      logos: (proposed.logos && proposed.logos.length > 0) ? proposed.logos : prev.logos,
      videos: (proposed.videos && proposed.videos.length > 0) ? proposed.videos : prev.videos
    }));

    if (messageId) {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isApplied: true, isDismissed: false } : m));
    }
  };

  const dismissProposedCampaignState = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDismissed: true } : m));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading || isPublishing) return;

    const urlMatch = text.match(/https?:\/\/[^\s]+/i) || text.match(/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
    if (urlMatch && urlMatch[0]) {
      let detectedUrl = urlMatch[0];
      if (!detectedUrl.startsWith("http")) {
        detectedUrl = "https://" + detectedUrl;
      }
      handleAnalyzeUrl(detectedUrl);
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
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

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
          campaignState
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.message || "I've formulated campaign recommendations for you. Please review and confirm to apply them.",
        suggestions: data.suggestions || [],
        campaignState: data.campaignState,
        proposedCampaignState: data.campaignState,
        isApplied: false,
        isDismissed: false,
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
        content: `⚠️ **Connection Notice:** I could not reach the campaign assistant server right now (${err.message}). Let's continue — please tell me about your business or desired goal.`,
        suggestions: ["I want more leads", "I want more sales", "I want more website visitors", "Tell me what campaign is best"],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const runPreflightCheck = async (stateToCheck?: CampaignState) => {
    const targetState = stateToCheck || campaignState;
    if (!targetState.campaignType || !customerId) return;
    setIsValidatingPreflight(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/preflight`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          campaignState: targetState
        })
      });

      const data = await res.json();
      if (res.ok && data.preflight) {
        setPreflightData(data.preflight);
        if (data.preflight.passed !== undefined) {
          setCampaignState(prev => ({
            ...prev,
            readyForPublish: Boolean(data.preflight.passed)
          }));
        }
      }
    } catch (err) {
      console.warn("[Preflight Validation Warning]:", err);
    } finally {
      setIsValidatingPreflight(false);
    }
  };

  const [isLoadingKeywordIntel, setIsLoadingKeywordIntel] = useState<boolean>(false);
  const [keywordIntelResult, setKeywordIntelResult] = useState<any>(null);

  const runKeywordIntelligence = async (seedKeywords?: string[]) => {
    if (!customerId) return;
    if (campaignState.campaignType && campaignState.campaignType !== "SEARCH" && campaignState.campaignType !== "DISPLAY") return;

    if (keywordIntelAbortRef.current) {
      keywordIntelAbortRef.current.abort();
      keywordIntelAbortRef.current = null;
    }

    const abortController = new AbortController();
    keywordIntelAbortRef.current = abortController;
    const requestedCid = customerId;

    setIsLoadingKeywordIntel(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/keyword-intelligence`, {
        method: "POST",
        signal: abortController.signal,
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          campaignType: campaignState.campaignType || "SEARCH",
          queryKeywords: seedKeywords || campaignState.keywords || [],
          url: campaignState.website,
          businessName: campaignState.businessName,
          locations: campaignState.locations || ["India"],
          language: campaignState.language || "English"
        })
      });

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      if (data.success && requestedCid === customerId) {
        setKeywordIntelResult(data);
        if (Array.isArray(data.availableSharedNegativeLists)) {
          setCampaignState(prev => ({
            ...prev,
            availableSharedNegativeLists: data.availableSharedNegativeLists
          }));
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("[Keyword Intelligence Error]:", err);
      }
    } finally {
      if (keywordIntelAbortRef.current === abortController) {
        setIsLoadingKeywordIntel(false);
      }
    }
  };

  // Customer Profile Hydration & Strict Isolation:
  // When customerId changes or modal opens, abort in-flight requests, wipe all campaign and intelligence state,
  // fetch the Google Ads Customer Profile, and safely hydrate campaignState without cross-contamination.
  useEffect(() => {
    // 1. Abort any previous pending profile or intelligence requests
    if (profileAbortRef.current) {
      profileAbortRef.current.abort();
      profileAbortRef.current = null;
    }
    if (keywordIntelAbortRef.current) {
      keywordIntelAbortRef.current.abort();
      keywordIntelAbortRef.current = null;
    }
    if (audienceIntelAbortRef.current) {
      audienceIntelAbortRef.current.abort();
      audienceIntelAbortRef.current = null;
    }
    if (extensionsAssetsAbortRef.current) {
      extensionsAssetsAbortRef.current.abort();
      extensionsAssetsAbortRef.current = null;
    }
    if (shoppingIntelAbortRef.current) {
      shoppingIntelAbortRef.current.abort();
      shoppingIntelAbortRef.current = null;
    }
    if (appIntelAbortRef.current) {
      appIntelAbortRef.current.abort();
      appIntelAbortRef.current = null;
    }
    if (conversionGoalIntelAbortRef.current) {
      conversionGoalIntelAbortRef.current.abort();
      conversionGoalIntelAbortRef.current = null;
    }
    if (forecastAbortRef.current) {
      forecastAbortRef.current.abort();
      forecastAbortRef.current = null;
    }
    if (recommendationsAbortRef.current) {
      recommendationsAbortRef.current.abort();
      recommendationsAbortRef.current = null;
    }

    // 2. Immediately wipe all campaign and intelligence state to prevent Customer A -> Customer B leakage
    setKeywordIntelResult(null);
    setAudienceIntelResult(null);
    setForecastResult(null);
    setRecommendationsResult(null);
    setExtensionsAssetsResult(null);
    setShoppingIntelResult(null);
    setAppIntelResult(null);
    setConversionGoalIntelResult(null);
    setFinalReview(null);
    setUserConfirmed(false);
    setCreationResultData(null);
    setPublishError(null);
    setPublishSuccess(null);
    setCustomerProfileData(null);
    setProfileSaveSuccess(null);
    setProfileSaveError(null);
    setShowSaveProfileModal(false);

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
      campaignNegativeKeywords: [],
      linkedSharedNegativeSetIds: [],
      audienceSignalIds: [],
      headlines: [],
      descriptions: [],
      longHeadlines: [],
      images: [],
      logos: [],
      videos: [],
      readyForReview: false,
      readyForPublish: false,
      stage: "collecting_business"
    });

    if (!isOpen || !customerId) {
      setIsLoadingProfile(false);
      return;
    }

    const abortController = new AbortController();
    profileAbortRef.current = abortController;
    const requestedCid = customerId;
    const cleanRequestedCid = customerId.replace(/-/g, "").trim();

    const fetchAndHydrateProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

        const res = await fetch(
          `${BACKEND}/api/ads/ai-guided/user-profile?customerId=${encodeURIComponent(requestedCid)}&orgId=${encodeURIComponent(orgId)}`,
          {
            signal: abortController.signal,
            headers: {
              "Content-Type": "application/json",
              "x-organization-id": orgId
            }
          }
        );

        if (!res.ok) {
          console.warn(`[Profile Fetch] Received HTTP ${res.status} for customer ${requestedCid}`);
          return;
        }

        const data = await res.json();

        // Strict customer match guard: discard if customer switched or controller aborted
        const resolvedCid = (data.customerId || "").toString().replace(/-/g, "").trim();
        if (resolvedCid && resolvedCid !== cleanRequestedCid) {
          console.warn(`[Profile Fetch] Mismatched customer ID received (${resolvedCid} vs ${cleanRequestedCid}). Ignoring payload.`);
          return;
        }

        const profile = data.customerProfile || data;
        setCustomerProfileData(profile);

        // Extract and map active media assets
        const rawMedia: any[] = Array.isArray(profile.mediaAssets)
          ? profile.mediaAssets
          : Array.isArray(data.mediaAssets)
          ? data.mediaAssets
          : [];

        const activeImages = rawMedia
          .filter((m: any) => m.type === "IMAGE" && (m.status === "ACTIVE" || !m.status) && m.fileUrl)
          .map((m: any) => ({
            url: m.fileUrl,
            data: m.fileUrl,
            name: m.fileName || "Profile Image",
            fieldType: "MARKETING_IMAGE"
          }));

        const activeLogos = rawMedia
          .filter((m: any) => m.type === "LOGO" && (m.status === "ACTIVE" || !m.status) && m.fileUrl)
          .map((m: any) => ({
            url: m.fileUrl,
            data: m.fileUrl,
            name: m.fileName || "Profile Logo",
            fieldType: "LOGO"
          }));

        // Brand logo fallback if no active logo in mediaAssets
        const brandLogoUrl = profile.brandProfile?.logoUrl || data.brandProfile?.logoUrl || "";
        if (activeLogos.length === 0 && brandLogoUrl) {
          activeLogos.push({
            url: brandLogoUrl,
            data: brandLogoUrl,
            name: "Brand Logo",
            fieldType: "LOGO"
          });
        }

        // Active videos from media assets or youtubeLinks
        const activeVideos = rawMedia
          .filter((m: any) => m.type === "VIDEO" && (m.status === "ACTIVE" || !m.status) && m.fileUrl)
          .map((m: any) => ({
            url: m.fileUrl,
            data: m.fileUrl,
            name: m.fileName || "Profile Video"
          }));

        const rawYoutube: any[] = Array.isArray(profile.youtubeLinks)
          ? profile.youtubeLinks
          : Array.isArray(data.youtubeLinks)
          ? data.youtubeLinks
          : [];

        rawYoutube.forEach((yt: any) => {
          const ytUrl = typeof yt === "string" ? yt : yt.url || yt.videoUrl;
          if (ytUrl && !activeVideos.some((v: any) => v.url === ytUrl)) {
            activeVideos.push({
              url: ytUrl,
              data: ytUrl,
              name: typeof yt === "object" && yt.title ? yt.title : "YouTube Video"
            });
          }
        });

        // Location resolution
        const rawLocations: string[] = Array.isArray(profile.locations) && profile.locations.length > 0
          ? profile.locations
          : Array.isArray(data.locations) && data.locations.length > 0
          ? data.locations
          : Array.isArray(profile.locationRecords) && profile.locationRecords.length > 0
          ? profile.locationRecords.map((r: any) => r.locationName || r.name).filter(Boolean)
          : ["India"];

        // Language resolution
        const primaryLanguage = (Array.isArray(profile.languagesServed) && profile.languagesServed[0])
          || (Array.isArray(data.languagesServed) && data.languagesServed[0])
          || "English";

        // Retail & App resolution
        const hasMerchant = Boolean(profile.hasMerchantAccount ?? data.hasMerchantAccount);
        const resolvedMerchantId = hasMerchant
          ? (profile.merchantCenterId || data.merchantCenterId || "").toString().trim()
          : undefined;

        const hasApp = Boolean(profile.hasAppAccount ?? data.hasAppAccount);
        const appDetailsList = profile.appDetails || data.appDetails || [];
        const primaryApp = Array.isArray(appDetailsList) && appDetailsList.length > 0 ? appDetailsList[0] : null;
        const resolvedAppId = hasApp && primaryApp?.appId ? primaryApp.appId : undefined;
        const resolvedAppStore: "GOOGLE_APP_STORE" | "APPLE_APP_STORE" =
          primaryApp?.platform === "IOS" ? "APPLE_APP_STORE" : "GOOGLE_APP_STORE";

        const resolvedBizName = profile.businessName || data.businessName || data.organizationName || "";
        const resolvedWebsite = profile.primaryWebsite || data.primaryWebsite || "";
        const resolvedDesc = profile.businessDescription || data.businessDescription || "";
        const resolvedCategory = profile.industry || profile.businessCategory || data.industry || data.businessCategory || "";

        // Hydrate campaignState safely: request-scoped fields remain unset/default, keywords/audiences await user action
        setCampaignState(prev => ({
          ...prev,
          businessName: resolvedBizName || prev.businessName,
          website: resolvedWebsite || prev.website,
          business: {
            ...prev.business,
            name: resolvedBizName || prev.business?.name || "",
            website: resolvedWebsite || prev.business?.website || "",
            description: resolvedDesc || prev.business?.description || "",
            type: resolvedCategory || prev.business?.type || ""
          },
          locations: rawLocations.length > 0 ? rawLocations : ["India"],
          language: primaryLanguage,
          images: activeImages.length > 0 ? activeImages.slice(0, 10) : prev.images,
          logos: activeLogos.length > 0 ? activeLogos.slice(0, 5) : prev.logos,
          videos: activeVideos.length > 0 ? activeVideos.slice(0, 10) : prev.videos,
          merchantCenterId: resolvedMerchantId || prev.merchantCenterId,
          appId: resolvedAppId || prev.appId,
          appStore: resolvedAppStore || prev.appStore
        }));

        // Dynamic welcome message in chat acknowledging profile recognition
        if (resolvedBizName) {
          const welcomeMsg: Message = {
            id: `msg-welcome-profile-${Date.now()}`,
            role: "assistant",
            content: `👋 Connected to **${resolvedBizName}** profile.${resolvedWebsite ? ` (${resolvedWebsite})` : ""}\n\nI've loaded your business parameters, verified locations (${rawLocations.slice(0, 3).join(", ")}), and media creatives.\n\nWhat is your primary goal for this campaign? (e.g. *generate qualified leads*, *drive sales*, or *promote your app*)`,
            suggestions: [
              "I want more leads & inquiries",
              "I want online sales & purchases",
              "I want store visits & foot traffic",
              "Recommend best campaign type"
            ],
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
          setMessages([welcomeMsg]);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("[AI-GUIDED] Error loading profile for customer:", err);
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchAndHydrateProfile();

    return () => {
      abortController.abort();
    };
  }, [customerId, isOpen]);

  const runFinalReview = async (stateToReview?: CampaignState) => {
    if (!customerId) return;
    const currentState = stateToReview || campaignState;
    if (!currentState.campaignType) return;

    setIsLoadingFinalReview(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/final-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          campaignState: currentState
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.review) {
        setFinalReview(data.review);
        if (data.preflight) {
          setPreflightData(data.preflight);
        }
        setCampaignState(prev => ({
          ...prev,
          readyForPublish: Boolean(data.readyForPublish)
        }));
      } else {
        setFinalReview(null);
      }
    } catch (err: any) {
      console.warn("[Final Review Error]:", err);
    } finally {
      setIsLoadingFinalReview(false);
    }
  };

  const runExtensionsAssets = async () => {
    if (!customerId) return;

    if (extensionsAssetsAbortRef.current) {
      extensionsAssetsAbortRef.current.abort();
      extensionsAssetsAbortRef.current = null;
    }

    const abortController = new AbortController();
    extensionsAssetsAbortRef.current = abortController;
    const requestedCid = customerId;

    setIsLoadingExtensionsAssets(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/extensions-assets`, {
        method: "POST",
        signal: abortController.signal,
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          campaignType: campaignState.campaignType || "SEARCH"
        })
      });

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      if (data && requestedCid === customerId) {
        setExtensionsAssetsResult(data);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("[Extensions & Assets Error]:", err);
        setExtensionsAssetsResult({
          status: "UNAVAILABLE",
          itemsCount: 0,
          items: [],
          notice: "Google Ads extensions and assets are currently unavailable. You can continue with campaign creation."
        });
      }
    } finally {
      if (extensionsAssetsAbortRef.current === abortController) {
        setIsLoadingExtensionsAssets(false);
      }
    }
  };

  const runShoppingIntelligence = async () => {
    if (!customerId) return;
    if (campaignState.campaignType && campaignState.campaignType !== "SHOPPING" && campaignState.campaignType !== "PERFORMANCE_MAX") {
      return;
    }

    if (shoppingIntelAbortRef.current) {
      shoppingIntelAbortRef.current.abort();
      shoppingIntelAbortRef.current = null;
    }

    const abortController = new AbortController();
    shoppingIntelAbortRef.current = abortController;
    const requestedCid = customerId;

    setIsLoadingShoppingIntel(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/shopping-intelligence`, {
        method: "POST",
        signal: abortController.signal,
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          campaignType: campaignState.campaignType || "SHOPPING"
        })
      });

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      if (data && requestedCid === customerId) {
        setShoppingIntelResult(data);
        if (data.profileMerchantCenterId && !campaignState.merchantCenterId) {
          setCampaignState(prev => ({
            ...prev,
            merchantCenterId: data.profileMerchantCenterId
          }));
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("[Shopping Intelligence Error]:", err);
        setShoppingIntelResult({
          supported: true,
          status: "UNAVAILABLE",
          liveConnected: false,
          liveMerchantId: null,
          profileMerchantCenterId: campaignState.merchantCenterId || null,
          summary: { totalProducts: 0, approved: 0, disapproved: 0, expiring: 0, pending: 0 },
          profileProductsCount: 0,
          sampleProfileProducts: [],
          notice: "Merchant Center intelligence is temporarily unavailable. Live validation remains required prior to Shopping campaign creation."
        });
      }
    } finally {
      if (shoppingIntelAbortRef.current === abortController) {
        setIsLoadingShoppingIntel(false);
      }
    }
  };

  const runAppIntelligence = async () => {
    if (!customerId) return;
    if (campaignState.campaignType && campaignState.campaignType !== "APP") {
      return;
    }

    if (appIntelAbortRef.current) {
      appIntelAbortRef.current.abort();
      appIntelAbortRef.current = null;
    }

    const abortController = new AbortController();
    appIntelAbortRef.current = abortController;
    const requestedCid = customerId;

    setIsLoadingAppIntel(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/app-intelligence`, {
        method: "POST",
        signal: abortController.signal,
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          campaignType: campaignState.campaignType || "APP"
        })
      });

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      if (data && requestedCid === customerId) {
        setAppIntelResult(data);
        if (data.primaryApp && (!campaignState.appId || !campaignState.appStore)) {
          setCampaignState(prev => ({
            ...prev,
            appId: prev.appId || data.primaryApp.appId,
            appName: prev.appName || data.primaryApp.appName,
            platform: prev.platform || data.primaryApp.platform,
            appStore: prev.appStore || (data.primaryApp.platform === "IOS" ? "APPLE_APP_STORE" : "GOOGLE_APP_STORE")
          }));
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("[App Intelligence Error]:", err);
        setAppIntelResult({
          supported: true,
          status: "UNAVAILABLE",
          primaryApp: null,
          profileApps: [],
          liveAssets: [],
          totalAppsAvailable: 0,
          notice: "App intelligence is currently unavailable. You can continue configuring your App campaign manually."
        });
      }
    } finally {
      if (appIntelAbortRef.current === abortController) {
        setIsLoadingAppIntel(false);
      }
    }
  };

  const runConversionGoalIntelligence = async () => {
    if (!customerId) return;

    if (conversionGoalIntelAbortRef.current) {
      conversionGoalIntelAbortRef.current.abort();
      conversionGoalIntelAbortRef.current = null;
    }

    const abortController = new AbortController();
    conversionGoalIntelAbortRef.current = abortController;
    const requestedCid = customerId;

    setIsLoadingConversionGoalIntel(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/conversion-goal-intelligence`, {
        method: "POST",
        signal: abortController.signal,
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          campaignType: campaignState.campaignType || "SEARCH",
          objective: campaignState.objective || "LEADS"
        })
      });

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      if (data && requestedCid === customerId) {
        setConversionGoalIntelResult(data);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("[Conversion Goal Intelligence Error]:", err);
        setConversionGoalIntelResult({
          status: "UNAVAILABLE",
          summary: { totalGoalsEvaluated: 0, matchedCount: 0, profileOnlyCount: 0, liveOnlyCount: 0, liveConversionActionsCount: 0 },
          items: [],
          notice: "Conversion goal intelligence is temporarily unavailable. Live conversion actions remain required for conversion tracking."
        });
      }
    } finally {
      if (conversionGoalIntelAbortRef.current === abortController) {
        setIsLoadingConversionGoalIntel(false);
      }
    }
  };

  const runRecommendations = async () => {
    if (!customerId) return;

    if (recommendationsAbortRef.current) {
      recommendationsAbortRef.current.abort();
      recommendationsAbortRef.current = null;
    }

    const abortController = new AbortController();
    recommendationsAbortRef.current = abortController;
    const requestedCid = customerId;

    setIsLoadingRecommendations(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/recommendations`, {
        method: "POST",
        signal: abortController.signal,
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          campaignType: campaignState.campaignType || "SEARCH"
        })
      });

      const data = await res.json();
      if (res.ok && data && requestedCid === customerId) {
        setRecommendationsResult(data);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("[Recommendations Error]:", err);
        setRecommendationsResult({
          status: "UNAVAILABLE",
          recommendationsCount: 0,
          recommendations: [],
          notice: "Google Ads recommendations are currently unavailable. You can continue with campaign creation."
        });
      }
    } finally {
      if (recommendationsAbortRef.current === abortController) {
        setIsLoadingRecommendations(false);
      }
    }
  };

  const runPerformanceForecast = async (budgetOverride?: number) => {
    if (!customerId) return;
    const effectiveBudget = budgetOverride !== undefined ? budgetOverride : Number(campaignState.dailyBudget || 0);

    if (campaignState.campaignType && campaignState.campaignType !== "SEARCH") {
      setForecastResult({
        status: "UNSUPPORTED",
        warnings: [
          `Google Ads Performance Planner keyword forecasting is only supported for Search campaigns. "${campaignState.campaignType}" campaigns allocate budget across dynamic multi-channel placements.`
        ],
        notice: `Performance Planner forecast is not available for ${campaignState.campaignType}. You can proceed with your desired budget.`
      });
      return;
    }

    if (!effectiveBudget || effectiveBudget <= 0) {
      setForecastResult({
        status: "INVALID_CONFIGURATION",
        warnings: ["A positive daily budget is required to calculate a forecast."],
        notice: "Please set a daily budget (e.g. ₹500, ₹1,000, ₹2,000) to view Google Ads forecast."
      });
      return;
    }

    const approvedKeywords = (campaignState.keywords || [])
      .map(k => (typeof k === "string" ? k.trim() : ""))
      .filter(k => k.length > 0);

    if (approvedKeywords.length === 0) {
      setForecastResult({
        status: "INVALID_CONFIGURATION",
        warnings: ["At least one approved Search keyword is required to generate a forecast."],
        notice: "Add or approve Search keywords above to calculate estimated traffic and cost."
      });
      return;
    }

    if (forecastAbortRef.current) {
      forecastAbortRef.current.abort();
      forecastAbortRef.current = null;
    }

    const abortController = new AbortController();
    forecastAbortRef.current = abortController;
    const requestedCid = customerId;

    setIsLoadingForecast(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/performance-forecast`, {
        method: "POST",
        signal: abortController.signal,
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          campaignType: campaignState.campaignType || "SEARCH",
          dailyBudget: effectiveBudget,
          startDate: campaignState.startDate,
          endDate: campaignState.endDate,
          biddingStrategy: campaignState.biddingStrategy || "MAXIMIZE_CONVERSIONS",
          targetCpa: campaignState.targetCpa ? Number(campaignState.targetCpa) : undefined,
          targetRoas: campaignState.targetRoas ? Number(campaignState.targetRoas) : undefined,
          locations: campaignState.locations || ["India"],
          languages: campaignState.language ? [campaignState.language] : ["English"],
          keywords: approvedKeywords
        })
      });

      const data = await res.json();
      if (res.ok && data && requestedCid === customerId) {
        setForecastResult(data);
        setCampaignState(prev => ({
          ...prev,
          forecastSummary: data
        }));
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("[Performance Forecast Error]:", err);
        setForecastResult({
          status: "UNAVAILABLE",
          notice: "Google Ads forecast is currently unavailable. You can continue with the selected budget."
        });
      }
    } finally {
      if (forecastAbortRef.current === abortController) {
        setIsLoadingForecast(false);
      }
    }
  };

  const [isLoadingAudienceIntel, setIsLoadingAudienceIntel] = useState<boolean>(false);
  const [audienceIntelResult, setAudienceIntelResult] = useState<any>(null);

  const runAudienceIntelligence = async () => {
    if (!customerId) return;

    if (audienceIntelAbortRef.current) {
      audienceIntelAbortRef.current.abort();
      audienceIntelAbortRef.current = null;
    }

    const abortController = new AbortController();
    audienceIntelAbortRef.current = abortController;
    const requestedCid = customerId;

    setIsLoadingAudienceIntel(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/audience-intelligence`, {
        method: "POST",
        signal: abortController.signal,
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          campaignType: campaignState.campaignType || "PERFORMANCE_MAX"
        })
      });

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      if (data.success && requestedCid === customerId) {
        setAudienceIntelResult(data);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("[Audience Intelligence Error]:", err);
      }
    } finally {
      if (audienceIntelAbortRef.current === abortController) {
        setIsLoadingAudienceIntel(false);
      }
    }
  };

  // Auto-fetch audience intelligence when campaign type changes
  useEffect(() => {
    if (customerId && campaignState.campaignType && campaignState.campaignType !== "SEARCH") {
      const timer = setTimeout(() => {
        runAudienceIntelligence();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [campaignState.campaignType, customerId]);

  // When entering SEARCH or DISPLAY campaign with a website, seed keyword, or business name, auto-fetch intelligence
  useEffect(() => {
    if ((campaignState.campaignType === "SEARCH" || campaignState.campaignType === "DISPLAY") && customerId && (campaignState.website || campaignState.businessName || (campaignState.keywords && campaignState.keywords.length > 0))) {
      const timer = setTimeout(() => {
        runKeywordIntelligence();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [campaignState.campaignType, campaignState.website, campaignState.businessName]);

  // Auto-fetch account & profile extensions/assets when customerId and campaignType are present
  useEffect(() => {
    if (customerId && campaignState.campaignType) {
      const timer = setTimeout(() => {
        runExtensionsAssets();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [campaignState.campaignType, customerId]);

  // Phase 2C: Auto-fetch Shopping & Merchant Center intelligence (SHOPPING and PERFORMANCE_MAX only)
  useEffect(() => {
    if (
      customerId &&
      (campaignState.campaignType === "SHOPPING" ||
        (campaignState.campaignType === "PERFORMANCE_MAX" &&
          (campaignState.merchantCenterId || customerProfileData?.hasMerchantAccount || customerProfileData?.merchantCenterId)))
    ) {
      const timer = setTimeout(() => {
        runShoppingIntelligence();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [campaignState.campaignType, campaignState.merchantCenterId, customerProfileData?.merchantCenterId, customerId]);

  // Phase 2C: Auto-fetch App Promotion intelligence (APP only)
  useEffect(() => {
    if (customerId && campaignState.campaignType === "APP") {
      const timer = setTimeout(() => {
        runAppIntelligence();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [campaignState.campaignType, customerId]);

  // Phase 2D: Auto-fetch Conversion Goal Intelligence when customerId, campaignType, or objective changes
  useEffect(() => {
    if (customerId && campaignState.campaignType) {
      const timer = setTimeout(() => {
        runConversionGoalIntelligence();
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [campaignState.campaignType, campaignState.objective, customerId]);

  // Phase 2D: Auto-fetch Recommendations when customerId and campaignType are selected
  useEffect(() => {
    if (customerId && campaignState.campaignType) {
      const timer = setTimeout(() => {
        runRecommendations();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [campaignState.campaignType, customerId]);

  // Recalculate Performance Planner forecast when daily budget, campaign type, keywords, or dates change
  useEffect(() => {
    if (
      customerId &&
      campaignState.campaignType === "SEARCH" &&
      campaignState.dailyBudget &&
      campaignState.dailyBudget > 0 &&
      campaignState.keywords &&
      campaignState.keywords.length > 0
    ) {
      const timer = setTimeout(() => {
        runPerformanceForecast();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [
    campaignState.campaignType,
    campaignState.dailyBudget,
    campaignState.keywords?.length,
    campaignState.startDate,
    campaignState.endDate,
    customerId
  ]);

  useEffect(() => {
    if (campaignState.campaignType && customerId) {
      const timeout = setTimeout(() => {
        runPreflightCheck(campaignState);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [
    campaignState.campaignType,
    campaignState.objective,
    campaignState.dailyBudget,
    campaignState.headlines?.length,
    campaignState.descriptions?.length,
    campaignState.images?.length,
    campaignState.logos?.length,
    campaignState.keywords?.length,
    customerId
  ]);

  // Auto-refresh final review whenever critical fields change
  useEffect(() => {
    if (campaignState.campaignType && customerId) {
      const timer = setTimeout(() => {
        runFinalReview(campaignState);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [
    campaignState.campaignType,
    campaignState.objective,
    campaignState.dailyBudget,
    campaignState.keywords?.length,
    campaignState.campaignNegativeKeywords?.length,
    campaignState.audienceSignalIds?.length,
    campaignState.recommendationInsights?.length,
    campaignState.extensionsAndAssets?.length,
    campaignState.headlines?.length,
    campaignState.descriptions?.length,
    customerId
  ]);

  const handleCreateCampaign = async () => {
    if (!userConfirmed) {
      setPublishError("Please confirm that you have reviewed the campaign configuration before creating.");
      return;
    }

    // Rule: AI Guided must use youtubeConnection.isConnected as the ONLY YouTube authentication truth.
    const isYtConnected = Boolean(customerProfileData?.youtubeConnection?.isConnected);
    if (campaignState.campaignType === "VIDEO" && !isYtConnected) {
      setPublishError("YouTube connection is required for Video campaigns. Connect your YouTube channel to continue.");
      return;
    }
    const dgFormat = ((campaignState as any).adFormat || "").toUpperCase();
    if (campaignState.campaignType === "DEMAND_GEN" && dgFormat === "VIDEO" && !isYtConnected) {
      setPublishError("YouTube connection is required for Video Demand Gen campaigns. Connect your YouTube channel to continue.");
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);

    // Client-side idempotency key based on customer, plan name, budget and timestamp hour
    const idempotencyKey = `idemp-${customerId.replace(/-/g, "")}-${(campaignState.campaignName || "camp").replace(/\s+/g, "_")}-${Math.floor(Date.now() / 60000)}`;

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/create-campaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId,
          "x-idempotency-key": idempotencyKey
        },
        body: JSON.stringify({
          customerId,
          campaignState,
          userConfirmed: true,
          idempotencyKey
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create campaign. Validation requirements may be missing.");
      }

      setCreationResultData(data.result);
      setPublishSuccess(`🎉 Campaign "${data.result?.campaignName || campaignState.campaignName || "Campaign"}" created successfully in Google Ads!`);

      // Refresh final review to update status
      runFinalReview(campaignState);

      setTimeout(() => {
        onClose();
        router.push(`/ads/campaigns?customerId=${customerId}`);
      }, 3500);
    } catch (err: any) {
      console.error("[Publish Error]:", err);
      setPublishError(err.message || "Failed to publish campaign to Google Ads.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEditDetailsInForm = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("googleAds_prefill_campaign", JSON.stringify(campaignState));
      }
    } catch (e) {
      console.warn("Could not write prefill draft to localStorage", e);
    }
    onClose();
    router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
  };

  // Phase 3: Explicit AI Guided -> Profile Save-Back calculation and handler
  const calculateProfileChanges = () => {
    const prof = customerProfileData || {};
    const changes: {
      businessName?: string;
      businessDescription?: string;
      primaryWebsite?: string;
      locations?: string[];
      seoKeywords?: string[];
      negativeKeywords?: string[];
      conversionGoals?: string[];
      merchantCenterId?: string;
      appId?: string;
      appStore?: string;
    } = {};
    const summary: string[] = [];

    // Business Name
    const stateBizName = (campaignState.businessName || campaignState.business?.name || "").trim();
    const profBizName = (prof.businessName || "").trim();
    if (stateBizName && stateBizName.toLowerCase() !== profBizName.toLowerCase()) {
      changes.businessName = stateBizName;
      summary.push(`Business Name: Updated ("${stateBizName}")`);
    }

    // Business Description
    const stateDesc = (campaignState.business?.description || "").trim();
    const profDesc = (prof.businessDescription || "").trim();
    if (stateDesc && stateDesc.toLowerCase() !== profDesc.toLowerCase()) {
      changes.businessDescription = stateDesc;
      summary.push("Business Description: Updated");
    }

    // Website
    const stateWeb = (campaignState.website || campaignState.business?.website || "").trim();
    const profWeb = (prof.primaryWebsite || "").trim();
    if (stateWeb && stateWeb.toLowerCase() !== profWeb.toLowerCase()) {
      changes.primaryWebsite = stateWeb;
      summary.push(`Website: Updated ("${stateWeb}")`);
    }

    // Locations
    const profLocations: string[] = Array.isArray(prof.locations)
      ? prof.locations.map((l: any) => String(l || "").toLowerCase().trim())
      : [];
    const newLocations = (campaignState.locations || []).filter(
      (loc: string) => loc && !profLocations.includes(loc.toLowerCase().trim())
    );
    if (newLocations.length > 0) {
      changes.locations = newLocations;
      summary.push(`Locations: +${newLocations.length} (${newLocations.slice(0, 3).join(", ")})`);
    }

    // Keywords
    const profKeywords: string[] = Array.isArray(prof.seoKeywords)
      ? prof.seoKeywords.map((k: any) => (typeof k === "string" ? k : k?.keyword || "").toLowerCase().trim())
      : [];
    const newKeywords = (campaignState.keywords || []).filter(
      (kw: string) => kw && !profKeywords.includes(kw.toLowerCase().trim())
    );
    if (newKeywords.length > 0) {
      changes.seoKeywords = newKeywords;
      summary.push(`Keywords: +${newKeywords.length}`);
    }

    // Negative Keywords
    const profNegs: string[] = Array.isArray(prof.negativeKeywords)
      ? prof.negativeKeywords.map((nk: any) => (typeof nk === "string" ? nk : nk?.keyword || "").toLowerCase().trim())
      : [];
    const newNegs = (campaignState.campaignNegativeKeywords || []).filter(
      (nkw: string) => nkw && !profNegs.includes(nkw.toLowerCase().trim())
    );
    if (newNegs.length > 0) {
      changes.negativeKeywords = newNegs;
      summary.push(`Negative Keywords: +${newNegs.length}`);
    }

    // Conversion Goals
    const profGoals: string[] = Array.isArray(prof.conversionGoals)
      ? prof.conversionGoals.map((cg: any) => (typeof cg === "string" ? cg : cg?.goalName || cg?.name || "").toLowerCase().trim())
      : [];
    const newGoals = (campaignState.conversionGoals || []).filter(
      (cg: string) => cg && !profGoals.includes(cg.toLowerCase().trim())
    );
    if (newGoals.length > 0) {
      changes.conversionGoals = newGoals;
      summary.push(`Conversion Goals: +${newGoals.length}`);
    }

    // Merchant Center ID
    const stateMid = (campaignState.merchantCenterId || "").trim();
    const profMid = (prof.merchantCenterId || "").trim();
    if (stateMid && stateMid !== profMid) {
      changes.merchantCenterId = stateMid;
      summary.push(`Merchant Center ID: Updated ("${stateMid}")`);
    }

    // App ID
    const stateAppId = (campaignState.appId || "").trim();
    const profApps: string[] = Array.isArray(prof.appDetails)
      ? prof.appDetails.map((a: any) => (a?.appId || "").trim())
      : [];
    if (stateAppId && !profApps.includes(stateAppId)) {
      changes.appId = stateAppId;
      changes.appStore = campaignState.appStore || "GOOGLE_APP_STORE";
      summary.push(`App ID: Added ("${stateAppId}")`);
    }

    return { changes, summary };
  };

  const handleSaveToBusinessProfile = async () => {
    if (!customerId || isSavingProfile) return;
    const { changes, summary } = calculateProfileChanges();

    if (summary.length === 0) {
      setProfileSaveSuccess("Profile is already up to date with campaign context.");
      setShowSaveProfileModal(false);
      return;
    }

    setIsSavingProfile(true);
    setProfileSaveError(null);
    setProfileSaveSuccess(null);

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/save-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          approvedChanges: changes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save changes to Business Profile.");
      }

      // Update AI Guided profile context from the server response
      if (data.customerProfile) {
        setCustomerProfileData(data.customerProfile);
      }
      setProfileSaveSuccess(data.message || "Business Profile updated successfully!");
      setShowSaveProfileModal(false);
    } catch (err: any) {
      console.error("[Profile Save Error]:", err);
      setProfileSaveError(err.message || "Failed to save profile changes.");
    } finally {
      setIsSavingProfile(false);
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

  const formatGoalName = (goals?: string[]) => {
    if (!goals || goals.length === 0) return "Not set";
    const mapping: Record<string, string> = {
      phone_leads: "Phone Calls",
      contacts: "Contact Forms",
      get_directions: "Store Directions",
      website_purchases: "Online Purchases",
      views: "Video Views",
      reach: "Brand Reach",
      engagements: "Engagements",
      subscriptions: "Subscriptions",
      installs: "App Installs"
    };
    return goals.map(g => mapping[g] || g).join(", ");
  };

  const allAssetsCount = (campaignState.images?.length || 0) + (campaignState.logos?.length || 0) + (campaignState.videos?.length || 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Hidden File Input for Native Media Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="relative w-full max-w-6xl h-[92vh] max-h-[850px] bg-slate-100 rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-900">
        
        {/* Top Modal Header */}
        <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-blue-500/20 shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Google Ads AI Campaign Studio</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Live Copilot
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMessages([]);
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
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body Split View */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT: AI Chat Column */}
          <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-slate-200 shadow-xs">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                        msg.role === "user"
                          ? "bg-slate-800 text-white"
                          : "bg-blue-600 text-white shadow-blue-500/20 shadow-md"
                      }`}
                    >
                      {msg.role === "user" ? "You" : <Sparkles className="h-4 w-4" />}
                    </div>

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

                      {/* AI Proposed Campaign Changes Confirmation Box */}
                      {msg.role === "assistant" && msg.proposedCampaignState && (
                        <div className={`mt-3.5 pt-3 border-t rounded-xl p-3 transition-all ${
                          msg.isApplied
                            ? "bg-emerald-50/80 border border-emerald-200 shadow-2xs"
                            : msg.isDismissed
                            ? "bg-slate-100/80 border border-slate-200"
                            : "bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-200 shadow-xs"
                        }`}>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shadow-xs ${
                                msg.isApplied
                                  ? "bg-emerald-600 text-white"
                                  : msg.isDismissed
                                  ? "bg-slate-500 text-white"
                                  : "bg-blue-600 text-white"
                              }`}>
                                {msg.isApplied ? <Check className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                              </div>
                              <div>
                                <h4 className="font-bold text-[11px] text-slate-900 leading-tight">
                                  {msg.isApplied 
                                    ? "Campaign Setup Applied"
                                    : msg.isDismissed
                                    ? "Suggested Updates Skipped"
                                    : "Review AI Generated Campaign Data"}
                                </h4>
                                <p className="text-[9px] text-slate-500 leading-tight">
                                  {msg.isApplied
                                    ? "These settings have been loaded into your campaign setup."
                                    : msg.isDismissed
                                    ? "Existing campaign configuration remains unchanged."
                                    : "Please confirm before updating your active campaign form."}
                                </p>
                              </div>
                            </div>

                            {msg.isApplied ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Applied
                              </span>
                            ) : msg.isDismissed ? (
                              <button
                                type="button"
                                onClick={() => applyProposedCampaignState(msg.proposedCampaignState!, msg.id)}
                                className="text-[9px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                              >
                                Apply anyway
                              </button>
                            ) : null}
                          </div>

                          {/* Summary Grid of Generated Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] mb-2.5">
                            {/* Dates */}
                            {(msg.proposedCampaignState.startDate || msg.proposedCampaignState.endDate) && (
                              <div className="flex items-start gap-1.5 bg-white/95 p-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                                <Calendar className="h-3 w-3 text-blue-600 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Dates</span>
                                  <span className="font-semibold text-slate-800 truncate block">
                                    {msg.proposedCampaignState.startDate || "Immediate"} → {msg.proposedCampaignState.endDate || "Ongoing"}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Campaign Type & Objective */}
                            {(msg.proposedCampaignState.campaignType || msg.proposedCampaignState.objective) && (
                              <div className="flex items-start gap-1.5 bg-white/95 p-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                                <Target className="h-3 w-3 text-indigo-600 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Objective & Type</span>
                                  <span className="font-semibold text-slate-800 truncate block">
                                    {[msg.proposedCampaignState.objective, msg.proposedCampaignState.campaignType].filter(Boolean).join(" • ")}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Budget & Bidding */}
                            {(msg.proposedCampaignState.dailyBudget || msg.proposedCampaignState.biddingStrategy) && (
                              <div className="flex items-start gap-1.5 bg-white/95 p-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                                <DollarSign className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">
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
                              <div className="flex items-start gap-1.5 bg-white/95 p-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                                <MapPin className="h-3 w-3 text-rose-600 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Locations</span>
                                  <span className="font-semibold text-slate-800 truncate block">
                                    {msg.proposedCampaignState.locations.join(", ")}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Ad Copy */}
                            {((msg.proposedCampaignState.headlines && msg.proposedCampaignState.headlines.length > 0) || 
                              (msg.proposedCampaignState.descriptions && msg.proposedCampaignState.descriptions.length > 0)) && (
                              <div className="flex items-start gap-1.5 bg-white/95 p-1.5 rounded-lg border border-slate-200/80 shadow-2xs sm:col-span-2">
                                <FileText className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Ad Copy</span>
                                  <span className="font-semibold text-slate-800 block">
                                    {msg.proposedCampaignState.headlines?.length || 0} Headlines, {msg.proposedCampaignState.descriptions?.length || 0} Descriptions
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Keywords */}
                            {msg.proposedCampaignState.keywords && msg.proposedCampaignState.keywords.length > 0 && (
                              <div className="flex items-start gap-1.5 bg-white/95 p-1.5 rounded-lg border border-slate-200/80 shadow-2xs sm:col-span-2">
                                <Tag className="h-3 w-3 text-blue-600 shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Keywords ({msg.proposedCampaignState.keywords.length})</span>
                                  <span className="text-[9px] text-slate-700 block truncate">
                                    {msg.proposedCampaignState.keywords.slice(0, 5).join(", ")}
                                    {msg.proposedCampaignState.keywords.length > 5 ? ` +${msg.proposedCampaignState.keywords.length - 5} more` : ""}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {!msg.isApplied && !msg.isDismissed && (
                            <div className="flex items-center gap-2 pt-1 border-t border-blue-100">
                              <button
                                type="button"
                                onClick={() => applyProposedCampaignState(msg.proposedCampaignState!, msg.id)}
                                className="flex-1 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-[11px] rounded-lg shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Check className="h-3 w-3" />
                                <span>Confirm & Update</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => dismissProposedCampaignState(msg.id)}
                                className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[11px] rounded-lg border border-slate-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                                <span>Dismiss</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive Suggestion Chips */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-200">
                          {msg.suggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                if (s.toLowerCase().includes("upload")) {
                                  fileInputRef.current?.click();
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
                        : "AI Copilot is formulating recommendations..."}
                    </span>
                  </div>
                </div>
              )}

              {publishSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-3 shadow-md">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-emerald-900">{publishSuccess}</p>
                    <p className="text-[11px] text-emerald-700">Redirecting to campaign dashboard...</p>
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

            {/* Quick Pills & Input Form */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 shrink-0 mr-1">Quick:</span>
                {messages.length <= 1 && (
                  <>
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
                  </>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <Upload className="h-3 w-3" />
                  Upload Media
                </button>
              </div>

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

          {/* RIGHT: Live Campaign Cockpit */}
          <div className="w-full lg:w-[420px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col p-5 overflow-y-auto space-y-4 shrink-0 shadow-xs">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
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

            {/* Phase 3: Business Profile Sync Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-xs text-slate-900">Business Profile Sync</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    Phase 3
                  </span>
                </div>
                {isLoadingProfile ? (
                  <span className="flex items-center gap-1 text-[10px] text-blue-600 font-mono">
                    <Loader2 className="h-3 w-3 animate-spin" /> Syncing...
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-500 font-mono">
                    CID: {customerId || "None"}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-600 leading-snug">
                {customerProfileData?.businessName ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800 flex items-center gap-1">
                      <span className="text-emerald-600">✓</span> {customerProfileData.businessName}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {customerProfileData.primaryWebsite || "No primary website in profile"}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No business profile connected yet.</p>
                )}
              </div>

              {profileSaveSuccess && (
                <div className="text-[11px] p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{profileSaveSuccess}</span>
                </div>
              )}

              {profileSaveError && (
                <div className="text-[11px] p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-1.5 animate-in fade-in">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{profileSaveError}</span>
                </div>
              )}

              <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  {calculateProfileChanges().summary.length > 0
                    ? `${calculateProfileChanges().summary.length} new update(s) detected`
                    : "Profile up to date"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowSaveProfileModal(true)}
                  disabled={isSavingProfile || isLoadingProfile}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-all shadow-xs cursor-pointer flex items-center gap-1"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3" /> Save to Business Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Campaign Strategy Card (11 Fields) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCampaignIcon(campaignState.campaignType)}
                  <span className="font-bold text-xs text-slate-900">Campaign Strategy</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  campaignState.objective
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  {campaignState.objective || "NOT SET"}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Business:</span>
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
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Campaign Name:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px] text-right">
                    {campaignState.campaignName || "Auto-generated after business info"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Objective:</span>
                  <span className="font-semibold text-blue-700">
                    {campaignState.objective ? `${campaignState.objective} ✓` : "Not set"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Conversion Goal:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[200px] text-right">
                    {formatGoalName(campaignState.conversionGoals)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Campaign Type:</span>
                  <span className="font-semibold text-purple-700 flex items-center gap-1">
                    {campaignState.campaignType ? (
                      <>
                        {getCampaignIcon(campaignState.campaignType)}
                        {campaignState.campaignType}
                      </>
                    ) : (
                      <span className="text-slate-400 font-normal italic">Not set</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Website:</span>
                  <span className="font-mono text-blue-600 truncate max-w-[200px] text-right">
                    {campaignState.website || "Not set"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Daily Budget:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {campaignState.dailyBudget && campaignState.dailyBudget > 0 ? (
                      `₹${campaignState.dailyBudget.toLocaleString()}/day ✓`
                    ) : (
                      <span className="text-slate-400 font-normal italic">Not set</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-800 font-medium">
                    {campaignState.locations && campaignState.locations.length > 0 ? campaignState.locations.join(", ") : "India"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Language:</span>
                  <span className="text-slate-800 font-medium">{campaignState.language || "English"}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Bidding Strategy:</span>
                  <span className="font-semibold text-slate-800 text-[11px]">
                    {campaignState.biddingStrategy || "MAXIMIZE_CONVERSIONS"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Keywords:</span>
                  <span className="font-mono text-slate-800">
                    {campaignState.keywords && campaignState.keywords.length > 0
                      ? `${campaignState.keywords.length} configured`
                      : "None"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Ad Copy Assets:</span>
                  <span className="font-mono text-slate-800">
                    {campaignState.headlines?.length || 0} headlines, {campaignState.descriptions?.length || 0} descriptions
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Start Date:</span>
                  <span className="text-slate-800 font-medium font-mono">{campaignState.startDate || todayIso}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">End Date:</span>
                  <span className="text-slate-800 font-medium font-mono">{campaignState.endDate || "Ongoing"}</span>
                </div>

                {Boolean(campaignState.merchantCenterId) && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500">Merchant Center:</span>
                    <span className="text-emerald-700 font-medium font-mono text-[11px] truncate max-w-[190px]">
                      {campaignState.merchantCenterId}
                    </span>
                  </div>
                )}

                {Boolean(campaignState.appId) && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500">App ID:</span>
                    <span className="text-indigo-700 font-medium font-mono text-[11px] truncate max-w-[190px]">
                      {campaignState.appId} ({campaignState.appStore === "APPLE_APP_STORE" ? "iOS" : "Android"})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Structured CampaignPlan Preflight & Readiness Diagnostics Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-xs text-slate-900">Preflight & Readiness</span>
                </div>
                {isValidatingPreflight ? (
                  <span className="flex items-center gap-1 text-[10px] text-blue-600 font-mono">
                    <Loader2 className="h-3 w-3 animate-spin" /> Checking...
                  </span>
                ) : preflightData ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    preflightData.passed
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-rose-50 text-rose-700 border-rose-300"
                  }`}>
                    {preflightData.passed ? "PREFLIGHT PASSED" : "ACTION REQUIRED"}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">Pending Plan</span>
                )}
              </div>

              {/* Account Readiness Status Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600">Billing Active:</span>
                  <span className={`font-bold ${preflightData?.billingActive ? "text-emerald-600" : "text-amber-600"}`}>
                    {preflightData?.billingActive ? "Active ✓" : "Verifying"}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600">Conversion Setup:</span>
                  <span className={`font-bold ${preflightData?.conversionTrackingActive ? "text-emerald-600" : "text-amber-600"}`}>
                    {preflightData?.conversionTrackingActive ? "Active ✓" : "Review Recommended"}
                  </span>
                </div>
              </div>

              {/* Preflight Missing Requirements / Exact Diagnostics */}
              {preflightData && preflightData.issues && preflightData.issues.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Preflight Diagnostics ({preflightData.issues.length})
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {preflightData.issues.map((iss, i) => (
                      <div
                        key={i}
                        className={`text-[11px] p-2 rounded-xl border flex items-start gap-1.5 ${
                          iss.level === "ERROR"
                            ? "bg-rose-50 border-rose-200 text-rose-900"
                            : "bg-amber-50 border-amber-200 text-amber-900"
                        }`}
                      >
                        <AlertCircle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                          iss.level === "ERROR" ? "text-rose-600" : "text-amber-600"
                        }`} />
                        <span className="leading-snug">
                          {iss.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Phase 2D: Conversion Goal Intelligence Card (Profile Intent vs Live Google Ads Actions) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-900">Conversion Goals & Actions</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live Verified
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isLoadingConversionGoalIntel ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono">
                      <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => runConversionGoalIntelligence()}
                      className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </button>
                  )}
                </div>
              </div>

              {isLoadingConversionGoalIntel ? (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-[11px] text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-emerald-500" />
                  <span>Comparing profile intent with live Google Ads conversion actions...</span>
                </div>
              ) : conversionGoalIntelResult?.items && conversionGoalIntelResult.items.length > 0 ? (
                <div className="space-y-2">
                  {/* Summary Badges */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="p-1.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-500 block">Matched</span>
                      <span className="font-bold font-mono text-emerald-700">
                        {conversionGoalIntelResult.summary?.matchedCount || 0}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-500 block">Profile Only</span>
                      <span className="font-bold font-mono text-amber-700">
                        {conversionGoalIntelResult.summary?.profileOnlyCount || 0}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-500 block">Live Actions</span>
                      <span className="font-bold font-mono text-blue-700">
                        {conversionGoalIntelResult.summary?.liveOnlyCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* List of Evaluated Goals & Actions */}
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {conversionGoalIntelResult.items.map((item: any, idx: number) => {
                      const isMatched = item.classification === "MATCHED";
                      const isProfileOnly = item.classification === "PROFILE_ONLY";

                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl border text-[11px] space-y-1 ${
                            isMatched
                              ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                              : isProfileOnly
                              ? "bg-amber-50/60 border-amber-200 text-amber-950"
                              : "bg-white border-slate-200 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold truncate max-w-[190px]">
                              {item.goal}
                            </span>
                            <span
                              className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                isMatched
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : isProfileOnly
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {isMatched
                                ? "✓ MATCHED LIVE"
                                : isProfileOnly
                                ? "⚠ PROFILE INTENT ONLY"
                                : "LIVE GOOGLE ADS ACTION"}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-600 leading-snug">
                            {item.explanation}
                          </p>

                          {item.liveCategory && (
                            <div className="flex justify-between items-center text-[9px] text-slate-400 pt-0.5 border-t border-slate-100 font-mono">
                              <span>Category: {item.liveCategory}</span>
                              {item.conversionsLast30Days !== undefined && (
                                <span className="text-emerald-700 font-semibold">
                                  {item.conversionsLast30Days} convs (30d)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Advisory Notice */}
                  {conversionGoalIntelResult.notice && (
                    <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-[10px] text-slate-600 flex items-start gap-1.5">
                      <HelpCircle className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{conversionGoalIntelResult.notice}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-[11px] text-slate-500 space-y-1">
                  <p className="font-medium text-slate-700">No conversion goals or live actions detected</p>
                  <p className="text-[10px] text-slate-400">
                    Click "Refresh" to verify live Google Ads conversion tracking for this account.
                  </p>
                </div>
              )}
            </div>

            {/* Performance Forecast Card (Advisory Google Ads Performance Planner Integration) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-900">Performance Forecast</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Google Ads Forecast
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isLoadingForecast ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono">
                      <Loader2 className="h-3 w-3 animate-spin" /> Forecasting...
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => runPerformanceForecast()}
                      className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Recalculate
                    </button>
                  )}
                </div>
              </div>

              {/* Campaign Type Guardrail Check */}
              {campaignState.campaignType && campaignState.campaignType !== "SEARCH" ? (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <p className="font-medium text-slate-700">Performance Planner forecast is available for Search campaigns.</p>
                  <p className="text-[10px] text-slate-400">
                    "{campaignState.campaignType}" allocates budget and targeting dynamically across multi-channel inventories. You can proceed with your chosen budget.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Budget Quick Adjustment Buttons (Triggers real recalculation) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">Daily Budget:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {campaignState.dailyBudget && campaignState.dailyBudget > 0
                          ? `₹${Number(campaignState.dailyBudget).toLocaleString()}/day`
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[500, 1000, 2000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setCampaignState(prev => ({ ...prev, dailyBudget: amt }));
                            runPerformanceForecast(amt);
                          }}
                          className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-semibold transition-all border cursor-pointer ${
                            campaignState.dailyBudget === amt
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                        >
                          ₹{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Forecast Results Grid or Status Notices */}
                  {forecastResult?.status === "SUCCESS" && forecastResult.metrics ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1 border-b border-slate-200">
                        <span>Forecast Period:</span>
                        <span className="font-mono font-medium text-slate-800">
                          {forecastResult.forecastPeriod?.startDate} – {forecastResult.forecastPeriod?.endDate}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                          <span className="text-[10px] text-slate-500 block">Estimated Clicks</span>
                          <span className="font-bold text-sm text-slate-900 font-mono">
                            {forecastResult.metrics.clicks !== undefined
                              ? forecastResult.metrics.clicks.toLocaleString()
                              : "—"}
                          </span>
                          <span className="text-[9px] text-slate-400 block">Google Ads Forecast</span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                          <span className="text-[10px] text-slate-500 block">Estimated Cost</span>
                          <span className="font-bold text-sm text-emerald-700 font-mono">
                            {forecastResult.metrics.cost !== undefined
                              ? `${forecastResult.currencyCode || "INR"} ${forecastResult.metrics.cost.toLocaleString()}`
                              : "—"}
                          </span>
                          <span className="text-[9px] text-slate-400 block">For forecast period</span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                          <span className="text-[10px] text-slate-500 block">Average CPC</span>
                          <span className="font-bold text-xs text-slate-800 font-mono">
                            {forecastResult.metrics.averageCpc !== undefined
                              ? `${forecastResult.currencyCode || "INR"} ${forecastResult.metrics.averageCpc.toFixed(2)}`
                              : "—"}
                          </span>
                          <span className="text-[9px] text-slate-400 block">Estimated avg cost</span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                          <span className="text-[10px] text-slate-500 block">Conversions</span>
                          <span className="font-bold text-xs text-slate-800 font-mono">
                            {forecastResult.metrics.conversions !== undefined
                              ? forecastResult.metrics.conversions
                              : "Not projected"}
                          </span>
                          <span className="text-[9px] text-slate-400 block">
                            {forecastResult.metrics.averageCpa !== undefined
                              ? `Avg CPA: ${forecastResult.currencyCode || "INR"} ${forecastResult.metrics.averageCpa.toFixed(2)}`
                              : "Historical model"}
                          </span>
                        </div>
                      </div>

                      {/* Advisory Notice */}
                      <p className="text-[9px] text-slate-400 italic text-center pt-0.5">
                        * Google Ads Forecast is an estimate based on auction history and keywords. Not a guarantee.
                      </p>
                    </div>
                  ) : forecastResult?.status === "UNAVAILABLE" ? (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                      <p className="font-medium">Google Ads forecast is currently unavailable.</p>
                      <p className="text-[10px] text-amber-700">You can continue with your selected budget.</p>
                    </div>
                  ) : forecastResult?.status === "INVALID_CONFIGURATION" ? (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-[11px] text-slate-500 space-y-1">
                      <p className="font-medium text-slate-700">Forecast requires budget & approved keywords.</p>
                      <p className="text-[10px] text-slate-400">
                        {forecastResult.warnings?.[0] || "Select positive daily budget and at least 1 Search keyword."}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-[11px] text-slate-500 space-y-1">
                      <p className="font-medium text-slate-700">Performance Planner Forecast</p>
                      <p className="text-[10px] text-slate-400">
                        Click "Recalculate" or select a budget above to generate estimated clicks & CPC.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Google Ads Recommendations & Insights Card (Advisory Integration) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span className="font-bold text-xs text-slate-900">Google Ads Recommendations</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    Advisory
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isLoadingRecommendations ? (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-mono">
                      <Loader2 className="h-3 w-3 animate-spin" /> Fetching...
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => runRecommendations()}
                      className="text-[10px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </button>
                  )}
                </div>
              </div>

              {/* Status or Recommendation Items */}
              {isLoadingRecommendations ? (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-[11px] text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-amber-500" />
                  <span>Checking Google Ads recommendations for this account...</span>
                </div>
              ) : recommendationsResult?.recommendations && recommendationsResult.recommendations.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Available Optimizations:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {recommendationsResult.recommendations.length} recommendations
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {recommendationsResult.recommendations.map((rec) => {
                      const isApproved = (campaignState.recommendationInsights || []).some(
                        r => r.id === rec.id && r.approved
                      );

                      return (
                        <div
                          key={rec.id}
                          className={`p-2.5 rounded-xl border text-[11px] space-y-1.5 transition-all ${
                            isApproved
                              ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/40"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div>
                              <span className="font-bold text-slate-900 text-xs block leading-tight">
                                {rec.title}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono border border-slate-200">
                                  {rec.type.replace(/_/g, " ")}
                                </span>
                                {rec.campaignName && (
                                  <span className="text-[9px] text-slate-500 truncate max-w-[130px]">
                                    {rec.campaignName}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[9px] font-semibold text-slate-400 shrink-0">
                              Google Ads
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-600 leading-snug">
                            {rec.description}
                          </p>

                          {/* Profile context reasoning if available */}
                          {(rec as any).profileReasoning && (
                            <div className="p-1.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-[9px] text-amber-800">
                              <span className="font-semibold">Profile Context: </span>
                              {(rec as any).profileReasoning}
                            </div>
                          )}

                          {/* Impact Metrics (if actually returned by Google Ads) */}
                          {rec.impact?.hasImpact && (
                            <div className="flex flex-wrap gap-2 text-[9px] pt-1 border-t border-slate-100 font-mono text-slate-700">
                              {rec.impact.deltaClicks !== undefined && rec.impact.deltaClicks !== 0 && (
                                <span className="text-emerald-700 font-semibold">
                                  +{rec.impact.deltaClicks.toLocaleString()} est. clicks
                                </span>
                              )}
                              {rec.impact.deltaCost !== undefined && rec.impact.deltaCost !== 0 && (
                                <span className="text-slate-600">
                                  +{rec.impact.deltaCost.toLocaleString()} est. cost
                                </span>
                              )}
                              {rec.impact.deltaConversions !== undefined && rec.impact.deltaConversions !== 0 && (
                                <span className="text-purple-700 font-semibold">
                                  +{rec.impact.deltaConversions} est. conversions
                                </span>
                              )}
                            </div>
                          )}

                          {/* User review selection actions (Advisory only — no automatic apply/dismiss mutations) */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                            <span className="text-slate-400 text-[9px] italic">Advisory — review before applying</span>
                            {isApproved ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCampaignState(prev => ({
                                    ...prev,
                                    recommendationInsights: (prev.recommendationInsights || []).filter(r => r.id !== rec.id)
                                  }));
                                }}
                                className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                              >
                                ✕ Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const approvedItem: RecommendationInsight = {
                                    ...rec,
                                    approved: true
                                  };
                                  setCampaignState(prev => ({
                                    ...prev,
                                    recommendationInsights: [
                                      ...(prev.recommendationInsights || []).filter(r => r.id !== rec.id),
                                      approvedItem
                                    ]
                                  }));
                                }}
                                className="text-amber-700 hover:text-amber-800 font-bold cursor-pointer"
                              >
                                ✓ Include in Plan
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : recommendationsResult?.status === "UNAVAILABLE" ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                  <p className="font-medium">Google Ads recommendations are currently unavailable.</p>
                  <p className="text-[10px] text-amber-700">You can proceed with your campaign without recommendations.</p>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-[11px] text-slate-500 space-y-1">
                  <p className="font-medium text-slate-700">No active Google Ads recommendations</p>
                  <p className="text-[10px] text-slate-400">
                    Click "Refresh" to inspect live optimization opportunities for this account.
                  </p>
                </div>
              )}
            </div>

            {/* Google Ads Extensions & Assets Card (Advisory Integration) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <span className="font-bold text-xs text-slate-900">Extensions & Assets</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Existing Assets
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isLoadingExtensionsAssets ? (
                    <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-mono">
                      <Loader2 className="h-3 w-3 animate-spin" /> Fetching...
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => runExtensionsAssets()}
                      className="text-[10px] text-indigo-700 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </button>
                  )}
                </div>
              </div>

              {/* Status or Asset Items */}
              {isLoadingExtensionsAssets ? (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-[11px] text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-indigo-500" />
                  <span>Checking existing Google Ads extensions & assets...</span>
                </div>
              ) : extensionsAssetsResult?.items && extensionsAssetsResult.items.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Available Account Assets:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {extensionsAssetsResult.items.length} items
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {extensionsAssetsResult.items.map((item) => {
                      const isApproved = (campaignState.extensionsAndAssets || []).some(
                        ea => ea.id === item.id && ea.approved
                      );

                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl border text-[11px] space-y-1.5 transition-all ${
                            isApproved
                              ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400/40"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div>
                              <span className="font-bold text-slate-900 text-xs block leading-tight">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono border border-slate-200">
                                  {item.type.replace(/_/g, " ")}
                                </span>
                                {item.campaignName && (
                                  <span className="text-[9px] text-slate-500 truncate max-w-[130px]">
                                    {item.campaignName}
                                  </span>
                                )}
                              </div>
                            </div>
                            {item.source === "PROFILE" ? (
                              <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                                Profile Asset
                              </span>
                            ) : (
                              <span className="text-[9px] font-semibold text-slate-400 shrink-0">
                                Google Ads
                              </span>
                            )}
                          </div>

                          {item.fileUrl && (item.type === "MARKETING_IMAGE" || item.type === "SQUARE_MARKETING_IMAGE" || item.type === "LOGO") && (
                            <div className="w-10 h-10 rounded-md border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                              <img src={item.fileUrl} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          )}

                          <p className="text-[10px] text-slate-600 leading-snug">
                            {item.description}
                          </p>

                          {/* Advisory selection controls */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                            <span className="text-slate-400 text-[9px] italic">Advisory — review before using</span>
                            {isApproved ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCampaignState(prev => ({
                                    ...prev,
                                    extensionsAndAssets: (prev.extensionsAndAssets || []).filter(ea => ea.id !== item.id)
                                  }));
                                }}
                                className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                              >
                                ✕ Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const approvedItem: CampaignExtensionInsight = {
                                    ...item,
                                    approved: true
                                  };
                                  setCampaignState(prev => ({
                                    ...prev,
                                    extensionsAndAssets: [
                                      ...(prev.extensionsAndAssets || []).filter(ea => ea.id !== item.id),
                                      approvedItem
                                    ]
                                  }));
                                }}
                                className="text-indigo-700 hover:text-indigo-800 font-bold cursor-pointer"
                              >
                                ✓ Include in Plan
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : extensionsAssetsResult?.status === "UNAVAILABLE" ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                  <p className="font-medium">Google Ads extensions and assets are currently unavailable.</p>
                  <p className="text-[10px] text-amber-700">You can proceed with your campaign creation.</p>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-[11px] text-slate-500 space-y-1">
                  <p className="font-medium text-slate-700">No existing reusable assets found</p>
                  <p className="text-[10px] text-slate-400">
                    Click "Refresh" to inspect existing sitelinks, callouts, and asset groups for this account.
                  </p>
                </div>
              )}
            </div>

            {/* Keyword Intelligence & Negative Keyword Grounding Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-xs text-slate-900">Keyword Intelligence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isLoadingKeywordIntel ? (
                    <span className="flex items-center gap-1 text-[10px] text-blue-600 font-mono">
                      <Loader2 className="h-3 w-3 animate-spin" /> Fetching...
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => runKeywordIntelligence()}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </button>
                  )}
                </div>
              </div>

              {/* Campaign Type Guardrail Notice / Display Contextual Keywords */}
              {campaignState.campaignType === "DISPLAY" ? (
                <div className="space-y-3">
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-0.5">
                    <p className="font-semibold flex items-center gap-1">
                      <Tag className="h-3 w-3 text-blue-600" />
                      Contextual Keywords
                    </p>
                    <p className="text-[10px] text-slate-600">
                      These keywords help Google match your Display ads with relevant page content across the Google Display Network.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Active Contextual Keywords:</span>
                    <span className="font-bold text-slate-900">
                      {campaignState.keywords?.length || 0} approved
                    </span>
                  </div>

                  {keywordIntelResult?.keywordIntelligence && keywordIntelResult.keywordIntelligence.length > 0 ? (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Contextual Recommendations ({keywordIntelResult.keywordIntelligence.length})
                      </span>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {keywordIntelResult.keywordIntelligence.map((item: any, idx: number) => {
                          const isAlreadyInPlan = (campaignState.keywords || []).includes(item.keyword);
                          const isProfile = item.source === "DISPLAY_CONTEXTUAL";
                          const isExisting = item.source === "EXISTING_ACCOUNT";

                          return (
                            <div
                              key={idx}
                              className={`p-2 rounded-xl border text-[11px] space-y-1 ${
                                isAlreadyInPlan
                                  ? "bg-blue-50/70 border-blue-200 text-blue-900"
                                  : "bg-white border-slate-200 text-slate-800"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold truncate max-w-[200px]">
                                  {item.keyword}
                                </span>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                  isProfile ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                  isExisting ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  "bg-slate-100 text-slate-600 border-slate-200"
                                }`}>
                                  {isProfile ? "Business Context" : isExisting ? "Existing Account" : "AI"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5">
                                <span>Targeting: Broad Contextual</span>
                                {item.existingCampaignName && (
                                  <span className="truncate max-w-[130px]">• In {item.existingCampaignName}</span>
                                )}
                              </div>

                              <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                                {isAlreadyInPlan ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCampaignState(prev => ({
                                        ...prev,
                                        keywords: (prev.keywords || []).filter(k => k !== item.keyword)
                                      }));
                                    }}
                                    className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                                  >
                                    ✕ Remove
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCampaignState(prev => ({
                                        ...prev,
                                        keywords: Array.from(new Set([...(prev.keywords || []), item.keyword]))
                                      }));
                                    }}
                                    className="text-[10px] text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                                  >
                                    ✓ Accept
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-[11px] text-slate-500">
                      <p>Click &quot;Refresh&quot; to discover contextual keywords from your business offerings.</p>
                    </div>
                  )}

                  {/* Profile Negative Keywords Section (Display) */}
                  {keywordIntelResult?.profileNegativeKeywords && keywordIntelResult.profileNegativeKeywords.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Profile Negative Keywords ({keywordIntelResult.profileNegativeKeywords.length})
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          Advisory • Requires approval
                        </span>
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {keywordIntelResult.profileNegativeKeywords.map((neg: ProfileNegativeKeywordItem) => {
                          const isAdded = (campaignState.campaignNegativeKeywords || []).includes(neg.keyword);
                          return (
                            <div
                              key={neg.id}
                              className={`p-2 rounded-xl border text-[11px] flex items-center justify-between gap-2 transition-colors ${
                                isAdded
                                  ? "bg-rose-50/70 border-rose-200 text-rose-950"
                                  : "bg-white border-slate-200 text-slate-700"
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-rose-700 truncate">{neg.keyword}</span>
                                  <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-rose-100 text-rose-700 uppercase">
                                    {neg.matchType}
                                  </span>
                                </div>
                                {neg.reason && (
                                  <p className="text-[9px] text-slate-500 truncate mt-0.5">{neg.reason}</p>
                                )}
                              </div>
                              <div className="shrink-0">
                                {isAdded ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCampaignState(prev => ({
                                        ...prev,
                                        campaignNegativeKeywords: (prev.campaignNegativeKeywords || []).filter(k => k !== neg.keyword)
                                      }));
                                    }}
                                    className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                                  >
                                    ✕ Remove
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCampaignState(prev => ({
                                        ...prev,
                                        campaignNegativeKeywords: Array.from(new Set([...(prev.campaignNegativeKeywords || []), neg.keyword]))
                                      }));
                                    }}
                                    className="text-[10px] text-rose-700 hover:text-rose-800 font-bold cursor-pointer"
                                  >
                                    + Add Negative
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Shared Negative Keyword Lists Section (Display) */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Shared Negative Lists
                    </span>
                    {keywordIntelResult?.availableSharedNegativeLists && keywordIntelResult.availableSharedNegativeLists.length > 0 ? (
                      <div className="space-y-1">
                        {keywordIntelResult.availableSharedNegativeLists.map((list: any) => {
                          const isLinked = (campaignState.linkedSharedNegativeSetIds || []).includes(list.id);
                          return (
                            <label
                              key={list.id}
                              className={`flex items-center justify-between p-2 rounded-xl border text-[11px] cursor-pointer transition-colors ${
                                isLinked
                                  ? "bg-blue-50/70 border-blue-300 text-blue-900"
                                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isLinked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCampaignState(prev => ({
                                        ...prev,
                                        linkedSharedNegativeSetIds: Array.from(new Set([...(prev.linkedSharedNegativeSetIds || []), list.id]))
                                      }));
                                    } else {
                                      setCampaignState(prev => ({
                                        ...prev,
                                        linkedSharedNegativeSetIds: (prev.linkedSharedNegativeSetIds || []).filter(id => id !== list.id)
                                      }));
                                    }
                                  }}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-semibold">{list.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {list.memberCount} negatives
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No shared negative keyword lists are currently available.</p>
                    )}
                  </div>
                </div>
              ) : campaignState.campaignType && campaignState.campaignType !== "SEARCH" ? (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <p className="font-medium text-slate-700">Search keyword targeting is not used for this campaign type.</p>
                  <p className="text-[10px] text-slate-400">
                    {campaignState.campaignType === "PERFORMANCE_MAX" ? "Performance Max uses Search Themes and Audience Signals." :
                     campaignState.campaignType === "DEMAND_GEN" ? "Demand Gen relies on Audiences and Channel signals." :
                     "This campaign format targets audiences and placements automatically."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Current Active Keywords Count & Search Planner Status */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Active Search Keywords:</span>
                    <span className="font-bold text-slate-900">
                      {campaignState.keywords?.length || 0} approved
                    </span>
                  </div>

                  {/* Keyword Planner Recommendations */}
                  {keywordIntelResult?.keywordIntelligence && keywordIntelResult.keywordIntelligence.length > 0 ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Grounded Keywords ({keywordIntelResult.keywordIntelligence.length})
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {keywordIntelResult.plannerStatus === "SUCCESS" ? "Google Ads Planner Active" : "Account Grounded"}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {keywordIntelResult.keywordIntelligence.slice(0, 15).map((item: any, idx: number) => {
                          const isAlreadyInPlan = (campaignState.keywords || []).includes(item.keyword);
                          const isSourcePlanner = item.source === "KEYWORD_PLANNER";
                          const isSourceExisting = item.source === "EXISTING_ACCOUNT";
                          const isSourceSearchTerm = item.source === "SEARCH_TERM";

                          return (
                            <div
                              key={idx}
                              className={`p-2 rounded-xl border text-[11px] space-y-1 ${
                                isAlreadyInPlan
                                  ? "bg-blue-50/70 border-blue-200 text-blue-900"
                                  : "bg-white border-slate-200 text-slate-800"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold truncate max-w-[200px]">
                                  {item.keyword}
                                </span>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                  isSourcePlanner ? "bg-purple-50 text-purple-700 border-purple-200" :
                                  isSourceExisting ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  isSourceSearchTerm ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                  item.source === "DISPLAY_CONTEXTUAL" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                  "bg-blue-50 text-blue-700 border-blue-200"
                                }`}>
                                  {isSourcePlanner ? "Google Ads Planner" :
                                   isSourceExisting ? "Existing Account" :
                                   isSourceSearchTerm ? "Search Term" :
                                   item.source === "DISPLAY_CONTEXTUAL" ? "Contextual" : "Profile Context"}
                                </span>
                              </div>

                              {/* Real Google Ads Metrics */}
                              <div className="flex items-center gap-2 text-[9px] text-slate-500">
                                {item.searchVolume !== undefined && item.searchVolume > 0 && (
                                  <span>{item.searchVolume.toLocaleString()} searches/mo</span>
                                )}
                                {item.competition && (
                                  <span className="capitalize">• {item.competition.toLowerCase()} comp</span>
                                )}
                                {item.lowTopOfPageBid !== undefined && (
                                  <span>• Bid: ₹{item.lowTopOfPageBid.toFixed(2)}</span>
                                )}
                                {item.existingCampaignName && (
                                  <span className="truncate max-w-[130px]">• In {item.existingCampaignName}</span>
                                )}
                              </div>

                              {/* Keyword Action Buttons */}
                              <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                                {isAlreadyInPlan ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCampaignState(prev => ({
                                        ...prev,
                                        keywords: (prev.keywords || []).filter(k => k !== item.keyword)
                                      }));
                                    }}
                                    className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                                  >
                                    ✕ Remove
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCampaignState(prev => ({
                                        ...prev,
                                        keywords: Array.from(new Set([...(prev.keywords || []), item.keyword]))
                                      }));
                                    }}
                                    className="text-[10px] text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                                  >
                                    ✓ Accept
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : keywordIntelResult?.plannerStatus === "UNAVAILABLE" ? (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                      Google Ads Keyword Planner data is currently unavailable. You can continue with user-provided or AI-suggested keywords.
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-[11px] text-slate-500">
                      <p>Click &quot;Refresh&quot; to fetch real Google Ads Keyword Planner metrics &amp; existing search terms.</p>
                    </div>
                  )}

                  {/* Profile Negative Keywords Section */}
                  {keywordIntelResult?.profileNegativeKeywords && keywordIntelResult.profileNegativeKeywords.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Profile Negative Keywords ({keywordIntelResult.profileNegativeKeywords.length})
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          Advisory • Requires approval
                        </span>
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {keywordIntelResult.profileNegativeKeywords.map((neg: ProfileNegativeKeywordItem) => {
                          const isAdded = (campaignState.campaignNegativeKeywords || []).includes(neg.keyword);
                          return (
                            <div
                              key={neg.id}
                              className={`p-2 rounded-xl border text-[11px] flex items-center justify-between gap-2 transition-colors ${
                                isAdded
                                  ? "bg-rose-50/70 border-rose-200 text-rose-950"
                                  : "bg-white border-slate-200 text-slate-700"
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-rose-700 truncate">{neg.keyword}</span>
                                  <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-rose-100 text-rose-700 uppercase">
                                    {neg.matchType}
                                  </span>
                                </div>
                                {neg.reason && (
                                  <p className="text-[9px] text-slate-500 truncate mt-0.5">{neg.reason}</p>
                                )}
                              </div>
                              <div className="shrink-0">
                                {isAdded ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCampaignState(prev => ({
                                        ...prev,
                                        campaignNegativeKeywords: (prev.campaignNegativeKeywords || []).filter(k => k !== neg.keyword)
                                      }));
                                    }}
                                    className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                                  >
                                    ✕ Remove
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCampaignState(prev => ({
                                        ...prev,
                                        campaignNegativeKeywords: Array.from(new Set([...(prev.campaignNegativeKeywords || []), neg.keyword]))
                                      }));
                                    }}
                                    className="text-[10px] text-rose-700 hover:text-rose-800 font-bold cursor-pointer"
                                  >
                                    + Add Negative
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Shared Negative Keyword Lists Section */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Shared Negative Lists
                    </span>
                    {keywordIntelResult?.availableSharedNegativeLists && keywordIntelResult.availableSharedNegativeLists.length > 0 ? (
                      <div className="space-y-1">
                        {keywordIntelResult.availableSharedNegativeLists.map((list: any) => {
                          const isLinked = (campaignState.linkedSharedNegativeSetIds || []).includes(list.id);
                          return (
                            <label
                              key={list.id}
                              className={`flex items-center justify-between p-2 rounded-xl border text-[11px] cursor-pointer transition-colors ${
                                isLinked
                                  ? "bg-blue-50/70 border-blue-300 text-blue-900"
                                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isLinked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCampaignState(prev => ({
                                        ...prev,
                                        linkedSharedNegativeSetIds: Array.from(new Set([...(prev.linkedSharedNegativeSetIds || []), list.id]))
                                      }));
                                    } else {
                                      setCampaignState(prev => ({
                                        ...prev,
                                        linkedSharedNegativeSetIds: (prev.linkedSharedNegativeSetIds || []).filter(id => id !== list.id)
                                      }));
                                    }
                                  }}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-semibold">{list.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {list.memberCount} negatives
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No shared negative keyword lists are currently available.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Audience Intelligence & Signals Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="font-bold text-xs text-slate-900">Audience Intelligence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isLoadingAudienceIntel ? (
                    <span className="flex items-center gap-1 text-[10px] text-purple-600 font-mono">
                      <Loader2 className="h-3 w-3 animate-spin" /> Fetching...
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => runAudienceIntelligence()}
                      className="text-[10px] text-purple-600 hover:text-purple-700 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </button>
                  )}
                </div>
              </div>

              {/* Audience Signals Status */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Selected Audience Signals:</span>
                <span className="font-bold text-slate-900">
                  {campaignState.audienceSignalIds?.length || 0} active
                </span>
              </div>

              {audienceIntelResult?.audienceIntelligence && audienceIntelResult.audienceIntelligence.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Recommended Signals ({audienceIntelResult.audienceIntelligence.length})
                  </span>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {audienceIntelResult.audienceIntelligence.map((aud: any, idx: number) => {
                      const identifier = aud.resourceName || aud.id || aud.name;
                      const isSelected = (campaignState.audienceSignalIds || []).includes(identifier);
                      const isCustomerMatch = aud.source === "CUSTOMER_MATCH";
                      const isCustom = aud.source === "CUSTOM_AUDIENCE";
                      const isProfile = aud.source === "CRM_PROFILE";

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-[11px] space-y-1.5 ${
                            isSelected
                              ? "bg-purple-50/70 border-purple-300 text-purple-950"
                              : "bg-white border-slate-200 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-900 truncate max-w-[200px]">
                              {aud.name}
                            </span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                              isCustomerMatch ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              isCustom ? "bg-blue-50 text-blue-700 border-blue-200" :
                              isProfile ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-purple-50 text-purple-700 border-purple-200"
                            }`}>
                              {isCustomerMatch ? "Customer Match" :
                               isCustom ? "Custom Segment" :
                               isProfile ? "CRM Persona" : "Audience"}
                            </span>
                          </div>

                          {/* Relevance Explanation */}
                          <p className="text-[10px] text-slate-600 leading-tight">
                            {aud.relevanceReason}
                          </p>

                          {/* Metadata row */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] text-slate-400">
                            <span>
                              {aud.memberCount ? `${Number(aud.memberCount).toLocaleString()} users` : `Status: ${aud.status}`}
                            </span>
                            {isSelected ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCampaignState(prev => ({
                                    ...prev,
                                    audienceSignalIds: (prev.audienceSignalIds || []).filter(id => id !== identifier)
                                  }));
                                }}
                                className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                              >
                                ✕ Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setCampaignState(prev => ({
                                    ...prev,
                                    audienceSignalIds: Array.from(new Set([...(prev.audienceSignalIds || []), identifier]))
                                  }));
                                }}
                                className="text-[10px] text-purple-600 hover:text-purple-700 font-bold cursor-pointer"
                              >
                                ✓ Select Signal
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : audienceIntelResult?.audienceStatus === "UNAVAILABLE" ? (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                  Google Ads Audience data is currently unavailable. You can continue without an audience signal.
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-[11px] text-slate-500">
                  <p>Click &quot;Refresh&quot; to inspect Customer Match and Custom Segments for audience signals.</p>
                </div>
              )}
            </div>

            {/* Creatives Card (Only shown when Objective & Campaign Type are set and type uses media) */}
            {Boolean(campaignState.objective && campaignState.campaignType) && campaignState.campaignType !== "SEARCH" && campaignState.campaignType !== "SHOPPING" && (
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
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[8px] font-mono">
                                  1.91:1 / 1:1
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

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

                    {campaignState.videos && campaignState.videos.length > 0 && (
                      <div className="space-y-1 pt-1.5 border-t border-slate-200">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Videos:</span>
                        <div className="space-y-1">
                          {campaignState.videos.map((vid, idx) => {
                            const url = typeof vid === "string" ? vid : vid?.url || "";
                            const name = typeof vid === "object" ? vid?.name : `Video ${idx + 1}`;
                            return (
                              <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white text-[11px]">
                                <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                                  <Video className="h-3.5 w-3.5 text-red-600 shrink-0" />
                                  <span className="truncate text-slate-800">{name || url}</span>
                                </div>
                                <span className="text-[9px] font-mono text-slate-400 shrink-0">Attached</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Phase 2C: Merchant Center & Retail Product Feed Intelligence Card (SHOPPING and PERFORMANCE_MAX only) */}
            {(campaignState.campaignType === "SHOPPING" ||
              (campaignState.campaignType === "PERFORMANCE_MAX" &&
                (campaignState.merchantCenterId || customerProfileData?.hasMerchantAccount || customerProfileData?.merchantCenterId || shoppingIntelResult?.liveConnected))) && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-900">Merchant Center & Product Feed</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Retail Intelligence
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isLoadingShoppingIntel ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono">
                        <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => runShoppingIntelligence()}
                        className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Refresh
                      </button>
                    )}
                  </div>
                </div>

                {isLoadingShoppingIntel ? (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-[11px] text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-emerald-500" />
                    <span>Validating live Merchant Center linkage and product feeds...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Live Linkage vs Profile ID Status */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Profile Merchant Center ID:</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {shoppingIntelResult?.profileMerchantCenterId || campaignState.merchantCenterId || "Not configured in Profile"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Live API Linkage Status:</span>
                        <span className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                          shoppingIntelResult?.liveConnected
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : shoppingIntelResult?.profileMerchantCenterId
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          {shoppingIntelResult?.liveConnected ? "✓ Verified Linked" : shoppingIntelResult?.profileMerchantCenterId ? "⚠ Unverified / Pending" : "Not Linked"}
                        </span>
                      </div>
                      {shoppingIntelResult?.liveMerchantId && (
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">Authoritative Account ID:</span>
                          <span className="font-mono text-emerald-700 font-bold">{shoppingIntelResult.liveMerchantId}</span>
                        </div>
                      )}
                    </div>

                    {/* Live Feed Diagnostics */}
                    {shoppingIntelResult?.summary && (
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="p-2 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Total Feed Items</span>
                          <span className="font-bold text-slate-900 font-mono text-xs">{shoppingIntelResult.summary.totalProducts ?? 0}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] text-emerald-600 block">Approved</span>
                          <span className="font-bold text-emerald-700 font-mono text-xs">{shoppingIntelResult.summary.approved ?? 0}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] text-rose-600 block">Issues</span>
                          <span className="font-bold text-rose-700 font-mono text-xs">{shoppingIntelResult.summary.disapproved ?? 0}</span>
                        </div>
                      </div>
                    )}

                    {/* Contextual Profile Products Notice */}
                    {shoppingIntelResult?.profileProductsCount > 0 && (
                      <div className="p-2 rounded-xl bg-slate-100/70 border border-slate-200 text-[10px] text-slate-600 space-y-1">
                        <div className="flex justify-between items-center font-medium">
                          <span>Profile Products Context:</span>
                          <span className="font-mono text-slate-700">{shoppingIntelResult.profileProductsCount} catalog items</span>
                        </div>
                        <p className="text-[9px] text-slate-500 italic">
                          Profile products serve as advisory business context. Live Merchant Center feed items remain authoritative for ad auctions.
                        </p>
                      </div>
                    )}

                    {/* Advisory Notice */}
                    {shoppingIntelResult?.notice && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex items-start gap-1.5">
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{shoppingIntelResult.notice}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Phase 2C: App Promotion Intelligence Card (APP campaigns only) */}
            {campaignState.campaignType === "APP" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-indigo-600" />
                    <span className="font-bold text-xs text-slate-900">App Promotion Intelligence</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Mobile Config
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isLoadingAppIntel ? (
                      <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-mono">
                        <Loader2 className="h-3 w-3 animate-spin" /> Looking up...
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => runAppIntelligence()}
                        className="text-[10px] text-indigo-700 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Refresh
                      </button>
                    )}
                  </div>
                </div>

                {isLoadingAppIntel ? (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-[11px] text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-indigo-500" />
                    <span>Validating mobile app store identifiers and Google Ads app assets...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Primary App Card */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Target Platform:</span>
                        <span className="font-bold text-slate-900">
                          {campaignState.appStore === "APPLE_APP_STORE" || appIntelResult?.primaryApp?.platform === "IOS"
                            ? "Apple App Store (iOS)"
                            : "Google Play Store (Android)"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Package / App ID:</span>
                        <span className="font-mono font-semibold text-slate-900 truncate max-w-[170px]">
                          {campaignState.appId || appIntelResult?.primaryApp?.appId || "Not specified"}
                        </span>
                      </div>
                      {appIntelResult?.primaryApp?.appName && (
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">App Name:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                            {appIntelResult.primaryApp.appName}
                          </span>
                        </div>
                      )}
                      {appIntelResult?.primaryApp?.appUrl && (
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">Store Destination:</span>
                          <a
                            href={appIntelResult.primaryApp.appUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700 underline truncate max-w-[170px]"
                          >
                            Store Page ↗
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-[10px]">
                      <span className="text-slate-500">Configuration Status:</span>
                      <span className={`font-semibold px-1.5 py-0.5 rounded ${
                        appIntelResult?.status === "CONFIGURED" && (campaignState.appId || appIntelResult?.primaryApp?.appId)
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {appIntelResult?.status === "CONFIGURED" && (campaignState.appId || appIntelResult?.primaryApp?.appId)
                          ? "✓ Ready for Plan"
                          : "Action Required (Set App ID)"}
                      </span>
                    </div>

                    {/* Advisory Notice */}
                    {appIntelResult?.notice && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex items-start gap-1.5">
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{appIntelResult.notice}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Final Campaign Review Card */}
            {Boolean(campaignState.objective && campaignState.campaignType) && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-900">Final Campaign Review</span>
                  </div>
                  {isLoadingFinalReview ? (
                    <span className="flex items-center gap-1 text-[10px] text-blue-600 font-mono">
                      <Loader2 className="h-3 w-3 animate-spin" /> Reviewing...
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => runFinalReview()}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh Review
                    </button>
                  )}
                </div>

                {/* Core Parameters Table */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Business:</span>
                    <span className="font-semibold text-slate-900">{campaignState.businessName || "Business"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Campaign Objective:</span>
                    <span className="font-semibold text-blue-700">{campaignState.objective || "LEADS"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Campaign Type:</span>
                    <span className="font-semibold text-purple-700">{campaignState.campaignType || "SEARCH"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Daily Budget:</span>
                    <span className="font-semibold text-emerald-700">₹{campaignState.dailyBudget || 0}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bidding Strategy:</span>
                    <span className="font-semibold text-slate-900">{campaignState.biddingStrategy || "Maximize conversions"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Locations:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[180px]">{(campaignState.locations || ["India"]).join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Languages:</span>
                    <span className="font-semibold text-slate-900">{campaignState.language || "English"}</span>
                  </div>
                </div>

                {/* Keywords Summary (Only relevant for SEARCH, DISPLAY or when keywords configured) */}
                {(campaignState.campaignType === "SEARCH" || campaignState.campaignType === "DISPLAY" || (campaignState.keywords && campaignState.keywords.length > 0)) && (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-700 flex items-center gap-1">
                        <Search className="h-3 w-3 text-blue-600" />
                        Target Keywords
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {(campaignState.keywords || []).length} positive • {(campaignState.campaignNegativeKeywords || []).length} negative
                      </span>
                    </div>
                    {campaignState.keywords && campaignState.keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1 pt-1 max-h-20 overflow-y-auto">
                        {campaignState.keywords.slice(0, 8).map((kw, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-mono">
                            {kw}
                          </span>
                        ))}
                        {campaignState.keywords.length > 8 && (
                          <span className="text-[9px] text-slate-400 self-center">+{campaignState.keywords.length - 8} more</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No positive keywords selected</p>
                    )}
                  </div>
                )}

                {/* Shopping Retail Merchant Center Summary */}
                {(campaignState.campaignType === "SHOPPING" || campaignState.merchantCenterId) && (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-700 flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3 text-emerald-600" />
                        Merchant Center Config
                      </span>
                      <span className="text-emerald-700 font-mono text-[10px]">
                        {campaignState.merchantCenterId ? `ID: ${campaignState.merchantCenterId}` : "Action Required"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>Feed Target:</span>
                      <span className="font-semibold text-slate-800">India (IN)</span>
                    </div>
                  </div>
                )}

                {/* App Configuration Summary */}
                {(campaignState.campaignType === "APP" || campaignState.appId) && (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-700 flex items-center gap-1">
                        <Smartphone className="h-3 w-3 text-indigo-600" />
                        Mobile App Details
                      </span>
                      <span className="text-indigo-700 font-mono text-[10px]">
                        {campaignState.appStore === "APPLE_APP_STORE" ? "iOS" : "Android"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>App Package / ID:</span>
                      <span className="font-mono text-slate-800 truncate max-w-[170px]">{campaignState.appId || "Not specified"}</span>
                    </div>
                  </div>
                )}

                {/* Video / YouTube Asset Summary */}
                {campaignState.campaignType === "VIDEO" && (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-700 flex items-center gap-1">
                        <Video className="h-3 w-3 text-red-600" />
                        YouTube Video Creatives
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {(campaignState.videos || []).length} attached
                      </span>
                    </div>
                  </div>
                )}

                {/* Audiences Summary */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-slate-700 flex items-center gap-1">
                      <Users className="h-3 w-3 text-purple-600" />
                      Audiences
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {(campaignState.audienceSignalIds || []).length} signals approved
                    </span>
                  </div>
                  {campaignState.audienceSignalIds && campaignState.audienceSignalIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1 pt-1 max-h-16 overflow-y-auto">
                      {campaignState.audienceSignalIds.slice(0, 4).map((sig, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px]">
                          {sig}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">Optional signals (none selected)</p>
                  )}
                </div>

                {/* Performance Forecast Summary */}
                {forecastResult && forecastResult.status === "SUCCESS" && forecastResult.metrics && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center gap-1 text-[11px]">
                        <TrendingUp className="h-3 w-3 text-emerald-700" />
                        Performance Forecast
                      </span>
                      <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Google Ads Estimate
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div className="p-1.5 bg-white rounded-lg border border-emerald-100">
                        <span className="text-slate-500 block text-[9px]">Est. Clicks:</span>
                        <span className="font-bold text-slate-900">{Number(forecastResult.metrics.clicks || 0).toLocaleString()}</span>
                      </div>
                      <div className="p-1.5 bg-white rounded-lg border border-emerald-100">
                        <span className="text-slate-500 block text-[9px]">Est. Cost:</span>
                        <span className="font-bold text-slate-900">₹{Number(forecastResult.metrics.cost || 0).toLocaleString()}</span>
                      </div>
                      <div className="p-1.5 bg-white rounded-lg border border-emerald-100">
                        <span className="text-slate-500 block text-[9px]">Avg. CPC:</span>
                        <span className="font-bold text-slate-900">₹{Number(forecastResult.metrics.averageCpc || 0).toFixed(2)}</span>
                      </div>
                      <div className="p-1.5 bg-white rounded-lg border border-emerald-100">
                        <span className="text-slate-500 block text-[9px]">Conversions:</span>
                        <span className="font-bold text-slate-900">{Number(forecastResult.metrics.conversions || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations Summary */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-slate-700 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3 text-amber-500" />
                      Google Ads Recommendations
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {(campaignState.recommendationInsights || []).filter(r => r.approved).length} approved
                    </span>
                  </div>
                  {campaignState.recommendationInsights && campaignState.recommendationInsights.filter(r => r.approved).length > 0 ? (
                    <div className="space-y-1 pt-1 max-h-16 overflow-y-auto">
                      {campaignState.recommendationInsights.filter(r => r.approved).slice(0, 3).map((r, i) => (
                        <div key={i} className="text-[10px] text-slate-700 flex items-center gap-1 truncate">
                          <Check className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{r.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">No recommendations approved (advisory only)</p>
                  )}
                </div>

                {/* Extensions & Assets Summary */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-slate-700 flex items-center gap-1">
                      <Layers className="h-3 w-3 text-indigo-600" />
                      Extensions & Assets
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {(campaignState.extensionsAndAssets || []).filter(e => e.approved).length} approved
                    </span>
                  </div>
                  {campaignState.extensionsAndAssets && campaignState.extensionsAndAssets.filter(e => e.approved).length > 0 ? (
                    <div className="space-y-1 pt-1 max-h-16 overflow-y-auto">
                      {campaignState.extensionsAndAssets.filter(e => e.approved).slice(0, 3).map((ext, i) => (
                        <div key={i} className="text-[10px] text-slate-700 flex items-center gap-1 truncate">
                          <Check className="h-2.5 w-2.5 text-indigo-600 shrink-0" />
                          <span className="truncate">{ext.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">Standard account assets will be generated</p>
                  )}
                </div>

                {/* Preflight Checks Card */}
                <div className={`p-2.5 rounded-xl border text-[11px] space-y-1.5 ${
                  preflightData?.passed
                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                    : "bg-amber-50/70 border-amber-300 text-amber-950"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1 text-[11px]">
                      {preflightData?.passed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      )}
                      Preflight Status: {preflightData?.passed ? "PASS" : "BLOCKED"}
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                      preflightData?.passed
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}>
                      {preflightData?.passed ? "Ready" : "Action Needed"}
                    </span>
                  </div>

                  {preflightData?.issues && preflightData.issues.length > 0 && (
                    <div className="space-y-1 max-h-24 overflow-y-auto pt-1">
                      {preflightData.issues.map((iss, i) => (
                        <div
                          key={i}
                          className={`p-1.5 rounded-lg border text-[10px] flex items-start gap-1 leading-tight ${
                            iss.level === "ERROR"
                              ? "bg-rose-50 border-rose-200 text-rose-800"
                              : "bg-amber-50 border-amber-200 text-amber-800"
                          }`}
                        >
                          <span className="font-bold shrink-0">{iss.level === "ERROR" ? "✕" : "⚠️"}</span>
                          <span>{iss.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Explicit User Confirmation Gate */}
                <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={userConfirmed}
                      onChange={(e) => {
                        setUserConfirmed(e.target.checked);
                        if (publishError) setPublishError(null);
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="text-[11px] leading-tight">
                      <span className="font-bold text-slate-900 block">
                        I have reviewed this campaign configuration and want to create the campaign.
                      </span>
                      <span className="text-[10px] text-slate-500 block pt-0.5">
                        Authoritative parameters have been validated by Google Ads preflight checks.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Creation Result Card (Shown after successful creation) */}
            {creationResultData && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 space-y-2 shadow-xs animate-in fade-in">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-xs text-emerald-950">Campaign Created Successfully</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-white p-2.5 rounded-xl border border-emerald-200">
                  <div>
                    <span className="text-slate-500 block text-[9px]">Campaign ID:</span>
                    <span className="font-mono font-bold text-slate-900">{creationResultData.campaignId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Campaign Name:</span>
                    <span className="font-bold text-slate-900 truncate block">{creationResultData.campaignName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Campaign Type:</span>
                    <span className="font-bold text-purple-700">{creationResultData.campaignType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Customer ID:</span>
                    <span className="font-mono font-bold text-slate-900">{creationResultData.customerId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Daily Budget:</span>
                    <span className="font-bold text-emerald-700">₹{creationResultData.budget}/day</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Status:</span>
                    <span className="font-bold text-emerald-700">{creationResultData.status}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Launch Action Footer with Explicit User Confirmation */}
            <div className="mt-auto pt-3 border-t border-slate-200 space-y-2">
              {publishError && (
                <div className="text-[11px] p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-1.5 animate-in fade-in">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{publishError}</span>
                </div>
              )}

              {publishSuccess && (
                <div className="text-[11px] p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{publishSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Confirmation Gate:</span>
                <span className={
                  campaignState.readyForPublish && preflightData?.passed && userConfirmed
                    ? "text-emerald-600 font-bold"
                    : !userConfirmed && campaignState.readyForPublish && preflightData?.passed
                    ? "text-amber-600 font-bold"
                    : "text-slate-400 font-medium"
                }>
                  {campaignState.readyForPublish && preflightData?.passed && userConfirmed
                    ? "Ready to Launch"
                    : campaignState.readyForPublish && preflightData?.passed
                    ? "Review Confirmed Checkbox Required"
                    : "Preflight Incomplete"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleEditDetailsInForm}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={handleCreateCampaign}
                  disabled={
                    !campaignState.readyForPublish ||
                    (preflightData ? !preflightData.passed : false) ||
                    !userConfirmed ||
                    isPublishing
                  }
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    campaignState.readyForPublish && (preflightData?.passed ?? true) && userConfirmed
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                  }`}
                >
                  {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Target className="h-3.5 w-3.5"/>}
                  Publish Campaign to Google Ads
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Phase 3: Explicit Save to Business Profile Confirmation Dialog */}
      {showSaveProfileModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900">Save to Business Profile</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveProfileModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Review approved business parameters to merge into the customer&apos;s authoritative Business Profile:
            </p>

            {/* Change Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 max-h-56 overflow-y-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Business Profile Changes
              </span>
              <div className="border-t border-slate-200 pt-1.5 space-y-1 text-xs">
                {calculateProfileChanges().summary.length > 0 ? (
                  calculateProfileChanges().summary.map((line, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-800">
                      <span className="text-slate-600">{line.split(":")[0]}:</span>
                      <span className="font-semibold text-blue-700 font-mono text-[11px]">
                        {line.split(":").slice(1).join(":").trim()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs italic">No profile modifications detected from current campaign.</p>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Temporary campaign settings (bidding strategy, budget, ad copy) will <strong>not</strong> be persisted to the business profile.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowSaveProfileModal(false)}
                disabled={isSavingProfile}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToBusinessProfile}
                disabled={isSavingProfile || calculateProfileChanges().summary.length === 0}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" /> Save to Business Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

