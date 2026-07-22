"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Bot,
  User,
  Check,
  Plus,
  Save,
  RefreshCw,
  Send,
  AlertCircle,
  Clock,
  Sparkles,
  Settings,
  ChevronRight,
  Inbox,
  Star,
  Trash2,
  Paperclip,
  FileText,
  HelpCircle,
  Zap,
  Sliders,
  Info
} from "lucide-react";
import { io, Socket } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_ORG_ID = "demo-org-123";

interface GmailAttachment {
  id: string;
  messageId: string;
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface GmailAutoReplyRule {
  id: string;
  organizationId: string;
  keyword: string;
  replyText: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GmailMessage {
  id: string;
  threadId: string;
  messageId: string;
  direction: "inbound" | "outbound";
  content: string;
  htmlContent?: string | null;
  sender: string;
  aiDraft?: string | null;
  createdAt: string;
  attachments?: GmailAttachment[];
}

interface GmailThread {
  id: string;
  threadId: string;
  subject: string;
  sender: string;
  snippet: string;
  status: "UNREPLIED" | "REPLIED" | "SKIPPED";
  label: string;
  createdAt: string;
  updatedAt: string;
  messages: GmailMessage[];
}

const LABELS = [
  { id: "INBOX", name: "Inbox", icon: Inbox },
  { id: "STARRED", name: "Starred", icon: Star },
  { id: "SENT", name: "Sent", icon: Send },
  { id: "SPAM", name: "Spam", icon: AlertCircle },
  { id: "TRASH", name: "Trash", icon: Trash2 },
];

const EmailRenderer = ({ content, htmlContent }: { content: string; htmlContent?: string | null }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        const baseStyle = `
          <style>
            ::-webkit-scrollbar { display: none !important; }
            * { -ms-overflow-style: none !important; scrollbar-width: none !important; box-sizing: border-box !important; max-width: 100% !important; }
            html, body {
              overflow-x: hidden !important;
              max-width: 100% !important;
              word-break: break-word !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              font-size: 13px;
              line-height: 1.6;
              color: #f1f5f9; /* slate-100 */
              background-color: transparent;
              margin: 0;
              padding: 0;
            }
            table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; }
            td, th { word-break: break-word !important; }
            a { color: #f43f5e; text-decoration: underline; word-break: break-all; }
            img, video, iframe { max-width: 100% !important; height: auto !important; border-radius: 8px; }
            blockquote {
              border-left: 2px solid #334155;
              padding-left: 10px;
              color: #94a3b8;
              margin: 8px 0;
            }
          </style>
        `;
        const head = `<head><base target="_blank">${baseStyle}</head>`;
        doc.write(`${head}<body>${htmlContent}</body>`);
        doc.close();

        const adjustHeight = () => {
          if (iframeRef.current) {
            const body = doc.body;
            const html = doc.documentElement;
            const height = Math.max(
              body.scrollHeight,
              body.offsetHeight,
              html.clientHeight,
              html.scrollHeight,
              html.offsetHeight
            );
            iframeRef.current.style.height = `${height + 20}px`;
          }
        };

        iframeRef.current.onload = adjustHeight;
        adjustHeight();
        
        const timeout = setTimeout(adjustHeight, 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [htmlContent]);

  if (htmlContent) {
    return (
      <iframe
        ref={iframeRef}
        title="Email Body"
        className="w-full border-0 bg-transparent overflow-hidden no-scrollbar"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        style={{ height: "100px", minHeight: "100px" }}
      />
    );
  }

  return <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-200 break-words overflow-hidden min-w-0 max-w-full">{content}</div>;
};

const AttachmentRenderer = ({ attachments, messageId }: { attachments?: GmailAttachment[]; messageId: string }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-4 border-t border-slate-800/60 pt-3">
      <div className="flex items-center gap-1.5 mb-2 text-[10px] text-slate-450 font-bold uppercase tracking-wider">
        <Paperclip className="h-3 w-3" /> Attachments ({attachments.length})
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {attachments.map((att) => {
          const isImage = att.mimeType.startsWith("image/");
          const fileUrl = `${BACKEND_URL}/api/gmail/messages/${messageId}/attachments/${att.attachmentId}`;
          return (
            <div key={att.id} className="group relative border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
              {isImage ? (
                <div className="flex flex-col">
                  <div className="h-32 w-full overflow-hidden bg-slate-950 flex items-center justify-center relative">
                    <img
                      src={fileUrl}
                      alt={att.filename}
                      className="max-h-full max-w-full object-contain transition group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2 flex items-center justify-between border-t border-slate-800/60 bg-slate-900/60">
                    <div className="truncate text-[11px] font-medium text-slate-300 max-w-[70%]">
                      {att.filename}
                    </div>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-red-400 font-bold hover:underline"
                    >
                      View
                    </a>
                  </div>
                </div>
              ) : (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 hover:bg-slate-900/60 transition h-full text-left"
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 shrink-0">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-semibold text-slate-200">{att.filename}</div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {(att.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function GmailDashboard() {
  const [threads, setThreads] = useState<GmailThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<GmailThread | null>(null);
  
  // Active Navigation Tab: "MAIL" or "SETTINGS"
  const [activeTab, setActiveTab] = useState<"MAIL" | "SETTINGS">("MAIL");
  const [selectedLabel, setSelectedLabel] = useState("INBOX");

  // Config state
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyTemplate, setAutoReplyTemplate] = useState("");
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);

  // Rules list state
  const [rules, setRules] = useState<GmailAutoReplyRule[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newReplyText, setNewReplyText] = useState("");
  
  // Status states
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [addingRule, setAddingRule] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit draft text state
  const [draftReplyText, setDraftReplyText] = useState("");
  const [manualReplyMode, setManualReplyMode] = useState(true);

  const socketRef = useRef<Socket | null>(null);

  // Fetch Threads, Config, and Rules
  const fetchData = async (label = selectedLabel) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Get settings config
      const configRes = await fetch(`${BACKEND_URL}/api/gmail/config`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
      });
      if (configRes.ok) {
        const configData = await configRes.json();
        setAutoReplyEnabled(configData.autoReplyEnabled);
        setAutoReplyTemplate(configData.autoReplyTemplate || "");
        setConnectedEmail(configData.emailAddress || null);
      }

      // Fetch rules list
      await fetchRules();

      // Get threads list for current label
      const threadsRes = await fetch(`${BACKEND_URL}/api/gmail/threads?label=${label}`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
      });
      if (threadsRes.ok) {
        const threadsData = await threadsRes.json();
        setThreads(threadsData);
        if (threadsData.length > 0) {
          setSelectedThread(prev => {
            if (prev) {
              const updated = threadsData.find((t: GmailThread) => t.threadId === prev.threadId);
              return updated || threadsData[0];
            }
            return threadsData[0];
          });
        } else {
          setSelectedThread(null);
        }
      }
    } catch (err: any) {
      console.error("Failed to load Gmail data:", err);
      setErrorMsg("Failed to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmail/rules`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (err) {
      console.error("Failed to fetch rules:", err);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Gmail socket connected");
      socket.emit("join-org", DEFAULT_ORG_ID);
    });

    socket.on("gmail-updated", () => {
      console.log("Gmail update event received!");
      fetchData(selectedLabel);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync draft text state with thread selection changes
  useEffect(() => {
    if (selectedThread) {
      const messages = selectedThread.messages || [];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.direction === "inbound") {
        setDraftReplyText(lastMessage.aiDraft || "");
        setManualReplyMode(!lastMessage.aiDraft);
      } else {
        setDraftReplyText("");
        setManualReplyMode(true);
      }
    } else {
      setDraftReplyText("");
      setManualReplyMode(true);
    }
  }, [selectedThread]);

  const handleLabelChange = async (labelId: string) => {
    setSelectedLabel(labelId);
    setActiveTab("MAIL");
    await fetchData(labelId);
  };

  const handleOpenSettings = () => {
    setActiveTab("SETTINGS");
  };

  // Sync Gmail Inbox Trigger
  const handleSyncInbox = async () => {
    setSyncing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmail/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": DEFAULT_ORG_ID
        },
        body: JSON.stringify({ label: selectedLabel })
      });
      if (res.ok) {
        await fetchData(selectedLabel);
      } else {
        setErrorMsg("Failed to run email inbox sync.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error syncing inbox.");
    } finally {
      setSyncing(false);
    }
  };

  // Save Settings Config Trigger
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmail/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": DEFAULT_ORG_ID
        },
        body: JSON.stringify({
          autoReplyEnabled,
          autoReplyTemplate,
          emailAddress: connectedEmail
        })
      });
      if (res.ok) {
        console.log("Config saved successfully");
      } else {
        setErrorMsg("Failed to save auto-reply settings.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error saving config settings.");
    } finally {
      setSavingConfig(false);
    }
  };

