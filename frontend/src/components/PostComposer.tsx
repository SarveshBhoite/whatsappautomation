"use client";

import React, { useState } from "react";
import { Send, RefreshCw, X, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle, Eye, Calendar, Clock, Bookmark, Bot } from "lucide-react";
import { PostPreview } from "./PostPreview";
import { AIAssistantModal } from "./AIAssistantModal";
import { LinkedInMediaComposer, MediaAttachment } from "./LinkedInMediaComposer";

interface PostComposerProps {
  organizationId?: string;
  authorName?: string;
  authorPicture?: string;
  headline?: string;
  draftToEdit?: { id: string; summary: string; mediaUrl?: string | null } | null;
  onPostPublished?: (newPost: any) => void;
  onDraftSaved?: () => void;
  onPostScheduled?: () => void;
}

const MAX_CHARACTERS = 3000;

export function PostComposer({
  organizationId = "demo-org-123",
  authorName = "LinkedIn Member",
  authorPicture = "",
  headline = "LinkedIn Member Profile",
  draftToEdit = null,
  onPostPublished,
  onDraftSaved,
  onPostScheduled
}: PostComposerProps) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [showAiModal, setShowAiModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  React.useEffect(() => {
    if (draftToEdit) {
      setContent(draftToEdit.summary || "");
      setCurrentDraftId(draftToEdit.id);
      if (draftToEdit.mediaUrl && draftToEdit.mediaUrl.trim()) {
        const raw = draftToEdit.mediaUrl.trim();
        setMediaUrl(raw);
        const urls = raw.includes(",") ? raw.split(",").map((u) => u.trim()).filter(Boolean) : [raw];
        const loadedAttachments: MediaAttachment[] = urls.map((u, idx) => {
          const clean = u.split("?")[0].toLowerCase();
          const ext = clean.split(".").pop() || "png";
          let mediaType: "image" | "video" | "document" = "image";
          if (["mp4", "mov", "avi", "webm", "mpeg"].includes(ext) || clean.includes("/video/")) {
            mediaType = "video";
          } else if (["pdf", "doc", "docx", "ppt", "pptx"].includes(ext) || clean.includes("/document/")) {
            mediaType = "document";
          }
          return {
            id: `draft-att-${Date.now()}-${idx}`,
            url: u,
            originalName: u.split("/").pop()?.split("?")[0] || `Attachment ${idx + 1}`,
            size: 1024 * 500,
            extension: ext,
            mediaType,
            isLinkedInSupported: true
          };
        });
        setAttachments(loadedAttachments);
      } else {
        setAttachments([]);
      }
      setStatusMessage({ type: "success", text: "📝 Draft loaded into composer for editing." });
    }
  }, [draftToEdit]);

  const getEffectiveMediaUrl = (): string => {
    if (attachments.length > 0) {
      return attachments.map((a) => a.url).filter(Boolean).join(",");
    }
    return mediaUrl.trim();
  };

  const handleClear = () => {
    setContent("");
    setMediaUrl("");
    setAttachments([]);
    setScheduledDate("");
    setScheduledTime("");
    setIsScheduling(false);
    setStatusMessage(null);
    setCurrentDraftId(null);
  };

  const handleSaveDraft = async () => {
    if (savingDraft) return; // Prevent double click duplicate requests

    if (!content.trim()) {
      setStatusMessage({ type: "error", text: "Post content is required to save a draft." });
      return;
    }

    setSavingDraft(true);
    setStatusMessage(null);

    try {
      const effectiveMedia = getEffectiveMediaUrl() || undefined;

      // If already saved as draft in this session, update it instead of creating a duplicate
      if (currentDraftId) {
        const res = await fetch(`/api/linkedin/draft`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": organizationId
          },
          body: JSON.stringify({
            id: currentDraftId,
            summary: content.trim(),
            mediaUrl: effectiveMedia
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatusMessage({ type: "success", text: "✅ Draft updated successfully in library!" });
          if (onDraftSaved) onDraftSaved();
        } else {
          setStatusMessage({ type: "error", text: data.error || "Failed to update draft." });
        }
      } else {
        // Create new draft once and save draft ID to prevent duplicates on subsequent clicks
        const res = await fetch(`/api/linkedin/draft`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": organizationId
          },
          body: JSON.stringify({
            summary: content.trim(),
            mediaUrl: effectiveMedia
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.draft?.id) {
            setCurrentDraftId(data.draft.id);
          }
          setStatusMessage({ type: "success", text: "✅ Draft saved successfully to library!" });
          if (onDraftSaved) onDraftSaved();
        } else {
          setStatusMessage({ type: "error", text: data.error || "Failed to save draft." });
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Error: ${err.message}` });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!content.trim()) {
      setStatusMessage({ type: "error", text: "Post content text is required." });
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      setStatusMessage({ type: "error", text: "Please select both date and time for scheduling." });
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
    if (isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      setStatusMessage({ type: "error", text: "Scheduled time must be in the future." });
      return;
    }

    setPublishing(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/linkedin/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organizationId
        },
        body: JSON.stringify({
          summary: content.trim(),
          mediaUrl: getEffectiveMediaUrl() || undefined,
          scheduledAt: scheduledAt.toISOString()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: "✅ Post scheduled successfully into queue!" });
        setContent("");
        setMediaUrl("");
        setAttachments([]);
        setScheduledDate("");
        setScheduledTime("");
        setIsScheduling(false);
        if (onPostScheduled) onPostScheduled();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to schedule post." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Network Error: ${err.message}` });
    } finally {
      setPublishing(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (isScheduling) {
      await handleSchedulePost();
      return;
    }

    if (!content.trim()) {
      setStatusMessage({ type: "error", text: "Post content text is required." });
      return;
    }

    if (content.length > MAX_CHARACTERS) {
      setStatusMessage({ type: "error", text: `Post exceeds maximum character limit of ${MAX_CHARACTERS} characters.` });
      return;
    }

    setPublishing(true);

    try {
      const res = await fetch(`/api/linkedin/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organizationId
        },
        body: JSON.stringify({
          text: content.trim(),
          mediaUrl: getEffectiveMediaUrl() || undefined
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: "✅ Post Published Successfully to LinkedIn & saved in CRM database!" });
        const publishedRecord = data.post;
        setContent("");
        setMediaUrl("");
        setAttachments([]);
        if (onPostPublished && publishedRecord) {
          onPostPublished(publishedRecord);
        }
      } else {
        const errorMsg = data.error || data.details || "Failed to publish post to LinkedIn.";
        setStatusMessage({ type: "error", text: `Publish Error: ${errorMsg}` });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Network Error: ${err.message}` });
    } finally {
      setPublishing(false);
    }
  };

  const remainingChars = MAX_CHARACTERS - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 font-sans text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#0A66C2]" /> LinkedIn Post Composer
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0A66C2] border border-blue-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-100 transition-all cursor-pointer shadow-xs"
          >
            <Bot className="h-3.5 w-3.5" /> AI Assistant
          </button>
          <button
            type="button"
            onClick={() => setIsScheduling(!isScheduling)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isScheduling ? "bg-amber-600 border-amber-600 text-white shadow-xs" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> {isScheduling ? "Scheduling Mode" : "Schedule Post"}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showPreview ? "bg-[#0A66C2] border-[#0A66C2] text-white shadow-xs" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> {showPreview ? "Hide Preview" : "Live Preview"}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600 text-xs">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handlePublish} className="space-y-4">
        {/* Post Text Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Post Content Text *</label>
            <span className={`text-[11px] font-mono font-semibold ${isOverLimit ? "text-red-500" : "text-slate-400"}`}>
              {remainingChars} characters remaining
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to share with your LinkedIn network?"
            rows={4}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all resize-none"
          />
        </div>

        {/* Modern LinkedIn Media Composer Component */}
        <LinkedInMediaComposer
          attachments={attachments}
          onAttachmentsChange={setAttachments}
        />

        {/* Schedule Inputs */}
        {isScheduling && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Target Date *
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required={isScheduling}
                className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Target Time *
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required={isScheduling}
                className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Live Preview Display */}
        {showPreview && (
          <div className="pt-2">
            <PostPreview
              authorName={authorName}
              authorPicture={authorPicture}
              headline={headline}
              content={content}
              mediaUrl={getEffectiveMediaUrl()}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft || !content.trim()}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Bookmark className="h-3.5 w-3.5" /> {savingDraft ? "Saving..." : "Save Draft"}
            </button>
          </div>

          <button
            type="submit"
            disabled={publishing || !content.trim() || isOverLimit}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all cursor-pointer ${
              isScheduling
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20"
                : "bg-[#0A66C2] hover:bg-[#084e96] text-white shadow-blue-600/20"
            }`}
          >
            {publishing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Publishing...
              </>
            ) : isScheduling ? (
              <>
                <Calendar className="h-4 w-4" /> Schedule Post
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Publish to LinkedIn
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        organizationId={organizationId}
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApplyContent={(generatedText) => {
          setContent(generatedText);
        }}
      />
    </div>
  );
}
