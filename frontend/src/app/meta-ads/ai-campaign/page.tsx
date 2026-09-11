"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Bot,
  User,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Megaphone,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  DollarSign,
  MapPin,
  Target,
  FileText,
  MessageCircle,
  ExternalLink,
  Globe,
  ThumbsUp,
  Share2,
  MessageSquare,
  Phone,
  Smartphone,
  ShoppingBag,
  Calendar,
  UserCheck,
  Paperclip,
  Upload,
  Plus,
  Image as ImageIcon,
  Mic,
  MicOff,
  BarChart3,
  TrendingUp,
  RotateCcw,
  X,
  Sliders,
  Map,
  Compass,
  Hash,
} from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    const org = localStorage.getItem("organization_id");
    if (org) return org;
  }
  return "demo-org-123";
};

interface ConversationMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  quickOptions?: Array<{ label: string; value: string; isNotSure?: boolean }>;
  metadata?: any;
}

interface CampaignState {
  sessionId: string;
  status:
    | "DISCOVERY"
    | "ACCOUNT_SELECTION"
    | "STRATEGY"
    | "DRAFTING"
    | "CREATIVE"
    | "REVIEW"
    | "CONFIRMATION"
    | "PUBLISHING"
    | "COMPLETED"
    | "FAILED";
  draft: any;
  validation: {
    valid: boolean;
    errors: Array<{ field: string; message: string; code: string }>;
    warnings: Array<{ field: string; message: string }>;
  };
  context: {
    organizationId: string;
    isConnected: boolean;
    adAccounts: Array<{ id: string; adAccountId: string; name: string; currency: string }>;
    pages: Array<{ id: string; name: string; picture?: string }>;
    pixelId?: string;
    pixels?: Array<{ id: string; name: string; isUnavailable?: boolean }>;
    [key: string]: any;
  };
  conversation: ConversationMessage[];
  requiresConfirmation: boolean;
  versionNumber?: number;
  executionResult?: any;
}

function formatCleanText(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-900">
          {part.slice(2, -2).replace(/^\*+|\*+$/g, "")}
        </strong>
      );
    }
    return part.replace(/\*\*/g, "");
  });
}

export default function MetaAIChatbotStudioPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string>(getOrgId());

  // Conversational & Campaign State
  const [session, setSession] = useState<CampaignState | null>(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Stop speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceRecording = () => {
    // If currently listening, stop it
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("[SpeechRecognition] Stop error:", e);
        }
      }
      setIsRecording(false);
      return;
    }

    if (typeof window === "undefined") return;

    // Check for native Windows / browser SpeechRecognition listener
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert("Windows Speech Recognition is not supported in this browser. Please open in Google Chrome or Microsoft Edge on Windows.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      // Use system / browser locale (e.g. en-IN, hi-IN, en-US)
      recognition.lang = navigator.language || "en-IN";

      // Preserve any existing input text so spoken words append naturally
      const startingText = inputText.trim() ? inputText.trim() + " " : "";
      baseTextRef.current = startingText;

      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + " ";
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const liveCombined = (baseTextRef.current + finalTranscript + interimTranscript).trim();
        if (liveCombined) {
          handleInputChange(liveCombined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("[SpeechRecognition] error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          alert("Microphone permission was denied. Please allow microphone access in your browser / Windows settings.");
        } else if (event.error !== "no-speech") {
          console.warn("[SpeechRecognition] Unhandled speech error:", event.error);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("[SpeechRecognition] Initialization failed:", err);
      alert("Could not start Windows Speech Recognition: " + (err.message || err));
      setIsRecording(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.conversation, isSending, isPublishing]);

  // Initialize Session on Load with LocalStorage Caching & Recovery
  useEffect(() => {
    const currentOrg = getOrgId();
    setOrgId(currentOrg);

    const cacheKey = `meta_ai_session_${currentOrg}`;
    const draftInputKey = `meta_ai_input_draft_${currentOrg}`;

    if (typeof window !== "undefined") {
      // Restore input text draft
      const cachedInput = localStorage.getItem(draftInputKey);
      if (cachedInput) {
        setInputText(cachedInput);
      }

      // Restore full conversation and campaign draft state
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // If cached session has stale ad history greeting or old branding, invalidate and reload clean JISNU AI session
          const hasStaleGreeting = parsed?.conversation?.some((m: any) =>
            /14 Aug-2026|Historical Ads Audit|I've analyzed your account's ad history|winning ad|Tell me about your business, product/i.test(m.text || "")
          );
          if (parsed && parsed.sessionId && parsed.draft && !hasStaleGreeting) {
            setSession(parsed);
            setLoadingInit(false);
            return;
          }
        } catch (e) {
          console.warn("Failed to parse cached Meta AI session:", e);
        }
      }
    }

    fetch(`${BACKEND}/api/meta-ads/ai/conversation/init?organizationId=${currentOrg}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.session) {
          setSession(data.session);
          if (typeof window !== "undefined") {
            localStorage.setItem(cacheKey, JSON.stringify(data.session));
          }
        } else {
          setError("Could not initialize Meta AI Chatbot Studio.");
        }
      })
      .catch((err) => setError(err.message || "Connection failed to Meta AI Engine."))
      .finally(() => setLoadingInit(false));
  }, []);

  // Sync state changes to LocalStorage
  useEffect(() => {
    if (session && typeof window !== "undefined") {
      const currentOrg = getOrgId();
      localStorage.setItem(`meta_ai_session_${currentOrg}`, JSON.stringify(session));
    }
  }, [session]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (typeof window !== "undefined") {
      const currentOrg = getOrgId();
      if (text.trim()) {
        localStorage.setItem(`meta_ai_input_draft_${currentOrg}`, text);
      } else {
        localStorage.removeItem(`meta_ai_input_draft_${currentOrg}`);
      }
    }
  };

  const handleResetSession = async () => {
    const currentOrg = getOrgId();
    if (typeof window !== "undefined") {
      localStorage.removeItem(`meta_ai_session_${currentOrg}`);
      localStorage.removeItem(`meta_ai_input_draft_${currentOrg}`);
    }
    setInputText("");
    setLoadingInit(true);
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/ai/conversation/init?organizationId=${currentOrg}`);
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        if (typeof window !== "undefined") {
          localStorage.setItem(`meta_ai_session_${currentOrg}`, JSON.stringify(data.session));
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingInit(false);
    }
  };

  const handleSendMessage = async (textToSend?: string, selectedOption?: string, overrideState?: CampaignState) => {
    // If Windows Speech Recognition listener is active, stop it
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);

    const content = textToSend || inputText;
    if (!content.trim() && !selectedOption && !attachedFile) return;
    const activeSession = overrideState || session;
    if (!activeSession) return;

    // Clear input & draft from storage
    setInputText("");
    if (typeof window !== "undefined") {
      localStorage.removeItem(`meta_ai_input_draft_${orgId}`);
    }
    setIsSending(true);
    setError(null);

    // Optimistically record user's message in local state & localStorage immediately
    const userMsgText = content || (selectedOption ? `Selected: ${selectedOption}` : "Attached creative file");
    const optimisticUserMsg: ConversationMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const optimisticallyUpdatedSession: CampaignState = {
      ...activeSession,
      conversation: [...(activeSession.conversation || []), optimisticUserMsg],
    };

    setSession(optimisticallyUpdatedSession);
    if (typeof window !== "undefined") {
      localStorage.setItem(`meta_ai_session_${orgId}`, JSON.stringify(optimisticallyUpdatedSession));
    }

    // If there's an attached file that wasn't previously uploaded, attach it to the state
    let stateToSend = optimisticallyUpdatedSession;
    if (attachedFile && !stateToSend.draft?.creative?.mediaUrl) {
      stateToSend = {
        ...stateToSend,
        draft: {
          ...stateToSend.draft,
          creative: {
            ...stateToSend.draft?.creative,
            mediaUrl: attachedFile.url,
            mediaType: attachedFile.type,
            mediaApproved: true,
          },
        },
      };
    }

    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/ai/conversation/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          currentState: stateToSend,
          message: content,
          selectedOption: selectedOption,
        }),
      });

      const data = await res.json();
      if (data.success && data.state) {
        setSession(data.state);
        if (typeof window !== "undefined") {
          localStorage.setItem(`meta_ai_session_${orgId}`, JSON.stringify(data.state));
        }
        if (data.state.conversation?.slice(-1)[0]?.metadata?.openBulkLocationModal) {
          openBulkLocationManager();
        }
      } else {
        setError(data.error || "Failed to process message.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to AI server.");
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmPublish = async () => {
    if (!session || !session.draft) return;
    setIsPublishing(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/ai/conversation/confirm-publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          draft: session.draft,
        }),
      });

      const data = await res.json();
      if (data.success && data.result?.deploymentStatus === "FULL_SUCCESS" && data.result?.ad?.id) {
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: "COMPLETED",
            requiresConfirmation: false,
            executionResult: data.result,
            conversation: [
              ...prev.conversation,
              {
                id: `msg_ai_${Date.now()}`,
                sender: "ai",
                text: `🎉 **Campaign Successfully Published to Meta Ads!**\n\n- **Campaign ID**: \`${data.result.campaign?.id || data.result.metaCampaignId}\`\n- **Ad Set ID**: \`${data.result.adSet?.id || data.result.metaAdSetId}\`\n- **Ad ID**: \`${data.result.ad?.id}\`\n- **Status**: Live / Paused in Meta Ads Manager ready for delivery.`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          };
        });
      } else if (data.result?.deploymentStatus === "PARTIAL_CREATION") {
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: "REVIEW",
            requiresConfirmation: true,
            executionResult: data.result,
            conversation: [
              ...prev.conversation,
              {
                id: `msg_ai_${Date.now()}`,
                sender: "ai",
                text: `⚠️ **Meta Setup Partially Created**: Campaign (\`${data.result.campaign?.id}\`) and Ad Set (\`${data.result.adSet?.id}\`) were created, but Meta blocked the final Ad creation: **${data.result.errorMessage}**. Please certify your account on facebook.com/certification/nondiscrimination and retry.`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          };
        });
        setError(data.result.errorMessage || "Ad creation was blocked by Meta policy.");
      } else {
        setError(data.result?.errorMessage || data.error || "Meta API execution failed.");
      }
    } catch (err: any) {
      setError(err.message || "Network error while publishing campaign.");
    } finally {
      setIsPublishing(false);
    }
  };

  // File Upload & Select Ad States
  const [showAdLibraryModal, setShowAdLibraryModal] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<{ images: any[]; videos: any[] }>({ images: [], videos: [] });
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string; type: "IMAGE" | "VIDEO" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Bulk Location Management State & Handlers ──
  const [showBulkLocationModal, setShowBulkLocationModal] = useState(false);
  const [bulkCountries, setBulkCountries] = useState<string[]>([]);
  const [bulkCities, setBulkCities] = useState<Array<{ name: string; radiusKm: number }>>([]);
  const [bulkPincodes, setBulkPincodes] = useState<string[]>([]);
  const [bulkCityText, setBulkCityText] = useState("");
  const [bulkCountryText, setBulkCountryText] = useState("");
  const [bulkPincodeText, setBulkPincodeText] = useState("");
  const [bulkActiveTab, setBulkActiveTab] = useState<"cities" | "countries" | "pincodes">("cities");

  const openBulkLocationManager = () => {
    if (session?.draft?.targeting) {
      const tgt = session.draft.targeting;
      setBulkCountries(
        Array.isArray(tgt.countries) && tgt.countries.length > 0
          ? [...tgt.countries]
          : ["India"]
      );
      if (Array.isArray(tgt.cityConfigs) && tgt.cityConfigs.length > 0) {
        setBulkCities(tgt.cityConfigs.map((c: any) => ({ name: c.name, radiusKm: c.radiusKm || 30 })));
      } else if (Array.isArray(tgt.cities) && tgt.cities.length > 0) {
        setBulkCities(tgt.cities.map((c: string) => ({ name: c, radiusKm: tgt.radiusKm || 30 })));
      } else if (tgt.locationDescription && !/all india/i.test(tgt.locationDescription)) {
        const parsed = tgt.locationDescription.split(/[,&;\/|]\s*|\s+and\s+/i).map((s: string) => s.trim()).filter(Boolean);
        setBulkCities(parsed.map((c: string) => ({ name: c, radiusKm: 30 })));
      } else {
        setBulkCities([
          { name: "Mumbai", radiusKm: 40 },
          { name: "Pune", radiusKm: 25 },
        ]);
      }
      setBulkPincodes(
        Array.isArray(tgt.postalCodes) && tgt.postalCodes.length > 0
          ? [...tgt.postalCodes]
          : []
      );
    } else {
      setBulkCountries(["India"]);
      setBulkCities([
        { name: "Mumbai", radiusKm: 40 },
        { name: "Pune", radiusKm: 25 },
      ]);
      setBulkPincodes([]);
    }
    setShowBulkLocationModal(true);
  };

  const handleAddBulkCitiesFromText = () => {
    if (!bulkCityText.trim()) return;
    const lines = bulkCityText.split(/[\n\r,;&|]+/);
    const updated = [...bulkCities];
    const seen = new Set(updated.map((c) => c.name.toLowerCase()));

    for (const raw of lines) {
      let clean = raw.trim();
      if (!clean) continue;
      const rMatch = clean.match(/(.+?)\s*\(?(\d{1,3})\s*(?:km|kms)?\)?$/i);
      let radius = 30;
      if (rMatch && rMatch[1] && rMatch[2]) {
        clean = rMatch[1].trim();
        radius = Math.min(80, Math.max(15, parseInt(rMatch[2], 10)));
      }
      if (clean.length >= 2 && !seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        updated.push({
          name: clean.charAt(0).toUpperCase() + clean.slice(1),
          radiusKm: radius,
        });
      }
    }
    setBulkCities(updated);
    setBulkCityText("");
  };

  const handleAddBulkPincodesFromText = () => {
    if (!bulkPincodeText.trim()) return;
    const matches = bulkPincodeText.match(/\b\d{5,6}\b/g) || [];
    const updated = [...bulkPincodes];
    for (const m of matches) {
      if (!updated.includes(m)) {
        updated.push(m);
      }
    }
    setBulkPincodes(updated);
    setBulkPincodeText("");
  };

  const handleAddBulkCountry = (cName: string) => {
    const clean = cName.trim();
    if (clean && !bulkCountries.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      setBulkCountries([...bulkCountries, clean]);
    }
  };

  const handleApplyBulkLocations = () => {
    if (!session) return;
    const cleanCountries = bulkCountries.filter(Boolean);
    const cleanCities = bulkCities.filter((c) => c.name && c.name.trim());
    const cleanPincodes = bulkPincodes.filter(Boolean);

    const summaryParts: string[] = [];
    if (cleanCountries.length > 0) summaryParts.push(`Countries: ${cleanCountries.join(", ")}`);
    if (cleanCities.length > 0)
      summaryParts.push(
        `Cities: ${cleanCities.map((c) => `${c.name} (${c.radiusKm}km)`).join(", ")}`
      );
    if (cleanPincodes.length > 0) summaryParts.push(`PIN: ${cleanPincodes.join(", ")}`);
    const locDesc = summaryParts.join(" | ") || "Custom Bulk Locations";

    const updatedDraft = {
      ...session.draft,
      targeting: {
        ...session.draft.targeting,
        locationType: "BULK",
        countries: cleanCountries,
        cities: cleanCities.map((c) => c.name),
        cityConfigs: cleanCities,
        postalCodes: cleanPincodes,
        locationDescription: locDesc,
      },
    };

    const updatedSession = {
      ...session,
      draft: updatedDraft,
    };
    setSession(updatedSession);
    setShowBulkLocationModal(false);

    handleSendMessage(
      `Updated campaign targeting with bulk locations: ${locDesc}`,
      undefined,
      updatedSession
    );
  };

  const fetchMediaLibrary = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/media?organizationId=${orgId}`);
      const data = await res.json();
      if (data.success && data.media) {
        setMediaLibrary(data.media);
      }
    } catch (e: any) {
      console.warn("Could not load media library:", e.message);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const localUrl = URL.createObjectURL(file);
    const mediaType: "IMAGE" | "VIDEO" = isVideo ? "VIDEO" : "IMAGE";

    // Immediate UI feedback with local preview
    setAttachedFile({
      name: file.name,
      url: localUrl,
      type: mediaType,
    });

    setIsSending(true);
    try {
      // 1. Detect natural aspect ratio from Image / Video dimensions
      let detectedAspect: "1:1" | "9:16" | "16:9" | "4:5" = "1:1";
      let dimensionText = "";

      if (!isVideo) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;
            const ratio = w / (h || 1);
            if (ratio < 0.65) {
              detectedAspect = "9:16";
            } else if (ratio < 0.9) {
              detectedAspect = "4:5";
            } else if (ratio > 1.35) {
              detectedAspect = "16:9";
            } else {
              detectedAspect = "1:1";
            }
            dimensionText = `${w}×${h}`;
            resolve();
          };
          img.onerror = () => resolve();
          img.src = localUrl;
        });
      } else {
        await new Promise<void>((resolve) => {
          const vid = document.createElement("video");
          vid.onloadedmetadata = () => {
            const w = vid.videoWidth;
            const h = vid.videoHeight;
            const ratio = w / (h || 1);
            if (ratio < 0.7) {
              detectedAspect = "9:16";
            } else if (ratio > 1.35) {
              detectedAspect = "16:9";
            } else {
              detectedAspect = "1:1";
            }
            dimensionText = `${w}×${h}`;
            resolve();
          };
          vid.onerror = () => resolve();
          vid.src = localUrl;
        });
      }

      // 2. Upload custom user creative to backend server
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BACKEND}/api/meta-ads/ai/conversation/upload-media`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const finalUrl = data.success && data.media?.url ? data.media.url : localUrl;

      let updatedSession = session;
      if (session) {
        const updatedDraft = {
          ...session.draft,
          creative: {
            ...session.draft?.creative,
            mediaUrl: finalUrl,
            mediaType,
            aspectRatio: detectedAspect,
            mediaApproved: true,
          },
        };
        updatedSession = {
          ...session,
          draft: updatedDraft,
        };
        setSession(updatedSession);
      }

      const aspectLabel = detectedAspect === "9:16" ? "9:16 vertical story / reel" : detectedAspect === "16:9" ? "16:9 landscape banner" : detectedAspect === "4:5" ? "4:5 portrait post" : "1:1 square feed post";
      const dimInfo = dimensionText ? ` (${dimensionText}, ${aspectLabel})` : ` (${aspectLabel})`;
      const additionalPrompt = inputText.trim() ? ` ${inputText.trim()}` : "";
      setInputText("");
      handleSendMessage(
        `I've uploaded my custom ${mediaType.toLowerCase()} creative: "${file.name}"${dimInfo} with aspectRatio: ${detectedAspect}. Please use this graphic for the ad.${additionalPrompt}`,
        undefined,
        updatedSession || undefined
      );
    } catch (err: any) {
      console.warn("Upload error:", err.message);
      const additionalPrompt = inputText.trim() ? ` ${inputText.trim()}` : "";
      setInputText("");
      handleSendMessage(`Attached ${mediaType === "IMAGE" ? "image" : "video"}: "${file.name}" for the ad creative.${additionalPrompt}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectMediaFromLibrary = async (mediaItem: any, type: "IMAGE" | "VIDEO") => {
    const mediaUrl = type === "IMAGE" ? (mediaItem.url || mediaItem.permalink_url) : (mediaItem.source || mediaItem.picture);
    const name = mediaItem.name || `Meta ${type}`;

    setAttachedFile({
      name,
      url: mediaUrl,
      type,
    });

    let detectedAspect: "1:1" | "9:16" | "16:9" | "4:5" = "1:1";
    if (type === "IMAGE" && mediaUrl) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          const ratio = w / (h || 1);
          if (ratio < 0.65) detectedAspect = "9:16";
          else if (ratio < 0.9) detectedAspect = "4:5";
          else if (ratio > 1.35) detectedAspect = "16:9";
          else detectedAspect = "1:1";
          resolve();
        };
        img.onerror = () => resolve();
        img.src = mediaUrl;
      });
    }

    let updatedSession = session;
    if (session) {
      const updatedDraft = {
        ...session.draft,
        creative: {
          ...session.draft?.creative,
          mediaUrl,
          mediaType: type,
          aspectRatio: detectedAspect,
          mediaApproved: true,
        },
      };
      updatedSession = {
        ...session,
        draft: updatedDraft,
      };
      setSession(updatedSession);
    }

    setShowAdLibraryModal(false);
    const aspectLabel = detectedAspect === "9:16" ? "9:16 vertical story / reel" : detectedAspect === "16:9" ? "16:9 landscape banner" : detectedAspect === "4:5" ? "4:5 portrait post" : "1:1 square feed post";
    const additionalPrompt = inputText.trim() ? ` ${inputText.trim()}` : "";
    setInputText("");
    handleSendMessage(
      `Selected ${type === "IMAGE" ? "Image" : "Video"} "${name}" (${aspectLabel}) with aspectRatio: ${detectedAspect} from Meta Ad Library. Please use this graphic for the ad.${additionalPrompt}`,
      undefined,
      updatedSession || undefined
    );
  };

  const draft = session?.draft || {};
  const campaign = draft.campaign || {};
  const targeting = draft.targeting || {};
  const destination = draft.destination || {};
  const creative = draft.creative || {};
  const context: CampaignState["context"] = session?.context || {
    organizationId: "",
    isConnected: false,
    adAccounts: [],
    pages: [],
  };

  const activeAdAccount = context.adAccounts?.find((a: any) => a.adAccountId === draft.adAccountId) || context.adAccounts?.[0];
  const activePage = context.pages?.find((p: any) => p.id === draft.pageId) || context.pages?.[0];
  const extractedBrandName = campaign.name ? campaign.name.replace(/\s*(Sales|Leads|Traffic|Store Visit|Campaign|Ad).*$/i, "").trim() : null;
  const pageNameDisplay = extractedBrandName || draft.pageName || activePage?.name || "Official Business Page";
  const budgetVal = campaign.dailyBudget ? `₹${campaign.dailyBudget.toLocaleString()}/day` : null;
  const campaignTitle = campaign.name || "Meta Ad Campaign";

  const isReadyToReview = Boolean(
    session?.status === "CONFIRMATION" ||
    session?.status === "REVIEW" ||
    session?.status === "COMPLETED" ||
    session?.requiresConfirmation ||
    (draft.campaign?.name && draft.creative?.headline && draft.campaign?.dailyBudget)
  );

  return (
    <div className="relative flex flex-col h-full w-full min-h-0 min-w-0 overflow-hidden bg-[#F9FAFB] font-sans antialiased text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* ── OFFICIAL JISNU AI TOP HEADER ── */}
      <header className="relative py-2.5 border-b border-slate-200/80 flex items-center justify-between px-6 shrink-0 bg-white/95 backdrop-blur-md z-10 shadow-2xs">
        <button
          onClick={() => router.push("/meta-ads")}
          title="Back to Meta Ads Overview"
          className="group flex items-center gap-2.5 py-1 px-2 -ml-2 rounded-2xl hover:bg-slate-100/70 transition-all duration-200 cursor-pointer active:scale-98 text-left"
        >
          <div className="relative flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-950 text-white shadow-sm ring-1 ring-slate-900/10 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/25 group-hover:shadow-md shrink-0">
            <span className="font-extrabold text-[13.5px] tracking-tighter bg-gradient-to-b from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent font-sans">
              J
            </span>
            <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[13px] tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                JISNU
              </span>
              <span className="text-[9.5px] font-black tracking-wider uppercase px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/80 shadow-3xs">
                AI
              </span>
            </div>
            <span className="text-[10.5px] font-medium text-slate-500 tracking-normal group-hover:text-slate-600 transition-colors">
              Ads Automation Studio
            </span>
          </div>
        </button>

        <div className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 select-none">
          <span className="tracking-tight text-[11.5px] font-semibold text-slate-900">JISNU AI</span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Senior Media Buyer</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetSession}
            title="Start fresh conversation"
            className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
          >
            <span className="flex items-center justify-center h-4 w-4 rounded-full bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <RotateCcw className="h-2.5 w-2.5 transition-transform duration-500 ease-out group-hover:-rotate-180" />
            </span>
            <span className="tracking-tight text-[11.5px] font-medium text-slate-700 group-hover:text-slate-900">Reset Chat</span>
          </button>
          <div
            title={`Connected Meta Ad Account: ${activeAdAccount ? activeAdAccount.name : "JISNU Digital Solution's Marketing Agency"} (${activeAdAccount?.adAccountId || "1454270479625110"})`}
            className="group relative hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 select-none cursor-default"
          >
            <span className="flex items-center justify-center h-4 w-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/80 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="tracking-tight text-[11.5px] font-semibold text-slate-800 truncate max-w-[220px]">
                {activeAdAccount ? activeAdAccount.name : "JISNU Digital Solution's Marketing Agency"}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN SCROLLABLE CONVERSATION AREA (AI CHATBOT INBOX WITH BG TEXTURE) ── */}
      <div className="relative flex-1 min-h-0 overflow-y-auto px-4 md:px-0 bg-[#F8FAFC] z-1">
        {/* Subtle AI Chatbot Inbox Background Texture */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 opacity-40"
          aria-hidden="true"
          style={{
            backgroundImage: `url("/patterns/ai-chat-wallpaper.svg")`,
            backgroundRepeat: "repeat",
            backgroundSize: "360px 360px",
            backgroundPosition: "0 0",
          }}
        />

        <div className="relative max-w-2xl mx-auto py-6 space-y-4 z-1">
          {loadingInit ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400 mb-2" />
              <p className="text-xs text-slate-500 font-medium">Initializing JISNU AI with live Meta context...</p>
            </div>
          ) : (
            <>
              {/* Dynamic Conversation Thread */}
              {session?.conversation
                ?.filter((msg, idx, arr) => {
                  if (idx > 0 && arr[idx - 1].sender === msg.sender && arr[idx - 1].text?.trim() === msg.text?.trim()) {
                    return false;
                  }
                  return true;
                })
                .map((msg, index) => {
                const isUser = msg.sender === "user";

                if (isUser) {
                  return (
                    <div key={msg.id || index} className="flex justify-end animate-fadeIn">
                      <div className="max-w-[80%] bg-slate-900 text-white font-normal px-4 py-2.5 rounded-2xl rounded-tr-xs text-[13.5px] leading-relaxed shadow-xs break-words">
                        <p className="whitespace-pre-line">{formatCleanText(msg.text)}</p>
                        <div className="text-[10px] text-slate-400 text-right mt-1 font-medium">
                          {msg.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id || index} className="flex items-start gap-3 animate-fadeIn text-[13.5px] text-slate-800 leading-relaxed">
                    <div className="relative flex items-center justify-center h-7 w-7 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-950 text-white shrink-0 shadow-xs mt-0.5 ring-1 ring-slate-900/10 overflow-hidden font-extrabold text-[12px] tracking-tighter">
                      <span className="bg-gradient-to-b from-white to-indigo-100 bg-clip-text text-transparent">J</span>
                      <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
                    </div>

                    <div className="flex-1 space-y-2 max-w-[88%]">
                      <div className="bg-white p-4.5 rounded-2xl rounded-tl-xs border border-slate-200/90 shadow-xs">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[11.5px] font-bold text-slate-900 tracking-tight">JISNU AI</span>
                          <span className="text-slate-300 text-[10px]">·</span>
                          <span className="inline-flex items-center text-[10px] text-indigo-700 font-medium bg-indigo-50/80 px-2 py-0.5 rounded-full border border-indigo-100/70 shadow-2xs">
                            Senior Media Buyer
                          </span>
                        </div>

                      {/* Special Render for Live Campaign Success Announcement */}
                      {msg.text.includes("Successfully Published") || msg.text.includes("Successfully Deployed") ? (
                        <div className="mt-3 p-4 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-xl border border-emerald-500/40 shadow-lg space-y-3">
                          <div className="flex items-center justify-between border-b border-emerald-800/50 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                              </span>
                              <span className="font-bold text-sm text-emerald-300">Meta Ads Live Deployment</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              FULL SUCCESS
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            {session?.executionResult?.campaign?.id && (
                              <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
                                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Campaign ID</div>
                                <div className="font-mono text-emerald-400 font-bold truncate mt-0.5" title={session.executionResult.campaign.id}>
                                  {session.executionResult.campaign.id}
                                </div>
                              </div>
                            )}
                            {session?.executionResult?.adSet?.id && (
                              <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
                                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ad Set ID</div>
                                <div className="font-mono text-sky-400 font-bold truncate mt-0.5" title={session.executionResult.adSet.id}>
                                  {session.executionResult.adSet.id}
                                </div>
                              </div>
                            )}
                            {session?.executionResult?.ad?.id && (
                              <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
                                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ad Object ID</div>
                                <div className="font-mono text-amber-400 font-bold truncate mt-0.5" title={session.executionResult.ad.id}>
                                  {session.executionResult.ad.id}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-2 flex flex-wrap items-center gap-2">
                            <a
                              href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${draft.adAccountId || activeAdAccount?.adAccountId || "1454270479625110"}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              <Megaphone className="h-3.5 w-3.5" />
                              <span>Open in Meta Ads Manager</span>
                              <ExternalLink className="h-3 w-3 ml-0.5 opacity-80" />
                            </a>

                            <button
                              type="button"
                              onClick={handleResetSession}
                              className="group px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all border border-slate-700 flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-transform duration-500 ease-out group-hover:-rotate-180" />
                              <span>Create Another Campaign</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => router.push("/meta-ads")}
                              className="px-3.5 py-2 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>📊 View All Campaigns</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-line text-slate-800 text-[13px]">{formatCleanText(msg.text)}</p>
                      )}

                      {/* Inline Interactive Upload Button Card when user wants to upload own media */}
                      {msg.metadata?.requiresUpload && (
                        <div className="mt-3 p-3.5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-2.5 text-xs text-sky-950 font-medium">
                            <span className="text-xl">🖼️</span>
                            <div>
                              <div className="font-bold text-sky-900">Upload Your Ad Image / Video</div>
                              <div className="text-[11px] text-sky-700">Recommended: 1080×1080 Square or 1200×628 Landscape</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full sm:w-auto px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                          >
                            <span>📤 Select File from Device</span>
                          </button>
                        </div>
                      )}

                      {/* AI Generated Creative Image Preview Card */}
                      {msg.metadata?.imageUrl && (
                        <div className="mt-3.5 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs">
                          <div className="relative aspect-square max-h-[340px] w-full bg-slate-900 flex items-center justify-center overflow-hidden group">
                            <img
                              src={msg.metadata.imageUrl}
                              alt="Generated Ad Creative"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5 shadow-sm">
                              <Sparkles className="h-3 w-3 text-amber-400" />
                              <span>1080 × 1080 Meta Feed</span>
                            </div>
                            {msg.metadata.imageApproved && (
                              <div className="absolute bottom-2.5 left-2.5 bg-emerald-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                <span>✓ Approved for Ad</span>
                              </div>
                            )}
                          </div>
                          <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                              {msg.metadata.visualDirection ? `Visual: ${msg.metadata.visualDirection.substring(0, 40)}...` : "AI Generated Artwork"}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {!msg.metadata.imageApproved && (
                                <button
                                  type="button"
                                  disabled={isSending || isPublishing}
                                  onClick={() => handleSendMessage("Use this image", "use_this_image")}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1877F2] hover:bg-[#166fe5] text-white transition-all shadow-xs cursor-pointer flex items-center gap-1"
                                >
                                  <span>✓ Use this image</span>
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={isSending || isPublishing}
                                onClick={() => handleSendMessage("Generate another image", "regenerate_image")}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <span>🔄 Regenerate</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 text-right mt-1 font-medium">
                        {msg.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    {/* Quick Options Chips */}
                    {msg.quickOptions && msg.quickOptions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1 pl-1">
                        {msg.quickOptions.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            disabled={isSending || isPublishing}
                            onClick={() => {
                              if (opt.value === "OPEN_BULK_LOCATIONS" || /open.*bulk.*location|bulk.*location.*radii/i.test(opt.value || opt.label)) {
                                openBulkLocationManager();
                              } else if (opt.value === "upload_own_image" || /upload my own|upload image|upload graphic|अपलोड|upload/i.test(opt.label)) {
                                fileInputRef.current?.click();
                              } else {
                                handleSendMessage(opt.label, opt.value);
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50 active:scale-95 flex items-center gap-1.5"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
              })}

              {/* ── COMPREHENSIVE PRODUCTION-GRADE LIVE AD PREVIEW & BLUEPRINT CARD (Rendered ONLY at end of consultation) ── */}
              {isReadyToReview && (
                <div className="space-y-4 text-[13px] text-slate-800 leading-relaxed pt-2 animate-fadeIn border-t border-slate-200 mt-4">
                  
                  {/* 1. Live Facebook & Instagram Feed Ad Preview Card */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-[13px] text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-[#1877F2]" />
                        <span>Live Meta Feed Ad Preview (Interactive)</span>
                      </h3>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Zero Placeholders · Ready
                      </span>
                    </div>

                    {/* Facebook Feed Card Mockup */}
                    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-md">
                      {/* Interactive Copy Angle Variations Selector */}
                      {creative.variations && creative.variations.length > 0 && (
                        <div className="bg-slate-900 text-white p-3 border-b border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-sky-400 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> Production Copy Variations (AI Engineered)
                            </span>
                            <span className="text-[10px] text-slate-400">Click to preview angle</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {creative.variations.map((v: any, vIdx: number) => {
                              const isSelected = creative.headline === v.headline;
                              return (
                                <button
                                  key={vIdx}
                                  type="button"
                                  onClick={() => {
                                    if (session) {
                                      setSession({
                                        ...session,
                                        draft: {
                                          ...session.draft,
                                          creative: {
                                            ...session.draft.creative,
                                            headline: v.headline,
                                            primaryText: v.primaryText,
                                            description: v.description || session.draft.creative.description,
                                          },
                                        },
                                      });
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-[#1877F2] text-white shadow-xs"
                                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                  }`}
                                >
                                  {v.angle === "DIRECT_OFFER"
                                    ? "🔥 Direct Offer"
                                    : v.angle === "PAIN_POINT_CURIOSITY"
                                    ? "⚡ Pain Point & Hook"
                                    : "⭐ Social Proof"}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Header */}
                      <div className="p-3.5 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                            <img src={activePage?.picture || "/icon.jpeg"} alt="Page Logo" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{pageNameDisplay}</span>
                              <span className="inline-flex items-center text-[#1877F2]" title="Meta Verified Business">
                                <ShieldCheck className="h-3.5 w-3.5 fill-[#1877F2] text-white" />
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span>Sponsored</span> · <Globe className="h-2.5 w-2.5" />
                            </div>
                          </div>
                        </div>
                        <span className="text-slate-400 text-sm">•••</span>
                      </div>

                      {/* Primary Text / Ad Copy (Editable) */}
                      <div className="px-4 py-3 text-xs text-slate-800 whitespace-pre-line leading-relaxed border-b border-slate-100 bg-slate-50/30 font-sans relative group">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Primary Text (Ad Copy)</label>
                        <textarea
                          rows={3}
                          value={creative.primaryText || ""}
                          placeholder="Enter your ad copy / primary text here..."
                          onChange={(e) => {
                            const val = e.target.value;
                            if (session) {
                              setSession({
                                ...session,
                                draft: {
                                  ...session.draft,
                                  creative: {
                                    ...session.draft.creative,
                                    primaryText: val,
                                  },
                                },
                              });
                            }
                          }}
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-sans leading-relaxed resize-y"
                        />
                      </div>

                      {/* Aspect Ratio Selector Controls */}
                      <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-600">Placement Format:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    creative: {
                                      ...session.draft.creative,
                                      aspectRatio: "1:1",
                                    },
                                  },
                                });
                              }
                            }}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all text-[11px] flex items-center gap-1 ${
                              creative.aspectRatio === "1:1" || !creative.aspectRatio
                                ? "bg-white text-blue-600 shadow-2xs border border-slate-200"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            <span>🖼️ 1:1 Feed Post</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    creative: {
                                      ...session.draft.creative,
                                      aspectRatio: "9:16",
                                    },
                                  },
                                });
                              }
                            }}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all text-[11px] flex items-center gap-1 ${
                              creative.aspectRatio === "9:16"
                                ? "bg-white text-blue-600 shadow-2xs border border-slate-200"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            <span>📱 9:16 Story/Reel</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    creative: {
                                      ...session.draft.creative,
                                      aspectRatio: "16:9",
                                    },
                                  },
                                });
                              }
                            }}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all text-[11px] flex items-center gap-1 ${
                              creative.aspectRatio === "16:9"
                                ? "bg-white text-blue-600 shadow-2xs border border-slate-200"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            <span>🖥️ 16:9 Banner</span>
                          </button>
                        </div>
                      </div>

                      {/* Visual Banner Area */}
                      <div className={`relative w-full ${
                        creative.aspectRatio === "9:16"
                          ? "aspect-[9/16] max-h-[440px]"
                          : creative.aspectRatio === "16:9"
                          ? "aspect-[16/9] max-h-[300px]"
                          : creative.aspectRatio === "4:5"
                          ? "aspect-[4/5] max-h-[400px]"
                          : "aspect-square max-h-[380px]"
                      } bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center text-white overflow-hidden transition-all duration-300`}>
                        {attachedFile ? (
                          attachedFile.type === "IMAGE" ? (
                            <img src={attachedFile.url} alt="Attached Creative" className="w-full h-full object-cover absolute inset-0" />
                          ) : (
                            <video src={attachedFile.url} controls className="w-full h-full object-cover absolute inset-0" />
                          )
                        ) : creative.mediaUrl ? (
                          <img src={creative.mediaUrl} alt="Creative" className="w-full h-full object-cover absolute inset-0" />
                        ) : (
                          <div className="relative z-10 flex flex-col items-center gap-2 max-w-md">
                            <div className="h-10 w-10 rounded-2xl bg-blue-600/80 backdrop-blur-md flex items-center justify-center shadow-lg border border-blue-400/40">
                              <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                              {pageNameDisplay} · Official Graphic Banner
                            </span>
                            <h4 className="text-base font-extrabold text-white leading-snug drop-shadow-md">
                              {creative.headline || `${pageNameDisplay} Special Offer`}
                            </h4>
                            <p className="text-[11px] text-slate-200 line-clamp-2">
                              {creative.description || `⭐⭐⭐⭐⭐ Visit ${pageNameDisplay} Today • Exclusive Offer`}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Link Bar & Call to Action Button (Editable Headline & Description) */}
                      <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="text-[10px] uppercase font-semibold text-slate-400 truncate">
                            {destination.type === "WHATSAPP"
                              ? "api.whatsapp.com"
                              : destination.type === "PHONE_CALL"
                              ? `tel:${destination.phoneNumber || destination.whatsappPhoneNumber || "9325174465"}`
                              : destination.type === "INSTANT_FORM" || destination.type === "LEAD_FORM"
                              ? "facebook.com/forms"
                              : destination.type === "MESSENGER"
                              ? `m.me/${activePage?.name?.toLowerCase().replace(/\s+/g, '') || "business"}`
                              : destination.type === "INSTAGRAM_DM"
                              ? `ig.me/m/${activePage?.name?.toLowerCase().replace(/\s+/g, '') || "direct"}`
                              : destination.type === "APP"
                              ? (destination.appUrl?.replace(/^https?:\/\//, "") || "play.google.com/store/apps")
                              : destination.type === "SHOP"
                              ? (destination.shopUrl?.replace(/^https?:\/\//, "") || "shop.facebook.com")
                              : destination.type === "INSTAGRAM_PROFILE"
                              ? (destination.instagramProfileUrl?.replace(/^https?:\/\//, "") || `instagram.com/${activePage?.name?.toLowerCase().replace(/\s+/g, '') || "official"}`)
                              : destination.type === "PAGE_EVENT"
                              ? "facebook.com/events"
                              : (destination.destinationUrl?.replace(/^https?:\/\//, "") || "jisnudigital.com")}
                          </div>
                          
                          {/* Headline Input */}
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Headline</label>
                            <input
                              type="text"
                              value={creative.headline || ""}
                              placeholder="Write a short, punchy headline..."
                              onChange={(e) => {
                                const val = e.target.value;
                                if (session) {
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      creative: {
                                        ...session.draft.creative,
                                        headline: val,
                                      },
                                    },
                                  });
                                }
                              }}
                              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-md px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          {/* Description Input */}
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Link Description</label>
                            <input
                              type="text"
                              value={creative.description || ""}
                              placeholder="Write a short description or social proof..."
                              onChange={(e) => {
                                const val = e.target.value;
                                if (session) {
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      creative: {
                                        ...session.draft.creative,
                                        description: val,
                                      },
                                    },
                                  });
                                }
                              }}
                              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-md px-2.5 py-1 text-[11px] text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <button className="px-4 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-lg shadow-2xs shrink-0 cursor-default flex items-center justify-center gap-1.5 self-end sm:self-center">
                          {destination.type === "WHATSAPP" ? (
                            <MessageCircle className="h-3.5 w-3.5" />
                          ) : destination.type === "PHONE_CALL" ? (
                            <Phone className="h-3.5 w-3.5" />
                          ) : destination.type === "INSTANT_FORM" || destination.type === "LEAD_FORM" ? (
                            <FileText className="h-3.5 w-3.5" />
                          ) : destination.type === "MESSENGER" ? (
                            <MessageSquare className="h-3.5 w-3.5" />
                          ) : destination.type === "INSTAGRAM_DM" ? (
                            <MessageCircle className="h-3.5 w-3.5 text-pink-300" />
                          ) : destination.type === "APP" ? (
                            <Smartphone className="h-3.5 w-3.5" />
                          ) : destination.type === "SHOP" ? (
                            <ShoppingBag className="h-3.5 w-3.5" />
                          ) : destination.type === "INSTAGRAM_PROFILE" ? (
                            <UserCheck className="h-3.5 w-3.5" />
                          ) : destination.type === "PAGE_EVENT" ? (
                            <Calendar className="h-3.5 w-3.5" />
                          ) : (
                            <ExternalLink className="h-3.5 w-3.5" />
                          )}
                          <span>
                            {destination.type === "WHATSAPP"
                              ? "WhatsApp Message"
                              : destination.type === "PHONE_CALL"
                              ? `Call ${destination.phoneNumber || destination.whatsappPhoneNumber || ""}`
                              : destination.type === "INSTANT_FORM" || destination.type === "LEAD_FORM"
                              ? (creative.callToAction?.replace(/_/g, " ") || "Apply Now")
                              : destination.type === "MESSENGER"
                              ? "Send Message"
                              : destination.type === "INSTAGRAM_DM"
                              ? "Send Message"
                              : destination.type === "APP"
                              ? (creative.callToAction?.replace(/_/g, " ") || "Install Now")
                              : destination.type === "SHOP"
                              ? (creative.callToAction?.replace(/_/g, " ") || "Shop Now")
                              : destination.type === "INSTAGRAM_PROFILE"
                              ? "Visit Profile"
                              : destination.type === "PAGE_EVENT"
                              ? "Interested / RSVP"
                              : (creative.callToAction?.replace(/_/g, " ") || "Learn More")}
                          </span>
                        </button>
                      </div>

                      {/* ── INTERACTIVE DESTINATION LIVE PREVIEW MOCKUPS ── */}
                      {/* 1. WhatsApp Pre-filled Greeting Mockup */}
                      {(!destination.type || destination.type === "WHATSAPP") && (
                        <div className="px-4 py-2.5 bg-emerald-50/80 border-t border-emerald-100 flex items-start gap-2 text-xs text-emerald-900">
                          <MessageCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div className="space-y-1 w-full">
                            <div className="font-bold text-emerald-950 flex items-center justify-between">
                              <span>Pre-Filled WhatsApp Customer Message</span>
                              <span className="text-[10px] text-emerald-700 font-normal">Opens automatically on click</span>
                            </div>
                            <input
                              type="text"
                              value={destination.welcomeMessage || `Hi ${campaignTitle || 'there'}, I saw your ad on Facebook and want to know more about ${creative.headline || 'your special offer'}!`}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (session) {
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      destination: {
                                        ...session.draft.destination,
                                        welcomeMessage: val,
                                      },
                                    },
                                  });
                                }
                              }}
                              className="w-full bg-white border border-emerald-300 focus:border-emerald-600 rounded-md px-2 py-1 text-[11px] text-emerald-900 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* 2. Instant Lead Form Mockup */}
                      {(destination.type === "INSTANT_FORM" || destination.type === "LEAD_FORM") && (
                        <div className="px-4 py-2.5 bg-indigo-50/90 border-t border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-950">
                          <FileText className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                          <div className="space-y-1.5 w-full">
                            <div className="font-bold flex items-center justify-between">
                              <span>Instant Lead Form Preview (In-App Popup)</span>
                              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-semibold">Zero Friction</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                              {(destination.leadGenFormFields || ["FULL_NAME", "PHONE", "EMAIL"]).map((fld: string, fIdx: number) => (
                                <div key={fIdx} className="bg-white/90 border border-indigo-200/80 rounded px-2 py-1 text-[10px] text-slate-700 font-medium">
                                  {fld === "FULL_NAME" ? "👤 Full Name (Auto-filled)" : fld === "PHONE" ? "📞 Mobile Number" : fld === "EMAIL" ? "📧 Email Address" : fld === "CITY" ? "📍 City" : fld}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. Phone Call Direct Mockup */}
                      {destination.type === "PHONE_CALL" && (
                        <div className="px-4 py-2.5 bg-emerald-50/90 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                            <div>
                              <div className="font-bold">Direct Phone Call Prompt</div>
                              <div className="text-[11px] text-emerald-800">
                                Clicking ad opens customer's native dialer to: <span className="font-mono font-bold">{destination.phoneNumber || destination.whatsappPhoneNumber || "+91 [Set in chat]"}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">Call Now</span>
                        </div>
                      )}

                      {/* 4. Mobile App Install Mockup */}
                      {destination.type === "APP" && (
                        <div className="px-4 py-2.5 bg-blue-50/90 border-t border-blue-100 flex items-center justify-between text-xs text-blue-950">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-blue-600 shrink-0" />
                            <div>
                              <div className="font-bold">App Store / Google Play Install Card</div>
                              <div className="text-[11px] text-blue-800">⭐⭐⭐⭐⭐ 4.8 Rating · Free Download · Official Store Deep Link</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">Get App</span>
                        </div>
                      )}

                      {/* 5. Meta Shop Mockup */}
                      {destination.type === "SHOP" && (
                        <div className="px-4 py-2.5 bg-amber-50/90 border-t border-amber-100 flex items-center justify-between text-xs text-amber-950">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-amber-600 shrink-0" />
                            <div>
                              <div className="font-bold">Facebook & Instagram Shop Catalog</div>
                              <div className="text-[11px] text-amber-800">In-App Native Checkout · Product Tagging Enabled</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">View Shop</span>
                        </div>
                      )}

                      {/* 6. Instagram Profile Mockup */}
                      {destination.type === "INSTAGRAM_PROFILE" && (
                        <div className="px-4 py-2.5 bg-pink-50/90 border-t border-pink-100 flex items-center justify-between text-xs text-pink-950">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-pink-600 shrink-0" />
                            <div>
                              <div className="font-bold">Instagram Profile Growth Card</div>
                              <div className="text-[11px] text-pink-800">@{activePage?.name?.toLowerCase().replace(/\s+/g, '') || "brand"} · Drives Instagram Followers & Page Views</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-pink-600 text-white px-2 py-0.5 rounded-full">Follow</span>
                        </div>
                      )}

                      {/* 7. Facebook Page Event Mockup */}
                      {destination.type === "PAGE_EVENT" && (
                        <div className="px-4 py-2.5 bg-purple-50/90 border-t border-purple-100 flex items-center justify-between text-xs text-purple-950">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-600 shrink-0" />
                            <div>
                              <div className="font-bold">Facebook Page Event RSVP</div>
                              <div className="text-[11px] text-purple-800">{destination.eventName || `${campaign.name || 'Business'} Official Event`}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">RSVP</span>
                        </div>
                      )}

                      {/* Social Reaction Bar Mockup */}
                      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5 text-blue-600" /> Like</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> Comment</span>
                        <span className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5" /> Share</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Structured Campaign Blueprint Card */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-[13px] text-slate-900 flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-[#1877F2]" />
                      <span>Meta Campaign Configuration & Targeting</span>
                    </h3>

                    <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white text-[12px] shadow-sm divide-y divide-slate-100">
                      <div className="grid grid-cols-4 px-4 py-2.5 items-start">
                        <span className="text-slate-500 font-medium">Campaign</span>
                        <div className="col-span-3 flex items-center justify-between gap-2">
                          <span className="text-slate-900 font-bold">{campaignTitle}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                            Version {session?.versionNumber || 1}
                          </span>
                        </div>
                      </div>

                      {/* Meta Ad Account & Page Selectors */}
                      <div className="grid grid-cols-4 px-4 py-2.5 items-center bg-slate-50/70">
                        <span className="text-slate-500 font-medium">Ad Account</span>
                        <div className="col-span-3 flex items-center gap-2">
                          <select
                            value={draft.adAccountId || activeAdAccount?.adAccountId || ""}
                            onChange={(e) => {
                              const newActId = e.target.value;
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    adAccountId: newActId,
                                  },
                                });
                              }
                            }}
                            className="bg-white border border-slate-200 text-slate-900 font-semibold text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs max-w-xs truncate"
                          >
                            {context.adAccounts && context.adAccounts.length > 0 ? (
                              context.adAccounts.map((act: any) => (
                                <option key={act.adAccountId || act.id} value={act.adAccountId || act.id}>
                                  {act.name} ({act.adAccountId || act.id})
                                </option>
                              ))
                            ) : (
                              <option value="1454270479625110">Default Ad Account (1454270479625110)</option>
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 px-4 py-2.5 items-center bg-slate-50/70">
                        <span className="text-slate-500 font-medium">Facebook Page</span>
                        <div className="col-span-3 flex items-center gap-2">
                          <select
                            value={draft.pageId || activePage?.id || ""}
                            onChange={(e) => {
                              const newPageId = e.target.value;
                              const selectedPageObj = context.pages?.find((p: any) => p.id === newPageId);
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    pageId: newPageId,
                                    pageName: selectedPageObj?.name || draft.pageName,
                                  },
                                });
                              }
                            }}
                            className="bg-white border border-slate-200 text-slate-900 font-semibold text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs max-w-xs truncate"
                          >
                            {context.pages && context.pages.length > 0 ? (
                              context.pages.map((pg: any) => (
                                <option key={pg.id} value={pg.id}>
                                  {pg.name} ({pg.id})
                                </option>
                              ))
                            ) : (
                              <option value="605330362660142">Default Facebook Page (605330362660142)</option>
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 px-4 py-2.5 items-center">
                        <span className="text-slate-500 font-medium">Objective</span>
                        <div className="col-span-3 flex items-center gap-2">
                          <select
                            value={campaign.objective || "OUTCOME_LEADS"}
                            onChange={(e) => {
                              const newObj = e.target.value;
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    campaign: {
                                      ...session.draft.campaign,
                                      objective: newObj,
                                    },
                                  },
                                });
                              }
                            }}
                            className="bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="OUTCOME_LEADS">🎯 OUTCOME_LEADS (Leads, WhatsApp, Instant Forms, Calls)</option>
                            <option value="OUTCOME_SALES">💰 OUTCOME_SALES (Purchases, Conversions, Meta Shop)</option>
                            <option value="OUTCOME_TRAFFIC">🚀 OUTCOME_TRAFFIC (Link Clicks, Website Traffic)</option>
                            <option value="OUTCOME_ENGAGEMENT">💬 OUTCOME_ENGAGEMENT (Messages, Post Engagements)</option>
                            <option value="OUTCOME_AWARENESS">📢 OUTCOME_AWARENESS (Brand Reach, Impressions)</option>
                            <option value="OUTCOME_APP_PROMOTION">📱 OUTCOME_APP_PROMOTION (Mobile App Installs)</option>
                          </select>
                          <span className="text-[10px] text-slate-500 font-medium">ODAX Framework</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 px-4 py-2.5 items-center">
                        <span className="text-slate-500 font-medium">Special Categories</span>
                        <div className="col-span-3 flex items-center gap-2">
                          <select
                            value={campaign.specialAdCategory || "NONE"}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    campaign: {
                                      ...session.draft.campaign,
                                      specialAdCategory: val,
                                    },
                                  },
                                });
                              }
                            }}
                            className="bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="NONE">NONE (Standard Business / No Category)</option>
                            <option value="FINANCIAL_PRODUCTS_SERVICES">Financial products and services (Credit, Cards, Loans, Investments, Banking)</option>
                            <option value="EMPLOYMENT">Employment (Job offers, Internships, Hiring)</option>
                            <option value="HOUSING">Housing (Property listings, Mortgages, Home insurance)</option>
                            <option value="ISSUES_ELECTIONS_POLITICS">Social issues, elections or politics (Political figures, Social issues)</option>
                          </select>
                          <span className="text-[10px] text-slate-500 italic">Meta Official Requirement</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 px-4 py-2.5 items-center">
                        <div className="space-y-0.5">
                          <span className="text-slate-500 font-medium block">Budget</span>
                          <span className="text-[10px] text-slate-400 font-medium">Advantage+ CBO</span>
                        </div>
                        <div className="col-span-3 flex flex-wrap items-center gap-2">
                          {/* Budget Type Selector */}
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-[11px] font-bold">
                            <button
                              type="button"
                              onClick={() => {
                                if (session) {
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      campaign: {
                                        ...session.draft.campaign,
                                        budgetType: "DAILY",
                                        dailyBudget: session.draft.campaign?.dailyBudget || 500,
                                      },
                                    },
                                  });
                                }
                              }}
                              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                (campaign as any).budgetType !== "TOTAL" && !campaign.lifetimeBudget
                                  ? "bg-white text-blue-600 shadow-2xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Daily
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (session) {
                                  const total = (session.draft.campaign?.dailyBudget || 500) * 30;
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      campaign: {
                                        ...session.draft.campaign,
                                        budgetType: "TOTAL",
                                        lifetimeBudget: total,
                                      },
                                    },
                                  });
                                }
                              }}
                              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                (campaign as any).budgetType === "TOTAL" || campaign.lifetimeBudget
                                  ? "bg-white text-blue-600 shadow-2xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Lifetime
                            </button>
                          </div>

                          {/* Budget Amount Input */}
                          <div className="relative flex items-center">
                            <span className="absolute left-2.5 text-slate-500 font-bold text-xs">₹</span>
                            <input
                              type="number"
                              min="100"
                              step="50"
                              value={
                                (campaign as any).budgetType === "TOTAL" || campaign.lifetimeBudget
                                  ? campaign.lifetimeBudget || ((campaign.dailyBudget || 500) * 30)
                                  : campaign.dailyBudget || 500
                              }
                              onChange={(e) => {
                                const val = Math.max(100, parseInt(e.target.value) || 100);
                                if (session) {
                                  const isLifetime = (session.draft.campaign as any).budgetType === "TOTAL" || Boolean(session.draft.campaign?.lifetimeBudget);
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      campaign: {
                                        ...session.draft.campaign,
                                        dailyBudget: isLifetime ? Math.round(val / 30) : val,
                                        lifetimeBudget: isLifetime ? val : val * 30,
                                      },
                                    },
                                  });
                                }
                              }}
                              className="pl-6 pr-2.5 py-1 w-28 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[11px] text-slate-500 font-medium ml-1.5">
                              {(campaign as any).budgetType === "TOTAL" || campaign.lifetimeBudget ? "total (30 days)" : "/day"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic ROI & Monthly Lead Yield Forecast Card */}
                      <div className="grid grid-cols-4 px-4 py-2.5 items-start bg-emerald-50/50">
                        <span className="text-emerald-800 font-bold">ROI Forecast</span>
                        <div className="col-span-3 space-y-0.5">
                          <div className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                            <span>
                              Est. ~{Math.max(12, Math.round(((campaign.dailyBudget || 500) * 30) / 72.20))} Qualified Leads/Month
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-700">
                            Based on ₹{(campaign.dailyBudget || 500).toLocaleString('en-IN')}/day budget (₹{((campaign.dailyBudget || 500) * 30).toLocaleString('en-IN')}/mo) · ~{Math.round((campaign.dailyBudget || 500) * 30 * 42).toLocaleString('en-IN')} impressions
                          </div>
                        </div>
                      </div>

                      {/* Schedule Launch Time Row */}
                      <div className="grid grid-cols-4 px-4 py-2.5 items-start">
                        <div className="space-y-0.5">
                          <span className="text-slate-500 font-medium block">Schedule</span>
                          <span className="text-[10px] text-slate-400 font-medium">Start & End</span>
                        </div>
                        <div className="col-span-3 space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-slate-500 text-[11px] font-medium w-12">Start:</span>
                            <input
                              type="datetime-local"
                              value={
                                campaign.startTime
                                  ? new Date(new Date(campaign.startTime).getTime() - new Date().getTimezoneOffset() * 60000)
                                      .toISOString()
                                      .slice(0, 16)
                                  : ""
                              }
                              onChange={(e) => {
                                const dateStr = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                                if (session) {
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      campaign: {
                                        ...session.draft.campaign,
                                        startTime: dateStr,
                                      },
                                    },
                                  });
                                }
                              }}
                              className="bg-white border border-slate-200 text-slate-800 text-[11px] font-medium rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {!campaign.startTime && (
                              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Launch Immediately
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-slate-500 text-[11px] font-medium w-12">End:</span>
                            <input
                              type="datetime-local"
                              value={
                                campaign.endTime
                                  ? new Date(new Date(campaign.endTime).getTime() - new Date().getTimezoneOffset() * 60000)
                                      .toISOString()
                                      .slice(0, 16)
                                  : ""
                              }
                              onChange={(e) => {
                                const dateStr = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                                if (session) {
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      campaign: {
                                        ...session.draft.campaign,
                                        endTime: dateStr,
                                      },
                                    },
                                  });
                                }
                              }}
                              className="bg-white border border-slate-200 text-slate-800 text-[11px] font-medium rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {!campaign.endTime && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                Ongoing (No end date set)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Meta Destination Section */}
                      <div className="grid grid-cols-4 px-4 py-2.5 items-start">
                        <div className="pt-0.5 space-y-1 pr-2">
                          <span className="text-slate-500 font-medium block">Destination</span>
                          <select
                            value={destination.type || "WHATSAPP"}
                            onChange={(e) => {
                              const newDest = e.target.value;
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    destination: {
                                      ...session.draft.destination,
                                      type: newDest,
                                    },
                                  },
                                });
                              }
                            }}
                            className="w-full bg-white border border-slate-200 text-slate-800 text-[10px] font-bold rounded-md px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                          >
                            <option value="WHATSAPP">💬 WhatsApp</option>
                            <option value="WEBSITE">🌐 Website</option>
                            <option value="INSTANT_FORM">📝 Instant Form</option>
                            <option value="PHONE_CALL">📞 Phone Call</option>
                            <option value="MESSENGER">⚡ Messenger</option>
                            <option value="INSTAGRAM_DM">📸 Instagram DM</option>
                            <option value="APP">📱 Mobile App</option>
                            <option value="SHOP">🛍️ Meta Shop</option>
                            <option value="INSTAGRAM_PROFILE">👤 Instagram Profile</option>
                            <option value="PAGE_EVENT">📅 Page Event</option>
                          </select>
                        </div>
                        <div className="col-span-3 space-y-2">
                          {destination.type === "WEBSITE" ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                                <Globe className="h-3.5 w-3.5 text-blue-600" />
                                <span>Website</span>
                                <span className="text-[10px] text-slate-500 font-normal">· Send people to your website</span>
                              </div>
                              <div className="bg-slate-50 border border-slate-200 rounded-md p-2 space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 font-medium">Website URL:</span>
                                  <span className="font-mono text-blue-600 font-semibold truncate max-w-[200px]">
                                    {destination.destinationUrl || "https://yourwebsite.com"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 font-medium">Display link:</span>
                                  <span className="font-mono text-slate-700 font-semibold">
                                    {destination.displayLink || (destination.destinationUrl ? destination.destinationUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : "yourwebsite.com")}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-0.5 border-t border-slate-200/60">
                                  <span className="text-slate-500 font-medium">Browser add-on:</span>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-200 text-slate-800">
                                    {destination.browserAddOn === "CALL" && "📞 Call Button"}
                                    {destination.browserAddOn === "WHATSAPP" && "💬 WhatsApp Button"}
                                    {destination.browserAddOn === "MESSENGER" && "⚡ Messenger Button"}
                                    {(!destination.browserAddOn || destination.browserAddOn === "NONE") && "🚫 None (No button)"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : destination.type === "INSTANT_FORM" || destination.type === "LEAD_FORM" ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                                <FileText className="h-3.5 w-3.5 text-indigo-600" />
                                <span>Instant form (suggested)</span>
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded font-semibold">Meta Native</span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                Collect people's contact information natively inside Facebook & Instagram feeds.
                              </div>
                              <div className="text-[11px] font-medium text-indigo-900 bg-indigo-50/60 border border-indigo-100 rounded px-2 py-1 flex items-center justify-between">
                                <span>Form: {destination.leadGenFormTitle || `${campaign.name || 'Business'} Instant Lead Form`}</span>
                                <span className="text-[10px] text-emerald-600 font-bold">✓ Instant Sync</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                <span className="text-[10px] font-semibold text-slate-500 mr-0.5">Form Fields:</span>
                                {(destination.leadGenFormFields && destination.leadGenFormFields.length > 0
                                  ? destination.leadGenFormFields
                                  : ["FULL_NAME", "PHONE", "EMAIL"]
                                ).map((f: string, fIdx: number) => {
                                  const fUpper = f.toUpperCase();
                                  const label =
                                    fUpper === "FULL_NAME"
                                      ? "👤 Full Name"
                                      : fUpper === "PHONE"
                                      ? "📞 Phone"
                                      : fUpper === "EMAIL"
                                      ? "📧 Email"
                                      : fUpper === "CITY"
                                      ? "📍 City"
                                      : f;
                                  return (
                                    <span
                                      key={fIdx}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs"
                                    >
                                      {label}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ) : destination.type === "APP" ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                                <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                                <span>Mobile App Install</span>
                                <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded font-semibold">Google Play & App Store</span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                Send people directly to download or open your mobile app.
                              </div>
                              <div className="bg-slate-50 border border-slate-200 rounded-md p-2 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-slate-500 font-medium shrink-0">App URL:</span>
                                  <input
                                    type="text"
                                    placeholder="https://play.google.com/store/apps/details?id=..."
                                    value={destination.appUrl || destination.destinationUrl || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (session) {
                                        setSession({
                                          ...session,
                                          draft: {
                                            ...session.draft,
                                            destination: {
                                              ...session.draft.destination,
                                              appUrl: val,
                                              destinationUrl: val,
                                            },
                                          },
                                        });
                                      }
                                    }}
                                    className="font-mono text-blue-600 font-semibold bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] w-full focus:outline-none focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : destination.type === "SHOP" ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                                <ShoppingBag className="h-3.5 w-3.5 text-amber-600" />
                                <span>Meta Facebook & Instagram Shop</span>
                                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-semibold">Native Commerce</span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                Direct customers to your Facebook / Instagram storefront with product catalogs.
                              </div>
                              <div className="bg-slate-50 border border-slate-200 rounded-md p-2 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-slate-500 font-medium shrink-0">Shop Link:</span>
                                  <input
                                    type="text"
                                    placeholder="https://shop.facebook.com/..."
                                    value={destination.shopUrl || destination.destinationUrl || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (session) {
                                        setSession({
                                          ...session,
                                          draft: {
                                            ...session.draft,
                                            destination: {
                                              ...session.draft.destination,
                                              shopUrl: val,
                                              destinationUrl: val,
                                            },
                                          },
                                        });
                                      }
                                    }}
                                    className="font-mono text-amber-700 font-semibold bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] w-full focus:outline-none focus:border-amber-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : destination.type === "INSTAGRAM_PROFILE" ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                                <UserCheck className="h-3.5 w-3.5 text-pink-600" />
                                <span>Instagram Profile Growth</span>
                                <span className="text-[10px] bg-pink-50 text-pink-700 border border-pink-200 px-1.5 py-0.2 rounded font-semibold">Followers</span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                Send people to your Instagram profile to follow your brand and watch reels.
                              </div>
                              <div className="bg-slate-50 border border-slate-200 rounded-md p-2 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-slate-500 font-medium shrink-0">Profile Link:</span>
                                  <input
                                    type="text"
                                    placeholder="https://instagram.com/yourhandle"
                                    value={destination.instagramProfileUrl || (activePage?.name ? `https://instagram.com/${activePage.name.toLowerCase().replace(/\s+/g, '')}` : "")}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (session) {
                                        setSession({
                                          ...session,
                                          draft: {
                                            ...session.draft,
                                            destination: {
                                              ...session.draft.destination,
                                              instagramProfileUrl: val,
                                            },
                                          },
                                        });
                                      }
                                    }}
                                    className="font-mono text-pink-700 font-semibold bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] w-full focus:outline-none focus:border-pink-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : destination.type === "PAGE_EVENT" ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                                <Calendar className="h-3.5 w-3.5 text-purple-600" />
                                <span>Facebook Page Event</span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                Send people to an official event on your Facebook Page.
                              </div>
                              <div className="text-[11px] font-semibold text-purple-900 bg-purple-50 border border-purple-200 rounded px-2 py-1">
                                📅 {destination.eventName || `${campaign.name || 'Business'} Official Event`}
                              </div>
                            </div>
                          ) : destination.type === "PHONE_CALL" ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Direct Phone Call (Call Now)</span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                People who click your ad will directly call your business phone number:
                              </div>
                              <div className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2 py-1">
                                📞 {destination.whatsappPhoneNumber || (destination as any).phoneNumber ? (destination.whatsappPhoneNumber || (destination as any).phoneNumber).length === 10 ? `+91 ${destination.whatsappPhoneNumber || (destination as any).phoneNumber}` : `+${destination.whatsappPhoneNumber || (destination as any).phoneNumber}` : "+91 [Set via chat]"}
                              </div>
                            </div>
                          ) : destination.type === "MESSENGER" ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                                <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                                <span>Facebook Messenger</span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                Send people into an instant Messenger chat on your Facebook Page.
                              </div>
                            </div>
                          ) : destination.type === "INSTAGRAM_DM" ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                                <MessageCircle className="h-3.5 w-3.5 text-pink-600" />
                                <span>Instagram Direct (DM)</span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                Send people into direct messaging chat on Instagram.
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-slate-900 font-semibold flex items-center gap-1">
                                💬 Click-to-WhatsApp (Pre-filled instant greeting)
                              </span>
                              {destination.whatsappPhoneNumber && (
                                <div className="text-[11px] font-mono text-emerald-700 font-bold">
                                  WhatsApp: +91 {destination.whatsappPhoneNumber}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* WhatsApp Instant Conversations & CRM Bot Auto-Link Badge */}
                      {(!destination.type || destination.type === "WHATSAPP") && (
                        <div className="grid grid-cols-4 px-4 py-2.5 items-start bg-sky-50/60">
                          <span className="text-sky-900 font-semibold">CRM Bot Link</span>
                          <div className="col-span-3 text-xs space-y-1 text-slate-800">
                            <div className="font-bold text-sky-900 flex items-center gap-1.5">
                              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>Auto-Linked to CRM WhatsApp Welcome Bot Flow</span>
                            </div>
                            <div className="text-[11px] text-sky-800">
                              Leads clicking your ad get auto-greeted and qualified instantly on WhatsApp!
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-4 px-4 py-2.5 items-start">
                        <span className="text-slate-500 font-medium pt-0.5">Geo Location</span>
                        <div className="col-span-3 space-y-2.5">
                          {/* Countries display */}
                          {targeting.countries && targeting.countries.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Countries:</span>
                              {targeting.countries.map((c: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 shadow-2xs"
                                >
                                  <Globe className="h-3 w-3 text-emerald-600" />
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Cities with individual radius display */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {Array.isArray(targeting.cityConfigs) && targeting.cityConfigs.length > 0 ? (
                              targeting.cityConfigs.map((cityObj: any, cIdx: number) => (
                                <span
                                  key={cIdx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 text-xs font-semibold border border-blue-200 shadow-2xs"
                                >
                                  <MapPin className="h-3 w-3 text-blue-600 shrink-0" />
                                  <span>{cityObj.name}</span>
                                  <span className="px-1.5 py-0.5 bg-blue-200/80 text-blue-900 text-[10px] font-bold rounded-full">
                                    {cityObj.radiusKm || 30} km
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextConfigs = targeting.cityConfigs.filter((_: any, i: number) => i !== cIdx);
                                      const nextCities = nextConfigs.map((c: any) => c.name);
                                      if (session) {
                                        setSession({
                                          ...session,
                                          draft: {
                                            ...session.draft,
                                            targeting: {
                                              ...session.draft.targeting,
                                              cityConfigs: nextConfigs,
                                              cities: nextCities,
                                              locationDescription:
                                                nextCities.join(", ") ||
                                                (targeting.countries?.join(", ") || "All India"),
                                            },
                                          },
                                        });
                                      }
                                    }}
                                    className="text-blue-400 hover:text-red-600 ml-0.5 cursor-pointer font-bold text-sm leading-none"
                                    title="Remove city"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))
                            ) : targeting.cities && targeting.cities.length > 0 ? (
                              targeting.cities.map((city: string, cIdx: number) => {
                                const cleanCity = city.replace(/^Set\s+/i, "").trim();
                                return (
                                  <span
                                    key={cIdx}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 shadow-2xs"
                                  >
                                    <MapPin className="h-3 w-3 text-blue-600" />
                                    <span>{cleanCity}</span>
                                    <span className="px-1.5 py-0.5 bg-blue-200/70 text-blue-800 text-[10px] font-bold rounded-full">
                                      {targeting.radiusKm || 30} km
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextCities = targeting.cities.filter((_: any, i: number) => i !== cIdx);
                                        if (session) {
                                          setSession({
                                            ...session,
                                            draft: {
                                              ...session.draft,
                                              targeting: {
                                                ...session.draft.targeting,
                                                cities: nextCities,
                                                locationDescription: nextCities.join(", ") || "All India",
                                              },
                                            },
                                          });
                                        }
                                      }}
                                      className="text-blue-400 hover:text-red-600 ml-0.5 cursor-pointer font-bold text-sm leading-none"
                                      title="Remove city"
                                    >
                                      ×
                                    </button>
                                  </span>
                                );
                              })
                            ) : targeting.locationDescription ? (
                              targeting.locationDescription.split(/[,&;\/|]\s*|\s+and\s+/i).map((c: string, idx: number) => {
                                const cleanC = c.replace(/^Set\s+/i, "").trim();
                                if (!cleanC) return null;
                                return (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 shadow-2xs"
                                  >
                                    <MapPin className="h-3 w-3 text-blue-600" />
                                    {cleanC}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-slate-900 font-semibold flex items-center gap-1">
                                <Globe className="h-3.5 w-3.5 text-slate-500" />
                                All India
                              </span>
                            )}
                          </div>

                          {/* Postal Codes display */}
                          {targeting.postalCodes && targeting.postalCodes.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">PIN Codes:</span>
                              {targeting.postalCodes.map((pin: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-200 shadow-2xs"
                                >
                                  <Hash className="h-3 w-3 text-purple-600" />
                                  {pin}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Bulk Location Action Bar & Quick Presets */}
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={openBulkLocationManager}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold rounded-md shadow-2xs cursor-pointer transition-all hover:shadow"
                            >
                              <Sliders className="h-3.5 w-3.5" />
                              <span>Manage Bulk Locations & Radius</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={cityInput}
                                placeholder="Add single city..."
                                onChange={(e) => setCityInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && cityInput.trim()) {
                                    e.preventDefault();
                                    const cur = targeting.cities || [];
                                    const curConfigs = targeting.cityConfigs || [];
                                    const cName = cityInput.trim();
                                    if (!cur.includes(cName)) {
                                      const nextCities = [...cur, cName];
                                      const nextConfigs = [...curConfigs, { name: cName, radiusKm: 30 }];
                                      if (session) {
                                        setSession({
                                          ...session,
                                          draft: {
                                            ...session.draft,
                                            targeting: {
                                              ...session.draft.targeting,
                                              cities: nextCities,
                                              cityConfigs: nextConfigs,
                                              locationDescription: nextCities.join(", "),
                                            },
                                          },
                                        });
                                      }
                                    }
                                    setCityInput("");
                                  }
                                }}
                                className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-800 w-36 focus:outline-none focus:border-blue-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (cityInput.trim()) {
                                    const cur = targeting.cities || [];
                                    const curConfigs = targeting.cityConfigs || [];
                                    const cName = cityInput.trim();
                                    if (!cur.includes(cName)) {
                                      const nextCities = [...cur, cName];
                                      const nextConfigs = [...curConfigs, { name: cName, radiusKm: 30 }];
                                      if (session) {
                                        setSession({
                                          ...session,
                                          draft: {
                                            ...session.draft,
                                            targeting: {
                                              ...session.draft.targeting,
                                              cities: nextCities,
                                              cityConfigs: nextConfigs,
                                              locationDescription: nextCities.join(", "),
                                            },
                                          },
                                        });
                                      }
                                    }
                                    setCityInput("");
                                  }
                                }}
                                className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded border border-blue-200 cursor-pointer"
                              >
                                + Add
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (session) {
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      targeting: {
                                        ...session.draft.targeting,
                                        locationType: "COUNTRY",
                                        countries: ["India"],
                                        cities: [],
                                        cityConfigs: [],
                                        postalCodes: [],
                                        locationDescription: "All India",
                                      },
                                    },
                                  });
                                }
                              }}
                              className="text-[10px] text-slate-500 hover:text-slate-800 underline ml-auto cursor-pointer"
                            >
                              Reset to All India
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 px-4 py-2.5 items-start">
                        <span className="text-slate-500 font-medium pt-1">Demographics</span>
                        <div className="col-span-3 space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            {/* Age Range Selectors */}
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-slate-500 text-[11px] font-medium">Age:</span>
                              <select
                                value={targeting.ageMin || 18}
                                disabled={Boolean(campaign.specialAdCategory && campaign.specialAdCategory !== "NONE")}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (session) {
                                    setSession({
                                      ...session,
                                      draft: {
                                        ...session.draft,
                                        targeting: {
                                          ...session.draft.targeting,
                                          ageMin: val,
                                        },
                                      },
                                    });
                                  }
                                }}
                                className="bg-white border border-slate-200 text-slate-800 text-[11px] font-semibold rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                              >
                                {[18, 21, 25, 30, 35, 40, 45, 50].map((a) => (
                                  <option key={a} value={a}>{a}</option>
                                ))}
                              </select>
                              <span className="text-slate-400 font-bold">to</span>
                              <select
                                value={targeting.ageMax || 65}
                                disabled={Boolean(campaign.specialAdCategory && campaign.specialAdCategory !== "NONE")}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (session) {
                                    setSession({
                                      ...session,
                                      draft: {
                                        ...session.draft,
                                        targeting: {
                                          ...session.draft.targeting,
                                          ageMax: val,
                                        },
                                      },
                                    });
                                  }
                                }}
                                className="bg-white border border-slate-200 text-slate-800 text-[11px] font-semibold rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                              >
                                {[25, 30, 35, 40, 45, 50, 55, 60, 65].map((a) => (
                                  <option key={a} value={a}>{a === 65 ? "65+" : a}</option>
                                ))}
                              </select>
                            </div>

                            {/* Gender Toggle */}
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500 text-[11px] font-medium mr-1">Gender:</span>
                              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-[10px] font-bold">
                                {["ALL", "MEN", "WOMEN"].map((g) => {
                                  const isSelected = (!targeting.gender && g === "ALL") || targeting.gender === g;
                                  const isSpecial = Boolean(campaign.specialAdCategory && campaign.specialAdCategory !== "NONE");
                                  return (
                                    <button
                                      key={g}
                                      type="button"
                                      disabled={isSpecial}
                                      onClick={() => {
                                        if (session) {
                                          setSession({
                                            ...session,
                                            draft: {
                                              ...session.draft,
                                              targeting: {
                                                ...session.draft.targeting,
                                                gender: g,
                                              },
                                            },
                                          });
                                        }
                                      }}
                                      className={`px-2 py-0.5 rounded transition-all ${
                                        isSelected
                                          ? "bg-white text-blue-600 shadow-2xs font-extrabold"
                                          : "text-slate-600 hover:text-slate-900"
                                      } ${isSpecial ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                    >
                                      {g === "ALL" ? "All" : g === "MEN" ? "Men" : "Women"}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {Boolean(campaign.specialAdCategory && campaign.specialAdCategory !== "NONE") && (
                            <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                              🔒 Meta Special Ad Category policy requires non-discriminatory targeting (18–65+ & All Genders).
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Advantage+ Detailed Targeting & Interest Tagging */}
                      <div className="grid grid-cols-4 px-4 py-3 items-start bg-slate-50/50">
                        <span className="text-slate-500 font-medium pt-1">Advantage+ Targeting</span>
                        <div className="col-span-3 space-y-2">
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-900 block">Advantage+ detailed targeting</span>
                              <span className="text-[10px] text-slate-500 block">Include people who match demographics, interests or behaviours</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={targeting.advantagePlusAudience !== false}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  if (session) {
                                    setSession({
                                      ...session,
                                      draft: {
                                        ...session.draft,
                                        targeting: {
                                          ...session.draft.targeting,
                                          advantagePlusAudience: checked,
                                        },
                                      },
                                    });
                                  }
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#1877F2]"></div>
                            </label>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-700">Demographics, Interests & Behaviours</span>
                              <span className="text-[10px] text-[#1877F2] font-bold cursor-pointer hover:underline">Browse Categories</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {targeting.interests?.length ? (
                                targeting.interests.map((tag: string, tIdx: number) => (
                                  <span key={tIdx} className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-900 text-[11px] font-bold border border-sky-200 shadow-2xs flex items-center gap-1">
                                    <span>{tag}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextInterests = targeting.interests.filter((_: any, i: number) => i !== tIdx);
                                        if (session) {
                                          setSession({
                                            ...session,
                                            draft: {
                                              ...session.draft,
                                              targeting: {
                                                ...session.draft.targeting,
                                                interests: nextInterests,
                                              },
                                            },
                                          });
                                        }
                                      }}
                                      className="text-sky-400 hover:text-sky-700 ml-1 cursor-pointer font-bold"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-slate-500 italic">Advantage+ Automated Audience Expansion active</span>
                              )}
                            </div>

                            {/* Quick 1-Click Interest Recommendations */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Suggested:</span>
                              {["📱 Smartphones", "🎧 Electronics", "🛍️ Online Shopping", "👗 Fashion & Style", "💼 Small Business", "🚗 Automobiles"].map((sug, sIdx) => {
                                const isSelected = targeting.interests?.includes(sug);
                                return (
                                  <button
                                    key={sIdx}
                                    type="button"
                                    onClick={() => {
                                      const cur = targeting.interests || [];
                                      const next = isSelected ? cur.filter((x: string) => x !== sug) : [...cur, sug];
                                      if (session) {
                                        setSession({
                                          ...session,
                                          draft: {
                                            ...session.draft,
                                            targeting: {
                                              ...session.draft.targeting,
                                              interests: next,
                                            },
                                          },
                                        });
                                      }
                                    }}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all border ${
                                      isSelected
                                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                                    }`}
                                  >
                                    {isSelected ? `✓ ${sug}` : `+ ${sug}`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 px-4 py-2.5 items-start">
                        <span className="text-slate-500 font-medium pt-1">Placements</span>
                        <div className="col-span-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-900 font-bold text-xs">
                              Advantage+ Placements (Recommended)
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              AI Auto-Optimized
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {["Facebook Feeds", "Instagram Feeds", "Reels & Stories", "Instagram Explore", "Search Results", "Messenger"].map((p, pIdx) => (
                              <span key={pIdx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                ✓ {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 px-4 py-2.5 items-start">
                        <span className="text-slate-500 font-medium">Languages</span>
                        <span className="col-span-3 text-slate-900 font-semibold flex items-center gap-1.5 flex-wrap">
                          <span>{targeting.languages?.join(", ") || "All Languages (Auto-Adapted)"}</span>
                          {targeting.locales && targeting.locales.length > 0 && (
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                              Meta AdLocale #{targeting.locales.join(", #")}
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 px-4 py-2.5 items-center">
                        <span className="text-slate-500 font-medium">Pixel Tracking</span>
                        <div className="col-span-3 flex items-center gap-2">
                          {context.pixels && context.pixels.length > 0 ? (
                            <select
                              value={draft.pixelId || context?.pixelId || context?.pixels?.[0]?.id || ""}
                              onChange={(e) => {
                                const newPixId = e.target.value;
                                if (session) {
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      pixelId: newPixId,
                                    },
                                  });
                                }
                              }}
                              className="bg-white border border-slate-200 text-slate-800 text-[11px] font-semibold rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                            >
                              {context.pixels.map((pix: any) => (
                                <option key={pix.id} value={pix.id}>
                                  {pix.name} (ID: {pix.id})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-900 font-semibold">
                              {draft.pixelId || context?.pixelId ? `Meta Dataset Pixel (ID: ${draft.pixelId || context?.pixelId})` : "Standard Meta Conversion Dataset"} · Auto UTM Parameters
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Confirmation & Publish Action Card */}
                  <div className="pt-2">
                    <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div className="px-4 py-3 bg-slate-50/80 font-bold text-[13px] text-slate-900 border-b border-slate-200/80 flex items-center justify-between">
                        <span>
                          {session?.status === "COMPLETED" || session?.executionResult?.deploymentStatus === "FULL_SUCCESS"
                            ? "🎉 Campaign Deployed & Live on Meta Ads"
                            : "Deploy End-to-End to Meta Ads Manager?"}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          session?.status === "COMPLETED" || session?.executionResult?.deploymentStatus === "FULL_SUCCESS"
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : "text-blue-700 bg-blue-50 border-blue-200"
                        }`}>
                          {session?.status === "COMPLETED" || session?.executionResult?.deploymentStatus === "FULL_SUCCESS" ? "Status: ACTIVE / PAUSED" : "Meta Graph API v26.0"}
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {session?.status === "COMPLETED" || session?.executionResult?.deploymentStatus === "FULL_SUCCESS" ? (
                          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs font-bold text-emerald-900">Live Campaign ID: {session?.executionResult?.campaign?.id || "Deployed"}</span>
                              </div>
                              <span className="text-[11px] font-semibold text-emerald-800 bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Ready in Ads Manager
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${draft.adAccountId || activeAdAccount?.adAccountId || "1454270479625110"}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Megaphone className="h-3.5 w-3.5" />
                                <span>Open in Meta Ads Manager ↗</span>
                              </a>
                              <button
                                type="button"
                                onClick={handleResetSession}
                                className="group px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all border border-slate-200 flex items-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                              >
                                <RotateCcw className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform duration-500 ease-out group-hover:-rotate-180" />
                                <span>New Campaign Chat</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={handleConfirmPublish}
                              disabled={isPublishing}
                              className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-emerald-50/60 transition-colors cursor-pointer group disabled:opacity-50"
                            >
                              <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[12px] font-bold group-hover:scale-105 transition-transform shadow-xs shrink-0">
                                🚀
                              </div>
                              <div>
                                <span className="text-[13px] font-bold text-emerald-900 block">
                                  {isPublishing ? "Deploying Campaign, Ad Set, Creative & Ad to Meta..." : "Confirm & Launch Live Campaign to Meta Ads"}
                                </span>
                                <span className="text-[11px] text-emerald-700">
                                  Creates Campaign, Ad Set with targeting, Ad Creative, and live Ad Object on Meta.
                                </span>
                              </div>
                            </button>

                            <button
                              onClick={() => handleSendMessage("Please modify the headline and make the primary copy more aggressive with a 20% discount offer")}
                              disabled={isPublishing}
                              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer group disabled:opacity-50"
                            >
                              <div className="h-6 w-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold group-hover:scale-105 transition-transform shrink-0">
                                ✏️
                              </div>
                              <span className="text-xs font-semibold text-slate-700">
                                Tweak ad copy, budget, or target location
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sending Loader Indicator */}
              {(isSending || isPublishing) && (
                <div className="flex items-center gap-2 text-xs text-slate-600 py-2 pl-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0284C7]" />
                  <span>
                    {isPublishing
                      ? "Publishing Campaign, Ad Set, Creative, and Ad to Meta Graph API..."
                      : "JISNU AI is analyzing audience benchmarks and crafting ad copy..."}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* ── HIDDEN FILE INPUT FOR "ADD FILE" ── */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* ── SELECT AD CREATIVE LIBRARY MODAL ── */}
      {showAdLibraryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Meta Creative Library</h3>
                <p className="text-xs text-gray-500">Select an existing ad creative to attach to your campaign.</p>
              </div>
              <button
                onClick={() => setShowAdLibraryModal(false)}
                className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {loadingMedia ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[#1877F2] mb-2" />
                  <p className="text-xs text-gray-500">Loading your Meta Ad library...</p>
                </div>
              ) : mediaLibrary.images?.length === 0 && mediaLibrary.videos?.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-gray-500 mb-3">No existing creatives found in your Meta Ad Account.</p>
                  <button
                    onClick={() => {
                      setShowAdLibraryModal(false);
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-[#1877F2] text-white rounded-lg text-xs font-semibold hover:bg-[#166FE5] cursor-pointer flex items-center gap-1.5 mx-auto"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload New File From Device</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {mediaLibrary.images?.map((img: any, idx: number) => (
                    <div
                      key={img.hash || idx}
                      onClick={() => handleSelectMediaFromLibrary(img, "IMAGE")}
                      className="group relative border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#1877F2] hover:shadow-md transition-all"
                    >
                      <img
                        src={img.url || img.permalink_url}
                        alt={img.name || "Ad Image"}
                        className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="p-1.5 bg-white text-[11px] truncate font-medium text-gray-700">
                        {img.name || `Image #${idx + 1}`}
                      </div>
                    </div>
                  ))}

                  {mediaLibrary.videos?.map((vid: any, idx: number) => (
                    <div
                      key={vid.id || idx}
                      onClick={() => handleSelectMediaFromLibrary(vid, "VIDEO")}
                      className="group relative border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#1877F2] hover:shadow-md transition-all"
                    >
                      {vid.picture ? (
                        <img
                          src={vid.picture}
                          alt={vid.name || "Ad Video"}
                          className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-28 bg-gray-900 flex items-center justify-center text-white text-xs">
                          🎬 Video
                        </div>
                      )}
                      <div className="p-1.5 bg-white text-[11px] truncate font-medium text-gray-700">
                        {vid.name || `Video #${idx + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BULK LOCATION & RADIUS MANAGER MODAL ── */}
      {showBulkLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Map className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Bulk Location & Radius Manager</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Meta Ads ODAX
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add countries, cities with individual dynamic radius (15–80 km), and postal PIN codes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkLocationModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 pt-2 gap-2">
              <button
                type="button"
                onClick={() => setBulkActiveTab("cities")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  bulkActiveTab === "cities"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Cities & Individual Radius</span>
                <span className="ml-1 px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] rounded-full font-bold">
                  {bulkCities.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBulkActiveTab("countries")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  bulkActiveTab === "countries"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Countries</span>
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-700 text-[10px] rounded-full font-bold">
                  {bulkCountries.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBulkActiveTab("pincodes")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  bulkActiveTab === "pincodes"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Hash className="h-3.5 w-3.5" />
                <span>Postal / PIN Codes</span>
                <span className="ml-1 px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[10px] rounded-full font-bold">
                  {bulkPincodes.length}
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* TAB 1: CITIES & RADIUS */}
              {bulkActiveTab === "cities" && (
                <div className="space-y-4">
                  {/* Bulk Input Box */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Quick Add Cities (supports commas, newlines, and custom radius):
                    </label>
                    <textarea
                      rows={2}
                      value={bulkCityText}
                      onChange={(e) => setBulkCityText(e.target.value)}
                      placeholder="e.g. Mumbai (40km), Pune (25km), Bangalore (30km), Delhi (50km)"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-slate-800"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-medium">Presets:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const metros = [
                              { name: "Mumbai", radiusKm: 40 },
                              { name: "Delhi", radiusKm: 40 },
                              { name: "Bangalore", radiusKm: 35 },
                              { name: "Hyderabad", radiusKm: 30 },
                              { name: "Pune", radiusKm: 25 },
                              { name: "Chennai", radiusKm: 30 },
                            ];
                            const existing = new Set(bulkCities.map((c) => c.name.toLowerCase()));
                            const merged = [...bulkCities];
                            for (const m of metros) {
                              if (!existing.has(m.name.toLowerCase())) {
                                merged.push(m);
                              }
                            }
                            setBulkCities(merged);
                          }}
                          className="px-2 py-0.5 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 rounded text-[11px] font-medium text-slate-600 cursor-pointer shadow-2xs"
                        >
                          + Top Metros
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const tier2 = [
                              { name: "Ahmedabad", radiusKm: 30 },
                              { name: "Jaipur", radiusKm: 25 },
                              { name: "Surat", radiusKm: 25 },
                              { name: "Indore", radiusKm: 25 },
                              { name: "Lucknow", radiusKm: 30 },
                            ];
                            const existing = new Set(bulkCities.map((c) => c.name.toLowerCase()));
                            const merged = [...bulkCities];
                            for (const t of tier2) {
                              if (!existing.has(t.name.toLowerCase())) {
                                merged.push(t);
                              }
                            }
                            setBulkCities(merged);
                          }}
                          className="px-2 py-0.5 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 rounded text-[11px] font-medium text-slate-600 cursor-pointer shadow-2xs"
                        >
                          + Tier-2 Hubs
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddBulkCitiesFromText}
                        disabled={!bulkCityText.trim()}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer transition-all"
                      >
                        + Add to List
                      </button>
                    </div>
                  </div>

                  {/* Bulk Radius Uniform Adjuster */}
                  {bulkCities.length > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg text-xs">
                      <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                        <Sliders className="h-3.5 w-3.5 text-blue-600" />
                        Apply same radius to all {bulkCities.length} cities:
                      </span>
                      <div className="flex items-center gap-1">
                        {[20, 30, 40, 50, 80].map((rVal) => (
                          <button
                            key={rVal}
                            type="button"
                            onClick={() => {
                              setBulkCities(bulkCities.map((c) => ({ ...c, radiusKm: rVal })));
                            }}
                            className="px-2 py-0.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 rounded text-[11px] font-bold text-blue-700 transition-colors cursor-pointer"
                          >
                            {rVal} km
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* List of Configured Cities with Individual Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                      <span>Configured Cities ({bulkCities.length})</span>
                      {bulkCities.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setBulkCities([])}
                          className="text-red-500 hover:underline text-[11px] cursor-pointer"
                        >
                          Clear All Cities
                        </button>
                      )}
                    </div>

                    {bulkCities.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <Compass className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-500">No specific cities added yet.</p>
                        <p className="text-[11px] text-slate-400">Add cities above or leave blank to target whole countries.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {bulkCities.map((city, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-blue-300 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                                {idx + 1}
                              </div>
                              <span className="text-xs font-bold text-slate-900">{city.name}</span>
                            </div>

                            <div className="flex items-center gap-3 flex-1 sm:max-w-xs">
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="range"
                                  min={15}
                                  max={80}
                                  step={1}
                                  value={city.radiusKm}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setBulkCities(
                                      bulkCities.map((c, i) => (i === idx ? { ...c, radiusKm: val } : c))
                                    );
                                  }}
                                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <span className="inline-block w-14 text-center px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded font-mono">
                                  {city.radiusKm} km
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                {[20, 40].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => {
                                      setBulkCities(
                                        bulkCities.map((c, i) =>
                                          i === idx ? { ...c, radiusKm: preset } : c
                                        )
                                      );
                                    }}
                                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${
                                      city.radiusKm === preset
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                    }`}
                                  >
                                    {preset}k
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBulkCities(bulkCities.filter((_, i) => i !== idx));
                                  }}
                                  className="w-6 h-6 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center cursor-pointer transition-colors ml-1"
                                  title="Remove city"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: COUNTRIES */}
              {bulkActiveTab === "countries" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Targeted Countries:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bulkCountryText}
                        onChange={(e) => setBulkCountryText(e.target.value)}
                        placeholder="Enter country name (e.g. India, UAE, United States)..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && bulkCountryText.trim()) {
                            e.preventDefault();
                            handleAddBulkCountry(bulkCountryText);
                            setBulkCountryText("");
                          }
                        }}
                        className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (bulkCountryText.trim()) {
                            handleAddBulkCountry(bulkCountryText);
                            setBulkCountryText("");
                          }
                        }}
                        disabled={!bulkCountryText.trim()}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        + Add Country
                      </button>
                    </div>

                    <div className="pt-2">
                      <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                        Quick Add Popular Markets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "India",
                          "United States",
                          "United Arab Emirates",
                          "United Kingdom",
                          "Canada",
                          "Australia",
                          "Singapore",
                          "Saudi Arabia",
                          "Germany",
                        ].map((cName) => {
                          const isAdded = bulkCountries.some(
                            (c) => c.toLowerCase() === cName.toLowerCase()
                          );
                          return (
                            <button
                              key={cName}
                              type="button"
                              onClick={() => {
                                if (isAdded) {
                                  setBulkCountries(
                                    bulkCountries.filter(
                                      (c) => c.toLowerCase() !== cName.toLowerCase()
                                    )
                                  );
                                } else {
                                  handleAddBulkCountry(cName);
                                }
                              }}
                              className={`px-2 py-1 rounded-md text-xs font-medium border cursor-pointer transition-all ${
                                isAdded
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                              }`}
                            >
                              {isAdded ? "✓ " : "+ "}
                              {cName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                      <span>Selected Countries ({bulkCountries.length})</span>
                      {bulkCountries.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setBulkCountries([])}
                          className="text-red-500 hover:underline text-[11px] cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[60px] items-center">
                      {bulkCountries.length === 0 ? (
                        <p className="text-xs text-slate-400">No countries selected yet.</p>
                      ) : (
                        bulkCountries.map((c, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800"
                          >
                            <Globe className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{c}</span>
                            <button
                              type="button"
                              onClick={() => setBulkCountries(bulkCountries.filter((_, i) => i !== idx))}
                              className="text-emerald-400 hover:text-red-600 cursor-pointer ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: POSTAL / PIN CODES */}
              {bulkActiveTab === "pincodes" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Bulk Paste PIN / Postal Codes:
                    </label>
                    <textarea
                      rows={3}
                      value={bulkPincodeText}
                      onChange={(e) => setBulkPincodeText(e.target.value)}
                      placeholder="Paste postal codes separated by comma, space, or newline (e.g. 400001, 400050, 411001, 110001, 560001)..."
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-slate-800"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-500">
                        Extracts 5-6 digit PIN / postal codes automatically.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddBulkPincodesFromText}
                        disabled={!bulkPincodeText.trim()}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm"
                      >
                        + Add PIN Codes
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                      <span>Added Postal Codes ({bulkPincodes.length})</span>
                      {bulkPincodes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setBulkPincodes([])}
                          className="text-red-500 hover:underline text-[11px] cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 p-3 bg-white border border-slate-200 rounded-xl min-h-[60px] max-h-48 overflow-y-auto items-center">
                      {bulkPincodes.length === 0 ? (
                        <p className="text-xs text-slate-400">No postal codes added yet.</p>
                      ) : (
                        bulkPincodes.map((pin, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 border border-purple-200 rounded-md text-xs font-semibold text-purple-800 font-mono"
                          >
                            <Hash className="h-3 w-3 text-purple-600" />
                            <span>{pin}</span>
                            <button
                              type="button"
                              onClick={() => setBulkPincodes(bulkPincodes.filter((_, i) => i !== idx))}
                              className="text-purple-400 hover:text-red-600 cursor-pointer ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{bulkCities.length}</span> cities ·{" "}
                <span className="font-semibold text-slate-800">{bulkCountries.length}</span> countries ·{" "}
                <span className="font-semibold text-slate-800">{bulkPincodes.length}</span> PIN codes
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkLocationModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkLocations}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all"
                >
                  Save & Apply Targeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM CHATGPT COMPOSER ── */}
      <div className="relative p-4 pb-4 bg-[#F9FAFB] shrink-0 z-10">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Attached File Indicator Pill */}
          {attachedFile && (
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-800 shadow-2xs animate-fadeIn">
              <span>{attachedFile.type === "IMAGE" ? "🖼️" : "🎬"}</span>
              <span className="font-semibold max-w-[200px] truncate">{attachedFile.name}</span>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="hover:text-red-500 font-bold ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div className="border border-slate-200/90 hover:border-slate-300 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 rounded-3xl p-3 bg-white shadow-sm transition-all">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isRecording
                  ? "🎙️ Listening via Windows Speech Listener... speak now (words appear here in real-time)"
                  : "Ask anything or describe your offer (e.g. 'Dental clinic in Baner, ₹500/day' or 'पुण्यात साडी सेल')..."
              }
              disabled={isSending || isPublishing}
              className="w-full text-[13.5px] text-slate-900 placeholder:text-slate-400 outline-none resize-none px-2 py-1 bg-transparent"
            />

            <div className="flex items-center justify-between pt-2 px-1 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60 shadow-2xs hover:border-slate-300"
                >
                  <Paperclip className="h-3.5 w-3.5 text-slate-500" />
                  <span>Add file</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdLibraryModal(true);
                    fetchMediaLibrary();
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60 shadow-2xs hover:border-slate-300"
                >
                  <Plus className="h-3.5 w-3.5 text-slate-500" />
                  <span>Select ad</span>
                </button>
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border shadow-2xs ${
                    isRecording
                      ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200/60 hover:border-slate-300"
                  }`}
                  title={isRecording ? "Listening via Windows Speech Listener... Click to stop" : "Speak using Windows Speech Listener"}
                >
                  {isRecording ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping"></span>
                      <span className="font-semibold text-rose-700">Listening... (Click to stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 text-slate-500" />
                      <span>Voice note</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isSending || isPublishing || (!inputText.trim() && !attachedFile)}
                className="h-8 w-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-xs transition-all disabled:opacity-30 cursor-pointer active:scale-95"
              >
                <span className="text-sm font-bold">↑</span>
              </button>
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="text-[11px] text-slate-400">JISNU AI can make suggestions. Verify targeting, budget, and creatives before launching.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
