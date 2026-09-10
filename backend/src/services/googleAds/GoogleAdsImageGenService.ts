import axios from "axios";
import { CampaignState } from "./GoogleAdsAiAssistantService";

export interface GeneratedCreativeImage {
  url: string;
  name: string;
  fieldType: "MARKETING_IMAGE" | "LOGO";
  aspectRatio: "1.91:1" | "1:1" | "4:1" | "4:5" | "9:16";
  dimensions: { width: number; height: number };
  prompt: string;
}

export class GoogleAdsImageGenService {
  /**
   * Check if a user message intent is requesting AI Image or Logo Generation
   */
  public static isImageGenRequest(message: string): boolean {
    if (!message || typeof message !== "string") return false;
    const lower = message.toLowerCase();

    // Key phrases indicating user wants image or logo generation
    const actionWords = ["generate", "create", "make", "design", "draw", "produce", "render"];
    const targetWords = ["image", "images", "creative", "creatives", "logo", "logos", "visual", "visuals", "banner", "banners", "ad creative", "ad image", "marketing image", "marketing creative"];

    const hasAction = actionWords.some(w => lower.includes(w));
    const hasTarget = targetWords.some(w => lower.includes(w));

    // If user prompt also asks for headlines, long headlines, or descriptions, let the LLM generate copy and call image generation if needed
    const textCopyWords = ["headline", "headlines", "leadline", "leadlines", "long headline", "description", "descriptions", "ad copy", "copy", "keywords"];
    const mentionsTextCopy = textCopyWords.some(w => lower.includes(w));

    // Also match explicit prompts from the UI buttons
    const explicitPrompts = [
      "generate high-converting marketing creative",
      "generate high-converting marketing creative images",
      "generate marketing creative images",
      "generate a modern, high-resolution google ads business logo",
      "generate a professional google ads logo",
      "generate ad images",
      "create ad images",
      "generate creatives",
      "create creatives",
      "generate logo",
      "create logo"
    ];

    if (explicitPrompts.some(p => lower.includes(p))) {
      return true;
    }

    if (mentionsTextCopy) {
      return false;
    }

    return hasAction && hasTarget;
  }

  /**
   * Refine and generate high-impact visual prompts tailored for Google Ads formats
   */
  private static buildVisualPrompts(
    bizName: string,
    bizDesc: string,
    website: string,
    isLogoOnly: boolean
  ) {
    const brand = bizName || "our brand";
    const context = bizDesc ? `${bizDesc}. ` : "";
    const siteContext = website ? `Official website: ${website}. ` : "";

    if (isLogoOnly) {
      return [
        {
          aspectRatio: "1:1" as const,
          dimensions: { width: 1200, height: 1200 },
          fieldType: "LOGO" as const,
          suffix: "Logo (1:1)",
          prompt: `Professional high-resolution vector brand logo for "${brand}". ${context}${siteContext}Minimalist, clean flat modern typography, vector icon badge on a pure solid clean background, symmetrical, premium tech/commercial branding, highly recognizable on mobile screens and Google Ads.`
        }
      ];
    }

    return [
      {
        aspectRatio: "1.91:1" as const,
        dimensions: { width: 1200, height: 628 },
        fieldType: "MARKETING_IMAGE" as const,
        suffix: "Landscape (1.91:1)",
        prompt: `Award-winning commercial advertising photography for "${brand}". ${context}${siteContext}Landscape 1.91:1 aspect ratio. Hyper-realistic, professional studio lighting, showcasing premium products and services, vibrant commercial aesthetic, modern clean environment, authentic customer engagement, 8k resolution, cinematic depth of field, Google Ads compliant.`
      },
      {
        aspectRatio: "1:1" as const,
        dimensions: { width: 1200, height: 1200 },
        fieldType: "MARKETING_IMAGE" as const,
        suffix: "Square (1:1)",
        prompt: `High-converting square advertising creative for "${brand}". ${context}${siteContext}Square 1:1 aspect ratio. Eye-catching commercial product/service showcase, sleek modern layout, ultra-sharp focus, vivid studio lighting, luxurious aesthetic, Google Ads Performance Max and Display ready.`
      },
      {
        aspectRatio: "1:1" as const,
        dimensions: { width: 1200, height: 1200 },
        fieldType: "LOGO" as const,
        suffix: "Logo (1:1)",
        prompt: `Modern clean vector company logo for "${brand}". ${context}Square 1:1 format, centered emblem with modern typeface on solid clean background, sharp vector edges, premium corporate branding for Google Ads display.`
      }
    ];
  }

