"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  RefreshCw,
  Send,
  User,
  Sparkles,
  Bot,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Check,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_ORG_ID = "demo-org-123";

interface CommentItem {
  id: string;
  fromUser: string;
  commentText: string;
  createdAt: string;
  status: "REPLIED" | "PENDING";
  autoReplyText?: string;
  mediaId?: string;
  postCaption?: string;
}

export default function InstagramCommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [simulating, setSimulating] = useState<boolean>(false);
  const [profileHandle, setProfileHandle] = useState<string>("jisnu_digitalsolution_pvt_ltd");

  const fetchRealComments = async () => {
    setRefreshing(true);
    try {
      // Fetch live comments
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/instagram/comments`, {
          headers: { "x-organization-id": DEFAULT_ORG_ID }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.comments)) {
            setComments(data.comments);
          }
        }
      } catch (cErr: any) {
        console.warn("[IG COMMENTS FETCH WARN]: Backend un-reachable:", cErr?.message);
      }

      // Fetch live profile handle from Meta config
      try {
        const profileRes = await fetch(`${BACKEND_URL}/api/admin/instagram/config`, {
          headers: { "x-organization-id": DEFAULT_ORG_ID }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.liveProfile?.username) {
            setProfileHandle(profileData.liveProfile.username);
          }
        }
      } catch (pErr: any) {
        console.warn("[IG PROFILE FETCH WARN]: Backend un-reachable:", pErr?.message);
      }
    } catch (err) {
      console.error("Failed to fetch IG comments:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealComments();

    // Automatically refresh live Instagram comments every 10 minutes (600,000 ms)
    const tenMinInterval = setInterval(() => {
      console.log("Automatically refreshing live Instagram comments (10-min interval)");
      fetchRealComments();
    }, 600000);

    const socket: Socket = io(BACKEND_URL);
    socket.emit("join-org", DEFAULT_ORG_ID);

    socket.on("instagram-comment-received", (newComment: CommentItem) => {
      setComments((prev) => [newComment, ...prev]);
    });

    return () => {
      clearInterval(tenMinInterval);
      socket.disconnect();
    };
  }, []);

  const handleSimulateWebhook = async () => {
    setSimulating(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/instagram/comments/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": DEFAULT_ORG_ID
        }
      });
      if (res.ok) {
        await fetchRealComments();
      }
    } catch (err) {
      console.error("Failed to simulate comment webhook:", err);
    } finally {
      setSimulating(false);
    }
  };

  const filteredComments = comments.filter(
    (c) =>
      c.fromUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.commentText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.autoReplyText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Instagram Comment Automation
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                Live Webhook Active
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Real-time Instagram post comment monitoring & automatic DM / reply actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRealComments}
            disabled={refreshing}
            className="px-3.5 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-purple-400" : ""}`} />
            Sync Real Comments
          </button>
        </div>
      </header>

      {/* Main Page Scrollable Layout */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 scrollbar-thin scrollbar-none">
        {/* Banner Info Card */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/20 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-400" /> Automatic Comment & DM Reply Engine
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              All incoming user comments on your <code className="text-purple-400 font-mono">@{profileHandle}</code> profile posts are automatically parsed. The bot responds publicly under the comment and dispatches follow-up greeting DMs instantly.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono bg-slate-950/60 px-4 py-2.5 rounded-2xl border border-slate-800">
            <div>
              Total Tracked: <span className="text-slate-200 font-bold">{comments.length}</span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div>
              Auto-Replied: <span className="text-emerald-400 font-bold">{comments.filter((c) => c.status === "REPLIED").length}</span>
            </div>
          </div>
        </div>

        {/* Search Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search comments by user or message content..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
          <div className="text-xs text-slate-400">
            Showing <span className="text-slate-200 font-semibold">{filteredComments.length}</span> of {comments.length} comments
          </div>
        </div>

        {/* Comments Feed Container */}
        {loading ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-400 mx-auto" />
            <p className="text-xs text-slate-400">Fetching real Instagram profile comments...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <MessageSquare className="h-8 w-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No Instagram Comments Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Real-time user comments on your Instagram posts will automatically appear here as they are posted. Auto-refreshes every 10 minutes.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredComments.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/30 rounded-2xl p-5 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 p-[2px]">
                      <div className="h-full w-full bg-slate-950 rounded-full flex items-center justify-center text-xs font-bold text-pink-400">
                        {item.fromUser ? item.fromUser[0].toUpperCase() : "U"}
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-200 block">
                        @{item.fromUser}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Auto-Replied
                  </span>
                </div>

                {/* Comment & Reply Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      User Comment
                    </span>
                    <p className="text-xs text-slate-200 italic font-sans">
                      "{item.commentText}"
                    </p>
                  </div>

                  <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Automated Public & DM Reply
                    </span>
                    <p className="text-xs text-purple-200 font-sans">
                      "{item.autoReplyText || `Thanks for commenting @${item.fromUser}! How can we assist you today? Feel free to DM us! 🚀`}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
