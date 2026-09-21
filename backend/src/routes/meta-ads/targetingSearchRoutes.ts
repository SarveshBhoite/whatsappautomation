import { Router, Request, Response } from "express";
import { MetaTargetingSearchService, GeoLocationType } from "../../services/meta-ads/metaTargetingSearchService";

const router = Router();
const DEFAULT_ORG_ID = "default";

/**
 * GET /api/meta-ads/targeting/status
 * Check targeting option status (NORMAL, DEPRECATING, NON-DELIVERABLE, etc.)
 * Query: ids=6003598240487,6003022269556 or targeting_option_list=["..."]
 */
router.get("/targeting/status", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    let ids: string[] = [];

    if (req.query.ids) {
      ids = String(req.query.ids).split(",").map((s) => s.trim()).filter(Boolean);
    } else if (req.query.targeting_option_list) {
      try {
        ids = JSON.parse(req.query.targeting_option_list as string);
      } catch {
        ids = [String(req.query.targeting_option_list)];
      }
    }

    if (ids.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const data = await MetaTargetingSearchService.searchTargetingOptionStatus(ids, orgId);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/meta-ads/targeting/geo
 * Search Geo Locations (countries, regions, cities, zip codes, geo_markets, electoral_districts)
 * Query:
 *   q: string
 *   location_types: string (e.g. '["city"]' or "city,region,country")
 *   country_code?: string (e.g. "IN", "US")
 *   region_id?: number
 *   match_country_code?: boolean
 *   limit?: number
 */
router.get("/targeting/geo", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const q = (req.query.q as string) || "";
    let locationTypes: GeoLocationType[] = ["city"];

    if (req.query.location_types) {
      const raw = req.query.location_types as string;
      try {
        locationTypes = JSON.parse(raw);
      } catch {
        locationTypes = raw.split(",").map((t) => t.trim()) as GeoLocationType[];
      }
    }

    const data = await MetaTargetingSearchService.searchGeoLocations(
      {
        q,
        location_types: locationTypes,
        country_code: req.query.country_code as string,
        region_id: req.query.region_id ? Number(req.query.region_id) : undefined,
        match_country_code: req.query.match_country_code === "true",
        limit: req.query.limit ? Number(req.query.limit) : 25,
      },
      orgId
    );

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/meta-ads/targeting/geo/metadata
 * Query Geo Locations Metadata
 * Body: { countries?: string[], regions?: number[], country_groups?: string[], cities?: number[], zips?: string[] }
 */
router.post("/targeting/geo/metadata", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || req.body.organizationId || DEFAULT_ORG_ID;
    const data = await MetaTargetingSearchService.getGeoLocationsMetadata(req.body, orgId);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/meta-ads/targeting/geo/radius-suggestion
 * Get recommended radius around latitude & longitude
 * Query: latitude, longitude, distance_unit ('mile' | 'kilometer')
 */
router.get("/targeting/geo/radius-suggestion", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const distanceUnit = ((req.query.distance_unit as string) === "mile" ? "mile" : "kilometer") as "mile" | "kilometer";

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ success: false, error: "latitude and longitude are required numbers." });
    }

    const data = await MetaTargetingSearchService.getSuggestedRadius(latitude, longitude, distanceUnit, orgId);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/meta-ads/targeting/interests
 * Search for Interests
 * Query: q=cricket, locale=en_US, limit=25
 */
router.get("/targeting/interests", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const q = ((req.query.q as string) || "").trim();
    const locale = (req.query.locale as string) || "en_US";
    const limit = req.query.limit ? Number(req.query.limit) : 25;

    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const data = await MetaTargetingSearchService.searchInterests(q, locale, limit, orgId);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/meta-ads/targeting/interests/suggestions
 * Query interest suggestions based on seed interest terms
 * Query: interest_list=["Basketball","Fitness"] or interests=Basketball,Fitness
 */
router.get("/targeting/interests/suggestions", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    let interestList: string[] = [];

    if (req.query.interest_list) {
      try {
        interestList = JSON.parse(req.query.interest_list as string);
      } catch {
        interestList = String(req.query.interest_list).split(",").map((s) => s.trim()).filter(Boolean);
      }
    } else if (req.query.interests) {
      interestList = String(req.query.interests).split(",").map((s) => s.trim()).filter(Boolean);
    }

    if (interestList.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const limit = req.query.limit ? Number(req.query.limit) : 25;
    const data = await MetaTargetingSearchService.getInterestSuggestions(interestList, limit, orgId);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/meta-ads/targeting/interests/validate
 * Validate interest names or FBIDs
 * Query: interest_list=["Japan"] or interest_fbid_list=["6003700426513"]
 */
router.get("/targeting/interests/validate", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    let interestList: string[] | undefined = undefined;
    let interestFbidList: string[] | undefined = undefined;

    if (req.query.interest_list) {
      try {
        interestList = JSON.parse(req.query.interest_list as string);
      } catch {
        interestList = String(req.query.interest_list).split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    if (req.query.interest_fbid_list) {
      try {
        interestFbidList = JSON.parse(req.query.interest_fbid_list as string);
      } catch {
        interestFbidList = String(req.query.interest_fbid_list).split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const data = await MetaTargetingSearchService.validateInterests(
      { interestList, interestFbidList },
      orgId
    );
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/meta-ads/targeting/categories
 * Browse Targeting Category options by class
 * Query: class = 'interests' | 'behaviors' | 'demographics' | 'life_events' | 'industries' | 'income' | 'family_statuses' | 'user_device' | 'user_os'
 */
router.get("/targeting/categories", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const categoryClass = ((req.query.class as string) || "demographics") as any;

    const data = await MetaTargetingSearchService.browseTargetingCategory(categoryClass, orgId);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/meta-ads/targeting/demographics
 * Autocomplete demographic attributes:
 * Query:
 *   type: 'adeducationschool' | 'adeducationmajor' | 'adworkemployer' | 'adworkposition'
 *   q: string
 *   limit?: number
 */
router.get("/targeting/demographics", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const type = ((req.query.type as string) || "adworkposition") as any;
    const q = ((req.query.q as string) || "").trim();
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const data = await MetaTargetingSearchService.searchDemographics(type, q, limit, orgId);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/meta-ads/targeting/locales
 * Search Targetable Locales (adlocale)
 * Query: q=en, limit=50
 */
router.get("/targeting/locales", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const q = (req.query.q as string) || "";
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    const data = await MetaTargetingSearchService.searchLocales(q, limit, orgId);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// DETAILED TARGETING API (act_<AD_ACCOUNT_ID>/targetingsearch, etc.)
// =========================================================================

/**
 * GET /api/meta-ads/targeting/detailed/search
 * Search multiple targeting types (interests, demographics, behaviors, etc.)
 * Query:
 *   q: string (required)
 *   limit?: number
 *   limit_type?: 'interests' | 'education_schools' | 'education_majors' | 'work_positions' | 'work_employers' | 'relationship_statuses' | 'college_years' | 'education_statuses' | 'family_statuses' | 'industries' | 'life_events' | 'behaviors' | 'income'
 *   locale?: string
 *   adAccountId?: string
 */
router.get("/targeting/detailed/search", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const q = ((req.query.q as string) || "").trim();

    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const data = await MetaTargetingSearchService.detailedTargetingSearch(
      {
        q,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        limit_type: req.query.limit_type as any,
        locale: req.query.locale as string,
        adAccountId: req.query.adAccountId as string,
      },
      orgId
    );

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET & POST /api/meta-ads/targeting/detailed/suggestions
 * Returns additional audiences based on input audience array
 * Body / Query:
 *   targeting_list: Array of { type: string, id: string | number }
 *   limit?: number (max 45)
 *   limit_type?: string
 *   locale?: string
 *   adAccountId?: string
 */
const handleDetailedSuggestions = async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || req.body?.organizationId || DEFAULT_ORG_ID;
    let targetingList = req.body?.targeting_list;

    if (!targetingList && req.query.targeting_list) {
      try {
        targetingList = JSON.parse(req.query.targeting_list as string);
      } catch {
        targetingList = [{ type: "interests", id: req.query.targeting_list }];
      }
    }

    if (!Array.isArray(targetingList) || targetingList.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const data = await MetaTargetingSearchService.detailedTargetingSuggestions(
      {
        targeting_list: targetingList,
        limit: req.query.limit ? Number(req.query.limit) : req.body?.limit ? Number(req.body.limit) : undefined,
        limit_type: (req.query.limit_type as any) || req.body?.limit_type,
        locale: (req.query.locale as string) || req.body?.locale,
        adAccountId: (req.query.adAccountId as string) || req.body?.adAccountId,
      },
      orgId
    );

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

router.get("/targeting/detailed/suggestions", handleDetailedSuggestions);
router.post("/targeting/detailed/suggestions", handleDetailedSuggestions);

/**
 * GET /api/meta-ads/targeting/detailed/browse
 * Structured taxonomy browse for categories, third-party data, and interests
 * Query:
 *   limit_type?: string
 *   locale?: string
 *   adAccountId?: string
 */
router.get("/targeting/detailed/browse", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const data = await MetaTargetingSearchService.detailedTargetingBrowse(
      {
        limit_type: req.query.limit_type as any,
        locale: req.query.locale as string,
        adAccountId: req.query.adAccountId as string,
      },
      orgId
    );

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET & POST /api/meta-ads/targeting/detailed/validate
 * Verify whether an audience is valid for targeting
 * Body / Query:
 *   targeting_list?: Array of { type: string, id: string | number }
 *   id_list?: string[]
 *   name_list?: string[]
 *   locale?: string
 *   adAccountId?: string
 */
const handleDetailedValidation = async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || req.body?.organizationId || DEFAULT_ORG_ID;
    let targetingList = req.body?.targeting_list;
    let idList = req.body?.id_list;
    let nameList = req.body?.name_list;

    if (!targetingList && req.query.targeting_list) {
      try {
        targetingList = JSON.parse(req.query.targeting_list as string);
      } catch {
        targetingList = [{ type: "interests", id: req.query.targeting_list }];
      }
    }
    if (!idList && req.query.id_list) {
      try {
        idList = JSON.parse(req.query.id_list as string);
      } catch {
        idList = String(req.query.id_list).split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    if (!nameList && req.query.name_list) {
      try {
        nameList = JSON.parse(req.query.name_list as string);
      } catch {
        nameList = String(req.query.name_list).split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const data = await MetaTargetingSearchService.detailedTargetingValidation(
      {
        targeting_list: targetingList,
        id_list: idList,
        name_list: nameList,
        locale: (req.query.locale as string) || req.body?.locale,
        adAccountId: (req.query.adAccountId as string) || req.body?.adAccountId,
      },
      orgId
    );

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

router.get("/targeting/detailed/validate", handleDetailedValidation);
router.post("/targeting/detailed/validate", handleDetailedValidation);

export default router;
