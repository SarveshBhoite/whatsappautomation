import { Router, Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const router = Router();

// Robust URL normalizer & auto-formatter
function sanitizeAndFormatUrl(inputUrl: string): string {
  let clean = inputUrl.trim();
  // Remove quotes or stray spaces
  clean = clean.replace(/^['"]|['"]$/g, "");
  
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean;
  }
  return clean;
}

// Fetch website HTML with smart fallback (tries https -> http -> www)
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
        validateStatus: (status) => status < 500 // Accept 2xx, 3xx, 4xx responses
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

// Helper to fetch Google PageSpeed Insights & Lighthouse Metrics
async function fetchGooglePageSpeedData(targetUrl: string) {
  try {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.GOOGLE_API_KEY;
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES${apiKey ? `&key=${apiKey}` : ""}`;
    
    const res = await axios.get(apiUrl, { timeout: 12000 });
    const lighthouse = res.data?.lighthouseResult;
    if (!lighthouse) return null;

    const categories = lighthouse.categories || {};
    const audits = lighthouse.audits || {};

    return {
      performanceScore: Math.round((categories.performance?.score || 0) * 100),
      seoScore: Math.round((categories.seo?.score || 0) * 100),
      accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
      bestPracticesScore: Math.round((categories["best-practices"]?.score || 0) * 100),
      fcp: audits["first-contentful-paint"]?.displayValue || "N/A",
      lcp: audits["largest-contentful-paint"]?.displayValue || "N/A",
      cls: audits["cumulative-layout-shift"]?.displayValue || "0",
      speedIndex: audits["speed-index"]?.displayValue || "N/A"
    };
  } catch (err: any) {
    console.warn("[SEO AUDIT] Google PageSpeed API request skipped/fallback:", err.message);
    return null;
  }
}

// POST /api/seo/audit - Conduct instant web SEO audit
router.post("/audit", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
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

    console.log(`[SEO AUDIT] Initiating 360-degree audit for: ${formattedUrl}...`);

    let websiteData;
    try {
      websiteData = await fetchWebsiteHtml(formattedUrl);
    } catch (reachErr: any) {
      return res.status(422).json({
        error: reachErr.message || `Unable to connect to ${formattedUrl}. Domain may be offline or blocking scanner.`
      });
    }

    const { html, finalUrl, loadTimeMs } = websiteData;
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

    // 3. Headings Hierarchy Audit
    const h1Tags: string[] = [];
    $("h1").each((_, el) => {
      const text = $(el).text().trim();
      if (text) h1Tags.push(text);
    });
    const h2Count = $("h2").length;
    const h3Count = $("h3").length;

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

    // 5. Image ALT Attributes Audit
    const totalImages = $("img").length;
    let imagesWithoutAlt = 0;
    $("img").each((_, el) => {
      const alt = $(el).attr("alt");
      if (alt === undefined || alt === null || alt.trim() === "") {
        imagesWithoutAlt++;
      }
    });

    const altCoveragePercent = totalImages > 0 
      ? Math.round(((totalImages - imagesWithoutAlt) / totalImages) * 100)
      : 100;

    // 6. Technical & Security Checks
    const canonicalUrl = $('link[rel="canonical" i]').attr("href")?.trim() || "";
    const viewportMeta = $('meta[name="viewport" i]').attr("content")?.trim() || "";
    const htmlLang = $("html").attr("lang")?.trim() || "";
    const robotsMeta = $('meta[name="robots" i]').attr("content")?.trim() || "";

    // 7. Word Count Estimate
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = bodyText ? bodyText.split(" ").length : 0;

    // Fetch Google PageSpeed / Lighthouse in parallel (with fallback)
    const pageSpeedData = await fetchGooglePageSpeedData(finalUrl);

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

    let techScore = pageSpeedData ? pageSpeedData.performanceScore : 100;
    if (!isHttps) techScore -= 25;
    if (!canonicalUrl) techScore -= 15;
    if (!viewportMeta) techScore -= 20;
    if (!htmlLang) techScore -= 10;
    techScore = Math.max(20, techScore);

    const overallScore = pageSpeedData 
      ? Math.round((pageSpeedData.seoScore * 0.40) + (pageSpeedData.performanceScore * 0.35) + (socialScore * 0.25))
      : Math.round((onPageScore * 0.45) + (socialScore * 0.25) + (techScore * 0.30));

    // 8. Generate Groq AI Executive Action Plan
    let aiRecommendations = [
      "Ensure page title and main H1 tag target your primary business keywords.",
      "Add alt text to all missing image tags to boost image search ranking and accessibility.",
      "Configure social OpenGraph meta tags (og:title, og:image) for rich WhatsApp and LinkedIn previews."
    ];

    const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    if (groqKey) {
      try {
        const prompt = `
          You are an elite Google Lighthouse SEO & Web Performance Consultant. 
          Analyze the following website audit data for: "${finalUrl}"
          
          Audit Metrics:
          - Overall Score: ${overallScore}/100
          - On-Page Score: ${onPageScore}/100 | Technical Score: ${techScore}/100 | Social Score: ${socialScore}/100
          - Page Title: "${titleText}" (${titleLength} chars, Status: ${titleStatus})
          - Meta Description: "${metaDescription}" (${descLength} chars, Status: ${descStatus})
          - H1 Headings: ${h1Tags.length} found (${h1Tags.join(" | ") || "None"})
          - Images missing Alt text: ${imagesWithoutAlt} out of ${totalImages} total images
          - Canonical Tag: ${canonicalUrl ? "Present" : "Missing"}
          - HTTPS Security: ${isHttps ? "Secure" : "Insecure"}
          - Page Speed Load Time: ${loadTimeMs}ms
          ${pageSpeedData ? `- Google Lighthouse Performance: ${pageSpeedData.performanceScore}/100, FCP: ${pageSpeedData.fcp}, LCP: ${pageSpeedData.lcp}` : ""}
          
          Provide a clean, bulleted 4-point Executive SEO & Web Action Plan to optimize this website to rank higher on Google search and load faster. 
          Be specific, actionable, direct, and concise. Maximum 4 bullet points. No JSON wrappers, plain markdown bullet points only:
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
      pageSpeed: pageSpeedData,
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
        h2Count,
        h3Count,
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
        missingAlt: imagesWithoutAlt,
        coveragePercent: altCoveragePercent
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
