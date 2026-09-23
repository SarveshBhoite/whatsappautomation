"use client";

import React, { useState } from "react";
import {
  Clock,
  Send,
  Trash2,
  RefreshCw,
  Calendar,
  Eye,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { MediaPreview, detectMediaType } from "@/components/linkedIns/MediaPreview";

export interface ScheduledPostItem {
  id: string;
  summary: string;
  mediaUrl?: string | null;
  scheduledAt?: string | Date | null;
  status: string; // SCHEDULED, FAILED, CANCELLED, PUBLISHED
  retryCount: number;
  errorMessage?: string | null;
  createdAt: string | Date;
}

interface ScheduleQueueProps {
  organizationId?: string;
  scheduledPosts: ScheduledPostItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onPostPublished?: () => void;
}

export function ScheduleQueue({
  organizationId = "demo-org-123",
  scheduledPosts,
  loading = false,
  onRefresh,
  onPostPublished
}: ScheduleQueueProps) {
  const [actionId, setActionId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ScheduledPostItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled post?")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/linkedin/schedule?id=${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": organizationId }
      });
      if (res.ok && onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      alert(`Error cancelling schedule: ${err.message}`);
    } finally {
      setActionId(null);
    }
  };

  const handlePublishNow = async (item: ScheduledPostItem) => {
    setActionId(item.id);
    try {
      const res = await fetch(`/api/linkedin/publish-now`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organizationId
        },
        body: JSON.stringify({ id: item.id, summary: item.summary, mediaUrl: item.mediaUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Post Published Immediately to LinkedIn!");
        if (onPostPublished) onPostPublished();
        if (onRefresh) onRefresh();
      } else {
        alert(`Publish Failed: ${data.error || data.details}`);
      }
    } catch (err: any) {
      alert(`Error publishing post: ${err.message}`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 font-sans text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#0A66C2]" /> Scheduled Post Queue ({scheduledPosts.length})
        </h3>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} /> Refresh Queue
          </button>
        )}
      </div>

      {scheduledPosts.length > 0 ? (
        <div className="space-y-3">
          {scheduledPosts.map((item) => {
            const isExpanded = Boolean(expandedItems[item.id]);
            const mediaType = detectMediaType(item.mediaUrl);
            const hasMedia = Boolean(item.mediaUrl && item.mediaUrl.trim().length > 0);

            return (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Header Row: Status, Schedule Date, Media Badge, Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${item.status === "SCHEDULED"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.status === "FAILED"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${item.status === "SCHEDULED" ? "bg-[#0A66C2] animate-pulse" : "bg-red-500"}`} />
                      {item.status}
                    </span>

                    {item.scheduledAt && (
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                        <Calendar className="h-3.5 w-3.5 text-[#0A66C2]" />
                        {new Date(item.scheduledAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    )}

                    {/* Media Type Indicator Pill */}
                    {hasMedia && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {mediaType === "IMAGE" ? (
                          <ImageIcon className="h-3 w-3" />
                        ) : mediaType === "VIDEO" ? (
                          <VideoIcon className="h-3 w-3" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                        {mediaType === "IMAGE" ? "Image Attached" : mediaType === "VIDEO" ? "Video Attached" : "Document Attached"}
                      </span>
                    )}

                    {item.retryCount > 0 && (
                      <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Retries: {item.retryCount}/3
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Live Preview Modal Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#0A66C2] border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      title="Open Full Post Preview Modal"
                    >
                      <Eye className="h-3.5 w-3.5" /> Preview Post
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePublishNow(item)}
                      disabled={actionId === item.id}
                      className="px-3 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-blue-600/20"
                    >
                      <Send className="h-3.5 w-3.5" /> Publish Now
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCancel(item.id)}
                      disabled={actionId === item.id}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </div>
                </div>

                {/* Content Summary */}
                <div className="space-y-2">
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="cursor-pointer group"
                    title="Click to expand/collapse full text"
                  >
                    <p className={`text-xs text-slate-800 leading-relaxed ${isExpanded ? "whitespace-pre-wrap" : "line-clamp-3"}`}>
                      {item.summary}
                    </p>
                    {item.summary.length > 120 && (
                      <button
                        type="button"
                        className="text-[11px] font-bold text-[#0A66C2] group-hover:underline flex items-center gap-1 pt-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" /> Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" /> Show Full Post Text
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Inline Media Preview */}
                  {hasMedia && (
                    <div className="pt-2">
                      <MediaPreview mediaUrl={item.mediaUrl} />
                    </div>
                  )}

                  {item.errorMessage && (
                    <p className="text-[11px] text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 font-semibold">
                      ⚠ Error: {item.errorMessage}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-3 bg-slate-50/60">
          <Clock className="h-10 w-10 text-slate-400" />
          <span className="font-semibold text-slate-800 text-sm">No scheduled posts in the queue.</span>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            Turn on the <strong>Schedule Post</strong> mode in the composer to pick a future date and time for automatic LinkedIn publishing.
          </p>
        </div>
      )}

      {/* Interactive Full Post Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Eye className="h-4 w-4 text-[#0A66C2]" /> Scheduled LinkedIn Post Preview
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-bold text-slate-700">Scheduled For:</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {previewItem.scheduledAt
                    ? new Date(previewItem.scheduledAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                    : "Immediate Queue"}
                </span>
              </div>

              {/* Text Body */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 leading-relaxed whitespace-pre-wrap">
                {previewItem.summary}
              </div>

              {/* Attached Media */}
              {previewItem.mediaUrl && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Attached Media Asset
                  </span>
                  <MediaPreview mediaUrl={previewItem.mediaUrl} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  const itm = previewItem;
                  setPreviewItem(null);
                  handlePublishNow(itm);
                }}
                className="px-4 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" /> Publish Immediately
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
