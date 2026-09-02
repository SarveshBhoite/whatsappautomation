import axios from "axios";
import prisma from "../utils/prisma";

// ─── HELPER & ENV VALIDATION ───────────────────────────────────────────────────

function maskString(str: string): string {
  if (!str) return "[EMPTY]";
  if (str.length <= 6) return "****";
  return `${str.substring(0, 3)}****${str.substring(str.length - 3)}`;
}

export function getLinkedInCredentials() {
  const clientId = (
    process.env.LINKEDIN_MEMBER_CLIENT_ID ||
    process.env.LINKEDIN_CLIENT_ID ||
    ""
  ).trim();

  const clientSecret = (
    process.env.LINKEDIN_MEMBER_CLIENT_SECRET ||
    process.env.LINKEDIN_CLIENT_SECRET ||
    ""
  ).trim();

  const redirectUri = (
    process.env.LINKEDIN_MEMBER_REDIRECT_URI ||
    process.env.LINKEDIN_REDIRECT_URI ||
    "http://localhost:5000/api/linkedin/auth/callback"
  ).trim();

  return { clientId, clientSecret, redirectUri };
}

export function getLinkedInOrgCredentials() {
  const clientId = (
    process.env.LINKEDIN_ORG_CLIENT_ID ||
    ""
  ).trim();

  const clientSecret = (
    process.env.LINKEDIN_ORG_CLIENT_SECRET ||
    ""
  ).trim();

  const redirectUri = (
    process.env.LINKEDIN_ORG_REDIRECT_URI ||
    "http://localhost:5000/api/linkedin/auth/org/callback"
  ).trim();

  const scopes = (
    process.env.LINKEDIN_ORG_SCOPES ||
    "r_organization_social rw_organization_admin r_organization_social_feed w_organization_social w_organization_social_feed r_organization_followers"
  ).trim();

  return { clientId, clientSecret, redirectUri, scopes };
}

export function validateLinkedInEnv() {
  const { clientId, clientSecret, redirectUri } = getLinkedInCredentials();
  const errors: string[] = [];

  if (!clientId) errors.push("Missing LINKEDIN_MEMBER_CLIENT_ID in backend/.env");
  if (!clientSecret) errors.push("Missing LINKEDIN_MEMBER_CLIENT_SECRET in backend/.env");
  if (!redirectUri) errors.push("Missing LINKEDIN_MEMBER_REDIRECT_URI in backend/.env");

  if (errors.length > 0) {
    console.warn(`[LINKEDIN CONFIG WARNING] Startup Validation Issues:\n - ${errors.join("\n - ")}`);
  } else {
    console.log(`[LINKEDIN CONFIG] Startup Validation Passed: Client ID=${maskString(clientId)}, Redirect URI=${redirectUri}`);
  }

  return { isValid: errors.length === 0, errors, clientId, clientSecret, redirectUri };
}

export function validateLinkedInOrgEnv() {
  const { clientId, clientSecret, redirectUri } = getLinkedInOrgCredentials();
  const errors: string[] = [];

  if (!clientId) errors.push("Missing LINKEDIN_ORG_CLIENT_ID in backend/.env");
  if (!clientSecret) errors.push("Missing LINKEDIN_ORG_CLIENT_SECRET in backend/.env");
  if (!redirectUri) errors.push("Missing LINKEDIN_ORG_REDIRECT_URI in backend/.env");

  if (errors.length > 0) {
    console.warn(`[LINKEDIN ORG CONFIG WARNING] Startup Validation Issues:\n - ${errors.join("\n - ")}`);
  } else {
    console.log(`[LINKEDIN ORG CONFIG] Startup Validation Passed: Client ID=${maskString(clientId)}, Redirect URI=${redirectUri}`);
  }

  return { isValid: errors.length === 0, errors, clientId, clientSecret, redirectUri };
}

// ─── PROVIDER ARCHITECTURE ───────────────────────────────────────────────────

export interface ILinkedInProvider {
  getProfile(accessToken: string): Promise<any>;
  getPosts(organizationId: string): Promise<any>;
  publishPost?(accessToken: string, memberId: string, text: string, mediaUrl?: string): Promise<any>;
}

/**
 * Phase 1: Personal LinkedIn Provider (Member Login)
 * Handles Personal LinkedIn Authentication via OpenID Connect (openid, profile, email).
 * 
 * NOTE ON LINKEDIN MEMBER API LIMITATION (Requirement 10):
 * LinkedIn's standard Member API (using openid, profile, email, w_member_social)
 * DOES NOT provide permission to read a user's existing personal posts or feed timeline.
 * The 'r_member_social' scope is restricted to approved LinkedIn partner applications.
 * Therefore, we do not attempt to fetch personal timeline posts from LinkedIn API.
 * Instead, the CRM database is used as the single source of truth for all posts created via CRM.
 */
export class PersonalProvider implements ILinkedInProvider {
  public async getProfile(accessToken: string) {
    if (!accessToken || accessToken.trim().length < 10 || accessToken.startsWith("mock")) {
      return { id: "", name: "", email: "", headline: "LinkedIn Member", picture: "", locale: "en_US" };
    }

    const url = "https://api.linkedin.com/v2/userinfo";
    const headers = { Authorization: `Bearer ${accessToken}` };
    console.log(`[LINKEDIN] Fetching Member Profile: ${url}`);

    try {
      const response = await axios.get(url, { headers });
      console.log("[LINKEDIN] Profile Success:", JSON.stringify(response.data));

      let formattedLocale = "en_US";
      if (typeof response.data.locale === "string") {
        formattedLocale = response.data.locale;
      } else if (response.data.locale && typeof response.data.locale === "object") {
        const lang = response.data.locale.language || response.data.locale.lang || "en";
        const country = response.data.locale.country || response.data.locale.region || "US";
        formattedLocale = `${lang}_${country}`;
      }

      const name = response.data.name || `${response.data.given_name || ""} ${response.data.family_name || ""}`.trim() || "LinkedIn User";

      return {
        id: response.data.sub || "",
        name,
        email: response.data.email || "",
        headline: response.data.headline || "LinkedIn Member Profile",
        picture: response.data.picture || "",
        locale: formattedLocale,
        sub: response.data.sub || "",
        given_name: response.data.given_name || "",
        family_name: response.data.family_name || ""
      };
    } catch (err: any) {
      const status = err?.response?.status || 500;
      const data = err?.response?.data || {};
      console.error(`[LINKEDIN] UserInfo Error [HTTP ${status}]:`, JSON.stringify(data));
      throw err;
    }
  }

  /**
   * Return CRM-published posts from database.
   * Personal feed fetching from LinkedIn is intentionally omitted due to API scope restrictions.
   */
  public async getPosts(organizationId: string) {
    return {
      permissionGranted: true,
      message: "Personal LinkedIn posts are managed via CRM database due to LinkedIn Member API permissions.",
      posts: []
    };
  }

