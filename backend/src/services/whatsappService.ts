import axios from "axios";
import fs from "fs";
import path from "path";

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
  // Download Media from Meta API and save it locally. Returns the relative local URL path (e.g. "/uploads/abc.jpg")
  public static async downloadMedia(
    phoneNumberId: string,
    accessToken: string,
    mediaId: string,
    mimeType: string
  ): Promise<string> {
    if (this.isMock(phoneNumberId, accessToken)) {
      // In mock mode, return a realistic unsplash or dummy placeholder URL
      if (mimeType.startsWith("image/")) {
        return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300`;
      } else if (mimeType.startsWith("video/")) {
        return `https://www.w3schools.com/html/mov_bbb.mp4`;
      } else if (mimeType.startsWith("audio/")) {
        return `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`;
      } else {
        return `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;
      }
    }

    try {
      // Step 1: Get Media details from Meta
      const detailsUrl = `https://graph.facebook.com/v19.0/${mediaId}`;
      const detailsRes = await axios.get(detailsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const downloadUrl = detailsRes.data.url;
      if (!downloadUrl) throw new Error("Media download URL not found in Meta response");

      // Step 2: Download the binary file
      const downloadRes = await axios.get(downloadUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: "arraybuffer"
      });

      // Step 3: Determine file extension from mime type
      let ext = "bin";
      if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";
      else if (mimeType.includes("png")) ext = "png";
      else if (mimeType.includes("gif")) ext = "gif";
      else if (mimeType.includes("pdf")) ext = "pdf";
      else if (mimeType.includes("mp4")) ext = "mp4";
      else if (mimeType.includes("mpeg") || mimeType.includes("mp3")) ext = "mp3";
      else if (mimeType.includes("ogg")) ext = "ogg";
      else if (mimeType.includes("wav")) ext = "wav";
      else if (mimeType.includes("webp")) ext = "webp";

      const filename = `${mediaId}.${ext}`;
      const uploadsDir = path.join(process.cwd(), "uploads");
      
      // Ensure uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, Buffer.from(downloadRes.data));

      return `/uploads/${filename}`;
    } catch (err: any) {
      console.error(`Error downloading media from Meta (${mediaId}):`, err.message);
      return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300`;
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

  // Send Text Message
  public static async sendTextMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    text: string,
    contextMessageId?: string
  ) {
    if (this.isMock(phoneNumberId, accessToken)) {
      console.log(`[MOCK WHATSAPP SEND TEXT] to ${to}: "${text}"${contextMessageId ? ` (replying to ${contextMessageId})` : ""}`);
      return { messages: [{ id: `mock_wa_msg_${Math.random().toString(36).substring(7)}` }] };
    }
    const url = this.getApiUrl(phoneNumberId);
    const data: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
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

    // Format action sections
    const formattedSections = sections.map((sec) => ({
      title: sec.title.substring(0, 24), // Meta limits section title to 24 chars
      rows: sec.rows.map((row) => ({
        id: row.id,
        title: row.title.substring(0, 24), // Meta limits row title to 24 chars
        description: row.description ? row.description.substring(0, 72) : undefined, // Meta limits desc to 72 chars
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

    // Check if mediaUrlOrId is a URL or a Meta Media ID
    const isUrl = mediaUrlOrId.startsWith("http://") || mediaUrlOrId.startsWith("https://");

    const mediaObject: any = {};
    if (isUrl) {
      mediaObject.link = mediaUrlOrId;
    } else {
      mediaObject.id = mediaUrlOrId;
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

    const response = await axios.post(url, data, {
      headers: this.getHeaders(accessToken),
    });
    return response.data;
  }
}
