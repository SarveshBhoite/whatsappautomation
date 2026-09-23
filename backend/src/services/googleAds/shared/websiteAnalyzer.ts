import axios from "axios";
import * as url from "url";
import * as dns from "dns/promises";
import * as net from "net";

export interface DiscoveredLink {
  text: string;
  url: string;
}

export interface SchemaOrgData {
  name?: string;
  description?: string;
  telephone?: string;
  email?: string;
  address?: string;
  addressLocality?: string;
  addressRegion?: string;
  addressCountry?: string;
  postalCode?: string;
  url?: string;
  sameAs?: string[];
  geo?: { latitude?: number; longitude?: number };
  priceRange?: string;
  brand?: string;
  foundingDate?: string;
}

export interface WebsiteAnalysisResult {
  success: boolean;
  url: string;
  title?: string;
  description?: string;
  headings?: string[];
  mainTextSnippet?: string;
  discoveredLinks?: DiscoveredLink[];
  error?: string;
  // Directly extracted contact info
  extractedEmails?: string[];
  extractedPhones?: string[];
  extractedWhatsapp?: string[];
  extractedYoutubeLinks?: string[];
  extractedAddress?: string;
  // Schema.org structured data from JSON-LD
  schemaOrg?: SchemaOrgData;
  // Open Graph metadata
  ogData?: { title?: string; description?: string; image?: string; siteName?: string };
}

/**
 * Checks if an IP address belongs to private/internal/loopback ranges.
 */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts[0] === 127) return true;
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 0) return true;
    return false;
  } else if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
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
 * Parses Schema.org JSON-LD blocks from HTML.
 * Merges all found LD+JSON objects, preferring Organization/LocalBusiness types.
 */
function parseSchemaOrg(html: string): SchemaOrgData {
  const result: SchemaOrgData = {};
  const ldJsonRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  const preferred: any[] = [];
  const fallback: any[] = [];

  while ((match = ldJsonRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      const objs = Array.isArray(parsed) ? parsed : [parsed];
      for (const obj of objs) {
        const type = String(obj["@type"] || "").toLowerCase();
        if (
          type.includes("organization") ||
          type.includes("localbusiness") ||
          type.includes("store") ||
          type.includes("corporation") ||
          type.includes("company") ||
          type.includes("brand")
        ) {
          preferred.push(obj);
        } else {
          fallback.push(obj);
        }
      }
    } catch {
      // skip malformed JSON-LD
    }
  }

  const candidates = preferred.length > 0 ? preferred : fallback;
  for (const obj of candidates) {
    if (!result.name && obj.name) result.name = String(obj.name).trim();
    if (!result.description && obj.description) result.description = String(obj.description).trim().slice(0, 500);
    if (!result.telephone && obj.telephone) result.telephone = String(obj.telephone).trim();
    if (!result.email && obj.email) result.email = String(obj.email).trim();
    if (!result.url && obj.url) result.url = String(obj.url).trim();
    if (!result.priceRange && obj.priceRange) result.priceRange = String(obj.priceRange).trim();
    if (!result.foundingDate && obj.foundingDate) result.foundingDate = String(obj.foundingDate).trim();
    if (!result.brand && obj.brand) {
      result.brand = typeof obj.brand === "object" ? (obj.brand.name || "") : String(obj.brand);
    }
    if (Array.isArray(obj.sameAs) && (!result.sameAs || result.sameAs.length === 0)) {
      result.sameAs = obj.sameAs.map(String).slice(0, 5);
    }
    if (!result.geo && obj.geo) {
      result.geo = {
        latitude: obj.geo.latitude ? Number(obj.geo.latitude) : undefined,
        longitude: obj.geo.longitude ? Number(obj.geo.longitude) : undefined
      };
    }
    // Address parsing
    const addr = obj.address;
    if (addr) {
      if (typeof addr === "string") {
        if (!result.address) result.address = addr.trim();
      } else if (typeof addr === "object") {
        const parts: string[] = [];
        if (addr.streetAddress) parts.push(String(addr.streetAddress));
        if (addr.addressLocality) {
          result.addressLocality = String(addr.addressLocality);
          parts.push(String(addr.addressLocality));
        }
        if (addr.addressRegion) {
          result.addressRegion = String(addr.addressRegion);
          parts.push(String(addr.addressRegion));
        }
        if (addr.postalCode) {
          result.postalCode = String(addr.postalCode);
          parts.push(String(addr.postalCode));
        }
        if (addr.addressCountry) {
          result.addressCountry = String(addr.addressCountry);
          parts.push(String(addr.addressCountry));
        }
        if (parts.length > 0 && !result.address) result.address = parts.join(", ");
      }
    }
  }

  return result;
}

