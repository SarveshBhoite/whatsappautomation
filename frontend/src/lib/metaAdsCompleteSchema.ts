/**
 * Meta Ads Marketing API Complete Schema & Blueprint
 * Strictly aligned with Meta Marketing Graph API v22.0 / v26.0 (ODAX Framework)
 * Provides full type definitions, parameter constraints, conversion dependencies,
 * and AI prompting instructions for 100% fidelity with Meta Ads Manager.
 */

export interface MetaSpecialAdCategoryOption {
  id: "NONE" | "HOUSING" | "EMPLOYMENT" | "CREDIT" | "ISSUES_ELECTIONS_POLITICS";
  label: string;
  description: string;
}

export const SPECIAL_AD_CATEGORIES: MetaSpecialAdCategoryOption[] = [
  { id: "NONE", label: "None / Not Applicable", description: "Standard business, products, services and ecommerce ads." },
  { id: "HOUSING", label: "Housing", description: "Ads for real estate listings, homeowners insurance, mortgage loans or other related opportunities." },
  { id: "EMPLOYMENT", label: "Employment", description: "Ads for job offers, internships, professional certification programs or related employment opportunities." },
  { id: "CREDIT", label: "Credit", description: "Ads for credit card offers, auto loans, personal or business loans or other financial lending opportunities." },
  { id: "ISSUES_ELECTIONS_POLITICS", label: "Social Issues, Elections or Politics", description: "Ads about social issues, elections, candidates or political figures." },
];

export interface MetaCampaignObjectiveDef {
  id: "OUTCOME_LEADS" | "OUTCOME_SALES" | "OUTCOME_TRAFFIC" | "OUTCOME_ENGAGEMENT" | "OUTCOME_AWARENESS" | "OUTCOME_APP_PROMOTION";
  name: string;
  shortDesc: string;
  longDesc: string;
  tags: string[];
  conversionLocations: {
    id: string;
    type?: "MULTIPLE" | "SINGLE";
    isRecommended?: boolean;
    label: string;
    description: string;
    optimizationGoals: { id: string; label: string; default?: boolean }[];
    billingEvents: string[];
    requiredFields: string[];
  }[];
}

