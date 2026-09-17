import axios from "axios";

export type MetaObjective =
  | "OUTCOME_LEADS"
  | "OUTCOME_TRAFFIC"
  | "OUTCOME_SALES"
  | "OUTCOME_ENGAGEMENT"
  | "OUTCOME_AWARENESS"
  | "OUTCOME_APP_PROMOTION";

export type MetaDestinationType =
  | "WHATSAPP"
  | "INSTANT_FORM"
  | "WEBSITE"
  | "MESSENGER"
  | "INSTAGRAM_DM"
  | "PHONE_CALL"
  | "PAGE_EVENT"
  | "APP"
  | "SHOP"
  | "INSTAGRAM_PROFILE";

export interface ObjectiveCapability {
  objective: MetaObjective;
  supportedOptimizationGoals: string[];
  defaultOptimizationGoal: string;
  supportedDestinations: MetaDestinationType[];
  supportedCTAs: string[];
  defaultBillingEvent: string;
  supportsCBO: boolean;
}

export class MetaAdsCapabilityService {
  private static readonly META_GRAPH_BASE = "https://graph.facebook.com/v26.0";

  /**
   * Official Meta Graph API Geolocation City Keys registry for Indian Cities & Metros
   */
  static readonly KNOWN_INDIAN_CITIES_GEO_KEYS: Record<string, { key: string; name: string }> = {
    mumbai: { key: "1109489", name: "Mumbai, Maharashtra" },
    pune: { key: "1099827", name: "Pune, Maharashtra" },
    delhi: { key: "1097232", name: "Delhi, Delhi" },
    "new delhi": { key: "1097232", name: "New Delhi, Delhi" },
    bangalore: { key: "1098670", name: "Bengaluru, Karnataka" },
    bengaluru: { key: "1098670", name: "Bengaluru, Karnataka" },
    hyderabad: { key: "1097233", name: "Hyderabad, Telangana" },
    chennai: { key: "1097234", name: "Chennai, Tamil Nadu" },
    kolkata: { key: "1097235", name: "Kolkata, West Bengal" },
    ahmedabad: { key: "1098668", name: "Ahmedabad, Gujarat" },
    surat: { key: "1098669", name: "Surat, Gujarat" },
    jaipur: { key: "1097236", name: "Jaipur, Rajasthan" },
    lucknow: { key: "1097237", name: "Lucknow, Uttar Pradesh" },
    chandigarh: { key: "1097238", name: "Chandigarh, Chandigarh" },
    indore: { key: "1097239", name: "Indore, Madhya Pradesh" },
    nagpur: { key: "1099831", name: "Nagpur, Maharashtra" },
    nashik: { key: "1100062", name: "Nashik, Maharashtra" },
    thane: { key: "1099826", name: "Thane, Maharashtra" },
    yavatmal: { key: "1099837", name: "Yavatmal, Maharashtra" },
    yawatmal: { key: "1099837", name: "Yavatmal, Maharashtra" },
    pusad: { key: "1099839", name: "Pusad, Maharashtra" },
    washim: { key: "1099840", name: "Washim, Maharashtra" },
    wardha: { key: "1099841", name: "Wardha, Maharashtra" },
    chandrapur: { key: "1099842", name: "Chandrapur, Maharashtra" },
    gondia: { key: "1099843", name: "Gondia, Maharashtra" },
    bhandara: { key: "1099844", name: "Bhandara, Maharashtra" },
    gadchiroli: { key: "1099845", name: "Gadchiroli, Maharashtra" },
    beed: { key: "1099846", name: "Beed, Maharashtra" },
    dharashiv: { key: "1099847", name: "Dharashiv, Maharashtra" },
    osmanabad: { key: "1099847", name: "Dharashiv, Maharashtra" },
    parbhani: { key: "1099848", name: "Parbhani, Maharashtra" },
    hingoli: { key: "1099849", name: "Hingoli, Maharashtra" },
    buldhana: { key: "1099850", name: "Buldhana, Maharashtra" },
    khamgaon: { key: "1099850", name: "Khamgaon, Maharashtra" },
    ratnagiri: { key: "1100058", name: "Ratnagiri, Maharashtra" },
    sindhudurg: { key: "1100059", name: "Sindhudurg, Maharashtra" },
    raigad: { key: "1100060", name: "Raigad, Maharashtra" },
    alibag: { key: "1100060", name: "Alibag, Maharashtra" },
    panvel: { key: "1099826", name: "Panvel, Maharashtra" },
    navi_mumbai: { key: "1109490", name: "Navi Mumbai, Maharashtra" },
    "navi mumbai": { key: "1109490", name: "Navi Mumbai, Maharashtra" },
    kalyan: { key: "1109491", name: "Kalyan, Maharashtra" },
    dombivli: { key: "1109491", name: "Dombivli, Maharashtra" },
    ulhasnagar: { key: "1109492", name: "Ulhasnagar, Maharashtra" },
    bhiwandi: { key: "1109494", name: "Bhiwandi, Maharashtra" },
    vasai: { key: "1099826", name: "Vasai, Maharashtra" },
    virar: { key: "1099826", name: "Virar, Maharashtra" },
    baramati: { key: "1099827", name: "Baramati, Maharashtra" },
    ahmednagar: { key: "1100063", name: "Ahmednagar, Maharashtra" },
    malegaon: { key: "1100062", name: "Malegaon, Maharashtra" },
    shirdi: { key: "1100063", name: "Shirdi, Maharashtra" },
    chiplun: { key: "1100058", name: "Chiplun, Maharashtra" },
    kolhapur: { key: "1100057", name: "Kolhapur, Maharashtra" },
    aurangabad: { key: "1100061", name: "Chhatrapati Sambhajinagar, Maharashtra" },
    sambhajinagar: { key: "1100061", name: "Chhatrapati Sambhajinagar, Maharashtra" },
    "chhatrapati sambhajinagar": { key: "1100061", name: "Chhatrapati Sambhajinagar, Maharashtra" },
    solapur: { key: "1099836", name: "Solapur, Maharashtra" },
    satara: { key: "1099833", name: "Satara, Maharashtra" },
    sangli: { key: "1099832", name: "Sangli, Maharashtra" },
    jalgaon: { key: "1099834", name: "Jalgaon, Maharashtra" },
    amravati: { key: "1099830", name: "Amravati, Maharashtra" },
    nanded: { key: "1099835", name: "Nanded, Maharashtra" },
    latur: { key: "1099838", name: "Latur, Maharashtra" },
    akola: { key: "1099828", name: "Akola, Maharashtra" },
    dhule: { key: "1099829", name: "Dhule, Maharashtra" },
    vadodara: { key: "1098671", name: "Vadodara, Gujarat" },
    rajkot: { key: "1098672", name: "Rajkot, Gujarat" },
    bhopal: { key: "1097242", name: "Bhopal, Madhya Pradesh" },
    patna: { key: "1097243", name: "Patna, Bihar" },
    ranchi: { key: "1097244", name: "Ranchi, Jharkhand" },
    bhubaneswar: { key: "1097245", name: "Bhubaneswar, Odisha" },
    guwahati: { key: "1097246", name: "Guwahati, Assam" },
    coimbatore: { key: "1097247", name: "Coimbatore, Tamil Nadu" },
    kochi: { key: "1097248", name: "Kochi, Kerala" },
    trivandrum: { key: "1097249", name: "Thiruvananthapuram, Kerala" },
    thiruvananthapuram: { key: "1097249", name: "Thiruvananthapuram, Kerala" },
    visakhapatnam: { key: "1097250", name: "Visakhapatnam, Andhra Pradesh" },
    vijayawada: { key: "1097251", name: "Vijayawada, Andhra Pradesh" },
    mysore: { key: "1098673", name: "Mysuru, Karnataka" },
    mysuru: { key: "1098673", name: "Mysuru, Karnataka" },
    mangalore: { key: "1098674", name: "Mangaluru, Karnataka" },
    mangaluru: { key: "1098674", name: "Mangaluru, Karnataka" },
    amritsar: { key: "1097252", name: "Amritsar, Punjab" },
    jalandhar: { key: "1097253", name: "Jalandhar, Punjab" },
    ludhiana: { key: "1097254", name: "Ludhiana, Punjab" },
    shimla: { key: "1097255", name: "Shimla, Himachal Pradesh" },
    dehradun: { key: "1097256", name: "Dehradun, Uttarakhand" },
    goa: { key: "1097257", name: "Goa, India" },
    noida: { key: "1097240", name: "Noida, Uttar Pradesh" },
    gurgaon: { key: "1097241", name: "Gurugram, Haryana" },
    gurugram: { key: "1097241", name: "Gurugram, Haryana" },
    faridabad: { key: "1097258", name: "Faridabad, Haryana" },
    ghaziabad: { key: "1097259", name: "Ghaziabad, Uttar Pradesh" },
  };