/**
 * Extract Open Graph metadata from HTML.
 */
function parseOgData(html: string): { title?: string; description?: string; image?: string; siteName?: string } {
  const og: Record<string, string> = {};
  const ogRegex = /<meta[^>]*property=["']og:([^"']+)["'][^>]*content=["']([^"']*)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = ogRegex.exec(html)) !== null) {
    og[m[1].trim()] = m[2].trim();
  }
  return {
    title: og["title"],
    description: og["description"],
    image: og["image"],
    siteName: og["site_name"]
  };
}

/**
 * Extract contact info (emails, phones, WhatsApp) directly from HTML.
 */
function extractContactFromHtml(html: string): {
  emails: string[];
  phones: string[];
  whatsapp: string[];
  youtubeLinks: string[];
  address?: string;
} {
  const emails: string[] = [];
  const phones: string[] = [];
  const whatsapp: string[] = [];
  let address: string | undefined;

  // --- Emails: mailto: hrefs first ---
  const seenEmails = new Set<string>();
  const mailtoRegex = /href=["']mailto:([^"'\s?]+)/gi;
  let em: RegExpExecArray | null;
  while ((em = mailtoRegex.exec(html)) !== null) {
    const e = em[1].toLowerCase().trim();
    if (!seenEmails.has(e) && !e.includes("example") && !e.includes("your@") && !e.includes("noreply")) {
      seenEmails.add(e);
      emails.push(em[1].trim());
    }
  }
  // Fallback: scan text for email pattern
  if (emails.length === 0) {
    const strippedForEmail = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "");
    const textEmailRegex = /\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/g;
    let te: RegExpExecArray | null;
    while ((te = textEmailRegex.exec(strippedForEmail)) !== null && emails.length < 3) {
      const e = te[1].toLowerCase();
      if (
        !seenEmails.has(e) &&
        !e.includes("example") &&
        !e.includes("noreply") &&
        !e.endsWith(".png") &&
        !e.endsWith(".jpg") &&
        !e.endsWith(".gif") &&
        !e.includes("@sentry") &&
        !e.includes("@w3") &&
        e.length < 80
      ) {
        seenEmails.add(e);
        emails.push(te[1]);
      }
    }
  }

  // --- Phones: tel: hrefs first ---
  const seenPhones = new Set<string>();
  const telHrefRegex = /href=["']tel:([^"'\s]+)/gi;
  let ph: RegExpExecArray | null;
  while ((ph = telHrefRegex.exec(html)) !== null) {
    const raw = ph[1].trim();
    const digits = raw.replace(/[^\d]/g, "");
    if (digits.length >= 7 && digits.length <= 15 && !seenPhones.has(raw)) {
      seenPhones.add(raw);
      phones.push(raw);
    }
  }
  // Fallback: Indian mobile (6-9 followed by 9 digits) in visible text
  if (phones.length === 0) {
    const strippedHtml = html.replace(/<[^>]+>/g, " ");
    const indianPhoneRegex = /(?:\+91[\s\-]?|0)?[6-9]\d{9}\b/g;
    let pm: RegExpExecArray | null;
    while ((pm = indianPhoneRegex.exec(strippedHtml)) !== null && phones.length < 3) {
      const p = pm[0].replace(/\s/g, "");
      if (!seenPhones.has(p) && p.length >= 10) {
        seenPhones.add(p);
        phones.push(pm[0].trim());
      }
    }
  }
  // Fallback: International phone pattern
  if (phones.length === 0) {
    const strippedHtml = html.replace(/<[^>]+>/g, " ");
    const intlRegex = /\+\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}/g;
    let ip: RegExpExecArray | null;
    while ((ip = intlRegex.exec(strippedHtml)) !== null && phones.length < 3) {
      const p = ip[0].trim();
      const digits = p.replace(/[^\d]/g, "");
      if (digits.length >= 7 && !seenPhones.has(p)) {
        seenPhones.add(p);
        phones.push(p);
      }
    }
  }

  // --- WhatsApp: wa.me or api.whatsapp.com links ---
  const seenWa = new Set<string>();
  const waRegex = /href=["'][^"']*(wa\.me\/|api\.whatsapp\.com\/send[?][^"']*phone=)(\+?[0-9]{7,15})/gi;
  let wa: RegExpExecArray | null;
  while ((wa = waRegex.exec(html)) !== null) {
    let num = wa[2].replace(/[^\d]/g, "");
    if (num.length >= 7 && !seenWa.has(num)) {
      seenWa.add(num);
      whatsapp.push("+" + num);
    }
  }

  // --- Address: <address> HTML tags ---
  const addressTagRegex = /<address[^>]*>([\s\S]*?)<\/address>/gi;
  let addrMatch: RegExpExecArray | null;
  while ((addrMatch = addressTagRegex.exec(html)) !== null) {
    const cleaned = addrMatch[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned.length > 10 && cleaned.length < 400) {
      address = cleaned;
      break;
    }
  }

  // --- YouTube Links: links pointing to youtube.com or youtu.be ---
  const youtubeLinks: string[] = [];
  const seenYt = new Set<string>();
  const ytRegex = /href=["'](https?:\/\/(?:www\.)?(?:youtube\.com\/(?:channel\/|c\/|user\/|@|watch\?v=|embed\/|shorts\/)[\w\-_?&=%]+|youtu\.be\/[\w\-_?&=%]+))["']/gi;
  let ytMatch: RegExpExecArray | null;
  while ((ytMatch = ytRegex.exec(html)) !== null && youtubeLinks.length < 8) {
    const ytUrl = ytMatch[1].trim();
    const cleanYt = ytUrl.replace(/\/+$/, "");
    if (!seenYt.has(cleanYt.toLowerCase())) {
      seenYt.add(cleanYt.toLowerCase());
      youtubeLinks.push(ytUrl);
    }
  }

  return { emails, phones, whatsapp, youtubeLinks, address };
}

