import axios from "axios";
import { META_GRAPH_BASE, MetaAdsCoreService } from "./metaAdsCoreService";

export interface TargetingOptionStatusResult {
  id: string;
  current_status: "NORMAL" | "NON-DELIVERABLE" | "DEPRECATING" | "NON-DELIVERABLE-IN-EXCLUSION" | "UNKNOWN";
  future_plan?: Array<{ key: string; value: string }>;
}

export type GeoLocationType =
  | "country"
  | "country_group"
  | "region"
  | "city"
  | "zip"
  | "geo_market"
  | "electoral_district";

export interface GeoLocationResult {
  key: string;
  name: string;
  type: string;
  country_code?: string;
  country_name?: string;
  region?: string;
  region_id?: number;
  primary_city?: string;
  primary_city_id?: number;
  supports_region?: boolean;
  supports_city?: boolean;
  is_worldwide?: boolean;
  country_codes?: string[];
  geo_hierarchy_level?: string;
  geo_hierarchy_name?: string;
}

export interface GeoLocationMetaRequest {
  countries?: string[];
  regions?: number[];
  country_groups?: string[];
  cities?: number[];
  zips?: string[];
}

export interface GeoLocationMetaResult {
  countries?: Record<string, { key: string; type: string; name: string; supports_city: boolean; supports_region: boolean }>;
  regions?: Record<string, { key: string; type: string; name: string; country_code: string; supports_city: boolean; supports_region: boolean }>;
  cities?: Record<string, { key: string; type: string; name: string; region_id: number; region: string; country_code: string; supports_city: boolean; supports_region: boolean }>;
  zips?: Record<string, { key: string; type: string; name: string; primary_city: string; region_id: number; region: string; country_code: string; supports_city: boolean; supports_region: boolean }>;
}

export interface RadiusSuggestionResult {
  suggested_radius: number;
  distance_unit: "mile" | "kilometer";
}

export interface InterestResult {
  id: string | number;
  name: string;
  audience_size?: number;
  audience_size_lower_bound?: number;
  audience_size_upper_bound?: number;
  path?: string[];
  description?: string | null;
  topic?: string;
}

export interface InterestValidationResult {
  name?: string;
  id?: string | number;
  valid: boolean;
  audience_size?: number;
}

export interface DemographicTargetingResult {
  id: string | number;
  name: string;
  coverage?: number;
  audience_size_lower_bound?: number;
  audience_size_upper_bound?: number;
  subtext?: string;
  description?: string;
  type?: string;
  path?: string[];
}

export interface LocaleResult {
  key: number;
  name: string;
}

export type DetailedTargetingLimitType =
  | "interests"
  | "education_schools"
  | "education_majors"
  | "work_positions"
  | "work_employers"
  | "relationship_statuses"
  | "college_years"
  | "education_statuses"
  | "family_statuses"
  | "industries"
  | "life_events"
  | "behaviors"
  | "income";

export interface DetailedTargetingPair {
  type: string;
  id: string | number;
}

export interface DetailedTargetingItem {
  id: string;
  name: string;
  audience_size_lower_bound?: number;
  audience_size_upper_bound?: number;
  path?: string[];
  description?: string;
  type?: string;
  valid?: boolean;
}

/**
 * MetaTargetingSearchService:
 * Full implementation of Meta Marketing API Targeting Search endpoints:
 * - Targeting Option Status (targetingoptionstatus)
 * - Geographic Search (adgeolocation): Countries, Regions, Cities, Zip codes, Geo-Markets, Electoral Districts
 * - Geolocation Metadata (adgeolocationmeta)
 * - Radius Suggestions (adradiussuggestion)
 * - Interest Search (adinterest)
 * - Interest Suggestions (adinterestsuggestion)
 * - Interest Validation (adinterestvalid)
 * - Targeting Categories (adTargetingCategory: interests, behaviors, demographics, life_events, industries, income, family_statuses, user_device, user_os)
 * - Demographics Autocomplete (adeducationschool, adeducationmajor, adworkemployer, adworkposition)
 * - Locales (adlocale)
 */