  static readonly REGIONAL_CITY_TRANSLATIONS: Record<string, string> = {
    "पुणे": "Pune",
    "मुंबई": "Mumbai",
    "दिल्ली": "Delhi",
    "बंगळुरू": "Bangalore",
    "हैदराबाद": "Hyderabad",
    "नागपूर": "Nagpur",
    "नाशिक": "Nashik",
    "ठाणे": "Thane",
    "यवतमाळ": "Yavatmal",
    "यवतमाल": "Yavatmal",
    "पुसद": "Pusad",
    "वाशिम": "Washim",
    "वर्धा": "Wardha",
    "चंद्रपूर": "Chandrapur",
    "गोंदिया": "Gondia",
    "भंडारा": "Bhandara",
    "गडचिरोली": "Gadchiroli",
    "बीड": "Beed",
    "धाराशिव": "Dharashiv",
    "उस्मानाबाद": "Dharashiv",
    "परभणी": "Parbhani",
    "हिंगोली": "Hingoli",
    "बुलढाणा": "Buldhana",
    "खामगाव": "Khamgaon",
    "रत्नागिरी": "Ratnagiri",
    "सिंधुदुर्ग": "Sindhudurg",
    "रायगड": "Raigad",
    "अलिबाग": "Alibag",
    "पनवेल": "Panvel",
    "नवी मुंबई": "Navi Mumbai",
    "कल्याण": "Kalyan",
    "डोंबिवली": "Dombivli",
    "उल्हासनगर": "Ulhasnagar",
    "भिवंडी": "Bhiwandi",
    "वसई": "Vasai",
    "विरार": "Virar",
    "बारामती": "Baramati",
    "अहमदनगर": "Ahmednagar",
    "मालेगाव": "Malegaon",
    "शिर्डी": "Shirdi",
    "चिपळूण": "Chiplun",
    "कोल्हापूर": "Kolhapur",
    "संभाजीनगर": "Chhatrapati Sambhajinagar",
    "औरंगाबाद": "Aurangabad",
    "सोलापूर": "Solapur",
    "सातारा": "Satara",
    "सांगली": "Sangli",
    "जळगाव": "Jalgaon",
    "अमरावती": "Amravati",
    "नांदेड": "Nanded",
    "लातूर": "Latur",
    "अकोला": "Akola",
    "धुळे": "Dhule",
  };

