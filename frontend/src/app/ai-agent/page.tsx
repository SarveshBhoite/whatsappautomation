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
  Search,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    const org = localStorage.getItem("organization_id");
    if (org) return org;
  }
  return "";
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
  createdAt: string;
}

interface CapturedLead {
  id: string;
  customerPhone: string;
  customerName?: string;
  topicDiscussed?: string;
  notes?: string;
  remark?: string;
  status: "NEW" | "CONTACTED" | "CLOSED";
  createdAt: string;
}

export default function AiAgentPage() {
  const [activeTab, setActiveTab] = useState<"settings" | "knowledge" | "sandbox" | "leads">("settings");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Config State
  const [config, setConfig] = useState<AiAgentConfig>({
    agentName: "Jisnu AI Representative",
    personalityPrompt: "You are a warm, polite, and highly knowledgeable representative. Listen carefully and address the user's questions directly and accurately. Maintain a natural, helpful, and courteous conversational tone. Provide genuine assistance, answer all inquiries clearly, and only suggest next steps or consultations when naturally relevant to what the user is asking.",
    greetingMessage: "Hello! Welcome to Jisnu Digital Solutions. How can I assist you today?",
    activeMode: "AI_AGENT",
    isActive: true,
    groqApiKey: "",
    whatsappAiEnabled: true,
    instagramAiEnabled: true,
    youtubeAiEnabled: false,
    linkedinAiEnabled: false,
    autoSendMedia: true
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configToast, setConfigToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Knowledge Base State
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [loadingKnowledge, setLoadingKnowledge] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Add / Edit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [formCategory, setFormCategory] = useState<KnowledgeItem["category"]>("SERVICES");
  const [formTopic, setFormTopic] = useState("");
  const [formKeywords, setFormKeywords] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formMediaUrl, setFormMediaUrl] = useState("");
  const [formMediaType, setFormMediaType] = useState<"image" | "document" | "video">("image");
  const [formMediaTitle, setFormMediaTitle] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  // Test Sandbox Playground State
  const [sandboxMessages, setSandboxMessages] = useState<Array<{
    role: "user" | "assistant";
    content: string;
    attachment?: { url: string; type: string; title: string };
  }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingSandbox, setSendingSandbox] = useState(false);

  // Leads Desk State
  const [leads, setLeads] = useState<CapturedLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [editingRemarks, setEditingRemarks] = useState<{ [leadId: string]: string }>({});
  const [savingRemarkId, setSavingRemarkId] = useState<string | null>(null);

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
        if (data.config) {
          setConfig(data.config);
        } else if (data && typeof data === "object" && data.agentName) {
          setConfig(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch AI agent config:", err);
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
        if (Array.isArray(data)) {
          setKnowledgeItems(data);
        } else if (data && Array.isArray(data.items)) {
          setKnowledgeItems(data.items);
        }
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
        if (Array.isArray(data)) {
          setLeads(data);
        } else if (data && Array.isArray(data.leads)) {
          setLeads(data.leads);
        }
      }
    } catch (err) {
      console.error("Failed to fetch AI captured leads:", err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleSaveConfig = async (overrideParams?: Partial<AiAgentConfig>) => {
    setSavingConfig(true);
    const updated = { ...config, ...(overrideParams || {}) };
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
        setConfigToast({ msg: "AI Representative settings saved successfully!", type: "success" });
        setTimeout(() => setConfigToast(null), 3000);
      } else {
        const err = await res.json();
        setConfigToast({ msg: err.error || "Failed to save configuration", type: "error" });
      }
    } catch (err) {
      setConfigToast({ msg: "Network error saving settings", type: "error" });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BACKEND_URL}/api/ai-agent/upload-media`, {
        method: "POST",
        headers: { "x-organization-id": getOrgId() },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setFormMediaUrl(data.mediaUrl);
        setFormMediaType(data.mediaType);
        setFormMediaTitle(file.name);
      }
    } catch (err) {
      console.error("File upload failed:", err);
    } finally {
      setUploadingFile(false);
    }
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
      console.error("Sandbox test error:", err);
    } finally {
      setSendingSandbox(false);
    }
  };

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
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 sm:pb-6 bg-slate-50 text-slate-900 font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 sm:hidden"
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between p-5 transform transition-transform duration-300 ease-in-out sm:hidden ${
        mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-xs">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">AI Agent Studio</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Knowledge Engine</p>
              </div>
            </div>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">
              Navigation & Tools
            </span>
            {[
              { id: "settings", label: "Agent Persona & Settings", icon: Bot, color: "text-purple-600", activeBg: "bg-purple-50 text-purple-800 border-purple-200" },
              { id: "knowledge", label: `Knowledge & Media (${knowledgeItems.length})`, icon: BookOpen, color: "text-blue-600", activeBg: "bg-blue-50 text-blue-800 border-blue-200" },
              { id: "sandbox", label: "AI Test Playground", icon: Send, color: "text-emerald-600", activeBg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
              { id: "leads", label: `Captured Leads (${leads.length})`, icon: UserCheck, color: "text-amber-600", activeBg: "bg-amber-50 text-amber-800 border-amber-200" },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileDrawerOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isSelected
                      ? `${item.activeBg} border shadow-xs`
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2 text-[10px] text-slate-500 font-medium">
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
          <span>Active Mode: {config.activeMode === "AI_AGENT" ? "AI Agent" : "Static Flow"}</span>
        </div>
      </aside>

      {/* Header Banner & Sticky Navigation Tabs */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <header className="p-4 sm:p-6 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="sm:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 shrink-0"
              title="Open Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 animate-pulse shrink-0" />
                <h1 className="text-base sm:text-2xl font-extrabold tracking-tight text-slate-900 truncate">AI Agent Studio</h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate sm:whitespace-normal">
                Train your company AI Agent to chat like a real human representative and generate sales leads.
              </p>
            </div>
          </div>

          {/* Mode Switcher Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-1.5 flex items-center justify-between sm:justify-start gap-2 shadow-xs shrink-0 self-start md:self-auto w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-200/60 w-full sm:w-auto">
              <button
                onClick={() => handleSaveConfig({ activeMode: "AI_AGENT" })}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  config.activeMode === "AI_AGENT"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Bot className="h-3.5 w-3.5" />
                <span>🤖 AI Agent</span>
              </button>

              <button
                onClick={() => handleSaveConfig({ activeMode: "STATIC_FLOW" })}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  config.activeMode === "STATIC_FLOW"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>🌳 Static Flow</span>
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs - Hidden on mobile, shown on desktop */}
        <div className="hidden sm:flex px-4 sm:px-6 pt-2 items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "settings"
                ? "border-purple-600 text-purple-700 bg-purple-50/60 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>Agent Persona &amp; Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("knowledge")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "knowledge"
                ? "border-purple-600 text-purple-700 bg-purple-50/60 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Trained Knowledge &amp; Media ({knowledgeItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "sandbox"
                ? "border-purple-600 text-purple-700 bg-purple-50/60 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Send className="h-4 w-4" />
            <span>AI Test Playground</span>
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "leads"
                ? "border-purple-600 text-purple-700 bg-purple-50/60 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
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
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-xs ${
              configToast.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {configToast.type === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
              <span>{configToast.msg}</span>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">AI Representative Identity</h2>
                <p className="text-xs text-slate-500">Name and greeting used when chatting with customers</p>
              </div>
              <button
                onClick={() => handleSaveConfig({ isActive: !config.isActive })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  config.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs" : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {config.isActive ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" />}
                <span>{config.isActive ? "AI Agent Live" : "AI Agent Disabled"}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">AI Representative Name</label>
                <input
                  type="text"
                  value={config.agentName}
                  onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                  placeholder="e.g. Jisnu AI Consultant"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Human Greeting</label>
                <input
                  type="text"
                  name="ai_greeting_msg_custom"
                  autoComplete="off"
                  data-lpignore="true"
                  value={config.greetingMessage}
                  onChange={(e) => setConfig({ ...config, greetingMessage: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
                  placeholder="e.g. Hello! How can I assist you with our services today?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Human Personality &amp; System Prompt</label>
                <textarea
                  rows={4}
                  name="ai_personality_prompt_custom"
                  autoComplete="off"
                  data-lpignore="true"
                  value={config.personalityPrompt}
                  onChange={(e) => setConfig({ ...config, personalityPrompt: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 leading-relaxed shadow-2xs transition-all"
                  placeholder="Describe how the AI should converse, handle objections, and present company details..."
                />
              </div>

              {/* GROQ LLM API KEY (BYOK) CARD */}
              <div className="bg-purple-50/40 border border-purple-200 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                      <span>⚡ Custom Groq AI API Key (Optional)</span>
                      <Badge variant="brand" className="text-[10px]">BYOK Enterprise</Badge>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Leave blank to use system default master key, or enter your client API key for dedicated rate limits.</p>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    name="groq_ai_byok_api_token"
                    autoComplete="new-password"
                    data-lpignore="true"
                    value={config.groqApiKey || ""}
                    onChange={(e) => setConfig({ ...config, groqApiKey: e.target.value })}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs text-purple-950 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono pr-20 shadow-2xs"
                    placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg transition-all cursor-pointer"
                  >
                    {showApiKey ? "Hide Key" : "Show Key"}
                  </button>
                </div>
              </div>

              {/* PLATFORM CHECKLIST CARD */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">Platform Integration Checklist</h3>
                  <p className="text-[11px] text-slate-500">Select which channel platforms will run the AI Agent vs Static Flow</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* WhatsApp Checklist Item */}
                  <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg">💬</div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">WhatsApp Cloud API</p>
                        <p className="text-[10px] text-slate-500">{config.whatsappAiEnabled !== false ? "AI Agent Live" : "Static Flow Active"}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveConfig({ whatsappAiEnabled: !(config.whatsappAiEnabled !== false) })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        config.whatsappAiEnabled !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {config.whatsappAiEnabled !== false ? "AI ON" : "FLOW"}
                    </button>
                  </div>

                  {/* Instagram Checklist Item */}
                  <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-pink-50 text-pink-600 border border-pink-200 rounded-lg">📷</div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Instagram DMs</p>
                        <p className="text-[10px] text-slate-500">{config.instagramAiEnabled ? "AI Agent Live" : "Static Flow Active"}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveConfig({ instagramAiEnabled: !config.instagramAiEnabled })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        config.instagramAiEnabled ? "bg-pink-50 text-pink-700 border border-pink-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {config.instagramAiEnabled ? "AI ON" : "FLOW"}
                    </button>
                  </div>

                  {/* YouTube Checklist Item */}
                  <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg">📺</div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">YouTube Comments</p>
                        <p className="text-[10px] text-slate-500">{config.youtubeAiEnabled ? "AI Agent Live" : "Static Flow Active"}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveConfig({ youtubeAiEnabled: !config.youtubeAiEnabled })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        config.youtubeAiEnabled ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {config.youtubeAiEnabled ? "AI ON" : "FLOW"}
                    </button>
                  </div>

                  {/* LinkedIn Checklist Item */}
                  <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg">💼</div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">LinkedIn Comments</p>
                        <p className="text-[10px] text-slate-500">{config.linkedinAiEnabled ? "AI Agent Live" : "Static Flow Active"}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveConfig({ linkedinAiEnabled: !config.linkedinAiEnabled })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        config.linkedinAiEnabled ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {config.linkedinAiEnabled ? "AI ON" : "FLOW"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-100 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoSendMedia"
                    checked={config.autoSendMedia}
                    onChange={(e) => setConfig({ ...config, autoSendMedia: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="autoSendMedia" className="text-xs text-slate-700 font-bold cursor-pointer">
                    Automatically attach portfolio screenshots or PDFs when requested by customer
                  </label>
                </div>

                <Button
                  onClick={() => handleSaveConfig()}
                  disabled={savingConfig}
                  size="sm"
                >
                  {savingConfig ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                  <span>Save Persona Settings</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KNOWLEDGE BASE & MEDIA LIBRARY */}
      {activeTab === "knowledge" && (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-3xl shadow-xs">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trained topics or keywords..."
                className="bg-transparent border-none text-xs text-slate-900 focus:outline-none w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {["ALL", "SERVICES", "PRICING", "PORTFOLIO", "JOBS", "FAQ", "OTHER"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}

              <Button
                size="sm"
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="ml-auto"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Train New Topic</span>
              </Button>
            </div>
          </div>

          {/* Knowledge List Grid */}
          {loadingKnowledge ? (
            <div className="py-12 flex justify-center">
              <RefreshCw className="h-6 w-6 text-purple-600 animate-spin" />
            </div>
          ) : filteredKnowledge.length === 0 ? (
            <div className="py-12 text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No training data found in this category.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Add First Training Topic</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredKnowledge.map(item => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:border-purple-300 transition-all shadow-xs hover:shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="brand" className="text-[10px]">
                        {item.category}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                        >
                          <FileText className="h-3.5 w-3.5 text-purple-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteKnowledge(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Topic"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">{item.topic}</h3>
                    
                    <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto pr-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      {item.content}
                    </div>
                  </div>

                  <div className="pt-3 space-y-3">
                    {/* Attached Screenshot / PDF Preview */}
                    {item.mediaUrl && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            {item.mediaType === "document" ? (
                              <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-purple-600 shrink-0" />
                            )}
                            <span className="text-slate-800 font-bold truncate">{item.mediaTitle || "Attached Media Asset"}</span>
                          </div>
                          <a
                            href={item.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline text-[10px] font-bold shrink-0"
                          >
                            Open File
                          </a>
                        </div>

                        {/* Image Screenshot Preview Thumbnail */}
                        {item.mediaType !== "document" && (
                          <a href={item.mediaUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-slate-200 group">
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
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                        {item.keywords.split(/[\s,]+/).filter(Boolean).map((kw, idx) => (
                          <span key={idx} className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
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
          <div className="bg-white border border-slate-200 rounded-3xl flex-1 flex flex-col min-h-[500px] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{config.agentName} Simulator</h3>
                  <p className="text-[10px] text-slate-500">Test how the AI answers customer questions and sends portfolio media</p>
                </div>
              </div>

              <button
                onClick={() => setSandboxMessages([])}
                className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-xl font-bold transition-all cursor-pointer shadow-2xs"
              >
                Clear Chat
              </button>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {sandboxMessages.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-700">Type a question below to test your trained AI Agent.</p>
                  <p className="text-[10px] text-slate-500 mt-1">Try: &quot;Can I see your website portfolio?&quot; or &quot;What services do you offer?&quot;</p>
                </div>
              ) : (
                sandboxMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        msg.role === "user"
                          ? "bg-purple-600 text-white font-medium rounded-br-none"
                          : "bg-white text-slate-900 border border-slate-200 rounded-bl-none space-y-2"
                      }`}
                    >
                      <p>{msg.content}</p>

                      {msg.attachment && (
                        <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                          <div className="flex items-center gap-2">
                            {msg.attachment.type === "document" ? <FileText className="h-4 w-4 text-emerald-600" /> : <ImageIcon className="h-4 w-4 text-purple-600" />}
                            <span className="font-bold text-slate-900">{msg.attachment.title}</span>
                          </div>
                          {msg.attachment.type === "image" && (
                            <img src={msg.attachment.url} alt="Attachment" className="rounded-lg max-h-48 object-cover w-full border border-slate-200" />
                          )}
                          <a href={msg.attachment.url} target="_blank" rel="noreferrer" className="block text-[10px] text-purple-600 hover:underline font-bold">
                            Open Attachment Document
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {sendingSandbox && (
                <div className="flex items-center gap-2 text-xs text-purple-800 bg-purple-50 border border-purple-200 rounded-xl p-3 w-fit font-bold shadow-2xs">
                  <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                  <span>AI Agent is typing and checking knowledge base...</span>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendSandbox()}
                placeholder="Type test message for AI agent..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs"
              />
              <Button
                onClick={handleSendSandbox}
                disabled={sendingSandbox || !inputMessage.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CAPTURED LEADS DESK */}
      {activeTab === "leads" && (
        <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto w-full">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">AI Generated Sales Leads</h2>
              <p className="text-xs text-slate-500">Leads captured by AI Agent during customer conversations</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLeads}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              <span>Refresh</span>
            </Button>
          </div>

          {loadingLeads ? (
            <div className="py-12 flex justify-center">
              <RefreshCw className="h-6 w-6 text-purple-600 animate-spin" />
            </div>
          ) : leads.length === 0 ? (
            <div className="py-12 text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
              <UserCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No leads captured yet.</p>
              <p className="text-xs text-slate-400 mt-1">Your AI Agent will automatically extract customer contact info when users ask for callbacks!</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[840px] lg:min-w-full table-fixed text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-3.5 w-[14%] min-w-[110px]">Customer</th>
                      <th className="py-3 px-3 w-[14%] min-w-[110px]">Contact</th>
                      <th className="py-3 px-3 w-[14%] min-w-[110px]">Topic</th>
                      <th className="py-3 px-3 w-[14%] min-w-[110px]">Captured Notes</th>
                      <th className="py-3 px-3 w-[18%] min-w-[140px]">Remarks</th>
                      <th className="py-3 px-2 w-[13%] min-w-[110px] text-center">Status</th>
                      <th className="py-3 px-3 w-[13%] min-w-[110px] text-center">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900 truncate" title={lead.customerName || "WhatsApp User"}>
                          {lead.customerName || "WhatsApp User"}
                        </td>
                        <td className="p-3 font-mono text-purple-700 font-bold truncate">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span className="truncate">{lead.customerPhone}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-700 font-medium truncate" title={lead.topicDiscussed || "General Inquiry"}>
                          {lead.topicDiscussed || "General Inquiry"}
                        </td>
                        <td className="p-3 text-slate-500 truncate" title={lead.notes || "AI captured contact"}>
                          {lead.notes || "AI captured contact"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 min-w-0">
                            <input
                              type="text"
                              value={editingRemarks[lead.id] !== undefined ? editingRemarks[lead.id] : (lead.remark || "")}
                              onChange={(e) => setEditingRemarks({ ...editingRemarks, [lead.id]: e.target.value })}
                              onKeyDown={(e) => e.key === "Enter" && updateLeadRemark(lead.id)}
                              placeholder="Add remark..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 truncate"
                            />
                            {(editingRemarks[lead.id] !== undefined && editingRemarks[lead.id] !== (lead.remark || "")) && (
                              <button
                                type="button"
                                onClick={() => updateLeadRemark(lead.id)}
                                disabled={savingRemarkId === lead.id}
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-bold shrink-0 transition-all flex items-center gap-0.5 cursor-pointer"
                              >
                                {savingRemarkId === lead.id ? <RefreshCw className="h-2.5 w-2.5 animate-spin" /> : "Save"}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                            className={`border text-[11px] font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer inline-block ${
                              lead.status === "NEW" ? "border-amber-200 bg-amber-50 text-amber-800" :
                              lead.status === "CONTACTED" ? "border-purple-200 bg-purple-50 text-purple-800" :
                              "border-emerald-200 bg-emerald-50 text-emerald-800"
                            }`}
                          >
                            <option value="NEW">NEW</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px] text-center font-medium whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingItem ? "Edit Knowledge Topic" : "Train New Company Topic"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="SERVICES">SERVICES</option>
                    <option value="PRICING">PRICING</option>
                    <option value="PORTFOLIO">PORTFOLIO &amp; SAMPLES</option>
                    <option value="JOBS">JOBS &amp; CAREERS</option>
                    <option value="FAQ">FAQ &amp; POLICIES</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic Title</label>
                  <input
                    type="text"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    placeholder="e.g. Next.js Web Development Services"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="e.g. website, react, nextjs, ecommerce, portfolio, pricing"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Answers &amp; Business Data</label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Provide complete details, features, specifications, or answers for the AI Agent..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              {/* Media Attachment Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Contextual Screenshot / PDF Attachment</span>
                  <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl flex items-center gap-1.5 shadow-2xs">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadingFile ? "Uploading..." : "Upload File"}</span>
                    <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
                  </label>
                </div>

                {formMediaUrl ? (
                  <div className="flex items-center justify-between text-xs bg-white border border-slate-200 p-2.5 rounded-xl shadow-2xs">
                    <span className="text-emerald-700 font-bold truncate">{formMediaTitle || formMediaUrl}</span>
                    <button onClick={() => { setFormMediaUrl(""); setFormMediaTitle(""); }} className="text-red-600 hover:underline font-bold">Remove</button>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500">Upload portfolio screenshot or PDF deck. When customers ask for samples, AI Agent will attach this file automatically.</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveKnowledge}
                disabled={!formTopic.trim() || !formContent.trim()}
              >
                Save Training Topic
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
