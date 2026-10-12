"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  FolderTree,
  FileText,
  Tag,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
  PlayCircle,
  Video,
  DollarSign,
  Gift,
  MessageCircle,
  Smartphone,
  Eye,
  X,
  Maximize2,
  CheckCircle2,
  Clock,
  Globe,
  Link2,
  AlertCircle,
  HelpCircle,
  Copy,
  Plus
} from "lucide-react";

// ── Types & Interfaces ────────────────────────────────────────────────────────

export interface AdMediaItem {
  id?: string;
  name?: string;
  url?: string;
  data?: string;
  fieldType?: string;
  aspectRatio?: string;
  dimensions?: { width: number; height: number };
}

export interface AdMediaGroup {
  images: Array<string | AdMediaItem>;
  logos: Array<string | AdMediaItem>;
  videos: Array<string | AdMediaItem>;
}

export interface AdAssetsGroup {
  callouts?: string[];
  sitelinks?: Array<{
    text?: string;
    linkText?: string;
    desc1?: string;
    desc2?: string;
    finalUrl?: string;
    url?: string;
  }>;
  promotions?: Array<{
    promotionTarget?: string;
    description?: string;
    finalUrl?: string;
    percentOff?: number;
    moneyAmountOff?: number;
    currencyCode?: string;
    promotionCode?: string;
  }>;
  leadForms?: Array<{
    businessName?: string;
    headline?: string;
    description?: string;
    privacyPolicyUrl?: string;
  }>;
  structuredSnippets?: Array<{
    header?: string;
    values?: string[];
  }>;
  messages?: Array<{
    platform?: string;
    messageText?: string;
    text?: string;
    starterMessage?: string;
  }>;
  priceAssets?: Array<{
    header?: string;
    description?: string;
    amount?: number | string;
    currencyCode?: string;
    finalUrl?: string;
  }>;
}

export interface NormalizedAd {
  id: string;
  name: string;
  adType: string;
  status: "ENABLED" | "PAUSED" | "REMOVED" | string;
  finalUrl: string;
  path1: string;
  path2: string;
  headlines: string[];
  descriptions: string[];
  adStrength?: string;
  media: AdMediaGroup;
  assets: AdAssetsGroup;
  raw?: any;
}

export interface NormalizedAdGroup {
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED" | string;
  cpcBid: number | string | null;
  type?: string;
  keywords: string[];
  negativeKeywords: string[];
  ads: NormalizedAd[];
  raw?: any;
}

