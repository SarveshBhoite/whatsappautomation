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
      const res = await fetch(`${BACKEND_URL}/api/admin/instagram/comments`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.comments)) {
          setComments(data.comments);
        }
      }

      // Fetch live profile handle from Meta config
      const profileRes = await fetch(`${BACKEND_URL}/api/admin/instagram/config`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.liveProfile?.username) {
          setProfileHandle(profileData.liveProfile.username);
        }
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
    const org = getOrgId(); if (org) socket.emit("join-org", org);

    socket.on("instagram-comment-received", (newComment: CommentItem) => {
      setComments((prev) => [newComment, ...prev]);
    });

    return () => {
      clearInterval(tenMinInterval);
      socket.disconnect();
    };
  }, []);

  const filteredComments = comments.filter(
    (c) =>
      c.fromUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.commentText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.autoReplyText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-200/90 bg-white px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 shadow-2xs">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              Instagram Comment Automation
              <Badge variant="success" className="text-[10px] font-mono">
                Live Webhook Active
              </Badge>
            </h1>
            <p className="text-xs text-slate-500">
              Real-time Instagram post comment monitoring &amp; automatic DM / reply actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRealComments}
            disabled={refreshing}
            className="border-slate-200 text-slate-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-pink-600" : ""}`} />
            Sync Comments
          </Button>
        </div>
      </header>

      {/* Main Page Scrollable Layout */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Banner Info Card */}
        <div className="bg-gradient-to-r from-white via-pink-50/40 to-white border border-pink-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="brand" className="text-xs font-bold mb-1">
              <Bot className="h-4 w-4 text-pink-600 mr-1" /> Automatic Comment &amp; DM Reply Engine
            </Badge>
            <h2 className="text-sm font-bold text-slate-900">
              Real-Time Community Engagement Autopilot
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              All incoming user comments on your <code className="text-pink-700 font-mono font-bold">@{profileHandle}</code> profile posts are automatically parsed. The bot responds publicly under the comment and dispatches follow-up greeting DMs instantly.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 font-mono bg-white px-4 py-2.5 rounded-2xl border border-pink-100 shadow-2xs">
            <div>
              Total Tracked: <span className="text-slate-900 font-bold">{comments.length}</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div>
              Auto-Replied: <span className="text-emerald-700 font-bold">{comments.filter((c) => c.status === "REPLIED").length}</span>
            </div>
          </div>
        </div>

        {/* Search Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search comments by user or message content..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500 shadow-2xs transition-all"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="text-slate-900 font-bold">{filteredComments.length}</span> of {comments.length} comments
          </div>
        </div>

        {/* Comments Feed Container */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <RefreshCw className="h-6 w-6 animate-spin text-pink-600 mx-auto" />
            <p className="text-xs text-slate-500">Fetching real Instagram profile comments...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <MessageSquare className="h-8 w-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Instagram Comments Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Real-time user comments on your Instagram posts will automatically appear here as they are posted. Auto-refreshes every 10 minutes.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredComments.map((item) => (
              <div
                key={item.id}
                className="bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-pink-300 rounded-2xl p-5 transition-all space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px]">
                      <div className="h-full w-full bg-white rounded-full flex items-center justify-center text-xs font-bold text-pink-600">
                        {item.fromUser ? item.fromUser[0].toUpperCase() : "U"}
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        @{item.fromUser}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Badge variant="success" className="text-[10px]">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Auto-Replied
                  </Badge>
                </div>

                {/* Comment & Reply Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                      User Comment
                    </span>
                    <p className="text-xs text-slate-800 italic font-sans">
                      &quot;{item.commentText}&quot;
                    </p>
                  </div>

                  <div className="bg-pink-50/70 border border-pink-200 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-pink-700 block tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-pink-600" /> Automated Public &amp; DM Reply
                    </span>
                    <p className="text-xs text-pink-950 font-sans">
                      &quot;{item.autoReplyText || `Thanks for commenting @${item.fromUser}! How can we assist you today? Feel free to DM us! 🚀`}&quot;
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
