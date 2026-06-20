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
  ArrowLeft
} from "lucide-react";
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
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"chats_whatsapp" | "chats_instagram" | "flows" | "settings">("chats_whatsapp");
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

  // Instagram Config
  const [igConfig, setIgConfig] = useState<InstagramConfig>({
    instagramAccountId: "",
    pageId: "",
    pageAccessToken: ""
  });
  const [igSaveStatus, setIgSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [selectedPlatform, setSelectedPlatform] = useState<"whatsapp" | "instagram">("whatsapp");
  const [settingsSubTab, setSettingsSubTab] = useState<"whatsapp" | "instagram">("whatsapp");

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

  // Interactive UI pickers and Simulation States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulateText, setSimulateText] = useState("");
  const [activeListMenuMsgId, setActiveListMenuMsgId] = useState<string | null>(null);

  // Settings States
  const [config, setConfig] = useState<WhatsAppConfig>({
    phoneNumberId: "",
    wabaId: "",
    accessToken: "",
    webhookVerifyToken: "loading-token-verify"
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

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

  const handleSimulateInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulateText.trim() || !activeConv) return;
    
    const text = simulateText;
    setSimulateText("");
    setShowSimulator(false);

    try {
      const isWhatsApp = (activeConv.platform || "whatsapp") === "whatsapp";
      let mockPayload;
      let endpoint;

      if (isWhatsApp) {
        endpoint = `${BACKEND_URL}/api/webhook/whatsapp`;
        mockPayload = {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "123456789",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "15550000000",
                      phone_number_id: config.phoneNumberId || "100000000000000",
                    },
                    contacts: [
                      {
                        profile: {
                          name: activeConv.customerName || "Simulated Customer",
                        },
                        wa_id: activeConv.customerPhone,
                      },
                    ],
                    messages: [
                      {
                        from: activeConv.customerPhone,
                        id: `wamid.Simulated_${Date.now()}`,
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        text: {
                          body: text,
                        },
                        type: "text",
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        };
      } else {
        endpoint = `${BACKEND_URL}/api/webhook/instagram`;
        mockPayload = {
          object: "page",
          entry: [
            {
              id: igConfig.pageId || "100000000000000_ig",
              time: Date.now(),
              messaging: [
                {
                  sender: {
                    id: activeConv.customerPhone,
                  },
                  recipient: {
                    id: igConfig.pageId || "100000000000000_ig",
                  },
                  timestamp: Date.now(),
                  message: {
                    mid: `m_Simulated_${Date.now()}`,
                    text: text,
                  },
                },
              ],
            },
          ],
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockPayload),
      });

      if (res.ok) {
        fetchConversations();
        fetchMessages(activeConv.id);
      }
    } catch (err) {
      console.error("Failed to simulate inbound message:", err);
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
    fetchConfig();
    fetchInstagramConfig();
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

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/config`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
      });
      const data = await res.json();
      if (data) {
        setConfig(data);
      }
    } catch (err) {
      console.error("Error fetching config:", err);
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
          "x-organization-id": DEFAULT_ORG_ID
        },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      setSaveStatus("error");
    }
  };

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

  const fetchActiveFlow = async (platform: "whatsapp" | "instagram" = "whatsapp") => {
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
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* 1. SIDEBAR NAVIGATION — hidden on mobile, shown on sm+ */}
      <aside className="hidden sm:flex w-16 flex-col items-center py-6 border-r border-slate-800 bg-slate-950 gap-8 justify-between shrink-0">
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 border border-slate-800 flex items-center justify-center bg-slate-950">
            <img src="/icon.jpeg" alt="Jisnu Logo" className="h-full w-full object-cover" />
          </div>
          
          <button 
            onClick={() => setActiveTab("chats_whatsapp")}
            className={`p-3 rounded-xl transition-all duration-200 relative group ${activeTab === "chats_whatsapp" ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"}`}
          >
            <WhatsApp className="h-5 w-5" />
            <span className="absolute left-16 scale-0 bg-slate-950 text-xs text-slate-200 py-1 px-2 rounded-md group-hover:scale-100 transition-all shadow-md z-50">WhatsApp Chats</span>
          </button>

          <button 
            onClick={() => setActiveTab("chats_instagram")}
            className={`p-3 rounded-xl transition-all duration-200 relative group ${activeTab === "chats_instagram" ? "bg-pink-500/10 text-pink-400" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"}`}
          >
            <Instagram className="h-5 w-5" />
            <span className="absolute left-16 scale-0 bg-slate-950 text-xs text-slate-200 py-1 px-2 rounded-md group-hover:scale-100 transition-all shadow-md z-50">Instagram Chats</span>
          </button>

          <button 
            onClick={() => setActiveTab("flows")}
            className={`p-3 rounded-xl transition-all duration-200 relative group ${activeTab === "flows" ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"}`}
          >
            <GitMerge className="h-5 w-5" />
            <span className="absolute left-16 scale-0 bg-slate-950 text-xs text-slate-200 py-1 px-2 rounded-md group-hover:scale-100 transition-all shadow-md z-50">Flows</span>
          </button>
        </div>

        <button 
          onClick={() => setActiveTab("settings")}
          className={`p-3 rounded-xl transition-all duration-200 relative group ${activeTab === "settings" ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"}`}
        >
          <Settings className="h-5 w-5" />
          <span className="absolute left-16 scale-0 bg-slate-950 text-xs text-slate-200 py-1 px-2 rounded-md group-hover:scale-100 transition-all shadow-md z-50">Settings</span>
        </button>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950 border-t border-slate-800 flex items-center justify-around safe-bottom">
        <button
          onClick={() => { setActiveTab("chats_whatsapp"); setMobileChatOpen(false); }}
          className={`flex flex-col items-center gap-0.5 py-3 px-4 flex-1 transition-all ${
            activeTab === "chats_whatsapp" ? "text-emerald-400" : "text-slate-500"
          }`}
        >
          <WhatsApp className="h-5 w-5" />
          <span className="text-[9px] font-semibold tracking-wide">WhatsApp</span>
        </button>
        <button
          onClick={() => { setActiveTab("chats_instagram"); setMobileChatOpen(false); }}
          className={`flex flex-col items-center gap-0.5 py-3 px-4 flex-1 transition-all ${
            activeTab === "chats_instagram" ? "text-pink-400" : "text-slate-500"
          }`}
        >
          <Instagram className="h-5 w-5" />
          <span className="text-[9px] font-semibold tracking-wide">Instagram</span>
        </button>
        <button
          onClick={() => { setActiveTab("flows"); setMobileChatOpen(false); }}
          className={`flex flex-col items-center gap-0.5 py-3 px-4 flex-1 transition-all ${
            activeTab === "flows" ? "text-primary" : "text-slate-500"
          }`}
        >
          <GitMerge className="h-5 w-5" />
          <span className="text-[9px] font-semibold tracking-wide">Flows</span>
        </button>
        <button
          onClick={() => { setActiveTab("settings"); setMobileChatOpen(false); }}
          className={`flex flex-col items-center gap-0.5 py-3 px-4 flex-1 transition-all ${
            activeTab === "settings" ? "text-primary" : "text-slate-500"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[9px] font-semibold tracking-wide">Settings</span>
        </button>
      </nav>

      {/* 2. MAIN CONTENT BODY */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 pb-[calc(env(safe-area-inset-bottom)+56px)] sm:pb-0">
        
        {/* TAB 1: REAL-TIME CHATS PANEL */}
        {(activeTab === "chats_whatsapp" || activeTab === "chats_instagram") && (() => {
          const currentPlatform = activeTab === "chats_whatsapp" ? "whatsapp" : "instagram";
          const filteredConversations = conversations.filter(c => (c.platform || "whatsapp") === currentPlatform);
          const isInstagramTab = activeTab === "chats_instagram";

          return (
            <div className="flex h-full w-full overflow-hidden">
              {/* Conversations Sidebar — full screen on mobile when no chat open, fixed width on desktop */}
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

              {/* Chat Conversation Pane — full screen on mobile when chat open */}
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
                        {/* Bot status badge — hidden on very small screens, visible on sm+ */}
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
                        {/* Compact bot status icon — mobile only */}
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

                        <button
                          type="button"
                          onClick={() => setShowSimulator(!showSimulator)}
                          className="text-xs font-semibold px-2.5 sm:px-4 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center gap-1.5"
                        >
                          <User className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                          <span className="hidden sm:inline">Simulate Reply</span>
                        </button>
                      </div>
                    </div>

                    {/* Customer Input Simulator Overlay Bar */}
                    {showSimulator && (
                      <form onSubmit={handleSimulateInbound} className="bg-slate-950/90 border-b border-slate-850 p-3 flex gap-2 items-center z-10 shrink-0">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">Simulator Mode</span>
                        <input
                          type="text"
                          value={simulateText}
                          onChange={(e) => setSimulateText(e.target.value)}
                          placeholder="Type a message to simulate the customer replying..."
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          autoFocus
                        />
                        <button type="submit" className="bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded text-xs hover:bg-emerald-400 shrink-0">
                          Inbound Send
                        </button>
                        <button type="button" onClick={() => setShowSimulator(false)} className="text-slate-400 hover:text-slate-200 text-xs px-2 shrink-0">
                          Cancel
                        </button>
                      </form>
                    )}
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
                                            <button
                                              key={index}
                                              type="button"
                                              onClick={() => {
                                                setSimulateText(btnTitle);
                                                setShowSimulator(true);
                                              }}
                                              className={`w-full bg-white hover:bg-slate-50 active:bg-slate-100 ${btnTextColor} border border-slate-200 shadow-sm text-xs font-bold py-2 px-4 rounded-xl transition-all duration-150 text-center hover:shadow flex items-center justify-center gap-1.5 cursor-pointer`}
                                            >
                                              <Bot className={`h-3 w-3 ${btnIconColor}`} />
                                              {btnTitle}
                                            </button>
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
                                                <button
                                                  key={index}
                                                  type="button"
                                                  onClick={() => {
                                                    setSimulateText(rowText);
                                                    setShowSimulator(true);
                                                    setActiveListMenuMsgId(null);
                                                  }}
                                                  className={`w-full text-left bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs py-2 px-3 rounded-lg border border-slate-800/60 ${
                                                    activeConv?.platform === "instagram" ? "hover:border-pink-500/50" : "hover:border-emerald-500/50"
                                                  } transition-all duration-150 flex items-center justify-between cursor-pointer`}
                                                >
                                                  <span className="truncate pr-2">{rowText}</span>
                                                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                                </button>
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
                          ×
                        </button>
                      </div>
                    )}

                    {/* Message input bar */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/30 flex items-center gap-3 relative">
                      
                      {/* EMOJI PICKER POPUP */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-16 left-4 bg-slate-950 border border-slate-800 rounded-xl p-3 grid grid-cols-5 gap-2 shadow-2xl z-50">
                          {["😀", "😂", "😍", "👍", "🙏", "🔥", "🚀", "❤️", "👏", "🎉"].map((emoji) => (
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
                                  ×
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
                              ×
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <Settings className="h-6 w-6 text-emerald-400" /> Settings & Integrations
              </h2>
              
              {/* Secondary sub-tabs selector */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 self-start sm:self-auto shadow-inner">
                <button
                  type="button"
                  onClick={() => setSettingsSubTab("whatsapp")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${settingsSubTab === "whatsapp" ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <WhatsApp className="h-3.5 w-3.5" /> WhatsApp Setup
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab("instagram")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${settingsSubTab === "instagram" ? "bg-pink-500 text-white shadow-md shadow-pink-500/10 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <Instagram className="h-3.5 w-3.5" /> Instagram Setup
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Configuration Inputs */}
              <div className="md:col-span-2 space-y-6">
                {settingsSubTab === "whatsapp" ? (
                  <>
                    {/* WhatsApp Credentials Form */}
                    <form onSubmit={saveConfig} className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl animate-fadeIn">
                      <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Key className="h-4.5 w-4.5 text-emerald-400" /> WhatsApp API Credentials
                      </h3>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-semibold">Phone Number ID</label>
                        <input
                          type="text"
                          value={config.phoneNumberId}
                          onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                          placeholder="e.g. 1048473820293"
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-semibold">WhatsApp Business Account ID (WABA ID)</label>
                        <input
                          type="text"
                          value={config.wabaId}
                          onChange={(e) => setConfig({ ...config, wabaId: e.target.value })}
                          placeholder="e.g. 1048473820999"
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-semibold">System User Access Token (Permanent)</label>
                        <textarea
                          value={config.accessToken}
                          onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                          placeholder="Paste EAAG... permanent access token here"
                          rows={4}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="submit"
                          disabled={saveStatus === "saving"}
                          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                        >
                          <Save className="h-4 w-4" />
                          {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved Successfully!" : "Save WhatsApp Credentials"}
                        </button>
                        
                        {saveStatus === "error" && (
                          <span className="text-xs text-red-400 font-medium">Failed to save settings.</span>
                        )}
                      </div>
                    </form>

                    {/* WhatsApp Webhook Integration */}
                    <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl animate-fadeIn">
                      <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Database className="h-4.5 w-4.5 text-emerald-400" /> WhatsApp Webhook Configuration
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Provide the following parameters inside your Meta Developer Console configuration settings under the <strong>WhatsApp Webhook</strong> product parameters list.
                      </p>

                      <div className="flex flex-col gap-1 bg-slate-900/50 p-3.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Webhook Callback URL</span>
                        <span className="text-xs text-slate-200 font-mono truncate">{`${BACKEND_URL}/api/webhook/whatsapp`}</span>
                      </div>

                      <div className="flex flex-col gap-1 bg-slate-900/50 p-3.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Verify Token</span>
                        <span className="text-xs text-slate-200 font-mono truncate">{config.webhookVerifyToken}</span>
                      </div>

                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 flex gap-3">
                        <Bot className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-emerald-300">Important Webhook Fields</span>
                          <span className="text-[11px] text-slate-400">
                            In your Meta Portal, configure and subscribe to the <strong>messages</strong> and <strong>message_deliveries</strong> webhook fields.
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Instagram Credentials Form */}
                    <form onSubmit={saveInstagramConfig} className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl animate-fadeIn">
                      <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Instagram className="h-4.5 w-4.5 text-pink-500" /> Instagram DM Credentials
                      </h3>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-semibold">Instagram Business Account ID</label>
                        <input
                          type="text"
                          value={igConfig.instagramAccountId}
                          onChange={(e) => setIgConfig({ ...igConfig, instagramAccountId: e.target.value })}
                          placeholder="e.g. 17841401234567890"
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-semibold">Facebook Page ID</label>
                        <input
                          type="text"
                          value={igConfig.pageId}
                          onChange={(e) => setIgConfig({ ...igConfig, pageId: e.target.value })}
                          placeholder="e.g. 10203040506070"
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-semibold">Page Access Token (Permanent)</label>
                        <textarea
                          value={igConfig.pageAccessToken}
                          onChange={(e) => setIgConfig({ ...igConfig, pageAccessToken: e.target.value })}
                          placeholder="Paste Page Access Token here"
                          rows={4}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-mono text-xs"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="submit"
                          disabled={igSaveStatus === "saving"}
                          className="bg-pink-500 hover:bg-pink-400 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-pink-500/10 cursor-pointer"
                        >
                          <Save className="h-4 w-4" />
                          {igSaveStatus === "saving" ? "Saving..." : igSaveStatus === "success" ? "Saved Successfully!" : "Save Instagram Credentials"}
                        </button>
                        
                        {igSaveStatus === "error" && (
                          <span className="text-xs text-red-400 font-medium">Failed to save settings.</span>
                        )}
                      </div>
                    </form>

                    {/* Instagram Webhook Integration */}
                    <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl animate-fadeIn">
                      <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Database className="h-4.5 w-4.5 text-pink-400" /> Instagram Webhook Configuration
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Provide the following parameters inside your Meta Developer Console configuration settings under the <strong>Instagram Webhook</strong> product parameters list.
                      </p>

                      <div className="flex flex-col gap-1 bg-slate-900/50 p-3.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Webhook Callback URL</span>
                        <span className="text-xs text-slate-200 font-mono truncate">{`${BACKEND_URL}/api/webhook/instagram`}</span>
                      </div>

                      <div className="flex flex-col gap-1 bg-slate-900/50 p-3.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Verify Token</span>
                        <span className="text-xs text-slate-200 font-mono truncate">{config.webhookVerifyToken}</span>
                      </div>

                      <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-3.5 flex gap-3">
                        <Bot className="h-5 w-5 text-pink-400 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-pink-300">Important Webhook Fields</span>
                          <span className="text-[11px] text-slate-400">
                            In your Meta Portal, configure and subscribe to the <strong>messages</strong> and <strong>messaging_postbacks</strong> webhook fields under the <strong>Instagram</strong> section.
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Quick instructions sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-emerald-400" /> Setup Instructions
                  </h4>
                  
                  {settingsSubTab === "whatsapp" ? (
                    <ul className="text-xs text-slate-400 space-y-3.5 pl-4 list-decimal marker:text-emerald-500 marker:font-bold animate-fadeIn">
                      <li>
                        Create a Meta Developer app under your Meta developer account.
                      </li>
                      <li>
                        Add the <strong>WhatsApp</strong> product to your Meta Developer app.
                      </li>
                      <li>
                        Generate a <strong>Permanent System User Access Token</strong> in your Meta Business settings with permission: <code className="text-[10px] bg-slate-800 text-slate-200 p-0.5 px-1 rounded">whatsapp_business_messaging</code>.
                      </li>
                      <li>
                        Under WhatsApp settings, copy your <strong>Phone Number ID</strong> and <strong>WhatsApp Business Account ID</strong> and paste them on the credentials form.
                      </li>
                      <li>
                        Register the unique WhatsApp Callback URL and Verify Token in your Meta Dashboard.
                      </li>
                    </ul>
                  ) : (
                    <ul className="text-xs text-slate-400 space-y-3.5 pl-4 list-decimal marker:text-pink-500 marker:font-bold animate-fadeIn">
                      <li>
                        Create a Meta Developer app under your Meta developer account.
                      </li>
                      <li>
                        Add the <strong>Messenger</strong> product to your Meta Developer app.
                      </li>
                      <li>
                        Generate a <strong>Permanent System User Access Token</strong> in your Meta Business settings with permissions: <code className="text-[10px] bg-slate-800 text-slate-200 p-0.5 px-1 rounded">instagram_basic</code>.
                      </li>
                      <li>
                        Link your Facebook Page and Instagram Business Account under your Meta Portal, select your Page, and copy the <strong>Facebook Page ID</strong> and <strong>Instagram Business ID</strong> to save here.
                      </li>
                      <li>
                        Register the unique Instagram Callback URL and Verify Token in your Meta Dashboard under Webhook settings.
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