export const META_CAMPAIGN_OBJECTIVES: Record<string, MetaCampaignObjectiveDef> = {
  OUTCOME_LEADS: {
    id: "OUTCOME_LEADS",
    name: "Leads",
    shortDesc: "Collect leads for your business via instant forms, WhatsApp or Messenger.",
    longDesc: "Find people willing to share their contact information and other details by submitting a form or starting a conversation.",
    tags: ["Instant forms", "Messenger & WhatsApp", "Website", "Calls"],
    conversionLocations: [
      // Multiple Destinations (Meta dynamic routing)
      {
        id: "WEBSITE_AND_INSTANT_FORMS",
        type: "MULTIPLE",
        label: "Website and instant forms",
        description: "Send people where they're most likely to convert, between your website and instant forms.",
        optimizationGoals: [
          { id: "LEAD_GENERATION", label: "Maximize number of leads", default: true },
          { id: "OFFSITE_CONVERSIONS", label: "Maximize conversion leads" }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["facebookPageId", "leadGenFormId", "pixelId", "websiteUrl"]
      },
      {
        id: "WEBSITE_AND_CALLS",
        type: "MULTIPLE",
        label: "Website and calls",
        description: "Send people where they're most likely to convert, between your website and phone calls.",
        optimizationGoals: [
          { id: "LEAD_GENERATION", label: "Maximize number of leads", default: true }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["pixelId", "websiteUrl", "phoneNumber"]
      },
      {
        id: "INSTANT_FORMS_AND_MESSENGER",
        type: "MULTIPLE",
        label: "Instant forms and Messenger",
        description: "Send people where they're most likely to convert, between instant forms and Messenger chats.",
        optimizationGoals: [
          { id: "LEAD_GENERATION", label: "Maximize number of leads", default: true }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["facebookPageId", "leadGenFormId", "chatGreeting"]
      },
      // Single Destinations
      {
        id: "WEBSITE",
        type: "SINGLE",
        label: "Website",
        description: "Direct people to your website to submit a contact form or request a quote.",
        optimizationGoals: [
          { id: "OFFSITE_CONVERSIONS", label: "Maximize conversions on website", default: true },
          { id: "LANDING_PAGE_VIEWS", label: "Maximize landing page views" }
        ],
        billingEvents: ["IMPRESSIONS", "LINK_CLICKS"],
        requiredFields: ["pixelId", "customEventType", "websiteUrl"]
      },
      {
        id: "INSTANT_FORMS",
        type: "SINGLE",
        label: "Instant forms",
        isRecommended: true,
        description: "Generate leads by asking people to fill out a form on Facebook and Instagram.",
        optimizationGoals: [
          { id: "LEAD_GENERATION", label: "Maximize number of leads", default: true },
          { id: "QUALITY_LEAD", label: "Maximize conversion leads (quality leads)" }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["facebookPageId", "leadGenFormId"]
      },
      {
        id: "MESSENGER",
        type: "SINGLE",
        label: "Messenger",
        description: "Generate leads by encouraging people to send a message on Messenger.",
        optimizationGoals: [
          { id: "CONVERSATIONS", label: "Maximize number of conversations", default: true },
          { id: "LEAD_GENERATION", label: "Maximize leads in messaging" }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["facebookPageId", "chatGreeting"]
      },
      {
        id: "INSTAGRAM",
        type: "SINGLE",
        label: "Instagram",
        description: "Generate leads by encouraging people to send a direct message on Instagram.",
        optimizationGoals: [
          { id: "CONVERSATIONS", label: "Maximize number of conversations", default: true }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["instagramAccountId"]
      },
      {
        id: "WHATSAPP",
        type: "SINGLE",
        label: "WhatsApp",
        description: "Generate leads by encouraging people to chat with your business on WhatsApp.",
        optimizationGoals: [
          { id: "CONVERSATIONS", label: "Maximize number of conversations", default: true }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["whatsappPhone"]
      },
      {
        id: "CALLS",
        type: "SINGLE",
        label: "Calls",
        description: "Encourage people to call your business by displaying a phone call button on the ad.",
        optimizationGoals: [
          { id: "LINK_CLICKS", label: "Maximize number of calls", default: true }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["phoneNumber", "callCountryCode"]
      },
      {
        id: "APP",
        type: "SINGLE",
        label: "App",
        description: "Direct people to your mobile app to generate in-app leads and actions.",
        optimizationGoals: [
          { id: "APP_INSTALLS", label: "Maximize app installs", default: true },
          { id: "OFFSITE_CONVERSIONS", label: "Maximize in-app lead actions" }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["applicationId", "objectStoreUrl"]
      }
    ]
  },
  OUTCOME_SALES: {
    id: "OUTCOME_SALES",
    name: "Sales",
    shortDesc: "Find people likely to purchase your products or services.",
    longDesc: "Drive sales, purchases, subscriptions, or catalog orders on your website, app, or via direct messaging.",
    tags: ["Conversions", "Catalog sales", "Messenger, Instagram & WhatsApp", "Calls"],
    conversionLocations: [
      {
        id: "WEBSITE",
        label: "Website",
        description: "Drive sales and purchases on your e-commerce website.",
        optimizationGoals: [
          { id: "OFFSITE_CONVERSIONS", label: "Maximize number of conversions (Purchase/Add to Cart)", default: true },
          { id: "VALUE", label: "Maximize value of conversions (ROAS)" }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["pixelId", "conversionEvent", "websiteUrl"]
      },
      {
        id: "MESSAGING_APPS",
        label: "Messenger, Instagram & WhatsApp",
        description: "Drive sales through direct chat conversations.",
        optimizationGoals: [
          { id: "CONVERSATIONS", label: "Maximize conversations started", default: true }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["facebookPageId", "whatsappPhone"]
      }
    ]
  },
  OUTCOME_TRAFFIC: {
    id: "OUTCOME_TRAFFIC",
    name: "Traffic",
    shortDesc: "Send people to a destination like your website, app or WhatsApp.",
    longDesc: "Increase visits to your landing pages, blog posts, e-commerce stores, or WhatsApp channel.",
    tags: ["Link clicks", "Landing page views", "Messenger and WhatsApp", "Calls"],
    conversionLocations: [
      {
        id: "WEBSITE",
        label: "Website",
        description: "Send people to your website, blog, or landing page.",
        optimizationGoals: [
          { id: "LINK_CLICKS", label: "Maximize link clicks", default: true },
          { id: "LANDING_PAGE_VIEWS", label: "Maximize landing page views" }
        ],
        billingEvents: ["IMPRESSIONS", "LINK_CLICKS"],
        requiredFields: ["websiteUrl"]
      },
      {
        id: "MESSAGING_APPS",
        label: "Messenger & WhatsApp",
        description: "Direct traffic to start a chat with your business.",
        optimizationGoals: [
          { id: "LINK_CLICKS", label: "Maximize clicks to Messenger/WhatsApp", default: true }
        ],
        billingEvents: ["IMPRESSIONS", "LINK_CLICKS"],
        requiredFields: ["facebookPageId", "whatsappPhone"]
      },
      {
        id: "CALLS",
        label: "Calls",
        description: "Get more phone call clicks directly from mobile feeds.",
        optimizationGoals: [
          { id: "LINK_CLICKS", label: "Maximize call clicks", default: true }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["phoneNumber"]
      }
    ]
  },
  OUTCOME_ENGAGEMENT: {
    id: "OUTCOME_ENGAGEMENT",
    name: "Engagement",
    shortDesc: "Get more WhatsApp messages, video views, or page likes.",
    longDesc: "Increase interactions with your content, get more message responses, video views, or event responses.",
    tags: ["Messenger, Instagram and WhatsApp", "Video views", "Post engagement", "Page likes"],
    conversionLocations: [
      {
        id: "ON_AD",
        label: "On your ad (Video views & Post Engagement)",
        description: "Get people to watch your video, like, comment on or share your post.",
        optimizationGoals: [
          { id: "THRUPLAY", label: "ThruPlay (maximize complete video plays)", default: true },
          { id: "POST_ENGAGEMENT", label: "Maximize post engagement (likes, shares, comments)" }
        ],
        billingEvents: ["IMPRESSIONS", "THRUPLAY"],
        requiredFields: ["mediaUrl"]
      },
      {
        id: "MESSAGING_APPS",
        label: "Messaging apps",
        description: "Encourage people to start conversations on WhatsApp, Instagram DM or Messenger.",
        optimizationGoals: [
          { id: "CONVERSATIONS", label: "Maximize conversations started", default: true }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["facebookPageId"]
      }
    ]
  },
  OUTCOME_AWARENESS: {
    id: "OUTCOME_AWARENESS",
    name: "Awareness",
    shortDesc: "Show your ads to people most likely to remember them.",
    longDesc: "Maximize your brand reach, ad recall, or localized physical store awareness.",
    tags: ["Reach", "Brand awareness", "Video views", "Store location awareness"],
    conversionLocations: [
      {
        id: "REACH_IMPRESSIONS",
        label: "Maximize reach and impressions",
        description: "Show your ad to the maximum number of unique people in your audience.",
        optimizationGoals: [
          { id: "REACH", label: "Maximize reach of ads", default: true },
          { id: "IMPRESSIONS", label: "Maximize number of impressions" },
          { id: "AD_RECALL_LIFT", label: "Maximize ad recall lift" }
        ],
        billingEvents: ["IMPRESSIONS"],
        requiredFields: ["facebookPageId", "mediaUrl"]
      }
    ]
  },
  OUTCOME_APP_PROMOTION: {
    id: "OUTCOME_APP_PROMOTION",
    name: "App promotion",
    shortDesc: "Find new people to install and use your mobile app.",
    longDesc: "Increase app installs, registration, and in-app purchases on Google Play Store or iOS App Store.",
    tags: ["App installs", "App events"],
    conversionLocations: [
      {
        id: "APP_STORE",
        label: "Google Play Store / iOS App Store",
        description: "Send people to the store to download or perform in-app events.",
        optimizationGoals: [
          { id: "APP_INSTALLS", label: "Maximize number of app installs", default: true },
          { id: "OFFSITE_CONVERSIONS", label: "Maximize in-app events" }
        ],
        billingEvents: ["IMPRESSIONS", "APP_INSTALLS"],
        requiredFields: ["applicationId", "objectStoreUrl"]
      }
    ]
  }
};

export const META_BID_STRATEGIES = [
  {
    id: "LOWEST_COST_WITHOUT_CAP",
    label: "Highest volume (Recommended)",
    description: "Get the most results for your budget automatically with Meta's lowest-cost bidding algorithm."
  },
  {
    id: "COST_CAP",
    label: "Cost per result goal (Cost Cap)",
    description: "Aim for a specific cost per lead / conversion while maximizing volume."
  },
  {
    id: "LOWEST_COST_WITH_BID_CAP",
    label: "Bid cap",
    description: "Set the maximum amount you're willing to bid in any individual auction."
  }
];

export const META_CALL_TO_ACTION_OPTIONS = [
  { id: "SIGN_UP", label: "Sign Up" },
  { id: "SEND_WHATSAPP_MESSAGE", label: "Send WhatsApp Message" },
  { id: "LEARN_MORE", label: "Learn More" },
  { id: "GET_QUOTE", label: "Get Quote" },
  { id: "CONTACT_US", label: "Contact Us" },
  { id: "BOOK_NOW", label: "Book Now" },
  { id: "APPLY_NOW", label: "Apply Now" },
  { id: "SHOP_NOW", label: "Shop Now" },
  { id: "DOWNLOAD", label: "Download" },
  { id: "CALL_NOW", label: "Call Now" }
];

export const META_MANUAL_PLACEMENTS_SCHEMA = {
  publisher_platforms: [
    { id: "facebook", label: "Facebook" },
    { id: "instagram", label: "Instagram" },
    { id: "audience_network", label: "Audience Network" },
    { id: "messenger", label: "Messenger" }
  ],
  facebook_positions: [
    { id: "feed", label: "Facebook Feed" },
    { id: "story", label: "Facebook Stories" },
    { id: "marketplace", label: "Facebook Marketplace" },
    { id: "video_feeds", label: "Facebook Video Feeds" },
    { id: "right_hand_column", label: "Right Column (Desktop)" },
    { id: "search", label: "Facebook Search Results" }
  ],
  instagram_positions: [
    { id: "stream", label: "Instagram Feed" },
    { id: "story", label: "Instagram Stories" },
    { id: "reels", label: "Instagram Reels" },
    { id: "explore", label: "Instagram Explore" },
    { id: "explore_grid", label: "Instagram Explore Grid" }
  ],
  device_platforms: [
    { id: "mobile", label: "Mobile devices" },
    { id: "desktop", label: "Desktop computers" }
  ]
};
