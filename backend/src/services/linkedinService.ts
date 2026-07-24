import axios from "axios";
import prisma from "../utils/prisma";

// ─── HELPER & ENV VALIDATION ───────────────────────────────────────────────────

function maskString(str: string): string {
  if (!str) return "[EMPTY]";
  if (str.length <= 6) return "****";
  return `${str.substring(0, 3)}****${str.substring(str.length - 3)}`;
}

export function getLinkedInCredentials() {
  const clientId = (
    process.env.LINKEDIN_MEMBER_CLIENT_ID ||
    process.env.LINKEDIN_CLIENT_ID ||
    ""
  ).trim();

  const clientSecret = (
    process.env.LINKEDIN_MEMBER_CLIENT_SECRET ||
    process.env.LINKEDIN_CLIENT_SECRET ||
    ""
  ).trim();

  const redirectUri = (
    process.env.LINKEDIN_MEMBER_REDIRECT_URI ||
    process.env.LINKEDIN_REDIRECT_URI ||
    "http://localhost:5000/api/linkedin/auth/callback"
  ).trim();

  return { clientId, clientSecret, redirectUri };
}

export function validateLinkedInEnv() {
  const { clientId, clientSecret, redirectUri } = getLinkedInCredentials();
  const errors: string[] = [];

  if (!clientId) errors.push("Missing LINKEDIN_MEMBER_CLIENT_ID in backend/.env");
  if (!clientSecret) errors.push("Missing LINKEDIN_MEMBER_CLIENT_SECRET in backend/.env");
  if (!redirectUri) errors.push("Missing LINKEDIN_MEMBER_REDIRECT_URI in backend/.env");

  if (errors.length > 0) {
    console.warn(`[LINKEDIN CONFIG WARNING] Startup Validation Issues:\n - ${errors.join("\n - ")}`);
  } else {
    console.log(`[LINKEDIN CONFIG] Startup Validation Passed: Client ID=${maskString(clientId)}, Redirect URI=${redirectUri}`);
  }

  return { isValid: errors.length === 0, errors, clientId, clientSecret, redirectUri };
}

// ─── PROVIDER ARCHITECTURE ───────────────────────────────────────────────────

export interface ILinkedInProvider {
  getProfile(accessToken: string): Promise<any>;
  getPosts(organizationId: string): Promise<any>;
}

/**
 * Phase 1: Personal LinkedIn Provider (Member Login)
 * Handles Personal LinkedIn Authentication via OpenID Connect (openid, profile, email).
 */
export class PersonalProvider implements ILinkedInProvider {
  public async getProfile(accessToken: string) {
    if (!accessToken || accessToken.trim().length < 10 || accessToken.startsWith("mock")) {
      return { id: "", name: "", email: "", headline: "LinkedIn Member", picture: "", locale: "en_US" };
    }

    const url = "https://api.linkedin.com/v2/userinfo";
    const headers = { Authorization: `Bearer ${accessToken}` };
    console.log(`[LINKEDIN] Fetching Member Profile: ${url}`);

    try {
      const response = await axios.get(url, { headers });
      console.log("[LINKEDIN] Profile Success:", JSON.stringify(response.data));

      let formattedLocale = "en_US";
      if (typeof response.data.locale === "string") {
        formattedLocale = response.data.locale;
      } else if (response.data.locale && typeof response.data.locale === "object") {
        const lang = response.data.locale.language || response.data.locale.lang || "en";
        const country = response.data.locale.country || response.data.locale.region || "US";
        formattedLocale = `${lang}_${country}`;
      }

      const name = response.data.name || `${response.data.given_name || ""} ${response.data.family_name || ""}`.trim() || "LinkedIn User";

      return {
        id: response.data.sub || "",
        name,
        email: response.data.email || "",
        headline: response.data.headline || "LinkedIn Member Profile",
        picture: response.data.picture || "",
        locale: formattedLocale,
        sub: response.data.sub || "",
        given_name: response.data.given_name || "",
        family_name: response.data.family_name || ""
      };
    } catch (err: any) {
      const status = err?.response?.status || 500;
      const data = err?.response?.data || {};
      console.error(`[LINKEDIN] UserInfo Error [HTTP ${status}]:`, JSON.stringify(data));
      throw err;
    }
  }

