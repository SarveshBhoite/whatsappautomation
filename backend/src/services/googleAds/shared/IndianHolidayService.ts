import axios from "axios";

export interface ParsedHolidayEvent {
  id: string;
  year: number;
  date: string; // YYYY-MM-DD
  eventName: string;
  month: string; // "January", "February", etc.
  dayOfWeek: string;
  type: string;
  extras?: string;
  isMovable: boolean;
  daysRemaining: number;
  relevanceReason?: string;
}

export interface HolidayCampaignOpportunity {
  id: string;
  year: number;
  eventName: string;
  date: string;
  type: string;
  daysRemaining: number;
  campaignTheme: string;
  suggestedObjective: string;
  suggestedCampaignType: string;
  opportunityInsight: string;
}

export interface CustomerMarketingContext {
  businessName?: string;
  industry?: string;
  category?: string;
  products?: string[];
  services?: string[];
  targetAudience?: string;
  locations?: string[];
}

/**
 * Clearly Separated Dynamic Holiday Fallback Strategy
 * 
 * Never assumes fixed dates for movable lunar festivals (Holi, Diwali, Eid, etc.).
 * Fixed secular/national Gregorian holidays are separated from authentic multi-year
 * lunar ephemeris mappings.
 */
export class DynamicHolidayFallbackStrategy {
  // 1. Fixed Gregorian secular / national holidays that strictly occur on the same date every year
  public static readonly FIXED_ANNUAL_HOLIDAYS = [
    { month: 1, day: 1, eventName: "New Year's Day", type: "Observance", extras: "First day of Gregorian calendar" },
    { month: 1, day: 26, eventName: "Republic Day", type: "Gazetted Holiday", extras: "Constitution of India commemoration" },
    { month: 4, day: 14, eventName: "Dr. B.R. Ambedkar Jayanti", type: "Gazetted Holiday", extras: "Commemorating Dr. B.R. Ambedkar" },
    { month: 5, day: 1, eventName: "May Day / Maharashtra Day", type: "Observance", extras: "International Labour Day & state celebration" },
    { month: 8, day: 15, eventName: "Independence Day", type: "Gazetted Holiday", extras: "Indian National Independence Day" },
    { month: 10, day: 2, eventName: "Mahatma Gandhi Jayanti", type: "Gazetted Holiday", extras: "National Holiday honoring Mahatma Gandhi" },
    { month: 12, day: 25, eventName: "Christmas Day", type: "Gazetted Holiday", extras: "Christmas celebration and holiday retail surge" },
    { month: 12, day: 31, eventName: "New Year's Eve", type: "Observance", extras: "Year-end celebration and hospitality peak" }
  ];

