import axios from "axios";
import { CampaignState } from "./GoogleAdsAiAssistantService";

export interface GeneratedCreativeImage {
  url: string;
  name: string;
  fieldType: "MARKETING_IMAGE" | "SQUARE_MARKETING_IMAGE" | "LOGO";
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

    // If user prompt asks for headlines, descriptions, or general campaign parameters/autofill, do NOT intercept as image-only
    const campaignParamWords = [
      "headline", "headlines", "leadline", "leadlines", "long headline", "long headlines",
      "description", "descriptions", "ad copy", "copy", "keywords", "budget", "per day", "daily",
      "shop name", "business is", "my business", "website is", "start date", "end date",
      "performance max", "search campaign", "sales", "leads", "website traffic",
      "auto fill", "autofill", "all require", "all parameter", "all parameters", "set my campaign"
    ];
    const mentionsCampaignParams = campaignParamWords.some(w => lower.includes(w));

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

    if (mentionsCampaignParams) {
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
    mode: "IMAGE_ONLY" | "LOGO_ONLY" | "ALL"
  ) {
    const brand = bizName || "our brand";
    const context = bizDesc ? `${bizDesc}. ` : "";
    const siteContext = website ? `Official website: ${website}. ` : "";

    const logoStyles = [
      "Modern clean minimalist vector emblem with sophisticated bold typography on a pristine solid background",
      "Sleek 3D geometric corporate badge with vibrant modern gradient accents and clean premium finish",
      "High-end tech company insignia, sharp vector lines, modern negative space aesthetic, solid neutral background",
      "Elegant contemporary brand mark, centered emblem, luxury commercial branding aesthetic, clean and crisp"
    ];
    const selectedLogoStyle = logoStyles[Math.floor(Math.random() * logoStyles.length)];

    const landscapeStyles = [
      "Award-winning commercial advertising photography, hyper-realistic, dynamic studio lighting, vibrant colors, cinematic depth of field",
      "Modern sleek commercial showcase, bright contemporary workspace/environment, authentic high-value interaction, 8k resolution",
      "Premium advertising creative, elegant composition, crisp studio backlighting, striking commercial visual aesthetic",
      "High-converting lifestyle commercial, modern architectural setting, vivid natural lighting, polished professional atmosphere"
    ];
    const selectedLandscapeStyle = landscapeStyles[Math.floor(Math.random() * landscapeStyles.length)];

    const squareStyles = [
      "High-converting square advertising creative, eye-catching commercial layout, ultra-sharp focus, vivid studio lighting",
      "Sleek product and service showcase, bold focal point, vibrant contrasting palette, clean modern composition",
      "Contemporary commercial hero visual, centered subject, luxurious studio reflections, crisp high-definition detail",
      "Dynamic social-ready marketing graphic, modern aesthetic, bright engaging lighting, premium commercial feel"
    ];
    const selectedSquareStyle = squareStyles[Math.floor(Math.random() * squareStyles.length)];

    if (mode === "LOGO_ONLY") {
      return [
        {
          aspectRatio: "1:1" as const,
          dimensions: { width: 1200, height: 1200 },
          fieldType: "LOGO" as const,
          suffix: "Logo (1:1)",
          prompt: `Professional high-resolution brand logo for "${brand}". ${context}${siteContext}${selectedLogoStyle}, square 1:1 format, centered, Google Ads compliant.`
        }
      ];
    }

    if (mode === "IMAGE_ONLY") {
      return [
        {
          aspectRatio: "1.91:1" as const,
          dimensions: { width: 1200, height: 628 },
          fieldType: "MARKETING_IMAGE" as const,
          suffix: "Landscape (1.91:1)",
          prompt: `Commercial advertising photography for "${brand}". ${context}${siteContext}Landscape 1.91:1 aspect ratio. ${selectedLandscapeStyle}, showcasing premium services, Google Ads compliant.`
        },
        {
          aspectRatio: "1:1" as const,
          dimensions: { width: 1200, height: 1200 },
          fieldType: "SQUARE_MARKETING_IMAGE" as const,
          suffix: "Square (1:1)",
          prompt: `Commercial advertising creative for "${brand}". ${context}${siteContext}Square 1:1 aspect ratio. ${selectedSquareStyle}, Google Ads Performance Max and Display ready.`
        }
      ];
    }

    return [
      {
        aspectRatio: "1.91:1" as const,
        dimensions: { width: 1200, height: 628 },
        fieldType: "MARKETING_IMAGE" as const,
        suffix: "Landscape (1.91:1)",
        prompt: `Commercial advertising photography for "${brand}". ${context}${siteContext}Landscape 1.91:1 aspect ratio. ${selectedLandscapeStyle}, showcasing premium services, Google Ads compliant.`
      },
      {
        aspectRatio: "1:1" as const,
        dimensions: { width: 1200, height: 1200 },
        fieldType: "SQUARE_MARKETING_IMAGE" as const,
        suffix: "Square (1:1)",
        prompt: `Commercial advertising creative for "${brand}". ${context}${siteContext}Square 1:1 aspect ratio. ${selectedSquareStyle}, Google Ads Performance Max and Display ready.`
      },
      {
        aspectRatio: "1:1" as const,
        dimensions: { width: 1200, height: 1200 },
        fieldType: "LOGO" as const,
        suffix: "Logo (1:1)",
        prompt: `Professional brand logo for "${brand}". ${context}${siteContext}${selectedLogoStyle}, square 1:1 format, centered, Google Ads display ready.`
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
    const lowerPrompt = userPrompt.toLowerCase();
    const mentionsLogo = lowerPrompt.includes("logo");
    const mentionsImages = lowerPrompt.includes("image") || lowerPrompt.includes("creative") || lowerPrompt.includes("photo") || lowerPrompt.includes("picture");

    let mode: "IMAGE_ONLY" | "LOGO_ONLY" | "ALL" = "ALL";
    if (mentionsLogo && !mentionsImages) {
      mode = "LOGO_ONLY";
    } else if (mentionsImages && !mentionsLogo) {
      mode = "IMAGE_ONLY";
    } else {
      mode = "ALL";
    }

    const bizName = (state.businessName || state.business?.name || "").trim() || "Commercial Business";
    const bizDesc = (state.business?.description || (state as any).productOverview || "").trim();
    const website = (state.website || state.business?.website || "").trim();

    const promptConfigs = this.buildVisualPrompts(bizName, bizDesc, website, mode);
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

      // 2. High-quality visual fallback rendering with randomized seed for creative diversity
      if (!imageUrl) {
        const dynamicSeed = Math.floor(Math.random() * 90000000) + 10000000;
        const encodedPrompt = encodeURIComponent(cfg.prompt.slice(0, 200));
        
        // Use Pollinations.ai ultra-fast state-of-the-art Flux generator with unique dynamic seed
        imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${cfg.dimensions.width}&height=${cfg.dimensions.height}&seed=${dynamicSeed}&nologo=true&enhance=true`;
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
          formData.append("folder", "/google_ads/ai_guided");
          formData.append("tags", `google_ads,ai_generated,${cfg.fieldType.toLowerCase()},${cfg.aspectRatio.replace(":", "x")}`);

          const authHeader = Buffer.from(`${privateKey}:`).toString("base64");
          const ikRes = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
            headers: {
              Authorization: `Basic ${authHeader}`
            },
            timeout: 20000
          });

          if (ikRes.data?.url) {
            finalUrl = ikRes.data.url;
            if (cfg.fieldType === "LOGO" && finalUrl.includes("ik.imagekit.io")) {
              const urlParts = finalUrl.split("ik.imagekit.io/");
              if (urlParts.length === 2) {
                const endpointAndPath = urlParts[1];
                const slashIdx = endpointAndPath.indexOf("/");
                if (slashIdx !== -1) {
                  const ikEndpoint = endpointAndPath.substring(0, slashIdx);
                  const path = endpointAndPath.substring(slashIdx + 1);
                  finalUrl = `https://ik.imagekit.io/${ikEndpoint}/tr:w-500,h-500,fo-auto/${path}`;
                }
              }
            }
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
          fieldType: "LOGO",
          aspectRatio: item.aspectRatio,
          dimensions: item.dimensions
        });
      } else {
        updatedImages.push({
          url: item.url,
          name: item.name,
          fieldType: item.fieldType,
          aspectRatio: item.aspectRatio,
          dimensions: item.dimensions
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
