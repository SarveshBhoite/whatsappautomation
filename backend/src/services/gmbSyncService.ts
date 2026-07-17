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

// ─── GMB POST SYNC FEATURES (merged from feature/gmb-post-sync) ───────────────

// Build a clean GMB local post payload, handling CALL vs URL-based CTAs correctly
export function buildGmbPostPayload(
  summary: string,
  callToActionType?: string,
  callToActionUrl?: string,
  mediaUrl?: string,
  fallbackUrl?: string
) {
  const payload: any = { summary, languageCode: "en" };

  if (callToActionType && callToActionType !== "NONE") {
    if (callToActionType === "CALL") {
      // CALL type does NOT take a URL — it dials the business phone number
      payload.callToAction = { actionType: "CALL" };
    } else {
      const targetUrl = callToActionUrl || fallbackUrl;
      payload.callToAction = { actionType: callToActionType };
      if (targetUrl) payload.callToAction.url = targetUrl;
    }
  }

  if (mediaUrl) {
    payload.media = [{ mediaFormat: "PHOTO", sourceUrl: mediaUrl }];
  }

  return payload;
}

// Log the complete outgoing GMB API request for debugging and audit trails
export function logGmbRequest(method: string, url: string, headers: Record<string, string>, payload: any) {
  console.log("[GMB API REQUEST] ──────────────────────────────────");
  console.log(`  Method:  ${method}`);
  console.log(`  URL:     ${url}`);
  console.log(`  Headers: ${JSON.stringify({ ...headers, Authorization: headers.Authorization ? "Bearer ***REDACTED***" : undefined }, null, 2)}`);
  console.log(`  Payload: ${JSON.stringify(payload, null, 2)}`);
  console.log("[GMB API REQUEST] ──────────────────────────────────");
}

// Sync live GMB posts from the Google API into our local database
export async function syncGmbPosts(orgId: string, io?: any) {
  const config = await prisma.googleBusinessConfig.findUnique({
    where: { organizationId: orgId }
  });

  if (!config) throw new Error("Google Business Configuration not found.");

  const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || !config.googleRefreshToken || !config.googleLocationId) {
    throw new Error("Google Business account is not authorized or Location ID is not configured.");
  }

  const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
  const locationPath = await getGmbLocationPath(token, config.googleLocationId);
  const postsUrl = `https://mybusiness.googleapis.com/v4/${locationPath}/localPosts`;

  console.log(`[BACKGROUND SYNC] Fetching GMB posts for org ${orgId}...`);
  const response = await axios.get(postsUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const gmbPosts = response.data.localPosts || [];
  console.log(`[BACKGROUND SYNC] Found ${gmbPosts.length} posts from Google.`);

  let synced = 0;

  for (const gmbPost of gmbPosts) {
    const existingPost = await prisma.googlePost.findUnique({
      where: { gmbPostId: gmbPost.name }
    });

    let statusMapped = "DRAFT";
    if (gmbPost.state === "LIVE") statusMapped = "PUBLISHED";
    else if (gmbPost.state === "REJECTED") statusMapped = "FAILED";

    const data = {
      summary: gmbPost.summary || "",
      mediaUrl: gmbPost.media?.[0]?.googleUrl || null,
      callToActionType: gmbPost.callToAction?.actionType || null,
      callToActionUrl: gmbPost.callToAction?.url || null,
      status: statusMapped,
      updatedAt: gmbPost.updateTime ? new Date(gmbPost.updateTime) : new Date()
    };

    if (!existingPost) {
      await prisma.googlePost.create({
        data: {
          organizationId: orgId,
          gmbPostId: gmbPost.name,
          title: "",
          createdAt: gmbPost.createTime ? new Date(gmbPost.createTime) : new Date(),
          ...data
        }
      });
    } else {
      await prisma.googlePost.update({ where: { gmbPostId: gmbPost.name }, data });
    }
    synced++;
  }

  const posts = await prisma.googlePost.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" }
  });

  if (io) io.to(orgId).emit("posts-synced", posts);

  return { synced, posts, length: posts.length };
}

// Publish a single scheduled post to GMB — called by the background scheduler
export async function publishPostToGmb(postId: string, io?: any) {
  console.log(`[SCHEDULED PUBLISHER] Attempting to publish post ID ${postId}...`);

  const post = await prisma.googlePost.findUnique({ where: { id: postId } });
  if (!post) { console.error(`[SCHEDULED PUBLISHER] Post ID ${postId} not found.`); return; }
  if (post.status === "PUBLISHED" || post.gmbPostId) {
    console.log(`[SCHEDULED PUBLISHER] Post ID ${postId} already published.`); return;
  }

  // Mark as PUBLISHING to prevent duplicate publish race conditions
  let currentPost = await prisma.googlePost.update({
    where: { id: postId },
    data: { status: "PUBLISHING" }
  });
  if (io) io.to(post.organizationId).emit("post-updated", currentPost);

  try {
    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId: post.organizationId }
    });
    if (!config) throw new Error("Google Business Configuration not found.");

    const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret || !config.googleRefreshToken || !config.googleLocationId) {
      throw new Error("Google credentials or Location ID are not configured.");
    }

    const token = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);
    const locationPath = await getGmbLocationPath(token, config.googleLocationId);
    const localPostUrl = `https://mybusiness.googleapis.com/v4/${locationPath}/localPosts`;

    const payload = buildGmbPostPayload(
      post.summary,
      post.callToActionType || undefined,
      post.callToActionUrl || undefined,
      post.mediaUrl || undefined,
      config.googleReviewUrl || undefined
    );

    const headers = { Authorization: `Bearer ${token}` };
    logGmbRequest("POST", localPostUrl, headers, payload);

    const postRes = await axios.post(localPostUrl, payload, { headers });
    const gmbPostId = postRes.data.name;

    const updatedPost = await prisma.googlePost.update({
      where: { id: postId },
      data: { gmbPostId, status: "PUBLISHED", publishedAt: new Date(), publishError: null }
    });

    console.log(`[SCHEDULED PUBLISHER] Post ${postId} published as GMB ID ${gmbPostId}`);
    if (io) io.to(post.organizationId).emit("post-updated", updatedPost);
    return updatedPost;

  } catch (error: any) {
    const errorMsg = error?.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error(`[SCHEDULED PUBLISHER] Failed to publish post ${postId}:`, errorMsg);

    const failedPost = await prisma.googlePost.update({
      where: { id: postId },
      data: {
        status: "FAILED",
        publishError: errorMsg.substring(0, 500),
        retryCount: (post.retryCount || 0) + 1
      }
    });

    if (io) io.to(post.organizationId).emit("post-updated", failedPost);
    return failedPost;
  }
}

