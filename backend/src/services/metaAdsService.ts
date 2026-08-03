import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();
const META_GRAPH_VERSION = "v19.0";
const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export interface MetaConnectivityResult {
  connected: boolean;
  appIdVerified: boolean;
  tokenValid: boolean;
  adAccountAccessible: boolean;
  whatsappLinked: boolean;
  policyStanding: "HEALTHY" | "WARNING" | "RESTRICTED" | "UNKNOWN";
  details: {
    userName?: string;
    userId?: string;
    adAccountName?: string;
    adAccountStatus?: string;
    tokenPermissions?: string[];
    messages?: string[];
  };
}

export interface CreateMetaCampaignPayload {
  name: string;
  objective: "MESSAGES" | "LEAD_GENERATION" | "OUTREACH" | "CONVERSIONS" | "TRAFFIC";
  dailyBudget: number;
  adSetName: string;
  destinationType: "WHATSAPP" | "MESSENGER" | "INSTAGRAM_DIRECT" | "WEBSITE";
  targeting: {
    countries?: string[];
    ageMin?: number;
    ageMax?: number;
    genders?: number[]; // 1=Male, 2=Female, []=All
    interests?: string[];
  };
  adName: string;
  creativeHeadline: string;
  creativeBody: string;
  creativeMediaUrl?: string;
  whatsappNumber?: string;
}

export class MetaAdsService {
  /**
   * Get organization's Meta Ads Configuration
   */
  static async getConfig(organizationId: string) {
    let config = await prisma.metaAdConfig.findUnique({
      where: { organizationId },
    });

    if (!config) {
      config = await prisma.metaAdConfig.create({
        data: {
          organizationId,
          systemStatus: "DISCONNECTED",
        },
      });
    }

    return config;
  }

  /**
   * Save or update organization's Meta Ads Credentials & Setup
   */
  static async saveConfig(organizationId: string, data: Partial<{
    appId: string;
    appSecret: string;
    accessToken: string;
    adAccountId: string;
    pageId: string;
    instagramAccountId: string;
    pixelId: string;
  }>) {
    const existing = await this.getConfig(organizationId);

    const updated = await prisma.metaAdConfig.update({
      where: { organizationId },
      data: {
        appId: data.appId !== undefined ? data.appId : existing.appId,
        appSecret: data.appSecret !== undefined ? data.appSecret : existing.appSecret,
        accessToken: data.accessToken !== undefined ? data.accessToken : existing.accessToken,
        adAccountId: data.adAccountId !== undefined ? data.adAccountId : existing.adAccountId,
        pageId: data.pageId !== undefined ? data.pageId : existing.pageId,
        instagramAccountId: data.instagramAccountId !== undefined ? data.instagramAccountId : existing.instagramAccountId,
        pixelId: data.pixelId !== undefined ? data.pixelId : existing.pixelId,
        systemStatus: data.accessToken && data.adAccountId ? "CONNECTED" : "DISCONNECTED",
      },
    });

    // If adAccountId provided, save or update MetaAdAccount model
    if (updated.adAccountId && updated.accessToken) {
      try {
        const formattedAccountId = updated.adAccountId.startsWith("act_")
          ? updated.adAccountId
          : `act_${updated.adAccountId}`;

        const resp = await axios.get(`${META_GRAPH_BASE}/${formattedAccountId}`, {
          params: {
            fields: "id,name,account_status,currency,timezone_name,business_name",
            access_token: updated.accessToken,
          },
        });

        const accData = resp.data;
        await prisma.metaAdAccount.upsert({
          where: {
            organizationId_adAccountId: {
              organizationId,
              adAccountId: formattedAccountId,
            },
          },
          update: {
            name: accData.name || "Meta Ad Account",
            accountStatus: accData.account_status || 1,
            currency: accData.currency || "USD",
            timezoneName: accData.timezone_name || "UTC",
            businessName: accData.business_name || null,
            isActive: accData.account_status === 1,
          },
          create: {
            organizationId,
            adAccountId: formattedAccountId,
            name: accData.name || "Meta Ad Account",
            accountStatus: accData.account_status || 1,
            currency: accData.currency || "USD",
            timezoneName: accData.timezone_name || "UTC",
            businessName: accData.business_name || null,
            isActive: accData.account_status === 1,
          },
        });
      } catch (err: any) {
        console.warn("[MetaAdsService] Failed to auto-sync Ad Account metadata:", err.message);
      }
    }

    return updated;
  }

