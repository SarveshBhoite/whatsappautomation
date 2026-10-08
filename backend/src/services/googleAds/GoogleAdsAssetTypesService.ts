import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface StructuredSnippetInput {
  name?: string;
  header: string; // e.g. "Services", "Amenities", "Brands", "Courses", "Models", "Styles", "Types", etc.
  values: string[]; // e.g. ["Web Design", "SEO", "PPC"]
  campaignResourceName?: string;
  adGroupResourceName?: string;
}

export interface PromotionInput {
  name?: string;
  promotionTarget: string; // Target item or service being promoted (e.g. "Summer Sale")
  discountType: "PERCENT_OFF" | "MONEY_AMOUNT_OFF";
  percentOff?: number; // e.g. 20 (meaning 20%) -> sent to Google Ads API as 200000 (Math.round(percent * 10000))
  moneyAmountOff?: {
    amount: number; // e.g. 500
    currencyCode: string; // e.g. "INR", "USD"
  };
  occasion?: string; // e.g. "NEW_YEARS", "BLACK_FRIDAY", "CHRISTMAS", etc.
  promotionCode?: string;
  ordersOverAmount?: {
    amount: number;
    currencyCode: string;
  };
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  finalUrl: string;   // Must be a valid URL
  languageCode?: string; // Default "en"
  campaignResourceName?: string;
  adGroupResourceName?: string;
}

export interface LeadFormInput {
  name?: string;
  businessName: string; // Max 25 chars
  headline: string; // Max 30 chars
  description: string; // Max 200 chars
  privacyPolicyUrl: string; // Valid URL
  callToActionType?: string; // "BOOK_NOW", "GET_QUOTE", "APPLY_NOW", "SIGN_UP", "CONTACT_US", "SUBSCRIBE", "DOWNLOAD", "GET_OFFER", "GET_INFO", "REQUEST_SERVICE", "REGISTER", "GET_STARTED", "LEARN_MORE"
  callToActionDescription?: string; // Max 30 chars
  postSubmitHeadline?: string; // Max 30 chars
  postSubmitDescription?: string; // Max 200 chars
  fields?: Array<{
    inputType: string; // "FULL_NAME", "EMAIL", "PHONE_NUMBER", "POSTAL_CODE", "CITY", "FIRST_NAME", "LAST_NAME"
  }>;
  campaignResourceName?: string;
  adGroupResourceName?: string;
}

