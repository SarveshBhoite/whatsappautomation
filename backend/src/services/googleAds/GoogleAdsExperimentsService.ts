import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface ExperimentFilters {
  status?: string;
  limit?: number;
}

export interface CreateExperimentParams {
  name: string;
  description?: string;
  suffix?: string;
  type?: "SEARCH_CUSTOM" | "DISPLAY_CUSTOM" | "VIDEO_CUSTOM" | "APP_CUSTOM" | string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  campaignId?: string; // Base campaign to associate
  trafficSplitPercent?: number; // e.g. 50
}

export class GoogleAdsExperimentsService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. LIST EXPERIMENTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists experiments for the given customer using Google Ads API v24.
   * Also fetches associated experiment arms and base campaigns.
   */
  public static async listExperiments(
    organizationId: string,
    customerId: string,
    filters: ExperimentFilters = {}
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const limit = filters.limit ? Math.min(filters.limit, 100) : 50;

    let whereClause = "";
    if (filters.status && filters.status !== "ALL") {
      whereClause = `WHERE experiment.status = '${filters.status.toUpperCase()}'`;
    }

    const gaql = `
      SELECT
        experiment.resource_name,
        experiment.experiment_id,
        experiment.name,
        experiment.description,
        experiment.suffix,
        experiment.type,
        experiment.status,
        experiment.start_date,
        experiment.end_date,
        experiment.goals
      FROM experiment
      ${whereClause}
      ORDER BY experiment.experiment_id DESC
      LIMIT ${limit}
    `;

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: gaql },
        { headers }
      );

      const rows = res.data?.results || [];

      // Query experiment arms to get base campaign and traffic split
      let armsMap = new Map<string, any[]>();
      try {
        const armsGaql = `
          SELECT
            experiment_arm.resource_name,
            experiment_arm.experiment,
            experiment_arm.name,
            experiment_arm.control,
            experiment_arm.campaigns,
            experiment_arm.traffic_split
          FROM experiment_arm
          LIMIT 100
        `;
        const armsRes = await axios.post(
          `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
          { query: armsGaql },
          { headers }
        );
        const armRows = armsRes.data?.results || [];
        for (const ar of armRows) {
          const arm = ar.experimentArm;
          if (arm?.experiment) {
            const expRef = arm.experiment;
            if (!armsMap.has(expRef)) {
              armsMap.set(expRef, []);
            }
            armsMap.get(expRef)?.push({
              resourceName: arm.resourceName,
              name: arm.name,
              isControl: Boolean(arm.control),
              campaigns: arm.campaigns || [],
              trafficSplit: arm.trafficSplit ? Number(arm.trafficSplit) : 50
            });
          }
        }
      } catch (armErr: any) {
        console.warn("[GoogleAdsExperimentsService] Notice querying experiment_arm:", armErr.message);
      }

      const experiments = rows.map((r: any) => {
        const exp = r.experiment || {};
        const arms = armsMap.get(exp.resourceName) || [];
        const controlArm = arms.find((a: any) => a.isControl);
        const trialArm = arms.find((a: any) => !a.isControl);

        const baseCampaigns = controlArm?.campaigns || [];
        const trafficSplit = trialArm?.trafficSplit || controlArm?.trafficSplit || 50;

        return {
          id: String(exp.experimentId || exp.resourceName?.split("/").pop() || ""),
          resourceName: exp.resourceName,
          name: exp.name || "Untitled Experiment",
          description: exp.description || "",
          suffix: exp.suffix || "",
          type: exp.type || "SEARCH_CUSTOM",
          status: exp.status || "SETUP",
          startDate: exp.startDate || "—",
          endDate: exp.endDate || "—",
          trafficSplitPercent: trafficSplit,
          arms,
          baseCampaignResource: baseCampaigns[0] || null,
          baseCampaignId: baseCampaigns[0] ? baseCampaigns[0].split("/").pop() : null
        };
      });

      return {
        success: true,
        items: experiments,
        total: experiments.length
      };
    } catch (err: any) {
      console.error("[GoogleAdsExperimentsService.listExperiments] error:", err?.response?.data || err.message);
      throw new Error(`Google Ads Experiments query error: ${err?.response?.data?.error?.message || err.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. CREATE EXPERIMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Creates a new experiment using Google Ads API v24 experiments:mutate.
   * If a baseCampaignId is provided, also creates the control and trial experiment arms.
   */
  public static async createExperiment(
    organizationId: string,
    customerId: string,
    params: CreateExperimentParams
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    if (!params.name || !params.name.trim()) {
      throw new Error("Experiment name is required.");
    }

    const experimentPayload: any = {
      name: params.name.trim(),
      type: params.type || "SEARCH_CUSTOM",
      status: "SETUP"
    };

    if (params.description) experimentPayload.description = params.description.trim();
    if (params.suffix) experimentPayload.suffix = params.suffix.trim();
    if (params.startDate) experimentPayload.startDate = params.startDate;
    if (params.endDate) experimentPayload.endDate = params.endDate;

    try {
      const expRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/experiments:mutate`,
        {
          operations: [
            {
              create: experimentPayload
            }
          ]
        },
        { headers }
      );

      const expResourceName = expRes.data?.results?.[0]?.resourceName;
      if (!expResourceName) {
        throw new Error("Failed to retrieve created experiment resource name from Google Ads.");
      }

      // If baseCampaignId is provided, configure the control arm & trial arm
      if (params.campaignId) {
        const cleanCampId = params.campaignId.replace(/[^0-9]/g, "");
        const campResource = `customers/${cid}/campaigns/${cleanCampId}`;
        const split = params.trafficSplitPercent || 50;

        try {
          await axios.post(
            `${this.ADS_BASE}/customers/${cid}/experimentArms:mutate`,
            {
              operations: [
                {
                  create: {
                    experiment: expResourceName,
                    name: `${params.name.trim()} - Control`,
                    control: true,
                    campaigns: [campResource],
                    trafficSplit: 100 - split
                  }
                },
                {
                  create: {
                    experiment: expResourceName,
                    name: `${params.name.trim()} - Treatment`,
                    control: false,
                    trafficSplit: split
                  }
                }
              ]
            },
            { headers }
          );
        } catch (armErr: any) {
          console.warn("[GoogleAdsExperimentsService] Experiment arm setup warning:", armErr?.response?.data || armErr.message);
          // Return the experiment anyway so the user can inspect it
        }
      }

      return {
        success: true,
        resourceName: expResourceName,
        id: expResourceName.split("/").pop()
      };
    } catch (err: any) {
      console.error("[GoogleAdsExperimentsService.createExperiment] error:", err?.response?.data || err.message);
      const errMsg = err?.response?.data?.error?.message || err.message;
      throw new Error(`Google Ads Experiment creation error: ${errMsg}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SCHEDULE / PROMOTE / END EXPERIMENT (Lifecycle Operations)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Schedules (starts) an experiment that is in SETUP or INITIALIZING state using experiments:scheduleExperiment.
   */
  public static async scheduleExperiment(
    organizationId: string,
    customerId: string,
    resourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/${resourceName}:scheduleExperiment`,
        {},
        { headers }
      );
      return { success: true, result: res.data };
    } catch (err: any) {
      console.error("[GoogleAdsExperimentsService.scheduleExperiment] error:", err?.response?.data || err.message);
      throw new Error(`Schedule experiment error: ${err?.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * Promotes / applies an experiment trial arm changes to base campaign using experiments:promoteExperiment.
   */
  public static async promoteExperiment(
    organizationId: string,
    customerId: string,
    resourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/${resourceName}:promoteExperiment`,
        {},
        { headers }
      );
      return { success: true, result: res.data };
    } catch (err: any) {
      console.error("[GoogleAdsExperimentsService.promoteExperiment] error:", err?.response?.data || err.message);
      throw new Error(`Promote experiment error: ${err?.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * Ends an active experiment using experiments:endExperiment.
   */
  public static async endExperiment(
    organizationId: string,
    customerId: string,
    resourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/${resourceName}:endExperiment`,
        {},
        { headers }
      );
      return { success: true, result: res.data };
    } catch (err: any) {
      console.error("[GoogleAdsExperimentsService.endExperiment] error:", err?.response?.data || err.message);
      throw new Error(`End experiment error: ${err?.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * Removes / deletes an experiment using experiments:mutate remove operation.
   */
  public static async removeExperiment(
    organizationId: string,
    customerId: string,
    resourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/experiments:mutate`,
        {
          operations: [
            {
              remove: resourceName
            }
          ]
        },
        { headers }
      );
      return { success: true, result: res.data };
    } catch (err: any) {
      console.error("[GoogleAdsExperimentsService.removeExperiment] error:", err?.response?.data || err.message);
      throw new Error(`Remove experiment error: ${err?.response?.data?.error?.message || err.message}`);
    }
  }
}
