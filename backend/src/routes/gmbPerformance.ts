import { Router } from "express";
import prisma from "../utils/prisma";
import axios from "axios";
import { getGoogleAccessToken } from "../services/gmbSyncService";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

// Helper to format Date objects as YYYY-MM-DD strings
function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper to fetch GMB Performance data for a specific date range
async function fetchRangeData(
  numericLocationId: string,
  token: string,
  startDate: Date,
  endDate: Date
) {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;
  const startDay = startDate.getDate();

  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth() + 1;
  const endDay = endDate.getDate();

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
  
  const response = await axios.get(performanceUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  // Initialize timeline mapping with zeroed values
  const timelineMap: { [dateStr: string]: any } = {};
  const dateCursor = new Date(startDate);
  
  while (dateCursor <= endDate) {
    const dateStr = formatDateString(dateCursor);
    timelineMap[dateStr] = {
      date: dateStr,
      WEBSITE_CLICKS: 0,
      CALL_CLICKS: 0,
      BUSINESS_DIRECTION_REQUESTS: 0,
      BUSINESS_IMPRESSIONS_DESKTOP_MAPS: 0,
      BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: 0,
      BUSINESS_IMPRESSIONS_MOBILE_MAPS: 0,
      BUSINESS_IMPRESSIONS_MOBILE_SEARCH: 0,
      BUSINESS_CONVERSATIONS: 0,
      totalViews: 0,
      totalActions: 0
    };
    dateCursor.setDate(dateCursor.getDate() + 1);
  }

  const multiTimeSeries = response.data.multiDailyMetricTimeSeries || [];
  
  for (const item of multiTimeSeries) {
    const dailyMetricTimeSeries = item.dailyMetricTimeSeries || [];
    for (const series of dailyMetricTimeSeries) {
      const metricName = series.dailyMetric;
      const datedValues = series.timeSeries?.datedValues || [];
      
      for (const pt of datedValues) {
        if (!pt.date) continue;
        const y = pt.date.year;
        const m = String(pt.date.month).padStart(2, "0");
        const d = String(pt.date.day).padStart(2, "0");
        const dateStr = `${y}-${m}-${d}`;
        
        if (timelineMap[dateStr]) {
          timelineMap[dateStr][metricName] = Number(pt.value || 0);
        }
      }
    }
  }

  // Calculate daily aggregates
  const timeline = Object.values(timelineMap).map((day: any) => {
    const desktopSearch = day.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH || 0;
    const desktopMaps = day.BUSINESS_IMPRESSIONS_DESKTOP_MAPS || 0;
    const mobileSearch = day.BUSINESS_IMPRESSIONS_MOBILE_SEARCH || 0;
    const mobileMaps = day.BUSINESS_IMPRESSIONS_MOBILE_MAPS || 0;

    const website = day.WEBSITE_CLICKS || 0;
    const calls = day.CALL_CLICKS || 0;
    const directions = day.BUSINESS_DIRECTION_REQUESTS || 0;
    const chats = day.BUSINESS_CONVERSATIONS || 0;

    day.totalViews = desktopSearch + desktopMaps + mobileSearch + mobileMaps;
    day.totalActions = website + calls + directions + chats;

    return day;
  });

  timeline.sort((a, b) => a.date.localeCompare(b.date));

  // Compute overall summary sums
  const summary = {
    totalViews: timeline.reduce((sum, d) => sum + d.totalViews, 0),
    totalActions: timeline.reduce((sum, d) => sum + d.totalActions, 0),
    websiteClicks: timeline.reduce((sum, d) => sum + d.WEBSITE_CLICKS, 0),
    callClicks: timeline.reduce((sum, d) => sum + d.CALL_CLICKS, 0),
    directionsRequests: timeline.reduce((sum, d) => sum + d.BUSINESS_DIRECTION_REQUESTS, 0),
    conversations: timeline.reduce((sum, d) => sum + d.BUSINESS_CONVERSATIONS, 0),
    desktopViews: timeline.reduce((sum, d) => sum + d.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH + d.BUSINESS_IMPRESSIONS_DESKTOP_MAPS, 0),
    mobileViews: timeline.reduce((sum, d) => sum + d.BUSINESS_IMPRESSIONS_MOBILE_SEARCH + d.BUSINESS_IMPRESSIONS_MOBILE_MAPS, 0),
    searchViews: timeline.reduce((sum, d) => sum + d.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH + d.BUSINESS_IMPRESSIONS_MOBILE_SEARCH, 0),
    mapsViews: timeline.reduce((sum, d) => sum + d.BUSINESS_IMPRESSIONS_DESKTOP_MAPS + d.BUSINESS_IMPRESSIONS_MOBILE_MAPS, 0),
  };

  return { timeline, summary };
}

// Function to resolve month date boundaries
function getMonthRange(month: number, year: number, limitDate: Date) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const start = new Date(year, month - 1, 1);
  let end = new Date(year, month, 0); // Last day of month
  let label = `${monthNames[month - 1]} ${year}`;
  
  // If target month is current month, cap at the limitDate
  if (start.getFullYear() === limitDate.getFullYear() && start.getMonth() === limitDate.getMonth()) {
    end = limitDate;
    label = `${monthNames[month - 1]} ${year} (MTD)`;
  }
  
  return { start, end, label };
}

