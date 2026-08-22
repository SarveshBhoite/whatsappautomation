"use client";

import React from "react";
import { User, Globe } from "lucide-react";
import { MediaPreview } from "./MediaPreview";

interface PostPreviewProps {
  authorName?: string;
  authorPicture?: string;
  headline?: string;
  content: string;
  mediaUrl?: string;
  visibility?: string;
}

export function PostPreview({
  authorName = "LinkedIn Member",
  authorPicture = "",
  headline = "LinkedIn Member Profile",
  content,
  mediaUrl = "",
  visibility = "PUBLIC"
}: PostPreviewProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 font-sans text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-[#0A66C2]" /> Live Post Preview
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 font-semibold">
          {visibility}
        </span>
      </div>

      {/* Author Header */}
      <div className="flex items-center gap-3">
        {authorPicture ? (
          <img
            src={authorPicture}
            alt={authorName}
            className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0"
          />
        ) : (
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0A66C2] shrink-0">
            <User className="h-5 w-5" />
          </div>
        )}
        <div className="space-y-0.5 min-w-0">
          <h4 className="text-xs font-bold text-slate-900 truncate">{authorName}</h4>
          <p className="text-[11px] text-slate-500 truncate">{headline}</p>
        </div>
      </div>

      {/* Post Text Body */}
      <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[60px]">
        {content.trim() || <span className="text-slate-400 italic">Post content preview will appear here as you type...</span>}
      </div>

      {/* Media / Link Preview Box */}
      {mediaUrl.trim() && (
        <MediaPreview mediaUrl={mediaUrl} className="pt-1" />
      )}
    </div>
  );
}
