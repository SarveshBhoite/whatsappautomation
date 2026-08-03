"use client";

import React, { useState } from "react";
import { FileText, Send, Trash2, Edit3, Copy, RefreshCw, Sparkles } from "lucide-react";

export interface DraftItem {
  id: string;
  summary: string;
  mediaUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface DraftLibraryProps {
  organizationId?: string;
  drafts: DraftItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onPostPublished?: () => void;
  onEditDraft?: (draft: DraftItem) => void;
}

export function DraftLibrary({
  organizationId = "demo-org-123",
  drafts,
  loading = false,
  onRefresh,
  onPostPublished,
  onEditDraft
}: DraftLibraryProps) {
  const [actionId, setActionId] = useState<string | null>(null);

  const handleDeleteDraft = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/linkedin/draft?id=${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": organizationId }
      });
      if (res.ok && onRefresh) onRefresh();
    } catch (err: any) {
      alert(`Error deleting draft: ${err.message}`);
    } finally {
      setActionId(null);
    }
  };

  const handleDuplicateDraft = async (draft: DraftItem) => {
    setActionId(draft.id);
    try {
      const res = await fetch(`/api/linkedin/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organizationId
        },
        body: JSON.stringify({
          summary: `${draft.summary} (Copy)`,
          mediaUrl: draft.mediaUrl
        })
      });
      if (res.ok && onRefresh) onRefresh();
    } catch (err: any) {
      alert(`Error duplicating draft: ${err.message}`);
    } finally {
      setActionId(null);
    }
  };

  const handlePublishNow = async (draft: DraftItem) => {
    setActionId(draft.id);
    try {
      const res = await fetch(`/api/linkedin/publish-now`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organizationId
        },
        body: JSON.stringify({ id: draft.id, summary: draft.summary, mediaUrl: draft.mediaUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Draft Published Successfully to LinkedIn!");
        if (onPostPublished) onPostPublished();
        if (onRefresh) onRefresh();
      } else {
        alert(`Publish Failed: ${data.error || data.details}`);
      }
    } catch (err: any) {
      alert(`Error publishing draft: ${err.message}`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-400" /> Draft Library ({drafts.length})
        </h3>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} /> Refresh Drafts
          </button>
        )}
      </div>

      {drafts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Draft</span>
                  <span className="font-mono">{new Date(draft.updatedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">{draft.summary}</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-850 pt-2.5">
                <div className="flex items-center gap-1.5">
                  {onEditDraft && (
                    <button
                      type="button"
                      onClick={() => onEditDraft(draft)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all cursor-pointer"
                      title="Edit Draft"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDuplicateDraft(draft)}
                    disabled={actionId === draft.id}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all cursor-pointer"
                    title="Duplicate Draft"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDraft(draft.id)}
                    disabled={actionId === draft.id}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs transition-all cursor-pointer"
                    title="Delete Draft"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handlePublishNow(draft)}
                  disabled={actionId === draft.id}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" /> Publish
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl bg-slate-900/30 flex flex-col items-center gap-2">
          <FileText className="h-8 w-8 text-slate-600" />
          <span>No post drafts saved in library.</span>
        </div>
      )}
    </div>
  );
}
