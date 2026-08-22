"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  FileText,
  Trash2,
  Play,
  Pause,
  Edit3,
  ExternalLink,
  Zap,
  Check,
  AlertCircle,
  FileDown,
  Layers,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
  Activity,
  UserCheck,
  Eye,
  Heart,
  Bookmark,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("organization_id") || "";
  }
  return "";
};

interface AutomationItem {
  id: string;
  name: string;
  mediaId: string;
  mediaType: string;
  mediaUrl?: string;
  mediaCaption?: string;
  targetPostSelection?: "ALL" | "SPECIFIC" | "MULTIPLE" | "FUTURE";
  targetPostIds?: string[];
  keywords: string[];
  matchingMode: "EXACT" | "CONTAINS" | "WHOLE_WORD" | "ANY_COMMENT" | "STARTS_WITH" | "ENDS_WITH" | "PHRASE" | "PATTERN";
  isCaseSensitive?: boolean;
  matchBehavior?: "ANY" | "ALL";
  excludedKeywords?: string[];
  excludedPhrases?: string[];
  cooldownConfig?: { userCooldownSeconds?: number };
  limitsConfig?: { maxPerUser?: number };
  priority?: number;
  conflictPolicy?: "HIGHEST_PRIORITY_ONLY" | "EXECUTE_ALL" | "FIRST_MATCHING" | "HIGHEST_PRIORITY_AND_STOP";
  scheduleConfig?: { startTime?: string; endTime?: string; daysOfWeek?: number[] };
  privateMessageTemplate: string;
  documentUrl?: string;
  documentName?: string;
  enablePublicReply: boolean;
  publicReplyTemplate?: string;
  status: "ACTIVE" | "PAUSED" | "INACTIVE";
  commentsCount: number;
  matchesCount: number;
  dmsSentCount: number;
  lastTriggeredAt?: string;
  createdAt: string;
  auditLogs?: any[];
}

