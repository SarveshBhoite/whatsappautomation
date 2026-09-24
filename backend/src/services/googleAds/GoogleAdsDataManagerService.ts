import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface DataManagerFilters {
  status?: string;
  limit?: number;
}

export interface OfflineConversionUploadParams {
  conversionActionId: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  conversionDateTime: string; // "yyyy-mm-dd hh:mm:ss+|-hh:mm"
  conversionValue?: number;
  currencyCode?: string;
  orderId?: string;
}

export interface CreateOfflineConversionActionParams {
  name: string;
  category?: "PURCHASE" | "LEAD" | "QUALIFIED_LEAD" | "CONVERTED_LEAD" | "SIGNUP" | "CONTACT" | string;
  defaultValue?: number;
  currencyCode?: string;
}

export class GoogleAdsDataManagerService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. LIST DATA LINKS & FIRST-PARTY DATA CONNECTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists active and available Data Links (Data Manager connections) using Google Ads API v24 data_link.
   */
  public static async listDataLinks(
    organizationId: string,
    customerId: string,
    filters: DataManagerFilters = {}
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const limit = filters.limit ? Math.min(filters.limit, 100) : 50;

    let whereClause = "";
    if (filters.status && filters.status !== "ALL") {
      whereClause = `WHERE data_link.status = '${filters.status.toUpperCase()}'`;
    }

    const gaql = `
      SELECT
        data_link.resource_name,
        data_link.data_link_id,
        data_link.type,
        data_link.status
      FROM data_link
      ${whereClause}
      LIMIT ${limit}
    `;

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: gaql },
        { headers }
      );

      const rows = res.data?.results || [];

      const items = rows.map((r: any) => {
        const dl = r.dataLink || {};
        return {
          id: String(dl.dataLinkId || dl.resourceName?.split("/").pop() || ""),
          resourceName: dl.resourceName,
          type: dl.type || "UNKNOWN",
          status: dl.status || "UNLINKED",
          customerId: cid
        };
      });

      return {
        success: true,
        items,
        total: items.length
      };
    } catch (err: any) {
      console.error("[GoogleAdsDataManagerService.listDataLinks] error:", err?.response?.data || err.message);
      throw new Error(`Google Ads Data Link query error: ${err?.response?.data?.error?.message || err.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. LIST OFFLINE CONVERSION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists conversion actions configured for offline data uploads (UPLOAD_CLICKS, UPLOAD_CALLS, STORE_SALES_DIRECT_UPLOAD).
   */
  public static async listOfflineConversionActions(
    organizationId: string,
    customerId: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const gaql = `
      SELECT
        conversion_action.id,
        conversion_action.name,
        conversion_action.type,
        conversion_action.status,
        conversion_action.category,
        conversion_action.value_settings.default_value,
        conversion_action.value_settings.default_currency_code,
        conversion_action.counting_type
      FROM conversion_action
      WHERE conversion_action.status != 'REMOVED'
        AND conversion_action.type IN ('UPLOAD_CLICKS', 'UPLOAD_CALLS', 'STORE_SALES_DIRECT_UPLOAD')
      ORDER BY conversion_action.name ASC
      LIMIT 100
    `;

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: gaql },
        { headers }
      );

      const rows = res.data?.results || [];
      const items = rows.map((r: any) => {
        const ca = r.conversionAction || {};
        const vs = ca.valueSettings || {};
        return {
          id: String(ca.id || ""),
          resourceName: ca.resourceName || `customers/${cid}/conversionActions/${ca.id}`,
          name: ca.name || "Untitled Offline Conversion",
          type: ca.type || "UPLOAD_CLICKS",
          status: ca.status || "ENABLED",
          category: ca.category || "PURCHASE",
          defaultValue: vs.defaultValue ? Number(vs.defaultValue) : 0,
          currencyCode: vs.defaultCurrencyCode || "INR",
          countingType: ca.countingType || "ONE_PER_CLICK"
        };
      });

      return {
        success: true,
        items,
        total: items.length
      };
    } catch (err: any) {
      console.error("[GoogleAdsDataManagerService.listOfflineConversionActions] error:", err?.response?.data || err.message);
      throw new Error(`Google Ads offline conversion actions query error: ${err?.response?.data?.error?.message || err.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. CREATE OFFLINE CONVERSION ACTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Creates an offline upload conversion action (UPLOAD_CLICKS) using conversionActions:mutate.
   */
  public static async createOfflineConversionAction(
    organizationId: string,
    customerId: string,
    params: CreateOfflineConversionActionParams
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    if (!params.name || !params.name.trim()) {
      throw new Error("Conversion action name is required.");
    }

    const payload = {
      operations: [
        {
          create: {
            name: params.name.trim(),
            type: "UPLOAD_CLICKS",
            category: params.category || "PURCHASE",
            status: "ENABLED",
            valueSettings: {
              defaultValue: params.defaultValue !== undefined ? params.defaultValue : 0,
              defaultCurrencyCode: params.currencyCode || "INR",
              alwaysUseDefaultValue: false
            }
          }
        }
      ]
    };

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/conversionActions:mutate`,
        payload,
        { headers }
      );

      const resourceName = res.data?.results?.[0]?.resourceName;
      return {
        success: true,
        resourceName,
        id: resourceName?.split("/").pop()
      };
    } catch (err: any) {
      console.error("[GoogleAdsDataManagerService.createOfflineConversionAction] error:", err?.response?.data || err.message);
      const errMsg = err?.response?.data?.error?.message || err.message;
      throw new Error(`Create offline conversion action failed: ${errMsg}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. UPLOAD OFFLINE CLICK CONVERSION (First-Party Conversion Upload)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Uploads an offline click conversion using conversionUploads:uploadClickConversions.
   * Does not store raw customer PII.
   */
  public static async uploadClickConversion(
    organizationId: string,
    customerId: string,
    params: OfflineConversionUploadParams
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    if (!params.conversionActionId) {
      throw new Error("conversionActionId is required.");
    }
    if (!params.conversionDateTime) {
      throw new Error("conversionDateTime is required (format: YYYY-MM-DD HH:MM:SS+|-HH:MM).");
    }
    if (!params.gclid && !params.gbraid && !params.wbraid) {
      throw new Error("Either gclid, gbraid, or wbraid must be provided for click conversion upload.");
    }

    const cleanActionId = params.conversionActionId.replace(/[^0-9]/g, "");
    const actionResource = `customers/${cid}/conversionActions/${cleanActionId}`;

    const clickConversion: any = {
      conversionAction: actionResource,
      conversionDateTime: params.conversionDateTime
    };

    if (params.gclid) clickConversion.gclid = params.gclid.trim();
    if (params.gbraid) clickConversion.gbraid = params.gbraid.trim();
    if (params.wbraid) clickConversion.wbraid = params.wbraid.trim();
    if (params.conversionValue !== undefined) clickConversion.conversionValue = params.conversionValue;
    if (params.currencyCode) clickConversion.currencyCode = params.currencyCode;
    if (params.orderId) clickConversion.orderId = params.orderId.trim();

    const payload = {
      conversions: [clickConversion],
      partialFailure: true
    };

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}:uploadClickConversions`,
        payload,
        { headers }
      );

      const partialFailureError = res.data?.partialFailureError;
      if (partialFailureError) {
        console.warn("[GoogleAdsDataManagerService.uploadClickConversion] Partial failure warning:", partialFailureError);
      }

      return {
        success: true,
        results: res.data?.results || [],
        partialFailureError: partialFailureError?.message || null
      };
    } catch (err: any) {
      console.error("[GoogleAdsDataManagerService.uploadClickConversion] error:", err?.response?.data || err.message);
      const errMsg = err?.response?.data?.error?.message || err.message;
      throw new Error(`Upload click conversion failed: ${errMsg}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. LIST OFFLINE USER DATA JOBS (First-Party Customer Match / Enhanced Conv.)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Queries background offline user data jobs (offline_user_data_job) for this customer.
   */
  public static async listOfflineUserDataJobs(
    organizationId: string,
    customerId: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const gaql = `
      SELECT
        offline_user_data_job.resource_name,
        offline_user_data_job.id,
        offline_user_data_job.type,
        offline_user_data_job.status,
        offline_user_data_job.failure_reason
      FROM offline_user_data_job
      ORDER BY offline_user_data_job.id DESC
      LIMIT 50
    `;

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: gaql },
        { headers }
      );

      const rows = res.data?.results || [];
      const items = rows.map((r: any) => {
        const job = r.offlineUserDataJob || {};
        return {
          id: String(job.id || ""),
          resourceName: job.resourceName,
          type: job.type || "CUSTOMER_MATCH_USER_LIST",
          status: job.status || "PENDING",
          failureReason: job.failureReason || "NONE"
        };
      });

      return {
        success: true,
        items,
        total: items.length
      };
    } catch (err: any) {
      console.error("[GoogleAdsDataManagerService.listOfflineUserDataJobs] error:", err?.response?.data || err.message);
      throw new Error(`Google Ads offline user data job query error: ${err?.response?.data?.error?.message || err.message}`);
    }
  }
}
