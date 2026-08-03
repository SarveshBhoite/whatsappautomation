"use client";

import React, { useState } from "react";
import { Clock, Send, Trash2, RefreshCw, AlertCircle, CheckCircle2, Calendar } from "lucide-react";

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
    <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-400" /> Scheduled Post Queue ({scheduledPosts.length})
        </h3>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} /> Refresh Queue
          </button>
        )}
      </div>

      {scheduledPosts.length > 0 ? (
        <div className="space-y-3">
          {scheduledPosts.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      item.status === "SCHEDULED"
                        ? "bg-blue-950/60 text-blue-400 border-blue-800/80"
                        : item.status === "FAILED"
                        ? "bg-red-950/60 text-red-400 border-red-800/80"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${item.status === "SCHEDULED" ? "bg-blue-400 animate-pulse" : "bg-red-400"}`} />
                    {item.status}
                  </span>

                  {item.scheduledAt && (
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-blue-400" />
                      {new Date(item.scheduledAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  )}

                  {item.retryCount > 0 && (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                      Retries: {item.retryCount}/3
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">{item.summary}</p>

                {item.errorMessage && (
                  <p className="text-[11px] text-red-400 bg-red-950/30 p-2 rounded border border-red-800/40">
                    ⚠ Error: {item.errorMessage}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePublishNow(item)}
                  disabled={actionId === item.id}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" /> Publish Now
                </button>

                <button
                  type="button"
                  onClick={() => handleCancel(item.id)}
                  disabled={actionId === item.id}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl bg-slate-900/30 flex flex-col items-center gap-2">
          <Clock className="h-8 w-8 text-slate-600" />
          <span>No posts currently scheduled in queue.</span>
        </div>
      )}
    </div>
  );
}
