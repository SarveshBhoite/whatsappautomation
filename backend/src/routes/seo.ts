import { Router, Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const router = Router();

function sanitizeAndFormatUrl(inputUrl: string): string {
  let clean = inputUrl.trim();
  clean = clean.replace(/^['"]|['"]$/g, "");
  
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean;
  }
  return clean;
}

// Fetch website HTML with smart fallback
async function fetchWebsiteHtml(initialUrl: string): Promise<{ html: string; finalUrl: string; loadTimeMs: number }> {
  const attempts = [
    initialUrl,
    initialUrl.startsWith("https://") ? initialUrl.replace("https://", "http://") : initialUrl,
    initialUrl.includes("www.") ? initialUrl : initialUrl.replace("://", "://www.")
  ];

  let lastError = "";
  for (const target of attempts) {
    const startTime = Date.now();
    try {
      const response = await axios.get(target, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 AutomationCRM-SEO-Audit/1.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9"
        },
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500
      });

      const loadTimeMs = Date.now() - startTime;
      return {
        html: typeof response.data === "string" ? response.data : JSON.stringify(response.data),
        finalUrl: response.request?.res?.responseUrl || target,
        loadTimeMs
      };
    } catch (err: any) {
      lastError = err.message || "Connection timed out";
    }
  }

  throw new Error(`Website unreachable: ${lastError}. Please verify the domain is online and active.`);
}

