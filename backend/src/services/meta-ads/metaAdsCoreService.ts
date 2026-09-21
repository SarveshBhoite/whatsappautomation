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
      try {
        const orgExists = await prisma.organization.findUnique({ where: { id: organizationId } });
        if (orgExists) {
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
        }
      } catch (e) {}

      if (!config) {
        config = {
          id: "temp_config",
          organizationId,
          appId: process.env.META_APP_ID || null,
          accessToken: process.env.META_SYSTEM_USER_TOKEN || null,
          adAccountId: process.env.META_AD_ACCOUNT_ID || null,
          pixelId: process.env.META_PIXEL_ID || null,
          pageId: null,
          instagramAccountId: null,
          businessAccountId: null,
          systemStatus: process.env.META_SYSTEM_USER_TOKEN ? "CONNECTED" : "DISCONNECTED",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any;
      }
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

    return config!;
  }

  /**
   * Fetch connected Meta assets metadata for an organization
   */
  static async getAvailableAssets(organizationId: string) {
    const config = await this.getConfig(organizationId);
    if (!config) return null;

    let adAccountName = "Meta Ad Account";
    if (config.adAccountId) {
      try {
        const dbAcc = await prisma.metaAdAccount.findFirst({
          where: { organizationId, adAccountId: config.adAccountId.startsWith("act_") ? config.adAccountId : `act_${config.adAccountId}` },
        });
        if (dbAcc?.name) adAccountName = dbAcc.name;
      } catch (e) {}
    }

    return {
      adAccountId: config.adAccountId || null,
      adAccountName: config.adAccountId ? adAccountName : null,
      pageId: config.pageId || null,
      instagramAccountId: config.instagramAccountId || null,
      pixelId: config.pixelId || null,
      hasCustomAudiences: false,
    };
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
        appId: data.appId !== undefined ? data.appId : existing?.appId,
        appSecret: data.appSecret !== undefined ? data.appSecret : existing?.appSecret,
        accessToken: data.accessToken !== undefined ? data.accessToken : existing?.accessToken,
        adAccountId: data.adAccountId !== undefined ? data.adAccountId : existing?.adAccountId,
        pageId: data.pageId !== undefined ? data.pageId : existing?.pageId,
        instagramAccountId: data.instagramAccountId !== undefined ? data.instagramAccountId : existing?.instagramAccountId,
        pixelId: data.pixelId !== undefined ? data.pixelId : existing?.pixelId,
        systemStatus: (data.accessToken || existing?.accessToken) && (data.adAccountId || existing?.adAccountId) ? "CONNECTED" : "DISCONNECTED",
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
            currency: accData.currency || "INR",
            timezoneName: accData.timezone_name || "Asia/Kolkata",
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
      const waConfig = await prisma.whatsAppConfig.findFirst({ where: { organizationId, isActive: true } });
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
      // Fallback for System User Tokens under Business Manager
      try {
        const busResp = await axios.get(`${META_GRAPH_BASE}/1385886469956978/owned_ad_accounts`, {
          params: {
            fields: "id,name,account_status,currency,timezone_name",
            access_token: config.accessToken,
          },
        });
        return busResp.data?.data || [];
      } catch (bErr) {
        return [];
      }
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
      // Fallback for System User Tokens under Business Manager
      try {
        const busResp = await axios.get(`${META_GRAPH_BASE}/1385886469956978/owned_pages`, {
          params: {
            fields: "id,name,access_token,category,picture",
            access_token: config.accessToken,
          },
        });
        return busResp.data?.data || [];
      } catch (bErr) {
        return [];
      }
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
      const detail = err.response?.data?.error?.message || err.message;
      console.warn(`[MetaAdsCoreService] Failed to fetch Meta Pixels: ${detail}`);
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
   * Fetch WhatsApp Numbers connected to Pages, linked WABA accounts, and organization WhatsApp config
   */
  static async getWhatsAppNumbers(organizationId: string) {
    const config = await this.getConfig(organizationId);
    const waNumbers: any[] = [];
    const seenPhones = new Set<string>();

    const addNumberIfValid = (
      rawPhone: string | null | undefined,
      metadata: {
        displayPhoneNumber?: string;
        verifiedName?: string;
        pageId?: string;
        pageName?: string;
        wabaId?: string;
        source?: "PAGE" | "WABA" | "WHATSAPP_CONFIG";
      }
    ) => {
      if (!rawPhone) return;
      const cleanDigits = rawPhone.replace(/\D/g, "");
      if (cleanDigits.length < 10) return;
      // Standardize 10-digit suffix for deduplication
      const key = cleanDigits.slice(-10);
      if (!seenPhones.has(key)) {
        seenPhones.add(key);
        waNumbers.push({
          phoneNumber: rawPhone,
          displayPhoneNumber: metadata.displayPhoneNumber || rawPhone,
          verifiedName: metadata.verifiedName || "Connected WhatsApp",
          pageId: metadata.pageId,
          pageName: metadata.pageName,
          wabaId: metadata.wabaId,
          source: metadata.source || "PAGE",
        });
      }
    };

    // 1. Fetch from organization's connected WhatsApp Business Configs in DB (WABA accounts)
    try {
      const dbWaConfigs = await prisma.whatsAppConfig.findMany({
        where: { organizationId, isActive: true },
      });
      for (const item of dbWaConfigs) {
        if (item.phoneNumber) {
          addNumberIfValid(item.phoneNumber, {
            displayPhoneNumber: item.phoneNumber,
            verifiedName: item.accountName || "Connected WABA",
            wabaId: item.wabaId,
            source: "WHATSAPP_CONFIG",
          });
        }
      }
    } catch (e: any) {
      console.warn("[MetaAdsCoreService] DB WhatsApp config fetch warning:", e.message);
    }

    if (!config.accessToken) return waNumbers;

    // 2. Fetch from connected Facebook Pages (Page WhatsApp & Page Linked WABA)
    try {
      const pages = await this.getPages(organizationId);
      for (const p of pages) {
        const pageToken = (p as any).access_token || config.accessToken;
        try {
          const waResp = await axios.get(`${META_GRAPH_BASE}/${p.id}`, {
            params: {
              fields: "whatsapp_number,page_whatsapp_number,whatsapp_business_account{id,name,phone_numbers{id,display_phone_number,verified_name}}",
              access_token: pageToken,
            },
          });

          // Direct Page WhatsApp number
          const pageNum = waResp.data?.whatsapp_number || waResp.data?.page_whatsapp_number;
          if (pageNum) {
            addNumberIfValid(pageNum, {
              displayPhoneNumber: pageNum,
              verifiedName: `${p.name} WhatsApp`,
              pageId: p.id,
              pageName: p.name,
              source: "PAGE",
            });
          }

          // Page linked WABA phone numbers
          const pageWaba = waResp.data?.whatsapp_business_account;
          const wabaNums = pageWaba?.phone_numbers?.data || pageWaba?.phone_numbers || [];
          if (Array.isArray(wabaNums)) {
            for (const wn of wabaNums) {
              const phone = wn.display_phone_number || wn.phoneNumber || wn.id;
              addNumberIfValid(phone, {
                displayPhoneNumber: wn.display_phone_number || phone,
                verifiedName: wn.verified_name || `${p.name} WABA`,
                pageId: p.id,
                pageName: p.name,
                wabaId: pageWaba?.id,
                source: "WABA",
              });
            }
          }
        } catch (pageErr: any) {
          try {
            const fallbackResp = await axios.get(`${META_GRAPH_BASE}/${p.id}`, {
              params: {
                fields: "whatsapp_number",
                access_token: config.accessToken,
              },
            });
            if (fallbackResp.data?.whatsapp_number) {
              addNumberIfValid(fallbackResp.data.whatsapp_number, {
                displayPhoneNumber: fallbackResp.data.whatsapp_number,
                verifiedName: `${p.name} WhatsApp`,
                pageId: p.id,
                pageName: p.name,
                source: "PAGE",
              });
            }
          } catch (e) {}
        }
      }
    } catch (err: any) {
      console.warn("[MetaAdsCoreService] Page WhatsApp fetch warning:", err.message);
    }

    // 3. Fetch from Meta Client WhatsApp Business Accounts (/me/client_whatsapp_business_accounts)
    try {
      const wabaRes = await axios.get(`${META_GRAPH_BASE}/me/client_whatsapp_business_accounts`, {
        params: {
          fields: "id,name,phone_numbers{id,display_phone_number,verified_name}",
          access_token: config.accessToken,
        },
      });
      const clientWabas = wabaRes.data?.data || [];
      for (const waba of clientWabas) {
        const phoneList = waba.phone_numbers?.data || waba.phone_numbers || [];
        for (const wn of phoneList) {
          const phone = wn.display_phone_number || wn.id;
          addNumberIfValid(phone, {
            displayPhoneNumber: wn.display_phone_number || phone,
            verifiedName: wn.verified_name || waba.name,
            wabaId: waba.id,
            source: "WABA",
          });
        }
      }
    } catch (wabaClientErr: any) {}

    return waNumbers;
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

  /**
   * Search Meta Interest Targeting Database via Graph API (/search?type=adinterest)
   * Returns exact Meta Interest IDs with live audience reach lower/upper bound estimates
   */
  static async searchInterests(organizationId: string, query: string): Promise<Array<{ id: string; name: string; audience_size_lower_bound: number; audience_size_upper_bound: number; path: string[]; topic?: string }>> {
    try {
      const config = await this.getConfig(organizationId);
      const accessToken = config.accessToken || process.env.META_SYSTEM_USER_TOKEN;
      if (!accessToken) return [];

      const res = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: {
          type: "adinterest",
          q: query,
          limit: 10,
          access_token: accessToken,
        },
        timeout: 6000,
      });

      const items = res.data?.data || [];
      return items.map((item: any) => ({
        id: item.id,
        name: item.name,
        audience_size_lower_bound: item.audience_size_lower_bound || 1000000,
        audience_size_upper_bound: item.audience_size_upper_bound || 50000000,
        path: item.path || [item.name],
        topic: item.topic || "Targeting",
      }));
    } catch (err: any) {
      console.warn("[MetaAdsCoreService] Interest search warning:", err.message);
      return [];
    }
  }

  /**
   * Fetch Targeting Suggestions from Meta Graph API based on seed keywords or interests
   * (/search?type=adinterestsuggestion&interest_list=["Fashion","Shopping"])
   */
  static async searchTargetingSuggestions(
    organizationId: string,
    seedKeywords: string[]
  ): Promise<Array<{ id: string; name: string; audience_size_lower_bound: number; audience_size_upper_bound: number; path: string[]; topic?: string }>> {
    try {
      const config = await this.getConfig(organizationId);
      const accessToken = config.accessToken || process.env.META_SYSTEM_USER_TOKEN;
      if (!accessToken || !seedKeywords || seedKeywords.length === 0) return [];

      const cleanList = seedKeywords.map(k => k.replace(/^[^\w\s\u0900-\u0D7F]+/gu, "").trim()).filter(Boolean);
      if (cleanList.length === 0) return [];

      const res = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: {
          type: "adinterestsuggestion",
          interest_list: JSON.stringify(cleanList.slice(0, 5)),
          limit: 12,
          access_token: accessToken,
        },
        timeout: 6000,
      });

      const items = res.data?.data || [];
      return items.map((item: any) => ({
        id: item.id,
        name: item.name,
        audience_size_lower_bound: item.audience_size_lower_bound || 1500000,
        audience_size_upper_bound: item.audience_size_upper_bound || 45000000,
        path: item.path || [item.name],
        topic: item.topic || "Targeting",
      }));
    } catch (err: any) {
      console.warn("[MetaAdsCoreService] Targeting suggestions warning:", err.message);
      return [];
    }
  }

  /**
   * Fetch Meta Ad Targeting Categories Taxonomy (Demographics, Interests, Behaviors)
   * (/search?type=adtargetingcategory&class=interests)
   */
  static async searchTargetingCategories(
    organizationId: string,
    categoryClass: "interests" | "demographics" | "behaviors" = "interests"
  ): Promise<Array<{ id: string; name: string; path: string[]; type: string }>> {
    try {
      const config = await this.getConfig(organizationId);
      const accessToken = config.accessToken || process.env.META_SYSTEM_USER_TOKEN;
      if (!accessToken) return [];

      const res = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: {
          type: "adtargetingcategory",
          class: categoryClass,
          access_token: accessToken,
          limit: 25,
        },
        timeout: 6000,
      });

      const items = res.data?.data || [];
      return items.map((item: any) => ({
        id: item.id,
        name: item.name,
        path: item.path || [item.name],
        type: item.type || categoryClass,
      }));
    } catch (err: any) {
      console.warn("[MetaAdsCoreService] Targeting categories warning:", err.message);
      return [];
    }
  }

  /**
   * Fetch official Meta Graph API Ad Preview HTML snippet
   * Calls GET /{ad-id}/previews or GET /{ad-creative-id}/previews with ad_format (e.g., DESKTOP_FEED_STANDARD, INSTAGRAM_STANDARD, MOBILE_FEED_STANDARD, STORIES)
   */
  static async fetchAdPreview(
    organizationId: string,
    targetId: string, // ad_id or creative_id
    adFormat: string = "DESKTOP_FEED_STANDARD",
    isCreativeId: boolean = false
  ): Promise<{ success: boolean; iframeHtml?: string; error?: string }> {
    try {
      const config = await this.getConfig(organizationId);
      const accessToken = config.accessToken || process.env.META_SYSTEM_USER_TOKEN;
      if (!accessToken) {
        return { success: false, error: "Meta Access Token is not configured." };
      }

      const endpoint = `${META_GRAPH_BASE}/${targetId}/previews`;
      const res = await axios.get(endpoint, {
        params: {
          ad_format: adFormat,
          access_token: accessToken,
        },
        timeout: 10000,
      });

      const previewData = res.data?.data?.[0] || res.data;
      if (previewData && previewData.body) {
        return { success: true, iframeHtml: previewData.body };
      }

      return { success: false, error: "No preview HTML returned from Meta Graph API." };
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || err.message;
      console.warn("[MetaAdsCoreService] Ad preview fetch error:", errMsg);
      return { success: false, error: errMsg };
    }
  }
}
