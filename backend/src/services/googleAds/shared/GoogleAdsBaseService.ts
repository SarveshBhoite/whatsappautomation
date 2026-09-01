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

  protected static async createBudget(organizationId: string, customerId: string, params: {
    name: string; amountPerDay: number; deliveryMethod?: string; shared?: boolean;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const amountMicros = Math.round(params.amountPerDay * 1_000_000);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/campaignBudgets:mutate`, {
      operations: [{
        create: {
          name: params.name || `Budget ₹${params.amountPerDay}/day (${Date.now()})`,
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

  protected static async saveCampaignToDatabase(data: any) {
    return await prisma.googleAdCampaign.create({ data });
  }
}