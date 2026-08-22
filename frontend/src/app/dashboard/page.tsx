"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  Star,
  Bot,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Megaphone,
  Mail,
  Store,
  Layers,
  Clock,
  ChevronRight,
  Activity,
  Users,
  Send,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Native SVG Icons
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.866.553 9.388.553 9.388.553s7.522 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const MetaIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22.5 12c0-5.799-4.701-10.5-10.5-10.5S1.5 6.201 1.5 12c0 5.24 3.84 9.584 8.86 10.368v-7.334h-2.665V12h2.665V9.797c0-2.632 1.568-4.085 3.966-4.085 1.149 0 2.351.205 2.351.205v2.585h-1.324c-1.305 0-1.712.81-1.712 1.64V12h2.913l-.466 3.034h-2.447v7.334c5.02-.784 8.86-5.128 8.86-10.368z"/>
  </svg>
);

interface DashboardData {
  organization: {
    id: string;
    name: string;
    status: string;
    enabledModules: string[];
  };
  platforms: {
    [key: string]: {
      connected: boolean;
      name: string;
      status: string;
    };
  };
  kpis: {
    totalConversations: number;
    whatsappConvs: number;
    instagramConvs: number;
    aiInquiriesHandled: number;
    aiRepliesCount: number;
    capturedLeadsCount: number;
    totalReviewCount: number;
    reviewsAutoReplied: number;
    linkedInPostsCount: number;
    activeAdCampaigns: number;
    gmailThreadsCount: number;
    knowledgeItemsCount: number;
  };
  efficiency?: {
    automationRate: number;
    aiRepliesCount: number;
    inquiriesHandled: number;
    activeChannels: number;
  };
  channelDistribution?: Array<{
    name: string;
    count: number;
    color: string;
  }>;
  trendDays: Array<{
    day: string;
    date: string;
    inquiries: number;
    leads: number;
    reviews?: number;
    total: number;
  }>;
  latestNotifications: Array<{
    id: string;
    platform: "whatsapp" | "instagram" | "reviews" | "linkedin" | "gmail" | "ai_agent" | "ads";
    platformName: string;
    title: string;
    description: string;
    badge: string;
    timestamp: string;
    link: string;
  }>;
}

