import { NextResponse } from "next/server";

const DEFAULT_ORG_ID = "demo-org-123";

/**
 * Next.js App Router API Route: GET /api/linkedin/auth
 * Initiates LinkedIn OAuth 2.0 authorization flow with OpenID Connect scopes.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || DEFAULT_ORG_ID;
    const redirectPath = searchParams.get("redirect") || "/linkedin";

    const clientId = (
      process.env.LINKEDIN_MEMBER_CLIENT_ID ||
      process.env.LINKEDIN_CLIENT_ID ||
      ""
    ).trim();

    const redirectUri = (
      process.env.LINKEDIN_MEMBER_REDIRECT_URI ||
      process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI ||
      "http://localhost:5000/api/linkedin/auth/callback"
    ).trim();

    const scopes = "openid profile email w_member_social";
    const statePayload = JSON.stringify({ orgId, redirect: redirectPath });

    if (!clientId) {
      // Delegate to Express backend auth endpoint if local env vars missing in Next context
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      return NextResponse.redirect(`${backendUrl}/api/linkedin/auth?orgId=${orgId}&redirect=${redirectPath}`);
    }

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(statePayload)}&scope=${encodeURIComponent(scopes)}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("[NEXT API LINKEDIN AUTH ERROR]", error);
    return NextResponse.json({ error: "Failed to initiate LinkedIn OAuth", details: error.message }, { status: 500 });
  }
}
