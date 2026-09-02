"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Video as VideoIcon, FileText as DocumentIcon, ExternalLink, Globe, Link2, X, ZoomIn } from "lucide-react";

interface MediaPreviewProps {
  mediaUrl?: string | null;
  url?: string | null;
  organizationId?: string;
  className?: string;
}

export interface LinkMetadata {
  url: string;
  domain: string;
  title: string;
  description?: string;
  image?: string;
}

export function detectMediaType(url?: string | null): "IMAGE" | "VIDEO" | "DOCUMENT" | "LINK" | "UNKNOWN" {
  if (!url) return "UNKNOWN";
  if (url.startsWith("urn:li:image:") || url.startsWith("urn:li:digitalmediaAsset:")) return "IMAGE";
  if (url.startsWith("urn:li:video:") || url.startsWith("urn:li:ugcPost:")) return "VIDEO";
  if (url.startsWith("urn:li:document:")) return "DOCUMENT";
  if (url.startsWith("urn:li:")) return "IMAGE";

  const cleanUrl = url.toLowerCase().split("?")[0];

  if (url.startsWith("link://") || url.startsWith("{") || (url.startsWith("http") && !url.match(/\.(jpg|jpeg|png|webp|gif|svg|mp4|mov|avi|webm|pdf|docx|doc|pptx|ppt)($|\?)/i))) {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const isDirectMedia = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".avi", ".webm", ".pdf"].some((ext) => cleanUrl.endsWith(ext));
      if (!isDirectMedia && !cleanUrl.includes("imagekit.io")) {
        return "LINK";
      }
    }
  }

  const imageExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
  const videoExts = [".mp4", ".mov", ".avi", ".webm", ".mkv", ".m4v"];
  const docExts = [".pdf", ".docx", ".doc", ".pptx", ".ppt"];

  if (imageExts.some((ext) => cleanUrl.endsWith(ext)) || cleanUrl.includes("/image/") || cleanUrl.includes("/images/")) {
    return "IMAGE";
  }
  if (videoExts.some((ext) => cleanUrl.endsWith(ext)) || cleanUrl.includes("/video/") || cleanUrl.includes("/videos/")) {
    return "VIDEO";
  }
  if (docExts.some((ext) => cleanUrl.endsWith(ext)) || cleanUrl.includes("/document/") || cleanUrl.includes("/documents/")) {
    return "DOCUMENT";
  }

  if (/\.(jpg|jpeg|png|webp)/i.test(cleanUrl)) return "IMAGE";
  if (/\.(mp4|mov|avi|webm)/i.test(cleanUrl)) return "VIDEO";
  if (/\.(pdf|docx|pptx)/i.test(cleanUrl)) return "DOCUMENT";

  return "IMAGE";
}