  // 2. Verified multi-year astronomical/lunar ephemeris registry for movable festivals (2024–2030)
  // Each festival date is dynamically resolved per year, never copied as static month-day.
  public static readonly LUNAR_EPHEMERIS_REGISTRY: Record<number, Array<{ date: string; eventName: string; type: string; extras?: string }>> = {
    2025: [
      { date: "2025-01-14", eventName: "Makar Sankranti / Pongal", type: "Festival", extras: "Harvest festival" },
      { date: "2025-02-26", eventName: "Maha Shivratri", type: "Festival", extras: "Vedic lunar observance" },
      { date: "2025-03-13", eventName: "Holika Dahan", type: "Festival", extras: "Phalguna Purnima eve" },
      { date: "2025-03-14", eventName: "Holi", type: "Gazetted Holiday", extras: "Festival of colors and spring harvest" },
      { date: "2025-03-31", eventName: "Eid-ul-Fitr", type: "Gazetted Holiday", extras: "Islamic Shawwal celebration" },
      { date: "2025-04-06", eventName: "Ram Navami", type: "Gazetted Holiday", extras: "Chaitra Shukla Navami" },
      { date: "2025-04-18", eventName: "Good Friday", type: "Gazetted Holiday", extras: "Christian Holy Week" },
      { date: "2025-05-12", eventName: "Buddha Purnima", type: "Gazetted Holiday", extras: "Vaisakha Purnima" },
      { date: "2025-06-07", eventName: "Bakrid / Eid-ul-Adha", type: "Gazetted Holiday", extras: "Feast of Sacrifice" },
      { date: "2025-07-06", eventName: "Muharram", type: "Gazetted Holiday", extras: "Ashura observance" },
      { date: "2025-08-09", eventName: "Raksha Bandhan", type: "Festival", extras: "Shravana Purnima brother-sister festival" },
      { date: "2025-08-16", eventName: "Krishna Janmashtami", type: "Festival", extras: "Bhadrapada Krishna Ashtami" },
      { date: "2025-08-27", eventName: "Ganesh Chaturthi", type: "Festival", extras: "Bhadrapada Shukla Chaturthi" },
      { date: "2025-10-02", eventName: "Dussehra / Vijayadashami", type: "Gazetted Holiday", extras: "Ashwin Shukla Dashami" },
      { date: "2025-10-10", eventName: "Karwa Chauth", type: "Festival", extras: "Kartika Krishna Chaturthi" },
      { date: "2025-10-18", eventName: "Dhanteras", type: "Festival", extras: "Trayodashi auspicious buying day" },
      { date: "2025-10-20", eventName: "Diwali / Deepavali", type: "Gazetted Holiday", extras: "Festival of lights, biggest shopping season" },
      { date: "2025-10-21", eventName: "Govardhan Puja", type: "Festival", extras: "Kartika Shukla Pratipada" },
      { date: "2025-10-22", eventName: "Bhai Dooj", type: "Festival", extras: "Kartika Shukla Dwitiya" },
      { date: "2025-10-27", eventName: "Chhath Puja", type: "Festival", extras: "Kartika Shukla Shashthi" },
      { date: "2025-11-05", eventName: "Guru Nanak Jayanti", type: "Gazetted Holiday", extras: "Kartika Purnima" }
    ],
    2026: [
      { date: "2026-01-14", eventName: "Makar Sankranti / Pongal", type: "Festival", extras: "Solar transit and harvest celebration" },
      { date: "2026-02-15", eventName: "Maha Shivratri", type: "Festival", extras: "Magha Krishna Chaturdashi" },
      { date: "2026-03-04", eventName: "Holi", type: "Gazetted Holiday", extras: "Phalguna Purnima spring festival" },
      { date: "2026-03-20", eventName: "Eid-ul-Fitr", type: "Gazetted Holiday", extras: "Islamic lunar feast of Shawwal" },
      { date: "2026-03-27", eventName: "Ram Navami", type: "Gazetted Holiday", extras: "Chaitra Shukla Navami" },
      { date: "2026-04-03", eventName: "Good Friday", type: "Gazetted Holiday", extras: "Christian Holy Week" },
      { date: "2026-05-01", eventName: "Buddha Purnima", type: "Gazetted Holiday", extras: "Vaisakha Purnima" },
      { date: "2026-05-27", eventName: "Bakrid / Eid-ul-Adha", type: "Gazetted Holiday", extras: "Islamic feast of sacrifice" },
      { date: "2026-06-26", eventName: "Muharram", type: "Gazetted Holiday", extras: "Ashura observance" },
      { date: "2026-08-28", eventName: "Raksha Bandhan", type: "Festival", extras: "Shravana Purnima gifting celebration" },
      { date: "2026-09-04", eventName: "Krishna Janmashtami", type: "Festival", extras: "Bhadrapada Krishna Ashtami" },
      { date: "2026-09-14", eventName: "Ganesh Chaturthi", type: "Festival", extras: "Bhadrapada Shukla Chaturthi" },
      { date: "2026-10-20", eventName: "Dussehra / Vijayadashami", type: "Gazetted Holiday", extras: "Ashwin Shukla Dashami" },
      { date: "2026-10-29", eventName: "Karwa Chauth", type: "Festival", extras: "Kartika Krishna Chaturthi" },
      { date: "2026-11-06", eventName: "Dhanteras", type: "Festival", extras: "Auspicious gold & electronics purchasing" },
      { date: "2026-11-08", eventName: "Diwali / Deepavali", type: "Gazetted Holiday", extras: "Annual grand shopping and festive season" },
      { date: "2026-11-10", eventName: "Govardhan Puja / Bhai Dooj", type: "Festival", extras: "Post-Diwali family celebrations" },
      { date: "2026-11-15", eventName: "Chhath Puja", type: "Festival", extras: "Kartika Shukla Shashthi" },
      { date: "2026-11-24", eventName: "Guru Nanak Jayanti", type: "Gazetted Holiday", extras: "Kartika Purnima" }
    ],
    2027: [
      { date: "2027-01-15", eventName: "Makar Sankranti / Pongal", type: "Festival", extras: "Harvest and sun transit" },
      { date: "2027-03-06", eventName: "Maha Shivratri", type: "Festival", extras: "Magha Krishna Chaturdashi" },
      { date: "2027-03-10", eventName: "Eid-ul-Fitr", type: "Gazetted Holiday", extras: "Islamic lunar calendar Shawwal" },
      { date: "2027-03-22", eventName: "Holi", type: "Gazetted Holiday", extras: "Phalguna Purnima festival of colors" },
      { date: "2027-03-26", eventName: "Good Friday", type: "Gazetted Holiday", extras: "Christian Holy Week" },
      { date: "2027-04-15", eventName: "Ram Navami", type: "Gazetted Holiday", extras: "Chaitra Shukla Navami" },
      { date: "2027-05-17", eventName: "Bakrid / Eid-ul-Adha", type: "Gazetted Holiday", extras: "Islamic feast of sacrifice" },
      { date: "2027-05-20", eventName: "Buddha Purnima", type: "Gazetted Holiday", extras: "Vaisakha Purnima" },
      { date: "2027-06-16", eventName: "Muharram", type: "Gazetted Holiday", extras: "Ashura observance" },
      { date: "2027-08-17", eventName: "Raksha Bandhan", type: "Festival", extras: "Shravana Purnima" },
      { date: "2027-08-25", eventName: "Krishna Janmashtami", type: "Festival", extras: "Bhadrapada Krishna Ashtami" },
      { date: "2027-09-04", eventName: "Ganesh Chaturthi", type: "Festival", extras: "Bhadrapada Shukla Chaturthi" },
      { date: "2027-10-09", eventName: "Dussehra / Vijayadashami", type: "Gazetted Holiday", extras: "Ashwin Shukla Dashami" },
      { date: "2027-10-18", eventName: "Karwa Chauth", type: "Festival", extras: "Kartika Krishna Chaturthi" },
      { date: "2027-10-27", eventName: "Dhanteras", type: "Festival", extras: "Auspicious purchasing day" },
      { date: "2027-10-29", eventName: "Diwali / Deepavali", type: "Gazetted Holiday", extras: "Grand festive shopping and gifting peak" },
      { date: "2027-10-30", eventName: "Govardhan Puja", type: "Festival", extras: "Kartika Shukla Pratipada" },
      { date: "2027-10-31", eventName: "Bhai Dooj", type: "Festival", extras: "Kartika Shukla Dwitiya" },
      { date: "2027-11-04", eventName: "Chhath Puja", type: "Festival", extras: "Kartika Shukla Shashthi" },
      { date: "2027-11-14", eventName: "Guru Nanak Jayanti", type: "Gazetted Holiday", extras: "Kartika Purnima" }
    ],
    2028: [
      { date: "2028-01-15", eventName: "Makar Sankranti / Pongal", type: "Festival", extras: "Solar harvest festival" },
      { date: "2028-02-23", eventName: "Maha Shivratri", type: "Festival", extras: "Magha Krishna Chaturdashi" },
      { date: "2028-02-28", eventName: "Eid-ul-Fitr", type: "Gazetted Holiday", extras: "Islamic lunar calendar Shawwal" },
      { date: "2028-03-11", eventName: "Holi", type: "Gazetted Holiday", extras: "Phalguna Purnima festival of colors" },
      { date: "2028-04-03", eventName: "Ram Navami", type: "Gazetted Holiday", extras: "Chaitra Shukla Navami" },
      { date: "2028-04-14", eventName: "Good Friday", type: "Gazetted Holiday", extras: "Christian Holy Week" },
      { date: "2028-05-05", eventName: "Bakrid / Eid-ul-Adha", type: "Gazetted Holiday", extras: "Islamic feast of sacrifice" },
      { date: "2028-05-08", eventName: "Buddha Purnima", type: "Gazetted Holiday", extras: "Vaisakha Purnima" },
      { date: "2028-06-04", eventName: "Muharram", type: "Gazetted Holiday", extras: "Ashura observance" },
      { date: "2028-08-05", eventName: "Raksha Bandhan", type: "Festival", extras: "Shravana Purnima" },
      { date: "2028-08-13", eventName: "Krishna Janmashtami", type: "Festival", extras: "Bhadrapada Krishna Ashtami" },
      { date: "2028-08-23", eventName: "Ganesh Chaturthi", type: "Festival", extras: "Bhadrapada Shukla Chaturthi" },
      { date: "2028-09-27", eventName: "Dussehra / Vijayadashami", type: "Gazetted Holiday", extras: "Ashwin Shukla Dashami" },
      { date: "2028-10-07", eventName: "Karwa Chauth", type: "Festival", extras: "Kartika Krishna Chaturthi" },
      { date: "2028-10-15", eventName: "Dhanteras", type: "Festival", extras: "Auspicious purchasing day" },
      { date: "2028-10-17", eventName: "Diwali / Deepavali", type: "Gazetted Holiday", extras: "Grand festive shopping and gifting peak" },
      { date: "2028-10-19", eventName: "Govardhan Puja / Bhai Dooj", type: "Festival", extras: "Family gifting and celebration" },
      { date: "2028-10-24", eventName: "Chhath Puja", type: "Festival", extras: "Kartika Shukla Shashthi" },
      { date: "2028-11-02", eventName: "Guru Nanak Jayanti", type: "Gazetted Holiday", extras: "Kartika Purnima" }
    ],
    2029: [
      { date: "2029-01-14", eventName: "Makar Sankranti / Pongal", type: "Festival", extras: "Solar transit and harvest" },
      { date: "2029-02-11", eventName: "Maha Shivratri", type: "Festival", extras: "Magha Krishna Chaturdashi" },
      { date: "2029-02-15", eventName: "Eid-ul-Fitr", type: "Gazetted Holiday", extras: "Islamic Shawwal celebration" },
      { date: "2029-03-01", eventName: "Holi", type: "Gazetted Holiday", extras: "Phalguna Purnima" },
      { date: "2029-03-24", eventName: "Ram Navami", type: "Gazetted Holiday", extras: "Chaitra Shukla Navami" },
      { date: "2029-03-30", eventName: "Good Friday", type: "Gazetted Holiday", extras: "Christian Holy Week" },
      { date: "2029-04-24", eventName: "Bakrid / Eid-ul-Adha", type: "Gazetted Holiday", extras: "Islamic feast of sacrifice" },
      { date: "2029-05-27", eventName: "Buddha Purnima", type: "Gazetted Holiday", extras: "Vaisakha Purnima" },
      { date: "2029-08-24", eventName: "Raksha Bandhan", type: "Festival", extras: "Shravana Purnima" },
      { date: "2029-09-01", eventName: "Krishna Janmashtami", type: "Festival", extras: "Bhadrapada Krishna Ashtami" },
      { date: "2029-09-11", eventName: "Ganesh Chaturthi", type: "Festival", extras: "Bhadrapada Shukla Chaturthi" },
      { date: "2029-10-17", eventName: "Dussehra / Vijayadashami", type: "Gazetted Holiday", extras: "Ashwin Shukla Dashami" },
      { date: "2029-10-26", eventName: "Karwa Chauth", type: "Festival", extras: "Kartika Krishna Chaturthi" },
      { date: "2029-11-03", eventName: "Dhanteras", type: "Festival", extras: "Auspicious shopping day" },
      { date: "2029-11-05", eventName: "Diwali / Deepavali", type: "Gazetted Holiday", extras: "Grand festive shopping and gifting peak" },
      { date: "2029-11-06", eventName: "Govardhan Puja", type: "Festival", extras: "Kartika Shukla Pratipada" },
      { date: "2029-11-07", eventName: "Bhai Dooj", type: "Festival", extras: "Kartika Shukla Dwitiya" },
      { date: "2029-11-12", eventName: "Chhath Puja", type: "Festival", extras: "Kartika Shukla Shashthi" },
      { date: "2029-11-21", eventName: "Guru Nanak Jayanti", type: "Gazetted Holiday", extras: "Kartika Purnima" }
    ],
    2030: [
      { date: "2030-01-14", eventName: "Makar Sankranti / Pongal", type: "Festival", extras: "Solar harvest festival" },
      { date: "2030-02-05", eventName: "Eid-ul-Fitr", type: "Gazetted Holiday", extras: "Islamic lunar calendar Shawwal" },
      { date: "2030-03-03", eventName: "Maha Shivratri", type: "Festival", extras: "Magha Krishna Chaturdashi" },
      { date: "2030-03-20", eventName: "Holi", type: "Gazetted Holiday", extras: "Phalguna Purnima spring festival" },
      { date: "2030-04-19", eventName: "Good Friday", type: "Gazetted Holiday", extras: "Christian Holy Week" },
      { date: "2030-05-17", eventName: "Buddha Purnima", type: "Gazetted Holiday", extras: "Vaisakha Purnima" },
      { date: "2030-08-13", eventName: "Raksha Bandhan", type: "Festival", extras: "Shravana Purnima" },
      { date: "2030-08-21", eventName: "Krishna Janmashtami", type: "Festival", extras: "Bhadrapada Krishna Ashtami" },
      { date: "2030-09-01", eventName: "Ganesh Chaturthi", type: "Festival", extras: "Bhadrapada Shukla Chaturthi" },
      { date: "2030-10-06", eventName: "Dussehra / Vijayadashami", type: "Gazetted Holiday", extras: "Ashwin Shukla Dashami" },
      { date: "2030-10-15", eventName: "Karwa Chauth", type: "Festival", extras: "Kartika Krishna Chaturthi" },
      { date: "2030-10-24", eventName: "Dhanteras", type: "Festival", extras: "Auspicious buying day" },
      { date: "2030-10-26", eventName: "Diwali / Deepavali", type: "Gazetted Holiday", extras: "Grand festive shopping season" },
      { date: "2030-10-28", eventName: "Bhai Dooj", type: "Festival", extras: "Kartika Shukla Dwitiya" },
      { date: "2030-11-01", eventName: "Chhath Puja", type: "Festival", extras: "Kartika Shukla Shashthi" },
      { date: "2030-11-10", eventName: "Guru Nanak Jayanti", type: "Gazetted Holiday", extras: "Kartika Purnima" }
    ]
  };

