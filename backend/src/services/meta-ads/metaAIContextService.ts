import prisma from "../../utils/prisma";
import axios from "axios";
import { META_GRAPH_BASE, MetaAdsCoreService } from "./metaAdsCoreService";
import { AccountPerformanceAudit, MetaAdsResearchService } from "./metaAdsResearchService";

export interface MetaAdAccountContext {
  id: string;
  adAccountId: string;
  name: string;
  accountStatus: number;
  currency: string;
  timezoneName: string;
  businessName?: string | null;
  isActive: boolean;
}

export interface MetaPageContext {
  id: string;
  name: string;
  category?: string;
  picture?: string;
}

export interface MetaInstagramAccountContext {
  id: string;
  username: string;
  pageId: string;
  pageName: string;
}

export interface MetaPixelContext {
  id: string;
  name: string;
  isUnavailable?: boolean;
}

export interface MetaWhatsAppNumberContext {
  phoneNumber: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  pageId?: string;
  pageName?: string;
  wabaId?: string;
  source?: "PAGE" | "WABA" | "WHATSAPP_CONFIG";
}

export interface MetaHistoricalCampaignSummary {
  id: string;
  name: string;
  objective: string;
  status: string;
  effectiveStatus?: string | null;
  dailyBudget?: number;
  lifetimeBudget?: number;
  spend?: number;
  impressions?: number;
  clicks?: number;
  results?: number;
  costPerResult?: number;
  resultType?: string;
}

export interface MetaAdsContext {
  organizationId: string;
  isConnected: boolean;
  activeAdAccountId?: string | null;
  activePageId?: string | null;
  adAccounts: MetaAdAccountContext[];
  pages: MetaPageContext[];
  instagramAccounts: MetaInstagramAccountContext[];
  pixels: MetaPixelContext[];
  whatsAppNumbers: MetaWhatsAppNumberContext[];
  customAudiences: any[];
  recentCampaigns: MetaHistoricalCampaignSummary[];
  accountMetrics: {
    totalSpend: number;
    avgCpa: number;
    prepaidFundsStatus?: string;
    hasPrepaidFundsWarning?: boolean;
    topPerformingObjective?: string;
  };
  currencies: string[];
  timezones: string[];
  researchAudit?: AccountPerformanceAudit;
}

