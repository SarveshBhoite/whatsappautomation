"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  MessageSquare, 
  GitMerge, 
  Settings, 
  Send, 
  Bot, 
  User, 
  Phone, 
  Check, 
  CheckCheck, 
  Paperclip, 
  Smile, 
  Plus, 
  Save, 
  Key, 
  FileText, 
  Image as ImageIcon,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Database,
  CornerUpLeft,
  Video,
  Headphones,
  ArrowLeft,
  Star,
  RefreshCw,
  Store,
  Code,
  Search,
  ShieldCheck,
  Terminal,
  Activity,
  Mail,
  Copy,
  Download,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  Handle,
  Position
} from "reactflow";
import "reactflow/dist/style.css";

// Native SVG representation of Instagram icon for backward compatibility with older lucide-react versions
const Instagram = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// Native SVG representation of WhatsApp icon for a premium custom look
const WhatsApp = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.46 3.473 1.332 4.977l-1.417 5.176 5.3-.1389a9.92 9.92 0 0 0 4.773 1.218h.004c5.504 0 9.988-4.484 9.988-9.99A9.957 9.957 0 0 0 12.012 2zm5.727 14.17c-.25.7-1.442 1.272-1.992 1.353-.48.072-.942.348-3.048-.52-2.532-1.045-4.14-3.626-4.266-3.794-.124-.168-.948-1.258-.948-2.398 0-1.14.595-1.704.82-1.93.226-.226.495-.282.66-.282.164 0 .328.003.472.01.148.007.348-.056.545.422.2.488.683 1.662.743 1.78.06.12.098.26.018.42-.08.16-.118.26-.237.4-.118.14-.253.31-.36.42-.12.12-.244.25-.104.49.14.24.62 1.022 1.33 1.652.915.816 1.685 1.07 1.925 1.19.24.12.378.1.517-.06.14-.16.596-.694.755-.93.16-.236.32-.2.538-.12.217.08 1.378.65 1.616.77.238.12.396.18.455.28.06.1.06.58-.19 1.28z"/>
  </svg>
);

// -------------------------------------------------------------
// WhatsApp Styled Flow Builder Custom Nodes
// -------------------------------------------------------------

const TextNodeComponent = ({ data }: any) => {
  const isIg = data.platform === "instagram";
  const textColor = isIg ? "text-pink-400" : "text-emerald-400";
  const handleBg = isIg ? "!bg-pink-500" : "!bg-emerald-500";

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[200px] text-xs animate-fadeIn">
      <Handle type="target" position={Position.Top} className={`${handleBg} !w-2.5 !h-2.5`} />
      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
        {isIg ? (
          <Instagram className={`h-3 w-3 ${textColor}`} />
        ) : (
          <WhatsApp className={`h-3 w-3 ${textColor}`} />
        )}
        {isIg ? "Instagram Text DM" : "WhatsApp Text Msg"}
      </div>
      <div className="text-slate-200 line-clamp-3 bg-slate-900/40 p-2 rounded border border-slate-850/60 leading-relaxed font-sans whitespace-pre-wrap">
        {data.text || <span className="text-slate-500 italic">No text message defined</span>}
      </div>
      <Handle type="source" position={Position.Bottom} className={`${handleBg} !w-2.5 !h-2.5`} />
    </div>
  );
};

const ButtonsNodeComponent = ({ data }: any) => {
  const isIg = data.platform === "instagram";
  const textColor = isIg ? "text-pink-400" : "text-emerald-400";
  const handleBg = isIg ? "!bg-pink-500" : "!bg-emerald-500";
  const handleBgLight = isIg ? "!bg-pink-400" : "!bg-emerald-400";
  const borderL = isIg ? "border-l-pink-500" : "border-l-emerald-500";

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[220px] text-xs flex flex-col gap-2 animate-fadeIn">
      <Handle type="target" position={Position.Top} className={`${handleBg} !w-2.5 !h-2.5`} />
      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
        {isIg ? (
          <Instagram className={`h-3 w-3 ${textColor}`} />
        ) : (
          <Bot className={`h-3 w-3 ${textColor}`} />
        )}
        {isIg ? "Instagram Quick Replies" : "WhatsApp Buttons"}
      </div>
      <div className="text-slate-300 font-medium bg-slate-900/40 p-2 rounded border border-slate-850/60 whitespace-pre-wrap">
        {data.text || <span className="text-slate-500 italic">Type button header message...</span>}
      </div>
      
      <div className="flex flex-col gap-1.5 mt-1">
        {data.buttons?.map((btn: any) => (
          <div key={btn.id} className={`relative bg-slate-900 border border-slate-800/80 rounded py-1.5 px-3 text-center text-[10px] ${textColor} font-semibold shadow-sm border-l-2 ${borderL}`}>
            {btn.title}
            <Handle 
              type="source" 
              position={Position.Right} 
              id={btn.id} 
              className={`${handleBgLight} !w-2 !h-2 -mr-1`} 
            />
          </div>
        ))}
        {(!data.buttons || data.buttons.length === 0) && (
          <span className="text-[9px] text-slate-500 italic text-center">Add options buttons on the right</span>
        )}
      </div>
    </div>
  );
};

const ListNodeComponent = ({ data }: any) => {
  const isIg = data.platform === "instagram";
  const textColor = isIg ? "text-pink-400" : "text-emerald-400";
  const handleBg = isIg ? "!bg-pink-500" : "!bg-emerald-500";
  const handleBgLight = isIg ? "!bg-pink-400" : "!bg-emerald-400";
  const borderL = isIg ? "border-l-pink-500" : "border-l-emerald-500";

  // Flat array of all rows across all sections
  const sections = data.listSections || [];
  const rows = sections.flatMap((sec: any) => sec.rows || []) || [];

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[220px] text-xs flex flex-col gap-2 animate-fadeIn">
      <Handle type="target" position={Position.Top} className={`${handleBg} !w-2.5 !h-2.5`} />
      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
        <FileText className={`h-3 w-3 ${textColor}`} />
        {isIg ? "Instagram Menu (Quick Replies)" : "WhatsApp List Menu"}
      </div>
      <div className="text-slate-300 font-medium bg-slate-900/40 p-2 rounded border border-slate-850/60 leading-relaxed font-sans whitespace-pre-wrap">
        {data.text || <span className="text-slate-500 italic">No description text</span>}
      </div>
      <div className="bg-slate-950 border border-slate-850 rounded py-1 px-3 text-center text-[10px] text-slate-400 font-semibold mb-1">
        Button: {data.listButtonText || "View Menu"}
      </div>

      <div className="flex flex-col gap-1.5 mt-1">
        {rows.map((row: any) => (
          <div key={row.id} className={`relative bg-slate-900 border border-slate-800/80 rounded py-1.5 px-3 text-left text-[10px] text-slate-200 font-semibold shadow-sm border-l-2 ${borderL}`}>
            <div className="truncate font-medium">{row.title}</div>
            {row.description && <div className="text-[8px] text-slate-500 font-normal truncate mt-0.5">{row.description}</div>}
            <Handle 
              type="source" 
              position={Position.Right} 
              id={row.id} 
              className={`${handleBgLight} !w-2 !h-2 -mr-1`} 
            />
          </div>
        ))}
        {rows.length === 0 && (
          <span className="text-[9px] text-slate-500 italic text-center">Add menu options on the right</span>
        )}
      </div>
    </div>
  );
};

const QuestionNodeComponent = ({ data }: any) => {
  const isIg = data.platform === "instagram";
  const textColor = isIg ? "text-pink-400" : "text-emerald-400";
  const handleBg = isIg ? "!bg-pink-500" : "!bg-emerald-500";

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[200px] text-xs animate-fadeIn">
      <Handle type="target" position={Position.Top} className={`${handleBg} !w-2.5 !h-2.5`} />
      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
        {isIg ? (
          <Instagram className={`h-3 w-3 ${textColor}`} />
        ) : (
          <User className={`h-3 w-3 ${textColor}`} />
        )}
        Collect Input Question
      </div>
      <div className="text-slate-200 line-clamp-2 bg-slate-900/40 p-2 rounded border border-slate-850/60 leading-relaxed font-sans mb-2">
        {data.text || <span className="text-slate-500 italic">No question defined</span>}
      </div>
      <div className="bg-amber-500/10 rounded px-2 py-1 border border-amber-500/20 text-[9px] text-amber-400 font-mono flex items-center gap-1 justify-center">
        <Database className="h-3 w-3 text-amber-500" /> Save: {data.variableName || "user_input"}
      </div>
      <Handle type="source" position={Position.Bottom} className={`${handleBg} !w-2.5 !h-2.5`} />
    </div>
  );
};

const WelcomeNodeComponent = ({ data }: any) => {
  const isIg = data.platform === "instagram";
  const textColor = isIg ? "text-pink-400" : "text-emerald-400";
  const border = isIg ? "border-pink-500" : "border-emerald-500";
  const handleBg = isIg ? "!bg-pink-500" : "!bg-emerald-500";

  return (
    <div className={`bg-slate-800 border-2 ${border} rounded-xl p-3 shadow-lg min-w-[200px] text-xs animate-fadeIn`}>
      <div className={`text-[9px] ${textColor} font-bold uppercase tracking-wider mb-1 flex items-center gap-1`}>
        {isIg ? (
          <Instagram className="h-3.5 w-3.5" />
        ) : (
          <Bot className="h-3.5 w-3.5" />
        )}
        {isIg ? "Instagram Welcome Node (Root)" : "Welcome Node (Root)"}
      </div>
      <div className="text-slate-200 line-clamp-2 bg-slate-900/40 p-2 rounded border border-slate-850/60 leading-relaxed font-sans">
        {data.text || <span className="text-slate-500 italic">No welcome greeting defined</span>}
      </div>
      <Handle type="source" position={Position.Bottom} className={`${handleBg} !w-2.5 !h-2.5`} />
    </div>
  );
};

const MediaNodeComponent = ({ data }: any) => {
  const isIg = data.platform === "instagram";
  const textColor = isIg ? "text-pink-400" : "text-emerald-400";
  const handleBg = isIg ? "!bg-pink-500" : "!bg-emerald-500";
  const isVideo = data.mediaType === "video";
  const isAudio = data.mediaType === "audio";
  const isDoc = data.mediaType === "document";

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[200px] text-xs animate-fadeIn">
      <Handle type="target" position={Position.Top} className={`${handleBg} !w-2.5 !h-2.5`} />
      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
        {isDoc ? <FileText className={`h-3 w-3 ${textColor}`} /> :
         isVideo ? <Video className={`h-3 w-3 ${textColor}`} /> :
         isAudio ? <Headphones className={`h-3 w-3 ${textColor}`} /> :
         <ImageIcon className={`h-3 w-3 ${textColor}`} />}
        Media response ({data.mediaType || "image"})
      </div>
      <div className="text-[10px] text-slate-300 font-semibold truncate bg-slate-900/40 p-1.5 rounded border border-slate-850/60 font-mono mb-1.5 max-w-[180px]">
        {data.mediaUrl ? (data.mediaUrl.startsWith("/uploads/") ? data.mediaUrl.substring(9) : data.mediaUrl) : <span className="text-slate-500 italic">No URL/file configured</span>}
      </div>
      {data.caption && (
        <div className="text-slate-400 text-[10px] italic line-clamp-2 bg-slate-900/20 p-1.5 rounded border border-slate-850/30 whitespace-pre-wrap leading-tight">
          "{data.caption}"
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className={`${handleBg} !w-2.5 !h-2.5`} />
    </div>
  );
};



// Configure backend base URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("organization_id") || "";
  }
  return "";
};

// TS Interfaces
interface Message {
  id: string;
  conversationId: string;
  direction: "inbound" | "outbound";
  messageType: string;
  content: string;
  mediaMimeType?: string;
  waMessageId?: string;
  status: "sent" | "delivered" | "read" | "failed";
  senderName?: string;
  createdAt: string;
  quotedMessageId?: string | null;
  quotedMessage?: Message | null;
}

interface Conversation {
  id: string;
  customerPhone: string;
  customerName?: string;
  currentNodeId?: string;
  isBotPaused: boolean;
  botPausedUntil?: string;
  messages?: Message[];
  platform?: string;
  updatedAt: string;
}

interface WhatsAppConfig {
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  webhookVerifyToken: string;
}

interface InstagramConfig {
  instagramAccountId: string;
  pageId: string;
  pageAccessToken: string;
  username?: string;
  name?: string;
  profilePic?: string;
}

interface YouTubeConfig {
  channelId: string;
  channelTitle?: string;
  accessToken: string;
  refreshToken: string;
}

