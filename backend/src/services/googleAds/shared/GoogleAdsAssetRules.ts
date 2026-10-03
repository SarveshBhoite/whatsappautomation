/**
 * Google Ads Asset Rules Matrix (Display, Performance Max, Demand Gen, etc.)
 * Centralized configuration to prevent campaign type rule mixing and leakage.
 */

export interface ImageAssetDimensionSpec {
  ratio: number;
  ratioLabel: string;
  recommendedWidth: number;
  recommendedHeight: number;
  minWidth: number;
  minHeight: number;
  maxFileSizeMB: number;
  tolerance: number; // e.g. 0.08 for 1.91, 0.05 for 1.0, 0.15 for 4:1
}

export interface CampaignAssetRules {
  campaignType: string;
  images: Record<string, ImageAssetDimensionSpec>;
  logos: Record<string, ImageAssetDimensionSpec>;
}

export const GOOGLE_ADS_ASSET_RULES: Record<string, CampaignAssetRules> = {
  DISPLAY: {
    campaignType: "DISPLAY",
    images: {
      landscape: {
        ratio: 1.91,
        ratioLabel: "1.91:1",
        recommendedWidth: 1200,
        recommendedHeight: 628,
        minWidth: 600,
        minHeight: 314,
        maxFileSizeMB: 5,
        tolerance: 0.08
      },
      square: {
        ratio: 1.0,
        ratioLabel: "1:1",
        recommendedWidth: 1200,
        recommendedHeight: 1200,
        minWidth: 300,
        minHeight: 300,
        maxFileSizeMB: 5,
        tolerance: 0.05
      }
    },
    logos: {
      square: {
        ratio: 1.0,
        ratioLabel: "1:1",
        recommendedWidth: 1200,
        recommendedHeight: 1200,
        minWidth: 128,
        minHeight: 128,
        maxFileSizeMB: 5,
        tolerance: 0.05
      },
      landscape: {
        ratio: 4.0,
        ratioLabel: "4:1",
        recommendedWidth: 1200,
        recommendedHeight: 300,
        minWidth: 512,
        minHeight: 128,
        maxFileSizeMB: 5,
        tolerance: 0.2
      }
    }
  },
  PERFORMANCE_MAX: {
    campaignType: "PERFORMANCE_MAX",
    images: {
      landscape: {
        ratio: 1.91,
        ratioLabel: "1.91:1",
        recommendedWidth: 1200,
        recommendedHeight: 628,
        minWidth: 600,
        minHeight: 314,
        maxFileSizeMB: 5,
        tolerance: 0.08
      },
      square: {
        ratio: 1.0,
        ratioLabel: "1:1",
        recommendedWidth: 1200,
        recommendedHeight: 1200,
        minWidth: 300,
        minHeight: 300,
        maxFileSizeMB: 5,
        tolerance: 0.05
      },
      portrait: {
        ratio: 0.8,
        ratioLabel: "4:5",
        recommendedWidth: 960,
        recommendedHeight: 1200,
        minWidth: 480,
        minHeight: 600,
        maxFileSizeMB: 5,
        tolerance: 0.05
      },
      story: {
        ratio: 9 / 16,
        ratioLabel: "9:16",
        recommendedWidth: 1080,
        recommendedHeight: 1920,
        minWidth: 600,
        minHeight: 1067,
        maxFileSizeMB: 5,
        tolerance: 0.06
      }
    },
    logos: {
      square: {
        ratio: 1.0,
        ratioLabel: "1:1",
        recommendedWidth: 1200,
        recommendedHeight: 1200,
        minWidth: 128,
        minHeight: 128,
        maxFileSizeMB: 5,
        tolerance: 0.05
      },
      landscape: {
        ratio: 4.0,
        ratioLabel: "4:1",
        recommendedWidth: 1200,
        recommendedHeight: 300,
        minWidth: 512,
        minHeight: 128,
        maxFileSizeMB: 5,
        tolerance: 0.2
      }
    }
  },
  DEMAND_GEN: {
    campaignType: "DEMAND_GEN",
    images: {
      landscape: {
        ratio: 1.91,
        ratioLabel: "1.91:1",
        recommendedWidth: 1200,
        recommendedHeight: 628,
        minWidth: 600,
        minHeight: 314,
        maxFileSizeMB: 5,
        tolerance: 0.08
      },
      square: {
        ratio: 1.0,
        ratioLabel: "1:1",
        recommendedWidth: 1200,
        recommendedHeight: 1200,
        minWidth: 300,
        minHeight: 300,
        maxFileSizeMB: 5,
        tolerance: 0.05
      },
      portrait: {
        ratio: 0.8,
        ratioLabel: "4:5",
        recommendedWidth: 960,
        recommendedHeight: 1200,
        minWidth: 480,
        minHeight: 600,
        maxFileSizeMB: 5,
        tolerance: 0.05
      },
      story: {
        ratio: 9 / 16,
        ratioLabel: "9:16",
        recommendedWidth: 1080,
        recommendedHeight: 1920,
        minWidth: 600,
        minHeight: 1067,
        maxFileSizeMB: 5,
        tolerance: 0.06
      }
    },
    logos: {
      square: {
        ratio: 1.0,
        ratioLabel: "1:1",
        recommendedWidth: 1200,
        recommendedHeight: 1200,
        minWidth: 128,
        minHeight: 128,
        maxFileSizeMB: 5,
        tolerance: 0.05
      }
    }
  }
};

