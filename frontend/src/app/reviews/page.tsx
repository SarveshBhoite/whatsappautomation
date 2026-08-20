"use client";

import React, { useState, useEffect } from "react";
import { 
  Star, 
  Settings, 
  MessageSquare, 
  GitMerge, 
  Database, 
  Key, 
  Bot, 
  User, 
  Check, 
  CheckCheck, 
  Save, 
  ExternalLink, 
  ChevronRight, 
  Plus, 
  Download,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Store
} from "lucide-react";
import Link from "next/link";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: string;
  source: "GOOGLE" | "FUNNEL";
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment?: string;
  status: "APPROVED" | "PENDING" | "DECLINED";
  replyText?: string;
  replyStatus?: "PENDING" | "REPLIED" | "ERROR";
  createdAt: string;
}

interface GmbConfig {
  orgId: string;
  placeId: string;
  locationName: string;
  googleRating: number;
  googleReviewCount: number;
  minReviewRating: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    const org = localStorage.getItem("organization_id");
    if (org) return org;
  }
  return "";
};

export default function ReviewsPage() {
  const [orgId, setOrgId] = useState<string>(getOrgId());
  const [reviews, setReviews] = useState<Review[]>([]);
  const [config, setConfig] = useState<GmbConfig>({
    orgId: getOrgId(),
    placeId: "",
    locationName: "Jisnu Digital Solutions Pvt.Ltd",
    googleRating: 5.0,
    googleReviewCount: 0,
    minReviewRating: 3,
  });

  const [activeFilter, setActiveFilter] = useState<"ALL" | "GOOD" | "BAD">("ALL");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [autoReplyingAll, setAutoReplyingAll] = useState(false);
  const [replyTextMap, setReplyTextMap] = useState<{ [reviewId: string]: string }>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const currentOrg = orgId || getOrgId();
  const publicFunnelUrl = `${FRONTEND_URL}/review/${currentOrg}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicFunnelUrl)}`;

  const fetchConfig = async (activeOrg = currentOrg) => {
    if (!activeOrg) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/config?orgId=${encodeURIComponent(activeOrg)}`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error("Failed to fetch GMB config:", err);
    }
  };

  const fetchReviews = async (activeOrg = currentOrg) => {
    if (!activeOrg) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/reviews?orgId=${encodeURIComponent(activeOrg)}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  useEffect(() => {
    const resolvedOrg = getOrgId();
    setOrgId(resolvedOrg);
    if (!resolvedOrg) return;

    fetchConfig(resolvedOrg);
    fetchReviews(resolvedOrg);

    const socket = io(BACKEND_URL);
    socket.emit("join-org", resolvedOrg);

    socket.on("review-created", (newReview: Review) => {
      setReviews((prev) => [newReview, ...prev.filter((r) => r.id !== newReview.id)]);
    });

    socket.on("review-updated", (updatedReview: Review) => {
      setReviews((prev) => prev.map((r) => (r.id === updatedReview.id ? updatedReview : r)));
    });

    socket.on("reviews-synced", (syncedReviews: Review[]) => {
      if (Array.isArray(syncedReviews)) {
        setReviews(syncedReviews);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSyncReviews = async () => {
    const resolvedOrg = orgId || getOrgId();
    if (!resolvedOrg) {
      alert("Please log in to your organization to sync reviews.");
      return;
    }

    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/reviews/sync?orgId=${encodeURIComponent(resolvedOrg)}`);
      if (res.ok) {
        const data = await res.json();
        setSyncMessage({
          text: data.message || `Success! Synced ${data.syncedCount || 0} reviews.`,
        });
        if (data.reviews) {
          setReviews(data.reviews);
        } else {
          await fetchReviews(resolvedOrg);
        }
        await fetchConfig(resolvedOrg);
      } else {
        const errData = await res.json().catch(() => ({}));
        setSyncMessage({
          text: errData.error || "Failed to sync reviews from Google Business Profile.",
          isError: true,
        });
      }
    } catch (err) {
      setSyncMessage({
        text: "Network error attempting to contact review sync engine.",
        isError: true,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleAutoReplyAll = async () => {
    const resolvedOrg = orgId || getOrgId();
    if (!resolvedOrg) {
      alert("Please log in to your organization.");
      return;
    }
    setAutoReplyingAll(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/reviews/auto-reply-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: resolvedOrg }),
      });
      if (res.ok) {
        const data = await res.json();
        setSyncMessage({
          text: data.message || `AI Auto-Reply complete! Processed customer reviews with automated sentiment responses.`,
        });
        if (data.reviews) {
          setReviews(data.reviews);
        } else {
          await fetchReviews(resolvedOrg);
        }
      }
    } catch (err) {
      console.error("Auto reply all error:", err);
    } finally {
      setAutoReplyingAll(false);
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    const text = replyTextMap[reviewId];
    if (!text || !text.trim()) return;

    const resolvedOrg = orgId || getOrgId();
    if (!resolvedOrg) {
      alert("Please log in to your organization.");
      return;
    }

    setSubmittingReplyId(reviewId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/reviews/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, replyText: text, orgId: resolvedOrg }),
      });

      if (res.ok) {
        const updated = await res.json();
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
        setReplyTextMap((prev) => ({ ...prev, [reviewId]: "" }));
      }
    } catch (err) {
      console.error("Reply failed:", err);
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const downloadQrCode = async () => {
    try {
      const response = await fetch(qrCodeImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Feedback_Funnel_QR_${config.locationName.replace(/\s+/g, "_") || "Jisnu"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(qrCodeImageUrl, "_blank");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "GOOD") return r.rating >= 3;
    if (activeFilter === "BAD") return r.rating < 3;
    return true;
  });

  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;
  const liveReviews = reviews.filter((r) => r.source === "GOOGLE");
  const liveAverageRating = liveReviews.length 
    ? (liveReviews.reduce((acc, r) => acc + r.rating, 0) / liveReviews.length).toFixed(1) 
    : "0.0";
  const liveTotalReviews = liveReviews.length;

  const funnelReviews = reviews.filter((r) => r.source === "FUNNEL");
  const approvedFunnel = funnelReviews.filter((r) => r.status === "APPROVED").length;
  const approvalRate = funnelReviews.length 
    ? ((approvedFunnel / funnelReviews.length) * 100).toFixed(0) 
    : "100";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 pb-[calc(env(safe-area-inset-bottom)+56px)] sm:pb-0">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-200/90 bg-white px-6 flex items-center justify-between shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
              <Star className="h-4 w-4 fill-current" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900">Google Reviews &amp; Reputation Engine</h1>
              <p className="text-xs text-slate-500">Autonomous sentiment response &amp; feedback funnel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoReplyAll}
              disabled={autoReplyingAll}
              className="border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50"
            >
              <Bot className={`h-4 w-4 mr-1 ${autoReplyingAll ? "animate-spin" : ""}`} />
              {autoReplyingAll ? "Auto-Replying..." : "AI Sentiment Reply All"}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleSyncReviews}
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync Live Reviews"}
            </Button>
          </div>
        </header>

        {/* Dashboard Panels Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 w-full max-w-7xl mx-auto">

          {/* Sync Status Banner */}
          {syncMessage && (
            <div className={`p-4 rounded-2xl border flex items-center gap-2 text-xs font-bold animate-fadeIn shadow-2xs ${
              syncMessage.isError 
                ? "bg-red-50 border-red-200 text-red-800" 
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}>
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{syncMessage.text}</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Average Rating</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-3xl font-black text-slate-900">{liveAverageRating}</span>
                <div className="flex text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                </div>
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Live Google Business rating</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total Reviews</span>
              <span className="text-3xl font-black text-slate-900 mt-1.5">{liveTotalReviews}</span>
              <span className="text-[10px] text-slate-500 mt-1">Live reviews on business profile</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Pending Feedback</span>
              <div className="flex items-center justify-between mt-1.5">
                <span className={`text-3xl font-black ${pendingCount > 0 ? "text-amber-600" : "text-slate-900"}`}>
                  {pendingCount}
                </span>
                {pendingCount > 0 && (
                  <Badge variant="warning" className="text-[9px]">
                    Filter Locked
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Internal negative feedback pending</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Funnel Promotion Rate</span>
              <span className="text-3xl font-black text-slate-900 mt-1.5">
                {approvalRate}%
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Ratio of funnel submissions approved</span>
            </div>
          </div>

          {/* Configuration Setup & QR Panel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Setup Form Replaced with Active AI Sentiment Status Card */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Bot className="h-4.5 w-4.5 text-amber-600" /> Automated AI Sentiment Analysis Auto-Reply
                </h3>
                <Badge variant="success">
                  Active ✓
                </Badge>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Automated sentiment analysis auto-reply is active for all Google and Funnel reviews. Our AI engine automatically analyzes the star rating and sentiment context of incoming customer reviews to generate and post appropriate, personalized responses directly to Google Business Profile.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">4-5 Star Reviews</span>
                  <span className="text-xs text-emerald-950 font-medium">Generates appreciative, warm customer thank-you responses.</span>
                </div>
                <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">3 Star Reviews</span>
                  <span className="text-xs text-amber-950 font-medium">Generates polite thanks and commitment to continuous service improvement.</span>
                </div>
                <div className="bg-red-50/60 border border-red-200 p-3.5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">1-2 Star Reviews</span>
                  <span className="text-xs text-red-950 font-medium">Generates empathetic apologies with management assistance contact info.</span>
                </div>
              </div>
            </div>

            {/* QR Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center space-y-5 shadow-sm h-full">
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 justify-center">
                  <Database className="h-4.5 w-4.5 text-amber-600" /> Review Funnel QR Code
                </h3>
                <p className="text-[11px] text-slate-500 leading-normal max-w-xs mx-auto">
                  Scan this QR code or click download to print it. Display it on your properties to capture positive reviews directly onto maps while buffering negative reviews.
                </p>
              </div>

              {/* QR Image Box */}
              <div className="bg-slate-50 p-4 rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center h-44 w-44 shrink-0 relative group">
                {qrCodeImageUrl ? (
                  <img 
                    src={qrCodeImageUrl} 
                    alt="Feedback QR code URL" 
                    className="h-full w-full animate-fadeIn" 
                  />
                ) : (
                  <div className="h-full w-full bg-slate-200 animate-pulse rounded-lg" />
                )}
              </div>

              <div className="w-full space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadQrCode}
                  className="w-full border-slate-200 text-slate-800"
                >
                  <Download className="h-4 w-4 mr-1 text-amber-600" /> Download Print Quality QR
                </Button>
                
                <a
                  href={publicFunnelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-slate-500 hover:text-amber-700 text-[10px] flex items-center justify-center gap-1 transition-all underline font-semibold"
                >
                  Open Funnel Review Form <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Reviews Moderation List Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-amber-600" /> Customer Feedbacks Queue
              </h3>

              {/* local search and tabs */}
              <div className="flex border border-slate-200 bg-white p-1 rounded-2xl shrink-0 shadow-2xs">
                {(["ALL", "GOOD", "BAD"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeFilter === filter 
                        ? "bg-amber-500 text-slate-950 shadow-xs" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {filter === "ALL" && "All Reviews"}
                    {filter === "GOOD" && "Good Reviews (3★+)"}
                    {filter === "BAD" && "Bad Reviews (<3★)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Reviews */}
            {filteredReviews.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center gap-2 shadow-xs">
                <Star className="h-8 w-8 text-slate-300 stroke-1" />
                <p className="text-xs">No reviews found under the selected tab filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReviews.map((review) => {
                  const hasComment = review.comment && review.comment.trim();
                  const isGmbDirect = review.source === "GOOGLE";

                  return (
                    <div 
                      key={review.id}
                      className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between gap-4 shadow-xs transition-all hover:shadow-sm"
                    >
                      <div className="space-y-2">
                        {/* Rating stars and header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-900">{review.customerName}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(review.createdAt).toLocaleDateString(undefined, { 
                                year: "numeric", 
                                month: "short", 
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="flex text-amber-500 gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3.5 w-3.5 ${
                                    i < review.rating ? "fill-current" : "text-slate-200"
                                  }`} 
                                />
                              ))}
                            </div>
                            
                            <div className="flex gap-1.5">
                              <Badge variant={isGmbDirect ? "brand" : "outline"} className="text-[9px]">
                                {isGmbDirect ? "Google Direct" : "QR Funnel"}
                              </Badge>
                            </div>
                          </div>
                        </div>
 
                        {/* Comment text */}
                        <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 min-h-[48px] whitespace-pre-wrap">
                          {hasComment ? review.comment : <span className="text-slate-400 italic">No comment text submitted.</span>}
                        </p>
                      </div>
 
                      {/* Reply Section for live Google reviews */}
                      {isGmbDirect && (
                        <div className="border-t border-slate-100 pt-3 space-y-2">
                          {review.replyText ? (
                            <div className="bg-amber-50/40 border border-amber-200/60 p-3 rounded-2xl space-y-1 relative group">
                              <div className="flex items-center gap-1 text-[9px] font-bold text-amber-800 uppercase tracking-wider">
                                <Bot className="h-3 w-3 text-amber-600" /> Auto-Replied Message
                              </div>
                              <p className="text-[11px] text-slate-800 leading-normal">{review.replyText}</p>
                              
                              <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase">
                                {review.replyStatus === "REPLIED" && (
                                  <span className="text-emerald-700 flex items-center gap-0.5">
                                    <CheckCheck className="h-3 w-3" /> Live
                                  </span>
                                )}
                                {review.replyStatus === "ERROR" && (
                                  <span className="text-red-700 flex items-center gap-0.5">
                                    Failed to Sync
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={replyTextMap[review.id] || ""}
                                onChange={(e) => setReplyTextMap({ ...replyTextMap, [review.id]: e.target.value })}
                                placeholder="Write custom reply to Google..."
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleReplySubmit(review.id)}
                                disabled={submittingReplyId === review.id}
                              >
                                {submittingReplyId === review.id ? "Sending..." : "Submit Reply"}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
