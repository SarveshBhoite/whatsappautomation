import axios from "axios";

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
    text: string
  ) {
    const url = this.getApiUrl(phoneNumberId);
    const data = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        preview_url: false,
        body: text,
      },
    };

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
    buttons: ButtonItem[]
  ) {
    const url = this.getApiUrl(phoneNumberId);
    
    // Format buttons for Meta API
    const formattedButtons = buttons.slice(0, 3).map((btn) => ({
      type: "reply",
      reply: {
        id: btn.id,
        title: btn.title.substring(0, 20), // Meta limits button title to 20 chars
      },
    }));

    const data = {
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
    footerText?: string
  ) {
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
    filename?: string
  ) {
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

    const data = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: mediaType,
      [mediaType]: mediaObject,
    };

    const response = await axios.post(url, data, {
      headers: this.getHeaders(accessToken),
    });
    return response.data;
  }
}
