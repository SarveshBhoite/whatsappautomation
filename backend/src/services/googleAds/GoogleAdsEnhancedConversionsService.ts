import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface GoogleTagMeasurementData {
  googleTagId?: string;
  conversionTrackingId?: string;
  conversionTrackingStatus: string;
  googleAdsConversionCustomer?: string;
  acceptedCustomerDataTerms?: boolean;
}

export interface ConversionActionMeasurementItem {
  id: string;
  name: string;
  type: string;
  status: string;
  category: string;
  origin: string;
  countingType?: string;
  lookbackWindowDays?: number;
  hasTagSnippets: boolean;
  globalSiteTagSnippet?: string;
  eventSnippet?: string;
}

export interface EnhancedConversionsMeasurementOverview {
  customer: {
    id: string;
    descriptiveName?: string;
    currencyCode: string;
  };
  googleTag: GoogleTagMeasurementData;
  conversionActions: ConversionActionMeasurementItem[];
  enhancedConversions: {
    mode: "FIRST_PARTY_USER_PROVIDED_DATA";
    apiVerificationStatus: "AVAILABLE_VIA_DATA_MANAGER_AND_UPLOAD_API";
    supportedIdentifiers: string[];
    customerDataTermsAccepted: boolean;
    technicalRequirements: {
      hashingAlgorithm: "SHA-256";
      piiStorage: "NEVER_RAW_STORED";
      matchingFields: string[];
    };
    accountGuidance: string[];
  };
  googleTagManager: {
    status: "OFFICIAL_MANUAL_OR_GTM_CONTAINER_FLOW";
    recommendation: string;
    gtmContainerIntegration: {
      supportedByGoogleAdsApi: false;
      tagAssistantUrl: string;
      gtmConsoleUrl: string;
      explanation: string;
    };
  };
}

export class GoogleAdsEnhancedConversionsService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  /**
   * Fetches customer conversion tracking settings, Google Tag configuration,
   * active conversion action tag snippets, and official enhanced conversion setup guidance.
   */
  public static async getMeasurementOverview(
    organizationId: string,
    customerId: string
  ): Promise<EnhancedConversionsMeasurementOverview> {
    const cleanCid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cleanCid);

    // 1. Fetch Customer Conversion Tracking Settings & Info
    const customerRes = await axios.post(
      `${this.ADS_BASE}/customers/${cleanCid}/googleAds:search`,
      {
        query: `
          SELECT
            customer.id,
            customer.descriptive_name,
            customer.currency_code,
            customer.conversion_tracking_setting.conversion_tracking_id,
            customer.conversion_tracking_setting.conversion_tracking_status,
            customer.conversion_tracking_setting.google_ads_conversion_customer,
            customer.conversion_tracking_setting.accepted_customer_data_terms
          FROM customer
          LIMIT 1
        `
      },
      { headers }
    );

    const custObj = customerRes.data?.results?.[0]?.customer;
    const convSetting = custObj?.conversionTrackingSetting;
    const trackingId = convSetting?.conversionTrackingId ? String(convSetting.conversionTrackingId) : undefined;
    const googleTagId = trackingId ? `AW-${trackingId}` : undefined;

    // 2. Fetch Conversion Actions with official Tag Snippets
    const convRes = await axios.post(
      `${this.ADS_BASE}/customers/${cleanCid}/googleAds:search`,
      {
        query: `
          SELECT
            conversion_action.id,
            conversion_action.name,
            conversion_action.type,
            conversion_action.status,
            conversion_action.category,
            conversion_action.origin,
            conversion_action.counting_type,
            conversion_action.click_through_lookback_window_days,
            conversion_action.tag_snippets
          FROM conversion_action
          WHERE conversion_action.status != 'REMOVED'
          ORDER BY conversion_action.name ASC
          LIMIT 50
        `
      },
      { headers }
    );

    const actionsList: ConversionActionMeasurementItem[] = (convRes.data?.results || []).map((row: any) => {
      const a = row.conversionAction;
      const snippets = Array.isArray(a.tagSnippets) ? a.tagSnippets : [];
      let globalSnippet: string | undefined;
      let eventSnippet: string | undefined;

      for (const s of snippets) {
        if (s.globalSiteTag) globalSnippet = s.globalSiteTag;
        if (s.eventSnippet) eventSnippet = s.eventSnippet;
      }

      return {
        id: String(a.id),
        name: a.name || `Action ${a.id}`,
        type: a.type || "UNKNOWN",
        status: a.status || "ENABLED",
        category: a.category || "DEFAULT",
        origin: a.origin || "WEBSITE",
        countingType: a.countingType,
        lookbackWindowDays: a.clickThroughLookbackWindowDays,
        hasTagSnippets: snippets.length > 0,
        globalSiteTagSnippet: globalSnippet,
        eventSnippet: eventSnippet
      };
    });

    const acceptedTerms = Boolean(convSetting?.acceptedCustomerDataTerms);

    return {
      customer: {
        id: cleanCid,
        descriptiveName: custObj?.descriptiveName,
        currencyCode: custObj?.currencyCode || "INR"
      },
      googleTag: {
        googleTagId,
        conversionTrackingId: trackingId,
        conversionTrackingStatus: convSetting?.conversionTrackingStatus || "UNKNOWN",
        googleAdsConversionCustomer: convSetting?.googleAdsConversionCustomer
          ? String(convSetting.googleAdsConversionCustomer).split("/").pop()
          : undefined,
        acceptedCustomerDataTerms: acceptedTerms
      },
      conversionActions: actionsList,
      enhancedConversions: {
        mode: "FIRST_PARTY_USER_PROVIDED_DATA",
        apiVerificationStatus: "AVAILABLE_VIA_DATA_MANAGER_AND_UPLOAD_API",
        supportedIdentifiers: [
          "EMAIL (SHA-256 hashed)",
          "PHONE_NUMBER (E.164 normalized + SHA-256 hashed)",
          "FIRST_NAME & LAST_NAME (Normalized + SHA-256 hashed)",
          "STREET_ADDRESS & POSTAL_CODE (Normalized + SHA-256 hashed)"
        ],
        customerDataTermsAccepted: acceptedTerms,
        technicalRequirements: {
          hashingAlgorithm: "SHA-256",
          piiStorage: "NEVER_RAW_STORED",
          matchingFields: ["hashedEmail", "hashedPhoneNumber", "addressInfo"]
        },
        accountGuidance: [
          "Enhanced Conversions use first-party customer data (hashed emails and phone numbers) to match conversion events back to Google Ads clicks.",
          "Ensure Customer Data Terms are accepted in Google Ads Tools & Settings > Measurement > Conversions > Settings.",
          "For offline or CRM-triggered conversions, user-provided data is uploaded through the Data Manager / Conversion Adjustments infrastructure."
        ]
      },
      googleTagManager: {
        status: "OFFICIAL_MANUAL_OR_GTM_CONTAINER_FLOW",
        recommendation: "Deploy Google Tag (gtag.js) directly or via Google Tag Manager container.",
        gtmContainerIntegration: {
          supportedByGoogleAdsApi: false,
          tagAssistantUrl: "https://tagassistant.google.com/",
          gtmConsoleUrl: "https://tagmanager.google.com/",
          explanation:
            "Google Ads API v24 manages conversion actions and Google Tag account configurations, while GTM container triggers and tags are managed exclusively in Google Tag Manager Console."
        }
      }
    };
  }
}