  /**
   * Helper: Register and Upload Image via LinkedIn REST Images API (/rest/images?action=initializeUpload)
   */
  private async uploadImageToLinkedIn(accessToken: string, author: string, filePathOrUrl: string): Promise<string> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202607",
      "X-Restli-Protocol-Version": "2.0.0"
    };

    console.log("=======================================================");
    console.log("[DEBUG STEP 1] Requesting POST /rest/images?action=initializeUpload");
    console.log(`Author: ${author}`);

    const initRes = await axios.post(
      "https://api.linkedin.com/rest/images?action=initializeUpload",
      {
        initializeUploadRequest: {
          owner: author
        }
      },
      { headers }
    );

    console.log("[DEBUG STEP 1 RESPONSE JSON]:", JSON.stringify(initRes.data, null, 2));

    const uploadUrl = initRes.data?.value?.uploadUrl;
    const imageUrn = initRes.data?.value?.image;

    console.log(`[DEBUG STEP 2] Upload URL: ${uploadUrl}`);
    console.log(`[DEBUG STEP 4] Image URN: ${imageUrn}`);

    if (!uploadUrl || !imageUrn) {
      console.error("[DEBUG STEP 4] NO Image URN returned! Stopping.");
      throw new Error(`Failed to initialize image upload: ${JSON.stringify(initRes.data)}`);
    }

    // Download binary file buffer from ImageKit / HTTP URL or local path
    let fileBuffer: Buffer;
    if (filePathOrUrl.startsWith("http://") || filePathOrUrl.startsWith("https://")) {
      console.log(`[LINKEDIN MEDIA] Downloading file from cloud CDN: ${filePathOrUrl}`);
      const downloadRes = await axios.get(filePathOrUrl, { responseType: "arraybuffer" });
      fileBuffer = Buffer.from(downloadRes.data);
    } else {
      fileBuffer = require("fs").readFileSync(filePathOrUrl);
    }

    console.log(`[DEBUG STEP 3] Uploading binary image via PUT...`);
    console.log(`Content-Length: ${fileBuffer.length} bytes`);

    // PUT binary image to LinkedIn uploadUrl
    const putRes = await axios.put(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream"
      }
    });

    console.log(`[DEBUG STEP 3 RESPONSE] PUT HTTP Status: ${putRes.status}`);
    console.log(`[DEBUG STEP 3 RESPONSE Headers]:`, JSON.stringify(putRes.headers, null, 2));

    // Step 4: Verify image status becomes AVAILABLE before publishing per REST Images API docs
    console.log(`[LINKEDIN MEDIA] Step 4: Polling image status for ${imageUrn}...`);
    let attempts = 0;
    const maxAttempts = 15;
    while (attempts < maxAttempts) {
      attempts++;
      try {
        const statusRes = await axios.get(`https://api.linkedin.com/rest/images/${encodeURIComponent(imageUrn)}`, { headers });
        const status = statusRes.data?.status;
        console.log(`[LINKEDIN MEDIA] Image status attempt ${attempts}: ${status}`);
        if (status === "AVAILABLE") {
          break;
        } else if (status === "PROCESSING_FAILED") {
          throw new Error("LinkedIn image processing failed.");
        }
      } catch (pollErr: any) {
        if (attempts >= 3 && pollErr?.response?.status !== 404) break;
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    return imageUrn;
  }

  /**
   * Helper: Register, Upload & Poll Video via LinkedIn REST Videos API (/rest/videos?action=initializeUpload)
   */
  private async uploadVideoToLinkedIn(accessToken: string, author: string, filePathOrUrl: string, fileSize: number): Promise<string> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202607",
      "X-Restli-Protocol-Version": "2.0.0"
    };

    console.log(`[LINKEDIN MEDIA] Step 1: Initializing Video Upload for ${author}...`);
    const initRes = await axios.post(
      "https://api.linkedin.com/rest/videos?action=initializeUpload",
      {
        initializeUploadRequest: {
          owner: author,
          fileSizeBytes: fileSize,
          uploadCaptions: false,
          uploadThumbnail: false
        }
      },
      { headers }
    );

    const uploadInstructions = initRes.data?.value?.uploadInstructions || [];
    const videoUrn = initRes.data?.value?.video;
    const uploadToken = initRes.data?.value?.uploadToken || "";

    if (!videoUrn || uploadInstructions.length === 0) {
      throw new Error(`Failed to initialize video upload: ${JSON.stringify(initRes.data)}`);
    }

    console.log(`[LINKEDIN MEDIA] Step 2: Video URN received: ${videoUrn}, UploadToken present: ${Boolean(uploadToken)}`);

    // Download video binary buffer from ImageKit / HTTP URL or local path
    let fileBuffer: Buffer;
    if (filePathOrUrl.startsWith("http://") || filePathOrUrl.startsWith("https://")) {
      console.log(`[LINKEDIN MEDIA] Downloading video from cloud CDN: ${filePathOrUrl}`);
      const downloadRes = await axios.get(filePathOrUrl, { responseType: "arraybuffer" });
      fileBuffer = Buffer.from(downloadRes.data);
    } else {
      fileBuffer = require("fs").readFileSync(filePathOrUrl);
    }

    // Upload parts and capture ETags
    const uploadedPartIds: string[] = [];
    for (const instruction of uploadInstructions) {
      const { uploadUrl, firstByte, lastByte } = instruction;
      if (firstByte >= fileBuffer.length) {
        console.log(`[LINKEDIN MEDIA] Skipping unnecessary instruction for firstByte ${firstByte} >= file size ${fileBuffer.length}`);
        continue;
      }
      const actualLastByte = Math.min(lastByte, fileBuffer.length - 1);
      const chunk = fileBuffer.subarray(firstByte, actualLastByte + 1);
      console.log(`[LINKEDIN MEDIA] Step 3: Uploading video chunk bytes ${firstByte}-${actualLastByte} (${chunk.length} bytes)...`);
      try {
        const chunkRes = await axios.put(uploadUrl, chunk, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/octet-stream"
          }
        });
        const etag = chunkRes.headers["etag"] || chunkRes.headers["eTag"] || "";
        if (etag) {
          uploadedPartIds.push(etag.replace(/"/g, ""));
        }
        console.log(`[LINKEDIN MEDIA] Chunk upload HTTP Status: ${chunkRes.status}, ETag: ${etag}`);
      } catch (chunkErr: any) {
        const errorDetails = chunkErr?.response?.data;
        const formatted = Buffer.isBuffer(errorDetails) ? errorDetails.toString("utf-8") : JSON.stringify(errorDetails || chunkErr.message);
        console.error(`[LINKEDIN VIDEO CHUNK ERROR HTTP ${chunkErr?.response?.status}]:`, formatted);
        throw new Error(`Video Chunk Upload Failed: ${formatted}`);
      }
    }

    // Finalize video upload
    console.log(`[LINKEDIN MEDIA] Step 4: Finalizing video upload for URN ${videoUrn}...`);
    try {
      const finalizeRes = await axios.post(
        "https://api.linkedin.com/rest/videos?action=finalizeUpload",
        {
          finalizeUploadRequest: {
            video: videoUrn,
            uploadToken,
            uploadedPartIds
          }
        },
        { headers }
      );
      console.log(`[LINKEDIN MEDIA] Finalize HTTP Status: ${finalizeRes.status}`);
    } catch (finalizeErr: any) {
      console.error(`[LINKEDIN MEDIA] Video finalizeUpload error details:`, JSON.stringify(finalizeErr?.response?.data || finalizeErr.message, null, 2));
    }

    // Step 5: Poll status until AVAILABLE
    console.log(`[LINKEDIN MEDIA] Step 5: Polling video processing status for ${videoUrn}...`);
    let attempts = 0;
    const maxAttempts = 30;
    while (attempts < maxAttempts) {
      attempts++;
      await new Promise(r => setTimeout(r, 3000));
      try {
        const statusRes = await axios.get(`https://api.linkedin.com/rest/videos/${encodeURIComponent(videoUrn)}`, { headers });
        const status = statusRes.data?.status;
        console.log(`[LINKEDIN MEDIA] Video status attempt ${attempts}: ${status}`);
        if (status === "AVAILABLE") {
          break;
        } else if (status === "PROCESSING_FAILED") {
          throw new Error("LinkedIn video processing failed.");
        }
      } catch (pollErr: any) {
        if (attempts >= 5 && pollErr?.response?.status !== 404) break;
      }
    }

    return videoUrn;
  }

  /**
   * Helper: Register, Upload & Poll Document via LinkedIn REST Documents API (/rest/documents?action=initializeUpload)
   */
  private async uploadDocumentToLinkedIn(accessToken: string, author: string, filePathOrUrl: string, title: string = "Document"): Promise<string> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202607",
      "X-Restli-Protocol-Version": "2.0.0"
    };

    console.log(`[LINKEDIN MEDIA] Step 1: Initializing Document Upload for ${author}...`);
    
    // Initializing Document Upload via REST Documents API
    const initRes = await axios.post(
      "https://api.linkedin.com/rest/documents?action=initializeUpload",
      {
        initializeUploadRequest: {
          owner: author
        }
      },
      { headers }
    );

    const documentUrn = initRes.data?.value?.document;
    const uploadUrl = initRes.data?.value?.uploadUrl;

    if (!documentUrn || !uploadUrl) {
      throw new Error(`Failed to initialize document upload: ${JSON.stringify(initRes.data)}`);
    }

    console.log(`[LINKEDIN MEDIA] Step 2: Document URN received: ${documentUrn}`);
    console.log(`[LINKEDIN MEDIA] Step 3: Uploading binary document to uploadUrl...`);

    let fileBuffer: Buffer;
    if (filePathOrUrl.startsWith("http://") || filePathOrUrl.startsWith("https://")) {
      console.log(`[LINKEDIN MEDIA] Downloading document from cloud CDN: ${filePathOrUrl}`);
      const downloadRes = await axios.get(filePathOrUrl, { responseType: "arraybuffer" });
      fileBuffer = Buffer.from(downloadRes.data);
    } else {
      fileBuffer = require("fs").readFileSync(filePathOrUrl);
    }

    const uploadRes = await axios.put(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/pdf"
      }
    });

    console.log(`[LINKEDIN MEDIA] Binary upload HTTP Status: ${uploadRes.status}`);

    // Step 4: Poll status until AVAILABLE
    console.log(`[LINKEDIN MEDIA] Step 4: Polling document processing status for ${documentUrn}...`);
    let attempts = 0;
    const maxAttempts = 30;
    while (attempts < maxAttempts) {
      attempts++;
      await new Promise(r => setTimeout(r, 2000));
      try {
        const statusRes = await axios.get(`https://api.linkedin.com/rest/documents/${encodeURIComponent(documentUrn)}`, { headers });
        const status = statusRes.data?.status;
        console.log(`[LINKEDIN MEDIA] Document status attempt ${attempts}: ${status}`);
        if (status === "AVAILABLE") {
          break;
        } else if (status === "PROCESSING_FAILED") {
          throw new Error(`LinkedIn document processing failed: ${JSON.stringify(statusRes.data)}`);
        }
      } catch (pollErr: any) {
        if (attempts >= 5 && pollErr?.response?.status !== 404) break;
      }
    }

    return documentUrn;
  }

  /**
   * Share / Publish a post to LinkedIn using LinkedIn REST Posts API or versioned UGC Posts API
   */
  public async publishPost(accessToken: string, memberId: string, text: string, mediaUrl?: string) {
    const author = memberId.startsWith("urn:li:person:") ? memberId : `urn:li:person:${memberId}`;

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202607",
      "X-Restli-Protocol-Version": "2.0.0"
    };

    console.log("");
    console.log("========== LINKEDIN NATIVE MEDIA POST PUBLICATION ATTEMPT ==========");
    console.log(`LinkedIn Member ID: ${memberId}`);
    console.log(`Author URN: ${author}`);
    console.log(`Raw Media Input: ${mediaUrl || "None"}`);

    let mediaCategory: "NONE" | "IMAGE" | "VIDEO" | "DOCUMENT" = "NONE";
    let mediaUrn: string | null = null;

    // Detect media type and perform native LinkedIn Media Upload if mediaUrl is provided
    if (mediaUrl && mediaUrl.trim().length > 0) {
      const cleanUrl = mediaUrl.trim();
      const ext = cleanUrl.split("?")[0].split(".").pop()?.toLowerCase() || "";

      // File extension checks
      const imageExts = ["jpg", "jpeg", "png", "webp"];
      const videoExts = ["mp4", "mov", "avi", "webm", "mpeg"];
      const docExts = ["pdf"];

      try {
        if (imageExts.includes(ext)) {
          mediaCategory = "IMAGE";
          mediaUrn = await this.uploadImageToLinkedIn(accessToken, author, cleanUrl);
        } else if (videoExts.includes(ext)) {
          mediaCategory = "VIDEO";

          // Calculate file size for video upload initialization
          let fileSize = 10 * 1024 * 1024;
          if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
            const isLocalhost = cleanUrl.includes("localhost") || cleanUrl.includes("127.0.0.1");
            if (isLocalhost) {
              const urlObj = new URL(cleanUrl);
              const relativePath = urlObj.pathname.replace(/^\//, "");
              const localDiskPath = require("path").join(process.cwd(), relativePath);
              fileSize = require("fs").statSync(localDiskPath).size;
            }
          } else {
            fileSize = require("fs").statSync(cleanUrl).size;
          }

          mediaUrn = await this.uploadVideoToLinkedIn(accessToken, author, cleanUrl, fileSize);
        } else if (docExts.includes(ext)) {
          mediaCategory = "DOCUMENT";
          mediaUrn = await this.uploadDocumentToLinkedIn(accessToken, author, cleanUrl, "Document Attachment");
        } else {
          console.warn(`[LINKEDIN MEDIA] Unrecognized extension .${ext}. Attempting image upload...`);
          mediaCategory = "IMAGE";
          mediaUrn = await this.uploadImageToLinkedIn(accessToken, author, cleanUrl);
        }
      } catch (uploadErr: any) {
        const errorData = uploadErr?.response?.data;
        const formattedErr = Buffer.isBuffer(errorData) ? errorData.toString("utf-8") : (errorData || uploadErr.message);
        console.error(`[LINKEDIN NATIVE MEDIA UPLOAD FAILED]:`, formattedErr);
        throw new Error(`LinkedIn Native Media Upload Failed: ${formattedErr}`);
      }
    }

    // 1. Primary Attempt: LinkedIn REST Posts API (/rest/posts) with NATIVE MEDIA ASSET URN
    const restPostsUrl = "https://api.linkedin.com/rest/posts";
    const restPayload: any = {
      author,
      commentary: text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false
    };

    if (mediaUrn && mediaCategory === "IMAGE") {
      restPayload.content = {
        media: {
          id: mediaUrn
        }
      };
    } else if (mediaUrn && mediaCategory === "VIDEO") {
      restPayload.content = {
        media: {
          id: mediaUrn
        }
      };
    } else if (mediaUrn && mediaCategory === "DOCUMENT") {
      restPayload.content = {
        media: {
          id: mediaUrn,
          title: "Document Attachment"
        }
      };
    } else if (mediaUrl && (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://")) && !mediaCategory) {
      // Article / Link Preview Content schema for LinkedIn REST Posts API
      restPayload.content = {
        article: {
          source: mediaUrl.trim(),
          title: text.substring(0, 100) || "Shared Article"
        }
      };
    }

    console.log("=======================================================");
    console.log("[DEBUG STEP 5] EXACT PAYLOAD SENT TO POST /rest/posts:");
    console.log(JSON.stringify(restPayload, null, 2));
    console.log("=======================================================");

    try {
      const response = await axios.post(restPostsUrl, restPayload, { headers });
      console.log(`[DEBUG STEP 7] LinkedIn Response HTTP Status: ${response.status}`);
      console.log(`[DEBUG STEP 7] Response Headers:`, JSON.stringify(response.headers, null, 2));
      console.log(`[DEBUG STEP 7] Response JSON Body:`, JSON.stringify(response.data, null, 2));
      
      const postId = response.headers["x-restli-id"] || response.data?.id || response.data?.urn || `urn:li:share:${Date.now()}`;

      // STEP 8: Fetch post from LinkedIn API to verify what LinkedIn actually stored
      console.log(`[DEBUG STEP 8] Fetching created post from LinkedIn API: ${restPostsUrl}/${encodeURIComponent(postId)}`);
      try {
        const fetchedPostRes = await axios.get(`${restPostsUrl}/${encodeURIComponent(postId)}`, { headers });
        console.log(`[DEBUG STEP 8] Fetched Post HTTP Status: ${fetchedPostRes.status}`);
        console.log(`[DEBUG STEP 8] Fetched Post JSON Body:`, JSON.stringify(fetchedPostRes.data, null, 2));
      } catch (fetchErr: any) {
        console.warn(`[DEBUG STEP 8] Could not fetch stored post (HTTP ${fetchErr?.response?.status}):`, JSON.stringify(fetchErr?.response?.data || fetchErr.message));
      }

      console.log("=======================================================");
      return { success: true, id: postId, urn: postId, data: response.data };
    } catch (restErr: any) {
      const restStatus = restErr?.response?.status || 500;
      const restData = restErr?.response?.data || {};
      const errorMsg = restData?.message || restData?.errorDetailType || restErr.message || "LinkedIn API rejected publication request";

      console.error("");
      console.error("========== LINKEDIN REST POSTS ERROR REPORT ==========");
      console.error(`HTTP Status: ${restStatus}`);
      console.error(`Endpoint: ${restPostsUrl}`);
      console.error(`Author URN: ${author}`);
      console.error(`Response Body: ${JSON.stringify(restData, null, 2)}`);
      console.error("======================================================");
      console.error("");

      return {
        success: false,
        status: restStatus,
        error: errorMsg,
        details: restData
      };
    }
  }

  /**
   * Fetch Social Metadata (Likes / Reactions and Comments count) via LinkedIn REST Social Metadata API
   * Endpoint: GET https://api.linkedin.com/rest/socialMetadata/{entityUrn}
   */
  public async getSocialMetadata(accessToken: string, postUrn: string): Promise<{ likesCount: number; commentsCount: number }> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": "202607",
      "X-Restli-Protocol-Version": "2.0.0"
    };

    let totalReactions = 0;
    let totalComments = 0;

    // List of candidate URN representations to test against LinkedIn REST API
    const candidateUrns: string[] = [postUrn];
    if (postUrn.startsWith("urn:li:share:")) {
      const shareId = postUrn.replace("urn:li:share:", "");
      candidateUrns.push(`urn:li:activity:${shareId}`);
      candidateUrns.push(`urn:li:ugcPost:${shareId}`);
    } else if (postUrn.startsWith("urn:li:ugcPost:")) {
      const ugcId = postUrn.replace("urn:li:ugcPost:", "");
      candidateUrns.push(`urn:li:activity:${ugcId}`);
    }

    // 1. Try querying /rest/socialMetadata/{entityUrn}
    for (const candidate of candidateUrns) {
      try {
        const encodedUrn = encodeURIComponent(candidate);
        const url = `https://api.linkedin.com/rest/socialMetadata/${encodedUrn}`;
        console.log(`[LINKEDIN ENGAGEMENT] Querying social metadata for ${candidate}...`);
        const response = await axios.get(url, { headers, timeout: 6000 });
        const data = response.data || {};

        console.log(`[LINKEDIN ENGAGEMENT RESPONSE for ${candidate}]:`, JSON.stringify(data));

        if (data.reactionSummaries) {
          totalReactions = Object.values(data.reactionSummaries).reduce((acc: number, item: any) => acc + (item.count || 0), 0);
        } else if (data.likesSummary?.totalLikes !== undefined) {
          totalReactions = Number(data.likesSummary.totalLikes) || 0;
        } else if (data.totalShares !== undefined) {
          totalReactions = Number(data.totalShares) || 0;
        }

        if (data.commentsSummary?.totalComments !== undefined) {
          totalComments = Number(data.commentsSummary.totalComments) || 0;
        } else if (data.commentSummary?.count !== undefined) {
          totalComments = Number(data.commentSummary.count) || 0;
        }

        // If data found, break early
        if (totalReactions > 0 || totalComments > 0) {
          break;
        }
      } catch (err: any) {
        console.warn(`[LINKEDIN ENGAGEMENT NOTICE] /rest/socialMetadata notice for ${candidate} (HTTP ${err?.response?.status}):`, err?.response?.data?.message || err.message);
      }
    }

    console.log(`[LINKEDIN ENGAGEMENT FINAL RESULT] ${postUrn} => Likes: ${totalReactions}, Comments: ${totalComments}`);

    return {
      likesCount: Number(totalReactions) || 0,
      commentsCount: Number(totalComments) || 0
    };
  }

  /**
   * Delete a post live from LinkedIn via REST Posts API
   */
  public async deletePost(accessToken: string, postUrn: string): Promise<{ success: boolean; status: number; message?: string }> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": "202607",
      "X-Restli-Protocol-Version": "2.0.0"
    };

    const encodedUrn = encodeURIComponent(postUrn);
    const deleteUrl = `https://api.linkedin.com/rest/posts/${encodedUrn}`;

    console.log("=======================================================");
    console.log(`[LINKEDIN DELETE] Issuing DELETE request to LinkedIn API...`);
    console.log(`Target URN: ${postUrn}`);
    console.log(`Endpoint: ${deleteUrl}`);
    console.log("=======================================================");

    try {
      const response = await axios.delete(deleteUrl, { headers });
      console.log(`[LINKEDIN DELETE SUCCESS] HTTP Status: ${response.status}`);
      return { success: true, status: response.status, message: "Post deleted successfully from LinkedIn live feed." };
    } catch (err: any) {
      const status = err?.response?.status || 500;
      const data = err?.response?.data || {};
      console.error(`[LINKEDIN DELETE ERROR] HTTP ${status}:`, JSON.stringify(data));

      // HTTP 404 means the post was already deleted directly on LinkedIn.com - treat as success for sync purposes
      if (status === 404) {
        console.warn(`[LINKEDIN DELETE] Post ${postUrn} was already deleted directly on LinkedIn.com (404 Not Found). Proceeding to clean up CRM database.`);
        return { success: true, status: 404, message: "Post already deleted on LinkedIn.com." };
      }

      throw new Error(data?.message || data?.errorDetailType || err.message || `LinkedIn API post deletion failed with status ${status}`);
    }
  }
}

