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
  BarChart2,
  TrendingUp,
  Clock,
  ThumbsUp,
  Eye,
  Tv,
  AlertCircle,
  Search
} from "lucide-react";
import Link from "next/link";
import { AccountSwitcher, AccountOption } from "../../components/AccountSwitcher";
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

// -------------------------------------------------------------
// YouTube Styled Flow Builder Custom Nodes
// -------------------------------------------------------------

const TextNodeComponent = ({ data }: any) => {
  const isIg = data.platform === "instagram";
  const isYt = data.platform === "youtube";
  const textColor = isYt ? "text-red-500" : isIg ? "text-pink-400" : "text-emerald-400";
  const handleBg = isYt ? "!bg-red-500" : isIg ? "!bg-pink-500" : "!bg-emerald-500";

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[200px] text-xs animate-fadeIn">
      <Handle type="target" position={Position.Top} className={`${handleBg} !w-2.5 !h-2.5`} />
      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
        {isYt ? (
          <Youtube className={`h-3 w-3 ${textColor}`} />
        ) : isIg ? (
          <Instagram className={`h-3 w-3 ${textColor}`} />
        ) : (
          <Bot className={`h-3 w-3 ${textColor}`} />
        )}
        {isYt ? "YouTube Comment Reply" : isIg ? "Instagram Text DM" : "Message Text Msg"}
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
  const isYt = data.platform === "youtube";
  const textColor = isYt ? "text-red-500" : isIg ? "text-pink-400" : "text-emerald-400";
  const handleBg = isYt ? "!bg-red-500" : isIg ? "!bg-pink-500" : "!bg-emerald-500";
  const handleBgLight = isYt ? "!bg-red-400" : isIg ? "!bg-pink-400" : "!bg-emerald-400";
  const borderL = isYt ? "border-l-red-500" : isIg ? "border-l-pink-500" : "border-l-emerald-500";

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[220px] text-xs flex flex-col gap-2 animate-fadeIn">
      <Handle type="target" position={Position.Top} className={`${handleBg} !w-2.5 !h-2.5`} />
      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
        {isYt ? (
          <Youtube className={`h-3 w-3 ${textColor}`} />
        ) : isIg ? (
          <Instagram className={`h-3 w-3 ${textColor}`} />
        ) : (
          <Bot className={`h-3 w-3 ${textColor}`} />
        )}
        {isYt ? "YouTube Options Fallback" : isIg ? "Instagram Quick Replies" : "Interactive Buttons"}
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
  const isYt = data.platform === "youtube";
  const textColor = isYt ? "text-red-500" : isIg ? "text-pink-400" : "text-emerald-400";
  const handleBg = isYt ? "!bg-red-500" : isIg ? "!bg-pink-500" : "!bg-emerald-500";
  const handleBgLight = isYt ? "!bg-red-400" : isIg ? "!bg-pink-400" : "!bg-emerald-400";
  const borderL = isYt ? "border-l-red-500" : isIg ? "border-l-pink-500" : "border-l-emerald-500";

  // Flat array of all rows across all sections
  const sections = data.listSections || [];
  const rows = sections.flatMap((sec: any) => sec.rows || []) || [];

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[220px] text-xs flex flex-col gap-2 animate-fadeIn">
      <Handle type="target" position={Position.Top} className={`${handleBg} !w-2.5 !h-2.5`} />
      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
        <FileText className={`h-3 w-3 ${textColor}`} />
        {isYt ? "YouTube Menu Fallback" : isIg ? "Instagram Menu (Quick Replies)" : "Interactive List Menu"}
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
  const isYt = data.platform === "youtube";
  const textColor = isYt ? "text-red-500" : isIg ? "text-pink-400" : "text-emerald-400";
  const handleBg = isYt ? "!bg-red-500" : isIg ? "!bg-pink-500" : "!bg-emerald-500";

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[200px] text-xs animate-fadeIn">
      <Handle type="target" position={Position.Top} className={`${handleBg} !w-2.5 !h-2.5`} />
      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
        {isYt ? (
          <Youtube className={`h-3 w-3 ${textColor}`} />
        ) : isIg ? (
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
  const isYt = data.platform === "youtube";
  const textColor = isYt ? "text-red-500" : isIg ? "text-pink-400" : "text-emerald-400";
  const border = isYt ? "border-red-500" : isIg ? "border-pink-500" : "border-emerald-500";
  const handleBg = isYt ? "!bg-red-500" : isIg ? "!bg-pink-500" : "!bg-emerald-500";

  return (
    <div className={`bg-slate-800 border-2 ${border} rounded-xl p-3 shadow-lg min-w-[200px] text-xs animate-fadeIn`}>
      <div className={`text-[9px] ${textColor} font-bold uppercase tracking-wider mb-1 flex items-center gap-1`}>
        {isYt ? (
          <Youtube className="h-3.5 w-3.5" />
        ) : isIg ? (
          <Instagram className="h-3.5 w-3.5" />
        ) : (
          <Bot className="h-3.5 w-3.5" />
        )}
        {isYt ? "YouTube Welcome Node (Root)" : isIg ? "Instagram Welcome Node (Root)" : "Welcome Node (Root)"}
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
  const isYt = data.platform === "youtube";
  const textColor = isYt ? "text-red-500" : isIg ? "text-pink-400" : "text-emerald-400";
  const handleBg = isYt ? "!bg-red-500" : isIg ? "!bg-pink-500" : "!bg-emerald-500";
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
      <div className="text-slate-300 font-semibold truncate bg-slate-900/40 p-1.5 rounded border border-slate-850/60 font-mono mb-1.5 max-w-[180px]">
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
    const org = localStorage.getItem("organization_id");
    if (org) return org;
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

interface InstagramConfig {
  instagramAccountId: string;
  pageId: string;
  pageAccessToken: string;
}

const NODE_TYPES = {
  welcomeNode: WelcomeNodeComponent,
  textNode: TextNodeComponent,
  buttonsNode: ButtonsNodeComponent,
  listNode: ListNodeComponent,
  questionNode: QuestionNodeComponent,
  mediaNode: MediaNodeComponent,
};

const EDGE_TYPES = {};

export default function Dashboard() {
  const nodeTypes = NODE_TYPES;
  const edgeTypes = EDGE_TYPES;

  const [activeTab, setActiveTab] = useState<"chats_youtube" | "videos_shorts" | "comparative" | "demographics" | "flows" | "analytics" | "settings">("analytics");
  // Mobile: track whether user has opened a conversation (to show chat view vs list on small screens)
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  useEffect(() => {
    fetchYoutubeAccounts();
    fetchYoutubeConfig();

    const handleAccountChange = (e: any) => {
      if (e.detail?.platform === "youtube" && e.detail?.accountId) {
        handleSwitchYoutubeAccount(e.detail.accountId);
      }
    };
    window.addEventListener("account-changed", handleAccountChange);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "chats_youtube" || tab === "videos_shorts" || tab === "comparative" || tab === "demographics" || tab === "flows" || tab === "analytics" || tab === "settings") {
        setActiveTab(tab as any);
      }

      const oauth = params.get("oauth");
      if (oauth === "success") {
        fetchYoutubeAccounts();
        fetchYoutubeConfig();
        window.history.replaceState({}, document.title, window.location.pathname + "?tab=settings");
      } else if (oauth === "error") {
        window.history.replaceState({}, document.title, window.location.pathname + "?tab=settings");
      }
    }
    return () => window.removeEventListener("account-changed", handleAccountChange);
  }, []);

  // Video-Specific Comment Filtering State
  const [selectedVideoForComments, setSelectedVideoForComments] = useState<{ id: string; title: string; thumbnail: string; views?: number; comments?: number; isShort?: boolean; publishedAt?: string } | null>(null);
  const [videoCommentsData, setVideoCommentsData] = useState<any[]>([]);
  const [videoCommentsDisabled, setVideoCommentsDisabled] = useState<boolean>(false);
  const [loadingVideoComments, setLoadingVideoComments] = useState(false);
  const [commentsFilter, setCommentsFilter] = useState<"all" | "shorts" | "videos">("all");
  const [commentsSearchTerm, setCommentsSearchTerm] = useState<string>("");

  // Videos vs Shorts State
  const [videosShortsData, setVideosShortsData] = useState<any | null>(null);
  const [loadingVideosShorts, setLoadingVideosShorts] = useState(false);

  // Comparative Month-over-Month Analytics State
  const [comparativeData, setComparativeData] = useState<any | null>(null);
  const [loadingComparative, setLoadingComparative] = useState(false);
  const [comparativeDays, setComparativeDays] = useState<number | string>(30);

  // Audience Demographics & Traffic Sources State
  const [demographicsData, setDemographicsData] = useState<any | null>(null);
  const [loadingDemographics, setLoadingDemographics] = useState(false);
  const [demographicsDays, setDemographicsDays] = useState<number | string>(30);

  // Analytics Time Range State
  const [analyticsDays, setAnalyticsDays] = useState<number | string>(30);

  // Comment Replies Text Inputs State
  const [replyInputText, setReplyInputText] = useState<{ [commentId: string]: string }>({});
  const [postingReplyStatus, setPostingReplyStatus] = useState<{ [commentId: string]: boolean }>({});
  
  // Real-time Chat States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Instagram Config
  const [igConfig, setIgConfig] = useState<InstagramConfig>({
    instagramAccountId: "",
    pageId: "",
    pageAccessToken: ""
  });
  const [igSaveStatus, setIgSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [selectedPlatform, setSelectedPlatform] = useState<"youtube">("youtube");
  const [settingsSubTab, setSettingsSubTab] = useState<"youtube" | "google">("youtube");

  interface YouTubeAnalyticsData {
    summary: {
      columnHeaders: { name: string; columnType: string; dataType: string }[];
      rows: any[][];
    };
    daily: {
      columnHeaders: { name: string; columnType: string; dataType: string }[];
      rows: any[][];
    };
    topVideos: {
      id: string;
      title: string;
      thumbnail: string;
      views: number;
      likes: number;
      estimatedMinutesWatched: number;
    }[];
  }

  const [analyticsData, setAnalyticsData] = useState<YouTubeAnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<{ isDisconnected: boolean; message: string } | null>(null);

  // YouTube Config
  interface YouTubeConfig {
    id?: string;
    channelId: string;
    channelTitle?: string;
    accessToken: string;
    refreshToken: string;
  }
  const [ytConfig, setYtConfig] = useState<YouTubeConfig>({
    channelId: "",
    channelTitle: "",
    accessToken: "",
    refreshToken: ""
  });
  const [ytSaveStatus, setYtSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [ytOauthStatus, setYtOauthStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");

  // Multi-Account YouTube State
  const [youtubeAccounts, setYoutubeAccounts] = useState<any[]>([]);
  const [selectedYoutubeAccountId, setSelectedYoutubeAccountId] = useState<string>("");

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
  // Removed WhatsApp local state configs

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
    const limit = 13;
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
    const limit = 13;
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
      const org = getOrgId(); if (org) socket.emit("join-org", org);
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
    fetchYoutubeConfig();
    fetchGoogleConfig();
    fetchActiveFlow("youtube");
    fetchVideosShorts();

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
      const expectedPlatform = "youtube";
      if ((activeConv.platform || "youtube") !== expectedPlatform) {
        setActiveConv(null);
        setMessages([]);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "videos_shorts" || activeTab === "chats_youtube") {
      fetchVideosShorts();
    } else if (activeTab === "comparative") {
      fetchComparative(comparativeDays);
    } else if (activeTab === "demographics") {
      fetchDemographics(demographicsDays);
    } else if (activeTab === "analytics") {
      fetchAnalytics(analyticsDays);
    }
  }, [activeTab, comparativeDays, demographicsDays, analyticsDays]);

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
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/conversations/${convId}/messages`, {
        headers: { "x-organization-id": getOrgId() }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const fetchAnalytics = async (days: number | string = analyticsDays, accountId?: string) => {
    setLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      const targetId = accountId || selectedYoutubeAccountId;
      const res = await fetch(`${BACKEND_URL}/api/youtube/analytics?days=${days}${targetId ? `&accountId=${targetId}` : ""}`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        const isAuthErr = res.status === 401 || errData.code === "YOUTUBE_DISCONNECTED" || (errData.error && errData.error.includes("expired or revoked"));
        setAnalyticsError({
          isDisconnected: Boolean(isAuthErr),
          message: errData.error || errData.details || "Failed to fetch YouTube Analytics"
        });
        if (isAuthErr) {
          // Re-fetch config to sync active status in UI
          fetchYoutubeConfig();
        }
      }
    } catch (err: any) {
      console.error("Error fetching YouTube Analytics:", err);
      setAnalyticsError({
        isDisconnected: false,
        message: err.message || "Network error fetching YouTube analytics"
      });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchVideoComments = async (videoId: string, accountId?: string) => {
    setLoadingVideoComments(true);
    setVideoCommentsDisabled(false);
    try {
      const targetId = accountId || selectedYoutubeAccountId;
      const res = await fetch(`${BACKEND_URL}/api/youtube/comments/video/${videoId}${targetId ? `?accountId=${encodeURIComponent(targetId)}` : ""}`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setVideoCommentsData(data.comments || []);
        if (data.commentsDisabled) {
          setVideoCommentsDisabled(true);
        }
      }
    } catch (err) {
      console.error("Error fetching video comments:", err);
      setVideoCommentsDisabled(true);
    } finally {
      setLoadingVideoComments(false);
    }
  };

  const fetchVideosShorts = async (accountId?: string) => {
    setLoadingVideosShorts(true);
    try {
      const targetId = accountId || selectedYoutubeAccountId;
      const res = await fetch(`${BACKEND_URL}/api/youtube/analytics/videos-shorts${targetId ? `?accountId=${targetId}` : ""}`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setVideosShortsData(data);
      }
    } catch (err) {
      console.error("Error fetching videos vs shorts analytics:", err);
    } finally {
      setLoadingVideosShorts(false);
    }
  };

  const fetchComparative = async (days: number | string = comparativeDays, accountId?: string) => {
    setLoadingComparative(true);
    try {
      const targetId = accountId || selectedYoutubeAccountId;
      const res = await fetch(`${BACKEND_URL}/api/youtube/analytics/comparative?days=${days}${targetId ? `&accountId=${targetId}` : ""}`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setComparativeData(data);
      }
    } catch (err) {
      console.error("Error fetching comparative analytics:", err);
    } finally {
      setLoadingComparative(false);
    }
  };

  const fetchDemographics = async (days: number | string = demographicsDays, accountId?: string) => {
    setLoadingDemographics(true);
    try {
      const targetId = accountId || selectedYoutubeAccountId;
      const res = await fetch(`${BACKEND_URL}/api/youtube/analytics/demographics?days=${days}${targetId ? `&accountId=${targetId}` : ""}`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setDemographicsData(data);
      }
    } catch (err) {
      console.error("Error fetching demographics analytics:", err);
    } finally {
      setLoadingDemographics(false);
    }
  };

  const handleSelectVideoForComments = (video: { id: string; title: string; thumbnail: string; views?: number }) => {
    setSelectedVideoForComments(video);
    setActiveTab("chats_youtube");
    fetchVideoComments(video.id);
  };

  const handlePostCommentReply = async (commentId: string, videoId?: string) => {
    const text = replyInputText[commentId];
    if (!text || !text.trim()) return;

    setPostingReplyStatus((prev) => ({ ...prev, [commentId]: true }));
    try {
      const res = await fetch(`${BACKEND_URL}/api/youtube/comments/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({ parentId: commentId, videoId, text, accountId: selectedYoutubeAccountId })
      });
      if (res.ok) {
        setReplyInputText((prev) => ({ ...prev, [commentId]: "" }));
        if (selectedVideoForComments) {
          fetchVideoComments(selectedVideoForComments.id);
        }
      }
    } catch (err) {
      console.error("Error posting YouTube comment reply:", err);
    } finally {
      setPostingReplyStatus((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Removed WhatsApp credentials loading functions

  const fetchInstagramConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/instagram/config`, {
        headers: { "x-organization-id": getOrgId() }
      });
      const data = await res.json();
      if (data) {
        setIgConfig(data);
      }
    } catch (err) {
      console.error("Error fetching Instagram config:", err);
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
        setTimeout(() => setIgSaveStatus("idle"), 3000);
      } else {
        setIgSaveStatus("error");
      }
    } catch (err) {
      setIgSaveStatus("error");
    }
  };



  const fetchYoutubeAccounts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/youtube/accounts`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accounts && Array.isArray(data.accounts)) {
          setYoutubeAccounts(data.accounts);
          if (data.accounts.length === 0) {
            setSelectedYoutubeAccountId("");
          } else {
            setSelectedYoutubeAccountId(prev => {
              if (prev && data.accounts.some((a: any) => a.id === prev)) return prev;
              const defaultAcc = data.accounts.find((a: any) => a.isDefault) || data.accounts[0];
              return defaultAcc?.id || "";
            });
          }
        }
      } else {
        setYoutubeAccounts([]);
        setSelectedYoutubeAccountId("");
      }
    } catch (err) {
      console.warn("Could not fetch YouTube accounts list:", err);
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
        const cfg = data.config;
        if (cfg && cfg.channelId) {
          setYtConfig({
            id: cfg.id || "",
            channelId: cfg.channelId || "",
            channelTitle: cfg.channelTitle || "",
            accessToken: cfg.accessToken || "",
            refreshToken: cfg.refreshToken || ""
          });
        } else {
          setYtConfig({
            channelId: "",
            channelTitle: "",
            accessToken: "",
            refreshToken: ""
          });
        }
        if (data.accounts && Array.isArray(data.accounts)) {
          setYoutubeAccounts(data.accounts);
          let chosenId = "";
          if (data.accounts.length === 0) {
            setSelectedYoutubeAccountId("");
          } else {
            const defaultAcc = (accountId && data.accounts.find((a: any) => a.id === accountId))
              || (selectedYoutubeAccountId && data.accounts.find((a: any) => a.id === selectedYoutubeAccountId))
              || data.accounts.find((a: any) => a.isDefault)
              || data.accounts[0];
            chosenId = defaultAcc?.id || "";
            setSelectedYoutubeAccountId(chosenId);
          }

          // If active tab is analytics, trigger analytics with the resolved account ID
          if (activeTab === "analytics") {
            fetchAnalytics(chosenId || undefined);
          }
        }
      } else {
        setYoutubeAccounts([]);
        setSelectedYoutubeAccountId("");
        setYtConfig({ channelId: "", channelTitle: "", accessToken: "", refreshToken: "" });
      }
    } catch (err) {
      console.error("Error fetching YouTube config:", err);
    }
  };

  const handleSwitchYoutubeAccount = async (accountId: string) => {
    try {
      setSelectedYoutubeAccountId(accountId);
      setSelectedVideoForComments(null);
      const acc = youtubeAccounts.find(a => a.id === accountId);
      if (acc) {
        setYtConfig({
          id: acc.id || "",
          channelId: acc.channelId || "",
          channelTitle: acc.channelTitle || "",
          accessToken: acc.accessToken || "",
          refreshToken: acc.refreshToken || ""
        });
      }
      await fetch(`${BACKEND_URL}/api/youtube/set-default`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({ accountId })
      });
      await fetchYoutubeConfig(accountId);
      fetchAnalytics(analyticsDays, accountId);
      fetchVideosShorts(accountId);
      fetchComparative(comparativeDays, accountId);
      fetchDemographics(demographicsDays, accountId);
    } catch (err) {
      console.warn("Error switching YouTube account:", err);
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

  const handleDisconnectYoutube = async (accountId?: string) => {
    if (!confirm("Are you sure you want to disconnect this YouTube Channel? Video comment monitoring and analytics will be stopped.")) return;
    try {
      setYtOauthStatus("connecting");
      const targetId = accountId || selectedYoutubeAccountId || ytConfig.id;
      const res = await fetch(`${BACKEND_URL}/api/youtube/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify(targetId ? { accountId: targetId } : {})
      });
      if (res.ok) {
        setYtConfig({ channelId: "", channelTitle: "", accessToken: "", refreshToken: "" });
        await fetchYoutubeConfig();
        await fetchYoutubeAccounts();
      } else {
        alert("Failed to disconnect YouTube channel.");
      }
    } catch (err: any) {
      alert(`Disconnect Error: ${err.message}`);
    } finally {
      setYtOauthStatus("idle");
    }
  };

  const handleYoutubeOAuthConnect = () => {
    setYtOauthStatus("connecting");
    if (typeof window !== "undefined") {
      window.location.href = `${BACKEND_URL}/api/youtube/oauth/connect?orgId=${getOrgId()}&redirect=${window.location.pathname}`;
    }
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

  const fetchActiveFlow = async (platform: "youtube" = "youtube") => {
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
              platform: node.data?.platform || active.platform || "youtube"
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
          text: "Welcome to our YouTube channel support desk! How can we help you today?",
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
        {/* Top Sub-Nav Navigation Bar */}
        <div className="min-h-12 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 gap-2 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden py-1">
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === "analytics"
                  ? "bg-red-50 text-red-700 border border-red-200 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5 text-red-600" /> Channel Analytics
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("chats_youtube")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === "chats_youtube"
                  ? "bg-red-50 text-red-700 border border-red-200 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-red-600" /> Comments Inbox
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("videos_shorts")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === "videos_shorts"
                  ? "bg-red-50 text-red-700 border border-red-200 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Tv className="h-3.5 w-3.5 text-red-600" /> Shorts vs Videos
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("comparative")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === "comparative"
                  ? "bg-red-50 text-red-700 border border-red-200 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-red-600" /> Comparative MoM
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("demographics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === "demographics"
                  ? "bg-red-50 text-red-700 border border-red-200 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5 text-red-600" /> Demographics &amp; Traffic
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0 py-1">
            <AccountSwitcher
              title="YouTube Channel"
              theme="red"
              align="right"
              addNewAccountText="Link Another YouTube Channel"
              accounts={(() => {
                const sourceList = youtubeAccounts.length > 0
                  ? youtubeAccounts
                  : (ytConfig.channelId ? [{ id: ytConfig.id || "default", channelTitle: ytConfig.channelTitle, channelId: ytConfig.channelId, isDefault: true, isActive: true }] : []);

                // Only show active channels that actually have a channelId / valid authorization
                const activeList = sourceList.filter((acc: any) => acc.isActive !== false && Boolean(acc.channelId));

                // Deduplicate by channelId (or id) so duplicate identical rows never appear
                const seen = new Set<string>();
                const uniqueAccounts: any[] = [];
                for (const acc of activeList) {
                  const key = acc.channelId || acc.id;
                  if (!seen.has(key)) {
                    seen.add(key);
                    uniqueAccounts.push(acc);
                  }
                }

                return uniqueAccounts.map((acc) => ({
                  id: acc.id,
                  label: acc.channelTitle || acc.channelId || "YouTube Channel",
                  sublabel: acc.channelId ? `${acc.channelId} • ${acc.isDefault ? "Primary Channel" : "Linked"}` : (acc.isDefault ? "Primary Channel" : "Linked Channel"),
                  isDefault: acc.isDefault,
                  isActive: acc.isActive !== false,
                  type: "youtube",
                }));
              })()}
              selectedAccountId={selectedYoutubeAccountId}
              onSelectAccount={handleSwitchYoutubeAccount}
              onToggleOpen={fetchYoutubeAccounts}
              onAddNewAccount={handleYoutubeOAuthConnect}
            />

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-red-50 text-red-700 border border-red-200 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Settings className="h-3.5 w-3.5 text-red-600" /> Setup
            </button>
          </div>
        </div>

        {/* TAB 1: CHANNEL OVERVIEW ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-2xs">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-sans tracking-tight">YouTube Channel Performance Overview</h2>
                  <p className="text-xs text-slate-500 mt-0.5">High-level viewership metrics, growth momentum, and daily trend tracking.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                  {[
                    { label: "7D", val: 7 },
                    { label: "28D", val: 28 },
                    { label: "90D", val: 90 },
                    { label: "365D", val: 365 },
                    { label: "Lifetime", val: "lifetime" }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setAnalyticsDays(item.val);
                        fetchAnalytics(item.val);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        analyticsDays === item.val
                          ? "bg-white text-red-600 shadow-2xs border border-slate-200/60"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => fetchAnalytics(analyticsDays)}
                  disabled={loadingAnalytics}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingAnalytics ? "animate-spin text-red-600" : ""}`} /> Refresh
                </button>
              </div>
            </div>

            {loadingAnalytics ? (
              <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3 shadow-xs">
                      <div className="h-3 w-20 bg-slate-100 rounded" />
                      <div className="h-8 w-28 bg-slate-200 rounded-lg" />
                      <div className="h-2.5 w-32 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-40 bg-slate-50 border border-slate-100 rounded-2xl" />
                </div>
              </div>
            ) : analyticsData ? (
              <div className="space-y-6 animate-fadeIn font-sans">
                {/* Summary Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col gap-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Total Views</span>
                      <Eye className="h-4.5 w-4.5 text-red-600" />
                    </div>
                    <span className="text-2xl font-black text-slate-900">
                      {Number(analyticsData.summary?.rows?.[0]?.[0] || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {analyticsDays === "lifetime" ? "All-time summary" : `Last ${analyticsDays} days summary`}
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col gap-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">New Subs</span>
                      <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
                    </div>
                    <span className="text-2xl font-black text-slate-900">
                      {Number(analyticsData.summary?.rows?.[0]?.[3] || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Subscribers gained</span>
                  </div>

                  <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col gap-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Watch Time</span>
                      <Clock className="h-4.5 w-4.5 text-sky-600" />
                    </div>
                    <span className="text-2xl font-black text-slate-900">
                      {Number(analyticsData.summary?.rows?.[0]?.[4] || 0).toLocaleString()} min
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Estimated watched time</span>
                  </div>

                  <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col gap-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Avg Duration</span>
                      <Clock className="h-4.5 w-4.5 text-amber-600" />
                    </div>
                    <span className="text-2xl font-black text-slate-900">
                      {(() => {
                        const totalSec = Number(analyticsData.summary?.rows?.[0]?.[5] || 0);
                        const mins = Math.floor(totalSec / 60);
                        const secs = Math.floor(totalSec % 60);
                        return `${mins}:${secs.toString().padStart(2, "0")}`;
                      })()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Average view duration</span>
                  </div>
                </div>

                {/* Interactive Graph Timeline / Grid */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-red-600" /> Views &amp; Viewership Trend
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {analyticsDays === "lifetime" ? "Daily view counts over channel history" : `Daily view trends over the last ${analyticsDays} days`}
                      </p>
                    </div>
                    {analyticsData.daily?.rows && analyticsData.daily.rows.length > 0 && (
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-600 inline-block" />
                          <span>All-Time Views: {Number(analyticsData.summary?.rows?.[0]?.[0] || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {analyticsData.daily?.rows && analyticsData.daily.rows.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      {/* Chart Area with Gridlines and Y-Axis scale */}
                      {(() => {
                        const rawRows = analyticsData.daily.rows;

                        // Smart clustering logic based on the number of data points
                        // - 7D / <= 14 days: 1 bar per day
                        // - 28D / <= 35 days: 1 bar per day (or group every 2 days if crowded)
                        // - 90D: Group every 5-7 days (weekly buckets, ~13 bars)
                        // - 365D: Group by month (~12 bars)
                        // - Lifetime / > 365 days: Group by month or quarter (~12-24 bars)
                        let displayRows: { label: string; dateRange: string; views: number; likes: number; subs: number }[] = [];

                        if (rawRows.length <= 14) {
                          // Daily
                          displayRows = rawRows.map((r: any) => ({
                            label: r[0]?.substring(5) || "", // "MM-DD"
                            dateRange: r[0] || "",
                            views: Number(r[1] || 0),
                            likes: Number(r[2] || 0),
                            subs: Number(r[4] || 0)
                          }));
                        } else if (rawRows.length <= 35) {
                          // Daily with day number
                          displayRows = rawRows.map((r: any) => ({
                            label: r[0]?.substring(8) || "", // "DD"
                            dateRange: r[0] || "",
                            views: Number(r[1] || 0),
                            likes: Number(r[2] || 0),
                            subs: Number(r[4] || 0)
                          }));
                        } else if (rawRows.length <= 120) {
                          // Cluster into weekly buckets (7 days per bucket)
                          const bucketSize = 7;
                          for (let i = 0; i < rawRows.length; i += bucketSize) {
                            const chunk = rawRows.slice(i, i + bucketSize);
                            const startD = chunk[0]?.[0] || "";
                            const endD = chunk[chunk.length - 1]?.[0] || "";
                            const viewsSum = chunk.reduce((acc: number, cur: any) => acc + Number(cur[1] || 0), 0);
                            const likesSum = chunk.reduce((acc: number, cur: any) => acc + Number(cur[2] || 0), 0);
                            const subsSum = chunk.reduce((acc: number, cur: any) => acc + Number(cur[4] || 0), 0);
                            displayRows.push({
                              label: startD.substring(5), // "MM-DD"
                              dateRange: `${startD} to ${endD}`,
                              views: viewsSum,
                              likes: likesSum,
                              subs: subsSum
                            });
                          }
                        } else {
                          // Monthly buckets (group by YYYY-MM)
                          const monthMap: { [key: string]: { views: number; likes: number; subs: number; count: number } } = {};
                          const monthKeys: string[] = [];

                          for (const r of rawRows) {
                            const dateStr = r[0] || "";
                            const mKey = dateStr.substring(0, 7); // "YYYY-MM"
                            if (!monthMap[mKey]) {
                              monthMap[mKey] = { views: 0, likes: 0, subs: 0, count: 0 };
                              monthKeys.push(mKey);
                            }
                            monthMap[mKey].views += Number(r[1] || 0);
                            monthMap[mKey].likes += Number(r[2] || 0);
                            monthMap[mKey].subs += Number(r[4] || 0);
                            monthMap[mKey].count += 1;
                          }

                          // Filter out empty leading months with 0 views to show the channel's active history cleanly
                          let activeKeys = monthKeys;
                          const firstActiveIdx = monthKeys.findIndex((k) => monthMap[k].views > 0);
                          if (firstActiveIdx > 0) {
                            activeKeys = monthKeys.slice(firstActiveIdx);
                          }

                          // If still more than 24 months, group by quarter (every 3 months) or year
                          if (activeKeys.length > 24) {
                            const bucketSize = Math.ceil(activeKeys.length / 16);
                            for (let i = 0; i < activeKeys.length; i += bucketSize) {
                              const chunkKeys = activeKeys.slice(i, i + bucketSize);
                              const viewsSum = chunkKeys.reduce((acc, k) => acc + monthMap[k].views, 0);
                              const likesSum = chunkKeys.reduce((acc, k) => acc + monthMap[k].likes, 0);
                              const subsSum = chunkKeys.reduce((acc, k) => acc + monthMap[k].subs, 0);
                              const startKey = chunkKeys[0];
                              const endKey = chunkKeys[chunkKeys.length - 1];
                              const [sy, sm] = startKey.split("-");
                              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                              const mLabel = `${monthNames[parseInt(sm, 10) - 1]} '${sy.slice(2)}`;
                              displayRows.push({
                                label: mLabel,
                                dateRange: `${startKey} to ${endKey}`,
                                views: viewsSum,
                                likes: likesSum,
                                subs: subsSum
                              });
                            }
                          } else {
                            displayRows = activeKeys.map((mKey) => {
                              const [year, month] = mKey.split("-");
                              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                              const mIndex = parseInt(month, 10) - 1;
                              const monthLabel = `${monthNames[mIndex] || month} '${year.slice(2)}`;

                              return {
                                label: monthLabel,
                                dateRange: `${monthNames[mIndex] || month} ${year}`,
                                views: monthMap[mKey].views,
                                likes: monthMap[mKey].likes,
                                subs: monthMap[mKey].subs
                              };
                            });
                          }
                        }

                        const maxViews = Math.max(...displayRows.map((r) => r.views), 1);
                        const midViews = Math.round(maxViews / 2);

                        return (
                          <div className="relative">
                            {/* Y-Axis scale background lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 pl-10 pr-2">
                              <div className="border-b border-dashed border-slate-200 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span className="-ml-10">{maxViews.toLocaleString()}</span>
                              </div>
                              <div className="border-b border-dashed border-slate-100 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span className="-ml-10">{midViews.toLocaleString()}</span>
                              </div>
                              <div className="border-b border-slate-200 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span className="-ml-10">0</span>
                              </div>
                            </div>

                            {/* Bar Columns Container */}
                            <div className="h-56 w-full flex items-end justify-between gap-1.5 pt-6 pb-6 pl-10 pr-2">
                              {displayRows.map((item, idx) => {
                                const val = item.views;
                                const likes = item.likes;
                                const subs = item.subs;
                                const dateRange = item.dateRange;
                                const pct = (val / maxViews) * 100;
                                const isPeak = val > 0 && val === maxViews;

                                return (
                                  <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end relative cursor-pointer">
                                    {/* Hover Rich Tooltip Card */}
                                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-95 transition-all duration-150 pointer-events-none z-30">
                                      <div className="bg-slate-900 text-white rounded-xl py-2 px-3 shadow-xl border border-slate-700/60 min-w-32 text-center">
                                        <div className="text-[10px] text-slate-400 font-medium pb-1 border-b border-slate-800">
                                          {dateRange}
                                        </div>
                                        <div className="text-sm font-black text-white pt-1">
                                          {val.toLocaleString()} <span className="text-[10px] font-normal text-slate-300">views</span>
                                        </div>
                                        {likes > 0 && (
                                          <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                                            +{likes} {likes === 1 ? "like" : "likes"}
                                          </div>
                                        )}
                                        {subs > 0 && (
                                          <div className="text-[10px] text-sky-400 font-semibold">
                                            +{subs} {subs === 1 ? "subscriber" : "subscribers"}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Modern Sleek Bar */}
                                    <div className="w-full flex items-end justify-center h-full px-0.5">
                                      <div 
                                        className={`w-full max-w-10 rounded-t-md transition-all duration-200 ${
                                          val > 0
                                            ? isPeak
                                              ? "bg-gradient-to-t from-red-600 to-rose-400 shadow-sm shadow-red-500/30 group-hover:from-red-500 group-hover:to-rose-300"
                                              : "bg-red-500/80 group-hover:bg-red-500"
                                            : "bg-slate-200/50 group-hover:bg-slate-300"
                                        }`}
                                        style={{ height: `${val > 0 ? Math.max(pct, 8) : 4}%` }}
                                      />
                                    </div>

                                    {/* X-Axis Date Label */}
                                    <span className="absolute top-full mt-1.5 text-[9px] text-slate-500 font-medium truncate max-w-full">
                                      {item.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 text-xs py-12">No view activity data recorded for this time range.</div>
                  )}
                </div>

                {/* Top Performing Videos */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <Tv className="h-4.5 w-4.5 text-red-600" /> Top Performing Videos (Last 30 Days)
                  </h3>
                  <div className="divide-y divide-slate-100">
                    {analyticsData.topVideos && analyticsData.topVideos.length > 0 ? (
                      analyticsData.topVideos.map((video) => (
                        <div key={video.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {video.thumbnail ? (
                              <img 
                                src={video.thumbnail} 
                                alt={video.title} 
                                className="h-10 w-16 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0 shadow-2xs" 
                              />
                            ) : (
                              <div className="h-10 w-16 bg-slate-100 border border-slate-200 rounded-xl shrink-0 flex items-center justify-center text-slate-400">
                                <Tv className="h-5 w-5" />
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                                {video.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {video.id}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-right shrink-0">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-900 font-mono">
                                {video.views.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Views</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-900 font-mono">
                                {(video as any).likesHidden || video.likes < 0 ? "Hidden" : video.likes.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Likes</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-400 text-xs py-8">No top performing videos metadata found for this channel.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : analyticsError ? (
              <div className="text-center bg-white border border-red-200 rounded-3xl p-10 flex flex-col items-center gap-3 shadow-xs">
                <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-2xs">
                  <Youtube className="h-7 w-7" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {analyticsError.isDisconnected ? "YouTube Account Disconnected" : "Analytics Error"}
                </h3>
                <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                  {analyticsError.isDisconnected
                    ? "The Google/YouTube authorization has expired or was unlinked. Please reconnect your account to continue receiving analytics, views, and comments."
                    : analyticsError.message}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={handleYoutubeOAuthConnect}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reconnect YouTube Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("settings")}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Go to Settings
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center bg-white border border-slate-200 rounded-3xl p-10 flex flex-col items-center gap-2 shadow-xs">
                <BarChart2 className="h-8 w-8 text-slate-300" />
                <span className="text-sm font-bold text-slate-800">No Analytics Data Available</span>
                <span className="text-xs text-slate-500 max-w-sm">
                  Please verify your credentials in settings and authenticate OAuth with Google YouTube scope to start tracking channel analytics.
                </span>
                <button
                  type="button"
                  onClick={handleYoutubeOAuthConnect}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Youtube className="h-3.5 w-3.5" /> Link YouTube Channel
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMMENTS INBOX & CONTENT FEED */}
        {activeTab === "chats_youtube" && (
          <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
            {selectedVideoForComments ? (
              <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden animate-fadeIn">
                {/* Active Video Header Bar */}
                <div className="p-4 sm:p-5 border-b border-slate-200/90 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-xs">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {selectedVideoForComments.thumbnail && (
                      <div className="relative shrink-0 group">
                        <img 
                          src={selectedVideoForComments.thumbnail} 
                          alt={selectedVideoForComments.title} 
                          className="h-12 w-20 object-cover rounded-xl border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform" 
                        />
                        {selectedVideoForComments.isShort && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[8px] px-1.5 py-0.5 rounded-full shadow-xs">
                            ⚡ SHORT
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-extrabold text-red-600 tracking-wider flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Video Comment Section
                        </span>
                        {selectedVideoForComments.views !== undefined && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {selectedVideoForComments.views.toLocaleString()} views
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate mt-0.5">
                        {selectedVideoForComments.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <a
                      href={`https://www.youtube.com/watch?v=${selectedVideoForComments.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-red-600" />
                      <span className="hidden sm:inline">Watch on YouTube</span>
                    </a>
                    <button
                      onClick={() => fetchVideoComments(selectedVideoForComments.id)}
                      disabled={loadingVideoComments}
                      className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-red-600 transition-all cursor-pointer shadow-2xs"
                      title="Refresh comments"
                    >
                      <RefreshCw className={`h-4 w-4 ${loadingVideoComments ? "animate-spin text-red-600" : ""}`} />
                    </button>
                    <button
                      onClick={() => setSelectedVideoForComments(null)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-extrabold cursor-pointer flex items-center gap-1.5 shadow-2xs hover:border-slate-300 transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Videos
                    </button>
                  </div>
                </div>

                {/* Comments List & Reply Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 max-w-5xl mx-auto w-full scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {loadingVideoComments ? (
                    <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-3xl shadow-xs">
                      <div className="h-10 w-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">Fetching live comments from YouTube...</p>
                        <p className="text-xs text-slate-400">Loading conversation threads and viewer replies</p>
                      </div>
                    </div>
                  ) : videoCommentsDisabled ? (
                    <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-3xl shadow-xs">
                      <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col gap-1 max-w-sm">
                        <span className="text-sm font-bold text-slate-900">Comments Disabled for this Video</span>
                        <span className="text-xs text-slate-500">
                          Comments are turned off in YouTube Studio or restricted for this specific video or Short.
                        </span>
                      </div>
                    </div>
                  ) : videoCommentsData.length === 0 ? (
                    <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-3xl shadow-xs">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">No comments on this video yet</p>
                        <p className="text-xs text-slate-400">When viewers leave comments on YouTube, they will appear here live for instant replies.</p>
                      </div>
                    </div>
                  ) : (
                    videoCommentsData.map((comment: any) => (
                      <div key={comment.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3.5 shadow-xs hover:border-slate-300 transition-all">
                        {/* Comment Author Header */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {comment.authorAvatar ? (
                              <img src={comment.authorAvatar} alt={comment.authorName} className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                                {comment.authorName?.[0]?.toUpperCase() || "U"}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-extrabold text-xs text-slate-900 truncate flex items-center gap-1.5">
                                {comment.authorName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(comment.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {Number(comment.likeCount) > 0 && (
                              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                                <ThumbsUp className="w-3 h-3 text-red-600" /> {comment.likeCount}
                              </span>
                            )}
                            {comment.replies && comment.replies.length > 0 && (
                              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Comment Text Bubble */}
                        <div className="text-xs text-slate-800 leading-relaxed bg-slate-50/90 p-4 rounded-xl border border-slate-200/70 whitespace-pre-wrap font-normal">
                          {comment.text}
                        </div>

                        {/* Threaded Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="pl-4 sm:pl-6 border-l-2 border-red-200 space-y-2.5 mt-3">
                            {comment.replies.map((rep: any) => (
                              <div key={rep.id} className="bg-slate-50/80 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-200/80">
                                <div className="flex items-center gap-2">
                                  {rep.authorAvatar ? (
                                    <img src={rep.authorAvatar} alt={rep.authorName} className="h-5 w-5 rounded-full object-cover border border-slate-200 shrink-0" />
                                  ) : (
                                    <div className="h-5 w-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                                      {rep.authorName?.[0] || "U"}
                                    </div>
                                  )}
                                  <span className="font-extrabold text-[11px] text-slate-900">{rep.authorName}</span>
                                  {rep.publishedAt && (
                                    <span className="text-[9px] text-slate-400">
                                      {new Date(rep.publishedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-700 text-xs pl-7 leading-relaxed">{rep.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline Reply Composer */}
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={replyInputText[comment.id] || ""}
                              onChange={(e) => setReplyInputText({ ...replyInputText, [comment.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handlePostCommentReply(comment.id, selectedVideoForComments.id);
                                }
                              }}
                              placeholder={`Reply to @${comment.authorName}...`}
                              className="flex-1 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition-all outline-none shadow-2xs"
                            />
                            <button
                              onClick={() => handlePostCommentReply(comment.id, selectedVideoForComments.id)}
                              disabled={postingReplyStatus[comment.id] || !replyInputText[comment.id]?.trim()}
                              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-40 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shadow-red-600/20 transition-all shrink-0"
                            >
                              {postingReplyStatus[comment.id] ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  <span>Posting...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="h-3.5 w-3.5" />
                                  <span>Reply</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Quick Emoji Reaction / Pre-made reply chips */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick replies:</span>
                            {[
                              "Thank you so much! 🙏",
                              "Glad you liked it! ❤️",
                              "Thanks for watching! Stay tuned for more ✨",
                              "Great question! Feel free to reach out to us."
                            ].map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setReplyInputText({ ...replyInputText, [comment.id]: preset })}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-slate-600 text-[10px] font-medium transition-all cursor-pointer"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Header Section with Search & Filtering */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                        Channel Videos &amp; Comments Hub
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 pl-10">
                      Manage all comments across your YouTube videos and Shorts in one centralized inbox.
                    </p>
                  </div>

                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Search Bar */}
                    <div className="relative min-w-[220px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={commentsSearchTerm}
                        onChange={(e) => setCommentsSearchTerm(e.target.value)}
                        placeholder="Search video by title..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-red-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 transition-all outline-none"
                      />
                      {commentsSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setCommentsSearchTerm("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Filter Segment Buttons */}
                    {videosShortsData && (
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {[
                          { id: "all", label: `All (${(videosShortsData.videos?.length || 0) + (videosShortsData.shorts?.length || 0)})` },
                          { id: "shorts", label: `⚡ Shorts (${videosShortsData.shorts?.length || 0})` },
                          { id: "videos", label: `📺 Videos (${videosShortsData.videos?.length || 0})` }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setCommentsFilter(item.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              commentsFilter === item.id
                                ? "bg-white text-red-600 shadow-2xs font-extrabold"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Cards Grid */}
                {loadingVideosShorts ? (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-3xl shadow-xs">
                    <RefreshCw className="h-8 w-8 text-red-600 animate-spin" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-800">Loading channel videos and Shorts...</p>
                      <p className="text-xs text-slate-400">Fetching latest content metrics from YouTube API</p>
                    </div>
                  </div>
                ) : videosShortsData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                    {(() => {
                      let allItems = [
                        ...(commentsFilter !== "shorts" ? (videosShortsData.videos || []) : []),
                        ...(commentsFilter !== "videos" ? (videosShortsData.shorts || []) : [])
                      ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

                      if (commentsSearchTerm.trim()) {
                        const term = commentsSearchTerm.toLowerCase();
                        allItems = allItems.filter(item => (item.title || "").toLowerCase().includes(term));
                      }

                      if (allItems.length === 0) {
                        return (
                          <div className="col-span-full p-16 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl shadow-xs">
                            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-800">No content matches your filter</p>
                            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting a different tab.</p>
                          </div>
                        );
                      }

                      return allItems.map((item: any) => {
                        const hasComments = Number(item.comments) > 0;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectVideoForComments(item)}
                            className="bg-white border border-slate-200/90 hover:border-red-400 rounded-2xl p-4 flex flex-col justify-between gap-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-xs hover:shadow-md cursor-pointer group"
                          >
                            {/* Card Top: Thumbnail & Info */}
                            <div className="flex items-start gap-3">
                              <div className="relative shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
                                <img
                                  src={item.thumbnail}
                                  alt={item.title}
                                  className={`object-cover group-hover:scale-105 transition-transform duration-300 ${item.isShort ? "h-20 w-14" : "h-16 w-28"}`}
                                />
                                {item.isShort ? (
                                  <span className="absolute bottom-1 right-1 bg-red-600/90 backdrop-blur-xs text-white font-black text-[8px] px-1.5 py-0.5 rounded shadow-xs">
                                    ⚡ SHORT
                                  </span>
                                ) : (
                                  <span className="absolute bottom-1 right-1 bg-slate-900/80 backdrop-blur-xs text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow-xs">
                                    VIDEO
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col min-w-0 flex-1">
                                <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                                  {item.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-medium mt-1.5">
                                  {new Date(item.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              </div>
                            </div>

                            {/* Card Bottom: Stats & Action CTA */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                              <div className="flex items-center gap-3">
                                <span className="text-slate-600 font-mono text-[11px] font-semibold flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5 text-slate-400" /> {Number(item.views || 0).toLocaleString()}
                                </span>
                                <span className={`font-mono text-[11px] font-semibold flex items-center gap-1 ${hasComments ? "text-red-600 font-bold" : "text-slate-400"}`}>
                                  <MessageSquare className="w-3.5 h-3.5" /> {Number(item.comments || 0).toLocaleString()}
                                </span>
                              </div>

                              <span className={`text-[11px] font-extrabold px-3 py-1 rounded-xl transition-all flex items-center gap-1 ${
                                hasComments 
                                  ? "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white" 
                                  : "text-slate-500 group-hover:text-red-600"
                              }`}>
                                {hasComments ? "View & Reply" : "View"} →
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 text-xs py-16 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
                    <Tv className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-800 text-sm">No YouTube channel connected</p>
                    <p className="text-slate-400 text-xs mt-1">Connect your YouTube channel in settings to load video &amp; Short comment feeds.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === "settings" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 w-full max-w-4xl mx-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-4">
              <div className="h-9 w-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-2xs">
                <Settings className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 font-sans tracking-tight">YouTube Connection Settings</h2>
            </div>

            <form onSubmit={saveYoutubeConfig} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Video className="h-4.5 w-4.5 text-red-600" /> YouTube Channel Configuration
                </h3>
                {ytConfig.refreshToken || ytConfig.channelId ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                    Connected ✓
                  </span>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Linked Channels ({youtubeAccounts.filter((a: any) => a.isActive !== false && Boolean(a.channelId)).length})</span>
                  <button
                    type="button"
                    onClick={handleYoutubeOAuthConnect}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    + Link Another Channel
                  </button>
                </div>

                {(() => {
                  const sourceList = youtubeAccounts.length > 0
                    ? youtubeAccounts
                    : (ytConfig.channelId ? [{ id: ytConfig.id || "default", channelTitle: ytConfig.channelTitle, channelId: ytConfig.channelId, isDefault: true, isActive: true }] : []);

                  const activeList = sourceList.filter((a: any) => a.isActive !== false && Boolean(a.channelId));
                  const seen = new Set<string>();
                  const uniqueList: any[] = [];
                  for (const acc of activeList) {
                    const key = acc.channelId || acc.id;
                    if (!seen.has(key)) {
                      seen.add(key);
                      uniqueList.push(acc);
                    }
                  }

                  if (uniqueList.length === 0) {
                    return (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                        No YouTube channel linked. Click <strong>"Connect YouTube"</strong> below to link your Google YouTube channel.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {uniqueList.map((acc: any) => {
                        const isPrimary = acc.isDefault || acc.id === selectedYoutubeAccountId;
                        return (
                          <div key={acc.id} className={`flex items-center justify-between p-3.5 border rounded-2xl text-xs transition-all ${isPrimary ? "bg-red-50/70 border-red-200" : "bg-slate-50 border-slate-200"}`}>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-red-100 text-red-600">
                                <Video className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900">{acc.channelTitle || acc.channelId || "YouTube Channel"}</span>
                                  {isPrimary && (
                                    <span className="px-2 py-0.5 text-[9px] font-bold text-red-700 bg-red-100 rounded-full border border-red-200">Primary</span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">Channel ID: {acc.channelId}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => handleSwitchYoutubeAccount(acc.id)}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-all cursor-pointer"
                                >
                                  Set Primary
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDisconnectYoutube(acc.id)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] rounded-lg transition-all cursor-pointer"
                              >
                                Disconnect
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-700 font-bold">YouTube Channel ID</label>
                  <input
                    type="text"
                    value={ytConfig.channelId || ""}
                    onChange={(e) => setYtConfig({ ...ytConfig, channelId: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-500 shadow-2xs"
                    placeholder="e.g. UCxxxxxxxxx"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-700 font-bold">OAuth Access Token</label>
                  <input
                    type="text"
                    value={ytConfig.accessToken || ""}
                    onChange={(e) => setYtConfig({ ...ytConfig, accessToken: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-500 shadow-2xs"
                    placeholder="Access Token"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleYoutubeOAuthConnect}
                  disabled={ytOauthStatus === "connecting"}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`h-4 w-4 ${ytOauthStatus === "connecting" ? "animate-spin" : ""}`} />
                  {ytConfig.refreshToken || ytConfig.channelId ? "Reconnect YouTube Account" : "Connect YouTube"}
                </button>

                <button
                  type="submit"
                  disabled={ytSaveStatus === "saving"}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {ytSaveStatus === "saving" ? "Saving..." : ytSaveStatus === "success" ? "Saved Successfully!" : "Save Credentials"}
                </button>
              </div>
            </form>
          </div>
        )}

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
                  onChange={(e) => setSelectedPlatform(e.target.value as "youtube")}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-red-500"
                >
                  <option value="youtube">YouTube Flow</option>
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
                  edgeTypes={edgeTypes}
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
                        placeholder="Type YouTube reply comment..."
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
                    const limit = 13;

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
                                  maxLength={24}
                                />
                                <input 
                                  type="text" 
                                  value={row.description || ""}
                                  onChange={(e) => updateListOptionRow(row.id, row.title, e.target.value)}
                                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-450 text-[10px] focus:outline-none focus:border-emerald-500"
                                  placeholder="Optional description"
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
                        <label className="text-slate-400 font-semibold">Options (Max 13 Buttons)</label>
                        {(!selectedNode.data.buttons || selectedNode.data.buttons.length < 13) && (
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

        {/* TAB 2: SHORTS VS VIDEOS PERFORMANCE */}
        {activeTab === "videos_shorts" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Tv className="h-5 w-5 text-red-600" /> Shorts vs Long-Form Videos Performance
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Compare performance metrics between YouTube Shorts and regular long-form videos. Click any video to view its comment section!
                </p>
              </div>
              <button
                onClick={() => fetchVideosShorts()}
                disabled={loadingVideosShorts}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingVideosShorts ? "animate-spin text-red-600" : ""}`} /> Refresh Data
              </button>
            </div>

            {loadingVideosShorts ? (
              <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 text-red-600 animate-spin" />
                <p className="text-xs font-semibold">Analyzing videos &amp; shorts metrics...</p>
              </div>
            ) : videosShortsData ? (
              <>
                {/* Summary Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Long Videos Count</span>
                    <span className="text-2xl font-black text-slate-900">{videosShortsData.summary?.videoCount || 0}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Total Views: {(videosShortsData.summary?.videoViews || 0).toLocaleString()}</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Shorts Count</span>
                    <span className="text-2xl font-black text-red-600">{videosShortsData.summary?.shortCount || 0}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Total Views: {(videosShortsData.summary?.shortViews || 0).toLocaleString()}</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Avg Video Engagement</span>
                    <span className="text-2xl font-black text-emerald-600">{videosShortsData.summary?.avgVideoEngagement || 0}%</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Likes + Comments / Views</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Avg Shorts Engagement</span>
                    <span className="text-2xl font-black text-sky-600">{videosShortsData.summary?.avgShortEngagement || 0}%</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Likes + Comments / Views</span>
                  </div>
                </div>

                {/* Lists Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* YouTube Shorts List */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <h3 className="font-extrabold text-xs text-red-600 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="flex items-center gap-1.5">⚡ YouTube Shorts Feed ({videosShortsData.shorts?.length || 0})</span>
                      <span className="text-[10px] text-slate-400 font-normal">Click short to open comments</span>
                    </h3>
                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {videosShortsData.shorts && videosShortsData.shorts.length > 0 ? (
                        videosShortsData.shorts.map((short: any) => (
                          <div
                            key={short.id}
                            onClick={() => handleSelectVideoForComments(short)}
                            className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 p-2.5 rounded-2xl transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={short.thumbnail} alt={short.title} className="h-12 w-8 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0 group-hover:scale-105 transition-all shadow-2xs" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-xs text-slate-900 truncate group-hover:text-red-600 transition-all">{short.title}</span>
                                <span className="text-[10px] text-slate-400">Duration: {short.durationSec}s • {new Date(short.publishedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-xs text-slate-900 block">{short.views.toLocaleString()} views</span>
                              <span className="text-[10px] text-red-600 font-bold">{short.engagementRate}% eng</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-slate-400 text-xs py-8">No YouTube Shorts detected on channel.</div>
                      )}
                    </div>
                  </div>

                  {/* Long-Form Videos List */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="flex items-center gap-1.5"><Tv className="h-4 w-4 text-red-600" /> Long-Form Videos ({videosShortsData.videos?.length || 0})</span>
                      <span className="text-[10px] text-slate-400 font-normal">Click video to open comments</span>
                    </h3>
                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {videosShortsData.videos && videosShortsData.videos.length > 0 ? (
                        videosShortsData.videos.map((video: any) => (
                          <div
                            key={video.id}
                            onClick={() => handleSelectVideoForComments(video)}
                            className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 p-2.5 rounded-2xl transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={video.thumbnail} alt={video.title} className="h-10 w-16 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0 group-hover:scale-105 transition-all shadow-2xs" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-xs text-slate-900 truncate group-hover:text-red-600 transition-all">{video.title}</span>
                                <span className="text-[10px] text-slate-400">Duration: {Math.floor(video.durationSec / 60)}m {video.durationSec % 60}s</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-xs text-slate-900 block">{video.views.toLocaleString()} views</span>
                              <span className="text-[10px] text-red-600 font-bold">{video.engagementRate}% eng</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-slate-400 text-xs py-8">No long-form videos found.</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 text-xs py-10 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">Connect your YouTube channel to load Shorts &amp; Videos breakdown.</div>
            )}
          </div>
        )}

        {/* TAB 3: COMPARATIVE MOM ANALYTICS */}
        {activeTab === "comparative" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-600" /> Comparative Performance Analytics
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Compare channel performance metrics against previous time periods (Month-over-Month growth).
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                {[
                  { label: "7 Days", val: 7 },
                  { label: "30 Days", val: 30 },
                  { label: "90 Days", val: 90 },
                  { label: "1 Year", val: 365 },
                  { label: "Lifetime", val: "lifetime" }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setComparativeDays(item.val);
                      fetchComparative(item.val);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      comparativeDays === item.val
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingComparative ? (
              <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 text-red-600 animate-spin" />
                <p className="text-xs font-semibold">Calculating comparative metrics...</p>
              </div>
            ) : comparativeData ? (
              <>
                {/* Growth Badge Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Views */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Views</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        comparativeData.growth?.views >= 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {comparativeData.growth?.views >= 0 ? "+" : ""}{comparativeData.growth?.views}%
                      </span>
                    </div>
                    <span className="text-2xl font-black text-slate-900">{comparativeData.current?.views?.toLocaleString() || 0}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Prev Period: {comparativeData.previous?.views?.toLocaleString() || 0}</span>
                  </div>

                  {/* Net Subs */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Net Subscribers</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        comparativeData.growth?.netSubs >= 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {comparativeData.growth?.netSubs >= 0 ? "+" : ""}{comparativeData.growth?.netSubs}%
                      </span>
                    </div>
                    <span className="text-2xl font-black text-slate-900">+{comparativeData.current?.netSubs || 0}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Prev Period: +{comparativeData.previous?.netSubs || 0}</span>
                  </div>

                  {/* Watch Time */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Watch Time (Hrs)</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        comparativeData.growth?.watchTimeMin >= 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {comparativeData.growth?.watchTimeMin >= 0 ? "+" : ""}{comparativeData.growth?.watchTimeMin}%
                      </span>
                    </div>
                    <span className="text-2xl font-black text-slate-900">{Math.round((comparativeData.current?.watchTimeMin || 0) / 60)} hrs</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Prev Period: {Math.round((comparativeData.previous?.watchTimeMin || 0) / 60)} hrs</span>
                  </div>

                  {/* Likes */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Likes &amp; Engagement</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        comparativeData.growth?.likes >= 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {comparativeData.growth?.likes >= 0 ? "+" : ""}{comparativeData.growth?.likes}%
                      </span>
                    </div>
                    <span className="text-2xl font-black text-slate-900">{comparativeData.current?.likes?.toLocaleString() || 0}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Prev Period: {comparativeData.previous?.likes?.toLocaleString() || 0}</span>
                  </div>
                </div>

                {/* Period Comparison Table */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                    Detailed Comparison: {comparativeData.currentRange?.start} to {comparativeData.currentRange?.end} vs. {comparativeData.previousRange?.start} to {comparativeData.previousRange?.end}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
                      <thead>
                        <tr className="text-slate-500 text-[10px] uppercase font-bold">
                          <th className="py-2.5 px-3">Metric</th>
                          <th className="py-2.5 px-3">Current Period ({comparativeDays}d)</th>
                          <th className="py-2.5 px-3">Previous Period ({comparativeDays}d)</th>
                          <th className="py-2.5 px-3">Growth / Growth Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-3 px-3 font-bold text-slate-900">Views</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{comparativeData.current?.views?.toLocaleString()}</td>
                          <td className="py-3 px-3 font-mono text-slate-500">{comparativeData.previous?.views?.toLocaleString()}</td>
                          <td className={`py-3 px-3 font-bold ${comparativeData.growth?.views >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                            {comparativeData.growth?.views >= 0 ? "+" : ""}{comparativeData.growth?.views}%
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-bold text-slate-900">Subscribers Gained</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">+{comparativeData.current?.subsGained}</td>
                          <td className="py-3 px-3 font-mono text-slate-500">+{comparativeData.previous?.subsGained}</td>
                          <td className="py-3 px-3 font-bold text-slate-700">+{comparativeData.current?.subsGained - comparativeData.previous?.subsGained}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-bold text-slate-900">Subscribers Lost</td>
                          <td className="py-3 px-3 font-mono font-bold text-red-600">-{comparativeData.current?.subsLost}</td>
                          <td className="py-3 px-3 font-mono text-slate-500">-{comparativeData.previous?.subsLost}</td>
                          <td className="py-3 px-3 font-bold text-red-600">-{comparativeData.current?.subsLost - comparativeData.previous?.subsLost}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-bold text-slate-900">Watch Time (Minutes)</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{comparativeData.current?.watchTimeMin?.toLocaleString()} min</td>
                          <td className="py-3 px-3 font-mono text-slate-500">{comparativeData.previous?.watchTimeMin?.toLocaleString()} min</td>
                          <td className={`py-3 px-3 font-bold ${comparativeData.growth?.watchTimeMin >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                            {comparativeData.growth?.watchTimeMin >= 0 ? "+" : ""}{comparativeData.growth?.watchTimeMin}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 text-xs py-10 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">No comparative statistics available.</div>
            )}
          </div>
        )}

        {/* TAB 4: AUDIENCE DEMOGRAPHICS & TRAFFIC SOURCES */}
        {activeTab === "demographics" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-red-600" /> Audience Demographics &amp; Traffic Sources
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Understand your viewer age groups, top geographic regions, traffic acquisition sources, and device types.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                  {[
                    { label: "7D", val: 7 },
                    { label: "28D", val: 28 },
                    { label: "90D", val: 90 },
                    { label: "365D", val: 365 },
                    { label: "Lifetime", val: "lifetime" }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setDemographicsDays(item.val);
                        fetchDemographics(item.val);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        demographicsDays === item.val
                          ? "bg-white text-red-600 shadow-2xs border border-slate-200/60"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => fetchDemographics(demographicsDays)}
                  disabled={loadingDemographics}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingDemographics ? "animate-spin text-red-600" : ""}`} /> Refresh Demographics
                </button>
              </div>
            </div>

            {loadingDemographics ? (
              <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 text-red-600 animate-spin" />
                <p className="text-xs font-semibold">Loading viewer demographics data...</p>
              </div>
            ) : demographicsData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Age & Gender Distribution */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-xs text-red-600 uppercase tracking-wider border-b border-slate-100 pb-3">
                    Viewer Age &amp; Gender Distribution
                  </h3>
                  <div className="space-y-3">
                    {demographicsData.ageGender && demographicsData.ageGender.length > 0 ? (
                      demographicsData.ageGender.map((ag: any, idx: number) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-700 font-bold">
                            <span>{ag.ageGroup} years ({ag.gender})</span>
                            <span className="font-mono text-red-600">{ag.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                            <div className="bg-red-600 h-full rounded-full transition-all" style={{ width: `${Math.min(ag.percentage, 100)}%` }} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-400 text-xs py-6">Age and gender distribution data requires additional channel views.</div>
                    )}
                  </div>
                </div>

                {/* Top Countries */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-xs text-red-600 uppercase tracking-wider border-b border-slate-100 pb-3">
                    Top Viewing Countries
                  </h3>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {demographicsData.countries && demographicsData.countries.length > 0 ? (
                      demographicsData.countries.map((c: any, idx: number) => (
                        <div key={idx} className="py-3 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{c.country}</span>
                          <div className="text-right font-mono">
                            <span className="text-slate-900 font-bold block">{c.views.toLocaleString()} views</span>
                            <span className="text-[10px] text-slate-400">{c.watchTimeMin} min watch time</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-400 text-xs py-6">No country breakdown data available.</div>
                    )}
                  </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-xs text-red-600 uppercase tracking-wider border-b border-slate-100 pb-3">
                    Traffic Acquisition Sources
                  </h3>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {demographicsData.trafficSources && demographicsData.trafficSources.length > 0 ? (
                      demographicsData.trafficSources.map((ts: any, idx: number) => (
                        <div key={idx} className="py-3 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{ts.sourceType?.replace("YT_", "")?.replace("_", " ")}</span>
                          <div className="text-right font-mono">
                            <span className="text-slate-900 font-bold block">{ts.views.toLocaleString()} views</span>
                            <span className="text-[10px] text-slate-400">{ts.watchTimeMin} min watch time</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-400 text-xs py-6">No traffic source data available.</div>
                    )}
                  </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-xs text-red-600 uppercase tracking-wider border-b border-slate-100 pb-3">
                    Device Types Breakdown
                  </h3>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {demographicsData.devices && demographicsData.devices.length > 0 ? (
                      demographicsData.devices.map((d: any, idx: number) => (
                        <div key={idx} className="py-3 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{d.deviceType}</span>
                          <div className="text-right font-mono">
                            <span className="text-slate-900 font-bold block">{d.views.toLocaleString()} views</span>
                            <span className="text-[10px] text-slate-400">{d.watchTimeMin} min watch time</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-400 text-xs py-6">No device breakdown data available.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs py-10 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">No demographics statistics available.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