router.get("/", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;

    // Fetch configuration from database
    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    if (!config) {
      return res.status(404).json({ error: "Google Business Configuration not found." });
    }

    const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret || !config.googleRefreshToken || !config.googleLocationId) {
      return res.status(400).json({ error: "Google Business account is not authorized or Location ID is not configured." });
    }

    const numericLocationId = config.googleLocationId
      .replace(/accounts\/.*?\/locations\//, "")
      .replace("locations/", "")
      .trim();

    // Fetch fresh access token
    const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);

    const latestAvailableDate = new Date();
    latestAvailableDate.setDate(latestAvailableDate.getDate() - 3);

    // Resolve Period A params (defaults to current month)
    let aMonth = Number(req.query.aMonth || (latestAvailableDate.getMonth() + 1));
    let aYear = Number(req.query.aYear || latestAvailableDate.getFullYear());

    // Resolve Period B params (defaults to previous month)
    let bMonth = Number(req.query.bMonth);
    let bYear = Number(req.query.bYear);

    if (isNaN(bMonth) || isNaN(bYear)) {
      let prevM = latestAvailableDate.getMonth(); // previous month (0-indexed)
      let prevY = latestAvailableDate.getFullYear();
      if (prevM === 0) {
        prevM = 12;
        prevY -= 1;
      }
      bMonth = prevM;
      bYear = prevY;
    }

    // Resolve date ranges
    const rangeA = getMonthRange(aMonth, aYear, latestAvailableDate);
    const rangeB = getMonthRange(bMonth, bYear, latestAvailableDate);

    // Day Alignment: If either month is limited (e.g. June Month-to-Date is day 1-24),
    // we also cap the other compared month at day 24 to keep the comparisons mathematically fair.
    const aDays = rangeA.end.getDate();
    const bDays = rangeB.end.getDate();

    if (aDays !== bDays) {
      const minDays = Math.min(aDays, bDays);
      rangeA.end.setDate(minDays);
      rangeB.end.setDate(minDays);
    }

    console.log(`[GMB PERFORMANCE] Comparing Period A (${rangeA.label}: ${formatDateString(rangeA.start)} to ${formatDateString(rangeA.end)}) vs Period B (${rangeB.label}: ${formatDateString(rangeB.start)} to ${formatDateString(rangeB.end)})`);

    // Run queries in parallel
    const [dataA, dataB] = await Promise.all([
      fetchRangeData(numericLocationId, token, rangeA.start, rangeA.end),
      fetchRangeData(numericLocationId, token, rangeB.start, rangeB.end)
    ]);

    // Calculate Month-over-Month growth rates (Period A vs Period B)
    const getMoMGrowth = (curr: number, prev: number) => {
      if (prev === 0) {
        return curr > 0 ? "+100%" : "0%";
      }
      const pct = ((curr - prev) / prev) * 100;
      return pct >= 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
    };

    const growth = {
      totalViews: getMoMGrowth(dataA.summary.totalViews, dataB.summary.totalViews),
      totalActions: getMoMGrowth(dataA.summary.totalActions, dataB.summary.totalActions),
      websiteClicks: getMoMGrowth(dataA.summary.websiteClicks, dataB.summary.websiteClicks),
      callClicks: getMoMGrowth(dataA.summary.callClicks, dataB.summary.callClicks),
      directionsRequests: getMoMGrowth(dataA.summary.directionsRequests, dataB.summary.directionsRequests),
    };

    res.status(200).json({
      locationName: config.locationName || "Google Listing",
      googleLocationId: config.googleLocationId,
      range: {
        startDate: formatDateString(rangeA.start),
        endDate: formatDateString(rangeA.end),
        label: rangeA.label,
        previousLabel: rangeB.label
      },
      summary: dataA.summary,
      previousSummary: dataB.summary,
      growth,
      timeline: dataA.timeline // Return Period A's timeline for visual trends plotting
    });

  } catch (error: any) {
    console.error("GMB Performance Insights failed:", error?.response?.data || error.message);
    const apiError = error?.response?.data?.error?.message || error.message;
    res.status(error?.response?.status || 500).json({ error: apiError });
  }
});

export default router;