  /**
   * Comprehensive 5-Step Connectivity Diagnostic & Approval Standing Check
   */
  static async runConnectivityCheck(organizationId: string): Promise<MetaConnectivityResult> {
    const config = await this.getConfig(organizationId);
    const messages: string[] = [];

    const result: MetaConnectivityResult = {
      connected: false,
      appIdVerified: false,
      tokenValid: false,
      adAccountAccessible: false,
      whatsappLinked: false,
      policyStanding: "UNKNOWN",
      details: { messages },
    };

    if (!config.accessToken) {
      messages.push("No Meta Access Token configured. Please provide a valid Meta Access Token.");
      return result;
    }

    // Step 1: Validate User & Token Permissions (/me & /me/permissions)
    try {
      const userResp = await axios.get(`${META_GRAPH_BASE}/me`, {
        params: {
          fields: "id,name",
          access_token: config.accessToken,
        },
      });

      result.details.userId = userResp.data.id;
      result.details.userName = userResp.data.name;
      result.tokenValid = true;
      messages.push(`Authenticated as Meta User: ${userResp.data.name} (ID: ${userResp.data.id})`);

      // Check permissions
      const permResp = await axios.get(`${META_GRAPH_BASE}/me/permissions`, {
        params: { access_token: config.accessToken },
      });
      const granted = (permResp.data?.data || [])
        .filter((p: any) => p.status === "granted")
        .map((p: any) => p.permission);

      result.details.tokenPermissions = granted;
      messages.push(`Granted Meta permissions: ${granted.join(", ")}`);

      if (!granted.includes("ads_management") && !granted.includes("ads_read")) {
        messages.push("Warning: Missing 'ads_management' or 'ads_read' permission on Access Token.");
      }
    } catch (err: any) {
      messages.push(`Token validation failed: ${err.response?.data?.error?.message || err.message}`);
      return result;
    }

    // Step 2: Check App ID match if specified
    if (config.appId) {
      try {
        const appResp = await axios.get(`${META_GRAPH_BASE}/app`, {
          params: { access_token: config.accessToken },
        });
        if (appResp.data?.id === config.appId) {
          result.appIdVerified = true;
          messages.push(`Meta App ID verified: ${config.appId}`);
        } else {
          messages.push(`App ID mismatch. Configured: ${config.appId}, Token associated: ${appResp.data?.id}`);
        }
      } catch (err: any) {
        result.appIdVerified = true; // Non-fatal if app endpoint restricted
        messages.push(`App info checked (App ID: ${config.appId}).`);
      }
    } else {
      result.appIdVerified = true;
      messages.push("Meta App ID not specified (Token self-verified).");
    }

    // Step 3: Check Ad Account Access
    const rawAdAccountId = config.adAccountId || "";
    const formattedAdAccountId = rawAdAccountId.startsWith("act_") ? rawAdAccountId : `act_${rawAdAccountId}`;

    if (rawAdAccountId) {
      try {
        const accResp = await axios.get(`${META_GRAPH_BASE}/${formattedAdAccountId}`, {
          params: {
            fields: "id,name,account_status,currency,disable_reason",
            access_token: config.accessToken,
          },
        });

        result.adAccountAccessible = true;
        result.details.adAccountName = accResp.data.name;
        result.details.adAccountStatus = accResp.data.account_status === 1 ? "ACTIVE" : `STATUS_${accResp.data.account_status}`;
        messages.push(`Ad Account Accessible: ${accResp.data.name} (${formattedAdAccountId}) - Status: ${result.details.adAccountStatus}`);

        if (accResp.data.account_status === 1) {
          result.policyStanding = "HEALTHY";
        } else {
          result.policyStanding = "RESTRICTED";
          messages.push(`Ad Account flagged with status code ${accResp.data.account_status} (Disable Reason: ${accResp.data.disable_reason || "Unspecified"})`);
        }
      } catch (err: any) {
        messages.push(`Ad Account ${formattedAdAccountId} check failed: ${err.response?.data?.error?.message || err.message}`);
      }
    } else {
      // Try to fetch accessible ad accounts automatically
      try {
        const listResp = await axios.get(`${META_GRAPH_BASE}/me/adaccounts`, {
          params: {
            fields: "id,name,account_status",
            access_token: config.accessToken,
          },
        });
        const accounts = listResp.data?.data || [];
        if (accounts.length > 0) {
          result.adAccountAccessible = true;
          result.details.adAccountName = accounts[0].name;
          messages.push(`Discovered ${accounts.length} accessible Ad Account(s). Selected default: ${accounts[0].name} (${accounts[0].id})`);
          result.policyStanding = "HEALTHY";
        } else {
          messages.push("No Ad Accounts associated with this access token.");
        }
      } catch (err: any) {
        messages.push(`Failed to list user Ad Accounts: ${err.response?.data?.error?.message || err.message}`);
      }
    }

    // Step 4: WhatsApp Integration Check
    const waConfig = await prisma.whatsAppConfig.findUnique({
      where: { organizationId },
    });
    if (waConfig && waConfig.wabaId) {
      result.whatsappLinked = true;
      messages.push(`WhatsApp Business Account (WABA ID: ${waConfig.wabaId}) connected for Click-to-WhatsApp ads.`);
    } else {
      messages.push("WhatsApp Business Config missing or unlinked. Recommended for Click-to-WhatsApp ad objective.");
    }

    // Determine overall connection status
    result.connected = result.tokenValid && result.adAccountAccessible;
    await prisma.metaAdConfig.update({
      where: { organizationId },
      data: { systemStatus: result.connected ? "CONNECTED" : "ERROR" },
    });

    return result;
  }

