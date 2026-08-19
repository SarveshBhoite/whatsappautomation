"use client";
import React, { useState, useEffect } from "react";
import {
  Bot,
  Sparkles,
  BookOpen,
  Send,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  UserCheck,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight,
  Briefcase,
  HelpCircle,
  DollarSign,
  Layers,
  Search
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_ORG_ID = "demo-org-123";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("organization_id") || DEFAULT_ORG_ID;
  }
  return DEFAULT_ORG_ID;
};

interface AiAgentConfig {
  id?: string;
  agentName: string;
  personalityPrompt: string;
  greetingMessage: string;
  activeMode: "AI_AGENT" | "STATIC_FLOW";
  isActive: boolean;
  groqApiKey?: string | null;
  whatsappAiEnabled?: boolean;
  instagramAiEnabled?: boolean;
  youtubeAiEnabled?: boolean;
  linkedinAiEnabled?: boolean;
  autoSendMedia: boolean;
}

interface KnowledgeItem {
  id: string;
  category: "SERVICES" | "PRICING" | "JOBS" | "PORTFOLIO" | "FAQ" | "OTHER";
  topic: string;
  keywords: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: "image" | "document" | "video" | null;
  mediaTitle?: string | null;
  isActive: boolean;
}

interface CapturedLead {
  id: string;
  customerPhone: string;
  customerName?: string | null;
  email?: string | null;
  topicDiscussed?: string | null;
  notes?: string | null;
  remark?: string | null;
  status: "NEW" | "CONTACTED" | "CLOSED";
  createdAt: string;
}

