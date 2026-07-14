"use client";

import React, { useState, useEffect } from "react";
import { 
  Store, 
  Eye, 
  Globe, 
  Phone, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  AlertCircle, 
  Settings, 
  ExternalLink,
  Info,
  Calendar,
  Smartphone,
  Monitor,
  Search,
  Map,
  ArrowUpRight,
  GitMerge,
  Star,
  Sparkles,
  Plus,
  Trash2,
  Send,
  HelpCircle,
  MessageSquare,
  Camera,
  RefreshCw,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";

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
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_ORG_ID = "demo-org-123";

interface PerformanceSummary {
  totalViews: number;
  totalActions: number;
  websiteClicks: number;
  callClicks: number;
  directionsRequests: number;
  conversations: number;
  desktopViews: number;
  mobileViews: number;
  searchViews: number;
  mapsViews: number;
}

interface TimelineDay {
  date: string;
  WEBSITE_CLICKS: number;
  CALL_CLICKS: number;
  BUSINESS_DIRECTION_REQUESTS: number;
  BUSINESS_IMPRESSIONS_DESKTOP_MAPS: number;
  BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: number;
  BUSINESS_IMPRESSIONS_MOBILE_MAPS: number;
  BUSINESS_IMPRESSIONS_MOBILE_SEARCH: number;
  BUSINESS_CONVERSATIONS: number;
  totalViews: number;
  totalActions: number;
}

interface PerformanceData {
  locationName: string;
  googleLocationId: string;
  range: {
    startDate: string;
    endDate: string;
    label: string;
    previousLabel: string;
  };
  summary: PerformanceSummary;
  previousSummary: PerformanceSummary;
  growth: {
    totalViews: string;
    websiteClicks: string;
    callClicks: string;
    directionsRequests: string;
  };
  timeline: TimelineDay[];
}

export default function GmbPerformanceDashboard() {
  const [orgId, setOrgId] = useState(DEFAULT_ORG_ID);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PerformanceData | null>(null);
  const [activeMetricTab, setActiveMetricTab] = useState<"actions" | "views">("actions");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<"performance" | "posts" | "qa" | "media">("performance");

  // GMB Posts States
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postSummary, setPostSummary] = useState("");
  const [postMediaUrl, setPostMediaUrl] = useState("");
  const [postCTA, setPostCTA] = useState("NONE");
  const [postCTAUrl, setPostCTAUrl] = useState("");
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // GMB Q&A States
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [replyingToQuestionId, setReplyingToQuestionId] = useState<string | null>(null);
  const [questionReplyText, setQuestionReplyText] = useState("");
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // GMB Media States
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaCategory, setMediaCategory] = useState("ADDITIONAL");
  const [mediaFileBase64, setMediaFileBase64] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Determine standard default months based on 3-day data delay
  const latestDate = new Date();
  latestDate.setDate(latestDate.getDate() - 3);
  const defaultAMonth = latestDate.getMonth() + 1;
  const defaultAYear = latestDate.getFullYear();

  let defaultBMonth = latestDate.getMonth();
  let defaultBYear = latestDate.getFullYear();
  if (defaultBMonth === 0) {
    defaultBMonth = 12;
    defaultBYear -= 1;
  }

  const [selectedAMonth, setSelectedAMonth] = useState(defaultAMonth);
  const [selectedAYear, setSelectedAYear] = useState(defaultAYear);
  const [selectedBMonth, setSelectedBMonth] = useState(defaultBMonth);
  const [selectedBYear, setSelectedBYear] = useState(defaultBYear);
  
  // Extract org query parameter in useEffect client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const orgParam = params.get("org") || params.get("orgId");
      if (orgParam) {
        setOrgId(orgParam);
      }
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchQuestions();
    fetchMedia();
  }, [orgId]);

  // Fetch GMB Posts
  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/posts?orgId=${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch GMB posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch GMB Questions
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/questions?orgId=${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Failed to fetch GMB questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Fetch GMB Gallery Photos
  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/media?orgId=${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch GMB media:", err);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Sync Q&A Questions from Google
  const handleSyncQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/questions/sync?orgId=${orgId}`);
      if (res.ok) {
        const result = await res.json();
        setQuestions(result.questions || []);
      }
    } catch (err) {
      console.error("Failed to sync GMB questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Submit New GMB Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postSummary) return;

    setIsSubmittingPost(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/posts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          title: postTitle,
          summary: postSummary,
          mediaUrl: postMediaUrl || undefined,
          callToActionType: postCTA,
          callToActionUrl: postCTAUrl || undefined
        })
      });

      if (res.ok) {
        setPostTitle("");
        setPostSummary("");
        setPostMediaUrl("");
        setPostCTA("NONE");
        setPostCTAUrl("");
        await fetchPosts();
      }
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Delete GMB Post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/posts/${postId}?orgId=${orgId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchPosts();
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  // Answer GMB Question
  const handlePostAnswer = async (questionId: string) => {
    if (!questionReplyText) return;

    setIsSubmittingAnswer(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/questions/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          questionId,
          replyText: questionReplyText
        })
      });

      if (res.ok) {
        setQuestionReplyText("");
        setReplyingToQuestionId(null);
        await fetchQuestions();
      }
    } catch (err) {
      console.error("Failed to reply to question:", err);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Gemini AI Copy Generator for Posts
  const handleGeneratePostCopy = async () => {
    setIsGeneratingPost(true);
    try {
      const prompt = `Write a short, engaging Google Business Profile local post updates for a service/marketing business. Output only the body text of the post and keep it under 300 characters.`;
      
      const res = await fetch(`${BACKEND_URL}/api/gmb/questions/ai-suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          questionText: prompt
        })
      });

      if (res.ok) {
        const result = await res.json();
        setPostSummary(result.suggestion || "");
      }
    } catch (err) {
      console.error("AI Post Copy generation failed:", err);
    } finally {
      setIsGeneratingPost(false);
    }
  };

  // Gemini AI Answer Generator for Questions
  const handleGenerateAnswerSuggestion = async (questionText: string) => {
    setIsGeneratingAnswer(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/questions/ai-suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          questionText
        })
      });

      if (res.ok) {
        const result = await res.json();
        setQuestionReplyText(result.suggestion || "");
      }
    } catch (err) {
      console.error("AI Answer suggestion failed:", err);
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  // Handle Photo Selector File Change
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload Selected Gallery Photo
  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFileBase64) return;

    setUploadingPhoto(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/media/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          image: mediaFileBase64,
          category: mediaCategory
        })
      });

      if (res.ok) {
        setMediaFileBase64(null);
        await fetchMedia();
      } else {
        const errData = await res.json();
        alert(`Failed to upload photo: ${errData.error}`);
      }
    } catch (err) {
      console.error("Failed to upload photo:", err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const fetchPerformance = async (
    aM = selectedAMonth, 
    aY = selectedAYear, 
    bM = selectedBMonth, 
    bY = selectedBYear
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/performance?orgId=${orgId}&aMonth=${aM}&aYear=${aY}&bMonth=${bM}&bYear=${bY}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load GMB performance metrics.");
      }
      const perfData = await res.json();
      setData(perfData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance(defaultAMonth, defaultAYear, defaultBMonth, defaultBYear);
  }, [orgId]);

  // Render SVG Chart based on fetched timeline
  const renderSvgAreaChart = (timeline: TimelineDay[], metrics: Array<keyof TimelineDay>, colors: string[]) => {
    if (!timeline || timeline.length === 0) return null;

    const width = 500;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 10;
    const paddingTop = 10;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Find max value across all selected metrics to scale Y axis
    let maxVal = 10;
    timeline.forEach(d => {
      metrics.forEach(m => {
        const val = Number(d[m] || 0);
        if (val > maxVal) maxVal = val;
      });
    });
    // Add 10% headroom
    maxVal = Math.ceil(maxVal * 1.1);

    const pointsCount = timeline.length;
    const stepX = chartWidth / (pointsCount - 1 || 1);

    return (
      <div className="relative w-full h-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Y Axis Gridlines & Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const yVal = Math.round(maxVal * ratio);
            const yPos = paddingTop + chartHeight * (1 - ratio);
            return (
              <g key={idx} className="opacity-40">
                <line 
                  x1={paddingLeft} 
                  y1={yPos} 
                  x2={width - paddingRight} 
                  y2={yPos} 
                  stroke="#334155" 
                  strokeWidth={1} 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={paddingLeft - 8} 
                  y={yPos + 3} 
                  fill="#94a3b8" 
                  fontSize={8} 
                  textAnchor="end"
                  className="font-medium"
                >
                  {yVal}
                </text>
              </g>
            );
          })}

          {/* X Axis Date Labels (every 7 days to avoid congestion) */}
          {timeline.map((d, idx) => {
            if (idx % 7 !== 0 && idx !== pointsCount - 1) return null;
            const xPos = paddingLeft + idx * stepX;
            const displayDate = d.date.substring(5); // MM-DD
            return (
              <g key={idx} className="opacity-60">
                <line 
                  x1={xPos} 
                  y1={paddingTop} 
                  x2={xPos} 
                  y2={paddingTop + chartHeight} 
                  stroke="#1e293b" 
                  strokeWidth={1} 
                />
                <text 
                  x={xPos} 
                  y={height - 8} 
                  fill="#94a3b8" 
                  fontSize={8} 
                  textAnchor="middle"
                  className="font-medium"
                >
                  {displayDate}
                </text>
              </g>
            );
          })}

          {/* Chart Lines and Area Paths */}
          {metrics.map((metric, metricIdx) => {
            const color = colors[metricIdx];
            const pathPoints = timeline.map((d, idx) => {
              const val = Number(d[metric] || 0);
              const x = paddingLeft + idx * stepX;
              const y = paddingTop + chartHeight * (1 - val / maxVal);
              return `${x},${y}`;
            });

            if (pathPoints.length === 0) return null;

            const linePath = `M ${pathPoints.join(" L ")}`;
            const areaPath = `${linePath} L ${paddingLeft + (pointsCount - 1) * stepX},${paddingTop + chartHeight} L ${paddingLeft},${paddingTop + chartHeight} Z`;

            return (
              <g key={metric}>
                {/* Fill Area */}
                <path 
                  d={areaPath} 
                  fill={color} 
                  opacity={0.06} 
                />
                {/* Line */}
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke={color} 
                  strokeWidth={2} 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Dot Markers at key intervals */}
                {timeline.map((d, idx) => {
                  if (idx % 5 !== 0 && idx !== pointsCount - 1) return null;
                  const val = Number(d[metric] || 0);
                  const x = paddingLeft + idx * stepX;
                  const y = paddingTop + chartHeight * (1 - val / maxVal);
                  return (
                    <circle 
                      key={idx} 
                      cx={x} 
                      cy={y} 
                      r={3} 
                      fill={color} 
                      stroke="#0f172a" 
                      strokeWidth={1} 
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Hover guidelines and point markers overlay */}
          {hoveredIndex !== null && (
            <g pointerEvents="none">
              {/* Vertical line indicator */}
              <line
                x1={paddingLeft + hoveredIndex * stepX}
                y1={paddingTop}
                x2={paddingLeft + hoveredIndex * stepX}
                y2={paddingTop + chartHeight}
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              
              {/* Target dots on line intersections */}
              {metrics.map((metric, metricIdx) => {
                const val = Number(timeline[hoveredIndex][metric] || 0);
                const x = paddingLeft + hoveredIndex * stepX;
                const y = paddingTop + chartHeight * (1 - val / maxVal);
                return (
                  <circle
                    key={`hover-dot-${metric}`}
                    cx={x}
                    cy={y}
                    r={5.5}
                    fill={colors[metricIdx]}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                );
              })}
            </g>
          )}

          {/* Invisible interactive hover rects mapping the X timeline points */}
          {timeline.map((d, idx) => {
            const colWidth = chartWidth / (pointsCount - 1 || 1);
            const colX = paddingLeft + idx * stepX - colWidth / 2;
            return (
              <rect
                key={`hitbox-${idx}`}
                x={colX}
                y={paddingTop}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Box Overlay */}
        {hoveredIndex !== null && (
          <div 
            className="absolute bg-slate-950/95 border border-slate-800 p-2.5 rounded-xl shadow-xl pointer-events-none text-[10px] space-y-1 z-30 text-left font-sans animate-fadeIn"
            style={{
              left: `${((paddingLeft + hoveredIndex * stepX) / width) * 100}%`,
              top: "-5px",
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="font-bold text-slate-300 border-b border-slate-900 pb-1 mb-1.5 whitespace-nowrap">
              {timeline[hoveredIndex].date}
            </div>
            <div className="space-y-1">
              {metrics.map((metric, metricIdx) => {
                let label = "Views";
                if (metric === "WEBSITE_CLICKS") label = "Website Clicks";
                if (metric === "CALL_CLICKS") label = "Calls";
                if (metric === "BUSINESS_DIRECTION_REQUESTS") label = "Directions";
                const val = Number(timeline[hoveredIndex][metric] || 0);
                return (
                  <div key={metric} className="flex items-center gap-4 justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors[metricIdx] }} />
                      {label}
                    </span>
                    <span className="font-bold text-slate-200">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      
      {/* 1. SHARED SIDEBAR NAVIGATION - Identical structure to page.tsx & reviews/page.tsx */}
      <aside className="hidden sm:flex w-16 flex-col items-center py-6 border-r border-slate-800 bg-slate-950 gap-8 justify-between shrink-0">
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 border border-slate-800 flex items-center justify-center bg-slate-950">
            <img src="/icon.jpeg" alt="Jisnu Logo" className="h-full w-full object-cover" />
          </div>
          
          <Link 
            href="/?tab=chats_whatsapp"
            className="p-3 rounded-xl transition-all duration-200 relative group text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
          >
            <WhatsApp className="h-5 w-5" />
            <span className="absolute left-16 scale-0 bg-slate-950 text-xs text-slate-200 py-1 px-2 rounded-md group-hover:scale-100 transition-all shadow-md z-50">WhatsApp Chats</span>
          </Link>

          <Link 
            href="/?tab=chats_instagram"
            className="p-3 rounded-xl transition-all duration-200 relative group text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
          >
            <Instagram className="h-5 w-5" />
            <span className="absolute left-16 scale-0 bg-slate-950 text-xs text-slate-200 py-1 px-2 rounded-md group-hover:scale-100 transition-all shadow-md z-50">Instagram Chats</span>
          </Link>

          <Link 
            href="/?tab=flows"
            className="p-3 rounded-xl transition-all duration-200 relative group text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
          >
            <GitMerge className="h-5 w-5" />
            <span className="absolute left-16 scale-0 bg-slate-950 text-xs text-slate-200 py-1 px-2 rounded-md group-hover:scale-100 transition-all shadow-md z-50">Flows</span>
          </Link>

          <Link 
            href="/reviews"
            className="p-3 rounded-xl transition-all duration-200 relative group text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
          >
            <Star className="h-5 w-5" />
            <span className="absolute left-16 scale-0 bg-slate-950 text-xs text-slate-200 py-1 px-2 rounded-md group-hover:scale-100 transition-all shadow-md z-50">Google Reviews</span>
          </Link>

          <div 
            className="p-3 rounded-xl bg-primary/10 text-primary relative group cursor-default"
          >
            <Store className="h-5 w-5" />
            <span className="absolute left-16 scale-0 bg-slate-950 text-xs text-slate-200 py-1 px-2 rounded-md group-hover:scale-100 transition-all shadow-md z-50">Google Listing</span>
          </div>
        </div>

        <Link 
          href="/?tab=settings"
          className="p-3 rounded-xl transition-all duration-200 relative group text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
        >
          <Settings className="h-5 w-5" />
          <span className="absolute left-16 scale-0 bg-slate-950 text-xs text-slate-200 py-1 px-2 rounded-md group-hover:scale-100 transition-all shadow-md z-50">Settings</span>
        </Link>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950 border-t border-slate-800 flex items-center justify-around safe-bottom">
        <Link
          href="/?tab=chats_whatsapp"
          className="flex flex-col items-center gap-0.5 py-3 px-4 flex-1 text-slate-500 hover:text-slate-250"
        >
          <WhatsApp className="h-5 w-5" />
          <span className="text-[9px] font-semibold tracking-wide">WhatsApp</span>
        </Link>
        <Link
          href="/?tab=chats_instagram"
          className="flex flex-col items-center gap-0.5 py-3 px-4 flex-1 text-slate-500 hover:text-slate-250"
        >
          <Instagram className="h-5 w-5" />
          <span className="text-[9px] font-semibold tracking-wide">Instagram</span>
        </Link>
        <Link
          href="/?tab=flows"
          className="flex flex-col items-center gap-0.5 py-3 px-4 flex-1 text-slate-500 hover:text-slate-250"
        >
          <GitMerge className="h-5 w-5" />
          <span className="text-[9px] font-semibold tracking-wide">Flows</span>
        </Link>
        <Link
          href="/?tab=settings"
          className="flex flex-col items-center gap-0.5 py-3 px-4 flex-1 text-slate-500 hover:text-slate-250"
        >
          <Settings className="h-5 w-5" />
          <span className="text-[9px] font-semibold tracking-wide">Settings</span>
        </Link>
        <Link
          href="/reviews"
          className="flex flex-col items-center gap-0.5 py-3 px-4 flex-1 text-slate-500 hover:text-slate-200"
        >
          <Star className="h-5 w-5" />
          <span className="text-[9px] font-semibold tracking-wide">Reviews</span>
        </Link>
        <div
          className="flex flex-col items-center gap-0.5 py-3 px-4 flex-1 text-primary cursor-default"
        >
          <Store className="h-5 w-5" />
          <span className="text-[9px] font-semibold tracking-wide">Listing</span>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-900 pb-[calc(env(safe-area-inset-bottom)+56px)] sm:pb-0">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight sm:text-2xl">Google Business Profile</h1>
                <p className="text-xs text-slate-400">
                  {data ? `${data.locationName} • GMB Complete Solution` : "Manage and track Google Business profile details"}
                </p>
              </div>
            </div>

            {/* Horizontal Sub-tabs Navigation */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 shadow-inner gap-1">
              <button
                type="button"
                onClick={() => setActiveSubTab("performance")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${activeSubTab === "performance" ? "bg-primary text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              >
                <TrendingUp className="h-3.5 w-3.5" /> Performance
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("posts")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${activeSubTab === "posts" ? "bg-primary text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              >
                <Calendar className="h-3.5 w-3.5" /> Updates & Posts
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("qa")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${activeSubTab === "qa" ? "bg-primary text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              >
                <HelpCircle className="h-3.5 w-3.5" /> Q&A Inbox
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("media")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${activeSubTab === "media" ? "bg-primary text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              >
                <Camera className="h-3.5 w-3.5" /> Photos Gallery
              </button>
            </div>
          </div>

          {activeSubTab === "performance" && (
            <>
              {/* Calendar Month Selectors Panel */}
          {(() => {
            const list = [];
            const listCursor = new Date();
            for (let i = 0; i < 12; i++) {
              const d = new Date(listCursor.getFullYear(), listCursor.getMonth() - i, 1);
              const m = d.getMonth() + 1;
              const y = d.getFullYear();
              const name = d.toLocaleString("default", { month: "long" });
              list.push({ month: m, year: y, label: `${name} ${y}`, value: `${m}-${y}` });
            }

            return (
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Target Period (A)</label>
                    <select
                      value={`${selectedAMonth}-${selectedAYear}`}
                      onChange={(e) => {
                        const [m, y] = e.target.value.split("-").map(Number);
                        setSelectedAMonth(m);
                        setSelectedAYear(y);
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-primary transition-all cursor-pointer"
                    >
                      {list.map(item => (
                        <option key={`a-${item.value}`} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </div>

                  <span className="text-slate-600 text-xs font-bold mt-5">vs</span>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Comparison Period (B)</label>
                    <select
                      value={`${selectedBMonth}-${selectedBYear}`}
                      onChange={(e) => {
                        const [m, y] = e.target.value.split("-").map(Number);
                        setSelectedBMonth(m);
                        setSelectedBYear(y);
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-primary transition-all cursor-pointer"
                    >
                      {list.map(item => (
                        <option key={`b-${item.value}`} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => fetchPerformance(selectedAMonth, selectedAYear, selectedBMonth, selectedBYear)}
                  className="w-full sm:w-auto bg-primary hover:bg-secondary text-slate-950 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                >
                  Compare Months
                </button>
              </div>
            );
          })()}

          {/* LOADING STATE */}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400 animate-pulse">Querying Google Business Profile API...</p>
            </div>
          )}

          {/* ERROR / UNAUTHORIZED STATE */}
          {!loading && error && (
            <div className="w-full max-w-2xl mx-auto border border-slate-800 bg-slate-900/40 rounded-3xl p-8 text-center space-y-6">
              <AlertCircle className="h-16 w-16 text-rose-500 mx-auto stroke-1 animate-bounce" />
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-100">GMB Integration Connection Required</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  We could not retrieve GMB stats. This could be because your Google account has not been authorized yet, or the Location ID is incorrect.
                </p>
                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl max-w-md mx-auto text-[10px] text-rose-400 font-mono text-left leading-normal">
                  Error: {error}
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => fetchPerformance()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                >
                  Retry Request
                </button>
                <Link 
                  href="/?tab=settings" 
                  className="bg-primary hover:bg-secondary text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5"
                >
                  Go to Settings <Settings className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* DASHBOARD LIVE CONTENT */}
          {!loading && !error && data && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* 1. KPI Stats Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Total Views */}
                {(() => {
                  const growth = data.growth.totalViews;
                  const isNeg = growth.startsWith("-");
                  return (
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
                      <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full filter blur-xl group-hover:bg-primary/10 transition-all pointer-events-none" />
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Search & Maps Views</span>
                        <Eye className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-100">{data.summary.totalViews.toLocaleString()}</h3>
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                          {isNeg ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />} {growth} MoM
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Card 2: Website Clicks */}
                {(() => {
                  const growth = data.growth.websiteClicks;
                  const isNeg = growth.startsWith("-");
                  return (
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
                      <div className="absolute top-0 right-0 h-24 w-24 bg-sky-500/5 rounded-full filter blur-xl group-hover:bg-sky-500/10 transition-all pointer-events-none" />
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Website Clicks</span>
                        <Globe className="h-4 w-4 text-sky-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-100">
                          {data.summary.websiteClicks.toLocaleString()}
                        </h3>
                        {data.summary.websiteClicks === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                            <Info className="h-3 w-3" /> Zero clicks recorded
                          </span>
                        ) : (
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${isNeg ? "text-rose-450" : "text-emerald-400"}`}>
                            {isNeg ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />} {growth} MoM
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Card 3: Call button clicks */}
                {(() => {
                  const growth = data.growth.callClicks;
                  const isNeg = growth.startsWith("-");
                  return (
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
                      <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full filter blur-xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Call Buttons Clicks</span>
                        <Phone className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-100">{data.summary.callClicks.toLocaleString()}</h3>
                        {data.summary.callClicks === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                            <Info className="h-3 w-3" /> No phone calls made
                          </span>
                        ) : (
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${isNeg ? "text-rose-450" : "text-emerald-400"}`}>
                            {isNeg ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />} {growth} MoM
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Card 4: Direction Requests */}
                {(() => {
                  const growth = data.growth.directionsRequests;
                  const isNeg = growth.startsWith("-");
                  return (
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
                      <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-full filter blur-xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Direction Requests</span>
                        <MapPin className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-100">{data.summary.directionsRequests.toLocaleString()}</h3>
                        {data.summary.directionsRequests === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                            <Info className="h-3 w-3" /> No requests captured
                          </span>
                        ) : (
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${isNeg ? "text-rose-450" : "text-emerald-400"}`}>
                            {isNeg ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />} {growth} MoM
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Zero Stats Helpful Banner */}
              {(data.summary.websiteClicks === 0 || data.summary.callClicks === 0 || data.summary.directionsRequests === 0) && (
                <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-slate-200">Helpful GMB Note</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Some performance metrics like **Website Clicks** or **Call Clicks** might remain zero if your Google Business listing does not have a website URL or phone number published, or if no customer has selected those buttons on Google Maps during this 30-day window.
                    </p>
                  </div>
                </div>
              )}

              {/* 2. Main Performance Time Series Chart */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-6">
                
                {/* Tab Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-4 gap-4">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-200">GMB Traffic Trends</h3>
                    <p className="text-[10px] text-slate-500">Daily performance metrics queried from Google</p>
                  </div>

                  <div className="flex gap-2 bg-slate-950/60 p-1.5 border border-slate-850 rounded-xl">
                    <button
                      onClick={() => setActiveMetricTab("actions")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeMetricTab === "actions" 
                          ? "bg-primary text-slate-950 shadow-md" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Customer Actions
                    </button>
                    <button
                      onClick={() => setActiveMetricTab("views")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeMetricTab === "views" 
                          ? "bg-primary text-slate-950 shadow-md" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Daily Views
                    </button>
                  </div>
                </div>

                {/* Rendering actual Svg chart based on tabs */}
                <div className="h-64 flex items-center justify-center relative">
                  {activeMetricTab === "actions" ? (
                    renderSvgAreaChart(
                      data.timeline,
                      ["WEBSITE_CLICKS", "CALL_CLICKS", "BUSINESS_DIRECTION_REQUESTS"],
                      ["#38bdf8", "#34d399", "#fbbf24"] // Sky, Emerald, Amber colors
                    )
                  ) : (
                    renderSvgAreaChart(
                      data.timeline,
                      ["totalViews"],
                      ["#14b8a6"] // Teal colors
                    )
                  )}
                </div>

                {/* Chart Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-2 border-t border-slate-850">
                  {activeMetricTab === "actions" ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Website Clicks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Call Buttons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Direction Requests</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Impressions (Search + Maps)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Comparison Table */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-200">Month-over-Month Performance Comparison</h3>
                  <p className="text-[10px] text-slate-500">Detailed metrics comparison between the selected months</p>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Metric</th>
                        <th className="py-3 px-4 text-right">{data.range.label}</th>
                        <th className="py-3 px-4 text-right">{data.range.previousLabel}</th>
                        <th className="py-3 px-4 text-right">Growth / Change %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      
                      {/* Row 1: Search & Maps Views */}
                      {(() => {
                        const growth = data.growth.totalViews;
                        const isNeg = growth.startsWith("-");
                        return (
                          <tr className="hover:bg-slate-800/20 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-slate-250">Search & Maps Views (Impressions)</td>
                            <td className="py-3.5 px-4 text-right font-semibold text-slate-100">{data.summary.totalViews.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right text-slate-400">{(data.previousSummary?.totalViews ?? 0).toLocaleString()}</td>
                            <td className={`py-3.5 px-4 text-right font-bold inline-flex items-center justify-end gap-1 w-full ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                              {isNeg ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                              <span>{growth}</span>
                            </td>
                          </tr>
                        );
                      })()}

                      {/* Row 2: Website Clicks */}
                      {(() => {
                        const growth = data.growth.websiteClicks;
                        const isNeg = growth.startsWith("-");
                        return (
                          <tr className="hover:bg-slate-800/20 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-slate-250">Website Clicks</td>
                            <td className="py-3.5 px-4 text-right font-semibold text-slate-100">{data.summary.websiteClicks.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right text-slate-400">{(data.previousSummary?.websiteClicks ?? 0).toLocaleString()}</td>
                            <td className={`py-3.5 px-4 text-right font-bold inline-flex items-center justify-end gap-1 w-full ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                              {isNeg ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                              <span>{growth}</span>
                            </td>
                          </tr>
                        );
                      })()}

                      {/* Row 3: Call button clicks */}
                      {(() => {
                        const growth = data.growth.callClicks;
                        const isNeg = growth.startsWith("-");
                        return (
                          <tr className="hover:bg-slate-800/20 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-slate-250">Call Button Clicks</td>
                            <td className="py-3.5 px-4 text-right font-semibold text-slate-100">{data.summary.callClicks.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right text-slate-400">{(data.previousSummary?.callClicks ?? 0).toLocaleString()}</td>
                            <td className={`py-3.5 px-4 text-right font-bold inline-flex items-center justify-end gap-1 w-full ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                              {isNeg ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                              <span>{growth}</span>
                            </td>
                          </tr>
                        );
                      })()}

                      {/* Row 4: Direction Requests */}
                      {(() => {
                        const growth = data.growth.directionsRequests;
                        const isNeg = growth.startsWith("-");
                        return (
                          <tr className="hover:bg-slate-800/20 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-slate-250">Direction Requests</td>
                            <td className="py-3.5 px-4 text-right font-semibold text-slate-100">{data.summary.directionsRequests.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right text-slate-400">{(data.previousSummary?.directionsRequests ?? 0).toLocaleString()}</td>
                            <td className={`py-3.5 px-4 text-right font-bold inline-flex items-center justify-end gap-1 w-full ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                              {isNeg ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                              <span>{growth}</span>
                            </td>
                          </tr>
                        );
                      })()}

                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Detailed Variations (Devices & Search Platforms) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Box 1: Platform breakdown (Search vs Maps) */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-200">Google Views Breakdown</h4>
                    <p className="text-[10px] text-slate-500">Impressions split between search platforms</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Row 1: Search */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Search className="h-3.5 w-3.5 text-primary" /> Google Search
                      </div>
                      
                      {/* Period A */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{data.range.label}</span>
                          <span className="font-bold text-slate-200">
                            {data.summary.searchViews.toLocaleString()} ({data.summary.totalViews > 0 ? Math.round((data.summary.searchViews / data.summary.totalViews) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${data.summary.totalViews > 0 ? (data.summary.searchViews / data.summary.totalViews) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Period B */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-550">
                          <span>{data.range.previousLabel}</span>
                          <span className="font-bold text-slate-350">
                            {(data.previousSummary?.searchViews ?? 0).toLocaleString()} ({(data.previousSummary?.totalViews ?? 0) > 0 ? Math.round(((data.previousSummary?.searchViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary/40 rounded-full transition-all duration-300"
                            style={{ width: `${(data.previousSummary?.totalViews ?? 0) > 0 ? ((data.previousSummary?.searchViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Maps */}
                    <div className="space-y-2 pt-2 border-t border-slate-850/50">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Map className="h-3.5 w-3.5 text-secondary" /> Google Maps
                      </div>
                      
                      {/* Period A */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{data.range.label}</span>
                          <span className="font-bold text-slate-200">
                            {data.summary.mapsViews.toLocaleString()} ({data.summary.totalViews > 0 ? Math.round((data.summary.mapsViews / data.summary.totalViews) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary rounded-full transition-all duration-300"
                            style={{ width: `${data.summary.totalViews > 0 ? (data.summary.mapsViews / data.summary.totalViews) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Period B */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-550">
                          <span>{data.range.previousLabel}</span>
                          <span className="font-bold text-slate-350">
                            {(data.previousSummary?.mapsViews ?? 0).toLocaleString()} ({(data.previousSummary?.totalViews ?? 0) > 0 ? Math.round(((data.previousSummary?.mapsViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary/40 rounded-full transition-all duration-300"
                            style={{ width: `${(data.previousSummary?.totalViews ?? 0) > 0 ? ((data.previousSummary?.mapsViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box 2: Device Breakdown (Mobile vs Desktop) */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-200">Device Breakdown</h4>
                    <p className="text-[10px] text-slate-500">Impressions split between device platforms</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Row 1: Mobile */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Smartphone className="h-3.5 w-3.5 text-sky-400" /> Mobile Devices
                      </div>
                      
                      {/* Period A */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{data.range.label}</span>
                          <span className="font-bold text-slate-200">
                            {data.summary.mobileViews.toLocaleString()} ({data.summary.totalViews > 0 ? Math.round((data.summary.mobileViews / data.summary.totalViews) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-sky-400 rounded-full transition-all duration-300"
                            style={{ width: `${data.summary.totalViews > 0 ? (data.summary.mobileViews / data.summary.totalViews) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Period B */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-555">
                          <span>{data.range.previousLabel}</span>
                          <span className="font-bold text-slate-350">
                            {(data.previousSummary?.mobileViews ?? 0).toLocaleString()} ({(data.previousSummary?.totalViews ?? 0) > 0 ? Math.round(((data.previousSummary?.mobileViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-sky-400/40 rounded-full transition-all duration-300"
                            style={{ width: `${(data.previousSummary?.totalViews ?? 0) > 0 ? ((data.previousSummary?.mobileViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Desktop */}
                    <div className="space-y-2 pt-2 border-t border-slate-850/50">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Monitor className="h-3.5 w-3.5 text-amber-400" /> Desktop Devices
                      </div>
                      
                      {/* Period A */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{data.range.label}</span>
                          <span className="font-bold text-slate-200">
                            {data.summary.desktopViews.toLocaleString()} ({data.summary.totalViews > 0 ? Math.round((data.summary.desktopViews / data.summary.totalViews) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all duration-300"
                            style={{ width: `${data.summary.totalViews > 0 ? (data.summary.desktopViews / data.summary.totalViews) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Period B */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-555">
                          <span>{data.range.previousLabel}</span>
                          <span className="font-bold text-slate-350">
                            {(data.previousSummary?.desktopViews ?? 0).toLocaleString()} ({(data.previousSummary?.totalViews ?? 0) > 0 ? Math.round(((data.previousSummary?.desktopViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400/40 rounded-full transition-all duration-300"
                            style={{ width: `${(data.previousSummary?.totalViews ?? 0) > 0 ? ((data.previousSummary?.desktopViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

          {/* =========================================================
              SUB-TAB 2: UPDATES & POSTS (AI POST CREATOR)
              ========================================================= */}
          {activeSubTab === "posts" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
              {/* Creator Form Column */}
              <div className="lg:col-span-1 space-y-6">
                <form onSubmit={handleCreatePost} className="bg-slate-950/30 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="h-4.5 w-4.5 text-primary" /> Create Google Post
                    </h3>
                    <button
                      type="button"
                      onClick={handleGeneratePostCopy}
                      disabled={isGeneratingPost}
                      className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-slate-950 transition-all font-bold text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`h-3 w-3 ${isGeneratingPost ? "animate-spin" : ""}`} />
                      {isGeneratingPost ? "Drafting..." : "AI Write"}
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Post Title (Optional)</label>
                    <input
                      type="text"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="monsoon special deal"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Post Summary / Body</label>
                    <textarea
                      value={postSummary}
                      onChange={(e) => setPostSummary(e.target.value)}
                      placeholder="Write post content here..."
                      rows={4}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CTA Button Action</label>
                    <select
                      value={postCTA}
                      onChange={(e) => setPostCTA(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="NONE">No Button</option>
                      <option value="BOOK">Book Appointment</option>
                      <option value="ORDER">Order Online</option>
                      <option value="SHOP">Shop Products</option>
                      <option value="LEARN_MORE">Learn More</option>
                      <option value="SIGN_UP">Sign Up</option>
                      <option value="CALL">Call Now</option>
                    </select>
                  </div>

                  {postCTA !== "NONE" && postCTA !== "CALL" && (
                    <div className="flex flex-col gap-1.5 animate-fadeIn">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CTA Action URL</label>
                      <input
                        type="url"
                        value={postCTAUrl}
                        onChange={(e) => setPostCTAUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Media Photo URL (Optional)</label>
                    <input
                      type="url"
                      value={postMediaUrl}
                      onChange={(e) => setPostMediaUrl(e.target.value)}
                      placeholder="Image address"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-[10px]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingPost || !postSummary}
                    className="w-full bg-primary hover:bg-secondary disabled:opacity-50 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-md mt-4 cursor-pointer"
                  >
                    {isSubmittingPost ? "Publishing..." : "Publish Post on Google Maps"}
                  </button>
                </form>
              </div>

              {/* Posts Feed Grid */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Active Updates Feed</h3>
                    <span className="text-[10px] text-slate-500 leading-normal">Manage scheduled and live posts on Google Maps</span>
                  </div>
                  <button
                    onClick={fetchPosts}
                    className="p-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`h-4.5 w-4.5 ${loadingPosts ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {loadingPosts && posts.length === 0 ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-12 text-center text-slate-400">
                    <Calendar className="h-14 w-14 text-slate-650 mx-auto mb-4 stroke-1" />
                    <p className="text-xs font-semibold">No active updates or local posts found.</p>
                    <p className="text-[10px] text-slate-550 mt-1">Use the writer form on the left to publish your first post.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-slate-950/20 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg">
                        <div className="p-5 space-y-4">
                          <div className="flex justify-between items-start">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              post.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                            }`}>
                              {post.status}
                            </span>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-rose-400 hover:text-rose-300 p-1.5 bg-slate-900/50 border border-slate-850 hover:border-rose-900/50 rounded-xl transition-all cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {post.mediaUrl && (
                            <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-855">
                              <img src={post.mediaUrl} alt="Post Cover" className="w-full h-full object-cover" />
                            </div>
                          )}

                          <div className="space-y-1.5">
                            {post.title && <h4 className="font-extrabold text-sm text-slate-200">{post.title}</h4>}
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">{post.summary}</p>
                          </div>
                        </div>

                        {post.callToActionType && post.callToActionType !== "NONE" && (
                          <div className="bg-slate-950/40 p-4 border-t border-slate-855 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">CTA: {post.callToActionType}</span>
                            <a
                              href={post.callToActionUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-primary hover:text-secondary font-bold flex items-center gap-1"
                            >
                              Link Landing Page <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              SUB-TAB 3: Q&A INBOX (CUSTOMER QUESTIONS)
              ========================================================= */}
          {activeSubTab === "qa" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex flex-col">
                  <h2 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Customer Questions Inbox</h2>
                  <span className="text-[10px] text-slate-500 leading-normal">Monitor and auto-reply to questions posted on Google Maps</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncQuestions}
                    disabled={loadingQuestions}
                    className="bg-primary hover:bg-secondary disabled:opacity-50 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingQuestions ? "animate-spin" : ""}`} />
                    Sync Questions
                  </button>
                </div>
              </div>

              {loadingQuestions && questions.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                  <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : questions.length === 0 ? (
                <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-12 text-center text-slate-400 max-w-2xl mx-auto">
                  <HelpCircle className="h-14 w-14 text-slate-650 mx-auto mb-4 stroke-1 animate-pulse" />
                  <p className="text-xs font-semibold">Q&A inbox is currently empty.</p>
                  <p className="text-[10px] text-slate-550 mt-1">Click **Sync Questions** to scan live customer comments from Google Maps.</p>
                </div>
              ) : (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {questions.map((q) => (
                    <div key={q.id} className="bg-slate-950/20 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                            {q.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-200">{q.authorName}</span>
                            <span className="text-[9px] text-slate-500">{new Date(q.createdAt).toLocaleDateString([], { dateStyle: "medium" })}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          q.status === "ANSWERED" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {q.status}
                        </span>
                      </div>

                      <div className="bg-slate-900/40 p-4 border border-slate-855 rounded-2xl flex gap-3">
                        <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-300 font-semibold leading-relaxed font-sans italic">
                          "{q.text}"
                        </p>
                      </div>

                      {q.answerText ? (
                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850 space-y-2 border-l-2 border-l-emerald-500">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Posted Answer</span>
                          <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{q.answerText}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Merchant Reply Panel</span>
                            <button
                              onClick={() => {
                                setReplyingToQuestionId(q.id);
                                handleGenerateAnswerSuggestion(q.text);
                              }}
                              disabled={isGeneratingAnswer && replyingToQuestionId === q.id}
                              className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-slate-950 transition-all font-bold text-[9px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Sparkles className={`h-3 w-3 ${isGeneratingAnswer && replyingToQuestionId === q.id ? "animate-spin" : ""}`} />
                              AI Draft Reply
                            </button>
                          </div>

                          <div className="flex gap-3">
                            <textarea
                              value={replyingToQuestionId === q.id ? questionReplyText : ""}
                              onChange={(e) => {
                                setReplyingToQuestionId(q.id);
                                setQuestionReplyText(e.target.value);
                              }}
                              placeholder="Type answer to post on Google Maps..."
                              rows={2}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-primary"
                            />
                            <button
                              onClick={() => handlePostAnswer(q.id)}
                              disabled={isSubmittingAnswer || replyingToQuestionId !== q.id || !questionReplyText}
                              className="bg-primary hover:bg-secondary disabled:opacity-50 text-slate-950 font-bold rounded-2xl p-3 px-5 flex items-center justify-center shrink-0 shadow-lg cursor-pointer"
                            >
                              <Send className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              SUB-TAB 4: LISTING GALLERY (PHOTOS & IMAGES MANAGEMENT)
              ========================================================= */}
          {activeSubTab === "media" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
              {/* Photo Upload Card Column */}
              <div className="lg:col-span-1 space-y-6">
                <form onSubmit={handleUploadPhoto} className="bg-slate-950/30 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Upload className="h-4.5 w-4.5 text-primary" /> Upload Photo
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Photo Category</label>
                    <select
                      value={mediaCategory}
                      onChange={(e) => setMediaCategory(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="ADDITIONAL">Additional Photo</option>
                      <option value="COVER">Cover Photo</option>
                      <option value="PROFILE">Profile Logo</option>
                      <option value="INTERIOR">Interior Photo</option>
                      <option value="EXTERIOR">Exterior Photo</option>
                      <option value="TEAMS">Team Photo</option>
                    </select>
                  </div>

                  {/* Visual Dropzone File Picker */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Select Image File</label>
                    <div className="relative border-2 border-dashed border-slate-800 hover:border-primary/50 bg-slate-900/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {mediaFileBase64 ? (
                        <div className="space-y-3">
                          <img src={mediaFileBase64} alt="Preview" className="h-24 mx-auto object-cover rounded-xl border border-slate-850" />
                          <span className="text-[10px] text-emerald-400 font-bold block">Image loaded successfully!</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ImageIcon className="h-8 w-8 text-slate-600 mx-auto" />
                          <span className="text-xs font-semibold text-slate-350 block">Click or Drag Image Here</span>
                          <span className="text-[10px] text-slate-550 block font-mono">PNG, JPG, or WEBP up to 5MB</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingPhoto || !mediaFileBase64}
                    className="w-full bg-primary hover:bg-secondary disabled:opacity-50 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-md mt-4 cursor-pointer"
                  >
                    {uploadingPhoto ? "Uploading to Google..." : "Upload Photo to Live Profile"}
                  </button>
                </form>
              </div>

              {/* Photos Gallery Feed Grid */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Listing Image Gallery</h3>
                    <span className="text-[10px] text-slate-550 leading-normal">Live storefront and workspace media from your business page</span>
                  </div>
                  <button
                    onClick={fetchMedia}
                    className="p-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`h-4.5 w-4.5 ${loadingMedia ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {loadingMedia && mediaItems.length === 0 ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : mediaItems.length === 0 ? (
                  <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-12 text-center text-slate-400">
                    <Camera className="h-14 w-14 text-slate-650 mx-auto mb-4 stroke-1" />
                    <p className="text-xs font-semibold">Your gallery has no photos.</p>
                    <p className="text-[10px] text-slate-550 mt-1">Use the upload box on the left to upload brand storefront photos.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaItems.map((item, idx) => (
                      <div key={item.name || idx} className="group relative aspect-square bg-slate-950/30 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col justify-end">
                        <img
                          src={item.googleUrl}
                          alt="Listing Media"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-85 p-3 flex flex-col justify-end gap-1 select-none">
                          <span className="text-[9px] bg-primary/95 text-slate-950 font-bold px-2 py-0.5 rounded-lg w-max uppercase tracking-wider">
                            {item.category}
                          </span>
                          <span className="text-[8px] text-slate-400">
                            Uploaded {new Date(item.createTime).toLocaleDateString([], { dateStyle: "short" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
