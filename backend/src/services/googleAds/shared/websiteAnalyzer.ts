import axios from "axios";
import * as url from "url";
import * as dns from "dns/promises";
import * as net from "net";

export interface WebsiteAnalysisResult {
  success: boolean;
  url: string;
  title?: string;
  description?: string;
  headings?: string[];
  mainTextSnippet?: string;
  error?: string;
}

/**
 * Checks if an IP address belongs to private/internal/loopback ranges.
 */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (Private: 172.16 - 172.31)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local / Cloud Metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0/8 (Current network)
    if (parts[0] === 0) return true;
    return false;
  } else if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    // ::1 (Loopback)
    if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;
    // fc00::/7 (Unique local address)
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    // fe80::/10 (Link-local)
    if (lower.startsWith("fe80")) return true;
    return false;
  }
  return true;
}

/**
 * Validates whether a URL is safe to fetch via DNS check.
 */
export async function isSafeUrlWithDns(inputUrl: string): Promise<{ safe: boolean; error?: string }> {
  try {
    const parsed = new url.URL(inputUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { safe: false, error: "Only HTTP and HTTPS protocols are permitted." };
    }

    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".local")
    ) {
      return { safe: false, error: "Access to local or internal domains is restricted." };
    }

    // Resolve DNS to verify IP
    const addresses = await dns.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      return { safe: false, error: "Unable to resolve domain name." };
    }

    for (const record of addresses) {
      if (isPrivateIp(record.address)) {
        return { safe: false, error: "Access to private or local IP ranges is blocked." };
      }
    }

    return { safe: true };
  } catch (err: any) {
    return { safe: false, error: `Invalid URL or DNS resolution failed: ${err.message}` };
  }
}

/**
 * Safely fetches and extracts content from a given website URL.
 */
export async function analyzeWebsiteUrl(targetUrl: string): Promise<WebsiteAnalysisResult> {
  const safetyCheck = await isSafeUrlWithDns(targetUrl);
  if (!safetyCheck.safe) {
    return {
      success: false,
      url: targetUrl,
      error: safetyCheck.error || "Invalid or restricted URL."
    };
  }

  try {
    const response = await axios.get(targetUrl, {
      timeout: 10000,
      maxContentLength: 5 * 1024 * 1024, // 5MB max
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache"
      }
    });

    const html = typeof response.data === "string" ? response.data : "";
    if (!html) {
      return {
        success: false,
        url: targetUrl,
        error: "No HTML content received from website."
      };
    }

    // Extract Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    // Extract Meta Description
    const metaDescMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    const description = metaDescMatch ? metaDescMatch[1].trim() : undefined;

    // Extract Headings (H1, H2)
    const headings: string[] = [];
    const h1Regex = /<h1[^>]*>([^<]+)<\/h1>/gi;
    let h1Match;
    while ((h1Match = h1Regex.exec(html)) !== null && headings.length < 5) {
      const cleanH1 = h1Match[1].replace(/<[^>]+>/g, "").trim();
      if (cleanH1 && !headings.includes(cleanH1)) headings.push(cleanH1);
    }

    const h2Regex = /<h2[^>]*>([^<]+)<\/h2>/gi;
    let h2Match;
    while ((h2Match = h2Regex.exec(html)) !== null && headings.length < 8) {
      const cleanH2 = h2Match[1].replace(/<[^>]+>/g, "").trim();
      if (cleanH2 && !headings.includes(cleanH2)) headings.push(cleanH2);
    }

    // Extract readable text snippets (strip scripts, styles, tags)
    const stripped = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const mainTextSnippet = stripped.slice(0, 1500);

    return {
      success: true,
      url: targetUrl,
      title,
      description,
      headings,
      mainTextSnippet
    };
  } catch (err: any) {
    return {
      success: false,
      url: targetUrl,
      error: `Could not access website: ${err.message}`
    };
  }
}
