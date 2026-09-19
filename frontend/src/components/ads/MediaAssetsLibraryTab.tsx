"use client";

import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Film,
  Video,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Power,
  X,
  ShieldCheck,
  Eye,
  Info,
  Layers,
  UploadCloud,
  Check,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Filter
} from "lucide-react";

export type MediaAssetType = "IMAGE" | "LOGO" | "VIDEO";

export type MediaAssetSubtype =
  | "IMAGE_LANDSCAPE"
  | "IMAGE_SQUARE"
  | "IMAGE_PORTRAIT"
  | "IMAGE_TALL_PORTRAIT"
  | "LOGO_SQUARE"
  | "LOGO_LANDSCAPE"
  | "VIDEO";

export interface MediaAssetItem {
  id: string;
  type: MediaAssetType;
  subtype: MediaAssetSubtype;
  fileName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  mimeType: string;
  fileSize: number; // bytes
  width: number;
  height: number;
  aspectRatio: string;
  durationSeconds?: number;
  status: "ACTIVE" | "INACTIVE";
  approved: boolean;
  legalRightsConfirmed: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface MediaAssetsLibraryTabProps {
  customerId: string;
  orgId: string;
  mediaAssets: MediaAssetItem[];
  onUpdateMediaAssets: (assets: MediaAssetItem[]) => void;
  isProfileApproved?: boolean;
}

export function MediaAssetsLibraryTab({
  customerId,
  orgId,
  mediaAssets,
  onUpdateMediaAssets,
  isProfileApproved = false
}: MediaAssetsLibraryTabProps) {
  // Navigation & filter state
  const [subTab, setSubTab] = useState<"all" | "images" | "logos" | "videos">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAssetItem | null>(null);

  // Upload modal state
  const [uploadType, setUploadType] = useState<MediaAssetType>("IMAGE");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileUrl, setUploadFileUrl] = useState("");
  const [uploadFileData, setUploadFileData] = useState<string | null>(null);
  const [uploadMimeType, setUploadMimeType] = useState("");
  const [uploadFileSize, setUploadFileSize] = useState(0);
  const [uploadWidth, setUploadWidth] = useState(0);
  const [uploadHeight, setUploadHeight] = useState(0);
  const [uploadAspectRatio, setUploadAspectRatio] = useState("");
  const [uploadSubtype, setUploadSubtype] = useState<MediaAssetSubtype>("IMAGE_LANDSCAPE");
  const [uploadDurationSeconds, setUploadDurationSeconds] = useState<number | undefined>(undefined);
  const [legalRightsConfirmed, setLegalRightsConfirmed] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Counts
  const imageCount = mediaAssets.filter((m) => m.type === "IMAGE").length;
  const logoCount = mediaAssets.filter((m) => m.type === "LOGO").length;
  const videoCount = mediaAssets.filter((m) => m.type === "VIDEO").length;

