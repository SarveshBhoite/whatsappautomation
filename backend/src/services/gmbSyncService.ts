import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

// Helper to get Google access token
export async function getGoogleAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    });
    return response.data.access_token;
  } catch (error: any) {
    console.error("Failed to refresh Google access token:", error?.response?.data || error.message);
    throw new Error("Failed to authenticate with Google APIs");
  }
}

// Helper to resolve the correct GMB location path (accounts/{accountId}/locations/{locationId})
export async function getGmbLocationPath(accessToken: string, locationIdInput: string): Promise<string> {
  const cleanLoc = (locationIdInput || "").trim();
  
  if (cleanLoc.startsWith("accounts/") && cleanLoc.includes("/locations/")) {
    return cleanLoc;
  }
  
  const locId = cleanLoc.replace("locations/", "");
  
  try {
    const accountsRes = await axios.get("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const accounts = accountsRes.data.accounts || [];
    if (accounts.length > 0) {
      const accountId = accounts[0].name.split("/")[1];
      return `accounts/${accountId}/locations/${locId}`;
    }
  } catch (err: any) {
    console.warn("getGmbLocationPath failed to auto-discover GMB Account ID:", err?.response?.data || err.message);
  }
  
  console.warn("Unable to resolve full GMB location path. Using raw location ID as fallback.");
  return `accounts/unknown/locations/${locId}`;
}

// Helper to map starRating string to number
export function mapStarRatingToNumber(rating: any): number {
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

// Helper function to handle auto-replies
export async function executeAutoReplyIfApplicable(review: any, config: any) {
  if (!config.autoReplyEnabled || review.rating < config.autoReplyMinRating || !config.autoReplyTemplate) {
    return;
  }

  try {
    const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    if (review.source === "GOOGLE" && clientId && clientSecret && config.googleRefreshToken && config.googleLocationId) {
      const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
      const locationPath = await getGmbLocationPath(token, config.googleLocationId);
      
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

// Core sync function
export async function syncGmbReviews(orgId: string, io?: any) {
  const config = await prisma.googleBusinessConfig.findUnique({
    where: { organizationId: orgId }
  });

  if (!config) {
    throw new Error("Google Business Configuration not found.");
  }

  const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || !config.googleRefreshToken || !config.googleLocationId) {
    throw new Error("Google Business account is not authorized or Location ID is not configured.");
  }

  const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
  const locationPath = await getGmbLocationPath(token, config.googleLocationId);
  const reviewsUrl = `https://mybusiness.googleapis.com/v4/${locationPath}/reviews`;

  console.log(`[BACKGROUND SYNC] Fetching GMB reviews for org ${orgId}...`);
  const response = await axios.get(reviewsUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const gmbReviews = response.data.reviews || [];
  console.log(`[BACKGROUND SYNC] Found ${gmbReviews.length} reviews from Google.`);

  let syncedCount = 0;

  for (const gmbReview of gmbReviews) {
    const existingReview = await prisma.googleReview.findUnique({
      where: { id: gmbReview.reviewId }
    });

    let currentReviewRecord;

    if (!existingReview) {
      currentReviewRecord = await prisma.googleReview.create({
        data: {
          id: gmbReview.reviewId,
          organizationId: orgId,
          customerName: gmbReview.reviewer?.displayName || "Google Maps Reviewer",
          rating: mapStarRatingToNumber(gmbReview.starRating),
          comment: gmbReview.comment || "",
          status: "APPROVED",
          source: "GOOGLE",
          replyText: gmbReview.reviewReply?.comment || null,
          replyStatus: gmbReview.reviewReply?.comment ? "REPLIED" : "UNREPLIED",
          createdAt: gmbReview.createTime ? new Date(gmbReview.createTime) : new Date(),
        }
      });
      syncedCount++;
    } else {
      currentReviewRecord = await prisma.googleReview.update({
        where: { id: gmbReview.reviewId },
        data: {
          customerName: gmbReview.reviewer?.displayName || existingReview.customerName,
          rating: mapStarRatingToNumber(gmbReview.starRating),
          comment: gmbReview.comment || existingReview.comment,
          replyText: gmbReview.reviewReply?.comment || existingReview.replyText,
          replyStatus: gmbReview.reviewReply?.comment ? "REPLIED" : existingReview.replyStatus,
        }
      });
    }

    if (!gmbReview.reviewReply?.comment && (!currentReviewRecord.replyText || currentReviewRecord.replyStatus === "UNREPLIED")) {
      await executeAutoReplyIfApplicable(currentReviewRecord, config);
    }
  }

  const updatedReviews = await prisma.googleReview.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" }
  });

  if (io) {
    io.to(orgId).emit("reviews-synced", updatedReviews);
  }

  return { syncedCount, reviews: updatedReviews };
}
