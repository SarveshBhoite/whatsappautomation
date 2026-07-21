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

// Native SVG Instagram & WhatsApp icons matching main page
const Instagram = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WhatsApp = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.46 3.473 1.332 4.977l-1.417 5.176 5.3-.1389a9.92 9.92 0 0 0 4.773 1.218h.004c5.504 0 9.988-4.484 9.988-9.99A9.957 9.957 0 0 0 12.012 2zm5.727 14.17c-.25.7-1.442 1.272-1.992 1.353-.48.072-.942.348-3.048-.52-2.532-1.045-4.14-3.626-4.266-3.794-.124-.168-.948-1.258-.948-2.398 0-1.14.595-1.704.82-1.93.226-.226.495-.282.66-.282.164 0 .328.003.472.01.148.007.348-.056.545.422.2.488.683 1.662.743 1.78.06.12.098.26.018.42-.08.16-.118.26-.237.4-.118.14-.253.31-.36.42-.12.12-.244.25-.104.49.14.24.62 1.022 1.33 1.652.915.816 1.685 1.07 1.925 1.19.24.12.378.1.517-.06.14-.16.596-.694.755-.93.16-.236.32-.2.538-.12.217.08 1.378.65 1.616.77.238.12.396.18.455.28.06.1.06.58-.19 1.28z"/>
  </svg>
);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const FRONTEND_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
const DEFAULT_ORG_ID = "demo-org-123";

interface GoogleConfig {
  locationName: string;
  googlePlaceId: string;
  googleReviewUrl: string;
  googleLocationId: string;
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
  autoReplyEnabled: boolean;
  autoReplyMinRating: number;
  autoReplyTemplate: string;
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "DECLINED";
  replyText: string | null;
  replyStatus: "UNREPLIED" | "REPLIED" | "ERROR";
  source: "FUNNEL" | "GOOGLE";
  createdAt: string;
}