export default function AiAgentStudioPage() {
  const [activeTab, setActiveTab] = useState<"settings" | "knowledge" | "sandbox" | "leads">("settings");
  
  // Config state
  const [config, setConfig] = useState<AiAgentConfig>({
    agentName: "AI Sales & Support Specialist",
    personalityPrompt: "You are a warm, highly knowledgeable human sales & customer representative. Chat naturally in a friendly, conversational tone. Answer questions based strictly on trained company data, attach relevant portfolio screenshots or PDFs when requested, and collect contact details if they ask to be called back.",
    greetingMessage: "Hello! How can I assist you with our services today?",
    activeMode: "AI_AGENT",
    isActive: true,
    autoSendMedia: true,
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configToast, setConfigToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Knowledge Items state
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [loadingKnowledge, setLoadingKnowledge] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Add Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [formCategory, setFormCategory] = useState<"SERVICES" | "PRICING" | "JOBS" | "PORTFOLIO" | "FAQ" | "OTHER">("SERVICES");
  const [formTopic, setFormTopic] = useState("");
  const [formKeywords, setFormKeywords] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formMediaUrl, setFormMediaUrl] = useState("");
  const [formMediaType, setFormMediaType] = useState<"image" | "document" | "video">("image");
  const [formMediaTitle, setFormMediaTitle] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  // Sandbox state
  const [sandboxMessages, setSandboxMessages] = useState<{ role: "user" | "assistant"; content: string; attachment?: any }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingSandbox, setSendingSandbox] = useState(false);

  // Captured Leads state
  const [leads, setLeads] = useState<CapturedLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Initial Load
  useEffect(() => {
    fetchConfig();
    fetchKnowledge();
    fetchLeads();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/ai-agent/config`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error("Failed to fetch AI Agent config:", err);
    }
  };

  const fetchKnowledge = async () => {
    setLoadingKnowledge(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ai-agent/knowledge`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setKnowledgeItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch knowledge items:", err);
    } finally {
      setLoadingKnowledge(false);
    }
  };

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ai-agent/leads`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleSaveConfig = async (newConfig?: Partial<AiAgentConfig>) => {
    setSavingConfig(true);
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ai-agent/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setConfigToast({ type: "success", msg: "AI Agent Configuration updated!" });
      } else {
        setConfigToast({ type: "error", msg: "Failed to save configuration." });
      }
    } catch (err) {
      console.error("Failed to save config:", err);
      setConfigToast({ type: "error", msg: "Server error saving configuration." });
    } finally {
      setSavingConfig(false);
      setTimeout(() => setConfigToast(null), 3000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
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
          setFormMediaUrl(data.url);
          setFormMediaTitle(file.name);

          if (file.type.startsWith("image/")) {
            setFormMediaType("image");
          } else {
            setFormMediaType("document");
          }
        }
      } catch (err) {
        console.error("Failed to upload media file:", err);
      } finally {
        setUploadingFile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveKnowledge = async () => {
    if (!formTopic.trim() || !formContent.trim()) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/ai-agent/knowledge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({
          id: editingItem?.id,
          category: formCategory,
          topic: formTopic,
          keywords: formKeywords,
          content: formContent,
          mediaUrl: formMediaUrl || null,
          mediaType: formMediaType || null,
          mediaTitle: formMediaTitle || null,
          isActive: true
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        resetForm();
        fetchKnowledge();
      }
    } catch (err) {
      console.error("Failed to save knowledge item:", err);
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm("Are you sure you want to delete this training item?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/ai-agent/knowledge/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchKnowledge();
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormCategory("SERVICES");
    setFormTopic("");
    setFormKeywords("");
    setFormContent("");
    setFormMediaUrl("");
    setFormMediaTitle("");
  };

  const openEditModal = (item: KnowledgeItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormTopic(item.topic);
    setFormKeywords(item.keywords || "");
    setFormContent(item.content);
    setFormMediaUrl(item.mediaUrl || "");
    setFormMediaType((item.mediaType as any) || "image");
    setFormMediaTitle(item.mediaTitle || "");
    setShowAddModal(true);
  };

  const handleSendSandbox = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage("");
    setSandboxMessages(prev => [...prev, { role: "user", content: userText }]);
    setSendingSandbox(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/ai-agent/test-sandbox`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({
          userMessage: userText,
          history: sandboxMessages
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSandboxMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: data.replyText,
            attachment: data.attachment
          }
        ]);

        if (data.capturedLead) {
          fetchLeads();
        }
      }
    } catch (err) {
      console.error("Sandbox simulation error:", err);
    } finally {
      setSendingSandbox(false);
    }
  };

  // Remarks state for editing
  const [editingRemarks, setEditingRemarks] = useState<Record<string, string>>({});
  const [savingRemarkId, setSavingRemarkId] = useState<string | null>(null);

  const updateLeadStatus = async (id: string, status: "NEW" | "CONTACTED" | "CLOSED") => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/ai-agent/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
  };

  const updateLeadRemark = async (id: string) => {
    const remarkText = editingRemarks[id];
    setSavingRemarkId(id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ai-agent/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark: remarkText })
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error("Failed to save lead remark:", err);
    } finally {
      setSavingRemarkId(null);
    }
  };

  // Filtered Knowledge Base
  const filteredKnowledge = knowledgeItems.filter(item => {
    const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch =
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 sm:pb-6 bg-slate-950 font-sans">
      {/* Header Banner & Sticky Navigation Tabs */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <header className="p-4 sm:p-6 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">AI Agent Studio & Knowledge Engine</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Train your company AI Agent to chat like a real human representative, attach portfolio screenshots/PDFs, and generate sales leads.
            </p>
          </div>

          {/* Mode Switcher Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center gap-3 shadow-lg">
            <div className="flex items-center gap-1.5 bg-slate-950 rounded-xl p-1">
              <button
                onClick={() => handleSaveConfig({ activeMode: "AI_AGENT" })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  config.activeMode === "AI_AGENT"
                    ? "bg-primary text-slate-950 shadow-md shadow-primary/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Bot className="h-4 w-4" />
                <span>🤖 AI Agent Mode</span>
              </button>

              <button
                onClick={() => handleSaveConfig({ activeMode: "STATIC_FLOW" })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  config.activeMode === "STATIC_FLOW"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>🌳 Static Flow Mode</span>
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === "settings"
                ? "border-primary text-primary bg-primary/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>Agent Persona & Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("knowledge")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === "knowledge"
                ? "border-primary text-primary bg-primary/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Trained Knowledge & Media ({knowledgeItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === "sandbox"
                ? "border-primary text-primary bg-primary/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Send className="h-4 w-4" />
            <span>AI Test Playground</span>
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === "leads"
                ? "border-primary text-primary bg-primary/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>AI Captured Leads ({leads.length})</span>
          </button>
        </div>
      </div>

        {/* TAB 1: PERSONA & SETTINGS */}
        {activeTab === "settings" && (
          <div className="p-4 sm:p-6 max-w-4xl space-y-6">
            {configToast && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                configToast.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}>
                {configToast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <span>{configToast.msg}</span>
              </div>
            )}

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">AI Representative Identity</h2>
                  <p className="text-xs text-slate-400">Name and greeting used when chatting with customers</p>
                </div>
                <button
                  onClick={() => handleSaveConfig({ isActive: !config.isActive })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    config.isActive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {config.isActive ? <ToggleRight className="h-5 w-5 text-emerald-400" /> : <ToggleLeft className="h-5 w-5" />}
                  <span>{config.isActive ? "AI Agent Live" : "AI Agent Disabled"}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">AI Representative Name</label>
                  <input
                    type="text"
                    value={config.agentName}
                    onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. Jisnu AI Consultant"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Default Human Greeting</label>
                  <input
                    type="text"
                    value={config.greetingMessage}
                    onChange={(e) => setConfig({ ...config, greetingMessage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. Hello! How can I assist you with our services today?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Human Personality & System Prompt</label>
                  <textarea
                    rows={4}
                    value={config.personalityPrompt}
                    onChange={(e) => setConfig({ ...config, personalityPrompt: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-primary leading-relaxed"
                    placeholder="Describe how the AI should converse, handle objections, and present company details..."
                  />
                </div>

                {/* GROQ LLM API KEY (BYOK) CARD */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>⚡ Custom Groq AI API Key (Optional)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">BYOK Enterprise</span>
                      </h3>
                      <p className="text-[10px] text-slate-400">Leave blank to use system default master key, or enter your client API key for dedicated rate limits.</p>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={config.groqApiKey || ""}
                      onChange={(e) => setConfig({ ...config, groqApiKey: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono pr-20"
                      placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800/80 rounded-lg transition-all"
                    >
                      {showApiKey ? "Hide Key" : "Show Key"}
                    </button>
                  </div>
                </div>

                {/* PLATFORM CHECKLIST CARD */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-white">Platform Integration Checklist</h3>
                    <p className="text-[10px] text-slate-400">Select which channel platforms will run the AI Agent vs Static Flow</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* WhatsApp Checklist Item */}
                    <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">💬</div>
                        <div>
                          <p className="text-xs font-bold text-white">WhatsApp Cloud API</p>
                          <p className="text-[10px] text-slate-400">{config.whatsappAiEnabled !== false ? "AI Agent Live" : "Static Flow Active"}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveConfig({ whatsappAiEnabled: !(config.whatsappAiEnabled !== false) })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          config.whatsappAiEnabled !== false ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {config.whatsappAiEnabled !== false ? "AI ON" : "FLOW"}
                      </button>
                    </div>

                    {/* Instagram Checklist Item */}
                    <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-pink-500/20 text-pink-400 rounded-lg">📷</div>
                        <div>
                          <p className="text-xs font-bold text-white">Instagram DMs</p>
                          <p className="text-[10px] text-slate-400">{config.instagramAiEnabled ? "AI Agent Live" : "Static Flow Active"}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveConfig({ instagramAiEnabled: !config.instagramAiEnabled })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          config.instagramAiEnabled ? "bg-pink-500/20 text-pink-400 border border-pink-500/40" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {config.instagramAiEnabled ? "AI ON" : "FLOW"}
                      </button>
                    </div>

                    {/* YouTube Checklist Item */}
                    <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg">📺</div>
                        <div>
                          <p className="text-xs font-bold text-white">YouTube Comments</p>
                          <p className="text-[10px] text-slate-400">{config.youtubeAiEnabled ? "AI Agent Live" : "Static Flow Active"}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveConfig({ youtubeAiEnabled: !config.youtubeAiEnabled })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          config.youtubeAiEnabled ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {config.youtubeAiEnabled ? "AI ON" : "FLOW"}
                      </button>
                    </div>

                    {/* LinkedIn Checklist Item */}
                    <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">💼</div>
                        <div>
                          <p className="text-xs font-bold text-white">LinkedIn Comments</p>
                          <p className="text-[10px] text-slate-400">{config.linkedinAiEnabled ? "AI Agent Live" : "Static Flow Active"}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveConfig({ linkedinAiEnabled: !config.linkedinAiEnabled })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          config.linkedinAiEnabled ? "bg-blue-500/20 text-blue-400 border border-blue-500/40" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {config.linkedinAiEnabled ? "AI ON" : "FLOW"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="autoSendMedia"
                      checked={config.autoSendMedia}
                      onChange={(e) => setConfig({ ...config, autoSendMedia: e.target.checked })}
                      className="h-4 w-4 rounded bg-slate-950 border-slate-800 text-primary focus:ring-0"
                    />
                    <label htmlFor="autoSendMedia" className="text-xs text-slate-300 font-medium cursor-pointer">
                      Automatically attach portfolio screenshots or PDFs when requested by customer
                    </label>
                  </div>

                  <button
                    onClick={() => handleSaveConfig()}
                    disabled={savingConfig}
                    className="px-5 py-2.5 bg-primary text-slate-950 rounded-xl text-xs font-bold hover:bg-secondary transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {savingConfig ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span>Save Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KNOWLEDGE BASE & MEDIA LIBRARY */}
        {activeTab === "knowledge" && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search trained topics or keywords..."
                  className="bg-transparent border-none text-sm text-white focus:outline-none w-48 sm:w-64"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {["ALL", "SERVICES", "PRICING", "PORTFOLIO", "JOBS", "FAQ", "OTHER"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}

                <button
                  onClick={() => { resetForm(); setShowAddModal(true); }}
                  className="px-4 py-2 bg-primary text-slate-950 rounded-xl text-xs font-bold hover:bg-secondary transition-all flex items-center gap-2 shadow-lg shadow-primary/20 ml-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Train New Topic</span>
                </button>
              </div>
            </div>

            {/* Knowledge List Grid */}
            {loadingKnowledge ? (
              <div className="py-12 flex justify-center">
                <RefreshCw className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : filteredKnowledge.length === 0 ? (
              <div className="py-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No training data found in this category.</p>
                <button
                  onClick={() => { resetForm(); setShowAddModal(true); }}
                  className="mt-4 px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add First Training Topic</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredKnowledge.map(item => (
                  <div key={item.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-950 text-primary border border-primary/30">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-semibold flex items-center gap-1 transition-all"
                          >
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteKnowledge(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete Topic"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white tracking-tight">{item.topic}</h3>
                      
                      <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto pr-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        {item.content}
                      </div>
                    </div>

                    <div className="pt-3 space-y-3">
                      {/* Attached Screenshot / PDF Preview */}
                      {item.mediaUrl && (
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              {item.mediaType === "document" ? (
                                <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                              ) : (
                                <ImageIcon className="h-4 w-4 text-secondary shrink-0" />
                              )}
                              <span className="text-slate-200 font-medium truncate">{item.mediaTitle || "Attached Media Asset"}</span>
                            </div>
                            <a
                              href={item.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-[10px] font-bold shrink-0"
                            >
                              Open File
                            </a>
                          </div>

                          {/* Image Screenshot Preview Thumbnail */}
                          {item.mediaType !== "document" && (
                            <a href={item.mediaUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-slate-800 group">
                              <img
                                src={item.mediaUrl}
                                alt={item.mediaTitle || "Attached Screenshot"}
                                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </a>
                          )}
                        </div>
                      )}

                      {item.keywords && (
                        <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1">
                          {item.keywords.split(/[\s,]+/).filter(Boolean).map((kw, idx) => (
                            <span key={idx} className="text-[9px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REAL-TIME PLAYGROUND / SANDBOX */}
        {activeTab === "sandbox" && (
          <div className="p-4 sm:p-6 flex-1 flex flex-col max-w-4xl mx-auto w-full">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl flex-1 flex flex-col min-h-[500px] overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-white">{config.agentName} Simulator</h3>
                    <p className="text-[10px] text-slate-400">Test how the AI answers customer questions and sends portfolio media</p>
                  </div>
                </div>

                <button
                  onClick={() => setSandboxMessages([])}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium"
                >
                  Clear Chat
                </button>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {sandboxMessages.length === 0 ? (
                  <div className="py-16 text-center text-slate-500">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                    <p className="text-xs">Type a question below to test your trained AI Agent.</p>
                    <p className="text-[10px] text-slate-600 mt-1">Try: "Can I see your website portfolio?" or "What services do you offer?"</p>
                  </div>
                ) : (
                  sandboxMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary text-slate-950 font-medium rounded-br-none"
                            : "bg-slate-900 text-slate-100 border border-slate-800 rounded-bl-none space-y-2"
                        }`}
                      >
                        <p>{msg.content}</p>

                        {msg.attachment && (
                          <div className="mt-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
                            <div className="flex items-center gap-2">
                              {msg.attachment.type === "document" ? <FileText className="h-4 w-4 text-emerald-400" /> : <ImageIcon className="h-4 w-4 text-secondary" />}
                              <span className="font-bold text-white">{msg.attachment.title}</span>
                            </div>
                            {msg.attachment.type === "image" && (
                              <img src={msg.attachment.url} alt="Attachment" className="rounded-lg max-h-48 object-cover w-full border border-slate-800" />
                            )}
                            <a href={msg.attachment.url} target="_blank" rel="noreferrer" className="block text-[10px] text-primary hover:underline font-semibold">
                              Open Attachment Document
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {sendingSandbox && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 rounded-xl p-3 w-fit">
                    <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                    <span>AI Agent is typing and checking knowledge base...</span>
                  </div>
                )}
              </div>

              {/* Input Footer */}
              <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendSandbox()}
                  placeholder="Type test message for AI agent..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleSendSandbox}
                  disabled={sendingSandbox || !inputMessage.trim()}
                  className="px-4 py-2.5 bg-primary text-slate-950 rounded-xl text-xs font-bold hover:bg-secondary transition-all flex items-center gap-1.5 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CAPTURED LEADS DESK */}
        {activeTab === "leads" && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">AI Generated Sales Leads</h2>
                <p className="text-xs text-slate-400">Leads captured by AI Agent during WhatsApp conversations</p>
              </div>
              <button
                onClick={fetchLeads}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>

            {loadingLeads ? (
              <div className="py-12 flex justify-center">
                <RefreshCw className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : leads.length === 0 ? (
              <div className="py-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <UserCheck className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No leads captured yet. Your AI Agent will automatically extract customer contact info when users ask for callbacks!</p>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="p-3.5">Customer Name</th>
                        <th className="p-3.5">Phone / Contact</th>
                        <th className="p-3.5">Topic Discussed</th>
                        <th className="p-3.5">Captured Notes</th>
                        <th className="p-3.5">Sales Team Remarks</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-slate-900/40">
                          <td className="p-3.5 font-bold text-white">{lead.customerName || "WhatsApp User"}</td>
                          <td className="p-3.5 font-mono text-primary flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{lead.customerPhone}</span>
                          </td>
                          <td className="p-3.5 text-slate-300">{lead.topicDiscussed || "General Inquiry"}</td>
                          <td className="p-3.5 text-slate-400 max-w-xs truncate">{lead.notes || "AI captured contact"}</td>
                          <td className="p-3.5 min-w-[240px]">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editingRemarks[lead.id] !== undefined ? editingRemarks[lead.id] : (lead.remark || "")}
                                onChange={(e) => setEditingRemarks({ ...editingRemarks, [lead.id]: e.target.value })}
                                onKeyDown={(e) => e.key === "Enter" && updateLeadRemark(lead.id)}
                                placeholder="Add sales remark for context..."
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary"
                              />
                              {(editingRemarks[lead.id] !== undefined && editingRemarks[lead.id] !== (lead.remark || "")) && (
                                <button
                                  type="button"
                                  onClick={() => updateLeadRemark(lead.id)}
                                  disabled={savingRemarkId === lead.id}
                                  className="px-2.5 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-[11px] font-bold shrink-0 transition-all flex items-center gap-1"
                                >
                                  {savingRemarkId === lead.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Save"}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <select
                              value={lead.status}
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                              className={`bg-slate-950 border text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none ${
                                lead.status === "NEW" ? "border-amber-500/50 text-amber-400" :
                                lead.status === "CONTACTED" ? "border-primary/50 text-primary" :
                                "border-emerald-500/50 text-emerald-400"
                              }`}
                            >
                              <option value="NEW">NEW</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option value="CLOSED">CLOSED</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL: ADD / EDIT KNOWLEDGE TOPIC */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">
                  {editingItem ? "Edit Knowledge Topic" : "Train New Company Topic"}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    >
                      <option value="SERVICES">SERVICES</option>
                      <option value="PRICING">PRICING</option>
                      <option value="PORTFOLIO">PORTFOLIO & SAMPLES</option>
                      <option value="JOBS">JOBS & CAREERS</option>
                      <option value="FAQ">FAQ & POLICIES</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Topic Title</label>
                    <input
                      type="text"
                      value={formTopic}
                      onChange={(e) => setFormTopic(e.target.value)}
                      placeholder="e.g. Next.js Web Development Services"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Keywords (Comma Separated)</label>
                  <input
                    type="text"
                    value={formKeywords}
                    onChange={(e) => setFormKeywords(e.target.value)}
                    placeholder="e.g. website, react, nextjs, ecommerce, portfolio, pricing"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Answers & Business Data</label>
                  <textarea
                    rows={4}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Provide complete details, features, specifications, or answers for the AI Agent..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-primary leading-relaxed"
                  />
                </div>

                {/* Media Attachment Section */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Contextual Screenshot / PDF Attachment</span>
                    <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      <span>{uploadingFile ? "Uploading..." : "Upload File"}</span>
                      <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
                    </label>
                  </div>

                  {formMediaUrl ? (
                    <div className="flex items-center justify-between text-xs bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                      <span className="text-emerald-400 font-medium truncate">{formMediaTitle || formMediaUrl}</span>
                      <button onClick={() => { setFormMediaUrl(""); setFormMediaTitle(""); }} className="text-red-400 hover:underline">Remove</button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500">Upload portfolio screenshot or PDF deck. When customers ask for samples, AI Agent will attach this file automatically.</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveKnowledge}
                  disabled={!formTopic.trim() || !formContent.trim()}
                  className="px-5 py-2 bg-primary text-slate-950 rounded-xl text-xs font-bold hover:bg-secondary transition-all disabled:opacity-50"
                >
                  Save Training Topic
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
