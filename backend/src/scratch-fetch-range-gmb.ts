import prisma from "./utils/prisma";
import axios from "axios";
import { getGoogleAccessToken } from "./services/gmbSyncService";
import * as dotenv from "dotenv";

dotenv.config();

async function run() {
  const orgId = "demo-org-123";
  const startParam = process.argv[2] || "2026-05-01";
  const endParam = process.argv[3] || "2026-05-31";

  console.log(`[VERIFY GMB] Target Range: ${startParam} to ${endParam}`);

  const config = await prisma.googleBusinessConfig.findUnique({
    where: { organizationId: orgId }
  });

  if (!config) {
    console.error("No configuration found for demo-org-123.");
    process.exit(1);
  }

  const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || !config.googleRefreshToken || !config.googleLocationId) {
    console.error("GMB OAuth or Location credentials are incomplete.");
    process.exit(1);
  }

  // Parse start/end dates
  const startDate = new Date(startParam);
  const endDate = new Date(endParam);

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;
  const startDay = startDate.getDate();

  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth() + 1;
  const endDay = endDate.getDate();

  const numericLocationId = config.googleLocationId
    .replace(/accounts\/.*?\/locations\//, "")
    .replace("locations/", "")
    .trim();

  console.log(`[VERIFY GMB] Fetching token...`);
  const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);

  const params = new URLSearchParams();
  const metricsToQuery = [
    "WEBSITE_CLICKS",
    "CALL_CLICKS",
    "BUSINESS_DIRECTION_REQUESTS",
    "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
    "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
    "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
    "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
    "BUSINESS_CONVERSATIONS"
  ];

  metricsToQuery.forEach(m => params.append("dailyMetrics", m));
  
  params.append("dailyRange.start_date.year", startYear.toString());
  params.append("dailyRange.start_date.month", startMonth.toString());
  params.append("dailyRange.start_date.day", startDay.toString());
  
  params.append("dailyRange.end_date.year", endYear.toString());
  params.append("dailyRange.end_date.month", endMonth.toString());
  params.append("dailyRange.end_date.day", endDay.toString());

  const performanceUrl = `https://businessprofileperformance.googleapis.com/v1/locations/${numericLocationId}:fetchMultiDailyMetricsTimeSeries?${params.toString()}`;
  console.log(`[VERIFY GMB] Querying URL: ${performanceUrl}`);

  try {
    const response = await axios.get(performanceUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const multiTimeSeries = response.data.multiDailyMetricTimeSeries || [];
    
    // Accumulators
    const totals: { [metric: string]: number } = {};
    metricsToQuery.forEach(m => totals[m] = 0);

    for (const item of multiTimeSeries) {
      const dailyMetricTimeSeries = item.dailyMetricTimeSeries || [];
      for (const series of dailyMetricTimeSeries) {
        const metricName = series.dailyMetric;
        const datedValues = series.timeSeries?.datedValues || [];
        
        for (const pt of datedValues) {
          const val = Number(pt.value || 0);
          totals[metricName] = (totals[metricName] || 0) + val;
        }
      }
    }

    console.log("\n=================== GMB REAL STATS (API) ===================");
    console.log(`Location: ${config.locationName}`);
    console.log(`Range: ${startParam} to ${endParam}`);
    console.log("------------------------------------------------------------");
    console.log(`Website Clicks (WEBSITE_CLICKS):                 ${totals["WEBSITE_CLICKS"]}`);
    console.log(`Call button clicks (CALL_CLICKS):                 ${totals["CALL_CLICKS"]}`);
    console.log(`Direction Requests (BUSINESS_DIRECTION_REQUESTS): ${totals["BUSINESS_DIRECTION_REQUESTS"]}`);
    console.log(`Desktop Maps Impressions:                         ${totals["BUSINESS_IMPRESSIONS_DESKTOP_MAPS"]}`);
    console.log(`Desktop Search Impressions:                       ${totals["BUSINESS_IMPRESSIONS_DESKTOP_SEARCH"]}`);
    console.log(`Mobile Maps Impressions:                          ${totals["BUSINESS_IMPRESSIONS_MOBILE_MAPS"]}`);
    console.log(`Mobile Search Impressions:                        ${totals["BUSINESS_IMPRESSIONS_MOBILE_SEARCH"]}`);
    console.log(`Conversations (BUSINESS_CONVERSATIONS):           ${totals["BUSINESS_CONVERSATIONS"]}`);
    console.log("============================================================\n");

  } catch (error: any) {
    console.error("API call failed:", error?.response?.data || error.message);
  }
}

run();
