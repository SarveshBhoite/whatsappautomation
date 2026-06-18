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
  Database,
  CornerUpLeft,
  Video,
  Headphones
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

// -------------------------------------------------------------
// WhatsApp Styled Flow Builder Custom Nodes
// -------------------------------------------------------------

const TextNodeComponent = ({ data }: any) => (
  <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[200px] text-xs">
    <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-2.5 !h-2.5" />
    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
      <MessageSquare className="h-3 w-3 text-emerald-400" /> Text Response
    </div>
    <div className="text-slate-200 line-clamp-3 bg-slate-900/40 p-2 rounded border border-slate-850/60 leading-relaxed font-sans whitespace-pre-wrap">
      {data.text || <span className="text-slate-500 italic">No text message defined</span>}
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-2.5 !h-2.5" />
  </div>
);

const ButtonsNodeComponent = ({ data }: any) => (
  <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[220px] text-xs flex flex-col gap-2">
    <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-2.5 !h-2.5" />
    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
      <Bot className="h-3 w-3 text-emerald-400" /> WhatsApp Buttons
    </div>
    <div className="text-slate-300 font-medium bg-slate-900/40 p-2 rounded border border-slate-850/60 whitespace-pre-wrap">
      {data.text || <span className="text-slate-500 italic">Type button header message...</span>}
    </div>
    
    <div className="flex flex-col gap-1.5 mt-1">
      {data.buttons?.map((btn: any) => (
        <div key={btn.id} className="relative bg-slate-900 border border-slate-800/80 rounded py-1.5 px-3 text-center text-[10px] text-emerald-400 font-semibold shadow-sm border-l-2 border-l-emerald-500">
          {btn.title}
          <Handle 
            type="source" 
            position={Position.Right} 
            id={btn.id} 
            className="!bg-emerald-400 !w-2 !h-2 -mr-1" 
          />
        </div>
      ))}
      {(!data.buttons || data.buttons.length === 0) && (
        <span className="text-[9px] text-slate-500 italic text-center">Add options buttons on the right</span>
      )}
    </div>
  </div>
);

const ListNodeComponent = ({ data }: any) => (
  <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[200px] text-xs">
    <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-2.5 !h-2.5" />
    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
      <FileText className="h-3 w-3 text-emerald-400" /> List Menu Options
    </div>
    <div className="text-slate-200 line-clamp-2 bg-slate-900/40 p-2 rounded border border-slate-850/60 leading-relaxed font-sans mb-2">
      {data.text || <span className="text-slate-500 italic">No description text</span>}
    </div>
    <div className="bg-slate-900 border border-slate-800 rounded py-1 px-3 text-center text-[10px] text-slate-300 font-semibold">
      Menu: {data.listButtonText || "View Menu"}
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-2.5 !h-2.5" />
  </div>
);

const QuestionNodeComponent = ({ data }: any) => (
  <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[200px] text-xs">
    <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-2.5 !h-2.5" />
    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
      <User className="h-3 w-3 text-emerald-400" /> Collect Input Question
    </div>
    <div className="text-slate-200 line-clamp-2 bg-slate-900/40 p-2 rounded border border-slate-850/60 leading-relaxed font-sans mb-2">
      {data.text || <span className="text-slate-500 italic">No question defined</span>}
    </div>
    <div className="bg-amber-500/10 rounded px-2 py-1 border border-amber-500/20 text-[9px] text-amber-400 font-mono flex items-center gap-1 justify-center">
      <Database className="h-3 w-3 text-amber-500" /> Save: {data.variableName || "user_input"}
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-2.5 !h-2.5" />
  </div>
);

const WelcomeNodeComponent = ({ data }: any) => (
  <div className="bg-slate-800 border-2 border-emerald-500 rounded-xl p-3 shadow-lg min-w-[200px] text-xs">
    <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
      <Bot className="h-3.5 w-3.5" /> Welcome Node (Root)
    </div>
    <div className="text-slate-200 line-clamp-2 bg-slate-900/40 p-2 rounded border border-slate-850/60 leading-relaxed font-sans">
      {data.text || <span className="text-slate-500 italic">No welcome greeting defined</span>}
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-2.5 !h-2.5" />
  </div>
);

const MediaNodeComponent = ({ data }: any) => {
  const isVideo = data.mediaType === "video";
  const isAudio = data.mediaType === "audio";
  const isDoc = data.mediaType === "document";

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-lg min-w-[200px] text-xs">
      <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-2.5 !h-2.5" />
      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
        {isDoc ? <FileText className="h-3 w-3 text-emerald-400" /> :
         isVideo ? <Video className="h-3 w-3 text-emerald-400" /> :
         isAudio ? <Headphones className="h-3 w-3 text-emerald-400" /> :
         <ImageIcon className="h-3 w-3 text-emerald-400" />}
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
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-2.5 !h-2.5" />
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
  updatedAt: string;
}

interface WhatsAppConfig {
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  webhookVerifyToken: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"chats" | "flows" | "settings">("chats");
  
