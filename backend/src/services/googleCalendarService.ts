import { google } from "googleapis";
import prisma from "../utils/prisma";
import crypto from "crypto";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/gmb/oauth/callback";

export class GoogleCalendarService {
  /**
   * Helper to construct an OAuth2 client with valid credentials for an organization or specific googleAccountId
   */
  public static async getOAuth2Client(googleAccountId?: string, organizationId: string = "demo-org-123") {
    let config: any = null;

    if (googleAccountId) {
      config = await (prisma as any).googleCalendarConfig.findFirst({
        where: { id: googleAccountId, organizationId }
      }) || await (prisma as any).googleBusinessConfig.findFirst({
        where: { id: googleAccountId, organizationId }
      });
    }

    if (!config) {
      config = await (prisma as any).googleCalendarConfig.findFirst({
        where: { organizationId, isDefault: true }
      }) || await (prisma as any).googleCalendarConfig.findFirst({
        where: { organizationId }
      }) || await (prisma as any).googleBusinessConfig.findFirst({
        where: { organizationId, isDefault: true }
      }) || await (prisma as any).googleBusinessConfig.findFirst({
        where: { organizationId }
      });
    }

    if (!config || (!config.accessToken && !config.refreshToken && !config.googleRefreshToken)) {
      throw new Error("No connected Google Calendar account found for this organization.");
    }

    const refreshToken = config.refreshToken || config.googleRefreshToken;
    const accessToken = config.accessToken;

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Handle automatic token refresh if token expired or about to expire
    if (config.tokenExpiresAt && new Date(config.tokenExpiresAt).getTime() <= Date.now() + 60000) {
      if (refreshToken) {
        try {
          console.log(`[GOOGLE CALENDAR SERVICE] Access token expired. Refreshing for account: ${config.id}...`);
          const { credentials } = await oauth2Client.refreshAccessToken();
          oauth2Client.setCredentials(credentials);

          // Save refreshed tokens back to DB
          if ((prisma as any).googleCalendarConfig) {
            await (prisma as any).googleCalendarConfig.updateMany({
              where: { id: config.id },
              data: {
                accessToken: credentials.access_token || accessToken,
                tokenExpiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600 * 1000)
              }
            });
          }
        } catch (refreshErr: any) {
          console.error("[GOOGLE CALENDAR SERVICE] Error refreshing OAuth token:", refreshErr.message);
        }
      }
    }

