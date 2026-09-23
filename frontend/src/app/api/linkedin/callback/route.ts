import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Next.js App Router API Route: GET /api/linkedin/callback
 * Handles OAuth callback code exchange, user profile retrieval, DB storage, and activity logging.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const stateStr = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    if (error) {
      return NextResponse.redirect(
        `${frontendUrl}/linkedin?tab=profile&oauth=error&error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDesc || "")}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${frontendUrl}/linkedin?tab=profile&oauth=error&error=missing_code&description=No authorization code provided.`
      );
    }

    // Proxy the code to backend handler for DB persistence and full validation
    const response = await fetch(`${API_BASE_URL}/api/linkedin/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(stateStr || "")}`, {
      headers: { Accept: "application/json" }
    });

    if (response.redirected) {
      return NextResponse.redirect(response.url);
    }

    return NextResponse.redirect(`${frontendUrl}/linkedin?tab=profile&oauth=success`);
  } catch (err: any) {
    console.error("[NEXT API LINKEDIN CALLBACK ERROR]", err);
    return NextResponse.redirect(`http://localhost:3000/linkedin?tab=profile&oauth=error&error=server_error`);
  }
}