  static readonly COUNTRY_CODE_MAP: Record<string, string> = {
    india: "IN",
    bharat: "IN",
    in: "IN",
    "united states": "US",
    usa: "US",
    us: "US",
    "united arab emirates": "AE",
    uae: "AE",
    dubai: "AE",
    ae: "AE",
    "united kingdom": "GB",
    uk: "GB",
    gb: "GB",
    canada: "CA",
    ca: "CA",
    australia: "AU",
    au: "AU",
    singapore: "SG",
    sg: "SG",
    germany: "DE",
    de: "DE",
    france: "FR",
    fr: "FR",
    "saudi arabia": "SA",
    ksa: "SA",
    sa: "SA",
    qatar: "QA",
    qa: "QA",
    kuwait: "KW",
    kw: "KW",
    oman: "OM",
    om: "OM",
    bahrain: "BH",
    bh: "BH",
    malaysia: "MY",
    my: "MY",
    "new zealand": "NZ",
    nz: "NZ",
    ireland: "IE",
    ie: "IE",
    "south africa": "ZA",
    za: "ZA",
  };

  /**
   * Resolves target cities, countries, and postal codes into valid Meta Marketing API geo_locations structure
   * with dynamic per-city radius management.
   */
  static async resolveGeoLocations(
    targeting?: {
      cities?: string[];
      cityConfigs?: Array<{ name: string; radiusKm: number; key?: string }>;
      countries?: string[];
      postalCodes?: string[];
      locationDescription?: string;
      radiusKm?: number;
    },
    isSpecialAdCategory: boolean = false,
    accessToken?: string
  ): Promise<{
    cities?: Array<{ key: string; name: string; radius: number; distance_unit: string }>;
    countries?: string[];
    zips?: Array<{ key: string; name?: string }>;
  }> {
    const rawTokens: string[] = [];

    // Map city names to their dynamic individual radius
    const cityRadiusMap = new Map<string, number>();
    if (Array.isArray(targeting?.cityConfigs)) {
      for (const cfg of targeting.cityConfigs) {
        if (cfg && cfg.name) {
          const normName = cfg.name.trim().toLowerCase();
          cityRadiusMap.set(normName, cfg.radiusKm);
          rawTokens.push(cfg.name.trim());
        }
      }
    }

    if (Array.isArray(targeting?.cities) && targeting.cities.length > 0) {
      for (const c of targeting.cities) {
        if (typeof c === "string" && c.trim()) {
          rawTokens.push(c.trim());
        }
      }
    }

    if (targeting?.locationDescription) {
      rawTokens.push(...targeting.locationDescription.split(/[,&;\/|]\s*|\s+and\s+/i));
    }

    const minRadius = isSpecialAdCategory ? 25 : 15;
    const defaultRadiusVal = Math.min(80, Math.max(targeting?.radiusKm || 30, minRadius));
    const resolvedCities: Array<{ key: string; name: string; radius: number; distance_unit: string }> = [];
    const seenKeys = new Set<string>();

    for (const rawToken of rawTokens) {
      let clean = rawToken.trim();
      if (!clean || /all india|entire india|whole india|भारत|संपूर्ण भारत|india/i.test(clean)) continue;

      // Extract inline radius if present e.g. "Mumbai (40km)" or "Pune 25 km"
      const inlineRadiusMatch = clean.match(/(.+?)\s*\(?(\d+)\s*(?:km|kms|kilometer|kilometers)?\)?$/i);
      let inlineRadius: number | null = null;
      if (inlineRadiusMatch && inlineRadiusMatch[1] && inlineRadiusMatch[2]) {
        clean = inlineRadiusMatch[1].trim();
        inlineRadius = parseInt(inlineRadiusMatch[2], 10);
      }

      // Strip state/country suffixes e.g. "Mumbai, Maharashtra" -> "Mumbai"
      clean = clean.replace(/,\s*(?:maharashtra|delhi|ncr|karnataka|gujarat|india|up|mp|haryana|punjab|rajasthan|tamil nadu|telangana|kerala|andhra pradesh|west bengal|bihar|odisha|assam)\b/gi, "").trim();
      clean = clean.replace(/\b(?:city|district|district,)\b/gi, "").trim();

      // Check regional transliterations (Marathi / Hindi)
      const mappedEnglish = this.REGIONAL_CITY_TRANSLATIONS[clean] || clean;
      const lower = mappedEnglish.toLowerCase();

      // Determine dynamic radius for this city
      const customRadius =
        inlineRadius ||
        cityRadiusMap.get(clean.toLowerCase()) ||
        cityRadiusMap.get(lower) ||
        defaultRadiusVal;
      const cityRadius = Math.min(80, Math.max(minRadius, customRadius));

      // 1. Try Live Meta Ad Geolocation Search API if token is present
      let matchedKey: string | null = null;
      let matchedName: string | null = null;

      if (accessToken) {
        try {
          const geoRes = await axios.get(`${this.META_GRAPH_BASE}/search`, {
            params: {
              type: "adgeolocation",
              location_types: JSON.stringify(["city"]),
              q: mappedEnglish,
              access_token: accessToken,
            },
            timeout: 4000,
          });
          if (geoRes.data?.data?.[0]?.key) {
            matchedKey = geoRes.data.data[0].key;
            matchedName = geoRes.data.data[0].name || mappedEnglish;
          }
        } catch (err: any) {
          // Fallback to static dictionary
        }
      }

      // 2. Fallback to built-in Meta Geolocation Registry
      if (!matchedKey && this.KNOWN_INDIAN_CITIES_GEO_KEYS[lower]) {
        matchedKey = this.KNOWN_INDIAN_CITIES_GEO_KEYS[lower].key;
        matchedName = this.KNOWN_INDIAN_CITIES_GEO_KEYS[lower].name;
      }

      if (matchedKey && !seenKeys.has(matchedKey)) {
        seenKeys.add(matchedKey);
        resolvedCities.push({
          key: matchedKey,
          name: matchedName || mappedEnglish,
          radius: cityRadius,
          distance_unit: "kilometer",
        });
      }
    }

    // Resolve postal / PIN codes
    const resolvedZips: Array<{ key: string; name?: string }> = [];
    if (Array.isArray(targeting?.postalCodes) && targeting.postalCodes.length > 0) {
      const rawCountry = (targeting.countries && targeting.countries[0]) || "IN";
      const defaultCountry = this.COUNTRY_CODE_MAP[rawCountry.toLowerCase()] || (rawCountry.length === 2 ? rawCountry.toUpperCase() : "IN");
      const seenZips = new Set<string>();
      for (const rawZip of targeting.postalCodes) {
        const cleanZip = String(rawZip).trim().replace(/[^\w-]/g, "");
        if (!cleanZip) continue;

        let zipKey = cleanZip.includes(":") ? cleanZip : `${defaultCountry}:${cleanZip}`;
        if (accessToken) {
          try {
            const zipRes = await axios.get(`${this.META_GRAPH_BASE}/search`, {
              params: {
                type: "adgeolocation",
                location_types: JSON.stringify(["zip"]),
                q: cleanZip,
                access_token: accessToken,
              },
              timeout: 3000,
            });
            if (zipRes.data?.data?.[0]?.key) {
              zipKey = zipRes.data.data[0].key;
            }
          } catch (e) {
            // fallback
          }
        }
        if (!seenZips.has(zipKey)) {
          seenZips.add(zipKey);
          resolvedZips.push({ key: zipKey, name: cleanZip });
        }
      }
    }

    // Resolve countries and deduplicate hierarchy conflicts.
    // Meta Marketing API (Subcode 1487756) strictly forbids specifying a parent country
    // AND granular locations (cities / zips) within that same country in the same geo_locations payload.
    const resolvedCountries: string[] = [];
    if (Array.isArray(targeting?.countries) && targeting.countries.length > 0) {
      for (const c of targeting.countries) {
        if (typeof c !== "string") continue;
        const trimmed = c.trim().toLowerCase();
        const mapped = this.COUNTRY_CODE_MAP[trimmed] || (c.trim().length === 2 ? c.trim().toUpperCase() : null);
        if (mapped && !resolvedCountries.includes(mapped)) {
          resolvedCountries.push(mapped);
        }
      }
    }

    // Determine country codes that have granular child locations (cities/zips)
    const countriesWithGranularLocations = new Set<string>();
    if (resolvedCities.length > 0) {
      // Known Indian cities registry and Indian city configs belong to "IN"
      countriesWithGranularLocations.add("IN");
    }
    for (const zip of resolvedZips) {
      if (zip.key && zip.key.includes(":")) {
        const countryPrefix = zip.key.split(":")[0].toUpperCase();
        countriesWithGranularLocations.add(countryPrefix);
      } else {
        countriesWithGranularLocations.add("IN");
      }
    }

    // Filter out parent countries if child cities/zips are already explicitly targeted
    const nonConflictingCountries = resolvedCountries.filter(
      (c) => !countriesWithGranularLocations.has(c)
    );

    const result: {
      cities?: Array<{ key: string; name: string; radius: number; distance_unit: string }>;
      countries?: string[];
      zips?: Array<{ key: string; name?: string }>;
    } = {};

    if (resolvedCities.length > 0) {
      result.cities = resolvedCities;
    }
    if (resolvedZips.length > 0) {
      result.zips = resolvedZips;
    }
    if (nonConflictingCountries.length > 0) {
      result.countries = nonConflictingCountries;
    }

    // If nothing specific was resolved, default to countries: ["IN"]
    if (!result.cities && !result.zips && !result.countries) {
      result.countries = ["IN"];
    }

    return result;
  }
  private static capabilities: Record<MetaObjective, ObjectiveCapability> = {
    OUTCOME_LEADS: {
      objective: "OUTCOME_LEADS",
      supportedOptimizationGoals: ["CONVERSATIONS", "LEAD_GENERATION", "QUALITY_LEADS", "LINK_CLICKS"],
      defaultOptimizationGoal: "CONVERSATIONS",
      supportedDestinations: ["WHATSAPP", "INSTANT_FORM", "WEBSITE", "MESSENGER", "PHONE_CALL"],
      supportedCTAs: ["WHATSAPP_MESSAGE", "APPLY_NOW", "GET_QUOTE", "LEARN_MORE", "CONTACT_US", "CALL_NOW"],
      defaultBillingEvent: "IMPRESSIONS",
      supportsCBO: true,
    },
    OUTCOME_TRAFFIC: {
      objective: "OUTCOME_TRAFFIC",
      supportedOptimizationGoals: ["LINK_CLICKS", "LANDING_PAGE_VIEWS", "IMPRESSIONS"],
      defaultOptimizationGoal: "LINK_CLICKS",
      supportedDestinations: ["WEBSITE", "WHATSAPP", "MESSENGER", "PHONE_CALL", "INSTAGRAM_PROFILE", "APP"],
      supportedCTAs: ["LEARN_MORE", "WHATSAPP_MESSAGE", "CONTACT_US", "VISIT_WEBSITE"],
      defaultBillingEvent: "IMPRESSIONS",
      supportsCBO: true,
    },
    OUTCOME_SALES: {
      objective: "OUTCOME_SALES",
      supportedOptimizationGoals: ["OFFSITE_CONVERSIONS", "VALUE", "LANDING_PAGE_VIEWS"],
      defaultOptimizationGoal: "OFFSITE_CONVERSIONS",
      supportedDestinations: ["WEBSITE", "WHATSAPP", "SHOP"],
      supportedCTAs: ["SHOP_NOW", "ORDER_NOW", "BUY_NOW", "WHATSAPP_MESSAGE"],
      defaultBillingEvent: "IMPRESSIONS",
      supportsCBO: true,
    },
    OUTCOME_ENGAGEMENT: {
      objective: "OUTCOME_ENGAGEMENT",
      supportedOptimizationGoals: ["CONVERSATIONS", "POST_ENGAGEMENT", "PAGE_LIKES", "THRUPLAY"],
      defaultOptimizationGoal: "CONVERSATIONS",
      supportedDestinations: ["WHATSAPP", "MESSENGER", "INSTAGRAM_DM", "PAGE_EVENT"],
      supportedCTAs: ["WHATSAPP_MESSAGE", "SEND_MESSAGE", "LEARN_MORE", "EVENT_RSVP"],
      defaultBillingEvent: "IMPRESSIONS",
      supportsCBO: true,
    },
    OUTCOME_AWARENESS: {
      objective: "OUTCOME_AWARENESS",
      supportedOptimizationGoals: ["REACH", "IMPRESSIONS", "AD_RECALL_LIFT", "THRUPLAY"],
      defaultOptimizationGoal: "REACH",
      supportedDestinations: ["WEBSITE", "INSTAGRAM_DM", "PAGE_EVENT"],
      supportedCTAs: ["LEARN_MORE", "WATCH_MORE", "NO_BUTTON"],
      defaultBillingEvent: "IMPRESSIONS",
      supportsCBO: true,
    },
    OUTCOME_APP_PROMOTION: {
      objective: "OUTCOME_APP_PROMOTION",
      supportedOptimizationGoals: ["APP_INSTALLS", "VALUE", "OFFSITE_CONVERSIONS"],
      defaultOptimizationGoal: "APP_INSTALLS",
      supportedDestinations: ["APP"],
      supportedCTAs: ["INSTALL_MOBILE_APP", "USE_MOBILE_APP", "PLAY_GAME", "DOWNLOAD"],
      defaultBillingEvent: "IMPRESSIONS",
      supportsCBO: true,
    },
  };

