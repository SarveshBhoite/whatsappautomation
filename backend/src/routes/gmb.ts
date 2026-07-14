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
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/gmb/oauth/callback";

    if (!clientId) {
      return res.status(400).send("GOOGLE_CLIENT_ID is not configured in backend .env");
    }

    const scope = "https://www.googleapis.com/auth/business.manage";
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${encodeURIComponent(orgId)}`;
    
    res.redirect(oauthUrl);
  } catch (error: any) {
    res.status(500).send(`OAuth redirection error: ${error.message}`);
  }
});

// Real Google OAuth: Handle OAuth Code Callback from Google
router.get("/oauth/callback", async (req, res) => {
  const code = req.query.code as string;
  const orgId = (req.query.state as string) || DEFAULT_ORG_ID;

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

    // Update config in database
    await prisma.googleBusinessConfig.upsert({
      where: { organizationId: orgId },
      update: {
        googleRefreshToken: refresh_token || undefined,
        locationName: locationName || undefined,
        googleLocationId: googleLocationId || undefined
      },
      create: {
        organizationId: orgId,
        googleRefreshToken: refresh_token || "",
        locationName,
        googleLocationId,
        autoReplyEnabled: true,
        autoReplyMinRating: 4,
        autoReplyTemplate: "Thank you so much for your review! We value your feedback."
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/?tab=settings&oauth=success`);
  } catch (error: any) {
    console.error("OAuth Token Exchange Error:", error?.response?.data || error.message);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/?tab=settings&oauth=error`);
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
    const questions = await prisma.googleQuestion.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" }
    });
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
    const locationPath = await getGmbLocationPath(token, config.googleLocationId);

    const questionsUrl = `https://mybusinessqanda.googleapis.com/v1/${locationPath}/questions`;
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
    
    // Fallback: Fetch and return local questions from database so the UI remains active
    const localQuestions = await prisma.googleQuestion.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" }
    });

    // If database is empty, seed mock initial FAQs so the user can test reply workflows
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

      const seededQuestions = await prisma.googleQuestion.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" }
      });

      return res.status(200).json({
        message: "Synchronized local FAQs repository (Google Q&A API is deprecated).",
        questions: seededQuestions
      });
    }

    res.status(200).json({
      message: "Synchronized local FAQs repository (Google Q&A API is deprecated).",
      questions: localQuestions
    });
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
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // If live credentials are connected, upload to Google API
    if (config && clientId && clientSecret && config.googleRefreshToken && config.googleLocationId) {
      try {
        const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
        const locationPath = await getGmbLocationPath(token, config.googleLocationId);

        // Step 1: Register media item to get uploadUrl
        const registerUrl = `https://mybusiness.googleapis.com/v4/${locationPath}/media`;
        const registerPayload = {
          mediaFormat: "PHOTO",
          locationAssociation: {
            category: category
          }
        };

        const registerRes = await axios.post(registerUrl, registerPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { name: mediaName, uploadUrl } = registerRes.data;

        if (!uploadUrl) {
          throw new Error("Google GMB API did not return an upload URL.");
        }

        // Step 2: Upload photo binary bytes
        await axios.put(uploadUrl, buffer, {
          headers: {
            "Content-Type": "image/jpeg"
          }
        });

        console.log(`[LIVE GMB MEDIA UPLOAD] Uploaded photo ${mediaName} to category ${category}`);
        
        return res.status(201).json({
          message: "Photo uploaded to Google Business listing successfully.",
          name: mediaName,
          category: category
        });
      } catch (apiErr: any) {
        console.error("GMB API Photo upload failed. Falling back to local response.", apiErr?.response?.data || apiErr.message);
        throw new Error(apiErr?.response?.data?.error?.message || apiErr.message);
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

export default router;
