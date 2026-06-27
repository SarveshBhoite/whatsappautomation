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
  Star
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

const BACKEND_URL = "http://localhost:5000";
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
  };
  summary: PerformanceSummary;
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

  const fetchPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/performance?orgId=${orgId}`);
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
    fetchPerformance();
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
                y={yPos + 4} 
                fill="#94a3b8" 
                fontSize={9} 
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
                y={height - 10} 
                fill="#94a3b8" 
                fontSize={9} 
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
      </svg>
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
                <h1 className="text-xl font-black tracking-tight sm:text-2xl">Google Business Listing</h1>
                <p className="text-xs text-slate-400">
                  {data ? `${data.locationName} • GMB API performance dashboard` : "Manage and track Google Business performance statistics"}
                </p>
              </div>
            </div>

            {data && (
              <div className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{data.range.startDate} to {data.range.endDate}</span>
              </div>
            )}
          </div>

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
                  onClick={fetchPerformance}
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
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                        <span className="inline-flex items-center gap-1.5"><Search className="h-3.5 w-3.5 text-primary" /> Google Search</span>
                        <span className="font-bold text-slate-200">
                          {data.summary.searchViews.toLocaleString()} ({data.summary.totalViews > 0 ? Math.round((data.summary.searchViews / data.summary.totalViews) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${data.summary.totalViews > 0 ? (data.summary.searchViews / data.summary.totalViews) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Row 2: Maps */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                        <span className="inline-flex items-center gap-1.5"><Map className="h-3.5 w-3.5 text-secondary" /> Google Maps</span>
                        <span className="font-bold text-slate-200">
                          {data.summary.mapsViews.toLocaleString()} ({data.summary.totalViews > 0 ? Math.round((data.summary.mapsViews / data.summary.totalViews) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary rounded-full transition-all duration-300"
                          style={{ width: `${data.summary.totalViews > 0 ? (data.summary.mapsViews / data.summary.totalViews) * 100 : 0}%` }}
                        />
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
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                        <span className="inline-flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5 text-sky-400" /> Mobile Devices</span>
                        <span className="font-bold text-slate-200">
                          {data.summary.mobileViews.toLocaleString()} ({data.summary.totalViews > 0 ? Math.round((data.summary.mobileViews / data.summary.totalViews) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sky-400 rounded-full transition-all duration-300"
                          style={{ width: `${data.summary.totalViews > 0 ? (data.summary.mobileViews / data.summary.totalViews) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Row 2: Desktop */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                        <span className="inline-flex items-center gap-1.5"><Monitor className="h-3.5 w-3.5 text-amber-400" /> Desktop Devices</span>
                        <span className="font-bold text-slate-200">
                          {data.summary.desktopViews.toLocaleString()} ({data.summary.totalViews > 0 ? Math.round((data.summary.desktopViews / data.summary.totalViews) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${data.summary.totalViews > 0 ? (data.summary.desktopViews / data.summary.totalViews) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* 4. Action Cards for GMB Listing */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <Store className="h-10 w-10 text-primary stroke-1" />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-200">Listing Connection Verified</h4>
                    <p className="text-[10px] text-slate-500">Your Google OAuth connection and Location ID are active and verified.</p>
                  </div>
                </div>

                <div className="flex gap-3 shrink-0">
                  <Link 
                    href="/?tab=settings" 
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                  >
                    Configure GMB Setup
                  </Link>
                  <a 
                    href={`https://maps.google.com/?cid=${data.googleLocationId.split("/")[3] || ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary hover:bg-secondary text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5"
                  >
                    Open in Google Maps <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
