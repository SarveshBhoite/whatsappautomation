import axios from "axios";
import { getGoogleAccessToken } from "../../../services/gmbSyncService";
import prisma from "../../../utils/prisma";

const ADS_API_VERSION = "v24";
const ADS_BASE = `https://googleads.googleapis.com/${ADS_API_VERSION}`;

export class GoogleAdsBaseService {
  protected static DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
  protected static CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
  protected static CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

  private static headersCache: Map<string, { data: any, expiresAt: number }> = new Map();

  protected static async getAdsHeaders(organizationId: string, customerId?: string) {
    const cacheKey = `${organizationId}_${customerId || 'default'}`;
    const cached = this.headersCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId }
    });

    if (!config?.googleRefreshToken) {
      throw new Error("Google account not connected for this organization.");
    }

    const accessToken = await getGoogleAccessToken(
      this.CLIENT_ID,
      this.CLIENT_SECRET,
      config.googleRefreshToken
    );

    const cid = (customerId || config.googleAdsCustomerId || "").replace(/-/g, "").trim();
    if (!cid) throw new Error("Google Ads Customer ID not configured. Please select an account.");

    let loginCustomerId: string | undefined;
    const managerAccount = await prisma.googleAdAccount.findFirst({
      where: { organizationId, isManager: true }
    });

    if (managerAccount) {
      loginCustomerId = managerAccount.customerId.replace(/-/g, "");
    } else if (config.googleAdsCustomerId) {
      const savedId = config.googleAdsCustomerId.replace(/-/g, "");
      if (savedId !== cid) loginCustomerId = savedId;
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": this.DEVELOPER_TOKEN,
      "Content-Type": "application/json",
      ...(loginCustomerId ? { "login-customer-id": loginCustomerId } : {})
    };

    const result = { headers, customerId: cid, accessToken, managerId: loginCustomerId };
    this.headersCache.set(cacheKey, { data: result, expiresAt: Date.now() + 45 * 60 * 1000 });
    return result;
  }

  public static cleanAdText(text: string, maxLength?: number): string {
    if (!text || typeof text !== "string") return "";
    let cleaned = text.trim();

    // 1. Remove all emojis and pictographic symbols (Unicode emojis, surrogate pairs, symbols)
    cleaned = cleaned.replace(/[\u{1F000}-\u{1FFFF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{200D}\u{FE0F}]/gu, " ");

    // 2. Replace arrows, bullets, and icons with hyphens or spaces
    cleaned = cleaned
      .replace(/[→←↑↓↔↕↖↗↘↙⇒⇐⇑⇓⇔➜➔➤►▶◀◄▲▼●•▪◆★☆✓✔✕✖✗]/g, " - ")
      .replace(/[|│┃]/g, " - ")
      .replace(/[\/~^_*<>{}[\]\\#@+=]/g, " ");

    // 3. Normalize quotes, unicode whitespace, and dashes
    cleaned = cleaned
      .replace(/[“”„‟«»]/g, '"')
      .replace(/[‘’‚‛`]/g, "'")
      .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ")
      .replace(/\s*[-–—―]+\s*/g, " - ");

    // 4. Remove leading punctuation & symbols
    cleaned = cleaned.replace(/^[\s,.\-!?;:_~@#$%^&*+=<>'"\/]+/, "");

    // 5. Remove trailing invalid punctuation & symbols
    cleaned = cleaned.replace(/[\s,:\-;_~@#$%^&*+=<>'"\/]+$/, "");

    // 6. Replace multiple repeating punctuation with single (e.g. ",," -> ",", "!!" -> "!")
    cleaned = cleaned.replace(/([,.!?;:])\1+/g, "$1");

    // 7. Fix missing space after punctuation
    cleaned = cleaned.replace(/([,.!?;:])([a-zA-Z0-9])/g, "$1 $2");

    // 8. Replace multiple consecutive spaces with a single space
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // 9. Final trim of leading/trailing dashes or hyphens
    cleaned = cleaned.replace(/^[-–—\s]+/, "").replace(/[-–—\s]+$/, "").trim();

    if (maxLength && cleaned.length > maxLength) {
      cleaned = cleaned.slice(0, maxLength).trim();
      cleaned = cleaned.replace(/[\s,:\-;_~@#$%^&*+=<>'"\/]+$/, "").trim();
    }
    return cleaned;
  }

  public static cleanUrl(url: any): string {
    if (!url || typeof url !== "string") return "";
    let cleaned = url.trim();
    // Remove enclosing quotes, brackets, or trailing punctuation (such as trailing dots, parentheses, colons, slashes)
    cleaned = cleaned.replace(/^["'(\[<\s]+/, "");
    cleaned = cleaned.replace(/[\s"'\(\)\[\]<>\.,;:?]+$/, "").trim();
    if (!cleaned) return "";
    if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
      cleaned = `https://${cleaned}`;
    }
    return cleaned;
  }

  public static cleanTrackingTemplate(template: any): string | undefined {
    if (!template || typeof template !== "string") return undefined;
    let cleaned = template.trim();
    if (!cleaned) return undefined;
    // If it doesn't start with http:// or https:// or {lpurl}, check if it starts with protocol
    if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://") && !cleaned.startsWith("{lpurl}") && !cleaned.startsWith("{unescapedlpurl}")) {
      // If it looks like a domain or path, prepend https://
      if (cleaned.includes(".") || cleaned.includes("/") || cleaned.includes("{")) {
        cleaned = `https://${cleaned}`;
      } else {
        // Invalid garbage string, drop it to prevent Google Ads mutation errors
        return undefined;
      }
    }
    return cleaned;
  }

  public static cleanCustomParameters(params: any): Array<{ key: string; value: string }> {
    if (!Array.isArray(params)) return [];
    return params
      .map((p: any) => {
        const rawKey = p && (p.key || p.name);
        const rawVal = p && (p.value !== undefined ? p.value : "");
        if (!rawKey || typeof rawKey !== "string") return null;
        // Google Ads custom parameter keys must only contain letters, digits, and underscores (no commas, colons, or punctuation)
        const cleanKey = rawKey.trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 16);
        if (!cleanKey) return null;
        const cleanVal = String(rawVal).trim().slice(0, 250);
        return { key: cleanKey, value: cleanVal };
      })
      .filter((p): p is { key: string; value: string } => p !== null && p.key.length > 0);
  }

  public static formatGoogleAdsError(error: any): string {
    if (error?.response?.data) {
      const data = error.response.data;
      const details = data.details || data.error?.details || [];
      const extractedErrors: string[] = [];

      for (const detail of details) {
        if (Array.isArray(detail.errors)) {
          for (const err of detail.errors) {
            if (err.errorCode?.policyFindingError === "POLICY_FINDING") {
              const entries = err.details?.policyFindingDetails?.policyTopicEntries || [];
              for (const entry of entries) {
                const topic = entry.topic || "EDITORIAL_POLICY";
                const texts = entry.evidences?.flatMap((e: any) => e.textList?.texts || []).filter(Boolean).join(", ");
                if (topic === "DESTINATION_NOT_WORKING") {
                  extractedErrors.push(`Landing page URL is unreachable or returning an error (DESTINATION_NOT_WORKING). Please provide a live, reachable website URL.`);
                } else {
                  extractedErrors.push(`Google Policy Disapproval (${topic})${texts ? ` on text "${texts}"` : ""}. Please ensure proper punctuation, working URLs, and guidelines.`);
                }
              }
            } else if (err.errorCode?.campaignBudgetError === "BUDGET_BELOW_PER_DAY_MINIMUM") {
              extractedErrors.push(`Daily budget is below Google's minimum requirement (min ₹416/day).`);
            } else if (err.message) {
              const fieldPath = err.location?.fieldPathElements?.map((f: any) => f.fieldName).join(".") || "";
              const trigger = err.trigger?.stringValue || "";
              extractedErrors.push(`${err.message}${fieldPath ? ` (field: ${fieldPath})` : ""}${trigger ? ` (value: "${trigger}")` : ""}`);
            }
          }
        } else if (detail.fieldViolations && Array.isArray(detail.fieldViolations)) {
          for (const fv of detail.fieldViolations) {
            extractedErrors.push(`${fv.description || "Invalid argument"}${fv.field ? ` at ${fv.field}` : ""}`);
          }
        }
      }

      if (extractedErrors.length > 0) {
        return Array.from(new Set(extractedErrors)).join(" | ");
      }
      return data.error?.message || data.message || JSON.stringify(data);
    }
    return error.message || "An unexpected Google Ads API error occurred.";
  }

  protected static async createBudget(organizationId: string, customerId: string, params: {
    name: string; amountPerDay: number; deliveryMethod?: string; shared?: boolean;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    // Google Ads API requires a per-day minimum (416 INR / ~5 USD) for Demand Gen and other campaign types
    const minBudgetPerDay = 416;
    const safeAmountPerDay = Math.max(Number(params.amountPerDay) || minBudgetPerDay, minBudgetPerDay);
    const amountMicros = Math.round(safeAmountPerDay * 1_000_000);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/campaignBudgets:mutate`, {
      operations: [{
        create: {
          name: params.name || `Budget ₹${safeAmountPerDay}/day (${Date.now()})`,
          amountMicros,
          deliveryMethod: params.deliveryMethod || "STANDARD",
          explicitlyShared: params.shared || false
        }
      }]
    }, { headers });
    return res.data.results?.[0]?.resourceName;
  }

  protected static async createAdGroup(organizationId: string, customerId: string, params: {
    name: string;
    campaignResourceName: string;
    type?: string;
    cpcBidMicros?: number;
    cpmBidMicros?: number;
    status?: string;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const payload: any = {
      campaign: params.campaignResourceName,
      name: params.name,
      status: params.status || "ENABLED",
    };
    if (params.type) payload.type = params.type;
    if (params.cpcBidMicros) payload.cpcBidMicros = params.cpcBidMicros;
    if (params.cpmBidMicros) payload.cpmBidMicros = params.cpmBidMicros;

    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/adGroups:mutate`, {
      operations: [{ create: payload }]
    }, { headers });
    return res.data.results?.[0]?.resourceName;
  }

  public static async uploadImageAsset(
    organizationId: string,
    customerId: string,
    name: string,
    base64OrUrl: string
  ): Promise<string | null> {
    try {
      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      let base64Data = base64OrUrl;

      if (base64OrUrl.startsWith("http://") || base64OrUrl.startsWith("https://")) {
        const imgRes = await axios.get(base64OrUrl, { responseType: "arraybuffer", timeout: 15000 });
        base64Data = Buffer.from(imgRes.data).toString("base64");
      } else if (base64OrUrl.includes("base64,")) {
        base64Data = base64OrUrl.split("base64,")[1];
      }

      if (!base64Data || base64Data.length < 50) {
        return null;
      }

      const cleanName = (name || `Image_${Date.now()}`).replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 100);

      const res = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
        operations: [{
          create: {
            name: cleanName,
            type: "IMAGE",
            imageAsset: {
              data: base64Data
            }
          }
        }]
      }, { headers });

      return res.data?.results?.[0]?.resourceName || null;
    } catch (err: any) {
      console.error(`[GoogleAdsBaseService] uploadImageAsset error for "${name}":`, JSON.stringify(err?.response?.data || err?.message, null, 2));
      return null;
    }
  }

  public static readonly GEO_TARGET_CONSTANT_MAP: Record<string, string> = {
    "india": "2356",
    "mumbai": "1007788",
    "mumbai, maharashtra, india": "1007788",
    "delhi": "1007785",
    "delhi, india": "1007785",
    "bengaluru": "1007768",
    "bengaluru, karnataka, india": "1007768",
    "bangalore": "1007768",
    "hyderabad": "1007773",
    "hyderabad, telangana, india": "1007773",
    "pune": "1007801",
    "pune, maharashtra, india": "1007801",
    "kolkata": "1007743",
    "kolkata, west bengal, india": "1007743",
    "chennai": "1007809",
    "chennai, tamil nadu, india": "1007809",
    "ahmedabad": "1007753",
    "ahmedabad, gujarat, india": "1007753",
    "jaipur": "1007828",
    "jaipur, rajasthan, india": "1007828",
    "surat": "1007754",
    "surat, gujarat, india": "1007754",
    "lucknow": "1007782",
    "lucknow, uttar pradesh, india": "1007782",
    "united states": "2840",
    "united kingdom": "2826",
    "canada": "2124",
    "australia": "2036",
    "united arab emirates": "2784",
    "germany": "2276",
    "france": "2250",
    "singapore": "2702"
  };

  public static readonly LANGUAGE_CONSTANT_MAP: Record<string, string> = {
    "english": "1000",
    "spanish": "1003",
    "french": "1002",
    "german": "1001",
    "italian": "1004",
    "portuguese": "1014",
    "dutch": "1010",
    "russian": "1031",
    "japanese": "1005",
    "chinese": "1017",
    "chinese (simplified)": "1017",
    "chinese (traditional)": "1018",
    "korean": "1012",
    "arabic": "1019",
    "hindi": "1023",
    "bengali": "1056",
    "gujarati": "1072",
    "kannada": "1086",
    "malayalam": "1098",
    "marathi": "1101",
    "punjabi": "1110",
    "tamil": "1130",
    "telugu": "1131",
    "urdu": "1041"
  };

  public static resolveLanguageConstant(languageNameOrId: string, isAiGuided?: boolean): string | null {
    if (!languageNameOrId || typeof languageNameOrId !== "string") return null;
    const trimmed = languageNameOrId.trim();
    if (!trimmed) return null;

    if (/^\d+$/.test(trimmed)) return trimmed;
    if (trimmed.startsWith("languageConstants/")) return trimmed.replace("languageConstants/", "");

    const lower = trimmed.toLowerCase();
    if (this.LANGUAGE_CONSTANT_MAP[lower]) {
      return this.LANGUAGE_CONSTANT_MAP[lower];
    }

    return null;
  }

  /**
   * Resolve a location string or object into an official Google Ads GeoTargetConstant ID
   * via SuggestGeoTargetConstants or fallback dictionary / Places lookup.
   */
  public static async resolveGeoTargetConstant(
    locationInput: any,
    headers?: any,
    localeOrAiGuided: any = "en"
  ): Promise<string | null> {
    if (!locationInput) return null;

    const locale = typeof localeOrAiGuided === "string" && localeOrAiGuided.length > 0 ? localeOrAiGuided : "en";

    let targetStr = "";
    if (typeof locationInput === "string") {
      targetStr = locationInput.trim();
    } else if (typeof locationInput === "object") {
      if (locationInput.id && /^\d+$/.test(String(locationInput.id))) {
        return String(locationInput.id);
      }
      targetStr = (locationInput.canonicalName || locationInput.name || "").trim();
    }

    if (!targetStr || targetStr.toUpperCase() === "ALL" || targetStr.toLowerCase() === "all countries and territories" || targetStr.toLowerCase() === "all countries") {
      return null;
    }

    if (/^\d+$/.test(targetStr)) return targetStr;
    if (targetStr.startsWith("geoTargetConstants/")) return targetStr.replace("geoTargetConstants/", "");

    const lower = targetStr.toLowerCase();
    if (this.GEO_TARGET_CONSTANT_MAP[lower]) {
      return this.GEO_TARGET_CONSTANT_MAP[lower];
    }

    // 1. Try Google Ads GeoTargetConstants:suggest API with full string
    try {
      const suggestRes = await axios.get(`${ADS_BASE}/geoTargetConstants:suggest`, {
        params: { "location_names.names": targetStr, locale },
        headers,
        timeout: 8000
      });
      const suggestions = suggestRes.data?.geoTargetConstantSuggestions || [];
      if (suggestions.length > 0 && suggestions[0]?.geoTargetConstant?.id) {
        return String(suggestions[0].geoTargetConstant.id);
      }
    } catch (suggestErr: any) {
      console.warn(`[GoogleAdsBaseService] GeoTargetConstants:suggest notice for "${targetStr}":`, suggestErr?.response?.data || suggestErr.message);
    }

    // 2. Try individual parts / segments (e.g. for "Wai, Maharashtra, India" -> "Wai", "Maharashtra", "India")
    const parts = targetStr.split(",").map(p => p.trim()).filter(Boolean);
    for (const part of parts) {
      const partLower = part.toLowerCase();
      if (this.GEO_TARGET_CONSTANT_MAP[partLower]) {
        return this.GEO_TARGET_CONSTANT_MAP[partLower];
      }
    }

    // 3. Try suggest with leading segment (city / district name)
    if (parts.length > 1) {
      try {
        const leadRes = await axios.get(`${ADS_BASE}/geoTargetConstants:suggest`, {
          params: { "location_names.names": parts[0], locale },
          headers,
          timeout: 5000
        });
        const leadSugg = leadRes.data?.geoTargetConstantSuggestions || [];
        if (leadSugg.length > 0 && leadSugg[0]?.geoTargetConstant?.id) {
          return String(leadSugg[0].geoTargetConstant.id);
        }
      } catch (e: any) {
        // Continue fallback
      }
    }

    return null;
  }

  /**
   * Mutate campaign criteria for Location (Location or Proximity) and Languages.
   * Supports Location include/exclude, Radius targeting (ProximityInfo), and Language constants.
   */
  public static async mutateCampaignGeoAndLanguageCriteria(
    organizationId: string,
    customerId: string,
    campaignResourceName: string,
    params: {
      locations?: any[];
      languages?: any[];
      headers?: any;
    }
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const headers = params.headers || (await this.getAdsHeaders(organizationId, customerId)).headers;
    const operations: any[] = [];

    // 1. Process Locations
    const locList = Array.isArray(params.locations) ? params.locations : [params.locations].filter(Boolean);
    for (const loc of locList) {
      if (!loc) continue;

      const isNegative = typeof loc === "object" && Boolean(loc.isExcluded);
      const isRadiusMode = typeof loc === "object" && (loc.mode === "RADIUS" || (loc.radius && (loc.lat !== undefined && loc.lng !== undefined)));

      if (isRadiusMode) {
        // Radius Targeting -> CampaignCriterion.proximity (ProximityInfo)
        const radiusVal = Number(loc.radius) || 20;
        const radiusUnits = (loc.radiusUnit || "km").toLowerCase() === "mi" ? "MILES" : "KILOMETERS";
        let lat = Number(loc.lat);
        let lng = Number(loc.lng);

        // If lat/lng missing, try resolving via Google Places details/geocoding
        if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
          const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;
          const queryStr = loc.placeId || loc.canonicalName || loc.name;
          if (placesApiKey && queryStr) {
            try {
              const geoUrl = loc.placeId
                ? `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(loc.placeId)}&fields=geometry&key=${placesApiKey}`
                : `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(queryStr)}&key=${placesApiKey}`;
              const gRes = await axios.get(geoUrl, { timeout: 6000 });
              const geom = gRes.data?.result?.geometry?.location || gRes.data?.results?.[0]?.geometry?.location;
              if (geom?.lat && geom?.lng) {
                lat = Number(geom.lat);
                lng = Number(geom.lng);
              }
            } catch (e: any) {
              console.warn("[GoogleAdsBaseService] Proximity geocode fallback notice:", e.message);
            }
          }
        }

        if (!isNaN(lat) && !isNaN(lng)) {
          const proximityOp: any = {
            campaign: campaignResourceName,
            negative: isNegative,
            proximity: {
              geoPoint: {
                latitudeInMicroDegrees: Math.round(lat * 1_000_000),
                longitudeInMicroDegrees: Math.round(lng * 1_000_000)
              },
              radius: radiusVal,
              radiusUnits
            }
          };

          if (loc.name || loc.canonicalName) {
            proximityOp.proximity.address = {
              streetAddress: (loc.name || loc.canonicalName || "").slice(0, 100)
            };
          }

          operations.push({ create: proximityOp });
          continue;
        }
      }

      // Standard Location Targeting -> CampaignCriterion.location (LocationInfo)
      const constantId = await this.resolveGeoTargetConstant(loc, headers);
      if (constantId) {
        operations.push({
          create: {
            campaign: campaignResourceName,
            negative: isNegative,
            location: {
              geoTargetConstant: `geoTargetConstants/${constantId}`
            }
          }
        });
      } else if (typeof loc === "object" && (loc.lat || loc.lng || loc.placeId)) {
        // Fallback for very granular village / locality lacking GeoTargetConstant: use ProximityInfo with small 10km circle
        let lat = Number(loc.lat);
        let lng = Number(loc.lng);
        if (isNaN(lat) || isNaN(lng)) {
          const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;
          if (placesApiKey && loc.placeId) {
            try {
              const pRes = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(loc.placeId)}&fields=geometry&key=${placesApiKey}`);
              const gLoc = pRes.data?.result?.geometry?.location;
              if (gLoc) { lat = Number(gLoc.lat); lng = Number(gLoc.lng); }
            } catch (e) {}
          }
        }

        if (!isNaN(lat) && !isNaN(lng)) {
          operations.push({
            create: {
              campaign: campaignResourceName,
              negative: isNegative,
              proximity: {
                geoPoint: {
                  latitudeInMicroDegrees: Math.round(lat * 1_000_000),
                  longitudeInMicroDegrees: Math.round(lng * 1_000_000)
                },
                radius: 10,
                radiusUnits: "KILOMETERS"
              }
            }
          });
        }
      }
    }

    // 2. Process Languages
    const langList = Array.isArray(params.languages) ? params.languages : [params.languages].filter(Boolean);
    for (const lang of langList) {
      if (!lang) continue;
      const normLang = String(lang).trim().toLowerCase();
      const constantId = this.LANGUAGE_CONSTANT_MAP[normLang] || (/^\d+$/.test(String(lang)) ? String(lang) : null);
      if (constantId) {
        operations.push({
          create: {
            campaign: campaignResourceName,
            language: {
              languageConstant: `languageConstants/${constantId}`
            }
          }
        });
      }
    }

    if (operations.length === 0) return [];

    try {
      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaignCriteria:mutate`, {
        operations
      }, { headers });
      return res.data?.results || [];
    } catch (critErr: any) {
      console.warn(`[GoogleAdsBaseService] campaignCriteria:mutate warning:`, critErr?.response?.data || critErr.message);
      return [];
    }
  }

  /**
   * Mutate Ad Group criteria for Location (Location or Proximity) and Languages.
   * Specifically used by Demand Gen campaigns where location and language targeting
   * can be attached to Ad Groups (or across multiple Ad Groups).
   */
  public static async mutateAdGroupGeoAndLanguageCriteria(
    organizationId: string,
    customerId: string,
    adGroupResourceNames: string | string[],
    params: {
      locations?: any[];
      languages?: any[];
      headers?: any;
    }
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const headers = params.headers || (await this.getAdsHeaders(organizationId, customerId)).headers;
    const operations: any[] = [];
    const adGroupRefs = Array.isArray(adGroupResourceNames) ? adGroupResourceNames : [adGroupResourceNames].filter(Boolean);

    if (adGroupRefs.length === 0) return [];

    // 1. Process Locations
    const locList = Array.isArray(params.locations) ? params.locations : [params.locations].filter(Boolean);
    for (const loc of locList) {
      if (!loc) continue;

      const isNegative = typeof loc === "object" && Boolean(loc.isExcluded);
      const isRadiusMode = typeof loc === "object" && (loc.mode === "RADIUS" || (loc.radius && (loc.lat !== undefined && loc.lng !== undefined)));

      if (isRadiusMode) {
        // Radius Targeting -> AdGroupCriterion.proximity
        const radiusVal = Number(loc.radius) || 20;
        const radiusUnits = (loc.radiusUnit || "km").toLowerCase() === "mi" ? "MILES" : "KILOMETERS";
        let lat = Number(loc.lat);
        let lng = Number(loc.lng);

        if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
          const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;
          const queryStr = loc.placeId || loc.canonicalName || loc.name;
          if (placesApiKey && queryStr) {
            try {
              const geoUrl = loc.placeId
                ? `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(loc.placeId)}&fields=geometry&key=${placesApiKey}`
                : `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(queryStr)}&key=${placesApiKey}`;
              const gRes = await axios.get(geoUrl, { timeout: 6000 });
              const geom = gRes.data?.result?.geometry?.location || gRes.data?.results?.[0]?.geometry?.location;
              if (geom?.lat && geom?.lng) {
                lat = Number(geom.lat);
                lng = Number(geom.lng);
              }
            } catch (e: any) {
              console.warn("[GoogleAdsBaseService] AdGroup proximity geocode fallback notice:", e.message);
            }
          }
        }

        if (!isNaN(lat) && !isNaN(lng)) {
          for (const agRef of adGroupRefs) {
            operations.push({
              create: {
                adGroup: agRef,
                negative: isNegative,
                proximity: {
                  geoPoint: {
                    latitudeInMicroDegrees: Math.round(lat * 1_000_000),
                    longitudeInMicroDegrees: Math.round(lng * 1_000_000)
                  },
                  radius: radiusVal,
                  radiusUnits
                }
              }
            });
          }
          continue;
        }
      }

      // Standard Location Targeting -> AdGroupCriterion.location
      const constantId = await this.resolveGeoTargetConstant(loc, headers);
      if (constantId) {
        for (const agRef of adGroupRefs) {
          operations.push({
            create: {
              adGroup: agRef,
              negative: isNegative,
              location: {
                geoTargetConstant: `geoTargetConstants/${constantId}`
              }
            }
          });
        }
      } else if (typeof loc === "object" && (loc.lat || loc.lng || loc.placeId)) {
        let lat = Number(loc.lat);
        let lng = Number(loc.lng);
        if (isNaN(lat) || isNaN(lng)) {
          const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;
          if (placesApiKey && loc.placeId) {
            try {
              const pRes = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(loc.placeId)}&fields=geometry&key=${placesApiKey}`);
              const gLoc = pRes.data?.result?.geometry?.location;
              if (gLoc) { lat = Number(gLoc.lat); lng = Number(gLoc.lng); }
            } catch (e) {}
          }
        }

        if (!isNaN(lat) && !isNaN(lng)) {
          for (const agRef of adGroupRefs) {
            operations.push({
              create: {
                adGroup: agRef,
                negative: isNegative,
                proximity: {
                  geoPoint: {
                    latitudeInMicroDegrees: Math.round(lat * 1_000_000),
                    longitudeInMicroDegrees: Math.round(lng * 1_000_000)
                  },
                  radius: 10,
                  radiusUnits: "KILOMETERS"
                }
              }
            });
          }
        }
      }
    }

    // 2. Process Languages
    const langList = Array.isArray(params.languages) ? params.languages : [params.languages].filter(Boolean);
    for (const lang of langList) {
      if (!lang) continue;
      const normLang = String(lang).trim().toLowerCase();
      const constantId = this.LANGUAGE_CONSTANT_MAP[normLang] || (/^\d+$/.test(String(lang)) ? String(lang) : null);
      if (constantId) {
        for (const agRef of adGroupRefs) {
          operations.push({
            create: {
              adGroup: agRef,
              language: {
                languageConstant: `languageConstants/${constantId}`
              }
            }
          });
        }
      }
    }

    if (operations.length === 0) return [];

    try {
      const res = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupCriteria:mutate`, {
        operations
      }, { headers });
      return res.data?.results || [];
    } catch (critErr: any) {
      console.warn(`[GoogleAdsBaseService] adGroupCriteria:mutate warning:`, critErr?.response?.data || critErr.message);
      return [];
    }
  }

  protected static async saveCampaignToDatabase(data: any) {
    const validFields = [
      "id",
      "organizationId",
      "customerId",
      "campaignId",
      "googleAdsCampaignId",
      "name",
      "status",
      "campaignType",
      "biddingStrategy",
      "budget",
      "budgetResourceName",
      "startDate",
      "endDate",
      "headlines",
      "descriptions",
      "finalUrl",
      "keywords",
      "geoTargets",
      "languages",
      "searchThemes",
      "audienceSignal",
      "adSchedule",
      "advertisingChannelType",
      "amountMicros",
      "impressions",
      "clicks",
      "costMicros",
      "conversions"
    ];

    const sanitizedData: any = {};
    for (const key of validFields) {
      if (data && data[key] !== undefined) {
        sanitizedData[key] = data[key];
      }
    }

    if (data?.mobileFinalUrl && sanitizedData.geoTargets && typeof sanitizedData.geoTargets === "object") {
      sanitizedData.geoTargets.mobileFinalUrl = data.mobileFinalUrl;
    }

    return await prisma.googleAdCampaign.create({ data: sanitizedData });
  }
}