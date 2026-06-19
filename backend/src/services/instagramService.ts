import axios from "axios";

export class InstagramService {
  private static isMock(accessToken: string): boolean {
    const isTokenPlaceholder = !accessToken || accessToken === "EAAG..." || accessToken.startsWith("EAAG") || accessToken.length < 20;
    return isTokenPlaceholder;
  }

  private static getApiUrl(): string {
    return "https://graph.facebook.com/v19.0/me/messages";
  }

  private static getHeaders(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
  }

  // Send Text DM
  public static async sendTextMessage(
    accessToken: string,
    to: string,
    text: string
  ) {
    if (this.isMock(accessToken)) {
      console.log(`[MOCK INSTAGRAM SEND TEXT] to ${to}: "${text}"`);
      return { recipient_id: to, message_id: `mock_ig_msg_${Math.random().toString(36).substring(7)}` };
    }
    const url = this.getApiUrl();
    const data = {
      recipient: { id: to },
      message: { text },
    };

    const response = await axios.post(url, data, {
      headers: this.getHeaders(accessToken),
    });
    return response.data;
  }

  // Send Quick Reply Buttons (Max 13 options)
  public static async sendQuickReplyMessage(
    accessToken: string,
    to: string,
    text: string,
    buttons: { id: string; title: string }[]
  ) {
    if (this.isMock(accessToken)) {
      console.log(`[MOCK INSTAGRAM SEND BUTTONS] to ${to}: "${text}" [${buttons.map(b => b.title).join(", ")}]`);
      return { recipient_id: to, message_id: `mock_ig_msg_${Math.random().toString(36).substring(7)}` };
    }
    const url = this.getApiUrl();

    // Map buttons to Meta Quick Replies format
    const quickReplies = buttons.slice(0, 13).map((btn) => ({
      content_type: "text",
      title: btn.title.substring(0, 20), // Meta limits quick reply title to 20 chars
      payload: btn.id,
    }));

    const data = {
      recipient: { id: to },
      message: {
        text,
        quick_replies: quickReplies,
      },
    };

    const response = await axios.post(url, data, {
      headers: this.getHeaders(accessToken),
    });
    return response.data;
  }

  // Send Media Message (Image, Video, Audio, Document)
  public static async sendMediaMessage(
    accessToken: string,
    to: string,
    mediaType: "image" | "video" | "audio" | "document",
    mediaUrl: string,
    filename?: string,
    caption?: string
  ) {
    if (this.isMock(accessToken)) {
      console.log(`[MOCK INSTAGRAM SEND MEDIA] to ${to}: Type: "${mediaType}" - Url: "${mediaUrl}"${caption ? ` - Caption: "${caption}"` : ""}`);
      return { recipient_id: to, message_id: `mock_ig_msg_${Math.random().toString(36).substring(7)}` };
    }
    const url = this.getApiUrl();

    // Map "document" to "file" since Meta uses "file" for documents/PDFs on IG
    const type = mediaType === "document" ? "file" : mediaType;

    const data = {
      recipient: { id: to },
      message: {
        attachment: {
          type,
          payload: {
            url: mediaUrl,
            is_reusable: true,
          },
        },
      },
    };

    const response = await axios.post(url, data, {
      headers: this.getHeaders(accessToken),
    });

    // Instagram does not support inline captions. Send caption as a follow-up message if present.
    if (caption) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Natural padding delay
        await this.sendTextMessage(accessToken, to, caption);
      } catch (err: any) {
        console.error(`Failed to send follow-up caption message to ${to}:`, err.message);
      }
    }

    return response.data;
  }
}