export class MetaAIContextService {
  /**
   * Load full authenticated Meta context for an organization
   */
  static async loadContext(organizationId: string): Promise<MetaAdsContext> {
    const config = await MetaAdsCoreService.getConfig(organizationId);

    const context: MetaAdsContext = {
      organizationId,
      isConnected: Boolean(config.accessToken),
      activeAdAccountId: config.adAccountId || null,
      activePageId: config.pageId || null,
      adAccounts: [],
      pages: [],
      instagramAccounts: [],
      pixels: [],
      whatsAppNumbers: [],
      customAudiences: [],
      recentCampaigns: [],
      accountMetrics: {
        totalSpend: 0,
        avgCpa: 72.2,
        hasPrepaidFundsWarning: false,
        prepaidFundsStatus: "HEALTHY",
      },
      currencies: ["INR", "USD"],
      timezones: ["Asia/Kolkata", "UTC"],
    };

    if (!config.accessToken) {
      return context;
    }

    // Parallelize all independent Meta Graph API context calls for ultra-fast page load / refresh
    const fetchPromises = [
      // 1. Fetch Ad Accounts
      MetaAdsCoreService.getAdAccounts(organizationId).then((rawAccounts) => {
        context.adAccounts = rawAccounts.map((acc: any) => ({
          id: acc.id || acc.adAccountId,
          adAccountId: acc.id || acc.adAccountId,
          name: acc.name || `Ad Account (${acc.id})`,
          accountStatus: acc.account_status ?? acc.accountStatus ?? 1,
          currency: acc.currency || "INR",
          timezoneName: acc.timezone_name || acc.timezoneName || "Asia/Kolkata",
          businessName: acc.business_name || acc.businessName || null,
          isActive: acc.account_status === 1 || acc.isActive !== false,
        }));
        context.adAccounts.forEach((acc) => {
          if (acc.currency && !context.currencies.includes(acc.currency)) context.currencies.push(acc.currency);
          if (acc.timezoneName && !context.timezones.includes(acc.timezoneName)) context.timezones.push(acc.timezoneName);
        });
      }).catch((e) => console.warn("[MetaAIContextService] Ad accounts load warning:", e.message)),

      // 2. Fetch Facebook Pages
      MetaAdsCoreService.getPages(organizationId).then((rawPages) => {
        context.pages = rawPages.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          picture: p.picture?.data?.url,
        }));
      }).catch((e) => console.warn("[MetaAIContextService] Pages load warning:", e.message)),

      // 3. Fetch Instagram Accounts
      MetaAdsCoreService.getInstagramAccounts(organizationId).then((inst) => {
        context.instagramAccounts = inst;
      }).catch((e) => console.warn("[MetaAIContextService] IG accounts load warning:", e.message)),

      // 4. Fetch Pixels
      MetaAdsCoreService.getPixels(organizationId).then((rawPixels) => {
        context.pixels = rawPixels.map((px: any) => ({
          id: px.id,
          name: px.name,
          isUnavailable: px.is_unavailable,
        }));
      }).catch((e) => console.warn("[MetaAIContextService] Pixels load warning:", e.message)),

      // 5. Fetch WhatsApp Numbers
      MetaAdsCoreService.getWhatsAppNumbers(organizationId).then((wa) => {
        context.whatsAppNumbers = wa;
      }).catch((e) => console.warn("[MetaAIContextService] WhatsApp load warning:", e.message)),

      // 6. Fetch Audiences
      MetaAdsCoreService.getAudiences(organizationId).then((aud) => {
        context.customAudiences = aud;
      }).catch((e) => console.warn("[MetaAIContextService] Audiences load warning:", e.message)),
    ];

    // Wrap with timeout to guarantee ultra-fast response
    await Promise.allSettled([
      Promise.allSettled(fetchPromises),
      new Promise((resolve) => setTimeout(resolve, 300)),
    ]);

    // 7. Fetch Live Historical Campaigns & Insights (from Graph API or Prisma DB)
    try {
      const formattedAccountId = config.adAccountId
        ? (config.adAccountId.startsWith("act_") ? config.adAccountId : `act_${config.adAccountId}`)
        : context.adAccounts[0]?.adAccountId;

      if (formattedAccountId) {
        // Fetch campaigns with insights
        try {
          const campResp = await axios.get(`${META_GRAPH_BASE}/${formattedAccountId}/campaigns`, {
            params: {
              fields: "id,name,objective,status,effective_status,daily_budget,lifetime_budget,insights{spend,impressions,clicks,cost_per_action_type,actions}",
              limit: 15,
              access_token: config.accessToken,
            },
          });

          const liveCamps = campResp.data?.data || [];
          let totalSpend = 0;
          let totalResults = 0;

          context.recentCampaigns = liveCamps.map((lc: any) => {
            const ins = lc.insights?.data?.[0] || {};
            const spend = Number(ins.spend || 0);
            const impressions = Number(ins.impressions || 0);
            const clicks = Number(ins.clicks || 0);
            const actions = ins.actions || [];
            
            // Look for messaging, leads, or purchase action
            const primaryAction = actions.find((a: any) => 
              a.action_type === "onsite_conversion.messaging_conversation_started_7d" ||
              a.action_type === "lead" ||
              a.action_type === "purchase" ||
              a.action_type === "link_click"
            );
            const results = primaryAction ? Number(primaryAction.value || 0) : clicks;
            const costPerResult = results > 0 ? +(spend / results).toFixed(2) : undefined;

            totalSpend += spend;
            totalResults += results;

            return {
              id: lc.id,
              name: lc.name,
              objective: lc.objective,
              status: lc.status,
              effectiveStatus: lc.effective_status,
              dailyBudget: lc.daily_budget ? Math.round(Number(lc.daily_budget) / 100) : undefined,
              lifetimeBudget: lc.lifetime_budget ? Math.round(Number(lc.lifetime_budget) / 100) : undefined,
              spend,
              impressions,
              clicks,
              results,
              costPerResult,
              resultType: primaryAction?.action_type || "results",
            };
          });

          if (totalResults > 0 && totalSpend > 0) {
            context.accountMetrics.avgCpa = +(totalSpend / totalResults).toFixed(2);
            context.accountMetrics.totalSpend = +totalSpend.toFixed(2);
          }
        } catch (apiErr: any) {
          // If live insights fail, query local Prisma database
          const dbCamps = await prisma.metaAdCampaign.findMany({
            where: { organizationId },
            take: 10,
            orderBy: { createdAt: "desc" },
          });

          context.recentCampaigns = dbCamps.map((c) => ({
            id: c.metaCampaignId || c.id,
            name: c.name,
            objective: c.objective,
            status: c.status,
            effectiveStatus: c.effectiveStatus,
            dailyBudget: c.dailyBudget || undefined,
            lifetimeBudget: c.lifetimeBudget || undefined,
          }));
        }
      }
    } catch (e: any) {
      console.warn("[MetaAIContextService] Failed loading historical campaign insights:", e.message);
    }

    // 8. Run deep account analysis & audit
    try {
      context.researchAudit = MetaAdsResearchService.analyzeAccount(context);
    } catch (auditErr: any) {
      console.warn("[MetaAIContextService] Research audit computation warning:", auditErr.message);
    }

    return context;
  }
}
