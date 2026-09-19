import prisma from "../../utils/prisma";
import { analyzeWebsiteUrl, isSafeUrlWithDns } from "./shared/websiteAnalyzer";
import { GoogleAdsAiAssistantService } from "./GoogleAdsAiAssistantService";

export interface SubPageEntry {
  text: string;
  url: string;
}

export interface WebsiteEntry {
  url: string;
  title?: string;
  description?: string;
  subPages: SubPageEntry[];
  analyzedAt?: string;
}

export interface AppDetailEntry {
  id: string;
  platform: "ANDROID" | "IOS";
  appId: string;
  appName?: string;
  appUrl?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: string | number;
  currency?: string;
  productUrl?: string;
  features?: string[];
  benefits?: string[];
  usp?: string;
  targetAudience?: string;
  isActive: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: string | number;
  currency?: string;
  serviceUrl?: string;
  features?: string[];
  benefits?: string[];
  usp?: string;
  targetAudience?: string;
  isActive: boolean;
}

export interface TargetAudienceItem {
  id: string;
  name: string;
  ageRange?: string;
  gender?: "All" | "Male" | "Female" | string;
  customerType?: "B2B" | "B2C" | "Both" | string;
  locations?: string[];
  languages?: string[];
  interests?: string[];
  painPoints?: string[];
  needs?: string[];
  buyingIntent?: string;
  purchaseBehavior?: string;
  additionalNotes?: string;
  isActive: boolean;
}

export interface CustomerPersonaItem {
  id: string;
  name: string;
  shortDescription?: string;
  ageRange?: string;
  gender?: "All" | "Male" | "Female" | string;
  occupation?: string;
  customerType?: "B2B" | "B2C" | "Both" | string;
  locations?: string[];
  languages?: string[];
  interests?: string[];
  painPoints?: string[];
  needs?: string[];
  buyingIntent?: string;
  purchaseBehavior?: string;
  preferredOfferings?: string[];
  additionalNotes?: string;
  isActive: boolean;
}

export interface LocationItem {
  id: string;
  locationName: string;
  country: string;
  state: string;
  city: string;
  areaLocality?: string;
  pincode?: string;
  fullAddress?: string;
  locationType: "Headquarters" | "Branch" | "Store" | "Service Area" | string;
  latitude?: string | number;
  longitude?: string | number;
  radius?: string;
  languages?: string[];
  additionalNotes?: string;
  isActive: boolean;
}

export interface ConversionGoalItem {
  id: string;
  goalName: string;
  conversionType:
    | "Website Purchase"
    | "Lead Form"
    | "Phone Call"
    | "WhatsApp"
    | "Contact"
    | "Sign-up"
    | "Booking"
    | "App Install"
    | "App Purchase"
    | "Store Visit"
    | "Get Directions"
    | "Other"
    | string;
  source: "Website" | "Phone" | "App" | "Store" | "Other" | string;
  description?: string;
  conversionValue?: string | number;
  currency?: string;
  isPrimary: boolean;
  isActive: boolean;
  additionalNotes?: string;
}

export interface BrandProfileData {
  // Brand Identity
  brandName?: string;
  brandTagline?: string;
  brandDescription?: string;
  brandWebsite?: string;
  logoUrl?: string;
  brandColors?: string[];
  brandKeywords?: string[];

  // Brand Voice
  brandVoice?: string[];

  // Messaging Guidelines
  preferredCta?: string;
  preferredMessaging?: string;
  brandUsps?: string[];
  wordsToPrefer?: string[];
  wordsToAvoid?: string[];
  advertisingDos?: string[];
  advertisingDonts?: string[];
  promotionalStyle?: string;
  discountRules?: string;
  priceRules?: string;
  additionalNotes?: string;
}

export interface CompetitorItem {
  id: string;
  competitorName: string;
  competitorWebsite?: string;
  competitorDescription?: string;
  industry?: string;
  products?: string[];
  services?: string[];
  targetMarket?: string;
  locations?: string[];
  mainUsps?: string[];
  competitorNotes?: string;
  isActive: boolean;
}

export type KeywordType =
  | "Primary"
  | "Secondary"
  | "Long-tail"
  | "Branded"
  | "Product"
  | "Service"
  | "Location"
  | string;

export type SearchIntentType =
  | "Informational"
  | "Commercial"
  | "Transactional"
  | "Navigational"
  | string;

export interface SeoKeywordItem {
  id: string;
  keyword: string;
  keywordType: KeywordType;
  relatedOffering?: string;
  targetLocation?: string;
  searchIntent?: SearchIntentType;
  notes?: string;
  isActive: boolean;
}

export type NegativeMatchScore = "Broad" | "Phrase" | "Exact" | string;

export interface NegativeKeywordItem {
  id: string;
  keyword: string;
  matchType: NegativeMatchScore;
  reason?: string;
  isActive: boolean;
}

export interface BusinessFaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  relatedProduct?: string;
  relatedService?: string;
  relatedLocation?: string;
  keywords?: string[];
  isActive: boolean;
  internalNotes?: string;
}

export type AiSuggestionSection =
  | "business"
  | "products"
  | "services"
  | "target_audience"
  | "locations"
  | "brand_profile"
  | "competitors"
  | "seo_keywords"
  | "faqs";

export type AiSuggestionStatus = "new" | "existing" | "conflict";

export interface AiSuggestionItem {
  id: string;
  section: AiSuggestionSection;
  field: string;
  label: string;
  suggestedValue: any;
  currentValue?: any;
  sourceUrl: string;
  status: AiSuggestionStatus;
  explanation?: string;
  applied?: boolean;
  rejected?: boolean;
}

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
  fileSize: number; // in bytes
  width: number;
  height: number;
  aspectRatio: string; // e.g. "1.91:1", "1:1", "4:5", "9:16", "4:1", "16:9"
  durationSeconds?: number; // for video
  status: "ACTIVE" | "INACTIVE";
  approved: boolean;
  legalRightsConfirmed: boolean;
  source: string; // e.g. "UPLOAD", "AI_GENERATED", "IMAGEKIT", "WEBSITE"
  createdAt: string;
  updatedAt: string;
}

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml"
];

export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/mpeg"
];

export const MAX_IMAGE_FILE_SIZE_BYTES = 5120 * 1024; // 5120 KB = 5 MB

export function validateMediaAsset(asset: Partial<MediaAssetItem>): {
  isValid: boolean;
  error?: string;
  detectedSubtype?: MediaAssetSubtype;
  detectedAspectRatio?: string;
} {
  if (!asset.type || !["IMAGE", "LOGO", "VIDEO"].includes(asset.type)) {
    return { isValid: false, error: "Invalid asset type. Must be IMAGE, LOGO, or VIDEO." };
  }

  if (!asset.fileName || !asset.fileName.trim()) {
    return { isValid: false, error: "File name is required." };
  }

  if (!asset.fileUrl || !asset.fileUrl.trim()) {
    return { isValid: false, error: "File URL is required." };
  }

  if (!asset.legalRightsConfirmed) {
    return {
      isValid: false,
      error: "You must confirm ownership or permission to use this asset for advertising before saving."
    };
  }

  const mime = (asset.mimeType || "").toLowerCase().trim();

  if (asset.type === "IMAGE" || asset.type === "LOGO") {
    if (mime && !ALLOWED_IMAGE_MIME_TYPES.includes(mime)) {
      return {
        isValid: false,
        error: `Unsupported image format (${mime}). Allowed formats: JPEG, PNG, WEBP, GIF, SVG.`
      };
    }

    if (asset.fileSize && asset.fileSize > MAX_IMAGE_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `File size exceeds 5120 KB limit (${(asset.fileSize / 1024).toFixed(1)} KB uploaded).`
      };
    }

    const w = Number(asset.width) || 0;
    const h = Number(asset.height) || 0;
    if (w <= 0 || h <= 0) {
      return { isValid: false, error: "Invalid image dimensions. Width and height must be positive numbers." };
    }

    const ratio = w / h;

    if (asset.type === "IMAGE") {
      // Landscape: 1.91:1 (~1.80 - 2.05), Recommended: 1200x628, Min: 600x314
      // Square: 1:1 (~0.95 - 1.05), Recommended: 1200x1200, Min: 300x300
      // Portrait: 4:5 (~0.75 - 0.85), Recommended: 960x1200, Min: 480x600
      // Tall Portrait: 9:16 (~0.50 - 0.62), Recommended: 1080x1920, Min: 600x1067
      if (ratio >= 1.80 && ratio <= 2.05) {
        if (w < 600 || h < 314) {
          return {
            isValid: false,
            error: `Landscape image must be at least 600 × 314 pixels (uploaded: ${w} × ${h} px). Recommended: 1200 × 628.`
          };
        }
        return { isValid: true, detectedSubtype: "IMAGE_LANDSCAPE", detectedAspectRatio: "1.91:1" };
      } else if (ratio >= 0.95 && ratio <= 1.05) {
        if (w < 300 || h < 300) {
          return {
            isValid: false,
            error: `Square image must be at least 300 × 300 pixels (uploaded: ${w} × ${h} px). Recommended: 1200 × 1200.`
          };
        }
        return { isValid: true, detectedSubtype: "IMAGE_SQUARE", detectedAspectRatio: "1:1" };
      } else if (ratio >= 0.75 && ratio <= 0.85) {
        if (w < 480 || h < 600) {
          return {
            isValid: false,
            error: `Portrait (4:5) image must be at least 480 × 600 pixels (uploaded: ${w} × ${h} px). Recommended: 960 × 1200.`
          };
        }
        return { isValid: true, detectedSubtype: "IMAGE_PORTRAIT", detectedAspectRatio: "4:5" };
      } else if (ratio >= 0.50 && ratio <= 0.62) {
        if (w < 600 || h < 1067) {
          return {
            isValid: false,
            error: `Tall Portrait (9:16) image must be at least 600 × 1067 pixels (uploaded: ${w} × ${h} px). Recommended: 1080 × 1920.`
          };
        }
        return { isValid: true, detectedSubtype: "IMAGE_TALL_PORTRAIT", detectedAspectRatio: "9:16" };
      } else {
        return {
          isValid: false,
          error: `Image aspect ratio (${ratio.toFixed(2)}:1, ${w} × ${h} px) does not meet Google Ads specifications. Required: Landscape (1.91:1), Square (1:1), Portrait (4:5), or Tall Portrait (9:16).`
        };
      }
    } else {
      // LOGO:
      // Square Logo: 1:1 (~0.95 - 1.05), Recommended: 1200x1200, Min: 128x128
      // Landscape Logo: 4:1 (~3.8 - 4.2), Recommended: 1200x300, Min: 512x128
      if (ratio >= 0.95 && ratio <= 1.05) {
        if (w < 128 || h < 128) {
          return {
            isValid: false,
            error: `Square logo must be at least 128 × 128 pixels (uploaded: ${w} × ${h} px). Recommended: 1200 × 1200.`
          };
        }
        return { isValid: true, detectedSubtype: "LOGO_SQUARE", detectedAspectRatio: "1:1" };
      } else if (ratio >= 3.8 && ratio <= 4.2) {
        if (w < 512 || h < 128) {
          return {
            isValid: false,
            error: `Landscape logo (4:1) must be at least 512 × 128 pixels (uploaded: ${w} × ${h} px). Recommended: 1200 × 300.`
          };
        }
        return { isValid: true, detectedSubtype: "LOGO_LANDSCAPE", detectedAspectRatio: "4:1" };
      } else {
        return {
          isValid: false,
          error: `Logo aspect ratio (${ratio.toFixed(2)}:1, ${w} × ${h} px) does not meet Google Ads specifications. Required: Square (1:1) or Landscape (4:1).`
        };
      }
    }
  }

  if (asset.type === "VIDEO") {
    // GOOGLE ADS VIDEO ASSET SPECIFICATIONS & VALIDATION:
    // 1. In Google Ads API, video assets are referenced as YOUTUBE_VIDEO assets (via YouTube video ID)
    //    or YouTube URLs; Google Ads does not impose a 50 MB file size restriction on video assets.
    //    Therefore, no artificial 50 MB file size limit is enforced here.
    // 2. Confirmed duration requirement: Google Ads requires video ad assets to be at least 10 seconds.
    // 3. Stored metadata: width, height, aspectRatio, durationSeconds, mimeType, and fileSize are preserved.
    if (mime && !ALLOWED_VIDEO_MIME_TYPES.includes(mime)) {
      return {
        isValid: false,
        error: `Unsupported video format (${mime}). Allowed formats: MP4, WebM, MOV, AVI, MPEG.`
      };
    }

    const duration = Number(asset.durationSeconds) || 0;
    if (duration > 0 && duration < 10) {
      return {
        isValid: false,
        error: `Video duration is too short (${duration.toFixed(1)} seconds). Google Ads video assets must be at least 10 seconds.`
      };
    }

    return {
      isValid: true,
      detectedSubtype: "VIDEO",
      detectedAspectRatio: asset.aspectRatio || (asset.width && asset.height ? `${(asset.width / asset.height).toFixed(2)}:1` : "16:9")
    };
  }

  return { isValid: true };
}

