"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Video as VideoIcon, FileText as DocumentIcon, ExternalLink, Globe, Link2 } from "lucide-react";

interface MediaPreviewProps {
  mediaUrl?: string | null;
  url?: string | null;
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

function SingleMediaItem({ url }: { url: string }) {
  const [imgError, setImgError] = useState(false);
  const mediaType = detectMediaType(url);

  if (mediaType === "LINK") {
    return <ArticleLinkCard url={url} />;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-xs">
      {/* IMAGE PREVIEW */}
      {mediaType === "IMAGE" && (
        <div className="relative group min-h-[160px] max-h-[380px] bg-slate-100 flex items-center justify-center overflow-hidden">
          {!imgError ? (
            <img
              src={url}
              alt="Uploaded Media Preview"
              onError={() => setImgError(true)}
              className="w-full h-full max-h-[380px] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
              <ImageIcon className="h-8 w-8 text-slate-400" />
              <span>Image preview unavailable</span>
            </div>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-[#0A66C2] border border-slate-200 backdrop-blur-sm transition-all shadow-xs"
            title="Open Image"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* VIDEO PLAYER */}
      {mediaType === "VIDEO" && (
        <div className="relative group bg-slate-900 rounded-2xl overflow-hidden">
          <video controls preload="metadata" src={url} className="w-full max-h-[360px] rounded-2xl object-contain bg-black">
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
              <span className="truncate">{url.split("/").pop()?.split("?")[0] || "Document Preview"}</span>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#0A66C2] border border-slate-200 text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
            >
              <span>Open Document</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="w-full h-[280px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <iframe src={`${url}#toolbar=0&navpanes=0`} title="Document PDF Preview" className="w-full h-full border-none" />
          </div>
        </div>
      )}
    </div>
  );
}

export function MediaPreview({ mediaUrl, url: propUrl, className = "" }: MediaPreviewProps) {
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
          <SingleMediaItem key={`${url}-${idx}`} url={url} />
        ))}
      </div>
    </div>
  );
}
