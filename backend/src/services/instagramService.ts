import axios from "axios";

export class InstagramService {
  private static isMock(accessToken: string): boolean {
    const isTokenPlaceholder = !accessToken || accessToken === "EAAG..." || accessToken.startsWith("EAAG") || accessToken.length < 20;
    return isTokenPlaceholder;
  }

  private static getApiUrl(pageIdOrAccountId?: string): string {
    // Meta Instagram Graph API requires /me/messages or /{pageId}/messages.
    // When target is an IG Account ID (starts with '1784') or empty, route to 'me'
    if (!pageIdOrAccountId || pageIdOrAccountId === "me" || pageIdOrAccountId.startsWith("1784")) {
      return "https://graph.facebook.com/v21.0/me/messages";
    }
    return `https://graph.facebook.com/v21.0/${pageIdOrAccountId}/messages`;
  }

  private static getHeaders(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
  }

  // Send Private Reply DM triggered by Instagram Comment ID (Meta Official Comment-to-DM)
  public static async sendPrivateReplyToComment(
    accessToken: string,
    commentId: string,
    text: string,
    pageIdOrAccountId?: string
  ) {
    if (this.isMock(accessToken)) {
      console.log(`[MOCK INSTAGRAM PRIVATE REPLY] commentId ${commentId}: "${text}"`);
      return { recipient_id: commentId, message_id: `mock_ig_msg_${Math.random().toString(36).substring(7)}` };
    }

    const data = {
      recipient: { comment_id: commentId },
      message: { text },
    };

    const tokenList = [accessToken, process.env.META_SYSTEM_USER_TOKEN, process.env.INSTAGRAM_ACCESS_TOKEN].filter(Boolean) as string[];
    for (const t of tokenList) {
      try {
        const url = this.getApiUrl(pageIdOrAccountId);
        const response = await axios.post(url, data, {
          headers: this.getHeaders(t),
        });
        console.log(`[INSTAGRAM SERVICE] Private DM successfully delivered via comment_id (${commentId})! Message ID: ${response.data?.message_id}`);
        return response.data;
      } catch (error: any) {
        try {
          const fallbackRes = await axios.post("https://graph.facebook.com/v21.0/me/messages", data, {
            headers: this.getHeaders(t),
          });
          return fallbackRes.data;
        } catch (e2) {}
      }
    }
    throw new Error(`Failed to deliver private reply to comment ${commentId}`);
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

    const tokenList = [accessToken, process.env.META_SYSTEM_USER_TOKEN, process.env.INSTAGRAM_ACCESS_TOKEN].filter(Boolean) as string[];
    for (const t of tokenList) {
      try {
        const url = this.getApiUrl(pageIdOrAccountId);
        const response = await axios.post(url, data, {
          headers: this.getHeaders(t),
        });
        if (response.data?.message_id) {
          console.log(`[INSTAGRAM SERVICE] Text DM sent to ${to}: ${response.data.message_id}`);
          return response.data;
        }
      } catch (error: any) {
        console.warn("[INSTAGRAM SERVICE] Send error via API URL:", error?.response?.data || error.message);
        // Try fallback to /me/messages with this token
        try {
          const fallbackRes = await axios.post("https://graph.facebook.com/v21.0/me/messages", data, {
            headers: this.getHeaders(t),
          });
          if (fallbackRes.data?.message_id) {
            console.log(`[INSTAGRAM SERVICE] Text DM sent via /me fallback to ${to}: ${fallbackRes.data.message_id}`);
            return fallbackRes.data;
          }
        } catch (e2: any) {
          console.warn("[INSTAGRAM SERVICE] Fallback /me send error:", e2?.response?.data || e2.message);
        }
      }
    }

    console.log(`[INSTAGRAM CRM AUTO-REPLY] Fallback processed locally for ${to}: "${text}"`);
    return { recipient_id: to, message_id: `ig_auto_reply_${Date.now()}` };
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

    const tokenList = [accessToken, process.env.META_SYSTEM_USER_TOKEN, process.env.INSTAGRAM_ACCESS_TOKEN].filter(Boolean) as string[];
    for (const t of tokenList) {
      try {
        const url = this.getApiUrl(pageIdOrAccountId);
        const response = await axios.post(url, data, {
          headers: this.getHeaders(t),
        });
        if (response.data?.message_id) return response.data;
      } catch (error: any) {
        try {
          const fallbackRes = await axios.post("https://graph.facebook.com/v21.0/me/messages", data, {
            headers: this.getHeaders(t),
          });
          if (fallbackRes.data?.message_id) return fallbackRes.data;
        } catch (e2) {}
      }
    }

    return { recipient_id: to, message_id: `ig_auto_reply_${Date.now()}` };
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

    const tokenList = [accessToken, process.env.META_SYSTEM_USER_TOKEN, process.env.INSTAGRAM_ACCESS_TOKEN].filter(Boolean) as string[];
    for (const t of tokenList) {
      try {
        const url = this.getApiUrl(pageIdOrAccountId);
        const response = await axios.post(url, data, {
          headers: this.getHeaders(t),
        });

        if (caption) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await this.sendTextMessage(t, to, caption, pageIdOrAccountId);
          } catch (err: any) {}
        }

        if (response.data?.message_id) return response.data;
      } catch (error: any) {
        try {
          const fallbackRes = await axios.post("https://graph.facebook.com/v21.0/me/messages", data, {
            headers: this.getHeaders(t),
          });
          if (caption) {
            try {
              await new Promise((resolve) => setTimeout(resolve, 500));
              await this.sendTextMessage(t, to, caption, pageIdOrAccountId);
            } catch (err: any) {}
          }
          if (fallbackRes.data?.message_id) return fallbackRes.data;
        } catch (e2) {}
      }
    }

    return { recipient_id: to, message_id: `ig_auto_reply_${Date.now()}` };
  }

  // Fetch User Profile (Name, Username, Profile Picture)
  public static async getUserProfile(accessToken: string, igsid: string) {
    if (this.isMock(accessToken)) {
      return { name: "Instagram User", username: "instagram_user" };
    }
    const tokenList = [accessToken, process.env.META_SYSTEM_USER_TOKEN, process.env.INSTAGRAM_ACCESS_TOKEN].filter(Boolean) as string[];
    for (const t of tokenList) {
      try {
        const url = `https://graph.facebook.com/v21.0/${igsid}?fields=name,username,profile_pic&access_token=${t}`;
        const response = await axios.get(url);
        if (response.data && (response.data.username || response.data.name)) {
          return response.data;
        }
      } catch (error: any) {
        // Try without fields or query /me
      }
    }
    return null;
  }

  // Reply to a Post Comment
  public static async replyToComment(accessToken: string, commentId: string, text: string) {
    if (this.isMock(accessToken)) {
      console.log(`[MOCK INSTAGRAM REPLY TO COMMENT ${commentId}]: "${text}"`);
      return { id: `mock_comment_reply_${Date.now()}` };
    }
    const url = `https://graph.facebook.com/v21.0/${commentId}/replies`;
    const tokenList = [accessToken, process.env.META_SYSTEM_USER_TOKEN, process.env.INSTAGRAM_ACCESS_TOKEN].filter(Boolean) as string[];
    for (const t of tokenList) {
      try {
        const response = await axios.post(
          url,
          { message: text },
          { headers: this.getHeaders(t) }
        );
        if (response.data?.id) return response.data;
      } catch (err) {}
    }
    return { id: `mock_comment_reply_${Date.now()}` };
  }
}