export interface NormalizedCampaignHierarchy {
  campaignType: string;
  advertisingChannelType?: string;
  adGroups: NormalizedAdGroup[];
  hasAssetGroups?: boolean;
  assetGroups?: any[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const norm = (status || "ENABLED").toUpperCase();
  if (norm === "ENABLED" || norm === "ACTIVE") {
    return {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      label: "ENABLED"
    };
  }
  if (norm === "PAUSED") {
    return {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      label: "PAUSED"
    };
  }
  if (norm === "REMOVED") {
    return {
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
      label: "REMOVED"
    };
  }
  return {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    label: norm
  };
}

function formatCpcBid(cpcBid: number | string | null | undefined): string {
  if (cpcBid === null || cpcBid === undefined || cpcBid === "") return "Not configured";
  const num = Number(cpcBid);
  if (isNaN(num)) return String(cpcBid);
  return `₹${num.toFixed(2)}`;
}

function isValidHttpUrl(string?: string): boolean {
  if (!string || typeof string !== "string") return false;
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function getMediaUrl(item: string | AdMediaItem | undefined): string | null {
  if (!item) return null;
  if (typeof item === "string") return item;
  if (item.url) return item.url;
  if (item.data) return item.data;
  return null;
}

function getMediaName(item: string | AdMediaItem | undefined, fallback: string): string {
  if (!item) return fallback;
  if (typeof item === "object" && item.name) return item.name;
  if (typeof item === "string") {
    const parts = item.split("/").pop();
    if (parts && parts.length < 30) return parts;
  }
  return fallback;
}

// ── Data Normalization Layer ──────────────────────────────────────────────────

export function normalizeCampaignHierarchy(campaign: any): NormalizedCampaignHierarchy {
  if (!campaign) {
    return { campaignType: "SEARCH", adGroups: [] };
  }

  const campaignType = (
    campaign.campaignType ||
    campaign.advertisingChannelType ||
    campaign.live?.channelType ||
    "SEARCH"
  ).toUpperCase();

  // Campaign-level asset fallback
  const campCallouts: string[] = Array.isArray(campaign.callouts)
    ? campaign.callouts
    : Array.isArray(campaign.geoTargets?.callouts)
    ? campaign.geoTargets.callouts
    : [];

  const campSitelinks = Array.isArray(campaign.sitelinks)
    ? campaign.sitelinks
    : Array.isArray(campaign.geoTargets?.sitelinks)
    ? campaign.geoTargets.sitelinks
    : [];

  const campPromotions = Array.isArray(campaign.promotions)
    ? campaign.promotions
    : Array.isArray(campaign.geoTargets?.promotions)
    ? campaign.geoTargets.promotions
    : [];

  const campLeadForms = Array.isArray(campaign.leadForms)
    ? campaign.leadForms
    : Array.isArray(campaign.geoTargets?.leadForms)
    ? campaign.geoTargets.leadForms
    : [];

  const campStructuredSnippets = Array.isArray(campaign.structuredSnippets)
    ? campaign.structuredSnippets
    : Array.isArray(campaign.geoTargets?.structuredSnippets)
    ? campaign.geoTargets.structuredSnippets
    : [];

  const campMessages = Array.isArray(campaign.messages)
    ? campaign.messages
    : Array.isArray(campaign.geoTargets?.messages)
    ? campaign.geoTargets.messages
    : [];

  const campPrices = Array.isArray(campaign.prices)
    ? campaign.prices
    : Array.isArray(campaign.geoTargets?.prices)
    ? campaign.geoTargets.prices
    : [];

  const campImages: any[] = Array.isArray(campaign.images) ? campaign.images : [];
  const campLogos: any[] = Array.isArray(campaign.logos) ? campaign.logos : [];
  const campVideos: any[] = Array.isArray(campaign.videos) ? campaign.videos : [];

  // Extract ad groups from geoTargets.adGroups OR top-level adGroups OR liveAdGroups
  const rawAdGroups: any[] =
    (Array.isArray(campaign.geoTargets?.adGroups) && campaign.geoTargets.adGroups.length > 0)
      ? campaign.geoTargets.adGroups
      : (Array.isArray(campaign.adGroups) && campaign.adGroups.length > 0)
      ? campaign.adGroups
      : (Array.isArray(campaign.liveAdGroups) && campaign.liveAdGroups.length > 0)
      ? campaign.liveAdGroups
      : [];

  const liveKeywords: any[] = Array.isArray(campaign.liveKeywords) ? campaign.liveKeywords : [];
  const liveAds: any[] = Array.isArray(campaign.liveAds) ? campaign.liveAds : [];

  const normalizedAdGroups: NormalizedAdGroup[] = [];

  if (rawAdGroups.length > 0) {
    rawAdGroups.forEach((ag: any, agIdx: number) => {
      const agId = String(ag.id || ag.adGroupId || `ag-${agIdx + 1}`);
      const agName = ag.name || `Ad Group ${agIdx + 1}`;
      const agStatus = ag.status || "ENABLED";
      const agCpcBid =
        ag.cpcBid !== undefined && ag.cpcBid !== null
          ? ag.cpcBid
          : ag.cpcBidMicros
          ? Number(ag.cpcBidMicros) / 1_000_000
          : null;

      // Group-level keywords
      let agKeywords: string[] = [];
      if (Array.isArray(ag.keywords) && ag.keywords.length > 0) {
        agKeywords = ag.keywords.map((k: any) => (typeof k === "string" ? k : k.text || String(k)));
      } else {
        const matchingLiveKw = liveKeywords.filter(
          (k: any) => String(k.adGroupId) === agId || !k.adGroupId
        );
        if (matchingLiveKw.length > 0) {
          agKeywords = matchingLiveKw.map((k: any) => k.text || String(k));
        } else if (agIdx === 0 && Array.isArray(campaign.keywords)) {
          agKeywords = campaign.keywords.map((k: any) => (typeof k === "string" ? k : k.text || String(k)));
        }
      }

      // Group-level negative keywords
      const agNegativeKeywords: string[] = Array.isArray(ag.negativeKeywords)
        ? ag.negativeKeywords.map((k: any) => (typeof k === "string" ? k : k.text || String(k)))
        : Array.isArray(campaign.negativeKeywords) && agIdx === 0
        ? campaign.negativeKeywords.map((k: any) => (typeof k === "string" ? k : k.text || String(k)))
        : [];

      // Group-level assets
      const agCallouts = Array.isArray(ag.callouts) ? ag.callouts : campCallouts;
      const agSitelinks = Array.isArray(ag.sitelinks) ? ag.sitelinks : campSitelinks;
      const agPromotions = Array.isArray(ag.promotions) ? ag.promotions : campPromotions;
      const agLeadForms = Array.isArray(ag.leadForms) ? ag.leadForms : campLeadForms;
      const agStructuredSnippets = Array.isArray(ag.structuredSnippets) ? ag.structuredSnippets : campStructuredSnippets;
      const agMessages = Array.isArray(ag.messages) ? ag.messages : campMessages;
      const agPrices = Array.isArray(ag.prices) ? ag.prices : campPrices;

      // Ads in this Ad Group
      let rawAds: any[] = [];
      if (Array.isArray(ag.ads) && ag.ads.length > 0) {
        rawAds = ag.ads;
      } else {
        const matchingLiveAds = liveAds.filter(
          (a: any) => String(a.adGroupId) === agId || !a.adGroupId
        );
        if (matchingLiveAds.length > 0) {
          rawAds = matchingLiveAds;
        }
      }

      // If no ads found for this group, synthesize one from campaign top-level fields
      if (rawAds.length === 0) {
        rawAds = [
          {
            id: `ad-${agIdx + 1}-1`,
            name: `${agName} Ad 1`,
            status: agStatus,
            adType: campaignType === "DISPLAY" ? "RESPONSIVE_DISPLAY_AD" : "RESPONSIVE_SEARCH_AD",
            finalUrl: campaign.finalUrl || "",
            path1: campaign.displayPath1 || campaign.path1 || "",
            path2: campaign.displayPath2 || campaign.path2 || "",
            headlines: campaign.headlines || [],
            descriptions: campaign.descriptions || []
          }
        ];
      }

      const normalizedAds: NormalizedAd[] = rawAds.map((ad: any, adIdx: number) => {
        const adId = String(ad.id || `ad-${agIdx + 1}-${adIdx + 1}`);
        const adName = ad.name || `Ad ${adIdx + 1}`;
        const adStatus = ad.status || "ENABLED";
        const adType =
          ad.type ||
          ad.adType ||
          (campaignType === "DISPLAY" ? "RESPONSIVE_DISPLAY_AD" : "RESPONSIVE_SEARCH_AD");

        const finalUrl =
          ad.finalUrl ||
          (Array.isArray(ad.finalUrls) ? ad.finalUrls[0] : "") ||
          campaign.finalUrl ||
          "";

        const path1 = ad.path1 || ad.displayPath1 || campaign.displayPath1 || campaign.path1 || "";
        const path2 = ad.path2 || ad.displayPath2 || campaign.displayPath2 || campaign.path2 || "";

        // Extract and deduplicate headlines safely
        let headlinesList: string[] = [];
        if (Array.isArray(ad.headlines) && ad.headlines.length > 0) {
          headlinesList = ad.headlines.map((h: any) => (typeof h === "string" ? h : h.text || ""));
        } else if (Array.isArray(ad.responsiveSearchAd?.headlines)) {
          headlinesList = ad.responsiveSearchAd.headlines.map((h: any) => (typeof h === "string" ? h : h.text || ""));
        } else if (Array.isArray(campaign.headlines)) {
          headlinesList = campaign.headlines.map((h: any) => (typeof h === "string" ? h : h.text || ""));
        }
        // Filter empty strings and deduplicate
        const uniqueHeadlines = Array.from(new Set(headlinesList.filter(h => h && h.trim().length > 0)));

        // Extract and deduplicate descriptions safely
        let descriptionsList: string[] = [];
        if (Array.isArray(ad.descriptions) && ad.descriptions.length > 0) {
          descriptionsList = ad.descriptions.map((d: any) => (typeof d === "string" ? d : d.text || ""));
        } else if (Array.isArray(ad.responsiveSearchAd?.descriptions)) {
          descriptionsList = ad.responsiveSearchAd.descriptions.map((d: any) => (typeof d === "string" ? d : d.text || ""));
        } else if (Array.isArray(campaign.descriptions)) {
          descriptionsList = campaign.descriptions.map((d: any) => (typeof d === "string" ? d : d.text || ""));
        }
        const uniqueDescriptions = Array.from(new Set(descriptionsList.filter(d => d && d.trim().length > 0)));

        // Extract Media safely (Images, Logos, Videos)
        const adImages = Array.isArray(ad.images) && ad.images.length > 0 ? ad.images : (adIdx === 0 ? campImages : []);
        const adLogos = Array.isArray(ad.logos) && ad.logos.length > 0 ? ad.logos : (adIdx === 0 ? campLogos : []);
        const adVideos = Array.isArray(ad.videos) && ad.videos.length > 0 ? ad.videos : (adIdx === 0 ? campVideos : []);

        // Ad Assets
        const adAssets: AdAssetsGroup = {
          callouts: Array.isArray(ad.callouts) && ad.callouts.length > 0 ? ad.callouts : agCallouts,
          sitelinks: Array.isArray(ad.sitelinks) && ad.sitelinks.length > 0 ? ad.sitelinks : agSitelinks,
          promotions: Array.isArray(ad.promotions) && ad.promotions.length > 0 ? ad.promotions : agPromotions,
          leadForms: Array.isArray(ad.leadForms) && ad.leadForms.length > 0 ? ad.leadForms : agLeadForms,
          structuredSnippets: Array.isArray(ad.structuredSnippets) && ad.structuredSnippets.length > 0 ? ad.structuredSnippets : agStructuredSnippets,
          messages: Array.isArray(ad.messages) && ad.messages.length > 0 ? ad.messages : agMessages,
          priceAssets: Array.isArray(ad.prices) && ad.prices.length > 0 ? ad.prices : agPrices
        };

        return {
          id: adId,
          name: adName,
          adType,
          status: adStatus,
          finalUrl,
          path1,
          path2,
          headlines: uniqueHeadlines,
          descriptions: uniqueDescriptions,
          adStrength: ad.adStrength,
          media: {
            images: adImages,
            logos: adLogos,
            videos: adVideos
          },
          assets: adAssets,
          raw: ad
        };
      });

      normalizedAdGroups.push({
        id: agId,
        name: agName,
        status: agStatus,
        cpcBid: agCpcBid,
        type: ag.type,
        keywords: agKeywords,
        negativeKeywords: agNegativeKeywords,
        ads: normalizedAds,
        raw: ag
      });
    });
  } else {
    // Fallback if no ad groups array was found in the campaign JSON:
    // Synthesize a primary Ad Group with available campaign-level headlines, descriptions, keywords & ads
    const defaultAgName = campaign.adGroupName || `${campaign.name || "Campaign"} Ad Group 1`;
    const defaultCpcBid = campaign.adGroupBid || campaign.cpcBid || null;

    let keywordsList: string[] = [];
    if (Array.isArray(campaign.keywords) && campaign.keywords.length > 0) {
      keywordsList = campaign.keywords.map((k: any) => (typeof k === "string" ? k : k.text || String(k)));
    } else if (liveKeywords.length > 0) {
      keywordsList = liveKeywords.map((k: any) => k.text || String(k));
    }

    const negativeKeywordsList: string[] = Array.isArray(campaign.negativeKeywords)
      ? campaign.negativeKeywords.map((k: any) => (typeof k === "string" ? k : k.text || String(k)))
      : [];

    // Extract headlines & descriptions
    const rawHeadlines: string[] = Array.isArray(campaign.headlines)
      ? campaign.headlines.map((h: any) => (typeof h === "string" ? h : h.text || ""))
      : (liveAds[0]?.headlines || []);
    const uniqueHeadlines: string[] = Array.from(new Set(rawHeadlines.filter((h: any) => h && String(h).trim().length > 0)));

    const rawDescriptions: string[] = Array.isArray(campaign.descriptions)
      ? campaign.descriptions.map((d: any) => (typeof d === "string" ? d : d.text || ""))
      : (liveAds[0]?.descriptions || []);
    const uniqueDescriptions: string[] = Array.from(new Set(rawDescriptions.filter((d: any) => d && String(d).trim().length > 0)));

    const singleAd: NormalizedAd = {
      id: liveAds[0]?.id || "ad-1",
      name: liveAds[0]?.name || "Responsive Search Ad 1",
      adType: liveAds[0]?.type || (campaignType === "DISPLAY" ? "RESPONSIVE_DISPLAY_AD" : "RESPONSIVE_SEARCH_AD"),
      status: liveAds[0]?.status || campaign.status || "ENABLED",
      finalUrl: campaign.finalUrl || liveAds[0]?.finalUrls?.[0] || "",
      path1: campaign.displayPath1 || campaign.path1 || liveAds[0]?.path1 || "",
      path2: campaign.displayPath2 || campaign.path2 || liveAds[0]?.path2 || "",
      headlines: uniqueHeadlines,
      descriptions: uniqueDescriptions,
      adStrength: liveAds[0]?.adStrength,
      media: {
        images: campImages,
        logos: campLogos,
        videos: campVideos
      },
      assets: {
        callouts: campCallouts,
        sitelinks: campSitelinks,
        promotions: campPromotions,
        leadForms: campLeadForms,
        structuredSnippets: campStructuredSnippets,
        messages: campMessages,
        priceAssets: campPrices
      }
    };

    normalizedAdGroups.push({
      id: "ag-1",
      name: defaultAgName,
      status: campaign.status || "ENABLED",
      cpcBid: defaultCpcBid,
      keywords: keywordsList,
      negativeKeywords: negativeKeywordsList,
      ads: [singleAd]
    });
  }

  return {
    campaignType,
    advertisingChannelType: campaign.advertisingChannelType,
    adGroups: normalizedAdGroups,
    hasAssetGroups: Array.isArray(campaign.liveAssetGroups) && campaign.liveAssetGroups.length > 0,
    assetGroups: campaign.liveAssetGroups || []
  };
}

// ── Reusable Lightbox / Media Viewer Modal ─────────────────────────────────────

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string | null;
  mediaType: "image" | "logo" | "video";
  title?: string;
}

export const MediaPreviewModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  title
}) => {
  if (!isOpen || !mediaUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-2 text-white text-xs font-bold truncate">
            {mediaType === "image" && <ImageIcon className="h-4 w-4 text-blue-400" />}
            {mediaType === "logo" && <Sparkles className="h-4 w-4 text-amber-400" />}
            {mediaType === "video" && <PlayCircle className="h-4 w-4 text-rose-400" />}
            <span className="truncate">{title || "Media Preview"}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 flex items-center justify-center min-h-[260px] max-h-[70vh] bg-slate-950 overflow-auto">
          {mediaType === "video" ? (
            <div className="w-full flex flex-col items-center justify-center gap-3">
              {mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be") ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-800">
                  <iframe
                    src={
                      mediaUrl.includes("watch?v=")
                        ? mediaUrl.replace("watch?v=", "embed/")
                        : mediaUrl
                    }
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  src={mediaUrl}
                  controls
                  className="max-h-[60vh] max-w-full rounded-xl object-contain border border-slate-800"
                >
                  Your browser does not support video playback.
                </video>
              )}
            </div>
          ) : (
            <img
              src={mediaUrl}
              alt={title || "Preview"}
              className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
            />
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px] truncate max-w-[70%]">{mediaUrl}</span>
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold"
          >
            <span>Open Link</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

// ── Reusable Individual AdDetailsCard Component ───────────────────────────────

export interface AdDetailsCardProps {
  ad: NormalizedAd;
  adIndex: number;
  totalAdsInGroup: number;
}

export const AdDetailsCard: React.FC<AdDetailsCardProps> = ({
  ad,
  adIndex,
  totalAdsInGroup
}) => {
  const [activeMediaModal, setActiveMediaModal] = useState<{
    url: string;
    type: "image" | "logo" | "video";
    title?: string;
  } | null>(null);

  const statusBadge = getStatusBadge(ad.status);
  const isValidUrl = isValidHttpUrl(ad.finalUrl);

  const totalImages = ad.media.images.length;
  const totalLogos = ad.media.logos.length;
  const totalVideos = ad.media.videos.length;
  const hasAnyMedia = totalImages > 0 || totalLogos > 0 || totalVideos > 0;

  const hasCallouts = ad.assets.callouts && ad.assets.callouts.length > 0;
  const hasSitelinks = ad.assets.sitelinks && ad.assets.sitelinks.length > 0;
  const hasPromotions = ad.assets.promotions && ad.assets.promotions.length > 0;
  const hasLeadForms = ad.assets.leadForms && ad.assets.leadForms.length > 0;
  const hasSnippets = ad.assets.structuredSnippets && ad.assets.structuredSnippets.length > 0;
  const hasMessages = ad.assets.messages && ad.assets.messages.length > 0;
  const hasPrices = ad.assets.priceAssets && ad.assets.priceAssets.length > 0;
  const hasAnyAssets =
    hasCallouts ||
    hasSitelinks ||
    hasPromotions ||
    hasLeadForms ||
    hasSnippets ||
    hasMessages ||
    hasPrices;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all hover:border-slate-300">
      {/* Ad Card Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
            Ad {adIndex + 1}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h5 className="text-xs font-bold text-slate-900 truncate">{ad.name}</h5>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                {statusBadge.label}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              ID: {ad.id || "Not assigned"} • Type: {ad.adType || "RESPONSIVE_SEARCH_AD"}
              {ad.adStrength && (
                <span className="ml-2 font-sans text-emerald-600 font-semibold">
                  Strength: {ad.adStrength}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Ad {adIndex + 1} of {totalAdsInGroup}
        </div>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Section A: Ad Information (Final URL & Display Paths) */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-600" /> Landing Page & Display Paths
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Final URL */}
            <div className="sm:col-span-2 bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold block">Final Landing Page URL:</span>
              {isValidUrl ? (
                <a
                  href={ad.finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-blue-700 hover:text-blue-800 hover:underline font-semibold break-all flex items-center gap-1 text-[11px] mt-0.5"
                >
                  <span className="truncate">{ad.finalUrl}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ) : ad.finalUrl ? (
                <span className="font-mono text-slate-700 text-[11px] break-all block mt-0.5">
                  {ad.finalUrl}
                </span>
              ) : (
                <span className="text-slate-400 italic text-[11px] block mt-0.5">Not configured</span>
              )}
            </div>

            {/* Display Paths */}
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold block">Display Path:</span>
              <span className="font-mono text-slate-800 font-semibold text-[11px] block mt-0.5">
                {ad.path1 || ad.path2 ? `/${ad.path1 || "promo"}/${ad.path2 || "deals"}` : "Not configured"}
              </span>
            </div>
          </div>
        </div>

        {/* Section B: Headlines and Descriptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Headlines */}
          <div className="space-y-2 p-3 bg-blue-50/30 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5 text-blue-600" />
                Headlines ({ad.headlines.length})
              </span>
              <span className="text-[10px] text-slate-500">Max 30 chars</span>
            </div>

            {ad.headlines.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {ad.headlines.map((headline, hIdx) => (
                  <div
                    key={hIdx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-200 text-blue-950 rounded-lg shadow-2xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center justify-center shrink-0">
                      {hIdx + 1}
                    </span>
                    <span className="font-medium text-[11px]">{headline}</span>
                    <span className="text-[9px] font-mono text-slate-400 ml-1">
                      {headline.length}/30
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic bg-white p-2 rounded-lg border border-slate-200">
                No headlines configured for this ad.
              </p>
            )}
          </div>

          {/* Descriptions */}
          <div className="space-y-2 p-3 bg-purple-50/30 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-950 flex items-center gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5 text-purple-600" />
                Descriptions ({ad.descriptions.length})
              </span>
              <span className="text-[10px] text-slate-500">Max 90 chars</span>
            </div>

            {ad.descriptions.length > 0 ? (
              <div className="space-y-1.5">
                {ad.descriptions.map((desc, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-2 bg-white border border-purple-200 rounded-lg shadow-2xs flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {dIdx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 text-[11px] leading-relaxed">{desc}</p>
                      <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                        {desc.length}/90 chars
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic bg-white p-2 rounded-lg border border-slate-200">
                No descriptions configured for this ad.
              </p>
            )}
          </div>
        </div>

        {/* Section C: Media Section (Images, Logos, Videos) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h6 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-indigo-600" />
              Media Gallery (Images, Logos, Videos)
            </h6>
            <span className="text-[10px] text-slate-500">
              {hasAnyMedia
                ? `${totalImages} Image${totalImages === 1 ? "" : "s"} • ${totalLogos} Logo${totalLogos === 1 ? "" : "s"} • ${totalVideos} Video${totalVideos === 1 ? "" : "s"}`
                : "No media attached"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Marketing Images */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                  <ImageIcon className="h-3 w-3 text-blue-600" /> Images ({totalImages})
                </span>
                <span className="text-[9px] text-slate-500">1.91:1 & 1:1</span>
              </div>

              {totalImages > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {ad.media.images.map((img, iIdx) => {
                    const imgUrl = getMediaUrl(img);
                    const imgName = getMediaName(img, `Image ${iIdx + 1}`);
                    const isValid = isValidHttpUrl(imgUrl || "");

                    return (
                      <div
                        key={iIdx}
                        className="group relative rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-blue-400 transition-all"
                      >
                        {isValid && imgUrl ? (
                          <div className="aspect-video w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                            <img
                              src={imgUrl}
                              alt={imgName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMediaModal({
                                  url: imgUrl,
                                  type: "image",
                                  title: imgName
                                })
                              }
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                              title="View larger"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="p-2 text-center bg-slate-50">
                            <ImageIcon className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                            <span className="text-[10px] text-slate-600 truncate block font-mono">
                              {imgName}
                            </span>
                          </div>
                        )}
                        <div className="p-1 bg-white border-t border-slate-100 text-[10px] text-slate-600 truncate px-1.5 font-medium">
                          {imgName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic py-2">
                  No images configured for this ad.
                </p>
              )}
            </div>

            {/* 2. Logos */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-600" /> Logos ({totalLogos})
                </span>
                <span className="text-[9px] text-slate-500">1:1 & 4:1</span>
              </div>

              {totalLogos > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {ad.media.logos.map((logo, lIdx) => {
                    const logoUrl = getMediaUrl(logo);
                    const logoName = getMediaName(logo, `Logo ${lIdx + 1}`);
                    const isValid = isValidHttpUrl(logoUrl || "");

                    return (
                      <div
                        key={lIdx}
                        className="group relative rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-amber-400 transition-all"
                      >
                        {isValid && logoUrl ? (
                          <div className="aspect-square w-full bg-slate-100 relative overflow-hidden flex items-center justify-center p-1">
                            <img
                              src={logoUrl}
                              alt={logoName}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMediaModal({
                                  url: logoUrl,
                                  type: "logo",
                                  title: logoName
                                })
                              }
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                              title="View larger"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="p-2 text-center bg-slate-50">
                            <Sparkles className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                            <span className="text-[10px] text-slate-600 truncate block font-mono">
                              {logoName}
                            </span>
                          </div>
                        )}
                        <div className="p-1 bg-white border-t border-slate-100 text-[10px] text-slate-600 truncate px-1.5 font-medium">
                          {logoName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic py-2">
                  No logos configured for this ad.
                </p>
              )}
            </div>

            {/* 3. Videos */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                  <PlayCircle className="h-3 w-3 text-rose-600" /> Videos ({totalVideos})
                </span>
                <span className="text-[9px] text-slate-500">YouTube / Reels</span>
              </div>

              {totalVideos > 0 ? (
                <div className="space-y-1.5">
                  {ad.media.videos.map((vid, vIdx) => {
                    const vidUrl = getMediaUrl(vid);
                    const vidName = getMediaName(vid, `Video ${vIdx + 1}`);
                    const isValid = isValidHttpUrl(vidUrl || "");

                    return (
                      <div
                        key={vIdx}
                        className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-2xs hover:border-rose-300 transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <PlayCircle className="h-4 w-4 text-rose-600 shrink-0" />
                          <span className="text-[11px] font-medium text-slate-800 truncate">
                            {vidName}
                          </span>
                        </div>
                        {isValid && vidUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMediaModal({
                                url: vidUrl,
                                type: "video",
                                title: vidName
                              })
                            }
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Watch</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic py-2">
                  No videos configured for this ad.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section D: Assets and Extensions */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h6 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-emerald-600" />
              Attached Assets & Extensions
            </h6>
            <span className="text-[10px] text-slate-500">
              {hasAnyAssets ? "Configured extensions" : "No extensions attached"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
            {/* Callouts */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">
                Callouts ({ad.assets.callouts?.length || 0})
              </span>
              {hasCallouts ? (
                <div className="flex flex-wrap gap-1">
                  {ad.assets.callouts?.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 rounded text-[10px] font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">None configured</p>
              )}
            </div>

            {/* Sitelinks */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">
                Sitelinks ({ad.assets.sitelinks?.length || 0})
              </span>
              {hasSitelinks ? (
                <div className="space-y-1">
                  {ad.assets.sitelinks?.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 bg-white border border-slate-200 rounded text-[10px] space-y-0.5"
                    >
                      <span className="font-bold text-blue-900 block truncate">
                        {typeof s === "string" ? s : s.text || s.linkText}
                      </span>
                      {typeof s === "object" && s.finalUrl && (
                        <span className="font-mono text-slate-500 text-[9px] truncate block">
                          {s.finalUrl}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">None configured</p>
              )}
            </div>

            {/* Structured Snippets */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">
                Structured Snippets ({ad.assets.structuredSnippets?.length || 0})
              </span>
              {hasSnippets ? (
                <div className="space-y-1">
                  {ad.assets.structuredSnippets?.map((sn, idx) => (
                    <div key={idx} className="p-1.5 bg-white border border-slate-200 rounded text-[10px]">
                      <span className="font-bold text-slate-700">{sn.header || "Values"}: </span>
                      <span className="text-slate-800">
                        {Array.isArray(sn.values) ? sn.values.join(", ") : String(sn.values || "")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">None configured</p>
              )}
            </div>

            {/* Promotions */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">
                Promotions ({ad.assets.promotions?.length || 0})
              </span>
              {hasPromotions ? (
                <div className="space-y-1">
                  {ad.assets.promotions?.map((p, idx) => (
                    <div key={idx} className="p-1.5 bg-white border border-slate-200 rounded text-[10px]">
                      <span className="font-bold text-rose-900">
                        {typeof p === "string" ? p : p.promotionTarget || p.description}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">None configured</p>
              )}
            </div>

            {/* Lead Forms */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">
                Lead Forms ({ad.assets.leadForms?.length || 0})
              </span>
              {hasLeadForms ? (
                <div className="space-y-1">
                  {ad.assets.leadForms?.map((lf, idx) => (
                    <div key={idx} className="p-1.5 bg-white border border-slate-200 rounded text-[10px]">
                      <span className="font-bold text-blue-900 truncate block">
                        {typeof lf === "string" ? lf : lf.businessName || lf.headline}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">None configured</p>
              )}
            </div>

            {/* Messages & Prices */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">
                Messages & Prices
              </span>
              {hasMessages || hasPrices ? (
                <div className="space-y-1">
                  {ad.assets.messages?.map((m, idx) => (
                    <div key={`m-${idx}`} className="p-1.5 bg-white border border-slate-200 rounded text-[10px]">
                      <span className="font-bold text-emerald-800">
                        {typeof m === "string" ? m : m.starterMessage || m.messageText || m.text}
                      </span>
                    </div>
                  ))}
                  {ad.assets.priceAssets?.map((pr, idx) => (
                    <div key={`pr-${idx}`} className="p-1.5 bg-white border border-slate-200 rounded text-[10px]">
                      <span className="font-bold text-slate-900">{pr.header}: </span>
                      <span className="text-emerald-700 font-semibold">{pr.amount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">None configured</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Media Preview */}
      <MediaPreviewModal
        isOpen={!!activeMediaModal}
        onClose={() => setActiveMediaModal(null)}
        mediaUrl={activeMediaModal?.url || null}
        mediaType={activeMediaModal?.type || "image"}
        title={activeMediaModal?.title}
      />
    </div>
  );
};

// ── Reusable AdGroupAccordion Component ────────────────────────────────────────

export interface AdGroupAccordionProps {
  adGroup: NormalizedAdGroup;
  groupIndex: number;
  totalGroups: number;
  initiallyExpanded?: boolean;
}

export const AdGroupAccordion: React.FC<AdGroupAccordionProps> = ({
  adGroup,
  groupIndex,
  totalGroups,
  initiallyExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [activeTab, setActiveTab] = useState<"ADS" | "KEYWORDS">("ADS");

  const statusBadge = getStatusBadge(adGroup.status);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all hover:border-slate-300">
      {/* Accordion Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3.5 bg-slate-50/80 hover:bg-slate-100/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
            {groupIndex + 1}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 truncate">{adGroup.name}</h4>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                {statusBadge.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 font-mono mt-0.5">
              <span>ID: {adGroup.id || "Not assigned"}</span>
              <span>•</span>
              <span className="font-sans">
                CPC Bid:{" "}
                <strong className="text-slate-800 font-mono">{formatCpcBid(adGroup.cpcBid)}</strong>
              </span>
              <span>•</span>
              <span className="font-sans">
                {adGroup.ads.length} Ad{adGroup.ads.length === 1 ? "" : "s"}
              </span>
              <span>•</span>
              <span className="font-sans">
                {adGroup.keywords.length} Keyword{adGroup.keywords.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            aria-label={isExpanded ? "Collapse ad group" : "Expand ad group"}
          >
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Accordion Body */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-slate-50/30">
          {/* Subtabs: Ads vs Keywords */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("ADS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "ADS"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Responsive Ads ({adGroup.ads.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("KEYWORDS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "KEYWORDS"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Tag className="h-3.5 w-3.5" />
                <span>Keywords & Negatives ({adGroup.keywords.length + adGroup.negativeKeywords.length})</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-medium">
              Ad Group {groupIndex + 1} of {totalGroups}
            </span>
          </div>

          {/* TAB 1: Ads List */}
          {activeTab === "ADS" && (
            <div className="space-y-4">
              {adGroup.ads.length > 0 ? (
                adGroup.ads.map((ad, adIdx) => (
                  <AdDetailsCard
                    key={ad.id || adIdx}
                    ad={ad}
                    adIndex={adIdx}
                    totalAdsInGroup={adGroup.ads.length}
                  />
                ))
              ) : (
                <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                  No ads found in this ad group.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Keywords & Negative Keywords */}
          {activeTab === "KEYWORDS" && (
            <div className="space-y-4">
              {/* Positive Keywords */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-emerald-600" />
                    Target Keywords ({adGroup.keywords.length})
                  </h5>
                </div>

                {adGroup.keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {adGroup.keywords.map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-[11px] font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No keywords configured for this ad group.</p>
                )}
              </div>

              {/* Negative Keywords */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-rose-600" />
                    Negative Keywords ({adGroup.negativeKeywords.length})
                  </h5>
                </div>

                {adGroup.negativeKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {adGroup.negativeKeywords.map((nkw, nkIdx) => (
                      <span
                        key={nkIdx}
                        className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg text-[11px] font-medium"
                      >
                        -{nkw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No negative keywords configured for this ad group.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main GoogleAdsCampaignHierarchySection Component ──────────────────────────

export interface GoogleAdsCampaignHierarchySectionProps {
  campaign: any;
  title?: string;
  subtitle?: string;
}

export const GoogleAdsCampaignHierarchySection: React.FC<GoogleAdsCampaignHierarchySectionProps> = ({
  campaign,
  title,
  subtitle
}) => {
  const normalized = useMemo(() => normalizeCampaignHierarchy(campaign), [campaign]);

  const totalAdGroups = normalized.adGroups.length;
  const totalAds = normalized.adGroups.reduce((acc, g) => acc + g.ads.length, 0);

  // If campaign is Performance Max and has Asset Groups, preserve asset group view
  const isPerformanceMax =
    normalized.campaignType === "PERFORMANCE_MAX" ||
    normalized.advertisingChannelType === "PERFORMANCE_MAX";

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 rounded-2xl border border-blue-200/70 shadow-2xs">
        <div>
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-blue-600" />
            {title || "Campaign Hierarchy: Ad Groups → Ads → Media & Assets"}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {subtitle ||
              "Explore all structured Ad Groups, individual Responsive Search Ads, Media Gallery, and Extension Assets attached to this campaign."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-[11px] font-bold px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-xl shadow-2xs">
            {totalAdGroups} Ad Group{totalAdGroups === 1 ? "" : "s"}
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-xl shadow-2xs">
            {totalAds} Ad{totalAds === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* If Performance Max with liveAssetGroups, render notice while displaying hierarchy */}
      {isPerformanceMax && normalized.hasAssetGroups && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
          <span>
            This is a <strong>Performance Max Campaign</strong>. Asset Groups are preserved and
            displayed alongside standard ad group configurations below.
          </span>
        </div>
      )}

      {/* Ad Groups Hierarchical Accordion List */}
      {totalAdGroups > 0 ? (
        <div className="space-y-3">
          {normalized.adGroups.map((ag, idx) => (
            <AdGroupAccordion
              key={ag.id || idx}
              adGroup={ag}
              groupIndex={idx}
              totalGroups={totalAdGroups}
              initiallyExpanded={idx === 0}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-1">
          <FolderTree className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-700">No Ad Groups Found</p>
          <p className="text-[11px] text-slate-400">
            This campaign does not have any configured ad groups or responsive search ads.
          </p>
        </div>
      )}
    </div>
  );
};
