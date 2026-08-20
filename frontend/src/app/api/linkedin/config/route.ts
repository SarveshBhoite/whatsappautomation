import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Next.js App Router API Route: GET /api/linkedin/config
 * Retrieves LinkedIn configuration, profile details, and sync logs.
 */
export async function GET(request: Request) {
  try {
    const orgId = request.headers.get("x-organization-id") || "";
    if (!orgId) {
      return NextResponse.json({ error: "Missing x-organization-id header" }, { status: 400 });
    }

    const res = await fetch(`${API_BASE_URL}/api/linkedin/config`, {
      headers: { "x-organization-id": orgId },
      cache: "no-store"
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[NEXT API LINKEDIN CONFIG ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch LinkedIn config", details: error.message }, { status: 500 });
  }
}