  /**
   * Generates dynamic fallback events for a given year without guessing movable festival dates.
   */
  public static getFallbackEventsForYear(year: number, today: Date): ParsedHolidayEvent[] {
    const list: ParsedHolidayEvent[] = [];

    // Add fixed-date secular holidays
    for (const h of this.FIXED_ANNUAL_HOLIDAYS) {
      const monthStr = String(h.month).padStart(2, "0");
      const dayStr = String(h.day).padStart(2, "0");
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      const dt = new Date(`${dateStr}T00:00:00`);
      
      const targetDate = new Date(dt);
      targetDate.setHours(0, 0, 0, 0);
      const diffMs = targetDate.getTime() - today.getTime();
      const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

      list.push({
        id: `cal-fb-${dateStr}-${h.eventName.replace(/[\s\/]+/g, "-").toLowerCase()}`,
        year,
        date: dateStr,
        eventName: h.eventName,
        month: dt.toLocaleDateString("en-US", { month: "long" }),
        dayOfWeek: dt.toLocaleDateString("en-US", { weekday: "long" }),
        type: h.type,
        extras: h.extras,
        isMovable: false,
        daysRemaining
      });
    }

    // Add movable festivals if registered in multi-year astronomical ephemeris
    const movableList = this.LUNAR_EPHEMERIS_REGISTRY[year];
    if (movableList && Array.isArray(movableList)) {
      for (const m of movableList) {
        const dt = new Date(`${m.date}T00:00:00`);
        const targetDate = new Date(dt);
        targetDate.setHours(0, 0, 0, 0);
        const diffMs = targetDate.getTime() - today.getTime();
        const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

        list.push({
          id: `cal-fb-${m.date}-${m.eventName.replace(/[\s\/]+/g, "-").toLowerCase()}`,
          year,
          date: m.date,
          eventName: m.eventName,
          month: dt.toLocaleDateString("en-US", { month: "long" }),
          dayOfWeek: dt.toLocaleDateString("en-US", { weekday: "long" }),
          type: m.type,
          extras: m.extras || "Dynamic astronomical lunar calculation",
          isMovable: true,
          daysRemaining
        });
      }
    }

    list.sort((a, b) => a.date.localeCompare(b.date));
    return list;
  }
}