/**
 * Phase 2: Organization LinkedIn Provider (CRM3 Community Management Integration)
 * Full implementation of LinkedIn Community Management REST APIs for Organization / Company Pages.
 * Includes in-memory TTL caching, in-flight request deduplication, and Retry-After exponential backoff.
 */
export class OrganizationProvider implements ILinkedInProvider {
  // In-memory cache for all CRM3 LinkedIn API data
  private static cache: Map<string, { data: any; expiresAt: number }> = new Map();
  // In-flight promises to deduplicate concurrent identical requests
  private static inFlightRequests: Map<string, Promise<any>> = new Map();

  /**
   * Helper to build LinkedIn REST API headers
   */
  public static getHeaders(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": "202607",
      "X-Restli-Protocol-Version": "2.0.0"
    };
  }

  /**
   * Execute or reuse in-flight / cached request with max 1 gentle Retry-After backoff on HTTP 429
   */
  private static async executeWithDeduplication<T>(
    cacheKey: string,
    ttlMs: number,
    fetcher: () => Promise<T>,
    fallbackValue: T
  ): Promise<T> {
    // 1. Return from TTL cache if valid
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    // 2. Return in-flight promise if currently running
    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey) as Promise<T>;
    }

    // 3. Dispatch fetch with single gentle retry on HTTP 429
    const taskPromise = (async () => {
      try {
        const data = await fetcher();
        this.cache.set(cacheKey, { data, expiresAt: Date.now() + ttlMs });
        return data;
      } catch (err: any) {
        const status = err?.response?.status;
        const retryAfterHeader = err?.response?.headers?.["retry-after"];

        if (status === 429) {
          let waitMs = 2000;
          if (retryAfterHeader) {
            const parsedSeconds = parseInt(retryAfterHeader, 10);
            if (!isNaN(parsedSeconds) && parsedSeconds > 0 && parsedSeconds <= 10) {
              waitMs = parsedSeconds * 1000;
            }
          }
          console.warn(`[LINKEDIN ORG 429 BACKOFF] Rate limit hit for ${cacheKey}. Backing off for ${waitMs}ms (Retry-After)...`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));

          try {
            const retryData = await fetcher();
            this.cache.set(cacheKey, { data: retryData, expiresAt: Date.now() + ttlMs });
            return retryData;
          } catch (retryErr: any) {
            console.warn(`[LINKEDIN ORG 429 RETRY FAILED] Fallback used for ${cacheKey}:`, retryErr?.response?.data?.message || retryErr.message);
            // Cache fallback for a shorter cooldown (60s) to avoid hammer loops
            this.cache.set(cacheKey, { data: fallbackValue, expiresAt: Date.now() + 60 * 1000 });
            return fallbackValue;
          }
        }

        console.warn(`[LINKEDIN ORG NOTICE] Error on ${cacheKey}:`, err?.response?.data?.message || err.message);
        return fallbackValue;
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, taskPromise);
    return taskPromise;
  }

  /**
   * Fetch Organization details via LinkedIn REST Organizations API
   */
  public async getProfile(accessToken: string): Promise<any> {
    const orgs = await this.getAdminOrganizations(accessToken);
    if (orgs.length > 0) {
      return orgs[0];
    }
    return null;
  }

  /**
   * Find organizations where user has administrative roles
   */
  public async getAdminOrganizations(accessToken: string): Promise<any[]> {
    const cacheKey = `admin_orgs_${accessToken.substring(accessToken.length - 12)}`;
    // Cache for 10 minutes
    return OrganizationProvider.executeWithDeduplication<any[]>(
      cacheKey,
      10 * 60 * 1000,
      async () => {
        const headers = OrganizationProvider.getHeaders(accessToken);
        console.log("[LINKEDIN ORG] Fetching organization ACLs...");

        let aclRes;
        try {
          aclRes = await axios.get("https://api.linkedin.com/rest/organizationalEntityAcls?q=roleAssignee", {
            headers,
            timeout: 8000
          });
        } catch (restErr: any) {
          console.warn("[LINKEDIN ORG] /rest/organizationalEntityAcls notice, trying /v2/organizationalEntityAcls:", restErr.message);
          aclRes = await axios.get("https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED", {
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: 8000
          });
        }

        const elements = aclRes?.data?.elements || [];
        const orgUrns: string[] = elements
          .map((el: any) => el.organizationalTarget || el.organizationTarget || el.organization)
          .filter((urn: string) => Boolean(urn && (urn.includes("urn:li:organization:") || urn.includes("urn:li:organizationBrand:"))));

        console.log(`[LINKEDIN ORG] Found ${orgUrns.length} organization targets in ACL:`, orgUrns);

        if (orgUrns.length === 0) {
          return [];
        }

        const orgDetailsList: any[] = [];
        for (const orgUrn of orgUrns) {
          try {
            const orgId = orgUrn.replace("urn:li:organization:", "").replace("urn:li:organizationBrand:", "");
            const details = await this.getCompanyDetails(accessToken, orgId);
            if (details) {
              orgDetailsList.push(details);
            }
          } catch (detailErr: any) {
            console.warn(`[LINKEDIN ORG] Notice fetching details for ${orgUrn}:`, detailErr.message);
          }
        }

        return orgDetailsList;
      },
      []
    );
  }

  /**
   * Fetch company details using /rest/organizations/{id} with fallback to /v2/organizations/{id}
   */
  public async getCompanyDetails(accessToken: string, orgId?: string): Promise<any> {
    if (!orgId) return null;
    const cleanOrgId = orgId.replace("urn:li:organization:", "").replace("urn:li:organizationBrand:", "");
    const cacheKey = `company_details_${cleanOrgId}`;

    // Cache for 10 minutes
    return OrganizationProvider.executeWithDeduplication<any>(
      cacheKey,
      10 * 60 * 1000,
      async () => {
        console.log(`[LINKEDIN ORG] Fetching company details for ${cleanOrgId}`);
        let data: any = null;

        try {
          const response = await axios.get(`https://api.linkedin.com/rest/organizations/${cleanOrgId}`, {
            headers: OrganizationProvider.getHeaders(accessToken),
            timeout: 8000
          });
          data = response.data;
        } catch (restErr: any) {
          console.warn(`[LINKEDIN ORG] /rest/organizations/${cleanOrgId} failed, trying /v2/organizations:`, restErr.message);
          try {
            const v2Res = await axios.get(`https://api.linkedin.com/v2/organizations/${cleanOrgId}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
              timeout: 8000
            });
            data = v2Res.data;
          } catch (v2Err: any) {
            console.error(`[LINKEDIN ORG] Error fetching /organizations/${cleanOrgId}:`, v2Err?.response?.data || v2Err.message);
          }
        }

        if (data) {
          const localizedName = data.localizedName || data.name?.localized?.en_US || data.vanityName || `Organization ${cleanOrgId}`;
          const vanityName = data.vanityName || "";
          const vanityUrl = vanityName ? `https://www.linkedin.com/company/${vanityName}` : "";
          const website = data.localizedWebsite || data.website?.localized?.en_US || (typeof data.website === "string" ? data.website : "");
          const description = data.localizedDescription || data.description?.localized?.en_US || (typeof data.description === "string" ? data.description : "");
          const industry = data.industries?.[0] || data.primaryOrganizationType || "Organization / Enterprise";

          // Headquarters location extraction
          let headquarters = "";
          const loc = data.locations?.[0]?.address || data.headquarterAddress;
          if (loc) {
            const parts = [loc.city, loc.geographicArea, loc.country].filter(Boolean);
            headquarters = parts.join(", ");
          }

          // Specialties extraction
          const specialties = Array.isArray(data.specialties) ? data.specialties : (data.localizedSpecialties || []);

          // Logo extraction
          let logoUrl = "";
          if (data.logoV2?.["cropped~"]?.elements?.[0]?.identifiers?.[0]?.identifier) {
            logoUrl = data.logoV2["cropped~"].elements[0].identifiers[0].identifier;
          } else if (data.logoV2?.original) {
            logoUrl = data.logoV2.original;
          }

          return {
            id: cleanOrgId,
            companyId: cleanOrgId,
            organizationUrn: `urn:li:organization:${cleanOrgId}`,
            name: localizedName,
            companyName: localizedName,
            vanityName,
            vanityUrl,
            website,
            description,
            industry,
            logo: logoUrl,
            companyLogo: logoUrl,
            staffCountRange: data.staffCountRange || "",
            headquarters,
            specialties
          };
        }

        return {
          id: cleanOrgId,
          companyId: cleanOrgId,
          organizationUrn: `urn:li:organization:${cleanOrgId}`,
          name: `Organization ${cleanOrgId}`,
          companyName: `Organization ${cleanOrgId}`,
          vanityName: "",
          vanityUrl: "",
          website: "",
          description: "",
          industry: "Organization",
          headquarters: "",
          specialties: []
        };
      },
      {
        id: cleanOrgId,
        companyId: cleanOrgId,
        organizationUrn: `urn:li:organization:${cleanOrgId}`,
        name: `Organization ${cleanOrgId}`,
        companyName: `Organization ${cleanOrgId}`,
        vanityName: "",
        website: "",
        description: "",
        industry: "Organization"
      }
    );
  }

  /**
   * Fetch Total Follower Count using GET /rest/networkSizes/{organizationUrn}?edgeType=COMPANY_FOLLOWED_BY_MEMBER
   * Uses firstDegreeSize for real-time total follower count without privacy cost table consumption.
   */
  public async getFollowers(accessToken: string, orgUrn: string): Promise<any> {
    const formattedOrgUrn = orgUrn.startsWith("urn:li:organization:") ? orgUrn : `urn:li:organization:${orgUrn}`;
    const cacheKey = `network_followers_${formattedOrgUrn}`;

    // Cache for 5 minutes
    return OrganizationProvider.executeWithDeduplication<any>(
      cacheKey,
      5 * 60 * 1000,
      async () => {
        const headers = OrganizationProvider.getHeaders(accessToken);
        const encodedOrgUrn = encodeURIComponent(formattedOrgUrn);
        const edgeType = "COMPANY_FOLLOWED_BY_MEMBER";
        const networkSizesUrl = `https://api.linkedin.com/rest/networkSizes/${encodedOrgUrn}?edgeType=${edgeType}`;

        console.log(`\n======================================================`);
        console.log(`[LINKEDIN NETWORK SIZES REQUEST]`);
        console.log(`Organization URN : ${formattedOrgUrn}`);
        console.log(`Edge Type        : ${edgeType}`);
        console.log(`Endpoint URL     : ${networkSizesUrl}`);

        const response = await axios.get(networkSizesUrl, { headers, timeout: 8000 });
        const firstDegreeSize = response.data?.firstDegreeSize ?? 0;

        console.log(`[LINKEDIN NETWORK SIZES RESPONSE]`);
        console.log(`firstDegreeSize  : ${firstDegreeSize}`);
        console.log(`totalFollowers   : ${firstDegreeSize}`);
        console.log(`Raw Body         : ${JSON.stringify(response.data)}`);
        console.log(`======================================================\n`);

        return {
          totalFollowers: firstDegreeSize,
          organicFollowers: firstDegreeSize,
          paidFollowers: 0,
          raw: response.data
        };
      },
      { totalFollowers: 0, organicFollowers: 0, paidFollowers: 0 }
    );
  }

  /**
   * Company Page Statistics: /rest/organizationPageStatistics
   * Cached for 10 minutes to respect privacy budget and rate limits.
   */
  public async getAnalytics(accessToken: string, orgUrn: string): Promise<any> {
    const formattedOrgUrn = orgUrn.startsWith("urn:li:organization:") ? orgUrn : `urn:li:organization:${orgUrn}`;
    const cacheKey = `page_analytics_${formattedOrgUrn}`;

    // Cache for 10 minutes
    return OrganizationProvider.executeWithDeduplication<any>(
      cacheKey,
      10 * 60 * 1000,
      async () => {
        const headers = OrganizationProvider.getHeaders(accessToken);
        const encodedOrgUrn = encodeURIComponent(formattedOrgUrn);
        const url = `https://api.linkedin.com/rest/organizationPageStatistics?q=organization&organization=${encodedOrgUrn}`;

        const response = await axios.get(url, { headers, timeout: 8000 });
        const pageStats = response.data?.elements?.[0]?.totalPageStatistics || {};

        return {
          views: pageStats.views || 0,
          uniqueViews: pageStats.uniqueViews || 0,
          clicks: pageStats.clicks || 0,
          raw: response.data
        };
      },
      { views: 0, uniqueViews: 0, clicks: 0 }
    );
  }

  /**
   * Fetch company posts from LinkedIn REST Posts API
   * /rest/posts?author=urn:li:organization:{id}&q=author
   * Cached for 2 minutes with in-flight deduplication.
   */
  public async getPosts(organizationId: string): Promise<any> {
    const config = await prisma.linkedInConfig.findUnique({
      where: { organizationId }
    });

    if (!config || !config.accessToken || !config.companyId) {
      return {
        permissionGranted: false,
        message: "LinkedIn Company Page is not connected.",
        posts: []
      };
    }

    const orgUrn = config.authorUrn || `urn:li:organization:${config.companyId}`;
    const cacheKey = `org_posts_${orgUrn}`;

    // Cache posts for 2 minutes
    return OrganizationProvider.executeWithDeduplication<any>(
      cacheKey,
      2 * 60 * 1000,
      async () => {
        const headers = OrganizationProvider.getHeaders(config.accessToken);
        const encodedAuthor = encodeURIComponent(orgUrn);
        console.log(`[LINKEDIN ORG] Starting exhaustive post fetch for author=${orgUrn}`);

        const allElements: any[] = [];
        let start = 0;
        const count = 100;
        let hasMore = true;

        while (hasMore) {
          const pageUrl = `https://api.linkedin.com/rest/posts?author=${encodedAuthor}&q=author&count=${count}&start=${start}&sortBy=LAST_MODIFIED`;
          console.log(`[LINKEDIN ORG] Fetching posts page: start=${start}, count=${count}`);

          const response = await axios.get(pageUrl, { headers, timeout: 10000 });
          const elements = response.data?.elements || [];

          if (elements.length === 0) {
            hasMore = false;
            break;
          }

          allElements.push(...elements);
          console.log(`[LINKEDIN ORG] Retrieved ${elements.length} posts (accumulated: ${allElements.length})`);

          // Check if response has fewer elements than requested, indicating the end
          if (elements.length < count) {
            hasMore = false;
          } else {
            start += count;
          }
        }

        console.log(`[LINKEDIN ORG] Completed post fetch: Total ${allElements.length} posts retrieved.`);

        const posts: any[] = allElements.map((p: any) => {
          const commentary = p.commentary || "";
          let mediaUrl: string | null = null;
          let mediaType: "NONE" | "IMAGE" | "VIDEO" | "DOCUMENT" = "NONE";

          const mediaId = p.content?.media?.id || p.content?.multiImage?.images?.[0]?.id;

          if (mediaId) {
            if (mediaId.includes("urn:li:image:")) {
              mediaType = "IMAGE";
            } else if (mediaId.includes("urn:li:video:")) {
              mediaType = "VIDEO";
            } else if (mediaId.includes("urn:li:document:")) {
              mediaType = "DOCUMENT";
            }
            mediaUrl = mediaId;
          } else if (p.content?.article?.source) {
            mediaUrl = p.content.article.source;
            mediaType = "NONE";
          }

          return {
            id: p.id,
            organizationId,
            postId: p.id,
            linkedinPostId: p.id,
            authorUrn: orgUrn,
            author: config.companyName || "LinkedIn Company Page",
            companyName: config.companyName || "LinkedIn Company Page",
            commentary,
            summary: commentary,
            mediaUrl,
            mediaType,
            visibility: p.visibility || "PUBLIC",
            lifecycleState: p.lifecycleState || "PUBLISHED",
            publishedAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            likesCount: 0,
            commentsCount: 0,
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            updatedAt: p.lastModifiedAt ? new Date(p.lastModifiedAt) : new Date()
          };
        });

        return {
          permissionGranted: true,
          message: `Successfully fetched ${posts.length} company posts from LinkedIn API.`,
          posts
        };
      },
      {
        permissionGranted: true,
        message: "Showing posts stored in CRM database.",
        posts: await prisma.linkedInPost.findMany({
          where: { organizationId },
          orderBy: { publishedAt: "desc" }
        })
      }
    );
  }

  /**
   * Helper: Register & Upload Image for Organization
   */
  private async uploadOrgImage(accessToken: string, orgUrn: string, filePathOrUrl: string): Promise<string> {
    const headers = {
      ...OrganizationProvider.getHeaders(accessToken),
      "Content-Type": "application/json"
    };

    console.log(`[LINKEDIN ORG MEDIA] Initializing Image upload for owner: ${orgUrn}`);
    const initRes = await axios.post(
      "https://api.linkedin.com/rest/images?action=initializeUpload",
      { initializeUploadRequest: { owner: orgUrn } },
      { headers }
    );

    const uploadUrl = initRes.data?.value?.uploadUrl;
    const imageUrn = initRes.data?.value?.image;

    if (!uploadUrl || !imageUrn) {
      throw new Error(`Failed to initialize organization image upload: ${JSON.stringify(initRes.data)}`);
    }

    let fileBuffer: Buffer;
    if (filePathOrUrl.startsWith("http://") || filePathOrUrl.startsWith("https://")) {
      const downloadRes = await axios.get(filePathOrUrl, { responseType: "arraybuffer" });
      fileBuffer = Buffer.from(downloadRes.data);
    } else {
      fileBuffer = require("fs").readFileSync(filePathOrUrl);
    }

    await axios.put(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream"
      }
    });

    return imageUrn;
  }

  /**
   * Helper: Register & Upload Video for Organization
   */
  private async uploadOrgVideo(accessToken: string, orgUrn: string, filePathOrUrl: string, fileSize: number): Promise<string> {
    const headers = {
      ...OrganizationProvider.getHeaders(accessToken),
      "Content-Type": "application/json"
    };

    console.log(`[LINKEDIN ORG MEDIA] Initializing Video upload for owner: ${orgUrn}`);
    const initRes = await axios.post(
      "https://api.linkedin.com/rest/videos?action=initializeUpload",
      {
        initializeUploadRequest: {
          owner: orgUrn,
          fileSizeBytes: fileSize,
          uploadCaptions: false,
          uploadThumbnail: false
        }
      },
      { headers }
    );

    const uploadInstructions = initRes.data?.value?.uploadInstructions || [];
    const videoUrn = initRes.data?.value?.video;

    if (!videoUrn || uploadInstructions.length === 0) {
      throw new Error(`Failed to initialize organization video upload: ${JSON.stringify(initRes.data)}`);
    }

    let fileBuffer: Buffer;
    if (filePathOrUrl.startsWith("http://") || filePathOrUrl.startsWith("https://")) {
      const downloadRes = await axios.get(filePathOrUrl, { responseType: "arraybuffer" });
      fileBuffer = Buffer.from(downloadRes.data);
    } else {
      fileBuffer = require("fs").readFileSync(filePathOrUrl);
    }

    const uploadUrl = uploadInstructions[0].uploadUrl;
    await axios.put(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream"
      }
    });

    return videoUrn;
  }

  /**
   * Helper: Register & Upload Document for Organization
   */
  private async uploadOrgDocument(accessToken: string, orgUrn: string, filePathOrUrl: string, title?: string): Promise<string> {
    const headers = {
      ...OrganizationProvider.getHeaders(accessToken),
      "Content-Type": "application/json"
    };

    console.log(`[LINKEDIN ORG MEDIA] Initializing Document upload for owner: ${orgUrn}`);
    const initRes = await axios.post(
      "https://api.linkedin.com/rest/documents?action=initializeUpload",
      { initializeUploadRequest: { owner: orgUrn } },
      { headers }
    );

    const uploadUrl = initRes.data?.value?.uploadUrl;
    const documentUrn = initRes.data?.value?.document;

    if (!uploadUrl || !documentUrn) {
      throw new Error(`Failed to initialize organization document upload: ${JSON.stringify(initRes.data)}`);
    }

    let fileBuffer: Buffer;
    if (filePathOrUrl.startsWith("http://") || filePathOrUrl.startsWith("https://")) {
      const downloadRes = await axios.get(filePathOrUrl, { responseType: "arraybuffer" });
      fileBuffer = Buffer.from(downloadRes.data);
    } else {
      fileBuffer = require("fs").readFileSync(filePathOrUrl);
    }

    await axios.put(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream"
      }
    });

    return documentUrn;
  }

  /**
   * Publish a Post to LinkedIn Organization Page
   */
  public async publishPost(accessToken: string, orgUrn: string, text: string, mediaUrl?: string): Promise<any> {
    const author = orgUrn.startsWith("urn:li:organization:") ? orgUrn : `urn:li:organization:${orgUrn}`;
    const headers = {
      ...OrganizationProvider.getHeaders(accessToken),
      "Content-Type": "application/json"
    };

    console.log("");
    console.log("========== LINKEDIN ORG POST PUBLICATION ==========");
    console.log(`Author Organization: ${author}`);
    console.log(`Media: ${mediaUrl || "None"}`);

    let mediaCategory: "NONE" | "IMAGE" | "VIDEO" | "DOCUMENT" = "NONE";
    let mediaUrn: string | null = null;

    if (mediaUrl && mediaUrl.trim().length > 0) {
      const cleanUrl = mediaUrl.trim();
      const ext = cleanUrl.split("?")[0].split(".").pop()?.toLowerCase() || "";
      const imageExts = ["jpg", "jpeg", "png", "webp"];
      const videoExts = ["mp4", "mov", "avi", "webm", "mpeg"];
      const docExts = ["pdf"];

      if (imageExts.includes(ext)) {
        mediaCategory = "IMAGE";
        mediaUrn = await this.uploadOrgImage(accessToken, author, cleanUrl);
      } else if (videoExts.includes(ext)) {
        mediaCategory = "VIDEO";
        mediaUrn = await this.uploadOrgVideo(accessToken, author, cleanUrl, 10 * 1024 * 1024);
      } else if (docExts.includes(ext)) {
        mediaCategory = "DOCUMENT";
        mediaUrn = await this.uploadOrgDocument(accessToken, author, cleanUrl, "Company Document");
      }
    }

    let payload: any = {
      author,
      commentary: text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false
    };

    if (mediaCategory === "IMAGE" && mediaUrn) {
      payload.content = { media: { id: mediaUrn, title: text.substring(0, 50) } };
    } else if (mediaCategory === "VIDEO" && mediaUrn) {
      payload.content = { media: { id: mediaUrn, title: text.substring(0, 50) } };
    } else if (mediaCategory === "DOCUMENT" && mediaUrn) {
      payload.content = { media: { id: mediaUrn, title: "Company Presentation" } };
    }

    const postRes = await axios.post("https://api.linkedin.com/rest/posts", payload, { headers });
    const postId = postRes.headers["x-restli-id"] || postRes.data?.id || `urn:li:post:org-${Date.now()}`;

    // Invalidate posts cache so subsequent load gets fresh list
    OrganizationProvider.cache.delete(`org_posts_${author}`);

    console.log(`[LINKEDIN ORG POST SUCCESS] Created Post URN: ${postId}`);
    return {
      success: true,
      id: postId,
      urn: postId,
      mediaUrn,
      mediaCategory
    };
  }

  /**
   * Read comments for a post: /rest/socialActions/{target}/comments
   * Cached for 1 minute with in-flight deduplication.
   */
  public async getComments(accessToken: string, postUrn: string): Promise<any[]> {
    const encodedUrn = encodeURIComponent(postUrn);
    const cacheKey = `comments_${encodedUrn}`;

    return OrganizationProvider.executeWithDeduplication<any[]>(
      cacheKey,
      60 * 1000,
      async () => {
        const headers = OrganizationProvider.getHeaders(accessToken);
        const url = `https://api.linkedin.com/rest/socialActions/${encodedUrn}/comments?count=50`;

        const response = await axios.get(url, { headers, timeout: 6000 });
        const elements = response.data?.elements || [];
        return elements.map((c: any) => ({
          id: c.id || c.urn,
          commentUrn: c.id || c.urn,
          actorUrn: c.actor || c.actorUrn,
          actorName: c.actorName || "LinkedIn User",
          message: c.message?.text || c.message || "",
          createdAt: c.created?.time ? new Date(c.created.time) : new Date(),
          likesCount: c.likesSummary?.totalLikes || 0
        }));
      },
      []
    );
  }

  /**
   * Reply to or create a comment: POST /rest/socialActions/{target}/comments
   */
  public async replyToComment(accessToken: string, postUrn: string, actorUrn: string, message: string): Promise<any> {
    const headers = {
      ...OrganizationProvider.getHeaders(accessToken),
      "Content-Type": "application/json"
    };

    const encodedUrn = encodeURIComponent(postUrn);
    const url = `https://api.linkedin.com/rest/socialActions/${encodedUrn}/comments`;

    const payload = {
      actor: actorUrn,
      message: { text: message }
    };

    const response = await axios.post(url, payload, { headers });
    // Invalidate comments cache for this post
    OrganizationProvider.cache.delete(`comments_${encodedUrn}`);
    return response.data;
  }

  /**
   * Delete a comment: DELETE /rest/socialActions/{target}/comments/{commentId}
   */
  public async deleteComment(accessToken: string, postUrn: string, commentUrn: string): Promise<any> {
    const headers = OrganizationProvider.getHeaders(accessToken);

    const encodedPostUrn = encodeURIComponent(postUrn);
    const encodedCommentUrn = encodeURIComponent(commentUrn);
    const url = `https://api.linkedin.com/rest/socialActions/${encodedPostUrn}/comments/${encodedCommentUrn}`;

    const response = await axios.delete(url, { headers });
    OrganizationProvider.cache.delete(`comments_${encodedPostUrn}`);
    return { success: true, status: response.status };
  }

  /**
   * Read reactions / likes: /rest/socialActions/{target}/likes
   * Cached for 1 minute with in-flight deduplication.
   */
  public async getReactions(accessToken: string, postUrn: string): Promise<any> {
    const encodedUrn = encodeURIComponent(postUrn);
    const cacheKey = `reactions_${encodedUrn}`;

    return OrganizationProvider.executeWithDeduplication<any>(
      cacheKey,
      60 * 1000,
      async () => {
        const headers = OrganizationProvider.getHeaders(accessToken);
        const url = `https://api.linkedin.com/rest/socialActions/${encodedUrn}/likes?count=50`;

        const response = await axios.get(url, { headers, timeout: 6000 });
        return {
          totalLikes: response.data?.paging?.total || response.data?.elements?.length || 0,
          likes: response.data?.elements || []
        };
      },
      { totalLikes: 0, likes: [] }
    );
  }
  /**
   * Fetch live Social Metadata (Reactions count & Comments count) for a post URN
   * Uses commentSummary.count and sums all reactionSummaries.*.count
   * Cached for 2 minutes to prevent rate limiting.
   */
  public async getSocialMetadata(accessToken: string, postUrn: string): Promise<{ likesCount: number; commentsCount: number }> {
    if (!postUrn) return { likesCount: 0, commentsCount: 0 };
    const encodedUrn = encodeURIComponent(postUrn);
    const cacheKey = `social_meta_${encodedUrn}`;

    return OrganizationProvider.executeWithDeduplication<{ likesCount: number; commentsCount: number }>(
      cacheKey,
      2 * 60 * 1000,
      async () => {
        const headers = OrganizationProvider.getHeaders(accessToken);
        let commentsCount = 0;
        let likesCount = 0;

        // Try /rest/socialMetadata/{urn}
        try {
          const res = await axios.get(`https://api.linkedin.com/rest/socialMetadata/${encodedUrn}`, { headers, timeout: 6000 });
          const data = res.data;
          if (data) {
            // Extract comments count
            if (typeof data.commentSummary?.count === "number") {
              commentsCount = data.commentSummary.count;
            } else if (typeof data.comments?.count === "number") {
              commentsCount = data.comments.count;
            }

            // Extract reactions / likes count by summing reactionSummaries
            if (data.reactionSummaries && typeof data.reactionSummaries === "object") {
              likesCount = Object.values(data.reactionSummaries).reduce((acc: number, val: any) => {
                const count = typeof val?.count === "number" ? val.count : (typeof val === "number" ? val : 0);
                return acc + count;
              }, 0);
            } else if (typeof data.likesSummary?.totalLikes === "number") {
              likesCount = data.likesSummary.totalLikes;
            }
          }
        } catch (metaErr: any) {
          // Fallback to /rest/socialActions/{urn}/comments and /likes if socialMetadata endpoint is not accessible
          try {
            const commentsRes = await axios.get(`https://api.linkedin.com/rest/socialActions/${encodedUrn}/comments?count=1`, { headers, timeout: 4000 });
            commentsCount = commentsRes.data?.paging?.total || commentsRes.data?.elements?.length || 0;
          } catch (cErr) {}

          try {
            const likesRes = await axios.get(`https://api.linkedin.com/rest/socialActions/${encodedUrn}/likes?count=1`, { headers, timeout: 4000 });
            likesCount = likesRes.data?.paging?.total || likesRes.data?.elements?.length || 0;
          } catch (lErr) {}
        }

        console.log(`[LINKEDIN ORG SOCIAL] Post ${postUrn} => Likes: ${likesCount}, Comments: ${commentsCount}`);
        return { likesCount, commentsCount };
      },
      { likesCount: 0, commentsCount: 0 }
    );
  }

  /**
   * Resolve LinkedIn Media Asset URN (images, videos, documents) to a playable/displayable download URL
   * Cached for 1 hour to prevent redundant API calls
   */
  public async resolveMediaAsset(accessToken: string, mediaUrn: string): Promise<{ url: string | null; mediaType: "IMAGE" | "VIDEO" | "DOCUMENT" | "NONE" }> {
    if (!mediaUrn || !mediaUrn.startsWith("urn:li:")) {
      return { url: null, mediaType: "NONE" };
    }

    const cacheKey = `media_asset_${encodeURIComponent(mediaUrn)}`;
    return OrganizationProvider.executeWithDeduplication<{ url: string | null; mediaType: "IMAGE" | "VIDEO" | "DOCUMENT" | "NONE" }>(
      cacheKey,
      60 * 60 * 1000,
      async () => {
        const headers = OrganizationProvider.getHeaders(accessToken);
        const encodedUrn = encodeURIComponent(mediaUrn);

        if (mediaUrn.includes("urn:li:image:") || mediaUrn.includes("urn:li:digitalmediaAsset:")) {
          try {
            let downloadUrl: string | null = null;
            try {
              const res = await axios.get(`https://api.linkedin.com/rest/images/${encodedUrn}`, { headers, timeout: 6000 });
              downloadUrl = res.data?.downloadUrl || res.data?.url || res.data?.elements?.[0]?.identifiers?.[0]?.identifier || null;
            } catch (restImgErr) {
              // Try digitalmediaAssets endpoint
              const cleanAssetUrn = mediaUrn.replace("urn:li:image:", "urn:li:digitalmediaAsset:");
              const v2Res = await axios.get(`https://api.linkedin.com/v2/digitalmediaAssets/${encodeURIComponent(cleanAssetUrn)}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                timeout: 6000
              });
              const artifacts = v2Res.data?.elements?.[0]?.artifacts || v2Res.data?.artifacts || [];
              if (artifacts.length > 0) {
                downloadUrl = artifacts[artifacts.length - 1]?.fileIdentifyingUrlPathSegment || artifacts[0]?.fileIdentifyingUrlPathSegment || null;
              }
            }

            return { url: downloadUrl, mediaType: "IMAGE" };
          } catch (err: any) {
            console.warn(`[LINKEDIN ORG MEDIA] Image URN resolution notice for ${mediaUrn}:`, err?.response?.data?.message || err.message);
            return { url: null, mediaType: "IMAGE" };
          }
        } else if (mediaUrn.includes("urn:li:video:") || mediaUrn.includes("urn:li:ugcPost:")) {
          try {
            let downloadUrl: string | null = null;
            try {
              const res = await axios.get(`https://api.linkedin.com/rest/videos/${encodedUrn}`, { headers, timeout: 6000 });
              downloadUrl = res.data?.downloadUrl || res.data?.url || res.data?.elements?.[0]?.identifiers?.[0]?.identifier || null;
            } catch (restVidErr) {
              const cleanAssetUrn = mediaUrn.replace("urn:li:video:", "urn:li:digitalmediaAsset:");
              const v2Res = await axios.get(`https://api.linkedin.com/v2/digitalmediaAssets/${encodeURIComponent(cleanAssetUrn)}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                timeout: 6000
              });
              const artifacts = v2Res.data?.elements?.[0]?.artifacts || v2Res.data?.artifacts || [];
              if (artifacts.length > 0) {
                downloadUrl = artifacts[artifacts.length - 1]?.fileIdentifyingUrlPathSegment || artifacts[0]?.fileIdentifyingUrlPathSegment || null;
              }
            }

            return { url: downloadUrl, mediaType: "VIDEO" };
          } catch (err: any) {
            console.warn(`[LINKEDIN ORG MEDIA] Video URN resolution notice for ${mediaUrn}:`, err?.response?.data?.message || err.message);
            return { url: null, mediaType: "VIDEO" };
          }
        } else if (mediaUrn.includes("urn:li:document:")) {
          try {
            const res = await axios.get(`https://api.linkedin.com/rest/documents/${encodedUrn}`, { headers, timeout: 6000 });
            const downloadUrl = res.data?.downloadUrl || res.data?.url || res.data?.elements?.[0]?.identifiers?.[0]?.identifier || null;
            return { url: downloadUrl, mediaType: "DOCUMENT" };
          } catch (err: any) {
            console.warn(`[LINKEDIN ORG MEDIA] Document URN resolution notice for ${mediaUrn}:`, err?.response?.data?.message || err.message);
            return { url: null, mediaType: "DOCUMENT" };
          }
        }

        return { url: null, mediaType: "NONE" };
      },
      { url: null, mediaType: "NONE" }
    );
  }

  public async createScheduledPost(organizationId: string, postData: any) {
    return null;
  }
}

export class LinkedInProviderFactory {
  public static getPersonalProvider(): PersonalProvider {
    return new PersonalProvider();
  }
  public static getOrganizationProvider(): OrganizationProvider {
    return new OrganizationProvider();
  }
}

// ─── SYNC SERVICE & LOGGING ──────────────────────────────────────────────────

export class LinkedInSyncService {
  public static async logSyncEvent(
    organizationId: string,
    event: string,
    status: "SUCCESS" | "FAILED" | "WARNING",
    details?: string
  ) {
    console.log(`[LINKEDIN] ${event}${details ? ` - ${details}` : ""}`);
    try {
      await prisma.linkedInSyncLog.create({
        data: {
          organizationId,
          event,
          status,
          details: details || null,
          timestamp: new Date()
        }
      });
    } catch (err: any) {
      console.error(`[LINKEDIN] API Error - Failed to write sync log:`, err.message);
    }
  }

  public static async syncPersonalProfile(organizationId: string, io?: any) {
    await this.logSyncEvent(organizationId, "Sync Started", "SUCCESS", "Synchronizing Personal LinkedIn Profile");
    try {
      const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });

      if (!config || !config.accessToken) {
        await this.logSyncEvent(organizationId, "Sync Skipped", "WARNING", "LinkedIn account is disconnected");
        return null;
      }

      if (config.tokenExpiry && new Date() > config.tokenExpiry) {
        await this.logSyncEvent(organizationId, "Token Expired", "WARNING", "Access token has expired");
        if (config.refreshToken) {
          try {
            const newAccessToken = await LinkedInService.refreshAccessToken(organizationId);
            config.accessToken = newAccessToken;
          } catch (refreshErr: any) {
            await this.logSyncEvent(organizationId, "API Error", "FAILED", `Token refresh failed: ${refreshErr.message}`);
          }
        }
      }

      const personalProvider = LinkedInProviderFactory.getPersonalProvider();
      const profileData = await personalProvider.getProfile(config.accessToken);

      if (profileData.id) {
        const profile = await prisma.linkedInProfile.upsert({
          where: { organizationId },
          update: {
            memberId: profileData.id,
            name: profileData.name,
            email: profileData.email,
            headline: profileData.headline,
            picture: profileData.picture,
            locale: profileData.locale,
            updatedAt: new Date()
          },
          create: {
            organizationId,
            configId: config.id,
            memberId: profileData.id,
            name: profileData.name,
            email: profileData.email,
            headline: profileData.headline,
            picture: profileData.picture,
            locale: profileData.locale
          }
        });

        await prisma.linkedInConfig.update({
          where: { organizationId },
          data: {
            memberId: profileData.id,
            memberName: profileData.name,
            memberEmail: profileData.email,
            memberPicture: profileData.picture,
            headline: profileData.headline,
            updatedAt: new Date()
          }
        });

        await this.logSyncEvent(organizationId, "Sync Complete", "SUCCESS", `Updated profile for member ${profileData.name}`);

        if (io) {
          io.to(organizationId).emit("linkedin-profile-updated", {
            organizationId,
            profile
          });
          io.to(organizationId).emit("linkedin-sync-completed", {
            organizationId,
            timestamp: new Date()
          });
        }

        return profile;
      } else {
        await this.logSyncEvent(organizationId, "API Error", "FAILED", "Could not retrieve member profile from LinkedIn API");
        return null;
      }
    } catch (err: any) {
      await this.logSyncEvent(organizationId, "API Error", "FAILED", err.message);
      console.error(`[LINKEDIN] API Error - syncPersonalProfile failed:`, err.message);
      return null;
    }
  }
}