// Full Google PageSpeed Insights API v5 fetcher with automatic 403 fallback
async function fetchGooglePageSpeedData(targetUrl: string, strategy: "mobile" | "desktop" = "mobile") {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY;

  const makeRequest = async (key?: string) => {
    const baseUrl = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES&strategy=${strategy.toUpperCase()}`;
    const urlWithKey = key ? `${baseUrl}&key=${key}` : baseUrl;
    return await axios.get(urlWithKey, { timeout: 25000 });
  };

  let res;
  try {
    if (apiKey) {
      console.log(`[SEO AUDIT] Requesting Google PageSpeed API v5 (${strategy.toUpperCase()}) with API Key...`);
      res = await makeRequest(apiKey);
    } else {
      console.log(`[SEO AUDIT] Requesting Google PageSpeed API v5 (${strategy.toUpperCase()}) without API Key...`);
      res = await makeRequest();
    }
  } catch (err: any) {
    if (err?.response?.status === 403 || err?.response?.status === 400) {
      console.warn("[SEO AUDIT] PageSpeed API key rejected/restricted (403/400). Retrying with public endpoint fallback...");
      try {
        res = await makeRequest(); // Fallback without key
      } catch (fallbackErr: any) {
        console.warn("[SEO AUDIT] Google PageSpeed API fallback failed:", fallbackErr.message);
        return null;
      }
    } else {
      console.warn("[SEO AUDIT] Google PageSpeed API request error:", err?.response?.data || err.message);
      return null;
    }
  }

  const data = res?.data;
  const lighthouse = data?.lighthouseResult;
  if (!lighthouse) return null;

  const categories = lighthouse.categories || {};
  const audits = lighthouse.audits || {};
  const loadingExp = data.loadingExperience || {};

  // Core Metrics
  const metrics = {
    fcp: {
      displayValue: audits["first-contentful-paint"]?.displayValue || "N/A",
      score: audits["first-contentful-paint"]?.score ?? 1,
      numericValue: audits["first-contentful-paint"]?.numericValue || 0
    },
    lcp: {
      displayValue: audits["largest-contentful-paint"]?.displayValue || "N/A",
      score: audits["largest-contentful-paint"]?.score ?? 1,
      numericValue: audits["largest-contentful-paint"]?.numericValue || 0
    },
    tbt: {
      displayValue: audits["total-blocking-time"]?.displayValue || "N/A",
      score: audits["total-blocking-time"]?.score ?? 1,
      numericValue: audits["total-blocking-time"]?.numericValue || 0
    },
    cls: {
      displayValue: audits["cumulative-layout-shift"]?.displayValue || "0",
      score: audits["cumulative-layout-shift"]?.score ?? 1,
      numericValue: audits["cumulative-layout-shift"]?.numericValue || 0
    },
    speedIndex: {
      displayValue: audits["speed-index"]?.displayValue || "N/A",
      score: audits["speed-index"]?.score ?? 1
    },
    tti: {
      displayValue: audits["interactive"]?.displayValue || "N/A",
      score: audits["interactive"]?.score ?? 1
    },
    ttfb: {
      displayValue: audits["server-response-time"]?.displayValue || "N/A",
      score: audits["server-response-time"]?.score ?? 1
    }
  };

  // Detailed Categorized Audits (Opportunities & Passed Checks)
  const opportunities: Array<{ id: string; title: string; description: string; displayValue?: string; category: string }> = [];
  const passedAudits: Array<{ id: string; title: string; category: string }> = [];

  Object.keys(audits).forEach((auditKey) => {
    const audit = audits[auditKey];
    if (!audit || !audit.title) return;

    const catName = auditKey.startsWith("seo") ? "SEO" : auditKey.startsWith("access") ? "Accessibility" : auditKey.startsWith("is-") || auditKey.startsWith("uses-") ? "Best Practices" : "Performance";

    if (audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode !== "notApplicable" && audit.scoreDisplayMode !== "informative") {
      opportunities.push({
        id: audit.id || auditKey,
        title: audit.title,
        description: audit.description ? audit.description.split(". ")[0] + "." : "",
        displayValue: audit.displayValue || "",
        category: catName
      });
    } else if (audit.score >= 0.9) {
      passedAudits.push({
        id: audit.id || auditKey,
        title: audit.title,
        category: catName
      });
    }
  });

  return {
    strategy,
    overallExperience: loadingExp.overall_category || "FAST",
    scores: {
      performance: Math.round((categories.performance?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories["best-practices"]?.score || 0) * 100)
    },
    metrics,
    opportunities: opportunities.slice(0, 15),
    passedAuditsCount: passedAudits.length,
    passedAuditsSample: passedAudits.slice(0, 15)
  };
}

// POST /api/seo/audit - Conduct 360-degree web SEO audit
router.post("/audit", async (req: Request, res: Response) => {
  try {
    const { url, strategy = "mobile" } = req.body;
    if (!url || typeof url !== "string" || !url.trim()) {
      return res.status(400).json({ error: "Please enter a valid website URL to audit (e.g. example.com)." });
    }

    const formattedUrl = sanitizeAndFormatUrl(url);

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(formattedUrl);
    } catch {
      return res.status(400).json({ error: "Invalid website URL format. Example: example.com or https://mysite.com" });
    }

    console.log(`[SEO AUDIT] Initiating 360-degree audit for: ${formattedUrl} (${strategy})...`);

    const [websiteDataResult, pageSpeedData] = await Promise.allSettled([
      fetchWebsiteHtml(formattedUrl),
      fetchGooglePageSpeedData(formattedUrl, strategy === "desktop" ? "desktop" : "mobile")
    ]);

    if (websiteDataResult.status === "rejected") {
      return res.status(422).json({
        error: websiteDataResult.reason?.message || `Unable to reach ${formattedUrl}. Domain may be offline or blocking requests.`
      });
    }

    const { html, finalUrl, loadTimeMs } = websiteDataResult.value;
    const pageSpeed = pageSpeedData.status === "fulfilled" ? pageSpeedData.value : null;
    const isHttps = finalUrl.startsWith("https://");
    const $ = cheerio.load(html);

    // 1. Title Audit
    const titleText = $("title").first().text().trim();
    const titleLength = titleText.length;
    let titleStatus: "good" | "warning" | "error" = "good";
    let titleMsg = "Page title length is optimal (30-60 characters).";

    if (titleLength === 0) {
      titleStatus = "error";
      titleMsg = "Missing page title tag.";
    } else if (titleLength < 30) {
      titleStatus = "warning";
      titleMsg = `Page title is short (${titleLength} chars). Recommended: 30-60 chars.`;
    } else if (titleLength > 65) {
      titleStatus = "warning";
      titleMsg = `Page title may be truncated (${titleLength} chars). Recommended: 30-60 chars.`;
    }

    // 2. Meta Description Audit
    const metaDescription = $('meta[name="description" i]').attr("content")?.trim() || "";
    const descLength = metaDescription.length;
    let descStatus: "good" | "warning" | "error" = "good";
    let descMsg = "Meta description length is optimal (120-160 characters).";

    if (descLength === 0) {
      descStatus = "error";
      descMsg = "Missing meta description tag.";
    } else if (descLength < 70) {
      descStatus = "warning";
      descMsg = `Meta description is short (${descLength} chars). Recommended: 120-160 chars.`;
    } else if (descLength > 165) {
      descStatus = "warning";
      descMsg = `Meta description will be truncated (${descLength} chars). Recommended: 120-160 chars.`;
    }

    // 3. Headings Hierarchy Audit (Extracting Full Lists)
    const h1Tags: string[] = [];
    $("h1").each((_, el) => {
      const text = $(el).text().trim();
      if (text) h1Tags.push(text);
    });

    const h2Tags: string[] = [];
    $("h2").each((_, el) => {
      const text = $(el).text().trim();
      if (text) h2Tags.push(text);
    });

    const h3Tags: string[] = [];
    $("h3").each((_, el) => {
      const text = $(el).text().trim();
      if (text) h3Tags.push(text);
    });

    let h1Status: "good" | "warning" | "error" = "good";
    let h1Msg = "Exactly 1 H1 heading found.";
    if (h1Tags.length === 0) {
      h1Status = "error";
      h1Msg = "No H1 heading found on page. Recommended to add 1 main H1 tag.";
    } else if (h1Tags.length > 1) {
      h1Status = "warning";
      h1Msg = `Multiple H1 headings found (${h1Tags.length}). Recommended to use 1 main H1 tag.`;
    }

    // 4. OpenGraph Social Sharing Preview
    const ogTitle = $('meta[property="og:title" i]').attr("content")?.trim() || "";
    const ogDescription = $('meta[property="og:description" i]').attr("content")?.trim() || "";
    const ogImage = $('meta[property="og:image" i]').attr("content")?.trim() || "";
    const twitterCard = $('meta[name="twitter:card" i]').attr("content")?.trim() || "";

    const hasOgData = Boolean(ogTitle || ogImage);

    // 5. Image ALT Attributes Detailed Audit (Lists image URLs missing alt text)
    const totalImages = $("img").length;
    const missingAltImages: Array<{ src: string; alt: string }> = [];
    const validAltImages: Array<{ src: string; alt: string }> = [];

    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src") || "";
      const alt = $(el).attr("alt");
      
      if (!alt || alt.trim() === "") {
        if (src && missingAltImages.length < 15) {
          missingAltImages.push({ src, alt: "(Missing ALT)" });
        }
      } else {
        if (src && validAltImages.length < 15) {
          validAltImages.push({ src, alt: alt.trim() });
        }
      }
    });

    const imagesWithoutAltCount = totalImages - validAltImages.length;
    const altCoveragePercent = totalImages > 0 
      ? Math.round(((totalImages - missingAltImages.length) / totalImages) * 100)
      : 100;

    // 6. Links Audit (Internal vs External)
    let totalLinks = 0;
    let internalLinks = 0;
    let externalLinks = 0;
    $("a[href]").each((_, el) => {
      totalLinks++;
      const href = $(el).attr("href") || "";
      if (href.startsWith("http://") || href.startsWith("https://")) {
        if (href.includes(parsedUrl.hostname)) {
          internalLinks++;
        } else {
          externalLinks++;
        }
      } else if (href.startsWith("/") || href.startsWith("#") || !href.includes(":")) {
        internalLinks++;
      }
    });

    // 7. Technical & Security Checks
    const canonicalUrl = $('link[rel="canonical" i]').attr("href")?.trim() || "";
    const viewportMeta = $('meta[name="viewport" i]').attr("content")?.trim() || "";
    const htmlLang = $("html").attr("lang")?.trim() || "";
    const robotsMeta = $('meta[name="robots" i]').attr("content")?.trim() || "";

    // 8. Word Count Estimate
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = bodyText ? bodyText.split(" ").length : 0;

    // Score Calculations
    let onPageScore = 100;
    if (titleStatus === "error") onPageScore -= 30;
    else if (titleStatus === "warning") onPageScore -= 15;

    if (descStatus === "error") onPageScore -= 30;
    else if (descStatus === "warning") onPageScore -= 15;

    if (h1Status === "error") onPageScore -= 20;
    else if (h1Status === "warning") onPageScore -= 10;

    if (altCoveragePercent < 80) onPageScore -= 10;
    if (wordCount < 300) onPageScore -= 10;

    onPageScore = Math.max(20, onPageScore);

    let socialScore = 100;
    if (!ogTitle) socialScore -= 30;
    if (!ogImage) socialScore -= 40;
    if (!ogDescription) socialScore -= 20;
    if (!twitterCard) socialScore -= 10;
    socialScore = Math.max(10, socialScore);

    let techScore = pageSpeed ? pageSpeed.scores.performance : 100;
    if (!isHttps) techScore -= 25;
    if (!canonicalUrl) techScore -= 15;
    if (!viewportMeta) techScore -= 20;
    if (!htmlLang) techScore -= 10;
    techScore = Math.max(20, techScore);

    const overallScore = pageSpeed 
      ? Math.round((pageSpeed.scores.seo * 0.40) + (pageSpeed.scores.performance * 0.35) + (socialScore * 0.25))
      : Math.round((onPageScore * 0.45) + (socialScore * 0.25) + (techScore * 0.30));

    // 9. Generate Groq AI Executive Action Plan
    let aiRecommendations = [
      "Ensure page title and main H1 tag target your primary business keywords.",
      "Add alt text to all missing image tags to boost image search ranking and accessibility.",
      "Configure social OpenGraph meta tags (og:title, og:image) for rich WhatsApp and LinkedIn previews."
    ];

    const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    if (groqKey) {
      try {
        const prompt = `
          You are a Google Lighthouse & SEO Specialist. 
          Analyze the following website audit data for: "${finalUrl}"
          
          Metrics:
          - Overall Score: ${overallScore}/100
          - On-Page Score: ${onPageScore}/100 | Tech Score: ${techScore}/100 | Social Score: ${socialScore}/100
          - Title: "${titleText}" (${titleLength} chars, Status: ${titleStatus})
          - Meta Description: "${metaDescription}" (${descLength} chars, Status: ${descStatus})
          - H1 Headings: ${h1Tags.length} found (${h1Tags.join(" | ") || "None"})
          - Missing Image Alt: ${missingAltImages.length}/${totalImages}
          ${pageSpeed ? `- Google Lighthouse Performance: ${pageSpeed.scores.performance}/100, FCP: ${pageSpeed.metrics.fcp.displayValue}, LCP: ${pageSpeed.metrics.lcp.displayValue}, CLS: ${pageSpeed.metrics.cls.displayValue}` : ""}
          ${pageSpeed?.opportunities.length ? `- Top Google Opportunities: ${pageSpeed.opportunities.map((o: any) => o.title).join("; ")}` : ""}
          
          Provide a clean, bulleted 4-point Executive Action Plan to fix vulnerabilities and boost search rankings. 
          Be specific, direct, concise. Plain markdown bullet points only:
        `;

        const aiRes = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are a senior SEO consultant providing direct actionable website optimization recommendations." },
              { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 300
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqKey}`
            },
            timeout: 10000
          }
        );

        const content = aiRes.data?.choices?.[0]?.message?.content;
        if (content && content.trim()) {
          const lines = content.split("\n").map((l: string) => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
          if (lines.length > 0) {
            aiRecommendations = lines.slice(0, 5);
          }
        }
      } catch (aiErr: any) {
        console.warn("[SEO AUDIT] Groq AI recommendation fallback:", aiErr.message);
      }
    }

    const auditData = {
      url: finalUrl,
      domain: parsedUrl.hostname,
      scannedAt: new Date().toISOString(),
      loadTimeMs,
      scores: {
        overall: overallScore,
        onPage: onPageScore,
        social: socialScore,
        technical: techScore
      },
      pageSpeed,
      title: {
        value: titleText,
        length: titleLength,
        status: titleStatus,
        message: titleMsg
      },
      description: {
        value: metaDescription,
        length: descLength,
        status: descStatus,
        message: descMsg
      },
      headings: {
        h1Count: h1Tags.length,
        h1List: h1Tags,
        h2Count: h2Tags.length,
        h2List: h2Tags.slice(0, 15),
        h3Count: h3Tags.length,
        h3List: h3Tags.slice(0, 15),
        status: h1Status,
        message: h1Msg
      },
      openGraph: {
        title: ogTitle || titleText,
        description: ogDescription || metaDescription,
        image: ogImage,
        twitterCard: twitterCard || "summary_large_image",
        status: hasOgData ? "good" : "warning"
      },
      images: {
        total: totalImages,
        missingAltCount: missingAltImages.length,
        missingAltList: missingAltImages,
        validAltList: validAltImages,
        coveragePercent: altCoveragePercent
      },
      links: {
        total: totalLinks,
        internal: internalLinks,
        external: externalLinks
      },
      technical: {
        isHttps,
        canonicalUrl,
        viewportMeta: Boolean(viewportMeta),
        htmlLang: htmlLang || "Not set",
        robotsMeta: robotsMeta || "index, follow"
      },
      content: {
        wordCount
      },
      aiRecommendations
    };

    res.status(200).json(auditData);
  } catch (error: any) {
    console.error("[SEO AUDIT ERROR]", error);
    res.status(500).json({ error: error.message || "SEO audit scan failed." });
  }
});

export default router;
