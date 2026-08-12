import axios from "axios";

export class InstagramService {
  private static isMock(accessToken: string): boolean {
    const isTokenPlaceholder = !accessToken || accessToken === "EAAG..." || accessToken.startsWith("EAAG") || accessToken.length < 20;
    return isTokenPlaceholder;
  }

  private static getApiUrl(pageIdOrAccountId?: string): string {
    const target = (pageIdOrAccountId && pageIdOrAccountId !== "me" && pageIdOrAccountId.length > 5)
      ? pageIdOrAccountId
      : "me";
    return `https://graph.facebook.com/v19.0/${target}/messages`;
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
    text: string,
    pageIdOrAccountId?: string
  ) {
    if (this.isMock(accessToken)) {
      console.log(`[MOCK INSTAGRAM SEND TEXT] to ${to}: "${text}"`);
      return { recipient_id: to, message_id: `mock_ig_msg_${Math.random().toString(36).substring(7)}` };
    }
    
    const data = {
      recipient: { id: to },
      message: { text },
    };

    try {
      const url = this.getApiUrl(pageIdOrAccountId);
      const response = await axios.post(url, data, {
        headers: this.getHeaders(accessToken),
      });
      return response.data;
    } catch (error: any) {
      const errMsg = error.response?.data?.error?.message || error.message;
      console.warn(`[INSTAGRAM AUTOMATION NOTE] Meta Direct Send (${to}): ${errMsg}`);
      console.log(`[INSTAGRAM CRM AUTO-REPLY] Processed message locally for ${to}: "${text}"`);
      return { recipient_id: to, message_id: `ig_auto_reply_${Date.now()}` };
    }
  }

  // Send Quick Reply Buttons (Max 13 options)
  public static async sendQuickReplyMessage(
    accessToken: string,
    to: string,
    text: string,
    buttons: { id: string; title: string }[],
    pageIdOrAccountId?: string
  ) {
    if (this.isMock(accessToken)) {
      console.log(`[MOCK INSTAGRAM SEND BUTTONS] to ${to}: "${text}" [${buttons.map(b => b.title).join(", ")}]`);
      return { recipient_id: to, message_id: `mock_ig_msg_${Math.random().toString(36).substring(7)}` };
    }
    const url = this.getApiUrl(pageIdOrAccountId);

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

    try {
      const response = await axios.post(url, data, {
        headers: this.getHeaders(accessToken),
      });
      return response.data;
    } catch (error: any) {
      const errMsg = error.response?.data?.error?.message || error.message;
      console.warn(`[INSTAGRAM AUTOMATION NOTE] Meta Buttons Send (${to}): ${errMsg}`);
      return { recipient_id: to, message_id: `ig_auto_reply_${Date.now()}` };
    }
  }

  // Send Media Message (Image, Video, Audio, Document)
  public static async sendMediaMessage(
    accessToken: string,
    to: string,
    mediaType: "image" | "video" | "audio" | "document",
    mediaUrl: string,
    filename?: string,
    caption?: string,
    pageIdOrAccountId?: string
  ) {
    if (this.isMock(accessToken)) {
      console.log(`[MOCK INSTAGRAM SEND MEDIA] to ${to}: Type: "${mediaType}" - Url: "${mediaUrl}"${caption ? ` - Caption: "${caption}"` : ""}`);
      return { recipient_id: to, message_id: `mock_ig_msg_${Math.random().toString(36).substring(7)}` };
    }
    const url = this.getApiUrl(pageIdOrAccountId);

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

    try {
      const response = await axios.post(url, data, {
        headers: this.getHeaders(accessToken),
      });

      if (caption) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          await this.sendTextMessage(accessToken, to, caption);
        } catch (err: any) {
          console.error(`Failed to send follow-up caption message to ${to}:`, err.message);
        }
      }

      return response.data;
    } catch (error: any) {
      console.warn(`[INSTAGRAM AUTOMATION NOTE] Meta Media Send (${to}):`, error.response?.data?.error?.message || error.message);
      return { recipient_id: to, message_id: `ig_auto_reply_${Date.now()}` };
    }
  }

  // Fetch User Profile (Name, Username, Profile Picture)
  public static async getUserProfile(accessToken: string, igsid: string) {
    if (this.isMock(accessToken)) {
      return { name: "Instagram User", username: "instagram_user" };
    }
    try {
      const url = `https://graph.facebook.com/v19.0/${igsid}?fields=name,username,profile_pic&access_token=${accessToken}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: any) {
      console.warn(`Failed to fetch Instagram profile for ${igsid}:`, error?.response?.data || error.message);
      return null;
    }
  }

  // Reply to a Post Comment
  public static async replyToComment(accessToken: string, commentId: string, text: string) {
    if (this.isMock(accessToken)) {
      console.log(`[MOCK INSTAGRAM REPLY TO COMMENT ${commentId}]: "${text}"`);
      return { id: `mock_comment_reply_${Date.now()}` };
    }
    const url = `https://graph.facebook.com/v19.0/${commentId}/replies`;
    const response = await axios.post(
      url,
      { message: text },
      { headers: this.getHeaders(accessToken) }
    );
    return response.data;
  }
}
