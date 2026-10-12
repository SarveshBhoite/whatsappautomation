import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface MonthlySearchVolume {
  month: string;
  year: string;
  monthlySearches: number;
}

export interface KeywordIdeaItem {
  text: string;
  avgMonthlySearches: number;
  competition: "UNSPECIFIED" | "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH";
  competitionIndex: number; // 0 to 100
  lowTopOfPageBid: number; // in customer currency units (e.g. INR)
  highTopOfPageBid: number; // in customer currency units (e.g. INR)
  monthlySearchVolumes: MonthlySearchVolume[];
}

export interface KeywordPlannerTargetingOption {
  id: string;
  name: string;
  constant: string;
}

export interface KeywordPlannerConfig {
  languages: KeywordPlannerTargetingOption[];
  geoTargets: KeywordPlannerTargetingOption[];
}

export interface GenerateKeywordIdeasParams {
  keywords?: string[];
  url?: string;
  languageConstant?: string;
  geoTargetConstants?: string[];
  includeAdultKeywords?: boolean;
}

export class GoogleAdsKeywordPlannerService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  /**
   * Predefined supported language constants for Google Ads Keyword Planning.
   */
  public static readonly SUPPORTED_LANGUAGES: KeywordPlannerTargetingOption[] = [
    { id: "1000", name: "English", constant: "languageConstants/1000" },
    { id: "1023", name: "Hindi", constant: "languageConstants/1023" },
    { id: "1003", name: "Spanish", constant: "languageConstants/1003" },
    { id: "1002", name: "French", constant: "languageConstants/1002" },
    { id: "1001", name: "German", constant: "languageConstants/1001" },
    { id: "1019", name: "Arabic", constant: "languageConstants/1019" },
    { id: "1032", name: "Bengali", constant: "languageConstants/1032" },
    { id: "1031", name: "Marathi", constant: "languageConstants/1031" },
    { id: "1030", name: "Tamil", constant: "languageConstants/1030" },
    { id: "1033", name: "Telugu", constant: "languageConstants/1033" },
    { id: "1034", name: "Gujarati", constant: "languageConstants/1034" },
    { id: "1035", name: "Kannada", constant: "languageConstants/1035" },
    { id: "1036", name: "Malayalam", constant: "languageConstants/1036" },
    { id: "1037", name: "Punjabi", constant: "languageConstants/1037" }
  ];

  /**
   * Predefined supported geographic targeting constants for Google Ads Keyword Planning.
   */
  public static readonly SUPPORTED_GEO_TARGETS: KeywordPlannerTargetingOption[] = [
    { id: "2356", name: "India (Country)", constant: "geoTargetConstants/2356" },
    { id: "2840", name: "United States (Country)", constant: "geoTargetConstants/2840" },
    { id: "2784", name: "United Arab Emirates (Country)", constant: "geoTargetConstants/2784" },
    { id: "2826", name: "United Kingdom (Country)", constant: "geoTargetConstants/2826" },
    { id: "2124", name: "Canada (Country)", constant: "geoTargetConstants/2124" },
    { id: "2036", name: "Australia (Country)", constant: "geoTargetConstants/2036" },
    { id: "2702", name: "Singapore (Country)", constant: "geoTargetConstants/2702" },
    { id: "2682", name: "Saudi Arabia (Country)", constant: "geoTargetConstants/2682" },
    { id: "1007788", name: "Mumbai, Maharashtra, India", constant: "geoTargetConstants/1007788" },
    { id: "1007785", name: "Delhi, India", constant: "geoTargetConstants/1007785" },
    { id: "9061994", name: "Bengaluru, Karnataka, India", constant: "geoTargetConstants/9061994" },
    { id: "9061998", name: "Hyderabad, Telangana, India", constant: "geoTargetConstants/9061998" },
    { id: "1007809", name: "Pune, Maharashtra, India", constant: "geoTargetConstants/1007809" },
    { id: "9062000", name: "Chennai, Tamil Nadu, India", constant: "geoTargetConstants/9062000" },
    { id: "9062002", name: "Kolkata, West Bengal, India", constant: "geoTargetConstants/9062002" },
    { id: "9061992", name: "Ahmedabad, Gujarat, India", constant: "geoTargetConstants/9061992" },
    { id: "9062004", name: "Dubai, United Arab Emirates", constant: "geoTargetConstants/9062004" },
    { id: "1023191", name: "New York, NY, United States", constant: "geoTargetConstants/1023191" },
    { id: "1006886", name: "London, England, United Kingdom", constant: "geoTargetConstants/1006886" }
  ];

  /**
   * Returns available targeting config and options for Keyword Planner UI.
   */
  public static getPlannerConfig(): KeywordPlannerConfig {
    return {
      languages: this.SUPPORTED_LANGUAGES,
      geoTargets: this.SUPPORTED_GEO_TARGETS
    };
  }

  /**
   * Resolves the dynamic currency code for the selected Google Ads customer.
   */
  public static async getCustomerCurrency(organizationId: string, customerId: string): Promise<string> {
    const cleanCid = customerId.replace(/-/g, "").trim();
    try {
      const { headers } = await this.getAdsHeaders(organizationId, cleanCid);
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cleanCid}/googleAds:search`,
        { query: "SELECT customer.currency_code FROM customer LIMIT 1" },
        { headers }
      );
      return res.data?.results?.[0]?.customer?.currencyCode || "INR";
    } catch {
      return "INR";
    }
  }

  /**
   * Generates keyword ideas using Google Ads API v24 `generateKeywordIdeas` method.
   */
  public static async generateKeywordIdeas(
    organizationId: string,
    customerId: string,
    params: GenerateKeywordIdeasParams
  ): Promise<{
    success: boolean;
    currencyCode: string;
    totalIdeas: number;
    results: KeywordIdeaItem[];
    targeting: {
      language: string;
      geoTargets: string[];
    };
  }> {
    const cleanCid = customerId.replace(/-/g, "").trim();
    if (!cleanCid) {
      throw new Error("customerId is required.");
    }

    // Input validation: Must supply either keywords, url, or both
    const rawKeywords = params.keywords || [];
    const validKeywords = rawKeywords
      .map(k => (typeof k === "string" ? k.trim() : ""))
      .filter(k => k.length > 0);

    const validUrl = params.url && typeof params.url === "string" ? params.url.trim() : "";

    if (validKeywords.length === 0 && !validUrl) {
      throw new Error("At least one seed keyword or a valid website URL must be provided.");
    }

    // Language & Geo Targeting validation
    const languageConstant = params.languageConstant && params.languageConstant.startsWith("languageConstants/")
      ? params.languageConstant
      : "languageConstants/1000"; // default English

    let geoTargetConstants = (params.geoTargetConstants || [])
      .filter(g => typeof g === "string" && g.startsWith("geoTargetConstants/"));

    if (geoTargetConstants.length === 0) {
      geoTargetConstants = ["geoTargetConstants/2356"]; // default India
    }

    // Build official Google Ads v24 request payload
    // Exactly one of keywordAndUrlSeed, keywordSeed, urlSeed, or siteSeed must be set.
    const requestBody: any = {
      customerId: cleanCid,
      language: languageConstant,
      geoTargetConstants,
      includeAdultKeywords: !!params.includeAdultKeywords
    };

    if (validKeywords.length > 0 && validUrl) {
      requestBody.keywordAndUrlSeed = {
        keywords: validKeywords.slice(0, 20),
        url: validUrl
      };
    } else if (validKeywords.length > 0) {
      requestBody.keywordSeed = {
        keywords: validKeywords.slice(0, 20)
      };
    } else if (validUrl) {
      requestBody.urlSeed = {
        url: validUrl
      };
    }

    const { headers } = await this.getAdsHeaders(organizationId, cleanCid);
    const currencyCode = await this.getCustomerCurrency(organizationId, cleanCid);

    try {
      const endpoint = `${this.ADS_BASE}/customers/${cleanCid}:generateKeywordIdeas`;
      const response = await axios.post(endpoint, requestBody, { headers });

      const rawResults = response.data?.results || [];

      const results: KeywordIdeaItem[] = rawResults.map((item: any) => {
        const text = item.text || "";
        const metrics = item.keywordIdeaMetrics || {};

        const avgMonthlySearches = metrics.avgMonthlySearches ? Number(metrics.avgMonthlySearches) : 0;
        const competition = (metrics.competition || "UNSPECIFIED") as KeywordIdeaItem["competition"];
        const competitionIndex = metrics.competitionIndex ? Number(metrics.competitionIndex) : 0;

        // Convert bids from micros to standard currency units
        const lowTopOfPageBidMicros = metrics.lowTopOfPageBidMicros ? Number(metrics.lowTopOfPageBidMicros) : 0;
        const highTopOfPageBidMicros = metrics.highTopOfPageBidMicros ? Number(metrics.highTopOfPageBidMicros) : 0;

        const lowTopOfPageBid = Number((lowTopOfPageBidMicros / 1_000_000).toFixed(2));
        const highTopOfPageBid = Number((highTopOfPageBidMicros / 1_000_000).toFixed(2));

        const rawVolumes = metrics.monthlySearchVolumes || [];
        const monthlySearchVolumes: MonthlySearchVolume[] = rawVolumes.map((vol: any) => ({
          month: vol.month || "",
          year: vol.year ? String(vol.year) : "",
          monthlySearches: vol.monthlySearches ? Number(vol.monthlySearches) : 0
        }));

        return {
          text,
          avgMonthlySearches,
          competition,
          competitionIndex,
          lowTopOfPageBid,
          highTopOfPageBid,
          monthlySearchVolumes
        };
      });

      return {
        success: true,
        currencyCode,
        totalIdeas: results.length,
        results,
        targeting: {
          language: languageConstant,
          geoTargets: geoTargetConstants
        }
      };
    } catch (error: any) {
      const gError = error.response?.data?.error;
      const detailMessage = gError?.details?.[0]?.errors?.[0]?.message || gError?.message || error.message;
      console.error("[GoogleAdsKeywordPlannerService] API error:", JSON.stringify(error.response?.data || error.message, null, 2));
      throw new Error(`Google Ads Keyword Planner error: ${detailMessage}`);
    }
  }
}