// ─── MAIN LINKEDIN SERVICE ───────────────────────────────────────────────────

export class LinkedInService {
  private static hasValidToken(accessToken?: string | null): boolean {
    return Boolean(accessToken && accessToken.trim().length > 10 && !accessToken.startsWith("mock"));
  }

  // Generate OAuth 2.0 Authorization URL for Personal Member Login
  public static generateAuthUrl(orgId: string = "demo-org-123", redirectPath: string = "/linkedin"): string {
    const { clientId, redirectUri } = getLinkedInCredentials();
    const scopes = process.env.LINKEDIN_SCOPES || "openid profile email w_member_social";

    if (!clientId) {
      throw new Error("Missing LINKEDIN_MEMBER_CLIENT_ID in backend/.env");
    }
    if (!redirectUri) {
      throw new Error("Missing LINKEDIN_MEMBER_REDIRECT_URI in backend/.env");
    }

    const statePayload = JSON.stringify({ orgId, redirect: redirectPath });
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(statePayload)}&scope=${encodeURIComponent(scopes)}`;

    console.log("");
    console.log("========== LINKEDIN OAUTH REQUEST ==========");
    console.log(`Loaded Client ID: ${maskString(clientId)}`);
    console.log(`Loaded Redirect URI: ${redirectUri}`);
    console.log(`Loaded Client Secret: Present`);
    console.log(`Scopes: ${scopes}`);
    console.log(`FULL AUTHORIZATION URL: ${authUrl}`);
    console.log("==========================================");
    console.log("");

    return authUrl;
  }

  // Exchange authorization code for access token
  public static async exchangeCodeForToken(code: string, redirectUriOverride?: string) {
    const { clientId, clientSecret, redirectUri: defaultRedirectUri } = getLinkedInCredentials();
    const redirectUri = (redirectUriOverride || defaultRedirectUri).trim();

    if (!clientId) {
      console.error("[LINKEDIN ERROR] Missing LINKEDIN_MEMBER_CLIENT_ID in backend/.env");
      throw new Error("Missing LINKEDIN_MEMBER_CLIENT_ID in backend/.env");
    }
    if (!clientSecret) {
      console.error("[LINKEDIN ERROR] Missing LINKEDIN_MEMBER_CLIENT_SECRET in backend/.env");
      throw new Error("Missing LINKEDIN_MEMBER_CLIENT_SECRET in backend/.env");
    }
    if (!code) {
      throw new Error("Missing authorization code for token exchange");
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code.trim());
    params.append("redirect_uri", redirectUri);
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);

    console.log("");
    console.log("========== LINKEDIN TOKEN EXCHANGE REQUEST ==========");
    console.log(`Loaded Client ID: ${maskString(clientId)}`);
    console.log(`Loaded Redirect URI: ${redirectUri}`);
    console.log(`Loaded Client Secret: Present (${clientSecret.length} chars)`);
    console.log(`Token Request Body: grant_type=authorization_code&code=[HIDDEN]&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${maskString(clientId)}&client_secret=[REDACTED]`);
    console.log("=====================================================");

    try {
      const response = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        params.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }
      );

      console.log(`[LINKEDIN] HTTP Status: ${response.status}`);
      console.log("[LINKEDIN] Response Body:", JSON.stringify({
        access_token: response.data?.access_token ? "[TOKEN_RECEIVED]" : undefined,
        expires_in: response.data?.expires_in,
        scope: response.data?.scope
      }));

      return response.data;
    } catch (error: any) {
      const status = error?.response?.status || 500;
      const data = error?.response?.data || {};
      const errorCode = data?.error || "token_exchange_error";
      const errorDesc = data?.error_description || error?.message || "Token exchange failed";

      console.error("");
      console.error("========== LINKEDIN TOKEN ERROR ==========");
      console.error(`HTTP Status: ${status}`);
      console.error(`LinkedIn Response: ${JSON.stringify(data)}`);
      console.error(`Error Code: ${errorCode}`);
      console.error(`Error Description: ${errorDesc}`);
      
      let cause = "Unknown error during token exchange.";
      let fix = "Check configuration parameters.";

      if (errorCode === "invalid_scope") {
        cause = "Requested scopes are not provisioned for this Client ID on LinkedIn Developer Portal.";
        fix = "Update scope parameter to 'openid profile email' and ensure products are added on Developer Portal.";
      } else if (errorCode === "invalid_client") {
        cause = "LINKEDIN_MEMBER_CLIENT_ID or LINKEDIN_MEMBER_CLIENT_SECRET does not match the app in Developer Portal.";
        fix = "Verify Client ID and Secret in backend/.env match the app under Developer Portal -> Auth.";
      } else if (errorCode === "invalid_redirect_uri" || errorDesc.includes("redirect_uri")) {
        cause = "The redirect_uri parameter does not match Authorized Redirect URLs in LinkedIn Developer Portal.";
        fix = `Add '${redirectUri}' exactly to Authorized Redirect URLs under Developer Portal -> Auth.`;
      } else if (errorCode === "invalid_grant") {
        cause = "Authorization code is expired, invalid, or already used.";
        fix = "Re-initiate the OAuth flow by clicking 'Connect LinkedIn' to generate a fresh authorization code.";
      }

      console.error(`Likely Cause: ${cause}`);
      console.error(`Suggested Fix: ${fix}`);
      console.error("=========================================");
      console.error("");

      const err = new Error(errorDesc);
      (err as any).status = status;
      (err as any).errorCode = errorCode;
      (err as any).data = data;
      throw err;
    }
  }

  // Refresh access token for an organization
  public static async refreshAccessToken(organizationId: string): Promise<string> {
    const config = await prisma.linkedInConfig.findUnique({
      where: { organizationId }
    });

    if (!config || !config.refreshToken || config.refreshToken.startsWith("mock")) {
      return config?.accessToken || "";
    }

    const { clientId, clientSecret } = getLinkedInCredentials();

    if (!clientId || !clientSecret) {
      return config.accessToken || "";
    }

    try {
      const params = new URLSearchParams();
      params.append("grant_type", "refresh_token");
      params.append("refresh_token", config.refreshToken);
      params.append("client_id", clientId);
      params.append("client_secret", clientSecret);

      const response = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      const newAccessToken = response.data.access_token;
      const expiresIn = response.data.expires_in || 5184000;
      const tokenExpiry = new Date(Date.now() + expiresIn * 1000);

      await prisma.linkedInConfig.update({
        where: { organizationId },
        data: {
          accessToken: newAccessToken,
          expiresIn,
          tokenExpiry,
          updatedAt: new Date()
        }
      });

      console.log(`[LINKEDIN] Token Refreshed for organization ${organizationId}`);
      return newAccessToken;
    } catch (err: any) {
      console.error(`[LINKEDIN] API Error - Token refresh failed:`, err.message);
      return config.accessToken || "";
    }
  }

  // Delegate member profile lookup to PersonalProvider
  public static async getMember(accessToken: string) {
    const personalProvider = LinkedInProviderFactory.getPersonalProvider();
    return personalProvider.getProfile(accessToken);
  }

  // Prepared OrganizationProvider delegation for replyToComment
  public static async replyToComment(organizationId: string, postUrn: string, text: string) {
    // Retrieve LinkedIn config to get a valid access token
    const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });
    if (!config?.accessToken) {
      throw new Error(`LinkedIn config not found or missing access token for organization ${organizationId}`);
    }
    const accessToken = config.accessToken;
    const actorUrn = `urn:li:organization:${organizationId}`;
    const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
    return orgProvider.replyToComment(accessToken, postUrn, actorUrn, text);
  }

  /**
   * Share / Publish post directly to LinkedIn and save to CRM database.
   * Requirement 6, 7 & 9: Publish post, persist in DB, and record in Activity Log.
   */
  public static async publishPost(organizationId: string, text: string, mediaUrl?: string) {
    await LinkedInSyncService.logSyncEvent(
      organizationId,
      "Publish Started",
      "SUCCESS",
      `Initiated post publishing: "${text.substring(0, 30)}${text.length > 30 ? "..." : ""}"`
    );

    const config = await prisma.linkedInConfig.findUnique({
      where: { organizationId }
    });

    if (!config || !config.accessToken) {
      await LinkedInSyncService.logSyncEvent(
        organizationId,
        "Publish Failed",
        "FAILED",
        "Cannot publish post: LinkedIn account is not connected."
      );
      await LinkedInSyncService.logSyncEvent(
        organizationId,
        "API Error",
        "FAILED",
        "Authentication Error: Missing LinkedIn OAuth Token."
      );
      throw new Error("LinkedIn account is not connected. Please authenticate first.");
    }

    const memberId = config.memberId || "me";
    const authorName = config.memberName || "LinkedIn Member";
    const personalProvider = LinkedInProviderFactory.getPersonalProvider();

    let apiPostId = `failed-post-${Date.now()}`;
    let isPublishedToApi = false;
    let apiErrorDetails = "";

    if (personalProvider.publishPost) {
      const result = await personalProvider.publishPost(config.accessToken, memberId, text, mediaUrl);
      if (result && result.success && (result.id || result.urn)) {
        apiPostId = result.id || result.urn;
        isPublishedToApi = true;
      } else {
        apiErrorDetails = result?.error || result?.details?.message || "LinkedIn API rejected publication request.";
      }
    }

    // 1. SUCCESS BRANCH: LinkedIn API returned HTTP 200/201 Success
    if (isPublishedToApi) {
      if (mediaUrl) {
        console.log(`[MEDIA AUDIT 4/4] Database saved ImageKit URL: ${mediaUrl}`);
        console.log(`[MEDIA AUDIT] LinkedIn upload source URL used: ${mediaUrl}`);
      }

      const post = await prisma.linkedInPost.create({
        data: {
          organizationId,
          linkedinPostId: apiPostId,
          author: authorName,
          summary: text,
          mediaUrl: mediaUrl || null,
          visibility: "PUBLIC",
          lifecycleState: "PUBLISHED",
          publishedAt: new Date()
        }
      });

      try {
        await prisma.linkedInPersonalPost.create({
          data: {
            organizationId,
            linkedinPostId: apiPostId,
            author: authorName,
            summary: text,
            mediaUrl: mediaUrl || null,
            publishedAt: new Date()
          }
        });
      } catch (err: any) {
        console.warn("[LINKEDIN] Secondary personal post table sync notice:", err.message);
      }

      // Record Post Published ONLY when LinkedIn confirmed success
      await LinkedInSyncService.logSyncEvent(
        organizationId,
        "Publish Success",
        "SUCCESS",
        `Published post to LinkedIn API (${apiPostId}): "${text.substring(0, 40)}${text.length > 40 ? "..." : ""}"`
      );

      return post;
    }

    // 2. FAILURE BRANCH: LinkedIn API rejected the request
    // Save to DB as FAILED for CRM audit history, NEVER log "Publish Success"
    const failedPost = await prisma.linkedInPost.create({
      data: {
        organizationId,
        linkedinPostId: apiPostId,
        author: authorName,
        summary: text,
        mediaUrl: mediaUrl || null,
        visibility: "PUBLIC",
        lifecycleState: "FAILED",
        publishedAt: new Date()
      }
    });

    await LinkedInSyncService.logSyncEvent(
      organizationId,
      "Publish Failed",
      "FAILED",
      `LinkedIn API Error: ${apiErrorDetails}`
    );

    const publishErr = new Error(`LinkedIn API rejected post: ${apiErrorDetails}`);
    (publishErr as any).status = 403;
    (publishErr as any).post = failedPost;
    (publishErr as any).details = apiErrorDetails;
    throw publishErr;
  }

  /**
   * Delete a post: First attempt deleting from LinkedIn live feed, then delete from CRM DB
   */
  public static async deletePublishedPost(organizationId: string, postId: string) {
    // 1. Locate the post in CRM DB
    let post: any = await prisma.linkedInPost.findFirst({
      where: { id: postId, organizationId }
    });

    let isPersonalPostTable = false;
    if (!post) {
      const personalPost = await prisma.linkedInPersonalPost.findFirst({
        where: { id: postId, organizationId }
      });
      if (personalPost) {
        isPersonalPostTable = true;
        post = personalPost;
      }
    }

    if (!post) {
      throw new Error(`Post with ID ${postId} not found in CRM database.`);
    }

    // 2. Fetch LinkedIn OAuth configuration
    const config = await prisma.linkedInConfig.findUnique({
      where: { organizationId }
    });

    if (!config || !config.accessToken) {
      throw new Error("LinkedIn account is not connected. Re-connect your LinkedIn account to delete posts.");
    }

    // 3. Delete live from LinkedIn API if linkedinPostId URN is present
    const linkedinPostId = post.linkedinPostId;
    if (linkedinPostId && linkedinPostId.startsWith("urn:li:")) {
      console.log(`[LINKEDIN SERVICE] Deleting post ${linkedinPostId} from LinkedIn live API...`);
      const personalProvider = LinkedInProviderFactory.getPersonalProvider();
      await personalProvider.deletePost(config.accessToken, linkedinPostId);
    } else {
      console.warn(`[LINKEDIN SERVICE] Post ${postId} does not have a valid LinkedIn URN (${linkedinPostId}). Skipping LinkedIn API delete call.`);
    }

    // 4. Remove from CRM Database ONLY AFTER LinkedIn deletion succeeds (or 404 handled)
    if (isPersonalPostTable) {
      await prisma.linkedInPersonalPost.deleteMany({
        where: { id: postId, organizationId }
      });
    } else {
      await prisma.linkedInPost.deleteMany({
        where: { id: postId, organizationId }
      });
      // Also clean up secondary personal table if record exists there
      try {
        await prisma.linkedInPersonalPost.deleteMany({
          where: { linkedinPostId: post.linkedinPostId, organizationId }
        });
      } catch (err: any) {
        console.warn("[LINKEDIN] Cleanup secondary table notice:", err.message);
      }
    }

    await LinkedInSyncService.logSyncEvent(
      organizationId,
      "Post Deleted",
      "SUCCESS",
      `Deleted post ${linkedinPostId || postId} from LinkedIn feed and CRM database.`
    );

    return { success: true, id: postId, linkedinPostId };
  }

  /**
   * Sync Live Likes and Comments for all CRM-published posts from LinkedIn API
   */
  public static async syncEngagementForPosts(organizationId: string) {
    const config = await prisma.linkedInConfig.findUnique({
      where: { organizationId }
    });

    if (!config || !config.accessToken) {
      throw new Error("LinkedIn account is not connected. Reconnect to sync post engagement.");
    }

    const posts = await prisma.linkedInPost.findMany({
      where: {
        organizationId,
        linkedinPostId: { startsWith: "urn:li:" }
      }
    });

    if (posts.length === 0) {
      return { success: true, updatedCount: 0, message: "No active LinkedIn posts with valid URNs to sync." };
    }

    const personalProvider = LinkedInProviderFactory.getPersonalProvider();
    let updatedCount = 0;

    for (const post of posts) {
      if (post.linkedinPostId) {
        try {
          const metrics = await personalProvider.getSocialMetadata(config.accessToken, post.linkedinPostId);
          await prisma.linkedInPost.update({
            where: { id: post.id },
            data: {
              likesCount: metrics.likesCount,
              commentsCount: metrics.commentsCount,
              updatedAt: new Date()
            }
          });

          // Also update secondary table if exists
          try {
            await prisma.linkedInPersonalPost.updateMany({
              where: { linkedinPostId: post.linkedinPostId, organizationId },
              data: {
                likesCount: metrics.likesCount,
                commentsCount: metrics.commentsCount,
                updatedAt: new Date()
              }
            });
          } catch (e) {}

          updatedCount++;
        } catch (postErr: any) {
          console.warn(`[LINKEDIN ENGAGEMENT] Skipping post ${post.id}:`, postErr.message);
        }
      }
    }

    await LinkedInSyncService.logSyncEvent(
      organizationId,
      "Engagement Synced",
      "SUCCESS",
      `Synchronized live likes and comments for ${updatedCount} post(s).`
    );

    return { success: true, updatedCount, message: `Successfully updated engagement for ${updatedCount} posts.` };
  }
}

// ─── BACKGROUND SCHEDULER & RETRY ENGINE ─────────────────────────────────────

export class LinkedInSchedulerEngine {
  private static intervalTimer: NodeJS.Timeout | null = null;

  public static startScheduler(intervalMs: number = 60000) {
    if (this.intervalTimer) return;
    console.log("[LINKEDIN SCHEDULER] Background Post Scheduler started (60s loop)...");

    this.intervalTimer = setInterval(async () => {
      try {
        await this.processDuePosts();
      } catch (err: any) {
        console.error("[LINKEDIN SCHEDULER] Loop execution notice:", err.message);
      }
    }, intervalMs);
  }

  public static async processDuePosts() {
    const dueSchedules = await prisma.linkedInSchedule.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: new Date() }
      },
      take: 10
    });

    if (dueSchedules.length === 0) return;

    console.log(`[LINKEDIN SCHEDULER] Found ${dueSchedules.length} due scheduled posts.`);

    for (const item of dueSchedules) {
      await LinkedInSyncService.logSyncEvent(
        item.organizationId,
        "Auto Publish Started",
        "SUCCESS",
        `Auto-publishing scheduled post ID: ${item.id}`
      );

      try {
        const publishedPost = await LinkedInService.publishPost(item.organizationId, item.summary, item.mediaUrl || undefined);
        
        await prisma.linkedInSchedule.update({
          where: { id: item.id },
          data: {
            status: "PUBLISHED",
            updatedAt: new Date()
          }
        });

        await LinkedInSyncService.logSyncEvent(
          item.organizationId,
          "Auto Publish Success",
          "SUCCESS",
          `Scheduled post published successfully (ID: ${publishedPost.id})`
        );
      } catch (err: any) {
        const nextRetry = item.retryCount + 1;
        const isMaxRetry = nextRetry >= 3;
        const newStatus = isMaxRetry ? "FAILED" : "SCHEDULED";

        await prisma.linkedInSchedule.update({
          where: { id: item.id },
          data: {
            retryCount: nextRetry,
            status: newStatus,
            errorMessage: err.message,
            updatedAt: new Date()
          }
        });

        await LinkedInSyncService.logSyncEvent(
          item.organizationId,
          "Retry Attempt",
          "WARNING",
          `Publish retry attempt #${nextRetry} for schedule ID ${item.id}: ${err.message}`
        );

        if (isMaxRetry) {
          await LinkedInSyncService.logSyncEvent(
            item.organizationId,
            "Auto Publish Failed",
            "FAILED",
            `Schedule ID ${item.id} auto-publish failed after 3 retries: ${err.message}`
          );
          await LinkedInSyncService.logSyncEvent(
            item.organizationId,
            "Maximum Retry Reached",
            "FAILED",
            `Maximum retry attempts (3) reached for post schedule ID ${item.id}`
          );
        }
      }
    }
  }
}

