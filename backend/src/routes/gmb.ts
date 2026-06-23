import { Router } from "express";
import prisma from "../utils/prisma";
import { io } from "../index";
import axios from "axios";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123"; // Seeded organization ID for developer/sandbox environment

// Helper to get access token from refresh token for live Google Business API calls
async function getGoogleAccessToken(clientId: string, clientSecret: string, refreshToken: string) {
  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });
    return response.data.access_token as string;
  } catch (error: any) {
    console.error("Failed to refresh Google access token:", error?.response?.data || error.message);
    throw new Error("Failed to authenticate with Google APIs");
  }
}

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

    let locationName = "Jisnu Digitals Pune (Connected)";
    let googleLocationId = "mock_loc_123456";

    // Attempt to automatically discover locations using the obtained access token
    try {
      const accountsRes = await axios.get("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const accounts = accountsRes.data.accounts || [];
      if (accounts.length > 0) {
        const accountName = accounts[0].name; // accounts/{accountId}
        const locationsRes = await axios.get(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`, {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        const locations = locationsRes.data.locations || [];
        if (locations.length > 0) {
          googleLocationId = locations[0].name; // accounts/{accountId}/locations/{locationId}
          locationName = locations[0].title || locationName;
        }
      }
    } catch (apiErr: any) {
      console.warn("Could not automatically discover GMB Locations. Saving credentials only.", apiErr?.response?.data || apiErr.message);
    }

    // Update config in database
    await prisma.googleBusinessConfig.upsert({
      where: { organizationId: orgId },
      update: {
        googleRefreshToken: refresh_token || undefined,
        locationName,
        googleLocationId
      },
      create: {
        organizationId: orgId,
        googleRefreshToken: refresh_token || "mock_refresh_token_fallback",
        locationName,
        googleLocationId,
        autoReplyEnabled: true,
        autoReplyMinRating: 4,
        autoReplyTemplate: "Thank you so much for your review! We value your feedback."
      }
    });

    res.redirect("http://localhost:3000/?tab=settings&oauth=success");
  } catch (error: any) {
    console.error("OAuth Token Exchange Error:", error?.response?.data || error.message);
    res.redirect("http://localhost:3000/?tab=settings&oauth=error");
  }
});

// Mock OAuth connect connector (Kept as fallback or simulation)
router.get("/oauth/mock-connect", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;
    
    // Simulate updating config with mock OAuth details
    const config = await prisma.googleBusinessConfig.upsert({
      where: { organizationId: orgId },
      update: {
        googleLocationId: "mock_loc_123456",
        googleRefreshToken: "mock_refresh_token_xyz987654321",
        locationName: "Jisnu Digitals Pune (Connected)"
      },
      create: {
        organizationId: orgId,
        locationName: "Jisnu Digitals Pune (Connected)",
        googleLocationId: "mock_loc_123456",
        googleRefreshToken: "mock_refresh_token_xyz987654321",
        autoReplyEnabled: true,
        autoReplyMinRating: 4,
        autoReplyTemplate: "Thank you so much for your rating! We're glad you liked our service."
      }
    });

    res.status(200).json(config);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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

// Helper function to handle auto-replies
async function executeAutoReplyIfApplicable(review: any, config: any) {
  if (!config.autoReplyEnabled || review.rating < config.autoReplyMinRating || !config.autoReplyTemplate) {
    return;
  }

  try {
    // If we have live credentials, try to submit it to Google
    if (config.googleClientId && config.googleClientSecret && config.googleRefreshToken && config.googleLocationId && config.googleLocationId !== "mock_loc_123456") {
      const token = await getGoogleAccessToken(config.googleClientId, config.googleClientSecret, config.googleRefreshToken);
      
      // Call Google My Business / Business Profile API to reply to review
      const replyUrl = `https://mybusiness.googleapis.com/v4/accounts/${config.googleLocationId.split('/')[0] || 'accounts'}/${config.googleLocationId}/reviews/${review.id}/reply`;
      await axios.put(replyUrl, {
        comment: config.autoReplyTemplate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`[LIVE GMB AUTO-REPLY] Submitted to Google for Review ID ${review.id}`);
    } else {
      console.log(`[MOCK GMB AUTO-REPLY] Template: "${config.autoReplyTemplate}" to ${review.customerName}`);
    }

    // Save reply to local DB
    await prisma.googleReview.update({
      where: { id: review.id },
      data: {
        replyText: config.autoReplyTemplate,
        replyStatus: "REPLIED"
      }
    });
  } catch (error: any) {
    console.error("Auto reply failed:", error.message);
    await prisma.googleReview.update({
      where: { id: review.id },
      data: {
        replyText: config.autoReplyTemplate,
        replyStatus: "ERROR"
      }
    });
  }
}

// 4. POST Submit Public Funnel Review
router.post("/reviews/submit", async (req, res) => {
  try {
    const { orgId = DEFAULT_ORG_ID, customerName, rating, comment } = req.body;

    if (!customerName || !rating) {
      return res.status(400).json({ error: "Customer Name and Rating are required" });
    }

    const reviewRating = Number(rating);
    // Negative reviews funnel filter: 3+ star rating gets APPROVED immediately, <3 stars (1 or 2 stars) gets PENDING
    const isPositive = reviewRating >= 3;
    const initialStatus = isPositive ? "APPROVED" : "PENDING";

    const review = await prisma.googleReview.create({
      data: {
        organizationId: orgId,
        customerName,
        rating: reviewRating,
        comment,
        status: initialStatus,
        source: "FUNNEL"
      }
    });

    // Fetch config to check auto-replies
    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    if (config && isPositive) {
      await executeAutoReplyIfApplicable(review, config);
    }

    // Broadcast update to GMB tab agents in real-time
    const updatedReview = await prisma.googleReview.findUnique({ where: { id: review.id } });
    io.to(orgId).emit("new-review", updatedReview || review);

    res.status(201).json({
      message: "Review submitted successfully",
      review: updatedReview || review,
      redirect: isPositive && config?.googleReviewUrl ? config.googleReviewUrl : null
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

    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    // If live credentials exist, write reply to Google GBP API
    if (config && config.googleClientId && config.googleClientSecret && config.googleRefreshToken && config.googleLocationId && config.googleLocationId !== "mock_loc_123456") {
      const token = await getGoogleAccessToken(config.googleClientId, config.googleClientSecret, config.googleRefreshToken);
      
      const replyUrl = `https://mybusiness.googleapis.com/v4/accounts/${config.googleLocationId.split('/')[0] || 'accounts'}/${config.googleLocationId}/reviews/${reviewId}/reply`;
      await axios.put(replyUrl, {
        comment: replyText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(`[LIVE GMB REPLY] Replied review ID ${reviewId}`);
    } else {
      console.log(`[MOCK GMB REPLY] Reply: "${replyText}" for review ID ${reviewId}`);
    }

    const review = await prisma.googleReview.update({
      where: { id: reviewId },
      data: {
        replyText,
        replyStatus: "REPLIED"
      }
    });

    io.to(orgId).emit("review-updated", review);

    res.status(200).json(review);
  } catch (error: any) {
    console.error("Failed to reply to review:", error);
    res.status(500).json({ error: error.message });
  }
});

// 7. POST Mock Webhook Trigger (Simulate Google GBP Direct Review Webhook Event)
router.post("/reviews/mock-webhook", async (req, res) => {
  try {
    const { orgId = DEFAULT_ORG_ID, customerName = "Google Maps Reviewer", rating = 5, comment = "Excellent local shop!" } = req.body;

    // Direct reviews left on Google are always APPROVED immediately
    const review = await prisma.googleReview.create({
      data: {
        organizationId: orgId,
        customerName,
        rating: Number(rating),
        comment,
        status: "APPROVED",
        source: "GOOGLE" // Mock direct review source
      }
    });

    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    if (config) {
      await executeAutoReplyIfApplicable(review, config);
    }

    const updatedReview = await prisma.googleReview.findUnique({ where: { id: review.id } });
    io.to(orgId).emit("new-review", updatedReview || review);

    res.status(200).json({
      message: "Webhook event simulated successfully",
      review: updatedReview || review
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
