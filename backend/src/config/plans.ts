export interface SubscriptionPlanConfig {
  code: "annual" | "quarterly" | "half_yearly";
  name: string;
  tagline: string;
  durationMonths: number;
  basePrice: number;
  gstPercentage: number;
  features: string[];
  enabledModules: string[];
  isRecommended?: boolean;
  badge?: string;
  highlight?: string;
}

export const EXTRA_CHANNEL_PRICE = 2000;
export const GST_PERCENTAGE = 18;

export const ALL_CRM_MODULES = [
  "whatsapp",
  "instagram",
  "gmb",
  "gmail",
  "linkedin",
  "youtube",
  "google_ads",
  "meta_ads",
  "reviews",
  "ai_agent",
  "tools",
  "appointments",
  "api_keys",
  "reports"
];

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlanConfig> = {
  annual: {
    code: "annual",
    name: "Annual Plan",
    tagline: "Best value! Maximum savings for full 12-month enterprise automation.",
    durationMonths: 12,
    basePrice: 14999,
    gstPercentage: GST_PERCENTAGE,
    isRecommended: true,
    badge: "Best Value • 1-Year Access",
    highlight: "Recommended by Jisnu",
    features: [
      "Full 12 Months Access to All 12+ Modules (Complete Suite)",
      "1-Click Official Meta WhatsApp Cloud API Integration",
      "1-Click Google Ads & Meta (FB & Instagram) Ads Campaign Manager",
      "Google Business Profile 1-Click Reviews Sync & AI Auto-Reply",
      "Visual Drag-and-Drop Chatbot Builder & Unified Customer Inbox",
      "Bring Any LLM Key: Connect OpenAI, Gemini, or Claude directly",
      "Instagram DM, Comment Auto-Replies & Gmail AI Drafting",
      "Google Calendar Appointment Booking & YouTube Sentiment Sync",
      "1 Primary Connection included for each channel",
      "Multi-Channel Scaling: Add extra channels at ₹2,000 / account"
    ],
    enabledModules: ALL_CRM_MODULES
  }
};