export default function Dashboard() {
  const nodeTypes = useMemo(
    () => ({
      welcomeNode: WelcomeNodeComponent,
      textNode: TextNodeComponent,
      buttonsNode: ButtonsNodeComponent,
      listNode: ListNodeComponent,
      questionNode: QuestionNodeComponent,
      mediaNode: MediaNodeComponent,
    }),
    []
  );

  const [activeTab, setActiveTab] = useState<"chats_whatsapp" | "chats_instagram" | "flows" | "settings">("settings");
  // Mobile: track whether user has opened a conversation (to show chat view vs list on small screens)
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // Real-time Chat States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // YouTube Config state
  const [ytConfig, setYtConfig] = useState<YouTubeConfig>({
    channelId: "",
    channelTitle: "",
    accessToken: "",
    refreshToken: ""
  });
  const [ytSaveStatus, setYtSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [ytOauthStatus, setYtOauthStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");

  // Instagram Config
  const [igConfig, setIgConfig] = useState<InstagramConfig>({
    instagramAccountId: "",
    pageId: "",
    pageAccessToken: ""
  });
  const [igSaveStatus, setIgSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [selectedPlatform, setSelectedPlatform] = useState<"whatsapp" | "instagram" | "youtube">("whatsapp");
  const [settingsSubTab, setSettingsSubTab] = useState<"whatsapp" | "instagram" | "google" | "youtube" | "api-keys">("whatsapp");

  // Multi-Account Lists State
  const [waAccounts, setWaAccounts] = useState<any[]>([]);
  const [igAccounts, setIgAccounts] = useState<any[]>([]);
  const [gmailAccounts, setGmailAccounts] = useState<any[]>([]);

  // Google GMB Config
  const [googleConfig, setGoogleConfig] = useState({
    locationName: "",
    googlePlaceId: "",
    googleReviewUrl: "",
    googleLocationId: "",
    googleClientId: "",
    googleClientSecret: "",
    googleRefreshToken: "",
    googleAdsCustomerId: "",
    autoReplyEnabled: false,
    autoReplyMinRating: 4,
    autoReplyTemplate: "",
  });
  const [googleSaveStatus, setGoogleSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [googleOauthStatus, setGoogleOauthStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");
  const [formGoogleAccountId, setFormGoogleAccountId] = useState("");
  const [formGoogleLocationId, setFormGoogleLocationId] = useState("");
  const [formGoogleAdsCustomerId, setFormGoogleAdsCustomerId] = useState("");

  // YouTube Multi-Account State
  const [youtubeAccounts, setYoutubeAccounts] = useState<any[]>([]);
  const [selectedYoutubeAccountId, setSelectedYoutubeAccountId] = useState<string>("");

  // API Keys Management State
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loadingApiKeys, setLoadingApiKeys] = useState(false);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyDesc, setNewKeyDesc] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState<"LIVE" | "TEST">("LIVE");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["whatsapp_send", "whatsapp_templates", "whatsapp_read"]);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);
  const [createdKeyWarning, setCreatedKeyWarning] = useState<string | null>(null);
  const [showRawKeyModal, setShowRawKeyModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [envFilter, setEnvFilter] = useState<"ALL" | "LIVE" | "TEST">("ALL");

  // Developer Portal Tabs & Interactive Documentation State
  const [devPortalTab, setDevPortalTab] = useState<"keys" | "quickstart" | "docs" | "logs">("keys");
  const [docLanguage, setDocLanguage] = useState<"curl" | "node" | "php" | "python">("curl");
  const [activeDocEndpoint, setActiveDocEndpoint] = useState<"auth_test" | "whatsapp_template" | "whatsapp_message" | "instagram_dm" | "contacts" | "campaigns">("auth_test");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Test API Key Health State
  const [testApiKeyInput, setTestApiKeyInput] = useState("");
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Telemetry Audit Logs State
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "chats_whatsapp" || tab === "chats_instagram" || tab === "flows" || tab === "settings") {
        setActiveTab(tab as any);
      } else if (tab === "instagram" || tab === "whatsapp" || tab === "google" || tab === "youtube" || tab === "api-keys") {
        setActiveTab("settings");
        setSettingsSubTab(tab as any);
      }

      const oauth = params.get("oauth");
      const platform = params.get("platform");
      if (oauth === "success") {
        if (platform === "youtube") {
          setSettingsSubTab("youtube");
          setYtOauthStatus("success");
          fetchYoutubeConfig();
          setTimeout(() => setYtOauthStatus("idle"), 3000);
        } else {
          setSettingsSubTab("google");
          setGoogleOauthStatus("success");
          fetchGoogleConfig();
          fetchGmailAccounts();
          setTimeout(() => setGoogleOauthStatus("idle"), 3000);
        }
        window.history.replaceState({}, document.title, window.location.pathname + "?tab=settings");
      } else if (oauth === "error") {
        if (platform === "youtube") {
          setSettingsSubTab("youtube");
          setYtOauthStatus("error");
          setTimeout(() => setYtOauthStatus("idle"), 3000);
        } else {
          setSettingsSubTab("google");
          setGoogleOauthStatus("error");
          setTimeout(() => setGoogleOauthStatus("idle"), 3000);
        }
        window.history.replaceState({}, document.title, window.location.pathname + "?tab=settings");
      }
    }
  }, []);

  // Automatically refetch channel / account details whenever the subtab is selected
  useEffect(() => {
    if (settingsSubTab === "youtube") {
      fetchYoutubeConfig();
    } else if (settingsSubTab === "google") {
      fetchGoogleConfig();
      fetchGmailAccounts();
    } else if (settingsSubTab === "instagram") {
      fetchInstagramConfig();
      fetchIgAccounts();
    } else if (settingsSubTab === "whatsapp") {
      fetchConfig();
      fetchWaAccounts();
    }
  }, [settingsSubTab]);

  const fetchTelemetryLogs = async () => {
    try {
      setLoadingTelemetry(true);
      const res = await fetch(`${BACKEND_URL}/api/api-keys/telemetry`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setTelemetryLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Telemetry fetch error:", err);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    if (activeTab === "settings" && settingsSubTab === "api-keys" && devPortalTab === "logs") {
      fetchTelemetryLogs();
    }
  }, [activeTab, settingsSubTab, devPortalTab]);

  const handleTestApiKey = async (keyToTest?: string) => {
    const rawKey = (keyToTest || testApiKeyInput).trim();
    if (!rawKey) {
      alert("Please enter or paste an API key to test.");
      return;
    }
    setTestingApiKey(true);
    setTestResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/test`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${rawKey}`,
          "x-api-key": rawKey
        }
      });
      const data = await res.json();
      setTestResult({
        statusCode: res.status,
        ...data
      });
    } catch (err: any) {
      setTestResult({
        statusCode: 500,
        success: false,
        error: "Network Error",
        message: err.message || "Failed to connect to backend server"
      });
    } finally {
      setTestingApiKey(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getCodeSnippet = (endpointKey: string, lang: string) => {
    const keyPlaceholder = "your_api_key_here";
    const baseUrl = "http://localhost:5000/api/v1";

    if (endpointKey === "auth_test") {
      if (lang === "curl") {
        return `curl -X GET ${baseUrl}/auth/test \\
  -H "Authorization: Bearer ${keyPlaceholder}"`;
      } else if (lang === "node") {
        return `const axios = require('axios');

async function testApiKey() {
  try {
    const res = await axios.get('${baseUrl}/auth/test', {
      headers: { 'Authorization': 'Bearer ${keyPlaceholder}' }
    });
    console.log('API Key Status:', res.data);
  } catch (err) {
    console.error('Auth Error:', err.response?.data || err.message);
  }
}

testApiKey();`;
      } else if (lang === "php") {
        return `<?php
$ch = curl_init('${baseUrl}/auth/test');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ${keyPlaceholder}'
]);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`;
      } else if (lang === "python") {
        return `import requests

url = "${baseUrl}/auth/test"
headers = {"Authorization": "Bearer ${keyPlaceholder}"}

response = requests.get(url, headers=headers)
print(response.status_code, response.json())`;
      }
    } else if (endpointKey === "whatsapp_template") {
      if (lang === "curl") {
        return `curl -X POST ${baseUrl}/whatsapp/send-template \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${keyPlaceholder}" \\
  -d '{
    "to": "919325174465",
    "templateName": "welcome_jisnu_marketing",
    "languageCode": "en",
    "parameters": ["John Doe", "20% OFF"]
  }'`;
      } else if (lang === "node") {
        return `const axios = require('axios');

async function sendWhatsAppTemplate() {
  try {
    const response = await axios.post('${baseUrl}/whatsapp/send-template', {
      to: '919325174465',
      templateName: 'welcome_jisnu_marketing',
      languageCode: 'en',
      parameters: ['John Doe', '20% OFF']
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '${keyPlaceholder}'
      }
    });

    console.log('Template Dispatched:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

sendWhatsAppTemplate();`;
      } else if (lang === "php") {
        return `<?php
$ch = curl_init('${baseUrl}/whatsapp/send-template');

$payload = json_encode([
    'to' => '919325174465',
    'templateName' => 'welcome_jisnu_marketing',
    'languageCode' => 'en',
    'parameters' => ['John Doe', '20% OFF']
]);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: ${keyPlaceholder}'
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`;
      } else if (lang === "python") {
        return `import requests

url = "${baseUrl}/whatsapp/send-template"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${keyPlaceholder}"
}
payload = {
    "to": "919325174465",
    "templateName": "welcome_jisnu_marketing",
    "languageCode": "en",
    "parameters": ["John Doe", "20% OFF"]
}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code, response.json())`;
      }
    } else if (endpointKey === "whatsapp_message") {
      if (lang === "curl") {
        return `curl -X POST ${baseUrl}/whatsapp/send-message \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${keyPlaceholder}" \\
  -d '{
    "to": "919325174465",
    "message": "Hello! Your appointment is confirmed for 3:00 PM today."
  }'`;
      } else if (lang === "node") {
        return `const fetch = require('node-fetch');

async function sendDirectMessage() {
  const res = await fetch('${baseUrl}/whatsapp/send-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${keyPlaceholder}'
    },
    body: JSON.stringify({
      to: '919325174465',
      message: 'Hello! Your appointment is confirmed for 3:00 PM today.'
    })
  });

  const data = await res.json();
  console.log(data);
}

sendDirectMessage();`;
      } else if (lang === "php") {
        return `<?php
$data = [
    'to' => '919325174465',
    'message' => 'Hello! Your appointment is confirmed for 3:00 PM today.'
];

$options = [
    'http' => [
        'header' => "Content-Type: application/json\r\n" .
                    "x-api-key: ${keyPlaceholder}\r\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents('${baseUrl}/whatsapp/send-message', false, $context);
echo $result;
?>`;
      } else if (lang === "python") {
        return `import requests

res = requests.post(
    "${baseUrl}/whatsapp/send-message",
    headers={"x-api-key": "${keyPlaceholder}"},
    json={"to": "919325174465", "message": "Hello! Your appointment is confirmed for 3:00 PM today."}
)
print(res.json())`;
      }
    } else if (endpointKey === "instagram_dm") {
      if (lang === "curl") {
        return `curl -X POST ${baseUrl}/instagram/send-dm \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${keyPlaceholder}" \\
  -d '{
    "recipientId": "ig_user_99214",
    "text": "Thanks for reaching out! Check our latest offers at https://example.com"
  }'`;
      } else if (lang === "node") {
        return `const axios = require('axios');

axios.post('${baseUrl}/instagram/send-dm', {
  recipientId: 'ig_user_99214',
  text: 'Thanks for reaching out! Check our latest offers at https://example.com'
}, {
  headers: { 'x-api-key': '${keyPlaceholder}' }
}).then(r => console.log(r.data));`;
      } else if (lang === "php") {
        return `<?php
$ch = curl_init('${baseUrl}/instagram/send-dm');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'recipientId' => 'ig_user_99214',
    'text' => 'Thanks for reaching out!'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'x-api-key: ${keyPlaceholder}']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
echo curl_exec($ch);
?>`;
      } else if (lang === "python") {
        return `import requests

requests.post(
    "${baseUrl}/instagram/send-dm",
    headers={"x-api-key": "${keyPlaceholder}"},
    json={"recipientId": "ig_user_99214", "text": "Thanks for reaching out!"}
)`;
      }
    } else if (endpointKey === "contacts") {
      if (lang === "curl") {
        return `curl -X GET "${baseUrl}/contacts?limit=50&status=SUBSCRIBED" \\
  -H "x-api-key: ${keyPlaceholder}"`;
      } else if (lang === "node") {
        return `const axios = require('axios');

axios.get('${baseUrl}/contacts?limit=50', {
  headers: { 'x-api-key': '${keyPlaceholder}' }
}).then(r => console.log(r.data));`;
      } else if (lang === "php") {
        return `<?php
$res = file_get_contents('${baseUrl}/contacts?limit=50', false, stream_context_create([
    'http' => ['header' => "x-api-key: ${keyPlaceholder}\r\n"]
]));
echo $res;
?>`;
      } else if (lang === "python") {
        return `import requests

res = requests.get("${baseUrl}/contacts?limit=50", headers={"x-api-key": "${keyPlaceholder}"})
print(res.json())`;
      }
    } else if (endpointKey === "campaigns") {
      if (lang === "curl") {
        return `curl -X POST ${baseUrl}/campaigns \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${keyPlaceholder}" \\
  -d '{
    "name": "Summer Sale Drip Sequence",
    "minGapMinutes": 5,
    "maxDailyMessages": 3
  }'`;
      } else if (lang === "node") {
        return `const axios = require('axios');

axios.post('${baseUrl}/campaigns', {
  name: 'Summer Sale Drip Sequence',
  minGapMinutes: 5,
  maxDailyMessages: 3
}, {
  headers: { 'x-api-key': '${keyPlaceholder}' }
}).then(r => console.log(r.data));`;
      } else if (lang === "php") {
        return `<?php
$ch = curl_init('${baseUrl}/campaigns');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'name' => 'Summer Sale Drip Sequence',
    'minGapMinutes' => 5,
    'maxDailyMessages' => 3
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'x-api-key: ${keyPlaceholder}']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
echo curl_exec($ch);
?>`;
      } else if (lang === "python") {
        return `import requests

res = requests.post(
    "${baseUrl}/campaigns",
    headers={"x-api-key": "${keyPlaceholder}"},
    json={"name": "Summer Sale Drip Sequence", "minGapMinutes": 5, "maxDailyMessages": 3}
)
print(res.json())`;
      }
    }
    return "";
  };

  const filteredApiKeys = useMemo(() => {
    return apiKeys.filter((k: any) => {
      const matchesSearch =
        !searchQuery ||
        (k.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (k.keyPrefix || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (k.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEnv =
        envFilter === "ALL" || (k.environment || "LIVE").toUpperCase() === envFilter;

      return matchesSearch && matchesEnv;
    });
  }, [apiKeys, searchQuery, envFilter]);

  // Revoke Modal State
  const [revokeConfirmKey, setRevokeConfirmKey] = useState<any | null>(null);

  // Edit Key Modal State
  const [editingKeyModal, setEditingKeyModal] = useState<any | null>(null);
  const [editKeyName, setEditKeyName] = useState("");
  const [editKeyDesc, setEditKeyDesc] = useState("");
  const [editKeyEnv, setEditKeyEnv] = useState<"LIVE" | "TEST">("LIVE");
  const [editKeyScopes, setEditKeyScopes] = useState<string[]>([]);
  const [updatingKey, setUpdatingKey] = useState(false);

  const AVAILABLE_SCOPES = [
    {
      category: "WhatsApp",
      color: "emerald",
      items: [
        { id: "whatsapp_send", name: "whatsapp_send", label: "Send Messages & Templates", desc: "Send WhatsApp text & template messages" },
        { id: "whatsapp_templates", name: "whatsapp_templates", label: "Manage Templates", desc: "Create and submit WhatsApp templates to Meta" },
        { id: "whatsapp_read", name: "whatsapp_read", label: "Read Conversations", desc: "Access WhatsApp incoming messages & status" }
      ]
    },
    {
      category: "Instagram",
      color: "pink",
      items: [
        { id: "instagram_send", name: "instagram_send", label: "Send Instagram DMs", desc: "Send direct messages to Instagram users" },
        { id: "instagram_automation", name: "instagram_automation", label: "Manage Automations", desc: "Configure comment-to-DM triggers" },
        { id: "instagram_read", name: "instagram_read", label: "Read Instagram Data", desc: "Fetch Instagram comments & media insights" }
      ]
    },
    {
      category: "Meta Ads",
      color: "purple",
      items: [
        { id: "meta_ads_read", name: "meta_ads_read", label: "Read Ads & Insights", desc: "View performance metrics & campaign stats" },
        { id: "meta_ads_manage", name: "meta_ads_manage", label: "Manage Ad Campaigns", desc: "Create & update Meta ad campaigns" }
      ]
    },
    {
      category: "CRM General",
      color: "amber",
      items: [
        { id: "contacts_read", name: "contacts_read", label: "Read Contacts", desc: "Fetch contact lists & segments" },
        { id: "contacts_write", name: "contacts_write", label: "Write Contacts", desc: "Add, update or import contacts" },
        { id: "campaigns_manage", name: "campaigns_manage", label: "Manage Drip Campaigns", desc: "Create, start & stop drip automation" },
        { id: "full_access", name: "full_access", label: "Full System Access ⭐", desc: "Grants unrestricted access to ALL current & future CRM APIs" }
      ]
    }
  ];

  const handleToggleScope = (scopeId: string, currentList: string[], setter: (scopes: string[]) => void) => {
    if (scopeId === "full_access") {
      if (currentList.includes("full_access")) {
        setter(["whatsapp_send"]);
      } else {
        setter(["full_access"]);
      }
      return;
    }

    let newList = currentList.filter(s => s !== "full_access");
    if (newList.includes(scopeId)) {
      newList = newList.filter(s => s !== scopeId);
    } else {
      newList.push(scopeId);
    }
    if (newList.length === 0) {
      newList = ["whatsapp_send"];
    }
    setter(newList);
  };

  const handleSelectAllCategory = (catItems: any[], currentList: string[], setter: (scopes: string[]) => void) => {
    const itemIds = catItems.map(i => i.id);
    const hasAll = itemIds.every(id => currentList.includes(id));

    let newList = currentList.filter(s => s !== "full_access");
    if (hasAll) {
      newList = newList.filter(id => !itemIds.includes(id));
    } else {
      itemIds.forEach(id => {
        if (!newList.includes(id)) newList.push(id);
      });
    }
    if (newList.length === 0) newList = ["whatsapp_send"];
    setter(newList);
  };

  const downloadEnvFile = (rawKey: string, keyName: string) => {
    const content = `# CRM Developer API Key - ${keyName}\n# Generated: ${new Date().toISOString()}\nCRM_API_KEY=${rawKey}\n`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${keyName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_api_key.env`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const fetchApiKeys = async () => {
    try {
      setLoadingApiKeys(true);
      const res = await fetch(`${BACKEND_URL}/api/api-keys`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.apiKeys || []);
      }
    } catch (err) {
      console.error("Fetch API Keys error:", err);
    } finally {
      setLoadingApiKeys(false);
    }
  };

  useEffect(() => {
    if (activeTab === "settings" && settingsSubTab === "api-keys") {
      fetchApiKeys();
    }
  }, [activeTab, settingsSubTab]);

  const handleGenerateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGeneratingKey(true);
      const res = await fetch(`${BACKEND_URL}/api/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({
          name: newKeyName,
          description: newKeyDesc,
          environment: newKeyEnv,
          permissions: selectedScopes
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedRawKey(data.rawApiKey);
        setCreatedKeyWarning(data.warning);
        setShowCreateKeyModal(false);
        setShowRawKeyModal(true);
        setWizardStep(1);
        setNewKeyName("");
        setNewKeyDesc("");
        setNewKeyEnv("LIVE");
        setSelectedScopes(["whatsapp_send", "whatsapp_templates", "whatsapp_read"]);
        fetchApiKeys();
      } else {
        alert("Failed to generate API Key");
      }
    } catch (err: any) {
      alert(`API Key generation error: ${err.message}`);
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleUpdateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKeyModal) return;
    try {
      setUpdatingKey(true);
      const res = await fetch(`${BACKEND_URL}/api/api-keys/${editingKeyModal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({
          name: editKeyName,
          description: editKeyDesc,
          environment: editKeyEnv,
          permissions: editKeyScopes
        })
      });

      if (res.ok) {
        setEditingKeyModal(null);
        fetchApiKeys();
      } else {
        alert("Failed to update API key permissions");
      }
    } catch (err: any) {
      alert(`Update API key error: ${err.message}`);
    } finally {
      setUpdatingKey(false);
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Systems using this key will immediately lose access.")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/api-keys/${id}/revoke`, {
        method: "POST",
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        fetchApiKeys();
      }
    } catch (err) {
      alert("Failed to revoke API key");
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key permanently?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/api-keys/${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        fetchApiKeys();
      }
    } catch (err) {
      alert("Failed to delete API key");
    }
  };

  // Helper to construct fully qualified URLs for files saved on backend
  const getMediaUrl = (content: string) => {
    if (!content) return "";
    if (content.startsWith("http://") || content.startsWith("https://")) {
      return content;
    }
    if (content.startsWith("/uploads/")) {
      return `${BACKEND_URL}${content}`;
    }
    if (content.includes("|")) {
      const urlPart = content.split("|")[1];
      if (urlPart.startsWith("/uploads/")) {
        return `${BACKEND_URL}${urlPart}`;
      }
      return urlPart;
    }
    return content;
  };

  // Convert uploaded file to base64 and send it as a media message
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      
      let type = "document";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";

      try {
        const res = await fetch(`${BACKEND_URL}/api/messages/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: activeConv.id,
            messageType: type,
            content: file.name,
            filename: file.name,
            fileBase64: base64
          })
        });
        if (res.ok) {
          fetchConversations();
          fetchMessages(activeConv.id);
        }
      } catch (err) {
        console.error("Failed to upload and send file:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFlowMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedNode) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            fileBase64: base64
          })
        });
        if (res.ok) {
          const data = await res.json();
          let type = "document";
          if (file.type.startsWith("image/")) type = "image";
          else if (file.type.startsWith("video/")) type = "video";
          else if (file.type.startsWith("audio/")) type = "audio";
          
          updateSelectedNode({ 
            mediaUrl: data.url, 
            filename: file.name,
            mediaType: type
          });
        }
      } catch (err) {
        console.error("Failed to upload flow media file:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Interactive UI pickers
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [activeListMenuMsgId, setActiveListMenuMsgId] = useState<string | null>(null);

  // Settings States
  const [config, setConfig] = useState<WhatsAppConfig>({
    phoneNumberId: "",
    wabaId: "",
    accessToken: "",
    webhookVerifyToken: "loading-token-verify"
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // Meta Embedded Signup States
  const [capturedWabaId, setCapturedWabaId] = useState<string | null>(null);
  const [capturedPhoneId, setCapturedPhoneId] = useState<string | null>(null);
  const [embeddedConnecting, setEmbeddedConnecting] = useState(false);
  const [embeddedSuccess, setEmbeddedSuccess] = useState(false);
  const [manualAuthCode, setManualAuthCode] = useState("");
  const [showManualCodeInput, setShowManualCodeInput] = useState(false);

  // Initialize Meta FB SDK and listen for WA_EMBEDDED_SIGNUP postMessage events
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize FB SDK if already present
      if ((window as any).FB) {
        try {
          (window as any).FB.init({
            appId: "36702477879366478",
            cookie: true,
            xfbml: true,
            version: "v21.0"
          });
        } catch (e) {
          console.warn("FB init warning:", e);
        }
      }

      // Listen for Meta Embedded Signup completion postMessage events
      const sessionMessageListener = (event: MessageEvent) => {
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          console.log("[EMBEDDED SIGNUP SESSION EVENT]:", data);

          if (data.type === "WA_EMBEDDED_CODE" && data.code) {
            processEmbeddedCode(data.code);
            return;
          }

          if (data.type === "IG_EMBEDDED_CODE" && data.code) {
            processInstagramEmbeddedCode(data.code);
            return;
          }

          if (data.type === "WA_EMBEDDED_SIGNUP" || data.event === "FINISH") {
            const waba_id = data.data?.waba_id;
            const phone_number_id = data.data?.phone_number_id;
            const code = data.data?.code || data.code;

            if (waba_id) setCapturedWabaId(waba_id);
            if (phone_number_id) setCapturedPhoneId(phone_number_id);

            if (code) {
              processEmbeddedCode(code, waba_id, phone_number_id);
            }
          }
        } catch {
          // ignore non-JSON messages
        }
      };

      window.addEventListener("message", sessionMessageListener);

      // Check if current window was loaded with OAuth callback code
      const urlParams = new URLSearchParams(window.location.search);
      const incomingCode = urlParams.get("code");
      const tabParam = urlParams.get("tab");
      if (incomingCode) {
        if (window.opener) {
          try {
            const msgType = tabParam === "instagram" ? "IG_EMBEDDED_CODE" : "WA_EMBEDDED_CODE";
            window.opener.postMessage({ type: msgType, code: incomingCode }, "*");
            window.close();
            return;
          } catch (e) {
            console.error("Failed to post message to opener:", e);
          }
        }
        if (tabParam === "instagram") {
          processInstagramEmbeddedCode(incomingCode);
        } else {
          processEmbeddedCode(incomingCode);
        }
      }

      return () => window.removeEventListener("message", sessionMessageListener);
    }
  }, []);

  const processEmbeddedCode = async (code: string, wabaId?: string | null, phoneId?: string | null) => {
    try {
      setEmbeddedConnecting(true);
      const orgId = getOrgId();
      const targetOrigin = window.location.origin.startsWith("https://")
        ? window.location.origin
        : "https://crm.jisnudigital.com";

      const res = await fetch(`${BACKEND_URL}/api/whatsapp/embedded-signup/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId,
        },
        body: JSON.stringify({
          code,
          redirectUri: `${targetOrigin}/settings`,
          wabaId: wabaId || capturedWabaId || undefined,
          phoneNumberId: phoneId || capturedPhoneId || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to exchange token with Meta");

      setEmbeddedSuccess(true);
      if (resData.config) {
        setConfig(prev => ({
          ...prev,
          wabaId: resData.config.wabaId || prev.wabaId,
          phoneNumberId: resData.config.phoneNumberId || prev.phoneNumberId,
        }));
      }
      alert("✓ WhatsApp Business Account connected successfully via Meta!");
      fetchConfig();
    } catch (err: any) {
      console.error("Token exchange failed:", err);
      alert(`Connection Error: ${err.message}`);
    } finally {
      setEmbeddedConnecting(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!confirm("Are you sure you want to disconnect this WhatsApp Business Account? Incoming messages will no longer route to this CRM.")) return;
    try {
      setEmbeddedConnecting(true);
      const res = await fetch(`${BACKEND_URL}/api/whatsapp/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId(),
        },
      });
      if (res.ok) {
        alert("✓ WhatsApp account disconnected successfully.");
        setConfig(prev => ({ ...prev, phoneNumberId: "", wabaId: "", accessToken: "" }));
        fetchConfig();
      } else {
        alert("Failed to disconnect WhatsApp account.");
      }
    } catch (err: any) {
      console.error("Disconnect failed:", err);
      alert(`Disconnect Error: ${err.message}`);
    } finally {
      setEmbeddedConnecting(false);
    }
  };

  const launchWhatsAppSignup = () => {
    if (typeof window === "undefined") return;

    setEmbeddedConnecting(true);
    const FB = (window as any).FB;

    // 1. Primary Automated Flow: Native Facebook JS SDK (Used on Production / HTTPS)
    if (FB && window.location.protocol === "https:") {
      try {
        FB.login(
          (response: any) => {
            console.log("[META FB.LOGIN RESPONSE]:", response);
            if (response.authResponse && response.authResponse.code) {
              processEmbeddedCode(response.authResponse.code);
            } else {
              setEmbeddedConnecting(false);
            }
          },
          {
            config_id: "1057598330310757",
            response_type: "code",
            override_default_response_type: true,
            extras: {
              version: "v4",
              sessionInfoVersion: "3",
            },
          }
        );
        return;
      } catch (err) {
        console.warn("FB.login fallback triggered:", err);
      }
    }

    // 2. Secondary Automated Flow: OAuth Popup Dialog with auto-polling
    const appId = "36702477879366478";
    const configId = "1057598330310757";

    const targetOrigin = window.location.origin.startsWith("https://")
      ? window.location.origin
      : "https://crm.jisnudigital.com";

    const redirectUri = encodeURIComponent(`${targetOrigin}/settings`);
    const extras = encodeURIComponent(JSON.stringify({ version: "v4", sessionInfoVersion: "3" }));
    
    const oauthUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&config_id=${configId}&redirect_uri=${redirectUri}&response_type=code&override_default_response_type=true&extras=${extras}`;

    const width = 600;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      oauthUrl,
      "MetaWhatsAppSignup",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );

    if (!popup) {
      alert("Popup blocked! Please allow popups for this site in your browser.");
      setEmbeddedConnecting(false);
      return;
    }

    // Automatically poll and capture authorization code without user copy-pasting
    const pollTimer = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(pollTimer);
          setEmbeddedConnecting(false);
          return;
        }

        const currentUrl = popup.location.href;
        if (currentUrl && currentUrl.includes("code=")) {
          const urlObj = new URL(currentUrl);
          const code = urlObj.searchParams.get("code");
          if (code) {
            clearInterval(pollTimer);
            popup.close();
            processEmbeddedCode(code);
          }
        }
      } catch {
        // Cross-origin before redirect is normal
      }
    }, 500);
  };

  // Meta Instagram Embedded Signup States & Handlers
  const [igEmbeddedConnecting, setIgEmbeddedConnecting] = useState(false);
  const [igEmbeddedSuccess, setIgEmbeddedSuccess] = useState(false);

  const processInstagramEmbeddedCode = async (code: string) => {
    try {
      setIgEmbeddedConnecting(true);
      const orgId = getOrgId();
      const targetOrigin = window.location.origin.startsWith("https://")
        ? window.location.origin
        : "https://crm.jisnudigital.com";

      const res = await fetch(`${BACKEND_URL}/api/admin/instagram/embedded-signup/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId,
        },
        body: JSON.stringify({
          code,
          redirectUri: `${targetOrigin}/settings?tab=instagram`,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to exchange token with Meta for Instagram");

      setIgEmbeddedSuccess(true);
      if (resData.config) {
        setIgConfig(prev => ({
          ...prev,
          instagramAccountId: resData.config.instagramAccountId || prev.instagramAccountId,
          pageId: resData.config.pageId || prev.pageId,
          pageAccessToken: resData.config.pageAccessToken || prev.pageAccessToken,
        }));
      }
      alert("✓ Instagram Business Account connected successfully via Meta!");
      fetchInstagramConfig();
    } catch (err: any) {
      console.error("Instagram token exchange failed:", err);
      alert(`Instagram Connection Error: ${err.message}`);
    } finally {
      setIgEmbeddedConnecting(false);
    }
  };

  const handleDisconnectInstagram = async () => {
    if (!confirm("Are you sure you want to disconnect this Instagram Business Account? Incoming DMs and story mentions will no longer route to this CRM.")) return;
    try {
      setIgEmbeddedConnecting(true);
      const res = await fetch(`${BACKEND_URL}/api/admin/instagram/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId(),
        },
      });
      if (res.ok) {
        alert("✓ Instagram account disconnected successfully.");
        setIgConfig(prev => ({ ...prev, instagramAccountId: "", pageId: "", pageAccessToken: "" }));
        fetchInstagramConfig();
      } else {
        alert("Failed to disconnect Instagram account.");
      }
    } catch (err: any) {
      console.error("Instagram disconnect failed:", err);
      alert(`Disconnect Error: ${err.message}`);
    } finally {
      setIgEmbeddedConnecting(false);
    }
  };

  const launchInstagramSignup = () => {
    if (typeof window === "undefined") return;

    setIgEmbeddedConnecting(true);
    const FB = (window as any).FB;

    // 1. Primary Automated Flow: Native Facebook JS SDK with Instagram scopes
    if (FB && window.location.protocol === "https:") {
      try {
        FB.login(
          (response: any) => {
            console.log("[META INSTAGRAM FB.LOGIN RESPONSE]:", response);
            if (response.authResponse && response.authResponse.code) {
              processInstagramEmbeddedCode(response.authResponse.code);
            } else {
              setIgEmbeddedConnecting(false);
            }
          },
          {
            scope: "instagram_basic,instagram_manage_messages,pages_manage_metadata,pages_read_engagement,pages_show_list,public_profile",
            response_type: "code",
            override_default_response_type: true,
          }
        );
        return;
      } catch (err) {
        console.warn("FB.login Instagram fallback triggered:", err);
      }
    }

    // 2. Secondary Automated Flow: OAuth Popup Dialog with auto-polling
    const appId = "36702477879366478";
    const targetOrigin = window.location.origin.startsWith("https://")
      ? window.location.origin
      : "https://crm.jisnudigital.com";

    const redirectUri = encodeURIComponent(`${targetOrigin}/settings?tab=instagram`);
    const scope = encodeURIComponent("instagram_basic,instagram_manage_messages,pages_manage_metadata,pages_read_engagement,pages_show_list,public_profile");

    const oauthUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

    const width = 600;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      oauthUrl,
      "MetaInstagramSignup",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );

    if (!popup) {
      alert("Popup blocked! Please allow popups for this site in your browser.");
      setIgEmbeddedConnecting(false);
      return;
    }

    const pollTimer = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(pollTimer);
          setIgEmbeddedConnecting(false);
          return;
        }

        const currentUrl = popup.location.href;
        if (currentUrl && currentUrl.includes("code=")) {
          const urlObj = new URL(currentUrl);
          const code = urlObj.searchParams.get("code");
          if (code) {
            clearInterval(pollTimer);
            popup.close();
            processInstagramEmbeddedCode(code);
          }
        }
      } catch {
        // Cross-origin before redirect is normal
      }
    }, 500);
  };

  // Quoted reply state
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null);

  // React Flow States for Flow Builder
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowName, setFlowName] = useState("Default Automated Help Menu");
  const [flowDesc, setFlowDesc] = useState("Automated menu and routing system");
  const [flowId, setFlowId] = useState<string | null>(null);
  const [flowSaveStatus, setFlowSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // Selected Node reference for Flow Builder property editor
  const selectedNode = nodes.find((n) => n.selected);

  const updateSelectedNode = (newData: any) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              ...newData,
            },
          };
        }
        return n;
      })
    );
  };

  const addOptionButton = () => {
    if (!selectedNode) return;
    const currentBtns = selectedNode.data.buttons || [];
    const limit = selectedPlatform === "whatsapp" ? 3 : 13;
    if (currentBtns.length >= limit) return;
    const nextBtns = [...currentBtns, { id: `btn_${Date.now()}`, title: `New Button` }];
    updateSelectedNode({ buttons: nextBtns });
  };

  const updateOptionButton = (btnId: string, newTitle: string) => {
    if (!selectedNode) return;
    const nextBtns = selectedNode.data.buttons?.map((btn: any) => {
      if (btn.id === btnId) {
        return { ...btn, title: newTitle };
      }
      return btn;
    }) || [];
    updateSelectedNode({ buttons: nextBtns });
  };

  const removeOptionButton = (btnId: string) => {
    if (!selectedNode) return;
    const nextBtns = selectedNode.data.buttons?.filter((btn: any) => btn.id !== btnId) || [];
    updateSelectedNode({ buttons: nextBtns });
  };

  const addListOptionRow = () => {
    if (!selectedNode) return;
    const sections = selectedNode.data.listSections || [];
    if (sections.length === 0) {
      sections.push({ title: "Options", rows: [] });
    }
    const limit = selectedPlatform === "whatsapp" ? 10 : 13;
    const totalRows = sections.flatMap((sec: any) => sec.rows || []).length;
    if (totalRows >= limit) return;

    sections[0].rows = [
      ...(sections[0].rows || []),
      { id: `row_${Date.now()}`, title: `Option ${totalRows + 1}`, description: "" }
    ];
    updateSelectedNode({ listSections: [...sections] });
  };

  const updateListOptionRow = (rowId: string, newTitle: string, newDesc?: string) => {
    if (!selectedNode) return;
    const sections = selectedNode.data.listSections || [];
    const updatedSections = sections.map((sec: any) => {
      const updatedRows = sec.rows?.map((row: any) => {
        if (row.id === rowId) {
          return { 
            ...row, 
            title: newTitle, 
            description: newDesc !== undefined ? newDesc : row.description 
          };
        }
        return row;
      }) || [];
      return { ...sec, rows: updatedRows };
    });
    updateSelectedNode({ listSections: updatedSections });
  };

  const removeListOptionRow = (rowId: string) => {
    if (!selectedNode) return;
    const sections = selectedNode.data.listSections || [];
    const updatedSections = sections.map((sec: any) => {
      const updatedRows = sec.rows?.filter((row: any) => row.id !== rowId) || [];
      return { ...sec, rows: updatedRows };
    });
    updateSelectedNode({ listSections: updatedSections });
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
  };

  const sendMockMediaMessage = async (type: "image" | "document", content: string, filename?: string) => {
    if (!activeConv) return;
    setShowMediaMenu(false);
    try {
      const res = await fetch(`${BACKEND_URL}/api/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConv.id,
          messageType: type,
          content,
          filename
        })
      });
      if (res.ok) {
        fetchConversations();
        fetchMessages(activeConv.id);
      }
    } catch (err) {
      console.error("Failed to send mock media message:", err);
    }
  };



  const activeConvRef = useRef<Conversation | null>(null);
  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  // 1. WebSocket & Initial Data Fetch
  useEffect(() => {
    // Connect to WebSocket Server
    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to Real-time WebSocket Server");
      // Join Organization Room
      socket.emit("join-org", getOrgId());
    });

    // Handle Inbound/Outbound Messages
    socket.on("new-message", (data: { conversationId: string; message: Message }) => {
      // Append message if active conversation matches
      const currentActiveConv = activeConvRef.current;
      if (currentActiveConv && currentActiveConv.id === data.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        
        // Mark conversation as read in state
        setConversations((prev) => 
          prev.map((c) => {
            if (c.id === data.conversationId) {
              return { ...c, messages: [data.message], updatedAt: new Date().toISOString() };
            }
            return c;
          })
        );
      } else {
        // Reload conversation list
        fetchConversations();
      }
    });

    // Handle Status Updates (Ticks)
    socket.on("message-status-update", (data: { waMessageId: string; status: string; customerPhone: string }) => {
      setMessages((prev) => 
        prev.map((m) => {
          if (m.waMessageId === data.waMessageId) {
            return { ...m, status: data.status as any };
          }
          return m;
        })
      );
    });

    // Handle Bot Status Changes
    socket.on("bot-status-change", (data: { conversationId: string; isBotPaused: boolean; botPausedUntil?: string }) => {
      const currentActiveConv = activeConvRef.current;
      if (currentActiveConv && currentActiveConv.id === data.conversationId) {
        setActiveConv((prev) => prev ? { ...prev, isBotPaused: data.isBotPaused, botPausedUntil: data.botPausedUntil } : null);
      }
      setConversations((prev) => 
        prev.map((c) => {
          if (c.id === data.conversationId) {
            return { ...c, isBotPaused: data.isBotPaused, botPausedUntil: data.botPausedUntil };
          }
          return c;
        })
      );
    });

    // Initial Fetch
    fetchConversations();
    fetchConfig();
    fetchWaAccounts();
    fetchInstagramConfig();
    fetchIgAccounts();
    fetchYoutubeConfig();
    fetchGoogleConfig();
    fetchGmailAccounts();
    fetchActiveFlow("whatsapp");

    return () => {
      socket.disconnect();
    };
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset active conversation if it belongs to a different channel than the active tab
  useEffect(() => {
    if (activeConv) {
      const expectedPlatform = activeTab === "chats_whatsapp" ? "whatsapp" : "instagram";
      if ((activeConv.platform || "whatsapp") !== expectedPlatform) {
        setActiveConv(null);
        setMessages([]);
      }
    }
  }, [activeTab]);

  // Refetch flows when selected platform changes
  useEffect(() => {
    if (activeTab === "flows") {
      fetchActiveFlow(selectedPlatform);
    }
  }, [selectedPlatform, activeTab]);

  // 2. HTTP API Calls
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/conversations`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
      }
    } catch (err) {
      console.warn("Error fetching conversations:", err);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/conversations/${convId}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.warn("Error fetching messages:", err);
    }
  };

  const fetchWaAccounts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/whatsapp-embedded/accounts`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accounts) setWaAccounts(data.accounts);
      }
    } catch (err) {
      console.warn("Error fetching WhatsApp accounts:", err);
    }
  };

  const setDefaultWaAccount = async (accountId: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/whatsapp-embedded/set-default`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({ accountId })
      });
      fetchConfig();
      fetchWaAccounts();
    } catch (err) {
      console.warn("Error setting default WhatsApp account:", err);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/config`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data) {
        setConfig(data);
      }
      fetchWaAccounts();
    } catch (err) {
      console.warn("Error fetching config:", err);
    }
  };

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaveStatus("success");
        fetchConfig();
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      setSaveStatus("error");
    }
  };

  const fetchIgAccounts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/instagram/accounts`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accounts) setIgAccounts(data.accounts);
      }
    } catch (err) {
      console.warn("Error fetching IG accounts:", err);
    }
  };

  const setDefaultIgAccount = async (accountId: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/instagram/set-default`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({ accountId })
      });
      fetchInstagramConfig();
    } catch (err) {
      console.warn("Error setting default IG account:", err);
    }
  };

  const fetchInstagramConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/instagram/config`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data) {
        if (data.config) setIgConfig(data.config);
        if (data.accounts) setIgAccounts(data.accounts);
      }
      fetchIgAccounts();
    } catch (err) {
      console.warn("Error fetching Instagram config:", err);
    }
  };

  const saveInstagramConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIgSaveStatus("saving");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/instagram/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify(igConfig)
      });
      if (res.ok) {
        setIgSaveStatus("success");
        fetchInstagramConfig();
        setTimeout(() => setIgSaveStatus("idle"), 3000);
      } else {
        setIgSaveStatus("error");
      }
    } catch (err) {
      setIgSaveStatus("error");
    }
  };

  const fetchGmailAccounts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmail/accounts`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accounts) setGmailAccounts(data.accounts);
      }
    } catch (err) {
      console.warn("Error fetching Gmail accounts:", err);
    }
  };

  const setDefaultGmailAccount = async (accountId: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/gmail/set-default`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({ accountId })
      });
      fetchGmailAccounts();
    } catch (err) {
      console.warn("Error setting default Gmail account:", err);
    }
  };

  const fetchYoutubeConfig = async (accountId?: string) => {
    try {
      const targetId = accountId || selectedYoutubeAccountId;
      const res = await fetch(`${BACKEND_URL}/api/youtube/config${targetId ? `?accountId=${targetId}` : ""}`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        const cfg = data.config || data;
        if (cfg) {
          setYtConfig({
            channelId: cfg.channelId || "",
            channelTitle: cfg.channelTitle || "",
            accessToken: cfg.accessToken || "",
            refreshToken: cfg.refreshToken || ""
          });
        }
        if (data.accounts && Array.isArray(data.accounts)) {
          setYoutubeAccounts(data.accounts);
          const active = data.accounts.find((a: any) => a.isDefault) || data.accounts[0];
          if (active && !targetId) {
            setSelectedYoutubeAccountId(active.id);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching YouTube config:", err);
    }
  };

  const setDefaultYoutubeAccount = async (accountId: string) => {
    try {
      setSelectedYoutubeAccountId(accountId);
      await fetch(`${BACKEND_URL}/api/youtube/set-default`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({ accountId })
      });
      fetchYoutubeConfig(accountId);
    } catch (err) {
      console.warn("Error setting default YouTube account:", err);
    }
  };

  const saveYoutubeConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setYtSaveStatus("saving");
    try {
      const res = await fetch(`${BACKEND_URL}/api/youtube/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify(ytConfig)
      });
      if (res.ok) {
        setYtSaveStatus("success");
        setTimeout(() => setYtSaveStatus("idle"), 3000);
      } else {
        setYtSaveStatus("error");
      }
    } catch (err) {
      setYtSaveStatus("error");
    }
  };

  const handleYoutubeOAuthConnect = () => {
    setYtOauthStatus("connecting");
    window.location.href = `${BACKEND_URL}/api/youtube/oauth/connect?orgId=${getOrgId()}&redirect=${window.location.pathname}`;
  };

  const fetchGoogleConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/config?orgId=${getOrgId()}`);
      if (res.ok) {
        const data = await res.json();
        setGoogleConfig(data);

        // Parse Google location path into split fields
        let accountId = "";
        let locationId = data.googleLocationId || "";
        if (locationId.startsWith("accounts/") && locationId.includes("/locations/")) {
          const parts = locationId.split("/");
          accountId = parts[1] || "";
          locationId = parts[3] || "";
        } else if (locationId.includes("locations/")) {
          locationId = locationId.replace("locations/", "");
        }
        setFormGoogleAccountId(accountId);
        setFormGoogleLocationId(locationId);
        setFormGoogleAdsCustomerId(data.googleAdsCustomerId || "");
      }
    } catch (err) {
      console.error("Error fetching Google GMB config:", err);
    }
  };

  const saveGoogleConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleSaveStatus("saving");
    try {
      // Clean inputs to remove any accidental prefixes
      const cleanAccountId = formGoogleAccountId.replace("accounts/", "").trim();
      const cleanLocationId = formGoogleLocationId.replace("locations/", "").trim();

      // Build location path string
      const finalLocationId = cleanAccountId
        ? `accounts/${cleanAccountId}/locations/${cleanLocationId}`
        : cleanLocationId;

      const res = await fetch(`${BACKEND_URL}/api/gmb/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({ 
          orgId: getOrgId(), 
          ...googleConfig,
          googleLocationId: finalLocationId,
          googleAdsCustomerId: formGoogleAdsCustomerId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGoogleConfig(data);

        let accountId = "";
        let locationId = data.googleLocationId || "";
        if (locationId.startsWith("accounts/") && locationId.includes("/locations/")) {
          const parts = locationId.split("/");
          accountId = parts[1] || "";
          locationId = parts[3] || "";
        } else if (locationId.includes("locations/")) {
          locationId = locationId.replace("locations/", "");
        }
        setFormGoogleAccountId(accountId);
        setFormGoogleLocationId(locationId);
        setFormGoogleAdsCustomerId(data.googleAdsCustomerId || "");

        setGoogleSaveStatus("success");
        setTimeout(() => setGoogleSaveStatus("idle"), 3000);
      } else {
        setGoogleSaveStatus("error");
      }
    } catch (err) {
      setGoogleSaveStatus("error");
    }
  };

  const handleGoogleOAuthConnect = () => {
    setGoogleOauthStatus("connecting");
    if (typeof window !== "undefined") {
      window.location.href = `${BACKEND_URL}/api/gmb/oauth/connect?orgId=${getOrgId()}`;
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm("Are you sure you want to disconnect Google Business Profile? Automated review monitoring will be stopped.")) return;
    try {
      setGoogleOauthStatus("connecting");
      const res = await fetch(`${BACKEND_URL}/api/gmb/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId(),
        },
        body: JSON.stringify({ orgId: getOrgId() })
      });
      if (res.ok) {
        alert("✓ Google Business profile disconnected successfully.");
        setGoogleConfig(prev => ({
          ...prev,
          googleRefreshToken: "",
          googleLocationId: "",
          googlePlaceId: "",
          googleReviewUrl: ""
        }));
        fetchGoogleConfig();
      } else {
        alert("Failed to disconnect Google Business profile.");
      }
    } catch (err: any) {
      alert(`Disconnect Error: ${err.message}`);
    } finally {
      setGoogleOauthStatus("idle");
    }
  };

  const handleDisconnectYoutube = async () => {
    if (!confirm("Are you sure you want to disconnect your YouTube Channel? Video comment monitoring will be stopped.")) return;
    try {
      setYtOauthStatus("connecting");
      const res = await fetch(`${BACKEND_URL}/api/youtube/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId(),
        },
      });
      if (res.ok) {
        alert("✓ YouTube Channel disconnected successfully.");
        setYtConfig({ channelId: "", channelTitle: "", accessToken: "", refreshToken: "" });
        fetchYoutubeConfig();
      } else {
        alert("Failed to disconnect YouTube channel.");
      }
    } catch (err: any) {
      alert(`Disconnect Error: ${err.message}`);
    } finally {
      setYtOauthStatus("idle");
    }
  };

  const fetchActiveFlow = async (platform: "whatsapp" | "instagram" | "youtube" = "whatsapp") => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/flows?platform=${platform}`, {
        headers: { "x-organization-id": getOrgId() }
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const active = data[0];
        setFlowId(active.id);
        setFlowName(active.name);
        setFlowDesc(active.description || "");
        
        // Parse and set Graph JSON
        const graph = active.graphJson;
        if (graph && graph.nodes) {
          const mappedNodes = graph.nodes.map((node: any) => ({
            ...node,
            data: {
              ...node.data,
              platform: node.data?.platform || active.platform || "whatsapp"
            }
          }));
          setNodes(mappedNodes);
          setEdges(graph.edges || []);
        }
      } else {
        // Initialize default graph when empty
        initializeDefaultGraph();
        setFlowId(null);
      }
    } catch (err) {
      console.error("Error fetching flows:", err);
      initializeDefaultGraph();
      setFlowId(null);
    }
  };

  const initializeDefaultGraph = () => {
    setNodes([
      { 
        id: "welcome_1", 
        type: "welcomeNode", 
        data: { 
          text: selectedPlatform === "instagram" 
            ? "Welcome to our Instagram DM channel! How can we help you today?"
            : "Welcome to our support desk! How can we help you today?",
          platform: selectedPlatform
        }, 
        position: { x: 250, y: 50 } 
      }
    ] as any);
    setEdges([]);
  };

  const saveFlow = async () => {
    setFlowSaveStatus("saving");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/flows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({
          id: flowId,
          name: flowName,
          description: flowDesc,
          graphJson: { nodes, edges },
          isActive: true,
          platform: selectedPlatform
        })
      });
      if (res.ok) {
        const responseData = await res.json();
        if (responseData.data && responseData.data.id) {
          setFlowId(responseData.data.id);
        }
        setFlowSaveStatus("success");
        setTimeout(() => setFlowSaveStatus("idle"), 3000);
      } else {
        setFlowSaveStatus("error");
      }
    } catch (err) {
      setFlowSaveStatus("error");
    }
  };

  // 3. User Actions
  const handleSelectConversation = (conv: Conversation) => {
    setActiveConv(conv);
    fetchMessages(conv.id);
    setMobileChatOpen(true); // On mobile, open the chat panel
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const text = inputText;
    const qId = quotedMessage?.id || null;
    
    setQuotedMessage(null);
    setInputText("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConv.id,
          messageType: "text",
          content: text,
          quotedMessageId: qId
        })
      });
      if (res.ok) {
        fetchConversations();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleToggleBot = async (paused: boolean) => {
    if (!activeConv) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/messages/toggle-bot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConv.id,
          isBotPaused: paused
        })
      });
      if (res.ok) {
        setActiveConv((prev) => prev ? { ...prev, isBotPaused: paused } : null);
      }
    } catch (err) {
      console.error("Failed to toggle bot:", err);
    }
  };

  // React Flow connections helper
  const onConnect = (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds));

  const addFlowNode = (type: string) => {
    const id = `${type}_${Date.now()}`;
    let label = "New Node";
    const data: any = { text: "" };

    if (type === "textNode") {
      label = "Text response message";
    } else if (type === "buttonsNode") {
      label = "Options selection buttons";
      data.buttons = [{ id: `btn_${Date.now()}`, title: "Button Option" }];
    } else if (type === "listNode") {
      label = "Pop-up list options menu";
      data.listButtonText = "View Menu";
      data.listSections = [{ 
        title: "Options", 
        rows: [{ id: `row_${Date.now()}`, title: "Option 1", description: "" }] 
      }];
    } else if (type === "questionNode") {
      label = "Collect Text input question";
      data.variableName = "user_input";
    } else if (type === "mediaNode") {
      label = "Send Media attachment";
      data.mediaType = "image";
      data.mediaUrl = "";
      data.caption = "";
      data.filename = "document.pdf";
    }

    const newNode = {
      id,
      type: type, // Matches DB flow types
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        ...data,
        platform: selectedPlatform,
        label: `${nodes.length + 1}. ${label}` 
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* 2. MAIN CONTENT BODY */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 pb-[calc(env(safe-area-inset-bottom)+56px)] sm:pb-0">
        
        {/* TAB 1: REAL-TIME CHATS PANEL */}
        {(activeTab === "chats_whatsapp" || activeTab === "chats_instagram") && (() => {
          const currentPlatform = activeTab === "chats_whatsapp" ? "whatsapp" : "instagram";
          const filteredConversations = conversations.filter(c => (c.platform || "whatsapp") === currentPlatform);
          const isInstagramTab = activeTab === "chats_instagram";

          return (
            <div className="flex h-full w-full overflow-hidden">
              {/* Conversations Sidebar ΓÇö full screen on mobile when no chat open, fixed width on desktop */}
              <div className={`${
                mobileChatOpen ? "hidden" : "flex"
              } sm:flex w-full sm:w-80 border-r border-slate-800 bg-slate-950/40 flex-col h-full shrink-0`}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                    {isInstagramTab ? "Instagram Inbox" : "WhatsApp Inbox"}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-normal ${isInstagramTab ? "bg-pink-500/20 text-pink-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                      {filteredConversations.length} active
                    </span>
                  </h2>
                </div>
                
                {/* Conversation items list */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
                  {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                      {isInstagramTab ? (
                        <Instagram className="h-8 w-8 stroke-1 text-pink-400/60" />
                      ) : (
                        <WhatsApp className="h-8 w-8 text-emerald-400/60" />
                      )}
                      <p className="text-xs">No active {isInstagramTab ? "Instagram" : "WhatsApp"} chats found.</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const lastMsg = conv.messages?.[0];
                      const isSelected = activeConv?.id === conv.id;
                      const isInstagram = (conv.platform || "whatsapp") === "instagram";

                      return (
                        <div
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv)}
                          className={`p-4 flex flex-col gap-1 cursor-pointer transition-all duration-150 border-l-2 ${isSelected ? (isInstagram ? "bg-slate-800/40 border-pink-500" : "bg-slate-800/40 border-emerald-500") : "hover:bg-slate-850/50 border-transparent"}`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {isInstagram ? (
                                <Instagram className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                              ) : (
                                <WhatsApp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              )}
                              <span className="font-semibold text-slate-200 text-sm truncate">
                                {conv.customerName || conv.customerPhone}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-slate-400 truncate max-w-[180px]">
                              {lastMsg?.content || "No messages yet"}
                            </p>
                            {conv.isBotPaused ? (
                              <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                                <User className="h-2.5 w-2.5" /> Manual
                              </span>
                            ) : (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 ${isInstagram ? "bg-pink-500/10 text-pink-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                                <Bot className="h-2.5 w-2.5" /> Auto
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat Conversation Pane ΓÇö full screen on mobile when chat open */}
              <div className={`${
                mobileChatOpen ? "flex" : "hidden"
              } sm:flex flex-1 flex-col h-full bg-slate-900 relative animate-slideInRight sm:animate-none`}>
                {activeConv ? (
                  <>
                    {/* Chat header */}
                    <div className="h-16 border-b border-slate-800 bg-slate-950/30 px-3 sm:px-6 flex items-center justify-between z-10 gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => setMobileChatOpen(false)}
                          className="sm:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 shrink-0 transition-all"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold border border-slate-700 shrink-0">
                          {activeConv.customerName ? activeConv.customerName[0].toUpperCase() : "U"}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            {activeConv.platform === "instagram" ? (
                              <Instagram className="h-4 w-4 text-pink-400 shrink-0" />
                            ) : (
                              <WhatsApp className="h-4 w-4 text-emerald-400 shrink-0" />
                            )}
                            <span className="font-semibold text-sm text-slate-200 truncate">
                              {activeConv.customerName || (activeConv.platform === "instagram" ? "Instagram User" : "WhatsApp User")}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 flex items-center gap-1 truncate">
                            {activeConv.platform === "instagram" ? (
                              <><span>Instagram ID:</span> {activeConv.customerPhone}</>
                            ) : (
                              <><Phone className="h-3 w-3 text-slate-500 shrink-0" /> {activeConv.customerPhone}</>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Bot active / pause controllers */}
                      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                        {/* Bot status badge ΓÇö hidden on very small screens, visible on sm+ */}
                        <div className={`hidden sm:flex text-xs px-3 py-1.5 rounded-lg items-center gap-2 border transition-all ${
                          activeConv.isBotPaused 
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}>
                          {activeConv.isBotPaused ? (
                            <><User className="h-3.5 w-3.5" /><span>Bot Paused</span></>
                          ) : (
                            <><Bot className="h-3.5 w-3.5" /><span>Bot Active</span></>
                          )}
                        </div>
                        {/* Compact bot status icon ΓÇö mobile only */}
                        <div className={`sm:hidden p-2 rounded-xl border transition-all ${
                          activeConv.isBotPaused 
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}>
                          {activeConv.isBotPaused ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleBot(!activeConv.isBotPaused)}
                          className={`text-xs font-semibold px-2.5 sm:px-4 py-1.5 rounded-lg border transition-all ${
                            activeConv.isBotPaused 
                              ? "bg-emerald-500 border-emerald-600 hover:bg-emerald-400 text-slate-950" 
                              : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                          }`}
                        >
                          <span className="hidden sm:inline">{activeConv.isBotPaused ? "Resume Chatbot" : "Pause Chatbot"}</span>
                          <span className="sm:hidden">{activeConv.isBotPaused ? "Resume" : "Pause"}</span>
                        </button>

                      </div>
                    </div>
                    {/* Messages list container */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/90 relative scrollbar-thin">
                      {messages.map((msg) => {
                        const isInbound = msg.direction === "inbound";
                        
                        // Check if message is a quoted reply (prefer new DB relation, fallback to old string format)
                        const hasQuote = !!msg.quotedMessage || msg.content.startsWith("[Reply to: ");
                        let quoteText = "";
                        let messageBody = msg.content;
                        
                        if (msg.quotedMessage) {
                          const sender = msg.quotedMessage.direction === "inbound" ? "Customer" : (msg.quotedMessage.senderName || "Bot");
                          const contentSnippet = msg.quotedMessage.content.split("|")[0];
                          quoteText = `${sender}: ${contentSnippet}`;
                        } else if (msg.content.startsWith("[Reply to: ")) {
                          const closeBracketIndex = msg.content.indexOf("] ");
                          if (closeBracketIndex !== -1) {
                            quoteText = msg.content.substring(11, closeBracketIndex);
                            messageBody = msg.content.substring(closeBracketIndex + 2);
                          }
                        }

                        // Check if message has interactive buttons data
                        const hasButtons = msg.messageType === "buttonsNode" || msg.content.includes("|buttons:");
                        let buttonsArray: string[] = [];
                        if (hasButtons) {
                          const parts = messageBody.split("|buttons:");
                          messageBody = parts[0];
                          buttonsArray = parts[1]?.split(", ") || [];
                        }

                        // Check if message is a WhatsApp list menu
                        const hasList = msg.messageType === "listNode" || msg.content.includes("|list:");
                        let listButtonText = "View Menu";
                        let listRowsArray: string[] = [];
                        if (hasList) {
                          const parts = messageBody.split("|list:");
                          messageBody = parts[0];
                          const listParts = parts[1]?.split("|rows:");
                          listButtonText = listParts?.[0] || "View Menu";
                          const rowsString = listParts?.[1];
                          listRowsArray = rowsString ? rowsString.split(", ") : [];

                          // Fallback to active flow graph listNode options if rows array is empty
                          if (listRowsArray.length === 0 || (listRowsArray.length === 1 && !listRowsArray[0])) {
                            const matchingNode = nodes.find(
                              (n: any) =>
                                n.type === "listNode" &&
                                (n.data?.listButtonText === listButtonText ||
                                  n.data?.text === messageBody)
                            );
                            if (matchingNode) {
                              const fallbackSections = matchingNode.data?.listSections || [];
                              const fallbackRows = fallbackSections
                                .flatMap((s: any) => s.rows || [])
                                .map((r: any) => r.title);
                              if (fallbackRows.length > 0) {
                                listRowsArray = fallbackRows;
                              }
                            }
                          }
                        }

                        return (
                          <div
                            key={msg.id}
                            className={`flex w-full group ${isInbound ? "justify-start" : "justify-end"}`}
                          >
                            <div className="relative max-w-[70%]">
                              {/* Hover Quote Trigger (Positioned dynamically next to the bubble) */}
                              <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10 ${isInbound ? "left-full ml-3" : "right-full mr-3"}`}>
                                <button
                                  type="button"
                                  onClick={() => setQuotedMessage(msg)}
                                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 p-2 rounded-full border border-slate-700 shadow-lg transition-all duration-150 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
                                  title="Quote Reply"
                                >
                                  <CornerUpLeft className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Message Bubble */}
                              <div className={`rounded-2xl px-4 py-2.5 shadow-md flex flex-col gap-1 ${
                                isInbound 
                                  ? "bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none" 
                                  : activeConv?.platform === "instagram"
                                    ? "bg-gradient-to-r from-pink-500 to-violet-600 text-white font-medium rounded-tr-none shadow-pink-500/10"
                                    : "bg-emerald-500 text-slate-950 font-medium rounded-tr-none shadow-emerald-500/10"
                              }`}>
                                {msg.senderName && !isInbound && (
                                  <span className={`text-[9px] uppercase tracking-wider font-semibold mb-0.5 ${activeConv?.platform === "instagram" ? "text-pink-100/80" : "text-slate-800/70"}`}>
                                    {msg.senderName}
                                  </span>
                                )}
                                
                                {/* Render Quoted Reply Box inside Bubble */}
                                {hasQuote && (
                                  <div className={`border-l-4 rounded px-2 py-1 mb-1.5 text-[10px] leading-snug truncate ${
                                    isInbound 
                                      ? "bg-slate-900/40 border-slate-500 text-slate-400" 
                                      : activeConv?.platform === "instagram"
                                        ? "bg-violet-950/40 border-violet-400 text-violet-200"
                                        : "bg-emerald-600/30 border-emerald-950 text-slate-900"
                                  }`}>
                                    {quoteText}
                                  </div>
                                )}

                                {/* Render media content or plain text */}
                                {["image", "document", "video", "audio", "voice"].includes(msg.messageType) && !hasButtons ? (() => {
                                  // Parse structured media content
                                  let mediaUrl = msg.content;
                                  let displayFilename = "document.pdf";
                                  let captionText = "";

                                  if (msg.messageType === "document") {
                                    const parts = msg.content.split("|");
                                    displayFilename = parts[0] || "document.pdf";
                                    mediaUrl = parts[1] || "";
                                    const capPart = parts.find(p => p.startsWith("caption:"));
                                    if (capPart) {
                                      captionText = capPart.substring(8);
                                    }
                                  } else {
                                    const parts = msg.content.split("|");
                                    mediaUrl = parts[0] || "";
                                    const capPart = parts.find(p => p.startsWith("caption:"));
                                    if (capPart) {
                                      captionText = capPart.substring(8);
                                    }
                                  }

                                  return (
                                    <div className="flex flex-col gap-2">
                                      {msg.messageType === "image" ? (
                                        <div className="rounded-lg overflow-hidden border border-slate-700/50 bg-slate-950/20 max-w-[240px]">
                                          <img 
                                            src={getMediaUrl(mediaUrl)} 
                                            alt="Sent Media" 
                                            className="object-cover w-full h-32 hover:scale-105 transition-all duration-300 cursor-zoom-in"
                                            onClick={() => window.open(getMediaUrl(mediaUrl), "_blank")}
                                          />
                                        </div>
                                      ) : msg.messageType === "video" ? (
                                        <div className="rounded-lg overflow-hidden border border-slate-700/50 bg-slate-950/20 max-w-[240px]">
                                          <video 
                                            src={getMediaUrl(mediaUrl)} 
                                            controls 
                                            className="object-cover w-full h-36"
                                          />
                                        </div>
                                      ) : (msg.messageType === "audio" || msg.messageType === "voice") ? (
                                        <div className="max-w-[240px] py-1">
                                          <audio 
                                            src={getMediaUrl(mediaUrl)} 
                                            controls 
                                            className="w-full h-10"
                                          />
                                        </div>
                                      ) : (
                                        <a 
                                          href={getMediaUrl(mediaUrl)} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="flex items-center gap-2 bg-slate-950/15 p-2 rounded-lg border border-slate-800/10 hover:bg-slate-950/25 transition-colors"
                                        >
                                          <FileText className="h-8 w-8 stroke-1" />
                                          <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-semibold truncate max-w-[150px]">
                                              {displayFilename}
                                            </span>
                                            <span className="text-[10px] text-slate-500">Document File</span>
                                          </div>
                                        </a>
                                      )}
                                      {captionText && (
                                        <p className={`text-xs mt-1 leading-relaxed whitespace-pre-wrap ${isInbound ? "text-slate-300" : "text-slate-800"}`}>{captionText}</p>
                                      )}
                                    </div>
                                  );
                                })() : (
                                  <div className="flex flex-col gap-2">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{messageBody}</p>
                                    
                                    {/* Render Clickable WhatsApp-styled buttons in chat logs */}
                                    {hasButtons && (
                                      <div className="flex flex-col gap-1.5 mt-2 border-t border-slate-950/10 pt-2 w-full min-w-[200px]">
                                        {buttonsArray.map((btnTitle, index) => {
                                          const isIg = activeConv?.platform === "instagram";
                                          const btnTextColor = isIg ? "text-pink-600 hover:text-pink-500" : "text-emerald-600 hover:text-emerald-500";
                                          const btnIconColor = isIg ? "text-pink-500" : "text-emerald-500";
                                          return (
                                            <div
                                              key={index}
                                              className="w-full bg-white text-slate-700 border border-slate-200/80 shadow-sm text-xs font-bold py-2.5 px-4 rounded-xl text-center flex items-center justify-center gap-1.5 select-none"
                                            >
                                              <Bot className={`h-3 w-3 ${btnIconColor}`} />
                                              {btnTitle}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Render Clickable WhatsApp-styled List Menus in chat logs */}
                                    {hasList && (
                                      <div className="relative flex flex-col gap-1.5 mt-2 border-t border-slate-950/10 pt-2 w-full min-w-[200px]">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveListMenuMsgId(
                                              activeListMenuMsgId === msg.id ? null : msg.id
                                            );
                                          }}
                                          className={`w-full bg-white hover:bg-slate-50 active:bg-slate-100 ${
                                            activeConv?.platform === "instagram" ? "text-pink-600 hover:text-pink-500" : "text-emerald-600 hover:text-emerald-500"
                                          } border border-slate-200 shadow-sm text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-150 text-center hover:shadow flex items-center justify-between gap-1.5 cursor-pointer`}
                                        >
                                          <span className="flex items-center gap-1.5">
                                            <FileText className={`h-3.5 w-3.5 ${
                                              activeConv?.platform === "instagram" ? "text-pink-500" : "text-emerald-500"
                                            }`} />
                                            {listButtonText}
                                          </span>
                                          <span className="text-[10px] text-slate-400 font-normal">Select</span>
                                        </button>

                                        {/* Dropdown popup of options */}
                                        {activeListMenuMsgId === msg.id && (
                                          <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 animate-fadeIn max-h-48 overflow-y-auto scrollbar-thin">
                                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 border-b border-slate-900 mb-1 flex justify-between items-center">
                                              <span>Menu Options</span>
                                              <span className="text-[8px] font-normal lowercase text-slate-400">Click to select</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                              {listRowsArray.map((rowText, index) => (
                                                <div
                                                  key={index}
                                                  className="w-full text-left bg-slate-900/60 text-slate-400 text-xs py-2 px-3 rounded-lg border border-slate-850 flex items-center justify-between select-none"
                                                >
                                                  <span className="truncate pr-2">{rowText}</span>
                                                  <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Ticks status and time */}
                                <div className={`flex items-center gap-1 justify-end self-end text-[9px] mt-1 ${
                                  isInbound 
                                    ? "text-slate-500" 
                                    : activeConv?.platform === "instagram"
                                      ? "text-pink-100/85"
                                      : "text-slate-800/80"
                                }`}>
                                  <span>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {!isInbound && (
                                    <span>
                                      {msg.status === "sent" && <Check className={`h-3 w-3 ${activeConv?.platform === "instagram" ? "text-pink-200" : "text-slate-700"}`} />}
                                      {msg.status === "delivered" && <CheckCheck className={`h-3 w-3 ${activeConv?.platform === "instagram" ? "text-pink-200" : "text-slate-700"}`} />}
                                      {msg.status === "read" && <CheckCheck className={`h-3 w-3 ${activeConv?.platform === "instagram" ? "text-white" : "text-emerald-950"}`} />}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messageEndRef} />
                    </div>

                    {/* Quoted Message Preview Header above input bar */}
                    {quotedMessage && (
                      <div className="bg-slate-950 border-t border-slate-800 p-2.5 flex justify-between items-center text-[11px] text-slate-300 w-full animate-fadeIn shrink-0">
                        <div className="flex flex-col truncate border-l-2 border-emerald-500 pl-2">
                          <span className="font-bold text-emerald-400 text-[9px] uppercase tracking-wider">
                            Quoting {quotedMessage.direction === "inbound" ? "Customer" : "Agent/Bot"}
                          </span>
                          <span className="truncate text-xs text-slate-400 font-sans italic">
                            {quotedMessage.content.split("|")[0]}
                          </span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setQuotedMessage(null)} 
                          className="text-slate-500 hover:text-slate-300 font-bold px-2 text-sm"
                        >
                          ├ù
                        </button>
                      </div>
                    )}

                    {/* Message input bar */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/30 flex items-center gap-3 relative">
                      
                      {/* EMOJI PICKER POPUP */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-16 left-4 bg-slate-950 border border-slate-800 rounded-xl p-3 grid grid-cols-5 gap-2 shadow-2xl z-50">
                          {["≡ƒÿÇ", "≡ƒÿé", "≡ƒÿì", "≡ƒæì", "≡ƒÖÅ", "≡ƒöÑ", "≡ƒÜÇ", "Γ¥ñ∩╕Å", "≡ƒæÅ", "≡ƒÄë"].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setInputText((prev) => prev + emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="text-lg hover:scale-125 transition-transform p-1.5"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* MEDIA/PAPERCLIP POPUP */}
                      {showMediaMenu && (
                        <div className="absolute bottom-16 left-12 bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-2xl z-50 text-[11px] min-w-[170px]">
                          <button
                            type="button"
                            onClick={() => {
                              setShowMediaMenu(false);
                              fileInputRef.current?.click();
                            }}
                            className="px-2.5 py-1.5 text-left rounded hover:bg-slate-900 flex items-center gap-2 text-slate-300 cursor-pointer"
                          >
                            <Paperclip className="h-4 w-4 text-emerald-400" /> Upload & Send File
                          </button>
                          <button
                            type="button"
                            onClick={() => sendMockMediaMessage("image", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600")}
                            className="px-2.5 py-1.5 text-left rounded hover:bg-slate-900 flex items-center gap-2 text-slate-300 border-t border-slate-850 pt-1.5"
                          >
                            <ImageIcon className="h-4 w-4 text-emerald-400/80" /> Mock Case Study (Image)
                          </button>
                          <button
                            type="button"
                            onClick={() => sendMockMediaMessage("document", "Jisnu_Portfolio.pdf|https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")}
                            className="px-2.5 py-1.5 text-left rounded hover:bg-slate-900 flex items-center gap-2 text-slate-300"
                          >
                            <FileText className="h-4 w-4 text-sky-400/80" /> Mock Portfolio (PDF)
                          </button>
                        </div>
                      )}

                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      />

                      <button 
                        type="button" 
                        onClick={() => {
                          setShowEmojiPicker(!showEmojiPicker);
                          setShowMediaMenu(false);
                        }}
                        className={`p-2 rounded-lg transition-colors ${showEmojiPicker ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}
                      >
                        <Smile className="h-5 w-5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowMediaMenu(!showMediaMenu);
                          setShowEmojiPicker(false);
                        }}
                        className={`p-2 rounded-lg transition-colors ${showMediaMenu ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}
                      >
                        <Paperclip className="h-5 w-5" />
                      </button>
                      
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />

                      <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-md shadow-emerald-500/15 disabled:opacity-40 disabled:hover:bg-emerald-500"
                      >
                        <Send className="h-4.5 w-4.5 fill-slate-950" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/50">
                    <div className="max-w-md flex flex-col items-center gap-4">
                      <div className={`h-20 w-20 rounded-full flex items-center justify-center shadow-xl border ${isInstagramTab ? "bg-pink-500/10 text-pink-400 border-pink-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                        {isInstagramTab ? (
                          <Instagram className="h-10 w-10 stroke-1" />
                        ) : (
                          <Bot className="h-10 w-10 stroke-1" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-100">{isInstagramTab ? "Instagram" : "WhatsApp"} Sales & Support CRM</h3>
                      <p className="text-sm text-slate-400">
                        Select an active conversation from the sidebar inbox to view the chat, monitor live bot flows, or reply manually to leads.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 2: VISUAL FLOW BUILDER */}
        {activeTab === "flows" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header toolbar */}
            <div className="h-14 border-b border-slate-800 bg-slate-950/20 px-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <input 
                  type="text" 
                  value={flowName} 
                  onChange={(e) => setFlowName(e.target.value)}
                  className="bg-transparent font-bold text-sm text-slate-200 border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none py-1"
                />
                
                <div className="h-6 w-px bg-slate-800 mx-2" />
                
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as "whatsapp" | "instagram")}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="whatsapp">WhatsApp Flow</option>
                  <option value="instagram">Instagram Flow</option>
                </select>
              </div>

              {/* Node tools */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 mr-2">Add Message Blocks:</span>
                <button 
                  onClick={() => addFlowNode("textNode")}
                  className="bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-750 flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Text Msg
                </button>
                <button 
                  onClick={() => addFlowNode("buttonsNode")}
                  className="bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-750 flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Buttons Options
                </button>
                <button 
                  onClick={() => addFlowNode("listNode")}
                  className="bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-750 flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> List Menu
                </button>
                 <button 
                  onClick={() => addFlowNode("questionNode")}
                  className="bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-750 flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Input Question
                </button>
                <button 
                  onClick={() => addFlowNode("mediaNode")}
                  className="bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-750 flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Media Msg
                </button>

                <div className="h-6 w-px bg-slate-800 mx-2" />

                <button
                  onClick={saveFlow}
                  disabled={flowSaveStatus === "saving"}
                  className="bg-primary hover:bg-secondary disabled:opacity-50 text-slate-950 font-semibold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" /> 
                  {flowSaveStatus === "saving" ? "Saving..." : flowSaveStatus === "success" ? "Saved!" : "Save Flow"}
                </button>
              </div>
            </div>

            {/* Canvas workspace using React Flow & Selected Node Panel */}
            <div className="flex-1 w-full bg-slate-950 relative flex">
              <div className="flex-1 h-full">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  fitView
                >
                  <Controls className="bg-slate-900 border border-slate-800 text-slate-200" />
                  <MiniMap className="bg-slate-900 border border-slate-850" nodeColor={() => '#10b981'} maskColor="rgba(15, 23, 42, 0.6)" />
                  <Background color="#334155" gap={16} />
                </ReactFlow>
              </div>

              {/* Node properties editor panel (Right Sidebar) */}
              {selectedNode && (
                <div className="w-80 border-l border-slate-800 bg-slate-950/60 p-5 overflow-y-auto flex flex-col gap-4 text-xs shrink-0 z-20">
                  <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <Bot className="h-4 w-4 text-emerald-400" /> Node Properties
                  </h3>
                  
                  {/* Common Name/Label */}
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-semibold">Label / Name</label>
                    <input 
                      type="text" 
                      value={selectedNode.data.label || ""}
                      onChange={(e) => updateSelectedNode({ label: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Common Message Text */}
                  {selectedNode.type !== "mediaNode" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 font-semibold">Message Text</label>
                      <textarea 
                        value={selectedNode.data.text || ""}
                        onChange={(e) => updateSelectedNode({ text: e.target.value })}
                        rows={4}
                        className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                        placeholder="Type WhatsApp reply content..."
                      />
                    </div>
                  )}

                  {/* If node is a media node, edit media properties */}
                  {selectedNode.type === "mediaNode" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-semibold">Media Type</label>
                        <select
                          value={selectedNode.data.mediaType || "image"}
                          onChange={(e) => updateSelectedNode({ mediaType: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                          <option value="audio">Audio</option>
                          <option value="document">Document</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-slate-400 font-semibold">Media URL / Path</label>
                          <label className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer">
                            Upload File
                            <input 
                              type="file" 
                              onChange={handleFlowMediaUpload}
                              className="hidden" 
                            />
                          </label>
                        </div>
                        <input 
                          type="text" 
                          value={selectedNode.data.mediaUrl || ""}
                          onChange={(e) => updateSelectedNode({ mediaUrl: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                          placeholder="e.g. /uploads/image.png or http://..."
                        />
                      </div>

                      {selectedNode.data.mediaType === "document" && (
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-400 font-semibold">Display Filename</label>
                          <input 
                            type="text" 
                            value={selectedNode.data.filename || ""}
                            onChange={(e) => updateSelectedNode({ filename: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                            placeholder="e.g. brochure.pdf"
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-semibold">Caption Text (Optional)</label>
                        <textarea 
                          value={selectedNode.data.caption || ""}
                          onChange={(e) => updateSelectedNode({ caption: e.target.value })}
                          rows={3}
                          className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                          placeholder="Media caption text..."
                        />
                      </div>
                    </div>
                  )}

                  {/* If node is a question, collect variables */}
                  {selectedNode.type === "questionNode" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 font-semibold">Save Response to Variable</label>
                      <input 
                        type="text" 
                        value={selectedNode.data.variableName || ""}
                        onChange={(e) => updateSelectedNode({ variableName: e.target.value })}
                        className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                        placeholder="e.g. client_email"
                      />
                    </div>
                  )}

                  {/* If list node, manage list menu properties */}
                  {selectedNode.type === "listNode" && (() => {
                    const sections = selectedNode.data.listSections || [];
                    const rows = sections.flatMap((sec: any) => sec.rows || []) || [];
                    const limit = selectedPlatform === "whatsapp" ? 10 : 13;

                    return (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-400 font-semibold">Menu Button Text</label>
                          <input 
                            type="text" 
                            value={selectedNode.data.listButtonText || ""}
                            onChange={(e) => updateSelectedNode({ listButtonText: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                            placeholder="e.g. View Menu"
                          />
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <label className="text-slate-400 font-semibold">Menu Options (Max {limit} Items)</label>
                          {rows.length < limit && (
                            <button 
                              type="button"
                              onClick={addListOptionRow}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold"
                            >
                              + Add Option
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          {rows.map((row: any, index: number) => (
                            <div key={row.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1.5 relative">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-500 font-semibold">Option {index + 1}</span>
                                <button 
                                  type="button"
                                  onClick={() => removeListOptionRow(row.id)}
                                  className="text-red-400 hover:text-red-300 font-bold text-xs"
                                >
                                  ├ù
                                </button>
                              </div>
                              <div className="flex flex-col gap-1">
                                <input 
                                  type="text" 
                                  value={row.title}
                                  onChange={(e) => updateListOptionRow(row.id, e.target.value, row.description)}
                                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[11px] focus:outline-none focus:border-emerald-500"
                                  placeholder="Option Title"
                                  maxLength={50}
                                />
                                <input 
                                  type="text" 
                                  value={row.description || ""}
                                  onChange={(e) => updateListOptionRow(row.id, row.title, e.target.value)}
                                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-450 text-[10px] focus:outline-none focus:border-emerald-500"
                                  placeholder="Optional description (WhatsApp only)"
                                  maxLength={72}
                                />
                              </div>
                            </div>
                          ))}
                          {rows.length === 0 && (
                            <span className="text-[10px] text-slate-500 italic block text-center mt-1">No options added yet. Click Add Option.</span>
                          )}
                        </div>
                        
                        {/* Warning banner for Instagram fallback */}
                        <div className="bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 p-2.5 rounded-lg leading-relaxed mt-2">
                          <strong>Note:</strong> Instagram does not support native List menus; they will fallback to Quick Reply buttons.
                        </div>
                      </div>
                    );
                  })()}

                  {/* If buttons node, manage button options */}
                  {selectedNode.type === "buttonsNode" && (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-400 font-semibold">Options (Max {selectedPlatform === "whatsapp" ? 3 : 13} Buttons)</label>
                        {(!selectedNode.data.buttons || selectedNode.data.buttons.length < (selectedPlatform === "whatsapp" ? 3 : 13)) && (
                          <button 
                            type="button"
                            onClick={addOptionButton}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold"
                          >
                            + Add Button
                          </button>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {selectedNode.data.buttons?.map((btn: any, index: number) => (
                          <div key={btn.id} className="flex gap-1.5 items-center">
                            <input 
                              type="text" 
                              value={btn.title}
                              onChange={(e) => updateOptionButton(btn.id, e.target.value)}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[11px] focus:outline-none focus:border-emerald-500"
                              placeholder={`Button ${index + 1}`}
                            />
                            <button 
                              type="button"
                              onClick={() => removeOptionButton(btn.id)}
                              className="text-red-400 hover:text-red-300 px-1 font-bold text-xs"
                            >
                              ├ù
                            </button>
                          </div>
                        ))}
                        {(!selectedNode.data.buttons || selectedNode.data.buttons.length === 0) && (
                          <span className="text-[10px] text-slate-500 italic">No buttons added yet. Click Add Button.</span>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Delete Node Action */}
                  <div className="border-t border-slate-800 pt-4 mt-2">
                    <button
                      type="button"
                      onClick={deleteSelectedNode}
                      className="w-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-slate-950 font-bold py-2 rounded-lg transition-all text-[11px]"
                    >
                      Delete Block
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS & ONBOARDING */}
        {activeTab === "settings" && (
          <div className="flex-1 overflow-y-auto p-8 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Settings className="h-6 w-6 text-emerald-600" /> Settings & Integrations
              </h2>
              
              {/* Secondary sub-tabs selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs gap-1">
                <button
                  type="button"
                  onClick={() => setSettingsSubTab("whatsapp")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${settingsSubTab === "whatsapp" ? "bg-white text-emerald-800 shadow-2xs font-bold border border-slate-200" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <WhatsApp className="h-3.5 w-3.5" /> WhatsApp Setup
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab("instagram")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${settingsSubTab === "instagram" ? "bg-white text-pink-700 shadow-2xs font-bold border border-slate-200" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <Instagram className="h-3.5 w-3.5" /> Instagram Setup
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab("google")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${settingsSubTab === "google" ? "bg-white text-brand-blue shadow-2xs font-bold border border-slate-200" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <Star className="h-3.5 w-3.5 text-amber-500" /> Google Setup
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab("youtube")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${settingsSubTab === "youtube" ? "bg-white text-red-600 shadow-2xs font-bold border border-slate-200" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <Video className="h-3.5 w-3.5" /> YouTube Setup
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab("api-keys")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${settingsSubTab === "api-keys" ? "bg-white text-amber-700 shadow-2xs font-bold border border-slate-200" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <Key className="h-3.5 w-3.5 text-amber-600" /> API Keys & Developer
                </button>
              </div>
            </div>

            {settingsSubTab === "api-keys" ? (
              <div className="w-full space-y-8 animate-fadeIn pb-12">
                {/* DEVELOPER DASHBOARD HEADER BANNER */}
                <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 border border-blue-200/80 rounded-3xl p-8 shadow-2xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                      <Code className="h-7 w-7 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">API Keys & Developer Portal</h3>
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
                          PRODUCTION v1.0
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-600 max-w-3xl leading-relaxed">
                        Generate secure API keys, manage fine-grained permissions, explore interactive multi-language code reference, and audit real-time request telemetry logs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDevPortalTab("docs")}
                      className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all border border-slate-200 cursor-pointer shadow-2xs"
                    >
                      <FileText className="h-4 w-4 text-blue-600" /> View API Docs
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setWizardStep(1);
                        setNewKeyName("");
                        setNewKeyDesc("");
                        setNewKeyEnv("LIVE");
                        setSelectedScopes(["whatsapp_send", "whatsapp_templates", "whatsapp_read"]);
                        setShowCreateKeyModal(true);
                      }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Generate New API Key
                    </button>
                  </div>
                </div>

                {/* OVERVIEW STATS METRIC CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between gap-3 shadow-2xs hover:border-slate-300 transition-all">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Credentials</span>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black text-slate-900 font-mono">{apiKeys.length}</span>
                      <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                        <Key className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between gap-3 shadow-2xs hover:border-slate-300 transition-all">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Keys</span>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black text-emerald-600 font-mono">
                        {apiKeys.filter(k => k.status === "ACTIVE").length}
                      </span>
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between gap-3 shadow-2xs hover:border-slate-300 transition-all">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Telemetry Requests</span>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black text-blue-600 font-mono">{telemetryLogs.length}</span>
                      <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between gap-3 shadow-2xs hover:border-slate-300 transition-all">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Live Success Rate</span>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black text-emerald-600 font-mono">
                        {telemetryLogs.length > 0
                          ? `${Math.round((telemetryLogs.filter(l => l.statusCode >= 200 && l.statusCode < 400).length / telemetryLogs.length) * 100)}%`
                          : "100%"}
                      </span>
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <Check className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUB-NAVIGATION TABS BAR */}
                <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                  <button
                    type="button"
                    onClick={() => setDevPortalTab("keys")}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                      devPortalTab === "keys"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Key className="h-4 w-4" /> API Keys ({apiKeys.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setDevPortalTab("quickstart")}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                      devPortalTab === "quickstart"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Terminal className="h-4 w-4" /> Quick Start Guide
                  </button>

                  <button
                    type="button"
                    onClick={() => setDevPortalTab("docs")}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                      devPortalTab === "docs"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <FileText className="h-4 w-4" /> API Reference
                  </button>

                  <button
                    type="button"
                    onClick={() => setDevPortalTab("logs")}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                      devPortalTab === "logs"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Activity className="h-4 w-4" /> API Logs & Telemetry
                  </button>
                </div>

                {/* TAB 1: API KEYS LIST (FULL SCREEN WIDTH) */}
                {devPortalTab === "keys" && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* INTERACTIVE TEST API KEY CARD */}
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xs animate-fadeIn">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                            <Activity className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                              Test Your API Key Health & Permissions
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Verify key validity, active status, granted permissions, and environment before production integration.
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold">
                          GET /api/v1/auth/test
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={testApiKeyInput}
                            onChange={(e) => setTestApiKeyInput(e.target.value)}
                            placeholder="Paste your API key here (e.g., ak_live_... or ak_test_...)"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTestApiKey()}
                          disabled={testingApiKey || !testApiKeyInput.trim()}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20 shrink-0"
                        >
                          <RefreshCw className={`h-4 w-4 ${testingApiKey ? "animate-spin" : ""}`} />
                          {testingApiKey ? "Verifying Key..." : "Run Health Test"}
                        </button>
                      </div>

                      {/* REAL-TIME TEST RESULT DISPLAY BOX */}
                      {testResult && (
                        <div className={`p-5 rounded-2xl border space-y-4 animate-fadeIn ${
                          testResult.success 
                            ? "bg-emerald-50/80 border-emerald-200 text-emerald-950" 
                            : "bg-rose-50/80 border-rose-200 text-rose-950"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-xs">
                              {testResult.success ? (
                                <>
                                  <Check className="h-4.5 w-4.5 text-emerald-600" />
                                  <span className="text-emerald-800">200 OK — API Key is Valid & Active!</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-rose-700 font-extrabold">HTTP {testResult.statusCode || 401} Error</span>
                                  <span>— Authentication Failed</span>
                                </>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>

                          {testResult.success && testResult.data ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-xs">
                              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                                <span className="text-[10px] text-slate-500 block uppercase font-bold">Key Name</span>
                                <span className="font-bold text-slate-900 block truncate">{testResult.data.key_name}</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                                <span className="text-[10px] text-slate-500 block uppercase font-bold">Environment</span>
                                <span className={`font-bold block ${testResult.data.environment === "TEST" ? "text-amber-700" : "text-emerald-700"}`}>
                                  {testResult.data.environment === "TEST" ? "🟡 TEST" : "🟢 LIVE"}
                                </span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                                <span className="text-[10px] text-slate-500 block uppercase font-bold">Account / Org</span>
                                <span className="font-bold text-slate-900 block truncate">{testResult.data.account_name}</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                                <span className="text-[10px] text-slate-500 block uppercase font-bold">Last Used</span>
                                <span className="font-mono text-slate-700 text-[11px] block">{new Date(testResult.data.last_used_at).toLocaleTimeString()}</span>
                              </div>
                              <div className="sm:col-span-2 md:col-span-4 bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                                <span className="text-[10px] text-slate-500 block uppercase font-bold">Granted Permission Scopes</span>
                                <div className="flex flex-wrap gap-2">
                                  {Array.isArray(testResult.data.permissions) && testResult.data.permissions.map((p: string) => (
                                    <span key={p} className="px-3 py-1 rounded-lg text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white p-4 rounded-xl border border-rose-200 space-y-1 shadow-2xs">
                              <span className="text-[10px] text-rose-700 block uppercase font-bold">Failure Cause</span>
                              <p className="text-xs text-rose-800 leading-relaxed font-mono">
                                {testResult.message || testResult.error || "Invalid, missing, or revoked API key."}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* SEARCH BAR & ENVIRONMENT FILTERS */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                      <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search API keys by name, description, or prefix..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                        />
                      </div>

                      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setEnvFilter("ALL")}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                            envFilter === "ALL" ? "bg-white text-slate-900 shadow-2xs font-bold border border-slate-200" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          All Credentials ({apiKeys.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setEnvFilter("LIVE")}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 ${
                            envFilter === "LIVE" ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          🟢 Live ({apiKeys.filter(k => (k.environment || "LIVE").toUpperCase() === "LIVE").length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setEnvFilter("TEST")}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 ${
                            envFilter === "TEST" ? "bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          🟡 Test ({apiKeys.filter(k => (k.environment || "LIVE").toUpperCase() === "TEST").length})
                        </button>
                      </div>
                    </div>

                    {/* TABLE CONTAINER */}
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Key className="h-4.5 w-4.5 text-blue-600" /> Active System Credentials ({filteredApiKeys.length})
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Keys generated for website integration, CRM webhooks, or automated messaging APIs.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={fetchApiKeys}
                          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${loadingApiKeys ? "animate-spin text-blue-600" : ""}`} /> Refresh Table
                        </button>
                      </div>

                      {loadingApiKeys ? (
                        <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" /> Loading API Keys...
                        </div>
                      ) : filteredApiKeys.length === 0 ? (
                        <div className="py-20 text-center border border-dashed border-slate-200 rounded-3xl space-y-4 bg-slate-50/50 p-8">
                          <Key className="h-12 w-12 text-slate-400 mx-auto" />
                          <div className="space-y-1.5">
                            <p className="text-base font-bold text-slate-900">No API keys match your filter</p>
                            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                              {searchQuery || envFilter !== "ALL"
                                ? "Try clearing your search term or environment filter to view all keys."
                                : "Generate your first secret key to authorize external forms, websites, or integrations."}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setWizardStep(1);
                              setShowCreateKeyModal(true);
                            }}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-md shadow-blue-600/20"
                          >
                            <Plus className="h-4 w-4" /> Generate First API Key
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                                <th className="py-4 px-5 font-bold">Key Name & Environment</th>
                                <th className="py-4 px-5 font-bold">Masked API Key Prefix</th>
                                <th className="py-4 px-5 font-bold">Granted Permission Scopes</th>
                                <th className="py-4 px-5 font-bold">Status</th>
                                <th className="py-4 px-5 font-bold">Created Date</th>
                                <th className="py-4 px-5 font-bold">Last Activity</th>
                                <th className="py-4 px-5 font-bold text-right">Manage</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-sans">
                              {filteredApiKeys.map((k) => (
                                <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-4 px-5">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2.5">
                                        <span className="font-bold text-slate-900 text-xs md:text-sm">{k.name}</span>
                                        {(k.environment || "LIVE").toUpperCase() === "TEST" ? (
                                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                                            🟡 TEST
                                          </span>
                                        ) : (
                                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            🟢 LIVE
                                          </span>
                                        )}
                                      </div>
                                      {k.description && (
                                        <span className="text-[11px] text-slate-500 line-clamp-1">{k.description}</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-4 px-5 font-mono text-slate-600">
                                    <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                                      <span className="text-slate-800 font-mono font-semibold">{k.keyPrefix}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-5">
                                    <div className="flex flex-wrap gap-1.5 max-w-sm">
                                      {Array.isArray(k.permissions) && k.permissions.includes("full_access") ? (
                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                                          ⭐ FULL SYSTEM ACCESS
                                        </span>
                                      ) : (
                                        (k.permissions || []).map((perm: string) => {
                                          let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
                                          if (perm.startsWith("whatsapp_")) badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
                                          else if (perm.startsWith("instagram_")) badgeStyle = "bg-pink-50 text-pink-700 border-pink-200";
                                          else if (perm.startsWith("meta_ads_")) badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
                                          else if (perm.startsWith("contacts_") || perm.startsWith("campaigns_")) badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";

                                          return (
                                            <span key={perm} className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono border ${badgeStyle}`}>
                                              {perm}
                                            </span>
                                          );
                                        })
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-4 px-5">
                                    {k.status === "ACTIVE" ? (
                                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                                        ACTIVE
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                                        REVOKED
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-4 px-5 text-slate-500">
                                    {new Date(k.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </td>
                                  <td className="py-4 px-5 text-slate-500">
                                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "Never used"}
                                  </td>
                                  <td className="py-4 px-5 text-right space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTestApiKeyInput(k.keyPrefix);
                                        handleTestApiKey(k.keyPrefix);
                                      }}
                                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                    >
                                      <Activity className="h-3.5 w-3.5" /> Test
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingKeyModal(k);
                                        setEditKeyName(k.name);
                                        setEditKeyDesc(k.description || "");
                                        setEditKeyEnv((k.environment || "LIVE").toUpperCase() === "TEST" ? "TEST" : "LIVE");
                                        setEditKeyScopes(k.permissions || ["full_access"]);
                                      }}
                                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
                                    >
                                      Edit
                                    </button>
                                    {k.status === "ACTIVE" && (
                                      <button
                                        type="button"
                                        onClick={() => setRevokeConfirmKey(k)}
                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
                                      >
                                        Revoke
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteApiKey(k.id)}
                                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: QUICK START SETUP GUIDE */}
                {devPortalTab === "quickstart" && (
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-8 space-y-8 animate-fadeIn shadow-2xs">
                    <div className="border-b border-slate-100 pb-5">
                      <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2.5 uppercase tracking-wider">
                        <Terminal className="h-5 w-5 text-blue-600" /> Developer Quick Start Integration Guide
                      </h4>
                      <p className="text-xs md:text-sm text-slate-500 mt-1.5 leading-relaxed">
                        Follow these 4 straightforward steps to connect CRM messaging APIs directly into your website checkout forms, lead capture tools, or custom mobile application.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md">1</span>
                          <h5 className="font-bold text-sm text-slate-900">Generate an API Key</h5>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Click <strong className="text-slate-900">Generate New API Key</strong>, select your target environment (<span className="text-emerald-700 font-semibold">Live</span> or <span className="text-amber-700 font-semibold">Test</span>), and pick appropriate permission scopes.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setWizardStep(1);
                            setShowCreateKeyModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-md shadow-blue-600/20"
                        >
                          <Plus className="h-4 w-4" /> Start Wizard
                        </button>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md">2</span>
                          <h5 className="font-bold text-sm text-slate-900">Store Secret Key Securely</h5>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Save your generated key inside your backend environment configuration (<code className="text-blue-700 bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">.env</code>). Never commit API keys into frontend code.
                        </p>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-blue-300">
                          CRM_API_KEY=ak_live_8f3a8b29...
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md">3</span>
                          <h5 className="font-bold text-sm text-slate-900">Include Header on HTTP Requests</h5>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Pass your key as the <code className="text-blue-700 bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">x-api-key</code> HTTP header on every call for authorization.
                        </p>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400">
                          -H &quot;x-api-key: ak_live_8f3a...&quot;
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md">4</span>
                          <h5 className="font-bold text-sm text-slate-900">Test Template Messaging Dispatch</h5>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Call <code className="text-blue-700 bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">/api/v1/whatsapp/send-template</code> to trigger automated customer notifications.
                        </p>
                        <button
                          type="button"
                          onClick={() => setDevPortalTab("docs")}
                          className="px-4 py-2 bg-white hover:bg-slate-100 text-blue-700 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 border border-slate-200 shadow-2xs"
                        >
                          Explore Code Reference →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: INTERACTIVE DOCUMENTATION & REFERENCE (FULL SCREEN) */}
                {devPortalTab === "docs" && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-fadeIn">
                    {/* Sidebar Endpoints List */}
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-3 shadow-2xs">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block px-2 pb-1">
                        API Endpoints Reference
                      </span>

                      <button
                        type="button"
                        onClick={() => setActiveDocEndpoint("auth_test")}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-3 ${
                          activeDocEndpoint === "auth_test"
                            ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px] font-bold">GET</span>
                        <span className="truncate">Ping & Key Health Test</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveDocEndpoint("whatsapp_template")}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-3 ${
                          activeDocEndpoint === "whatsapp_template"
                            ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px] font-bold">POST</span>
                        <span className="truncate">WhatsApp Template</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveDocEndpoint("whatsapp_message")}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-3 ${
                          activeDocEndpoint === "whatsapp_message"
                            ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px] font-bold">POST</span>
                        <span className="truncate">WhatsApp Text</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveDocEndpoint("instagram_dm")}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-3 ${
                          activeDocEndpoint === "instagram_dm"
                            ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <span className="px-2 py-0.5 bg-pink-100 text-pink-800 rounded font-mono text-[10px] font-bold">POST</span>
                        <span className="truncate">Instagram DM</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveDocEndpoint("contacts")}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-3 ${
                          activeDocEndpoint === "contacts"
                            ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[10px] font-bold">GET</span>
                        <span className="truncate">Contacts API</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveDocEndpoint("campaigns")}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-3 ${
                          activeDocEndpoint === "campaigns"
                            ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-mono text-[10px] font-bold">POST</span>
                        <span className="truncate">Create Campaign</span>
                      </button>
                    </div>

                    {/* Interactive Documentation Content Area (Wide 3-col) */}
                    <div className="md:col-span-3 bg-white border border-slate-200/90 rounded-3xl p-8 space-y-6 shadow-2xs">
                      {/* Language Switcher Bar */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2.5">
                          <Code className="h-5 w-5 text-blue-600" />
                          {activeDocEndpoint === "auth_test" && "Ping & Key Health Verification (/v1/auth/test)"}
                          {activeDocEndpoint === "whatsapp_template" && "Send WhatsApp Template Message"}
                          {activeDocEndpoint === "whatsapp_message" && "Send WhatsApp Direct Text"}
                          {activeDocEndpoint === "instagram_dm" && "Send Instagram Direct Message"}
                          {activeDocEndpoint === "contacts" && "List & Fetch CRM Contacts"}
                          {activeDocEndpoint === "campaigns" && "Create Drip Automation Sequence"}
                        </h4>

                        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-1.5">
                          {(["curl", "node", "php", "python"] as const).map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => setDocLanguage(lang)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer uppercase transition-all ${
                                docLanguage === lang
                                  ? "bg-white text-blue-700 shadow-2xs font-bold border border-slate-200"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Code Block Snippet */}
                      <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850 space-y-3 font-mono text-xs shadow-inner">
                        <div className="flex items-center justify-between border-b border-slate-850 pb-2 text-slate-400">
                          <span>Request Snippet ({docLanguage})</span>
                          <button
                            type="button"
                            onClick={() => {
                              const snippet = getCodeSnippet(activeDocEndpoint, docLanguage);
                              navigator.clipboard.writeText(snippet);
                              showToast("Code snippet copied to clipboard!");
                            }}
                            className="text-[11px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                          >
                            Copy Snippet
                          </button>
                        </div>
                        <pre className="text-blue-200 overflow-x-auto leading-relaxed whitespace-pre font-mono p-1">
                          <code>{getCodeSnippet(activeDocEndpoint, docLanguage)}</code>
                        </pre>
                      </div>

                      {/* Responses Section */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                            200 OK Response
                          </span>
                          <pre className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
{activeDocEndpoint === "auth_test" ? `{
  "success": true,
  "status": "active",
  "name": "Live Server API Key",
  "environment": "LIVE",
  "permissions": ["whatsapp_send", "whatsapp_templates"]
}` : `{
  "success": true,
  "messageId": "msg_9a2b8c...",
  "status": "queued",
  "recipient": "919325174465"
}`}
                          </pre>
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                            401 / 403 Error Response
                          </span>
                          <pre className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-rose-300 overflow-x-auto leading-relaxed">
{activeDocEndpoint === "auth_test" ? `{
  "error": "Unauthorized",
  "message": "This API key has been revoked and can no longer be used."
}` : `{
  "error": "Forbidden: Permission Denied",
  "details": "API Key is missing scope: whatsapp_send"
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: API CALL LOGS & USAGE ANALYTICS */}
                {devPortalTab === "logs" && (
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-8 space-y-6 animate-fadeIn shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2.5">
                          <Activity className="h-5 w-5 text-blue-600" /> Live Client API Call Telemetry Logs
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Real-time audit stream of client API calls, HTTP status codes, latency metrics, and API key prefixes.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={fetchTelemetryLogs}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs text-slate-700 flex items-center gap-2 cursor-pointer transition-all font-sans font-semibold"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${loadingTelemetry ? "animate-spin" : ""}`} /> Refresh Stream
                      </button>
                    </div>

                    {loadingTelemetry && telemetryLogs.length === 0 ? (
                      <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-blue-600" /> Loading Telemetry Logs...
                      </div>
                    ) : telemetryLogs.length === 0 ? (
                      <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs space-y-2">
                        <p className="font-bold text-slate-800">No API telemetry logs recorded yet</p>
                        <p className="text-slate-500">Make an API request using any client API key to view real-time HTTP metrics.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                              <th className="py-4 px-5 font-bold">Method</th>
                              <th className="py-4 px-5 font-bold">Endpoint Path</th>
                              <th className="py-4 px-5 font-bold">Key Prefix</th>
                              <th className="py-4 px-5 font-bold">Status</th>
                              <th className="py-4 px-5 font-bold">Latency</th>
                              <th className="py-4 px-5 font-bold">Client IP / Origin</th>
                              <th className="py-4 px-5 font-bold text-right">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {telemetryLogs.map((log) => {
                              const isSuccess = log.statusCode >= 200 && log.statusCode < 300;
                              return (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-4 px-5">
                                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                      log.method === "POST"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                    }`}>
                                      {log.method}
                                    </span>
                                  </td>
                                  <td className="py-4 px-5 text-slate-900 font-semibold">{log.path}</td>
                                  <td className="py-4 px-5 text-slate-500 font-mono">{log.keyPrefix}</td>
                                  <td className="py-4 px-5">
                                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                      isSuccess
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-rose-50 text-rose-700 border-rose-200"
                                    }`}>
                                      {log.statusCode} {isSuccess ? "OK" : "Error"}
                                    </span>
                                  </td>
                                  <td className="py-4 px-5 text-slate-500">{log.latencyMs} ms</td>
                                  <td className="py-4 px-5 text-slate-500">{log.ip}</td>
                                  <td className="py-4 px-5 text-right text-slate-400">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  {settingsSubTab === "whatsapp" ? (
                    <>
                      {/* Meta Official Embedded Signup */}
                      <div className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 border border-emerald-200 rounded-2xl p-6 space-y-4 shadow-2xs relative overflow-hidden animate-fadeIn">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                              <WhatsApp className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-base text-slate-900">Meta WhatsApp Embedded Signup</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  OFFICIAL TECH PROVIDER
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Connect your existing company WhatsApp number or create a new WABA instantly with Meta login.
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <button
                              type="button"
                              onClick={launchWhatsAppSignup}
                              disabled={embeddedConnecting}
                              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                            >
                              <WhatsApp className="h-4 w-4" />
                              <span>{embeddedConnecting ? "Connecting via Meta..." : config.wabaId ? "Reconnect WhatsApp Account" : "Connect with WhatsApp"}</span>
                            </button>

                            {(config.wabaId || config.phoneNumberId) && (
                              <button
                                type="button"
                                onClick={handleDisconnectWhatsApp}
                                disabled={embeddedConnecting}
                                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                              >
                                Disconnect
                              </button>
                            )}
                          </div>
                        </div>

                        {(config.wabaId || config.phoneNumberId) && (
                          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold">
                              <Check className="h-4.5 w-4.5" />
                              <span>Status: Connected to Meta Cloud API</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700 font-mono text-[11px]">
                              <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">WABA ID: <strong className="text-slate-900">{config.wabaId || "Connected"}</strong></span>
                              <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">Phone ID: <strong className="text-slate-900">{config.phoneNumberId || "Connected"}</strong></span>
                            </div>
                          </div>
                        )}

                        {/* Linked WhatsApp Numbers List */}
                        <div className="mt-5 pt-5 border-t border-emerald-200/90 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Phone className="w-4 h-4 text-emerald-600" /> Linked Phone Numbers & WABA IDs ({waAccounts.length})
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Switch active default number or connect additional numbers to your organization.</p>
                            </div>
                            <button
                              type="button"
                              onClick={launchWhatsAppSignup}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                              Link Additional Number
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {waAccounts.length === 0 ? (
                              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                                No numbers linked yet. Click <strong>"Link Additional Number"</strong> to add your first Meta Cloud API number.
                              </div>
                            ) : (
                              waAccounts.map((acc) => (
                                <div key={acc.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-slate-50/50 border border-slate-200/90 rounded-2xl text-xs shadow-2xs hover:border-emerald-300 transition-all">
                                  <div className="flex items-center gap-3.5">
                                    <div className="relative p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80">
                                      <Phone className="w-5 h-5" />
                                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                        <span>{acc.phoneNumber || acc.accountName || `Phone ID: ${acc.phoneNumberId}`}</span>
                                        {acc.isDefault && (
                                          <span className="px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 rounded-full border border-emerald-200/80">
                                            Active Default Number
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                                        <span>WABA ID: <strong className="text-slate-700">{acc.wabaId}</strong></span>
                                        <span>•</span>
                                        <span>Phone ID: <strong className="text-slate-700">{acc.phoneNumberId}</strong></span>
                                      </div>
                                    </div>
                                  </div>

                                  {!acc.isDefault ? (
                                    <button
                                      type="button"
                                      onClick={() => setDefaultWaAccount(acc.id)}
                                      className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer"
                                    >
                                      Set as Active Number
                                    </button>
                                  ) : (
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5">
                                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Active Number
                                    </span>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Manual Credentials Form */}
                      <form onSubmit={saveConfig} className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs animate-fadeIn">
                        <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                          <Key className="h-4.5 w-4.5 text-emerald-600" /> Manual API Credentials (Advanced)
                        </h3>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-700 font-semibold">Phone Number ID</label>
                          <input
                            type="text"
                            value={config.phoneNumberId || ""}
                            onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                            placeholder="e.g. 1048473820293"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-700 font-semibold">WhatsApp Business Account ID (WABA ID)</label>
                          <input
                            type="text"
                            value={config.wabaId || ""}
                            onChange={(e) => setConfig({ ...config, wabaId: e.target.value })}
                            placeholder="e.g. 1048473820999"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-700 font-semibold">System User Access Token (Permanent)</label>
                          <textarea
                            value={config.accessToken || ""}
                            onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                            rows={3}
                            placeholder="e.g. EAAG..."
                            className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono leading-relaxed"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-slate-500 font-medium">
                            {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved Successfully!" : ""}
                          </span>
                          <button
                            type="submit"
                            disabled={saveStatus === "saving"}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                          >
                            Save WhatsApp Settings
                          </button>
                        </div>
                      </form>
                    </>
                  ) : settingsSubTab === "instagram" ? (
                  <>
                    {/* Meta Official Instagram Embedded Signup */}
                    <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 border border-pink-200 rounded-2xl p-6 space-y-4 shadow-2xs relative overflow-hidden animate-fadeIn">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-700 shrink-0">
                            <Instagram className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-base text-slate-900">Meta Instagram Embedded Signup</h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800 border border-pink-200 uppercase">
                                OFFICIAL TECH PROVIDER
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Connect your Instagram Business account or Facebook Page instantly via Meta login to automate DMs and story replies.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={launchInstagramSignup}
                            disabled={igEmbeddedConnecting}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-600/20 transition-all cursor-pointer"
                          >
                            <Instagram className="h-4 w-4" />
                            <span>{igEmbeddedConnecting ? "Connecting via Meta..." : igConfig.instagramAccountId ? "Reconnect Instagram Account" : "Connect with Instagram"}</span>
                          </button>

                          {(igConfig.instagramAccountId || igConfig.pageId) && (
                            <button
                              type="button"
                              onClick={handleDisconnectInstagram}
                              disabled={igEmbeddedConnecting}
                              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                            >
                              Disconnect
                            </button>
                          )}
                        </div>
                      </div>

                      {(igConfig.instagramAccountId || igConfig.pageId) && (
                        <div className="bg-pink-50/70 border border-pink-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-pink-800 font-bold">
                            <Check className="h-4.5 w-4.5" />
                            <span>Status: Connected to Meta Instagram Messaging API</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-700 font-mono text-[11px]">
                            {igConfig.username && <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">Handle: <strong className="text-slate-900">@{igConfig.username}</strong></span>}
                            <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">IG Account ID: <strong className="text-slate-900">{igConfig.instagramAccountId || "Connected"}</strong></span>
                            <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">Page ID: <strong className="text-slate-900">{igConfig.pageId || "Connected"}</strong></span>
                          </div>
                        </div>
                      )}

                      {/* Linked Instagram Accounts List */}
                      <div className="mt-5 pt-5 border-t border-pink-200/90 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                              <Instagram className="w-4 h-4 text-pink-600" /> Linked Instagram Accounts ({igAccounts.length})
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Switch active default account or connect additional Instagram accounts to your organization.</p>
                          </div>
                          <button
                            type="button"
                            onClick={launchInstagramSignup}
                            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-pink-600/20 cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            Link Additional Account
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {igAccounts.length === 0 ? (
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                              No Instagram accounts linked yet. Click <strong>"Link Additional Account"</strong> or <strong>"Connect with Instagram"</strong> to add your first account.
                            </div>
                          ) : (
                            igAccounts.map((acc) => (
                              <div key={acc.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-slate-50/50 border border-slate-200/90 rounded-2xl text-xs shadow-2xs hover:border-pink-300 transition-all">
                                <div className="flex items-center gap-3.5">
                                  {acc.profilePic ? (
                                    <img src={acc.profilePic} alt="" className="w-10 h-10 rounded-full object-cover border border-pink-200" />
                                  ) : (
                                    <div className="relative p-2.5 rounded-xl bg-pink-50 text-pink-600 border border-pink-100/80">
                                      <Instagram className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div className="space-y-0.5">
                                    <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                      <span>{acc.username ? `@${acc.username}` : (acc.name || `IG (${acc.instagramAccountId.slice(-4)})`)}</span>
                                      {acc.isDefault && (
                                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold text-pink-800 bg-pink-100 rounded-full border border-pink-200/80">
                                          Active Default Account
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                                      <span>IG ID: <strong className="text-slate-700">{acc.instagramAccountId}</strong></span>
                                      <span>•</span>
                                      <span>Page ID: <strong className="text-slate-700">{acc.pageId}</strong></span>
                                    </div>
                                  </div>
                                </div>

                                {!acc.isDefault ? (
                                  <button
                                    type="button"
                                    onClick={() => setDefaultIgAccount(acc.id)}
                                    className="px-4 py-2 bg-white hover:bg-pink-50 text-pink-700 border border-slate-200 hover:border-pink-300 font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer"
                                  >
                                    Set as Active Account
                                  </button>
                                ) : (
                                  <span className="px-3 py-1 bg-pink-50 text-pink-700 border border-pink-200 font-bold text-xs rounded-xl flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Active Account
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Instagram Credentials Form */}
                    <form onSubmit={saveInstagramConfig} className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs animate-fadeIn">
                      <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Instagram className="h-4.5 w-4.5 text-pink-600" /> Instagram DM Credentials
                      </h3>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-700 font-semibold">Instagram Business Account ID</label>
                        <input
                          type="text"
                          value={igConfig.instagramAccountId || ""}
                          onChange={(e) => setIgConfig({ ...igConfig, instagramAccountId: e.target.value })}
                          placeholder="e.g. 17841401234567890"
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-700 font-semibold">Facebook Page ID</label>
                        <input
                          type="text"
                          value={igConfig.pageId || ""}
                          onChange={(e) => setIgConfig({ ...igConfig, pageId: e.target.value })}
                          placeholder="e.g. 10203040506070"
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-700 font-semibold">Page Access Token (Permanent)</label>
                        <textarea
                          value={igConfig.pageAccessToken || ""}
                          onChange={(e) => setIgConfig({ ...igConfig, pageAccessToken: e.target.value })}
                          placeholder="Paste Page Access Token here"
                          rows={4}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-mono text-xs"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="submit"
                          disabled={igSaveStatus === "saving"}
                          className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-pink-600/20 cursor-pointer"
                        >
                          <Save className="h-4 w-4" />
                          {igSaveStatus === "saving" ? "Saving..." : igSaveStatus === "success" ? "Saved Successfully!" : "Save Instagram Credentials"}
                        </button>
                        
                        {igSaveStatus === "error" && (
                          <span className="text-xs text-rose-600 font-medium">Failed to save settings.</span>
                        )}
                      </div>
                    </form>

                    {/* Instagram Webhook Integration */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs animate-fadeIn">
                      <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Database className="h-4.5 w-4.5 text-pink-600" /> Instagram Webhook Configuration
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Provide the following parameters inside your Meta Developer Console configuration settings under the <strong>Instagram Webhook</strong> product parameters list.
                      </p>

                      <div className="flex flex-col gap-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Webhook Callback URL</span>
                        <span className="text-xs text-slate-800 font-mono truncate">{`${BACKEND_URL}/api/webhook/instagram`}</span>
                      </div>

                      <div className="flex flex-col gap-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Verify Token</span>
                        <span className="text-xs text-slate-800 font-mono truncate">{config.webhookVerifyToken}</span>
                      </div>

                      <div className="bg-pink-50 border border-pink-200 rounded-xl p-3.5 flex gap-3">
                        <Bot className="h-5 w-5 text-pink-600 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-pink-900">Important Webhook Fields</span>
                          <span className="text-[11px] text-slate-600">
                            In your Meta Portal, configure and subscribe to the <strong>messages</strong> and <strong>messaging_postbacks</strong> webhook fields under the <strong>Instagram</strong> section.
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : settingsSubTab === "google" ? (
                  <>
                    {/* Official Google Business & Gmail Embedded Signup Card */}
                    <div className="bg-gradient-to-br from-amber-50 via-white to-blue-50 border border-amber-200 rounded-2xl p-6 space-y-4 shadow-2xs relative overflow-hidden animate-fadeIn">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                            <Star className="h-6 w-6 text-amber-500 fill-amber-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-base text-slate-900">Google Business & Gmail Embedded Signup</h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                                OFFICIAL GOOGLE PROVIDER
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Connect your Google Business Profile & Gmail accounts with 1-click Google OAuth to monitor reviews and automate customer interactions.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={handleGoogleOAuthConnect}
                            disabled={googleOauthStatus === "connecting"}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                          >
                            <RefreshCw className={`h-4 w-4 ${googleOauthStatus === "connecting" ? "animate-spin" : ""}`} />
                            <span>{googleOauthStatus === "connecting" ? "Connecting via Google..." : googleConfig.googleRefreshToken ? "Reconnect Google Account" : "Connect with Google"}</span>
                          </button>

                          {googleConfig.googleRefreshToken && (
                            <button
                              type="button"
                              onClick={handleDisconnectGoogle}
                              disabled={googleOauthStatus === "connecting"}
                              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                            >
                              Disconnect
                            </button>
                          )}
                        </div>
                      </div>

                      {googleConfig.googleRefreshToken && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-amber-800 font-bold">
                            <Check className="h-4.5 w-4.5 text-amber-600" />
                            <span>Status: Connected to Google Business API & Review Auto-Pilot</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-700 font-mono text-[11px]">
                            {googleConfig.locationName && <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">Location: <strong className="text-slate-900">{googleConfig.locationName}</strong></span>}
                            {googleConfig.googleLocationId && <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">Location ID: <strong className="text-slate-900">{googleConfig.googleLocationId}</strong></span>}
                          </div>
                        </div>
                      )}

                      {/* Linked Gmail Accounts List */}
                      <div className="mt-5 pt-5 border-t border-amber-200/90 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                              <Mail className="w-4 h-4 text-rose-500" /> Linked Gmail & Google Accounts ({gmailAccounts.length})
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Switch active primary Gmail account or connect additional Google accounts to your workspace.</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleGoogleOAuthConnect}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            Link Additional Account
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {gmailAccounts.length === 0 ? (
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                              No Gmail accounts linked yet. Click <strong>"Link Additional Account"</strong> or <strong>"Connect with Google"</strong> to add your first Google account.
                            </div>
                          ) : (
                            gmailAccounts.map((acc) => (
                              <div key={acc.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-slate-50/50 border border-slate-200/90 rounded-2xl text-xs shadow-2xs hover:border-amber-300 transition-all">
                                <div className="flex items-center gap-3.5">
                                  <div className="relative p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100/80">
                                    <Mail className="w-5 h-5" />
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                      <span>{acc.emailAddress || "Connected Gmail Account"}</span>
                                      {acc.isDefault && (
                                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold text-rose-800 bg-rose-100 rounded-full border border-rose-200/80">
                                          Primary Email
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-mono">Display Name: {acc.displayName || acc.emailAddress?.split("@")[0]}</div>
                                  </div>
                                </div>

                                {!acc.isDefault ? (
                                  <button
                                    type="button"
                                    onClick={() => setDefaultGmailAccount(acc.id)}
                                    className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-300 font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer"
                                  >
                                    Set Primary Email
                                  </button>
                                ) : (
                                  <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Primary Email
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Google GMB Credentials Form */}
                    <form onSubmit={saveGoogleConfig} className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs animate-fadeIn">
                      <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Star className="h-4.5 w-4.5 text-amber-500" /> Google Business Configuration
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-700 font-semibold">Location / Business Name</label>
                          <input
                            type="text"
                            value={googleConfig.locationName || ""}
                            onChange={(e) => setGoogleConfig({ ...googleConfig, locationName: e.target.value })}
                            placeholder="e.g. Jisnu Digitals Pune"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-700 font-semibold">Google Place ID (Link redirection)</label>
                          <input
                            type="text"
                            value={googleConfig.googlePlaceId || ""}
                            onChange={(e) => setGoogleConfig({ ...googleConfig, googlePlaceId: e.target.value })}
                            placeholder="e.g. ChIJK7R7jG-5wjsR..."
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-700 font-semibold">Live Google Business Review Redirect URL</label>
                        <input
                          type="text"
                          value={googleConfig.googleReviewUrl || ""}
                          onChange={(e) => setGoogleConfig({ ...googleConfig, googleReviewUrl: e.target.value })}
                          placeholder="e.g. https://search.google.com/local/writereview?placeid=ChIJK7R..."
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-700 font-semibold">Google Business Account ID (Optional)</label>
                          <input
                            type="text"
                            value={formGoogleAccountId}
                            onChange={(e) => setFormGoogleAccountId(e.target.value)}
                            placeholder="e.g. 1048273892019"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue font-mono text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-700 font-semibold">Google Business Location ID</label>
                          <input
                            type="text"
                            value={formGoogleLocationId}
                            onChange={(e) => setFormGoogleLocationId(e.target.value)}
                            placeholder="e.g. 15154699825689004204"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue font-mono text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-700 font-semibold">Google Ads Customer ID</label>
                          <input
                            type="text"
                            value={formGoogleAdsCustomerId}
                            onChange={(e) => setFormGoogleAdsCustomerId(e.target.value)}
                            placeholder="e.g. 123-456-7890"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="submit"
                          disabled={googleSaveStatus === "saving"}
                          className="bg-brand-blue hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md cursor-pointer"
                        >
                          <Save className="h-4 w-4" />
                          {googleSaveStatus === "saving" ? "Saving..." : googleSaveStatus === "success" ? "Saved Config Successfully!" : "Save Google Configurations"}
                        </button>
                        {googleSaveStatus === "error" && (
                          <span className="text-xs text-rose-600 font-medium">Failed to save Google config.</span>
                        )}
                      </div>
                    </form>
                  </>
                ) : settingsSubTab === "youtube" ? (
                  <>
                    {/* Official YouTube Channel Embedded Signup Card */}
                    <div className="bg-gradient-to-br from-red-50 via-white to-rose-50 border border-red-200 rounded-2xl p-6 space-y-4 shadow-2xs relative overflow-hidden animate-fadeIn">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                            <Video className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-base text-slate-900">Google YouTube Embedded Signup</h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 uppercase">
                                OFFICIAL YOUTUBE PROVIDER
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Connect your YouTube channel with 1-click Google OAuth to auto-sync video comments, deploy AI response bots, and monitor subscriber engagement.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={handleYoutubeOAuthConnect}
                            disabled={ytOauthStatus === "connecting"}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
                          >
                            <Video className="h-4 w-4" />
                            <span>{ytOauthStatus === "connecting" ? "Connecting via Google..." : (ytConfig.refreshToken || ytConfig.channelId) ? "Reconnect YouTube Channel" : "Connect with YouTube"}</span>
                          </button>

                          {(ytConfig.refreshToken || ytConfig.channelId) && (
                            <button
                              type="button"
                              onClick={handleDisconnectYoutube}
                              disabled={ytOauthStatus === "connecting"}
                              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                            >
                              Disconnect
                            </button>
                          )}
                        </div>
                      </div>

                      {(ytConfig.refreshToken || ytConfig.channelId) && (
                        <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-red-800 font-bold">
                            <Check className="h-4.5 w-4.5 text-red-600" />
                            <span>Status: Connected to YouTube Data API & Real-time Comment Bot</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-700 font-mono text-[11px]">
                            {ytConfig.channelTitle && <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">Channel: <strong className="text-slate-900">{ytConfig.channelTitle}</strong></span>}
                            {ytConfig.channelId && <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">Channel ID: <strong className="text-slate-900">{ytConfig.channelId}</strong></span>}
                          </div>
                        </div>
                      )}

                      {/* Linked YouTube Channels List / Link Additional Account */}
                      <div className="mt-5 pt-5 border-t border-red-200/90 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                              <Video className="w-4 h-4 text-red-600" /> Linked YouTube Channels
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Connect additional YouTube channels to your organization via 1-click Google OAuth.</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleYoutubeOAuthConnect}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/20 cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            Link Additional Account
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {youtubeAccounts.length === 0 && !(ytConfig.channelId || ytConfig.refreshToken) ? (
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                              No YouTube channel linked yet. Click <strong>"Link Additional Account"</strong> or <strong>"Connect with YouTube"</strong> to authorize your channel.
                            </div>
                          ) : (
                            (youtubeAccounts.length > 0 ? youtubeAccounts : [{
                              id: "default",
                              channelTitle: ytConfig.channelTitle,
                              channelId: ytConfig.channelId,
                              isDefault: true
                            }]).map((acc) => {
                              const isPrimary = acc.isDefault || acc.id === selectedYoutubeAccountId;
                              return (
                                <div key={acc.id} className={`flex items-center justify-between p-4 border rounded-2xl text-xs transition-all ${isPrimary ? "bg-gradient-to-r from-red-50/80 to-rose-50/40 border-red-300 shadow-2xs" : "bg-white border-slate-200 hover:border-red-200"}`}>
                                  <div className="flex items-center gap-3.5">
                                    <div className="relative p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100/80">
                                      <Video className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                        <span>{acc.channelTitle || acc.channelId || "Connected YouTube Channel"}</span>
                                        {isPrimary ? (
                                          <span className="px-2.5 py-0.5 text-[10px] font-extrabold text-red-800 bg-red-100 rounded-full border border-red-200/80">
                                            Primary Channel
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-100 rounded-full border border-slate-200">
                                            Linked Channel
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[11px] text-slate-500 font-mono">Channel ID: <strong className="text-slate-700">{acc.channelId || "Connected"}</strong></div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {isPrimary ? (
                                      <span className="px-3 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Primary Channel
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setDefaultYoutubeAccount(acc.id)}
                                        className="px-3.5 py-1.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 text-slate-700 hover:text-red-700 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                                      >
                                        Set as Primary Channel
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    {/* YouTube Manual Credentials Form */}
                    <form onSubmit={saveYoutubeConfig} className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs animate-fadeIn">
                      <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Key className="h-4.5 w-4.5 text-red-600" /> Manual API Credentials (Advanced)
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-700 font-semibold">YouTube Channel ID</label>
                          <input
                            type="text"
                            value={ytConfig.channelId || ""}
                            onChange={(e) => setYtConfig({ ...ytConfig, channelId: e.target.value })}
                            placeholder="e.g. UCxxxxxxxxxxxxxxxxxxxx"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-700 font-semibold">Channel Title / Name</label>
                          <input
                            type="text"
                            value={ytConfig.channelTitle || ""}
                            onChange={(e) => setYtConfig({ ...ytConfig, channelTitle: e.target.value })}
                            placeholder="e.g. My Official Channel"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-700 font-semibold">Google OAuth Refresh Token (Offline Access)</label>
                        <textarea
                          value={ytConfig.refreshToken || ""}
                          onChange={(e) => setYtConfig({ ...ytConfig, refreshToken: e.target.value })}
                          rows={3}
                          placeholder="Paste your 1//0... Refresh Token here"
                          className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono leading-relaxed"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="submit"
                          disabled={ytSaveStatus === "saving"}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-red-600/20 cursor-pointer"
                        >
                          <Save className="h-4 w-4" />
                          {ytSaveStatus === "saving" ? "Saving..." : ytSaveStatus === "success" ? "Saved Successfully!" : "Save YouTube Credentials"}
                        </button>
                        
                        {ytSaveStatus === "error" && (
                          <span className="text-xs text-rose-600 font-medium">Failed to save settings.</span>
                        )}
                      </div>
                    </form>

                    {/* YouTube Real-Time Webhook Configuration */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs animate-fadeIn">
                      <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Database className="h-4.5 w-4.5 text-red-600" /> YouTube Webhook Callback Endpoint
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Use this endpoint for YouTube PubSubHubbub subscription notifications to listen to live comment events.
                      </p>

                      <div className="flex flex-col gap-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">PubSubHubbub Callback URL</span>
                        <span className="text-xs text-slate-800 font-mono truncate">{`${BACKEND_URL}/api/youtube/webhook`}</span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Quick instructions sidebar */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-emerald-600" /> Setup Instructions
                  </h4>
                  
                  {settingsSubTab === "whatsapp" ? (
                    <ul className="text-xs text-slate-600 space-y-3.5 pl-4 list-decimal marker:text-emerald-600 marker:font-bold animate-fadeIn">
                      <li>Create a Meta Developer app under your Meta developer account.</li>
                      <li>Add the <strong>WhatsApp</strong> product to your Meta Developer app.</li>
                      <li>Generate a <strong>Permanent System User Access Token</strong> in your Meta Business settings.</li>
                      <li>Copy your <strong>Phone Number ID</strong> and <strong>WABA ID</strong> and paste them into the form.</li>
                    </ul>
                  ) : settingsSubTab === "instagram" ? (
                    <ul className="text-xs text-slate-600 space-y-3.5 pl-4 list-decimal marker:text-pink-600 marker:font-bold animate-fadeIn">
                      <li>Create a Meta Developer app under your Meta developer account.</li>
                      <li>Add the <strong>Messenger</strong> product to your Meta Developer app.</li>
                      <li>Generate a <strong>Permanent System User Access Token</strong> with <code className="text-[10px] bg-slate-100 text-slate-800 p-0.5 px-1 rounded border border-slate-200">instagram_basic</code> scope.</li>
                      <li>Link your Facebook Page and Instagram Business Account.</li>
                    </ul>
                  ) : settingsSubTab === "youtube" ? (
                    <ul className="text-xs text-slate-600 space-y-3.5 pl-4 list-decimal marker:text-red-600 marker:font-bold animate-fadeIn">
                      <li>Go to <strong>Google Cloud Console</strong> and create a project.</li>
                      <li>Enable the <strong>YouTube Data API v3</strong> product.</li>
                      <li>Click <strong>"Connect YouTube Account"</strong> to authorize with 1-click Google OAuth.</li>
                      <li>Alternatively, input your <strong>Channel ID</strong> and <strong>OAuth Refresh Token</strong> manually.</li>
                    </ul>
                  ) : (
                    <ul className="text-xs text-slate-600 space-y-3.5 pl-4 list-decimal marker:text-brand-blue marker:font-bold animate-fadeIn">
                      <li>Retrieve your <strong>Place ID</strong> from the Google Maps Developer Console.</li>
                      <li>Input the Live Google Review URL so positive review selections can redirect consumers.</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

        {/* MODAL 1: DEVELOPER WIZARD FOR GENERATING NEW API KEY */}
        {showCreateKeyModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
              {/* Wizard Header & Step Indicator */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Key className="h-5 w-5 text-blue-600" /> Generate New API Key
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Step {wizardStep} of 3: {wizardStep === 1 ? "Basic Details" : wizardStep === 2 ? "Permissions (Scopes)" : "Review & Generate"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateKeyModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Step Progress Bar */}
              <div className="grid grid-cols-3 gap-2">
                <div className={`h-1.5 rounded-full transition-all ${wizardStep >= 1 ? "bg-blue-600" : "bg-slate-200"}`} />
                <div className={`h-1.5 rounded-full transition-all ${wizardStep >= 2 ? "bg-blue-600" : "bg-slate-200"}`} />
                <div className={`h-1.5 rounded-full transition-all ${wizardStep >= 3 ? "bg-blue-600" : "bg-slate-200"}`} />
              </div>

              {/* WIZARD STEP 1: BASIC DETAILS */}
              {wizardStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      API Key Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. Website Checkout Lead Form, Mobile App"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Target Environment</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setNewKeyEnv("LIVE")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                          newKeyEnv === "LIVE"
                            ? "bg-emerald-50 border-emerald-300 text-slate-900"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-700">
                          🟢 Live Production
                        </span>
                        <span className="text-[10px] text-slate-500">For live website, customer app, and production messaging.</span>
                      </div>

                      <div
                        onClick={() => setNewKeyEnv("TEST")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                          newKeyEnv === "TEST"
                            ? "bg-amber-50 border-amber-300 text-slate-900"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span className="font-bold text-xs flex items-center gap-1.5 text-amber-700">
                          🟡 Test Sandbox
                        </span>
                        <span className="text-[10px] text-slate-500">For staging & testing environments without live charges.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Description / Purpose (Optional)</label>
                    <textarea
                      rows={2}
                      value={newKeyDesc}
                      onChange={(e) => setNewKeyDesc(e.target.value)}
                      placeholder="Provide context for where this key is used..."
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={!newKeyName.trim()}
                      onClick={() => setWizardStep(2)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      Next: Select Permissions →
                    </button>
                  </div>
                </div>
              )}

              {/* WIZARD STEP 2: PERMISSIONS (SCOPES) */}
              {wizardStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-semibold text-slate-700">Configure Permission Scopes</span>
                    <span className="text-[11px] text-blue-600 font-mono">
                      {selectedScopes.includes("full_access") ? "⭐ Full Access" : `${selectedScopes.length} scope(s) selected`}
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-4 custom-scrollbar">
                    {AVAILABLE_SCOPES.map((cat) => {
                      const catItemIds = cat.items.map(i => i.id);
                      const hasAllCat = catItemIds.every(id => selectedScopes.includes(id));
                      return (
                        <div key={cat.category} className="space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              {cat.category}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSelectAllCategory(cat.items, selectedScopes, setSelectedScopes)}
                              className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                            >
                              {hasAllCat ? "Deselect Group" : "Select All"}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {cat.items.map((item) => {
                              const isChecked = selectedScopes.includes(item.id);
                              return (
                                <label
                                  key={item.id}
                                  className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                    isChecked
                                      ? "bg-blue-50/70 border-blue-200 text-slate-900"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleScope(item.id, selectedScopes, setSelectedScopes)}
                                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-900">{item.label}</span>
                                    <span className="text-[10px] text-slate-500">{item.desc}</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={selectedScopes.length === 0}
                      onClick={() => setWizardStep(3)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      Next: Review & Confirm →
                    </button>
                  </div>
                </div>
              )}

              {/* WIZARD STEP 3: REVIEW & GENERATE */}
              {wizardStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                      <span className="text-slate-500">Key Name:</span>
                      <span className="font-bold text-slate-900">{newKeyName}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                      <span className="text-slate-500">Environment:</span>
                      <span className={`font-bold ${newKeyEnv === "LIVE" ? "text-emerald-700" : "text-amber-700"}`}>
                        {newKeyEnv === "LIVE" ? "Live Production" : "Test Sandbox"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                      <span className="text-slate-500">Selected Permissions:</span>
                      <span className="font-bold text-blue-600 font-mono">{selectedScopes.length} scope(s)</span>
                    </div>
                    {newKeyDesc && (
                      <div className="flex flex-col gap-1 border-b border-slate-200/80 pb-2">
                        <span className="text-slate-500">Description:</span>
                        <span className="text-slate-700 italic">{newKeyDesc}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 flex items-center gap-2">
                    <Key className="h-4 w-4 shrink-0 text-blue-600" />
                    <span>Your full API key secret token will be displayed once generated. Store it safely.</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={generatingKey}
                      onClick={handleGenerateApiKey}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      {generatingKey ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      {generatingKey ? "Generating Key..." : "Confirm & Generate API Key"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL 1B: DISPLAY NEWLY GENERATED SECRET API KEY & COPY BUTTON */}
        {showRawKeyModal && createdRawKey && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    API Key Created Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Copy and store your secret key securely now.
                  </p>
                </div>
              </div>

              {createdKeyWarning && (
                <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 space-y-1.5 text-amber-900">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Important Security Notice</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {createdKeyWarning}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Your Full Secret API Key
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={createdRawKey}
                    className="w-full bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl pl-4 pr-32 py-3.5 border border-slate-800 focus:outline-none shadow-inner selection:bg-emerald-900 selection:text-emerald-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdRawKey);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 3000);
                    }}
                    className={`absolute right-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      copiedKey
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20"
                    }`}
                  >
                    {copiedKey ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy Key
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => downloadEnvFile(createdRawKey, "CRM_API_KEY")}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4 text-slate-600" /> Download .env File
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRawKeyModal(false);
                    setCreatedRawKey(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  I Have Saved My Key ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL EDIT KEY & PERMISSIONS */}
        {editingKeyModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-600" /> Edit API Key Permissions
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingKeyModal(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateApiKey} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">API Key Name</label>
                  <input
                    type="text"
                    required
                    value={editKeyName}
                    onChange={(e) => setEditKeyName(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Description</label>
                  <input
                    type="text"
                    value={editKeyDesc}
                    onChange={(e) => setEditKeyDesc(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Allowed Permissions (Scopes)</span>
                    <span className="text-[10px] text-blue-600 font-mono">
                      {editKeyScopes.includes("full_access") ? "⭐ Full Access Selected" : `${editKeyScopes.length} scope(s) granted`}
                    </span>
                  </label>

                  <div className="max-h-56 overflow-y-auto space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 custom-scrollbar">
                    {AVAILABLE_SCOPES.map((cat) => (
                      <div key={cat.category} className="space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200/80 pb-1 flex items-center justify-between">
                          <span>{cat.category}</span>
                          <button
                            type="button"
                            onClick={() => handleSelectAllCategory(cat.items, editKeyScopes, setEditKeyScopes)}
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                          >
                            Toggle Group
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {cat.items.map((item) => {
                            const isChecked = editKeyScopes.includes(item.id) || editKeyScopes.includes("full_access");
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleToggleScope(item.id, editKeyScopes, setEditKeyScopes)}
                                className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                  isChecked
                                    ? "bg-blue-50 border-blue-200 text-slate-900"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  readOnly
                                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                                />
                                <div className="flex flex-col">
                                  <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                                    {item.label}
                                  </span>
                                  <span className="text-[10px] text-slate-500 leading-tight">{item.desc}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingKeyModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingKey || !editKeyName.trim()}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {updatingKey ? "Saving..." : "Save Permissions"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FLOATING TOAST NOTIFICATION BANNER */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-fadeIn text-xs font-semibold">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
}