function ArticleLinkCard({ url }: { url: string }) {
  const [meta, setMeta] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cleanUrl = url;
    if (cleanUrl.startsWith("link://")) {
      cleanUrl = cleanUrl.replace("link://", "https://");
    }

    if (cleanUrl.startsWith("{")) {
      try {
        const parsed = JSON.parse(cleanUrl);
        setMeta(parsed);
        setLoading(false);
        return;
      } catch (e) {}
    }

    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/linkedin/link-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: cleanUrl })
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.preview) {
            setMeta(data.preview);
          }
        }
      } catch (err) {
        if (isMounted) {
          try {
            setMeta({
              url: cleanUrl,
              domain: new URL(cleanUrl).hostname.replace("www.", ""),
              title: cleanUrl,
              description: ""
            });
          } catch (e) {}
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
        <div className="h-16 w-20 bg-slate-200 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-4 w-3/4 bg-slate-200 rounded" />
          <div className="h-3 w-1/2 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  const cleanTargetUrl = meta?.url || url;
  const domain = meta?.domain || "article";

  return (
    <a
      href={cleanTargetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all group"
    >
      {/* Thumbnail Banner */}
      {meta?.image && (
        <div className="h-44 w-full bg-slate-100 overflow-hidden relative border-b border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.image}
            alt={meta.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Meta Content */}
      <div className="p-3.5 space-y-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
          <Globe className="h-3 w-3 text-[#0A66C2]" /> {domain}
        </span>
        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#0A66C2] transition-colors">
          {meta?.title || cleanTargetUrl}
        </h4>
        {meta?.description && (
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {meta.description}
          </p>
        )}
      </div>
    </a>
  );
}

function SingleMediaItem({ url, organizationId }: { url: string; organizationId?: string }) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(url.startsWith("urn:li:") ? null : url);
  const [resolvedType, setResolvedType] = useState<"IMAGE" | "VIDEO" | "DOCUMENT" | "LINK" | "UNKNOWN">(
    url.startsWith("urn:li:image:") ? "IMAGE" : url.startsWith("urn:li:video:") ? "VIDEO" : url.startsWith("urn:li:document:") ? "DOCUMENT" : detectMediaType(url) as any
  );
  const [loadingResolution, setLoadingResolution] = useState(url.startsWith("urn:li:"));
  const [imgError, setImgError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (url.startsWith("urn:li:")) {
      let isMounted = true;
      setLoadingResolution(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const effectiveOrgId = organizationId || (typeof window !== "undefined" ? localStorage.getItem("organization_id") || "crm3" : "crm3");

      fetch(`${API_BASE_URL}/api/linkedin/org/media-asset?urn=${encodeURIComponent(url)}`, {
        headers: { "x-organization-id": effectiveOrgId }
      })
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) {
            if (data.url) {
              setResolvedUrl(data.url);
              if (data.mediaType) setResolvedType(data.mediaType);
            } else {
              setResolvedUrl(null);
            }
          }
        })
        .catch(() => {
          if (isMounted) setResolvedUrl(null);
        })
        .finally(() => {
          if (isMounted) setLoadingResolution(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setResolvedUrl(url);
      setResolvedType(detectMediaType(url) as any);
      setLoadingResolution(false);
    }
  }, [url, organizationId]);

  if (loadingResolution) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-2 animate-pulse text-xs text-slate-400 font-medium">
        <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
        <span>Loading media...</span>
      </div>
    );
  }

  // If URN could not be resolved to a valid accessible URL, do not render a broken blank frame
  if (url.startsWith("urn:li:") && !resolvedUrl) {
    return null;
  }

  const effectiveUrl = resolvedUrl || url;
  const mediaType = resolvedType;

  if (mediaType === "LINK") {
    return <ArticleLinkCard url={effectiveUrl} />;
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/5 shadow-xs">
        {/* IMAGE PREVIEW - Object Contain with Natural Proportions */}
        {mediaType === "IMAGE" && (
          <div className="relative group min-h-[200px] max-h-[500px] w-full bg-slate-900/90 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => setIsModalOpen(true)}>
            {!imgError ? (
              <img
                src={effectiveUrl}
                alt="LinkedIn Post Media"
                onError={() => setImgError(true)}
                className="w-full h-auto max-h-[500px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <ImageIcon className="h-8 w-8 text-slate-500" />
                <span>Image preview unavailable</span>
              </div>
            )}

            {/* Click to Zoom / Expand Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs backdrop-blur-[2px]">
              <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/20 flex items-center gap-1.5 shadow-lg">
                <ZoomIn className="h-4 w-4 text-blue-400" />
                <span>Click to expand image</span>
              </div>
            </div>

            <a
              href={effectiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-[#0A66C2] border border-slate-200 backdrop-blur-sm transition-all shadow-xs z-10"
              title="Open Image in Full Size"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* VIDEO PLAYER */}
        {mediaType === "VIDEO" && (
          <div className="relative group bg-slate-950 rounded-2xl overflow-hidden">
            <video controls preload="metadata" src={effectiveUrl} className="w-full max-h-[440px] rounded-2xl object-contain bg-black">
              Your browser does not support HTML5 video streaming.
            </video>
          </div>
        )}

        {/* DOCUMENT / PDF PREVIEW */}
        {mediaType === "DOCUMENT" && (
          <div className="space-y-2 p-2 bg-white">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
              <div className="flex items-center gap-2 truncate">
                <DocumentIcon className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="truncate">{effectiveUrl.split("/").pop()?.split("?")[0] || "LinkedIn Document Attachment"}</span>
              </div>
              <a
                href={effectiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#0A66C2] border border-slate-200 text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
              >
                <span>Open Document</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="w-full h-[360px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <iframe src={`${effectiveUrl}#toolbar=0&navpanes=0`} title="Document PDF Preview" className="w-full h-full border-none" />
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Popup Lightbox Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-semibold tracking-wide text-slate-300 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-400" /> Full Size Preview
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={effectiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1.5 font-bold"
                  title="Open original in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">Original Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition-all cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Display */}
            <div className="relative w-full max-h-[82vh] overflow-hidden rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shadow-2xl p-2">
              <img
                src={effectiveUrl}
                alt="Enlarged Post View"
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MediaPreview({ mediaUrl, url: propUrl, organizationId, className = "" }: MediaPreviewProps) {
  const targetUrl = mediaUrl || propUrl;
  if (!targetUrl || !targetUrl.trim()) return null;

  let urlList: string[] = [];
  const trimmed = targetUrl.trim();

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        urlList = parsed.filter((u) => typeof u === "string" && u.trim().length > 0);
      }
    } catch {
      urlList = [trimmed];
    }
  } else if (trimmed.includes(",") && !trimmed.startsWith("{")) {
    urlList = trimmed
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
  } else {
    urlList = [trimmed];
  }

  if (urlList.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className={`grid gap-3 ${urlList.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
        {urlList.map((url, idx) => (
          <SingleMediaItem key={`${url}-${idx}`} url={url} organizationId={organizationId} />
        ))}
      </div>
    </div>
  );
}
