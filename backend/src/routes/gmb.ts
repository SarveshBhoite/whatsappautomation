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

    res.redirect("http://localhost:3000/?tab=settings&oauth=success");
  } catch (error: any) {
    console.error("OAuth Token Exchange Error:", error?.response?.data || error.message);
    res.redirect("http://localhost:3000/?tab=settings&oauth=error");
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

export default router;