export class MetaTargetingSearchService {
  /**
   * Helper to retrieve active Graph API access token
   */
  private static async getEffectiveToken(organizationId: string = "default", tokenOverride?: string): Promise<string | undefined> {
    if (tokenOverride && tokenOverride.trim().length > 10) {
      return tokenOverride.trim();
    }
    try {
      const config = await MetaAdsCoreService.getConfig(organizationId);
      if (config.accessToken && config.accessToken.trim().length > 10) {
        return config.accessToken.trim();
      }
    } catch {
      // ignore
    }
    return process.env.META_SYSTEM_USER_TOKEN || process.env.META_ACCESS_TOKEN;
  }

  /**
   * 1. Check current and/or planned status of targeting objects
   * GET /search?type=targetingoptionstatus&targeting_option_list=[...]
   */
  static async searchTargetingOptionStatus(
    targetingOptionIds: string[],
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<TargetingOptionStatusResult[]> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    if (!accessToken) {
      return targetingOptionIds.map((id) => ({ id, current_status: "UNKNOWN" }));
    }

    try {
      const response = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: {
          type: "targetingoptionstatus",
          targeting_option_list: JSON.stringify(targetingOptionIds),
          access_token: accessToken,
        },
        timeout: 10000,
      });

      return response.data?.data || [];
    } catch (err: any) {
      console.warn("[MetaTargetingSearch] Error fetching targeting option status:", err.response?.data?.error?.message || err.message);
      return targetingOptionIds.map((id) => ({ id, current_status: "NORMAL" }));
    }
  }

  /**
   * 2. Geographic Search (adgeolocation)
   * Search targeting by country, country group, city, region, zip code, geo_market, or electoral_district
   * GET /search?type=adgeolocation&location_types=[...]&q=...
   */
  static async searchGeoLocations(
    params: {
      q?: string;
      location_types?: GeoLocationType[];
      country_code?: string;
      region_id?: number;
      match_country_code?: boolean;
      limit?: number;
    },
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<GeoLocationResult[]> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    const q = (params.q || "").trim();
    const locationTypes = params.location_types && params.location_types.length > 0 ? params.location_types : ["city"];

    if (!accessToken) {
      return [];
    }

    try {
      const queryParams: Record<string, any> = {
        type: "adgeolocation",
        location_types: JSON.stringify(locationTypes),
        access_token: accessToken,
        limit: params.limit || 20,
      };

      if (q.length > 0) {
        queryParams.q = q;
      }
      if (params.country_code) {
        queryParams.country_code = params.country_code;
      }
      if (params.region_id) {
        queryParams.region_id = params.region_id;
      }
      if (params.match_country_code !== undefined) {
        queryParams.match_country_code = params.match_country_code;
      }

      const response = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: queryParams,
        timeout: 10000,
      });

      return response.data?.data || [];
    } catch (err: any) {
      console.warn("[MetaTargetingSearch] Error querying adgeolocation:", err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * 3. Geolocation Metadata (adgeolocationmeta)
   * Query metadata for specified countries, regions, country_groups, cities, or zip codes
   * GET /search?type=adgeolocationmeta&cities=[...]&countries=[...]
   */
  static async getGeoLocationsMetadata(
    metaRequest: GeoLocationMetaRequest,
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<GeoLocationMetaResult> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    if (!accessToken) {
      return {};
    }

    try {
      const queryParams: Record<string, any> = {
        type: "adgeolocationmeta",
        access_token: accessToken,
      };

      if (metaRequest.countries && metaRequest.countries.length > 0) {
        queryParams.countries = JSON.stringify(metaRequest.countries);
      }
      if (metaRequest.regions && metaRequest.regions.length > 0) {
        queryParams.regions = JSON.stringify(metaRequest.regions);
      }
      if (metaRequest.country_groups && metaRequest.country_groups.length > 0) {
        queryParams.country_groups = JSON.stringify(metaRequest.country_groups);
      }
      if (metaRequest.cities && metaRequest.cities.length > 0) {
        queryParams.cities = JSON.stringify(metaRequest.cities);
      }
      if (metaRequest.zips && metaRequest.zips.length > 0) {
        queryParams.zips = JSON.stringify(metaRequest.zips);
      }

      const response = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: queryParams,
        timeout: 10000,
      });

      return response.data?.data || {};
    } catch (err: any) {
      console.warn("[MetaTargetingSearch] Error fetching adgeolocationmeta:", err.response?.data?.error?.message || err.message);
      return {};
    }
  }

  /**
   * 4. Radius Suggestions (adradiussuggestion)
   * Get recommended reach radius around a latitude/longitude coordinate
   * GET /search?type=adradiussuggestion&latitude=...&longitude=...&distance_unit=...
   */
  static async getSuggestedRadius(
    latitude: number,
    longitude: number,
    distanceUnit: "mile" | "kilometer" = "kilometer",
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<RadiusSuggestionResult | null> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    if (!accessToken) {
      return { suggested_radius: distanceUnit === "kilometer" ? 16 : 10, distance_unit: distanceUnit };
    }

    try {
      const response = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: {
          type: "adradiussuggestion",
          latitude,
          longitude,
          distance_unit: distanceUnit,
          access_token: accessToken,
        },
        timeout: 10000,
      });

      const first = response.data?.data?.[0];
      if (first && first.suggested_radius) {
        return {
          suggested_radius: Number(first.suggested_radius),
          distance_unit: first.distance_unit || distanceUnit,
        };
      }
      return { suggested_radius: distanceUnit === "kilometer" ? 16 : 10, distance_unit: distanceUnit };
    } catch (err: any) {
      console.warn("[MetaTargetingSearch] Error querying adradiussuggestion:", err.response?.data?.error?.message || err.message);
      return { suggested_radius: distanceUnit === "kilometer" ? 16 : 10, distance_unit: distanceUnit };
    }
  }

  /**
   * 5. Interest Search (adinterest)
   * Search for specific interest keywords
   * GET /search?type=adinterest&q=...
   */
  static async searchInterests(
    query: string,
    locale: string = "en_US",
    limit: number = 25,
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<InterestResult[]> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    const q = query.trim();
    if (!q || !accessToken) return [];

    try {
      const response = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: {
          type: "adinterest",
          q,
          locale,
          limit,
          access_token: accessToken,
        },
        timeout: 10000,
      });

      return response.data?.data || [];
    } catch (err: any) {
      console.warn("[MetaTargetingSearch] Error searching adinterest:", err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * 6. Interest Suggestions (adinterestsuggestion)
   * Query suggestions based on a list of seed interests
   * GET /search?type=adinterestsuggestion&interest_list=[...]
   */
  static async getInterestSuggestions(
    interestList: string[],
    limit: number = 25,
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<InterestResult[]> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    if (!interestList || interestList.length === 0 || !accessToken) return [];

    try {
      const response = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: {
          type: "adinterestsuggestion",
          interest_list: JSON.stringify(interestList),
          limit,
          access_token: accessToken,
        },
        timeout: 10000,
      });

      return response.data?.data || [];
    } catch (err: any) {
      console.warn("[MetaTargetingSearch] Error getting adinterestsuggestion:", err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * 7. Validate Interests (adinterestvalid)
   * Validate keyword strings or FBIDs to verify if they are valid Meta targeting options
   * GET /search?type=adinterestvalid&interest_list=[...]
   */
  static async validateInterests(
    params: { interestList?: string[]; interestFbidList?: string[] },
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<InterestValidationResult[]> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    if (!accessToken) return [];

    try {
      const queryParams: Record<string, any> = {
        type: "adinterestvalid",
        access_token: accessToken,
      };

      if (params.interestList && params.interestList.length > 0) {
        queryParams.interest_list = JSON.stringify(params.interestList);
      } else if (params.interestFbidList && params.interestFbidList.length > 0) {
        queryParams.interest_fbid_list = JSON.stringify(params.interestFbidList);
      } else {
        return [];
      }

      const response = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: queryParams,
        timeout: 10000,
      });

      return response.data?.data || [];
    } catch (err: any) {
      console.warn("[MetaTargetingSearch] Error validating adinterestvalid:", err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * 8. Browse Targeting Categories (adTargetingCategory)
   * Retrieve all targeting options for class:
   * 'interests', 'behaviors', 'demographics', 'life_events', 'industries', 'income', 'family_statuses', 'user_device', 'user_os'
   * GET /search?type=adTargetingCategory&class=...
   */
  static async browseTargetingCategory(
    categoryClass:
      | "interests"
      | "behaviors"
      | "demographics"
      | "life_events"
      | "industries"
      | "income"
      | "family_statuses"
      | "user_device"
      | "user_os",
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<DemographicTargetingResult[]> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    if (!accessToken) return [];

    try {
      const response = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: {
          type: "adTargetingCategory",
          class: categoryClass,
          access_token: accessToken,
        },
        timeout: 15000,
      });

      return response.data?.data || [];
    } catch (err: any) {
      console.warn(`[MetaTargetingSearch] Error browsing adTargetingCategory class=${categoryClass}:`, err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * 9. Demographics & Work / Education Autocomplete
   * Types:
   * - adeducationschool (Schools, Colleges, Universities)
   * - adeducationmajor (Majors, Degrees, Fields of Study)
   * - adworkemployer (Employers, Companies, Organizations)
   * - adworkposition (Job Titles, Positions)
   * GET /search?type=...&q=...
   */
  static async searchDemographics(
    type: "adeducationschool" | "adeducationmajor" | "adworkemployer" | "adworkposition",
    query: string,
    limit: number = 20,
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<DemographicTargetingResult[]> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    const q = query.trim();
    if (!q || !accessToken) return [];

    try {
      const response = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: {
          type,
          q,
          limit,
          access_token: accessToken,
        },
        timeout: 10000,
      });

      return response.data?.data || [];
    } catch (err: any) {
      console.warn(`[MetaTargetingSearch] Error querying demographic autocomplete type=${type}:`, err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * Helper to resolve properly prefixed act_<AD_ACCOUNT_ID>
   */
  private static async resolveAdAccountId(
    adAccountId?: string,
    organizationId: string = "default"
  ): Promise<string> {
    if (adAccountId && adAccountId.trim().length > 0) {
      const clean = adAccountId.trim().replace(/^act_/i, "");
      return `act_${clean}`;
    }
    try {
      const config = await MetaAdsCoreService.getConfig(organizationId);
      if (config.adAccountId && config.adAccountId.trim().length > 0) {
        const clean = config.adAccountId.trim().replace(/^act_/i, "");
        return `act_${clean}`;
      }
    } catch {
      // ignore
    }
    const envAcc = process.env.META_AD_ACCOUNT_ID || "1454270479625110";
    return `act_${envAcc.replace(/^act_/i, "")}`;
  }

  /**
   * 11. Detailed Targeting Search (act_<AD_ACCOUNT_ID>/targetingsearch)
   * Search multiple targeting types (interests, demographics, behaviors, employers, etc.) in a single request
   * GET /act_<AD_ACCOUNT_ID>/targetingsearch?q=...&limit_type=...
   */
  static async detailedTargetingSearch(
    params: {
      q: string;
      limit?: number;
      limit_type?: DetailedTargetingLimitType;
      locale?: string;
      adAccountId?: string;
    },
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<DetailedTargetingItem[]> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    const q = (params.q || "").trim();
    if (!q || !accessToken) return [];

    const actId = await this.resolveAdAccountId(params.adAccountId, organizationId);

    try {
      const queryParams: Record<string, any> = {
        q,
        access_token: accessToken,
      };
      if (params.limit) queryParams.limit = params.limit;
      if (params.limit_type) queryParams.limit_type = params.limit_type;
      if (params.locale) queryParams.locale = params.locale;

      const response = await axios.get(`${META_GRAPH_BASE}/${actId}/targetingsearch`, {
        params: queryParams,
        timeout: 10000,
      });

      return response.data?.data || [];
    } catch (err: any) {
      console.warn(`[MetaTargetingSearch] Error in detailedTargetingSearch (account=${actId}):`, err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * 12. Detailed Targeting Suggestions (act_<AD_ACCOUNT_ID>/targetingsuggestions)
   * Query targeting suggestions based on an array of input targeting pairs
   * GET /act_<AD_ACCOUNT_ID>/targetingsuggestions?targeting_list=[...]
   */
  static async detailedTargetingSuggestions(
    params: {
      targeting_list: DetailedTargetingPair[];
      limit?: number;
      limit_type?: DetailedTargetingLimitType;
      locale?: string;
      adAccountId?: string;
    },
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<DetailedTargetingItem[]> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    if (!params.targeting_list || params.targeting_list.length === 0 || !accessToken) return [];

    const actId = await this.resolveAdAccountId(params.adAccountId, organizationId);

    try {
      const queryParams: Record<string, any> = {
        targeting_list: JSON.stringify(params.targeting_list),
        access_token: accessToken,
        limit: Math.min(params.limit || 30, 45),
      };
      if (params.limit_type) queryParams.limit_type = params.limit_type;
      if (params.locale) queryParams.locale = params.locale;

      const response = await axios.get(`${META_GRAPH_BASE}/${actId}/targetingsuggestions`, {
        params: queryParams,
        timeout: 10000,
      });

      return response.data?.data || [];
    } catch (err: any) {
      console.warn(`[MetaTargetingSearch] Error in detailedTargetingSuggestions (account=${actId}):`, err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * 13. Detailed Targeting Browse (act_<AD_ACCOUNT_ID>/targetingbrowse)
   * Structured taxonomy browse for categories, third-party data, and interests
   * GET /act_<AD_ACCOUNT_ID>/targetingbrowse?limit_type=...
   */
  static async detailedTargetingBrowse(
    params?: {
      limit_type?: DetailedTargetingLimitType;
      locale?: string;
      adAccountId?: string;
    },
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<DetailedTargetingItem[]> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    if (!accessToken) return [];

    const actId = await this.resolveAdAccountId(params?.adAccountId, organizationId);

    try {
      const queryParams: Record<string, any> = {
        access_token: accessToken,
      };
      if (params?.limit_type) queryParams.limit_type = params?.limit_type;
      if (params?.locale) queryParams.locale = params?.locale;

      const response = await axios.get(`${META_GRAPH_BASE}/${actId}/targetingbrowse`, {
        params: queryParams,
        timeout: 15000,
      });

      return response.data?.data || [];
    } catch (err: any) {
      console.warn(`[MetaTargetingSearch] Error in detailedTargetingBrowse (account=${actId}):`, err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * 14. Detailed Targeting Validation (act_<AD_ACCOUNT_ID>/targetingvalidation)
   * Verify whether an audience or targeting spec is still valid for targeting
   * GET /act_<AD_ACCOUNT_ID>/targetingvalidation?targeting_list=[...]
   */
  static async detailedTargetingValidation(
    params: {
      targeting_list?: DetailedTargetingPair[];
      id_list?: string[];
      name_list?: string[];
      locale?: string;
      adAccountId?: string;
    },
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<DetailedTargetingItem[]> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    if (!accessToken) return [];

    const actId = await this.resolveAdAccountId(params.adAccountId, organizationId);

    try {
      const queryParams: Record<string, any> = {
        access_token: accessToken,
      };

      if (params.targeting_list && params.targeting_list.length > 0) {
        queryParams.targeting_list = JSON.stringify(params.targeting_list);
      } else if (params.id_list && params.id_list.length > 0) {
        queryParams.id_list = JSON.stringify(params.id_list);
      } else if (params.name_list && params.name_list.length > 0) {
        queryParams.name_list = JSON.stringify(params.name_list);
      } else {
        return [];
      }

      if (params.locale) queryParams.locale = params.locale;

      const response = await axios.get(`${META_GRAPH_BASE}/${actId}/targetingvalidation`, {
        params: queryParams,
        timeout: 10000,
      });

      return response.data?.data || [];
    } catch (err: any) {
      console.warn(`[MetaTargetingSearch] Error in detailedTargetingValidation (account=${actId}):`, err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * 15. Locales Search (adlocale)
   * GET /search?type=adlocale&q=...
   */
  static async searchLocales(
    query: string = "",
    limit: number = 50,
    organizationId: string = "default",
    tokenOverride?: string
  ): Promise<LocaleResult[]> {
    const accessToken = await this.getEffectiveToken(organizationId, tokenOverride);
    if (!accessToken) return [];

    try {
      const params: Record<string, any> = {
        type: "adlocale",
        limit,
        access_token: accessToken,
      };
      if (query.trim().length > 0) {
        params.q = query.trim();
      }

      const response = await axios.get(`${META_GRAPH_BASE}/search`, {
        params,
        timeout: 10000,
      });

      return response.data?.data || [];
    } catch (err: any) {
      console.warn("[MetaTargetingSearch] Error querying adlocale:", err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * 16. Live Dynamic Detailed Targeting Resolver for AI Assistant
   * Queries Meta Marketing API Detailed Targeting & Interest search endpoints
   * dynamically based on user's business query, extracting verified Meta audience IDs and bounds.
   */
  static async queryRealTimeTargetingSuggestions(
    keyword: string,
    organizationId: string = "default",
    limit: number = 4
  ): Promise<Array<{ id: string | number; name: string; type: string; audience_size?: number; audience_size_lower_bound?: number; audience_size_upper_bound?: number; description?: string }>> {
    const raw = (keyword || "").trim();
    if (!raw) return [];

    // Clean up stop words and symbols
    const cleanTokens = raw
      .replace(/[^\w\s\u0900-\u097F\u0A80-\u0AFF]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !/^(and|for|the|with|our|your|all|best|top|buy|sell|services?|products?|business|company|brand|pvt|ltd|pune|mumbai|delhi|india)$/i.test(t));

    const queriesToTry = [raw];
    if (cleanTokens.length > 0) {
      queriesToTry.push(cleanTokens.slice(0, 2).join(" "));
      for (const token of cleanTokens) {
        if (!queriesToTry.includes(token)) queriesToTry.push(token);
      }
    }

    const collectedMap = new Map<string, { id: string | number; name: string; type: string; audience_size?: number; audience_size_lower_bound?: number; audience_size_upper_bound?: number; description?: string }>();

    for (const q of queriesToTry) {
      if (collectedMap.size >= limit + 2) break;

      // Attempt 1: Detailed Targeting Search (act_<AD_ACCOUNT_ID>/targetingsearch)
      try {
        const detailedResults = await this.detailedTargetingSearch(
          { q, limit: limit + 2 },
          organizationId
        );
        if (detailedResults && detailedResults.length > 0) {
          for (const item of detailedResults) {
            const key = String(item.id || item.name).toLowerCase();
            if (!collectedMap.has(key)) {
              collectedMap.set(key, {
                id: item.id,
                name: item.name,
                type: item.type || "interests",
                audience_size: item.audience_size_upper_bound || item.audience_size_lower_bound,
                audience_size_lower_bound: item.audience_size_lower_bound,
                audience_size_upper_bound: item.audience_size_upper_bound,
                description: item.description || (item.path ? item.path.join(" > ") : undefined),
              });
            }
          }
        }
      } catch {
        // Continue fallback
      }

      // Attempt 2: Interest Search (search?type=adinterest)
      try {
        const interestResults = await this.searchInterests(q, "en_US", limit + 2, organizationId);
        if (interestResults && interestResults.length > 0) {
          for (const item of interestResults) {
            const key = String(item.id || item.name).toLowerCase();
            if (!collectedMap.has(key)) {
              collectedMap.set(key, {
                id: item.id,
                name: item.name,
                type: "interests",
                audience_size: item.audience_size_upper_bound || item.audience_size || item.audience_size_lower_bound,
                audience_size_lower_bound: item.audience_size_lower_bound,
                audience_size_upper_bound: item.audience_size_upper_bound,
                description: item.description || (item.path ? item.path.join(" > ") : undefined),
              });
            }
          }
        }
      } catch {
        // Continue fallback
      }
    }

    // Attempt 3: If we have at least 1 seed interest, get suggestions from Meta graph
    const seed = Array.from(collectedMap.values())[0];
    if (seed && collectedMap.size < limit) {
      try {
        const suggestions = await this.getInterestSuggestions(
          [seed.name],
          limit,
          organizationId
        );
        if (suggestions && suggestions.length > 0) {
          for (const s of suggestions) {
            const key = String(s.id || s.name).toLowerCase();
            if (!collectedMap.has(key)) {
              collectedMap.set(key, {
                id: s.id,
                name: s.name,
                type: "interests",
                audience_size: s.audience_size_upper_bound || s.audience_size || s.audience_size_lower_bound,
                audience_size_lower_bound: s.audience_size_lower_bound,
                audience_size_upper_bound: s.audience_size_upper_bound,
                description: s.description || (s.path ? s.path.join(" > ") : undefined),
              });
            }
          }
        }
      } catch {
        // Fallback
      }
    }

    return Array.from(collectedMap.values()).slice(0, limit);
  }
}

