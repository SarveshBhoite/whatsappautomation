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

  const getEffectiveMediaUrl = (): string => {
    if (attachments.length > 0) {
      return attachments[0].url;
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
  };

  const handleSaveDraft = async () => {
    if (!content.trim()) {
      setStatusMessage({ type: "error", text: "Post content is required to save a draft." });
      return;
    }

    setSavingDraft(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/linkedin/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organizationId
        },
        // Task 7: Draft Media Payload
        body: JSON.stringify({ summary: content.trim(), mediaUrl: getEffectiveMediaUrl() || undefined })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: "✅ Draft saved successfully to library!" });
        if (onDraftSaved) onDraftSaved();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to save draft." });
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-400" /> LinkedIn Post Composer
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="px-3 py-1 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/80 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-900/60 transition-all cursor-pointer shadow-sm"
          >
            <Bot className="h-3.5 w-3.5" /> AI Assistant
          </button>
          <button
            type="button"
            onClick={() => setIsScheduling(!isScheduling)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isScheduling ? "bg-amber-600 text-white shadow-md" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> {isScheduling ? "Scheduling Mode" : "Schedule Post"}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showPreview ? "bg-blue-600 text-white shadow-md" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> {showPreview ? "Hide Preview" : "Live Preview"}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-md ${
            statusMessage.type === "success"
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
              : "bg-red-950/40 text-red-300 border-red-800/60"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-200 text-xs">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handlePublish} className="space-y-4">
        {/* Post Text Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Post Content Text *</label>
            <span className={`text-[11px] font-mono font-semibold ${isOverLimit ? "text-red-400" : "text-slate-400"}`}>
              {remainingChars} characters remaining
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to share with your LinkedIn network?"
            rows={4}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-none"
          />
        </div>

        {/* Modern LinkedIn Media Composer Component */}
        <LinkedInMediaComposer
          attachments={attachments}
          onAttachmentsChange={setAttachments}
        />

        {/* Schedule Inputs */}
        {isScheduling && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/80 border border-amber-800/40 rounded-xl">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Target Date *
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required={isScheduling}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Target Time *
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required={isScheduling}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
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
              mediaUrl={mediaUrl}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft || !content.trim()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Bookmark className="h-3.5 w-3.5" /> {savingDraft ? "Saving..." : "Save Draft"}
            </button>
          </div>

          <button
            type="submit"
            disabled={publishing || !content.trim() || isOverLimit}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer ${
              isScheduling
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
            }`}
          >
            {publishing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> {isScheduling ? "Scheduling..." : "Publishing Live..."}
              </>
            ) : isScheduling ? (
              <>
                <Clock className="h-4 w-4" /> Schedule Post
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
