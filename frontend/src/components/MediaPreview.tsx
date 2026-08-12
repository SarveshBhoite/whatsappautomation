"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Video as VideoIcon, FileText as DocumentIcon, AlertTriangle, ExternalLink, Play } from "lucide-react";

interface MediaPreviewProps {
  mediaUrl?: string | null;
  className?: string;
}

export function detectMediaType(url?: string | null): "IMAGE" | "VIDEO" | "DOCUMENT" | "UNKNOWN" {
  if (!url) return "UNKNOWN";
  const cleanUrl = url.toLowerCase().split("?")[0];

  const imageExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
  const videoExts = [".mp4", ".mov", ".avi", ".webm", ".mkv", ".m4v"];
  const docExts = [".pdf", ".docx", ".doc", ".pptx", ".ppt"];

  if (imageExts.some(ext => cleanUrl.endsWith(ext)) || cleanUrl.includes("/image/")) {
    return "IMAGE";
  }
  if (videoExts.some(ext => cleanUrl.endsWith(ext)) || cleanUrl.includes("/video/")) {
    return "VIDEO";
  }
  if (docExts.some(ext => cleanUrl.endsWith(ext)) || cleanUrl.includes("/document/")) {
    return "DOCUMENT";
  }

  // Fallback heuristic based on common filenames/extensions in URL
  if (/\.(jpg|jpeg|png|webp)/i.test(cleanUrl)) return "IMAGE";
  if (/\.(mp4|mov|avi|webm)/i.test(cleanUrl)) return "VIDEO";
  if (/\.(pdf|docx|pptx)/i.test(cleanUrl)) return "DOCUMENT";

  return "IMAGE"; // Default to image if URL is present
}

export function MediaPreview({ mediaUrl, className = "" }: MediaPreviewProps) {
  const [imgError, setImgError] = useState(false);

  if (!mediaUrl || !mediaUrl.trim()) return null;

  const mediaType = detectMediaType(mediaUrl);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Media Renderer */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 shadow-md">
        {/* IMAGE PREVIEW */}
        {mediaType === "IMAGE" && (
          <div className="relative group min-h-[160px] max-h-[380px] bg-slate-900 flex items-center justify-center overflow-hidden">
            {!imgError ? (
              <img
                src={mediaUrl}
                alt="Uploaded Media Preview"
                onError={() => setImgError(true)}
                className="w-full h-full max-h-[380px] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <ImageIcon className="h-8 w-8 text-slate-600" />
                <span>Image preview unavailable</span>
              </div>
            )}
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white backdrop-blur-sm transition-all"
              title="Open Image"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* VIDEO PLAYER */}
        {mediaType === "VIDEO" && (
          <div className="relative group bg-slate-950 rounded-xl overflow-hidden">
            <video
              controls
              preload="metadata"
              src={mediaUrl}
              className="w-full max-h-[360px] rounded-xl object-contain bg-black"
            >
              Your browser does not support HTML5 video streaming.
            </video>
          </div>
        )}

        {/* DOCUMENT / PDF PREVIEW */}
        {mediaType === "DOCUMENT" && (
          <div className="space-y-2 p-2">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900 rounded-lg border border-slate-850 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2 truncate">
                <DocumentIcon className="h-4 w-4 text-orange-400 shrink-0" />
                <span className="truncate">{mediaUrl.split("/").pop() || "Document Preview"}</span>
              </div>
              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1 shrink-0 transition-colors"
              >
                <span>Open PDF</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="w-full h-[280px] rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
              <iframe
                src={`${mediaUrl}#toolbar=0&navpanes=0`}
                title="Document PDF Preview"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