export interface AssetValidationResult {
  isValid: boolean;
  type: "IMAGE" | "LOGO";
  format?: string; // "landscape" | "square" | etc.
  ratioLabel?: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a single image or logo asset against specific campaign rules.
 * Does NOT force exact recommended dimensions; validates aspect ratio tolerance,
 * minimum dimensions, and file size (max 5 MB).
 */
export function validateCampaignAsset(
  campaignType: string,
  assetType: "IMAGE" | "LOGO",
  params: {
    width?: number;
    height?: number;
    fileSizeBytes?: number;
    mimeType?: string;
    aspectRatio?: string;
  }
): AssetValidationResult {
  const cType = (campaignType || "DISPLAY").toUpperCase();
  const ruleSet = GOOGLE_ADS_ASSET_RULES[cType] || GOOGLE_ADS_ASSET_RULES.DISPLAY;
  const pool = assetType === "LOGO" ? ruleSet.logos : ruleSet.images;

  const errors: string[] = [];
  const warnings: string[] = [];

  const w = Number(params.width || 0);
  const h = Number(params.height || 0);
  const sizeBytes = Number(params.fileSizeBytes || 0);
  const maxBytes = 5 * 1024 * 1024; // 5 MB

  if (sizeBytes > maxBytes) {
    errors.push(`File size ${(sizeBytes / (1024 * 1024)).toFixed(1)} MB exceeds maximum allowed 5 MB.`);
  }

  if (params.mimeType) {
    const validMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validMimes.includes(params.mimeType.toLowerCase())) {
      errors.push(`Unsupported file format "${params.mimeType}". Allowed: JPG, PNG, GIF, WEBP.`);
    }
  }

  // If explicit width/height available
  if (w > 0 && h > 0) {
    const actualRatio = w / h;

    // Find closest matching format in pool
    let matchedFormat: string | null = null;
    let matchedSpec: ImageAssetDimensionSpec | null = null;
    let minRatioDiff = Infinity;

    for (const [fmtKey, spec] of Object.entries(pool)) {
      const diff = Math.abs(actualRatio - spec.ratio);
      if (diff <= spec.tolerance) {
        if (diff < minRatioDiff) {
          minRatioDiff = diff;
          matchedFormat = fmtKey;
          matchedSpec = spec;
        }
      }
    }

    if (!matchedSpec || !matchedFormat) {
      const allowedRatios = Object.values(pool).map(s => s.ratioLabel).join(", ");
      errors.push(
        `Aspect ratio (${actualRatio.toFixed(2)}:1, ${w}×${h}px) is invalid for ${cType} ${assetType.toLowerCase()}. Allowed ratios: ${allowedRatios}.`
      );
      return {
        isValid: false,
        type: assetType,
        width: w,
        height: h,
        fileSizeBytes: sizeBytes,
        errors,
        warnings
      };
    }

    // Check minimum dimensions
    if (w < matchedSpec.minWidth || h < matchedSpec.minHeight) {
      errors.push(
        `${matchedSpec.ratioLabel} ${assetType.toLowerCase()} minimum dimensions are ${matchedSpec.minWidth}×${matchedSpec.minHeight}px (uploaded: ${w}×${h}px).`
      );
    }

    // Warnings for creative quality / lower resolution
    if (w < matchedSpec.recommendedWidth * 0.8 || h < matchedSpec.recommendedHeight * 0.8) {
      warnings.push(`Image dimensions (${w}×${h}px) are below recommended ${matchedSpec.recommendedWidth}×${matchedSpec.recommendedHeight}px for highest crispness.`);
    }

    return {
      isValid: errors.length === 0,
      type: assetType,
      format: matchedFormat,
      ratioLabel: matchedSpec.ratioLabel,
      width: w,
      height: h,
      fileSizeBytes: sizeBytes,
      errors,
      warnings
    };
  }

  // Fallback if dimensions could not be read
  return {
    isValid: errors.length === 0,
    type: assetType,
    fileSizeBytes: sizeBytes,
    errors,
    warnings
  };
}