export class GoogleAdsAssetTypesService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. STRUCTURED SNIPPET ASSETS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists structured snippet assets for a customer, including campaign associations where present.
   */
  public static async listStructuredSnippets(organizationId: string, customerId: string) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    // 1. Fetch all assets of type STRUCTURED_SNIPPET
    const assetGaql = `
      SELECT
        asset.id,
        asset.name,
        asset.type,
        asset.resource_name,
        asset.structured_snippet_asset.header,
        asset.structured_snippet_asset.values,
        asset.policy_summary.approval_status,
        asset.policy_summary.review_status
      FROM asset
      WHERE asset.type = 'STRUCTURED_SNIPPET'
      LIMIT 500
    `;

    const assetRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: assetGaql },
      { headers }
    );
    const assetRows = assetRes.data?.results || [];

    // 2. Fetch campaign_asset associations for structured snippets to attach campaign context
    const linkGaql = `
      SELECT
        campaign_asset.asset,
        campaign_asset.campaign,
        campaign_asset.status,
        campaign_asset.field_type,
        campaign.id,
        campaign.name
      FROM campaign_asset
      WHERE campaign_asset.field_type = 'STRUCTURED_SNIPPET'
        AND campaign_asset.status != 'REMOVED'
      LIMIT 500
    `;

    const linkMap = new Map<string, Array<{ campaignId: string; campaignName: string; resourceName: string }>>();
    try {
      const linkRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: linkGaql },
        { headers }
      );
      for (const r of linkRes.data?.results || []) {
        const aRef = r.campaignAsset?.asset;
        if (!aRef) continue;
        const list = linkMap.get(aRef) || [];
        list.push({
          campaignId: String(r.campaign?.id || ""),
          campaignName: r.campaign?.name || "",
          resourceName: r.campaignAsset?.campaign || ""
        });
        linkMap.set(aRef, list);
      }
    } catch (e: any) {
      console.warn("[GoogleAdsAssetTypesService] Could not fetch campaign links for structured snippets:", e?.message);
    }

    return assetRows.map((r: any) => {
      const a = r.asset;
      const resName = a?.resourceName || `customers/${cid}/assets/${a?.id}`;
      return {
        id: String(a?.id || ""),
        resourceName: resName,
        name: a?.name || "",
        type: a?.type || "STRUCTURED_SNIPPET",
        header: a?.structuredSnippetAsset?.header || "",
        values: a?.structuredSnippetAsset?.values || [],
        policyApprovalStatus: a?.policySummary?.approvalStatus || "UNKNOWN",
        policyReviewStatus: a?.policySummary?.reviewStatus || "UNKNOWN",
        campaigns: linkMap.get(resName) || []
      };
    });
  }

  /**
   * Creates a Structured Snippet asset and optionally links it to a Campaign or Ad Group.
   */
  public static async createStructuredSnippet(
    organizationId: string,
    customerId: string,
    input: StructuredSnippetInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    if (!input.header || !input.header.trim()) {
      throw new Error("Header is required for structured snippet asset.");
    }
    const cleanValues = (input.values || [])
      .map(v => String(v).trim())
      .filter(Boolean);

    if (cleanValues.length < 3) {
      throw new Error("Google Ads requires at least 3 snippet values for a structured snippet asset.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const assetName = input.name?.trim() || `Snippet - ${input.header.trim()} - ${Date.now()}`;
    const assetOperation = {
      create: {
        name: assetName,
        type: "STRUCTURED_SNIPPET",
        structuredSnippetAsset: {
          header: input.header.trim(),
          values: cleanValues.map(v => GoogleAdsBaseService.cleanAdText(v, 25))
        }
      }
    };

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assets:mutate`,
      { operations: [assetOperation] },
      { headers }
    );

    const assetResourceName = res.data?.results?.[0]?.resourceName;
    if (!assetResourceName) {
      throw new Error("Failed to create structured snippet asset in Google Ads.");
    }

    // Attach to Campaign if requested
    if (input.campaignResourceName) {
      try {
        await axios.post(
          `${this.ADS_BASE}/customers/${cid}/campaignAssets:mutate`,
          {
            operations: [
              {
                create: {
                  campaign: input.campaignResourceName,
                  asset: assetResourceName,
                  fieldType: "STRUCTURED_SNIPPET",
                  status: "ENABLED"
                }
              }
            ]
          },
          { headers }
        );
      } catch (attachErr: any) {
        console.warn("[GoogleAdsAssetTypesService] Failed attaching structured snippet to campaign:", attachErr?.response?.data || attachErr.message);
      }
    }

    return {
      resourceName: assetResourceName,
      header: input.header.trim(),
      values: cleanValues
    };
  }

  /**
   * Updates an existing Structured Snippet asset.
   */
  public static async updateStructuredSnippet(
    organizationId: string,
    customerId: string,
    resourceName: string,
    input: Partial<StructuredSnippetInput>
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const updateMasks: string[] = [];
    const assetPayload: any = {
      resourceName
    };

    if (input.name) {
      assetPayload.name = input.name.trim();
      updateMasks.push("name");
    }

    if (input.header || input.values) {
      assetPayload.structuredSnippetAsset = {};
      if (input.header) {
        assetPayload.structuredSnippetAsset.header = input.header.trim();
        updateMasks.push("structured_snippet_asset.header");
      }
      if (input.values && input.values.length > 0) {
        const cleanValues = input.values.map(v => GoogleAdsBaseService.cleanAdText(String(v).trim(), 25)).filter(Boolean);
        assetPayload.structuredSnippetAsset.values = cleanValues;
        updateMasks.push("structured_snippet_asset.values");
      }
    }

    if (updateMasks.length === 0) {
      throw new Error("No fields provided to update.");
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assets:mutate`,
      {
        operations: [
          {
            update: assetPayload,
            updateMask: updateMasks.join(",")
          }
        ]
      },
      { headers }
    );

    return res.data?.results?.[0] || { resourceName };
  }

  /**
   * Removes / deletes an asset from customer account.
   */
  public static async removeAsset(
    organizationId: string,
    customerId: string,
    resourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assets:mutate`,
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PROMOTION ASSETS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists promotion assets for a customer.
   */
  public static async listPromotions(organizationId: string, customerId: string) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const assetGaql = `
      SELECT
        asset.id,
        asset.name,
        asset.type,
        asset.resource_name,
        asset.promotion_asset.promotion_target,
        asset.promotion_asset.discount_modifier,
        asset.promotion_asset.redemption_start_date,
        asset.promotion_asset.redemption_end_date,
        asset.promotion_asset.occasion,
        asset.promotion_asset.language_code,
        asset.promotion_asset.percent_off,
        asset.promotion_asset.money_amount_off.amount_micros,
        asset.promotion_asset.money_amount_off.currency_code,
        asset.promotion_asset.promotion_code,
        asset.promotion_asset.orders_over_amount.amount_micros,
        asset.promotion_asset.orders_over_amount.currency_code,
        asset.final_urls,
        asset.policy_summary.approval_status,
        asset.policy_summary.review_status
      FROM asset
      WHERE asset.type = 'PROMOTION'
      LIMIT 500
    `;

    const assetRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: assetGaql },
      { headers }
    );
    const assetRows = assetRes.data?.results || [];

    // Campaign links for promotions
    const linkGaql = `
      SELECT
        campaign_asset.asset,
        campaign_asset.campaign,
        campaign_asset.status,
        campaign_asset.field_type,
        campaign.id,
        campaign.name
      FROM campaign_asset
      WHERE campaign_asset.field_type = 'PROMOTION'
        AND campaign_asset.status != 'REMOVED'
      LIMIT 500
    `;

    const linkMap = new Map<string, Array<{ campaignId: string; campaignName: string; resourceName: string }>>();
    try {
      const linkRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: linkGaql },
        { headers }
      );
      for (const r of linkRes.data?.results || []) {
        const aRef = r.campaignAsset?.asset;
        if (!aRef) continue;
        const list = linkMap.get(aRef) || [];
        list.push({
          campaignId: String(r.campaign?.id || ""),
          campaignName: r.campaign?.name || "",
          resourceName: r.campaignAsset?.campaign || ""
        });
        linkMap.set(aRef, list);
      }
    } catch (e: any) {
      console.warn("[GoogleAdsAssetTypesService] Could not fetch campaign links for promotions:", e?.message);
    }

    return assetRows.map((r: any) => {
      const a = r.asset;
      const pa = a?.promotionAsset;
      const resName = a?.resourceName || `customers/${cid}/assets/${a?.id}`;

      let discountText = "";
      if (pa?.percentOff) {
        discountText = `${Number(pa.percentOff) / 10000}% OFF`;
      } else if (pa?.moneyAmountOff?.amountMicros) {
        const amt = Number(pa.moneyAmountOff.amountMicros) / 1_000_000;
        discountText = `${pa.moneyAmountOff.currencyCode || ""} ${amt} OFF`.trim();
      }

      return {
        id: String(a?.id || ""),
        resourceName: resName,
        name: a?.name || "",
        type: a?.type || "PROMOTION",
        promotionTarget: pa?.promotionTarget || "",
        discountText,
        percentOff: pa?.percentOff ? Number(pa.percentOff) / 10000 : null,
        moneyAmountOff: pa?.moneyAmountOff ? {
          amount: Number(pa.moneyAmountOff.amountMicros) / 1_000_000,
          currencyCode: pa.moneyAmountOff.currencyCode
        } : null,
        occasion: pa?.occasion || "NONE",
        promotionCode: pa?.promotionCode || "",
        startDate: pa?.redemptionStartDate || "",
        endDate: pa?.redemptionEndDate || "",
        languageCode: pa?.languageCode || "en",
        finalUrls: a?.finalUrls || [],
        policyApprovalStatus: a?.policySummary?.approvalStatus || "UNKNOWN",
        policyReviewStatus: a?.policySummary?.reviewStatus || "UNKNOWN",
        campaigns: linkMap.get(resName) || []
      };
    });
  }

  /**
   * Creates a Promotion asset and optionally links it to a Campaign.
   */
  public static async createPromotion(
    organizationId: string,
    customerId: string,
    input: PromotionInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    if (!input.promotionTarget || !input.promotionTarget.trim()) {
      throw new Error("Promotion target item or service is required.");
    }
    if (!input.finalUrl || !input.finalUrl.trim()) {
      throw new Error("Final URL is required for a promotion asset.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const promoPayload: any = {
      promotionTarget: GoogleAdsBaseService.cleanAdText(input.promotionTarget.trim(), 30),
      languageCode: input.languageCode || "en"
    };

    if (input.discountType === "PERCENT_OFF") {
      if (!input.percentOff || input.percentOff <= 0 || input.percentOff > 100) {
        throw new Error("Percent off must be a number between 1 and 100.");
      }
      promoPayload.percentOff = Math.round(Number(input.percentOff) * 10000);
    } else if (input.discountType === "MONEY_AMOUNT_OFF") {
      if (!input.moneyAmountOff || input.moneyAmountOff.amount <= 0) {
        throw new Error("Money amount off is required and must be greater than 0.");
      }
      promoPayload.moneyAmountOff = {
        currencyCode: input.moneyAmountOff.currencyCode || "INR",
        amountMicros: String(Math.round(Number(input.moneyAmountOff.amount) * 1_000_000))
      };
    } else {
      throw new Error("Invalid discount type. Must be PERCENT_OFF or MONEY_AMOUNT_OFF.");
    }

    if (input.occasion && input.occasion !== "NONE") {
      promoPayload.occasion = input.occasion;
    }

    if (input.promotionCode?.trim()) {
      promoPayload.promotionCode = input.promotionCode.trim();
    }

    if (input.ordersOverAmount && input.ordersOverAmount.amount > 0) {
      promoPayload.ordersOverAmount = {
        currencyCode: input.ordersOverAmount.currencyCode || "INR",
        amountMicros: String(Math.round(Number(input.ordersOverAmount.amount) * 1_000_000))
      };
    }

    if (input.startDate?.trim()) {
      promoPayload.redemptionStartDate = input.startDate.trim(); // YYYY-MM-DD
    }
    if (input.endDate?.trim()) {
      promoPayload.redemptionEndDate = input.endDate.trim();     // YYYY-MM-DD
    }

    const assetName = input.name?.trim() || `Promo - ${input.promotionTarget.slice(0, 20)} - ${Date.now()}`;
    const cleanFinalUrl = GoogleAdsBaseService.cleanUrl(input.finalUrl.trim());

    const assetOperation = {
      create: {
        name: assetName,
        type: "PROMOTION",
        promotionAsset: promoPayload,
        finalUrls: [cleanFinalUrl]
      }
    };

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assets:mutate`,
      { operations: [assetOperation] },
      { headers }
    );

    const assetResourceName = res.data?.results?.[0]?.resourceName;
    if (!assetResourceName) {
      throw new Error("Failed to create promotion asset in Google Ads.");
    }

    // Attach to Campaign if provided
    if (input.campaignResourceName) {
      try {
        await axios.post(
          `${this.ADS_BASE}/customers/${cid}/campaignAssets:mutate`,
          {
            operations: [
              {
                create: {
                  campaign: input.campaignResourceName,
                  asset: assetResourceName,
                  fieldType: "PROMOTION",
                  status: "ENABLED"
                }
              }
            ]
          },
          { headers }
        );
      } catch (attachErr: any) {
        console.warn("[GoogleAdsAssetTypesService] Failed attaching promotion to campaign:", attachErr?.response?.data || attachErr.message);
      }
    }

    return {
      resourceName: assetResourceName,
      promotionTarget: input.promotionTarget,
      finalUrl: cleanFinalUrl
    };
  }

  /**
   * Updates an existing Promotion asset.
   */
  public static async updatePromotion(
    organizationId: string,
    customerId: string,
    resourceName: string,
    input: Partial<PromotionInput>
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const updateMasks: string[] = [];
    const assetPayload: any = { resourceName };

    if (input.name) {
      assetPayload.name = input.name.trim();
      updateMasks.push("name");
    }

    if (input.finalUrl) {
      assetPayload.finalUrls = [GoogleAdsBaseService.cleanUrl(input.finalUrl.trim())];
      updateMasks.push("final_urls");
    }

    const promoPayload: any = {};
    if (input.promotionTarget) {
      promoPayload.promotionTarget = GoogleAdsBaseService.cleanAdText(input.promotionTarget.trim(), 30);
      updateMasks.push("promotion_asset.promotion_target");
    }

    if (input.discountType === "PERCENT_OFF" && input.percentOff) {
      promoPayload.percentOff = Math.round(Number(input.percentOff) * 10000);
      updateMasks.push("promotion_asset.percent_off");
    } else if (input.discountType === "MONEY_AMOUNT_OFF" && input.moneyAmountOff) {
      promoPayload.moneyAmountOff = {
        currencyCode: input.moneyAmountOff.currencyCode || "INR",
        amountMicros: String(Math.round(Number(input.moneyAmountOff.amount) * 1_000_000))
      };
      updateMasks.push("promotion_asset.money_amount_off");
    }

    if (input.promotionCode !== undefined) {
      promoPayload.promotionCode = input.promotionCode.trim();
      updateMasks.push("promotion_asset.promotion_code");
    }

    if (input.occasion !== undefined) {
      promoPayload.occasion = input.occasion;
      updateMasks.push("promotion_asset.occasion");
    }

    if (input.startDate) {
      promoPayload.redemptionStartDate = input.startDate.trim();
      updateMasks.push("promotion_asset.redemption_start_date");
    }

    if (input.endDate) {
      promoPayload.redemptionEndDate = input.endDate.trim();
      updateMasks.push("promotion_asset.redemption_end_date");
    }

    if (Object.keys(promoPayload).length > 0) {
      assetPayload.promotionAsset = promoPayload;
    }

    if (updateMasks.length === 0) {
      throw new Error("No fields provided to update.");
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assets:mutate`,
      {
        operations: [
          {
            update: assetPayload,
            updateMask: updateMasks.join(",")
          }
        ]
      },
      { headers }
    );

    return res.data?.results?.[0] || { resourceName };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. LEAD FORM ASSETS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists lead form assets for a customer.
   */
  public static async listLeadForms(organizationId: string, customerId: string) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const assetGaql = `
      SELECT
        asset.id,
        asset.name,
        asset.type,
        asset.resource_name,
        asset.lead_form_asset.business_name,
        asset.lead_form_asset.headline,
        asset.lead_form_asset.description,
        asset.lead_form_asset.privacy_policy_url,
        asset.lead_form_asset.post_submit_headline,
        asset.lead_form_asset.post_submit_description,
        asset.lead_form_asset.call_to_action_type,
        asset.lead_form_asset.call_to_action_description,
        asset.lead_form_asset.custom_disclosure,
        asset.lead_form_asset.delivery_methods,
        asset.lead_form_asset.fields,
        asset.policy_summary.approval_status,
        asset.policy_summary.review_status
      FROM asset
      WHERE asset.type = 'LEAD_FORM'
      LIMIT 500
    `;

    const assetRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: assetGaql },
      { headers }
    );
    const assetRows = assetRes.data?.results || [];

    // Campaign links for lead forms
    const linkGaql = `
      SELECT
        campaign_asset.asset,
        campaign_asset.campaign,
        campaign_asset.status,
        campaign_asset.field_type,
        campaign.id,
        campaign.name
      FROM campaign_asset
      WHERE campaign_asset.field_type = 'LEAD_FORM'
        AND campaign_asset.status != 'REMOVED'
      LIMIT 500
    `;

    const linkMap = new Map<string, Array<{ campaignId: string; campaignName: string; resourceName: string }>>();
    try {
      const linkRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: linkGaql },
        { headers }
      );
      for (const r of linkRes.data?.results || []) {
        const aRef = r.campaignAsset?.asset;
        if (!aRef) continue;
        const list = linkMap.get(aRef) || [];
        list.push({
          campaignId: String(r.campaign?.id || ""),
          campaignName: r.campaign?.name || "",
          resourceName: r.campaignAsset?.campaign || ""
        });
        linkMap.set(aRef, list);
      }
    } catch (e: any) {
      console.warn("[GoogleAdsAssetTypesService] Could not fetch campaign links for lead forms:", e?.message);
    }

    return assetRows.map((r: any) => {
      const a = r.asset;
      const lfa = a?.leadFormAsset;
      const resName = a?.resourceName || `customers/${cid}/assets/${a?.id}`;

      return {
        id: String(a?.id || ""),
        resourceName: resName,
        name: a?.name || "",
        type: a?.type || "LEAD_FORM",
        businessName: lfa?.businessName || "",
        headline: lfa?.headline || "",
        description: lfa?.description || "",
        privacyPolicyUrl: lfa?.privacyPolicyUrl || "",
        callToActionType: lfa?.callToActionType || "LEARN_MORE",
        callToActionDescription: lfa?.callToActionDescription || "",
        postSubmitHeadline: lfa?.postSubmitHeadline || "",
        postSubmitDescription: lfa?.postSubmitDescription || "",
        customDisclosure: lfa?.customDisclosure || "",
        fields: (lfa?.fields || []).map((f: any) => ({
          inputType: f.inputType
        })),
        policyApprovalStatus: a?.policySummary?.approvalStatus || "UNKNOWN",
        policyReviewStatus: a?.policySummary?.reviewStatus || "UNKNOWN",
        campaigns: linkMap.get(resName) || []
      };
    });
  }

  /**
   * Creates a Lead Form asset and optionally links it to a Campaign.
   */
  public static async createLeadForm(
    organizationId: string,
    customerId: string,
    input: LeadFormInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    if (!input.businessName?.trim()) throw new Error("Business name is required for Lead Form asset.");
    if (!input.headline?.trim()) throw new Error("Headline is required for Lead Form asset.");
    if (!input.description?.trim()) throw new Error("Description is required for Lead Form asset.");
    if (!input.privacyPolicyUrl?.trim() || !input.privacyPolicyUrl.startsWith("http")) {
      throw new Error("A valid HTTP/HTTPS Privacy Policy URL is required for Lead Form asset.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const cleanFields = Array.isArray(input.fields) && input.fields.length > 0
      ? input.fields.map(f => ({ inputType: f.inputType }))
      : [
          { inputType: "FULL_NAME" },
          { inputType: "EMAIL" }
        ];

    const leadFormPayload: any = {
      businessName: GoogleAdsBaseService.cleanAdText(input.businessName.trim(), 25),
      headline: GoogleAdsBaseService.cleanAdText(input.headline.trim(), 30),
      description: GoogleAdsBaseService.cleanAdText(input.description.trim(), 200),
      privacyPolicyUrl: GoogleAdsBaseService.cleanUrl(input.privacyPolicyUrl.trim()),
      callToActionType: input.callToActionType || "LEARN_MORE",
      callToActionDescription: GoogleAdsBaseService.cleanAdText(input.callToActionDescription || "Apply today", 30),
      postSubmitHeadline: GoogleAdsBaseService.cleanAdText(input.postSubmitHeadline || "Thank you", 30),
      postSubmitDescription: GoogleAdsBaseService.cleanAdText(input.postSubmitDescription || "We will contact you shortly", 200),
      fields: cleanFields
    };

    const assetName = input.name?.trim() || `LeadForm - ${input.businessName.slice(0, 20)} - ${Date.now()}`;
    const assetOperation = {
      create: {
        name: assetName,
        type: "LEAD_FORM",
        leadFormAsset: leadFormPayload
      }
    };

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assets:mutate`,
      { operations: [assetOperation] },
      { headers }
    );

    const assetResourceName = res.data?.results?.[0]?.resourceName;
    if (!assetResourceName) {
      throw new Error("Failed to create Lead Form asset in Google Ads.");
    }

    // Attach to Campaign if requested
    if (input.campaignResourceName) {
      try {
        await axios.post(
          `${this.ADS_BASE}/customers/${cid}/campaignAssets:mutate`,
          {
            operations: [
              {
                create: {
                  campaign: input.campaignResourceName,
                  asset: assetResourceName,
                  fieldType: "LEAD_FORM",
                  status: "ENABLED"
                }
              }
            ]
          },
          { headers }
        );
      } catch (attachErr: any) {
        console.warn("[GoogleAdsAssetTypesService] Failed attaching lead form to campaign:", attachErr?.response?.data || attachErr.message);
      }
    }

    return {
      resourceName: assetResourceName,
      businessName: input.businessName,
      headline: input.headline
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. PRICE ASSETS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists price assets for a customer.
   */
  public static async listPrices(organizationId: string, customerId: string) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const assetGaql = `
      SELECT
        asset.id,
        asset.name,
        asset.type,
        asset.resource_name,
        asset.price_asset.type,
        asset.price_asset.price_qualifier,
        asset.price_asset.language_code,
        asset.price_asset.price_offerings,
        asset.policy_summary.approval_status,
        asset.policy_summary.review_status
      FROM asset
      WHERE asset.type = 'PRICE'
      LIMIT 500
    `;

    const assetRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: assetGaql },
      { headers }
    );
    const assetRows = assetRes.data?.results || [];

    const linkGaql = `
      SELECT
        campaign_asset.asset,
        campaign_asset.campaign,
        campaign_asset.status,
        campaign_asset.field_type,
        campaign.id,
        campaign.name
      FROM campaign_asset
      WHERE campaign_asset.field_type = 'PRICE'
        AND campaign_asset.status != 'REMOVED'
      LIMIT 500
    `;

    const linkMap = new Map<string, Array<{ campaignId: string; campaignName: string; resourceName: string }>>();
    try {
      const linkRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: linkGaql },
        { headers }
      );
      for (const r of linkRes.data?.results || []) {
        const aRef = r.campaignAsset?.asset;
        if (!aRef) continue;
        const list = linkMap.get(aRef) || [];
        list.push({
          campaignId: String(r.campaign?.id || ""),
          campaignName: r.campaign?.name || "",
          resourceName: r.campaignAsset?.campaign || ""
        });
        linkMap.set(aRef, list);
      }
    } catch (e: any) {
      console.warn("[GoogleAdsAssetTypesService] Could not fetch campaign links for prices:", e?.message);
    }

    return assetRows.map((r: any) => {
      const a = r.asset;
      const pa = a?.priceAsset;
      const resName = a?.resourceName || `customers/${cid}/assets/${a?.id}`;

      const offerings = (pa?.priceOfferings || []).map((o: any) => ({
        header: o.header || "",
        description: o.description || "",
        amount: o.price?.amountMicros ? Number(o.price.amountMicros) / 1_000_000 : 0,
        currencyCode: o.price?.currencyCode || "INR",
        unit: o.unit || "NO_UNIT",
        finalUrl: o.finalUrls?.[0] || ""
      }));

      return {
        id: String(a?.id || ""),
        resourceName: resName,
        name: a?.name || "",
        type: a?.type || "PRICE",
        priceType: pa?.type || "SERVICES",
        priceQualifier: pa?.priceQualifier || "UNSPECIFIED",
        languageCode: pa?.languageCode || "en",
        offerings,
        policyApprovalStatus: a?.policySummary?.approvalStatus || "UNKNOWN",
        policyReviewStatus: a?.policySummary?.reviewStatus || "UNKNOWN",
        campaigns: linkMap.get(resName) || []
      };
    });
  }

  /**
   * Creates a Price asset and optionally links it to a Campaign.
   */
  public static async createPrice(
    organizationId: string,
    customerId: string,
    input: {
      name?: string;
      priceType?: string; // SERVICES, BRANDS, PRODUCT_CATEGORIES, etc.
      priceQualifier?: string; // FROM, UP_TO, AVERAGE, UNSPECIFIED
      languageCode?: string;
      offerings: Array<{
        header: string;
        description: string;
        amount: number;
        currencyCode?: string;
        unit?: string; // PER_HOUR, PER_DAY, PER_WEEK, PER_MONTH, PER_YEAR, NO_UNIT
        finalUrl: string;
      }>;
      campaignResourceName?: string;
    }
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    if (!input.offerings || input.offerings.length === 0) {
      throw new Error("At least one price offering is required for a Price asset.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const cleanOfferings = input.offerings.map(o => ({
      header: GoogleAdsBaseService.cleanAdText(o.header.trim(), 25),
      description: GoogleAdsBaseService.cleanAdText(o.description.trim(), 25),
      price: {
        currencyCode: o.currencyCode || "INR",
        amountMicros: String(Math.round(Number(o.amount) * 1_000_000))
      },
      unit: o.unit && o.unit !== "No units" && o.unit !== "NO_UNIT" ? o.unit : "UNSPECIFIED",
      finalUrls: [GoogleAdsBaseService.cleanUrl(o.finalUrl.trim())]
    }));

    const assetName = input.name?.trim() || `Price - ${cleanOfferings[0].header} - ${Date.now()}`;
    const assetOperation = {
      create: {
        name: assetName,
        type: "PRICE",
        priceAsset: {
          type: input.priceType || "SERVICES",
          priceQualifier: input.priceQualifier || "UNSPECIFIED",
          languageCode: input.languageCode || "en",
          priceOfferings: cleanOfferings
        }
      }
    };

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assets:mutate`,
      { operations: [assetOperation] },
      { headers }
    );

    const assetResourceName = res.data?.results?.[0]?.resourceName;
    if (!assetResourceName) {
      throw new Error("Failed to create Price asset in Google Ads.");
    }

    if (input.campaignResourceName) {
      try {
        await axios.post(
          `${this.ADS_BASE}/customers/${cid}/campaignAssets:mutate`,
          {
            operations: [
              {
                create: {
                  campaign: input.campaignResourceName,
                  asset: assetResourceName,
                  fieldType: "PRICE",
                  status: "ENABLED"
                }
              }
            ]
          },
          { headers }
        );
      } catch (attachErr: any) {
        console.warn("[GoogleAdsAssetTypesService] Failed attaching price to campaign:", attachErr?.response?.data || attachErr.message);
      }
    }

    return {
      resourceName: assetResourceName,
      offerings: cleanOfferings
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. CALLOUT ASSETS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists callout assets for a customer.
   */
  public static async listCallouts(organizationId: string, customerId: string) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const assetGaql = `
      SELECT
        asset.id,
        asset.name,
        asset.type,
        asset.resource_name,
        asset.callout_asset.callout_text,
        asset.policy_summary.approval_status,
        asset.policy_summary.review_status
      FROM asset
      WHERE asset.type = 'CALLOUT'
      LIMIT 500
    `;

    const assetRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: assetGaql },
      { headers }
    );
    const assetRows = assetRes.data?.results || [];

    const linkGaql = `
      SELECT
        campaign_asset.asset,
        campaign_asset.campaign,
        campaign_asset.status,
        campaign_asset.field_type,
        campaign.id,
        campaign.name
      FROM campaign_asset
      WHERE campaign_asset.field_type = 'CALLOUT'
        AND campaign_asset.status != 'REMOVED'
      LIMIT 500
    `;

    const linkMap = new Map<string, Array<{ campaignId: string; campaignName: string; resourceName: string }>>();
    try {
      const linkRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: linkGaql },
        { headers }
      );
      for (const r of linkRes.data?.results || []) {
        const aRef = r.campaignAsset?.asset;
        if (!aRef) continue;
        const list = linkMap.get(aRef) || [];
        list.push({
          campaignId: String(r.campaign?.id || ""),
          campaignName: r.campaign?.name || "",
          resourceName: r.campaignAsset?.campaign || ""
        });
        linkMap.set(aRef, list);
      }
    } catch (e: any) {
      console.warn("[GoogleAdsAssetTypesService] Could not fetch campaign links for callouts:", e?.message);
    }

    return assetRows.map((r: any) => {
      const a = r.asset;
      const resName = a?.resourceName || `customers/${cid}/assets/${a?.id}`;
      return {
        id: String(a?.id || ""),
        resourceName: resName,
        name: a?.name || "",
        type: a?.type || "CALLOUT",
        calloutText: a?.calloutAsset?.calloutText || "",
        policyApprovalStatus: a?.policySummary?.approvalStatus || "UNKNOWN",
        policyReviewStatus: a?.policySummary?.reviewStatus || "UNKNOWN",
        campaigns: linkMap.get(resName) || []
      };
    });
  }

  /**
   * Creates a Callout asset and optionally links it to a Campaign.
   */
  public static async createCallout(
    organizationId: string,
    customerId: string,
    input: {
      calloutText: string;
      name?: string;
      campaignResourceName?: string;
    }
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    if (!input.calloutText?.trim()) {
      throw new Error("Callout text is required.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cid);
    const cleanText = GoogleAdsBaseService.cleanAdText(input.calloutText.trim(), 25);
    const assetName = input.name?.trim() || `Callout - ${cleanText} - ${Date.now()}`;

    const assetOperation = {
      create: {
        name: assetName,
        type: "CALLOUT",
        calloutAsset: {
          calloutText: cleanText
        }
      }
    };

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assets:mutate`,
      { operations: [assetOperation] },
      { headers }
    );

    const assetResourceName = res.data?.results?.[0]?.resourceName;
    if (!assetResourceName) {
      throw new Error("Failed to create Callout asset in Google Ads.");
    }

    if (input.campaignResourceName) {
      try {
        await axios.post(
          `${this.ADS_BASE}/customers/${cid}/campaignAssets:mutate`,
          {
            operations: [
              {
                create: {
                  campaign: input.campaignResourceName,
                  asset: assetResourceName,
                  fieldType: "CALLOUT",
                  status: "ENABLED"
                }
              }
            ]
          },
          { headers }
        );
      } catch (attachErr: any) {
        console.warn("[GoogleAdsAssetTypesService] Failed attaching callout to campaign:", attachErr?.response?.data || attachErr.message);
      }
    }

    return {
      resourceName: assetResourceName,
      calloutText: cleanText
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. APP ASSETS (Android / iOS)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists mobile app assets for a customer.
   */
  public static async listApps(organizationId: string, customerId: string) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const assetGaql = `
      SELECT
        asset.id,
        asset.name,
        asset.type,
        asset.resource_name,
        asset.app_asset.app_id,
        asset.app_asset.app_store,
        asset.app_asset.link_text,
        asset.final_urls,
        asset.policy_summary.approval_status,
        asset.policy_summary.review_status
      FROM asset
      WHERE asset.type = 'APP'
      LIMIT 500
    `;

    const assetRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: assetGaql },
      { headers }
    );
    const assetRows = assetRes.data?.results || [];

    const linkGaql = `
      SELECT
        campaign_asset.asset,
        campaign_asset.campaign,
        campaign_asset.status,
        campaign_asset.field_type,
        campaign.id,
        campaign.name
      FROM campaign_asset
      WHERE campaign_asset.field_type = 'APP'
        AND campaign_asset.status != 'REMOVED'
      LIMIT 500
    `;

    const linkMap = new Map<string, Array<{ campaignId: string; campaignName: string; resourceName: string }>>();
    try {
      const linkRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: linkGaql },
        { headers }
      );
      for (const r of linkRes.data?.results || []) {
        const aRef = r.campaignAsset?.asset;
        if (!aRef) continue;
        const list = linkMap.get(aRef) || [];
        list.push({
          campaignId: String(r.campaign?.id || ""),
          campaignName: r.campaign?.name || "",
          resourceName: r.campaignAsset?.campaign || ""
        });
        linkMap.set(aRef, list);
      }
    } catch (e: any) {
      console.warn("[GoogleAdsAssetTypesService] Could not fetch campaign links for apps:", e?.message);
    }

    return assetRows.map((r: any) => {
      const a = r.asset;
      const resName = a?.resourceName || `customers/${cid}/assets/${a?.id}`;
      return {
        id: String(a?.id || ""),
        resourceName: resName,
        name: a?.name || "",
        type: a?.type || "APP",
        appId: a?.appAsset?.appId || "",
        appStore: a?.appAsset?.appStore || "GOOGLE_APP_STORE",
        linkText: a?.appAsset?.linkText || "Download",
        finalUrls: a?.finalUrls || [],
        policyApprovalStatus: a?.policySummary?.approvalStatus || "UNKNOWN",
        policyReviewStatus: a?.policySummary?.reviewStatus || "UNKNOWN",
        campaigns: linkMap.get(resName) || []
      };
    });
  }

  /**
   * Creates an App asset and optionally links it to a Campaign.
   */
  public static async createApp(
    organizationId: string,
    customerId: string,
    input: {
      appId: string;
      appStore?: "GOOGLE_APP_STORE" | "APPLE_APP_STORE";
      linkText?: string;
      finalUrl?: string;
      name?: string;
      campaignResourceName?: string;
    }
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    if (!input.appId?.trim()) {
      throw new Error("App ID (package name or app store ID) is required.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cid);
    const store = input.appStore || (input.appId.includes(".") ? "GOOGLE_APP_STORE" : "APPLE_APP_STORE");
    const linkText = GoogleAdsBaseService.cleanAdText(input.linkText?.trim() || "Download", 25);
    const assetName = input.name?.trim() || `App - ${input.appId.trim()} - ${Date.now()}`;

    const defaultUrl = store === "GOOGLE_APP_STORE"
      ? `https://play.google.com/store/apps/details?id=${input.appId.trim()}`
      : `https://apps.apple.com/app/id${input.appId.trim()}`;

    const finalUrl = input.finalUrl?.trim() ? GoogleAdsBaseService.cleanUrl(input.finalUrl.trim()) : defaultUrl;

    const assetOperation = {
      create: {
        name: assetName,
        type: "APP",
        appAsset: {
          appId: input.appId.trim(),
          appStore: store,
          linkText
        },
        finalUrls: [finalUrl]
      }
    };

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assets:mutate`,
      { operations: [assetOperation] },
      { headers }
    );

    const assetResourceName = res.data?.results?.[0]?.resourceName;
    if (!assetResourceName) {
      throw new Error("Failed to create App asset in Google Ads.");
    }

    if (input.campaignResourceName) {
      try {
        await axios.post(
          `${this.ADS_BASE}/customers/${cid}/campaignAssets:mutate`,
          {
            operations: [
              {
                create: {
                  campaign: input.campaignResourceName,
                  asset: assetResourceName,
                  fieldType: "APP",
                  status: "ENABLED"
                }
              }
            ]
          },
          { headers }
        );
      } catch (attachErr: any) {
        console.warn("[GoogleAdsAssetTypesService] Failed attaching app to campaign:", attachErr?.response?.data || attachErr.message);
      }
    }

    return {
      resourceName: assetResourceName,
      appId: input.appId,
      appStore: store,
      linkText
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. MESSAGE ASSETS (WhatsApp, Messenger, Zalo)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists message assets for a customer.
   */
  public static async listMessages(organizationId: string, customerId: string) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    // Message assets in modern Google Ads can be represented as CALL / SITELINK / CUSTOM_ASSET with Click-to-Chat URLs
    const assetGaql = `
      SELECT
        asset.id,
        asset.name,
        asset.type,
        asset.resource_name,
        asset.call_asset.phone_number,
        asset.call_asset.country_code,
        asset.final_urls,
        asset.policy_summary.approval_status,
        asset.policy_summary.review_status
      FROM asset
      WHERE asset.type IN ('CALL', 'SITELINK')
      LIMIT 500
    `;

    try {
      const assetRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: assetGaql },
        { headers }
      );
      const assetRows = assetRes.data?.results || [];

      return assetRows
        .filter((r: any) => {
          const urls = r.asset?.finalUrls || [];
          return urls.some((u: string) => u.includes("wa.me") || u.includes("whatsapp.com") || u.includes("m.me") || u.includes("zalo.me")) || r.asset?.type === "CALL";
        })
        .map((r: any) => {
          const a = r.asset;
          const resName = a?.resourceName || `customers/${cid}/assets/${a?.id}`;
          return {
            id: String(a?.id || ""),
            resourceName: resName,
            name: a?.name || "",
            type: "MESSAGE",
            phoneNumber: a?.callAsset?.phoneNumber || "",
            countryCode: a?.callAsset?.countryCode || "IN",
            finalUrls: a?.finalUrls || [],
            policyApprovalStatus: a?.policySummary?.approvalStatus || "UNKNOWN",
            policyReviewStatus: a?.policySummary?.reviewStatus || "UNKNOWN"
          };
        });
    } catch (e: any) {
      console.warn("[GoogleAdsAssetTypesService] listMessages warning:", e?.message);
      return [];
    }
  }

  /**
   * Creates a Message asset (e.g. WhatsApp Click-to-Chat or Call extension).
   */
  public static async createMessage(
    organizationId: string,
    customerId: string,
    input: {
      platform: "WhatsApp" | "Messenger" | "Zalo";
      phoneNumber?: string; // 10-digit phone number
      countryCode?: string; // e.g. "IN", "US"
      starterMessage?: string;
      customUrlName?: string;
      callToAction?: string;
      callToActionDescription?: string;
      name?: string;
      campaignResourceName?: string;
    }
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    let finalUrl = "";
    if (input.platform === "WhatsApp") {
      const phoneDigits = (input.phoneNumber || "").replace(/[^0-9]/g, "");
      const clean10 = phoneDigits.length === 12 && phoneDigits.startsWith("91") ? phoneDigits.slice(2) : phoneDigits;
      const textParam = input.starterMessage?.trim() ? `?text=${encodeURIComponent(input.starterMessage.trim())}` : "";
      finalUrl = `https://wa.me/91${clean10}${textParam}`;
    } else if (input.platform === "Messenger") {
      finalUrl = `https://m.me/${encodeURIComponent(input.customUrlName?.trim() || "user")}`;
    } else if (input.platform === "Zalo") {
      finalUrl = `https://zalo.me/${encodeURIComponent(input.customUrlName?.trim() || "user")}`;
    }

    const assetName = input.name?.trim() || `Message - ${input.platform} - ${Date.now()}`;
    const cleanFinalUrl = GoogleAdsBaseService.cleanUrl(finalUrl);

    // Create as a Sitelink / Call action asset with direct chat final URL
    const assetOperation = {
      create: {
        name: assetName,
        type: "SITELINK",
        sitelinkAsset: {
          linkText: GoogleAdsBaseService.cleanAdText(input.callToActionDescription || `Chat on ${input.platform}`, 25),
          description1: GoogleAdsBaseService.cleanAdText(input.starterMessage || "Direct Instant Support", 35),
          description2: GoogleAdsBaseService.cleanAdText("Click to message us directly", 35)
        },
        finalUrls: [cleanFinalUrl]
      }
    };

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assets:mutate`,
      { operations: [assetOperation] },
      { headers }
    );

    const assetResourceName = res.data?.results?.[0]?.resourceName;
    if (!assetResourceName) {
      throw new Error("Failed to create Message asset in Google Ads.");
    }

    if (input.campaignResourceName) {
      try {
        await axios.post(
          `${this.ADS_BASE}/customers/${cid}/campaignAssets:mutate`,
          {
            operations: [
              {
                create: {
                  campaign: input.campaignResourceName,
                  asset: assetResourceName,
                  fieldType: "SITELINK",
                  status: "ENABLED"
                }
              }
            ]
          },
          { headers }
        );
      } catch (attachErr: any) {
        console.warn("[GoogleAdsAssetTypesService] Failed attaching message to campaign:", attachErr?.response?.data || attachErr.message);
      }
    }

    return {
      resourceName: assetResourceName,
      platform: input.platform,
      finalUrl: cleanFinalUrl
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. COMMON ASSET ASSOCIATIONS (campaign_asset, ad_group_asset)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Associates any created asset to a campaign using official Google Ads campaign_asset resource.
   */
  public static async associateAssetToCampaign(
    organizationId: string,
    customerId: string,
    campaignResourceName: string,
    assetResourceName: string,
    fieldType: "STRUCTURED_SNIPPET" | "PROMOTION" | "LEAD_FORM" | "SITELINK" | "CALLOUT" | "CALL" | "PRICE" | "APP"
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/campaignAssets:mutate`,
      {
        operations: [
          {
            create: {
              campaign: campaignResourceName,
              asset: assetResourceName,
              fieldType,
              status: "ENABLED"
            }
          }
        ]
      },
      { headers }
    );

    return res.data?.results?.[0];
  }

  /**
   * Removes an asset association from a campaign.
   */
  public static async removeAssetFromCampaign(
    organizationId: string,
    customerId: string,
    campaignAssetResourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/campaignAssets:mutate`,
      {
        operations: [
          {
            remove: campaignAssetResourceName
          }
        ]
      },
      { headers }
    );

    return res.data?.results?.[0];
  }
}

