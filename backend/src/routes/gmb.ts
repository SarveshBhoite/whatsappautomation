import { Router } from "express";
import prisma from "../utils/prisma";
import { io } from "../index";
import axios from "axios";
import {
  getGoogleAccessToken,
  getGmbLocationPath,
  mapStarRatingToNumber,
  executeAutoReplyIfApplicable,
  syncGmbReviews
} from "../services/gmbSyncService";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123"; // Seeded organization ID for developer/sandbox environment

// 1. GET GMB Configuration
router.get("/config", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;
    
    // Auto-create default config if it doesn't exist yet
    let config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    if (!config) {
      config = await prisma.googleBusinessConfig.create({
        data: {
          organizationId: orgId,
          locationName: "Jisnu Digitals Pune",
          googlePlaceId: "",
          googleReviewUrl: "",
          autoReplyEnabled: false,
          autoReplyMinRating: 4,
          autoReplyTemplate: "Thank you for the review! We appreciate your support.",
        }
      });
    }

    res.status(200).json(config);
  } catch (error: any) {
    console.error("Error fetching GMB config:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. POST Save/Update GMB Configuration
router.post("/config", async (req, res) => {
  try {
    const { 
      orgId = DEFAULT_ORG_ID,
      locationName,
      googlePlaceId,
      googleReviewUrl,
      googleLocationId,
      googleClientId,
      googleClientSecret,
      googleRefreshToken,
      googleAdsCustomerId,
      autoReplyEnabled,
      autoReplyMinRating,
      autoReplyTemplate
    } = req.body;

    const config = await prisma.googleBusinessConfig.upsert({
      where: { organizationId: orgId },
      update: {
        locationName,
        googlePlaceId,
        googleReviewUrl,
        googleLocationId,
        googleClientId,
        googleClientSecret,
        googleRefreshToken,
        googleAdsCustomerId,
        autoReplyEnabled,
        autoReplyMinRating: Number(autoReplyMinRating || 4),
        autoReplyTemplate
      },
      create: {
        organizationId: orgId,
        locationName: locationName || "My Business",
        googlePlaceId,
        googleReviewUrl,
        googleLocationId,
        googleClientId,
        googleClientSecret,
        googleRefreshToken,
        googleAdsCustomerId,
        autoReplyEnabled: Boolean(autoReplyEnabled),
        autoReplyMinRating: Number(autoReplyMinRating || 4),
        autoReplyTemplate
      }
    });

    res.status(200).json(config);
  } catch (error: any) {
    console.error("Error saving GMB config:", error);
    res.status(500).json({ error: error.message });
  }
});

// Real Google OAuth: Redirect to Google Consent screen
router.get("/oauth/connect", (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;
    const redirectPath = (req.query.redirect as string) || "/";
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/gmb/oauth/callback";

    if (!clientId) {
      return res.status(400).send("GOOGLE_CLIENT_ID is not configured in backend .env");
    }

    // Include both GMB and Google Ads scopes in one OAuth consent screen
    const scopes = [
      "https://www.googleapis.com/auth/business.manage",
      "https://www.googleapis.com/auth/adwords"
    ].join(" ");
    
    // Pass both orgId and redirect path in the state parameter
    const statePayload = JSON.stringify({ orgId, redirect: redirectPath });
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${encodeURIComponent(statePayload)}`;
    
    res.redirect(oauthUrl);
  } catch (error: any) {
    res.status(500).send(`OAuth redirection error: ${error.message}`);
  }
});

// Real Google OAuth: Handle OAuth Code Callback from Google
router.get("/oauth/callback", async (req, res) => {
  const code = req.query.code as string;
  const stateStr = req.query.state as string;
  
  let orgId = DEFAULT_ORG_ID;
  let redirectPath = "/";

  if (stateStr) {
    try {
      const parsed = JSON.parse(stateStr);
      orgId = parsed.orgId || DEFAULT_ORG_ID;
      redirectPath = parsed.redirect || "/";
    } catch {
      orgId = stateStr;
    }
  }

  if (!code) {
    return res.status(400).send("No authorization code returned from Google");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/gmb/oauth/callback";

  if (!clientId || !clientSecret) {
    return res.status(500).send("Google OAuth keys (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET) are missing from backend .env");
  }

  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    });

    const { refresh_token, access_token } = tokenRes.data;

    // Fetch existing configuration if any, to avoid overwriting manually entered IDs
    const existingConfig = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    let locationName = existingConfig?.locationName || "";
    let googleLocationId = existingConfig?.googleLocationId || "";

    // Attempt to automatically discover locations only if not already configured in DB
    if (!googleLocationId) {
      try {
        const accountsRes = await axios.get("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        const accounts = accountsRes.data.accounts || [];
        if (accounts.length > 0) {
          const accountName = accounts[0].name; // accounts/{accountId}
          const accountId = accountName.split("/")[1];
          const locationsRes = await axios.get(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`, {
            headers: { Authorization: `Bearer ${access_token}` }
          });
          const locations = locationsRes.data.locations || [];
          if (locations.length > 0) {
            const rawLocName = locations[0].name; // could be locations/{locationId} or accounts/{accountId}/locations/{locationId}
            const locId = rawLocName.includes("/") ? rawLocName.split("/").pop() : rawLocName;
            googleLocationId = `accounts/${accountId}/locations/${locId}`;
            locationName = locations[0].title || locationName;
          }
        }
      } catch (apiErr: any) {
        console.warn("Could not automatically discover GMB Locations. Saving credentials only.", apiErr?.response?.data || apiErr.message);
      }
    }

    // Auto-discover Google Ads Customer ID from the linked Google account
    let googleAdsCustomerId: string | undefined = existingConfig?.googleAdsCustomerId || undefined;
    if (!googleAdsCustomerId) {
      try {
        const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
        const adsListRes = await axios.get(
          "https://googleads.googleapis.com/v17/customers:listAccessibleCustomers",
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "developer-token": DEVELOPER_TOKEN,
              "Content-Type": "application/json"
            }
          }
        );
        const resourceNames: string[] = adsListRes.data.resourceNames || [];
        if (resourceNames.length > 0) {
          // resourceNames[0] = "customers/1234567890" — extract the numeric ID
          googleAdsCustomerId = resourceNames[0].split("/")[1];
          console.log(`[OAuth] Auto-discovered Google Ads Customer ID: ${googleAdsCustomerId}`);
        }
      } catch (adsErr: any) {
        console.warn("[OAuth] Could not auto-discover Google Ads Customer ID:", adsErr?.response?.data || adsErr.message);
      }
    }

    // Update config in database — save refresh token, location, and ads customer ID
    await prisma.googleBusinessConfig.upsert({
      where: { organizationId: orgId },
      update: {
        googleRefreshToken: refresh_token || undefined,
        locationName: locationName || undefined,
        googleLocationId: googleLocationId || undefined,
        googleAdsCustomerId: googleAdsCustomerId || undefined
      },
      create: {
        organizationId: orgId,
        googleRefreshToken: refresh_token || "",
        locationName,
        googleLocationId,
        googleAdsCustomerId: googleAdsCustomerId || "",
        autoReplyEnabled: true,
        autoReplyMinRating: 4,
        autoReplyTemplate: "Thank you so much for your review! We value your feedback."
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}${redirectPath}${redirectPath.includes("?") ? "&" : "?"}tab=settings&oauth=success`);
  } catch (error: any) {
    console.error("OAuth Token Exchange Error:", error?.response?.data || error.message);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}${redirectPath}${redirectPath.includes("?") ? "&" : "?"}tab=settings&oauth=error`);
  }
});

