import { Router, Request, Response } from "express";
import { google } from "googleapis";
import prisma from "../utils/prisma";
import { GoogleCalendarService } from "../services/googleCalendarService";

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/gmb/oauth/callback";

const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || (req.query.orgId as string) || "demo-org-123";
};

// 1. GET: Generate Google OAuth URL for Calendar Scopes
router.get("/auth-url", (req: Request, res: Response) => {
  const orgId = getOrgId(req);

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );

  const scopes = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state: JSON.stringify({ orgId })
  });

  return res.status(200).json({ url: authUrl });
});

// 2. GET: OAuth Callback Code Exchange
router.get("/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.status(400).send(`Google OAuth Authorization Error: ${oauthError}`);
    }

    if (!code) {
      return res.status(400).send("Missing authorization code in Google callback");
    }

    let orgId = "demo-org-123";
    if (state) {
      try {
        const parsed = JSON.parse(state as string);
        if (parsed.orgId) orgId = parsed.orgId;
      } catch (e) {
        // Fallback
      }
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Fetch user profile info to get account email address
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const googleEmail = userInfo.data.email || `google_user_${Date.now()}@gmail.com`;

    // Save or Update GoogleCalendarConfig
    const existing = await (prisma as any).googleCalendarConfig.findFirst({
      where: { organizationId: orgId, googleEmail }
    });

    if (existing) {
      await (prisma as any).googleCalendarConfig.update({
        where: { id: existing.id },
        data: {
          accessToken: tokens.access_token || existing.accessToken,
          refreshToken: tokens.refresh_token || existing.refreshToken,
          tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          isActive: true
        }
      });
    } else {
      await (prisma as any).googleCalendarConfig.create({
        data: {
          organizationId: orgId,
          googleEmail,
          accessToken: tokens.access_token || "",
          refreshToken: tokens.refresh_token || null,
          tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          selectedCalendarId: "primary",
          calendarName: "Primary Calendar",
          isDefault: true,
          isActive: true
        }
      });
    }

    return res.send(`
      <html>
        <head><title>Google Calendar Connected</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: white;">
          <h1 style="color: #10b981;">✓ Google Calendar Connected Successfully!</h1>
          <p>You may now close this window and return to your CRM dashboard.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_CALENDAR_CONNECTED' }, '*');
              setTimeout(() => window.close(), 1500);
            }
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("[GOOGLE CALENDAR CALLBACK ERROR]", error);
    return res.status(500).send(`Failed to complete Google Calendar OAuth setup: ${error.message}`);
  }
});

// 3. GET: List connected Google Accounts for Organization
router.get("/accounts", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);

    const accounts = await (prisma as any).googleCalendarConfig.findMany({
      where: { organizationId: orgId, isActive: true },
      orderBy: { isDefault: "desc" }
    });

    return res.status(200).json({ accounts });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch Google Calendar accounts", details: error.message });
  }
});

// 4. GET: List Calendars for a connected Google Account
router.get("/calendars", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const googleAccountId = req.query.googleAccountId as string;

    const calendars = await GoogleCalendarService.listCalendars(googleAccountId, orgId);
    return res.status(200).json({ calendars });
  } catch (error: any) {
    console.error("Error listing calendars:", error);
    return res.status(500).json({ error: "Failed to list calendars", details: error.message });
  }
});

// 5. POST: Select Default Calendar for an Account
router.post("/select-calendar", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { googleAccountId, calendarId, calendarName } = req.body;

    if (!googleAccountId || !calendarId) {
      return res.status(400).json({ error: "googleAccountId and calendarId are required" });
    }

    await (prisma as any).googleCalendarConfig.update({
      where: { id: googleAccountId },
      data: {
        selectedCalendarId: calendarId,
        calendarName: calendarName || calendarId
      }
    });

    return res.status(200).json({ success: true, message: "Calendar selection updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update calendar selection", details: error.message });
  }
});

export default router;