    return { oauth2Client, config };
  }

  /**
   * Fetch all accessible calendars for a connected Google Account
   */
  public static async listCalendars(googleAccountId?: string, organizationId: string = "demo-org-123") {
    const { oauth2Client } = await this.getOAuth2Client(googleAccountId, organizationId);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.calendarList.list({
      minAccessRole: "writer"
    });

    return (response.data.items || []).map((item: any) => ({
      id: item.id,
      summary: item.summary || item.id,
      primary: Boolean(item.primary),
      timeZone: item.timeZone || "Asia/Kolkata",
      description: item.description || ""
    }));
  }

  /**
   * Create Google Calendar Event with automatic Google Meet Conference Creation (conferenceDataVersion=1)
   */
  public static async createCalendarEventWithMeet(params: {
    organizationId: string;
    googleAccountId?: string;
    calendarId?: string;
    title: string;
    description?: string;
    startTime: string | Date;
    endTime: string | Date;
    timezone?: string;
    customerEmail?: string;
    customerName?: string;
    customerPhone?: string;
  }) {
    const {
      organizationId,
      googleAccountId,
      calendarId,
      title,
      description,
      startTime,
      endTime,
      timezone = "Asia/Kolkata",
      customerEmail,
      customerName,
      customerPhone
    } = params;

    const { oauth2Client, config } = await this.getOAuth2Client(googleAccountId, organizationId);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const targetCalendarId = calendarId || config.selectedCalendarId || "primary";

    const startDateTime = new Date(startTime).toISOString();
    const endDateTime = new Date(endTime).toISOString();

    const uniqueRequestId = `meet_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;

    const attendees: any[] = [];
    if (customerEmail && customerEmail.includes("@")) {
      attendees.push({ email: customerEmail, displayName: customerName || customerEmail });
    }

    const eventRequestBody: any = {
      summary: title,
      description: description || `Appointment for ${customerName || "Customer"} (${customerPhone || ""}). Booked via CRM.`,
      start: {
        dateTime: startDateTime,
        timeZone: timezone
      },
      end: {
        dateTime: endDateTime,
        timeZone: timezone
      },
      attendees: attendees.length > 0 ? attendees : undefined,
      conferenceData: {
        createRequest: {
          requestId: uniqueRequestId,
          conferenceSolutionKey: {
            type: "hangoutsMeet"
          }
        }
      },
      extendedProperties: {
        private: {
          organizationId,
          source: "CRM_AUTOMATION"
        }
      }
    };

    console.log(`[GOOGLE CALENDAR SERVICE] Creating Calendar Event on Calendar: ${targetCalendarId}...`);

    const response = await calendar.events.insert({
      calendarId: targetCalendarId,
      conferenceDataVersion: 1,
      sendUpdates: attendees.length > 0 ? "all" : "none",
      requestBody: eventRequestBody
    });

    const eventData = response.data;
    const eventId = eventData.id || "";
    const htmlLink = eventData.htmlLink || "";

    // Extract Video Entry Point (Google Meet URL)
    let meetUrl = "";
    let conferenceId = "";

    if (eventData.conferenceData && eventData.conferenceData.entryPoints) {
      const videoEntryPoint = eventData.conferenceData.entryPoints.find(
        (ep: any) => ep.entryPointType === "video"
      );
      if (videoEntryPoint && videoEntryPoint.uri) {
        meetUrl = videoEntryPoint.uri;
      }
      conferenceId = eventData.conferenceData.conferenceId || "";
    }

    if (!meetUrl && eventId) {
      try {
        await new Promise((res) => setTimeout(res, 1200));
        const refreshedEvent = await calendar.events.get({
          calendarId: targetCalendarId,
          eventId
        });
        if (refreshedEvent.data.conferenceData?.entryPoints) {
          const videoEP = refreshedEvent.data.conferenceData.entryPoints.find(
            (ep: any) => ep.entryPointType === "video"
          );
          if (videoEP?.uri) {
            meetUrl = videoEP.uri;
          }
          conferenceId = refreshedEvent.data.conferenceData.conferenceId || conferenceId;
        }
      } catch (retryErr) {
        console.warn("[GOOGLE CALENDAR SERVICE] Retrying event fetch failed:", retryErr);
      }
    }

    console.log(`[GOOGLE CALENDAR SERVICE] ✅ Real Google Calendar & Meet Event Created! ID: ${eventId}, Meet URL: ${meetUrl || 'None'}`);

    return {
      eventId,
      calendarId: targetCalendarId,
      htmlLink,
      meetUrl,
      conferenceId,
      syncStatus: meetUrl ? "SYNCED" : "PENDING"
    };
  }

  /**
   * Reschedule / Update an existing Google Calendar Event
   */
  public static async updateCalendarEvent(params: {
    organizationId: string;
    googleAccountId?: string;
    calendarId: string;
    eventId: string;
    title?: string;
    description?: string;
    startTime: string | Date;
    endTime: string | Date;
    timezone?: string;
  }) {
    const {
      organizationId,
      googleAccountId,
      calendarId,
      eventId,
      title,
      description,
      startTime,
      endTime,
      timezone = "Asia/Kolkata"
    } = params;

    const { oauth2Client } = await this.getOAuth2Client(googleAccountId, organizationId);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const updateBody: any = {
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: timezone
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: timezone
      }
    };

    if (title) updateBody.summary = title;
    if (description) updateBody.description = description;

    const response = await calendar.events.patch({
      calendarId: calendarId || "primary",
      eventId,
      sendUpdates: "all",
      requestBody: updateBody
    });

    return response.data;
  }

  /**
   * Delete / Cancel a Google Calendar Event
   */
  public static async deleteCalendarEvent(params: {
    organizationId: string;
    googleAccountId?: string;
    calendarId: string;
    eventId: string;
  }) {
    const { organizationId, googleAccountId, calendarId, eventId } = params;
    const { oauth2Client } = await this.getOAuth2Client(googleAccountId, organizationId);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.delete({
      calendarId: calendarId || "primary",
      eventId,
      sendUpdates: "all"
    });

    return { success: true };
  }
}