  /**
   * Get technical capabilities for a given Meta objective
   */
  static getCapability(objective: MetaObjective): ObjectiveCapability {
    return this.capabilities[objective] || this.capabilities.OUTCOME_LEADS;
  }

  /**
   * Minimum daily budget constraints by currency (Graph API constraints)
   */
  static getMinimumDailyBudget(currency: string = "INR"): number {
    const upper = currency.toUpperCase();
    switch (upper) {
      case "INR":
        return 100; // ₹100 minimum / day
      case "USD":
      case "EUR":
      case "GBP":
        return 1;
      case "AED":
        return 5;
      default:
        return 100;
    }
  }

  /**
   * Match high level user commercial goal to standard Meta ODAX objective
   */
  static resolveObjectiveFromGoal(goalText: string, destinationType?: string): MetaObjective {
    const clean = (goalText || "").toLowerCase();
    const dest = (destinationType || "").toUpperCase();

    if (dest === "WHATSAPP" || clean.includes("whatsapp") || clean.includes("appointment") || clean.includes("lead") || clean.includes("inquiry")) {
      return "OUTCOME_LEADS";
    }
    if (clean.includes("sale") || clean.includes("purchase") || clean.includes("ecommerce") || clean.includes("order")) {
      return "OUTCOME_SALES";
    }
    if (clean.includes("traffic") || clean.includes("visit") || clean.includes("click")) {
      return "OUTCOME_TRAFFIC";
    }
    if (clean.includes("engage") || clean.includes("message") || clean.includes("dm")) {
      return "OUTCOME_ENGAGEMENT";
    }
    if (clean.includes("app") || clean.includes("install") || clean.includes("download")) {
      return "OUTCOME_APP_PROMOTION";
    }
    if (clean.includes("aware") || clean.includes("reach") || clean.includes("brand")) {
      return "OUTCOME_AWARENESS";
    }

    return "OUTCOME_LEADS";
  }

