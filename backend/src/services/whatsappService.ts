import axios from "axios";
import fs from "fs";
import path from "path";
import prisma from "../utils/prisma";

interface ButtonItem {
  id: string;
  title: string;
}

interface ListRow {
  id: string;
  title: string;
  description?: string;
}

interface ListSection {
  title: string;
  rows: ListRow[];
}

export class WhatsAppService {
  // Download inbound media from Meta Cloud API and upload to ImageKit CDN for permanent storage.
  // Returns the permanent ImageKit CDN URL (e.g. "https://ik.imagekit.io/automationjds/whatsapp/...")
  public static async downloadMedia(
    phoneNumberId: string,
    accessToken: string,
    mediaId: string,
    mimeType: string,
    filename?: string
  ): Promise<string> {
    if (this.isMock(phoneNumberId, accessToken)) {
      if (mimeType.startsWith("image/")) return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300`;
      if (mimeType.startsWith("video/")) return `https://www.w3schools.com/html/mov_bbb.mp4`;
      if (mimeType.startsWith("audio/")) return `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`;
      return `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;
    }

    try {
      // Step 1: Get Media download URL from Meta Graph API
      const detailsRes = await axios.get(`https://graph.facebook.com/v19.0/${mediaId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const downloadUrl = detailsRes.data.url;
      if (!downloadUrl) throw new Error("Meta media download URL missing");

      // Step 2: Download the binary buffer from Meta CDN
      const downloadRes = await axios.get(downloadUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: "arraybuffer"
      });
      const buffer = Buffer.from(downloadRes.data);

      // Step 3: Determine file extension
      let ext = "bin";
      if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";
      else if (mimeType.includes("png")) ext = "png";
      else if (mimeType.includes("gif")) ext = "gif";
      else if (mimeType.includes("webp")) ext = "webp";
      else if (mimeType.includes("pdf")) ext = "pdf";
      else if (mimeType.includes("mp4")) ext = "mp4";
      else if (mimeType.includes("mpeg") || mimeType.includes("mp3")) ext = "mp3";
      else if (mimeType.includes("ogg")) ext = "ogg";
      else if (mimeType.includes("wav")) ext = "wav";

      const ikPrivateKey = process.env.IMAGEKIT_PRIVATE_KEY;
      const ikUrlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/automationjds";

      // Step 4: Upload to ImageKit if credentials are available
      if (ikPrivateKey) {
        const uploadFilename = filename || `wa_${mediaId}_${Date.now()}.${ext}`;
        const FormData = require("form-data");
        const formData = new FormData();
        formData.append("file", buffer, { filename: uploadFilename, contentType: mimeType });
        formData.append("fileName", uploadFilename);
        formData.append("folder", "/whatsapp-media");
        formData.append("useUniqueFileName", "true");

        const ikRes = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Basic ${Buffer.from(ikPrivateKey + ":").toString("base64")}`,
          },
        });

        if (ikRes.data?.url) {
          console.log(`[WHATSAPP MEDIA] Uploaded ${uploadFilename} to ImageKit: ${ikRes.data.url}`);
          return ikRes.data.url;
        }
      }

      // Fallback: Save locally if ImageKit not configured
      console.warn("[WHATSAPP MEDIA] ImageKit not configured, saving locally as fallback.");
      const localFilename = filename || `${mediaId}.${ext}`;
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      fs.writeFileSync(path.join(uploadsDir, localFilename), buffer);
      return `/uploads/${localFilename}`;

    } catch (err: any) {
      console.error(`[WHATSAPP MEDIA] Error downloading/uploading media (${mediaId}):`, err.response?.data || err.message);
      return "";
    }
  }
  private static isMock(phoneNumberId: string, accessToken: string): boolean {
    const isTokenPlaceholder = !accessToken || accessToken === "EAAG..." || accessToken.startsWith("EAAG") || accessToken.length < 20;
    const isPhonePlaceholder = !phoneNumberId || phoneNumberId === "100000000000000" || phoneNumberId.length < 5;
    return isTokenPlaceholder || isPhonePlaceholder;
  }

  private static getApiUrl(phoneNumberId: string): string {
    return `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
  }

  private static getHeaders(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
  }

  public static formatPhoneNumber(to: string): string {
    let clean = (to || "").replace(/[^0-9]/g, "");
    if (!clean) return to;

    // Standard 10-digit mobile numbers (e.g. 9136870930 or 9325174465) require Indian 91 country code
    if (clean.length === 10) {
      clean = "91" + clean;
    }
    return clean;
  }

  // Send Text Message
  public static async sendTextMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    text: string,
    contextMessageId?: string
  ) {
    const formattedTo = this.formatPhoneNumber(to);
    if (this.isMock(phoneNumberId, accessToken)) {
      console.log(`[MOCK WHATSAPP SEND TEXT] to ${formattedTo}: "${text}"${contextMessageId ? ` (replying to ${contextMessageId})` : ""}`);
      return { messages: [{ id: `mock_wa_msg_${Math.random().toString(36).substring(7)}` }] };
    }
    const url = this.getApiUrl(phoneNumberId);
    const data: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedTo,
      type: "text",
      text: {
        preview_url: false,
        body: text,
      },
    };

