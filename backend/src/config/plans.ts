export interface AnnualPricingConfig {
  code: string;
  name: string;
  tagline: string;
  contractDurationMonths: number; // 12 months full annual contract
  oneTimeBasePrice: number;        // ₹14,999 upfront for full year
  emiMonthlyAmount: number;        // ₹3,000 / month
  emiCompulsoryMonths: number;     // 2 months upfront for activation (₹6,000)
  emiRemainingMonths: number;      // 10 remaining monthly installments
  gstPercentage: number;           // 18% applied at checkout / invoice
  addOnChannelPrice: number;       // ₹2,000 per extra connected channel
  features: string[];
  enabledModules: string[];
  highlight?: string;
  badge?: string;
}

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

export const SUBSCRIPTION_PLANS: Record<string, AnnualPricingConfig> = {
  all_in_one: {
    code: "all_in_one",
    name: "Jisnu CRM Complete Annual Suite",
    tagline: "Always a full 1-year contract. Choose one-time upfront payment or flexible monthly EMI.",
    contractDurationMonths: 12,
    oneTimeBasePrice: 14999,
    emiMonthlyAmount: 3000,
    emiCompulsoryMonths: 2,
    emiRemainingMonths: 10,
    gstPercentage: 18,
    addOnChannelPrice: 2000,
    badge: "1-Year Plan",
    highlight: "All 12+ Modules Included",
    features: [
      "Complete 1-Year Access to All Modules (WhatsApp, Google Ads, Meta Ads, Reviews, Instagram, YouTube, Gmail & more)",
      "Official 1-Click Embedded Meta WhatsApp Cloud API signup & connect",
      "1-Click Google Ads & Campaign Manager with AI creative builder",
      "1-Click Meta (Facebook & Instagram) Direct Page & Ad Account connect",
      "Google Business Profile 1-Click sync for reviews, posts & questions",
      "Visual drag-and-drop chatbot builder with multi-agent unified team inbox",
      "Bring Any LLM Key: Connect your OpenAI, Gemini, or Claude key for infinite, private AI generations & chatbot conversations",
      "1 Primary Connection included for each channel",
      "Multi-Channel Scaling: Add any extra WhatsApp number, YouTube channel, or ad account anytime at ₹2,000 / account"
    ],
    enabledModules: ALL_CRM_MODULES
  }
};
