import { Router, Request, Response } from "express";
import { MetaAIConversationService } from "../../services/meta-ads/metaAIConversationService";
import { MetaCampaignExecutionService } from "../../services/meta-ads/metaCampaignExecutionService";

import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `meta_ad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

/**
 * POST /api/meta-ads/ai/conversation/upload-media
 * Upload custom user graphics or videos for Meta Ad Creative
 */
router.post("/ai/conversation/upload-media", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file provided" });
    }

    const host = req.get("host") || "localhost:5000";
    const protocol = req.protocol || "http";
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith("video/") ? "VIDEO" : "IMAGE";

    res.json({
      success: true,
      media: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: fileUrl,
        mediaType,
      },
    });
  } catch (error: any) {
    console.error("[AIRoutes] Error uploading media file:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/ai/conversation/init
 * Initialize a dynamic campaign strategy session with real authenticated Meta context
 */
router.get("/ai/conversation/init", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const session = await MetaAIConversationService.getInitialSession(orgId);
    res.json({ success: true, session });
  } catch (error: any) {
    console.error("[AIRoutes] Error initializing conversation session:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/ai/conversation/message
 * Process natural language user message, extract facts, update draft, and validate
 */
router.post("/ai/conversation/message", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const { currentState, message } = req.body;
    const selectedOption = req.body.selectedOption || req.body.selectedOptionValue;

    if (!currentState) {
      return res.status(400).json({ success: false, error: "currentState is required." });
    }

    const updatedState = await MetaAIConversationService.processMessage(
      orgId,
      currentState,
      message || selectedOption || "",
      selectedOption
    );

    res.json({ success: true, state: updatedState });
  } catch (error: any) {
    console.error("[AIRoutes] Error processing conversation message:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/ai/conversation/confirm-publish
 * Explicit user confirmation trigger to execute campaign on Meta Graph API
 */
router.post("/ai/conversation/confirm-publish", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const { draft, executionId } = req.body;

    if (!draft) {
      return res.status(400).json({ success: false, error: "draft is required for publishing." });
    }

    const execId = executionId || `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const result = await MetaCampaignExecutionService.publishCampaign(orgId, draft, execId);

    res.json({ success: result.deploymentStatus === "FULL_SUCCESS", result });
  } catch (error: any) {
    console.error("[AIRoutes] Error confirming campaign publication:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/ai/conversation/preview
 * Official Meta Graph API Ad Preview Endpoint
 * Uses GET /{ad-id}/previews or GET /{ad-creative-id}/previews with ad_format (DESKTOP_FEED_STANDARD, INSTAGRAM_STANDARD, etc.)
 */
router.get("/ai/conversation/preview", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const targetId = (req.query.targetId || req.query.adId || req.query.creativeId) as string;
    const adFormat = (req.query.ad_format || req.query.adFormat || "DESKTOP_FEED_STANDARD") as string;
    const isCreativeId = req.query.isCreativeId === "true";

    if (!targetId) {
      return res.status(400).json({ success: false, error: "adId or creativeId parameter is required." });
    }

    const MetaAdsCoreService = require("../../services/meta-ads/metaAdsCoreService").MetaAdsCoreService;
    const previewResult = await MetaAdsCoreService.fetchAdPreview(orgId, targetId, adFormat, isCreativeId);

    if (previewResult.success) {
      res.json({ success: true, iframeHtml: previewResult.iframeHtml, adFormat });
    } else {
      res.status(400).json({ success: false, error: previewResult.error || "Could not fetch preview from Meta." });
    }
  } catch (error: any) {
    console.error("[AIRoutes] Error fetching ad preview:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const voiceUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

/**
 * POST /api/meta-ads/ai/conversation/voice
 * Receives an audio voice note from the browser, transcribes it dynamically using Groq Whisper,
 * automatically detects any spoken language (Marathi, Hindi, English, etc.),
 * and returns the transcribed text.
 */
router.post("/ai/conversation/voice", voiceUpload.single("audio"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ success: false, error: "No audio file provided." });
    }

    const groqApiKey = process.env.GROQ_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ success: false, error: "GROQ_KEY is missing from environment." });
    }

    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype || "audio/webm" });
    const formData = new FormData();
    formData.append("file", blob, "voice_input.webm");
    formData.append("model", "whisper-large-v3-turbo");
    formData.append("prompt", "Meta ad campaign voice instructions in Marathi, Hindi, or English");

    const whisperRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: formData,
    });

    if (!whisperRes.ok) {
      const errText = await whisperRes.text();
      console.error("[AIRoutes] Whisper transcription error:", errText);
      return res.status(500).json({ success: false, error: "Failed to transcribe audio voice note." });
    }

    const whisperData: any = await whisperRes.json();
    const transcribedText = whisperData?.text?.trim() || "";
    console.log(`[AIRoutes] 🎙️ Auto-detected and transcribed voice note: "${transcribedText}"`);

    res.json({ success: true, text: transcribedText });
  } catch (error: any) {
    console.error("[AIRoutes] Error processing voice note:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/targeting/search
 * Dynamic live Meta Graph API search for Demographics, Interests, and Behaviours
 * Query parameters:
 *   q: string (search keyword, e.g. "saree", "clothing", "real estate", "doctor")
 *   type: string (adinterest | adinterestsuggestion | adtargetingcategory)
 *   organizationId?: string
 */
router.get("/targeting/search", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const q = ((req.query.q as string) || "").trim();
    const type = (req.query.type as string) || "adinterest";

    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const { MetaAdsCoreService, META_GRAPH_BASE } = await import("../../services/meta-ads/metaAdsCoreService");
    const axios = (await import("axios")).default;
    const config = await MetaAdsCoreService.getConfig(orgId);

    const accessToken = config.accessToken || process.env.META_SYSTEM_USER_TOKEN;
    if (!accessToken) {
      console.warn("[AIRoutes] No Meta access token available for live targeting search.");
      return res.json({ success: true, data: [] });
    }

    // Query Meta Graph API in parallel for:
    // 1. adinterest (Direct interest terms)
    // 2. adtargetingcategory (Demographics, Behaviors, Life events, Job titles, Industries)
    // 3. adinterestsuggestion (Contextual expansions if query is a recognized interest)
    const [interestRes, categoryRes] = await Promise.allSettled([
      axios.get(`${META_GRAPH_BASE}/search`, {
        params: {
          type: "adinterest",
          q,
          access_token: accessToken,
          limit: 25,
        },
        timeout: 7000,
      }),
      axios.get(`${META_GRAPH_BASE}/search`, {
        params: {
          type: "adtargetingcategory",
          class: "interests",
          q,
          access_token: accessToken,
          limit: 25,
        },
        timeout: 7000,
      }),
    ]);

    const interestData = interestRes.status === "fulfilled" ? (interestRes.value.data?.data || []) : [];
    const categoryData = categoryRes.status === "fulfilled" ? (categoryRes.value.data?.data || []) : [];

    const rawData = [...interestData, ...categoryData];
    const seenIds = new Set<string>();

    const formattedData = rawData
      .filter((item: any) => {
        const idStr = String(item.id || item.name);
        if (seenIds.has(idStr.toLowerCase())) return false;
        seenIds.add(idStr.toLowerCase());
        return Boolean(item.name);
      })
      .map((item: any) => {
        // Determine Pillar Category (Demographics, Interests, or Behaviours)
        const path: string[] = item.path || [];
        const pathStr = path.join(" > ").toLowerCase();
        const typeStr = (item.type || "").toLowerCase();
        let category: "demographics" | "interests" | "behaviours" = "interests";

        if (
          pathStr.includes("demographic") ||
          item.topic === "Demographics" ||
          typeStr.includes("demographic") ||
          typeStr.includes("education") ||
          typeStr.includes("work") ||
          typeStr.includes("relationship") ||
          typeStr.includes("life_events")
        ) {
          category = "demographics";
        } else if (
          pathStr.includes("behavior") ||
          pathStr.includes("behaviour") ||
          item.topic === "Behaviors" ||
          typeStr.includes("behavior") ||
          typeStr.includes("purchase") ||
          typeStr.includes("device")
        ) {
          category = "behaviours";
        }

        return {
          id: String(item.id),
          name: item.name,
          category,
          subCategory: path.length > 1 ? path[path.length - 2] : (item.type || item.topic || "Meta Direct Match"),
          path: item.path || [],
          audienceSizeLower: item.audience_size_lower_bound || item.audience_size || null,
          audienceSizeUpper: item.audience_size_upper_bound || item.audience_size || null,
          description: item.description || (path.length > 0 ? path.join(" › ") : undefined),
        };
      });

    res.json({ success: true, data: formattedData });
  } catch (error: any) {
    console.error("[AIRoutes] Error searching Meta targeting:", error.response?.data?.error?.message || error.message);
    res.json({ success: true, data: [] });
  }
});