export interface BusinessProfilePayload {
  businessName?: string;
  legalBusinessName?: string;
  industry?: string;
  businessCategory?: string;
  businessDescription?: string;
  targetAudience?: string;
  customerType?: string;
  businessModel?: string;
  businessEmail?: string;
  businessPhone?: string;
  whatsappNumber?: string;
  businessAddress?: string;
  serviceAreas?: string[] | string;
  languagesServed?: string[] | string;
  primaryWebsite?: string;
  additionalWebsites?: WebsiteEntry[];
  products?: (ProductItem | string)[];
  services?: (ServiceItem | string)[];
  targetAudiences?: TargetAudienceItem[];
  customerPersonas?: CustomerPersonaItem[];
  locationRecords?: LocationItem[];
  locationsMaster?: LocationItem[];
  conversionGoals?: ConversionGoalItem[];
  brandProfile?: BrandProfileData;
  competitors?: CompetitorItem[];
  seoKeywords?: SeoKeywordItem[];
  negativeKeywords?: NegativeKeywordItem[];
  faqs?: BusinessFaqItem[];
  aiSuggestions?: AiSuggestionItem[];
  mediaAssets?: MediaAssetItem[];
  keyOfferings?: string[];
  locations?: string[];
  hasMerchantAccount?: boolean;
  merchantCenterId?: string;
  merchantDetails?: Record<string, any>;
  hasAppAccount?: boolean;
  appDetails?: AppDetailEntry[];
  isApproved?: boolean;
  metadata?: Record<string, any>;
}