  // Real-time Chat States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    if (currentBtns.length >= 3) return;
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
      const mockPayload = {
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

      const res = await fetch(`${BACKEND_URL}/api/webhook/whatsapp`, {
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
    fetchActiveFlow();

    return () => {
      socket.disconnect();
    };
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const fetchActiveFlow = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/flows`, {
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
          setNodes(graph.nodes);
          setEdges(graph.edges || []);
        }
      } else {
        // Initialize flow template if database is empty
        initializeDefaultGraph();
      }
    } catch (err) {
      console.error("Error fetching flows:", err);
      initializeDefaultGraph();
    }
  };

  const initializeDefaultGraph = () => {
    setNodes([
      { id: "welcome_1", type: "input", data: { label: "1. Welcome (Inbound trigger)" }, position: { x: 250, y: 50 } },
      { id: "buttons_1", type: "default", data: { label: "2. Selection Buttons:\n- Pricing\n- Support" }, position: { x: 250, y: 150 } },
      { id: "pricing_reply", type: "output", data: { label: "3. Pricing info text response" }, position: { x: 100, y: 280 } },
      { id: "support_menu", type: "output", data: { label: "4. Show list options menu" }, position: { x: 400, y: 280 } },
    ] as any);
    setEdges([
      { id: "e1-2", source: "welcome_1", target: "buttons_1" },
      { id: "e2-3", source: "buttons_1", target: "pricing_reply", label: "Option: Pricing" },
      { id: "e2-4", source: "buttons_1", target: "support_menu", label: "Option: Support" }
    ]);
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
          isActive: true
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
      data.listSections = [];
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
        label: `${nodes.length + 1}. ${label}` 
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-16 flex flex-col items-center py-6 border-r border-slate-800 bg-slate-950 gap-8 justify-between">
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold text-lg">
            Ω
          </div>
          
          <button 
            onClick={() => setActiveTab("chats")}
            className={`p-3 rounded-xl transition-all duration-200 relative group ${activeTab === "chats" ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"}`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute left-16 scale-0 bg-slate-950 text-xs text-slate-200 py-1 px-2 rounded-md group-hover:scale-100 transition-all shadow-md z-50">Chats</span>
          </button>

          <button 
            onClick={() => setActiveTab("flows")}
            className={`p-3 rounded-xl transition-all duration-200 relative group ${activeTab === "flows" ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"}`}
          >
            <GitMerge className="h-5 w-5" />
            <span className="absolute left-16 scale-0 bg-slate-950 text-xs text-slate-200 py-1 px-2 rounded-md group-hover:scale-100 transition-all shadow-md z-50">Flows</span>
          </button>
        </div>

        <button 
          onClick={() => setActiveTab("settings")}
          className={`p-3 rounded-xl transition-all duration-200 relative group ${activeTab === "settings" ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"}`}
        >
          <Settings className="h-5 w-5" />
          <span className="absolute left-16 scale-0 bg-slate-950 text-xs text-slate-200 py-1 px-2 rounded-md group-hover:scale-100 transition-all shadow-md z-50">Settings</span>
        </button>
      </aside>

      {/* 2. MAIN CONTENT BODY */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
        
        {/* TAB 1: REAL-TIME CHATS PANEL */}
        {activeTab === "chats" && (
          <div className="flex h-full w-full overflow-hidden">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r border-slate-800 bg-slate-950/40 flex flex-col h-full">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  Inbox
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-normal">
                    {conversations.length} active
                  </span>
                </h2>
              </div>
              
              {/* Conversation items list */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                    <MessageSquare className="h-8 w-8 stroke-1" />
                    <p className="text-xs">No active chats found.</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const lastMsg = conv.messages?.[0];
                    const isSelected = activeConv?.id === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`p-4 flex flex-col gap-1 cursor-pointer transition-all duration-150 border-l-2 ${isSelected ? "bg-slate-800/40 border-emerald-500" : "hover:bg-slate-850/50 border-transparent"}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-200 text-sm truncate">
                            {conv.customerName || conv.customerPhone}
                          </span>
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
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
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

            {/* Chat Conversation Pane */}
            <div className="flex-1 flex flex-col h-full bg-slate-900 relative">
              {activeConv ? (
                <>
                  {/* Chat header */}
                  <div className="h-16 border-b border-slate-800 bg-slate-950/30 px-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold border border-slate-700">
                        {activeConv.customerName ? activeConv.customerName[0].toUpperCase() : "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-slate-200">
                          {activeConv.customerName || "WhatsApp User"}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-500" /> {activeConv.customerPhone}
                        </span>
                      </div>
                    </div>

                    {/* Bot active / pause controllers */}
                    <div className="flex items-center gap-3">
                      <div className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 border transition-all ${activeConv.isBotPaused ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
                        {activeConv.isBotPaused ? (
                          <>
                            <User className="h-3.5 w-3.5" />
                            <span>Bot is Paused (Manual Control)</span>
                          </>
                        ) : (
                          <>
                            <Bot className="h-3.5 w-3.5" />
                            <span>Bot is Active (Automating Replies)</span>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleBot(!activeConv.isBotPaused)}
                        className={`text-xs font-semibold px-4 py-1.5 rounded-lg border transition-all ${activeConv.isBotPaused ? "bg-emerald-500 border-emerald-600 hover:bg-emerald-400 text-slate-950" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"}`}
                      >
                        {activeConv.isBotPaused ? "Resume Chatbot" : "Pause Chatbot"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSimulator(!showSimulator)}
                        className="text-xs font-semibold px-4 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center gap-1.5"
                      >
                        <User className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> Simulate Reply
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
                        const parts = msg.content.split("|buttons:");
                        messageBody = parts[0];
                        buttonsArray = parts[1]?.split(", ") || [];
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
                            <div className={`rounded-2xl px-4 py-2.5 shadow-md flex flex-col gap-1 ${isInbound ? "bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none" : "bg-emerald-500 text-slate-950 font-medium rounded-tr-none"}`}>
                              {msg.senderName && !isInbound && (
                                <span className="text-[9px] uppercase tracking-wider text-slate-800/70 font-semibold mb-0.5">
                                  {msg.senderName}
                                </span>
                              )}
                              
                              {/* Render Quoted Reply Box inside Bubble */}
                              {hasQuote && (
                                <div className={`border-l-4 rounded px-2 py-1 mb-1.5 text-[10px] leading-snug truncate ${isInbound ? "bg-slate-900/40 border-slate-500 text-slate-400" : "bg-emerald-600/30 border-emerald-950 text-slate-900"}`}>
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
                                      {buttonsArray.map((btnTitle, index) => (
                                        <button
                                          key={index}
                                          type="button"
                                          onClick={() => {
                                            setSimulateText(btnTitle);
                                            setShowSimulator(true);
                                          }}
                                          className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 text-emerald-600 border border-slate-200 shadow-sm text-xs font-bold py-2 px-4 rounded-xl transition-all duration-150 text-center hover:shadow flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                          <Bot className="h-3 w-3 text-emerald-500" />
                                          {btnTitle}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Ticks status and time */}
                              <div className={`flex items-center gap-1 justify-end self-end text-[9px] mt-1 ${isInbound ? "text-slate-500" : "text-slate-800/80"}`}>
                                <span>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {!isInbound && (
                                  <span>
                                    {msg.status === "sent" && <Check className="h-3 w-3 text-slate-700" />}
                                    {msg.status === "delivered" && <CheckCheck className="h-3 w-3 text-slate-700" />}
                                    {msg.status === "read" && <CheckCheck className="h-3 w-3 text-emerald-950" />}
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
                    <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-xl border border-emerald-500/20">
                      <Bot className="h-10 w-10 stroke-1" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-100">WhatsApp Sales & Support CRM</h3>
                    <p className="text-sm text-slate-400">
                      Select an active conversation from the sidebar inbox to view the chat, monitor live bot flows, or reply manually to leads.
                    </p>
                  </div>
                </div>
              )}
            </div>
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
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5"
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

                  {/* If buttons node, manage button options */}
                  {selectedNode.type === "buttonsNode" && (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-400 font-semibold">Options (Max 3 Buttons)</label>
                        {(!selectedNode.data.buttons || selectedNode.data.buttons.length < 3) && (
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
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-6">
              <Settings className="h-6 w-6 text-emerald-400" /> Settings & WhatsApp Onboarding
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Configuration Inputs */}
              <div className="md:col-span-2 space-y-6">
                <form onSubmit={saveConfig} className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Key className="h-4.5 w-4.5 text-emerald-400" /> Meta Developer Credentials
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
                      className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-emerald-500/10"
                    >
                      <Save className="h-4 w-4" />
                      {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved Successfully!" : "Save Credentials"}
                    </button>
                    
                    {saveStatus === "error" && (
                      <span className="text-xs text-red-400 font-medium">Failed to save settings.</span>
                    )}
                  </div>
                </form>

                {/* Webhook parameters display */}
                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Database className="h-4.5 w-4.5 text-emerald-400" /> Webhook Integration
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
              </div>

              {/* Quick instructions sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                  <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-emerald-400" /> Meta Config Guide
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-3.5 pl-4 list-decimal marker:text-emerald-500 marker:font-bold">
                    <li>
                      Create a Meta Developer app under your Meta developer account.
                    </li>
                    <li>
                      Generate a <strong>Permanent System User Access Token</strong> in your Meta Business settings with <code className="text-[10px] bg-slate-800 text-slate-200 p-0.5 rounded px-1">whatsapp_business_messaging</code>.
                    </li>
                    <li>
                      Copy the <strong>Phone Number ID</strong> and <strong>Account ID</strong> from WhatsApp API settings page.
                    </li>
                    <li>
                      Paste credentials on the left configuration panel and click <strong>Save</strong>.
                    </li>
                    <li>
                      Register your unique Callback URL and Verify Token in your Meta Dashboard.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