/**
 * GET /api/meta-ads/locations/search
 * Dynamic live Meta Graph API search for cities, regions, and countries (adgeolocation)
 * Query parameters:
 *   q: string (starting letters / city name e.g. "sat", "satara", "pun", "mum")
 *   type: string (adgeolocation)
 *   location_types: string (e.g. '["city"]')
 *   country_code?: string (e.g. "IN")
 *   organizationId?: string
 */
router.get("/locations/search", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const q = ((req.query.q as string) || "").trim();

    if (!q || q.length < 1) {
      return res.json({ success: true, data: [] });
    }

    const { MetaAdsCoreService, META_GRAPH_BASE } = await import("../../services/meta-ads/metaAdsCoreService");
    const { MetaAdsCapabilityService } = await import("../../services/meta-ads/metaAdsCapabilityService");
    const axios = (await import("axios")).default;
    const config = await MetaAdsCoreService.getConfig(orgId);

    const accessToken = config.accessToken || process.env.META_SYSTEM_USER_TOKEN;
    const cleanQuery = q.toLowerCase();
    const locationTypeReq = (req.query.type as string) || (req.query.location_types as string) || "city";
    const isCountrySearch = locationTypeReq.includes("country");

    // Comprehensive global country database for instant, error-free matching
    const GLOBAL_COUNTRIES_CATALOG = [
      { code: "IN", name: "India", region: "Asia" },
      { code: "US", name: "United States", region: "North America" },
      { code: "AE", name: "United Arab Emirates", region: "Middle East" },
      { code: "GB", name: "United Kingdom", region: "Europe" },
      { code: "CA", name: "Canada", region: "North America" },
      { code: "AU", name: "Australia", region: "Oceania" },
      { code: "SG", name: "Singapore", region: "Asia" },
      { code: "SA", name: "Saudi Arabia", region: "Middle East" },
      { code: "DE", name: "Germany", region: "Europe" },
      { code: "FR", name: "France", region: "Europe" },
      { code: "IT", name: "Italy", region: "Europe" },
      { code: "ES", name: "Spain", region: "Europe" },
      { code: "NL", name: "Netherlands", region: "Europe" },
      { code: "CH", name: "Switzerland", region: "Europe" },
      { code: "SE", name: "Sweden", region: "Europe" },
      { code: "NO", name: "Norway", region: "Europe" },
      { code: "DK", name: "Denmark", region: "Europe" },
      { code: "FI", name: "Finland", region: "Europe" },
      { code: "PL", name: "Poland", region: "Europe" },
      { code: "IE", name: "Ireland", region: "Europe" },
      { code: "NZ", name: "New Zealand", region: "Oceania" },
      { code: "JP", name: "Japan", region: "Asia" },
      { code: "KR", name: "South Korea", region: "Asia" },
      { code: "CN", name: "China", region: "Asia" },
      { code: "HK", name: "Hong Kong", region: "Asia" },
      { code: "TW", name: "Taiwan", region: "Asia" },
      { code: "MY", name: "Malaysia", region: "Asia" },
      { code: "ID", name: "Indonesia", region: "Asia" },
      { code: "TH", name: "Thailand", region: "Asia" },
      { code: "VN", name: "Vietnam", region: "Asia" },
      { code: "PH", name: "Philippines", region: "Asia" },
      { code: "BD", name: "Bangladesh", region: "Asia" },
      { code: "LK", name: "Sri Lanka", region: "Asia" },
      { code: "NP", name: "Nepal", region: "Asia" },
      { code: "PK", name: "Pakistan", region: "Asia" },
      { code: "QA", name: "Qatar", region: "Middle East" },
      { code: "KW", name: "Kuwait", region: "Middle East" },
      { code: "OM", name: "Oman", region: "Middle East" },
      { code: "BH", name: "Bahrain", region: "Middle East" },
      { code: "IL", name: "Israel", region: "Middle East" },
      { code: "TR", name: "Turkey", region: "Europe/Asia" },
      { code: "EG", name: "Egypt", region: "Africa" },
      { code: "ZA", name: "South Africa", region: "Africa" },
      { code: "NG", name: "Nigeria", region: "Africa" },
      { code: "KE", name: "Kenya", region: "Africa" },
      { code: "BR", name: "Brazil", region: "South America" },
      { code: "MX", name: "Mexico", region: "North America" },
      { code: "AR", name: "Argentina", region: "South America" },
      { code: "CL", name: "Chile", region: "South America" },
      { code: "CO", name: "Colombia", region: "South America" },
      { code: "PE", name: "Peru", region: "South America" },
      { code: "RU", name: "Russia", region: "Europe/Asia" },
    ];

    if (isCountrySearch) {
      let metaCountryResults: any[] = [];
      if (accessToken) {
        try {
          const response = await axios.get(`${META_GRAPH_BASE}/search`, {
            params: {
              type: "adgeolocation",
              location_types: JSON.stringify(["country"]),
              q: cleanQuery,
              access_token: accessToken,
              limit: 15,
            },
            timeout: 5000,
          });
          const rawData = response.data?.data || [];
          metaCountryResults = rawData.map((item: any) => ({
            key: String(item.key || item.country_code),
            name: item.name,
            displayName: `${item.name} (${item.country_code || item.key})`,
            countryCode: item.country_code || item.key,
            region: item.region || "",
            type: "country",
            supportsRadius: false,
          }));
        } catch (err: any) {
          console.warn("[AIRoutes] Live Meta country adgeolocation error:", err.message);
        }
      }

      // Merge with global catalog
      const localCountryMatches = GLOBAL_COUNTRIES_CATALOG.filter(
        (c) =>
          c.name.toLowerCase().startsWith(cleanQuery) ||
          c.name.toLowerCase().includes(cleanQuery) ||
          c.code.toLowerCase() === cleanQuery
      ).map((c) => ({
        key: c.code,
        name: c.name,
        displayName: `${c.name} (${c.code})`,
        countryCode: c.code,
        region: c.region,
        type: "country",
        supportsRadius: false,
      }));

      const seen = new Set<string>();
      const combined: any[] = [];
      for (const item of [...metaCountryResults, ...localCountryMatches]) {
        const lower = item.name.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          combined.push(item);
        }
      }
      return res.json({ success: true, data: combined.slice(0, 15) });
    }

    const isZipSearch = locationTypeReq.includes("zip") || locationTypeReq.includes("postal");

    // Known popular Indian commercial & metro PIN codes registry for immediate lookup
    const KNOWN_METRO_PINCODES: Record<string, { city: string; state: string; area: string }> = {
      "400001": { city: "Mumbai", state: "Maharashtra", area: "Fort, Nariman Point, Colaba" },
      "400050": { city: "Mumbai", state: "Maharashtra", area: "Bandra West, Khar" },
      "400051": { city: "Mumbai", state: "Maharashtra", area: "Bandra Kurla Complex (BKC)" },
      "400053": { city: "Mumbai", state: "Maharashtra", area: "Andheri West, Lokhandwala" },
      "400069": { city: "Mumbai", state: "Maharashtra", area: "Andheri East, MIDC" },
      "400076": { city: "Mumbai", state: "Maharashtra", area: "Powai, Hiranandani" },
      "411001": { city: "Pune", state: "Maharashtra", area: "Pune Camp, Station" },
      "411004": { city: "Pune", state: "Maharashtra", area: "Deccan, Shivaji Nagar" },
      "411014": { city: "Pune", state: "Maharashtra", area: "Viman Nagar, Nagar Road" },
      "411045": { city: "Pune", state: "Maharashtra", area: "Baner, Balewadi High Street" },
      "411057": { city: "Pune", state: "Maharashtra", area: "Hinjawadi IT Park" },
      "411028": { city: "Pune", state: "Maharashtra", area: "Magarpatta, Hadapsar" },
      "415001": { city: "Satara", state: "Maharashtra", area: "Satara City Center" },
      "415002": { city: "Satara", state: "Maharashtra", area: "Satara Camp, MIDC" },
      "416001": { city: "Kolhapur", state: "Maharashtra", area: "Kolhapur City, Mahalaxmi" },
      "110001": { city: "New Delhi", state: "Delhi", area: "Connaught Place, Barakhamba" },
      "110016": { city: "New Delhi", state: "Delhi", area: "Hauz Khas, Green Park" },
      "110020": { city: "New Delhi", state: "Delhi", area: "Okhla Industrial Area" },
      "122001": { city: "Gurugram", state: "Haryana", area: "Gurugram Sadar, DLF" },
      "122002": { city: "Gurugram", state: "Haryana", area: "DLF Phase 1-4, Cyber City" },
      "201301": { city: "Noida", state: "Uttar Pradesh", area: "Sector 1-20, Noida Expressway" },
      "560001": { city: "Bengaluru", state: "Karnataka", area: "MG Road, Brigade Road" },
      "560034": { city: "Bengaluru", state: "Karnataka", area: "Koramangala" },
      "560038": { city: "Bengaluru", state: "Karnataka", area: "Indiranagar" },
      "560066": { city: "Bengaluru", state: "Karnataka", area: "Whitefield, ITPL" },
      "560100": { city: "Bengaluru", state: "Karnataka", area: "Electronic City" },
      "500001": { city: "Hyderabad", state: "Telangana", area: "Abids, Koti" },
      "500081": { city: "Hyderabad", state: "Telangana", area: "HITEC City, Madhapur" },
      "500034": { city: "Hyderabad", state: "Telangana", area: "Banjara Hills" },
      "600001": { city: "Chennai", state: "Tamil Nadu", area: "George Town, Parrys" },
      "600028": { city: "Chennai", state: "Tamil Nadu", area: "R.A. Puram, Adyar" },
      "700001": { city: "Kolkata", state: "West Bengal", area: "BBD Bagh, Dalhousie" },
      "700091": { city: "Kolkata", state: "West Bengal", area: "Salt Lake Sector V" },
      "380001": { city: "Ahmedabad", state: "Gujarat", area: "Lal Darwaja, Old City" },
      "380015": { city: "Ahmedabad", state: "Gujarat", area: "SG Highway, Satellite, Prahlad Nagar" },
    };

    if (isZipSearch) {
      let metaZipResults: any[] = [];
      if (accessToken) {
        try {
          const response = await axios.get(`${META_GRAPH_BASE}/search`, {
            params: {
              type: "adgeolocation",
              location_types: JSON.stringify(["zip"]),
              q: cleanQuery,
              country_code: "IN",
              access_token: accessToken,
              limit: 15,
            },
            timeout: 5000,
          });
          const rawData = response.data?.data || [];
          metaZipResults = rawData.map((item: any) => ({
            key: String(item.key || item.name),
            name: item.name,
            displayName: `${item.name} (${item.region || item.primary_city_id || "IN"})`,
            postalCode: item.name,
            region: item.region || "IN",
            countryCode: item.country_code || "IN",
            type: "postal_code",
            supportsRadius: false,
          }));
        } catch (err: any) {
          console.warn("[AIRoutes] Live Meta zip adgeolocation error:", err.message);
        }
      }

      // Local metro PIN code matching by prefix or area name
      const localZipMatches: any[] = [];
      for (const [pin, details] of Object.entries(KNOWN_METRO_PINCODES)) {
        if (
          pin.startsWith(cleanQuery) ||
          details.city.toLowerCase().includes(cleanQuery) ||
          details.area.toLowerCase().includes(cleanQuery)
        ) {
          localZipMatches.push({
            key: pin,
            name: pin,
            displayName: `${pin} - ${details.area}, ${details.city} (${details.state})`,
            postalCode: pin,
            city: details.city,
            region: details.state,
            countryCode: "IN",
            type: "postal_code",
            supportsRadius: false,
          });
        }
      }

      const seenZips = new Set<string>();
      const combinedZips: any[] = [];
      for (const item of [...localZipMatches, ...metaZipResults]) {
        if (!seenZips.has(item.name)) {
          seenZips.add(item.name);
          combinedZips.push(item);
        }
      }
      return res.json({ success: true, data: combinedZips.slice(0, 15) });
    }

    // Check regional transliteration (e.g. "सातारा" -> "Satara")
    const transliterated = (MetaAdsCapabilityService as any).REGIONAL_CITY_TRANSLATIONS?.[cleanQuery] || q;

    let metaResults: any[] = [];

    // 1. Query Meta Marketing API /search?type=adgeolocation&location_types=["city"]
    if (accessToken) {
      try {
        const response = await axios.get(`${META_GRAPH_BASE}/search`, {
          params: {
            type: "adgeolocation",
            location_types: JSON.stringify(["city"]),
            q: transliterated,
            country_code: "IN",
            access_token: accessToken,
            limit: 15,
          },
          timeout: 6000,
        });

        const rawData = response.data?.data || [];
        metaResults = rawData.map((item: any) => ({
          key: String(item.key),
          name: item.name,
          displayName: item.region ? `${item.name}, ${item.region}, ${item.country_name || item.country_code}` : item.name,
          region: item.region || "",
          countryCode: item.country_code || "IN",
          countryName: item.country_name || "India",
          type: item.type || "city",
          supportsRadius: true,
        }));
      } catch (graphErr: any) {
        console.warn("[AIRoutes] Live Meta adgeolocation error:", graphErr.response?.data?.error?.message || graphErr.message);
      }
    }

    // 2. Fallback / Merge with built-in official Meta Geolocation Registry for instant sub-millisecond response
    const knownRegistry = (MetaAdsCapabilityService as any).KNOWN_INDIAN_CITIES_GEO_KEYS || {};
    const localMatches: any[] = [];
    for (const [cityName, info] of Object.entries(knownRegistry) as [string, any][]) {
      if (
        cityName.toLowerCase().startsWith(cleanQuery) ||
        cityName.toLowerCase().includes(cleanQuery) ||
        info.name.toLowerCase().includes(cleanQuery)
      ) {
        const parts = info.name.split(",");
        const cName = parts[0]?.trim() || cityName;
        const rName = parts[1]?.trim() || "Maharashtra";
        localMatches.push({
          key: info.key,
          name: cName,
          displayName: `${cName}, ${rName}, India`,
          region: rName,
          countryCode: "IN",
          countryName: "India",
          type: "city",
          supportsRadius: true,
        });
      }
    }

    // Merge without duplicates (favoring Meta API keys)
    const seenNames = new Set<string>();
    const merged: any[] = [];

    for (const item of [...metaResults, ...localMatches]) {
      const lower = item.name.toLowerCase();
      if (!seenNames.has(lower)) {
        seenNames.add(lower);
        merged.push(item);
      }
    }

    res.json({ success: true, data: merged.slice(0, 15) });
  } catch (error: any) {
    console.error("[AIRoutes] Error searching Meta location:", error.message);
    res.json({ success: true, data: [] });
  }
});

export default router;