export default function OverviewDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChartFilter, setActiveChartFilter] = useState<"all" | "inquiries" | "leads" | "reviews">("all");
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; date: string; value: number; x: number; y: number } | null>(null);

  const getOrgId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("organization_id") || "";
    }
    return "";
  };

  const fetchOverview = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const orgId = getOrgId();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/admin/dashboard/overview`, {
        headers: {
          "x-organization-id": orgId
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load dashboard overview:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Format relative time helper
  const getRelativeTime = (timestamp: string) => {
    try {
      const diffMs = Date.now() - new Date(timestamp).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recent";
    }
  };

  // Connected channel count
  const connectedCount = useMemo(() => {
    if (!data?.platforms) return 0;
    return Object.values(data.platforms).filter(p => p.connected).length;
  }, [data?.platforms]);

  // Chart coordinates calculation
  const chartMetrics = useMemo(() => {
    if (!data?.trendDays || data.trendDays.length === 0) return { path: "", areaPath: "", points: [], maxVal: 10 };
    const values = data.trendDays.map(d => {
      if (activeChartFilter === "inquiries") return d.inquiries;
      if (activeChartFilter === "leads") return d.leads;
      if (activeChartFilter === "reviews") return d.reviews || 0;
      return d.total;
    });

    const maxVal = Math.max(...values, 5);
    const width = 500;
    const height = 150;
    const stepX = width / (data.trendDays.length - 1);

    const points = values.map((val, idx) => {
      const x = idx * stepX;
      const y = height - (val / maxVal) * (height - 30) - 15;
      return { x, y, value: val, day: data.trendDays[idx].day, date: data.trendDays[idx].date };
    });

    // Build SVG smooth path
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }

    const areaPath = `${path} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

    return { path, areaPath, points, maxVal };
  }, [data?.trendDays, activeChartFilter]);

  // Channel distribution total
  const distributionTotal = useMemo(() => {
    if (!data?.channelDistribution) return 0;
    return data.channelDistribution.reduce((acc, curr) => acc + curr.count, 0);
  }, [data?.channelDistribution]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 text-slate-900 font-sans selection:bg-brand-blue/10 selection:text-brand-blue">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-7 space-y-7">

        {/* ── 1. Top Hero Command Header ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-sky-500 border border-brand-blue/30 flex items-center justify-center text-white shadow-md shadow-brand-blue/20">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {data?.organization?.name || "Omnichannel"} Command Hub
                </h1>
                <Badge variant="success" className="text-[10px] font-bold px-2 py-0.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  Live Sync
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                <span>Unified Cross-Platform Intelligence</span>
                <span>•</span>
                <span className="text-brand-blue font-semibold">{connectedCount} Channels Connected</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOverview(true)}
              disabled={refreshing}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs text-xs font-bold"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 text-brand-blue ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Syncing..." : "Refresh Data"}
            </Button>
            <Link href="/settings">
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-brand-blue to-sky-600 hover:from-brand-blue/90 hover:to-sky-500 text-white font-bold text-xs shadow-xs"
              >
                <Zap className="h-3.5 w-3.5 mr-1 text-amber-300" /> Connect Channels
              </Button>
            </Link>
          </div>
        </div>

        {/* ── 2. Loading Skeleton or Primary KPI Grid ───────────────────────────── */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
                  <div className="h-3.5 w-24 bg-slate-100 rounded" />
                  <div className="h-8 w-32 bg-slate-200 rounded-lg" />
                  <div className="h-3 w-40 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 h-80 shadow-xs" />
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 h-80 shadow-xs" />
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Inquiries Handled by AI */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm hover:border-emerald-200 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Inquiries Handled</span>
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <Bot className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {data?.kpis.aiInquiriesHandled ?? 0}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium">
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <Sparkles className="h-3 w-3 inline text-emerald-600" /> {data?.kpis.aiRepliesCount || 0} AI Auto-Replies
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: AI Captured Leads */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm hover:border-purple-200 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Captured Leads</span>
                  <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-purple-950 tracking-tight">
                    {data?.kpis.capturedLeadsCount ?? 0}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-purple-700 font-semibold mt-1">
                    <Sparkles className="h-3 w-3 text-purple-600" />
                    <span>Autonomous Qualification</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Reviews Auto-Replied by AI */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm hover:border-amber-200 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reviews Auto-Replied</span>
                  <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
                    {data?.kpis.reviewsAutoReplied ?? 0}
                  </div>
                  <div className="text-[11px] text-amber-800 font-semibold mt-1 flex items-center gap-1">
                    <Store className="h-3 w-3 text-amber-600" />
                    <span>of {data?.kpis.totalReviewCount ?? 0} Total Reviews Synced</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Campaigns & Social Outreach */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm hover:border-sky-200 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Growth &amp; Outreach</span>
                  <div className="h-8 w-8 rounded-xl bg-sky-50 text-brand-blue flex items-center justify-center border border-sky-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {(data?.kpis.activeAdCampaigns || 0) + (data?.kpis.linkedInPostsCount || 0)}
                  </div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-1 flex items-center gap-1.5">
                    <span className="text-sky-700 font-bold">{data?.kpis.activeAdCampaigns || 0} Ads</span>
                    <span>•</span>
                    <span className="text-blue-700 font-bold">{data?.kpis.linkedInPostsCount || 0} LinkedIn Posts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. Central Analytics & Notifications Stage ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: 7-Day Activity Trend & Interactive Vector Chart */}
              <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="h-4 w-4 text-brand-blue" /> 7-Day Activity Velocity
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daily cross-channel customer engagement and lead acquisition rates.
                    </p>
                  </div>

                  {/* Chart Metric Toggle */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shrink-0">
                    <button
                      onClick={() => setActiveChartFilter("all")}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeChartFilter === "all" ? "bg-white text-slate-900 shadow-2xs border border-slate-200" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveChartFilter("inquiries")}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeChartFilter === "inquiries" ? "bg-emerald-50 text-emerald-800 shadow-2xs border border-emerald-200" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Inquiries
                    </button>
                    <button
                      onClick={() => setActiveChartFilter("leads")}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeChartFilter === "leads" ? "bg-purple-50 text-purple-800 shadow-2xs border border-purple-200" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Leads
                    </button>
                    <button
                      onClick={() => setActiveChartFilter("reviews")}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeChartFilter === "reviews" ? "bg-amber-50 text-amber-800 shadow-2xs border border-amber-200" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Reviews
                    </button>
                  </div>
                </div>

                {/* SVG Vector Area Chart */}
                <div className="relative w-full overflow-hidden pt-2">
                  <svg viewBox="0 0 500 150" className="w-full h-44 overflow-visible">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeDasharray="4 4" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke="#F1F5F9" strokeDasharray="4 4" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#F1F5F9" strokeDasharray="4 4" />

                    {/* Gradient Area & Stroke */}
                    {chartMetrics.areaPath && (
                      <path d={chartMetrics.areaPath} fill="url(#areaGradient)" />
                    )}
                    {chartMetrics.path && (
                      <path
                        d={chartMetrics.path}
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Interactive Data Points */}
                    {chartMetrics.points.map((pt, idx) => (
                      <g key={idx} className="cursor-pointer">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredPoint?.date === pt.date ? "6" : "4"}
                          fill="#0284C7"
                          stroke="#FFFFFF"
                          strokeWidth="2.5"
                          className="transition-all duration-150"
                          onMouseEnter={() => setHoveredPoint(pt)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Hover Tooltip Overlay */}
                  {hoveredPoint && (
                    <div
                      className="absolute z-10 bg-slate-900 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-lg pointer-events-none -translate-x-1/2 -translate-y-8"
                      style={{ left: `${(hoveredPoint.x / 500) * 100}%`, top: `${(hoveredPoint.y / 150) * 100}%` }}
                    >
                      {hoveredPoint.day}: {hoveredPoint.value} {activeChartFilter}
                    </div>
                  )}

                  {/* X-axis Day Labels */}
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold pt-2">
                    {data?.trendDays?.map((d, i) => (
                      <span key={i} className="text-center">{d.day}</span>
                    ))}
                  </div>
                </div>

                {/* Footer Metrics Breakdown - Dynamic Real Values */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Total Inquiries Handled</span>
                    <div className="text-sm font-black text-slate-900 mt-0.5">
                      {data?.kpis.aiInquiriesHandled ?? 0} Conversations
                    </div>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">AI Autonomy Rate</span>
                    <div className="text-sm font-black text-emerald-700 mt-0.5">
                      {data?.efficiency?.automationRate ?? 100}%
                    </div>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Active Channels</span>
                    <div className="text-sm font-black text-sky-700 mt-0.5">
                      {connectedCount} / 9 Active
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Latest 4 Cross-Platform Notifications */}
              <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                      Live Notification Stream
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Latest 4</span>
                </div>

                {/* Notification List */}
                <div className="space-y-2.5">
                  {(!data?.latestNotifications || data.latestNotifications.length === 0) ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No recent activities recorded for this organization yet.
                    </div>
                  ) : (
                    data.latestNotifications.map((item) => {
                      const isWa = item.platform === "whatsapp";
                      const isIg = item.platform === "instagram";
                      const isRev = item.platform === "reviews";
                      const isAgent = item.platform === "ai_agent";
                      const isLinkedIn = item.platform === "linkedin";

                      return (
                        <Link
                          key={item.id}
                          href={item.link}
                          className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-2xs transition-all flex items-start justify-between gap-2.5 group"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                              isWa ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              isIg ? "bg-pink-50 text-pink-600 border-pink-100" :
                              isRev ? "bg-amber-50 text-amber-600 border-amber-100" :
                              isAgent ? "bg-purple-50 text-purple-600 border-purple-100" :
                              "bg-blue-50 text-blue-600 border-blue-100"
                            }`}>
                              {isWa && <WhatsAppIcon className="h-4 w-4" />}
                              {isIg && <InstagramIcon className="h-4 w-4" />}
                              {isRev && <Star className="h-4 w-4 fill-amber-400 text-amber-500" />}
                              {isAgent && <Bot className="h-4 w-4" />}
                              {isLinkedIn && <LinkedInIcon className="h-4 w-4" />}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-slate-900 truncate">
                                  {item.title}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[9px] font-semibold text-slate-400">
                              {getRelativeTime(item.timestamp)}
                            </span>
                            <ArrowUpRight className="h-3 w-3 text-slate-300 group-hover:text-brand-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>

                <div className="pt-2">
                  <Link href="/whatsapp" className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold border-slate-200 text-slate-700">
                      Open Unified Inbox <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── 3.5 Cross-Platform Volume & Performance Breakdown ───────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Channel Volume Share & Visual Progress Bars */}
              <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="h-4 w-4 text-brand-blue" /> Channel Activity Distribution
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Real-time cross-platform volume and engagement distribution across channels.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {distributionTotal} Total Events
                  </span>
                </div>

                {/* Progress bars list */}
                <div className="space-y-3 pt-1">
                  {data?.channelDistribution?.map((ch, idx) => {
                    const pct = distributionTotal > 0 ? Math.round((ch.count / distributionTotal) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-700 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                            {ch.name}
                          </span>
                          <span className="text-slate-500 font-semibold">
                            {ch.count} <span className="text-[10px] text-slate-400">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, ch.count > 0 ? 3 : 0)}%`, backgroundColor: ch.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Automation Efficiency & Autonomous Response Engine Health */}
              <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" /> AI Autonomy &amp; Response Engine
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Real-time performance metrics computed for this organization.
                    </p>
                  </div>
                  <Badge variant="success" className="text-[10px] font-bold">
                    Active
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Autonomous Handling</span>
                    <div className="text-2xl font-black text-slate-900 mt-2">
                      {data?.efficiency?.automationRate ?? 100}%
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold mt-1">
                      {data?.kpis.aiInquiriesHandled || 0} of {data?.kpis.totalConversations || 0} Convs Handled
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Outbound AI Dispatched</span>
                    <div className="text-2xl font-black text-purple-950 mt-2">
                      {data?.kpis.aiRepliesCount || 0}
                    </div>
                    <span className="text-[10px] text-purple-700 font-bold mt-1">
                      Auto-Pilot Responses Sent
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Review Auto-Reply</span>
                    <div className="text-2xl font-black text-amber-950 mt-2">
                      {data?.kpis.reviewsAutoReplied || 0}
                    </div>
                    <span className="text-[10px] text-amber-800 font-bold mt-1">
                      Google Reviews Answered
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">Trained Knowledge Base</span>
                    <div className="text-2xl font-black text-sky-950 mt-2">
                      {data?.kpis.knowledgeItemsCount || 0}
                    </div>
                    <span className="text-[10px] text-sky-700 font-bold mt-1">
                      Custom Org Facts &amp; Media
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 4. Connected Platforms Health Grid ────────────────────────────────── */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="h-4 w-4 text-brand-blue" /> Connected Platform Matrix
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time operational status for all channels connected to this workspace.
                  </p>
                </div>
                <Badge variant="brand" className="text-[10px] font-bold">
                  {connectedCount} of 9 Active
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {/* WhatsApp */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between hover:bg-white transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                      <WhatsAppIcon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">WhatsApp</div>
                      <div className="text-[10px] text-slate-500 truncate">{data?.platforms?.whatsapp?.status || "Ready"}</div>
                    </div>
                  </div>
                  {data?.platforms?.whatsapp?.connected ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">Setup</span>
                  )}
                </div>

                {/* Instagram */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between hover:bg-white transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-pink-100/80 text-pink-700 flex items-center justify-center shrink-0">
                      <InstagramIcon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">Instagram</div>
                      <div className="text-[10px] text-slate-500 truncate">{data?.platforms?.instagram?.status || "Ready"}</div>
                    </div>
                  </div>
                  {data?.platforms?.instagram?.connected ? (
                    <CheckCircle2 className="h-4 w-4 text-pink-600 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">Setup</span>
                  )}
                </div>

                {/* Google Ads */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between hover:bg-white transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-sky-100/80 text-sky-700 flex items-center justify-center shrink-0">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">Google Ads</div>
                      <div className="text-[10px] text-slate-500 truncate">{data?.platforms?.google_ads?.status || "Ready"}</div>
                    </div>
                  </div>
                  {data?.platforms?.google_ads?.connected ? (
                    <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">Setup</span>
                  )}
                </div>

                {/* Meta Ads */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between hover:bg-white transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                      <MetaIcon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">Meta Ads</div>
                      <div className="text-[10px] text-slate-500 truncate">{data?.platforms?.meta_ads?.status || "Ready"}</div>
                    </div>
                  </div>
                  {data?.platforms?.meta_ads?.connected ? (
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">Setup</span>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between hover:bg-white transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-blue-900/10 text-blue-900 flex items-center justify-center shrink-0">
                      <LinkedInIcon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">LinkedIn</div>
                      <div className="text-[10px] text-slate-500 truncate">{data?.platforms?.linkedin?.status || "Ready"}</div>
                    </div>
                  </div>
                  {data?.platforms?.linkedin?.connected ? (
                    <CheckCircle2 className="h-4 w-4 text-blue-800 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">Setup</span>
                  )}
                </div>

                {/* Google Business Profile */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between hover:bg-white transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
                      <Store className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">Google Profile</div>
                      <div className="text-[10px] text-slate-500 truncate">{data?.platforms?.gmb?.status || "Ready"}</div>
                    </div>
                  </div>
                  {data?.platforms?.gmb?.connected ? (
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">Setup</span>
                  )}
                </div>

                {/* YouTube */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between hover:bg-white transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-red-100/80 text-red-700 flex items-center justify-center shrink-0">
                      <YoutubeIcon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">YouTube</div>
                      <div className="text-[10px] text-slate-500 truncate">{data?.platforms?.youtube?.status || "Ready"}</div>
                    </div>
                  </div>
                  {data?.platforms?.youtube?.connected ? (
                    <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">Setup</span>
                  )}
                </div>

                {/* Gmail */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between hover:bg-white transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">Gmail</div>
                      <div className="text-[10px] text-slate-500 truncate">{data?.platforms?.gmail?.status || "Ready"}</div>
                    </div>
                  </div>
                  {data?.platforms?.gmail?.connected ? (
                    <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">Setup</span>
                  )}
                </div>

                {/* AI Agent */}
                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex items-center justify-between hover:bg-white transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-purple-950 truncate">AI Agent</div>
                      <div className="text-[10px] text-purple-600 font-semibold truncate">Trained &amp; Active</div>
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