// 3. GET All Reviews
router.get("/reviews", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;
    const reviews = await prisma.googleReview.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3.1 GET Sync Live GMB Reviews
router.get("/reviews/sync", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;
    const result = await syncGmbReviews(orgId, io);
    res.status(200).json({
      message: `Successfully synchronized reviews. Added ${result.syncedCount} new reviews.`,
      reviews: result.reviews
    });
  } catch (error: any) {
    console.error("GMB Reviews Sync failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 4. POST Submit Public Funnel Review
router.post("/reviews/submit", async (req, res) => {
  try {
    const { orgId = DEFAULT_ORG_ID, customerName, rating, comment } = req.body;

    if (!customerName || !rating) {
      return res.status(400).json({ error: "Customer Name and Rating are required" });
    }

    const reviewRating = Number(rating);
    const isPositive = reviewRating >= 3;

    // Fetch config to check Google review redirection URL
    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    if (isPositive) {
      // For positive reviews, do NOT create a local database record.
      // This avoids duplicate entries ("double-posting") when syncing Google reviews later.
      // The positive review will enter the database from GMB once synced, utilizing the actual Google name and triggering GMB auto-reply.
      return res.status(201).json({
        message: "Positive feedback redirecting to Google Maps",
        review: null,
        redirect: config?.googleReviewUrl || null
      });
    }

    // For negative reviews (1 or 2 stars), save locally as PENDING to shield from Google Maps
    const review = await prisma.googleReview.create({
      data: {
        organizationId: orgId,
        customerName,
        rating: reviewRating,
        comment: comment || "",
        status: "PENDING",
        source: "FUNNEL"
      }
    });

    // Broadcast update to GMB tab agents in real-time
    io.to(orgId).emit("new-review", review);

    res.status(201).json({
      message: "Feedback submitted successfully",
      review,
      redirect: null
    });
  } catch (error: any) {
    console.error("Review submission failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5. POST Moderate Review (Approve or Decline)
router.post("/reviews/action", async (req, res) => {
  try {
    const { reviewId, action, orgId = DEFAULT_ORG_ID } = req.body; // action: 'approve' | 'decline'

    if (!reviewId || !action) {
      return res.status(400).json({ error: "Review ID and action are required" });
    }

    const newStatus = action === "approve" ? "APPROVED" : "DECLINED";

    const review = await prisma.googleReview.update({
      where: { id: reviewId },
      data: { status: newStatus }
    });

    // If approved, trigger auto-reply if qualified
    if (newStatus === "APPROVED") {
      const config = await prisma.googleBusinessConfig.findUnique({
        where: { organizationId: orgId }
      });
      if (config) {
        await executeAutoReplyIfApplicable(review, config);
      }
    }

    const updatedReview = await prisma.googleReview.findUnique({ where: { id: reviewId } });
    io.to(orgId).emit("review-updated", updatedReview || review);

    res.status(200).json(updatedReview || review);
  } catch (error: any) {
    console.error("Failed to update review status:", error);
    res.status(500).json({ error: error.message });
  }
});

// 6. POST Write Review Reply
router.post("/reviews/reply", async (req, res) => {
  try {
    const { reviewId, replyText, orgId = DEFAULT_ORG_ID } = req.body;

    if (!reviewId || !replyText) {
      return res.status(400).json({ error: "Review ID and Reply Text are required" });
    }

    const review = await prisma.googleReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    const clientId = config?.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    // If live credentials exist and it's a real Google review, write reply to Google GBP API
    if (review.source === "GOOGLE" && config && clientId && clientSecret && config.googleRefreshToken && config.googleLocationId) {
      const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
      
      // Get the verified location path
      const locationPath = await getGmbLocationPath(token, config.googleLocationId);
      
      const replyUrl = `https://mybusiness.googleapis.com/v4/${locationPath}/reviews/${reviewId}/reply`;
      await axios.put(replyUrl, {
        comment: replyText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(`[LIVE GMB REPLY] Replied review ID ${reviewId}`);
    } else {
      console.log(`[LOCAL REPLY] Saved reply locally for review ID ${reviewId} (Source: ${review.source})`);
    }

    const updatedReview = await prisma.googleReview.update({
      where: { id: reviewId },
      data: {
        replyText,
        replyStatus: "REPLIED"
      }
    });

    io.to(orgId).emit("review-updated", updatedReview);

    res.status(200).json(updatedReview);
  } catch (error: any) {
    console.error("Failed to reply to review:", error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================================
// GMB LOCAL POSTS ENDPOINTS
// =============================================================

// 7. GET: List local posts
router.get("/posts", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;
    const posts = await prisma.googlePost.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. POST: Create Local Post (Publish to GMB)
router.post("/posts/create", async (req, res) => {
  try {
    const {
      orgId = DEFAULT_ORG_ID,
      title,
      summary,
      mediaUrl,
      callToActionType,
      callToActionUrl
    } = req.body;

    if (!summary) {
      return res.status(400).json({ error: "Summary text is required for GMB Posts." });
    }

    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    const clientId = config?.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    let gmbPostId: string | null = null;

    // If live credentials are connected, publish to Google Maps Business API
    if (config && clientId && clientSecret && config.googleRefreshToken && config.googleLocationId) {
      try {
        const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
        const locationPath = await getGmbLocationPath(token, config.googleLocationId);

        const localPostUrl = `https://mybusiness.googleapis.com/v4/${locationPath}/localPosts`;
        
        const payload: any = {
          summary: summary,
          languageCode: "en"
        };

        if (callToActionType && callToActionType !== "NONE") {
          payload.callToAction = {
            actionType: callToActionType,
            url: callToActionUrl || config.googleReviewUrl || "https://google.com"
          };
        }

        if (mediaUrl) {
          payload.media = [
            {
              mediaFormat: "PHOTO",
              sourceUrl: mediaUrl
            }
          ];
        }

        const postRes = await axios.post(localPostUrl, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        gmbPostId = postRes.data.name; // Could be accounts/*/locations/*/localPosts/*
        console.log(`[LIVE GMB POST] Created post successfully: ${gmbPostId}`);
      } catch (apiErr: any) {
        console.error("Failed to publish post to Google API. Saving locally only.", apiErr?.response?.data || apiErr.message);
      }
    }

    // Save to local database
    const post = await prisma.googlePost.create({
      data: {
        organizationId: orgId,
        gmbPostId: gmbPostId,
        title: title || "",
        summary: summary,
        mediaUrl: mediaUrl || null,
        callToActionType: callToActionType || "NONE",
        callToActionUrl: callToActionUrl || null,
        status: gmbPostId ? "PUBLISHED" : "DRAFT"
      }
    });

    io.to(orgId).emit("new-post", post);

    res.status(201).json(post);
  } catch (error: any) {
    console.error("Failed to create GMB post:", error);
    res.status(500).json({ error: error.message });
  }
});

// 9. DELETE: Delete a local post
router.delete("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;

    const post = await prisma.googlePost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    const clientId = config?.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    // Delete from Google Maps if published
    if (post.gmbPostId && config && clientId && clientSecret && config.googleRefreshToken) {
      try {
        const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
        const deleteUrl = `https://mybusiness.googleapis.com/v4/${post.gmbPostId}`;
        await axios.delete(deleteUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`[LIVE GMB POST DELETE] Deleted post ID ${post.gmbPostId}`);
      } catch (apiErr: any) {
        console.error("Failed to delete post from Google API:", apiErr?.response?.data || apiErr.message);
      }
    }

    await prisma.googlePost.delete({
      where: { id: postId }
    });

    io.to(orgId).emit("post-deleted", postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================
// GMB QUESTIONS & ANSWERS ENDPOINTS
// =============================================================

// 10. GET: List all questions
router.get("/questions", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;

    // Ensure parent Organization record exists to avoid foreign key issues
    await prisma.organization.upsert({
      where: { id: orgId },
      update: {},
      create: { id: orgId, name: "Merchant Workspace" }
    });

    let questions = await prisma.googleQuestion.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" }
    });

    if (questions.length === 0) {
      const mockFaqs = [
        {
          id: `seed-1-${Date.now()}`,
          organizationId: orgId,
          gmbQuestionId: `seed-q-1`,
          authorName: "Amit Sharma",
          text: "What are your business operating hours and average project turnaround time?",
          answerText: null,
          status: "UNANSWERED",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          id: `seed-2-${Date.now()}`,
          organizationId: orgId,
          gmbQuestionId: `seed-q-2`,
          authorName: "Neha Patel",
          text: "Do you provide custom website designing and social media branding packages in Pune?",
          answerText: "Yes, we offer fully integrated local SEO, social media branding, and web design packages.",
          status: "ANSWERED",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      ];

      for (const faq of mockFaqs) {
        await prisma.googleQuestion.create({ data: faq });
      }

      questions = await prisma.googleQuestion.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" }
      });
    }

    res.status(200).json(questions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 11. POST: Sync Questions from Google Q&A API
router.get("/questions/sync", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;

    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    const clientId = config?.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    if (!config || !clientId || !clientSecret || !config.googleRefreshToken || !config.googleLocationId) {
      return res.status(400).json({ error: "Google account is not authorized or location is not configured." });
    }

    const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
    
    let locationIdOnly = config.googleLocationId;
    if (locationIdOnly.includes("locations/")) {
      locationIdOnly = locationIdOnly.split("locations/")[1] || "";
    }
    locationIdOnly = locationIdOnly.trim();

    const questionsUrl = `https://mybusinessqanda.googleapis.com/v1/locations/${locationIdOnly}/questions`;
    const response = await axios.get(questionsUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const gQuestions = response.data.questions || [];
    let syncedCount = 0;

    for (const q of gQuestions) {
      const existing = await prisma.googleQuestion.findUnique({
        where: { gmbQuestionId: q.name }
      });

      let status = "UNANSWERED";
      let answerText = null;

      // Extract existing top answer if any
      if (q.answers && q.answers.length > 0) {
        answerText = q.answers[0].text;
        status = "ANSWERED";
      }

      await prisma.googleQuestion.upsert({
        where: { gmbQuestionId: q.name },
        update: {
          authorName: q.author?.displayName || "Google User",
          text: q.text,
          answerText: answerText,
          status: status
        },
        create: {
          organizationId: orgId,
          gmbQuestionId: q.name,
          authorName: q.author?.displayName || "Google User",
          text: q.text,
          answerText: answerText,
          status: status
        }
      });
      syncedCount++;
    }

    const updatedQuestions = await prisma.googleQuestion.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" }
    });

    io.to(orgId).emit("questions-synced", updatedQuestions);

    res.status(200).json({
      message: `Successfully synchronized questions. Scanned ${syncedCount} questions.`,
      questions: updatedQuestions
    });
  } catch (error: any) {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;
    console.warn("Google My Business Q&A API is deprecated or unavailable. Serving local database FAQs:", error.message);
    
    try {
      // Ensure parent Organization record exists to satisfy schema relation constraint
      await prisma.organization.upsert({
        where: { id: orgId },
        update: {},
        create: { id: orgId, name: "Merchant Workspace" }
      });

      // Fetch local questions
      let localQuestions = await prisma.googleQuestion.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" }
      });

      // If database is empty, seed mock initial FAQs so the user can test workflows
      if (localQuestions.length === 0) {
        const mockFaqs = [
          {
            id: `seed-1-${Date.now()}`,
            organizationId: orgId,
            gmbQuestionId: `seed-q-1`,
            authorName: "Amit Sharma",
            text: "What are your business operating hours and average project turnaround time?",
            answerText: null,
            status: "UNANSWERED",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          {
            id: `seed-2-${Date.now()}`,
            organizationId: orgId,
            gmbQuestionId: `seed-q-2`,
            authorName: "Neha Patel",
            text: "Do you provide custom website designing and social media branding packages in Pune?",
            answerText: "Yes, we offer fully integrated local SEO, social media branding, and web design packages.",
            status: "ANSWERED",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ];

        for (const faq of mockFaqs) {
          await prisma.googleQuestion.create({ data: faq });
        }

        localQuestions = await prisma.googleQuestion.findMany({
          where: { organizationId: orgId },
          orderBy: { createdAt: "desc" }
        });
      }

      res.status(200).json({
        message: "Synchronized local FAQs repository (Google Q&A API is deprecated).",
        questions: localQuestions
      });
    } catch (dbErr: any) {
      console.error("Database fallback seeding failed:", dbErr.message);
      res.status(200).json({
        message: "Google Q&A API is unavailable.",
        questions: []
      });
    }
  }
});

// 12. POST: Answer a question (Upload reply to Google)
router.post("/questions/reply", async (req, res) => {
  try {
    const { questionId, replyText, orgId = DEFAULT_ORG_ID } = req.body;

    if (!questionId || !replyText) {
      return res.status(400).json({ error: "Question ID and Reply Text are required." });
    }

    const question = await prisma.googleQuestion.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    const clientId = config?.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    // Send answer to Google API if live credentials exist
    if (config && clientId && clientSecret && config.googleRefreshToken) {
      try {
        const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
        const replyUrl = `https://mybusinessqanda.googleapis.com/v1/${question.gmbQuestionId}/answers:upsert`;
        
        await axios.post(replyUrl, {
          answer: {
            text: replyText
          }
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`[LIVE GMB Q&A REPLY] Answered question ID ${question.gmbQuestionId}`);
      } catch (apiErr: any) {
        console.error("Failed to post answer to Google Q&A API:", apiErr?.response?.data || apiErr.message);
      }
    }

    const updatedQuestion = await prisma.googleQuestion.update({
      where: { id: questionId },
      data: {
        answerText: replyText,
        status: "ANSWERED"
      }
    });

    io.to(orgId).emit("question-updated", updatedQuestion);

    res.status(200).json(updatedQuestion);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 13. POST: Get Gemini AI reply suggestions for Q&A questions
router.post("/questions/ai-suggest", async (req, res) => {
  try {
    const { questionText, orgId = DEFAULT_ORG_ID } = req.body;

    if (!questionText) {
      return res.status(400).json({ error: "Question text is required." });
    }

    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    const businessName = config?.locationName || "Our business";
    const template = config?.autoReplyTemplate || "Thank you for asking! We are happy to help.";

    const geminiApiKey = process.env.GEMINI_API_KEY || "YOUR_FREE_GEMINI_KEY";
    const model = "gemini-1.5-flash";
    
    const prompt = `
      You are a customer support agent representing "${businessName}". 
      Write a helpful, concise answer to the following customer question on Google Maps:
      
      Question: "${questionText}"
      
      Requirements:
      - Answer must be professional, direct, and under 250 characters.
      - If you do not have specific info, provide a generic polite response suggesting they contact the team.
      - Answer:
    `;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const aiAnswer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || template;
      res.status(200).json({ suggestion: aiAnswer.trim() });
    } catch (apiErr: any) {
      console.warn("Gemini suggestion failed: ", apiErr.message);
      res.status(200).json({ suggestion: template });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================
// GMB MEDIA & GALLERY ENDPOINTS
// =============================================================

// 14. GET: List GMB media items (Photos/Videos)
router.get("/media", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;

    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    const clientId = config?.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    // If live credentials exist, fetch live media from GMB API
    if (config && clientId && clientSecret && config.googleRefreshToken && config.googleLocationId) {
      try {
        const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
        const locationPath = await getGmbLocationPath(token, config.googleLocationId);

        const mediaUrl = `https://mybusiness.googleapis.com/v4/${locationPath}/media`;
        const response = await axios.get(mediaUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const items = response.data.mediaItems || [];
        const formattedItems = items.map((item: any) => ({
          name: item.name,
          category: item.locationAssociation?.category || "ADDITIONAL",
          googleUrl: item.googleUrl,
          thumbnailUrl: item.thumbnailUrl || item.googleUrl,
          createTime: item.createTime || new Date(),
          source: "GOOGLE"
        }));

        return res.status(200).json(formattedItems);
      } catch (apiErr: any) {
        console.error("Failed to fetch live GMB media:", apiErr?.response?.data || apiErr.message);
      }
    }

    // Fallback: Return mock gallery photos for developer preview if API is not fully connected
    const mockMedia = [
      {
        name: "mock-1",
        category: "COVER",
        googleUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80",
        createTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        source: "MOCK"
      },
      {
        name: "mock-2",
        category: "TEAMS",
        googleUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&auto=format&fit=crop&q=80",
        createTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        source: "MOCK"
      },
      {
        name: "mock-3",
        category: "INTERIOR",
        googleUrl: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&auto=format&fit=crop&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&auto=format&fit=crop&q=80",
        createTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        source: "MOCK"
      },
      {
        name: "mock-4",
        category: "EXTERIOR",
        googleUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&auto=format&fit=crop&q=80",
        createTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        source: "MOCK"
      }
    ];

    res.status(200).json(mockMedia);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 15. POST: Upload new photo to GMB Listing
router.post("/media/upload", async (req, res) => {
  try {
    const { orgId = DEFAULT_ORG_ID, image, category = "ADDITIONAL" } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Base64 image string is required." });
    }

    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    const clientId = config?.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    // Convert base64 data to binary buffer
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let mimeType = "image/jpeg";
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(image, "base64");
    }

    // Normalize category to GMB valid enums
    let googleCategory = category.toUpperCase();
    if (googleCategory === "PROFILE") {
      googleCategory = "LOGO";
    }
    const validCategories = ["COVER", "LOGO", "EXTERIOR", "INTERIOR", "PRODUCT", "ADDITIONAL", "AT_WORK", "FOOD_AND_DRINK"];
    if (!validCategories.includes(googleCategory)) {
      googleCategory = "ADDITIONAL";
    }

    // 1. If ImageKit is configured, upload to ImageKit first to get a public URL
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
    let publicUrl = "";

    if (privateKey && urlEndpoint) {
      try {
        console.log("[GMB PHOTO UPLOAD] ImageKit credentials detected. Uploading to ImageKit CDN first...");
        const formData = new FormData();
        formData.append("file", image); // ImageKit accepts the base64 data URL directly
        formData.append("fileName", `gmb_upload_${Date.now()}.jpg`);
        formData.append("useUniqueFileName", "true");

        const authHeader = Buffer.from(`${privateKey}:`).toString("base64");
        const imagekitRes = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
          headers: {
            Authorization: `Basic ${authHeader}`
          }
        });
        
        publicUrl = imagekitRes.data.url;
        console.log(`[GMB PHOTO UPLOAD] ImageKit upload success. Public URL: ${publicUrl}`);
      } catch (ikErr: any) {
        console.error("[GMB PHOTO UPLOAD] ImageKit upload failed, falling back to direct binary byte upload:", ikErr?.response?.data || ikErr.message);
      }
    }

    // If live credentials are connected, upload to Google API
    if (config && clientId && clientSecret && config.googleRefreshToken && config.googleLocationId) {
      try {
        const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
        const locationPath = await getGmbLocationPath(token, config.googleLocationId);

        if (publicUrl) {
          // Approach A: Register photo via public sourceUrl (Simpler & highly recommended)
          console.log(`[GMB PHOTO UPLOAD] Registering photo via sourceUrl to Google: ${publicUrl}`);
          const createMetadataUrl = `https://mybusiness.googleapis.com/v4/${locationPath}/media`;
          const createResponse = await axios.post(createMetadataUrl, {
            mediaFormat: "PHOTO",
            locationAssociation: {
              category: googleCategory
            },
            sourceUrl: publicUrl
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          console.log(`[LIVE GMB MEDIA UPLOAD] Successfully registered photo via sourceUrl: ${createResponse.data?.name}`);
          
          return res.status(201).json({
            message: "Photo uploaded to Google Business listing successfully.",
            name: createResponse.data?.name,
            category: googleCategory,
            googleUrl: publicUrl
          });
        } else {
          // Approach B: Fallback to 3-step byte upload if ImageKit failed/not configured
          console.log("[GMB PHOTO UPLOAD] ImageKit CDN not available. Falling back to 3-step binary byte upload...");
          
          // Step 1: Initiate upload session (startUpload)
          console.log(`[GMB PHOTO UPLOAD] Step 1: Initiating startUpload at v4/${locationPath}/media:startUpload...`);
          const startUrl = `https://mybusiness.googleapis.com/v4/${locationPath}/media:startUpload`;
          let startResponse;
          try {
            startResponse = await axios.post(startUrl, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (startErr: any) {
            console.error("Step 1 (startUpload) failed details:", JSON.stringify(startErr?.response?.data || startErr.message, null, 2));
            throw new Error(`Step 1 (startUpload) failed: ${startErr?.response?.data?.error?.message || startErr.message}`);
          }

          const resourceName = startResponse.data?.resourceName;
          if (!resourceName) {
            throw new Error("Google GMB API startUpload failed to return a resourceName.");
          }

          // Step 2: Upload photo binary bytes
          console.log(`[GMB PHOTO UPLOAD] Step 2: Uploading bytes to resource ${resourceName}...`);
          const uploadUrl = `https://mybusiness.googleapis.com/upload/v1/media/${resourceName}?upload_type=media`;
          try {
            await axios.post(uploadUrl, buffer, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": mimeType
              }
            });
          } catch (uploadErr: any) {
            console.error("Step 2 (byte upload) failed details:", JSON.stringify(uploadErr?.response?.data || uploadErr.message, null, 2));
            throw new Error(`Step 2 (byte upload) failed: ${uploadErr?.response?.data?.error?.message || uploadErr.message}`);
          }

          // Step 3: Finalize metadata creation (Register the uploaded media)
          console.log(`[GMB PHOTO UPLOAD] Step 3: Finalizing media metadata registration...`);
          const createMetadataUrl = `https://mybusiness.googleapis.com/v4/${locationPath}/media`;
          let createResponse;
          try {
            createResponse = await axios.post(createMetadataUrl, {
              mediaFormat: "PHOTO",
              locationAssociation: {
                category: googleCategory
              },
              dataRef: {
                resourceName: resourceName
              }
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (createErr: any) {
            console.error("Step 3 (create metadata) failed details:", JSON.stringify(createErr?.response?.data || createErr.message, null, 2));
            throw new Error(`Step 3 (create metadata) failed: ${createErr?.response?.data?.error?.message || createErr.message}`);
          }

          console.log(`[LIVE GMB MEDIA UPLOAD] Successfully finished GMB media registration for ${resourceName}`);
          
          return res.status(201).json({
            message: "Photo uploaded to Google Business listing successfully.",
            name: createResponse.data?.name || resourceName,
            category: googleCategory
          });
        }
      } catch (apiErr: any) {
        console.error("GMB API Photo upload final failed details:", apiErr.message);
        throw apiErr;
      }
    }

    // Mock upload success in developer preview mode
    res.status(201).json({
      message: "Photo processed successfully (Mock Mode).",
      name: `mock-uploaded-${Date.now()}`,
      category: category,
      googleUrl: image
    });
  } catch (error: any) {
    console.error("Failed to upload GMB photo:", error);
    res.status(500).json({ error: error.message });
  }
});

// 16. GET: Retrieve GMB location profile details (Real API only)
router.get("/profile", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;

    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    const clientId = config?.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    if (!config || !clientId || !clientSecret || !config.googleRefreshToken || !config.googleLocationId) {
      return res.status(400).json({ error: "Google account is not authorized or location is not configured." });
    }

    const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
    
    let locationIdOnly = config.googleLocationId;
    if (locationIdOnly.includes("locations/")) {
      locationIdOnly = locationIdOnly.split("locations/")[1] || "";
    }
    locationIdOnly = locationIdOnly.trim();

    const readFields = [
      "name",
      "languageCode",
      "storeCode",
      "title",
      "phoneNumbers",
      "categories",
      "storefrontAddress",
      "websiteUri",
      "regularHours",
      "specialHours",
      "serviceArea",
      "labels",
      "adWordsLocationExtensions",
      "latlng",
      "openInfo",
      "metadata",
      "profile",
      "relationshipData",
      "moreHours",
      "serviceItems"
    ].join(",");

    const profileUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/locations/${locationIdOnly}?readMask=${readFields}`;
    
    const response = await axios.get(profileUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`[LIVE GMB PROFILE FETCH] Retrieved location data for ${locationIdOnly}`);
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Failed to retrieve GMB profile details:", error?.response?.data || error.message);
    res.status(error?.response?.status || 500).json({ 
      error: error?.response?.data?.error?.message || error.message,
      details: error?.response?.data
    });
  }
});

// 17. PATCH: Update GMB location profile details (Real API only)
router.patch("/profile", async (req, res) => {
  try {
    const { orgId = DEFAULT_ORG_ID, updateMask, locationData } = req.body;

    if (!updateMask || !locationData) {
      return res.status(400).json({ error: "updateMask and locationData are required." });
    }

    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    const clientId = config?.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    if (!config || !clientId || !clientSecret || !config.googleRefreshToken || !config.googleLocationId) {
      return res.status(400).json({ error: "Google account is not authorized or location is not configured." });
    }

    const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
    
    let locationIdOnly = config.googleLocationId;
    if (locationIdOnly.includes("locations/")) {
      locationIdOnly = locationIdOnly.split("locations/")[1] || "";
    }
    locationIdOnly = locationIdOnly.trim();

    const patchUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/locations/${locationIdOnly}?updateMask=${updateMask}`;
    
    const response = await axios.patch(patchUrl, locationData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`[LIVE GMB PROFILE UPDATE] Successfully patched profile for location ${locationIdOnly}`);

    // Update config title in database locally for visual consistency
    if (locationData.title) {
      await (prisma.googleBusinessConfig as any).update({
        where: { organizationId: orgId },
        data: { locationName: locationData.title }
      });
    }

    res.status(200).json({
      message: "Business profile updated successfully on Google Maps.",
      profile: response.data
    });
  } catch (error: any) {
    console.error("Failed to update business profile details:", error?.response?.data || error.message);
    res.status(error?.response?.status || 500).json({ 
      error: error?.response?.data?.error?.message || error.message,
      details: error?.response?.data
    });
  }
});

// 18. POST: Generate optimized business description using Groq API
router.post("/profile/ai-suggest", async (req, res) => {
  try {
    const { title, primaryCategory, additionalCategoriesText } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Please provide a valid Business Name before generating an AI description." });
    }
    if (!primaryCategory || !primaryCategory.trim()) {
      return res.status(400).json({ error: "Please select or verify a Primary Business Category for your listing before generating an AI description." });
    }

    const groqKey = process.env.GROQ_KEY;
    if (!groqKey) {
      return res.status(400).json({ error: "The AI system is temporarily unavailable: Groq API key is missing on the server. Please check environment configuration." });
    }

    const prompt = `Write a professional, highly engaging business description (maximum 750 characters) for a Google Business Profile of "${title.trim()}".
Primary Business Category: "${primaryCategory.trim()}".
Additional services & areas of focus: "${(additionalCategoriesText || "").trim()}".

Requirements:
- Make it results-oriented, persuasive, and optimized for local SEO search ranking.
- Write it focusing on the specific value of these services and category.
- Keep the length strictly under 750 characters (which is Google Business Profile's maximum character limit).
- Do not include any HTML formatting, markdown, lists, bullet points, hashtags, or bracketed placeholders. Write it as a clean, cohesive paragraph.`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 250
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`
        }
      }
    );

    const suggestion = response.data?.choices?.[0]?.message?.content || "";
    res.status(200).json({ suggestion: suggestion.trim() });
  } catch (error: any) {
    console.error("Failed to generate AI description using Groq:", error?.response?.data || error.message);
    const errorMsg = error?.response?.data?.error?.message || error.message;
    res.status(error?.response?.status || 500).json({ 
      error: `Failed to generate description: ${errorMsg}. Please check that all inputs are filled and try again.`
    });
  }
});

// 19. GET: Search places using Google Places Autocomplete API
router.get("/places/search", async (req, res) => {
  try {
    const query = req.query.query as string;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Search query is required." });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "Google Places API configuration is missing on the server." });
    }
    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}`;

    const response = await axios.get(autocompleteUrl);
    
    if (response.data.status !== "OK" && response.data.status !== "ZERO_RESULTS") {
      return res.status(400).json({ error: `Google Places API returned status: ${response.data.status}` });
    }

    const suggestions = (response.data.predictions || []).map((pred: any) => ({
      placeId: pred.place_id,
      placeName: pred.description
    }));

    res.status(200).json(suggestions);
  } catch (error: any) {
    console.error("Google Places search failed:", error.message);
    res.status(500).json({ error: "Places autocomplete service is currently unavailable. Please enter search terms manually." });
  }
});

export default router;
