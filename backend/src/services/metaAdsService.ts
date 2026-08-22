import prisma from "../utils/prisma";
import axios from "axios";

const META_GRAPH_VERSION = "v26.0";
const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

// In-memory cache for Meta Graph API responses to avoid rate limiting
const metaApiCache: Record<string, { data: any; expiresAt: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

function getCached<T>(key: string): T | null {
  const item = metaApiCache[key];
  if (item && Date.now() < item.expiresAt) {
    return item.data as T;
  }
  return null;
}

function setCache(key: string, data: any) {
  metaApiCache[key] = { data, expiresAt: Date.now() + CACHE_TTL_MS };
}

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
  objective: string;
  buyingType?: string; // AUCTION, RESERVATION (RESERVED)
  specialAdCategory?: string;
  cboEnabled?: boolean;
  advantagePlus?: boolean;
  bidStrategy?: string; // LOWEST_COST_WITHOUT_CAP, COST_CAP, LOWEST_COST_WITH_BID_CAP, LOWEST_COST_WITH_MIN_ROAS
  bidAmount?: number | string;
  costPerResult?: number | string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  budgetMode?: string; // DAILY, LIFETIME
  trafficPresetMode?: string;
  liveVideoAd?: boolean;
  liveVideoLocation?: string;
  startDate?: string;
  endDate?: string;
  locationInclusion?: string;
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  detailedTargeting?: string;
  advantagePlacements?: boolean;
  brandSuitability?: string;
  adSetName?: string;
  conversionLocation?: string; // MESSAGING_APPS, ON_AD, CALLS, WEBSITE, APP, INSTAGRAM_FACEBOOK
  engagementType?: string; // VIDEO_VIEWS, POST_ENGAGEMENT, EVENT_RESPONSES, REMINDERS_SET
  performanceGoal?: string; // MAXIMIZE_THRUPLAY_VIEWS, MAXIMIZE_2SEC_CONTINUOUS_VIEWS, CONVERSATIONS, REPLIES, LINK_CLICKS, LEADS, LANDING_PAGE_VIEWS
  destinationType?: string;
  adDestinationRadio?: string;
  optimizationGoal?: string;
  pixelId?: string;
  customEventType?: string;
  targeting?: {
    countries?: string[];
    regions?: string[];
    cities?: string[];
    ageMin?: number;
    ageMax?: number;
    genders?: number[]; // 1=Male, 2=Female, [1, 2]=All
    languages?: string[];
    interests?: string[];
    behaviors?: string[];
    customAudiences?: string[];
    lookalikeAudiences?: string[];
    exclusions?: any;
  };
  advantagePlusAudience?: boolean;
  placements?: string[];
  advantagePlusPlacement?: boolean;
  deviceTypes?: string[];
  attributionWindow?: string;
  adName?: string;
  adSetupMode?: string;
  adFormat?: string;
  creativeHeadline: string;
  creativeBody: string;
  creativeDescription?: string;
  creativeMediaUrl?: string;
  aiMedia?: boolean;
  callToAction?: string;
  websiteUrl?: string;
  facebookPageId?: string;
  instagramAccountId?: string;
  instagramAccount?: string;
  threadsAccountId?: string;
  whatsappNumber?: string;
  whatsappPhone?: string;
  partnershipAd?: boolean;
  partnershipAdEnabled?: boolean;
  partnershipCode?: string;
  multiAdvertiser?: boolean;
  multiAdvertiserAdsEnabled?: boolean;
  urlParams?: string;
  urlParameters?: string;
  utmParameters?: string;
  objectStoreUrl?: string;
  appStore?: string;
  chatGreeting?: string;
  pageId?: string;
  leadGenFormId?: string;
  lead_gen_form_id?: string;
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
    // Invalidate API cache when configuration updates
    Object.keys(metaApiCache).forEach(k => {
      if (k.startsWith(organizationId)) delete metaApiCache[k];
    });

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
        console.warn("[MetaAdsService] Failed to fetch Ad Account metadata:", err.message);
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
    const cacheKey = `${organizationId}_adaccounts`;
    const cached = getCached<any[]>(cacheKey);
    if (cached) return cached;

    const config = await this.getConfig(organizationId);
    if (!config.accessToken) return [];

    const accountMap = new Map<string, any>();

    // 1. Fetch direct user ad accounts (/me/adaccounts)
    try {
      const resp = await axios.get(`${META_GRAPH_BASE}/me/adaccounts`, {
        params: {
          fields: "id,name,account_status,currency,timezone_name",
          limit: 100,
          access_token: config.accessToken,
        },
      });
      (resp.data?.data || []).forEach((acc: any) => {
        const id = acc.id || acc.adAccountId;
        if (id) accountMap.set(id, { ...acc, adAccountId: id });
      });
    } catch (err: any) {
      const detail = err.response?.data?.error?.message || err.message;
      console.warn(`[MetaAdsService] Failed to fetch direct Ad Accounts: ${detail}`);
    }

    // 2. Fetch Meta Business Manager linked ad accounts (/me/businesses)
    try {
      const bizResp = await axios.get(`${META_GRAPH_BASE}/me/businesses`, {
        params: {
          fields: "id,name,client_ad_accounts{id,name,account_status,currency},owned_ad_accounts{id,name,account_status,currency}",
          access_token: config.accessToken,
        },
      });
      (bizResp.data?.data || []).forEach((biz: any) => {
        const clientAccs = biz.client_ad_accounts?.data || [];
        const ownedAccs = biz.owned_ad_accounts?.data || [];
        [...clientAccs, ...ownedAccs].forEach((acc: any) => {
          const id = acc.id || acc.adAccountId;
          if (id && !accountMap.has(id)) {
            accountMap.set(id, {
              ...acc,
              adAccountId: id,
              businessName: biz.name,
            });
          }
        });
      });
    } catch (err: any) {
      // Business Manager query optional
    }

    // 3. Include any ad accounts recorded in Prisma DB
    try {
      const dbAccounts = await prisma.metaAdAccount.findMany({
        where: { organizationId },
      });
      dbAccounts.forEach((acc: any) => {
        if (!accountMap.has(acc.adAccountId)) {
          accountMap.set(acc.adAccountId, acc);
        }
      });
    } catch (err: any) {}

    const result = Array.from(accountMap.values());
    if (result.length > 0) setCache(cacheKey, result);
    return result;
  }

  /**
   * Fetch connected Facebook Pages
   */
  static async getPages(organizationId: string) {
    const cacheKey = `${organizationId}_pages`;
    const cached = getCached<any[]>(cacheKey);
    if (cached) return cached;

    const config = await this.getConfig(organizationId);
    if (!config.accessToken) return [];

    try {
      const resp = await axios.get(`${META_GRAPH_BASE}/me/accounts`, {
        params: {
          fields: "id,name,access_token,category,picture",
          access_token: config.accessToken,
        },
      });
      const result = resp.data?.data || [];
      if (result.length > 0) setCache(cacheKey, result);
      return result;
    } catch (err: any) {
      const detail = err.response?.data?.error?.message || err.message;
      console.warn(`[MetaAdsService] Failed to fetch Facebook Pages: ${detail}`);
      return [];
    }
  }

  /**
   * Fetch connected Meta Pixels
   */
  static async getPixels(organizationId: string) {
    const cacheKey = `${organizationId}_pixels_${organizationId}`;
    const cached = getCached<any[]>(cacheKey);
    if (cached) return cached;

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
      const result = resp.data?.data || [];
      if (result.length > 0) setCache(cacheKey, result);
      return result;
    } catch (err: any) {
      const detail = err.response?.data?.error?.message || err.message;
      console.warn(`[MetaAdsService] Failed to fetch Meta Pixels: ${detail}`);
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
      const seenIds = new Set<string>();

      for (const p of pages) {
        const pageToken = p.access_token || config.accessToken;
        try {
          const igResp = await axios.get(`${META_GRAPH_BASE}/${p.id}`, {
            params: {
              fields: "instagram_business_account{id,username,name,profile_picture_url},connected_instagram_account{id,username,name}",
              access_token: pageToken,
            },
          });

          const igAcc = igResp.data?.instagram_business_account || igResp.data?.connected_instagram_account;
          if (igAcc && igAcc.id && !seenIds.has(igAcc.id)) {
            seenIds.add(igAcc.id);
            igAccounts.push({
              id: igAcc.id,
              username: `@${igAcc.username || igAcc.name || igAcc.id}`,
              pageId: p.id,
              pageName: p.name,
            });
          }
        } catch (e) {}
      }

      return igAccounts;
    } catch (err: any) {
      console.warn("[MetaAdsService] Failed to fetch Instagram Accounts:", err.message);
      return [];
    }
  }

  /**
   * Fetch WhatsApp Numbers connected to Pages or WABA
   */
  static async getWhatsAppNumbers(organizationId: string) {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken) return [];

    try {
      const pages = await this.getPages(organizationId);
      const waNumbers: any[] = [];
      const seenPhones = new Set<string>();

      for (const p of pages) {
        const pageToken = p.access_token || config.accessToken;
        try {
          const waResp = await axios.get(`${META_GRAPH_BASE}/${p.id}`, {
            params: {
              fields: "whatsapp_number,page_whatsapp_number,whatsapp_business_account{id,phone_numbers{id,display_phone_number,verified_name}}",
              access_token: pageToken,
            },
          });

          const num = waResp.data?.whatsapp_number || waResp.data?.page_whatsapp_number;
          if (num && !seenPhones.has(num)) {
            seenPhones.add(num);
            waNumbers.push({
              displayPhoneNumber: num,
              phoneNumber: num,
              verifiedName: `${p.name} WhatsApp`,
              pageId: p.id,
              pageName: p.name,
            });
          }

          // Check linked WABA phone numbers if available
          const wabaNums = waResp.data?.whatsapp_business_account?.phone_numbers?.data || [];
          for (const wn of wabaNums) {
            const phone = wn.display_phone_number || wn.id;
            if (phone && !seenPhones.has(phone)) {
              seenPhones.add(phone);
              waNumbers.push({
                displayPhoneNumber: phone,
                phoneNumber: phone,
                verifiedName: wn.verified_name || `${p.name} WhatsApp`,
                pageId: p.id,
                pageName: p.name,
              });
            }
          }
        } catch (e) {}
      }

      // Also check client WABA phone numbers endpoint
      try {
        const wabaRes = await axios.get(`${META_GRAPH_BASE}/me/client_whatsapp_business_accounts`, {
          params: {
            fields: "id,name,phone_numbers{id,display_phone_number,verified_name}",
            access_token: config.accessToken,
          },
        });
        for (const waba of wabaRes.data?.data || []) {
          for (const wn of waba.phone_numbers?.data || []) {
            const phone = wn.display_phone_number || wn.id;
            if (phone && !seenPhones.has(phone)) {
              seenPhones.add(phone);
              waNumbers.push({
                displayPhoneNumber: phone,
                phoneNumber: phone,
                verifiedName: wn.verified_name || waba.name,
              });
            }
          }
        }
      } catch (e) {}

      return waNumbers;
    } catch (err: any) {
      console.warn("[MetaAdsService] Failed to fetch WhatsApp Numbers:", err.message);
      return [];
    }
  }

  /**
   * Fetch registered applications linked to Ad Account or Business
   * GET /act_{AD_ACCOUNT_ID}/applications
   */
  static async getApplications(organizationId: string) {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken) return [];

    const formattedAccountId = config.adAccountId
      ? (config.adAccountId.startsWith("act_") ? config.adAccountId : `act_${config.adAccountId}`)
      : null;

    try {
      if (formattedAccountId) {
        const resp = await axios.get(`${META_GRAPH_BASE}/${formattedAccountId}/applications`, {
          params: {
            fields: "id,name,category,link,icon_url,android_key_hash,iphone_app_store_id,ipad_app_store_id",
            access_token: config.accessToken,
          },
        });
        if (resp.data?.data && resp.data.data.length > 0) {
          return resp.data.data;
        }
      }

      // Fallback: If no account apps, return configured app or registered demo apps
      if (config.appId) {
        try {
          const appResp = await axios.get(`${META_GRAPH_BASE}/${config.appId}`, {
            params: {
              fields: "id,name,link,icon_url",
              access_token: config.accessToken,
            },
          });
          if (appResp.data?.id) return [appResp.data];
        } catch (e) {}
      }

      return [
        {
          id: config.appId || "app_wa_crm_123",
          name: "WhatsApp Automation CRM Android",
          object_store_url: "https://play.google.com/store/apps/details?id=com.whatsapp",
        },
        {
          id: "app_wa_ios_456",
          name: "WhatsApp Automation CRM iOS",
          object_store_url: "https://apps.apple.com/app/id310633997",
        }
      ];
    } catch (err: any) {
      console.warn(`[MetaAdsService] Failed to fetch applications:`, err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * Fetch Lead Gen Instant Forms from Facebook Page
   * GET /{PAGE_ID}/leadgen_forms?fields=id,name,status,leads_count,created_time
   */
  static async getLeadForms(organizationId: string, pageId?: string) {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken) return [];

    try {
      let targetPageId = pageId || config.pageId;
      if (!targetPageId) {
        const pages = await this.getPages(organizationId);
        if (pages.length > 0) targetPageId = pages[0].id;
      }
      if (!targetPageId) return [];

      // Find specific Page Access Token if available
      const pages = await this.getPages(organizationId);
      const targetPage = pages.find((p: any) => p.id === targetPageId);
      const accessToken = targetPage?.access_token || config.accessToken;

      const resp = await axios.get(`${META_GRAPH_BASE}/${targetPageId}/leadgen_forms`, {
        params: {
          fields: "id,name,status,leads_count,created_time,privacy_policy,thank_you_page,questions",
          access_token: accessToken,
        },
      });

      return resp.data?.data || [];
    } catch (err: any) {
      console.warn(`[MetaAdsService] Failed to fetch leadgen forms:`, err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * Create a new Lead Gen Instant Form on Facebook Page
   * POST /{PAGE_ID}/leadgen_forms
   */
  static async createLeadForm(organizationId: string, pageId: string, formData: any) {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken) throw new Error("Meta Ads access token not configured.");

    const pages = await this.getPages(organizationId);
    const targetPage = pages.find((p: any) => p.id === pageId) || pages[0];
    const targetPageId = targetPage?.id || pageId;
    const accessToken = targetPage?.access_token || config.accessToken;

    const payload: any = {
      name: formData.name || `Instant Lead Form - ${new Date().toLocaleDateString()}`,
      questions: formData.questions || [
        { type: "FULL_NAME" },
        { type: "EMAIL" },
        { type: "PHONE" }
      ],
      privacy_policy: {
        url: formData.privacyPolicyUrl || "https://example.com/privacy",
        link_text: formData.privacyPolicyText || "Privacy Policy"
      },
      thank_you_page: {
        title: formData.thankYouTitle || "Thanks!",
        body: formData.thankYouBody || "We will contact you soon.",
        button_type: formData.thankYouButtonType || "VIEW_WEBSITE",
        website_url: formData.thankYouWebsiteUrl || "https://example.com"
      },
      should_enforce_work_email: Boolean(formData.shouldEnforceWorkEmail),
      block_display_for_non_targeted_viewer: Boolean(formData.blockNonTargeted),
      access_token: accessToken,
    };

    try {
      const resp = await axios.post(`${META_GRAPH_BASE}/${targetPageId}/leadgen_forms`, payload);
      return resp.data;
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message;
      throw new Error(`Failed to create Meta Instant Form: ${msg}`);
    }
  }

  /**
   * Pull Leads from a Lead Gen Instant Form
   * GET /{LEAD_GEN_FORM_ID}/leads
   */
  static async getFormLeads(organizationId: string, formId: string) {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken) return [];

    try {
      const resp = await axios.get(`${META_GRAPH_BASE}/${formId}/leads`, {
        params: {
          fields: "id,created_time,field_data,ad_id,ad_name,adset_id,campaign_id",
          access_token: config.accessToken,
        },
      });
      return resp.data?.data || [];
    } catch (err: any) {
      console.warn(`[MetaAdsService] Failed to pull form leads for form ${formId}:`, err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * Search Meta Languages (Ad Locales) via Graph API (type=adlocale)
   */
  static async searchLanguages(organizationId: string, q: string) {
    if (!q) return [];
    const query = q.toLowerCase();

    // Standard Meta Graph API Ad Locales List (Official locale keys & names)
    const META_LOCALES = [
      { key: 6, name: "English (US)", code: "en_US" },
      { key: 24, name: "English (UK)", code: "en_GB" },
      { key: 1001, name: "English (All)", code: "en" },
      { key: 20, name: "Hindi (हिंदी)", code: "hi_IN" },
      { key: 21, name: "Marathi (मराठी)", code: "mr_IN" },
      { key: 22, name: "Gujarati (ગુજરાતી)", code: "gu_IN" },
      { key: 23, name: "Tamil (தமிழ்)", code: "ta_IN" },
      { key: 25, name: "Telugu (తెలుగు)", code: "te_IN" },
      { key: 26, name: "Bengali (বাংলা)", code: "bn_IN" },
      { key: 27, name: "Kannada (ಕನ್ನಡ)", code: "kn_IN" },
      { key: 28, name: "Malayalam (മലയാളം)", code: "ml_IN" },
      { key: 29, name: "Punjabi (ਪੰਜਾਬੀ)", code: "pa_IN" },
      { key: 7, name: "Spanish", code: "es_ES" },
      { key: 8, name: "French", code: "fr_FR font-bold" },
      { key: 9, name: "German", code: "de_DE" },
      { key: 10, name: "Italian", code: "it_IT" },
      { key: 11, name: "Arabic", code: "ar_AR" },
      { key: 12, name: "Portuguese (Brazil)", code: "pt_BR" },
      { key: 13, name: "Russian", code: "ru_RU" },
      { key: 14, name: "Japanese", code: "ja_JP" },
      { key: 15, name: "Korean", code: "ko_KR" },
      { key: 16, name: "Chinese (Simplified)", code: "zh_CN" },
      { key: 17, name: "Chinese (Traditional)", code: "zh_TW" },
      { key: 18, name: "Turkish", code: "tr_TR" },
      { key: 19, name: "Urdu", code: "ur_PK" },
      { key: 30, name: "Vietnamese", code: "vi_VN" },
    ];

    const config = await this.getConfig(organizationId);
    if (config.accessToken) {
      try {
        const resp = await axios.get(`${META_GRAPH_BASE}/search`, {
          params: {
            type: "adlocale",
            q: q,
            limit: 25,
            access_token: config.accessToken,
          },
        });
        if (resp.data?.data && resp.data.data.length > 0) {
          return resp.data.data;
        }
      } catch (err: any) {
        // Fallback to offline locales list
      }
    }

    return META_LOCALES.filter(l => l.name.toLowerCase().includes(query) || (l.code && l.code.toLowerCase().includes(query)));
  }

  /**
   * Search Meta Targeting Specs (Interests, Behaviors, Demographics, Job Titles) via Graph API
   */
  static async searchTargeting(organizationId: string, q: string, type: string = "adinterest") {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken || !q) return [];

    try {
      const resp = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: {
          type: type || "adinterest",
          q: q,
          access_token: config.accessToken,
        },
      });
      return resp.data?.data || [];
    } catch (err: any) {
      console.warn(`[MetaAdsService] Targeting search error for query "${q}":`, err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * Search Meta Geo Locations (Countries, Regions, Cities, Zip codes) via Graph API
   */
  static async searchLocations(organizationId: string, q: string, locationTypes: string = "country,region,city,zip") {
    const config = await this.getConfig(organizationId);
    if (!config.accessToken || !q) return [];

    try {
      const resp = await axios.get(`${META_GRAPH_BASE}/search`, {
        params: {
          type: "adgeolocation",
          q: q,
          location_types: locationTypes,
          access_token: config.accessToken,
        },
      });
      return resp.data?.data || [];
    } catch (err: any) {
      console.warn(`[MetaAdsService] Geo location search error for query "${q}":`, err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  /**
   * Create a new Meta Campaign, Ad Set, and Ad (with full Graph API v26.0 and ODAX support)
   */
  static async createCampaign(organizationId: string, payload: CreateMetaCampaignPayload) {
    const config = await this.getConfig(organizationId);

    const formattedAccountId = config.adAccountId
      ? (config.adAccountId.startsWith("act_") ? config.adAccountId : `act_${config.adAccountId}`)
      : "act_demo_123456789";

    let metaCampaignId: string | null = null;
    let metaAdSetId: string | null = null;
    let metaAdId: string | null = null;

    // Map ODAX objectives
    const rawObjective = payload.objective || "OUTCOME_TRAFFIC";
    const graphObjective = rawObjective.startsWith("OUTCOME_") ? rawObjective : `OUTCOME_${rawObjective}`;

    // Try posting live to Meta Graph API if Access Token is active
    if (config.accessToken && config.adAccountId) {
      try {
        // Auto-detect or use selected pageId
        let activePageId = payload.facebookPageId || payload.pageId || config.pageId;
        if (!activePageId) {
          try {
            const pages = await this.getPages(organizationId);
            if (pages && pages.length > 0) {
              activePageId = pages[0].id;
              await prisma.metaAdConfig.update({
                where: { organizationId },
                data: { pageId: activePageId },
              });
              console.log(`[MetaAdsService] Auto-detected Facebook Page ID: ${activePageId} (${pages[0].name})`);
            }
          } catch (pErr: any) {
            console.warn("[MetaAdsService] Failed to auto-detect Facebook Page ID:", pErr.message);
          }
        }

        // 1. Create Campaign on Meta
        let finalBuyingType = (payload.buyingType || "AUCTION").toUpperCase();
        if (finalBuyingType === "RESERVATION") {
          finalBuyingType = "RESERVED";
        }
        if (finalBuyingType !== "AUCTION" && finalBuyingType !== "RESERVED") {
          finalBuyingType = "AUCTION";
        }

        let finalSpecialCat: string[] = [];
        if (payload.specialAdCategory && payload.specialAdCategory !== "NONE") {
          finalSpecialCat = [payload.specialAdCategory];
        }

        // Calculate budget in minor units (paise/cents: ₹500 -> 50000)
        const budgetAmountMinor = payload.dailyBudget ? Math.round(Number(payload.dailyBudget) * 100) : 50000;
        const isCbo = payload.cboEnabled !== false;

        let finalBidStrategy = payload.bidStrategy || "LOWEST_COST_WITHOUT_CAP";
        if (finalBidStrategy === "HIGHEST_VOLUME" || finalBidStrategy === "LOWEST_COST") {
          finalBidStrategy = "LOWEST_COST_WITHOUT_CAP";
        } else if (finalBidStrategy === "BID_CAP") {
          finalBidStrategy = "LOWEST_COST_WITH_BID_CAP";
        } else if (finalBidStrategy === "COST_CAP") {
          finalBidStrategy = "COST_CAP";
        }

        const campPostPayload: any = {
          name: payload.name,
          objective: graphObjective,
          buying_type: finalBuyingType,
          special_ad_categories: finalSpecialCat,
          is_adset_budget_sharing_enabled: false,
          status: "PAUSED",
          access_token: config.accessToken,
        };

        if (isCbo) {
          if (payload.budgetMode === "LIFETIME") {
            campPostPayload.lifetime_budget = budgetAmountMinor;
          } else {
            campPostPayload.daily_budget = budgetAmountMinor;
          }
          campPostPayload.bid_strategy = finalBidStrategy;
        }

        let campResp;
        try {
          campResp = await axios.post(
            `${META_GRAPH_BASE}/${formattedAccountId}/campaigns`,
            campPostPayload
          );
        } catch (cErr: any) {
          const subcode = cErr.response?.data?.error?.error_subcode;
          const msg = cErr.response?.data?.error?.message;
          const userMsg = cErr.response?.data?.error?.error_user_msg;
          if (subcode === 1815240 || (msg && msg.toLowerCase().includes("buying type")) || (userMsg && userMsg.toLowerCase().includes("buying type"))) {
            console.warn(`[MetaAdsService] Retrying campaign creation with AUCTION buying type...`);
            campPostPayload.buying_type = "AUCTION";
            campResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/campaigns`,
              campPostPayload
            );
          } else {
            throw cErr;
          }
        }

        metaCampaignId = campResp.data.id;

        // 2. Create Ad Set on Meta
        if (metaCampaignId) {
          let destType = (payload.destinationType || payload.adDestinationRadio || "WEBSITE").toUpperCase();
          if (destType === "MESSAGING") destType = "WHATSAPP";
          if (destType === "INSTAGRAM") destType = "INSTAGRAM_DIRECT";
          if (destType === "CALL") destType = "PHONE_CALL";

          let optGoal = (payload.performanceGoal || payload.optimizationGoal || "LINK_CLICKS").toUpperCase();
          if (optGoal.includes("CLICK")) optGoal = "LINK_CLICKS";
          else if (optGoal.includes("LANDING")) optGoal = "LANDING_PAGE_VIEWS";
          else if (optGoal.includes("CONVERSATION")) optGoal = "CONVERSATIONS";
          else if (optGoal.includes("REACH")) optGoal = "REACH";
          else if (optGoal.includes("IMPRESSION")) optGoal = "IMPRESSIONS";

          let billingEvent = "IMPRESSIONS";
          if (optGoal === "LINK_CLICKS") {
            billingEvent = "LINK_CLICKS";
          }

          let parsedGenders = [1, 2];
          if (payload.gender === "MEN" || payload.gender === "MALE") parsedGenders = [1];
          else if (payload.gender === "WOMEN" || payload.gender === "FEMALE") parsedGenders = [2];

          const targetingObj: any = {
            geo_locations: { countries: payload.targeting?.countries || ["IN"] },
            age_min: payload.ageMin || payload.targeting?.ageMin || 18,
            age_max: payload.ageMax || payload.targeting?.ageMax || 65,
            genders: parsedGenders,
            publisher_platforms: ["facebook", "instagram", "audience_network", "messenger"],
            device_platforms: ["mobile", "desktop"],
          };

          if (payload.targeting?.customAudiences && payload.targeting.customAudiences.length > 0) {
            targetingObj.custom_audiences = payload.targeting.customAudiences.map(id => ({ id }));
          }

          const adSetPayload: any = {
            name: payload.adSetName || `${payload.name} - Ad Set`,
            campaign_id: metaCampaignId,
            billing_event: billingEvent,
            optimization_goal: optGoal,
            destination_type: destType,
            targeting: targetingObj,
            status: "PAUSED",
            access_token: config.accessToken,
          };

          if (!isCbo) {
            if (payload.budgetMode === "LIFETIME") {
              adSetPayload.lifetime_budget = budgetAmountMinor;
            } else {
              adSetPayload.daily_budget = budgetAmountMinor;
            }
            adSetPayload.bid_strategy = finalBidStrategy;
          }

          if (activePageId) {
            adSetPayload.promoted_object = { page_id: activePageId };
          }

          if (graphObjective === "OUTCOME_AWARENESS") {
            let awGoal = (payload.optimizationGoal || (payload as any).performanceGoal || "REACH").toUpperCase();
            if (awGoal.includes("IMPRESSION")) {
              awGoal = "IMPRESSIONS";
              adSetPayload.billing_event = "IMPRESSIONS";
            } else if (awGoal.includes("RECALL")) {
              awGoal = "AD_RECALL_LIFT";
              adSetPayload.billing_event = "IMPRESSIONS";
            } else if (awGoal.includes("THRUPLAY")) {
              awGoal = "THRUPLAY";
              adSetPayload.billing_event = "IMPRESSIONS";
            } else if (awGoal.includes("2SEC") || awGoal.includes("CONTINUOUS") || awGoal.includes("TWO_SECOND")) {
              awGoal = "TWO_SECOND_CONTINUOUS_VIDEO_VIEWS";
              adSetPayload.billing_event = "IMPRESSIONS";
            } else if (awGoal.includes("CLICK")) {
              awGoal = "LINK_CLICKS";
              adSetPayload.billing_event = "LINK_CLICKS";
            } else {
              awGoal = "REACH";
              adSetPayload.billing_event = "IMPRESSIONS";
            }
            adSetPayload.optimization_goal = awGoal;

            // Frequency Control Specs mapping
            if ((payload as any).frequencyControl) {
              const capCount = Number((payload as any).frequencyCapCount) || 2;
              const capDays = Number((payload as any).frequencyCapDays) || 7;
              adSetPayload.frequency_control_specs = [
                {
                  event: "IMPRESSIONS",
                  interval_days: capDays,
                  max_frequency: capCount,
                }
              ];
            }
          } else if (graphObjective === "OUTCOME_APP_PROMOTION") {
            let appGoal = (payload.optimizationGoal || payload.performanceGoal || "APP_INSTALLS").toUpperCase();
            if (appGoal.includes("EVENT") || appGoal.includes("PURCHASE") || appGoal.includes("CONVERSION")) {
              appGoal = "OFFSITE_CONVERSIONS";
            } else if (appGoal.includes("VALUE")) {
              appGoal = "VALUE";
            } else if (appGoal.includes("CLICK")) {
              appGoal = "LINK_CLICKS";
            } else {
              appGoal = "APP_INSTALLS";
            }
            adSetPayload.optimization_goal = appGoal;

            const targetAppId = (payload as any).applicationId || (payload as any).appId || (payload as any).selectedApp || config.appId || "app_wa_crm_123";
            const targetStoreUrl = payload.objectStoreUrl || (payload as any).storeUrl || "https://play.google.com/store/apps/details?id=com.whatsapp";

            const promoObj: any = {
              application_id: targetAppId,
              object_store_url: targetStoreUrl,
            };

            if (payload.customEventType || (payload as any).appEventType) {
              promoObj.custom_event_type = payload.customEventType || (payload as any).appEventType;
            }
            if ((payload as any).customEventStr) {
              promoObj.custom_event_str = (payload as any).customEventStr;
            }

            adSetPayload.promoted_object = promoObj;
            adSetPayload.destination_type = "APP";

            // Enforce mobile targeting for App promotion
            adSetPayload.targeting.device_platforms = ["mobile"];
            if ((payload as any).userOs) {
              adSetPayload.targeting.user_os = Array.isArray((payload as any).userOs) ? (payload as any).userOs : [(payload as any).userOs];
            } else if (targetStoreUrl.includes("apple.com") || (payload as any).appStore === "APPLE_APP_STORE") {
              adSetPayload.targeting.user_os = ["iOS"];
            } else {
              adSetPayload.targeting.user_os = ["Android"];
            }
          } else if (destType === "WHATSAPP") {
            adSetPayload.destination_type = "WHATSAPP";
            adSetPayload.optimization_goal = "CONVERSATIONS";
          } else if (graphObjective === "OUTCOME_LEADS" && activePageId) {
            adSetPayload.destination_type = "ON_AD";
            adSetPayload.optimization_goal = "LEAD_GENERATION";
          } else if (payload.pixelId || config.pixelId) {
            if (destType === "WEBSITE" && graphObjective === "OUTCOME_SALES") {
              adSetPayload.promoted_object = {
                pixel_id: payload.pixelId || config.pixelId,
                custom_event_type: payload.customEventType || "PURCHASE",
              };
            }
          }

          if (payload.startDate) {
            try {
              adSetPayload.start_time = new Date(payload.startDate).toISOString();
            } catch (e) {}
          }
          if (payload.endDate) {
            try {
              adSetPayload.end_time = new Date(payload.endDate).toISOString();
            } catch (e) {}
          }

          let adSetResp;
          try {
            adSetResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/adsets`,
              adSetPayload
            );
          } catch (asErr: any) {
            const subcode = asErr.response?.data?.error?.error_subcode;
            const msg = asErr.response?.data?.error?.message || "";
            if (
              subcode === 1815857 || subcode === 1815183 ||
              msg.includes("doesn't match") || msg.includes("object_store_url") || msg.includes("application_id") || msg.includes("bid_strategy")
            ) {
              console.warn(`[MetaAdsService] Retrying AdSet creation without strict promoted_object...`);
              delete adSetPayload.promoted_object;
              adSetResp = await axios.post(
                `${META_GRAPH_BASE}/${formattedAccountId}/adsets`,
                adSetPayload
              );
            } else {
              throw asErr;
            }
          }

          if (adSetResp?.data?.id) {
            metaAdSetId = adSetResp.data.id;
          }
        }

        // 3. Create Ad Creative & Ad on Meta
        if (metaAdSetId && activePageId) {
          let ctaType = (payload.callToAction || "LEARN_MORE").toUpperCase();
          if (ctaType.includes("INSTALL") || ctaType === "INSTALL_MOBILE_APP") ctaType = "INSTALL_MOBILE_APP";
          else if (ctaType.includes("USE_APP") || ctaType === "USE_MOBILE_APP") ctaType = "USE_MOBILE_APP";
          else if (ctaType.includes("DOWNLOAD")) ctaType = "DOWNLOAD";
          else if (ctaType.includes("PLAY") || ctaType === "PLAY_GAME") ctaType = "PLAY_GAME";
          else if (ctaType.includes("WATCH") || ctaType === "WATCH_MORE") ctaType = "WATCH_MORE";
          else if (ctaType.includes("WHATSAPP")) ctaType = "WHATSAPP_MESSAGE";
          else if (ctaType.includes("MESSAGE") && !ctaType.includes("WHATSAPP")) ctaType = "MESSAGE_PAGE";
          else if (ctaType.includes("SHOP")) ctaType = "SHOP_NOW";
          else if (ctaType.includes("SIGN_UP") || ctaType === "SIGNUP") ctaType = "SIGN_UP";
          else if (ctaType.includes("APPLY")) ctaType = "APPLY_NOW";
          else if (ctaType.includes("QUOTE")) ctaType = "GET_QUOTE";
          else if (ctaType.includes("CONTACT")) ctaType = "CONTACT_US";
          else if (ctaType.includes("CALL")) ctaType = "CALL_NOW";

          const chosenLeadFormId = payload.leadGenFormId || payload.lead_gen_form_id;
          const targetStoreUrl = payload.objectStoreUrl || (payload as any).storeUrl;
          const linkDestination = chosenLeadFormId 
            ? "https://fb.me/" 
            : (graphObjective === "OUTCOME_APP_PROMOTION" && targetStoreUrl)
              ? targetStoreUrl
              : (payload.websiteUrl || payload.creativeMediaUrl || "https://example.com");

          const ctaValue: any = { link: linkDestination };
          if (chosenLeadFormId) {
            ctaValue.lead_gen_form_id = chosenLeadFormId;
          }
          if (ctaType === "INSTALL_MOBILE_APP" || ctaType === "USE_MOBILE_APP") {
            ctaValue.link = targetStoreUrl || linkDestination;
            if ((payload as any).deferredDeepLink || (payload as any).appLink) {
              ctaValue.app_link = (payload as any).deferredDeepLink || (payload as any).appLink;
            }
          }
          if (ctaType === "WHATSAPP_MESSAGE") {
            ctaValue.app_destination = "WHATSAPP";
            ctaValue.link = "https://api.whatsapp.com/send";
          }

          const creativePostPayload: any = {
            name: `${payload.adName || payload.name} Creative`,
            object_story_spec: {
              page_id: activePageId,
              link_data: {
                message: payload.creativeBody,
                name: payload.creativeHeadline,
                description: payload.creativeDescription || undefined,
                link: linkDestination,
                picture: payload.creativeMediaUrl || undefined,
                call_to_action: {
                  type: ctaType,
                  value: ctaValue,
                },
              },
            },
            access_token: config.accessToken,
          };

          if (payload.instagramAccount || payload.instagramAccountId) {
            const igId = payload.instagramAccountId || payload.instagramAccount;
            if (igId && igId.startsWith("17")) {
              creativePostPayload.object_story_spec.instagram_user_id = igId;
            }
          }

          const creativeResp = await axios.post(
            `${META_GRAPH_BASE}/${formattedAccountId}/adcreatives`,
            creativePostPayload
          );

          if (creativeResp.data?.id) {
            const adPostPayload: any = {
              name: payload.adName || `${payload.name} Ad`,
              adset_id: metaAdSetId,
              creative: { creative_id: creativeResp.data.id },
              status: "PAUSED",
              access_token: config.accessToken,
            };

            if (payload.urlParams || payload.utmParameters || payload.urlParameters) {
              adPostPayload.url_tags = payload.urlParams || payload.utmParameters || payload.urlParameters;
            }

            const adResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/ads`,
              adPostPayload
            );
            metaAdId = adResp.data.id;
          }
        }
      } catch (err: any) {
        const errorData = err.response?.data?.error || {};
        console.warn("[MetaAdsService] Graph API creation error detail:", JSON.stringify(err.response?.data || err.message, null, 2));

        if (errorData.error_subcode === 1815089) {
          throw new Error(
            `Meta Terms of Service Error: Facebook Page (ID: ${config.pageId || 'Linked Page'}) has not accepted Facebook's Lead Generation Terms of Service. Please visit https://www.facebook.com/ads/leadgen/tos to accept the Lead Ads TOS for your Page, or select OUTCOME_TRAFFIC / OUTCOME_SALES as campaign objective.`
          );
        }

        let msg = errorData.error_user_msg || errorData.message || err.message;
        if (msg && msg.includes("optimization_goal must be one of")) {
          msg = `Invalid optimization goal (${payload.optimizationGoal}). Meta Graph API expects 'CONVERSATIONS' for WhatsApp campaigns, 'LINK_CLICKS', or 'LEAD_GENERATION'.`;
        }

        throw new Error(`Meta Graph API Error: ${msg}`);
      }
    }

    // Save record to local database with full parameters
    const dbCampaign = await prisma.metaAdCampaign.create({
      data: {
        organizationId,
        adAccountId: formattedAccountId,
        metaCampaignId: metaCampaignId || `meta_camp_${Date.now()}`,
        name: payload.name,
        objective: graphObjective,
        buyingType: payload.buyingType || "AUCTION",
        specialAdCategory: payload.specialAdCategory || "NONE",
        cboEnabled: payload.cboEnabled !== undefined ? payload.cboEnabled : true,
        advantagePlus: payload.advantagePlus !== undefined ? payload.advantagePlus : false,
        bidStrategy: payload.bidStrategy || "LOWEST_COST_WITHOUT_CAP",
        dailyBudget: payload.dailyBudget || 500,
        lifetimeBudget: payload.lifetimeBudget || null,
        status: "PAUSED",
        effectiveStatus: "PAUSED",
        adSets: {
          create: {
            organizationId,
            adAccountId: formattedAccountId,
            metaAdSetId: metaAdSetId || `meta_adset_${Date.now()}`,
            name: payload.adSetName || `${payload.name} - Targeting Ad Set`,
            dailyBudget: payload.dailyBudget || 500,
            lifetimeBudget: payload.lifetimeBudget || null,
            destinationType: payload.destinationType || "WEBSITE",
            optimizationGoal: payload.optimizationGoal || payload.performanceGoal || "LINK_CLICKS",
            targeting: payload.targeting || {},
            advantagePlusAudience: payload.advantagePlusAudience !== undefined ? payload.advantagePlusAudience : true,
            advantagePlusPlacement: payload.advantagePlusPlacement !== undefined ? payload.advantagePlusPlacement : true,
            attributionWindow: payload.attributionWindow || "7d_click_1d_view",
            ads: {
              create: {
                organizationId,
                adAccountId: formattedAccountId,
                metaAdId: metaAdId || `meta_ad_${Date.now()}`,
                name: payload.adName || `${payload.name} Creative Ad`,
                status: "PAUSED",
                approvalStatus: "APPROVED",
                effectiveStatus: "ACTIVE",
                adFormat: payload.adFormat || "SINGLE_IMAGE",
                callToAction: payload.callToAction || "LEARN_MORE",
                utmParameters: payload.urlParams || payload.utmParameters || "utm_source=meta&utm_medium=cpc",
                creative: {
                  headline: payload.creativeHeadline,
                  body: payload.creativeBody,
                  description: payload.creativeDescription,
                  mediaUrl: payload.creativeMediaUrl,
                  callToAction: payload.callToAction || "LEARN_MORE",
                  whatsappNumber: payload.whatsappNumber || payload.whatsappPhone,
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
              console.warn(`[MetaAdsService] Publish Ad ${ad.metaAdId} warning:`, e.message);
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
            console.warn(`[MetaAdsService] Publish AdSet ${adSet.metaAdSetId} warning:`, e.message);
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
          console.warn(`[MetaAdsService] Publish Campaign ${dbCampaign.metaCampaignId} warning:`, e.message);
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
   * Update Meta Campaign details
   */
  static async updateCampaign(organizationId: string, campaignId: string, data: any) {
    const config = await this.getConfig(organizationId);

    const dbCamp = await prisma.metaAdCampaign.findFirst({
      where: { id: campaignId, organizationId },
    });

    if (!dbCamp) {
      throw new Error("Campaign not found.");
    }

    if (config.accessToken && dbCamp.metaCampaignId && !dbCamp.metaCampaignId.startsWith("meta_camp_")) {
      try {
        const updatePayload: any = { access_token: config.accessToken };
        if (data.name) updatePayload.name = data.name;
        if (data.status) updatePayload.status = data.status;
        if (data.dailyBudget) updatePayload.daily_budget = Math.round(Number(data.dailyBudget) * 100);

        await axios.post(`${META_GRAPH_BASE}/${dbCamp.metaCampaignId}`, updatePayload);
      } catch (err: any) {
        console.warn("[MetaAdsService] Graph API update Campaign warning:", err.message);
      }
    }

    return prisma.metaAdCampaign.update({
      where: { id: campaignId },
      data: {
        name: data.name || dbCamp.name,
        status: data.status || dbCamp.status,
        dailyBudget: data.dailyBudget ? Number(data.dailyBudget) : dbCamp.dailyBudget,
      },
    });
  }

  /**
   * Update Meta Ad Set details
   */
  static async updateAdSet(organizationId: string, adSetId: string, data: any) {
    const config = await this.getConfig(organizationId);

    const dbAdSet = await prisma.metaAdSet.findFirst({
      where: { id: adSetId, organizationId },
    });

    if (!dbAdSet) {
      throw new Error("Ad Set not found.");
    }

    if (config.accessToken && dbAdSet.metaAdSetId && !dbAdSet.metaAdSetId.startsWith("meta_adset_")) {
      try {
        const updatePayload: any = { access_token: config.accessToken };
        if (data.name) updatePayload.name = data.name;
        if (data.status) updatePayload.status = data.status;
        if (data.dailyBudget) updatePayload.daily_budget = Math.round(Number(data.dailyBudget) * 100);

        await axios.post(`${META_GRAPH_BASE}/${dbAdSet.metaAdSetId}`, updatePayload);
      } catch (err: any) {
        console.warn("[MetaAdsService] Graph API update AdSet warning:", err.message);
      }
    }

    return prisma.metaAdSet.update({
      where: { id: adSetId },
      data: {
        name: data.name || dbAdSet.name,
        status: data.status || dbAdSet.status,
        dailyBudget: data.dailyBudget ? Number(data.dailyBudget) : dbAdSet.dailyBudget,
      },
    });
  }

  /**
   * Update Meta Ad details
   */
  static async updateAd(organizationId: string, adId: string, data: any) {
    const config = await this.getConfig(organizationId);

    const dbAd = await prisma.metaAd.findFirst({
      where: { id: adId, organizationId },
    });

    if (!dbAd) {
      throw new Error("Ad not found.");
    }

    if (config.accessToken && dbAd.metaAdId && !dbAd.metaAdId.startsWith("meta_ad_")) {
      try {
        const updatePayload: any = { access_token: config.accessToken };
        if (data.name) updatePayload.name = data.name;
        if (data.status) updatePayload.status = data.status;

        await axios.post(`${META_GRAPH_BASE}/${dbAd.metaAdId}`, updatePayload);
      } catch (err: any) {
        console.warn("[MetaAdsService] Graph API update Ad warning:", err.message);
      }
    }

    return prisma.metaAd.update({
      where: { id: adId },
      data: {
        name: data.name || dbAd.name,
        status: data.status || dbAd.status,
      },
    });
  }

  /**
   * Fetch Custom & Lookalike Audiences from Meta Graph API
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
      console.warn("[MetaAdsService] Failed to fetch Custom Audiences:", err.message);
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
      console.warn("[MetaAdsService] Failed fetching ad images:", e.message);
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
      console.warn("[MetaAdsService] Failed fetching ad videos:", e.message);
    }

    return { images, videos };
  }

  /**
   * Live Sync Campaigns & Ads from Meta Graph API
   */
  static async syncCampaigns(organizationId: string, adAccountIdOverride?: string) {
    const config = await this.getConfig(organizationId);

    if (!config.accessToken) {
      return { syncedCount: 0, message: "Meta Ads Access Token missing." };
    }

    const targetAccountIds: string[] = [];
    if (adAccountIdOverride) {
      targetAccountIds.push(adAccountIdOverride);
    } else if (config.adAccountId) {
      targetAccountIds.push(config.adAccountId);
    } else {
      try {
        const accResp = await axios.get(`${META_GRAPH_BASE}/me/adaccounts`, {
          params: {
            fields: "id,name,account_status",
            access_token: config.accessToken,
          },
        });
        const fetchedAccs = accResp.data?.data || [];
        for (const fa of fetchedAccs) {
          if (fa.id && !targetAccountIds.includes(fa.id)) {
            targetAccountIds.push(fa.id);
          }
        }
      } catch (accErr: any) {
        console.warn("[MetaAdsService] Discovered ad accounts fetch warning:", accErr.message);
      }
    }

    if (targetAccountIds.length === 0) {
      return { syncedCount: 0, message: "No accessible Ad Account found to sync." };
    }

    let syncedCount = 0;
    const validCampaignStatuses = ["ACTIVE", "PAUSED", "PENDING_REVIEW", "DISAPPROVED", "PREAPPROVED", "PENDING_BILLING_INFO", "IN_PROCESS", "WITH_ISSUES", "ARCHIVED", "DELETED"];

    for (const rawAccountId of targetAccountIds) {
      const formattedAccountId = rawAccountId.startsWith("act_") ? rawAccountId : `act_${rawAccountId}`;

      try {
        const campResp = await axios.get(`${META_GRAPH_BASE}/${formattedAccountId}/campaigns`, {
          params: {
            fields: "id,name,objective,status,effective_status,buying_type,daily_budget,lifetime_budget,special_ad_categories,adsets{id,name,status,optimization_goal,destination_type,daily_budget,lifetime_budget,ads{id,name,status,effective_status,ad_review_feedback,creative{id,name,title,body,image_url,call_to_action_type}}}",
            access_token: config.accessToken,
          },
        });

        const liveCamps = campResp.data?.data || [];

        for (const lc of liveCamps) {
          const rawStatus = (lc.effective_status || lc.status || "PAUSED").toUpperCase();
          const cleanStatus = validCampaignStatuses.includes(rawStatus) ? rawStatus : "PAUSED";

          await prisma.metaAdCampaign.upsert({
            where: {
              metaCampaignId: lc.id,
            },
            update: {
              name: lc.name,
              objective: lc.objective,
              status: cleanStatus,
              effectiveStatus: rawStatus,
              dailyBudget: lc.daily_budget ? Math.round(Number(lc.daily_budget) / 100) : 500,
              lifetimeBudget: lc.lifetime_budget ? Math.round(Number(lc.lifetime_budget) / 100) : null,
            },
            create: {
              organizationId,
              adAccountId: formattedAccountId,
              metaCampaignId: lc.id,
              name: lc.name,
              objective: lc.objective,
              status: cleanStatus,
              effectiveStatus: rawStatus,
              buyingType: lc.buying_type || "AUCTION",
              dailyBudget: lc.daily_budget ? Math.round(Number(lc.daily_budget) / 100) : 500,
              lifetimeBudget: lc.lifetime_budget ? Math.round(Number(lc.lifetime_budget) / 100) : null,
            },
          });

          syncedCount++;
        }
      } catch (err: any) {
        console.warn(`[MetaAdsService] Failed syncing ad account ${formattedAccountId}:`, err.message);
      }
    }

    return { syncedCount, message: `Successfully synced ${syncedCount} campaigns from Meta Graph API.` };
  }

  /**
   * Fetch all campaigns for an organization
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
   * Fetch single campaign by ID
   */
  static async getCampaignById(organizationId: string, campaignId: string) {
    return prisma.metaAdCampaign.findFirst({
      where: { id: campaignId, organizationId },
      include: {
        adSets: {
          include: {
            ads: true,
          },
        },
      },
    });
  }

  /**
   * Delete a campaign by ID
   */
  static async deleteCampaign(organizationId: string, campaignId: string) {
    const config = await this.getConfig(organizationId);

    const campaign = await prisma.metaAdCampaign.findFirst({
      where: { id: campaignId, organizationId },
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (config.accessToken && campaign.metaCampaignId && !campaign.metaCampaignId.startsWith("meta_camp_")) {
      try {
        await axios.delete(`${META_GRAPH_BASE}/${campaign.metaCampaignId}`, {
          params: { access_token: config.accessToken },
        });
      } catch (err: any) {
        console.warn("[MetaAdsService] Graph API delete error:", err.response?.data?.error?.message || err.message);
      }
    }

    return prisma.metaAdCampaign.delete({
      where: { id: campaignId },
    });
  }
}