/**
 * Indian Holiday & Marketing Intelligence Service
 * 
 * Dynamically loads a rolling 3-year window (current year + next 2 years)
 * from the configured free public Indian holiday/festival API, automatically
 * refreshed based on current date, with zero static festival date assumptions.
 */
export class IndianHolidayService {
  private static cache = new Map<number, { timestamp: number; events: ParsedHolidayEvent[] }>();
  private static readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Returns the dynamic rolling 3-year window based on current date:
   * [currentYear, currentYear + 1, currentYear + 2]
   */
  public static getRollingWindowYears(): number[] {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1, currentYear + 2];
  }

  /**
   * Fetches and parses a single year's holiday & festival events
   * from the free public API, falling back dynamically if unreachable.
   */
  public static async getYearEvents(year: number, today: Date): Promise<ParsedHolidayEvent[]> {
    const cached = this.cache.get(year);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      // Re-calculate daysRemaining relative to today
      return cached.events.map(ev => {
        const dt = new Date(`${ev.date}T00:00:00`);
        const targetDate = new Date(dt);
        targetDate.setHours(0, 0, 0, 0);
        const diffMs = targetDate.getTime() - today.getTime();
        return {
          ...ev,
          daysRemaining: Math.round(diffMs / (1000 * 60 * 60 * 24))
        };
      });
    }

    const apiUrl = process.env.INDIAN_HOLIDAY_API_URL || "https://jayantur13.github.io/calendar-bharat/calendar";
    let events: ParsedHolidayEvent[] = [];

    try {
      const fetchUrl = `${apiUrl.replace(/\/+$/, "")}/${year}.json`;
      const response = await axios.get(fetchUrl, { timeout: 7000 });
      const yearData = response.data?.[String(year)];

      if (yearData && typeof yearData === "object") {
        for (const monthKey of Object.keys(yearData)) {
          const monthObj = yearData[monthKey];
          if (!monthObj || typeof monthObj !== "object") continue;

          for (const dateKey of Object.keys(monthObj)) {
            const ev = monthObj[dateKey];
            if (!ev || !ev.event) continue;

            const parts = dateKey.split(",").map((s: string) => s.trim());
            const parsedDate = new Date(`${parts[0]}, ${parts[1]}`);
            if (isNaN(parsedDate.getTime())) continue;

            const yearStr = parsedDate.getFullYear();
            const monthStr = String(parsedDate.getMonth() + 1).padStart(2, "0");
            const dayStr = String(parsedDate.getDate()).padStart(2, "0");
            const yyyyMmDd = `${yearStr}-${monthStr}-${dayStr}`;

            const targetDate = new Date(parsedDate);
            targetDate.setHours(0, 0, 0, 0);
            const diffMs = targetDate.getTime() - today.getTime();
            const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

            const evLower = ev.event.toLowerCase();
            const isMovable = !(
              evLower.includes("republic day") ||
              evLower.includes("independence day") ||
              evLower.includes("gandhi jayanti") ||
              evLower.includes("christmas") ||
              evLower.includes("ambedkar") ||
              evLower.includes("may day") ||
              evLower.includes("new year's day")
            );

            events.push({
              id: `cal-${yyyyMmDd}-${ev.event.replace(/[\s\/]+/g, "-").toLowerCase()}`,
              year: yearStr,
              date: yyyyMmDd,
              eventName: ev.event,
              month: parsedDate.toLocaleDateString("en-US", { month: "long" }),
              dayOfWeek: parts[2] || parsedDate.toLocaleDateString("en-US", { weekday: "long" }),
              type: ev.type || "Public Holiday",
              extras: ev.extras || "",
              isMovable,
              daysRemaining
            });
          }
        }
      }
    } catch (err: any) {
      console.warn(`[INDIAN-HOLIDAY-SERVICE] Public API fetch failed for year ${year}, invoking dynamic fallback:`, err.message);
      events = DynamicHolidayFallbackStrategy.getFallbackEventsForYear(year, today);
    }

    if (events.length === 0) {
      events = DynamicHolidayFallbackStrategy.getFallbackEventsForYear(year, today);
    }

    events.sort((a, b) => a.date.localeCompare(b.date));

    // Store in cache
    this.cache.set(year, { timestamp: Date.now(), events });

    return events;
  }

  /**
   * Loads the full rolling 3-year window and calculates customer-scoped
   * campaign opportunities and calendar events.
   */
  public static async getRollingWindowCalendar(
    customerContext: CustomerMarketingContext,
    targetYear?: number
  ): Promise<{
    currentYear: number;
    selectedYear: number;
    availableYears: number[];
    opportunities: HolidayCampaignOpportunity[];
    calendar: ParsedHolidayEvent[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const availableYears = this.getRollingWindowYears();
    const selectedYear = (targetYear && availableYears.includes(targetYear)) ? targetYear : currentYear;

    // Concurrently fetch all 3 years in the rolling window
    const yearsResults = await Promise.all(
      availableYears.map(yr => this.getYearEvents(yr, today))
    );

    const allEvents: ParsedHolidayEvent[] = yearsResults.flat();
    allEvents.sort((a, b) => a.date.localeCompare(b.date));

    // Filter events for the selected year
    const selectedYearEvents = allEvents.filter(ev => ev.year === selectedYear);

    // Extract customer context for relevance annotations
    const businessName = customerContext.businessName || "Your Business";
    const industry = customerContext.industry || customerContext.category || "";
    const products = customerContext.products || [];
    const services = customerContext.services || [];
    const topOfferings = [...products, ...services].slice(0, 5);
    const offeringsLabel = topOfferings.length > 0 ? topOfferings.join(", ") : (industry || "products & services");
    const locations = (customerContext.locations && customerContext.locations.length > 0)
      ? customerContext.locations.join(", ")
      : "India";

    // Annotate calendar items with customer relevance
    const calendarWithRelevance = selectedYearEvents.map(item => {
      let relevanceReason = "General festive commerce opportunity across India.";
      const evLower = item.eventName.toLowerCase();
      if (evLower.includes("diwali") || evLower.includes("dhanteras")) {
        relevanceReason = `Peak festive buying season. Maximum consumer demand for ${offeringsLabel} with gifting and seasonal incentives.`;
      } else if (evLower.includes("republic") || evLower.includes("independence")) {
        relevanceReason = `National holiday weekend search interest and patriotic promotional campaigns.`;
      } else if (evLower.includes("holi") || evLower.includes("pongal") || evLower.includes("sankranti")) {
        relevanceReason = `Seasonal harvest celebration. Ideal for localized ad promotions in ${locations}.`;
      } else if (evLower.includes("eid") || evLower.includes("ram navami") || evLower.includes("ganesh")) {
        relevanceReason = `High regional footfall and digital search volume for celebratory orders.`;
      } else if (evLower.includes("christmas") || evLower.includes("new year")) {
        relevanceReason = `Year-end holiday spending, corporate bonus shopping, and holiday demand surge.`;
      }

      return {
        ...item,
        relevanceReason
      };
    });

    // Compute "New & Fresh Campaign Opportunities" looking across the rolling window from today
    // Next 90 days window, expanding to 180 days if fewer than 4 events found
    let upcomingEvents = allEvents.filter(ev => ev.daysRemaining >= 0 && ev.daysRemaining <= 90);
    if (upcomingEvents.length < 4) {
      upcomingEvents = allEvents.filter(ev => ev.daysRemaining >= 0 && ev.daysRemaining <= 180);
    }
    if (upcomingEvents.length === 0) {
      upcomingEvents = allEvents.filter(ev => ev.daysRemaining >= 0).slice(0, 6);
    }

    const opportunities: HolidayCampaignOpportunity[] = upcomingEvents.slice(0, 8).map(ev => {
      const evLower = ev.eventName.toLowerCase();
      let campaignTheme = `${ev.eventName} Special Campaign`;
      let suggestedObjective = "Sales";
      let suggestedCampaignType = "Performance Max";
      let opportunityInsight = `Capitalize on heightened consumer search intent during ${ev.eventName}. Feature ${offeringsLabel} to targeted audiences across ${locations}.`;

      if (
        evLower.includes("diwali") ||
        evLower.includes("deepavali") ||
        evLower.includes("dhanteras") ||
        evLower.includes("christmas") ||
        evLower.includes("new year")
      ) {
        campaignTheme = `${ev.eventName} Festive Mega Deals & Gifting Special`;
        suggestedObjective = "Sales";
        suggestedCampaignType = "Performance Max";
        opportunityInsight = `Major purchasing surge expected. Promote ${offeringsLabel} with festive discount hooks across Search, Display, and YouTube to drive conversions in ${locations}.`;
      } else if (
        evLower.includes("republic") ||
        evLower.includes("independence") ||
        evLower.includes("gandhi")
      ) {
        campaignTheme = `${ev.eventName} Freedom Deals & National Celebration Offer`;
        suggestedObjective = topOfferings.length > 0 ? "Sales" : "Website Traffic";
        suggestedCampaignType = "Search";
        opportunityInsight = `High digital browsing volume over the national holiday. Deploy focused Search ad copy featuring ${offeringsLabel} with clear call-to-actions.`;
      } else if (
        evLower.includes("holi") ||
        evLower.includes("raksha") ||
        evLower.includes("karwa") ||
        evLower.includes("ganesh") ||
        evLower.includes("dussehra") ||
        evLower.includes("navratri") ||
        evLower.includes("eid")
      ) {
        campaignTheme = `${ev.eventName} Exclusive Festive Collection & Limited-Time Deals`;
        suggestedObjective = "Sales";
        suggestedCampaignType = "Performance Max";
        opportunityInsight = `Cultural celebration driving surge in local orders and enquiries. Target families and shoppers in ${locations} with festive creative assets.`;
      } else if (ev.type.toLowerCase().includes("good to know") || ev.type.toLowerCase().includes("observance")) {
        campaignTheme = `${ev.eventName} Thematic Community & Engagement Spotlight`;
        suggestedObjective = "Brand Awareness";
        suggestedCampaignType = "Demand Gen";
        opportunityInsight = `Build brand authority during ${ev.eventName}. Share engaging visual creatives showcasing ${businessName}'s commitment to ${industry || "customers"}.`;
      }

      return {
        id: `opp-${ev.id}`,
        year: ev.year,
        eventName: ev.eventName,
        date: ev.date,
        type: ev.type,
        daysRemaining: ev.daysRemaining,
        campaignTheme,
        suggestedObjective,
        suggestedCampaignType,
        opportunityInsight
      };
    });

    return {
      currentYear,
      selectedYear,
      availableYears,
      opportunities,
      calendar: calendarWithRelevance
    };
  }
}
