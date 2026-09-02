"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Upload,
  X,
  Play,
  Eye,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Link2
} from "lucide-react";
import { MediaPreview } from "./linkedIns/MediaPreview";

export interface MediaAttachment {
  id: string;
  url: string;
  originalName: string;
  size: number;
  extension: string;
  mediaType: "image" | "video" | "document";
  isLinkedInSupported: boolean;
  warning?: string | null;
}

interface LinkedInMediaComposerProps {
  attachments: MediaAttachment[];
  onAttachmentsChange: (attachments: MediaAttachment[]) => void;
}

const FILE_TYPE_CONFIG = {
  image: {
    label: "Image",
    accept: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
    maxSizeMB: 10,
    icon: ImageIcon,
    allowedExts: ["jpg", "jpeg", "png", "webp"]
  },
  video: {
    label: "Video",
    accept: "video/mp4,video/webm,video/mpeg,video/quicktime,video/x-msvideo,.mp4,.mov,.avi,.webm,.mpeg",
    maxSizeMB: 200,
    icon: VideoIcon,
    allowedExts: ["mp4", "mov", "mpeg", "avi", "webm"]
  },
  document: {
    label: "Document",
    accept: "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pdf,.doc,.docx,.ppt,.pptx",
    maxSizeMB: 100,
    icon: FileText,
    allowedExts: ["pdf", "doc", "docx", "ppt", "pptx"]
  }
};

export function validateMedia(
  file: File,
  requestedType?: "image" | "video" | "document" | null
): { valid: boolean; error?: string } {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const mime = (file.type || "").toLowerCase();

  // 1. Explicit Audio Rejection
  const audioExts = ["mp3", "wav", "flac", "aac", "ogg", "m4a", "wma"];
  if (audioExts.includes(ext) || mime.startsWith("audio/")) {
    return {
      valid: false,
      error: `Invalid file type (.${ext})\n\nAudio files are not supported.\n\nSupported formats:\n• MP4\n• MOV\n• AVI\n• WEBM\n• MPEG`
    };
  }

  // 2. Explicit Executable Rejection
  const execExts = ["exe", "bat", "cmd", "sh", "msi", "app", "dmg", "vbs"];
  if (execExts.includes(ext)) {
    return {
      valid: false,
      error: `Security constraint: Executable file type (.${ext}) is not allowed.`
    };
  }

  // 3. Determine target category
  let targetType: "image" | "video" | "document" = "image";
  if (requestedType) {
    targetType = requestedType;
  } else {
    if (FILE_TYPE_CONFIG.image.allowedExts.includes(ext)) targetType = "image";
    else if (FILE_TYPE_CONFIG.video.allowedExts.includes(ext)) targetType = "video";
    else if (FILE_TYPE_CONFIG.document.allowedExts.includes(ext)) targetType = "document";
    else {
      return {
        valid: false,
        error: `Unsupported file type (.${ext}).\n\nOnly Image (JPG, PNG, WEBP), Video (MP4, MOV, AVI, WEBM), and Document (PDF, DOCX, PPTX) uploads are allowed.`
      };
    }
  }

  const config = FILE_TYPE_CONFIG[targetType];

  if (!config.allowedExts.includes(ext)) {
    if (targetType === "video") {
      return {
        valid: false,
        error: `Invalid file type (.${ext})\n\nSupported video formats:\n• MP4\n• MOV\n• AVI\n• WEBM\n• MPEG`
      };
    } else if (targetType === "image") {
      return {
        valid: false,
        error: `Invalid file type (.${ext})\n\nSupported image formats:\n• JPG\n• JPEG\n• PNG\n• WEBP`
      };
    } else {
      return {
        valid: false,
        error: `Invalid file type (.${ext})\n\nSupported document formats:\n• PDF\n• DOC\n• DOCX\n• PPT\n• PPTX`
      };
    }
  }

  const maxSizeBytes = config.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    const formattedSize =
      file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    return {
      valid: false,
      error: `File size (${formattedSize}) exceeds maximum allowed limit of ${config.maxSizeMB}MB for ${config.label} uploads.`
    };
  }

  return { valid: true };
}

