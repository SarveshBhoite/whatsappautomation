import axios from "axios";
import { getGoogleAccessToken } from "./gmbSyncService";
import prisma from "../utils/prisma";

export class GoogleAdsService {
  private static DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "afpP9FlUX_jumeKil_-Qvg";
  private static CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
  private static CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

  /**
   * Helper to get axios instance configured with Ads API headers
   */
  private static async getAdsHeaders(organizationId: string) {
    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId }
    });

    if (!config || !config.googleRefreshToken || !config.googleAdsCustomerId) {
      throw new Error("Google Ads credentials or Customer ID are not configured for this organization.");
    }

    const accessToken = await getGoogleAccessToken(
      this.CLIENT_ID,
      this.CLIENT_SECRET,
      config.googleRefreshToken
    );

    const cleanCustomerId = config.googleAdsCustomerId.replace(/-/g, "").trim();

    const headers: { [key: string]: string } = {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": this.DEVELOPER_TOKEN,
      "Content-Type": "application/json"
    };

    // If GMB account is managed through an MCC (manager account), we include login-customer-id
    // For now, if the customerId is a sub-account, we can let Google auto-resolve,
    // or if needed we can read a manager ID.
    return {
      headers,
      customerId: cleanCustomerId
    };
  }

  /**
   * Create a Campaign Budget
   */
  public static async createBudget(organizationId: string, amount: number) {
    const { headers, customerId } = await this.getAdsHeaders(organizationId);
    
    // Amount in micros (1 USD = 1,000,000 micros)
    const amountMicros = Math.round(amount * 1_000_000);
    const budgetName = `CRM Local Budget - $${amount}/day (${Date.now()})`;

    const url = `https://googleads.googleapis.com/v16/customers/${customerId}/campaignBudgets:mutate`;
    const response = await axios.post(
      url,
      {
        operations: [
          {
            create: {
              name: budgetName,
              amountMicros: amountMicros,
              deliveryMethod: "STANDARD"
            }
          }
        ]
      },
      { headers }
    );

    const resourceName = response.data.results?.[0]?.resourceName;
    if (!resourceName) {
      throw new Error("Failed to create Campaign Budget in Google Ads: " + JSON.stringify(response.data));
    }

    return resourceName; // customers/{customerId}/campaignBudgets/{budgetId}
  }

  /**
   * Create a Search Campaign linked to GMB location
   */
  public static async createCampaign(
    organizationId: string,
    name: string,
    budgetResourceName: string,
    startDateStr: string,
    endDateStr?: string
  ) {
    const { headers, customerId } = await this.getAdsHeaders(organizationId);

    const url = `https://googleads.googleapis.com/v16/customers/${customerId}/campaigns:mutate`;
    const response = await axios.post(
      url,
      {
        operations: [
          {
            create: {
              name: name,
              advertisingChannelType: "SEARCH",
              status: "PAUSED", // Default to PAUSED so client reviews it first
              campaignBudget: budgetResourceName,
              startDate: startDateStr.replace(/-/g, ""), // Must be YYYYMMDD
              endDate: endDateStr ? endDateStr.replace(/-/g, "") : undefined,
              networkSettings: {
                targetGoogleSearch: true,
                targetSearchNetwork: true,
                targetContentNetwork: false,
                targetPartnerSearchNetwork: false
              }
            }
          }
        ]
      },
      { headers }
    );

    const resourceName = response.data.results?.[0]?.resourceName;
    if (!resourceName) {
      throw new Error("Failed to create Campaign in Google Ads: " + JSON.stringify(response.data));
    }

    return resourceName; // customers/{customerId}/campaigns/{campaignId}
  }

  /**
   * Create an Ad Group under a Campaign
   */
  public static async createAdGroup(organizationId: string, campaignResourceName: string, name: string) {
    const { headers, customerId } = await this.getAdsHeaders(organizationId);

    const url = `https://googleads.googleapis.com/v16/customers/${customerId}/adGroups:mutate`;
    const response = await axios.post(
      url,
      {
        operations: [
          {
            create: {
              name: name,
              campaign: campaignResourceName,
              type: "SEARCH_STANDARD",
              status: "ENABLED"
            }
          }
        ]
      },
      { headers }
    );

    const resourceName = response.data.results?.[0]?.resourceName;
    if (!resourceName) {
      throw new Error("Failed to create Ad Group in Google Ads: " + JSON.stringify(response.data));
    }

    return resourceName; // customers/{customerId}/adGroups/{adGroupId}
  }

  /**
   * Create a Responsive Search Ad
   */
  public static async createAd(
    organizationId: string,
    adGroupResourceName: string,
    finalUrl: string,
    headlines: string[],
    descriptions: string[]
  ) {
    const { headers, customerId } = await this.getAdsHeaders(organizationId);

    const url = `https://googleads.googleapis.com/v16/customers/${customerId}/adGroupAds:mutate`;
    const response = await axios.post(
      url,
      {
        operations: [
          {
            create: {
              adGroup: adGroupResourceName,
              status: "ENABLED",
              ad: {
                finalUrls: [finalUrl],
                responsiveSearchAd: {
                  headlines: headlines.slice(0, 15).map(h => ({ text: h })),
                  descriptions: descriptions.slice(0, 4).map(d => ({ text: d }))
                }
              }
            }
          }
        ]
      },
      { headers }
    );

    const resourceName = response.data.results?.[0]?.resourceName;
    if (!resourceName) {
      throw new Error("Failed to create Responsive Ad: " + JSON.stringify(response.data));
    }

    return resourceName;
  }

  /**
   * Add keywords target to Ad Group
   */
  public static async addKeywords(
    organizationId: string,
    adGroupResourceName: string,
    keywords: string[]
  ) {
    const { headers, customerId } = await this.getAdsHeaders(organizationId);

    const url = `https://googleads.googleapis.com/v16/customers/${customerId}/adGroupCriteria:mutate`;
    
    const operations = keywords.map(kw => ({
      create: {
        adGroup: adGroupResourceName,
        status: "ENABLED",
        keyword: {
          text: kw,
          matchType: "BROAD"
        }
      }
    }));

    const response = await axios.post(url, { operations }, { headers });
    return response.data;
  }

  /**
   * Launch a fully configured Campaign with AdGroup, Responsive Search Ad, and Keywords
   */
  public static async launchLocalSearchCampaign(params: {
    organizationId: string;
    campaignName: string;
    budget: number;
    startDate: string; // YYYY-MM-DD
    endDate?: string;
    finalUrl: string;
    headlines: string[];
    descriptions: string[];
    keywords: string[];
  }) {
    console.log(`[GoogleAdsService] Starting E2E local search campaign creation for org ${params.organizationId}...`);

    // 1. Create Budget
    const budgetRef = await this.createBudget(params.organizationId, params.budget);
    console.log(`[GoogleAdsService] Budget created successfully: ${budgetRef}`);

    // 2. Create Campaign
    const campaignRef = await this.createCampaign(
      params.organizationId,
      params.campaignName,
      budgetRef,
      params.startDate,
      params.endDate
    );
    console.log(`[GoogleAdsService] Campaign created successfully: ${campaignRef}`);

    // 3. Create AdGroup
    const adGroupRef = await this.createAdGroup(
      params.organizationId,
      campaignRef,
      `${params.campaignName} - Ad Group`
    );
    console.log(`[GoogleAdsService] Ad Group created successfully: ${adGroupRef}`);

    // 4. Create Responsive Search Ad
    const adRef = await this.createAd(
      params.organizationId,
      adGroupRef,
      params.finalUrl,
      params.headlines,
      params.descriptions
    );
    console.log(`[GoogleAdsService] Responsive Search Ad created successfully: ${adRef}`);

    // 5. Add Target Keywords
    if (params.keywords.length > 0) {
      await this.addKeywords(params.organizationId, adGroupRef, params.keywords);
      console.log(`[GoogleAdsService] Keywords added successfully to Ad Group.`);
    }

    return {
      campaignResourceName: campaignRef,
      adGroupResourceName: adGroupRef,
      campaignId: campaignRef.split("/").pop()
    };
  }

  /**
   * Fetch Ads Campaign Insights / Performance
   */
  public static async getCampaignPerformance(organizationId: string) {
    const { headers, customerId } = await this.getAdsHeaders(organizationId);

    const url = `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:search`;
    
    // Google Ads Query Language (GAQL) to fetch metrics grouped by campaign
    const query = `
      SELECT 
        campaign.id, 
        campaign.name, 
        campaign.status, 
        metrics.impressions, 
        metrics.clicks, 
        metrics.cost_micros, 
        metrics.ctr, 
        metrics.conversions
      FROM campaign
      WHERE campaign.status IN ('ENABLED', 'PAUSED')
    `;

    const response = await axios.post(url, { query }, { headers });
    const rows = response.data.results || [];

    return rows.map((row: any) => {
      const camp = row.campaign;
      const metrics = row.metrics;

      return {
        id: camp.id,
        name: camp.name,
        status: camp.status,
        impressions: Number(metrics?.impressions || 0),
        clicks: Number(metrics?.clicks || 0),
        ctr: Number((metrics?.ctr || 0) * 100).toFixed(2) + "%",
        conversions: Number(metrics?.conversions || 0),
        cost: Number((metrics?.costMicros || 0) / 1_000_000).toFixed(2) // Convert micros back to main currency (USD/INR)
      };
    });
  }
}