export class CustomerBusinessProfileService {
  /**
   * Fetches the saved business profile for a specific organizationId and customerId.
   */
  static async getProfile(orgId: string, customerId: string) {
    const cleanCid = (customerId || "").replace(/-/g, "").trim();
    if (!cleanCid || !orgId) return null;

    try {
      const profile = await (prisma as any).googleAdsCustomerProfile.findUnique({
        where: {
          organizationId_customerId: {
            organizationId: orgId,
            customerId: cleanCid
          }
        }
      });
      if (profile) {
        const info = profile.metadata?.businessInfo || {};
        profile.legalBusinessName = profile.legalBusinessName || info.legalBusinessName || null;
        profile.businessCategory = profile.businessCategory || info.businessCategory || null;
        profile.customerType = profile.customerType || info.customerType || null;
        profile.businessModel = profile.businessModel || info.businessModel || null;
        profile.businessEmail = profile.businessEmail || info.businessEmail || null;
        profile.businessPhone = profile.businessPhone || info.businessPhone || null;
        profile.whatsappNumber = profile.whatsappNumber || info.whatsappNumber || null;
        profile.businessAddress = profile.businessAddress || info.businessAddress || null;
        profile.serviceAreas = (profile.serviceAreas && Array.isArray(profile.serviceAreas) && profile.serviceAreas.length > 0)
          ? profile.serviceAreas
          : (info.serviceAreas || []);
        profile.languagesServed = (profile.languagesServed && Array.isArray(profile.languagesServed) && profile.languagesServed.length > 0)
          ? profile.languagesServed
          : (info.languagesServed || []);

        // Normalize products if strings exist
        if (Array.isArray(profile.products)) {
          profile.products = profile.products.map((p: any, idx: number): ProductItem =>
            typeof p === "string"
              ? {
                  id: `prod-${idx}`,
                  name: p,
                  description: "",
                  category: "",
                  price: "",
                  currency: "INR",
                  productUrl: "",
                  features: [],
                  benefits: [],
                  usp: "",
                  targetAudience: "",
                  isActive: true
                }
              : p
          );
        }

        // Normalize services if strings exist
        if (Array.isArray(profile.services)) {
          profile.services = profile.services.map((s: any, idx: number): ServiceItem =>
            typeof s === "string"
              ? {
                  id: `serv-${idx}`,
                  name: s,
                  description: "",
                  category: "",
                  price: "",
                  currency: "INR",
                  serviceUrl: "",
                  features: [],
                  benefits: [],
                  usp: "",
                  targetAudience: "",
                  isActive: true
                }
              : s
          );
        }

        // Normalize target audiences
        const rawAudiences = (profile.metadata?.targetAudiences || profile.targetAudiences);
        profile.targetAudiences = Array.isArray(rawAudiences)
          ? rawAudiences.map((a: any, idx: number): TargetAudienceItem => ({
              id: a.id || `aud-${idx}`,
              name: String(a.name || "").trim(),
              ageRange: typeof a.ageRange === "string" ? a.ageRange.trim() : "",
              gender: typeof a.gender === "string" ? a.gender.trim() : "All",
              customerType: typeof a.customerType === "string" ? a.customerType.trim() : "Both",
              locations: Array.isArray(a.locations) ? a.locations.map((item: any) => String(item).trim()).filter(Boolean) : (typeof a.locations === "string" ? a.locations.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              languages: Array.isArray(a.languages) ? a.languages.map((item: any) => String(item).trim()).filter(Boolean) : (typeof a.languages === "string" ? a.languages.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              interests: Array.isArray(a.interests) ? a.interests.map((item: any) => String(item).trim()).filter(Boolean) : (typeof a.interests === "string" ? a.interests.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              painPoints: Array.isArray(a.painPoints) ? a.painPoints.map((item: any) => String(item).trim()).filter(Boolean) : (typeof a.painPoints === "string" ? a.painPoints.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              needs: Array.isArray(a.needs) ? a.needs.map((item: any) => String(item).trim()).filter(Boolean) : (typeof a.needs === "string" ? a.needs.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              buyingIntent: typeof a.buyingIntent === "string" ? a.buyingIntent.trim() : "",
              purchaseBehavior: typeof a.purchaseBehavior === "string" ? a.purchaseBehavior.trim() : "",
              additionalNotes: typeof a.additionalNotes === "string" ? a.additionalNotes.trim() : "",
              isActive: a.isActive !== undefined ? Boolean(a.isActive) : true
            }))
          : [];

        // Normalize customer personas
        const rawPersonas = (profile.metadata?.customerPersonas || profile.customerPersonas);
        profile.customerPersonas = Array.isArray(rawPersonas)
          ? rawPersonas.map((p: any, idx: number): CustomerPersonaItem => ({
              id: p.id || `per-${idx}`,
              name: String(p.name || "").trim(),
              shortDescription: typeof p.shortDescription === "string" ? p.shortDescription.trim() : "",
              ageRange: typeof p.ageRange === "string" ? p.ageRange.trim() : "",
              gender: typeof p.gender === "string" ? p.gender.trim() : "All",
              occupation: typeof p.occupation === "string" ? p.occupation.trim() : "",
              customerType: typeof p.customerType === "string" ? p.customerType.trim() : "Both",
              locations: Array.isArray(p.locations) ? p.locations.map((item: any) => String(item).trim()).filter(Boolean) : (typeof p.locations === "string" ? p.locations.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              languages: Array.isArray(p.languages) ? p.languages.map((item: any) => String(item).trim()).filter(Boolean) : (typeof p.languages === "string" ? p.languages.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              interests: Array.isArray(p.interests) ? p.interests.map((item: any) => String(item).trim()).filter(Boolean) : (typeof p.interests === "string" ? p.interests.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              painPoints: Array.isArray(p.painPoints) ? p.painPoints.map((item: any) => String(item).trim()).filter(Boolean) : (typeof p.painPoints === "string" ? p.painPoints.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              needs: Array.isArray(p.needs) ? p.needs.map((item: any) => String(item).trim()).filter(Boolean) : (typeof p.needs === "string" ? p.needs.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              buyingIntent: typeof p.buyingIntent === "string" ? p.buyingIntent.trim() : "",
              purchaseBehavior: typeof p.purchaseBehavior === "string" ? p.purchaseBehavior.trim() : "",
              preferredOfferings: Array.isArray(p.preferredOfferings) ? p.preferredOfferings.map((item: any) => String(item).trim()).filter(Boolean) : (typeof p.preferredOfferings === "string" ? p.preferredOfferings.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              additionalNotes: typeof p.additionalNotes === "string" ? p.additionalNotes.trim() : "",
              isActive: p.isActive !== undefined ? Boolean(p.isActive) : true
            }))
          : [];

        // Normalize location records
        const rawLocations = (profile.metadata?.locationRecords || profile.metadata?.locationsMaster || profile.locationRecords);
        profile.locationRecords = Array.isArray(rawLocations)
          ? rawLocations.map((l: any, idx: number): LocationItem => ({
              id: l.id || `loc-${idx}`,
              locationName: String(l.locationName || l.name || "").trim(),
              country: String(l.country || "India").trim(),
              state: String(l.state || "").trim(),
              city: String(l.city || "").trim(),
              areaLocality: typeof l.areaLocality === "string" ? l.areaLocality.trim() : (typeof l.area === "string" ? l.area.trim() : ""),
              pincode: typeof l.pincode === "string" ? l.pincode.trim() : (l.pincode ? String(l.pincode).trim() : ""),
              fullAddress: typeof l.fullAddress === "string" ? l.fullAddress.trim() : (typeof l.address === "string" ? l.address.trim() : ""),
              locationType: ["Headquarters", "Branch", "Store", "Service Area"].includes(l.locationType) ? l.locationType : "Branch",
              latitude: l.latitude !== undefined && l.latitude !== null && l.latitude !== "" ? String(l.latitude).trim() : "",
              longitude: l.longitude !== undefined && l.longitude !== null && l.longitude !== "" ? String(l.longitude).trim() : "",
              radius: typeof l.radius === "string" ? l.radius.trim() : (l.radius ? String(l.radius).trim() : ""),
              languages: Array.isArray(l.languages) ? l.languages.map((item: any) => String(item).trim()).filter(Boolean) : (typeof l.languages === "string" ? l.languages.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              additionalNotes: typeof l.additionalNotes === "string" ? l.additionalNotes.trim() : (typeof l.notes === "string" ? l.notes.trim() : ""),
              isActive: l.isActive !== undefined ? Boolean(l.isActive) : true
            }))
          : [];

        // Normalize conversion goals
        const rawGoals = (profile.metadata?.conversionGoals || profile.conversionGoals);
        profile.conversionGoals = Array.isArray(rawGoals)
          ? rawGoals.map((g: any, idx: number): ConversionGoalItem => ({
              id: g.id || `goal-${idx}`,
              goalName: String(g.goalName || g.name || "").trim(),
              conversionType: typeof g.conversionType === "string" ? g.conversionType.trim() : "Lead Form",
              source: typeof g.source === "string" ? g.source.trim() : "Website",
              description: typeof g.description === "string" ? g.description.trim() : "",
              conversionValue: g.conversionValue !== undefined && g.conversionValue !== null && g.conversionValue !== "" ? String(g.conversionValue).trim() : "",
              currency: typeof g.currency === "string" && g.currency.trim() ? g.currency.trim() : "INR",
              isPrimary: g.isPrimary !== undefined ? Boolean(g.isPrimary) : true,
              isActive: g.isActive !== undefined ? Boolean(g.isActive) : true,
              additionalNotes: typeof g.additionalNotes === "string" ? g.additionalNotes.trim() : ""
            }))
          : [];

        // Normalize Brand Profile
        const rawBrand = profile.metadata?.brandProfile || profile.brandProfile || null;
        if (rawBrand && typeof rawBrand === "object") {
          profile.brandProfile = {
            brandName: typeof rawBrand.brandName === "string" ? rawBrand.brandName.trim() : "",
            brandTagline: typeof rawBrand.brandTagline === "string" ? rawBrand.brandTagline.trim() : "",
            brandDescription: typeof rawBrand.brandDescription === "string" ? rawBrand.brandDescription.trim() : "",
            brandWebsite: typeof rawBrand.brandWebsite === "string" ? rawBrand.brandWebsite.trim() : "",
            logoUrl: typeof rawBrand.logoUrl === "string" ? rawBrand.logoUrl.trim() : "",
            brandColors: Array.isArray(rawBrand.brandColors) ? rawBrand.brandColors.map((c: any) => String(c).trim()).filter(Boolean) : (typeof rawBrand.brandColors === "string" && rawBrand.brandColors ? rawBrand.brandColors.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
            brandKeywords: Array.isArray(rawBrand.brandKeywords) ? rawBrand.brandKeywords.map((k: any) => String(k).trim()).filter(Boolean) : (typeof rawBrand.brandKeywords === "string" && rawBrand.brandKeywords ? rawBrand.brandKeywords.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
            brandVoice: Array.isArray(rawBrand.brandVoice) ? rawBrand.brandVoice.map((v: any) => String(v).trim()).filter(Boolean) : [],
            preferredCta: typeof rawBrand.preferredCta === "string" ? rawBrand.preferredCta.trim() : "",
            preferredMessaging: typeof rawBrand.preferredMessaging === "string" ? rawBrand.preferredMessaging.trim() : "",
            brandUsps: Array.isArray(rawBrand.brandUsps) ? rawBrand.brandUsps.map((u: any) => String(u).trim()).filter(Boolean) : (typeof rawBrand.brandUsps === "string" && rawBrand.brandUsps ? rawBrand.brandUsps.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean) : []),
            wordsToPrefer: Array.isArray(rawBrand.wordsToPrefer) ? rawBrand.wordsToPrefer.map((w: any) => String(w).trim()).filter(Boolean) : (typeof rawBrand.wordsToPrefer === "string" && rawBrand.wordsToPrefer ? rawBrand.wordsToPrefer.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
            wordsToAvoid: Array.isArray(rawBrand.wordsToAvoid) ? rawBrand.wordsToAvoid.map((w: any) => String(w).trim()).filter(Boolean) : (typeof rawBrand.wordsToAvoid === "string" && rawBrand.wordsToAvoid ? rawBrand.wordsToAvoid.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
            advertisingDos: Array.isArray(rawBrand.advertisingDos) ? rawBrand.advertisingDos.map((d: any) => String(d).trim()).filter(Boolean) : (typeof rawBrand.advertisingDos === "string" && rawBrand.advertisingDos ? rawBrand.advertisingDos.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean) : []),
            advertisingDonts: Array.isArray(rawBrand.advertisingDonts) ? rawBrand.advertisingDonts.map((d: any) => String(d).trim()).filter(Boolean) : (typeof rawBrand.advertisingDonts === "string" && rawBrand.advertisingDonts ? rawBrand.advertisingDonts.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean) : []),
            promotionalStyle: typeof rawBrand.promotionalStyle === "string" ? rawBrand.promotionalStyle.trim() : "",
            discountRules: typeof rawBrand.discountRules === "string" ? rawBrand.discountRules.trim() : "",
            priceRules: typeof rawBrand.priceRules === "string" ? rawBrand.priceRules.trim() : "",
            additionalNotes: typeof rawBrand.additionalNotes === "string" ? rawBrand.additionalNotes.trim() : ""
          };
        } else {
          profile.brandProfile = null;
        }

        // Normalize competitors
        const rawCompetitors = (profile.metadata?.competitors || profile.competitors);
        profile.competitors = Array.isArray(rawCompetitors)
          ? rawCompetitors.map((c: any, idx: number): CompetitorItem => ({
              id: c.id || `comp-${idx}`,
              competitorName: String(c.competitorName || c.name || "").trim(),
              competitorWebsite: typeof (c.competitorWebsite ?? c.website) === "string" ? String(c.competitorWebsite ?? c.website).trim() : "",
              competitorDescription: typeof (c.competitorDescription ?? c.description) === "string" ? String(c.competitorDescription ?? c.description).trim() : "",
              industry: typeof c.industry === "string" ? c.industry.trim() : "",
              products: Array.isArray(c.products) ? c.products.map((p: any) => String(p).trim()).filter(Boolean) : (typeof c.products === "string" ? c.products.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              services: Array.isArray(c.services) ? c.services.map((s: any) => String(s).trim()).filter(Boolean) : (typeof c.services === "string" ? c.services.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              targetMarket: typeof c.targetMarket === "string" ? c.targetMarket.trim() : "",
              locations: Array.isArray(c.locations) ? c.locations.map((l: any) => String(l).trim()).filter(Boolean) : (typeof c.locations === "string" ? c.locations.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              mainUsps: Array.isArray(c.mainUsps) ? c.mainUsps.map((u: any) => String(u).trim()).filter(Boolean) : (typeof (c.mainUsps ?? c.usps) === "string" ? (c.mainUsps ?? c.usps).split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean) : []),
              competitorNotes: typeof (c.competitorNotes ?? c.notes) === "string" ? String(c.competitorNotes ?? c.notes).trim() : "",
              isActive: c.isActive !== undefined ? Boolean(c.isActive) : true
            }))
          : [];

        // Normalize SEO Keywords
        const rawSeoKeywords = (profile.metadata?.seoKeywords || profile.seoKeywords);
        profile.seoKeywords = Array.isArray(rawSeoKeywords)
          ? rawSeoKeywords.map((k: any, idx: number): SeoKeywordItem => ({
              id: k.id || `kw-${idx}`,
              keyword: String(k.keyword || k.name || "").trim(),
              keywordType: typeof k.keywordType === "string" && k.keywordType ? k.keywordType.trim() : "Primary",
              relatedOffering: typeof k.relatedOffering === "string" ? k.relatedOffering.trim() : (typeof k.offering === "string" ? k.offering.trim() : ""),
              targetLocation: typeof k.targetLocation === "string" ? k.targetLocation.trim() : (typeof k.location === "string" ? k.location.trim() : ""),
              searchIntent: typeof k.searchIntent === "string" && k.searchIntent ? k.searchIntent.trim() : "Commercial",
              notes: typeof k.notes === "string" ? k.notes.trim() : "",
              isActive: k.isActive !== undefined ? Boolean(k.isActive) : true
            }))
          : [];

        // Normalize Negative Keywords
        const rawNegativeKeywords = (profile.metadata?.negativeKeywords || profile.negativeKeywords);
        profile.negativeKeywords = Array.isArray(rawNegativeKeywords)
          ? rawNegativeKeywords.map((nk: any, idx: number): NegativeKeywordItem => ({
              id: nk.id || `nkw-${idx}`,
              keyword: String(nk.keyword || nk.name || "").trim(),
              matchType: typeof nk.matchType === "string" && nk.matchType ? nk.matchType.trim() : "Phrase",
              reason: typeof (nk.reason ?? nk.notes) === "string" ? String(nk.reason ?? nk.notes).trim() : "",
              isActive: nk.isActive !== undefined ? Boolean(nk.isActive) : true
            }))
          : [];

        // Normalize FAQs
        const rawFaqs = (profile.metadata?.faqs || profile.metadata?.businessFaqs || profile.faqs || profile.businessFaqs);
        profile.faqs = Array.isArray(rawFaqs)
          ? rawFaqs.map((f: any, idx: number): BusinessFaqItem => ({
              id: f.id || `faq-${idx}`,
              question: String(f.question || f.q || "").trim(),
              answer: String(f.answer || f.a || "").trim(),
              category: typeof f.category === "string" ? f.category.trim() : "",
              relatedProduct: typeof f.relatedProduct === "string" ? f.relatedProduct.trim() : "",
              relatedService: typeof f.relatedService === "string" ? f.relatedService.trim() : "",
              relatedLocation: typeof f.relatedLocation === "string" ? f.relatedLocation.trim() : "",
              keywords: Array.isArray(f.keywords)
                ? f.keywords.map((k: any) => String(k).trim()).filter(Boolean)
                : (typeof f.keywords === "string" && f.keywords ? f.keywords.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
              isActive: f.isActive !== undefined ? Boolean(f.isActive) : true,
              internalNotes: typeof (f.internalNotes ?? f.notes) === "string" ? String(f.internalNotes ?? f.notes).trim() : ""
            }))
          : [];

        // Normalize AI Suggestions
        const rawSuggestions = profile.metadata?.aiSuggestions || profile.aiSuggestions;
        profile.aiSuggestions = Array.isArray(rawSuggestions) ? rawSuggestions : [];

        // Normalize Media Assets (Images, Logos, Videos)
        const rawMedia = (profile.metadata?.mediaAssets || profile.mediaAssets);
        profile.mediaAssets = Array.isArray(rawMedia)
          ? rawMedia.map((m: any, idx: number): MediaAssetItem => ({
              id: m.id || `media-${idx}`,
              type: m.type || "IMAGE",
              subtype: m.subtype || (m.type === "VIDEO" ? "VIDEO" : "IMAGE_LANDSCAPE"),
              fileName: String(m.fileName || "asset").trim(),
              fileUrl: String(m.fileUrl || "").trim(),
              thumbnailUrl: typeof m.thumbnailUrl === "string" ? m.thumbnailUrl.trim() : undefined,
              mimeType: String(m.mimeType || (m.type === "VIDEO" ? "video/mp4" : "image/jpeg")).trim(),
              fileSize: Number(m.fileSize) || 0,
              width: Number(m.width) || 0,
              height: Number(m.height) || 0,
              aspectRatio: m.aspectRatio || (m.width && m.height ? `${(m.width / m.height).toFixed(2)}:1` : "1.91:1"),
              durationSeconds: m.durationSeconds !== undefined ? Number(m.durationSeconds) : undefined,
              status: m.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
              approved: Boolean(m.approved),
              legalRightsConfirmed: Boolean(m.legalRightsConfirmed),
              source: m.source || "UPLOAD",
              createdAt: m.createdAt || new Date().toISOString(),
              updatedAt: m.updatedAt || new Date().toISOString()
            }))
          : [];
      }
      return profile;
    } catch (err: any) {
      console.warn(`[CustomerBusinessProfileService] getProfile fallback:`, err.message);
      return null;
    }
  }

  /**
   * Validates and upserts a customer-scoped business & marketing profile.
   * Enforces max 15 total websites (1 primary + max 14 additional).
   */
  static async saveProfile(
    orgId: string,
    customerId: string,
    data: BusinessProfilePayload,
    isApproved = false
  ) {
    const cleanCid = (customerId || "").replace(/-/g, "").trim();
    if (!cleanCid) throw new Error("customerId is required");
    if (!orgId) throw new Error("organizationId is required");

    // 1. Enforce website limits (Primary + max 14 additional = max 15 total)
    const primaryWebsite = (data.primaryWebsite || "").trim();
    let rawAdditional = Array.isArray(data.additionalWebsites) ? data.additionalWebsites : [];

    // Filter and sanitize additional websites
    let additionalWebsites: WebsiteEntry[] = rawAdditional
      .filter((w: any) => w && typeof w.url === "string" && w.url.trim().length > 0)
      .map((w: any) => ({
        url: String(w.url).trim(),
        title: typeof w.title === "string" ? w.title.trim().slice(0, 150) : undefined,
        description: typeof w.description === "string" ? w.description.trim().slice(0, 500) : undefined,
        subPages: Array.isArray(w.subPages)
          ? w.subPages
              .filter((sp: any) => sp && typeof sp.url === "string" && sp.url.trim().length > 0)
              .slice(0, 15)
              .map((sp: any) => ({
                text: typeof sp.text === "string" ? sp.text.trim().slice(0, 100) : "Sub-page",
                url: String(sp.url).trim()
              }))
          : [],
        analyzedAt: w.analyzedAt || new Date().toISOString()
      }));

    if (additionalWebsites.length > 14) {
      throw new Error("Maximum of 14 additional websites permitted (15 websites total including primary).");
    }

    // 2. Sanitize arrays
    const cleanList = (arr: any, maxLen = 30): string[] => {
      if (!arr) return [];
      if (typeof arr === "string") {
        return arr
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
          .slice(0, maxLen);
      }
      if (!Array.isArray(arr)) return [];
      return arr
        .map((item: any) => String(item).trim())
        .filter((s: string) => s.length > 0)
        .slice(0, maxLen);
    };

    const cleanProducts = (arr: any): ProductItem[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((p: any) => p && (typeof p === "object" || typeof p === "string"))
        .map((p: any, idx: number): ProductItem => {
          if (typeof p === "string") {
            return {
              id: `prod-${Date.now()}-${idx}`,
              name: p.trim(),
              description: "",
              category: "",
              price: "",
              currency: "INR",
              productUrl: "",
              features: [],
              benefits: [],
              usp: "",
              targetAudience: "",
              isActive: true
            };
          }
          return {
            id: p.id || `prod-${Date.now()}-${idx}`,
            name: String(p.name || "").trim(),
            description: typeof p.description === "string" ? p.description.trim() : "",
            category: typeof p.category === "string" ? p.category.trim() : "",
            price: p.price !== undefined && p.price !== null ? String(p.price).trim() : "",
            currency: typeof p.currency === "string" && p.currency.trim() ? p.currency.trim() : "INR",
            productUrl: typeof p.productUrl === "string" ? p.productUrl.trim() : "",
            features: Array.isArray(p.features)
              ? p.features.map((f: any) => String(f).trim()).filter(Boolean)
              : (typeof p.features === "string" ? p.features.split(",").map((f: string) => f.trim()).filter(Boolean) : []),
            benefits: Array.isArray(p.benefits)
              ? p.benefits.map((b: any) => String(b).trim()).filter(Boolean)
              : (typeof p.benefits === "string" ? p.benefits.split(",").map((b: string) => b.trim()).filter(Boolean) : []),
            usp: typeof p.usp === "string" ? p.usp.trim() : "",
            targetAudience: typeof p.targetAudience === "string" ? p.targetAudience.trim() : "",
            isActive: p.isActive !== undefined ? Boolean(p.isActive) : true
          };
        })
        .filter((p: ProductItem) => p.name.length > 0);
    };

    const cleanServices = (arr: any): ServiceItem[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((s: any) => s && (typeof s === "object" || typeof s === "string"))
        .map((s: any, idx: number): ServiceItem => {
          if (typeof s === "string") {
            return {
              id: `serv-${Date.now()}-${idx}`,
              name: s.trim(),
              description: "",
              category: "",
              price: "",
              currency: "INR",
              serviceUrl: "",
              features: [],
              benefits: [],
              usp: "",
              targetAudience: "",
              isActive: true
            };
          }
          return {
            id: s.id || `serv-${Date.now()}-${idx}`,
            name: String(s.name || "").trim(),
            description: typeof s.description === "string" ? s.description.trim() : "",
            category: typeof s.category === "string" ? s.category.trim() : "",
            price: s.price !== undefined && s.price !== null ? String(s.price).trim() : "",
            currency: typeof s.currency === "string" && s.currency.trim() ? s.currency.trim() : "INR",
            serviceUrl: typeof s.serviceUrl === "string" ? s.serviceUrl.trim() : "",
            features: Array.isArray(s.features)
              ? s.features.map((f: any) => String(f).trim()).filter(Boolean)
              : (typeof s.features === "string" ? s.features.split(",").map((f: string) => f.trim()).filter(Boolean) : []),
            benefits: Array.isArray(s.benefits)
              ? s.benefits.map((b: any) => String(b).trim()).filter(Boolean)
              : (typeof s.benefits === "string" ? s.benefits.split(",").map((b: string) => b.trim()).filter(Boolean) : []),
            usp: typeof s.usp === "string" ? s.usp.trim() : "",
            targetAudience: typeof s.targetAudience === "string" ? s.targetAudience.trim() : "",
            isActive: s.isActive !== undefined ? Boolean(s.isActive) : true
          };
        })
        .filter((s: ServiceItem) => s.name.length > 0);
    };

    const cleanCustomerPersonas = (arr: any): CustomerPersonaItem[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((p: any) => p && typeof p === "object" && String(p.name || "").trim().length > 0)
        .map((p: any, idx: number): CustomerPersonaItem => ({
          id: p.id || `per-${Date.now()}-${idx}`,
          name: String(p.name).trim(),
          shortDescription: typeof p.shortDescription === "string" ? p.shortDescription.trim() : "",
          ageRange: typeof p.ageRange === "string" ? p.ageRange.trim() : "",
          gender: typeof p.gender === "string" ? p.gender.trim() : "All",
          occupation: typeof p.occupation === "string" ? p.occupation.trim() : "",
          customerType: typeof p.customerType === "string" ? p.customerType.trim() : "Both",
          locations: cleanList(p.locations),
          languages: cleanList(p.languages),
          interests: cleanList(p.interests),
          painPoints: cleanList(p.painPoints),
          needs: cleanList(p.needs),
          buyingIntent: typeof p.buyingIntent === "string" ? p.buyingIntent.trim() : "",
          purchaseBehavior: typeof p.purchaseBehavior === "string" ? p.purchaseBehavior.trim() : "",
          preferredOfferings: cleanList(p.preferredOfferings),
          additionalNotes: typeof p.additionalNotes === "string" ? p.additionalNotes.trim() : "",
          isActive: p.isActive !== undefined ? Boolean(p.isActive) : true
        }));
    };

    const cleanTargetAudiences = (arr: any): TargetAudienceItem[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((a: any) => a && typeof a === "object" && String(a.name || "").trim().length > 0)
        .map((a: any, idx: number): TargetAudienceItem => ({
          id: a.id || `aud-${Date.now()}-${idx}`,
          name: String(a.name).trim(),
          ageRange: typeof a.ageRange === "string" ? a.ageRange.trim() : "",
          gender: typeof a.gender === "string" ? a.gender.trim() : "All",
          customerType: typeof a.customerType === "string" ? a.customerType.trim() : "Both",
          locations: cleanList(a.locations),
          languages: cleanList(a.languages),
          interests: cleanList(a.interests),
          painPoints: cleanList(a.painPoints),
          needs: cleanList(a.needs),
          buyingIntent: typeof a.buyingIntent === "string" ? a.buyingIntent.trim() : "",
          purchaseBehavior: typeof a.purchaseBehavior === "string" ? a.purchaseBehavior.trim() : "",
          additionalNotes: typeof a.additionalNotes === "string" ? a.additionalNotes.trim() : "",
          isActive: a.isActive !== undefined ? Boolean(a.isActive) : true
        }));
    };

    const cleanLocationRecords = (arr: any): LocationItem[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((l: any) => l && typeof l === "object" && String(l.locationName || l.name || "").trim().length > 0)
        .map((l: any, idx: number): LocationItem => ({
          id: l.id || `loc-${Date.now()}-${idx}`,
          locationName: String(l.locationName || l.name).trim(),
          country: String(l.country || "India").trim(),
          state: String(l.state || "").trim(),
          city: String(l.city || "").trim(),
          areaLocality: typeof l.areaLocality === "string" ? l.areaLocality.trim() : (typeof l.area === "string" ? l.area.trim() : ""),
          pincode: typeof l.pincode === "string" ? l.pincode.trim() : (l.pincode ? String(l.pincode).trim() : ""),
          fullAddress: typeof l.fullAddress === "string" ? l.fullAddress.trim() : (typeof l.address === "string" ? l.address.trim() : ""),
          locationType: ["Headquarters", "Branch", "Store", "Service Area"].includes(l.locationType) ? l.locationType : "Branch",
          latitude: l.latitude !== undefined && l.latitude !== null && l.latitude !== "" ? String(l.latitude).trim() : "",
          longitude: l.longitude !== undefined && l.longitude !== null && l.longitude !== "" ? String(l.longitude).trim() : "",
          radius: typeof l.radius === "string" ? l.radius.trim() : (l.radius ? String(l.radius).trim() : ""),
          languages: cleanList(l.languages),
          additionalNotes: typeof l.additionalNotes === "string" ? l.additionalNotes.trim() : (typeof l.notes === "string" ? l.notes.trim() : ""),
          isActive: l.isActive !== undefined ? Boolean(l.isActive) : true
        }));
    };

    const cleanConversionGoals = (arr: any): ConversionGoalItem[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((g: any) => g && typeof g === "object" && String(g.goalName || g.name || "").trim().length > 0)
        .map((g: any, idx: number): ConversionGoalItem => ({
          id: g.id || `goal-${Date.now()}-${idx}`,
          goalName: String(g.goalName || g.name).trim(),
          conversionType: typeof g.conversionType === "string" && g.conversionType.trim() ? g.conversionType.trim() : "Lead Form",
          source: typeof g.source === "string" && g.source.trim() ? g.source.trim() : "Website",
          description: typeof g.description === "string" ? g.description.trim() : "",
          conversionValue: g.conversionValue !== undefined && g.conversionValue !== null && g.conversionValue !== "" ? String(g.conversionValue).trim() : "",
          currency: typeof g.currency === "string" && g.currency.trim() ? g.currency.trim() : "INR",
          isPrimary: g.isPrimary !== undefined ? Boolean(g.isPrimary) : true,
          isActive: g.isActive !== undefined ? Boolean(g.isActive) : true,
          additionalNotes: typeof g.additionalNotes === "string" ? g.additionalNotes.trim() : ""
        }));
    };

    const cleanMultilineOrList = (val: any, maxLen = 50): string[] => {
      if (!val) return [];
      if (typeof val === "string") {
        return val
          .split(/[\n,]+/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
          .slice(0, maxLen);
      }
      if (!Array.isArray(val)) return [];
      return val
        .map((item: any) => String(item).trim())
        .filter((s: string) => s.length > 0)
        .slice(0, maxLen);
    };

    const cleanBrandProfile = (b: any): BrandProfileData | undefined => {
      if (!b || typeof b !== "object") return undefined;
      return {
        brandName: typeof b.brandName === "string" ? b.brandName.trim() : undefined,
        brandTagline: typeof b.brandTagline === "string" ? b.brandTagline.trim() : undefined,
        brandDescription: typeof b.brandDescription === "string" ? b.brandDescription.trim() : undefined,
        brandWebsite: typeof b.brandWebsite === "string" ? b.brandWebsite.trim() : undefined,
        logoUrl: typeof b.logoUrl === "string" ? b.logoUrl.trim() : undefined,
        brandColors: cleanList(b.brandColors),
        brandKeywords: cleanList(b.brandKeywords),
        brandVoice: cleanList(b.brandVoice),
        preferredCta: typeof b.preferredCta === "string" ? b.preferredCta.trim() : undefined,
        preferredMessaging: typeof b.preferredMessaging === "string" ? b.preferredMessaging.trim() : undefined,
        brandUsps: cleanMultilineOrList(b.brandUsps),
        wordsToPrefer: cleanList(b.wordsToPrefer),
        wordsToAvoid: cleanList(b.wordsToAvoid),
        advertisingDos: cleanMultilineOrList(b.advertisingDos),
        advertisingDonts: cleanMultilineOrList(b.advertisingDonts),
        promotionalStyle: typeof b.promotionalStyle === "string" ? b.promotionalStyle.trim() : undefined,
        discountRules: typeof b.discountRules === "string" ? b.discountRules.trim() : undefined,
        priceRules: typeof b.priceRules === "string" ? b.priceRules.trim() : undefined,
        additionalNotes: typeof b.additionalNotes === "string" ? b.additionalNotes.trim() : undefined
      };
    };

    const cleanCompetitors = (arr: any): CompetitorItem[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((c: any) => c && typeof c === "object" && String(c.competitorName || c.name || "").trim().length > 0)
        .map((c: any, idx: number): CompetitorItem => ({
          id: c.id || `comp-${Date.now()}-${idx}`,
          competitorName: String(c.competitorName || c.name).trim(),
          competitorWebsite: typeof (c.competitorWebsite ?? c.website) === "string" ? String(c.competitorWebsite ?? c.website).trim() : undefined,
          competitorDescription: typeof (c.competitorDescription ?? c.description) === "string" ? String(c.competitorDescription ?? c.description).trim() : undefined,
          industry: typeof c.industry === "string" ? c.industry.trim() : undefined,
          products: cleanList(c.products),
          services: cleanList(c.services),
          targetMarket: typeof c.targetMarket === "string" ? c.targetMarket.trim() : undefined,
          locations: cleanList(c.locations),
          mainUsps: cleanMultilineOrList(c.mainUsps ?? c.usps),
          competitorNotes: typeof (c.competitorNotes ?? c.notes) === "string" ? String(c.competitorNotes ?? c.notes).trim() : undefined,
          isActive: c.isActive !== undefined ? Boolean(c.isActive) : true
        }));
    };

    const cleanSeoKeywords = (arr: any): SeoKeywordItem[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((k: any) => k && typeof k === "object" && String(k.keyword || "").trim().length > 0)
        .map((k: any, idx: number): SeoKeywordItem => ({
          id: k.id || `kw-${Date.now()}-${idx}`,
          keyword: String(k.keyword).trim(),
          keywordType: typeof k.keywordType === "string" && k.keywordType.trim() ? k.keywordType.trim() : "Primary",
          relatedOffering: typeof k.relatedOffering === "string" ? k.relatedOffering.trim() : undefined,
          targetLocation: typeof k.targetLocation === "string" ? k.targetLocation.trim() : undefined,
          searchIntent: typeof k.searchIntent === "string" && k.searchIntent.trim() ? k.searchIntent.trim() : "Commercial",
          notes: typeof k.notes === "string" ? k.notes.trim() : undefined,
          isActive: k.isActive !== undefined ? Boolean(k.isActive) : true
        }));
    };

    const cleanNegativeKeywords = (arr: any): NegativeKeywordItem[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((nk: any) => nk && typeof nk === "object" && String(nk.keyword || "").trim().length > 0)
        .map((nk: any, idx: number): NegativeKeywordItem => ({
          id: nk.id || `nkw-${Date.now()}-${idx}`,
          keyword: String(nk.keyword).trim(),
          matchType: typeof nk.matchType === "string" && nk.matchType.trim() ? nk.matchType.trim() : "Phrase",
          reason: typeof (nk.reason ?? nk.notes) === "string" ? String(nk.reason ?? nk.notes).trim() : undefined,
          isActive: nk.isActive !== undefined ? Boolean(nk.isActive) : true
        }));
    };

    const cleanFaqs = (arr: any): BusinessFaqItem[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((f: any) => f && typeof f === "object" && String(f.question || "").trim().length > 0)
        .map((f: any, idx: number): BusinessFaqItem => ({
          id: f.id || `faq-${Date.now()}-${idx}`,
          question: String(f.question).trim(),
          answer: String(f.answer || "").trim(),
          category: typeof f.category === "string" ? f.category.trim() : undefined,
          relatedProduct: typeof f.relatedProduct === "string" ? f.relatedProduct.trim() : undefined,
          relatedService: typeof f.relatedService === "string" ? f.relatedService.trim() : undefined,
          relatedLocation: typeof f.relatedLocation === "string" ? f.relatedLocation.trim() : undefined,
          keywords: cleanList(f.keywords),
          isActive: f.isActive !== undefined ? Boolean(f.isActive) : true,
          internalNotes: typeof (f.internalNotes ?? f.notes) === "string" ? String(f.internalNotes ?? f.notes).trim() : undefined
        }));
    };

    const cleanAiSuggestions = (arr: any): AiSuggestionItem[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((item: any) => item && typeof item === "object" && item.field)
        .map((s: any, idx: number): AiSuggestionItem => ({
          id: s.id || `sugg-${Date.now()}-${idx}`,
          section: s.section || "business",
          field: String(s.field).trim(),
          label: String(s.label || s.field).trim(),
          suggestedValue: s.suggestedValue,
          currentValue: s.currentValue,
          sourceUrl: String(s.sourceUrl || "").trim(),
          status: (["new", "existing", "conflict"].includes(s.status) ? s.status : "new") as AiSuggestionStatus,
          explanation: typeof s.explanation === "string" ? s.explanation.trim() : undefined,
          applied: Boolean(s.applied),
          rejected: Boolean(s.rejected)
        }));
    };

    const cleanMediaAssets = (arr: any, isProfileApproved = false): MediaAssetItem[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((m: any) => m && typeof m === "object" && m.fileUrl && m.fileName)
        .map((m: any, idx: number): MediaAssetItem => {
          const w = Number(m.width) || 0;
          const h = Number(m.height) || 0;
          const validation = validateMediaAsset(m);
          const subtype = (validation.detectedSubtype || m.subtype || (m.type === "VIDEO" ? "VIDEO" : "IMAGE_LANDSCAPE")) as MediaAssetSubtype;
          const aspectRatio = validation.detectedAspectRatio || m.aspectRatio || (w && h ? `${(w / h).toFixed(2)}:1` : "1:1");
          const legalRightsConfirmed = Boolean(m.legalRightsConfirmed);
          const status = m.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
          // Only assets with legalRightsConfirmed=true can become approved/reusable profile assets
          const approved = Boolean(isProfileApproved && legalRightsConfirmed && (m.approved !== false));

          return {
            id: m.id || `media-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
            type: (m.type && ["IMAGE", "LOGO", "VIDEO"].includes(m.type) ? m.type : "IMAGE") as MediaAssetType,
            subtype,
            fileName: String(m.fileName).trim(),
            fileUrl: String(m.fileUrl).trim(),
            thumbnailUrl: typeof m.thumbnailUrl === "string" ? m.thumbnailUrl.trim() : (m.type === "VIDEO" ? undefined : m.fileUrl),
            mimeType: String(m.mimeType || (m.type === "VIDEO" ? "video/mp4" : "image/jpeg")).trim(),
            fileSize: Number(m.fileSize) || 0,
            width: w,
            height: h,
            aspectRatio,
            durationSeconds: m.durationSeconds !== undefined ? Number(m.durationSeconds) : undefined,
            status,
            approved,
            legalRightsConfirmed,
            source: typeof m.source === "string" ? m.source.trim() : "UPLOAD",
            createdAt: m.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        });
    };

    const products = cleanProducts(data.products);
    const services = cleanServices(data.services);
    const targetAudiences = cleanTargetAudiences(data.targetAudiences);
    const customerPersonas = cleanCustomerPersonas(data.customerPersonas);
    const locationRecords = cleanLocationRecords(
      data.locationRecords || data.locationsMaster || (Array.isArray(data.locations) && typeof data.locations[0] === "object" ? data.locations : [])
    );
    const conversionGoals = cleanConversionGoals(data.conversionGoals);
    const brandProfile = cleanBrandProfile(data.brandProfile);
    const competitors = cleanCompetitors(data.competitors);
    const seoKeywords = cleanSeoKeywords(data.seoKeywords);
    const negativeKeywords = cleanNegativeKeywords(data.negativeKeywords);
    const faqs = cleanFaqs(data.faqs || (data as any).businessFaqs);
    const aiSuggestions = cleanAiSuggestions(data.aiSuggestions);
    const mediaAssets = cleanMediaAssets(data.mediaAssets, Boolean(isApproved));
    const keyOfferings = cleanList(data.keyOfferings);
    const locations = cleanList(data.locations);
    const serviceAreas = cleanList(data.serviceAreas);
    const languagesServed = cleanList(data.languagesServed);

    // 3. Sanitize App Details
    let appDetails: AppDetailEntry[] = [];
    if (Array.isArray(data.appDetails)) {
      appDetails = data.appDetails
        .filter((a: any) => a && typeof a.appId === "string" && a.appId.trim().length > 0)
        .map((a: any) => ({
          id: a.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          platform: a.platform === "IOS" ? "IOS" : "ANDROID",
          appId: String(a.appId).trim(),
          appName: typeof a.appName === "string" ? a.appName.trim().slice(0, 100) : undefined,
          appUrl: typeof a.appUrl === "string" ? a.appUrl.trim() : undefined
        }));
    }

    const approvedAt = isApproved ? new Date() : undefined;

    const businessInfoPayload = {
      legalBusinessName: data.legalBusinessName?.trim() || null,
      businessCategory: data.businessCategory?.trim() || null,
      customerType: data.customerType?.trim() || null,
      businessModel: data.businessModel?.trim() || null,
      businessEmail: data.businessEmail?.trim() || null,
      businessPhone: data.businessPhone?.trim() || null,
      whatsappNumber: data.whatsappNumber?.trim() || null,
      businessAddress: data.businessAddress?.trim() || null,
      serviceAreas,
      languagesServed
    };

    const upsertData = {
      businessName: data.businessName?.trim() || null,
      legalBusinessName: businessInfoPayload.legalBusinessName,
      industry: data.industry?.trim() || null,
      businessCategory: businessInfoPayload.businessCategory,
      businessDescription: data.businessDescription?.trim() || null,
      targetAudience: data.targetAudience?.trim() || null,
      customerType: businessInfoPayload.customerType,
      businessModel: businessInfoPayload.businessModel,
      businessEmail: businessInfoPayload.businessEmail,
      businessPhone: businessInfoPayload.businessPhone,
      whatsappNumber: businessInfoPayload.whatsappNumber,
      businessAddress: businessInfoPayload.businessAddress,
      serviceAreas,
      languagesServed,
      primaryWebsite: primaryWebsite || null,
      additionalWebsites,
      products,
      services,
      keyOfferings,
      locations,
      hasMerchantAccount: Boolean(data.hasMerchantAccount),
      merchantCenterId: data.hasMerchantAccount && data.merchantCenterId ? String(data.merchantCenterId).trim() : null,
      merchantDetails: data.merchantDetails || null,
      hasAppAccount: Boolean(data.hasAppAccount),
      appDetails: data.hasAppAccount ? appDetails : [],
      isApproved: Boolean(isApproved),
      ...(approvedAt ? { approvedAt } : {}),
      metadata: {
        ...(data.metadata || {}),
        businessInfo: businessInfoPayload,
        targetAudiences,
        customerPersonas,
        locationRecords,
        conversionGoals,
        brandProfile,
        competitors,
        seoKeywords,
        negativeKeywords,
        faqs,
        aiSuggestions,
        mediaAssets
      }
    };

    const profile = await (prisma as any).googleAdsCustomerProfile.upsert({
      where: {
        organizationId_customerId: {
          organizationId: orgId,
          customerId: cleanCid
        }
      },
      update: upsertData,
      create: {
        organizationId: orgId,
        customerId: cleanCid,
        ...upsertData
      }
    });

    profile.targetAudiences = targetAudiences;
    profile.customerPersonas = customerPersonas;
    profile.locationRecords = locationRecords;
    profile.conversionGoals = conversionGoals;
    profile.brandProfile = brandProfile;
    profile.competitors = competitors;
    profile.seoKeywords = seoKeywords;
    profile.negativeKeywords = negativeKeywords;
    profile.faqs = faqs;
    profile.aiSuggestions = aiSuggestions;
    profile.mediaAssets = mediaAssets;

    return profile;
  }

  /**
   * Adds or updates a single media asset scoped to organizationId + customerId.
   */
  static async upsertMediaAsset(orgId: string, customerId: string, asset: Partial<MediaAssetItem>) {
    const profile = await this.getProfile(orgId, customerId);
    if (!profile) throw new Error("Customer profile not found");
    const validation = validateMediaAsset(asset);
    if (!validation.isValid) throw new Error(validation.error || "Invalid media asset");

    const existing: MediaAssetItem[] = Array.isArray(profile.mediaAssets) ? profile.mediaAssets : [];
    const nowIso = new Date().toISOString();
    const assetId = asset.id || `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const newItem: MediaAssetItem = {
      id: assetId,
      type: asset.type!,
      subtype: validation.detectedSubtype || asset.subtype || (asset.type === "VIDEO" ? "VIDEO" : "IMAGE_LANDSCAPE"),
      fileName: asset.fileName!,
      fileUrl: asset.fileUrl!,
      thumbnailUrl: asset.thumbnailUrl || (asset.type === "VIDEO" ? undefined : asset.fileUrl),
      mimeType: asset.mimeType || (asset.type === "VIDEO" ? "video/mp4" : "image/jpeg"),
      fileSize: Number(asset.fileSize) || 0,
      width: Number(asset.width) || 0,
      height: Number(asset.height) || 0,
      aspectRatio: validation.detectedAspectRatio || asset.aspectRatio || "1:1",
      durationSeconds: asset.durationSeconds !== undefined ? Number(asset.durationSeconds) : undefined,
      status: asset.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      approved: Boolean(profile.isApproved && asset.legalRightsConfirmed && (asset.approved !== false)),
      legalRightsConfirmed: Boolean(asset.legalRightsConfirmed),
      source: asset.source || "UPLOAD",
      createdAt: asset.createdAt || nowIso,
      updatedAt: nowIso
    };

    const idx = existing.findIndex(m => m.id === assetId);
    let updated: MediaAssetItem[];
    if (idx >= 0) {
      updated = [...existing];
      updated[idx] = { ...existing[idx], ...newItem, updatedAt: nowIso };
    } else {
      updated = [newItem, ...existing];
    }

    await this.saveProfile(orgId, customerId, {
      ...profile,
      mediaAssets: updated
    }, Boolean(profile.isApproved));

    return newItem;
  }

  /**
   * Deletes a media asset by ID scoped to organizationId + customerId.
   */
  static async deleteMediaAsset(orgId: string, customerId: string, assetId: string) {
    const profile = await this.getProfile(orgId, customerId);
    if (!profile) throw new Error("Customer profile not found");
    const existing: MediaAssetItem[] = Array.isArray(profile.mediaAssets) ? profile.mediaAssets : [];
    const filtered = existing.filter(m => m.id !== assetId);
    await this.saveProfile(orgId, customerId, {
      ...profile,
      mediaAssets: filtered
    }, Boolean(profile.isApproved));
    return { success: true, remainingCount: filtered.length };
  }

  /**
   * Toggles media asset status (ACTIVE / INACTIVE) scoped to organizationId + customerId.
   */
  static async toggleMediaAssetStatus(orgId: string, customerId: string, assetId: string, status?: "ACTIVE" | "INACTIVE") {
    const profile = await this.getProfile(orgId, customerId);
    if (!profile) throw new Error("Customer profile not found");
    const existing: MediaAssetItem[] = Array.isArray(profile.mediaAssets) ? profile.mediaAssets : [];
    const item = existing.find(m => m.id === assetId);
    if (!item) throw new Error("Media asset not found");

    const newStatus = status || (item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
    item.status = newStatus;
    item.updatedAt = new Date().toISOString();

    await this.saveProfile(orgId, customerId, {
      ...profile,
      mediaAssets: existing
    }, Boolean(profile.isApproved));

    return item;
  }

  /**
   * Generates classified AI Suggestions comparing discovered information against existing profile data.
   * Categorizes each discovered item as "new", "existing", or "conflict".
   */
  static generateClassifiedSuggestions(
    ai: Record<string, any>,
    existingProfile: any,
    sourceUrl: string
  ): AiSuggestionItem[] {
    const suggestions: AiSuggestionItem[] = [];
    const norm = (val: any) =>
      typeof val === "string" ? val.trim().toLowerCase().replace(/[^a-z0-9]/g, "") : "";

    // 1. Business Name
    if (ai.businessName && typeof ai.businessName === "string" && ai.businessName.trim()) {
      const suggested = ai.businessName.trim();
      const current = existingProfile?.businessName ? String(existingProfile.businessName).trim() : "";
      let status: AiSuggestionStatus = "new";
      let explanation = "New business name extracted from website title/content";
      if (current) {
        if (norm(suggested) === norm(current)) {
          status = "existing";
          explanation = `Matches existing business name "${current}"`;
        } else {
          status = "conflict";
          explanation = `Suggested name "${suggested}" differs from existing "${current}"`;
        }
      }
      suggestions.push({
        id: `sugg-bname-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        section: "business",
        field: "businessName",
        label: "Business Name",
        suggestedValue: suggested,
        currentValue: current || undefined,
        sourceUrl,
        status,
        explanation
      });
    }

    // 2. Industry
    if (ai.industry && typeof ai.industry === "string" && ai.industry.trim()) {
      const suggested = ai.industry.trim();
      const current = existingProfile?.industry ? String(existingProfile.industry).trim() : "";
      let status: AiSuggestionStatus = "new";
      let explanation = "Industry category identified from website";
      if (current) {
        if (norm(suggested) === norm(current)) {
          status = "existing";
          explanation = `Matches current industry "${current}"`;
        } else {
          status = "conflict";
          explanation = `Suggested industry "${suggested}" differs from current "${current}"`;
        }
      }
      suggestions.push({
        id: `sugg-ind-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        section: "business",
        field: "industry",
        label: "Industry / Niche",
        suggestedValue: suggested,
        currentValue: current || undefined,
        sourceUrl,
        status,
        explanation
      });
    }

    // 3. Business Description
    if (ai.businessDescription && typeof ai.businessDescription === "string" && ai.businessDescription.trim()) {
      const suggested = ai.businessDescription.trim();
      const current = existingProfile?.businessDescription ? String(existingProfile.businessDescription).trim() : "";
      let status: AiSuggestionStatus = "new";
      let explanation = "New business summary generated from site content";
      if (current) {
        if (
          norm(suggested) === norm(current) ||
          current.toLowerCase().includes(suggested.toLowerCase()) ||
          suggested.toLowerCase().includes(current.toLowerCase())
        ) {
          status = "existing";
          explanation = "Matches or encompasses existing business description";
        } else {
          status = "conflict";
          explanation = "Alternative business description generated by AI";
        }
      }
      suggestions.push({
        id: `sugg-desc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        section: "business",
        field: "businessDescription",
        label: "Business Description",
        suggestedValue: suggested,
        currentValue: current || undefined,
        sourceUrl,
        status,
        explanation
      });
    }

    // 4. Products
    const existingProducts: string[] = (existingProfile?.products || []).map((p: any) =>
      typeof p === "string" ? p : p?.name ? String(p.name) : ""
    );
    if (Array.isArray(ai.products)) {
      ai.products.forEach((prod: any, idx: number) => {
        const pName = typeof prod === "string" ? prod.trim() : (prod?.name ? String(prod.name).trim() : "");
        const pDesc = typeof prod === "object" ? prod?.description : undefined;
        if (!pName) return;
        const exists = existingProducts.some((ep) => norm(ep) === norm(pName));
        suggestions.push({
          id: `sugg-prod-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          section: "products",
          field: "products",
          label: `Product: ${pName}`,
          suggestedValue: {
            name: pName,
            description: pDesc,
            isActive: true
          },
          currentValue: exists ? pName : undefined,
          sourceUrl,
          status: exists ? "existing" : "new",
          explanation: exists ? `Product "${pName}" is already present in your profile` : `New product discovered on website`
        });
      });
    }

    // 5. Services
    const existingServices: string[] = (existingProfile?.services || []).map((s: any) =>
      typeof s === "string" ? s : s?.name ? String(s.name) : ""
    );
    if (Array.isArray(ai.services)) {
      ai.services.forEach((serv: any, idx: number) => {
        const sName = typeof serv === "string" ? serv.trim() : (serv?.name ? String(serv.name).trim() : "");
        const sDesc = typeof serv === "object" ? serv?.description : undefined;
        if (!sName) return;
        const exists = existingServices.some((es) => norm(es) === norm(sName));
        suggestions.push({
          id: `sugg-serv-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          section: "services",
          field: "services",
          label: `Service: ${sName}`,
          suggestedValue: {
            name: sName,
            description: sDesc,
            isActive: true
          },
          currentValue: exists ? sName : undefined,
          sourceUrl,
          status: exists ? "existing" : "new",
          explanation: exists ? `Service "${sName}" is already present in your profile` : `New service offering discovered on website`
        });
      });
    }

    // 6. Target Audience
    if (ai.targetAudience && typeof ai.targetAudience === "string" && ai.targetAudience.trim()) {
      const suggested = ai.targetAudience.trim();
      const current = existingProfile?.targetAudience ? String(existingProfile.targetAudience).trim() : "";
      let status: AiSuggestionStatus = "new";
      let explanation = "Target audience profile inferred from offerings";
      if (current) {
        if (norm(suggested) === norm(current)) {
          status = "existing";
          explanation = "Matches current target audience";
        } else {
          status = "conflict";
          explanation = "Differs from existing target audience";
        }
      }
      suggestions.push({
        id: `sugg-aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        section: "target_audience",
        field: "targetAudience",
        label: "Target Audience",
        suggestedValue: suggested,
        currentValue: current || undefined,
        sourceUrl,
        status,
        explanation
      });
    }

    // 7. Personas
    const existingPersonas: string[] = (existingProfile?.customerPersonas || []).map((cp: any) =>
      typeof cp === "string" ? cp : cp?.personaTitle || cp?.name || ""
    );
    if (Array.isArray(ai.customerPersonas)) {
      ai.customerPersonas.forEach((persona: any, idx: number) => {
        const title = typeof persona === "string" ? persona.trim() : (persona?.personaTitle ? String(persona.personaTitle).trim() : "");
        const desc = typeof persona === "object" ? persona?.description : undefined;
        if (!title) return;
        const exists = existingPersonas.some((ep) => norm(ep) === norm(title));
        suggestions.push({
          id: `sugg-pers-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          section: "target_audience",
          field: "customerPersonas",
          label: `Persona: ${title}`,
          suggestedValue: {
            personaTitle: title,
            summary: desc || `Target customer persona discovered for ${title}`
          },
          currentValue: exists ? title : undefined,
          sourceUrl,
          status: exists ? "existing" : "new",
          explanation: exists ? `Persona "${title}" already exists in profile` : `New buyer persona inferred from website`
        });
      });
    }

    // 8. Locations
    const existingLocations: string[] = (existingProfile?.locations || existingProfile?.locationRecords || []).map((l: any) =>
      typeof l === "string" ? l : l?.locationName || l?.name || ""
    );
    if (Array.isArray(ai.locations)) {
      ai.locations.forEach((loc: any, idx: number) => {
        const locName = typeof loc === "string" ? loc.trim() : (loc?.locationName ? String(loc.locationName).trim() : "");
        if (!locName) return;
        const exists = existingLocations.some((el) => norm(el) === norm(locName));
        suggestions.push({
          id: `sugg-loc-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          section: "locations",
          field: "locations",
          label: `Location: ${locName}`,
          suggestedValue: locName,
          currentValue: exists ? locName : undefined,
          sourceUrl,
          status: exists ? "existing" : "new",
          explanation: exists ? `Location "${locName}" is already configured` : `Target location identified from address or service context`
        });
      });
    }

    // 9. Brand Profile (Tagline, Voice, USPs)
    if (ai.brandTagline && typeof ai.brandTagline === "string" && ai.brandTagline.trim()) {
      const suggested = ai.brandTagline.trim();
      const current = existingProfile?.brandProfile?.brandTagline ? String(existingProfile.brandProfile.brandTagline).trim() : "";
      let status: AiSuggestionStatus = "new";
      let explanation = "Brand tagline or slogan discovered on website";
      if (current) {
        if (norm(suggested) === norm(current)) {
          status = "existing";
          explanation = "Matches current brand tagline";
        } else {
          status = "conflict";
          explanation = `Suggested tagline "${suggested}" differs from existing "${current}"`;
        }
      }
      suggestions.push({
        id: `sugg-tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        section: "brand_profile",
        field: "brandTagline",
        label: "Brand Tagline",
        suggestedValue: suggested,
        currentValue: current || undefined,
        sourceUrl,
        status,
        explanation
      });
    }

    if (ai.brandVoice && typeof ai.brandVoice === "string" && ai.brandVoice.trim()) {
      const suggested = ai.brandVoice.trim();
      const current = existingProfile?.brandProfile?.brandVoice ? String(existingProfile.brandProfile.brandVoice).trim() : "";
      let status: AiSuggestionStatus = "new";
      let explanation = "Brand voice style inferred from website copy";
      if (current) {
        if (norm(suggested) === norm(current)) {
          status = "existing";
          explanation = "Matches current brand voice";
        } else {
          status = "conflict";
          explanation = `Suggested tone "${suggested}" differs from current "${current}"`;
        }
      }
      suggestions.push({
        id: `sugg-voice-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        section: "brand_profile",
        field: "brandVoice",
        label: "Brand Voice",
        suggestedValue: suggested,
        currentValue: current || undefined,
        sourceUrl,
        status,
        explanation
      });
    }

    const existingUsps: string[] = (
      existingProfile?.brandProfile?.brandUsps || existingProfile?.keyOfferings || []
    ).map((u: any) => String(u).trim());
    if (Array.isArray(ai.brandUsps || ai.keyOfferings)) {
      const usps = ai.brandUsps || ai.keyOfferings;
      usps.forEach((usp: any, idx: number) => {
        const uspStr = typeof usp === "string" ? usp.trim() : (usp?.title || usp?.text || "");
        if (!uspStr) return;
        const exists = existingUsps.some((eu) => norm(eu) === norm(uspStr));
        suggestions.push({
          id: `sugg-usp-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          section: "brand_profile",
          field: "brandUsps",
          label: `Brand USP: ${uspStr}`,
          suggestedValue: uspStr,
          currentValue: exists ? uspStr : undefined,
          sourceUrl,
          status: exists ? "existing" : "new",
          explanation: exists ? `Value proposition already present in profile` : `Key differentiator discovered from website USPs`
        });
      });
    }

    // 10. Competitors
    const existingCompetitors: string[] = (existingProfile?.competitors || []).map((c: any) =>
      c?.competitorName || c?.name || ""
    );
    if (Array.isArray(ai.competitors)) {
      ai.competitors.forEach((comp: any, idx: number) => {
        const cName = typeof comp === "string" ? comp.trim() : (comp?.competitorName ? String(comp.competitorName).trim() : (comp?.name ? String(comp.name).trim() : ""));
        const cNotes = typeof comp === "object" ? (comp?.notes || comp?.competitorNotes || comp?.description) : undefined;
        if (!cName) return;
        const exists = existingCompetitors.some((ec) => norm(ec) === norm(cName));
        suggestions.push({
          id: `sugg-comp-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          section: "competitors",
          field: "competitors",
          label: `Competitor: ${cName}`,
          suggestedValue: {
            competitorName: cName,
            competitorDescription: cNotes || `Market competitor discovered during industry analysis`,
            isActive: true
          },
          currentValue: exists ? cName : undefined,
          sourceUrl,
          status: exists ? "existing" : "new",
          explanation: exists ? `Competitor "${cName}" is already in your profile` : `Industry competitor identified for benchmarking`
        });
      });
    }

    // 11. SEO Keywords
    const existingKeywords: string[] = (existingProfile?.seoKeywords || []).map((k: any) =>
      k?.keyword || k?.name || ""
    );
    if (Array.isArray(ai.seoKeywords)) {
      ai.seoKeywords.forEach((kw: any, idx: number) => {
        const kwStr = typeof kw === "string" ? kw.trim() : (kw?.keyword ? String(kw.keyword).trim() : "");
        const kwType = typeof kw === "object" && kw?.keywordType ? kw.keywordType : "Primary";
        const kwIntent = typeof kw === "object" && kw?.searchIntent ? kw.searchIntent : "Commercial";
        if (!kwStr) return;
        const exists = existingKeywords.some((ek) => norm(ek) === norm(kwStr));
        suggestions.push({
          id: `sugg-kw-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          section: "seo_keywords",
          field: "seoKeywords",
          label: `Keyword: ${kwStr}`,
          suggestedValue: {
            keyword: kwStr,
            keywordType: kwType,
            searchIntent: kwIntent,
            isActive: true
          },
          currentValue: exists ? kwStr : undefined,
          sourceUrl,
          status: exists ? "existing" : "new",
          explanation: exists ? `Keyword "${kwStr}" already exists in profile` : `High-relevance search term discovered on page`
        });
      });
    }

    // 12. Business FAQs
    const existingFaqs: Array<{ q: string; a: string }> = (existingProfile?.faqs || []).map((f: any) => ({
      q: String(f?.question || "").trim(),
      a: String(f?.answer || "").trim()
    }));
    if (Array.isArray(ai.faqs)) {
      ai.faqs.forEach((faq: any, idx: number) => {
        const qStr = typeof faq === "object" ? String(faq?.question || faq?.q || "").trim() : "";
        const aStr = typeof faq === "object" ? String(faq?.answer || faq?.a || "").trim() : "";
        const catStr = typeof faq === "object" ? String(faq?.category || "General").trim() : "General";
        if (!qStr || !aStr) return;
        const match = existingFaqs.find((ef) => norm(ef.q) === norm(qStr));
        let status: AiSuggestionStatus = "new";
        let explanation = "Common customer question and answer discovered from content";
        let currVal: any = undefined;
        if (match) {
          if (norm(match.a) === norm(aStr) || match.a.toLowerCase().includes(aStr.toLowerCase()) || aStr.toLowerCase().includes(match.a.toLowerCase())) {
            status = "existing";
            explanation = "Matches existing FAQ question and answer";
            currVal = { question: match.q, answer: match.a };
          } else {
            status = "conflict";
            explanation = "FAQ question matches an existing FAQ, but the suggested answer is different";
            currVal = { question: match.q, answer: match.a };
          }
        }
        suggestions.push({
          id: `sugg-faq-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          section: "faqs",
          field: "faqs",
          label: `FAQ: ${qStr.slice(0, 60)}${qStr.length > 60 ? "..." : ""}`,
          suggestedValue: {
            question: qStr,
            answer: aStr,
            category: catStr,
            isActive: true
          },
          currentValue: currVal,
          sourceUrl,
          status,
          explanation
        });
      });
    }

    return suggestions;
  }

  /**
   * Analyzes a website URL, discovers up to 15 relevant sub-pages,
   * uses Groq AI to extract comprehensive profile intelligence across all profile sections,
   * and maps discovered items to AI Suggestions categorized as new, existing, or conflict.
   */
  static async analyzeWebsiteAndExtractIntelligence(
    targetUrl: string,
    orgId?: string,
    customerId?: string,
    currentProfileOverride?: any
  ) {
    const rawUrl = (targetUrl || "").trim().replace(/^["'(\[]+|["')\].,]+$/g, "");
    if (!rawUrl) {
      throw new Error("Website URL is required.");
    }

    const safetyCheck = await isSafeUrlWithDns(rawUrl);
    if (!safetyCheck.safe) {
      throw new Error(safetyCheck.error || "The URL provided is invalid or restricted.");
    }

    // 1. Scrape webpage & discover internal links
    const scraped = await analyzeWebsiteUrl(rawUrl);
    if (!scraped.success) {
      throw new Error(scraped.error || "Could not retrieve website content.");
    }

    // Sub-pages discovery (up to 15 internal links)
    const discoveredSubPages: SubPageEntry[] = (scraped.discoveredLinks || [])
      .slice(0, 15)
      .map((link) => ({
        text: link.text || "Sub-page",
        url: link.url
      }));

    // 2. Groq AI Comprehensive Business Intelligence Extraction
    let derivedBusinessName = "";
    let industry = "";
    let products: any[] = [];
    let services: any[] = [];
    let businessDescription = scraped.description || "";
    let targetAudience = "";
    let customerPersonas: any[] = [];
    let keyOfferings: string[] = [];
    let locations: string[] = [];
    let brandTagline = "";
    let brandVoice = "";
    let brandUsps: string[] = [];
    let competitors: any[] = [];
    let seoKeywords: any[] = [];
    let faqs: any[] = [];

    if (scraped.title) {
      derivedBusinessName = scraped.title.split(/[-|:–]/)[0]?.trim();
    }
    if (!derivedBusinessName) {
      try {
        const u = new URL(rawUrl);
        const hostParts = u.hostname.replace(/^www\./, "").split(".");
        derivedBusinessName = hostParts[0].charAt(0).toUpperCase() + hostParts[0].slice(1);
      } catch {}
    }

    const hasContent =
      Boolean(scraped.title) ||
      Boolean(scraped.description) ||
      (scraped.headings && scraped.headings.length > 0) ||
      Boolean(scraped.mainTextSnippet);

    if (hasContent) {
      try {
        const prompt = `Analyze this verified website content to extract comprehensive Google Ads business & marketing profile intelligence across all key sections.
Website Title: "${scraped.title || ""}"
Meta Description: "${scraped.description || ""}"
Key Headings: ${JSON.stringify(scraped.headings || [])}
Discovered Sub-Pages: ${JSON.stringify(discoveredSubPages.slice(0, 8))}
Content Snippet: "${(scraped.mainTextSnippet || "").slice(0, 2500)}"
Target URL: "${rawUrl}"

Extract:
1. "businessName": Clean brand name (under 30 chars).
2. "industry": Primary industry or niche (e.g., "Healthcare", "E-Commerce", "Digital Marketing", "Industrial Manufacturing", "SaaS").
3. "businessDescription": Concise, compelling 1-2 sentence business description (100-250 chars).
4. "products": Distinct tangible or digital products offered (array of 2-6 objects { "name": string, "description": string } or strings). If purely service-based, return empty array.
5. "services": Professional services offered (array of 2-6 objects { "name": string, "description": string } or strings). If purely retail/products, return empty array.
6. "targetAudience": Ideal customer profile summary (under 120 chars).
7. "customerPersonas": Array of 1-3 buyer persona titles with optional summary { "personaTitle": string, "description": string }.
8. "locations": Target geographic regions, cities, states, or countries inferred from address, contact info, or service areas (array of strings, e.g., ["Maharashtra", "India"]).
9. "brandTagline": Memorable tagline or motto if present.
10. "brandVoice": Recommended tone of voice (e.g., "Professional & Authoritative", "Friendly & Approachable", "Technical & Precise").
11. "brandUsps": Core value propositions, USPs, guarantees, or special features (array of 3-5 punchy phrases, each <= 40 chars).
12. "competitors": Array of 1-3 common competitors or market alternatives in this industry { "competitorName": string, "notes": string }.
13. "seoKeywords": Array of 3-8 target search keywords { "keyword": string, "keywordType": "Primary"|"Secondary"|"Long-tail", "searchIntent": "Commercial"|"Transactional"|"Informational" }.
14. "faqs": Array of 2-4 common customer questions & answers { "question": string, "answer": string, "category": string }.

Return ONLY JSON matching this format:
{
  "businessName": "string",
  "industry": "string",
  "businessDescription": "string",
  "products": [{ "name": "string", "description": "string" }],
  "services": [{ "name": "string", "description": "string" }],
  "targetAudience": "string",
  "customerPersonas": [{ "personaTitle": "string", "description": "string" }],
  "locations": ["string"],
  "brandTagline": "string",
  "brandVoice": "string",
  "brandUsps": ["string"],
  "competitors": [{ "competitorName": "string", "notes": "string" }],
  "seoKeywords": [{ "keyword": "string", "keywordType": "Primary", "searchIntent": "Commercial" }],
  "faqs": [{ "question": "string", "answer": "string", "category": "string" }]
}`;

        const groqResult = await GoogleAdsAiAssistantService.executeGroqChat({
          messages: [
            {
              role: "system",
              content: "You are an expert marketing analyst extracting verified company intelligence and products/services from website content. Output strictly valid JSON."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 1500,
          response_format: { type: "json_object" }
        });

        const parsed = JSON.parse(groqResult.content || "{}");
        if (parsed.businessName && typeof parsed.businessName === "string") {
          derivedBusinessName = parsed.businessName.trim();
        }
        if (parsed.industry && typeof parsed.industry === "string") {
          industry = parsed.industry.trim();
        }
        if (parsed.businessDescription && typeof parsed.businessDescription === "string") {
          businessDescription = parsed.businessDescription.trim();
        }
        if (Array.isArray(parsed.products)) {
          products = parsed.products;
        }
        if (Array.isArray(parsed.services)) {
          services = parsed.services;
        }
        if (parsed.targetAudience && typeof parsed.targetAudience === "string") {
          targetAudience = parsed.targetAudience.trim();
        }
        if (Array.isArray(parsed.customerPersonas)) {
          customerPersonas = parsed.customerPersonas;
        }
        if (Array.isArray(parsed.locations)) {
          locations = parsed.locations.map((l: any) => String(l).trim()).filter(Boolean);
        }
        if (parsed.brandTagline && typeof parsed.brandTagline === "string") {
          brandTagline = parsed.brandTagline.trim();
        }
        if (parsed.brandVoice && typeof parsed.brandVoice === "string") {
          brandVoice = parsed.brandVoice.trim();
        }
        if (Array.isArray(parsed.brandUsps)) {
          brandUsps = parsed.brandUsps.map((u: any) => String(u).trim()).filter(Boolean);
          keyOfferings = brandUsps;
        }
        if (Array.isArray(parsed.competitors)) {
          competitors = parsed.competitors;
        }
        if (Array.isArray(parsed.seoKeywords)) {
          seoKeywords = parsed.seoKeywords;
        }
        if (Array.isArray(parsed.faqs)) {
          faqs = parsed.faqs;
        }
      } catch (aiErr: any) {
        console.warn("[CustomerBusinessProfileService] Groq extraction fallback:", aiErr.message);
      }
    }

    const aiIntelligence = {
      businessName: derivedBusinessName,
      industry,
      businessDescription,
      products,
      services,
      targetAudience,
      customerPersonas,
      keyOfferings,
      locations,
      brandTagline,
      brandVoice,
      brandUsps,
      competitors,
      seoKeywords,
      faqs
    };

    // 3. Load existing profile for intelligence mapping & classification
    let existingProfile = currentProfileOverride;
    if (!existingProfile && orgId && customerId) {
      try {
        existingProfile = await CustomerBusinessProfileService.getProfile(orgId, customerId);
      } catch (profErr: any) {
        console.warn("[CustomerBusinessProfileService] getProfile during analysis fallback:", profErr.message);
      }
    }

    // 4. Generate structured, classified AI Suggestions
    const aiSuggestions = CustomerBusinessProfileService.generateClassifiedSuggestions(
      aiIntelligence,
      existingProfile,
      rawUrl
    );

    return {
      success: true,
      website: {
        url: rawUrl,
        title: scraped.title,
        description: scraped.description,
        subPages: discoveredSubPages,
        analyzedAt: new Date().toISOString()
      },
      aiIntelligence,
      aiSuggestions
    };
  }
}
