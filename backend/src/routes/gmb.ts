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
// Helper to resolve the correct GMB location path (accounts/{accountId}/locations/{locationId})
async function getGmbLocationPath(accessToken: string, locationIdInput: string): Promise<string> {
  const cleanLoc = (locationIdInput || "").trim();
  
  // If it's already a full path (e.g. accounts/X/locations/Y), use it directly
  if (cleanLoc.startsWith("accounts/") && cleanLoc.includes("/locations/")) {
    return cleanLoc;
  }
  
  // Extract clean numeric ID
  const locId = cleanLoc.replace("locations/", "");
  
  // Try to query GMB accounts using Google's API to construct the path
  try {
    const accountsRes = await axios.get("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const accounts = accountsRes.data.accounts || [];
    if (accounts.length > 0) {
      const accountId = accounts[0].name.split("/")[1]; // accounts/{accountId}
      return `accounts/${accountId}/locations/${locId}`;
    }
  } catch (err: any) {
    console.warn("getGmbLocationPath failed to auto-discover GMB Account ID:", err?.response?.data || err.message);
  }
  
  // If no account ID can be resolved, log warning and use location ID only as fallback
  console.warn("Unable to resolve full GMB location path. Using raw location ID as fallback.");
  return `accounts/accounts/locations/${locId}`;
}

// Helper to map starRating string from Google to number
function mapStarRatingToNumber(rating: any): number {
  if (typeof rating === "number") return rating;
  if (!rating) return 5;
  const str = String(rating).toUpperCase();
  if (str.includes("FIVE") || str === "5") return 5;
  if (str.includes("FOUR") || str === "4") return 4;
  if (str.includes("THREE") || str === "3") return 3;
  if (str.includes("TWO") || str === "2") return 2;
  if (str.includes("ONE") || str === "1") return 1;
  return 5;
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

    let locationName = "";
    let googleLocationId = "";

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
    
    // Fetch Google configurations
    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: orgId }
    });

    if (!config) {
      return res.status(404).json({ error: "Google Business Configuration not found." });
    }

    const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret || !config.googleRefreshToken || !config.googleLocationId) {
      return res.status(400).json({ error: "Google Business account is not authorized or Location ID is not configured." });
    }

    // Refresh token to get latest access token
    const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);

    // Get the location resource path
    const locationPath = await getGmbLocationPath(token, config.googleLocationId);

    // Call GMB API to fetch reviews
    const reviewsUrl = `https://mybusiness.googleapis.com/v4/${locationPath}/reviews`;
    console.log(`[SYNC REVIEWS] Fetching from Google Business API: ${reviewsUrl}`);

    const response = await axios.get(reviewsUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const gmbReviews = response.data.reviews || [];
    console.log(`[SYNC REVIEWS] Found ${gmbReviews.length} reviews from Google.`);

    let syncedCount = 0;

    for (const gmbReview of gmbReviews) {
      // Find existing review in database using Google's reviewId
      const existingReview = await prisma.googleReview.findUnique({
        where: { id: gmbReview.reviewId }
      });

      if (!existingReview) {
        // Create new Google review record
        const newReview = await prisma.googleReview.create({
          data: {
            id: gmbReview.reviewId,
            organizationId: orgId,
            customerName: gmbReview.reviewer?.displayName || "Google Maps Reviewer",
            rating: mapStarRatingToNumber(gmbReview.starRating),
            comment: gmbReview.comment || "",
            status: "APPROVED", // Direct GMB reviews are auto-approved
            source: "GOOGLE",
            replyText: gmbReview.reviewReply?.comment || null,
            replyStatus: gmbReview.reviewReply?.comment ? "REPLIED" : "UNREPLIED",
            createdAt: gmbReview.createTime ? new Date(gmbReview.createTime) : new Date(),
          }
        });

        syncedCount++;

        // Trigger auto-reply if applicable and review is unreplied
        if (!gmbReview.reviewReply?.comment) {
          await executeAutoReplyIfApplicable(newReview, config);
        }
      } else {
        // If it exists, update reply status if it changed on Google
        await prisma.googleReview.update({
          where: { id: gmbReview.reviewId },
          data: {
            replyText: gmbReview.reviewReply?.comment || existingReview.replyText,
            replyStatus: gmbReview.reviewReply?.comment ? "REPLIED" : existingReview.replyStatus,
          }
        });
      }
    }

    // Retrieve full updated list
    const updatedReviews = await prisma.googleReview.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" }
    });

    // Notify clients via socket
    io.to(orgId).emit("reviews-synced", updatedReviews);

    res.status(200).json({
      message: `Successfully synchronized reviews. Added ${syncedCount} new reviews.`,
      reviews: updatedReviews
    });

  } catch (error: any) {
    console.error("GMB Reviews Sync failed:", error?.response?.data || error.message);
    const apiErrorMessage = error?.response?.data?.error?.message || error.message;
    res.status(error?.response?.status || 500).json({ error: apiErrorMessage });
  }
});

// Helper function to handle auto-replies
async function executeAutoReplyIfApplicable(review: any, config: any) {
  if (!config.autoReplyEnabled || review.rating < config.autoReplyMinRating || !config.autoReplyTemplate) {
    return;
  }

  try {
    const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    // If we have live credentials, try to submit it to Google (only for real Google reviews)
    if (review.source === "GOOGLE" && clientId && clientSecret && config.googleRefreshToken && config.googleLocationId) {
      const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
      
      // Get the verified location path
      const locationPath = await getGmbLocationPath(token, config.googleLocationId);
      
      // Call Google My Business / Business Profile API to reply to review
      const replyUrl = `https://mybusiness.googleapis.com/v4/${locationPath}/reviews/${review.id}/reply`;
      await axios.put(replyUrl, {
        comment: config.autoReplyTemplate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`[LIVE GMB AUTO-REPLY] Submitted to Google for Review ID ${review.id}`);
    } else {
      console.log(`[LOCAL AUTO-REPLY] Saved locally for ${review.source} review ID ${review.id}`);
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
    console.error("Auto reply failed:", error?.response?.data || error.message);
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