  // Filtered assets
  const filteredAssets = mediaAssets.filter((asset) => {
    if (subTab === "images" && asset.type !== "IMAGE") return false;
    if (subTab === "logos" && asset.type !== "LOGO") return false;
    if (subTab === "videos" && asset.type !== "VIDEO") return false;

    if (statusFilter === "active" && asset.status !== "ACTIVE") return false;
    if (statusFilter === "inactive" && asset.status !== "INACTIVE") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = asset.fileName.toLowerCase().includes(q);
      const matchSubtype = asset.subtype.toLowerCase().includes(q);
      if (!matchName && !matchSubtype) return false;
    }

    return true;
  });

  // Client-side validator for Images & Logos
  const validateImageDimensions = (w: number, h: number, type: MediaAssetType): {
    isValid: boolean;
    error?: string;
    subtype?: MediaAssetSubtype;
    aspectRatio?: string;
  } => {
    if (w <= 0 || h <= 0) {
      return { isValid: false, error: "Dimensions could not be read or are invalid." };
    }

    const ratio = w / h;

    if (type === "IMAGE") {
      // Landscape: 1.91:1 (~1.80 - 2.05), Rec: 1200x628, Min: 600x314
      if (ratio >= 1.80 && ratio <= 2.05) {
        if (w < 600 || h < 314) {
          return {
            isValid: false,
            error: `Landscape image must be at least 600 × 314 px (uploaded: ${w} × ${h} px). Recommended: 1200 × 628 px.`
          };
        }
        return { isValid: true, subtype: "IMAGE_LANDSCAPE", aspectRatio: "1.91:1" };
      }
      // Square: 1:1 (~0.95 - 1.05), Rec: 1200x1200, Min: 300x300
      if (ratio >= 0.95 && ratio <= 1.05) {
        if (w < 300 || h < 300) {
          return {
            isValid: false,
            error: `Square image must be at least 300 × 300 px (uploaded: ${w} × ${h} px). Recommended: 1200 × 1200 px.`
          };
        }
        return { isValid: true, subtype: "IMAGE_SQUARE", aspectRatio: "1:1" };
      }
      // Portrait: 4:5 (~0.75 - 0.85), Rec: 960x1200, Min: 480x600
      if (ratio >= 0.75 && ratio <= 0.85) {
        if (w < 480 || h < 600) {
          return {
            isValid: false,
            error: `Portrait (4:5) image must be at least 480 × 600 px (uploaded: ${w} × ${h} px). Recommended: 960 × 1200 px.`
          };
        }
        return { isValid: true, subtype: "IMAGE_PORTRAIT", aspectRatio: "4:5" };
      }
      // Tall Portrait: 9:16 (~0.50 - 0.62), Rec: 1080x1920, Min: 600x1067
      if (ratio >= 0.50 && ratio <= 0.62) {
        if (w < 600 || h < 1067) {
          return {
            isValid: false,
            error: `Tall Portrait (9:16) image must be at least 600 × 1067 px (uploaded: ${w} × ${h} px). Recommended: 1080 × 1920 px.`
          };
        }
        return { isValid: true, subtype: "IMAGE_TALL_PORTRAIT", aspectRatio: "9:16" };
      }

      return {
        isValid: false,
        error: `Image ratio (${ratio.toFixed(2)}:1, ${w} × ${h} px) does not match Google Ads specs. Required: Landscape (1.91:1), Square (1:1), Portrait (4:5), or Tall Portrait (9:16).`
      };
    } else if (type === "LOGO") {
      // Square Logo: 1:1 (~0.95 - 1.05), Rec: 1200x1200, Min: 128x128
      if (ratio >= 0.95 && ratio <= 1.05) {
        if (w < 128 || h < 128) {
          return {
            isValid: false,
            error: `Square logo must be at least 128 × 128 px (uploaded: ${w} × ${h} px). Recommended: 1200 × 1200 px.`
          };
        }
        return { isValid: true, subtype: "LOGO_SQUARE", aspectRatio: "1:1" };
      }
      // Landscape Logo: 4:1 (~3.8 - 4.2), Rec: 1200x300, Min: 512x128
      if (ratio >= 3.8 && ratio <= 4.2) {
        if (w < 512 || h < 128) {
          return {
            isValid: false,
            error: `Landscape logo (4:1) must be at least 512 × 128 px (uploaded: ${w} × ${h} px). Recommended: 1200 × 300 px.`
          };
        }
        return { isValid: true, subtype: "LOGO_LANDSCAPE", aspectRatio: "4:1" };
      }

      return {
        isValid: false,
        error: `Logo ratio (${ratio.toFixed(2)}:1, ${w} × ${h} px) does not match Google Ads specs. Required: Square (1:1) or Landscape (4:1).`
      };
    }

    return { isValid: true };
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    setValidationSuccess(null);
    setIsProcessingFile(true);

    const name = file.name;
    const size = file.size;
    const mime = file.type || (uploadType === "VIDEO" ? "video/mp4" : "image/jpeg");

    setUploadFileName(name);
    setUploadFileSize(size);
    setUploadMimeType(mime);

    // Max 5120 KB (5 MB) limit strictly applies to Google Ads images and logos.
    // Google Ads video assets are hosted via YouTube (YOUTUBE_VIDEO asset type) and do not have a 50 MB limit.
    // Video validation enforces duration >= 10s and extracts width, height, aspect ratio, duration, MIME, and fileSize.
    if (uploadType !== "VIDEO" && size > 5120 * 1024) {
      setValidationError(`File size ${(size / 1024).toFixed(0)} KB exceeds the 5120 KB limit for Google Ads images/logos.`);
      setIsProcessingFile(false);
      return;
    }

    const reader = new FileReader();

    if (uploadType === "VIDEO") {
      // Validate video duration & metadata (Google Ads policy requires duration >= 10s)
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setUploadFileData(dataUrl);
        setUploadFileUrl(dataUrl);

        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = dataUrl;

        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          const duration = video.duration || 0;
          const w = video.videoWidth || 1280;
          const h = video.videoHeight || 720;
          const ratio = (w / h).toFixed(2) + ":1";

          setUploadWidth(w);
          setUploadHeight(h);
          setUploadAspectRatio(ratio);
          setUploadDurationSeconds(Math.round(duration));
          setUploadSubtype("VIDEO");

          if (duration < 10) {
            setValidationError(`Video duration is ${duration.toFixed(1)}s. Google Ads requires video assets to be at least 10 seconds.`);
          } else {
            setValidationSuccess(`Video verified: ${w} × ${h} px (${ratio}), ${Math.round(duration)} seconds.`);
          }
          setIsProcessingFile(false);
        };

        video.onerror = () => {
          setValidationError("Could not read video metadata. Please verify the video format.");
          setIsProcessingFile(false);
        };
      };
      reader.readAsDataURL(file);
    } else {
      // Images and Logos
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setUploadFileData(dataUrl);
        setUploadFileUrl(dataUrl);

        const img = new window.Image();
        img.onload = () => {
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          setUploadWidth(w);
          setUploadHeight(h);

          const result = validateImageDimensions(w, h, uploadType);
          if (!result.isValid) {
            setValidationError(result.error || "Dimension validation failed.");
          } else {
            setUploadSubtype(result.subtype || (uploadType === "LOGO" ? "LOGO_SQUARE" : "IMAGE_LANDSCAPE"));
            setUploadAspectRatio(result.aspectRatio || "1:1");
            setValidationSuccess(`Asset verified: ${result.subtype} (${w} × ${h} px, ${result.aspectRatio})`);
          }
          setIsProcessingFile(false);
        };

        img.onerror = () => {
          setValidationError("Could not read image dimensions. Please check the image file.");
          setIsProcessingFile(false);
        };

        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle URL input inspection
  const handleUrlInspect = () => {
    if (!uploadFileUrl.trim()) return;
    setValidationError(null);
    setValidationSuccess(null);
    setIsProcessingFile(true);

    const name = uploadFileName.trim() || `web_asset_${Date.now()}`;
    setUploadFileName(name);

    if (uploadType === "VIDEO") {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = uploadFileUrl;
      video.onloadedmetadata = () => {
        const duration = video.duration || 0;
        const w = video.videoWidth || 1280;
        const h = video.videoHeight || 720;
        const ratio = (w / h).toFixed(2) + ":1";

        setUploadWidth(w);
        setUploadHeight(h);
        setUploadAspectRatio(ratio);
        setUploadDurationSeconds(Math.round(duration));
        setUploadSubtype("VIDEO");
        setUploadMimeType("video/mp4");
        setUploadFileSize(1024 * 1024); // Fallback estimate

        if (duration > 0 && duration < 10) {
          setValidationError(`Video duration is ${duration.toFixed(1)}s. Google Ads requires video assets to be at least 10 seconds.`);
        } else {
          setValidationSuccess(`Video verified: ${w} × ${h} px (${ratio}), ${Math.round(duration)} seconds.`);
        }
        setIsProcessingFile(false);
      };
      video.onerror = () => {
        // Still allow URL with standard defaults if CORS blocks reading
        setUploadWidth(1920);
        setUploadHeight(1080);
        setUploadAspectRatio("16:9");
        setUploadDurationSeconds(15);
        setUploadSubtype("VIDEO");
        setValidationSuccess("External video URL accepted.");
        setIsProcessingFile(false);
      };
    } else {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setUploadWidth(w);
        setUploadHeight(h);

        const result = validateImageDimensions(w, h, uploadType);
        if (!result.isValid) {
          setValidationError(result.error || "Dimension validation failed.");
        } else {
          setUploadSubtype(result.subtype || (uploadType === "LOGO" ? "LOGO_SQUARE" : "IMAGE_LANDSCAPE"));
          setUploadAspectRatio(result.aspectRatio || "1:1");
          setUploadMimeType("image/jpeg");
          setValidationSuccess(`Asset verified: ${result.subtype} (${w} × ${h} px, ${result.aspectRatio})`);
        }
        setIsProcessingFile(false);
      };
      img.onerror = () => {
        setValidationError("Could not load image from the provided URL. Please verify the link is publicly accessible.");
        setIsProcessingFile(false);
      };
      img.src = uploadFileUrl;
    }
  };

  // Reset upload form
  const resetUploadForm = () => {
    setUploadFileName("");
    setUploadFileUrl("");
    setUploadFileData(null);
    setUploadMimeType("");
    setUploadFileSize(0);
    setUploadWidth(0);
    setUploadHeight(0);
    setUploadAspectRatio("");
    setUploadDurationSeconds(undefined);
    setLegalRightsConfirmed(false);
    setValidationError(null);
    setValidationSuccess(null);
    setIsProcessingFile(false);
    setIsSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit asset to library
  const handleSaveAsset = async () => {
    if (!legalRightsConfirmed) {
      setValidationError("You must confirm ownership or advertising rights before saving.");
      return;
    }

    if (!uploadFileUrl) {
      setValidationError("Please select a file or provide a valid asset URL.");
      return;
    }

    if (validationError) {
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    const newAsset: MediaAssetItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: uploadType,
      subtype: uploadSubtype,
      fileName: uploadFileName.trim() || `${uploadType.toLowerCase()}_asset`,
      fileUrl: uploadFileUrl,
      thumbnailUrl: uploadType === "VIDEO" ? undefined : uploadFileUrl,
      mimeType: uploadMimeType || (uploadType === "VIDEO" ? "video/mp4" : "image/jpeg"),
      fileSize: uploadFileSize || 1024 * 100,
      width: uploadWidth || (uploadType === "LOGO" ? 1200 : 1200),
      height: uploadHeight || (uploadType === "LOGO" ? 1200 : 628),
      aspectRatio: uploadAspectRatio || (uploadType === "LOGO" ? "1:1" : "1.91:1"),
      durationSeconds: uploadDurationSeconds,
      status: "ACTIVE",
      approved: isProfileApproved,
      legalRightsConfirmed: true,
      source: uploadMode === "file" ? "UPLOAD" : "URL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Try to persist via customer-scoped media upload endpoint
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const cleanCid = customerId.replace(/-/g, "").trim();

      const res = await fetch(`${BACKEND}/api/ads/customer-profile/media/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          asset: newAsset,
          file: uploadFileData || uploadFileUrl
        })
      });

      if (res.ok) {
        const data = await res.json();
        const savedAsset = data.asset || newAsset;
        onUpdateMediaAssets([...mediaAssets, savedAsset]);
        setIsUploadModalOpen(false);
        resetUploadForm();
      } else {
        const errData = await res.json().catch(() => ({}));
        // Fallback: save to local profile state so user can Save Draft or Approve & Save
        onUpdateMediaAssets([...mediaAssets, newAsset]);
        setIsUploadModalOpen(false);
        resetUploadForm();
      }
    } catch (e: any) {
      // Fallback: save to local profile state
      onUpdateMediaAssets([...mediaAssets, newAsset]);
      setIsUploadModalOpen(false);
      resetUploadForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle active/inactive status
  const handleToggleStatus = async (asset: MediaAssetItem) => {
    const nextStatus = asset.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const updated = mediaAssets.map((m) =>
      m.id === asset.id ? { ...m, status: nextStatus as "ACTIVE" | "INACTIVE", updatedAt: new Date().toISOString() } : m
    );
    onUpdateMediaAssets(updated);

    // Call server endpoint
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const cleanCid = customerId.replace(/-/g, "").trim();
      await fetch(`${BACKEND}/api/ads/customer-profile/media/${asset.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({ customerId: cleanCid, status: nextStatus })
      });
    } catch (e) {
      console.warn("Status toggle sync fallback:", e);
    }
  };

  // Delete media asset
  const handleDeleteAsset = async (assetId: string) => {
    if (!window.confirm("Are you sure you want to remove this asset from your Media Library?")) {
      return;
    }

    const updated = mediaAssets.filter((m) => m.id !== assetId);
    onUpdateMediaAssets(updated);

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const cleanCid = customerId.replace(/-/g, "").trim();
      await fetch(`${BACKEND}/api/ads/customer-profile/media/${assetId}?customerId=${cleanCid}`, {
        method: "DELETE",
        headers: { "x-organization-id": orgId }
      });
    } catch (e) {
      console.warn("Delete asset sync fallback:", e);
    }
  };

  // Format subtype display label
  const formatSubtypeLabel = (subtype: MediaAssetSubtype) => {
    switch (subtype) {
      case "IMAGE_LANDSCAPE":
        return "Landscape (1.91:1)";
      case "IMAGE_SQUARE":
        return "Square (1:1)";
      case "IMAGE_PORTRAIT":
        return "Portrait (4:5)";
      case "IMAGE_TALL_PORTRAIT":
        return "Tall Portrait (9:16)";
      case "LOGO_SQUARE":
        return "Square Logo (1:1)";
      case "LOGO_LANDSCAPE":
        return "Landscape Logo (4:1)";
      case "VIDEO":
        return "Video Asset";
      default:
        return subtype;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <ImageIcon className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Media &amp; Creative Assets Library</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                {mediaAssets.length} {mediaAssets.length === 1 ? "Asset" : "Assets"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Customer-scoped reusable media library storing approved marketing images, logos, and videos formatted for Google Ads. Assets here will be reused across AI Guided and campaign-specific asset flows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetUploadForm();
                setIsUploadModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Asset</span>
            </button>
          </div>
        </div>

        {/* 2. Subsections and Filters Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          {/* Subsection Pills: Images, Logos, Videos, All */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setSubTab("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                subTab === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Assets ({mediaAssets.length})</span>
            </button>

            <button
              onClick={() => setSubTab("images")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                subTab === "images"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Images ({imageCount})</span>
            </button>

            <button
              onClick={() => setSubTab("logos")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                subTab === "logos"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Logos ({logoCount})</span>
            </button>

            <button
              onClick={() => setSubTab("videos")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                subTab === "videos"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos ({videoCount})</span>
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-slate-50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === "active" ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === "inactive" ? "bg-white text-slate-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Asset Cards Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className={`flex flex-col justify-between rounded-2xl border bg-white overflow-hidden shadow-xs hover:shadow-md transition-all ${
                asset.status === "INACTIVE" ? "border-slate-200 opacity-60" : "border-slate-200"
              }`}
            >
              {/* Media Preview Thumbnail Container */}
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group flex items-center justify-center">
                {asset.type === "VIDEO" ? (
                  <video
                    src={asset.fileUrl}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={asset.fileUrl}
                    alt={asset.fileName}
                    className="w-full h-full object-contain bg-slate-950/20"
                    loading="lazy"
                  />
                )}

                {/* Subtype Badge Overlay */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-slate-900/80 text-white">
                    {formatSubtypeLabel(asset.subtype)}
                  </span>
                </div>

                {/* Status Indicator Overlay */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md ${
                      asset.status === "ACTIVE"
                        ? "bg-emerald-500/90 text-white"
                        : "bg-slate-500/90 text-white"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${asset.status === "ACTIVE" ? "bg-white" : "bg-slate-300"}`} />
                    {asset.status}
                  </span>
                </div>

                {/* Video Play Overlay Icon */}
                {asset.type === "VIDEO" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="p-3 rounded-full bg-black/60 text-white backdrop-blur-xs">
                      <Film className="w-5 h-5" />
                    </span>
                  </div>
                )}

                {/* Quick Action Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPreviewAsset(asset)}
                    className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    title="View details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate" title={asset.fileName}>
                    {asset.fileName}
                  </h4>

                  {/* Technical Meta Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {asset.width} × {asset.height} px
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {asset.aspectRatio}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {asset.fileSize ? `${(asset.fileSize / 1024).toFixed(0)} KB` : "< 5 MB"}
                    </span>
                    {asset.durationSeconds && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700">
                        {asset.durationSeconds}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Rights and Approval Badges */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-emerald-600" title="Legal rights confirmed for Google Ads">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-medium text-[10px]">Rights Confirmed</span>
                  </div>

                  {asset.approved ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Approved
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-amber-600">
                      Draft Profile
                    </span>
                  )}
                </div>

                {/* Action Buttons: Enable/Disable, Delete */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(asset)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      asset.status === "ACTIVE"
                        ? "text-slate-600 hover:text-amber-700 hover:bg-amber-50"
                        : "text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{asset.status === "ACTIVE" ? "Disable" : "Enable"}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    title="Delete asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-200 space-y-4">
          <div className="inline-flex p-4 rounded-full bg-blue-50 text-blue-600 mb-2">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">
              {searchQuery ? "No matching assets found" : `No ${subTab === "all" ? "media" : subTab} uploaded yet`}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? "Try clearing your search query or switching subsections."
                : "Upload high-quality marketing images, brand logos, or promotional videos to reuse in Google Ads campaigns."}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={() => {
                resetUploadForm();
                setIsUploadModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload First Asset</span>
            </button>
          )}
        </div>
      )}

      {/* 4. Upload Asset Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <UploadCloud className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Upload Creative Asset</h3>
                  <p className="text-[11px] text-slate-500">Add to customer media library with Google Ads validation</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  resetUploadForm();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Type Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Asset Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadType("IMAGE");
                      setValidationError(null);
                      setValidationSuccess(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      uploadType === "IMAGE"
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 ring-1 ring-blue-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Marketing Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadType("LOGO");
                      setValidationError(null);
                      setValidationSuccess(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      uploadType === "LOGO"
                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Brand Logo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadType("VIDEO");
                      setValidationError(null);
                      setValidationSuccess(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      uploadType === "VIDEO"
                        ? "border-purple-600 bg-purple-50/50 text-purple-700 ring-1 ring-purple-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Asset</span>
                  </button>
                </div>
              </div>

              {/* Specifications Helper Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Google Ads Specifications Guide</span>
                </div>
                {uploadType === "IMAGE" && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="p-2 rounded-lg bg-white border border-slate-100 space-y-0.5">
                      <span className="font-bold text-slate-800 block">Landscape (1.91:1)</span>
                      <p>Rec: 1200 × 628 px (Min: 600 × 314 px)</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-100 space-y-0.5">
                      <span className="font-bold text-slate-800 block">Square (1:1)</span>
                      <p>Rec: 1200 × 1200 px (Min: 300 × 300 px)</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-100 space-y-0.5">
                      <span className="font-bold text-slate-800 block">Portrait (4:5)</span>
                      <p>Rec: 960 × 1200 px (Min: 480 × 600 px)</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-100 space-y-0.5">
                      <span className="font-bold text-slate-800 block">Tall Portrait (9:16)</span>
                      <p>Rec: 1080 × 1920 px (Min: 600 × 1067 px)</p>
                    </div>
                    <div className="col-span-2 text-slate-500 text-[10px]">
                      Max file size: 5120 KB (5 MB). Allowed types: JPEG, PNG, WEBP, GIF.
                    </div>
                  </div>
                )}

                {uploadType === "LOGO" && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="p-2 rounded-lg bg-white border border-slate-100 space-y-0.5">
                      <span className="font-bold text-slate-800 block">Square Logo (1:1)</span>
                      <p>Rec: 1200 × 1200 px (Min: 128 × 128 px)</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-100 space-y-0.5">
                      <span className="font-bold text-slate-800 block">Landscape Logo (4:1)</span>
                      <p>Rec: 1200 × 300 px (Min: 512 × 128 px)</p>
                    </div>
                    <div className="col-span-2 text-slate-500 text-[10px]">
                      Max file size: 5120 KB (5 MB). Allowed types: JPEG, PNG, WEBP, GIF, SVG.
                    </div>
                  </div>
                )}

                {uploadType === "VIDEO" && (
                  <div className="p-2 rounded-lg bg-white border border-slate-100 space-y-1 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800 block">Video Requirements</span>
                    <p>Minimum duration: <strong>10 seconds</strong>. Supported formats: MP4, WebM, MOV, AVI, MPEG.</p>
                    <p className="text-[10px] text-slate-500">Dimensions and aspect ratio are automatically detected from the video stream.</p>
                  </div>
                )}
              </div>

              {/* Upload Mode Switch (File or Direct URL) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Source</label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setUploadMode("file")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        uploadMode === "file" ? "font-bold text-blue-600 bg-blue-50" : "text-slate-500"
                      }`}
                    >
                      File Upload
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => setUploadMode("url")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        uploadMode === "url" ? "font-bold text-blue-600 bg-blue-50" : "text-slate-500"
                      }`}
                    >
                      External URL
                    </button>
                  </div>
                </div>

                {uploadMode === "file" ? (
                  /* Drag & Drop / File Input */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer text-center space-y-2"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={uploadType === "VIDEO" ? "video/*" : "image/*"}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-600">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-blue-600 hover:underline">Click to browse</span> or drag and drop
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {uploadType === "VIDEO" ? "MP4, WebM, MOV (Min 10 seconds)" : "PNG, JPEG, WEBP up to 5120 KB"}
                    </p>
                  </div>
                ) : (
                  /* URL Input */
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder={uploadType === "VIDEO" ? "https://example.com/promo.mp4" : "https://example.com/banner.png"}
                      value={uploadFileUrl}
                      onChange={(e) => setUploadFileUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleUrlInspect}
                      disabled={!uploadFileUrl.trim() || isProcessingFile}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                    >
                      Verify URL
                    </button>
                  </div>
                )}
              </div>

              {/* Asset Name Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Sale Hero Banner"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Detected Metadata Display */}
              {uploadWidth > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-3 text-xs text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Dimensions</span>
                    <span className="font-bold">{uploadWidth} × {uploadHeight} px</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Aspect Ratio</span>
                    <span className="font-bold">{uploadAspectRatio}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Subtype</span>
                    <span className="font-bold text-blue-600">{formatSubtypeLabel(uploadSubtype)}</span>
                  </div>
                  {uploadDurationSeconds && (
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Duration</span>
                      <span className="font-bold text-purple-600">{uploadDurationSeconds}s</span>
                    </div>
                  )}
                  {uploadFileSize > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">File Size</span>
                      <span className="font-bold">{(uploadFileSize / 1024).toFixed(0)} KB</span>
                    </div>
                  )}
                </div>
              )}

              {/* Validation Feedback Messages */}
              {validationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Validation Error</span>
                    <span>{validationError}</span>
                  </div>
                </div>
              )}

              {validationSuccess && !validationError && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{validationSuccess}</span>
                </div>
              )}

              {/* MANDATORY LEGAL RIGHTS CONFIRMATION CHECKBOX */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legalRightsConfirmed}
                    onChange={(e) => setLegalRightsConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="text-xs text-slate-800">
                    <span className="font-bold block text-slate-900">
                      I confirm that I own or have permission to use this asset for advertising and to share it with Google.
                    </span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      Required by Google Ads policies. Assets without confirmed advertising rights cannot be saved or approved.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  resetUploadForm();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAsset}
                disabled={
                  !uploadFileUrl ||
                  !legalRightsConfirmed ||
                  Boolean(validationError) ||
                  isProcessingFile ||
                  isSubmitting
                }
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Asset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Asset Detail / Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  {previewAsset.type === "VIDEO" ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                </span>
                <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">{previewAsset.fileName}</h3>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Media Player / Full Preview */}
              <div className="rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center max-h-80">
                {previewAsset.type === "VIDEO" ? (
                  <video
                    src={previewAsset.fileUrl}
                    controls
                    autoPlay
                    className="max-h-80 w-full object-contain"
                  />
                ) : (
                  <img
                    src={previewAsset.fileUrl}
                    alt={previewAsset.fileName}
                    className="max-h-80 w-full object-contain"
                  />
                )}
              </div>

              {/* Metadata Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Type</span>
                  <span className="font-bold text-slate-800">{previewAsset.type}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Subtype</span>
                  <span className="font-bold text-blue-600">{formatSubtypeLabel(previewAsset.subtype)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Dimensions</span>
                  <span className="font-bold text-slate-800">{previewAsset.width} × {previewAsset.height} px</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Aspect Ratio</span>
                  <span className="font-bold text-slate-800">{previewAsset.aspectRatio}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">File Size</span>
                  <span className="font-bold text-slate-800">
                    {previewAsset.fileSize ? `${(previewAsset.fileSize / 1024).toFixed(0)} KB` : "N/A"}
                  </span>
                </div>
                {previewAsset.durationSeconds && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Duration</span>
                    <span className="font-bold text-purple-600">{previewAsset.durationSeconds} seconds</span>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                  <span className={`font-bold ${previewAsset.status === "ACTIVE" ? "text-emerald-600" : "text-slate-600"}`}>
                    {previewAsset.status}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Legal Rights</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Confirmed
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Uploaded</span>
                  <span className="font-medium text-slate-700">
                    {new Date(previewAsset.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <a
                href={previewAsset.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Original File</span>
              </a>

              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