export default function ReviewsDashboard() {
  const [config, setConfig] = useState<GoogleConfig>({
    locationName: "",
    googlePlaceId: "",
    googleReviewUrl: "",
    googleLocationId: "",
    googleClientId: "",
    googleClientSecret: "",
    googleRefreshToken: "",
    autoReplyEnabled: false,
    autoReplyMinRating: 4,
    autoReplyTemplate: "",
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "GOOD" | "BAD">("ALL");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [oauthStatus, setOauthStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");
  const [replyTextMap, setReplyTextMap] = useState<{ [reviewId: string]: string }>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  
  const [publicFunnelUrl, setPublicFunnelUrl] = useState("");
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState("");

  const [syncing, setSyncing] = useState(false);
  const [autoReplyingAll, setAutoReplyingAll] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSyncReviews = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/reviews/sync?orgId=${DEFAULT_ORG_ID}`);
      const data = await res.json();
      if (res.ok) {
        setSyncMessage({ text: data.message || "Google reviews synced successfully!", isError: false });
        if (data.reviews) {
          setReviews(data.reviews);
        } else {
          fetchData();
        }
      } else {
        setSyncMessage({ text: data.error || "Failed to sync Google reviews.", isError: true });
      }
    } catch (err: any) {
      setSyncMessage({ text: err.message || "Failed to connect to backend server.", isError: true });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const handleAutoReplyAll = async () => {
    setAutoReplyingAll(true);
    setSyncMessage(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/reviews/auto-reply-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: DEFAULT_ORG_ID })
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage({ text: data.message || "Generated AI sentiment responses for all unreplied reviews!", isError: false });
        if (data.reviews) {
          setReviews(data.reviews);
        } else {
          fetchData();
        }
      } else {
        setSyncMessage({ text: data.error || "Failed to generate AI sentiment replies.", isError: true });
      }
    } catch (err: any) {
      setSyncMessage({ text: err.message || "Failed to connect to backend server.", isError: true });
    } finally {
      setAutoReplyingAll(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  // Fetch initial config and reviews
  const fetchData = async () => {
    try {
      // 1. Fetch Config
      const configRes = await fetch(`${BACKEND_URL}/api/gmb/config?orgId=${DEFAULT_ORG_ID}`);
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
      }

      // 2. Fetch Reviews
      const reviewsRes = await fetch(`${BACKEND_URL}/api/gmb/reviews?orgId=${DEFAULT_ORG_ID}`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);
      }
    } catch (err) {
      console.error("Failed to load reviews data:", err);
    }
  };

  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const url = `${origin}/reviews/submit?org=${DEFAULT_ORG_ID}`;
    setPublicFunnelUrl(url);
    setQrCodeImageUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`);

    fetchData();

    // Setup WebSockets for real-time review notifications
    const socket = io(BACKEND_URL);
    socket.emit("join-org", DEFAULT_ORG_ID);

    socket.on("new-review", (newReview: Review) => {
      setReviews((prev) => {
        // Prevent duplicates
        if (prev.some((r) => r.id === newReview.id)) return prev;
        return [newReview, ...prev];
      });
    });

    socket.on("review-updated", (updatedReview: Review) => {
      setReviews((prev) => prev.map((r) => (r.id === updatedReview.id ? updatedReview : r)));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Save Settings Config
  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");

    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: DEFAULT_ORG_ID, ...config }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      setSaveStatus("error");
    }
  };



  // Moderate Review (Approve or Decline)
  const handleReviewAction = async (reviewId: string, action: "approve" | "decline") => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/reviews/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action, orgId: DEFAULT_ORG_ID }),
      });

      if (res.ok) {
        const updated = await res.json();
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
      }
    } catch (err) {
      console.error("Moderation action failed:", err);
    }
  };

  // Submit manual reply
  const handleReplySubmit = async (reviewId: string) => {
    const text = replyTextMap[reviewId];
    if (!text || !text.trim()) return;

    setSubmittingReplyId(reviewId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/reviews/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, replyText: text, orgId: DEFAULT_ORG_ID }),
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

  // Download QR Code Image Helper
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
      // Fallback
      window.open(qrCodeImageUrl, "_blank");
    }
  };



  // Filter reviews locally
  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "GOOD") return r.rating >= 3;
    if (activeFilter === "BAD") return r.rating < 3;
    return true;
  });

  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;
  const approvedCount = reviews.filter((r) => r.status === "APPROVED").length;
  
  // Calculate average score and total count using only live Google reviews
  const liveReviews = reviews.filter((r) => r.source === "GOOGLE");
  const liveAverageRating = liveReviews.length 
    ? (liveReviews.reduce((acc, r) => acc + r.rating, 0) / liveReviews.length).toFixed(1) 
    : "0.0";
  const liveTotalReviews = liveReviews.length;

  // Public approval rate is a metric of the feedback funnel performance (approved funnel feedbacks / total funnel feedbacks)
  const funnelReviews = reviews.filter((r) => r.source === "FUNNEL");
  const approvedFunnel = funnelReviews.filter((r) => r.status === "APPROVED").length;
  const approvalRate = funnelReviews.length 
    ? ((approvedFunnel / funnelReviews.length) * 100).toFixed(0) 
    : "100";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 text-slate-100 font-sans">
      

      {/* 2. REVIEWS MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 pb-[calc(env(safe-area-inset-bottom)+56px)] sm:pb-0">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/30 px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            <Star className="h-5 w-5 text-primary" />
            <h1 className="text-base font-bold text-slate-100">GMB Review Automation & Protection</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoReplyAll}
              disabled={autoReplyingAll}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Bot className={`h-4 w-4 ${autoReplyingAll ? "animate-spin" : ""}`} />
              {autoReplyingAll ? "Auto-Replying..." : "AI Sentiment Reply All"}
            </button>

            <button
              onClick={handleSyncReviews}
              disabled={syncing}
              className="bg-primary hover:bg-secondary disabled:opacity-50 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer animate-fadeIn"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync Live Reviews"}
            </button>
          </div>
        </header>

        {/* Dashboard Panels Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 w-full max-w-full">

          {/* Sync Status Banner */}
          {syncMessage && (
            <div className={`p-4 rounded-xl border flex items-center gap-2 text-xs font-semibold animate-fadeIn ${
              syncMessage.isError 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}>
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{syncMessage.text}</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4.5 shadow-xl flex flex-col">
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Average Rating</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-3xl font-extrabold text-slate-100">{liveAverageRating}</span>
                <div className="flex text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-1">Live Google Business rating</span>
            </div>

            <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4.5 shadow-xl flex flex-col">
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Total Reviews</span>
              <span className="text-3xl font-extrabold text-slate-100 mt-1.5">{liveTotalReviews}</span>
              <span className="text-[9px] text-slate-400 mt-1">Live reviews on business profile</span>
            </div>

            <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4.5 shadow-xl flex flex-col">
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Pending Feedback</span>
              <div className="flex items-center justify-between mt-1.5">
                <span className={`text-3xl font-extrabold ${pendingCount > 0 ? "text-amber-500" : "text-slate-100"}`}>
                  {pendingCount}
                </span>
                {pendingCount > 0 && (
                  <span className="text-[9px] uppercase bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold">
                    Filter Locked
                  </span>
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-1">Internal negative feedback pending</span>
            </div>

            <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4.5 shadow-xl flex flex-col">
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Funnel Promotion Rate</span>
              <span className="text-3xl font-extrabold text-slate-100 mt-1.5">
                {approvalRate}%
              </span>
              <span className="text-[9px] text-slate-400 mt-1">Ratio of funnel submissions approved</span>
            </div>
          </div>

          {/* Configuration Setup & QR Panel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Setup Form Replaced with Active AI Sentiment Status Card */}
            <div className="md:col-span-2 bg-slate-950/30 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Bot className="h-4.5 w-4.5 text-primary" /> Automated AI Sentiment Analysis Auto-Reply
                </h3>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  Active ✓
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Automated sentiment analysis auto-reply is active for all Google and Funnel reviews. Our AI engine automatically analyzes the star rating and sentiment context of incoming customer reviews to generate and post appropriate, personalized responses directly to Google Business Profile.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">4-5 Star Reviews</span>
                  <span className="text-xs text-slate-300">Generates appreciative, warm customer thank-you responses.</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">3 Star Reviews</span>
                  <span className="text-xs text-slate-300">Generates polite thanks and commitment to continuous service improvement.</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">1-2 Star Reviews</span>
                  <span className="text-xs text-slate-300">Generates empathetic apologies with management assistance contact info.</span>
                </div>
              </div>
            </div>

            {/* QR Card */}
            <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between text-center space-y-6 shadow-xl h-full">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 justify-center">
                  <Database className="h-4.5 w-4.5 text-primary" /> Review Funnel QR Code
                </h3>
                <p className="text-[11px] text-slate-500 leading-normal max-w-xs mx-auto">
                  Scan this QR code or click download to print it. Display it on your properties to capture positive reviews directly onto maps while buffering negative reviews.
                </p>
              </div>

              {/* QR Image Box */}
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center h-48 w-48 shrink-0 relative group">
                {qrCodeImageUrl ? (
                  <img 
                    src={qrCodeImageUrl} 
                    alt="Feedback QR code URL" 
                    className="h-full w-full animate-fadeIn" 
                  />
                ) : (
                  <div className="h-full w-full bg-slate-100 animate-pulse rounded-lg" />
                )}
              </div>

              <div className="w-full space-y-2">
                <button
                  onClick={downloadQrCode}
                  className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-slate-200"
                >
                  <Download className="h-4 w-4 text-primary" /> Download Print Quality QR Code
                </button>
                
                <a
                  href={publicFunnelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-slate-400 hover:text-primary text-[10px] flex items-center justify-center gap-1 transition-all underline"
                >
                  Open Funnel Review Form <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Reviews Moderation List Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-primary" /> Customer Feedbacks Queue
              </h3>

              {/* local search and tabs */}
              <div className="flex border border-slate-800 bg-slate-950/60 p-0.5 rounded-xl shrink-0">
                {(["ALL", "GOOD", "BAD"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      activeFilter === filter 
                        ? "bg-primary text-slate-950 font-bold" 
                        : "text-slate-400 hover:text-slate-200"
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
              <div className="bg-slate-950/10 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center gap-2">
                <Star className="h-8 w-8 text-slate-700 stroke-1" />
                <p className="text-xs">No reviews found under the selected tab filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReviews.map((review) => {
                  const hasComment = review.comment && review.comment.trim();
                  const isPending = review.status === "PENDING";
                  const isApproved = review.status === "APPROVED";
                  const isDeclined = review.status === "DECLINED";
                  const isGmbDirect = review.source === "GOOGLE";

                  return (
                    <div 
                      key={review.id}
                      className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl transition-all"
                    >
                      <div className="space-y-2">
                        {/* Rating stars and header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-200">{review.customerName}</span>
                            <span className="text-[9px] text-slate-500">
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
                                    i < review.rating ? "fill-current" : "text-slate-700"
                                  }`} 
                                />
                              ))}
                            </div>
                            
                            <div className="flex gap-1.5">
                              <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-extrabold ${
                                isGmbDirect 
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                                  : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                              }`}>
                                {isGmbDirect ? "Google Direct" : "QR Funnel"}
                              </span>
                            </div>
                          </div>
                        </div>
 
                        {/* Comment text */}
                        <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/40 p-3 rounded-xl border border-slate-850/60 min-h-[48px] whitespace-pre-wrap">
                          {hasComment ? review.comment : <span className="text-slate-500 italic">No comment text submitted.</span>}
                        </p>
                      </div>
 
                      {/* Reply Section for live Google reviews */}
                      {isGmbDirect && (
                        <div className="border-t border-slate-800/80 pt-3.5 space-y-2">
                          {review.replyText ? (
                            <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl space-y-1 relative group">
                              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                <Bot className="h-3 w-3 text-primary" /> Auto-Replied Message
                              </div>
                              <p className="text-[11px] text-slate-400 leading-normal">{review.replyText}</p>
                              
                              <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase">
                                {review.replyStatus === "REPLIED" && (
                                  <span className="text-emerald-400 flex items-center gap-0.5">
                                    <CheckCheck className="h-3 w-3" /> Live
                                  </span>
                                )}
                                {review.replyStatus === "ERROR" && (
                                  <span className="text-red-400 flex items-center gap-0.5">
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
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              />
                              <button
                                onClick={() => handleReplySubmit(review.id)}
                                disabled={submittingReplyId === review.id}
                                className="bg-primary hover:bg-secondary disabled:opacity-50 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer shadow-md"
                              >
                                {submittingReplyId === review.id ? "Sending..." : "Submit Reply"}
                              </button>
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
