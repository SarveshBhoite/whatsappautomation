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
    // 1. Remove leading punctuation & symbols (e.g. ",knb", "..hello", "-word")
    cleaned = cleaned.replace(/^[,.!?;:\-_/\\|~@#$%^&*+=<>\s]+/, "");
    // 2. Remove trailing invalid punctuation
    cleaned = cleaned.replace(/[,:;\-_/\\|~@#$%^&*+=<>\s]+$/, "");
    // 3. Replace multiple repeating punctuation with single (e.g. ",," -> ",", "!!" -> "!")
    cleaned = cleaned.replace(/([,.!?;:])\1+/g, "$1");
    // 4. Fix missing space after punctuation (e.g. ",knb" -> ", knb", "hello.world" -> "hello. world")
    cleaned = cleaned.replace(/([,.!?;:])([a-zA-Z0-9])/g, "$1 $2");
    // 5. Replace multiple consecutive spaces with a single space
    cleaned = cleaned.replace(/\s+/g, " ").trim();
    if (maxLength && cleaned.length > maxLength) {
      cleaned = cleaned.slice(0, maxLength).trim();
    }
    return cleaned;
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
              extractedErrors.push(`${err.message}${fieldPath ? ` (at field: ${fieldPath})` : ""}${trigger ? ` (trigger: ${trigger})` : ""}`);
            }
          }
        }
      }

      if (extractedErrors.length > 0) {
        return Array.from(new Set(extractedErrors)).join(" | ");
      }
      return data.error?.message || JSON.stringify(data);
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
      console.error(`[GoogleAdsBaseService] uploadImageAsset error for "${name}":`, err?.response?.data || err?.message);
      return null;
    }
  }

  protected static async saveCampaignToDatabase(data: any) {
    return await prisma.googleAdCampaign.create({ data });
  }
}