  public async getPosts(organizationId: string) {
    return {
      permissionGranted: false,
      message: "Personal LinkedIn posts are unavailable with the current LinkedIn Member API permissions.",
      posts: []
    };
  }
}

/**
 * Phase 2: Organization LinkedIn Provider (Prepared Architecture)
 * Plug-and-play architecture for Company Page features when Community Management API is enabled.
 */
export class OrganizationProvider implements ILinkedInProvider {
  public async getProfile(accessToken: string) { return null; }
  public async getCompanyDetails(accessToken: string) { return null; }
  public async getPosts(organizationId: string) {
    return { permissionGranted: false, message: "Community Management API is required for Organization Company Page posts.", posts: [] };
  }
  public async getComments(organizationId: string) { return []; }
  public async replyToComment(organizationId: string, commentId: string, text: string) { return null; }
  public async getAnalytics(organizationId: string) { return null; }
  public async getFollowers(organizationId: string) { return null; }
  public async createScheduledPost(organizationId: string, postData: any) { return null; }
}

export class LinkedInProviderFactory {
  public static getPersonalProvider(): PersonalProvider {
    return new PersonalProvider();
  }
  public static getOrganizationProvider(): OrganizationProvider {
    return new OrganizationProvider();
  }
}

// ─── SYNC SERVICE & LOGGING ──────────────────────────────────────────────────

export class LinkedInSyncService {
  public static async logSyncEvent(
    organizationId: string,
    event: string,
    status: "SUCCESS" | "FAILED" | "WARNING",
    details?: string
  ) {
    console.log(`[LINKEDIN] ${event}${details ? ` - ${details}` : ""}`);
    try {
      await prisma.linkedInSyncLog.create({
        data: {
          organizationId,
          event,
          status,
          details: details || null,
          timestamp: new Date()
        }
      });
    } catch (err: any) {
      console.error(`[LINKEDIN] API Error - Failed to write sync log:`, err.message);
    }
  }

  public static async syncPersonalProfile(organizationId: string, io?: any) {
    await this.logSyncEvent(organizationId, "Sync Started", "SUCCESS", "Synchronizing Personal LinkedIn Profile");
    try {
      const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });

      if (!config || !config.accessToken) {
        await this.logSyncEvent(organizationId, "Sync Skipped", "WARNING", "LinkedIn account is disconnected");
        return null;
      }

      if (config.tokenExpiry && new Date() > config.tokenExpiry) {
        await this.logSyncEvent(organizationId, "Token Expired", "WARNING", "Access token has expired");
        if (config.refreshToken) {
          try {
            const newAccessToken = await LinkedInService.refreshAccessToken(organizationId);
            config.accessToken = newAccessToken;
          } catch (refreshErr: any) {
            await this.logSyncEvent(organizationId, "API Error", "FAILED", `Token refresh failed: ${refreshErr.message}`);
          }
        }
      }

      const personalProvider = LinkedInProviderFactory.getPersonalProvider();
      const profileData = await personalProvider.getProfile(config.accessToken);

      if (profileData.id) {
        const profile = await prisma.linkedInProfile.upsert({
          where: { organizationId },
          update: {
            memberId: profileData.id,
            name: profileData.name,
            email: profileData.email,
            headline: profileData.headline,
            picture: profileData.picture,
            locale: profileData.locale,
            updatedAt: new Date()
          },
          create: {
            organizationId,
            configId: config.id,
            memberId: profileData.id,
            name: profileData.name,
            email: profileData.email,
            headline: profileData.headline,
            picture: profileData.picture,
            locale: profileData.locale
          }
        });

        await prisma.linkedInConfig.update({
          where: { organizationId },
          data: {
            memberId: profileData.id,
            memberName: profileData.name,
            memberEmail: profileData.email,
            memberPicture: profileData.picture,
            headline: profileData.headline,
            updatedAt: new Date()
          }
        });

        await this.logSyncEvent(organizationId, "Sync Complete", "SUCCESS", `Updated profile for member ${profileData.name}`);

        if (io) {
          io.to(organizationId).emit("linkedin-profile-updated", {
            organizationId,
            profile
          });
          io.to(organizationId).emit("linkedin-sync-completed", {
            organizationId,
            timestamp: new Date()
          });
        }

        return profile;
      } else {
        await this.logSyncEvent(organizationId, "API Error", "FAILED", "Could not retrieve member profile from LinkedIn API");
        return null;
      }
    } catch (err: any) {
      await this.logSyncEvent(organizationId, "API Error", "FAILED", err.message);
      console.error(`[LINKEDIN] API Error - syncPersonalProfile failed:`, err.message);
      return null;
    }
  }
}