/**
 * Main website analyzer: scrapes the target URL and extracts rich business intelligence.
 */
export async function analyzeWebsiteUrl(targetUrl: string): Promise<WebsiteAnalysisResult> {
  const cleanedUrl = (targetUrl || "").trim().replace(/^["'(\[]+|["')\].,]+$/g, "");
  const safetyCheck = await isSafeUrlWithDns(cleanedUrl);
  if (!safetyCheck.safe) {
    return {
      success: false,
      url: cleanedUrl,
      error: safetyCheck.error || "Invalid or restricted URL."
    };
  }

  try {
    const response = await axios.get(cleanedUrl, {
      timeout: 12000,
      maxContentLength: 6 * 1024 * 1024,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache"
      }
    });

    const html = typeof response.data === "string" ? response.data : "";
    if (!html) {
      return { success: false, url: targetUrl, error: "No HTML content received from website." };
    }

    const isBotChallenge = (text?: string): boolean => {
      if (!text) return false;
      const t = text.toLowerCase();
      return (
        t.includes("javascript is disabled") ||
        t.includes("enable javascript") ||
        t.includes("verify that you're not a robot") ||
        t.includes("verify you are a human") ||
        t.includes("robot or human") ||
        t.includes("access denied") ||
        t.includes("cloudflare") ||
        t.includes("attention required") ||
        t.includes("security check") ||
        t.includes("captcha") ||
        t.includes("ddos protection")
      );
    };

    // --- Title ---
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : undefined;
    if (isBotChallenge(title)) title = undefined;

    // --- Meta Description ---
    const metaDescMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    let description = metaDescMatch ? metaDescMatch[1].trim() : undefined;
    if (isBotChallenge(description)) description = undefined;

    // --- Headings (H1 + H2) ---
    const headings: string[] = [];
    const h1Regex = /<h1[^>]*>([^<]+)<\/h1>/gi;
    let h1Match;
    while ((h1Match = h1Regex.exec(html)) !== null && headings.length < 5) {
      const cleanH1 = h1Match[1].replace(/<[^>]+>/g, "").trim();
      if (cleanH1 && !headings.includes(cleanH1) && !isBotChallenge(cleanH1)) headings.push(cleanH1);
    }
    const h2Regex = /<h2[^>]*>([^<]+)<\/h2>/gi;
    let h2Match;
    while ((h2Match = h2Regex.exec(html)) !== null && headings.length < 10) {
      const cleanH2 = h2Match[1].replace(/<[^>]+>/g, "").trim();
      if (cleanH2 && !headings.includes(cleanH2) && !isBotChallenge(cleanH2)) headings.push(cleanH2);
    }

    // --- Main text snippet ---
    const stripped = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    let mainTextSnippet = stripped.slice(0, 2500);
    if (isBotChallenge(mainTextSnippet)) mainTextSnippet = "";

    // --- Schema.org / Open Graph / Contact extraction ---
    const schemaOrg = parseSchemaOrg(html);
    const ogData = parseOgData(html);
    const contactInfo = extractContactFromHtml(html);

    // Prefer schema.org phone/email if regex extraction found nothing
    const finalEmails =
      contactInfo.emails.length > 0
        ? contactInfo.emails
        : schemaOrg.email
        ? [schemaOrg.email]
        : [];
    const finalPhones =
      contactInfo.phones.length > 0
        ? contactInfo.phones
        : schemaOrg.telephone
        ? [schemaOrg.telephone]
        : [];
    const finalAddress = contactInfo.address || schemaOrg.address;

    // --- Internal links discovery ---
    const discoveredLinks: DiscoveredLink[] = [];
    try {
      const parsedBase = new url.URL(cleanedUrl);
      const linkRegex = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
      let linkMatch;
      const seenUrls = new Set<string>();

      while ((linkMatch = linkRegex.exec(html)) !== null && discoveredLinks.length < 15) {
        const rawHref = linkMatch[1].trim();
        const rawText = linkMatch[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

        if (
          !rawText ||
          rawText.length < 3 ||
          rawText.length > 40 ||
          isBotChallenge(rawText) ||
          /^(login|sign in|sign up|register|cart|checkout|privacy policy|terms|cookie)/i.test(rawText)
        ) {
          continue;
        }

        try {
          const resolvedUrl = new url.URL(rawHref, cleanedUrl).toString();
          const parsedResolved = new url.URL(resolvedUrl);
          const baseDomain = parsedBase.hostname.replace(/^www\./, "");
          const targetDomain = parsedResolved.hostname.replace(/^www\./, "");
          if (baseDomain !== targetDomain) continue;
          const normalized = resolvedUrl.replace(/#.*$/, "").replace(/\/+$/, "");
          const normalizedBase = cleanedUrl.replace(/#.*$/, "").replace(/\/+$/, "");
          if (normalized === normalizedBase || seenUrls.has(normalized)) continue;
          if (/\.(jpg|jpeg|png|gif|svg|pdf|zip|css|js)$/i.test(parsedResolved.pathname)) continue;
          seenUrls.add(normalized);
          discoveredLinks.push({ text: rawText, url: resolvedUrl });
        } catch {
          continue;
        }
      }
    } catch {}

    return {
      success: true,
      url: targetUrl,
      title,
      description,
      headings,
      mainTextSnippet,
      discoveredLinks,
      schemaOrg,
      ogData,
      extractedEmails: finalEmails,
      extractedPhones: finalPhones,
      extractedWhatsapp: contactInfo.whatsapp,
      extractedYoutubeLinks: contactInfo.youtubeLinks,
      extractedAddress: finalAddress
    };
  } catch (err: any) {
    return {
      success: false,
      url: targetUrl,
      error: `Could not access website: ${err.message}`
    };
  }
}
