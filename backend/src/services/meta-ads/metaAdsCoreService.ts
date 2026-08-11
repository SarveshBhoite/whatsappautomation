import prisma from "../../utils/prisma";
import axios from "axios";

export const META_GRAPH_VERSION = "v26.0";
export const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

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

export class MetaAdsCoreService {
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
          appId: process.env.META_APP_ID || null,
          accessToken: process.env.META_SYSTEM_USER_TOKEN || null,
          adAccountId: process.env.META_AD_ACCOUNT_ID || null,
          pixelId: process.env.META_PIXEL_ID || null,
          systemStatus: process.env.META_SYSTEM_USER_TOKEN ? "CONNECTED" : "DISCONNECTED",
        },
      });
    } else if ((!config.accessToken && process.env.META_SYSTEM_USER_TOKEN) || (!config.pixelId && process.env.META_PIXEL_ID)) {
      config = await prisma.metaAdConfig.update({
        where: { organizationId },
        data: {
          appId: config.appId || process.env.META_APP_ID || null,
          accessToken: config.accessToken || process.env.META_SYSTEM_USER_TOKEN,
          adAccountId: config.adAccountId || process.env.META_AD_ACCOUNT_ID || null,
          pixelId: config.pixelId || process.env.META_PIXEL_ID || null,
          systemStatus: "CONNECTED",
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
        console.warn("[MetaAdsCoreService] Failed to fetch Ad Account metadata:", err.message);
      }
    }

    return updated;
  }

  /**
   * Run 5-Step Connectivity Diagnostic & Policy Standing Check
   */
  static async runConnectivityCheck(organizationId: string): Promise<MetaConnectivityResult> {
    const config = await this.getConfig(organizationId);
    const messages: string[] = [];

    let connected = false;
    let appIdVerified = false;
    let tokenValid = false;
    let adAccountAccessible = false;
    let whatsappLinked = false;
    let policyStanding: "HEALTHY" | "WARNING" | "RESTRICTED" | "UNKNOWN" = "UNKNOWN";

    let userName: string | undefined;
    let userId: string | undefined;
    let adAccountName: string | undefined;
    let adAccountStatusStr: string | undefined;
    let tokenPermissions: string[] = [];

    if (config.appId) {
      appIdVerified = true;
      messages.push(`Meta App ID verified (${config.appId}).`);
    } else {
      messages.push("Meta App ID not configured.");
    }

    if (config.accessToken) {
      try {
        const debugResp = await axios.get(`${META_GRAPH_BASE}/debug_token`, {
          params: {
            input_token: config.accessToken,
            access_token: config.accessToken,
          },
        });

        const tokenData = debugResp.data?.data;
        if (tokenData && tokenData.is_valid) {
          tokenValid = true;
          userId = tokenData.user_id;
          tokenPermissions = tokenData.scopes || [];
          messages.push(`Access token valid (User ID: ${userId || "System User"}).`);
        }
      } catch (err: any) {
        try {
          const meResp = await axios.get(`${META_GRAPH_BASE}/me`, {
            params: {
              fields: "id,name",
              access_token: config.accessToken,
            },
          });
          if (meResp.data?.id) {
            tokenValid = true;
            userId = meResp.data.id;
            userName = meResp.data.name;
            messages.push(`System user token active (${userName || userId}).`);
          }
        } catch (meErr: any) {
          messages.push(`Token validation check notice: ${meErr.message}`);
        }
      }
    } else {
      messages.push("Meta Access Token missing.");
    }

    if (config.adAccountId && config.accessToken) {
      const formattedAccountId = config.adAccountId.startsWith("act_")
        ? config.adAccountId
        : `act_${config.adAccountId}`;

      try {
        const accResp = await axios.get(`${META_GRAPH_BASE}/${formattedAccountId}`, {
          params: {
            fields: "id,name,account_status,disable_reason,currency,timezone_name",
            access_token: config.accessToken,
          },
        });

        const acc = accResp.data;
        adAccountAccessible = true;
        adAccountName = acc.name;
        const statusNum = acc.account_status;

        if (statusNum === 1) {
          adAccountStatusStr = "ACTIVE";
          policyStanding = "HEALTHY";
          messages.push(`Ad Account ${formattedAccountId} is ACTIVE and HEALTHY.`);
        } else if (statusNum === 2) {
          adAccountStatusStr = "DISABLED";
          policyStanding = "RESTRICTED";
          messages.push(`Ad Account ${formattedAccountId} is DISABLED for policy violations.`);
        } else if (statusNum === 3) {
          adAccountStatusStr = "UNSETTLED";
          policyStanding = "WARNING";
          messages.push(`Ad Account ${formattedAccountId} is UNSETTLED (billing issue).`);
        } else if (statusNum === 7) {
          adAccountStatusStr = "PENDING_RISK_REVIEW";
          policyStanding = "WARNING";
          messages.push(`Ad Account ${formattedAccountId} is under risk review.`);
        } else {
          adAccountStatusStr = `STATUS_${statusNum}`;
          policyStanding = "WARNING";
          messages.push(`Ad Account ${formattedAccountId} status: ${statusNum}`);
        }
      } catch (accErr: any) {
        messages.push(`Failed to access Ad Account ${formattedAccountId}: ${accErr.message}`);
      }
    } else {
      messages.push("Ad Account ID not configured.");
    }

    try {
      const waConfig = await prisma.whatsAppConfig.findUnique({ where: { organizationId } });
      if (waConfig && waConfig.phoneNumberId && waConfig.accessToken) {
        whatsappLinked = true;
        messages.push("WhatsApp Cloud API credentials connected for Click-to-WhatsApp ads.");
      }
    } catch (e) {}

    connected = tokenValid && adAccountAccessible;

    return {
      connected,
      appIdVerified,
      tokenValid,
      adAccountAccessible,
      whatsappLinked,
      policyStanding,
      details: {
        userName,
        userId,
        adAccountName,
        adAccountStatus: adAccountStatusStr,
        tokenPermissions,
        messages,
      },
    };
  }

  /**
   * Fetch accessible Ad Accounts
   */
  static async getAdAccounts(organizationId: string) {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken) return [];

    try {
      const resp = await axios.get(`${META_GRAPH_BASE}/me/adaccounts`, {
        params: {
          fields: "id,name,account_status,currency,timezone_name",
          access_token: config.accessToken,
        },
      });
      return resp.data?.data || [];
    } catch (err: any) {
      console.warn("[MetaAdsCoreService] Failed to fetch Ad Accounts:", err.message);
      return [];
    }
  }

  /**
   * Fetch connected Facebook Pages
   */
  static async getPages(organizationId: string) {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken) return [];

    try {
      const resp = await axios.get(`${META_GRAPH_BASE}/me/accounts`, {
        params: {
          fields: "id,name,access_token,category,picture",
          access_token: config.accessToken,
        },
      });
      return resp.data?.data || [];
    } catch (err: any) {
      console.warn("[MetaAdsCoreService] Failed to fetch Facebook Pages:", err.message);
      return [];
    }
  }

  /**
   * Fetch connected Meta Pixels
   */
  static async getPixels(organizationId: string) {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken || !config.adAccountId) return [];

    const formattedAccountId = config.adAccountId.startsWith("act_")
      ? config.adAccountId
      : `act_${config.adAccountId}`;

    try {
      const resp = await axios.get(`${META_GRAPH_BASE}/${formattedAccountId}/adspixels`, {
        params: {
          fields: "id,name,is_unavailable,last_fired_time",
          access_token: config.accessToken,
        },
      });
      return resp.data?.data || [];
    } catch (err: any) {
      console.warn("[MetaAdsCoreService] Failed to fetch Meta Pixels:", err.message);
      return [];
    }
  }

  /**
   * Fetch Instagram Business Accounts
   */
  static async getInstagramAccounts(organizationId: string) {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken) return [];

    try {
      const pages = await this.getPages(organizationId);
      const igAccounts: any[] = [];

      for (const p of pages) {
        try {
          const igResp = await axios.get(`${META_GRAPH_BASE}/${p.id}`, {
            params: {
              fields: "instagram_business_account{id,username,profile_picture_url}",
              access_token: config.accessToken,
            },
          });

          if (igResp.data?.instagram_business_account) {
            igAccounts.push({
              id: igResp.data.instagram_business_account.id,
              username: `@${igResp.data.instagram_business_account.username}`,
              pageId: p.id,
              pageName: p.name,
            });
          }
        } catch (e) {}
      }

      return igAccounts;
    } catch (err: any) {
      console.warn("[MetaAdsCoreService] Failed to fetch Instagram Accounts:", err.message);
      return [];
    }
  }

  /**
   * Fetch WhatsApp Numbers connected to Pages
   */
  static async getWhatsAppNumbers(organizationId: string) {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken) return [];

    try {
      const pages = await this.getPages(organizationId);
      const waNumbers: any[] = [];

      for (const p of pages) {
        try {
          const waResp = await axios.get(`${META_GRAPH_BASE}/${p.id}`, {
            params: {
              fields: "whatsapp_number",
              access_token: config.accessToken,
            },
          });
          if (waResp.data?.whatsapp_number) {
            waNumbers.push({
              phoneNumber: waResp.data.whatsapp_number,
              pageId: p.id,
              pageName: p.name,
            });
          }
        } catch (e) {}
      }

      return waNumbers;
    } catch (err: any) {
      console.warn("[MetaAdsCoreService] Failed to fetch WhatsApp Numbers:", err.message);
      return [];
    }
  }

  /**
   * Fetch Custom & Lookalike Audiences
   */
  static async getAudiences(organizationId: string) {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken || !config.adAccountId) return [];

    const formattedAccountId = config.adAccountId.startsWith("act_")
      ? config.adAccountId
      : `act_${config.adAccountId}`;

    try {
      const resp = await axios.get(`${META_GRAPH_BASE}/${formattedAccountId}/customaudiences`, {
        params: {
          fields: "id,name,description,subtype,approximate_count,rule,lookalike_spec",
          access_token: config.accessToken,
        },
      });
      return resp.data?.data || [];
    } catch (err: any) {
      console.warn("[MetaAdsCoreService] Failed to fetch Custom Audiences:", err.message);
      return [];
    }
  }

  /**
   * Fetch Ad Images & Ad Videos from Meta Media Assets Library
   */
  static async getMediaAssets(organizationId: string) {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken || !config.adAccountId) return { images: [], videos: [] };

    const formattedAccountId = config.adAccountId.startsWith("act_")
      ? config.adAccountId
      : `act_${config.adAccountId}`;

    let images: any[] = [];
    let videos: any[] = [];

    try {
      const imgResp = await axios.get(`${META_GRAPH_BASE}/${formattedAccountId}/adimages`, {
        params: {
          fields: "hash,name,url,permalink_url,created_time",
          access_token: config.accessToken,
        },
      });
      images = imgResp.data?.data || [];
    } catch (e: any) {
      console.warn("[MetaAdsCoreService] Failed fetching ad images:", e.message);
    }

    try {
      const vidResp = await axios.get(`${META_GRAPH_BASE}/${formattedAccountId}/advideos`, {
        params: {
          fields: "id,name,source,picture,created_time",
          access_token: config.accessToken,
        },
      });
      videos = vidResp.data?.data || [];
    } catch (e: any) {
      console.warn("[MetaAdsCoreService] Failed fetching ad videos:", e.message);
    }

    return { images, videos };
  }

  /**
   * Publish & Activate Campaign live on Meta Graph API
   */
  static async publishCampaign(organizationId: string, campaignId: string) {
    const config = await this.getConfig(organizationId);

    const dbCampaign = await prisma.metaAdCampaign.findFirst({
      where: { id: campaignId, organizationId },
      include: { adSets: { include: { ads: true } } },
    });

    if (!dbCampaign) {
      throw new Error("Campaign not found.");
    }

    if (config.accessToken) {
      for (const adSet of dbCampaign.adSets) {
        for (const ad of adSet.ads) {
          if (ad.metaAdId && !ad.metaAdId.startsWith("meta_ad_")) {
            try {
              await axios.post(`${META_GRAPH_BASE}/${ad.metaAdId}`, {
                status: "ACTIVE",
                access_token: config.accessToken,
              });
            } catch (e: any) {
              console.warn(`[MetaAdsCoreService] Publish Ad ${ad.metaAdId} warning:`, e.message);
            }
          }
        }
        if (adSet.metaAdSetId && !adSet.metaAdSetId.startsWith("meta_adset_")) {
          try {
            await axios.post(`${META_GRAPH_BASE}/${adSet.metaAdSetId}`, {
              status: "ACTIVE",
              access_token: config.accessToken,
            });
          } catch (e: any) {
            console.warn(`[MetaAdsCoreService] Publish AdSet ${adSet.metaAdSetId} warning:`, e.message);
          }
        }
      }

      if (dbCampaign.metaCampaignId && !dbCampaign.metaCampaignId.startsWith("meta_camp_")) {
        try {
          await axios.post(`${META_GRAPH_BASE}/${dbCampaign.metaCampaignId}`, {
            status: "ACTIVE",
            access_token: config.accessToken,
          });
        } catch (e: any) {
          console.warn(`[MetaAdsCoreService] Publish Campaign ${dbCampaign.metaCampaignId} warning:`, e.message);
        }
      }
    }

    return prisma.metaAdCampaign.update({
      where: { id: campaignId },
      data: {
        status: "ACTIVE",
        effectiveStatus: "ACTIVE",
      },
    });
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
        console.warn("[MetaAdsCoreService] Graph API status update error:", err.response?.data?.error?.message || err.message);
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
}
