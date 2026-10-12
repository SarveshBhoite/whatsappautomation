import dotenv from "dotenv";
dotenv.config();

import { GoogleAdsService } from "./services/googleAdsService";
import axios from "axios";

async function verifyDataManagerSchema() {
  const orgId = "81f4041e-1171-4472-8565-44ddc2b20bf1";
  const cid = "6587355041";
  const { headers } = await GoogleAdsService.getAdsHeaders(orgId, cid);
  console.log("Got headers successfully.");

  // 1. Check data_link resource (Data Manager integrations & third-party data links)
  const qDataLink = `
    SELECT
      data_link.resource_name,
      data_link.data_link_id,
      data_link.type,
      data_link.status
    FROM data_link
    LIMIT 10
  `;
  try {
    const res = await axios.post(`https://googleads.googleapis.com/v24/customers/${cid}/googleAds:search`, { query: qDataLink }, { headers });
    console.log("data_link query success! Count:", res.data?.results?.length || 0);
    if (res.data?.results?.length) {
      console.log(JSON.stringify(res.data.results, null, 2));
    }
  } catch (e: any) {
    console.error("data_link query error:", JSON.stringify(e.response?.data || e.message, null, 2));
  }

  // 2. Check offline_conversion_upload_conversion_action_summary or offline conversion resources
  const qConversionAction = `
    SELECT
      conversion_action.id,
      conversion_action.name,
      conversion_action.type,
      conversion_action.status,
      conversion_action.category
    FROM conversion_action
    WHERE conversion_action.type IN ('UPLOAD_CLICKS', 'UPLOAD_CALLS', 'STORE_SALES_DIRECT_UPLOAD', 'WEBPAGE')
      AND conversion_action.status != 'REMOVED'
    LIMIT 10
  `;
  try {
    const res = await axios.post(`https://googleads.googleapis.com/v24/customers/${cid}/googleAds:search`, { query: qConversionAction }, { headers });
    console.log("conversion_action (upload/offline) query success! Count:", res.data?.results?.length || 0);
    if (res.data?.results?.length) {
      console.log(JSON.stringify(res.data.results, null, 2));
    }
  } catch (e: any) {
    console.error("conversion_action query error:", JSON.stringify(e.response?.data || e.message, null, 2));
  }

  // 3. Check offline_user_data_job
  const qUserDataJob = `
    SELECT
      offline_user_data_job.resource_name,
      offline_user_data_job.id,
      offline_user_data_job.type,
      offline_user_data_job.status,
      offline_user_data_job.failure_reason
    FROM offline_user_data_job
    LIMIT 10
  `;
  try {
    const res = await axios.post(`https://googleads.googleapis.com/v24/customers/${cid}/googleAds:search`, { query: qUserDataJob }, { headers });
    console.log("offline_user_data_job query success! Count:", res.data?.results?.length || 0);
    if (res.data?.results?.length) {
      console.log(JSON.stringify(res.data.results, null, 2));
    }
  } catch (e: any) {
    console.error("offline_user_data_job query error:", JSON.stringify(e.response?.data || e.message, null, 2));
  }
}

verifyDataManagerSchema().catch(console.error);
