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
 * Phase 2: Organization LinkedIn Provider (Prepared Architecture)
 * Plug-and-play architecture for Company Page features when Community Management API is enabled.
 */
export class OrganizationProvider implements ILinkedInProvider {
  public async getProfile(accessToken: string) { return null; }
  public async getCompanyDetails(accessToken: string) { return null; }
  public async getPosts(organizationId: string) {
    return { permissionGranted: false, message: "Community Management API is required for Organization Company Page posts.", posts: [] };
  }
  public async getComments(organizationId: string) { return []; }
  public async replyToComment(organizationId: string, commentId: string, text: string) { return null; }
  public async getAnalytics(organizationId: string) { return null; }
  public async getFollowers(organizationId: string) { return null; }
  public async createScheduledPost(organizationId: string, postData: any) { return null; }
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
  public static async replyToComment(organizationId: string, commentId: string, text: string) {
    const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
    return orgProvider.replyToComment(organizationId, commentId, text);
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
    let post = await prisma.linkedInPost.findFirst({
      where: { id: postId, organizationId }
    });

    let isPersonalPostTable = false;
    if (!post) {
      const personalPost = await prisma.linkedInPersonalPost.findFirst({
        where: { id: postId, organizationId }
      });
      if (personalPost) {
        isPersonalPostTable = true;
        post = {
          id: personalPost.id,
          organizationId: personalPost.organizationId,
          linkedinPostId: personalPost.linkedinPostId,
          author: personalPost.author,
          summary: personalPost.summary,
          mediaUrl: personalPost.mediaUrl,
          visibility: "PUBLIC",
          lifecycleState: "PUBLISHED",
          publishedAt: personalPost.publishedAt,
          likesCount: personalPost.likesCount,
          commentsCount: personalPost.commentsCount,
          createdAt: personalPost.createdAt,
          updatedAt: personalPost.updatedAt
        };
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