  // Approve & Send Reply Trigger
  const handleSendReply = async () => {
    if (!selectedThread || !draftReplyText.trim()) return;
    setSendingReply(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmail/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": DEFAULT_ORG_ID
        },
        body: JSON.stringify({
          threadId: selectedThread.threadId,
          replyText: draftReplyText
        })
      });
      if (res.ok) {
        setDraftReplyText("");
        await fetchData(selectedLabel);
      } else {
        setErrorMsg("Failed to transmit email reply.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error sending reply.");
    } finally {
      setSendingReply(false);
    }
  };

  // Generate AI reply on demand
  const handleGenerateAiReply = async () => {
    if (!selectedThread) return;
    setGeneratingAi(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmail/generate-ai-reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": DEFAULT_ORG_ID
        },
        body: JSON.stringify({
          threadId: selectedThread.threadId
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.aiDraft) {
          setDraftReplyText(data.aiDraft);
          setManualReplyMode(false);
        }
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Failed to generate AI response.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error contacting AI service.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newReplyText.trim()) return;
    setAddingRule(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmail/rules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": DEFAULT_ORG_ID
        },
        body: JSON.stringify({
          keyword: newKeyword.trim(),
          replyText: newReplyText.trim()
        })
      });
      if (res.ok) {
        setNewKeyword("");
        setNewReplyText("");
        await fetchRules();
      } else {
        setErrorMsg("Failed to create auto-reply rule.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error creating rule.");
    } finally {
      setAddingRule(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    setDeletingRuleId(id);
    setErrorMsg(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmail/rules/${id}`, {
        method: "DELETE",
        headers: {
          "x-organization-id": DEFAULT_ORG_ID
        }
      });
      if (res.ok) {
        await fetchRules();
      } else {
        setErrorMsg("Failed to delete rule.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error deleting rule.");
    } finally {
      setDeletingRuleId(null);
    }
  };

  // OAuth Authentication Redirect
  const handleConnectGmail = () => {
    window.location.href = `${BACKEND_URL}/api/gmail/oauth/connect?orgId=${DEFAULT_ORG_ID}&redirect=/gmail`;
  };

  return (
    <div className="flex h-screen w-full max-w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* Global CSS to suppress scrollbar visuals while preserving scroll functionality */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900/40">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight">Gmail Automation</h1>
              <p className="text-xs text-slate-400">Keyword auto-reply rules & on-demand AI drafting</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {connectedEmail && (
              <span className="text-xs text-slate-400 bg-slate-800/80 border border-slate-700/50 rounded-lg px-2.5 py-1.5 font-medium">
                Connected: <strong className="text-slate-200">{connectedEmail}</strong>
              </span>
            )}
            <button
              onClick={handleSyncInbox}
              disabled={syncing || !connectedEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-750 bg-slate-850 hover:bg-slate-800 hover:text-slate-100 text-xs font-semibold text-slate-300 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-red-500" : ""}`} />
              {syncing ? "Syncing..." : "Sync Inbox"}
            </button>
            <button
              onClick={handleConnectGmail}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-md ${
                connectedEmail 
                  ? "bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-300"
                  : "bg-red-600 hover:bg-red-500 text-white shadow-red-950/20"
              }`}
            >
              {connectedEmail ? "Reconnect Account" : "Connect Gmail"}
            </button>
          </div>
        </header>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="bg-red-500/10 border-b border-red-500/25 px-6 py-2.5 flex items-center gap-2 text-xs text-red-400 font-semibold shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            {errorMsg}
          </div>
        )}

        {/* Loading overlay if initializing */}
        {loading && threads.length === 0 && rules.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 text-red-500 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Loading Gmail records...</p>
          </div>
        ) : !connectedEmail ? (
          /* Empty OAuth State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
            <div className="h-16 w-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-xl shadow-red-950/10">
              <Mail className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-200 mb-2">Connect Your Gmail Account</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Establish a secure Google OAuth connection to automatically fetch client emails, view threads, draft intelligent AI replies, and configure autopilot automations.
            </p>
            <button
              onClick={handleConnectGmail}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-red-950/25 flex items-center gap-2"
            >
              Get Started with OAuth <Sparkles className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Main Dashboard Workspace */
          <div className="flex-1 flex overflow-hidden">
            
            {/* Leftmost Mailbox & Settings Sidebar */}
            <div className="w-52 border-r border-slate-800 flex flex-col shrink-0 bg-slate-950/50 justify-between">
              
              {/* Top Navigation Sections */}
              <div className="flex flex-col gap-4 p-3 overflow-y-auto no-scrollbar">
                
                {/* Mailboxes Group */}
                <div className="flex flex-col gap-1">
                  <span className="px-3 py-1 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    Mailboxes
                  </span>
                  {LABELS.map((lbl) => {
                    const Icon = lbl.icon;
                    const isSelected = activeTab === "MAIL" && selectedLabel === lbl.id;
                    return (
                      <button
                        key={lbl.id}
                        onClick={() => handleLabelChange(lbl.id)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                          isSelected
                            ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm shadow-red-950/10"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{lbl.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* System Settings Group */}
                <div className="flex flex-col gap-1 border-t border-slate-850 pt-3">
                  <span className="px-3 py-1 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    Configuration
                  </span>
                  <button
                    onClick={handleOpenSettings}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                      activeTab === "SETTINGS"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm shadow-red-950/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    <Settings className="h-4 w-4 shrink-0 text-red-400" />
                    <span>Automation & Rules</span>
                  </button>
                </div>

              </div>

              {/* Sidebar Footer info */}
              <div className="p-3 border-t border-slate-850 bg-slate-950/80 text-[10px] text-slate-500 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Auto-Reply Active ({rules.length} Rules)</span>
              </div>

            </div>

            {/* Render Tab View: MAIL vs SETTINGS */}
            {activeTab === "SETTINGS" ? (
              
              /* Spacious Automation & Rules Configuration Dashboard */
              <div className="flex-1 overflow-y-auto no-scrollbar p-8 bg-slate-900/20">
                <div className="max-w-4xl mx-auto flex flex-col gap-8">
                  
                  {/* Settings Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2.5">
                        <Settings className="h-6 w-6 text-red-500" />
                        Automation & Auto-Reply Rules
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Configure keyword triggers for instant static replies, set AI prompts, and control system behavior.
                      </p>
                    </div>
                    <button
                      onClick={handleSaveConfig}
                      disabled={savingConfig}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-950/30 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {savingConfig ? "Saving Settings..." : "Save Settings"}
                    </button>
                  </div>

                  {/* Top Grid: Autopilot & AI Prompt */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Autopilot Enable Box */}
                    <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-400" /> Autopilot Execution
                          </h3>
                          <input
                            id="autopilot-setting"
                            type="checkbox"
                            checked={autoReplyEnabled}
                            onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                            className="h-5 w-5 accent-red-600 rounded cursor-pointer border-slate-700 bg-slate-900"
                          />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          When Autopilot is enabled, incoming emails containing any of your active keywords will be automatically sent your exact pre-set message. Unmatched emails skip auto-reply.
                        </p>
                      </div>
                      <div className="text-[11px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl font-medium">
                        Status: <strong>{autoReplyEnabled ? "Enabled (Live)" : "Disabled (Manual Only)"}</strong>
                      </div>
                    </div>

                    {/* AI Prompt Template Box */}
                    <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
                      <div>
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-red-400" /> AI Personality Prompt
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          Guidelines followed by Groq Llama 3 when you click "✨ AI Draft" on individual emails.
                        </p>
                      </div>
                      <textarea
                        value={autoReplyTemplate}
                        onChange={(e) => setAutoReplyTemplate(e.target.value)}
                        placeholder="e.g. Always respond in a polite sales assistant tone..."
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs leading-relaxed text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 resize-none font-sans"
                      />
                    </div>

                  </div>

                  {/* Rules Builder & Active Rules Table */}
                  <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6 shadow-sm">
                    <div>
                      <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                        <Bot className="h-5 w-5 text-red-500" /> Keyword Auto-Reply Rules
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Add specific keywords or phrases (e.g. <code className="text-red-400 font-mono bg-red-500/10 px-1 py-0.5 rounded">interview</code>, <code className="text-red-400 font-mono bg-red-500/10 px-1 py-0.5 rounded">pricing</code>). Mails matching these keywords will immediately send the exact reply message you define.
                      </p>
                    </div>

                    {/* Add Rule Form */}
                    <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl items-end">
                      <div>
                        <label className="text-xs font-bold text-slate-300 mb-1.5 block">Matching Keyword / Phrase</label>
                        <input
                          type="text"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="e.g. interview"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-300 mb-1.5 block">Auto-Reply Message</label>
                        <input
                          type="text"
                          value={newReplyText}
                          onChange={(e) => setNewReplyText(e.target.value)}
                          placeholder="Message to auto-send..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-700"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={addingRule || !newKeyword.trim() || !newReplyText.trim()}
                        className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 h-[38px] shadow-md shadow-red-950/20"
                      >
                        <Plus className="h-4 w-4" /> Add Auto-Reply Rule
                      </button>
                    </form>

                    {/* Active Rules List */}
                    <div className="flex flex-col gap-3 mt-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Rules List ({rules.length})</h4>
                      <div className="flex flex-col gap-2.5">
                        {rules.map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
                            <div className="flex flex-col gap-1 min-w-0 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-200">If mail contains:</span>
                                <span className="text-xs font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-lg">
                                  "{rule.keyword}"
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                <strong className="text-slate-400">Reply Sent:</strong> "{rule.replyText}"
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteRule(rule.id)}
                              disabled={deletingRuleId === rule.id}
                              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition shrink-0 border border-transparent hover:border-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" /> Delete Rule
                            </button>
                          </div>
                        ))}
                        {rules.length === 0 && (
                          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                            No keyword rules created yet. Enter a keyword above to get started.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* System Instructions & Guidance Card */}
                  <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-slate-400" /> How Keyword Auto-Replies Work
                    </h3>
                    <ul className="text-xs text-slate-400 leading-relaxed list-disc list-inside flex flex-col gap-2">
                      <li><strong>Selective Auto-Reply:</strong> Auto-reply will ONLY execute if an incoming email contains one of your active keywords (case-insensitive) in the subject or body.</li>
                      <li><strong>No Wasteful AI Calls:</strong> Unmatched emails (such as promotional, newsletter, or irrelevant emails) will NOT invoke AI auto-replies, saving system tokens.</li>
                      <li><strong>On-Demand AI Drafting:</strong> When reviewing unmatched emails in your Inbox, click the <strong className="text-slate-200">"✨ AI Draft"</strong> button to manually generate a Llama 3 reply draft on demand.</li>
                    </ul>
                  </div>

                </div>
              </div>

            ) : (

              /* Default Mail View (2-Pane: Thread List + Expanded Reader) */
              <div className="flex-1 flex overflow-hidden">
                
                {/* Thread List Pane */}
                <div className="w-80 border-r border-slate-800 flex flex-col shrink-0 bg-slate-950/20 overflow-y-auto no-scrollbar">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/30 shrink-0">
                    <span className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                      <Inbox className="h-4 w-4 text-slate-400" /> {selectedLabel} ({threads.length})
                    </span>
                  </div>
                  <div className="flex-1 divide-y divide-slate-850">
                    {threads.map((thread) => {
                      const isActive = selectedThread?.threadId === thread.threadId;
                      const isUnreplied = thread.status === "UNREPLIED";
                      return (
                        <div
                          key={thread.id}
                          onClick={() => setSelectedThread(thread)}
                          className={`p-4 flex flex-col gap-1.5 cursor-pointer transition text-left relative ${
                            isActive 
                              ? "bg-slate-850/80 border-l-2 border-red-500" 
                              : "hover:bg-slate-900/40 border-l-2 border-transparent"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200 truncate max-w-[150px]">
                              {thread.sender.split("<")[0].trim() || "Unknown"}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {new Date(thread.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-300 truncate">
                            {thread.subject}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {thread.snippet}
                          </p>
                          
                          {/* Status Badges */}
                          <div className="flex items-center gap-1.5 mt-1">
                            {isUnreplied ? (
                              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
                                Pending AI Draft
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Check className="h-2.5 w-2.5" /> Replied
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {threads.length === 0 && (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        No threads found in this mailbox. Click Sync Inbox to fetch.
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Middle Message Flow Panel */}
                <div className="flex-1 flex flex-col min-w-0 h-full bg-slate-900/20 overflow-y-auto overflow-x-hidden no-scrollbar p-6 md:p-8">
                  {selectedThread ? (
                    <div className="max-w-4xl w-full mx-auto flex flex-col gap-6 min-w-0 max-w-full">
                      
                      {/* Subject Header */}
                      <div className="border-b border-slate-800 pb-4 min-w-0 max-w-full overflow-hidden">
                        <h2 className="text-xl font-bold text-slate-100 truncate">{selectedThread.subject}</h2>
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          From: <span className="text-slate-300 font-medium">{selectedThread.sender}</span>
                        </p>
                      </div>

                      {/* Message Bubble Flow */}
                      <div className="flex flex-col gap-5 min-w-0 max-w-full">
                        {selectedThread.messages?.map((msg) => {
                          const isInbound = msg.direction === "inbound";
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col gap-1.5 w-full min-w-0 max-w-full ${
                                isInbound ? "self-start" : "self-end items-end"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                {isInbound ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3 text-red-400" />}
                                <span className="truncate max-w-[200px]">{msg.sender.split("<")[0].trim() || msg.sender}</span>
                                <span>•</span>
                                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                              <div
                                className={`p-5 rounded-2xl border w-full min-w-0 max-w-full overflow-hidden text-left ${
                                  isInbound 
                                    ? "bg-slate-900/90 border-slate-800 text-slate-200 rounded-tl-none shadow-sm" 
                                    : "bg-slate-850 border-slate-750 text-slate-100 rounded-tr-none shadow-sm"
                                }`}
                              >
                                <EmailRenderer content={msg.content} htmlContent={msg.htmlContent} />
                                
                                <AttachmentRenderer attachments={msg.attachments} messageId={msg.messageId} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom AI Draft Responder Panel */}
                      {selectedThread.status === "UNREPLIED" && (
                        <div className="mt-8 rounded-2xl border border-red-500/20 bg-slate-900/80 p-6 shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 h-24 w-24 bg-red-500/5 blur-2xl rounded-full" />
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Bot className="h-5 w-5 text-red-400" />
                              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                                Draft Response
                              </h3>
                            </div>
                            <button
                              onClick={handleGenerateAiReply}
                              disabled={generatingAi}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                            >
                              <Sparkles className={`h-3.5 w-3.5 ${generatingAi ? "animate-spin" : ""}`} />
                              {generatingAi ? "Generating AI Reply..." : "✨ AI Draft"}
                            </button>
                          </div>

                          {/* Text Editor */}
                          <textarea
                            value={draftReplyText}
                            onChange={(e) => setDraftReplyText(e.target.value)}
                            placeholder="Type your email response here, or click '✨ AI Draft' above to generate with AI..."
                            rows={6}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs leading-relaxed text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-700 resize-none font-sans scrollbar-none"
                          />

                          {/* Control Trigger */}
                          <div className="flex justify-end mt-4">
                            <button
                              onClick={handleSendReply}
                              disabled={sendingReply || !draftReplyText.trim()}
                              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-xs font-bold text-white transition shadow-md shadow-red-950/20"
                            >
                              <Send className="h-3.5 w-3.5" />
                              {sendingReply ? "Sending..." : "Send Email Reply"}
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                      <Mail className="h-12 w-12 mb-3 opacity-40 text-red-400" />
                      <p className="text-sm font-medium text-slate-400">No active conversation thread selected.</p>
                      <p className="text-xs text-slate-500 mt-1">Select a conversation from the left to read and reply.</p>
                    </div>
                  )}
                </div>

              </div>

            )}

          </div>
        )}

      </main>
    </div>
  );
}
