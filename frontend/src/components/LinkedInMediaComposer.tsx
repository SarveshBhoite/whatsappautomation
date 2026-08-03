"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Archive,
  Link2,
  Upload,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  File as FileGenericIcon,
  ExternalLink
} from "lucide-react";

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

  const processUpload = async (file: File, typeOverride?: "image" | "video" | "document") => {
    setErrorMsg(null);
    const targetType = typeOverride || activeUploadTypeRef.current || null;

    const validation = validateMedia(file, targetType);
    if (!validation.valid) {
      setErrorMsg(validation.error || "Invalid file selected.");
      activeUploadTypeRef.current = null;
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 100);

      const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const uploadEndpoint = `${backendBaseUrl}/api/linkedin/upload`;

      const res = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const resText = await res.text();
      let data: any;
      try {
        data = JSON.parse(resText);
      } catch (jsonErr) {
        throw new Error("Server encountered an unexpected error while processing media. Please try again.");
      }

      if (res.ok && data.success && data.file) {
        const newAttachment: MediaAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          url: data.file.url,
          originalName: data.file.originalName,
          size: data.file.size,
          extension: data.file.extension,
          mediaType: data.file.mediaType,
          isLinkedInSupported: data.file.isLinkedInSupported,
          warning: data.file.warning
        };

        if (replaceTargetId) {
          onAttachmentsChange(attachments.map((item) => (item.id === replaceTargetId ? newAttachment : item)));
        } else {
          onAttachmentsChange([...attachments, newAttachment]);
        }
      } else {
        const serverError = data.message || data.error || "File upload failed.";
        setErrorMsg(serverError);
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
    const file = e.target.files?.[0];
    if (file) {
      processUpload(file);
    }
    if (e.target) e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  const handleRemove = (id: string) => {
    onAttachmentsChange(attachments.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4 font-sans">
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

      {/* 3 Centered Enterprise Media Upload Cards (Image, Video, Document) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
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
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all max-w-2xl mx-auto ${
          isDragOver
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

      {/* Attachment Previews Grid */}
      {attachments.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            Attached Media ({attachments.length})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attachments.map((item) => {
              const IconComp = getFileIcon(item.extension, item.mediaType);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2 relative group shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {item.mediaType === "image" ? (
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.originalName} className="h-full w-full object-cover" />
                      </div>
                    ) : item.mediaType === "video" ? (
                      <div className="relative h-16 w-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0 flex items-center justify-center">
                        <video src={item.url} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <VideoIcon className="h-6 w-6 text-white opacity-90" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                        <IconComp className="h-6 w-6 text-slate-600" />
                        <span className="text-[9px] font-mono font-bold uppercase text-slate-500 mt-0.5">
                          {item.extension}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.originalName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{formatFileSize(item.size)}</p>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => triggerFileInput(item.mediaType as any, item.id)}
                          className="text-[10px] text-[#0A66C2] font-semibold hover:underline"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="text-[10px] text-red-600 font-semibold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
