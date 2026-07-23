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
  Info,
  Shield,
  Layers,
  ArrowRight,
  Search,
  ExternalLink,
  MessageSquare
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
  { id: "INBOX", name: "Inbox", icon: Inbox, count: 0 },
  { id: "STARRED", name: "Starred", icon: Star, count: 0 },
  { id: "SENT", name: "Sent", icon: Send, count: 0 },
  { id: "SPAM", name: "Spam", icon: AlertCircle, count: 0 },
  { id: "TRASH", name: "Trash", icon: Trash2, count: 0 },
];

// Helper to generate initials from sender name
const getInitials = (sender: string) => {
  const name = sender.split("<")[0].trim().replace(/['"]/g, "");
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper to generate custom avatar background based on initials
const getAvatarColor = (initials: string) => {
  const code = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
  const colors = [
    "from-pink-500 to-rose-600 text-rose-100 border-rose-400/20 shadow-rose-950/20",
    "from-purple-500 to-indigo-600 text-indigo-100 border-indigo-400/20 shadow-indigo-950/20",
    "from-blue-500 to-sky-600 text-sky-100 border-sky-400/20 shadow-sky-950/20",
    "from-emerald-500 to-teal-600 text-teal-100 border-teal-400/20 shadow-teal-950/20",
    "from-amber-500 to-orange-600 text-orange-100 border-orange-400/20 shadow-orange-950/20",
    "from-primary to-accent text-slate-100 border-primary/20 shadow-primary/20",
  ];
  return colors[code % colors.length];
};

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
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              font-size: 13px;
              line-height: 1.6;
              color: #1e293b; /* slate-800 */
              background-color: #ffffff;
              margin: 0;
              padding: 0;
            }
            table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; }
            td, th { word-break: break-word !important; }
            a { color: #55e6c1; text-decoration: underline; word-break: break-all; }
            img, video, iframe { max-width: 100% !important; height: auto !important; border-radius: 8px; }
            blockquote {
              border-left: 3px solid #334155;
              padding-left: 12px;
              color: #64748b;
              margin: 12px 0;
              font-style: italic;
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

  return (
    <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-800 break-words overflow-hidden min-w-0 max-w-full">
      {content}
    </div>
  );
};

const AttachmentRenderer = ({ attachments, messageId }: { attachments?: GmailAttachment[]; messageId: string }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-5 border-t border-slate-800/80 pt-4">
      <div className="flex items-center gap-1.5 mb-3 text-[10px] text-slate-450 font-bold uppercase tracking-wider">
        <Paperclip className="h-3 w-3 text-slate-400" /> Attachments ({attachments.length})
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((att) => {
          const isImage = att.mimeType.startsWith("image/");
          const fileUrl = `${BACKEND_URL}/api/gmail/messages/${messageId}/attachments/${att.attachmentId}`;
          return (
            <div key={att.id} className="group relative border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/50 hover:border-slate-700/60 transition-all duration-300 hover:shadow-lg hover:shadow-black/20">
              {isImage ? (
                <div className="flex flex-col">
                  <div className="h-36 w-full overflow-hidden bg-slate-950 flex items-center justify-center relative">
                    <img
                      src={fileUrl}
                      alt={att.filename}
                      className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-primary rounded-xl text-slate-950 text-xs font-bold shadow-lg shadow-primary/30 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View Image
                      </a>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between border-t border-slate-800/80 bg-slate-900/40">
                    <div className="truncate text-xs font-medium text-slate-300 max-w-[75%]">
                      {att.filename}
                    </div>
                    <span className="text-[10px] text-slate-505">
                      {(att.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              ) : (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-4 hover:bg-slate-900/40 transition h-full text-left"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 group-hover:bg-primary/20 transition">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-semibold text-slate-200 group-hover:text-primary transition">{att.filename}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
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
  
  // Navigation Tab: "MAIL" or "SETTINGS"
  const [activeTab, setActiveTab] = useState<"MAIL" | "SETTINGS">("MAIL");
  const [selectedLabel, setSelectedLabel] = useState("INBOX");
  const [searchTerm, setSearchTerm] = useState("");

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
      let threadsRes = await fetch(`${BACKEND_URL}/api/gmail/threads?label=${label}`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
      });
      if (threadsRes.ok) {
        let threadsData = await threadsRes.json();

        // If no cached threads exist for this category yet, trigger sync from Gmail API
        if (threadsData.length === 0 && configRes.ok) {
          try {
            await fetch(`${BACKEND_URL}/api/gmail/sync`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-organization-id": DEFAULT_ORG_ID
              },
              body: JSON.stringify({ label })
            });
            const refetched = await fetch(`${BACKEND_URL}/api/gmail/threads?label=${label}`, {
              headers: { "x-organization-id": DEFAULT_ORG_ID }
            });
            if (refetched.ok) {
              threadsData = await refetched.json();
            }
          } catch (syncErr) {
            console.warn("Auto sync for label failed:", syncErr);
          }
        }

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
      } else {
        setDraftReplyText("");
      }
    } else {
      setDraftReplyText("");
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

  const handleAddRule = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
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
        const errorData = await res.json().catch(() => ({}));
        setErrorMsg(errorData.error || errorData.details || "Failed to create auto-reply rule.");
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

  // Filter threads by search term
  const filteredThreads = threads.filter(thread => {
    const search = searchTerm.toLowerCase();
    return (
      thread.subject.toLowerCase().includes(search) ||
      thread.sender.toLowerCase().includes(search) ||
      thread.snippet.toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans select-none antialiased">
      
      {/* Global CSS for custom animations and scrollbars */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.15);
          border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.3);
        }
        
        .glow-pulse {
          box-shadow: 0 0 15px rgba(var(--primary), 0.15);
          animation: pulse 2s infinite alternate;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 15px var(--primary); }
          100% { box-shadow: 0 0 25px var(--secondary); }
        }

        .ai-glow-card {
          position: relative;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
        }
        .ai-glow-card::before {
          content: "";
          position: absolute;
          inset: -1px;
          background: linear-gradient(135deg, rgba(var(--primary), 0.3) 0%, rgba(var(--secondary), 0.3) 50%, rgba(var(--accent), 0.1) 100%);
          border-radius: inherit;
          z-index: -1;
          pointer-events: none;
        }
      `}</style>

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 bg-white backdrop-blur-xl flex flex-col justify-between shrink-0 z-25">
        <div className="flex flex-col gap-6 p-5">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="h-full w-full rounded-[14px] bg-white flex items-center justify-center">
                <Mail className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                Gmail Portal
              </span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Automation Hub</p>
            </div>
          </div>

          {/* Mailboxes Group */}
          <div className="flex flex-col gap-1.5">
            <span className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              Folders
            </span>
            {LABELS.map((lbl) => {
              const Icon = lbl.icon;
              const isSelected = activeTab === "MAIL" && selectedLabel === lbl.id;
              return (
                <button
                  key={lbl.id}
                  onClick={() => handleLabelChange(lbl.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 duration-200 ${isSelected ? "text-emerald-600" : "text-slate-500 group-hover:text-slate-700"}`} />
                    <span>{lbl.name}</span>
                  </div>
                  {lbl.count > 0 && (
                    <span className="text-[9px] font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full text-slate-600">
                      {lbl.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* System Settings Group */}
          <div className="flex flex-col gap-1.5 border-t border-slate-200 pt-5">
            <span className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              Management
            </span>
            <button
              onClick={handleOpenSettings}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                activeTab === "SETTINGS"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Settings className={`h-4 w-4 shrink-0 transition-transform group-hover:rotate-45 duration-200 ${activeTab === "SETTINGS" ? "text-emerald-600" : "text-slate-500"}`} />
              <span>Automation & Rules</span>
            </button>
          </div>
        </div>

        {/* Sidebar Info Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-3">
          {connectedEmail && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="text-[10px] text-slate-600 font-semibold truncate max-w-[170px]" title={connectedEmail}>
                {connectedEmail}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Secure OAuth Connection</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        
        {/* Header Section */}
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <Mail className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight text-slate-900">
                {activeTab === "SETTINGS" ? "Automation Configuration" : `Mailbox: ${selectedLabel}`}
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {activeTab === "SETTINGS" 
                  ? "Define keywords, responses, and template settings" 
                  : "On-demand AI sentiment response manager"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncInbox}
              disabled={syncing || !connectedEmail}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin text-emerald-600" : ""}`} />
              {syncing ? "Syncing Inbox..." : "Sync Inbox"}
            </button>
            <button
              onClick={handleConnectGmail}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md ${
                connectedEmail 
                  ? "bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700"
                  : "bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-emerald-500/20"
              }`}
            >
              {connectedEmail ? "Reconnect Account" : "Connect Gmail"}
            </button>
          </div>
        </header>

        {/* Error Alert Display */}
        {errorMsg && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-8 py-3 flex items-center gap-3 text-xs text-red-400 font-semibold shrink-0">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Tabs Switch */}
        {loading && threads.length === 0 && rules.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 rounded-2xl border border-primary/25 bg-primary/5 flex items-center justify-center animate-pulse">
              <RefreshCw className="h-6 w-6 text-primary animate-spin" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing workspace records...</p>
          </div>
        ) : !connectedEmail ? (
          /* Empty / Unconnected State Graphic */
          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
            <div className="h-20 w-20 rounded-[28px] bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6 shadow-lg relative">
              <Mail className="h-10 w-10 text-emerald-600 relative z-10" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Connect Your Workspace Inbox</h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-8">
              Establish a secure Google OAuth connection to instantly monitor client inquiries, review conversations, drafts AI responses, and manage auto-replies.
            </p>
            <button
              onClick={handleConnectGmail}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs tracking-wide transition shadow-lg shadow-emerald-500/20 flex items-center gap-2.5 transform active:scale-98 cursor-pointer"
            >
              Sign In with Google <Sparkles className="h-4 w-4" />
            </button>
          </div>
        ) : activeTab === "SETTINGS" ? (
          /* -------------------- SETTINGS TAB VIEW -------------------- */
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
              
              {/* Autopilot and Prompt Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Autopilot Controller Panel */}
                <div className="border border-slate-200 rounded-3xl bg-white p-6 flex flex-col justify-between gap-5 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Zap className="h-4.5 w-4.5 text-amber-500 animate-pulse" /> AI Autopilot Engine
                      </h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoReplyEnabled}
                          onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Enable autopilot to instantly respond to incoming emails that match any of your keyword rules. Emails that do not contain keywords will remain in the inbox for manual AI generation.
                    </p>
                  </div>
                  
                  <div className={`text-[10px] font-bold px-3 py-2.5 rounded-xl border flex items-center gap-2 ${
                    autoReplyEnabled 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                      : "bg-slate-100 border-slate-200 text-slate-600"
                  }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${autoReplyEnabled ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                    <span>Autopilot Status: <strong>{autoReplyEnabled ? "ACTIVE & MONITORING" : "PAUSED (MANUAL ONLY)"}</strong></span>
                  </div>
                </div>

                {/* AI Configuration Prompt Card */}
                <div className="border border-slate-200 rounded-3xl bg-white p-6 flex flex-col gap-4 shadow-sm">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-emerald-600" /> System Personality Instructions
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Control the parameters, guidelines, tone, and specific details followed by Llama 3 when drafting manually or automatically.
                    </p>
                  </div>
                  <textarea
                    value={autoReplyTemplate}
                    onChange={(e) => setAutoReplyTemplate(e.target.value)}
                    placeholder="e.g. You are an expert sales support manager. Act polite, helpful, and concise..."
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition duration-300 resize-none font-sans"
                  />
                </div>

              </div>

              {/* Rules Management Card */}
              <div className="border border-slate-200 rounded-3xl bg-white p-6 flex flex-col gap-6 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-emerald-600" /> Keyword Routing Rules
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Add words or phrases to capture and resolve immediately. When matching email arrives, the designated responder content is sent back instantly.
                  </p>
                </div>

                {/* Form to add rules */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl items-end">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Matching Phrase / Keyword</label>
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="e.g. pricing catalog"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Instant Reply Message</label>
                    <input
                      type="text"
                      value={newReplyText}
                      onChange={(e) => setNewReplyText(e.target.value)}
                      placeholder="e.g. Hello, our pricing is located at..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRule}
                    disabled={addingRule || !newKeyword.trim() || !newReplyText.trim()}
                    className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-xs font-bold text-white transition duration-200 flex items-center justify-center gap-2 h-[41px] shadow-sm shrink-0 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> {addingRule ? "Adding..." : "Add Rule"}
                  </button>
                </div>

                {/* Rules Table */}
                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active System Rules ({rules.length})</span>
                  <div className="flex flex-col gap-3">
                    {rules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-slate-300 transition-colors">
                        <div className="flex flex-col gap-1 min-w-0 pr-6">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-600">If subject or body contains:</span>
                            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg shadow-sm">
                              {rule.keyword}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                            <strong className="text-slate-500 font-semibold">Instant Reply:</strong> "{rule.replyText}"
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          disabled={deletingRuleId === rule.id}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition border border-transparent shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{deletingRuleId === rule.id ? "Deleting..." : "Remove"}</span>
                        </button>
                      </div>
                    ))}
                    
                    {rules.length === 0 && (
                      <div className="p-10 text-center border border-dashed border-slate-300 rounded-2xl text-slate-400 text-xs">
                        No active auto-reply keyword filters. Configure keyword triggers above.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Config Actions */}
              <div className="flex justify-end gap-3 shrink-0">
                <button
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs tracking-wide transition shadow-md shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  {savingConfig ? "Saving Config..." : "Save Settings"}
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* -------------------- INBOX TAB VIEW -------------------- */
          <div className="flex-1 flex overflow-hidden">
            
            {/* Conversation Threads Pane */}
            <div className="w-85 border-r border-slate-200 flex flex-col shrink-0 bg-white overflow-hidden">
              
              {/* Search Bar Block */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
                  />
                </div>
              </div>

              {/* Scrollable Conversation List */}
              <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-100">
                {filteredThreads.map((thread) => {
                  const isActive = selectedThread?.threadId === thread.threadId;
                  const isUnreplied = thread.status === "UNREPLIED";
                  const initials = getInitials(thread.sender);
                  const avatarTheme = getAvatarColor(initials);
                  
                  return (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`p-4 flex gap-3.5 cursor-pointer transition-all duration-200 text-left relative group ${
                        isActive 
                          ? "bg-emerald-50/60 border-l-3 border-emerald-500" 
                          : "hover:bg-slate-50 border-l-3 border-transparent"
                      }`}
                    >
                      {/* Initials Avatar */}
                      <div className={`h-10 w-10 rounded-2xl bg-gradient-to-tr ${avatarTheme} border flex items-center justify-center font-bold text-xs shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs truncate max-w-[130px] ${isUnreplied ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                            {thread.sender.split("<")[0].trim().replace(/['"]/g, "") || "Unknown"}
                          </span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-0.5 shrink-0">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(thread.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <h4 className={`text-xs truncate ${isUnreplied ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}>
                          {thread.subject}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-0.5">
                          {thread.snippet}
                        </p>

                        {/* Status Pills */}
                        <div className="flex items-center justify-between mt-1.5">
                          {isUnreplied ? (
                            <span className="text-[9px] font-extrabold tracking-wide uppercase bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-lg shadow-sm">
                              Pending Action
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold tracking-wide uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-sm">
                              <Check className="h-2.5 w-2.5" /> Replied
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredThreads.length === 0 && (
                  <div className="p-10 text-center text-slate-400 text-xs">
                    No matching threads found.
                  </div>
                )}
              </div>
            </div>

            {/* Email Message Detail Flow and Reader Pane */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto no-scrollbar p-8">
              {selectedThread ? (
                <div className="max-w-4xl w-full mx-auto flex flex-col gap-6 min-w-0">
                  
                  {/* Selected Subject Header */}
                  <div className="border-b border-slate-200 pb-5 min-w-0 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-slate-900 truncate tracking-tight">{selectedThread.subject}</h2>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        From: <span className="text-slate-700 font-semibold">{selectedThread.sender}</span>
                      </p>
                    </div>
                    {selectedThread.status === "UNREPLIED" && (
                      <span className="text-[10px] font-extrabold tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-xl shrink-0 uppercase shadow-sm flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Awaiting Response
                      </span>
                    )}
                  </div>

                  {/* Message Bubble Chronology list */}
                  <div className="flex flex-col gap-5 min-w-0">
                    {selectedThread.messages?.map((msg) => {
                      const isInbound = msg.direction === "inbound";
                      const initials = getInitials(msg.sender);
                      const avatarTheme = getAvatarColor(initials);
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-4 min-w-0 w-full ${
                            isInbound ? "self-start" : "flex-row-reverse self-end"
                          }`}
                        >
                          {/* Avatar Circle */}
                          <div className={`h-9 w-9 rounded-2xl bg-gradient-to-tr ${avatarTheme} border flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm mt-1`}>
                            {initials}
                          </div>

                          <div className={`flex flex-col gap-1.5 max-w-[85%] min-w-0 ${!isInbound && "items-end"}`}>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span className="truncate font-semibold text-slate-700">
                                {isInbound ? msg.sender.split("<")[0].trim().replace(/['"]/g, "") : "AI Agent"}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            
                            {/* Message content card wrapper */}
                            <div
                              className={`p-5 rounded-3xl border text-left w-full min-w-0 break-words overflow-hidden ${
                                isInbound 
                                  ? "bg-white border-slate-200 text-slate-900 rounded-tl-none shadow-sm" 
                                  : "bg-slate-100 border-slate-200 text-slate-900 rounded-tr-none shadow-sm"
                              }`}
                            >
                              <EmailRenderer content={msg.content} htmlContent={msg.htmlContent} />
                              
                              {/* Attachments inside bubble */}
                              <AttachmentRenderer attachments={msg.attachments} messageId={msg.messageId} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Redesigned AI/Manual Action Responder Panel */}
                  {selectedThread.status === "UNREPLIED" && (
                    <div className="mt-8 rounded-3xl border border-emerald-200 bg-white p-6 shadow-md relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-emerald-600" />
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">Draft Response</h3>
                            <p className="text-[10px] text-slate-500 font-medium">Draft custom message or request Llama 3 generation</p>
                          </div>
                        </div>
                        <button
                          onClick={handleGenerateAiReply}
                          disabled={generatingAi}
                          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition duration-300 disabled:opacity-50 shadow-sm cursor-pointer"
                        >
                          <Sparkles className={`h-4 w-4 ${generatingAi ? "animate-spin text-emerald-600" : ""}`} />
                          {generatingAi ? "Invoking AI Engine..." : "Generate AI Reply"}
                        </button>
                      </div>

                      {/* Text editor box */}
                      <textarea
                        value={draftReplyText}
                        onChange={(e) => setDraftReplyText(e.target.value)}
                        placeholder="Type your manual response email here, or click 'Generate AI Reply' above to draft with AI..."
                        rows={6}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs leading-relaxed text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none font-sans"
                      />

                      {/* Responder Control Panel */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <Info className="h-4.5 w-4.5 text-slate-400" />
                          <span>Review the email content before sending. Auto-replies are recorded.</span>
                        </div>
                        <button
                          onClick={handleSendReply}
                          disabled={sendingReply || !draftReplyText.trim()}
                          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-xs font-bold text-white transition shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer"
                        >
                          <Send className="h-4 w-4" />
                          {sendingReply ? "Sending..." : "Send Email Reply"}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                /* Empty thread viewer graphic */
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <Mail className="h-16 w-16 mb-3 opacity-40 text-emerald-600" />
                  <p className="text-sm font-semibold text-slate-700">No active thread selected</p>
                  <p className="text-xs text-slate-500 mt-1">Select a mailbox item from the left panel to inspect message flow.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
