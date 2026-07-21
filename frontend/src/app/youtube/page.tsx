"use client";

import React, { useState, useEffect, useRef } from "react";
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

const nodeTypes = {
  welcomeNode: WelcomeNodeComponent,
  textNode: TextNodeComponent,
  buttonsNode: ButtonsNodeComponent,
  listNode: ListNodeComponent,
  questionNode: QuestionNodeComponent,
  mediaNode: MediaNodeComponent,
};

// Configure backend base URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_ORG_ID = "demo-org-123";

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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"chats_youtube" | "videos_shorts" | "comparative" | "demographics" | "flows" | "analytics" | "settings">("analytics");
  // Mobile: track whether user has opened a conversation (to show chat view vs list on small screens)
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "chats_youtube" || tab === "videos_shorts" || tab === "comparative" || tab === "demographics" || tab === "flows" || tab === "analytics" || tab === "settings") {
        setActiveTab(tab as any);
      }

      const oauth = params.get("oauth");
      if (oauth === "success") {
        setSettingsSubTab("google");
        setGoogleOauthStatus("success");
        setTimeout(() => setGoogleOauthStatus("idle"), 3000);
        window.history.replaceState({}, document.title, window.location.pathname + "?tab=settings");
      } else if (oauth === "error") {
        setSettingsSubTab("google");
        setGoogleOauthStatus("error");
        setTimeout(() => setGoogleOauthStatus("idle"), 3000);
        window.history.replaceState({}, document.title, window.location.pathname + "?tab=settings");
      }
    }
  }, []);

  // Video-Specific Comment Filtering State
  const [selectedVideoForComments, setSelectedVideoForComments] = useState<{ id: string; title: string; thumbnail: string; views?: number } | null>(null);
  const [videoCommentsData, setVideoCommentsData] = useState<any[]>([]);
  const [videoCommentsDisabled, setVideoCommentsDisabled] = useState<boolean>(false);
  const [loadingVideoComments, setLoadingVideoComments] = useState(false);
  const [commentsFilter, setCommentsFilter] = useState<"all" | "shorts" | "videos">("all");

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

  // YouTube Config
  interface YouTubeConfig {
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
      socket.emit("join-org", DEFAULT_ORG_ID);
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
    if (activeTab === "videos_shorts") {
      fetchVideosShorts();
    } else if (activeTab === "comparative") {
      fetchComparative(comparativeDays);
    } else if (activeTab === "demographics") {
      fetchDemographics();
    } else if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab, comparativeDays]);

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
        headers: { "x-organization-id": DEFAULT_ORG_ID }
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
      const res = await fetch(`${BACKEND_URL}/api/admin/conversations/${convId}/messages`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/youtube/analytics`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Error fetching YouTube Analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchVideoComments = async (videoId: string) => {
    setLoadingVideoComments(true);
    setVideoCommentsDisabled(false);
    try {
      const res = await fetch(`${BACKEND_URL}/api/youtube/comments/video/${videoId}`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
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

  const fetchVideosShorts = async () => {
    setLoadingVideosShorts(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/youtube/analytics/videos-shorts`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
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

  const fetchComparative = async (days: number | string = 30) => {
    setLoadingComparative(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/youtube/analytics/comparative?days=${days}`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
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

  const fetchDemographics = async () => {
    setLoadingDemographics(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/youtube/analytics/demographics`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
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
          "x-organization-id": DEFAULT_ORG_ID
        },
        body: JSON.stringify({ parentId: commentId, videoId, text })
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
        headers: { "x-organization-id": DEFAULT_ORG_ID }
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
          "x-organization-id": DEFAULT_ORG_ID
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

  const fetchYoutubeConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/youtube/config`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
      });
      const data = await res.json();
      if (data) {
        setYtConfig(data);
      }
    } catch (err) {
      console.error("Error fetching YouTube config:", err);
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
          "x-organization-id": DEFAULT_ORG_ID
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
    if (typeof window !== "undefined") {
      window.location.href = `${BACKEND_URL}/api/youtube/oauth/connect?orgId=${DEFAULT_ORG_ID}&redirect=${window.location.pathname}`;
    }
  };

  const fetchGoogleConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/config?orgId=${DEFAULT_ORG_ID}`);
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
          "x-organization-id": DEFAULT_ORG_ID
        },
        body: JSON.stringify({ 
          orgId: DEFAULT_ORG_ID, 
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
      window.location.href = `${BACKEND_URL}/api/gmb/oauth/connect?orgId=${DEFAULT_ORG_ID}`;
    }
  };

  const fetchActiveFlow = async (platform: "youtube" = "youtube") => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/flows?platform=${platform}`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
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
          "x-organization-id": DEFAULT_ORG_ID
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
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* 2. MAIN CONTENT BODY */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 pb-[calc(env(safe-area-inset-bottom)+56px)] sm:pb-0">
        {/* Top Sub-Nav Navigation Bar */}
        <div className="h-12 border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5 text-red-400" /> Channel Analytics
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("chats_youtube")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "chats_youtube"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-red-400" /> Comments Inbox
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("videos_shorts")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "videos_shorts"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Tv className="h-3.5 w-3.5 text-red-400" /> Shorts vs Videos
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("comparative")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "comparative"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-red-400" /> Comparative MoM
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("demographics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "demographics"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5 text-red-400" /> Demographics & Traffic
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Settings className="h-3.5 w-3.5 text-red-400" /> Setup
            </button>
          </div>
        </div>

        {/* TAB 1: CHANNEL OVERVIEW ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <BarChart2 className="h-6 w-6 text-red-500" />
                <h2 className="text-xl font-bold text-slate-100 font-sans uppercase tracking-wider">YouTube Channel Performance Overview</h2>
              </div>
              <button
                onClick={fetchAnalytics}
                disabled={loadingAnalytics}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingAnalytics ? "animate-spin" : ""}`} /> Refresh Analytics
              </button>
            </div>

            {loadingAnalytics ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw className="h-8 w-8 text-red-500 animate-spin" />
                <span className="text-xs text-slate-400 font-sans">Fetching YouTube Analytics data...</span>
              </div>
            ) : analyticsData ? (
              <div className="space-y-6 animate-fadeIn font-sans">
                {/* Summary Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-1.5 shadow-md">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Total Views</span>
                      <Eye className="h-4.5 w-4.5 text-red-400" />
                    </div>
                    <span className="text-2xl font-bold text-slate-100">
                      {Number(analyticsData.summary?.rows?.[0]?.[0] || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">Last 30 days summary</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-1.5 shadow-md">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-wider">New Subs</span>
                      <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />
                    </div>
                    <span className="text-2xl font-bold text-slate-100">
                      {Number(analyticsData.summary?.rows?.[0]?.[3] || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">Subscribers gained</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-1.5 shadow-md">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Watch Time</span>
                      <Clock className="h-4.5 w-4.5 text-sky-400" />
                    </div>
                    <span className="text-2xl font-bold text-slate-100">
                      {Number(analyticsData.summary?.rows?.[0]?.[4] || 0).toLocaleString()} min
                    </span>
                    <span className="text-[10px] text-slate-500">Estimated watched time</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-1.5 shadow-md">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Avg Duration</span>
                      <Clock className="h-4.5 w-4.5 text-amber-400" />
                    </div>
                    <span className="text-2xl font-bold text-slate-100">
                      {(() => {
                        const totalSec = Number(analyticsData.summary?.rows?.[0]?.[5] || 0);
                        const mins = Math.floor(totalSec / 60);
                        const secs = Math.floor(totalSec % 60);
                        return `${mins}:${secs.toString().padStart(2, "0")}`;
                      })()}
                    </span>
                    <span className="text-[10px] text-slate-500">Average view duration</span>
                  </div>
                </div>

                {/* Interactive Graph Timeline / Grid */}
                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl">
                  <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-4">Views Timeline</h3>
                  {analyticsData.daily?.rows && analyticsData.daily.rows.length > 0 ? (
                    <div className="h-48 w-full flex items-end justify-between gap-1 pt-6 pb-2 px-2 border-b border-l border-slate-800">
                      {analyticsData.daily.rows.map((row: any, idx: number) => {
                        const maxViews = Math.max(...(analyticsData.daily.rows.map((r: any) => Number(r[1] || 0))) || [1]);
                        const val = Number(row[1] || 0);
                        const pct = (val / (maxViews || 1)) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
                            <div className="relative w-full flex justify-center">
                              <span className="absolute bottom-full mb-1 bg-slate-950 text-slate-200 border border-slate-800 px-1.5 py-0.5 rounded text-[9px] scale-0 group-hover:scale-100 transition-all font-mono z-20">
                                {val} views
                              </span>
                            </div>
                            <div 
                              className="w-full bg-red-600/80 group-hover:bg-red-500 rounded-t-sm transition-all"
                              style={{ height: `${Math.max(pct, 4)}%` }}
                            />
                            <span className="text-[8px] text-slate-600 mt-2 font-mono hidden md:block">
                              {row[0]?.substring(8)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 text-xs py-10">No daily timeline statistics rows available.</div>
                  )}
                </div>

                {/* Top Performing Videos */}
                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
                    <Tv className="h-4.5 w-4.5 text-red-500" /> Top Performing Videos (Last 30 Days)
                  </h3>
                  <div className="divide-y divide-slate-850">
                    {analyticsData.topVideos && analyticsData.topVideos.length > 0 ? (
                      analyticsData.topVideos.map((video) => (
                        <div key={video.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {video.thumbnail ? (
                              <img 
                                src={video.thumbnail} 
                                alt={video.title} 
                                className="h-10 w-16 object-cover rounded bg-slate-900 border border-slate-850 shrink-0" 
                              />
                            ) : (
                              <div className="h-10 w-16 bg-slate-900 border border-slate-850 rounded shrink-0 flex items-center justify-center text-slate-600">
                                <Tv className="h-5 w-5" />
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-200 truncate max-w-[200px] sm:max-w-md">
                                {video.title}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ID: {video.id}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-right shrink-0">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-200 font-mono">
                                {video.views.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Views</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-200 font-mono">
                                {(video as any).likesHidden || video.likes < 0 ? "Hidden" : video.likes.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Likes</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 text-xs py-8">No top performing videos metadata found for this channel.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center bg-slate-900/40 border border-slate-850 rounded-2xl p-10 flex flex-col items-center gap-2">
                <BarChart2 className="h-8 w-8 text-slate-600" />
                <span className="text-sm font-semibold text-slate-400">No Analytics Data Available</span>
                <span className="text-xs text-slate-500 max-w-sm">
                  Please verify your credentials in settings and authenticate OAuth with Google YouTube scope to start tracking channel analytics.
                </span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMMENTS INBOX & CONTENT FEED */}
        {activeTab === "chats_youtube" && (
          <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
            {selectedVideoForComments ? (
              <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {selectedVideoForComments.thumbnail && (
                      <img src={selectedVideoForComments.thumbnail} alt={selectedVideoForComments.title} className="h-10 w-16 object-cover rounded-lg border border-slate-800 shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Video Comment Section</span>
                      <h3 className="font-bold text-sm text-slate-100 truncate">{selectedVideoForComments.title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVideoForComments(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    ← Back to All Videos & Shorts
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {loadingVideoComments ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
                      <RefreshCw className="h-6 w-6 text-red-500 animate-spin" />
                      <p className="text-xs">Loading video comments...</p>
                    </div>
                  ) : videoCommentsDisabled ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3 bg-slate-950/40 border border-slate-850 rounded-2xl">
                      <AlertCircle className="h-8 w-8 text-amber-500" />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-200">Comments Disabled for this Video</span>
                        <span className="text-xs text-slate-400 max-w-sm">
                          Comments are turned off or disabled on YouTube for this specific video/short.
                        </span>
                      </div>
                    </div>
                  ) : videoCommentsData.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
                      <MessageSquare className="h-8 w-8 text-slate-600" />
                      <p className="text-xs">No comments found for this video.</p>
                    </div>
                  ) : (
                    videoCommentsData.map((comment: any) => (
                      <div key={comment.id} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {comment.authorAvatar ? (
                              <img src={comment.authorAvatar} alt={comment.authorName} className="h-7 w-7 rounded-full object-cover border border-slate-800 shrink-0" />
                            ) : (
                              <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                                {comment.authorName?.[0] || "U"}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-xs text-slate-200 truncate">{comment.authorName}</span>
                              <span className="text-[10px] text-slate-500">{new Date(comment.publishedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-500/20">
                            👍 {comment.likeCount || 0}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-850">
                          {comment.text}
                        </p>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="pl-4 border-l-2 border-slate-800 space-y-2 mt-2">
                            {comment.replies.map((rep: any) => (
                              <div key={rep.id} className="bg-slate-900/40 p-2.5 rounded-lg text-xs space-y-1">
                                <span className="font-bold text-slate-300">{rep.authorName}</span>
                                <p className="text-slate-400">{rep.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline Reply Input */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-850">
                          <input
                            type="text"
                            value={replyInputText[comment.id] || ""}
                            onChange={(e) => setReplyInputText({ ...replyInputText, [comment.id]: e.target.value })}
                            placeholder="Type a reply to this viewer..."
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500"
                          />
                          <button
                            onClick={() => handlePostCommentReply(comment.id, selectedVideoForComments.id)}
                            disabled={postingReplyStatus[comment.id]}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Send className="h-3 w-3" /> Reply
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-red-500" /> Channel Videos & Comments Hub
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Select any video or Short to open its comment section and reply to viewers.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  {videosShortsData && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {[
                        { id: "all", label: `All Content (${(videosShortsData.videos?.length || 0) + (videosShortsData.shorts?.length || 0)})` },
                        { id: "shorts", label: `⚡ Shorts (${videosShortsData.shorts?.length || 0})` },
                        { id: "videos", label: `📺 Videos (${videosShortsData.videos?.length || 0})` }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setCommentsFilter(item.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            commentsFilter === item.id
                              ? "bg-red-600 text-white font-bold shadow-md shadow-red-500/10"
                              : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {loadingVideosShorts ? (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-2">
                    <RefreshCw className="h-8 w-8 text-red-500 animate-spin" />
                    <p className="text-xs font-semibold">Loading channel videos and Shorts...</p>
                  </div>
                ) : videosShortsData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      const allItems = [
                        ...(commentsFilter !== "shorts" ? (videosShortsData.videos || []) : []),
                        ...(commentsFilter !== "videos" ? (videosShortsData.shorts || []) : [])
                      ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

                      if (allItems.length === 0) {
                        return (
                          <div className="col-span-full p-12 text-center text-slate-500">
                            No content found for the selected filter.
                          </div>
                        );
                      }

                      return allItems.map((item: any) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectVideoForComments(item)}
                          className="bg-slate-950/40 border border-slate-800 hover:border-red-500/40 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all duration-200 hover:scale-[1.01] shadow-lg cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className={`object-cover rounded-lg border border-slate-800 ${item.isShort ? "h-16 w-11" : "h-14 w-24"}`}
                              />
                              {item.isShort && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[9px] px-1 rounded shadow">
                                  ⚡ SHORT
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-xs text-slate-200 truncate group-hover:text-red-400 transition-colors">
                                {item.title}
                              </span>
                              <span className="text-[10px] text-slate-500 mt-1">
                                {new Date(item.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-850 pt-3 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400 font-mono text-[11px]">
                                👁️ {item.views.toLocaleString()}
                              </span>
                              <span className="text-slate-400 font-mono text-[11px]">
                                💬 {item.comments.toLocaleString()}
                              </span>
                            </div>

                            <span className="text-[10px] font-bold text-red-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                              View Comments →
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 text-xs py-10">
                    Connect your YouTube channel to load video & Short comment feeds.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === "settings" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 w-full max-w-4xl mx-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <Settings className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-bold text-slate-100 font-sans uppercase tracking-wider">YouTube Connection Settings</h2>
            </div>

            <form onSubmit={saveYoutubeConfig} className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Video className="h-4.5 w-4.5 text-red-500" /> YouTube Channel Configuration
                </h3>
                {ytConfig.refreshToken || ytConfig.channelId ? (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                    Connected ✓
                  </span>
                ) : null}
              </div>

              {(ytConfig.refreshToken || ytConfig.channelId) && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Connected Account</span>
                    <span className="text-sm font-bold text-slate-200">
                      {ytConfig.channelTitle || ytConfig.channelId || "Connected YouTube Channel"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Channel ID: {ytConfig.channelId || "N/A"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setYtConfig({ channelId: "", channelTitle: "", accessToken: "", refreshToken: "" });
                      saveYoutubeConfig({ preventDefault: () => {} } as any);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all cursor-pointer shrink-0"
                  >
                    Disconnect
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold">YouTube Channel ID</label>
                  <input
                    type="text"
                    value={ytConfig.channelId || ""}
                    onChange={(e) => setYtConfig({ ...ytConfig, channelId: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500"
                    placeholder="e.g. UCxxxxxxxxx"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold">OAuth Access Token</label>
                  <input
                    type="text"
                    value={ytConfig.accessToken || ""}
                    onChange={(e) => setYtConfig({ ...ytConfig, accessToken: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500"
                    placeholder="Access Token"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-850 pt-4">
                <button
                  type="button"
                  onClick={handleYoutubeOAuthConnect}
                  disabled={ytOauthStatus === "connecting"}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md shadow-red-500/10 flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`h-4.5 w-4.5 ${ytOauthStatus === "connecting" ? "animate-spin" : ""}`} />
                  {ytConfig.refreshToken || ytConfig.channelId ? "Reconnect YouTube Account" : "Connect YouTube"}
                </button>

                <button
                  type="submit"
                  disabled={ytSaveStatus === "saving"}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Tv className="h-5 w-5 text-amber-400" /> Shorts vs Long-Form Videos Performance
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Compare performance metrics between YouTube Shorts and regular long-form videos. Click any video to view its comment section!
                </p>
              </div>
              <button
                onClick={fetchVideosShorts}
                disabled={loadingVideosShorts}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingVideosShorts ? "animate-spin" : ""}`} /> Refresh Data
              </button>
            </div>

            {loadingVideosShorts ? (
              <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
                <p className="text-xs font-semibold">Analyzing videos & shorts metrics...</p>
              </div>
            ) : videosShortsData ? (
              <>
                {/* Summary Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Long Videos Count</span>
                    <span className="text-2xl font-black text-slate-100">{videosShortsData.summary?.videoCount || 0}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Total Views: {(videosShortsData.summary?.videoViews || 0).toLocaleString()}</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Shorts Count</span>
                    <span className="text-2xl font-black text-amber-400">{videosShortsData.summary?.shortCount || 0}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Total Views: {(videosShortsData.summary?.shortViews || 0).toLocaleString()}</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Avg Video Engagement</span>
                    <span className="text-2xl font-black text-emerald-400">{videosShortsData.summary?.avgVideoEngagement || 0}%</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Likes + Comments / Views</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Avg Shorts Engagement</span>
                    <span className="text-2xl font-black text-sky-400">{videosShortsData.summary?.avgShortEngagement || 0}%</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Likes + Comments / Views</span>
                  </div>
                </div>

                {/* Lists Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* YouTube Shorts List */}
                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                    <h3 className="font-bold text-xs text-red-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="flex items-center gap-1.5">⚡ YouTube Shorts Feed ({videosShortsData.shorts?.length || 0})</span>
                      <span className="text-[10px] text-slate-500 font-normal">Click short to open comments</span>
                    </h3>
                    <div className="divide-y divide-slate-850 max-h-96 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {videosShortsData.shorts && videosShortsData.shorts.length > 0 ? (
                        videosShortsData.shorts.map((short: any) => (
                          <div
                            key={short.id}
                            onClick={() => handleSelectVideoForComments(short)}
                            className="py-3 flex items-center justify-between gap-3 hover:bg-slate-900/60 p-2 rounded-xl transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={short.thumbnail} alt={short.title} className="h-12 w-8 object-cover rounded bg-slate-900 border border-slate-800 shrink-0 group-hover:scale-105 transition-all" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-xs text-slate-200 truncate group-hover:text-red-400 transition-all">{short.title}</span>
                                <span className="text-[10px] text-slate-500">Duration: {short.durationSec}s • {new Date(short.publishedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-xs text-slate-200 block">{short.views.toLocaleString()} views</span>
                              <span className="text-[10px] text-red-400 font-semibold">{short.engagementRate}% eng</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-slate-500 text-xs py-8">No YouTube Shorts detected on channel.</div>
                      )}
                    </div>
                  </div>

                  {/* Long-Form Videos List */}
                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                    <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="flex items-center gap-1.5"><Tv className="h-4 w-4 text-red-500" /> Long-Form Videos ({videosShortsData.videos?.length || 0})</span>
                      <span className="text-[10px] text-slate-500 font-normal">Click video to open comments</span>
                    </h3>
                    <div className="divide-y divide-slate-850 max-h-96 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {videosShortsData.videos && videosShortsData.videos.length > 0 ? (
                        videosShortsData.videos.map((video: any) => (
                          <div
                            key={video.id}
                            onClick={() => handleSelectVideoForComments(video)}
                            className="py-3 flex items-center justify-between gap-3 hover:bg-slate-900/60 p-2 rounded-xl transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={video.thumbnail} alt={video.title} className="h-10 w-16 object-cover rounded bg-slate-900 border border-slate-800 shrink-0 group-hover:scale-105 transition-all" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-xs text-slate-200 truncate group-hover:text-red-400 transition-all">{video.title}</span>
                                <span className="text-[10px] text-slate-500">Duration: {Math.floor(video.durationSec / 60)}m {video.durationSec % 60}s</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-xs text-slate-200 block">{video.views.toLocaleString()} views</span>
                              <span className="text-[10px] text-red-400 font-semibold">{video.engagementRate}% eng</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-slate-500 text-xs py-8">No long-form videos found.</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 text-xs py-10">Connect your YouTube channel to load Shorts & Videos breakdown.</div>
            )}
          </div>
        )}

        {/* TAB 3: COMPARATIVE MOM ANALYTICS */}
        {activeTab === "comparative" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-500" /> Comparative Performance Analytics
                </h2>
                <p className="text-xs text-slate-400 mt-1">
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
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      comparativeDays === item.val
                        ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/20"
                        : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingComparative ? (
              <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 text-red-500 animate-spin" />
                <p className="text-xs font-semibold">Calculating comparative metrics...</p>
              </div>
            ) : comparativeData ? (
              <>
                {/* Growth Badge Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Views */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Views</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        comparativeData.growth?.views >= 0
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {comparativeData.growth?.views >= 0 ? "+" : ""}{comparativeData.growth?.views}%
                      </span>
                    </div>
                    <span className="text-2xl font-black text-slate-100">{comparativeData.current?.views?.toLocaleString() || 0}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Prev Period: {comparativeData.previous?.views?.toLocaleString() || 0}</span>
                  </div>

                  {/* Net Subs */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Net Subscribers</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        comparativeData.growth?.netSubs >= 0
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {comparativeData.growth?.netSubs >= 0 ? "+" : ""}{comparativeData.growth?.netSubs}%
                      </span>
                    </div>
                    <span className="text-2xl font-black text-slate-100">+{comparativeData.current?.netSubs || 0}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Prev Period: +{comparativeData.previous?.netSubs || 0}</span>
                  </div>

                  {/* Watch Time */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Watch Time (Hrs)</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        comparativeData.growth?.watchTimeMin >= 0
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {comparativeData.growth?.watchTimeMin >= 0 ? "+" : ""}{comparativeData.growth?.watchTimeMin}%
                      </span>
                    </div>
                    <span className="text-2xl font-black text-slate-100">{Math.round((comparativeData.current?.watchTimeMin || 0) / 60)} hrs</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Prev Period: {Math.round((comparativeData.previous?.watchTimeMin || 0) / 60)} hrs</span>
                  </div>

                  {/* Likes */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Likes & Engagement</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        comparativeData.growth?.likes >= 0
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {comparativeData.growth?.likes >= 0 ? "+" : ""}{comparativeData.growth?.likes}%
                      </span>
                    </div>
                    <span className="text-2xl font-black text-slate-100">{comparativeData.current?.likes?.toLocaleString() || 0}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Prev Period: {comparativeData.previous?.likes?.toLocaleString() || 0}</span>
                  </div>
                </div>

                {/* Period Comparison Table */}
                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                    Detailed Comparison: {comparativeData.currentRange?.start} to {comparativeData.currentRange?.end} vs. {comparativeData.previousRange?.start} to {comparativeData.previousRange?.end}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-850">
                      <thead>
                        <tr className="text-slate-500 text-[10px] uppercase font-bold">
                          <th className="py-2.5 px-3">Metric</th>
                          <th className="py-2.5 px-3">Current Period ({comparativeDays}d)</th>
                          <th className="py-2.5 px-3">Previous Period ({comparativeDays}d)</th>
                          <th className="py-2.5 px-3">Growth / Growth Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/50">
                        <tr>
                          <td className="py-3 px-3 font-semibold text-slate-200">Views</td>
                          <td className="py-3 px-3 font-mono">{comparativeData.current?.views?.toLocaleString()}</td>
                          <td className="py-3 px-3 font-mono text-slate-500">{comparativeData.previous?.views?.toLocaleString()}</td>
                          <td className={`py-3 px-3 font-bold ${comparativeData.growth?.views >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {comparativeData.growth?.views >= 0 ? "+" : ""}{comparativeData.growth?.views}%
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-semibold text-slate-200">Subscribers Gained</td>
                          <td className="py-3 px-3 font-mono">+{comparativeData.current?.subsGained}</td>
                          <td className="py-3 px-3 font-mono text-slate-500">+{comparativeData.previous?.subsGained}</td>
                          <td className="py-3 px-3 font-bold text-slate-300">+{comparativeData.current?.subsGained - comparativeData.previous?.subsGained}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-semibold text-slate-200">Subscribers Lost</td>
                          <td className="py-3 px-3 font-mono text-red-400">-{comparativeData.current?.subsLost}</td>
                          <td className="py-3 px-3 font-mono text-slate-500">-{comparativeData.previous?.subsLost}</td>
                          <td className="py-3 px-3 font-bold text-slate-400">-{comparativeData.current?.subsLost - comparativeData.previous?.subsLost}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-semibold text-slate-200">Watch Time (Minutes)</td>
                          <td className="py-3 px-3 font-mono">{comparativeData.current?.watchTimeMin?.toLocaleString()} min</td>
                          <td className="py-3 px-3 font-mono text-slate-500">{comparativeData.previous?.watchTimeMin?.toLocaleString()} min</td>
                          <td className={`py-3 px-3 font-bold ${comparativeData.growth?.watchTimeMin >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {comparativeData.growth?.watchTimeMin >= 0 ? "+" : ""}{comparativeData.growth?.watchTimeMin}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 text-xs py-10">No comparative statistics available.</div>
            )}
          </div>
        )}

        {/* TAB 4: AUDIENCE DEMOGRAPHICS & TRAFFIC SOURCES */}
        {activeTab === "demographics" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-red-500" /> Audience Demographics & Traffic Sources
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Understand your viewer age groups, top geographic regions, traffic acquisition sources, and device types.
                </p>
              </div>
              <button
                onClick={fetchDemographics}
                disabled={loadingDemographics}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingDemographics ? "animate-spin" : ""}`} /> Refresh Demographics
              </button>
            </div>

            {loadingDemographics ? (
              <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 text-red-500 animate-spin" />
                <p className="text-xs font-semibold">Loading viewer demographics data...</p>
              </div>
            ) : demographicsData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Age & Gender Distribution */}
                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <h3 className="font-bold text-xs text-red-400 uppercase tracking-wider border-b border-slate-850 pb-2">
                    Viewer Age & Gender Distribution
                  </h3>
                  <div className="space-y-3">
                    {demographicsData.ageGender && demographicsData.ageGender.length > 0 ? (
                      demographicsData.ageGender.map((ag: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-300 font-medium">
                            <span>{ag.ageGroup} years ({ag.gender})</span>
                            <span className="font-mono text-red-400">{ag.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                            <div className="bg-red-600 h-full rounded-full transition-all" style={{ width: `${Math.min(ag.percentage, 100)}%` }} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 text-xs py-6">Age and gender distribution data requires additional channel views.</div>
                    )}
                  </div>
                </div>

                {/* Top Countries */}
                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <h3 className="font-bold text-xs text-red-400 uppercase tracking-wider border-b border-slate-850 pb-2">
                    Top Viewing Countries
                  </h3>
                  <div className="divide-y divide-slate-850 max-h-72 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {demographicsData.countries && demographicsData.countries.length > 0 ? (
                      demographicsData.countries.map((c: any, idx: number) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">{c.country}</span>
                          <div className="text-right font-mono">
                            <span className="text-slate-300 block">{c.views.toLocaleString()} views</span>
                            <span className="text-[10px] text-slate-500">{c.watchTimeMin} min watch time</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 text-xs py-6">No country breakdown data available.</div>
                    )}
                  </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <h3 className="font-bold text-xs text-red-400 uppercase tracking-wider border-b border-slate-850 pb-2">
                    Traffic Acquisition Sources
                  </h3>
                  <div className="divide-y divide-slate-850 max-h-72 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {demographicsData.trafficSources && demographicsData.trafficSources.length > 0 ? (
                      demographicsData.trafficSources.map((ts: any, idx: number) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">{ts.sourceType?.replace("YT_", "")?.replace("_", " ")}</span>
                          <div className="text-right font-mono">
                            <span className="text-slate-300 block">{ts.views.toLocaleString()} views</span>
                            <span className="text-[10px] text-slate-500">{ts.watchTimeMin} min watch time</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 text-xs py-6">No traffic source data available.</div>
                    )}
                  </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <h3 className="font-bold text-xs text-red-400 uppercase tracking-wider border-b border-slate-850 pb-2">
                    Device Types Breakdown
                  </h3>
                  <div className="divide-y divide-slate-850 max-h-72 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {demographicsData.devices && demographicsData.devices.length > 0 ? (
                      demographicsData.devices.map((d: any, idx: number) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">{d.deviceType}</span>
                          <div className="text-right font-mono">
                            <span className="text-slate-300 block">{d.views.toLocaleString()} views</span>
                            <span className="text-[10px] text-slate-500">{d.watchTimeMin} min watch time</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 text-xs py-6">No device breakdown data available.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs py-10">No demographics statistics available.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
