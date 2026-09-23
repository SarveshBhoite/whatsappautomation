"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  RefreshCw,
  CheckCircle2,
  Copy,
  Hash,
  Zap,
  BookOpen,
  History,
  Trash2,
  Search,
  Check,
  Calendar,
  FileText,
  MessageSquare,
  Send,
  Bot,
  User,
  AlertCircle
} from "lucide-react";

interface AIHistoryItem {
  id: string;
  organizationId: string;
  userId?: string | null;
  prompt: string;
  generatedContent: string;
  generatedText?: string;
  mode: string;
  tone?: string;
  model: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface AIAssistantModalProps {
  organizationId?: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyContent: (generatedText: string) => void;
  initialPrompt?: string;
}

const TEMPLATES = [
  { title: "Hiring Announcement", prompt: "Write a hiring post for a Senior Software Engineer position in a fast-growing tech company." },
  { title: "Product Launch", prompt: "Write a product launch post announcing our new AI-powered CRM feature." },
  { title: "Personal Achievement", prompt: "Write an inspiring post sharing a professional milestone and key lessons learned." },
  { title: "Company Update", prompt: "Write a company update celebrating quarterly growth and thanking our clients." },
  { title: "Event Invitation", prompt: "Write an invitation post for an upcoming live webinar on AI for Business." }
];

export function AIAssistantModal({
  organizationId = "demo-org-123",
  isOpen,
  onClose,
  onApplyContent,
  initialPrompt = ""
}: AIAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<"generate" | "rewrite" | "templates" | "history">("generate");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [rewriteMode, setRewriteMode] = useState("professional");
  const [existingContent, setExistingContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputResult, setOutputResult] = useState("");
  const [contentScore, setContentScore] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      setTopic(initialPrompt);
      setActiveTab("generate");
    }
  }, [isOpen, initialPrompt]);

  // History State
  const [historyList, setHistoryList] = useState<AIHistoryItem[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  // Copy & Toast Notifications
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Follow-up AI Chat State
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [chatInstruction, setChatInstruction] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === "history") {
      fetchHistory();
    }
  }, [isOpen, activeTab, historySearch]);

  useEffect(() => {
    if (conversation.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, chatLoading]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const url = historySearch.trim()
        ? `/api/linkedin/ai/history?search=${encodeURIComponent(historySearch.trim())}`
        : `/api/linkedin/ai/history`;

      const res = await fetch(url, {
        headers: { "x-organization-id": organizationId }
      });
      const data = await res.json();
      if (res.ok && data.history) {
        setHistoryList(data.history);
      }
    } catch (err: any) {
      console.error("[AI HISTORY FETCH ERROR]:", err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/linkedin/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-organization-id": organizationId },
        body: JSON.stringify({ topic: topic.trim(), tone })
      });
      const data = await res.json();
      if (res.ok && (data.text || data.response)) {
        const text = data.text || data.response;
        setOutputResult(text);
        if (data.score) setContentScore(data.score);
        setConversation([]);
        fetchHistory();
      }
    } catch (err: any) {
      showToast(`AI Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async () => {
    if (!existingContent.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/linkedin/ai/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-organization-id": organizationId },
        body: JSON.stringify({ content: existingContent.trim(), mode: rewriteMode })
      });
      const data = await res.json();
      if (res.ok && (data.text || data.response)) {
        const text = data.text || data.response;
        setOutputResult(text);
        if (data.score) setContentScore(data.score);
        setConversation([]);
        fetchHistory();
      }
    } catch (err: any) {
      showToast(`AI Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHashtags = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/linkedin/ai/hashtags`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-organization-id": organizationId },
        body: JSON.stringify({ content: existingContent.trim() || topic.trim() || "Technology SaaS AI Growth", count: 10 })
      });
      const data = await res.json();
      if (res.ok && data.hashtags) {
        setOutputResult((prev) => `${prev.trim()}\n\n${data.hashtags.join(" ")}`);
        fetchHistory();
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatRefinement = async () => {
    const instructionText = chatInstruction.trim();
    if (!instructionText || !outputResult.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: instructionText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setConversation((prev) => [...prev, userMessage]);
    setChatInstruction("");
    setChatLoading(true);

    try {
      const res = await fetch(`/api/linkedin/ai/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-organization-id": organizationId },
        body: JSON.stringify({
          originalPrompt: topic || existingContent || "LinkedIn Post",
          lastGeneratedContent: outputResult,
          instruction: instructionText
        })
      });

      const data = await res.json();
      if (res.ok && (data.text || data.response)) {
        const updatedText = data.text || data.response;
        setOutputResult(updatedText);
        if (data.score) setContentScore(data.score);

        const aiMessage: ChatMessage = {
          id: String(Date.now() + 1),
          sender: "ai",
          text: updatedText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setConversation((prev) => [...prev, aiMessage]);
        fetchHistory();
      } else {
        showToast(data.error || "Unable to refine content.", "error");
      }
    } catch (err: any) {
      showToast(`Refinement failed: ${err.message}`, "error");
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChatRefinement();
    }
  };

  const handleCopyGeneratedText = async () => {
    if (!outputResult.trim()) return;
    try {
      await navigator.clipboard.writeText(outputResult);
      showToast("Content copied successfully.", "success");
    } catch {
      showToast("Unable to copy content.", "error");
    }
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/linkedin/ai/history/${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": organizationId }
      });
      if (res.ok) {
        setHistoryList((prev) => prev.filter((item) => item.id !== id));
        showToast("History item deleted.", "success");
      }
    } catch (err: any) {
      showToast(`Failed to delete: ${err.message}`, "error");
    }
  };

  const handleSelectHistoryItem = (item: AIHistoryItem) => {
    const text = item.generatedContent || item.generatedText || "";
    setOutputResult(text);
    setConversation([]);
    setActiveTab("generate");
  };

  const handleSelectTemplate = (templatePrompt: string) => {
    setTopic(templatePrompt);
    setActiveTab("generate");
  };

  const handleApply = () => {
    if (outputResult.trim()) {
      onApplyContent(outputResult.trim());
      onClose();
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      {/* Enterprise SaaS Modal Container (1000px Max Width) */}
      <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl max-w-4xl w-full p-7 shadow-2xl space-y-5 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-2xl text-[#0A66C2]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">AI Content Assistant</h3>
              <p className="text-xs text-slate-500">Enterprise AI Copywriting & Multi-turn Contextual Refinement</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm transition-all ${
              toastMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <span className="flex items-center gap-2">
              {toastMessage.type === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
              {toastMessage.text}
            </span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "generate" ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="h-4 w-4" /> Post Generator
          </button>

          <button
            onClick={() => setActiveTab("rewrite")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "rewrite" ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Zap className="h-4 w-4" /> Rewrite & Polish
          </button>

          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "templates" ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="h-4 w-4" /> Templates
          </button>

          <button
            onClick={() => {
              setActiveTab("history");
              fetchHistory();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "history" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-emerald-700"
            }`}
          >
            <History className="h-4 w-4" /> 📜 History
          </button>
        </div>

        {/* Tab 1: Generate */}
        {activeTab === "generate" && (
          <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">What is your post about? (Topic / Prompt)</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Launching a new AI CRM tool that automates social media workflows..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0A66C2] focus:bg-white resize-none transition-all shadow-inner"
            />
            <div className="flex items-center justify-between pt-1">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0A66C2]"
              >
                <option value="Professional">Professional Tone</option>
                <option value="Thought Leadership">Thought Leadership</option>
                <option value="Casual & Friendly">Casual & Friendly</option>
                <option value="Promotional & Marketing">Promotional & Marketing</option>
              </select>
              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="px-5 py-2.5 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer transition-all"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Content
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Rewrite */}
        {activeTab === "rewrite" && (
          <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Paste Original Content to Polish</label>
            <textarea
              value={existingContent}
              onChange={(e) => setExistingContent(e.target.value)}
              placeholder="Paste existing text here to rewrite..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0A66C2] focus:bg-white resize-none transition-all shadow-inner"
            />
            <div className="flex items-center justify-between pt-1">
              <select
                value={rewriteMode}
                onChange={(e) => setRewriteMode(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0A66C2]"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly & Engaging</option>
                <option value="marketing">Marketing & Punchy</option>
                <option value="short">Short & Concise</option>
                <option value="detailed">More Detailed</option>
              </select>
              <button
                onClick={handleRewrite}
                disabled={loading || !existingContent.trim()}
                className="px-5 py-2.5 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer transition-all"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} Rewrite Content
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Templates */}
        {activeTab === "templates" && (
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {TEMPLATES.map((tmpl, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectTemplate(tmpl.prompt)}
                className="p-4 bg-white border border-slate-200 hover:border-[#0A66C2] rounded-2xl cursor-pointer transition-all flex items-center justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{tmpl.title}</h4>
                  <p className="text-[11px] text-slate-500">{tmpl.prompt}</p>
                </div>
                <span className="text-[11px] text-[#0A66C2] font-bold">Use Template →</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: 📜 History Module */}
        {activeTab === "history" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history by prompt or generated content..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0A66C2] shadow-sm"
              />
            </div>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {historyLoading ? (
                <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-[#0A66C2]" /> Loading AI history...
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
                  <History className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No AI Prompt History Found</p>
                </div>
              ) : (
                historyList.map((item) => {
                  const contentText = item.generatedContent || item.generatedText || "";
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistoryItem(item)}
                      className="p-4 bg-white border border-slate-200 hover:border-[#0A66C2] rounded-2xl transition-all space-y-2 cursor-pointer group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0A66C2] border border-blue-200">
                            {item.mode || "Post Generator"}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3 text-slate-400" /> {formatDate(item.createdAt)}
                          </span>
                        </div>
                        <button
                          title="Delete Item"
                          onClick={(e) => handleDeleteHistory(item.id, e)}
                          className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-xs font-bold text-slate-800 line-clamp-1 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />
                        <span>{item.prompt}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed font-sans">
                        {contentText}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Output Result Box & Interactive AI Chat */}
        {outputResult && activeTab !== "history" && (
          <div className="space-y-4 pt-3 border-t border-slate-200 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {/* Header & COLORFUL PILL SCORES */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Generated Content
              </span>

              {/* Colorful Score Pills */}
              {contentScore !== null && typeof contentScore === "object" && (
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    Grammar: {contentScore.grammar ?? 95}
                  </span>
                  <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    Engagement: {contentScore.engagement ?? 92}
                  </span>
                  <span className="bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    Readability: {contentScore.readability ?? 94}
                  </span>
                </div>
              )}
            </div>

            {/* Generated Content Box (Beautiful Editor View) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 max-h-[160px] overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans shadow-sm">
              {outputResult}
            </div>

            {/* Action Bar (📋 Copy Content & ✅ Apply to Composer) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyGeneratedText}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Copy className="h-4 w-4 text-[#0A66C2]" /> 📋 Copy Content
                </button>
                <button
                  onClick={handleGenerateHashtags}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Hash className="h-4 w-4 text-purple-600" /> Add Hashtags
                </button>
              </div>

              <button
                onClick={handleApply}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
              >
                <Check className="h-4 w-4" /> ✅ Apply to Composer
              </button>
            </div>

            {/* 💬 Continue with AI (Contextual Session Follow-up Chat) */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MessageSquare className="h-4 w-4 text-[#0A66C2]" /> 💬 Continue with AI
              </div>

              {/* Session Conversation Thread */}
              {conversation.length > 0 && (
                <div className="space-y-2.5 max-h-[150px] overflow-y-auto p-3 bg-white border border-slate-200 rounded-2xl shadow-inner">
                  {conversation.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        msg.sender === "user"
                          ? "bg-blue-50 border border-blue-200 text-blue-950 ml-6"
                          : "bg-slate-50 border border-slate-200 text-slate-800 mr-6"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1.5">
                          {msg.sender === "user" ? <User className="h-3 w-3 text-[#0A66C2]" /> : <Bot className="h-3 w-3 text-emerald-600" />}
                          {msg.sender === "user" ? "You" : "AI Assistant"}
                        </span>
                        <span className="font-mono text-[9px]">{msg.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="p-2 text-[11px] text-[#0A66C2] font-semibold flex items-center gap-2 animate-pulse">
                      <Bot className="h-4 w-4 animate-spin text-[#0A66C2]" /> Thinking & refining content...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}

              {/* Follow-up Chat Input Bar */}
              <div className="flex items-center gap-2">
                <textarea
                  value={chatInstruction}
                  onChange={(e) => setChatInstruction(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder="Ask AI to improve this content... (e.g. Make it shorter, add emojis, rewrite for CEOs, translate to Marathi)"
                  rows={1}
                  disabled={chatLoading}
                  className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0A66C2] resize-none disabled:opacity-50 shadow-sm"
                />
                <button
                  onClick={handleSendChatRefinement}
                  disabled={chatLoading || !chatInstruction.trim()}
                  className="px-4 py-2.5 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer transition-all flex-shrink-0"
                >
                  {chatLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
