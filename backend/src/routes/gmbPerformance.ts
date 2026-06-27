import { Router } from "express";
import prisma from "../utils/prisma";
import axios from "axios";
import { getGoogleAccessToken, getGmbLocationPath } from "../services/gmbSyncService";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

// Helper to format Date objects as YYYY-MM-DD strings
function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

router.get("/", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;

    // Fetch Google Configuration from database
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

    // Google Performance API usually has a 3-day data latency. 
    // Google Performance API usually has a 3-day data latency. 
    // We calculate calendar Month-to-Date (MTD) comparison:
    // Current MTD: 1st of current month to 3 days ago.
    // Previous MTD: 1st of previous month to the equivalent day of previous month.
    const now = new Date();
    const latestAvailableDate = new Date();
    latestAvailableDate.setDate(now.getDate() - 3);

    const currentYear = latestAvailableDate.getFullYear();
    const currentMonth = latestAvailableDate.getMonth(); // 0-indexed

    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = latestAvailableDate;

    // Previous calendar month
    let previousYear = currentYear;
    let previousMonth = currentMonth - 1;
    if (previousMonth < 0) {
      previousMonth = 11;
      previousYear -= 1;
    }

    const previousMonthStart = new Date(previousYear, previousMonth, 1);
    const dayOfMonth = latestAvailableDate.getDate();
    const previousMonthEnd = new Date(previousYear, previousMonth, dayOfMonth);

    // If previous month has fewer days, cap at the last day of that month
    const lastDayOfPrevMonth = new Date(previousYear, previousMonth + 1, 0).getDate();
    if (previousMonthEnd.getDate() !== dayOfMonth || previousMonthEnd.getMonth() !== previousMonth) {
      previousMonthEnd.setDate(lastDayOfPrevMonth);
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const currentMonthName = monthNames[currentMonth];
    const previousMonthName = monthNames[previousMonth];

    // Fetch from start of previous month to end of current month
    const startYear = previousMonthStart.getFullYear();
    const startMonth = previousMonthStart.getMonth() + 1;
    const startDay = previousMonthStart.getDate();

    const endYear = currentMonthEnd.getFullYear();
    const endMonth = currentMonthEnd.getMonth() + 1;
    const endDay = currentMonthEnd.getDate();

    // Clean up location ID to extract numeric listing ID
    const rawLocId = config.googleLocationId;
    const numericLocationId = rawLocId.replace(/accounts\/.*?\/locations\//, "").replace("locations/", "").trim();

    // Fetch fresh access token
    const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);

    // Build query params for fetchMultiDailyMetricsTimeSeries
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
    
    // Add start date parts
    params.append("dailyRange.start_date.year", startYear.toString());
    params.append("dailyRange.start_date.month", startMonth.toString());
    params.append("dailyRange.start_date.day", startDay.toString());
    
    // Add end date parts
    params.append("dailyRange.end_date.year", endYear.toString());
    params.append("dailyRange.end_date.month", endMonth.toString());
    params.append("dailyRange.end_date.day", endDay.toString());

    const performanceUrl = `https://businessprofileperformance.googleapis.com/v1/locations/${numericLocationId}:fetchMultiDailyMetricsTimeSeries?${params.toString()}`;
    console.log(`[GMB PERFORMANCE] Querying API: ${performanceUrl}`);

    const response = await axios.get(performanceUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Initialize our parsed timeline records with zeroes
    const timelineMap: { [dateStr: string]: any } = {};
    const dateCursor = new Date(previousMonthStart);
    
    while (dateCursor <= currentMonthEnd) {
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

    // Populate timeline map with real data from Google
    const multiTimeSeries = response.data.multiDailyMetricTimeSeries || [];
    
    for (const item of multiTimeSeries) {
      const dailyMetricTimeSeries = item.dailyMetricTimeSeries || [];
      for (const series of dailyMetricTimeSeries) {
        const metricName = series.dailyMetric; // e.g. "WEBSITE_CLICKS"
        const datedValues = series.timeSeries?.datedValues || [];
        
        for (const pt of datedValues) {
          if (!pt.date) continue;
          
          const y = pt.date.year;
          const m = String(pt.date.month).padStart(2, "0");
          const d = String(pt.date.day).padStart(2, "0");
          const dateStr = `${y}-${m}-${d}`;
          
          if (timelineMap[dateStr]) {
            const val = Number(pt.value || 0);
            timelineMap[dateStr][metricName] = val;
          }
        }
      }
    }

    // Calculate dynamic aggregates (Total Views, Total Actions) for each day
    const parsedTimeline = Object.values(timelineMap).map((day: any) => {
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

    // Sort parsed timeline by date asc
    parsedTimeline.sort((a, b) => a.date.localeCompare(b.date));

    // Filter timeline into MTD segments
    const formatCompare = (d: Date) => formatDateString(d);
    
    const previousMtdTimeline = parsedTimeline.filter(d => 
      d.date >= formatCompare(previousMonthStart) && d.date <= formatCompare(previousMonthEnd)
    );
    
    const currentMtdTimeline = parsedTimeline.filter(d => 
      d.date >= formatCompare(currentMonthStart) && d.date <= formatCompare(currentMonthEnd)
    );

    // Calculate aggregates for current Month-to-Date
    const summary = {
      totalViews: currentMtdTimeline.reduce((sum, d) => sum + d.totalViews, 0),
      totalActions: currentMtdTimeline.reduce((sum, d) => sum + d.totalActions, 0),
      websiteClicks: currentMtdTimeline.reduce((sum, d) => sum + d.WEBSITE_CLICKS, 0),
      callClicks: currentMtdTimeline.reduce((sum, d) => sum + d.CALL_CLICKS, 0),
      directionsRequests: currentMtdTimeline.reduce((sum, d) => sum + d.BUSINESS_DIRECTION_REQUESTS, 0),
      conversations: currentMtdTimeline.reduce((sum, d) => sum + d.BUSINESS_CONVERSATIONS, 0),
      desktopViews: currentMtdTimeline.reduce((sum, d) => sum + d.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH + d.BUSINESS_IMPRESSIONS_DESKTOP_MAPS, 0),
      mobileViews: currentMtdTimeline.reduce((sum, d) => sum + d.BUSINESS_IMPRESSIONS_MOBILE_SEARCH + d.BUSINESS_IMPRESSIONS_MOBILE_MAPS, 0),
      searchViews: currentMtdTimeline.reduce((sum, d) => sum + d.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH + d.BUSINESS_IMPRESSIONS_MOBILE_SEARCH, 0),
      mapsViews: currentMtdTimeline.reduce((sum, d) => sum + d.BUSINESS_IMPRESSIONS_DESKTOP_MAPS + d.BUSINESS_IMPRESSIONS_MOBILE_MAPS, 0),
    };

    // Calculate aggregates for previous Month-to-Date equivalent
    const previousSummary = {
      totalViews: previousMtdTimeline.reduce((sum, d) => sum + d.totalViews, 0),
      websiteClicks: previousMtdTimeline.reduce((sum, d) => sum + d.WEBSITE_CLICKS, 0),
      callClicks: previousMtdTimeline.reduce((sum, d) => sum + d.CALL_CLICKS, 0),
      directionsRequests: previousMtdTimeline.reduce((sum, d) => sum + d.BUSINESS_DIRECTION_REQUESTS, 0),
    };

    // Calculate Month-over-Month growth rates (Current MTD vs Previous MTD)
    const getMoMGrowth = (curr: number, prev: number) => {
      if (prev === 0) {
        return curr > 0 ? "+100%" : "0%";
      }
      const pct = ((curr - prev) / prev) * 100;
      return pct >= 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
    };

    const growth = {
      totalViews: getMoMGrowth(summary.totalViews, previousSummary.totalViews),
      websiteClicks: getMoMGrowth(summary.websiteClicks, previousSummary.websiteClicks),
      callClicks: getMoMGrowth(summary.callClicks, previousSummary.callClicks),
      directionsRequests: getMoMGrowth(summary.directionsRequests, previousSummary.directionsRequests),
    };

    res.status(200).json({
      locationName: config.locationName || "Google Listing",
      googleLocationId: config.googleLocationId,
      range: {
        startDate: formatCompare(currentMonthStart),
        endDate: formatCompare(currentMonthEnd),
        label: `${currentMonthName} Month-to-Date`,
        previousLabel: `${previousMonthName} MTD Comparison`
      },
      summary,
      growth,
      timeline: currentMtdTimeline // Plot exactly the current month's timeline on the chart
    });
  } catch (error: any) {
    console.error("GMB Performance Insights failed:", error?.response?.data || error.message);
    const apiError = error?.response?.data?.error?.message || error.message;
    res.status(error?.response?.status || 500).json({ error: apiError });
  }
});

export default router;
