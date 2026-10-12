import dotenv from "dotenv";
dotenv.config();

import { GoogleAdsService } from "./services/googleAdsService";
import axios from "axios";

async function verifyExperimentSchema() {
  const orgId = "81f4041e-1171-4472-8565-44ddc2b20bf1";
  const cid = "6587355041";
  const { headers } = await GoogleAdsService.getAdsHeaders(orgId, cid);
  console.log("Got headers successfully.");

  // 1. Check experiment resource query
  const qExp = `
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
    LIMIT 10
  `;
  try {
    const res = await axios.post(`https://googleads.googleapis.com/v24/customers/${cid}/googleAds:search`, { query: qExp }, { headers });
    console.log("Experiments query success! Count:", res.data?.results?.length || 0);
    if (res.data?.results?.length) {
      console.log(JSON.stringify(res.data.results, null, 2));
    }
  } catch (e: any) {
    console.error("Experiment query error:", JSON.stringify(e.response?.data || e.message, null, 2));
  }

  // 2. Check experiment_arm resource query
  const qArm = `
    SELECT
      experiment_arm.resource_name,
      experiment_arm.experiment,
      experiment_arm.name,
      experiment_arm.control,
      experiment_arm.campaigns,
      experiment_arm.traffic_split
    FROM experiment_arm
    LIMIT 10
  `;
  try {
    const res = await axios.post(`https://googleads.googleapis.com/v24/customers/${cid}/googleAds:search`, { query: qArm }, { headers });
    console.log("Experiment Arms query success! Count:", res.data?.results?.length || 0);
  } catch (e: any) {
    console.error("Experiment arm query error:", JSON.stringify(e.response?.data || e.message, null, 2));
  }
}

verifyExperimentSchema().catch(console.error);