    if (contextMessageId) {
      data.context = { message_id: contextMessageId };
    }

    const response = await axios.post(url, data, {
      headers: this.getHeaders(accessToken),
    });
    return response.data;
  }

  // Send Quick Reply Buttons (Max 3 buttons)
  public static async sendButtonMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    text: string,
    buttons: ButtonItem[],
    contextMessageId?: string
  ) {
    if (this.isMock(phoneNumberId, accessToken)) {
      console.log(`[MOCK WHATSAPP SEND BUTTONS] to ${to}: "${text}" [${buttons.map(b => b.title).join(", ")}]${contextMessageId ? ` (replying to ${contextMessageId})` : ""}`);
      return { messages: [{ id: `mock_wa_msg_${Math.random().toString(36).substring(7)}` }] };
    }
    const url = this.getApiUrl(phoneNumberId);
    
    // Format buttons for Meta API
    const formattedButtons = buttons.slice(0, 3).map((btn) => ({
      type: "reply",
      reply: {
        id: btn.id,
        title: btn.title.substring(0, 20), // Meta limits button title to 20 chars
      },
    }));

    const data: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: text,
        },
        action: {
          buttons: formattedButtons,
        },
      },
    };

    if (contextMessageId) {
      data.context = { message_id: contextMessageId };
    }

    const response = await axios.post(url, data, {
      headers: this.getHeaders(accessToken),
    });
    return response.data;
  }

  // Send List Message (Max 10 rows total across all sections)
  public static async sendListMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    bodyText: string,
    buttonText: string,
    sections: ListSection[],
    headerText?: string,
    footerText?: string,
    contextMessageId?: string
  ) {
    if (this.isMock(phoneNumberId, accessToken)) {
      console.log(`[MOCK WHATSAPP SEND LIST] to ${to}: "${bodyText}" - Button: "${buttonText}"${contextMessageId ? ` (replying to ${contextMessageId})` : ""}`);
      return { messages: [{ id: `mock_wa_msg_${Math.random().toString(36).substring(7)}` }] };
    }
    const url = this.getApiUrl(phoneNumberId);

    // Format action sections (Meta WhatsApp API requires max 24 chars for list titles)
    const formattedSections = sections.map((sec) => ({
      title: sec.title ? sec.title.trim().substring(0, 24) : "",
      rows: sec.rows.map((row) => ({
        id: row.id,
        title: row.title ? row.title.trim().substring(0, 24) : "",
        description: row.description ? row.description.trim().substring(0, 72) : undefined,
      })),
    }));

    const data: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: {
          text: bodyText,
        },
        action: {
          button: buttonText.substring(0, 20), // Meta limits list button label to 20 chars
          sections: formattedSections,
        },
      },
    };

    if (headerText) {
      data.interactive.header = {
        type: "text",
        text: headerText.substring(0, 60), // Meta limits header to 60 chars
      };
    }

    if (footerText) {
      data.interactive.footer = {
        text: footerText.substring(0, 60), // Meta limits footer to 60 chars
      };
    }

    if (contextMessageId) {
      data.context = { message_id: contextMessageId };
    }

    const response = await axios.post(url, data, {
      headers: this.getHeaders(accessToken),
    });
    return response.data;
  }

  // Upload local media file to Meta WhatsApp Cloud API and return Meta Media ID
  public static async uploadMedia(
    phoneNumberId: string,
    accessToken: string,
    filePathOrUrl: string,
    mimeType: string = "image/jpeg"
  ): Promise<string | null> {
    try {
      let localPath = filePathOrUrl;
      // Convert relative URL or URL to local disk filepath if saved in public directory
      if (filePathOrUrl.startsWith("/") || filePathOrUrl.startsWith("\\")) {
        localPath = path.join(process.cwd(), "public", filePathOrUrl);
      } else if (filePathOrUrl.includes("/uploads/")) {
        const relative = filePathOrUrl.substring(filePathOrUrl.indexOf("/uploads/"));
        localPath = path.join(process.cwd(), "public", relative);
      }

      if (!fs.existsSync(localPath)) {
        console.warn(`[WHATSAPP MEDIA UPLOAD] File not found at disk path: ${localPath}`);
        return null;
      }

      const FormData = require("form-data");
      const form = new FormData();
      form.append("messaging_product", "whatsapp");
      form.append("file", fs.createReadStream(localPath));
      form.append("type", mimeType);

      const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/media`;
      const response = await axios.post(url, form, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...form.getHeaders(),
        },
      });

      if (response.data && response.data.id) {
        console.log(`[WHATSAPP MEDIA UPLOAD SUCCESS] Uploaded ${localPath} -> Meta Media ID: ${response.data.id}`);
        return response.data.id;
      }
      return null;
    } catch (err: any) {
      console.error("[WHATSAPP MEDIA UPLOAD ERROR]", err?.response?.data || err.message);
      return null;
    }
  }

  // Send Media Message (Image, Document, Video, Audio)
  public static async sendMediaMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    mediaType: "image" | "document" | "video" | "audio",
    mediaUrlOrId: string,
    filename?: string,
    caption?: string,
    contextMessageId?: string
  ) {
    if (this.isMock(phoneNumberId, accessToken)) {
      console.log(`[MOCK WHATSAPP SEND MEDIA] to ${to}: Type: "${mediaType}" - Url/Id: "${mediaUrlOrId}"${caption ? ` - Caption: "${caption}"` : ""}${contextMessageId ? ` (replying to ${contextMessageId})` : ""}`);
      return { messages: [{ id: `mock_wa_msg_${Math.random().toString(36).substring(7)}` }] };
    }
    const url = this.getApiUrl(phoneNumberId);

    // Check if mediaUrlOrId is a public HTTPS URL, a local file path, or a raw Meta Media ID
    let isHttps = mediaUrlOrId.startsWith("https://");
    let targetMediaId: string | null = null;

    if (/^\d{10,}$/.test(mediaUrlOrId)) {
      // Raw numeric Meta Media ID (e.g. "1868110550830190")
      targetMediaId = mediaUrlOrId;
    } else if (!isHttps && (mediaUrlOrId.includes("/uploads/") || mediaUrlOrId.startsWith("/") || mediaUrlOrId.includes("localhost") || mediaUrlOrId.includes("127.0.0.1"))) {
      // Local file path — upload to Meta Cloud API to get a Media ID
      const mime = mediaType === "image" ? "image/jpeg" : mediaType === "video" ? "video/mp4" : mediaType === "audio" ? "audio/mp3" : "application/pdf";
      targetMediaId = await this.uploadMedia(phoneNumberId, accessToken, mediaUrlOrId, mime);
    } else if (!mediaUrlOrId.startsWith("http://") && !mediaUrlOrId.startsWith("https://")) {
      // Non-HTTP, non-path string — treat as raw Meta Media ID
      targetMediaId = mediaUrlOrId;
    }

    const mediaObject: any = {};
    if (targetMediaId) {
      mediaObject.id = targetMediaId;
    } else if (isHttps) {
      mediaObject.link = mediaUrlOrId;
    } else {
      console.warn(`[WHATSAPP MEDIA SEND] Could not resolve media ID for: ${mediaUrlOrId}`);
      throw new Error(`Unable to resolve media ID or public HTTPS URL for ${mediaUrlOrId}`);
    }

    if (mediaType === "document" && filename) {
      mediaObject.filename = filename;
    }

    if (caption && ["image", "document", "video"].includes(mediaType)) {
      mediaObject.caption = caption;
    }

    const data: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: mediaType,
      [mediaType]: mediaObject,
    };

    if (contextMessageId) {
      data.context = { message_id: contextMessageId };
    }

    try {
      const response = await axios.post(url, data, {
        headers: this.getHeaders(accessToken),
      });
      return response.data;
    } catch (err: any) {
      console.warn(`[WHATSAPP MEDIA SEND LINK WARNING] Direct link send failed for ${mediaUrlOrId}:`, err?.response?.data || err.message);

      // Fallback: If sending direct HTTPS link failed, download media buffer & upload to Meta Cloud API for a Media ID
      if (isHttps) {
        try {
          console.log(`[WHATSAPP MEDIA FALLBACK] Downloading buffer from ${mediaUrlOrId} to upload to Meta...`);
          const downloadRes = await axios.get(mediaUrlOrId, { responseType: "arraybuffer" });
          const buffer = Buffer.from(downloadRes.data);

          const FormData = require("form-data");
          const form = new FormData();
          form.append("messaging_product", "whatsapp");
          const fileExt = mediaType === "document" ? "pdf" : mediaType === "video" ? "mp4" : "jpg";
          const fallbackFilename = filename || `media_${Date.now()}.${fileExt}`;
          form.append("file", buffer, { filename: fallbackFilename });
          const mime = mediaType === "image" ? "image/jpeg" : mediaType === "video" ? "video/mp4" : mediaType === "audio" ? "audio/mp3" : "application/pdf";
          form.append("type", mime);

          const metaUploadUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/media`;
          const metaUploadRes = await axios.post(metaUploadUrl, form, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              ...form.getHeaders(),
            },
          });

          if (metaUploadRes.data?.id) {
            const uploadedMediaId = metaUploadRes.data.id;
            console.log(`[WHATSAPP MEDIA FALLBACK SUCCESS] Meta Media ID obtained: ${uploadedMediaId}`);

            const fallbackData: any = {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to,
              type: mediaType,
              [mediaType]: {
                id: uploadedMediaId,
                ...(mediaType === "document" && filename ? { filename } : {}),
                ...(caption && ["image", "document", "video"].includes(mediaType) ? { caption } : {}),
              },
            };

            if (contextMessageId) {
              fallbackData.context = { message_id: contextMessageId };
            }

            const fallbackResponse = await axios.post(url, fallbackData, {
              headers: this.getHeaders(accessToken),
            });
            return fallbackResponse.data;
          }
        } catch (fallbackErr: any) {
          console.error("[WHATSAPP MEDIA FALLBACK ERROR]", fallbackErr?.response?.data || fallbackErr.message);
        }
      }

      throw err;
    }
  }

  // Helper to build Meta template body components for dynamic variables like {{1}} (Customer Name) and {{2}} (Coupon Code)
  public static buildTemplateComponents(variableValues: (string | number)[] = []): any[] {
    if (!variableValues || variableValues.length === 0) return [];
    
    const parameters = variableValues.map((val) => ({
      type: "text",
      text: String(val || "")
    }));

    return [
      {
        type: "body",
        parameters
      }
    ];
  }

  // Send Approved WhatsApp Template Message (Allows initiating conversations outside 24h window)
  public static async sendTemplateMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    templateName: string = "hello_world",
    languageCode: string = "en_US",
    components: any[] = [],
    customerName?: string,
    variable2?: string
  ) {
    const formattedTo = this.formatPhoneNumber(to);

    // Auto-resolve dynamic user name from database if not explicitly provided
    let resolvedCustomerName = customerName;
    if (!resolvedCustomerName || resolvedCustomerName === "Valued Customer") {
      try {
        const conv = await prisma.conversation.findFirst({
          where: {
            OR: [
              { customerPhone: formattedTo },
              { customerPhone: to }
            ]
          },
          select: { customerName: true }
        });
        if (conv?.customerName && !conv.customerName.startsWith("Lead (")) {
          resolvedCustomerName = conv.customerName;
        }
      } catch (dbErr) {
        // Fallback silently if DB lookup fails
      }
    }

    const nameVal = (resolvedCustomerName || "Valued Customer").replace(/^Lead\s*\(/i, "").replace(/\)$/, "").trim() || "Valued Customer";
    const couponVal = (variable2 || "OFFER20").trim();

    // Auto-resolve components for templates with {{1}} (Customer Name) and {{2}} (Coupon / Variable) if components not passed
    let finalComponents = components;
    if ((!finalComponents || finalComponents.length === 0) && templateName !== "hello_world") {
      finalComponents = this.buildTemplateComponents([nameVal, couponVal]);
    }

    if (this.isMock(phoneNumberId, accessToken)) {
      console.log(`[MOCK WHATSAPP SEND TEMPLATE] to ${formattedTo}: Template "${templateName}" (${languageCode}) components:`, JSON.stringify(finalComponents));
      return { messages: [{ id: `mock_wa_msg_${Math.random().toString(36).substring(7)}` }] };
    }
    const url = this.getApiUrl(phoneNumberId);
    const data: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedTo,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(finalComponents && finalComponents.length > 0 ? { components: finalComponents } : {})
      }
    };

    console.log(`[WHATSAPP SERVICE] Dispatching Template "${templateName}" to ${formattedTo} with parameters:`, JSON.stringify(finalComponents));

    const response = await axios.post(url, data, {
      headers: this.getHeaders(accessToken),
    });
    return response.data;
  }

  // Fetch Meta Approved WhatsApp Templates from Graph API
  public static async getTemplates(wabaId: string, accessToken: string) {
    if (this.isMock(wabaId, accessToken)) {
      return {
        data: [
          {
            id: "mock_tpl_1",
            name: "hello_world",
            status: "APPROVED",
            category: "MARKETING",
            language: "en_US",
            components: [{ type: "BODY", text: "Welcome to our business! How can we assist you today?" }]
          }
        ]
      };
    }
    const url = `https://graph.facebook.com/v19.0/${wabaId}/message_templates`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  }
}