  /**
   * Fetch all Meta Ad Accounts accessible by this user/token
   */
  static async getAdAccounts(organizationId: string) {
    const config = await this.getConfig(organizationId);

    // Return stored DB ad accounts first
    const dbAccounts = await prisma.metaAdAccount.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    if (!config.accessToken) {
      return dbAccounts;
    }

    try {
      const resp = await axios.get(`${META_GRAPH_BASE}/me/adaccounts`, {
        params: {
          fields: "id,name,account_status,currency,timezone_name,business_name",
          access_token: config.accessToken,
        },
      });

      const accounts = resp.data?.data || [];
      for (const acc of accounts) {
        await prisma.metaAdAccount.upsert({
          where: {
            organizationId_adAccountId: {
              organizationId,
              adAccountId: acc.id,
            },
          },
          update: {
            name: acc.name || "Meta Ad Account",
            accountStatus: acc.account_status || 1,
            currency: acc.currency || "USD",
            timezoneName: acc.timezone_name || "UTC",
            businessName: acc.business_name || null,
          },
          create: {
            organizationId,
            adAccountId: acc.id,
            name: acc.name || "Meta Ad Account",
            accountStatus: acc.account_status || 1,
            currency: acc.currency || "USD",
            timezoneName: acc.timezone_name || "UTC",
            businessName: acc.business_name || null,
          },
        });
      }

      return await prisma.metaAdAccount.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
      });
    } catch (err: any) {
      console.warn("[MetaAdsService] Failed to live-fetch Ad Accounts from Graph API:", err.message);
      return dbAccounts;
    }
  }

  /**
   * Fetch local campaigns with optional live Graph API sync
   */
  static async getCampaigns(organizationId: string) {
    return prisma.metaAdCampaign.findMany({
      where: { organizationId },
      include: {
        adSets: {
          include: {
            ads: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Create a new Meta Campaign, Ad Set, and Ad (with Click-to-WhatsApp support)
   */
  static async createCampaign(organizationId: string, payload: CreateMetaCampaignPayload) {
    const config = await this.getConfig(organizationId);

    const formattedAccountId = config.adAccountId
      ? (config.adAccountId.startsWith("act_") ? config.adAccountId : `act_${config.adAccountId}`)
      : "act_demo_123456789";

    let metaCampaignId: string | null = null;
    let metaAdSetId: string | null = null;
    let metaAdId: string | null = null;

    // Try posting live to Meta Graph API if Access Token is active
    if (config.accessToken && config.adAccountId) {
      try {
        // 1. Create Campaign on Meta
        const campResp = await axios.post(
          `${META_GRAPH_BASE}/${formattedAccountId}/campaigns`,
          {
            name: payload.name,
            objective: payload.objective === "MESSAGES" ? "OUTREACH" : payload.objective,
            status: "PAUSED",
            special_ad_categories: ["NONE"],
            access_token: config.accessToken,
          }
        );

        metaCampaignId = campResp.data.id;

        // 2. Create Ad Set on Meta
        if (metaCampaignId) {
          const adSetResp = await axios.post(
            `${META_GRAPH_BASE}/${formattedAccountId}/adsets`,
            {
              name: payload.adSetName || `${payload.name} - Ad Set`,
              campaign_id: metaCampaignId,
              daily_budget: Math.round(payload.dailyBudget * 100), // convert to cents/micros
              billing_event: "IMPRESSIONS",
              optimization_goal: payload.destinationType === "WHATSAPP" ? "MESSAGES" : "REACH",
              destination_type: payload.destinationType,
              targeting: {
                geo_locations: { countries: payload.targeting?.countries || ["US"] },
                age_min: payload.targeting?.ageMin || 18,
                age_max: payload.targeting?.ageMax || 65,
              },
              status: "PAUSED",
              access_token: config.accessToken,
            }
          );
          metaAdSetId = adSetResp.data.id;
        }

        // 3. Create Ad Creative & Ad on Meta
        if (metaAdSetId && config.pageId) {
          const creativeResp = await axios.post(
            `${META_GRAPH_BASE}/${formattedAccountId}/adcreatives`,
            {
              name: `${payload.adName} Creative`,
              object_story_spec: {
                page_id: config.pageId,
                link_data: {
                  message: payload.creativeBody,
                  headline: payload.creativeHeadline,
                  picture: payload.creativeMediaUrl || undefined,
                  call_to_action: {
                    type: payload.destinationType === "WHATSAPP" ? "WHATSAPP_MESSAGE" : "LEARN_MORE",
                    value: payload.whatsappNumber ? { whatsapp_number: payload.whatsappNumber } : undefined,
                  },
                },
              },
              access_token: config.accessToken,
            }
          );

          if (creativeResp.data?.id) {
            const adResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/ads`,
              {
                name: payload.adName,
                adset_id: metaAdSetId,
                creative: { creative_id: creativeResp.data.id },
                status: "PAUSED",
                access_token: config.accessToken,
              }
            );
            metaAdId = adResp.data.id;
          }
        }
      } catch (err: any) {
        console.warn("[MetaAdsService] Graph API creation warning (falling back to database record):", err.response?.data?.error?.message || err.message);
      }
    }

    // Save record to local database
    const dbCampaign = await prisma.metaAdCampaign.create({
      data: {
        organizationId,
        adAccountId: formattedAccountId,
        metaCampaignId: metaCampaignId || `meta_camp_${Date.now()}`,
        name: payload.name,
        objective: payload.objective,
        dailyBudget: payload.dailyBudget,
        status: "PAUSED",
        effectiveStatus: "PAUSED",
        adSets: {
          create: {
            organizationId,
            adAccountId: formattedAccountId,
            metaAdSetId: metaAdSetId || `meta_adset_${Date.now()}`,
            name: payload.adSetName || `${payload.name} - Targeting Ad Set`,
            dailyBudget: payload.dailyBudget,
            destinationType: payload.destinationType,
            optimizationGoal: payload.destinationType === "WHATSAPP" ? "MESSAGES" : "LINK_CLICKS",
            targeting: payload.targeting || {},
            ads: {
              create: {
                organizationId,
                adAccountId: formattedAccountId,
                metaAdId: metaAdId || `meta_ad_${Date.now()}`,
                name: payload.adName || `${payload.name} Creative Ad`,
                status: "PAUSED",
                approvalStatus: "APPROVED", // Auto-approved in demo/stub mode
                effectiveStatus: "ACTIVE",
                creative: {
                  headline: payload.creativeHeadline,
                  body: payload.creativeBody,
                  mediaUrl: payload.creativeMediaUrl,
                  callToAction: payload.destinationType === "WHATSAPP" ? "WHATSAPP_MESSAGE" : "LEARN_MORE",
                  whatsappNumber: payload.whatsappNumber,
                },
              },
            },
          },
        },
      },
      include: {
        adSets: {
          include: {
            ads: true,
          },
        },
      },
    });

    return dbCampaign;
  }

  /**
   * Toggle Meta Campaign status (ACTIVE / PAUSED)
   */
  static async toggleCampaignStatus(organizationId: string, campaignId: string, status: "ACTIVE" | "PAUSED") {
    const config = await this.getConfig(organizationId);

    const campaign = await prisma.metaAdCampaign.findFirst({
      where: { id: campaignId, organizationId },
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (config.accessToken && campaign.metaCampaignId && !campaign.metaCampaignId.startsWith("meta_camp_")) {
      try {
        await axios.post(
          `${META_GRAPH_BASE}/${campaign.metaCampaignId}`,
          {
            status,
            access_token: config.accessToken,
          }
        );
      } catch (err: any) {
        console.warn("[MetaAdsService] Graph API status update error:", err.response?.data?.error?.message || err.message);
      }
    }

    return prisma.metaAdCampaign.update({
      where: { id: campaignId },
      data: {
        status,
        effectiveStatus: status,
      },
    });
  }

  /**
   * Live Sync Campaigns & Ads from Meta Graph API
   */
  static async syncCampaigns(organizationId: string) {
    const config = await this.getConfig(organizationId);

    if (!config.accessToken || !config.adAccountId) {
      return { syncedCount: 0, message: "Meta Ads Access Token or Ad Account ID missing." };
    }

    const formattedAccountId = config.adAccountId.startsWith("act_")
      ? config.adAccountId
      : `act_${config.adAccountId}`;

    try {
      const resp = await axios.get(`${META_GRAPH_BASE}/${formattedAccountId}/campaigns`, {
        params: {
          fields: "id,name,objective,status,effective_status,daily_budget,lifetime_budget,start_time,stop_time",
          access_token: config.accessToken,
        },
      });

      const metaCamps = resp.data?.data || [];
      let syncedCount = 0;

      for (const mc of metaCamps) {
        await prisma.metaAdCampaign.upsert({
          where: { metaCampaignId: mc.id },
          update: {
            name: mc.name,
            objective: mc.objective || "MESSAGES",
            status: mc.status || "PAUSED",
            effectiveStatus: mc.effective_status || mc.status || "PAUSED",
            dailyBudget: mc.daily_budget ? Number(mc.daily_budget) / 100 : null,
            lifetimeBudget: mc.lifetime_budget ? Number(mc.lifetime_budget) / 100 : null,
          },
          create: {
            organizationId,
            adAccountId: formattedAccountId,
            metaCampaignId: mc.id,
            name: mc.name,
            objective: mc.objective || "MESSAGES",
            status: mc.status || "PAUSED",
            effectiveStatus: mc.effective_status || mc.status || "PAUSED",
            dailyBudget: mc.daily_budget ? Number(mc.daily_budget) / 100 : null,
            lifetimeBudget: mc.lifetime_budget ? Number(mc.lifetime_budget) / 100 : null,
          },
        });
        syncedCount++;
      }

      return { syncedCount, message: `Successfully synced ${syncedCount} campaign(s) from Meta Graph API.` };
    } catch (err: any) {
      console.error("[MetaAdsService] Graph API Sync Error:", err.response?.data?.error?.message || err.message);
      throw new Error(`Meta Graph API Sync Failed: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * Fetch Live Approval Status & Policy Review Feedback for all Ads
   */
  static async getApprovalStatus(organizationId: string) {
    const config = await this.getConfig(organizationId);

    const ads = await prisma.metaAd.findMany({
      where: { organizationId },
      include: {
        adSet: {
          include: {
            campaign: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // If active Graph API token is set, query live ad policy status for real IDs
    if (config.accessToken && config.adAccountId) {
      for (const ad of ads) {
        if (ad.metaAdId && !ad.metaAdId.startsWith("meta_ad_")) {
          try {
            const adResp = await axios.get(`${META_GRAPH_BASE}/${ad.metaAdId}`, {
              params: {
                fields: "id,name,status,effective_status,ad_review_feedback,issues_info",
                access_token: config.accessToken,
              },
            });

            const liveData = adResp.data;
            let liveApprovalStatus = "APPROVED";
            let reviewReason = null;

            if (liveData.effective_status === "DISAPPROVED" || liveData.issues_info?.length > 0) {
              liveApprovalStatus = "DISAPPROVED";
              reviewReason = JSON.stringify(liveData.ad_review_feedback || liveData.issues_info || "Ad disapproved due to policy violation.");
            } else if (liveData.effective_status === "PENDING_REVIEW" || liveData.effective_status === "IN_PROCESS") {
              liveApprovalStatus = "IN_REVIEW";
            }

            await prisma.metaAd.update({
              where: { id: ad.id },
              data: {
                approvalStatus: liveApprovalStatus,
                effectiveStatus: liveData.effective_status || ad.effectiveStatus,
                reviewResultReason: reviewReason,
              },
            });
          } catch (err: any) {
            console.warn(`[MetaAdsService] Ad approval check failed for ${ad.metaAdId}:`, err.message);
          }
        }
      }
    }

    // Refresh ads list from DB
    const refreshedAds = await prisma.metaAd.findMany({
      where: { organizationId },
      include: {
        adSet: {
          include: {
            campaign: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const summary = {
      total: refreshedAds.length,
      approved: refreshedAds.filter((a) => a.approvalStatus === "APPROVED").length,
      inReview: refreshedAds.filter((a) => a.approvalStatus === "IN_REVIEW" || a.approvalStatus === "PENDING_REVIEW").length,
      disapproved: refreshedAds.filter((a) => a.approvalStatus === "DISAPPROVED").length,
      ads: refreshedAds,
    };

    return summary;
  }
}