export function LinkedInMediaComposer({
  attachments = [],
  onAttachmentsChange
}: LinkedInMediaComposerProps) {
  const [activeUploadType, setActiveUploadType] = useState<"image" | "video" | "document" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const [previewMediaItem, setPreviewMediaItem] = useState<MediaAttachment | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploadTypeRef = useRef<"image" | "video" | "document" | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (ext: string, mediaType: string) => {
    if (mediaType === "image") return ImageIcon;
    if (mediaType === "video") return VideoIcon;
    return FileText;
  };

  const triggerFileInput = (type: "image" | "video" | "document", replaceId?: string) => {
    activeUploadTypeRef.current = type;
    setActiveUploadType(type);
    setReplaceTargetId(replaceId || null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.accept = FILE_TYPE_CONFIG[type].accept;
      fileInputRef.current.click();
    }
  };

  const processUpload = async (files: FileList | File[], typeOverride?: "image" | "video" | "document") => {
    setErrorMsg(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const targetType = typeOverride || activeUploadTypeRef.current || null;

    // Validate all files
    for (const file of fileArray) {
      const validation = validateMedia(file, targetType);
      if (!validation.valid) {
        setErrorMsg(validation.error || `Invalid file: ${file.name}`);
        activeUploadTypeRef.current = null;
        return;
      }
    }

    setUploading(true);
    setUploadProgress(10);

    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const uploadEndpoint = `${backendBaseUrl}/api/linkedin/upload`;

    const newlyUploaded: MediaAttachment[] = [];

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 100);

      // Upload each selected file
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(uploadEndpoint, {
          method: "POST",
          body: formData
        });

        const resText = await res.text();
        let data: any;
        try {
          data = JSON.parse(resText);
        } catch (jsonErr) {
          throw new Error("Server encountered an error while processing media upload.");
        }

        if (res.ok && data.success && data.file) {
          newlyUploaded.push({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            url: data.file.url,
            originalName: data.file.originalName,
            size: data.file.size,
            extension: data.file.extension,
            mediaType: data.file.mediaType,
            isLinkedInSupported: data.file.isLinkedInSupported,
            warning: data.file.warning
          });
        } else {
          const serverError = data.message || data.error || `Upload failed for ${file.name}`;
          setErrorMsg(serverError);
        }
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (newlyUploaded.length > 0) {
        if (replaceTargetId) {
          onAttachmentsChange(
            attachments.map((item) => (item.id === replaceTargetId ? newlyUploaded[0] : item))
          );
        } else {
          onAttachmentsChange([...attachments, ...newlyUploaded]);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Server encountered an unexpected error while processing media.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setReplaceTargetId(null);
        activeUploadTypeRef.current = null;
      }, 300);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUpload(files);
    }
    if (e.target) e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUpload(files);
    }
  };

  const handleRemove = (id: string) => {
    onAttachmentsChange(attachments.filter((item) => item.id !== id));
  };

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [fetchingLink, setFetchingLink] = useState(false);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputUrl.startsWith("http")) {
      setErrorMsg("Please enter a valid URL starting with http:// or https://");
      return;
    }

    setFetchingLink(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/linkedin/link-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl.trim() })
      });
      const data = await res.json();
      if (res.ok && data.preview) {
        const newAttachment: MediaAttachment = {
          id: `att-link-${Date.now()}`,
          url: data.preview.url,
          originalName: data.preview.title || data.preview.domain,
          size: 1024 * 10,
          extension: "link",
          mediaType: "document",
          isLinkedInSupported: true
        };
        onAttachmentsChange([...attachments, newAttachment]);
        setInputUrl("");
        setShowLinkInput(false);
      } else {
        setErrorMsg(data.error || "Failed to fetch link metadata.");
      }
    } catch (err: any) {
      setErrorMsg(`Error extracting link preview: ${err.message}`);
    } finally {
      setFetchingLink(false);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />

      {/* 4 Centered Enterprise Media Upload Cards (Image, Video, Document, Link/Article) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {/* 🖼 Image Card - Blue */}
        <button
          type="button"
          onClick={() => triggerFileInput("image")}
          className="p-3.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 text-blue-900 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-sm group hover:-translate-y-0.5"
        >
          <div className="p-2.5 bg-blue-100 text-[#0A66C2] rounded-xl group-hover:scale-110 transition-transform">
            <ImageIcon className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold">Image</span>
          <span className="text-[10px] text-blue-600 font-medium">JPG, PNG, WEBP</span>
        </button>

        {/* 🎥 Video Card - Purple */}
        <button
          type="button"
          onClick={() => triggerFileInput("video")}
          className="p-3.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200 text-purple-900 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-sm group hover:-translate-y-0.5"
        >
          <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl group-hover:scale-110 transition-transform">
            <VideoIcon className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold">Video</span>
          <span className="text-[10px] text-purple-600 font-medium">MP4, MOV, AVI</span>
        </button>

        {/* 📄 Document Card - Orange */}
        <button
          type="button"
          onClick={() => triggerFileInput("document")}
          className="p-3.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 text-amber-900 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-sm group hover:-translate-y-0.5"
        >
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl group-hover:scale-110 transition-transform">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold">Document</span>
          <span className="text-[10px] text-amber-600 font-medium">PDF, DOCX, PPTX</span>
        </button>

        {/* 🔗 Link / Article Card - Emerald */}
        <button
          type="button"
          onClick={() => setShowLinkInput(!showLinkInput)}
          className="p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-sm group hover:-translate-y-0.5"
        >
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-110 transition-transform">
            <Link2 className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold">Link / Article</span>
          <span className="text-[10px] text-emerald-600 font-medium">Auto-Preview</span>
        </button>
      </div>

      {/* Link Input Bar */}
      {showLinkInput && (
        <div className="max-w-2xl mx-auto p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Link2 className="h-4 w-4 text-emerald-700" /> Attach URL / Article Preview
            </span>
            <button type="button" onClick={() => setShowLinkInput(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLink(e as any);
                }
              }}
              placeholder="https://example.com/blog/my-article"
              className="flex-1 bg-white border border-emerald-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
            />
            <button
              type="button"
              onClick={handleAddLink}
              disabled={fetchingLink || !inputUrl.trim()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {fetchingLink ? "Fetching..." : "Attach Link"}
            </button>
          </div>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all max-w-2xl mx-auto ${isDragOver
            ? "border-[#0A66C2] bg-blue-50/60"
            : "border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-100/50"
          }`}
      >
        <div className="flex flex-col items-center justify-center gap-1.5">
          <Upload className={`h-6 w-6 ${isDragOver ? "text-[#0A66C2] animate-bounce" : "text-slate-400"}`} />
          <p className="text-xs text-slate-700 font-semibold">
            Drag & drop images, videos or documents here
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            Directly stored on ImageKit CDN (JPG, PNG, WEBP, MP4, MOV, PDF up to 200MB)
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="space-y-1 bg-white p-3 rounded-2xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#0A66C2] font-semibold">
            <span>Uploading Attachment...</span>
            <span className="font-mono">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="bg-[#0A66C2] h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-700 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Attachment Previews Grid with Interactive Video Player & Full Previews */}
      {attachments.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              Attached Media ({attachments.length})
            </h4>

            {attachments.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to remove all attached media?")) {
                    onAttachmentsChange([]);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                title="Remove all uploaded media files"
              >
                <Trash2 className="h-3 w-3" /> Remove All ({attachments.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attachments.map((item) => {
              const IconComp = getFileIcon(item.extension, item.mediaType);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-200 rounded-2xl p-3 space-y-3 relative group shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {/* Media Thumbnail / Clickable Play Trigger */}
                    {item.mediaType === "image" ? (
                      <div
                        onClick={() => setPreviewMediaItem(item)}
                        className="relative h-18 w-18 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 cursor-pointer group"
                        title="Click to expand Image"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.originalName} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="h-4 w-4 text-white drop-shadow" />
                        </div>
                      </div>
                    ) : item.mediaType === "video" ? (
                      <div
                        onClick={() => setPreviewMediaItem(item)}
                        className="relative h-18 w-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shrink-0 flex items-center justify-center cursor-pointer group"
                        title="Click to play video"
                      >
                        <video src={item.url} preload="metadata" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                          <div className="h-7 w-7 rounded-full bg-[#0A66C2] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="h-3.5 w-3.5 ml-0.5 fill-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setPreviewMediaItem(item)}
                        className="h-18 w-18 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0 cursor-pointer hover:bg-slate-200/80 transition-colors"
                        title="Click to preview Document"
                      >
                        <IconComp className="h-6 w-6 text-amber-600" />
                        <span className="text-[9px] font-mono font-bold uppercase text-slate-600 mt-0.5">
                          {item.extension}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.originalName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{formatFileSize(item.size)}</p>

                      <div className="flex items-center gap-3 pt-1">
                        {/* Play Video / Open Preview Button */}
                        <button
                          type="button"
                          onClick={() => setPreviewMediaItem(item)}
                          className="text-[11px] text-[#0A66C2] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {item.mediaType === "video" ? (
                            <>
                              <Play className="h-3 w-3 fill-[#0A66C2]" /> Play Video
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3" /> Preview
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => triggerFileInput(item.mediaType as any, item.id)}
                          className="text-[11px] text-slate-600 font-semibold hover:underline cursor-pointer"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="text-[11px] text-red-600 font-semibold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inline Playable Video Player right below thumbnail when video is uploaded */}
                  {item.mediaType === "video" && (
                    <div className="pt-1">
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                        <video
                          src={item.url}
                          controls
                          preload="metadata"
                          className="w-full max-h-[220px] object-contain bg-black"
                        >
                          Your browser does not support HTML5 video streaming.
                        </video>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Full Screen Media Preview Modal */}
      {previewMediaItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-2 rounded-xl bg-blue-50 text-[#0A66C2] font-bold text-xs flex items-center gap-1.5">
                  {previewMediaItem.mediaType === "video" ? <VideoIcon className="h-4 w-4" /> : previewMediaItem.mediaType === "image" ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  {previewMediaItem.mediaType.toUpperCase()}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate">{previewMediaItem.originalName}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMediaItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Media Player Container */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center">
              {previewMediaItem.mediaType === "video" ? (
                <video
                  src={previewMediaItem.url}
                  controls
                  autoPlay
                  className="w-full max-h-[440px] object-contain bg-black"
                >
                  Your browser does not support HTML5 video playback.
                </video>
              ) : previewMediaItem.mediaType === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewMediaItem.url} alt={previewMediaItem.originalName} className="w-full max-h-[440px] object-contain bg-slate-900" />
              ) : (
                <div className="w-full h-[380px] bg-white">
                  <iframe
                    src={`${previewMediaItem.url}#toolbar=0&navpanes=0`}
                    title="Document Preview"
                    className="w-full h-full border-none"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <a
                href={previewMediaItem.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#0A66C2] hover:underline flex items-center gap-1"
              >
                Open in new window <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setPreviewMediaItem(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