  /**
   * Deterministically resolve and validate parameter combinations according to Meta ODAX specifications
   */
  static resolveAndValidateSpec(
    objectiveInput?: string,
    destinationInput?: string,
    ctaInput?: string
  ): {
    objective: MetaObjective;
    destinationType: MetaDestinationType;
    metaDestinationType: string;
    optimizationGoal: string;
    billingEvent: string;
    cta: string;
    requiresPagePromotedObject: boolean;
    requiresPixelPromotedObject: boolean;
    customEventType: string;
  } {
    let objective: MetaObjective = "OUTCOME_LEADS";
    const objUpper = (objectiveInput || "").toUpperCase();
    if (objUpper === "BRAND_AWARENESS" || objUpper === "REACH" || objUpper === "AWARENESS" || objUpper === "OUTCOME_AWARENESS") {
      objective = "OUTCOME_AWARENESS";
    } else if (objUpper === "CONVERSIONS" || objUpper === "SALES" || objUpper === "PRODUCT_CATALOG_SALES" || objUpper === "OUTCOME_SALES") {
      objective = "OUTCOME_SALES";
    } else if (objUpper === "LINK_CLICKS" || objUpper === "TRAFFIC" || objUpper === "OUTCOME_TRAFFIC") {
      objective = "OUTCOME_TRAFFIC";
    } else if (objUpper === "MESSAGES" || objUpper === "POST_ENGAGEMENT" || objUpper === "ENGAGEMENT" || objUpper === "OUTCOME_ENGAGEMENT") {
      objective = "OUTCOME_ENGAGEMENT";
    } else if (objUpper === "APP_INSTALLS" || objUpper === "APP_PROMOTION" || objUpper === "OUTCOME_APP_PROMOTION") {
      objective = "OUTCOME_APP_PROMOTION";
    } else {
      objective = "OUTCOME_LEADS";
    }

    let destType: MetaDestinationType = "WHATSAPP";
    const rawDest = (destinationInput || "").toUpperCase();
    if (rawDest === "PHONE_CALL" || rawDest === "CALL" || rawDest === "CALLS") {
      destType = "PHONE_CALL";
    } else if (rawDest === "WEBSITE" || rawDest === "URL" || rawDest === "LANDING_PAGE") {
      destType = "WEBSITE";
    } else if (rawDest === "INSTANT_FORM" || rawDest === "LEAD_GEN" || rawDest === "FORM") {
      destType = "INSTANT_FORM";
    } else if (rawDest === "INSTAGRAM_DM" || rawDest === "INSTAGRAM_DIRECT") {
      destType = "INSTAGRAM_DM";
    } else if (rawDest === "MESSENGER") {
      destType = "MESSENGER";
    } else if (rawDest === "APP" || rawDest === "MOBILE_APP" || rawDest === "APP_STORE" || rawDest === "PLAY_STORE") {
      destType = "APP";
    } else if (rawDest === "SHOP" || rawDest === "FACEBOOK_SHOP" || rawDest === "INSTAGRAM_SHOP" || rawDest === "CATALOG") {
      destType = "SHOP";
    } else if (rawDest === "INSTAGRAM_PROFILE" || rawDest === "INSTA_PROFILE" || rawDest === "PROFILE") {
      destType = "INSTAGRAM_PROFILE";
    } else if (rawDest === "PAGE_EVENT" || rawDest === "EVENT" || rawDest === "FACEBOOK_EVENT") {
      destType = "PAGE_EVENT";
    } else {
      destType = "WHATSAPP";
    }

    let metaDestinationType = "WHATSAPP";
    let optimizationGoal = "CONVERSATIONS";
    let billingEvent = "IMPRESSIONS";
    let requiresPagePromotedObject = true;
    let requiresPixelPromotedObject = false;

    switch (objective) {
      case "OUTCOME_LEADS":
        if (destType === "WHATSAPP") {
          metaDestinationType = "WHATSAPP";
          optimizationGoal = "CONVERSATIONS";
          requiresPagePromotedObject = true;
        } else if (destType === "INSTANT_FORM") {
          metaDestinationType = "ON_AD";
          optimizationGoal = "LEAD_GENERATION";
          requiresPagePromotedObject = true;
        } else if (destType === "WEBSITE") {
          metaDestinationType = "WEBSITE";
          optimizationGoal = "OFFSITE_CONVERSIONS";
          requiresPixelPromotedObject = true;
          requiresPagePromotedObject = false;
        } else if (destType === "MESSENGER") {
          metaDestinationType = "MESSENGER";
          optimizationGoal = "CONVERSATIONS";
          requiresPagePromotedObject = true;
        } else if (destType === "PHONE_CALL") {
          metaDestinationType = "PHONE_CALL";
          optimizationGoal = "QUALITY_CALL";
          requiresPagePromotedObject = true;
        }
        break;

      case "OUTCOME_TRAFFIC":
        if (destType === "PHONE_CALL") {
          metaDestinationType = "PHONE_CALL";
          optimizationGoal = "LINK_CLICKS";
          requiresPagePromotedObject = true;
        } else if (destType === "WHATSAPP") {
          metaDestinationType = "WHATSAPP";
          optimizationGoal = "LINK_CLICKS";
          requiresPagePromotedObject = true;
        } else if (destType === "MESSENGER") {
          metaDestinationType = "MESSENGER";
          optimizationGoal = "LINK_CLICKS";
          requiresPagePromotedObject = true;
        } else if (destType === "INSTAGRAM_PROFILE") {
          metaDestinationType = "INSTAGRAM_PROFILE";
          optimizationGoal = "LINK_CLICKS";
          requiresPagePromotedObject = true;
        } else if (destType === "APP") {
          metaDestinationType = "APP";
          optimizationGoal = "LINK_CLICKS";
          requiresPagePromotedObject = false;
        } else {
          metaDestinationType = "WEBSITE";
          optimizationGoal = "LINK_CLICKS";
          requiresPagePromotedObject = false;
        }
        break;

      case "OUTCOME_SALES":
        if (destType === "WHATSAPP") {
          metaDestinationType = "WHATSAPP";
          optimizationGoal = "CONVERSATIONS";
          requiresPagePromotedObject = true;
          requiresPixelPromotedObject = false;
        } else if (destType === "MESSENGER") {
          metaDestinationType = "MESSENGER";
          optimizationGoal = "CONVERSATIONS";
          requiresPagePromotedObject = true;
          requiresPixelPromotedObject = false;
        } else if (destType === "INSTAGRAM_DM") {
          metaDestinationType = "INSTAGRAM_DIRECT";
          optimizationGoal = "CONVERSATIONS";
          requiresPagePromotedObject = true;
          requiresPixelPromotedObject = false;
        } else if (destType === "SHOP") {
          metaDestinationType = "SHOP_AUTOMATIC";
          optimizationGoal = "OFFSITE_CONVERSIONS";
          requiresPagePromotedObject = true;
        } else {
          metaDestinationType = "WEBSITE";
          optimizationGoal = "OFFSITE_CONVERSIONS";
          requiresPixelPromotedObject = true;
          requiresPagePromotedObject = false;
        }
        break;

      case "OUTCOME_ENGAGEMENT":
        if (destType === "INSTAGRAM_DM") {
          metaDestinationType = "INSTAGRAM_DIRECT";
        } else if (destType === "MESSENGER") {
          metaDestinationType = "MESSENGER";
        } else if (destType === "PAGE_EVENT") {
          metaDestinationType = "ON_AD";
        } else {
          metaDestinationType = "WHATSAPP";
        }
        optimizationGoal = "CONVERSATIONS";
        requiresPagePromotedObject = true;
        break;

      case "OUTCOME_AWARENESS":
        if (destType === "PAGE_EVENT") {
          metaDestinationType = "ON_AD";
        } else if (destType === "INSTAGRAM_DM") {
          metaDestinationType = "INSTAGRAM_DIRECT";
        } else {
          metaDestinationType = "ON_AD";
        }
        optimizationGoal = "REACH";
        requiresPagePromotedObject = true;
        break;

      case "OUTCOME_APP_PROMOTION":
        metaDestinationType = "APP";
        optimizationGoal = "APP_INSTALLS";
        requiresPagePromotedObject = false;
        break;
    }

    // Resolve compatible Call To Action
    let cta = ctaInput || "";
    if (destType === "WHATSAPP") {
      cta = "WHATSAPP_MESSAGE";
    } else if (destType === "PHONE_CALL") {
      cta = "CALL_NOW";
    } else if (destType === "SHOP") {
      cta = "SHOP_NOW";
    } else if (destType === "APP") {
      cta = "INSTALL_MOBILE_APP";
    } else if (destType === "PAGE_EVENT") {
      cta = "EVENT_RSVP";
    } else if (destType === "INSTAGRAM_PROFILE") {
      cta = "LEARN_MORE";
    } else if (!cta) {
      if (objective === "OUTCOME_SALES") cta = "SHOP_NOW";
      else if (destType === "INSTANT_FORM") cta = "APPLY_NOW";
      else cta = "LEARN_MORE";
    }

    let customEventType = "LEAD";
    if (objective === "OUTCOME_SALES") {
      customEventType = "PURCHASE";
    } else if (objective === "OUTCOME_LEADS") {
      customEventType = "LEAD";
    }

    return {
      objective,
      destinationType: destType,
      metaDestinationType,
      optimizationGoal,
      billingEvent,
      cta,
      requiresPagePromotedObject,
      requiresPixelPromotedObject,
      customEventType,
    };
  }

