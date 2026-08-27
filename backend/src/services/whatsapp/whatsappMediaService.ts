import axios from "axios";

export interface MediaValidationResult {
  valid: boolean;
  detectedMimeType?: string;
  sizeBytes?: number;
  error?: string;
}

export interface UploadMediaResult {
  mediaId: string;
  mimeType: string;
}

/**
 * WhatsAppMediaService
 * Dedicated service for Meta WhatsApp media uploads, downloads, MIME inspection, and file size enforcement.
 */
export class WhatsAppMediaService {
  private static readonly MAX_FILE_SIZE_BYTES = 16 * 1024 * 1024; // 16MB standard WhatsApp limit (100MB for docs)

  /**
   * Validates media buffer / stream constraints before dispatch
   */
  public static validateMedia(buffer: Buffer, declaredMimeType?: string): MediaValidationResult {
    if (!buffer || buffer.length === 0) {
      return { valid: false, error: "Media file buffer is empty." };
    }

    if (buffer.length > this.MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        sizeBytes: buffer.length,
        error: `File size (${(buffer.length / (1024 * 1024)).toFixed(2)}MB) exceeds maximum permitted threshold.`,
      };
    }

    // Inspect magic numbers for real MIME detection
    let detectedMime = declaredMimeType || "application/octet-stream";
    if (buffer.length >= 4) {
      if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        detectedMime = "image/jpeg";
      } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        detectedMime = "image/png";
      } else if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
        detectedMime = "application/pdf";
      } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        detectedMime = "image/gif";
      }
    }

    return {
      valid: true,
      detectedMimeType: detectedMime,
      sizeBytes: buffer.length,
    };
  }

  /**
   * Uploads binary media to Meta Graph API for WhatsApp Cloud API
   */
  public static async uploadToMeta(
    phoneNumberId: string,
    accessToken: string,
    fileBuffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<UploadMediaResult> {
    const validation = this.validateMedia(fileBuffer, mimeType);
    if (!validation.valid) {
      throw new Error(`[MEDIA VALIDATION FAILED]: ${validation.error}`);
    }

    const effectiveMime = validation.detectedMimeType || mimeType;
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: effectiveMime });
    formData.append("file", blob, filename);
    formData.append("type", effectiveMime);
    formData.append("messaging_product", "whatsapp");

    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/media`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return {
      mediaId: response.data.id,
      mimeType: effectiveMime,
    };
  }

  /**
   * Downloads binary media directly from Meta Graph API using media ID
   */
  public static async downloadFromMeta(
    mediaId: string,
    accessToken: string
  ): Promise<{ buffer: Buffer; mimeType: string }> {
    // 1. Get media URL
    const metaUrlRes = await axios.get(`https://graph.facebook.com/v21.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const directUrl = metaUrlRes.data.url;
    const mimeType = metaUrlRes.data.mime_type || "application/octet-stream";

    // 2. Download binary stream
    const binaryRes = await axios.get(directUrl, {
      responseType: "arraybuffer",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      buffer: Buffer.from(binaryRes.data),
      mimeType,
    };
  }
}