// ─── MAIN LINKEDIN SERVICE ───────────────────────────────────────────────────

export class LinkedInService {
  private static hasValidToken(accessToken?: string | null): boolean {
    return Boolean(accessToken && accessToken.trim().length > 10 && !accessToken.startsWith("mock"));
  }

  // Generate OAuth 2.0 Authorization URL for Personal Member Login
  public static generateAuthUrl(orgId: string = "demo-org-123", redirectPath: string = "/linkedin"): string {
    const { clientId, redirectUri } = getLinkedInCredentials();
    const scopes = "openid profile email";

    if (!clientId) {
      throw new Error("Missing LINKEDIN_MEMBER_CLIENT_ID in backend/.env");
    }
    if (!redirectUri) {
      throw new Error("Missing LINKEDIN_MEMBER_REDIRECT_URI in backend/.env");
    }

    const statePayload = JSON.stringify({ orgId, redirect: redirectPath });
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(statePayload)}&scope=${encodeURIComponent(scopes)}`;

    console.log("");
    console.log("========== LINKEDIN OAUTH REQUEST ==========");
    console.log(`Loaded Client ID: ${maskString(clientId)}`);
    console.log(`Loaded Redirect URI: ${redirectUri}`);
    console.log(`Loaded Client Secret: Present`);
    console.log(`Scopes: ${scopes}`);
    console.log(`FULL AUTHORIZATION URL: ${authUrl}`);
    console.log("==========================================");
    console.log("");

    return authUrl;
  }

  // Exchange authorization code for access token
  public static async exchangeCodeForToken(code: string, redirectUriOverride?: string) {
    const { clientId, clientSecret, redirectUri: defaultRedirectUri } = getLinkedInCredentials();
    const redirectUri = (redirectUriOverride || defaultRedirectUri).trim();

    if (!clientId) {
      console.error("[LINKEDIN ERROR] Missing LINKEDIN_MEMBER_CLIENT_ID in backend/.env");
      throw new Error("Missing LINKEDIN_MEMBER_CLIENT_ID in backend/.env");
    }
    if (!clientSecret) {
      console.error("[LINKEDIN ERROR] Missing LINKEDIN_MEMBER_CLIENT_SECRET in backend/.env");
      throw new Error("Missing LINKEDIN_MEMBER_CLIENT_SECRET in backend/.env");
    }
    if (!code) {
      throw new Error("Missing authorization code for token exchange");
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code.trim());
    params.append("redirect_uri", redirectUri);
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);

    console.log("");
    console.log("========== LINKEDIN TOKEN EXCHANGE REQUEST ==========");
    console.log(`Loaded Client ID: ${maskString(clientId)}`);
    console.log(`Loaded Redirect URI: ${redirectUri}`);
    console.log(`Loaded Client Secret: Present (${clientSecret.length} chars)`);
    console.log(`Token Request Body: grant_type=authorization_code&code=[HIDDEN]&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${maskString(clientId)}&client_secret=[REDACTED]`);
    console.log("=====================================================");

    try {
      const response = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        params.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }
      );

      console.log(`[LINKEDIN] HTTP Status: ${response.status}`);
      console.log("[LINKEDIN] Response Body:", JSON.stringify({
        access_token: response.data?.access_token ? "[TOKEN_RECEIVED]" : undefined,
        expires_in: response.data?.expires_in,
        scope: response.data?.scope
      }));

      return response.data;
    } catch (error: any) {
      const status = error?.response?.status || 500;
      const data = error?.response?.data || {};
      const errorCode = data?.error || "token_exchange_error";
      const errorDesc = data?.error_description || error?.message || "Token exchange failed";

      console.error("");
      console.error("========== LINKEDIN TOKEN ERROR ==========");
      console.error(`HTTP Status: ${status}`);
      console.error(`LinkedIn Response: ${JSON.stringify(data)}`);
      console.error(`Error Code: ${errorCode}`);
      console.error(`Error Description: ${errorDesc}`);
      
      let cause = "Unknown error during token exchange.";
      let fix = "Check configuration parameters.";

      if (errorCode === "invalid_scope") {
        cause = "Requested scopes are not provisioned for this Client ID on LinkedIn Developer Portal.";
        fix = "Update scope parameter to 'openid profile email' and ensure products are added on Developer Portal.";
      } else if (errorCode === "invalid_client") {
        cause = "LINKEDIN_MEMBER_CLIENT_ID or LINKEDIN_MEMBER_CLIENT_SECRET does not match the app in Developer Portal.";
        fix = "Verify Client ID and Secret in backend/.env match the app under Developer Portal -> Auth.";
      } else if (errorCode === "invalid_redirect_uri" || errorDesc.includes("redirect_uri")) {
        cause = "The redirect_uri parameter does not match Authorized Redirect URLs in LinkedIn Developer Portal.";
        fix = `Add '${redirectUri}' exactly to Authorized Redirect URLs under Developer Portal -> Auth.`;
      } else if (errorCode === "invalid_grant") {
        cause = "Authorization code is expired, invalid, or already used.";
        fix = "Re-initiate the OAuth flow by clicking 'Connect LinkedIn' to generate a fresh authorization code.";
      }

      console.error(`Likely Cause: ${cause}`);
      console.error(`Suggested Fix: ${fix}`);
      console.error("=========================================");
      console.error("");

      const err = new Error(errorDesc);
      (err as any).status = status;
      (err as any).errorCode = errorCode;
      (err as any).data = data;
      throw err;
    }
  }

  // Refresh access token for an organization
  public static async refreshAccessToken(organizationId: string): Promise<string> {
    const config = await prisma.linkedInConfig.findUnique({
      where: { organizationId }
    });

    if (!config || !config.refreshToken || config.refreshToken.startsWith("mock")) {
      return config?.accessToken || "";
    }

    const { clientId, clientSecret } = getLinkedInCredentials();

    if (!clientId || !clientSecret) {
      return config.accessToken || "";
    }

    try {
      const params = new URLSearchParams();
      params.append("grant_type", "refresh_token");
      params.append("refresh_token", config.refreshToken);
      params.append("client_id", clientId);
      params.append("client_secret", clientSecret);

      const response = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      const newAccessToken = response.data.access_token;
      const expiresIn = response.data.expires_in || 5184000;
      const tokenExpiry = new Date(Date.now() + expiresIn * 1000);

      await prisma.linkedInConfig.update({
        where: { organizationId },
        data: {
          accessToken: newAccessToken,
          expiresIn,
          tokenExpiry,
          updatedAt: new Date()
        }
      });

      console.log(`[LINKEDIN] Token Refreshed for organization ${organizationId}`);
      return newAccessToken;
    } catch (err: any) {
      console.error(`[LINKEDIN] API Error - Token refresh failed:`, err.message);
      return config.accessToken || "";
    }
  }

  // Delegate member profile lookup to PersonalProvider
  public static async getMember(accessToken: string) {
    const personalProvider = LinkedInProviderFactory.getPersonalProvider();
    return personalProvider.getProfile(accessToken);
  }

  // Prepared OrganizationProvider delegation for replyToComment
  public static async replyToComment(organizationId: string, commentId: string, text: string) {
    const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
    return orgProvider.replyToComment(organizationId, commentId, text);
  }
}