  /**
   * Calls xAI / Grok image generation API (or fallback AI image generator) and stores via ImageKit
   */
  public static async generateAdImages(
    userPrompt: string,
    state: CampaignState
  ): Promise<{
    message: string;
    generatedImages: GeneratedCreativeImage[];
    campaignState: CampaignState;
  }> {
    const isLogoOnly = userPrompt.toLowerCase().includes("logo") && !userPrompt.toLowerCase().includes("images") && !userPrompt.toLowerCase().includes("creative");
    const bizName = (state.businessName || state.business?.name || "").trim() || "Commercial Business";
    const bizDesc = (state.business?.description || (state as any).productOverview || "").trim();
    const website = (state.website || state.business?.website || "").trim();

    const promptConfigs = this.buildVisualPrompts(bizName, bizDesc, website, isLogoOnly);
    const results: GeneratedCreativeImage[] = [];

    const grokKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY || "";
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    for (let i = 0; i < promptConfigs.length; i++) {
      const cfg = promptConfigs[i];
      let imageUrl = "";

      // 1. Attempt generation via xAI / Grok Image API if GROK_API_KEY is configured
      if (grokKey) {
        try {
          const grokRes = await axios.post(
            "https://api.x.ai/v1/images/generations",
            {
              model: "grok-2-image-latest",
              prompt: cfg.prompt,
              n: 1,
              response_format: "url"
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${grokKey}`
              },
              timeout: 30000
            }
          );
          if (grokRes.data?.data?.[0]?.url) {
            imageUrl = grokRes.data.data[0].url;
          }
        } catch (xaiErr: any) {
          console.warn(`[GoogleAdsImageGenService] Grok Image API call failed: ${xaiErr?.response?.data?.error?.message || xaiErr.message}`);
        }
      }

      // 2. High-quality visual fallback rendering
      if (!imageUrl) {
        const sanitizedSeed = encodeURIComponent(bizName.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + (cfg.fieldType === "LOGO" ? "logo" : cfg.aspectRatio));
        const encodedPrompt = encodeURIComponent(cfg.prompt.slice(0, 150));
        
        // Use Pollinations.ai ultra-fast state-of-the-art Flux generator
        imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${cfg.dimensions.width}&height=${cfg.dimensions.height}&seed=${sanitizedSeed}&nologo=true&enhance=true`;
      }

      // 3. Upload and persist to ImageKit if configured
      let finalUrl = imageUrl;
      const fileName = `gads_${cfg.fieldType.toLowerCase()}_${cfg.aspectRatio.replace(":", "x")}_${Date.now()}_${i + 1}.png`;

      if (privateKey && imageUrl) {
        try {
          const formData = new FormData();
          formData.append("file", imageUrl);
          formData.append("fileName", fileName);
          formData.append("useUniqueFileName", "true");

          const authHeader = Buffer.from(`${privateKey}:`).toString("base64");
          const ikRes = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
            headers: {
              Authorization: `Basic ${authHeader}`
            },
            timeout: 20000
          });

          if (ikRes.data?.url) {
            finalUrl = ikRes.data.url;
          }
        } catch (ikErr: any) {
          console.warn("[GoogleAdsImageGenService] ImageKit upload warning:", ikErr?.message || ikErr);
        }
      }

      results.push({
        url: finalUrl,
        name: `${bizName} ${cfg.suffix}`,
        fieldType: cfg.fieldType,
        aspectRatio: cfg.aspectRatio,
        dimensions: cfg.dimensions,
        prompt: cfg.prompt
      });
    }

    // Append generated items to CampaignState
    const updatedImages = [...(state.images || [])];
    const updatedLogos = [...(state.logos || [])];

    results.forEach(item => {
      if (item.fieldType === "LOGO") {
        updatedLogos.push({
          url: item.url,
          name: item.name,
          fieldType: "LOGO"
        });
      } else {
        updatedImages.push({
          url: item.url,
          name: item.name,
          fieldType: "MARKETING_IMAGE"
        });
      }
    });

    const updatedState: CampaignState = {
      ...state,
      images: updatedImages,
      logos: updatedLogos
    };

    const countImages = results.filter(r => r.fieldType === "MARKETING_IMAGE").length;
    const countLogos = results.filter(r => r.fieldType === "LOGO").length;

    const message = `🎨 **AI Creative Generation Complete!**\n\nI have generated **${results.length} Google Ads-compliant visual assets** tailored specifically for **${bizName}**${website ? ` (${website})` : ""}.\n\n### 📸 Generated Creatives:\n${results.map(r => `- **${r.name}:** ${r.aspectRatio} (${r.dimensions.width}×${r.dimensions.height}px)`).join("\n")}\n\nAll generated assets have been synced to your **Live Campaign Cockpit**. You can click **"Crop / Edit"** to adjust framing or **"Upload Media"** to add additional assets.`;

    return {
      message,
      generatedImages: results,
      campaignState: updatedState
    };
  }
}