export default function InstagramCommentsPage() {
  const [subTab, setSubTab] = useState<"automations" | "create_editor" | "live_feed" | "audit_logs">("automations");

  // Automations list & Metrics state
  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalAutomations: 0,
    activeAutomations: 0,
    pausedAutomations: 0,
    totalCommentsMonitored: 0,
    totalMatchesTriggered: 0,
    totalDmsSent: 0,
    conversionRate: "0.0%"
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    mediaId: string;
    mediaType: string;
    mediaUrl: string;
    mediaCaption: string;
    targetPostSelection: "ALL" | "SPECIFIC" | "MULTIPLE" | "FUTURE";
    targetPostIds: string[];
    keywordsInput: string;
    matchingMode: "EXACT" | "CONTAINS" | "WHOLE_WORD" | "ANY_COMMENT" | "STARTS_WITH" | "ENDS_WITH" | "PHRASE" | "PATTERN";
    isCaseSensitive: boolean;
    matchBehavior: "ANY" | "ALL";
    excludedKeywordsInput: string;
    excludedPhrasesInput: string;
    cooldownHours: number;
    maxPerUser: number;
    priority: number;
    conflictPolicy: "HIGHEST_PRIORITY_ONLY" | "EXECUTE_ALL" | "FIRST_MATCHING" | "HIGHEST_PRIORITY_AND_STOP";
    enableSchedule: boolean;
    startTime: string;
    endTime: string;
    privateMessageTemplate: string;
    documentUrl: string;
    documentName: string;
    enablePublicReply: boolean;
    publicReplyTemplate: string;
  }>({
    name: "",
    mediaId: "ALL",
    mediaType: "POST",
    mediaUrl: "",
    mediaCaption: "",
    targetPostSelection: "ALL",
    targetPostIds: [],
    keywordsInput: "PDF, GUIDE, LINK",
    matchingMode: "CONTAINS",
    isCaseSensitive: false,
    matchBehavior: "ANY",
    excludedKeywordsInput: "",
    excludedPhrasesInput: "",
    cooldownHours: 24,
    maxPerUser: 1,
    priority: 10,
    conflictPolicy: "HIGHEST_PRIORITY_ONLY",
    enableSchedule: false,
    startTime: "09:00",
    endTime: "18:00",
    privateMessageTemplate: "Hey @{username}! Thanks for your comment. Here is the document you requested: {document_link}",
    documentUrl: "https://www.jisnudigital.com/docs/Official_Guide.pdf",
    documentName: "Official_Guide.pdf",
    enablePublicReply: true,
    publicReplyTemplate: "Thanks @{username}! Check your private messages for the document 📩"
  });

  // Test Simulator State
  const [showTestModal, setShowTestModal] = useState<boolean>(false);
  const [testingAutomation, setTestingAutomation] = useState<AutomationItem | null>(null);
  const [testComment, setTestComment] = useState<string>("Send PDF please");
  const [testUsername, setTestUsername] = useState<string>("instagram_user");
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState<boolean>(false);

  // File Uploading State
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);

  // Audit Logs & Media List State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState<boolean>(false);
  const [previewSidebarMedia, setPreviewSidebarMedia] = useState<any | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const fetchMediaList = async () => {
    try {
      setLoadingMedia(true);
      const res = await fetch(`${BACKEND_URL}/api/admin/instagram/media?fetchAll=true&limit=100`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setMediaList(data.media || []);
      }
    } catch (err) {
      console.error("Failed to fetch IG media:", err);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Fetch all automations & live metrics
  const fetchAutomations = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/instagram/comment-automations`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setAutomations(data.automations || []);
        if (data.metrics) setMetrics(data.metrics);

        // Flatten audit logs for audit logs tab
        const logs: any[] = [];
        (data.automations || []).forEach((a: any) => {
          if (Array.isArray(a.auditLogs)) logs.push(...a.auditLogs);
        });
        setAuditLogs(logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (err) {
      console.error("Failed to fetch comment automations:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
    fetchMediaList();

    const socket: Socket = io(BACKEND_URL);
    socket.emit("join-org", getOrgId());

    socket.on("instagram-comment-received", () => {
      fetchAutomations();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Save / Update Automation
  const handleSaveAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.privateMessageTemplate) return;
    if (formData.matchingMode !== "ANY_COMMENT" && !formData.keywordsInput) return;

    const rawKeywords = (formData.keywordsInput || "")
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const keywords = rawKeywords.length > 0 ? rawKeywords : (formData.matchingMode === "ANY_COMMENT" ? ["*"] : ["PDF"]);

    const excludedKeywords = (formData.excludedKeywordsInput || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const excludedPhrases = (formData.excludedPhrasesInput || "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name,
      mediaId: formData.targetPostSelection === "MULTIPLE" && formData.targetPostIds.length > 0 ? formData.targetPostIds[0] : (formData.mediaId || "ALL"),
      mediaType: formData.mediaType,
      mediaUrl: formData.mediaUrl,
      keywords,
      matchingMode: formData.matchingMode,
      triggerType: formData.matchingMode === "ANY_COMMENT" ? "ANY_COMMENT" : (formData.matchingMode === "PHRASE" ? "PHRASE_MATCH" : (formData.matchingMode === "PATTERN" ? "PATTERN_MATCH" : "SPECIFIC_KEYWORD")),
      targetPostSelection: formData.targetPostSelection,
      targetPostIds: formData.targetPostIds,
      isCaseSensitive: formData.isCaseSensitive,
      matchBehavior: formData.matchBehavior,
      excludedKeywords,
      excludedPhrases,
      cooldownConfig: {
        userCooldownSeconds: (formData.cooldownHours || 24) * 3600
      },
      limitsConfig: {
        maxPerUser: formData.maxPerUser || 1
      },
      priority: formData.priority || 10,
      conflictPolicy: formData.conflictPolicy,
      scheduleConfig: formData.enableSchedule ? {
        startTime: formData.startTime,
        endTime: formData.endTime
      } : null,
      privateMessageTemplate: formData.privateMessageTemplate,
      documentUrl: formData.documentUrl,
      documentName: formData.documentName,
      enablePublicReply: formData.enablePublicReply,
      publicReplyTemplate: formData.publicReplyTemplate
    };

    try {
      const url = editingId
        ? `${BACKEND_URL}/api/admin/instagram/comment-automations/${editingId}`
        : `${BACKEND_URL}/api/admin/instagram/comment-automations`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        setSubTab("automations");
        fetchAutomations();
      }
    } catch (err) {
      console.error("Failed to save automation:", err);
    }
  };

  // Toggle Action (Pause / Resume)
  const handleToggleStatus = async (item: AutomationItem) => {
    const action = item.status === "ACTIVE" ? "PAUSE" : "RESUME";
    try {
      await fetch(`${BACKEND_URL}/api/admin/instagram/comment-automations/${item.id}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({ action })
      });
      fetchAutomations();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Delete Automation
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Comment-to-DM automation?")) return;
    try {
      await fetch(`${BACKEND_URL}/api/admin/instagram/comment-automations/${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": getOrgId() }
      });
      fetchAutomations();
    } catch (err) {
      console.error("Failed to delete automation:", err);
    }
  };

  // Document File Upload Handler (ImageKit CDN)
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await fetch(`${BACKEND_URL}/api/admin/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": getOrgId()
          },
          body: JSON.stringify({
            filename: file.name,
            fileBase64: base64
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            setFormData((prev) => ({
              ...prev,
              documentUrl: data.url,
              documentName: file.name
            }));
          }
        }
        setUploadingDoc(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File upload failed:", err);
      setUploadingDoc(false);
    }
  };

  // Run Safe Test Simulator
  const handleRunTest = async () => {
    if (!testingAutomation) return;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/instagram/comment-automations/${testingAutomation.id}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({
          testUsername,
          testCommentText: testComment
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const filteredAutomations = automations.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (subTab === "create_editor") {
    const selectedMedia = formData.mediaId !== "ALL" ? mediaList.find(m => m.id === formData.mediaId) : null;
    const isReel = selectedMedia ? (selectedMedia.media_product_type === "REELS" || selectedMedia.media_type === "VIDEO") : false;
    const mediaUrl = selectedMedia?.thumbnail_url || selectedMedia?.media_url || formData.mediaUrl || "";
    const captionText = selectedMedia?.caption || (formData.mediaId === "ALL" ? "Automate your WhatsApp and never miss a customer again. Boost engagement and grow faster! 🚀" : "Instagram post caption text...");
    const likesCount = selectedMedia?.like_count || 47;
    const commentsCount = selectedMedia?.comments_count || 8;
    const postDate = selectedMedia?.timestamp ? new Date(selectedMedia.timestamp).toLocaleDateString() : "August 14, 2026";

    const keywords = (formData.keywordsInput || "").split(",").map(k => k.trim()).filter(Boolean);
    const sampleUsername = "user123";
    const sampleDocLink = formData.documentUrl || "https://www.jisnudigital.com/docs/Official_Guide.pdf";
    const firstKeyword = keywords[0] || "PDF";
    const sampleCommentText = formData.matchingMode === "EXACT" ? firstKeyword : `Can you send me the ${firstKeyword}?`;

    const resolvedDmText = formData.privateMessageTemplate
      ? formData.privateMessageTemplate.replace(/\{username\}/g, sampleUsername).replace(/\{document_link\}/g, sampleDocLink)
      : `Hey @${sampleUsername}! Thanks for commenting.\n\nHere is the document you requested:\n📄 View Document\n\nLet me know if you need anything else. 😊`;

    const resolvedPublicReplyText = formData.publicReplyTemplate
      ? formData.publicReplyTemplate.replace(/\{username\}/g, sampleUsername)
      : `Thanks @${sampleUsername}! Check your private messages for details 📩`;

    return (
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-7 relative scrollbar-thin">
        <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 animate-fadeIn">
          
          {/* LEFT 7 COLUMNS: AUTOMATION FORM EDITOR */}
          <div className="lg:col-span-7 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSubTab("automations")}
                  className="h-10 w-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight flex items-center gap-2">
                    {editingId ? "Edit Comment-to-DM Automation" : "Create New Comment-to-DM Automation"}
                  </h1>
                  <p className="text-xs text-slate-500">
                    Configure trigger keywords, select target posts, attach documents, and set automated DM responses.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(!showPreviewModal)}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Eye className="h-3.5 w-3.5 text-pink-500" />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => setSubTab("automations")}
                  className="bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveAutomation} className="space-y-5 text-xs">
              {/* CARD 1 — AUTOMATION DETAILS */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-lg bg-pink-50 text-pink-600 font-bold text-xs flex items-center justify-center border border-pink-200">01</span>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Automation Campaign Details</h3>
                    <p className="text-[11px] text-slate-500">Configure the basic information for this automation.</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-slate-700 font-medium block">Automation Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="New Comment-to-DM Automation"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-11 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 transition-all shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* CARD 2 — TARGET CONTENT */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-lg bg-purple-50 text-purple-600 font-bold text-xs flex items-center justify-center border border-purple-200">02</span>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Target Content</h3>
                      <p className="text-[11px] text-slate-500">Choose which Instagram posts or reels should trigger this automation.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={fetchMediaList}
                      disabled={loadingMedia}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <RefreshCw className={`h-3 w-3 ${loadingMedia ? "animate-spin text-pink-600" : ""}`} />
                      {loadingMedia ? "Syncing Feed..." : `Sync Feed (${mediaList.length} Posts)`}
                    </button>
                  </div>
                </div>

                {/* Target Mode Quick Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: ALL */}
                  <div
                    onClick={() => setFormData({ ...formData, targetPostSelection: "ALL", mediaId: "ALL", targetPostIds: [] })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      formData.targetPostSelection === "ALL"
                        ? "bg-pink-50/60 border-pink-400 text-pink-900 ring-1 ring-pink-400 shadow-2xs"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs shrink-0">🌐</div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">All Posts & Reels (Global)</span>
                        <span className="text-[10px] text-slate-500">Every current and new post</span>
                      </div>
                    </div>
                    {formData.targetPostSelection === "ALL" && (
                      <Check className="h-4 w-4 text-pink-600" />
                    )}
                  </div>

                  {/* Option 2: FUTURE */}
                  <div
                    onClick={() => setFormData({ ...formData, targetPostSelection: "FUTURE", mediaId: "FUTURE", targetPostIds: [] })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      formData.targetPostSelection === "FUTURE"
                        ? "bg-purple-50/60 border-purple-400 text-purple-900 ring-1 ring-purple-400 shadow-2xs"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">✨</div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">All Future Posts Only</span>
                        <span className="text-[10px] text-slate-500">Posts created after activation</span>
                      </div>
                    </div>
                    {formData.targetPostSelection === "FUTURE" && (
                      <Check className="h-4 w-4 text-purple-600" />
                    )}
                  </div>

                  {/* Option 3: SPECIFIC */}
                  <div
                    onClick={() => setFormData({ ...formData, targetPostSelection: "SPECIFIC" })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      formData.targetPostSelection === "SPECIFIC"
                        ? "bg-sky-50/60 border-sky-400 text-sky-900 ring-1 ring-sky-400 shadow-2xs"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0">🎯</div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Single Specific Post</span>
                        <span className="text-[10px] text-slate-500">Target 1 specific post/reel</span>
                      </div>
                    </div>
                    {formData.targetPostSelection === "SPECIFIC" && (
                      <Check className="h-4 w-4 text-sky-600" />
                    )}
                  </div>

                  {/* Option 4: MULTIPLE */}
                  <div
                    onClick={() => setFormData({ ...formData, targetPostSelection: "MULTIPLE" })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      formData.targetPostSelection === "MULTIPLE"
                        ? "bg-emerald-50/60 border-emerald-400 text-emerald-900 ring-1 ring-emerald-400 shadow-2xs"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">📚</div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Multiple Selected Posts</span>
                        <span className="text-[10px] text-slate-500">Select multiple specific posts</span>
                      </div>
                    </div>
                    {formData.targetPostSelection === "MULTIPLE" && (
                      <Check className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                </div>

                {/* Post Selection Grid (for SPECIFIC and MULTIPLE modes) */}
                {(formData.targetPostSelection === "SPECIFIC" || formData.targetPostSelection === "MULTIPLE") && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                        {formData.targetPostSelection === "MULTIPLE"
                          ? `Select multiple posts (${formData.targetPostIds.length} of ${mediaList.length} posts selected):`
                          : `Select 1 target post (${mediaList.length} posts loaded):`}
                      </span>
                      {formData.targetPostSelection === "MULTIPLE" && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, targetPostIds: mediaList.map(m => m.id) })}
                          className="text-pink-600 hover:text-pink-700 font-bold text-[10px]"
                        >
                          Select All ({mediaList.length})
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                      {mediaList.map((m) => {
                        const isSingleSelected = formData.targetPostSelection === "SPECIFIC" && formData.mediaId === m.id;
                        const isMultiSelected = formData.targetPostSelection === "MULTIPLE" && formData.targetPostIds.includes(m.id);
                        const isSelected = isSingleSelected || isMultiSelected;
                        const isReel = m.media_product_type === "REELS" || m.media_type === "VIDEO";

                        return (
                          <div
                            key={m.id}
                            onClick={() => {
                              if (formData.targetPostSelection === "MULTIPLE") {
                                const newIds = isMultiSelected
                                  ? formData.targetPostIds.filter(id => id !== m.id)
                                  : [...formData.targetPostIds, m.id];
                                setFormData({
                                  ...formData,
                                  targetPostIds: newIds,
                                  mediaId: newIds[0] || m.id,
                                  mediaUrl: m.media_url || "",
                                  mediaCaption: m.caption || ""
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  mediaId: m.id,
                                  targetPostIds: [m.id],
                                  mediaType: isReel ? "REEL" : "POST",
                                  mediaUrl: m.media_url || "",
                                  mediaCaption: m.caption || ""
                                });
                              }
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 relative ${
                              isSelected
                                ? "bg-pink-50/50 border-pink-400 ring-1 ring-pink-400 shadow-2xs"
                                : "bg-slate-50 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {/* Checkbox indicator */}
                            <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                              isSelected ? "bg-pink-600 border-pink-600 text-white" : "border-slate-300 bg-white"
                            }`}>
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>

                            <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                              {m.thumbnail_url || m.media_url ? (
                                <img src={m.thumbnail_url || m.media_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[10px]">📷</div>
                              )}
                              <span className={`absolute top-0.5 left-0.5 text-[8px] font-extrabold px-1 rounded ${isReel ? "bg-pink-600 text-white" : "bg-purple-600 text-white"}`}>
                                {isReel ? "REEL" : "IMAGE"}
                              </span>
                            </div>

                            <div className="flex flex-col min-w-0 flex-1 space-y-0.5">
                              <p className="text-[11px] font-semibold text-slate-800 truncate">
                                {m.caption ? m.caption.slice(0, 36) : `Media ID: ${m.id}`}
                              </p>
                              <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-mono">
                                <span>🩷 {m.like_count || 0}</span>
                                <span>💬 {m.comments_count || 0}</span>
                                <span>{m.timestamp ? new Date(m.timestamp).toLocaleDateString() : ""}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 3 — TRIGGER RULES */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="h-6 w-6 rounded-lg bg-sky-50 text-sky-600 font-bold text-xs flex items-center justify-center border border-sky-200">03</span>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Trigger Rules</h3>
                    <p className="text-[11px] text-slate-500">Define which comments should activate the automation.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-medium block">
                      Trigger Keywords (comma separated) {formData.matchingMode === "ANY_COMMENT" && <span className="text-slate-400 text-[10px] font-normal">(Optional for Any Comment / Emoji)</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.keywordsInput}
                      onChange={(e) => setFormData({ ...formData, keywordsInput: e.target.value })}
                      placeholder={formData.matchingMode === "ANY_COMMENT" ? "Any comment / emoji (e.g. 🔥, PDF, PRICE)" : "PDF, GUIDE, LINK, DETAILS"}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-11 text-xs text-pink-700 font-semibold placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 shadow-2xs"
                      required={formData.matchingMode !== "ANY_COMMENT"}
                    />
                    {formData.matchingMode === "ANY_COMMENT" && (
                      <p className="text-[11px] text-emerald-600 font-medium pt-0.5 flex items-center gap-1">
                        ✨ Triggers dynamically on ANY comment text or emoji (e.g. 🔥, ❤️, Interested, Price)
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-medium block">Matching Rule</label>
                    <select
                      value={formData.matchingMode}
                      onChange={(e) => setFormData({ ...formData, matchingMode: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-11 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-pink-500 cursor-pointer shadow-2xs"
                    >
                      <option value="CONTAINS">Contains Keyword (Flexible)</option>
                      <option value="ANY_COMMENT">Any Comment / Emoji (Triggers on ANY comment or 🔥)</option>
                      <option value="EXACT">Exact Match Only</option>
                      <option value="WHOLE_WORD">Whole Word Match</option>
                      <option value="STARTS_WITH">Starts With Keyword</option>
                      <option value="ENDS_WITH">Ends With Keyword</option>
                      <option value="PHRASE">Phrase Match</option>
                      <option value="PATTERN">Regular / Pattern Match (Regex)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CARD 4 — DELIVERY CONTENT */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center border border-emerald-200">04</span>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Delivery Content</h3>
                    <p className="text-[11px] text-slate-500">Configure the document/link and private DM message.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-medium block flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-emerald-600" /> Attached Document / Link
                  </label>
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={formData.documentUrl}
                      onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                      placeholder="https://www.jisnudigital.com/docs/Official_Guide.pdf"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-11 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono shadow-2xs"
                    />
                    <label className="bg-white hover:bg-slate-50 text-slate-700 px-4 h-11 rounded-xl cursor-pointer text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 shrink-0 transition-all shadow-2xs">
                      <FileDown className="h-3.5 w-3.5 text-emerald-600" />
                      {uploadingDoc ? "Uploading..." : "Upload File"}
                      <input type="file" onChange={handleDocumentUpload} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip" />
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-slate-700 font-medium">Custom Private DM Message</label>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>Available placeholders:</span>
                      <span className="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded font-mono font-semibold border border-pink-200">{'{username}'}</span>
                      <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-mono font-semibold border border-purple-200">{'{document_link}'}</span>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={formData.privateMessageTemplate}
                    onChange={(e) => setFormData({ ...formData, privateMessageTemplate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-pink-500 font-mono leading-relaxed min-h-[100px] shadow-2xs"
                    required
                  />
                </div>

                {/* Custom Public Comment Reply */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-slate-700 font-medium flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enablePublicReply}
                        onChange={(e) => setFormData({ ...formData, enablePublicReply: e.target.checked })}
                        className="rounded border-slate-300 bg-white text-pink-600 focus:ring-pink-500/30 h-4 w-4 cursor-pointer accent-pink-600"
                      />
                      <span className="font-bold text-slate-900">Custom Public Comment Reply</span>
                    </label>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>Available placeholder:</span>
                      <span className="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded font-mono font-semibold border border-pink-200">{'{username}'}</span>
                    </div>
                  </div>

                  {formData.enablePublicReply && (
                    <textarea
                      rows={2}
                      value={formData.publicReplyTemplate}
                      onChange={(e) => setFormData({ ...formData, publicReplyTemplate: e.target.value })}
                      placeholder="Thanks @{username}! Check your private messages for details 📩"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-pink-500 font-mono leading-relaxed min-h-[75px] shadow-2xs"
                    />
                  )}
                </div>
              </div>

              {/* CARD 5 — ADVANCED SETTINGS & EXCLUSIONS */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="h-6 w-6 rounded-lg bg-amber-50 text-amber-600 font-bold text-xs flex items-center justify-center border border-amber-200">05</span>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Advanced Settings & Exclusions</h3>
                    <p className="text-[11px] text-slate-500">Configure negative keywords, user cooldowns, execution limits, and schedules.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Negative / Excluded Keywords */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-medium block">Excluded Keywords (Negative Keywords)</label>
                    <input
                      type="text"
                      value={formData.excludedKeywordsInput}
                      onChange={(e) => setFormData({ ...formData, excludedKeywordsInput: e.target.value })}
                      placeholder="job, refund, spam, fake"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-11 text-xs text-amber-700 font-semibold placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 shadow-2xs"
                    />
                    <span className="text-[10px] text-slate-500 block">Comments containing excluded keywords will NOT trigger the rule.</span>
                  </div>

                  {/* Negative Phrases */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-medium block">Excluded Phrases</label>
                    <input
                      type="text"
                      value={formData.excludedPhrasesInput}
                      onChange={(e) => setFormData({ ...formData, excludedPhrasesInput: e.target.value })}
                      placeholder="not interested, bad service"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-11 text-xs text-amber-700 font-semibold placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 shadow-2xs"
                    />
                  </div>

                  {/* User Cooldown Period */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-medium block">User Cooldown Period (Hours)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.cooldownHours}
                      onChange={(e) => setFormData({ ...formData, cooldownHours: Number(e.target.value) })}
                      placeholder="24"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-11 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 shadow-2xs"
                    />
                    <span className="text-[10px] text-slate-500 block">Prevents sending repeated DMs to the same user within X hours.</span>
                  </div>

                  {/* Max Executions Per User */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-medium block">Max Messages Per User</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.maxPerUser}
                      onChange={(e) => setFormData({ ...formData, maxPerUser: Number(e.target.value) })}
                      placeholder="1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-11 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 shadow-2xs"
                    />
                  </div>

                  {/* Priority */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-medium block">Automation Priority</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                      placeholder="10"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-11 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 shadow-2xs"
                    />
                    <span className="text-[10px] text-slate-500 block">Lower number = higher priority (e.g. 1 executes before 10).</span>
                  </div>

                  {/* Case Sensitivity Toggle */}
                  <div className="space-y-1.5 flex flex-col justify-center">
                    <label className="text-slate-700 font-medium block">Case Sensitivity</label>
                    <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={formData.isCaseSensitive}
                        onChange={(e) => setFormData({ ...formData, isCaseSensitive: e.target.checked })}
                        className="rounded border-slate-300 bg-white text-pink-600 focus:ring-pink-500/30 h-4 w-4 cursor-pointer accent-pink-600"
                      />
                      <span className="text-xs text-slate-800 font-semibold">Enable Case Sensitive Matching</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ACTIONS FOOTER */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubTab("automations")}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-6 h-11 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 via-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs px-7 h-11 rounded-xl shadow-md shadow-pink-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5" />
                  {editingId ? "Update Automation" : "Create Automation"}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT 5 COLUMNS: LIVE PREVIEW AUTOMATION PANEL MATCHING SCREENSHOT */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 space-y-5 flex flex-col justify-between shadow-2xs h-fit sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Preview Automation</h3>
                <p className="text-[11px] text-slate-500">This is how the automation will look and work on Instagram.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* REAL INSTAGRAM POST CARD */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              {/* Instagram Post Top Bar */}
              <div className="p-3 flex items-center justify-between border-b border-slate-200 bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[1.5px]">
                    <div className="h-full w-full bg-white rounded-full flex items-center justify-center text-[9px] font-extrabold text-pink-600">
                      JISNU
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block leading-tight">jisnudigital</span>
                    <span className="text-[10px] text-slate-500">Jisnu Digital Marketing</span>
                  </div>
                </div>
                <span className="text-slate-400 font-bold tracking-widest text-xs cursor-default">•••</span>
              </div>

              {/* Main Media Preview Image Container */}
              <div className="w-full h-56 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                {mediaUrl ? (
                  <img src={mediaUrl} alt="Target Content" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <span className="text-3xl">📱</span>
                    <span className="text-xs font-bold text-slate-800">Power Your Business with WhatsApp Automation</span>
                    <span className="text-[10px] text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200 font-medium">Global Profile Rule Active</span>
                  </div>
                )}
              </div>

              {/* Instagram Post Action Icons & Stats */}
              <div className="p-3 space-y-2 text-xs bg-white">
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-3">
                    <Heart className="h-4 w-4 text-pink-500 fill-pink-500/20 cursor-pointer" />
                    <MessageSquare className="h-4 w-4 text-slate-600 cursor-pointer" />
                    <Send className="h-4 w-4 text-slate-600 cursor-pointer" />
                  </div>
                  <Bookmark className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="font-bold text-slate-900 text-xs">
                  {likesCount} likes
                </div>

                <div className="text-xs text-slate-700 leading-snug">
                  <strong className="text-slate-900 font-bold mr-1.5">jisnudigital</strong>
                  <span className="text-slate-600">{captionText}</span>
                </div>

                {/* LIVE COMMENT SECTION PREVIEW */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Live Comment & Public Reply Preview</span>
                  
                  {/* User Comment */}
                  <div className="flex items-start gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <div className="h-5 w-5 rounded-full bg-slate-200 text-[9px] flex items-center justify-center font-bold text-slate-700 shrink-0">
                      U
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <span className="font-bold text-slate-900 mr-1.5">{sampleUsername}</span>
                      <span className="text-slate-700 font-sans">{sampleCommentText}</span>
                    </div>
                  </div>

                  {/* Public Reply Nested Under Comment */}
                  {formData.enablePublicReply && (
                    <div className="ml-4 pl-2.5 border-l-2 border-pink-400 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[1px] shrink-0">
                          <div className="h-full w-full bg-white rounded-full flex items-center justify-center text-[7px] font-extrabold text-pink-600">
                            J
                          </div>
                        </div>
                        <span className="font-bold text-[11px] text-pink-600">jisnudigital</span>
                        <span className="bg-pink-50 text-pink-700 text-[8px] font-extrabold px-1 rounded border border-pink-200">Author</span>
                      </div>
                      <p className="text-[11px] text-slate-800 bg-pink-50/50 p-2 rounded-xl border border-pink-200 leading-snug font-sans">
                        {resolvedPublicReplyText}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 font-mono">
                    <span>View all {commentsCount + 1} comments</span>
                    <span>{postDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COMMENT -> AUTOMATIC DM FLOW VISUALIZER BOX */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="text-center border-b border-slate-200 pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600">
                  COMMENT → PUBLIC REPLY → PRIVATE DM FLOW
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-stretch text-center text-[10px]">
                {/* 1. User Comment Box */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1 text-left flex flex-col justify-between shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-500 block">1. User Comment</span>
                  <p className="text-[10px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200 leading-tight font-sans">
                    "{sampleCommentText}"
                  </p>
                </div>

                {/* 2. Trigger Matched Box */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1 text-left flex flex-col justify-between shadow-2xs">
                  <span className="text-[9px] font-bold text-pink-600 block">2. Trigger Matched</span>
                  <div className="text-[10px] font-mono text-slate-700 space-y-0.5">
                    <div><span className="text-slate-400">Kw:</span> <span className="text-pink-600 font-bold">{firstKeyword}</span></div>
                    <div><span className="text-slate-400">Rule:</span> <span className="text-sky-600 font-semibold">{formData.matchingMode}</span></div>
                  </div>
                </div>

                {/* 3. Custom Public Reply Box */}
                <div className="bg-white p-2.5 rounded-xl border border-purple-200 space-y-1 text-left flex flex-col justify-between shadow-2xs">
                  <span className="text-[9px] font-bold text-purple-600 block">3. Public Reply</span>
                  <p className="text-[10px] text-slate-800 bg-purple-50/50 p-1.5 rounded border border-purple-200 leading-tight line-clamp-3 font-sans">
                    {formData.enablePublicReply ? resolvedPublicReplyText : "(Disabled)"}
                  </p>
                </div>

                {/* 4. DM Sent Box */}
                <div className="bg-white p-2.5 rounded-xl border border-pink-200 space-y-1 text-left flex flex-col justify-between shadow-2xs">
                  <span className="text-[9px] font-bold text-emerald-600 block">4. Private DM Sent</span>
                  <p className="text-[10px] text-slate-800 bg-emerald-50/50 p-1.5 rounded border border-emerald-200 leading-tight line-clamp-3 font-sans">
                    {resolvedDmText}
                  </p>
                </div>
              </div>
            </div>

            {/* AUTOMATION SUMMARY CARD */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-pink-200 space-y-2 text-[11px] shadow-2xs">
              <span className="font-bold text-xs text-slate-900 block border-b border-slate-200 pb-1">Automation Summary</span>
              <div className="grid grid-cols-2 gap-2 text-slate-700 font-mono text-[10px]">
                <div><span className="text-slate-500">Trigger Keywords:</span> <span className="text-pink-600 font-bold">{formData.keywordsInput || "PDF, GUIDE, LINK"}</span></div>
                <div><span className="text-slate-500">Document:</span> <span className="text-emerald-700 font-bold truncate block">{formData.documentName || "Official_Guide.pdf"}</span></div>
                <div><span className="text-slate-500">Matching Rule:</span> <span className="text-sky-600">{formData.matchingMode}</span></div>
                <div><span className="text-slate-500">Placeholders:</span> <span className="text-purple-600">{'{username}, {document_link}'}</span></div>
                <div><span className="text-slate-500">Target:</span> <span className="text-slate-900 font-bold">{formData.mediaId === "ALL" ? "All Reels & Posts" : "Selected Specific Post"}</span></div>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>This is a preview. Actual appearance may vary on Instagram.</span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer shadow-2xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 text-slate-900">
      {/* Header Bar */}
      <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 p-[1px] shadow-sm shadow-pink-500/20">
            <div className="h-full w-full bg-white rounded-xl flex items-center justify-center text-pink-600">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 tracking-wide flex items-center gap-2">
              Instagram Comment-to-DM Automation
            </h1>
            <p className="text-[11px] text-slate-500">
              Send instant private documents & DMs when users comment trigger keywords on your Reels or Posts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-tabs switch */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setSubTab("automations")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${subTab === "automations" ? "bg-pink-600 text-white font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              Automations ({automations.length})
            </button>
            <button
              onClick={() => setSubTab("audit_logs")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${subTab === "audit_logs" ? "bg-pink-600 text-white font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              Audit Logs ({auditLogs.length})
            </button>
          </div>

          <button
            onClick={() => {
              fetchMediaList();
              setEditingId(null);
              setFormData({
                name: "New Comment-to-DM Automation",
                mediaId: "ALL",
                mediaType: "POST",
                mediaUrl: "",
                mediaCaption: "",
                targetPostSelection: "ALL",
                targetPostIds: [],
                keywordsInput: "PDF, GUIDE, LINK",
                matchingMode: "CONTAINS",
                isCaseSensitive: false,
                matchBehavior: "ANY",
                excludedKeywordsInput: "",
                excludedPhrasesInput: "",
                cooldownHours: 24,
                maxPerUser: 1,
                priority: 10,
                conflictPolicy: "HIGHEST_PRIORITY_ONLY",
                enableSchedule: false,
                startTime: "09:00",
                endTime: "18:00",
                privateMessageTemplate: "Hey @{username}! Thanks for commenting. Here is the document you requested: {document_link}",
                documentUrl: "https://www.jisnudigital.com/docs/Official_Guide.pdf",
                documentName: "Official_Guide.pdf",
                enablePublicReply: true,
                publicReplyTemplate: "Thanks @{username}! Check your private messages for the document 📩"
              });
              setSubTab("create_editor");
            }}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-pink-500/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Automation
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Metrics Dashboard Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Automations</span>
            <span className="text-xl font-black text-slate-900">{metrics.totalAutomations}</span>
            <span className="text-[10px] text-emerald-600 block font-mono font-semibold">{metrics.activeAutomations} Active</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Comments Monitored</span>
            <span className="text-xl font-black text-purple-700">{metrics.totalCommentsMonitored}</span>
            <span className="text-[10px] text-slate-400 block">All connected posts</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Keywords Triggered</span>
            <span className="text-xl font-black text-pink-600">{metrics.totalMatchesTriggered}</span>
            <span className="text-[10px] text-pink-700 block font-mono font-semibold">Matched rules</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Private DMs Delivered</span>
            <span className="text-xl font-black text-emerald-600">{metrics.totalDmsSent}</span>
            <span className="text-[10px] text-emerald-700 block font-mono font-semibold">With document links</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs col-span-2 md:col-span-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">DM Delivery Rate</span>
            <span className="text-xl font-black text-sky-600">{metrics.conversionRate}</span>
            <span className="text-[10px] text-slate-400 block">Zero duplicates</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search automations by name or keyword..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500 transition-all shadow-2xs"
            />
          </div>

          <button
            onClick={fetchAutomations}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-pink-600" : ""}`} /> Refresh
          </button>
        </div>

        {/* TAB 1: AUTOMATIONS LIST */}
        {subTab === "automations" && (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-2xs">
                <RefreshCw className="h-6 w-6 animate-spin text-pink-600 mx-auto" />
                <p className="text-xs text-slate-500">Loading Instagram Comment-to-DM automations...</p>
              </div>
            ) : filteredAutomations.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-2xs">
                <Zap className="h-8 w-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No Automations Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create your first Comment-to-DM rule to automatically send documents when followers comment keywords on your Reels.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredAutomations.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white hover:border-pink-300 border border-slate-200 rounded-2xl p-5 transition-all space-y-4 shadow-2xs"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-pink-50 text-pink-600 border border-pink-200 flex items-center justify-center font-bold text-xs">
                          {item.mediaType === "REEL" ? "🎥" : "🖼️"}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                            {item.name}
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-md border ${
                                item.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {item.status}
                            </span>
                          </h3>
                          <span className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>Target Media: <code className="text-pink-600 font-mono font-bold">{item.mediaId}</code></span>
                            <span>•</span>
                            <span>Matching Mode: <span className="text-slate-800 font-bold">{item.matchingMode}</span></span>
                          </span>
                        </div>
                      </div>

                      {/* Action Controllers */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setTestingAutomation(item);
                            setTestComment(item.keywords[0] || "PDF");
                            setTestResult(null);
                            setShowTestModal(true);
                          }}
                          className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Play className="h-3.5 w-3.5" /> Test Automation
                        </button>

                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`font-bold text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1 cursor-pointer shadow-2xs ${
                            item.status === "ACTIVE"
                              ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          {item.status === "ACTIVE" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          {item.status === "ACTIVE" ? "Pause" : "Resume"}
                        </button>

                        <button
                          onClick={() => {
                            fetchMediaList();
                            setEditingId(item.id);
                            setFormData({
                              name: item.name,
                              mediaId: item.mediaId,
                              mediaType: item.mediaType,
                              mediaUrl: item.mediaUrl || "",
                              mediaCaption: item.mediaCaption || "",
                              targetPostSelection: item.targetPostSelection || (item.mediaId === "ALL" ? "ALL" : "SPECIFIC"),
                              targetPostIds: Array.isArray(item.targetPostIds) ? item.targetPostIds : [item.mediaId],
                              keywordsInput: Array.isArray(item.keywords) ? item.keywords.join(", ") : "",
                              matchingMode: item.matchingMode || "CONTAINS",
                              isCaseSensitive: !!item.isCaseSensitive,
                              matchBehavior: item.matchBehavior || "ANY",
                              excludedKeywordsInput: Array.isArray(item.excludedKeywords) ? item.excludedKeywords.join(", ") : "",
                              excludedPhrasesInput: Array.isArray(item.excludedPhrases) ? item.excludedPhrases.join(", ") : "",
                              cooldownHours: item.cooldownConfig?.userCooldownSeconds ? Math.round(item.cooldownConfig.userCooldownSeconds / 3600) : 24,
                              maxPerUser: item.limitsConfig?.maxPerUser || 1,
                              priority: item.priority || 10,
                              conflictPolicy: item.conflictPolicy || "HIGHEST_PRIORITY_ONLY",
                              enableSchedule: !!item.scheduleConfig,
                              startTime: item.scheduleConfig?.startTime || "09:00",
                              endTime: item.scheduleConfig?.endTime || "18:00",
                              privateMessageTemplate: item.privateMessageTemplate || "",
                              documentUrl: item.documentUrl || "",
                              documentName: item.documentName || "",
                              enablePublicReply: item.enablePublicReply !== false,
                              publicReplyTemplate: item.publicReplyTemplate || ""
                            });
                            setSubTab("create_editor");
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs p-2 rounded-lg cursor-pointer"
                          title="Edit automation"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-xs p-2 rounded-lg cursor-pointer"
                          title="Delete automation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Automation Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Keywords Badge Box */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Trigger Keywords</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.keywords.map((kw) => (
                            <span key={kw} className="bg-pink-50 text-pink-700 font-bold px-2 py-0.5 rounded-md border border-pink-200 text-[11px]">
                              "{kw}"
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Document Link Box */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Attached Document</span>
                        {item.documentUrl ? (
                          <a
                            href={item.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 font-semibold text-[11px] hover:underline flex items-center gap-1.5 pt-1 truncate"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{item.documentName || item.documentUrl}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic block pt-1">No document attached</span>
                        )}
                      </div>

                      {/* Performance Counters */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Matches</span>
                          <span className="text-sm font-extrabold text-pink-600">{item.matchesCount}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">DMs Sent</span>
                          <span className="text-sm font-extrabold text-emerald-600">{item.dmsSentCount}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Last Active</span>
                          <span className="text-[10px] font-mono text-slate-700 font-semibold">
                            {item.lastTriggeredAt ? new Date(item.lastTriggeredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Never"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rendered DM & Public Reply Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="bg-purple-50/70 border border-purple-200 p-3 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Private DM Template</span>
                        <p className="text-[11px] text-purple-900 italic font-mono">{item.privateMessageTemplate}</p>
                      </div>

                      <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                          Public Comment Reply {item.enablePublicReply ? "(Enabled)" : "(Disabled)"}
                        </span>
                        <p className="text-[11px] text-emerald-900 italic font-mono">{item.publicReplyTemplate || "None"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AUDIT LOGS LIST */}
        {subTab === "audit_logs" && (
          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-2xs">
                <Clock className="h-8 w-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No Audit Logs Recorded</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Audit records of every comment matched, document delivered, and DM timestamp will log here in real time.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Commenter</th>
                      <th className="p-3.5">Comment Text</th>
                      <th className="p-3.5">Matched Keyword</th>
                      <th className="p-3.5">Document Sent</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">@{log.commenterUser}</td>
                        <td className="p-3.5 text-slate-700 italic max-w-xs truncate">"{log.commentText}"</td>
                        <td className="p-3.5">
                          <span className="bg-pink-50 text-pink-700 font-bold px-2 py-0.5 rounded border border-pink-200 text-[10px]">
                            {log.matchedKeyword}
                          </span>
                        </td>
                        <td className="p-3.5 text-emerald-700 font-mono text-[11px] truncate max-w-xs font-semibold">
                          {log.documentSent || "N/A"}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              log.status === "SUCCESS"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* TEST AUTOMATION SIMULATOR MODAL */}
      {showTestModal && testingAutomation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Play className="h-4 w-4 text-purple-600" /> Test Automation Simulator
              </h3>
              <button onClick={() => setShowTestModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold">Simulated Instagram Username</label>
                <input
                  type="text"
                  value={testUsername}
                  onChange={(e) => setTestUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-semibold">Simulated User Comment Text</label>
                <input
                  type="text"
                  value={testComment}
                  onChange={(e) => setTestComment(e.target.value)}
                  placeholder="e.g. Please send me the PDF guide"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs"
                />
              </div>

              <button
                onClick={handleRunTest}
                disabled={testing}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-sm shadow-purple-600/20 disabled:opacity-50"
              >
                {testing ? "Testing..." : "Execute Test Simulation"}
              </button>

              {testResult && (
                <div
                  className={`p-4 rounded-2xl border space-y-2 mt-3 text-xs ${
                    testResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <span className="font-bold block">{testResult.message}</span>
                  {testResult.success && (
                    <div className="space-y-1.5 font-mono text-[11px] bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div><span className="text-slate-500">Matched Keyword:</span> <span className="text-pink-600 font-bold">{testResult.matchedKeyword}</span></div>
                      <div><span className="text-slate-500">Rendered DM:</span> <p className="text-slate-800 italic font-sans">{testResult.previewDmText}</p></div>
                      <div><span className="text-slate-500">Public Reply:</span> <p className="text-slate-800 italic font-sans">{testResult.previewPublicReply}</p></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT-SIDE POST PREVIEW DRAWER MATCHING USER SCREENSHOT */}
      {showPreviewModal && (() => {
        const selectedMedia = formData.mediaId !== "ALL" ? mediaList.find(m => m.id === formData.mediaId) : null;
        const isReel = selectedMedia ? (selectedMedia.media_product_type === "REELS" || selectedMedia.media_type === "VIDEO") : false;
        const mediaUrl = selectedMedia?.thumbnail_url || selectedMedia?.media_url || formData.mediaUrl || "";
        const captionText = selectedMedia?.caption || (formData.mediaId === "ALL" ? "Global Profile Automation Rule active across all posts & reels." : "No caption content available...");
        const likesCount = selectedMedia?.like_count || 4;
        const commentsCount = selectedMedia?.comments_count || 0;
        const mediaIdDisplay = selectedMedia?.id || "18187191745168488";
        const postDate = selectedMedia?.timestamp ? new Date(selectedMedia.timestamp).toLocaleDateString() : "8/14/2026";

        return (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
            {/* ESC Helper Badge */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-slate-800 border border-slate-200 px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xl z-50 font-sans">
              <span>To exit full screen, press and hold</span>
              <kbd className="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600">Esc</kbd>
            </div>

            {/* Right Side Drawer */}
            <div className="w-full max-w-[420px] h-full bg-white border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto space-y-6 shadow-2xl animate-slideLeft">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="bg-pink-50 text-pink-700 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider border border-pink-200 flex items-center gap-1">
                    🖼 POST PREVIEW
                  </span>
                  <span className="text-xs font-mono text-slate-500">ID: {mediaIdDisplay}</span>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Main Media Preview Image */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-square shadow-2xs group">
                {mediaUrl ? (
                  <img src={mediaUrl} alt="Post Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2 bg-slate-50">
                    <span className="text-4xl">🌐</span>
                    <span className="text-sm font-bold text-slate-800">Global Profile Rule Active</span>
                    <span className="text-xs text-slate-500">Applies automatically to all published Instagram posts & reels</span>
                  </div>
                )}

                {/* Instagram Link Button */}
                <a
                  href={selectedMedia?.permalink || "https://instagram.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-sky-600 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md backdrop-blur-sm transition-all"
                >
                  <span>Instagram Link</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">LIKES</span>
                  <span className="text-xs font-extrabold text-slate-900 flex items-center justify-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500/30" /> {likesCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">COMMENTS</span>
                  <span className="text-xs font-extrabold text-slate-900 flex items-center justify-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-pink-500" /> {commentsCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">POSTED</span>
                  <span className="text-xs font-extrabold text-slate-900 font-mono">{postDate}</span>
                </div>
              </div>

              {/* Caption Box */}
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  FULL CAPTION TEXT
                </span>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 italic leading-relaxed overflow-y-auto max-h-48 font-sans scrollbar-thin">
                  "{captionText}"
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="space-y-3 pt-2">
                <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Content Currently Selected</span>
                </div>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all text-center block py-1 cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