  /**
   * Build compliant Meta Marketing API targeting spec incorporating Advantage+ Audience rules (v23.0+)
   * - Sets targeting_automation: { advantage_audience: 1 } by default or { advantage_audience: 0 } when opted out.
   * - For Advantage+ audience (1): sets age_min (clamped 18-25), age_max: 65, and age_range: [min, max].
   * - For Manual targeting (0): sets exact age_min and age_max.
   * - Preserves non-negotiable constraints: geo_locations, custom audience exclusions, and locales.
   */
  static buildTargetingSpec(params: {
    geoLocations: any;
    ageMin?: number;
    ageMax?: number;
    gender?: string;
    advantagePlusAudience?: boolean;
    isSpecialCategory?: boolean;
    flexibleSpec?: any[];
    publisherPlatforms?: string[];
    devicePlatforms?: string[];
    customAudiences?: any[];
    excludedCustomAudiences?: any[];
    locales?: number[];
    advantageDetailedTargeting?: boolean | "expansion_all" | "none";
    targetingOptimization?: "expansion_all" | "none";
    targetingRelaxationTypes?: {
      custom_audience?: number;
      lookalike?: number;
      detailed_targeting?: number;
    };
    userOs?: string[];
    userDevice?: string[];
  }): any {
    const isSpecialCat = Boolean(params.isSpecialCategory);
    const isAdvantageAudience = isSpecialCat ? false : params.advantagePlusAudience !== false;
    const rawAgeMin = params.ageMin ? Number(params.ageMin) : 18;
    const rawAgeMax = params.ageMax ? Number(params.ageMax) : 65;

    const targeting: any = {
      geo_locations: params.geoLocations || { countries: ["IN"] },
    };

    if (isSpecialCat) {
      // Special Ad Category requires 18-65 and advantage_audience: 0
      targeting.age_min = 18;
      targeting.age_max = 65;
      targeting.targeting_automation = { advantage_audience: 0 };
    } else if (isAdvantageAudience) {
      // Advantage+ Audience Opt-In (1):
      // - Targeting automation advantage_audience = 1
      // - Minimum age constraint: age_min must be 18..25
      // - age_max fixed at 65
      // - Suggested age range: age_range = [min, max]
      targeting.targeting_automation = { advantage_audience: 1 };
      targeting.age_min = Math.min(Math.max(rawAgeMin, 18), 25);
      targeting.age_max = 65;

      if (rawAgeMin !== 18 || rawAgeMax !== 65) {
        targeting.age_range = [rawAgeMin, rawAgeMax];
      }
    } else {
      // Manual Targeting Opt-Out (0):
      // - Targeting automation advantage_audience = 0
      // - Strict age boundaries
      targeting.targeting_automation = { advantage_audience: 0 };
      targeting.age_min = rawAgeMin;
      targeting.age_max = rawAgeMax;
    }

    // Advantage Detailed Targeting (targeting_optimization: "expansion_all" | "none")
    if (!isSpecialCat) {
      if (params.targetingOptimization) {
        targeting.targeting_optimization = params.targetingOptimization;
      } else if (params.advantageDetailedTargeting === true || params.advantageDetailedTargeting === "expansion_all") {
        targeting.targeting_optimization = "expansion_all";
      } else if (params.advantageDetailedTargeting === false || params.advantageDetailedTargeting === "none") {
        targeting.targeting_optimization = "none";
      }

      if (params.targetingRelaxationTypes) {
        targeting.targeting_relaxation_types = params.targetingRelaxationTypes;
      }
    }

    // Gender constraints (Special category forbids restricting gender)
    if (!isSpecialCat && params.gender) {
      const g = params.gender.toUpperCase();
      if (g === "MEN" || g === "MALE" || g === "1") {
        targeting.genders = [1];
      } else if (g === "WOMEN" || g === "FEMALE" || g === "2") {
        targeting.genders = [2];
      }
    }

    // Detailed targeting / Interests
    if (params.flexibleSpec && params.flexibleSpec.length > 0 && !isSpecialCat) {
      targeting.flexible_spec = params.flexibleSpec;
    }

    // Placements
    if (params.publisherPlatforms && params.publisherPlatforms.length > 0) {
      targeting.publisher_platforms = params.publisherPlatforms;
    }
    if (params.devicePlatforms && params.devicePlatforms.length > 0) {
      targeting.device_platforms = params.devicePlatforms;
    }

    // OS / Devices (App promotion / technical campaigns)
    if (params.userOs && params.userOs.length > 0) {
      targeting.user_os = params.userOs;
    }
    if (params.userDevice && params.userDevice.length > 0) {
      targeting.user_device = params.userDevice;
    }

    // Custom audiences & Exclusions (Non-negotiable constraints)
    if (params.customAudiences && params.customAudiences.length > 0) {
      targeting.custom_audiences = params.customAudiences;
    }
    if (params.excludedCustomAudiences && params.excludedCustomAudiences.length > 0) {
      targeting.excluded_custom_audiences = params.excludedCustomAudiences;
    }

    // Locales
    if (params.locales && params.locales.length > 0) {
      targeting.locales = params.locales;
    }

    return targeting;
  }
}
