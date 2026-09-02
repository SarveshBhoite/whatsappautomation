"use client";

import React, { useState } from "react";
import { FileText, Send, Trash2, Edit3, Copy, RefreshCw, Eye, X, Image as ImageIcon, Video as VideoIcon, ChevronDown, ChevronUp } from "lucide-react";
import { MediaPreview, detectMediaType } from "@/components/linkedIns/MediaPreview";

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
  const [previewDraft, setPreviewDraft] = useState<DraftItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 font-sans text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#0A66C2]" /> Draft Library ({drafts.length})
        </h3>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} /> Refresh Drafts
          </button>
        )}
      </div>

      {drafts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drafts.map((draft) => {
            const isExpanded = Boolean(expandedItems[draft.id]);
            const hasMedia = Boolean(draft.mediaUrl && draft.mediaUrl.trim().length > 0);
            const mediaType = detectMediaType(draft.mediaUrl);

            return (
              <div
                key={draft.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                      {hasMedia && (
                        <span className="font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          {mediaType === "IMAGE" ? <ImageIcon className="h-3 w-3" /> : mediaType === "VIDEO" ? <VideoIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                          {mediaType}
                        </span>
                      )}
                    </div>
                    <span className="font-mono">{new Date(draft.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div
                    onClick={() => toggleExpand(draft.id)}
                    className="cursor-pointer group"
                    title="Click to expand text"
                  >
                    <p className={`text-xs text-slate-800 leading-relaxed ${isExpanded ? "whitespace-pre-wrap" : "line-clamp-3"}`}>
                      {draft.summary}
                    </p>
                    {draft.summary.length > 100 && (
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
                            <ChevronDown className="h-3 w-3" /> Show Full Text
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {hasMedia && (
                    <div className="pt-2">
                      <MediaPreview mediaUrl={draft.mediaUrl} />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewDraft(draft)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#0A66C2] border border-slate-200 text-xs transition-all cursor-pointer shadow-xs"
                      title="Preview Draft"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {onEditDraft && (
                      <button
                        type="button"
                        onClick={() => onEditDraft(draft)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs transition-all cursor-pointer"
                        title="Edit Draft in Composer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDuplicateDraft(draft)}
                      disabled={actionId === draft.id}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs transition-all cursor-pointer disabled:opacity-50"
                      title="Duplicate Draft"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDraft(draft.id)}
                      disabled={actionId === draft.id}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs transition-all cursor-pointer disabled:opacity-50"
                      title="Delete Draft"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePublishNow(draft)}
                    disabled={actionId === draft.id}
                    className="px-3 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-blue-600/20"
                  >
                    <Send className="h-3.5 w-3.5" /> Publish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-3 bg-slate-50/60">
          <FileText className="h-10 w-10 text-slate-400" />
          <span className="font-semibold text-slate-800 text-sm">No saved drafts in your library.</span>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            Write a post in the composer and click <strong>Save Draft</strong> to store your work-in-progress content.
          </p>
        </div>
      )}

      {/* Interactive Draft Preview Modal */}
      {previewDraft && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Eye className="h-4 w-4 text-[#0A66C2]" /> LinkedIn Draft Preview
              </div>
              <button
                type="button"
                onClick={() => setPreviewDraft(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 leading-relaxed whitespace-pre-wrap">
                {previewDraft.summary}
              </div>

              {previewDraft.mediaUrl && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Attached Media Asset
                  </span>
                  <MediaPreview mediaUrl={previewDraft.mediaUrl} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setPreviewDraft(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = previewDraft;
                  setPreviewDraft(null);
                  handlePublishNow(d);
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