// ─── CRM3 ORGANIZATION LINKEDIN SERVICE ───────────────────────────────────────

export class LinkedInOrgService {
  // Generate OAuth 2.0 Authorization URL for Company Page (CRM3)
  public static generateOrgAuthUrl(orgId: string = "demo-org-123", redirectPath: string = "/linkedin"): string {
    const { clientId, redirectUri, scopes } = getLinkedInOrgCredentials();

    if (!clientId) {
      throw new Error("Missing LINKEDIN_ORG_CLIENT_ID in backend/.env");
    }
    if (!redirectUri) {
      throw new Error("Missing LINKEDIN_ORG_REDIRECT_URI in backend/.env");
    }

    const statePayload = JSON.stringify({ orgId, redirect: redirectPath, isOrg: true });
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(statePayload)}&scope=${encodeURIComponent(scopes)}`;

    console.log("");
    console.log("========== LINKEDIN CRM3 ORG OAUTH REQUEST ==========");
    console.log(`Loaded Client ID: ${maskString(clientId)}`);
    console.log(`Loaded Redirect URI: ${redirectUri}`);
    console.log(`Scopes: ${scopes}`);
    console.log(`FULL ORG AUTHORIZATION URL: ${authUrl}`);
    console.log("=====================================================");
    console.log("");

    return authUrl;
  }

  // Exchange authorization code for access token for CRM3 Company Page
  public static async exchangeOrgCodeForToken(code: string, redirectUriOverride?: string) {
    const { clientId, clientSecret, redirectUri: defaultRedirectUri } = getLinkedInOrgCredentials();
    const redirectUri = (redirectUriOverride || defaultRedirectUri).trim();

    if (!clientId) {
      throw new Error("Missing LINKEDIN_ORG_CLIENT_ID in backend/.env");
    }
    if (!clientSecret) {
      throw new Error("Missing LINKEDIN_ORG_CLIENT_SECRET in backend/.env");
    }
    if (!code) {
      throw new Error("Missing authorization code for CRM3 organization token exchange");
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code.trim());
    params.append("redirect_uri", redirectUri);
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);

    console.log("");
    console.log("========== LINKEDIN CRM3 TOKEN EXCHANGE REQUEST ==========");
    console.log(`Client ID: ${maskString(clientId)}`);
    console.log(`Redirect URI: ${redirectUri}`);
    console.log("==========================================================");

    try {
      const response = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        params.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }
      );

      return response.data;
    } catch (error: any) {
      const status = error?.response?.status || 500;
      const data = error?.response?.data || {};
      console.error(`[LINKEDIN ORG] Token exchange error [HTTP ${status}]:`, JSON.stringify(data));
      throw new Error(data?.error_description || error.message || "Failed to exchange authorization code for CRM3 organization token.");
    }
  }

  // Synchronize Organization Profile & Metadata from LinkedIn API into DB
  public static async syncOrgProfile(organizationId: string, io?: any) {
    await LinkedInSyncService.logSyncEvent(organizationId, "Sync Started", "SUCCESS", "Synchronizing LinkedIn Organization Profile");
    try {
      const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });
      if (!config || !config.accessToken) {
        await LinkedInSyncService.logSyncEvent(organizationId, "Sync Skipped", "WARNING", "LinkedIn Company Page is not connected");
        return null;
      }

      const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
      const orgDetails = await orgProvider.getProfile(config.accessToken);

      if (!orgDetails || !orgDetails.companyId) {
        console.warn("[LINKEDIN ORG] No organization ACL returned for user token.");
        return null;
      }

      const savedConfig = await prisma.linkedInConfig.update({
        where: { organizationId },
        data: {
          companyId: orgDetails.companyId,
          companyName: orgDetails.companyName || orgDetails.name,
          vanityName: orgDetails.vanityName,
          companyLogo: orgDetails.companyLogo || orgDetails.logo,
          website: orgDetails.website,
          industry: orgDetails.industry,
          description: orgDetails.description,
          authorUrn: orgDetails.organizationUrn || `urn:li:organization:${orgDetails.companyId}`,
          updatedAt: new Date()
        }
      });

      const profile = await prisma.linkedInProfile.upsert({
        where: { organizationId },
        update: {
          name: orgDetails.companyName || orgDetails.name,
          headline: `${orgDetails.industry || "Enterprise"} • LinkedIn Company Page`,
          picture: orgDetails.companyLogo || orgDetails.logo,
          locale: "en_US",
          updatedAt: new Date()
        },
        create: {
          organizationId,
          configId: savedConfig.id,
          name: orgDetails.companyName || orgDetails.name,
          headline: `${orgDetails.industry || "Enterprise"} • LinkedIn Company Page`,
          picture: orgDetails.companyLogo || orgDetails.logo,
          locale: "en_US"
        }
      });

      await LinkedInSyncService.logSyncEvent(organizationId, "Org Profile Sync", "SUCCESS", `Synchronized LinkedIn Company Profile for ${orgDetails.companyName || orgDetails.name}`);

      if (io) {
        io.to(organizationId).emit("linkedin-org-profile-updated", {
          organizationId,
          profile
        });
      }

      return profile;
    } catch (err: any) {
      console.error("[LINKEDIN ORG] Profile sync error:", err.message);
      await LinkedInSyncService.logSyncEvent(organizationId, "API Error", "FAILED", `Org sync failed: ${err.message}`);
      return null;
    }
  }
}



