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
  Check
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
  keywords?: string[];
  headlines?: string[];
  descriptions?: string[];
  longHeadlines?: string[];
  images?: Array<string | { url?: string; data?: string; fieldType?: string; name?: string }>;
  logos?: Array<string | { url?: string; data?: string; fieldType?: string; name?: string }>;
  videos?: Array<string | { url?: string; data?: string; name?: string }>;
  appId?: string;
  appStore?: "GOOGLE_APP_STORE" | "APPLE_APP_STORE";
  merchantCenterId?: string;
  readyForReview?: boolean;
  readyForPublish?: boolean;
  stage?: string;
}

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
    if (isOpen && messages.length === 0) {
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
  }, [isOpen, messages.length]);

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

      if (data.campaignState) {
        setCampaignState(prev => ({
          ...prev,
          ...data.campaignState,
          startDate: data.campaignState.startDate || prev.startDate || todayIso,
          endDate: data.campaignState.endDate || prev.endDate,
          images: (data.campaignState.images && data.campaignState.images.length > 0) ? data.campaignState.images : prev.images,
          logos: (data.campaignState.logos && data.campaignState.logos.length > 0) ? data.campaignState.logos : prev.logos,
          videos: (data.campaignState.videos && data.campaignState.videos.length > 0) ? data.campaignState.videos : prev.videos
        }));
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
        content: `⚠️ **Connection Notice:** I could not reach the campaign assistant server right now (${err.message}). Let's continue — please tell me about your business or desired goal.`,
        suggestions: ["I want more leads", "I want more sales", "I want more website visitors", "Tell me what campaign is best"],
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
        onClose();
        router.push(`/ads/campaigns?customerId=${customerId}`);
      }, 2500);
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
                  <span className="text-slate-500">Start Date:</span>
                  <span className="text-slate-800 font-medium font-mono">{campaignState.startDate || todayIso}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">End Date:</span>
                  <span className="text-slate-800 font-medium font-mono">{campaignState.endDate || "Not set"}</span>
                </div>
              </div>
            </div>

            {/* Creatives Card */}
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
                </div>
              )}
            </div>

            {/* Launch Action Footer */}
            <div className="mt-auto pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Direct Action:</span>
                <span className={campaignState.readyForPublish ? "text-emerald-600 font-bold" : "text-amber-600 font-medium"}>
                  {campaignState.readyForPublish ? "Ready to deploy" : "Gathering required info"}
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
                  disabled={!campaignState.readyForPublish || isPublishing}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    campaignState.readyForPublish
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                  }`}
                >
                  {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Target className="h-3.5 w-3.5"/>}
                  Launch Campaign
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
