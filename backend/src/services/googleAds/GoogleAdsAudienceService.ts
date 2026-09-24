import axios from "axios";
import crypto from "crypto";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface CustomerMatchMemberInput {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  postalCode?: string;
}

export interface CreateCustomerMatchListInput {
  name: string;
  description?: string;
  membershipLifeSpanDays?: number; // 0 to 10000, 10000 means no expiration
  uploadKeyType?: "CONTACT_INFO" | "CRM_ID" | "MOBILE_ADVERTISING_ID";
}

export interface CustomAudienceMemberInput {
  type: "KEYWORD" | "URL" | "APP";
  parameter: string; // e.g. "crm software", "https://example.com", or app bundle ID
}

export interface CreateCustomAudienceInput {
  name: string;
  description?: string;
  type?: "SEARCH" | "INTEREST";
  members: CustomAudienceMemberInput[];
}

export class GoogleAdsAudienceService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. NORMALIZATION & SECURE SHA-256 HASHING (Google Ads Official Specs)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Normalizes an email address according to Google Ads guidelines:
   * 1. Trim leading and trailing whitespace
   * 2. Convert to lowercase
   * 3. For gmail.com and googlemail.com, remove periods before @ and remove all characters from + to @
   * 4. Return SHA-256 hex string
   */
  public static hashEmail(rawEmail: string): string | null {
    if (!rawEmail || typeof rawEmail !== "string") return null;
    let email = rawEmail.trim().toLowerCase();
    const parts = email.split("@");
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

    let [user, domain] = parts;
    if (domain === "gmail.com" || domain === "googlemail.com") {
      user = user.split("+")[0];
      user = user.replace(/\./g, "");
    }

    const normalized = `${user}@${domain}`;
    return crypto.createHash("sha256").update(normalized, "utf8").digest("hex");
  }

  /**
   * Normalizes a phone number according to E.164 standard (+[country code][subscriber number])
   * and returns SHA-256 hex string.
   */
  public static hashPhone(rawPhone: string, defaultCountryCode = "91"): string | null {
    if (!rawPhone || typeof rawPhone !== "string") return null;
    let phone = rawPhone.trim().replace(/[\s\-\(\)\.]/g, "");
    if (!phone) return null;

    if (!phone.startsWith("+")) {
      if (phone.length === 10) {
        phone = `+${defaultCountryCode}${phone}`;
      } else {
        phone = `+${phone}`;
      }
    }

    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      return null;
    }

    return crypto.createHash("sha256").update(phone, "utf8").digest("hex");
  }

  /**
   * Normalizes first/last name according to Google Ads specs:
   * lowercase, remove punctuation, trim whitespace.
   */
  public static hashName(rawName: string): string | null {
    if (!rawName || typeof rawName !== "string") return null;
    const normalized = rawName.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    if (!normalized) return null;
    return crypto.createHash("sha256").update(normalized, "utf8").digest("hex");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. CUSTOMER MATCH (USER LIST)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists Customer Match and CRM-based user lists for a customer.
   */
  public static async listCustomerMatchLists(organizationId: string, customerId: string) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const query = `
      SELECT
        user_list.id,
        user_list.name,
        user_list.description,
        user_list.membership_status,
        user_list.membership_life_span,
        user_list.size_for_search,
        user_list.size_for_display,
        user_list.size_range_for_search,
        user_list.size_range_for_display,
        user_list.type,
        user_list.crm_based_user_list.upload_key_type,
        user_list.crm_based_user_list.data_source_type,
        user_list.match_rate_percentage,
        user_list.resource_name
      FROM user_list
      WHERE user_list.type = 'CRM_BASED'
      LIMIT 100
    `;

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query },
        { headers }
      );
      const rows = res.data?.results || [];

      return rows.map((r: any) => {
        const ul = r.userList;
        return {
          id: String(ul?.id || ""),
          resourceName: ul?.resourceName || "",
          name: ul?.name || "",
          description: ul?.description || "",
          membershipStatus: ul?.membershipStatus || "OPEN",
          membershipLifeSpan: ul?.membershipLifeSpan || 10000,
          sizeForSearch: Number(ul?.sizeForSearch || 0),
          sizeForDisplay: Number(ul?.sizeForDisplay || 0),
          sizeRangeSearch: ul?.sizeRangeForSearch || "LESS_THAN_FIVE_HUNDRED",
          sizeRangeDisplay: ul?.sizeRangeForDisplay || "LESS_THAN_FIVE_HUNDRED",
          matchRatePercentage: ul?.matchRatePercentage !== undefined ? ul.matchRatePercentage : null,
          uploadKeyType: ul?.crmBasedUserList?.uploadKeyType || "CONTACT_INFO",
          dataSourceType: ul?.crmBasedUserList?.dataSourceType || "FIRST_PARTY",
          type: "CRM_BASED"
        };
      });
    } catch (err: any) {
      console.error("[GoogleAdsAudienceService.listCustomerMatchLists] error:", err?.response?.data || err.message);
      throw err;
    }
  }

  /**
   * Creates a new Customer Match user_list in Google Ads.
   */
  public static async createCustomerMatchList(
    organizationId: string,
    customerId: string,
    input: CreateCustomerMatchListInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    if (!input.name || !input.name.trim()) {
      throw new Error("Audience / Customer Match list name is required.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const userListPayload: any = {
      name: input.name.trim(),
      description: input.description?.trim() || "Customer Match list managed via Jisnu CRM",
      membershipStatus: "OPEN",
      membershipLifeSpan: input.membershipLifeSpanDays || 10000, // 10000 = no expiration
      crmBasedUserList: {
        uploadKeyType: input.uploadKeyType || "CONTACT_INFO",
        dataSourceType: "FIRST_PARTY"
      }
    };

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/userLists:mutate`,
      {
        operations: [
          {
            create: userListPayload
          }
        ]
      },
      { headers }
    );

    const resourceName = res.data?.results?.[0]?.resourceName;
    return {
      resourceName,
      name: input.name.trim()
    };
  }

  /**
   * Safely hashes customer identifiers in-memory and uploads them to a Customer Match user list
   * via Google Ads API v24 offlineUserDataJobs.
   */
  public static async uploadCustomerMatchData(
    organizationId: string,
    customerId: string,
    userListResourceName: string,
    members: CustomerMatchMemberInput[]
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    if (!userListResourceName || !userListResourceName.includes("/userLists/")) {
      throw new Error("Valid Google Ads user_list resource name is required.");
    }
    if (!Array.isArray(members) || members.length === 0) {
      throw new Error("No customer records provided for Customer Match upload.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cid);

    // 1. Normalize and hash records securely in memory (SHA-256)
    let validCount = 0;
    let invalidCount = 0;
    const userDataOperations: any[] = [];
    const seenHashes = new Set<string>();
    let duplicateCount = 0;

    for (const m of members) {
      const userIdentifiers: any[] = [];

      // Email identifier
      if (m.email) {
        const hashedEmail = this.hashEmail(m.email);
        if (hashedEmail) {
          userIdentifiers.push({ hashedEmail });
        }
      }

      // Phone identifier
      if (m.phone) {
        const hashedPhone = this.hashPhone(m.phone, m.countryCode || "91");
        if (hashedPhone) {
          userIdentifiers.push({ hashedPhoneNumber: hashedPhone });
        }
      }

      // Address / Name identifier
      if (m.firstName || m.lastName || m.postalCode) {
        const addressInfo: any = {};
        if (m.firstName) {
          const hFn = this.hashName(m.firstName);
          if (hFn) addressInfo.hashedFirstName = hFn;
        }
        if (m.lastName) {
          const hLn = this.hashName(m.lastName);
          if (hLn) addressInfo.hashedLastName = hLn;
        }
        if (m.countryCode) addressInfo.countryCode = m.countryCode.trim().toUpperCase().slice(0, 2);
        if (m.postalCode) addressInfo.postalCode = m.postalCode.trim();

        if (Object.keys(addressInfo).length > 0) {
          userIdentifiers.push({ addressInfo });
        }
      }

      if (userIdentifiers.length === 0) {
        invalidCount++;
        continue;
      }

      // Check deduplication key based on primary hash
      const dedupeKey = JSON.stringify(userIdentifiers);
      if (seenHashes.has(dedupeKey)) {
        duplicateCount++;
        continue;
      }
      seenHashes.add(dedupeKey);

      userDataOperations.push({
        create: {
          userIdentifiers
        }
      });
      validCount++;
    }

    if (userDataOperations.length === 0) {
      throw new Error(`No valid customer identifiers found. Invalid rows: ${invalidCount}. Emails must be valid format; phones must have 10+ digits.`);
    }

    // 2. Step 1: Create an offline_user_data_job for Customer Match
    let jobResourceName: string;
    try {
      const jobRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/offlineUserDataJobs:create`,
        {
          job: {
            type: "CUSTOMER_MATCH_USER_LIST",
            customerMatchUserListMetadata: {
              userList: userListResourceName
            }
          }
        },
        { headers }
      );
      jobResourceName = jobRes.data?.resourceName;
    } catch (jobErr: any) {
      const msg = jobErr?.response?.data?.error?.message || jobErr.message;
      if (msg.includes("CUSTOMER_NOT_ALLOWLISTED_FOR_CUSTOMER_MATCH") || msg.includes("ELIGIBILITY")) {
        throw new Error(
          "This Google Ads account is not currently eligible for Customer Match according to Google Ads policy (requires 90+ days account history, good policy compliance, and total spend thresholds)."
        );
      }
      throw new Error(`Failed to create Customer Match upload job: ${msg}`);
    }

    // 3. Step 2: Add user data operations to job in chunks of up to 5000 (standard Google Ads API limit)
    const CHUNK_SIZE = 5000;
    for (let i = 0; i < userDataOperations.length; i += CHUNK_SIZE) {
      const chunk = userDataOperations.slice(i, i + CHUNK_SIZE);
      await axios.post(
        `${this.ADS_BASE}/${jobResourceName}:addOperations`,
        {
          operations: chunk,
          enablePartialFailure: true
        },
        { headers }
      );
    }

    // 4. Step 3: Run the offline user data job
    await axios.post(
      `${this.ADS_BASE}/${jobResourceName}:run`,
      {},
      { headers }
    );

    // Return safe summary only — never sensitive data
    return {
      success: true,
      jobResourceName,
      userListResourceName,
      stats: {
        totalReceived: members.length,
        validProcessed: validCount,
        invalidSkipped: invalidCount,
        duplicatesRemoved: duplicateCount
      },
      message: `Successfully submitted ${validCount} hashed records to Google Ads for Customer Match processing.`
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. CUSTOM AUDIENCES / CUSTOM SEGMENTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists Custom Audiences for a customer.
   */
  public static async listCustomAudiences(organizationId: string, customerId: string) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const query = `
      SELECT
        custom_audience.id,
        custom_audience.name,
        custom_audience.type,
        custom_audience.status,
        custom_audience.description,
        custom_audience.members,
        custom_audience.resource_name
      FROM custom_audience
      LIMIT 100
    `;

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query },
        { headers }
      );
      const rows = res.data?.results || [];

      return rows.map((r: any) => {
        const ca = r.customAudience;
        return {
          id: String(ca?.id || ""),
          resourceName: ca?.resourceName || "",
          name: ca?.name || "",
          type: ca?.type || "AUTO",
          status: ca?.status || "ENABLED",
          description: ca?.description || "",
          members: (ca?.members || []).map((m: any) => ({
            memberType: m.memberType,
            keyword: m.keyword,
            url: m.url,
            app: m.app
          }))
        };
      });
    } catch (err: any) {
      console.error("[GoogleAdsAudienceService.listCustomAudiences] error:", err?.response?.data || err.message);
      throw err;
    }
  }

  /**
   * Creates a Custom Audience in Google Ads.
   */
  public static async createCustomAudience(
    organizationId: string,
    customerId: string,
    input: CreateCustomAudienceInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    if (!input.name || !input.name.trim()) {
      throw new Error("Custom Audience name is required.");
    }
    if (!Array.isArray(input.members) || input.members.length === 0) {
      throw new Error("At least one member keyword, URL, or app bundle is required for a Custom Audience.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const membersPayload = input.members.map((m) => {
      const member: any = {
        memberType: m.type
      };
      if (m.type === "KEYWORD") {
        member.keyword = m.parameter.trim();
      } else if (m.type === "URL") {
        member.url = m.parameter.trim();
      } else if (m.type === "APP") {
        member.app = m.parameter.trim();
      }
      return member;
    });

    const customAudiencePayload: any = {
      name: input.name.trim(),
      description: input.description?.trim() || "Custom segment created via Jisnu CRM",
      status: "ENABLED",
      type: input.type || "INTEREST",
      members: membersPayload
    };

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/customAudiences:mutate`,
      {
        operations: [
          {
            create: customAudiencePayload
          }
        ]
      },
      { headers }
    );

    const resourceName = res.data?.results?.[0]?.resourceName;
    return {
      resourceName,
      name: input.name.trim()
    };
  }

  /**
   * Removes / deletes a Custom Audience from customer account.
   */
  public static async removeCustomAudience(
    organizationId: string,
    customerId: string,
    resourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/customAudiences:mutate`,
      {
        operations: [
          {
            remove: resourceName
          }
        ]
      },
      { headers }
    );

    return res.data?.results?.[0] || { resourceName };
  }
}
