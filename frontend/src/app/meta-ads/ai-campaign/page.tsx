"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Bot,
  User,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Megaphone,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  DollarSign,
  MapPin,
  Target,
  FileText,
  MessageCircle,
  ExternalLink,
  Globe,
  ThumbsUp,
  Share2,
  MessageSquare,
  Phone,
  Smartphone,
  ShoppingBag,
  Calendar,
  UserCheck,
  Paperclip,
  Upload,
  Plus,
  Image as ImageIcon,
  Mic,
  MicOff,
  BarChart3,
  TrendingUp,
  RotateCcw,
  X,
  Sliders,
  Map,
  Compass,
  Hash,
  Search,
  Users,
  Briefcase,
  Heart,
  BookOpen,
  Laptop,
  Activity,
  Repeat,
  Bookmark,
  ChevronDown,
  Rocket,
  Pencil,
  Check,
} from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    const org = localStorage.getItem("organization_id");
    if (org) return org;
  }
  return "demo-org-123";
};

interface ConversationMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  quickOptions?: Array<{ label: string; value: string; isNotSure?: boolean }>;
  options?: Array<{ label: string; value: string; isNotSure?: boolean }>;
  metadata?: any;
}

interface CampaignState {
  sessionId: string;
  status:
    | "DISCOVERY"
    | "ACCOUNT_SELECTION"
    | "STRATEGY"
    | "DRAFTING"
    | "CREATIVE"
    | "REVIEW"
    | "CONFIRMATION"
    | "PUBLISHING"
    | "COMPLETED"
    | "FAILED";
  draft: any;
  validation: {
    valid: boolean;
    errors: Array<{ field: string; message: string; code: string }>;
    warnings: Array<{ field: string; message: string }>;
  };
  context: {
    organizationId: string;
    isConnected: boolean;
    adAccounts: Array<{ id: string; adAccountId: string; name: string; currency: string }>;
    pages: Array<{ id: string; name: string; picture?: string }>;
    pixelId?: string;
    pixels?: Array<{ id: string; name: string; isUnavailable?: boolean }>;
    [key: string]: any;
  };
  conversation: ConversationMessage[];
  requiresConfirmation: boolean;
  versionNumber?: number;
  executionResult?: any;
}

function formatCleanText(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-900">
          {part.slice(2, -2).replace(/^\*+|\*+$/g, "")}
        </strong>
      );
    }
    return part.replace(/\*\*/g, "");
  });
}

// ── Comprehensive Meta Ads Detailed Targeting Catalog ──
// Demographics, Interests, and Behaviours structured across official Meta Graph API taxonomies
interface TargetingCategoryItem {
  id: string;
  name: string;
  category: "demographics" | "interests" | "behaviours";
  subCategory: string;
  description?: string;
  icon?: string;
  audienceSizeLower?: number | null;
  audienceSizeUpper?: number | null;
}

const META_DETAILED_TARGETING_CATALOG: TargetingCategoryItem[] = [
  // ── DEMOGRAPHICS: Education & Life Stages ──
  { id: "edu_college_grad", name: "College Graduates", category: "demographics", subCategory: "Education", icon: "🎓", description: "People who completed associate or bachelor's degrees" },
  { id: "edu_postgrad", name: "Master's & Doctorate Degrees", category: "demographics", subCategory: "Education", icon: "📚", description: "Postgraduates, MBA, PhD and advanced scholars" },
  { id: "edu_highschool", name: "High School Graduates", category: "demographics", subCategory: "Education", icon: "🏫", description: "Secondary and high-school educated audience" },

  // ── DEMOGRAPHICS: Relationship & Marital Status ──
  { id: "rel_married", name: "Married Couples", category: "demographics", subCategory: "Relationship Status", icon: "💍", description: "Individuals with relationship status set to Married" },
  { id: "rel_single", name: "Single & Unmarried", category: "demographics", subCategory: "Relationship Status", icon: "👤", description: "Individuals identifying as single or unattached" },
  { id: "rel_engaged", name: "Newly Engaged", category: "demographics", subCategory: "Relationship Status", icon: "💎", description: "Engaged couples preparing for weddings" },
  { id: "rel_relationship", name: "In a Relationship", category: "demographics", subCategory: "Relationship Status", icon: "❤️", description: "People in serious relationships or domestic partnerships" },

  // ── DEMOGRAPHICS: Parents & Household ──
  { id: "par_new_parents", name: "New Parents (0-12 months)", category: "demographics", subCategory: "Parents & Family", icon: "👶", description: "Parents with infants and newborn babies" },
  { id: "par_toddler_parents", name: "Parents of Toddlers (1-2 years)", category: "demographics", subCategory: "Parents & Family", icon: "🍼", description: "Families with toddlers and early daycare kids" },
  { id: "par_school_parents", name: "Parents of School-Age Children (6-12)", category: "demographics", subCategory: "Parents & Family", icon: "🎒", description: "Parents with primary school kids and youth" },
  { id: "par_teen_parents", name: "Parents with Teenagers (13-17)", category: "demographics", subCategory: "Parents & Family", icon: "📱", description: "Parents of adolescents and high schoolers" },

  // ── DEMOGRAPHICS: Work & Industry ──
  { id: "work_biz_owners", name: "Small Business Owners & Founders", category: "demographics", subCategory: "Work & Industry", icon: "💼", description: "Entrepreneurs, directors, shop owners, proprietorships" },
  { id: "work_corporate_mgmt", name: "Corporate Executives & Managers", category: "demographics", subCategory: "Work & Industry", icon: "👔", description: "VPs, Directors, Team Leads, and C-level managers" },
  { id: "work_it_software", name: "IT, Software & Engineering Professionals", category: "demographics", subCategory: "Work & Industry", icon: "💻", description: "Software engineers, tech developers, data analysts" },
  { id: "work_healthcare", name: "Doctors & Healthcare Workers", category: "demographics", subCategory: "Work & Industry", icon: "🩺", description: "Physicians, dentists, medical clinic staff, nurses" },
  { id: "work_real_estate", name: "Real Estate Agents & Brokers", category: "demographics", subCategory: "Work & Industry", icon: "🏢", description: "Property consultants, builders, and real estate brokers" },

  // ── DEMOGRAPHICS: Life Events ──
  { id: "life_anniversary", name: "Anniversary within 30 Days", category: "demographics", subCategory: "Life Events", icon: "🎉", description: "Couples celebrating wedding/relationship anniversaries" },
  { id: "life_new_job", name: "New Job or Promotion", category: "demographics", subCategory: "Life Events", icon: "🚀", description: "People who recently started a new role or company" },
  { id: "life_moved", name: "Recently Moved to New City", category: "demographics", subCategory: "Life Events", icon: "📦", description: "People relocating or settling into a new home/city" },

  // ── INTERESTS: Business & Tech ──
  { id: "int_smartphones", name: "Smartphones & Mobile Devices", category: "interests", subCategory: "Technology & Gadgets", icon: "📱", description: "Android, iPhone, flagship phones and tech hardware" },
  { id: "int_electronics", name: "Consumer Electronics & Audio", category: "interests", subCategory: "Technology & Gadgets", icon: "🎧", description: "Laptops, smart watches, earbuds, home theater" },
  { id: "int_ai_software", name: "Artificial Intelligence & SaaS", category: "interests", subCategory: "Technology & Gadgets", icon: "🤖", description: "Cloud software, automation tools, CRM, modern AI" },
  { id: "int_entrepreneurship", name: "Entrepreneurship & Startups", category: "interests", subCategory: "Business & Industry", icon: "📈", description: "Startup founders, VC funding, scaling businesses" },
  { id: "int_digital_marketing", name: "Digital Marketing & Advertising", category: "interests", subCategory: "Business & Industry", icon: "🎯", description: "Lead generation, SEO, social ads, ecommerce growth" },

  // ── INTERESTS: Shopping & Fashion ──
  { id: "int_online_shopping", name: "Online Shopping & E-Commerce", category: "interests", subCategory: "Shopping & Fashion", icon: "🛍️", description: "High-intent digital shoppers across Amazon, Flipkart, D2C" },
  { id: "int_fashion_women", name: "Women's Fashion & Ethnic Wear", category: "interests", subCategory: "Shopping & Fashion", icon: "👗", description: "Sarees, kurtis, dresses, designer wear and styling" },
  { id: "int_mens_clothing", name: "Men's Apparel & Formal Wear", category: "interests", subCategory: "Shopping & Fashion", icon: "👔", description: "Suits, shirts, casual streetwear and shoes" },
  { id: "int_luxury_goods", name: "Luxury Goods & Watches", category: "interests", subCategory: "Shopping & Fashion", icon: "💎", description: "Premium designer jewelry, Swiss watches, luxury apparel" },
  { id: "int_beauty_cosmetics", name: "Cosmetics & Skincare", category: "interests", subCategory: "Shopping & Fashion", icon: "💄", description: "Makeup, dermatology skincare, hair care, salons" },

  // ── INTERESTS: Real Estate & Home ──
  { id: "int_real_estate_invest", name: "Real Estate Investing & Flats", category: "interests", subCategory: "Real Estate & Home", icon: "🏡", description: "1/2/3 BHK apartments, luxury villas, commercial plots" },
  { id: "int_interior_design", name: "Interior Design & Home Decor", category: "interests", subCategory: "Real Estate & Home", icon: "🛋️", description: "Home makeover, modular kitchens, luxury furniture" },

  // ── INTERESTS: Health, Fitness & Food ──
  { id: "int_gym_fitness", name: "Gym & Physical Fitness", category: "interests", subCategory: "Health & Wellness", icon: "💪", description: "Weight loss, CrossFit, gym memberships, personal trainers" },
  { id: "int_yoga_wellness", name: "Yoga, Meditation & Ayurvedic", category: "interests", subCategory: "Health & Wellness", icon: "🧘", description: "Holistic wellness, yoga studios, organic nutrition" },
  { id: "int_restaurants_dining", name: "Fine Dining & Cafes", category: "interests", subCategory: "Food & Beverage", icon: "🍽️", description: "Foodies, cafe culture, gourmet dining, rooftop bars" },

  // ── INTERESTS: Automotive & Travel ──
  { id: "int_automobiles", name: "Automobiles & Electric Vehicles (EV)", category: "interests", subCategory: "Automotive", icon: "🚗", description: "SUVs, luxury sedans, electric cars, test drives" },
  { id: "int_motorcycles", name: "Bikes & Motorcycling", category: "interests", subCategory: "Automotive", icon: "🏍️", description: "Royal Enfield, superbikes, touring scooters" },
  { id: "int_luxury_travel", name: "Luxury Travel & Resorts", category: "interests", subCategory: "Travel & Lifestyle", icon: "✈️", description: "5-star hotels, international vacations, honeymoon resorts" },

  // ── BEHAVIOURS: Purchase Behaviour ──
  { id: "beh_engaged_shoppers", name: "Engaged Shoppers", category: "behaviours", subCategory: "Purchase Behaviour", icon: "🛒", description: "People who clicked the 'Shop Now' button on ads in the past week" },
  { id: "beh_high_value_goods", name: "High-Value Goods Buyers", category: "behaviours", subCategory: "Purchase Behaviour", icon: "💳", description: "Shoppers with frequent high-ticket online transactions" },

  // ── BEHAVIOURS: Digital Activities & Tech Usage ──
  { id: "beh_page_admins", name: "Facebook Page Admins", category: "behaviours", subCategory: "Digital Activities", icon: "👥", description: "Admins of business, retail, hospitality or community pages" },
  { id: "beh_early_adopters", name: "Technology Early Adopters", category: "behaviours", subCategory: "Digital Activities", icon: "⚡", description: "People among the first to adopt new gadgets and digital apps" },
  { id: "beh_payment_users", name: "Digital & UPI Payment Users", category: "behaviours", subCategory: "Digital Activities", icon: "📲", description: "Users who regularly conduct digital commerce via UPI/Cards" },

  // ── BEHAVIOURS: Travel & Commute ──
  { id: "beh_frequent_travelers", name: "Frequent Travelers", category: "behaviours", subCategory: "Travel Behaviour", icon: "🛫", description: "People whose activities show frequent domestic & inter-city travel" },
  { id: "beh_intl_travelers", name: "Frequent International Travelers", category: "behaviours", subCategory: "Travel Behaviour", icon: "🌍", description: "People who travel abroad multiple times per year" },
  { id: "beh_commuters", name: "Daily Metro & City Commuters", category: "behaviours", subCategory: "Travel Behaviour", icon: "🚆", description: "Professionals commuting daily between suburban & metro zones" },

  // ── BEHAVIOURS: Mobile Device User ──
  { id: "beh_ios_users", name: "Apple iOS Device Users (iPhone & iPad)", category: "behaviours", subCategory: "Device Usage", icon: "🍏", description: "High-income users browsing Facebook & Instagram on Apple iOS" },
  { id: "beh_flagship_android", name: "Premium Flagship Android Users", category: "behaviours", subCategory: "Device Usage", icon: "🤖", description: "Users connected via high-end Samsung Galaxy, Pixel, OnePlus devices" },
];

export default function MetaAIChatbotStudioPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string>(getOrgId());

  // Conversational & Campaign State
  const [session, setSession] = useState<CampaignState | null>(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [singleCitySuggestions, setSingleCitySuggestions] = useState<Array<{ key: string; name: string; displayName: string; region: string }>>([]);

  // ── DEDICATED EDIT MODAL STATE FOR PRE-FLIGHT CHECKLIST ──
  const [activeEditModal, setActiveEditModal] = useState<"media" | "headline" | "budget" | "destination" | "account" | "page" | "audience" | null>(null);

  // Local draft states for dedicated section editors
  const [editHeadline, setEditHeadline] = useState("");
  const [editPrimaryText, setEditPrimaryText] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCta, setEditCta] = useState("WHATSAPP_MESSAGE");

  const [editDailyBudget, setEditDailyBudget] = useState<number>(750);
  const [editIsCbo, setEditIsCbo] = useState(true);

  const [editDestType, setEditDestType] = useState<"WHATSAPP" | "INSTANT_FORM" | "WEBSITE" | "PHONE_CALL">("WHATSAPP");
  const [editWhatsappPhone, setEditWhatsappPhone] = useState("+91 77099 36965");
  const [editGreetingMsg, setEditGreetingMsg] = useState("");
  const [editWebsiteUrl, setEditWebsiteUrl] = useState("");

  const [editAdAccountId, setEditAdAccountId] = useState("");
  const [editPixelId, setEditPixelId] = useState("");

  const [editPageName, setEditPageName] = useState("");
  const [editPageId, setEditPageId] = useState("");

  const [editAgeMin, setEditAgeMin] = useState<number>(20);
  const [editAgeMax, setEditAgeMax] = useState<number>(45);
  const [editGender, setEditGender] = useState<"ALL" | "MEN" | "WOMEN">("ALL");
  const [editPlacements, setEditPlacements] = useState<"ADVANTAGE_PLUS" | "MANUAL">("ADVANTAGE_PLUS");

  const openEditModal = (modal: "media" | "headline" | "budget" | "destination" | "account" | "page" | "audience") => {
    if (!session?.draft) return;
    const { campaign, creative, targeting, destination } = session.draft;
    if (modal === "headline") {
      setEditHeadline(creative.headline || "");
      setEditPrimaryText(creative.primaryText || "");
      setEditDescription(creative.description || "");
      setEditCta(creative.callToAction || "WHATSAPP_MESSAGE");
    } else if (modal === "budget") {
      setEditDailyBudget(campaign.dailyBudget || 750);
      setEditIsCbo(true);
    } else if (modal === "destination") {
      setEditDestType((destination.type as any) || "WHATSAPP");
      setEditWhatsappPhone(destination.whatsappPhoneNumber || "+91 77099 36965");
      setEditGreetingMsg((creative as any)?.prefilledMessage || `Hi ${campaign.name || "Ak Cars"}, I saw your ad on Facebook and want to know more about ${creative.headline || "your services"}!`);
      setEditWebsiteUrl(destination.websiteUrl || destination.destinationUrl || "https://");
    } else if (modal === "account") {
      setEditAdAccountId(session.draft.adAccountId || activeAdAccount?.adAccountId || "act_1454270479625110");
      setEditPixelId(session.draft.pixelId || context?.pixelId || "1380912777544016");
    } else if (modal === "page") {
      setEditPageName(session.draft.pageName || activePage?.name || "JISNU Digital Solutions Pvt.Ltd");
      setEditPageId(session.draft.pageId || activePage?.id || "1062234726963242");
    } else if (modal === "audience") {
      setEditAgeMin(targeting.ageMin || 20);
      setEditAgeMax(targeting.ageMax || 45);
      setEditGender((targeting.gender as any) || "ALL");
      setEditPlacements(targeting.placements === "MANUAL" ? "MANUAL" : "ADVANTAGE_PLUS");
    }
    setActiveEditModal(modal);
  };

  const handleSaveHeadline = () => {
    if (!session) return;
    setSession({
      ...session,
      draft: {
        ...session.draft,
        creative: {
          ...session.draft.creative,
          headline: editHeadline,
          primaryText: editPrimaryText,
          description: editDescription,
          callToAction: editCta,
        },
      },
    });
    setActiveEditModal(null);
  };

  const handleSaveBudget = () => {
    if (!session) return;
    setSession({
      ...session,
      draft: {
        ...session.draft,
        campaign: {
          ...session.draft.campaign,
          dailyBudget: editDailyBudget,
        },
      },
    });
    setActiveEditModal(null);
  };

  const handleSaveDestination = () => {
    if (!session) return;
    setSession({
      ...session,
      draft: {
        ...session.draft,
        destination: {
          ...session.draft.destination,
          type: editDestType,
          whatsappPhoneNumber: editDestType === "WHATSAPP" ? editWhatsappPhone : undefined,
          websiteUrl: editDestType === "WEBSITE" ? editWebsiteUrl : undefined,
          destinationUrl: editDestType === "WEBSITE" ? editWebsiteUrl : undefined,
        },
        creative: {
          ...session.draft.creative,
          callToAction: editDestType === "WHATSAPP" ? "WHATSAPP_MESSAGE" : editDestType === "WEBSITE" ? "LEARN_MORE" : "APPLY_NOW",
          prefilledMessage: editGreetingMsg,
        },
      },
    });
    setActiveEditModal(null);
  };

  const handleSaveAccount = () => {
    if (!session) return;
    setSession({
      ...session,
      draft: {
        ...session.draft,
        adAccountId: editAdAccountId,
        pixelId: editPixelId,
      },
    });
    setActiveEditModal(null);
  };

  const handleSavePage = () => {
    if (!session) return;
    setSession({
      ...session,
      draft: {
        ...session.draft,
        pageName: editPageName,
        pageId: editPageId,
      },
    });
    setActiveEditModal(null);
  };

  const handleSaveAudience = () => {
    if (!session) return;
    setSession({
      ...session,
      draft: {
        ...session.draft,
        targeting: {
          ...session.draft.targeting,
          ageMin: editAgeMin,
          ageMax: editAgeMax,
          gender: editGender,
          placements: editPlacements,
        },
      },
    });
    setActiveEditModal(null);
  };

  // Debounced search for single city input
  useEffect(() => {
    const q = cityInput.trim();
    if (!q || q.length < 1) {
      setSingleCitySuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/meta-ads/locations/search?q=${encodeURIComponent(q)}&organizationId=${encodeURIComponent(orgId)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSingleCitySuggestions(json.data);
        }
      } catch (err) {
        console.warn("[SingleCitySearch] Error:", err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [cityInput, orgId]);

  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Stop speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceRecording = () => {
    // If currently listening, stop it
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("[SpeechRecognition] Stop error:", e);
        }
      }
      setIsRecording(false);
      return;
    }

    if (typeof window === "undefined") return;

    // Check for native Windows / browser SpeechRecognition listener
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert("Windows Speech Recognition is not supported in this browser. Please open in Google Chrome or Microsoft Edge on Windows.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      // Use system / browser locale (e.g. en-IN, hi-IN, en-US)
      recognition.lang = navigator.language || "en-IN";

      // Preserve any existing input text so spoken words append naturally
      const startingText = inputText.trim() ? inputText.trim() + " " : "";
      baseTextRef.current = startingText;

      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + " ";
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const liveCombined = (baseTextRef.current + finalTranscript + interimTranscript).trim();
        if (liveCombined) {
          handleInputChange(liveCombined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("[SpeechRecognition] error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          alert("Microphone permission was denied. Please allow microphone access in your browser / Windows settings.");
        } else if (event.error !== "no-speech") {
          console.warn("[SpeechRecognition] Unhandled speech error:", event.error);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("[SpeechRecognition] Initialization failed:", err);
      alert("Could not start Windows Speech Recognition: " + (err.message || err));
      setIsRecording(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.conversation, isSending, isPublishing]);

  // Initialize Session on Load with LocalStorage Caching & Recovery
  useEffect(() => {
    const currentOrg = getOrgId();
    setOrgId(currentOrg);

    const cacheKey = `meta_ai_session_${currentOrg}`;
    const draftInputKey = `meta_ai_input_draft_${currentOrg}`;

    if (typeof window !== "undefined") {
      // Restore input text draft
      const cachedInput = localStorage.getItem(draftInputKey);
      if (cachedInput) {
        setInputText(cachedInput);
      }

      // Restore full conversation and campaign draft state
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // If cached session has stale ad history greeting or old branding, invalidate and reload clean JISNU AI session
          const hasStaleGreeting = parsed?.conversation?.some((m: any) =>
            /14 Aug-2026|Historical Ads Audit|I've analyzed your account's ad history/i.test(m.text || "")
          );
          if (parsed && parsed.sessionId && parsed.draft && !hasStaleGreeting) {
            setSession(parsed);
            setLoadingInit(false);
            return;
          }
        } catch (e) {
          console.warn("Failed to parse cached Meta AI session:", e);
        }
      }
    }

    fetch(`${BACKEND}/api/meta-ads/ai/conversation/init?organizationId=${currentOrg}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.session) {
          setSession(data.session);
          if (typeof window !== "undefined") {
            localStorage.setItem(cacheKey, JSON.stringify(data.session));
          }
        } else {
          setError("Could not initialize Meta AI Chatbot Studio.");
        }
      })
      .catch((err) => setError(err.message || "Connection failed to Meta AI Engine."))
      .finally(() => setLoadingInit(false));
  }, []);

  // Sync state changes to LocalStorage
  useEffect(() => {
    if (session && typeof window !== "undefined") {
      const currentOrg = getOrgId();
      localStorage.setItem(`meta_ai_session_${currentOrg}`, JSON.stringify(session));
    }
  }, [session]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (typeof window !== "undefined") {
      const currentOrg = getOrgId();
      if (text.trim()) {
        localStorage.setItem(`meta_ai_input_draft_${currentOrg}`, text);
      } else {
        localStorage.removeItem(`meta_ai_input_draft_${currentOrg}`);
      }
    }
  };

  const handleResetSession = async () => {
    const currentOrg = getOrgId();
    if (typeof window !== "undefined") {
      localStorage.removeItem(`meta_ai_session_${currentOrg}`);
      localStorage.removeItem(`meta_ai_input_draft_${currentOrg}`);
    }
    setInputText("");
    setAttachedFile(null);
    setMetaIframeHtml(null);
    setLoadingInit(true);
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/ai/conversation/init?organizationId=${currentOrg}`);
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        if (typeof window !== "undefined") {
          localStorage.setItem(`meta_ai_session_${currentOrg}`, JSON.stringify(data.session));
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingInit(false);
    }
  };

  const handleSendMessage = async (textToSend?: string, selectedOption?: string, overrideState?: CampaignState) => {
    // If Windows Speech Recognition listener is active, stop it
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);

    const content = textToSend || inputText;
    if (!content.trim() && !selectedOption && !attachedFile) return;
    const activeSession = overrideState || session;
    if (!activeSession) return;

    // Clear input & draft from storage
    setInputText("");
    if (typeof window !== "undefined") {
      localStorage.removeItem(`meta_ai_input_draft_${orgId}`);
    }
    setIsSending(true);
    setError(null);

    // Optimistically record user's message in local state & localStorage immediately
    const userMsgText = content || (selectedOption ? `Selected: ${selectedOption}` : "Attached creative file");
    const optimisticUserMsg: ConversationMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const optimisticallyUpdatedSession: CampaignState = {
      ...activeSession,
      conversation: [...(activeSession.conversation || []), optimisticUserMsg],
    };

    setSession(optimisticallyUpdatedSession);
    if (typeof window !== "undefined") {
      localStorage.setItem(`meta_ai_session_${orgId}`, JSON.stringify(optimisticallyUpdatedSession));
    }

    // If there's an attached file that wasn't previously uploaded, attach it to the state
    let stateToSend = optimisticallyUpdatedSession;
    if (attachedFile && !stateToSend.draft?.creative?.mediaUrl) {
      stateToSend = {
        ...stateToSend,
        draft: {
          ...stateToSend.draft,
          creative: {
            ...stateToSend.draft?.creative,
            mediaUrl: attachedFile.url,
            mediaType: attachedFile.type,
            mediaApproved: true,
          },
        },
      };
    }

    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/ai/conversation/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          currentState: stateToSend,
          message: content,
          selectedOption: selectedOption,
        }),
      });

      const data = await res.json();
      if (data.success && data.state) {
        setSession(data.state);
        if (typeof window !== "undefined") {
          localStorage.setItem(`meta_ai_session_${orgId}`, JSON.stringify(data.state));
        }
        if (data.state.conversation?.slice(-1)[0]?.metadata?.openBulkLocationModal) {
          openBulkLocationManager();
        }
      } else {
        setError(data.error || "Failed to process message.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to AI server.");
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmPublish = async () => {
    if (!session || !session.draft) return;
    setIsPublishing(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/ai/conversation/confirm-publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          draft: session.draft,
        }),
      });

      const data = await res.json();
      if (data.success && data.result?.deploymentStatus === "FULL_SUCCESS" && data.result?.ad?.id) {
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: "COMPLETED",
            requiresConfirmation: false,
            executionResult: data.result,
            conversation: [
              ...prev.conversation,
              {
                id: `msg_ai_${Date.now()}`,
                sender: "ai",
                text: `🎉 **Campaign Successfully Published to Meta Ads!**\n\n- **Campaign ID**: \`${data.result.campaign?.id || data.result.metaCampaignId}\`\n- **Ad Set ID**: \`${data.result.adSet?.id || data.result.metaAdSetId}\`\n- **Ad ID**: \`${data.result.ad?.id}\`\n- **Status**: Live / Paused in Meta Ads Manager ready for delivery.`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          };
        });
      } else if (data.result?.deploymentStatus === "PARTIAL_CREATION") {
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: "REVIEW",
            requiresConfirmation: true,
            executionResult: data.result,
            conversation: [
              ...prev.conversation,
              {
                id: `msg_ai_${Date.now()}`,
                sender: "ai",
                text: `⚠️ **Meta Setup Partially Created**: Campaign (\`${data.result.campaign?.id}\`) and Ad Set (\`${data.result.adSet?.id}\`) were created, but Meta blocked the final Ad creation: **${data.result.errorMessage}**. Please certify your account on facebook.com/certification/nondiscrimination and retry.`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          };
        });
        setError(data.result.errorMessage || "Ad creation was blocked by Meta policy.");
      } else {
        setError(data.result?.errorMessage || data.error || "Meta API execution failed.");
      }
    } catch (err: any) {
      setError(err.message || "Network error while publishing campaign.");
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Meta Graph API GET /{ad-id}/previews & GET /{ad-creative-id}/previews State ──
  const [metaIframeHtml, setMetaIframeHtml] = useState<string | null>(null);
  const [loadingMetaIframe, setLoadingMetaIframe] = useState(false);

  // Map active platform tab to Meta ad_format parameter
  const getMetaAdFormat = (previewPlatform?: string, aspectRatio?: string): string => {
    if (previewPlatform === "INSTAGRAM_FEED") return "INSTAGRAM_STANDARD";
    if (previewPlatform === "STORIES_REELS" || aspectRatio === "9:16") return "MOBILE_FULLVIEW_STREAM";
    if (previewPlatform === "RIGHT_COLUMN") return "DESKTOP_RIGHT_COLUMN";
    if (previewPlatform === "MESSENGER_FEED") return "MESSENGER_MOBILE_INBOX_MEDIA";
    return "DESKTOP_FEED_STANDARD";
  };

  // Fetch Meta Graph API preview whenever ad ID / creative ID or ad_format changes
  useEffect(() => {
    const publishedAdId = session?.executionResult?.ad?.id || session?.executionResult?.metaAdId || (session?.draft as any)?.metaAdId;
    const publishedCreativeId = session?.executionResult?.creative?.id || (session?.draft as any)?.metaCreativeId;
    const targetId = publishedAdId || publishedCreativeId;

    if (!targetId || !orgId) {
      setMetaIframeHtml(null);
      return;
    }

    const adFormat = getMetaAdFormat(
      (session?.draft?.creative as any)?.previewPlatform,
      session?.draft?.creative?.aspectRatio
    );

    setLoadingMetaIframe(true);
    fetch(`${BACKEND}/api/meta-ads/ai/conversation/preview?organizationId=${encodeURIComponent(orgId)}&targetId=${encodeURIComponent(targetId)}&ad_format=${encodeURIComponent(adFormat)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.iframeHtml) {
          setMetaIframeHtml(data.iframeHtml);
        } else {
          setMetaIframeHtml(null);
        }
      })
      .catch((err) => {
        console.warn("[MetaPreview] Error fetching preview HTML:", err);
        setMetaIframeHtml(null);
      })
      .finally(() => setLoadingMetaIframe(false));
  }, [
    session?.executionResult?.ad?.id,
    session?.executionResult?.metaAdId,
    (session?.draft as any)?.metaCreativeId,
    (session?.draft?.creative as any)?.previewPlatform,
    session?.draft?.creative?.aspectRatio,
    orgId,
  ]);

  // File Upload & Select Ad States
  const [showAdLibraryModal, setShowAdLibraryModal] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<{ images: any[]; videos: any[] }>({ images: [], videos: [] });
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string; type: "IMAGE" | "VIDEO" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Detailed Targeting (Demographics, Interests, Behaviours) Modal State ──
  const [showDetailedTargetingModal, setShowDetailedTargetingModal] = useState(false);
  const [targetingSearchQuery, setTargetingSearchQuery] = useState("");
  const [targetingActiveTab, setTargetingActiveTab] = useState<"all" | "demographics" | "interests" | "behaviours">("all");
  const [selectedTargetingTags, setSelectedTargetingTags] = useState<string[]>([]);
  const [customInterestInput, setCustomInterestInput] = useState("");
  const [liveTargetingResults, setLiveTargetingResults] = useState<TargetingCategoryItem[]>([]);
  const [isSearchingLiveTargeting, setIsSearchingLiveTargeting] = useState(false);

  // Debounced live Meta Graph API search for targeting
  useEffect(() => {
    const query = targetingSearchQuery.trim();
    if (!query || query.length < 2) {
      setLiveTargetingResults([]);
      setIsSearchingLiveTargeting(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLiveTargeting(true);
      try {
        const res = await fetch(`${BACKEND}/api/meta-ads/targeting/search?q=${encodeURIComponent(query)}&organizationId=${encodeURIComponent(orgId)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const formatted: TargetingCategoryItem[] = json.data.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            category: item.category || "interests",
            subCategory: item.subCategory || "Meta Direct Match",
            description: item.description,
            icon: item.category === "demographics" ? "👥" : item.category === "behaviours" ? "🛒" : "🎯",
            audienceSizeLower: item.audienceSizeLower,
            audienceSizeUpper: item.audienceSizeUpper,
          }));
          setLiveTargetingResults(formatted);
        }
      } catch (err) {
        console.warn("[TargetingSearch] Error fetching live Meta targeting options:", err);
      } finally {
        setIsSearchingLiveTargeting(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [targetingSearchQuery, orgId]);

  const openDetailedTargetingModal = () => {
    const existing = session?.draft?.targeting?.interests || [];
    setSelectedTargetingTags([...existing]);
    setTargetingSearchQuery("");
    setLiveTargetingResults([]);
    setTargetingActiveTab("all");
    setShowDetailedTargetingModal(true);
  };

  const handleToggleTargetingTag = (tagName: string) => {
    setSelectedTargetingTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const handleAddCustomTargetingTag = (val: string) => {
    const clean = val.trim();
    if (!clean) return;
    if (!selectedTargetingTags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setSelectedTargetingTags((prev) => [...prev, clean]);
    }
    setCustomInterestInput("");
  };

  const handleApplyDetailedTargeting = () => {
    if (!session) return;
    const cleanTags = Array.from(new Set(selectedTargetingTags.map((t) => t.trim()))).filter(Boolean);

    const updatedDraft = {
      ...session.draft,
      targeting: {
        ...session.draft.targeting,
        interests: cleanTags,
        advantagePlusAudience: true,
      },
    };

    const updatedSession = {
      ...session,
      draft: updatedDraft,
    };
    setSession(updatedSession);
    setShowDetailedTargetingModal(false);

    const tagSummary = cleanTags.length > 0 ? cleanTags.join(", ") : "Advantage+ Broad Audience";
    handleSendMessage(
      `Updated detailed targeting (demographics, interests & behaviours): ${tagSummary}`,
      undefined,
      updatedSession
    );
  };

  // ── Campaign Pre-Flight Readiness Tracker State ──
  const [checklistFilter, setChecklistFilter] = useState<"ALL" | "ACTION_NEEDED" | "READY">("ALL");
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(true);

  // ── Bulk Location Management State & Handlers ──
  const [showBulkLocationModal, setShowBulkLocationModal] = useState(false);
  const [bulkCountries, setBulkCountries] = useState<string[]>([]);
  const [bulkCities, setBulkCities] = useState<Array<{ name: string; radiusKm: number }>>([]);
  const [bulkPincodes, setBulkPincodes] = useState<string[]>([]);
  const [bulkCityText, setBulkCityText] = useState("");
  const [bulkCountryText, setBulkCountryText] = useState("");
  const [bulkPincodeText, setBulkPincodeText] = useState("");
  const [bulkActiveTab, setBulkActiveTab] = useState<"cities" | "countries" | "pincodes">("cities");
  const [citySuggestions, setCitySuggestions] = useState<Array<{ key: string; name: string; displayName: string; region: string }>>([]);
  const [isLoadingCitySuggestions, setIsLoadingCitySuggestions] = useState(false);
  const [countrySuggestions, setCountrySuggestions] = useState<Array<{ key: string; name: string; displayName: string; region: string; countryCode: string }>>([]);
  const [isLoadingCountrySuggestions, setIsLoadingCountrySuggestions] = useState(false);

  // Debounced live Meta Graph API city search
  useEffect(() => {
    // Extract current word being typed (e.g. if user types "Mumbai, sat", query "sat")
    const parts = bulkCityText.split(/[\n\r,;&|]+/);
    const activeToken = (parts[parts.length - 1] || "").replace(/\(.*?\)/g, "").trim();

    if (!activeToken || activeToken.length < 1) {
      setCitySuggestions([]);
      setIsLoadingCitySuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingCitySuggestions(true);
      try {
        const res = await fetch(`/api/meta-ads/locations/search?q=${encodeURIComponent(activeToken)}&organizationId=${encodeURIComponent(orgId)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCitySuggestions(json.data);
        }
      } catch (err) {
        console.warn("[LocationSearch] Error fetching city suggestions:", err);
      } finally {
        setIsLoadingCitySuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [bulkCityText, orgId]);

  // Debounced live country search (Meta Graph API + Global Catalog)
  useEffect(() => {
    const q = bulkCountryText.trim();
    if (!q || q.length < 1) {
      setCountrySuggestions([]);
      setIsLoadingCountrySuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingCountrySuggestions(true);
      try {
        const res = await fetch(`/api/meta-ads/locations/search?q=${encodeURIComponent(q)}&type=country&organizationId=${encodeURIComponent(orgId)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCountrySuggestions(json.data);
        }
      } catch (err) {
        console.warn("[CountrySearch] Error fetching country suggestions:", err);
      } finally {
        setIsLoadingCountrySuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [bulkCountryText, orgId]);

  const [pincodeSuggestions, setPincodeSuggestions] = useState<Array<{ key: string; name: string; displayName: string; city?: string; region?: string; postalCode?: string }>>([]);
  const [isLoadingPincodeSuggestions, setIsLoadingPincodeSuggestions] = useState(false);

  // Debounced live PIN / postal code search (Meta Graph API + Metro PIN Registry)
  useEffect(() => {
    // Extract the active token (current number or text being typed)
    const parts = bulkPincodeText.split(/[\n\r,;&|]+/);
    const activeToken = (parts[parts.length - 1] || "").trim();

    if (!activeToken || activeToken.length < 2) {
      setPincodeSuggestions([]);
      setIsLoadingPincodeSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingPincodeSuggestions(true);
      try {
        const res = await fetch(`/api/meta-ads/locations/search?q=${encodeURIComponent(activeToken)}&type=postal_code&organizationId=${encodeURIComponent(orgId)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPincodeSuggestions(json.data);
        }
      } catch (err) {
        console.warn("[PincodeSearch] Error fetching postal suggestions:", err);
      } finally {
        setIsLoadingPincodeSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [bulkPincodeText, orgId]);


  const openBulkLocationManager = () => {
    if (session?.draft?.targeting) {
      const tgt = session.draft.targeting;
      setBulkCountries(
        Array.isArray(tgt.countries) && tgt.countries.length > 0
          ? [...tgt.countries]
          : ["India"]
      );
      if (Array.isArray(tgt.cityConfigs) && tgt.cityConfigs.length > 0) {
        setBulkCities(tgt.cityConfigs.map((c: any) => ({ name: c.name, radiusKm: c.radiusKm || 30 })));
      } else if (Array.isArray(tgt.cities) && tgt.cities.length > 0) {
        setBulkCities(tgt.cities.map((c: string) => ({ name: c, radiusKm: tgt.radiusKm || 30 })));
      } else if (tgt.locationDescription && !/all india/i.test(tgt.locationDescription)) {
        const parsed = tgt.locationDescription.split(/[,&;\/|]\s*|\s+and\s+/i).map((s: string) => s.trim()).filter(Boolean);
        setBulkCities(parsed.map((c: string) => ({ name: c, radiusKm: 30 })));
      } else {
        setBulkCities([
          { name: "Mumbai", radiusKm: 40 },
          { name: "Pune", radiusKm: 25 },
        ]);
      }
      setBulkPincodes(
        Array.isArray(tgt.postalCodes) && tgt.postalCodes.length > 0
          ? [...tgt.postalCodes]
          : []
      );
    } else {
      setBulkCountries(["India"]);
      setBulkCities([
        { name: "Mumbai", radiusKm: 40 },
        { name: "Pune", radiusKm: 25 },
      ]);
      setBulkPincodes([]);
    }
    setShowBulkLocationModal(true);
  };

  const handleAddBulkCitiesFromText = () => {
    if (!bulkCityText.trim()) return;
    const lines = bulkCityText.split(/[\n\r,;&|]+/);
    const updated = [...bulkCities];
    const seen = new Set(updated.map((c) => c.name.toLowerCase()));

    for (const raw of lines) {
      let clean = raw.trim();
      if (!clean) continue;
      const rMatch = clean.match(/(.+?)\s*\(?(\d{1,3})\s*(?:km|kms)?\)?$/i);
      let radius = 30;
      if (rMatch && rMatch[1] && rMatch[2]) {
        clean = rMatch[1].trim();
        radius = Math.min(80, Math.max(15, parseInt(rMatch[2], 10)));
      }
      if (clean.length >= 2 && !seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        updated.push({
          name: clean.charAt(0).toUpperCase() + clean.slice(1),
          radiusKm: radius,
        });
      }
    }
    setBulkCities(updated);
    setBulkCityText("");
    setCitySuggestions([]);
  };

  const handleSelectCitySuggestion = (suggestion: { name: string; displayName: string }) => {
    const cityName = suggestion.name.trim();
    if (!cityName) return;

    // Check if city already in bulkCities
    const existingIdx = bulkCities.findIndex((c) => c.name.toLowerCase() === cityName.toLowerCase());
    if (existingIdx === -1) {
      setBulkCities([...bulkCities, { name: cityName, radiusKm: 30 }]);
    }

    // Replace current incomplete typing token or clear input
    const parts = bulkCityText.split(/([,\n\r;&|]+)/);
    if (parts.length > 1) {
      parts[parts.length - 1] = "";
      setBulkCityText(parts.join("").trim());
    } else {
      setBulkCityText("");
    }
    setCitySuggestions([]);
  };

  const handleAddBulkPincodesFromText = () => {
    if (!bulkPincodeText.trim()) return;
    const matches = bulkPincodeText.match(/\b\d{5,6}\b/g) || [];
    const updated = [...bulkPincodes];
    for (const m of matches) {
      if (!updated.includes(m)) {
        updated.push(m);
      }
    }
    setBulkPincodes(updated);
    setBulkPincodeText("");
    setPincodeSuggestions([]);
  };

  const handleSelectPincodeSuggestion = (suggestion: { name: string; postalCode?: string; displayName: string }) => {
    const pin = (suggestion.postalCode || suggestion.name).trim();
    if (!pin) return;

    if (!bulkPincodes.includes(pin)) {
      setBulkPincodes([...bulkPincodes, pin]);
    }

    // Replace the current incomplete token or clear
    const parts = bulkPincodeText.split(/([,\n\r;&|]+)/);
    if (parts.length > 1) {
      parts[parts.length - 1] = "";
      setBulkPincodeText(parts.join("").trim());
    } else {
      setBulkPincodeText("");
    }
    setPincodeSuggestions([]);
  };

  const handleAddBulkCountry = (cName: string) => {
    const clean = cName.trim();
    if (clean && !bulkCountries.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      setBulkCountries([...bulkCountries, clean]);
    }
  };

  const handleApplyBulkLocations = () => {
    if (!session) return;
    const cleanCountries = bulkCountries.filter(Boolean);
    const cleanCities = bulkCities.filter((c) => c.name && c.name.trim());
    const cleanPincodes = bulkPincodes.filter(Boolean);

    const summaryParts: string[] = [];
    if (cleanCountries.length > 0) summaryParts.push(`Countries: ${cleanCountries.join(", ")}`);
    if (cleanCities.length > 0)
      summaryParts.push(
        `Cities: ${cleanCities.map((c) => `${c.name} (${c.radiusKm}km)`).join(", ")}`
      );
    if (cleanPincodes.length > 0) summaryParts.push(`PIN: ${cleanPincodes.join(", ")}`);
    const locDesc = summaryParts.join(" | ") || "Custom Bulk Locations";

    const updatedDraft = {
      ...session.draft,
      targeting: {
        ...session.draft.targeting,
        locationType: "BULK",
        countries: cleanCountries,
        cities: cleanCities.map((c) => c.name),
        cityConfigs: cleanCities,
        postalCodes: cleanPincodes,
        locationDescription: locDesc,
      },
    };

    const updatedSession = {
      ...session,
      draft: updatedDraft,
    };
    setSession(updatedSession);
    setShowBulkLocationModal(false);

    handleSendMessage(
      `Updated campaign targeting with bulk locations: ${locDesc}`,
      undefined,
      updatedSession
    );
  };

  const fetchMediaLibrary = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/media?organizationId=${orgId}`);
      const data = await res.json();
      if (data.success && data.media) {
        setMediaLibrary(data.media);
      }
    } catch (e: any) {
      console.warn("Could not load media library:", e.message);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const localUrl = URL.createObjectURL(file);
    const mediaType: "IMAGE" | "VIDEO" = isVideo ? "VIDEO" : "IMAGE";

    // Immediate UI feedback with local preview
    setAttachedFile({
      name: file.name,
      url: localUrl,
      type: mediaType,
    });

    setIsSending(true);
    try {
      // 1. Detect natural aspect ratio from Image / Video dimensions
      let detectedAspect: string = "1:1";
      let dimensionText = "";

      if (!isVideo) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;
            const ratio = w / (h || 1);
            if (ratio < 0.65) {
              detectedAspect = "9:16";
            } else if (ratio < 0.9) {
              detectedAspect = "4:5";
            } else if (ratio > 1.35) {
              detectedAspect = "16:9";
            } else {
              detectedAspect = "1:1";
            }
            dimensionText = `${w}×${h}`;
            resolve();
          };
          img.onerror = () => resolve();
          img.src = localUrl;
        });
      } else {
        await new Promise<void>((resolve) => {
          const vid = document.createElement("video");
          vid.onloadedmetadata = () => {
            const w = vid.videoWidth;
            const h = vid.videoHeight;
            const ratio = w / (h || 1);
            if (ratio < 0.7) {
              detectedAspect = "9:16";
            } else if (ratio > 1.35) {
              detectedAspect = "16:9";
            } else {
              detectedAspect = "1:1";
            }
            dimensionText = `${w}×${h}`;
            resolve();
          };
          vid.onerror = () => resolve();
          vid.src = localUrl;
        });
      }

      // 2. Upload custom user creative to backend server
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BACKEND}/api/meta-ads/ai/conversation/upload-media`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const finalUrl = data.success && data.media?.url ? data.media.url : localUrl;

      let updatedSession = session;
      if (session) {
        const updatedDraft = {
          ...session.draft,
          creative: {
            ...session.draft?.creative,
            mediaUrl: finalUrl,
            mediaType,
            aspectRatio: detectedAspect,
            mediaApproved: true,
          },
        };
        updatedSession = {
          ...session,
          draft: updatedDraft,
        };
        setSession(updatedSession);
      }

      const aspectLabel = detectedAspect === "9:16" ? "9:16 vertical story / reel" : detectedAspect === "16:9" ? "16:9 landscape banner" : detectedAspect === "4:5" ? "4:5 portrait post" : "1:1 square feed post";
      const dimInfo = dimensionText ? ` (${dimensionText}, ${aspectLabel})` : ` (${aspectLabel})`;
      const additionalPrompt = inputText.trim() ? ` ${inputText.trim()}` : "";
      setInputText("");
      handleSendMessage(
        `I've uploaded my custom ${mediaType.toLowerCase()} creative: "${file.name}"${dimInfo} with aspectRatio: ${detectedAspect}. Please use this graphic for the ad.${additionalPrompt}`,
        undefined,
        updatedSession || undefined
      );
    } catch (err: any) {
      console.warn("Upload error:", err.message);
      const additionalPrompt = inputText.trim() ? ` ${inputText.trim()}` : "";
      setInputText("");
      handleSendMessage(`Attached ${mediaType === "IMAGE" ? "image" : "video"}: "${file.name}" for the ad creative.${additionalPrompt}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectMediaFromLibrary = async (mediaItem: any, type: "IMAGE" | "VIDEO") => {
    const mediaUrl = type === "IMAGE" ? (mediaItem.url || mediaItem.permalink_url) : (mediaItem.source || mediaItem.picture);
    const name = mediaItem.name || `Meta ${type}`;

    setAttachedFile({
      name,
      url: mediaUrl,
      type,
    });

    let detectedAspect: string = "1:1";
    if (type === "IMAGE" && mediaUrl) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          const ratio = w / (h || 1);
          if (ratio < 0.65) detectedAspect = "9:16";
          else if (ratio < 0.9) detectedAspect = "4:5";
          else if (ratio > 1.35) detectedAspect = "16:9";
          else detectedAspect = "1:1";
          resolve();
        };
        img.onerror = () => resolve();
        img.src = mediaUrl;
      });
    }

    let updatedSession = session;
    if (session) {
      const updatedDraft = {
        ...session.draft,
        creative: {
          ...session.draft?.creative,
          mediaUrl,
          mediaType: type,
          aspectRatio: detectedAspect,
          mediaApproved: true,
        },
      };
      updatedSession = {
        ...session,
        draft: updatedDraft,
      };
      setSession(updatedSession);
    }

    setShowAdLibraryModal(false);
    const aspectLabel = detectedAspect === "9:16" ? "9:16 vertical story / reel" : detectedAspect === "16:9" ? "16:9 landscape banner" : detectedAspect === "4:5" ? "4:5 portrait post" : "1:1 square feed post";
    const additionalPrompt = inputText.trim() ? ` ${inputText.trim()}` : "";
    setInputText("");
    handleSendMessage(
      `Selected ${type === "IMAGE" ? "Image" : "Video"} "${name}" (${aspectLabel}) with aspectRatio: ${detectedAspect} from Meta Ad Library. Please use this graphic for the ad.${additionalPrompt}`,
      undefined,
      updatedSession || undefined
    );
  };

  const draft = session?.draft || {};
  const campaign = draft.campaign || {};
  const targeting = draft.targeting || {};
  const destination = draft.destination || {};
  const creative = draft.creative || {};
  const context: CampaignState["context"] = session?.context || {
    organizationId: "",
    isConnected: false,
    adAccounts: [],
    pages: [],
  };

  const activeAdAccount = context.adAccounts?.find((a: any) => a.adAccountId === draft.adAccountId) || context.adAccounts?.[0];
  const activePage = context.pages?.find((p: any) => p.id === draft.pageId) || context.pages?.[0];
  const extractedBrandName = campaign.name ? campaign.name.replace(/\s*(Sales|Leads|Traffic|Store Visit|Campaign|Ad).*$/i, "").trim() : null;
  const pageNameDisplay = extractedBrandName || draft.pageName || activePage?.name || "Official Business Page";
  const budgetVal = campaign.dailyBudget ? `₹${campaign.dailyBudget.toLocaleString()}/day` : null;
  const campaignTitle = campaign.name || "Meta Ad Campaign";

  // Helper to detect if a string is an age range (e.g. "20 to 45", "18-65") or invalid non-city string
  const isInvalidLocationName = (loc?: string): boolean => {
    if (!loc || typeof loc !== "string") return true;
    const clean = loc.trim();
    if (/^(?:age|aged|वय|उम्र)?\s*:?\s*\d{1,2}\s*(?:-|to|and|te|se|ते|से)\s*\d{1,2}\s*(?:years?|yrs|वर्ष|साल)?$/i.test(clean)) return true;
    if (/^\s*\d+\s*$/.test(clean)) return true;
    if (/^(?:male|female|men|women|all genders|वय|उम्र)\b/i.test(clean)) return true;
    return false;
  };

  // Extract clean valid target cities, stripping out any accidentally captured age ranges (like "20 to 45")
  const rawCities = Array.isArray(targeting.cities) ? targeting.cities : [];
  let cleanCities = rawCities.filter((c: string) => typeof c === "string" && !isInvalidLocationName(c));

  if (cleanCities.length === 0 && Array.isArray(targeting.cityConfigs) && targeting.cityConfigs.length > 0) {
    cleanCities = targeting.cityConfigs.map((c: any) => c.name).filter((n: string) => !isInvalidLocationName(n));
  }
  if (cleanCities.length === 0 && targeting.singleCity && !isInvalidLocationName(targeting.singleCity)) {
    cleanCities = [targeting.singleCity];
  }
  if (cleanCities.length === 0 && targeting.locationDescription && !isInvalidLocationName(targeting.locationDescription)) {
    cleanCities = targeting.locationDescription
      .split(/[,\/&|]\s*|\s+and\s+/i)
      .map((s: string) => s.trim())
      .filter((s: string) => !isInvalidLocationName(s));
  }
  // If still empty, scan conversation history for any city the user mentioned (e.g. Pune, Mumbai, Baner, etc.)
  if (cleanCities.length === 0 && Array.isArray(session?.conversation)) {
    const knownCities = [
      "Pune", "Mumbai", "Delhi", "Bangalore", "Bengaluru", "Hyderabad", "Kolkata", "Chennai",
      "Ahmedabad", "Surat", "Jaipur", "Lucknow", "Nagpur", "Nashik", "Indore", "Thane",
      "Bhopal", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Faridabad", "Meerut",
      "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Chhatrapati Sambhajinagar", "Dhanbad",
      "Amritsar", "Navi Mumbai", "Kolhapur", "Solapur", "Goa", "Maharashtra", "Baner", "Hinjewadi",
      "Wakad", "Kothrud", "Hadapsar", "Viman Nagar", "All India"
    ];
    for (const m of session.conversation) {
      if (m.sender === "user" && m.text) {
        for (const kc of knownCities) {
          if (new RegExp(`\\b${kc}\\b`, "i").test(m.text)) {
            if (!cleanCities.includes(kc)) cleanCities.push(kc);
          }
        }
      }
    }
  }

  const cleanLocationDesc = cleanCities.length > 0 ? cleanCities.join(", ") : (targeting.countries?.length ? targeting.countries.join(", ") : "");
  const hasValidLocation = cleanCities.length > 0 || (targeting.countries && targeting.countries.length > 0 && targeting.countries.some((c: string) => !isInvalidLocationName(c)));

  // Auto-heal session if targeting.cities or locationDescription has age ranges like "20 to 45"
  useEffect(() => {
    if (session?.draft?.targeting) {
      const tgt = session.draft.targeting;
      const invalidCityInDraft = (Array.isArray(tgt.cities) && tgt.cities.some(isInvalidLocationName)) ||
        (tgt.locationDescription && isInvalidLocationName(tgt.locationDescription));
      
      if (invalidCityInDraft) {
        const ageString = (Array.isArray(tgt.cities) ? tgt.cities.find(isInvalidLocationName) : null) || tgt.locationDescription;
        const ageMatch = typeof ageString === "string" ? ageString.match(/(\d{1,2})\s*[-_to\s&te]+\s*(\d{1,2})/i) : null;
        const ageMin = ageMatch ? parseInt(ageMatch[1], 10) : tgt.ageMin;
        const ageMax = ageMatch ? parseInt(ageMatch[2], 10) : tgt.ageMax;

        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            draft: {
              ...prev.draft,
              targeting: {
                ...prev.draft.targeting,
                cities: cleanCities,
                locationDescription: cleanLocationDesc,
                ageMin: ageMin || prev.draft.targeting.ageMin,
                ageMax: ageMax || prev.draft.targeting.ageMax,
              },
            },
          };
        });
      }
    }
  }, [session?.draft?.targeting?.cities, session?.draft?.targeting?.locationDescription]);

  // Check if user has started interaction / provided input
  const hasUserMessages = Boolean(session?.conversation?.some((m) => m.sender === "user"));
  const hasCreativeDetails = Boolean(
    creative.headline?.trim() ||
    creative.primaryText?.trim() ||
    creative.mediaUrl ||
    attachedFile
  );
  const hasCustomBudget = Boolean(campaign.dailyBudget && campaign.dailyBudget > 0);
  const hasCustomLocations = hasValidLocation;
  const hasUserGivenInput = hasUserMessages || hasCreativeDetails || hasCustomBudget || hasCustomLocations;

  const isReadyToReview = true;

  return (
    <div className="relative flex flex-col h-full w-full min-h-0 min-w-0 overflow-hidden bg-[#F1F5F9] font-sans antialiased text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Full-Screen Continuous Background Pattern across Entire Studio */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-45"
        aria-hidden="true"
        style={{
          backgroundImage: `url("/patterns/ai-chat-wallpaper.svg")`,
          backgroundRepeat: "repeat",
          backgroundSize: "320px 320px",
          backgroundPosition: "0 0",
        }}
      />

      {/* ── OFFICIAL JISNU AI TOP HEADER ── */}
      <header className="relative py-2.5 border-b border-slate-200/80 flex items-center justify-between px-6 shrink-0 bg-white/80 backdrop-blur-md z-10 shadow-2xs">
        <button
          onClick={() => router.push("/meta-ads")}
          title="Back to Meta Ads Overview"
          className="group flex items-center gap-2.5 py-1 px-2 -ml-2 rounded-2xl hover:bg-slate-100/70 transition-all duration-200 cursor-pointer active:scale-98 text-left"
        >
          <div className="relative flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-950 text-white shadow-sm ring-1 ring-slate-900/10 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/25 group-hover:shadow-md shrink-0">
            <span className="font-extrabold text-[13.5px] tracking-tighter bg-gradient-to-b from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent font-sans">
              J
            </span>
            <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[13px] tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                JISNU
              </span>
              <span className="text-[9.5px] font-black tracking-wider uppercase px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/80 shadow-3xs">
                AI
              </span>
            </div>
            <span className="text-[10.5px] font-medium text-slate-500 tracking-normal group-hover:text-slate-600 transition-colors">
              Ads Automation Studio
            </span>
          </div>
        </button>

        <div className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 select-none">
          <span className="tracking-tight text-[11.5px] font-semibold text-slate-900">JISNU AI</span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Senior Media Buyer</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetSession}
            title="Start fresh conversation"
            className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
          >
            <span className="flex items-center justify-center h-4 w-4 rounded-full bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <RotateCcw className="h-2.5 w-2.5 transition-transform duration-500 ease-out group-hover:-rotate-180" />
            </span>
            <span className="tracking-tight text-[11.5px] font-medium text-slate-700 group-hover:text-slate-900">Reset Chat</span>
          </button>
          <div
            title={`Connected Meta Ad Account: ${activeAdAccount ? activeAdAccount.name : "JISNU Digital Solution's Marketing Agency"} (${activeAdAccount?.adAccountId || "1454270479625110"})`}
            className="group relative hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 select-none cursor-default"
          >
            <span className="flex items-center justify-center h-4 w-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/80 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="tracking-tight text-[11.5px] font-semibold text-slate-800 truncate max-w-[220px]">
                {activeAdAccount ? activeAdAccount.name : "JISNU Digital Solution's Marketing Agency"}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN 2-COLUMN SPLIT STUDIO CONTAINER WITH FULL-SCREEN BG TEXTURE ── */}
      <div className="relative flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-[#F1F5F9]">
        {/* Full-Screen Continuous Background Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 opacity-45"
          aria-hidden="true"
          style={{
            backgroundImage: `url("/patterns/ai-chat-wallpaper.svg")`,
            backgroundRepeat: "repeat",
            backgroundSize: "320px 320px",
            backgroundPosition: "0 0",
          }}
        />

        {/* LEFT COLUMN: AI CHATBOT INBOX */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-transparent relative border-none z-1">
          {/* Scrollable Conversation Thread */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-6 space-y-4 relative z-1">
            <div className="relative max-w-2xl mx-auto space-y-4 z-1">
              {loadingInit ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400 mb-2" />
                  <p className="text-xs text-slate-500 font-medium">Initializing JISNU AI with live Meta context...</p>
                </div>
              ) : (
                <>
                  {/* Dynamic Conversation Thread */}
                  {session?.conversation
                    ?.filter((msg, idx, arr) => {
                      if (idx > 0 && arr[idx - 1].sender === msg.sender && arr[idx - 1].text?.trim() === msg.text?.trim()) {
                        return false;
                      }
                      return true;
                    })
                    .map((msg, index) => {
                    const isUser = msg.sender === "user";

                    if (isUser) {
                      return (
                        <div key={msg.id || index} className="flex justify-end animate-fadeIn">
                          <div className="max-w-[80%] bg-slate-900 text-white font-normal px-4 py-2.5 rounded-2xl rounded-tr-xs text-[13.5px] leading-relaxed shadow-xs break-words">
                            <p className="whitespace-pre-line">{formatCleanText(msg.text)}</p>
                            <div className="text-[10px] text-slate-400 text-right mt-1 font-medium">
                              {msg.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id || index} className="flex items-start gap-3 animate-fadeIn text-[13.5px] text-slate-800 leading-relaxed">
                        <div className="relative flex items-center justify-center h-7 w-7 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-950 text-white shrink-0 shadow-xs mt-0.5 ring-1 ring-slate-900/10 overflow-hidden font-extrabold text-[12px] tracking-tighter">
                          <span className="bg-gradient-to-b from-white to-indigo-100 bg-clip-text text-transparent">J</span>
                          <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
                        </div>

                        <div className="flex-1 space-y-2 max-w-[88%]">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[12px] text-slate-900 tracking-tight">JISNU AI</span>
                            <span className="text-[9.5px] font-black tracking-wider uppercase px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                              Senior Media Buyer
                            </span>
                          </div>

                          <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 shadow-2xs space-y-3">
                            <div className="prose prose-slate max-w-none text-[13.5px] leading-relaxed">
                              {formatCleanText(msg.text)}
                            </div>

                            {/* Options / Quick Buttons */}
                            {(() => {
                              const messageOptions = (msg as any).quickOptions || (msg as any).options || [];
                              if (!messageOptions || messageOptions.length === 0) return null;
                              return (
                                <div className="pt-2.5 mt-2 border-t border-slate-100 space-y-2">
                                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 tracking-wide">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                                    <span>Suggested Options & Ideas (Click to select or use as inspiration):</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {messageOptions.map((opt: any, oIdx: number) => (
                                      <button
                                        key={oIdx}
                                        type="button"
                                        onClick={() => {
                                          if (opt.value === "CONFIRM_PUBLISH" || opt.value === "confirm_and_launch") {
                                            handleConfirmPublish();
                                          } else if (opt.value === "OPEN_BULK_LOCATIONS") {
                                            openBulkLocationManager();
                                          } else if (opt.value === "upload_own_image") {
                                            fileInputRef.current?.click();
                                          } else if (opt.value === "tweak_ad" || opt.value === "EDIT_HEADLINE") {
                                            openEditModal("headline");
                                          } else {
                                            handleSendMessage(opt.value || opt.label);
                                          }
                                        }}
                                        className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-slate-50 to-indigo-50/50 hover:from-indigo-50 hover:to-blue-50 text-slate-700 hover:text-indigo-900 border border-slate-200/90 hover:border-indigo-300 transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50 active:scale-95 flex items-center gap-1.5 group"
                                      >
                                        <span className="group-hover:translate-x-0.5 transition-transform">{opt.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Sending Loader Indicator */}
                  {(isSending || isPublishing) && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 py-2 pl-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#0284C7]" />
                      <span>
                        {isPublishing
                          ? "Publishing Campaign, Ad Set, Creative, and Ad to Meta Graph API..."
                          : "JISNU AI is analyzing audience benchmarks and crafting ad copy..."}
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>

          {/* Bottom Chat Composer Input */}
          <div className="p-3.5 md:p-4 bg-transparent border-none shrink-0 z-10">
            <div className="max-w-2xl mx-auto">
              {error && (
                <div className="mb-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Attached File Indicator Pill */}
              {attachedFile && (
                <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-800 shadow-2xs animate-fadeIn">
                  <span>{attachedFile.type === "IMAGE" ? "🖼️" : "🎬"}</span>
                  <span className="font-semibold max-w-[200px] truncate">{attachedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}



              <div className="border border-indigo-200/80 hover:border-indigo-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 rounded-2xl p-3 bg-white/90 backdrop-blur-md shadow-md transition-all duration-200">
                <textarea
                  rows={2}
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    isRecording
                      ? "🎙️ Listening via Windows Speech Listener... speak now (words appear here in real-time)"
                      : "Type your message (e.g. 'Dental clinic in Baner, ₹500/day' or 'पुण्यात साडी सेल')..."
                  }
                  disabled={isSending || isPublishing}
                  className="w-full text-[13px] text-slate-900 placeholder:text-slate-400 outline-none resize-none px-2 py-1 bg-transparent leading-relaxed font-sans"
                />

                <div className="flex items-center justify-between pt-2 px-1 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 rounded-full text-[11.5px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/70 shadow-2xs hover:border-slate-300"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-slate-500" />
                      <span>Add file</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdLibraryModal(true);
                        fetchMediaLibrary();
                      }}
                      className="px-3 py-1 rounded-full text-[11.5px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/70 shadow-2xs hover:border-slate-300"
                    >
                      <Plus className="h-3.5 w-3.5 text-slate-500" />
                      <span>Select ad</span>
                    </button>
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`px-3 py-1 rounded-full text-[11.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer border shadow-2xs ${
                        isRecording
                          ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200/70 hover:border-slate-300"
                      }`}
                      title={isRecording ? "Listening via Windows Speech Listener... Click to stop" : "Speak using Windows Speech Listener"}
                    >
                      {isRecording ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping"></span>
                          <span className="font-semibold text-rose-700">Listening...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-3.5 w-3.5 text-slate-500" />
                          <span>Voice note</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={isSending || isPublishing || (!inputText.trim() && !attachedFile)}
                    className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 transition-all disabled:opacity-30 cursor-pointer active:scale-95 shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-center mt-1.5">
                <p className="text-[10.5px] text-slate-400">JISNU AI can make suggestions. Verify targeting, budget, and creatives before launching.</p>
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: LIVE AD PREVIEW & CAMPAIGN BLUEPRINT PANEL */}
        <div className="w-full md:w-[480px] lg:w-[540px] xl:w-[600px] 2xl:w-[660px] flex flex-col min-h-0 my-2 mr-2 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/80 shrink-0 shadow-md z-1 overflow-hidden">
          {/* Master Production Header Bar */}
          <div className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white flex items-center justify-center shadow-xs ring-1 ring-slate-900/10 shrink-0 overflow-hidden">
                {activePage?.picture ? (
                  <img src={activePage.picture} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <Sparkles className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-[13px] text-slate-900 tracking-tight">
                    Meta Ad Studio & Blueprint
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 truncate max-w-[170px]" title={`Business: ${pageNameDisplay}`}>
                    <User className="h-2.5 w-2.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{pageNameDisplay}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-medium truncate">
                  <span>Ad Account:</span>
                  <span className="font-mono font-bold text-slate-700">{activeAdAccount?.adAccountId || draft.adAccountId || "act_1454270479625110"}</span>
                  <span className="text-slate-300">·</span>
                  <span>Meta Graph API v26.0</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-3xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Meta Sync</span>
              </span>
            </div>
          </div>

          {/* Scrollable Blueprint Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
            {!hasUserGivenInput ? (
              /* AWAITING USER INPUT STATE: Do not show live preview, format tools, or campaign blueprint at once */
              <div className="h-full min-h-[460px] flex flex-col items-center justify-center p-6 text-center space-y-5 animate-fadeIn font-sans">
                <div className="relative">
                  <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-[#1877F2] via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-50">
                    <Sparkles className="h-8 w-8 animate-pulse" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </span>
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-extrabold text-base text-slate-900 tracking-tight">
                    Awaiting Your Campaign Details
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Live Meta Feed Ad Previews, format tools, and targeting blueprints generate in real-time once you start chatting with JISNU AI.
                  </p>
                </div>

                {/* 3 Step Interactive Visual Guidance Cards */}
                <div className="w-full max-w-sm space-y-2 text-left pt-1">
                  <div className="p-3 rounded-xl border border-sky-200/90 bg-sky-50/60 flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                      1
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900">Type Your Product or Service in Chat</div>
                      <div className="text-[11px] text-slate-500 leading-normal">
                        e.g. &ldquo;Dental clinic in Baner, ₹500/day&rdquo; or &ldquo;पुण्यात साडी सेल&rdquo;
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200/80 bg-white/70 flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800">Upload Media or Select Ad</div>
                      <div className="text-[11px] text-slate-500 leading-normal">
                        Attach your image, flyer or product photo to instantly preview across Facebook & Instagram
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200/80 bg-white/70 flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800">Live Step-by-Step Preview & Launch</div>
                      <div className="text-[11px] text-slate-500 leading-normal">
                        Meta Ad cards, hooks, budgets, and targeting blueprint populate only with your entered details
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Prompt Chips */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendMessage("I want to run a lead generation campaign for my business")}
                    className="px-3 py-1.5 bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>🎯 Start Lead Campaign</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload Ad Media</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-[13px] text-slate-800 leading-relaxed animate-fadeIn">
                  
                  {/* ── PRODUCTION-GRADE CAMPAIGN PRE-FLIGHT READINESS & LAUNCH TRACKER ── */}
                  {(() => {
                    interface ChecklistItem {
                      id: string;
                      name: string;
                      category: string;
                      hint: string;
                      isMissing: boolean;
                      icon: React.ReactNode;
                      userValue?: string;
                      userSubValue?: string;
                      userBadge?: string;
                      mediaThumbnail?: string;
                      actionLabel?: string;
                      onAction: () => void;
                      quickChips?: Array<{
                        label: string;
                        icon?: string;
                        onClick: () => void;
                      }>;
                    }

                    const activeRadius = targeting.radiusKm || (Array.isArray(targeting.cityConfigs) && targeting.cityConfigs[0]?.radiusKm) || 30;
                    const avgCpa = Math.round((context as any).accountMetrics?.avgCpa || (context as any).researchAudit?.avgCpa || 16);
                    const currentDailyBudget = campaign.dailyBudget || 750;
                    const currentMonthlyBudget = currentDailyBudget * 30;
                    const estMonthlyLeads = Math.max(12, Math.round(currentMonthlyBudget / (avgCpa || 16)));
                    const estImpressionsCount = Math.round(currentDailyBudget * 30 * 42);

                    const missingList: ChecklistItem[] = [
                      {
                        id: "media",
                        name: "Ad Image / Media Creative",
                        category: "Creative Asset",
                        hint: "Upload image flyer or video creative (1080×1080 Feed / 9:16 Reels) to complete deploy readiness",
                        isMissing: !attachedFile && !creative.mediaUrl,
                        icon: <ImageIcon className="h-4 w-4 text-purple-600" />,
                        userValue: attachedFile
                          ? (attachedFile.name || "Uploaded Creative File")
                          : creative.mediaUrl
                          ? `${creative.mediaType === "VIDEO" ? "Video Creative" : "Image Media Creative"} Linked`
                          : undefined,
                        userSubValue: attachedFile
                          ? `${attachedFile.type === "VIDEO" ? "Video" : "Image"} ready for Meta Feed & Reels · 1080×1080`
                          : creative.mediaUrl
                          ? "Synced with Meta Ad Creative Engine · Standard Placements"
                          : undefined,
                        mediaThumbnail: attachedFile?.url || creative.mediaUrl,
                        actionLabel: "+ Upload Media",
                        onAction: () => openEditModal("media"),
                        quickChips: [
                          {
                            label: "Upload File",
                            icon: "📤",
                            onClick: () => fileInputRef.current?.click(),
                          },
                          {
                            label: "Ad Library",
                            icon: "📁",
                            onClick: () => {
                              setShowAdLibraryModal(true);
                              fetchMediaLibrary();
                            },
                          },
                          {
                            label: "AI Generate",
                            icon: "✨",
                            onClick: () => handleSendMessage("Generate a compelling high-converting ad image for my campaign"),
                          },
                        ],
                      },
                      {
                        id: "headline",
                        name: "Ad Copy & Headline",
                        category: "Creative Copy",
                        hint: "Catchy hook, primary text, and headline for user engagement",
                        isMissing: !creative.headline || creative.headline.trim() === "",
                        icon: <FileText className="h-4 w-4 text-blue-600" />,
                        userValue: creative.headline ? `“${creative.headline}”` : undefined,
                        userSubValue: creative.primaryText
                          ? `Hook: ${creative.primaryText.slice(0, 80)}${creative.primaryText.length > 80 ? "..." : ""}`
                          : undefined,
                        actionLabel: "+ Generate Copy",
                        onAction: () => openEditModal("headline"),
                        quickChips: [
                          {
                            label: "AI Generate",
                            icon: "✨",
                            onClick: () => handleSendMessage("Generate high-converting headlines and primary text ad copy for my business"),
                          },
                          {
                            label: "Offer Hook",
                            icon: "🔥",
                            onClick: () => handleSendMessage("Suggest 3 discount or offer hooks for this ad copy"),
                          },
                        ],
                      },
                      {
                        id: "budget",
                        name: "Daily Campaign Budget",
                        category: "Budget & Pacing",
                        hint: "Set daily spend (minimum ₹100/day in INR for Meta delivery)",
                        isMissing: !campaign.dailyBudget || campaign.dailyBudget <= 0,
                        icon: <DollarSign className="h-4 w-4 text-emerald-600" />,
                        userValue: campaign.dailyBudget && campaign.dailyBudget > 0
                          ? `₹${campaign.dailyBudget.toLocaleString("en-IN")}/day (~₹${(campaign.dailyBudget * 30).toLocaleString("en-IN")}/mo) · Advantage+ CBO`
                          : undefined,
                        userSubValue: campaign.dailyBudget && campaign.dailyBudget > 0
                          ? `Est. ~${estMonthlyLeads.toLocaleString("en-IN")} Leads/Month (@ ~₹${avgCpa} CPA) · ~${estImpressionsCount.toLocaleString("en-IN")} impressions`
                          : undefined,
                        actionLabel: "+ Set Budget",
                        onAction: () => openEditModal("budget"),
                        quickChips: [
                          {
                            label: "₹500/day",
                            onClick: () => {
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    campaign: { ...session.draft.campaign, dailyBudget: 500 },
                                  },
                                });
                              }
                            },
                          },
                          {
                            label: "₹750/day",
                            onClick: () => {
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    campaign: { ...session.draft.campaign, dailyBudget: 750 },
                                  },
                                });
                              }
                            },
                          },
                          {
                            label: "₹1,000/day",
                            onClick: () => {
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    campaign: { ...session.draft.campaign, dailyBudget: 1000 },
                                  },
                                });
                              }
                            },
                          },
                          {
                            label: "₹2,000/day",
                            onClick: () => {
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    campaign: { ...session.draft.campaign, dailyBudget: 2000 },
                                  },
                                });
                              }
                            },
                          },
                        ],
                      },
                      {
                        id: "location",
                        name: "Target Location / City",
                        category: "Geo Targeting",
                        hint: "Define target cities, metro regions, or national radius",
                        isMissing: !hasValidLocation,
                        icon: <MapPin className="h-4 w-4 text-rose-600" />,
                        userValue: cleanCities.length > 0
                          ? cleanCities.map((c: string) => `${c} (${activeRadius} km)`).join(", ")
                          : (cleanLocationDesc || (hasValidLocation ? "All India" : undefined)),
                        userSubValue: cleanCities.length > 0
                          ? `${cleanCities.length} target location${cleanCities.length > 1 ? "s" : ""} · ${activeRadius} km radius geofence`
                          : (hasValidLocation ? "Pan-India National Distribution" : undefined),
                        actionLabel: "+ Add Location",
                        onAction: () => openBulkLocationManager(),
                        quickChips: [
                          {
                            label: "+ Pune & Mumbai",
                            onClick: () => handleSendMessage("Target audience in Pune and Mumbai with 30km radius"),
                          },
                          {
                            label: "Pan-India",
                            icon: "🇮🇳",
                            onClick: () => handleSendMessage("Set target location to All India"),
                          },
                          {
                            label: "Bulk Manager",
                            icon: "🗺️",
                            onClick: () => openBulkLocationManager(),
                          },
                        ],
                      },
                      {
                        id: "destination",
                        name: "Ad Destination & CRM Bot",
                        category: "Conversion Goal",
                        hint: "Where leads go when clicking the ad (WhatsApp, Instant Form, Website)",
                        isMissing: !destination.type || !session?.draft?.sourceMap?.["destination.type"],
                        icon: <MessageCircle className="h-4 w-4 text-teal-600" />,
                        userValue: destination.type && session?.draft?.sourceMap?.["destination.type"]
                          ? (destination.type === "WHATSAPP"
                              ? "💬 Click-to-WhatsApp (Pre-filled instant greeting)"
                              : destination.type === "INSTANT_FORM" || destination.type === "LEAD_FORM"
                              ? "Instant Lead Form"
                              : destination.type === "WEBSITE"
                              ? "Website Landing Page"
                              : destination.type === "PHONE_CALL"
                              ? "Click to Call"
                              : destination.type)
                          : undefined,
                        userSubValue: destination.type && session?.draft?.sourceMap?.["destination.type"]
                          ? (destination.type === "WHATSAPP"
                              ? (destination.whatsappPhoneNumber ? `WABA Target: ${destination.whatsappPhoneNumber}` : "Auto-Linked to CRM WhatsApp Welcome Bot Flow · CTA: SEND_WHATSAPP_MESSAGE")
                              : destination.websiteUrl || destination.destinationUrl
                              ? `URL: ${destination.websiteUrl || destination.destinationUrl}`
                              : "Direct customer inquiries stream to business channel")
                          : undefined,
                        actionLabel: "+ Set Destination",
                        onAction: () => openEditModal("destination"),
                        quickChips: [
                          {
                            label: "WhatsApp",
                            icon: "💬",
                            onClick: () => {
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    destination: { ...session.draft.destination, type: "WHATSAPP" },
                                    creative: { ...session.draft.creative, callToAction: "WHATSAPP_MESSAGE" },
                                  },
                                });
                              }
                            },
                          },
                          {
                            label: "Lead Form",
                            icon: "📋",
                            onClick: () => {
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    destination: { ...session.draft.destination, type: "INSTANT_FORM" },
                                    creative: { ...session.draft.creative, callToAction: "APPLY_NOW" },
                                  },
                                });
                              }
                            },
                          },
                          {
                            label: "Website",
                            icon: "🌐",
                            onClick: () => {
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    destination: { ...session.draft.destination, type: "WEBSITE" },
                                    creative: { ...session.draft.creative, callToAction: "LEARN_MORE" },
                                  },
                                });
                              }
                            },
                          },
                        ],
                      },
                      {
                        id: "account",
                        name: "Meta Ad Account",
                        category: "Account & Billing",
                        hint: "Connect or select active Meta Ad Account for billing",
                        isMissing: !draft.adAccountId && (!context.adAccounts || context.adAccounts.length === 0),
                        icon: <Building2 className="h-4 w-4 text-indigo-600" />,
                        userValue: activeAdAccount
                          ? `${activeAdAccount.name} (${activeAdAccount.adAccountId || activeAdAccount.id})`
                          : (draft.adAccountId ? `JISNU Digital Solution's Marketing Agency (${draft.adAccountId})` : "JISNU Digital Solution's Marketing Agency (act_1454270479625110)"),
                        userSubValue: `Currency: ${activeAdAccount?.currency || "INR"} · Verified Meta Business Ad Account`,
                        actionLabel: "+ Connect Account",
                        onAction: () => openEditModal("account"),
                      },
                      {
                        id: "page",
                        name: "Facebook Page & Identity",
                        category: "Publisher Identity",
                        hint: "Facebook & Instagram business page identity for publishing",
                        isMissing: !draft.pageId && !activePage?.id && !draft.pageName && !pageNameDisplay,
                        icon: <Share2 className="h-4 w-4 text-sky-600" />,
                        userValue: activePage?.name
                          ? `${activePage.name} (${activePage.id})`
                          : pageNameDisplay
                          ? `${pageNameDisplay} (${draft.pageId || "1062234726963242"})`
                          : "JISNU Digital Solutions Pvt.Ltd (1062234726963242)",
                        userSubValue: "Official Meta Business Page · Synced with Instagram Placement",
                        actionLabel: "+ Select Page",
                        onAction: () => openEditModal("page"),
                      },
                      {
                        id: "audience",
                        name: "Demographics & Advantage+ Placements",
                        category: "Audience & Placements",
                        hint: "Age range, gender, and automated Meta Advantage+ placement network",
                        isMissing: !((targeting.ageMin && targeting.ageMax && session?.draft?.sourceMap?.["targeting.ageMin"]) || (targeting.interests && targeting.interests.length > 0 && session?.draft?.sourceMap?.["targeting.interests"]) || session?.draft?.sourceMap?.["targeting.advantagePlusAudience"]),
                        icon: <Users className="h-4 w-4 text-violet-600" />,
                        userValue: ((targeting.ageMin && targeting.ageMax && session?.draft?.sourceMap?.["targeting.ageMin"]) || (targeting.interests && targeting.interests.length > 0 && session?.draft?.sourceMap?.["targeting.interests"]) || session?.draft?.sourceMap?.["targeting.advantagePlusAudience"])
                          ? `Age: ${targeting.ageMin || 20} to ${targeting.ageMax || 45} · Gender: ${targeting.gender === "MEN" ? "Men" : targeting.gender === "WOMEN" ? "Women" : "All Genders"}`
                          : undefined,
                        userSubValue: ((targeting.ageMin && targeting.ageMax && session?.draft?.sourceMap?.["targeting.ageMin"]) || (targeting.interests && targeting.interests.length > 0 && session?.draft?.sourceMap?.["targeting.interests"]) || session?.draft?.sourceMap?.["targeting.advantagePlusAudience"])
                          ? (targeting.interests && targeting.interests.length > 0
                              ? `🎯 Detailed Signals (${targeting.interests.length}): ${targeting.interests.slice(0, 3).join(", ")}${targeting.interests.length > 3 ? "..." : ""} · Advantage+ Placements`
                              : "Advantage+ Detailed Targeting (use ai to suggest & add) · Placements (FB & IG Feeds, Reels, Stories)")
                          : undefined,
                        actionLabel: "Edit",
                        onAction: () => openEditModal("audience"),
                        quickChips: [
                          {
                            label: "✨ AI Suggest & Add",
                            icon: "🎯",
                            onClick: () => {
                              handleSendMessage("Suggest and add detailed targeting (demographics, interests & behaviours) for my business");
                            },
                          },
                          {
                            label: "Age 20–45",
                            onClick: () => {
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    targeting: { ...session.draft.targeting, ageMin: 20, ageMax: 45 },
                                  },
                                });
                              }
                            },
                          },
                          {
                            label: "Age 25–55",
                            onClick: () => {
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    targeting: { ...session.draft.targeting, ageMin: 25, ageMax: 55 },
                                  },
                                });
                              }
                            },
                          },
                          {
                            label: "All Genders",
                            onClick: () => {
                              if (session) {
                                setSession({
                                  ...session,
                                  draft: {
                                    ...session.draft,
                                    targeting: { ...session.draft.targeting, gender: "ALL" },
                                  },
                                });
                              }
                            },
                          },
                          {
                            label: "Browse Categories",
                            icon: "🏷️",
                            onClick: () => openDetailedTargetingModal(),
                          },
                        ],
                      },
                    ];

                    const total = missingList.length;
                    const completed = missingList.filter((m) => !m.isMissing).length;
                    const percent = Math.round((completed / total) * 100);
                    const missingCount = total - completed;

                    const filteredList = missingList.filter((m) => {
                      if (checklistFilter === "ACTION_NEEDED") return m.isMissing;
                      if (checklistFilter === "READY") return !m.isMissing;
                      return true;
                    });

                    return (
                      <div className="bg-gradient-to-b from-white via-white to-slate-50/70 border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3.5 animate-fadeIn">
                        {/* ── Campaign Identity & Meta Specification Strip ── */}
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 text-[11px]">
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 truncate">
                                {campaignTitle}
                              </span>
                              <span className="px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-800 font-bold text-[10px]">
                                v{session?.versionNumber || 2}
                              </span>
                            </div>
                            <span className="text-slate-300 hidden sm:inline">·</span>
                            <span className="text-slate-700 font-bold flex items-center gap-1">
                              <Target className="h-3 w-3 text-blue-600 shrink-0" />
                              <span>🎯 {campaign.objective || "OUTCOME_LEADS"}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              (ODAX Framework)
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                            <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-3xs">
                              Special Categories: {campaign.specialAdCategory || "NONE"}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/80 shadow-3xs flex items-center gap-1" title="Meta Pixel Dataset">
                              <Hash className="h-2.5 w-2.5 text-indigo-600" />
                              <span>Pixel: {draft.pixelId || context?.pixelId || "1380912777544016"}</span>
                            </span>
                          </div>
                        </div>

                        {/* ── Top Header Strip ── */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                                missingCount === 0
                                  ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                                  : "bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-amber-500/20"
                              }`}
                            >
                              {missingCount === 0 ? <CheckCircle className="h-4 w-4" /> : <Sparkles className="h-3.5 w-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-xs text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                                <span>Campaign Pre-Flight Readiness</span>
                                <span className="text-[10px] font-bold text-slate-400">({completed}/{total})</span>
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium truncate">
                                {missingCount === 0
                                  ? "All 8 production launch parameters verified and ready for deploy!"
                                  : `${missingCount} critical item${missingCount > 1 ? "s" : ""} needed before live Meta deploy`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border shadow-3xs ${
                                missingCount === 0
                                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                  : "text-amber-800 bg-amber-50 border-amber-200"
                              }`}
                            >
                              {percent}% Ready
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              title={isChecklistExpanded ? "Collapse checklist" : "Expand checklist"}
                            >
                              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isChecklistExpanded ? "rotate-180" : ""}`} />
                            </button>
                          </div>
                        </div>

                        {/* ── Progress Bar ── */}
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              missingCount === 0
                                ? "bg-emerald-500"
                                : "bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {/* ── 100% Launch Banner (Shown when ready to deploy) ── */}
                        {missingCount === 0 && (
                          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-8.5 w-8.5 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-5 w-5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-extrabold text-xs text-white">All 8 Meta Launch Requirements Verified!</h5>
                                <p className="text-[10.5px] text-emerald-100 truncate">
                                  Your campaign conforms with Meta Ads Graph API standards.
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleConfirmPublish}
                              disabled={isPublishing}
                              className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95 disabled:opacity-50"
                            >
                              {isPublishing ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
                                  <span>Publishing...</span>
                                </>
                              ) : (
                                <>
                                  <Rocket className="h-3.5 w-3.5 text-emerald-700" />
                                  <span>🚀 Launch Live Campaign</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* ── Filter Segmented Tabs ── */}
                        {isChecklistExpanded && (
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                            <div className="inline-flex rounded-lg p-0.5 bg-slate-100/90 border border-slate-200/80 text-[11px] font-semibold">
                              <button
                                type="button"
                                onClick={() => setChecklistFilter("ALL")}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                                  checklistFilter === "ALL"
                                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                <span>All Items</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-700 font-bold">
                                  {total}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setChecklistFilter("ACTION_NEEDED")}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                                  checklistFilter === "ACTION_NEEDED"
                                    ? "bg-white text-amber-800 shadow-2xs font-bold"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                <span>Action Needed</span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                    missingCount > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-200/70 text-slate-600"
                                  }`}
                                >
                                  {missingCount}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setChecklistFilter("READY")}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                                  checklistFilter === "READY"
                                    ? "bg-white text-emerald-800 shadow-2xs font-bold"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                <span>Ready</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                  {completed}
                                </span>
                              </button>
                            </div>

                            <span className="text-[10.5px] text-slate-400 font-medium hidden sm:inline">
                              {missingCount > 0 ? `${missingCount} pending` : "Ready to launch"}
                            </span>
                          </div>
                        )}

                        {/* ── Checklist Cards List ── */}
                        {isChecklistExpanded && (
                          <div className="space-y-2 pt-1">
                            {filteredList.map((m) => (
                              <div
                                key={m.id}
                                className={`p-3 rounded-xl border transition-all duration-200 ${
                                  m.isMissing
                                    ? "bg-amber-50/40 border-amber-200/80 shadow-2xs hover:bg-amber-50/60"
                                    : "bg-white/95 border-slate-200/90 shadow-2xs hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  {/* Left: Icon or Media Thumbnail + Content */}
                                  <div className="flex items-start gap-3 min-w-0 flex-1">
                                    {m.mediaThumbnail && !m.isMissing ? (
                                      <div className="h-10 w-10 rounded-xl overflow-hidden border border-emerald-300 shrink-0 bg-slate-100 shadow-2xs relative">
                                        {m.userBadge === "VIDEO" || /\.(mp4|webm|mov)$/i.test(m.mediaThumbnail) ? (
                                          <video src={m.mediaThumbnail} className="h-full w-full object-cover" />
                                        ) : (
                                          <img src={m.mediaThumbnail} alt="Thumbnail" className="h-full w-full object-cover" />
                                        )}
                                        <div className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                                          ✓
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                                          m.isMissing
                                            ? "bg-amber-100 text-amber-800 border border-amber-300/80"
                                            : "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                                        }`}
                                      >
                                        {m.icon}
                                      </div>
                                    )}

                                    {/* Main Info Block */}
                                    <div className="min-w-0 flex-1 space-y-1">
                                      {/* Title & Category Badge */}
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[12.5px] font-bold text-slate-900 tracking-tight">
                                          {m.name}
                                        </span>
                                        <span className="text-[9.5px] px-1.5 py-0.2 rounded-md font-semibold bg-slate-100 text-slate-600 border border-slate-200/70">
                                          {m.category}
                                        </span>
                                        <span
                                          className={`text-[9.5px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                                            m.isMissing
                                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          }`}
                                        >
                                          {m.isMissing ? "● Missing" : "✓ Ready"}
                                        </span>
                                      </div>

                                      {/* User Parameter Value / Content */}
                                      {m.isMissing ? (
                                        <p className="text-[11.5px] text-amber-900/90 font-medium leading-relaxed">
                                          {m.hint}
                                        </p>
                                      ) : (
                                        <div className="space-y-0.5">
                                          <p className="text-[12px] font-semibold text-slate-800 break-words" title={m.userValue}>
                                            {m.userValue}
                                          </p>
                                          {m.userSubValue && (
                                            <p className="text-[11px] text-slate-500 font-normal break-words" title={m.userSubValue}>
                                              {m.userSubValue}
                                            </p>
                                          )}
                                        </div>
                                      )}

                                      {/* Quick Action Chips */}
                                      {m.quickChips && m.quickChips.length > 0 && (
                                        <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                                          {m.quickChips.map((chip, cIdx) => (
                                            <button
                                              key={cIdx}
                                              type="button"
                                              onClick={chip.onClick}
                                              className="px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-3xs cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                                            >
                                              {chip.icon && <span>{chip.icon}</span>}
                                              <span>{chip.label}</span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right: Action Button */}
                                  <div className="shrink-0 flex items-center gap-1.5 self-center">
                                    {m.isMissing ? (
                                      <button
                                        type="button"
                                        onClick={m.onAction}
                                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                                      >
                                        <span>{m.actionLabel || "+ Add"}</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={m.onAction}
                                        className="px-2.5 py-1 rounded-lg text-[10.5px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all cursor-pointer flex items-center gap-1"
                                        title="Edit parameter"
                                      >
                                        <span>Edit</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 1. Live Facebook & Instagram Feed Ad Preview Card */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="font-bold text-[13px] text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-[#1877F2]" />
                        <span>Live Meta Feed Ad Preview & Format Tools</span>
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Preview Tools Action Buttons */}
                        <button
                          type="button"
                          onClick={() => {
                            if (session) {
                              const current = (creative as any).previewPlatform || "FACEBOOK_FEED";
                              const next = current === "FACEBOOK_FEED" ? "INSTAGRAM_FEED" : current === "INSTAGRAM_FEED" ? "WHATSAPP_FEED" : "FACEBOOK_FEED";
                              setSession({
                                ...session,
                                draft: {
                                  ...session.draft,
                                  creative: {
                                    ...session.draft.creative,
                                    previewPlatform: next,
                                  },
                                },
                              });
                            }
                          }}
                          className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer flex items-center gap-1"
                          title="Switch to next platform preview"
                        >
                          <span>🔄 Switch Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (session) {
                              handleSendMessage("Generate alternative copy variations and text hooks for my ad");
                            }
                          }}
                          className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer flex items-center gap-1"
                          title="See how different text combinations or media crops appear"
                        >
                          <span>✨ See more variations</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const shareUrl = window.location.href;
                            navigator.clipboard?.writeText(shareUrl);
                            alert("📋 Preview Link Copied! Send this link to others for review.");
                          }}
                          className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
                          title="Generate a link to send previews to others for review"
                        >
                          <span>🔗 Share</span>
                        </button>
                      </div>
                    </div>

                    {/* Meta Ad Format Selector (Single Media vs Carousel vs Advantage+ Catalogue) */}
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-600">Select Ad Format:</span>
                        <span className="text-[10px] text-slate-400 font-medium">Meta Ads Spec</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (session) {
                              setSession({
                                ...session,
                                draft: {
                                  ...session.draft,
                                  creative: {
                                    ...session.draft.creative,
                                    format: "SINGLE_MEDIA",
                                  },
                                },
                              });
                            }
                          }}
                          className={`p-2 rounded-lg text-left transition-all cursor-pointer border ${
                            !creative.format || creative.format === "SINGLE_MEDIA"
                              ? "bg-blue-50/90 border-[#1877F2] text-blue-950 font-bold shadow-2xs"
                              : "bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <div className="text-[11px] font-bold flex items-center gap-1">
                            <span>🖼️ Single Image or Video</span>
                          </div>
                          <p className="text-[9.5px] text-slate-500 font-normal leading-tight mt-0.5">
                            Showing a single piece of media with your headline & WhatsApp call to action.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (session) {
                              setSession({
                                ...session,
                                draft: {
                                  ...session.draft,
                                  creative: {
                                    ...session.draft.creative,
                                    format: "CAROUSEL",
                                    carouselCards: creative.carouselCards || [
                                      { headline: creative.headline || "Special Offer Card 1", mediaUrl: creative.mediaUrl },
                                      { headline: "Featured Product Card 2", mediaUrl: creative.mediaUrl },
                                      { headline: "Customer Review Card 3", mediaUrl: creative.mediaUrl },
                                    ],
                                  },
                                },
                              });
                            }
                          }}
                          className={`p-2 rounded-lg text-left transition-all cursor-pointer border ${
                            creative.format === "CAROUSEL"
                              ? "bg-purple-50/90 border-purple-600 text-purple-950 font-bold shadow-2xs"
                              : "bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <div className="text-[11px] font-bold flex items-center gap-1">
                            <span>🎠 Carousel (Multi-Card)</span>
                          </div>
                          <p className="text-[9.5px] text-slate-500 font-normal leading-tight mt-0.5">
                            Show 2 or more scrollable images or videos, each with its own headline & link.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            alert("Advantage+ catalogue ads: Connect Meta Commerce Manager catalogue to auto-drive sales with dynamic product media.");
                          }}
                          className="p-2 rounded-lg text-left transition-all cursor-pointer border bg-slate-50 border-slate-200/80 text-slate-400 opacity-80 hover:bg-slate-100 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold">🛍️ Advantage+ Catalogue</span>
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">Disabled</span>
                          </div>
                          <p className="text-[9.5px] text-slate-400 font-normal leading-tight mt-0.5">
                            Automatically drives sales by showing relevant catalogue product media to each person.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Facebook Feed Card Mockup */}
                    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-md">
                      {/* Interactive Copy Angle Variations Selector */}
                      {creative.variations && creative.variations.length > 0 && (
                        <div className="bg-slate-900 text-white p-3 border-b border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-sky-400 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> Production Copy Variations (AI Engineered)
                            </span>
                            <span className="text-[10px] text-slate-400">Click to preview angle</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {creative.variations.map((v: any, vIdx: number) => {
                              const isSelected = creative.headline === v.headline;
                              return (
                                <button
                                  key={vIdx}
                                  type="button"
                                  onClick={() => {
                                    if (session) {
                                      setSession({
                                        ...session,
                                        draft: {
                                          ...session.draft,
                                          creative: {
                                            ...session.draft.creative,
                                            headline: v.headline,
                                            primaryText: v.primaryText,
                                            description: v.description || session.draft.creative.description,
                                          },
                                        },
                                      });
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-[#1877F2] text-white shadow-xs"
                                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                  }`}
                                >
                                  {v.angle === "DIRECT_OFFER"
                                    ? "🔥 Direct Offer"
                                    : v.angle === "PAIN_POINT_CURIOSITY"
                                    ? "⚡ Pain Point & Hook"
                                    : "⭐ Social Proof"}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Placement Platform & Aspect Ratio Selector Controls (Meta Ads Manager Spec) */}
                      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 space-y-3 text-[11px] text-white rounded-t-xl">
                        {/* Platform Selector Tabs (Facebook vs Instagram vs Stories vs Right Column vs All Grid) */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-sky-400 uppercase tracking-widest text-[9.5px]">Platform & Placement Mode:</span>
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                              {[
                                { id: "FACEBOOK_FEED", label: "Facebook Feed", icon: "📘", activeBg: "bg-[#1877F2]" },
                                { id: "INSTAGRAM_FEED", label: "Instagram Feed", icon: "📸", activeBg: "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500" },
                                { id: "WHATSAPP_FEED", label: "WhatsApp Feed", icon: "🟢", activeBg: "bg-[#25D366] text-slate-950" },
                                { id: "STORIES_REELS", label: "Stories & Reels", icon: "🎬", activeBg: "bg-gradient-to-r from-purple-600 to-pink-600" },
                                { id: "MESSENGER_FEED", label: "Messenger Inbox", icon: "💬", activeBg: "bg-[#0084FF]" },
                                { id: "RIGHT_COLUMN", label: "Right Column", icon: "💻", activeBg: "bg-indigo-600" },
                              ].map((plat) => {
                                const currentSelectedPlat = (creative as any).previewPlatform || "FACEBOOK_FEED";
                                const isPlatSelected = currentSelectedPlat === plat.id;
                                return (
                                  <button
                                    key={plat.id}
                                    type="button"
                                    onClick={() => {
                                      if (session) {
                                        const autoRatio = plat.id === "STORIES_REELS" ? "9:16" : plat.id === "RIGHT_COLUMN" || plat.id === "INSTAGRAM_FEED" ? "1:1" : creative.aspectRatio || "1:1";
                                        setSession({
                                          ...session,
                                          draft: {
                                            ...session.draft,
                                            creative: {
                                              ...session.draft.creative,
                                              previewPlatform: plat.id,
                                              previewSubPlacement: plat.id === "INSTAGRAM_FEED" ? "IG_FEED" : plat.id === "FACEBOOK_FEED" ? "FB_FEED" : undefined,
                                              aspectRatio: autoRatio,
                                            },
                                          },
                                        });
                                      }
                                    }}
                                    className={`px-2.5 py-1.5 rounded-lg font-bold text-[10.5px] whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                      isPlatSelected
                                        ? `${plat.activeBg} text-white font-extrabold ring-2 ring-white/30 scale-[1.02]`
                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                    }`}
                                  >
                                    <span>{plat.icon}</span>
                                    <span>{plat.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Sub-Placement Specific Feed Variations Pill Bar */}
                          {((creative as any).previewPlatform === "FACEBOOK_FEED" || !(creative as any).previewPlatform) && (creative as any).previewPlatform !== "ALL_GRID" && (
                            <div className="flex items-center gap-1.5 pt-1.5 overflow-x-auto no-scrollbar border-t border-slate-800">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase shrink-0">Feed Surface:</span>
                              {[
                                { id: "FB_FEED", label: "Facebook Main Feed" },
                                { id: "FB_MARKETPLACE", label: "Facebook Marketplace" },
                                { id: "FB_PROFILE", label: "Facebook Profile Feed" },
                              ].map((sub) => {
                                const isSubActive = (creative as any).previewSubPlacement === sub.id || (!(creative as any).previewSubPlacement && sub.id === "FB_FEED");
                                return (
                                  <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => {
                                      if (session) {
                                        setSession({
                                          ...session,
                                          draft: {
                                            ...session.draft,
                                            creative: {
                                              ...session.draft.creative,
                                              previewSubPlacement: sub.id,
                                            },
                                          },
                                        });
                                      }
                                    }}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                      isSubActive
                                        ? "bg-[#1877F2] text-white shadow-xs"
                                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                                    }`}
                                  >
                                    {sub.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {((creative as any).previewPlatform === "INSTAGRAM_FEED") && (
                            <div className="flex items-center gap-1.5 pt-1.5 overflow-x-auto no-scrollbar border-t border-slate-800">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase shrink-0">Feed Surface:</span>
                              {[
                                { id: "IG_FEED", label: "Instagram Main Feed" },
                                { id: "IG_PROFILE", label: "Instagram Profile Feed" },
                                { id: "IG_EXPLORE", label: "Instagram Explore" },
                              ].map((sub) => {
                                const isSubActive = (creative as any).previewSubPlacement === sub.id || (!(creative as any).previewSubPlacement && sub.id === "IG_FEED");
                                return (
                                  <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => {
                                      if (session) {
                                        setSession({
                                          ...session,
                                          draft: {
                                            ...session.draft,
                                            creative: {
                                              ...session.draft.creative,
                                              previewSubPlacement: sub.id,
                                            },
                                          },
                                        });
                                      }
                                    }}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                      isSubActive
                                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs"
                                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                                    }`}
                                  >
                                    {sub.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Aspect Ratio Selector Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <span className="font-bold text-slate-300 text-[10px] uppercase tracking-wider">Ad Media Aspect Ratio:</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                if (session) {
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      creative: {
                                        ...session.draft.creative,
                                        aspectRatio: "1:1",
                                      },
                                    },
                                  });
                                }
                              }}
                              className={`px-2.5 py-1 rounded-md font-bold transition-all text-[10.5px] flex items-center gap-1 cursor-pointer ${
                                creative.aspectRatio === "1:1" || !creative.aspectRatio
                                  ? "bg-sky-500 text-white shadow-xs"
                                  : "bg-slate-800 text-slate-400 hover:text-white"
                              }`}
                            >
                              <span>🖼️ 1:1 Feed Post</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (session) {
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      creative: {
                                        ...session.draft.creative,
                                        aspectRatio: "9:16",
                                        previewPlatform: "STORIES_REELS",
                                      },
                                    },
                                  });
                                }
                              }}
                              className={`px-2.5 py-1 rounded-md font-bold transition-all text-[10.5px] flex items-center gap-1 cursor-pointer ${
                                creative.aspectRatio === "9:16"
                                  ? "bg-purple-500 text-white shadow-xs"
                                  : "bg-slate-800 text-slate-400 hover:text-white"
                              }`}
                            >
                              <span>📱 9:16 Story/Reel</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (session) {
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      creative: {
                                        ...session.draft.creative,
                                        aspectRatio: "16:9",
                                      },
                                    },
                                  });
                                }
                              }}
                              className={`px-2.5 py-1 rounded-md font-bold transition-all text-[10.5px] flex items-center gap-1 cursor-pointer ${
                                creative.aspectRatio === "16:9"
                                  ? "bg-indigo-500 text-white shadow-xs"
                                  : "bg-slate-800 text-slate-400 hover:text-white"
                              }`}
                            >
                              <span>🖥️ 16:9 Banner</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* ───────────────────────────────────────────────────────────── */}
                      {/* DYNAMIC METAMOCKUP PLATFORM CARDS (PRODUCTION GRADE DESIGN)  */}
                      {/* ───────────────────────────────────────────────────────────── */}
                      {(() => {
                        const activeMediaUrl = attachedFile?.url || creative.mediaUrl;
                        const activeMediaType = attachedFile?.type || creative.mediaType || "IMAGE";
                        const isVideoMedia = activeMediaType === "VIDEO" || (activeMediaUrl && /\.(mp4|webm|mov)$/i.test(activeMediaUrl));
                        const currentPlat = (creative as any).previewPlatform || "FACEBOOK_FEED";

                        // Official Meta Graph API Iframe HTML embedding
                        if (loadingMetaIframe) {
                          return (
                            <div className="bg-white rounded-b-xl p-8 text-center space-y-2 border border-slate-200">
                              <Loader2 className="h-6 w-6 animate-spin text-[#1877F2] mx-auto" />
                              <p className="text-xs text-slate-600 font-semibold">Fetching official Meta Graph API Ad Preview HTML...</p>
                            </div>
                          );
                        }

                        if (metaIframeHtml) {
                          return (
                            <div className="bg-white rounded-b-xl overflow-hidden shadow-sm border border-slate-200 p-2">
                              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center justify-between px-2">
                                <span>Official Meta Graph API Live Iframe Render</span>
                                <span className="bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">v26.0 Graph API</span>
                              </div>
                              <div
                                className="w-full flex justify-center overflow-x-auto min-h-[300px]"
                                dangerouslySetInnerHTML={{ __html: metaIframeHtml }}
                              />
                            </div>
                          );
                        }

                        const hasUserCreative = Boolean(
                          creative.primaryText?.trim() ||
                          creative.headline?.trim() ||
                          creative.mediaUrl ||
                          attachedFile
                        );

                        return (
                          <div className="bg-slate-100 p-3 sm:p-4 rounded-b-xl">
                            {/* PROGRESSIVE ONBOARDING STAGE: When user has not provided creative details yet */}
                            {!hasUserCreative ? (
                              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-4 max-w-lg mx-auto animate-fadeIn font-sans">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center mx-auto text-white shadow-md">
                                  <Sparkles className="h-7 w-7 animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="font-extrabold text-base text-slate-900 tracking-tight">
                                    Step-by-Step Live Ad Preview
                                  </h4>
                                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                    Your live ad preview builds automatically step-by-step as you chat with JISNU AI. Nothing is shown until you provide your details.
                                  </p>
                                </div>

                                <div className="space-y-2.5 text-left pt-2">
                                  <div className="p-3 rounded-xl border border-sky-200 bg-sky-50/70 flex items-start gap-3 transition-all hover:bg-sky-50">
                                    <div className="h-6 w-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                      1
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold text-slate-900">Share your Offer or Service in Chat</div>
                                      <div className="text-[11px] text-slate-500">
                                        Tell JISNU AI what you are selling or promoting (e.g. &ldquo;Dental clinic in Baner, ₹500/day&rdquo;)
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                      2
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold text-slate-700">Upload Media or Select Ad</div>
                                      <div className="text-[11px] text-slate-500">
                                        Add your banner, product photo, or flyer to preview across Facebook and Instagram feeds
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                      3
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold text-slate-700">Review Live Multi-Platform Render</div>
                                      <div className="text-[11px] text-slate-500">
                                        Inspect how your exact ad looks across Instagram, Facebook, Stories, and WhatsApp before deploying
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-2 flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSendMessage("Help me write an ad headline and copy for my business")}
                                    className="px-3.5 py-2 bg-[#1877F2] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Ask JISNU AI to Draft Copy</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    <ImageIcon className="h-3.5 w-3.5 text-slate-600" />
                                    <span>Upload Media</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>

                                {/* CARD 1: FACEBOOK FEED / MARKETPLACE / PROFILE FEED */}
                                {(!((creative as any).previewPlatform) || (creative as any).previewPlatform === "FACEBOOK_FEED") && (
                                  <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200 text-left font-sans transition-all duration-300 max-w-lg mx-auto">
                                    {/* FB Marketplace Variation */}
                                    {(creative as any).previewSubPlacement === "FB_MARKETPLACE" ? (
                                      <div className="p-3.5 space-y-2.5 bg-white">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                          <div className="flex items-center gap-2.5">
                                            <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-2xs">
                                              <img src={activePage?.picture || "/icon.jpeg"} alt="Logo" className="h-full w-full object-cover" />
                                            </div>
                                            <div>
                                              <div className="font-extrabold text-slate-900 text-xs truncate max-w-[160px]">{pageNameDisplay}</div>
                                              <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Facebook Marketplace Ad</div>
                                            </div>
                                          </div>
                                          <span className="text-slate-400 text-sm cursor-pointer hover:text-slate-600">•••</span>
                                        </div>
                                        <div className="relative w-full aspect-square bg-slate-950 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-slate-200/80">
                                          {activeMediaUrl ? (
                                            isVideoMedia ? (
                                              <video src={activeMediaUrl} controls className="w-full h-full object-cover" />
                                            ) : (
                                              <img src={activeMediaUrl} alt="Marketplace Ad" className="w-full h-full object-cover" />
                                            )
                                          ) : (
                                            <div className="p-6 text-center text-slate-400 space-y-1.5 bg-slate-100 w-full h-full flex flex-col items-center justify-center">
                                              <ImageIcon className="h-7 w-7 text-slate-400 mx-auto" />
                                              <div className="text-xs font-semibold text-slate-600">Media creative not provided</div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="pt-1 flex items-center justify-between gap-2">
                                          <div className="text-xs font-extrabold text-slate-900 truncate">
                                            {creative.headline?.trim() || <span className="text-slate-400 font-normal italic text-[11px]">No headline specified</span>}
                                          </div>
                                          <span className="px-3 py-1 bg-blue-50 text-[#1877F2] font-bold text-[11px] rounded-lg shrink-0">View Item</span>
                                        </div>
                                      </div>
                                    ) : (creative as any).previewSubPlacement === "FB_PROFILE" ? (
                                      /* FB Profile Feed Variation */
                                      <div className="bg-white">
                                        <div className="p-3.5 flex items-start justify-between border-b border-slate-100">
                                          <div className="flex items-center gap-2.5">
                                            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-blue-500 p-0.5 bg-white shrink-0 shadow-2xs">
                                              <img src={activePage?.picture || "/icon.jpeg"} alt="Logo" className="h-full w-full object-cover rounded-full" />
                                            </div>
                                            <div>
                                              <div className="font-extrabold text-slate-900 text-[13px] leading-tight">{pageNameDisplay}</div>
                                              <div className="text-[10.5px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                                                <span className="font-bold text-blue-600">Sponsored</span> · <Globe className="h-2.5 w-2.5 text-slate-400" />
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <span className="cursor-pointer hover:text-slate-600">•••</span>
                                            <span className="cursor-pointer hover:text-slate-600">✕</span>
                                          </div>
                                        </div>
                                        {creative.primaryText?.trim() ? (
                                          <div className="px-3.5 py-2.5 text-[12.5px] text-slate-800 leading-snug">
                                            {creative.primaryText}
                                          </div>
                                        ) : (
                                          <div className="px-3.5 py-2 text-[11.5px] text-slate-400 italic">
                                            No primary text specified yet
                                          </div>
                                        )}
                                        <div className="relative w-full aspect-square bg-slate-950 flex items-center justify-center overflow-hidden border-y border-slate-100">
                                          {activeMediaUrl ? (
                                            isVideoMedia ? (
                                              <video src={activeMediaUrl} controls className="w-full h-full object-cover" />
                                            ) : (
                                              <img src={activeMediaUrl} alt="Creative" className="w-full h-full object-cover" />
                                            )
                                          ) : (
                                            <div className="p-6 text-center text-slate-400 space-y-1.5 bg-slate-100 w-full h-full flex flex-col items-center justify-center">
                                              <ImageIcon className="h-8 w-8 text-slate-400 mx-auto" />
                                              <div className="text-xs font-semibold text-slate-600">Upload media in chat to preview image</div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="p-3 bg-[#F0F2F5] flex items-center justify-between gap-2 border-t border-slate-200/80">
                                          <div className="min-w-0 flex-1">
                                            <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500">WHATSAPP</div>
                                            <div className="text-[12.5px] font-extrabold text-slate-900 truncate">
                                              {creative.headline?.trim() || <span className="text-slate-400 font-normal italic text-[11px]">No headline specified</span>}
                                            </div>
                                          </div>
                                          <button className="px-3.5 py-2 bg-[#1877F2] hover:bg-blue-700 text-white text-[12px] font-extrabold rounded-lg shrink-0 flex items-center gap-1.5 shadow-sm">
                                            <MessageCircle className="h-3.5 w-3.5 fill-white text-transparent" />
                                            <span>Send WhatsApp</span>
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* FB Main Feed Variation */
                                      <>
                                        <div className="p-3.5 flex items-start justify-between bg-white border-b border-slate-100">
                                          <div className="flex items-center gap-2.5">
                                            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-[#1877F2] p-0.5 bg-white shrink-0 shadow-2xs">
                                              <img src={activePage?.picture || "/icon.jpeg"} alt="Logo" className="h-full w-full object-cover rounded-full" />
                                            </div>
                                            <div>
                                              <div className="font-extrabold text-slate-900 text-[13px] leading-tight flex items-center gap-1">
                                                <span>{pageNameDisplay}</span>
                                                <span className="text-[#1877F2] text-[12px]">✓</span>
                                              </div>
                                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                <span className="font-bold text-[#1877F2]">Sponsored</span> · <Globe className="h-3 w-3 text-slate-400" />
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <span className="cursor-pointer hover:text-slate-600">•••</span>
                                            <span className="cursor-pointer hover:text-slate-600">✕</span>
                                          </div>
                                        </div>

                                        {creative.primaryText?.trim() ? (
                                          <div className="px-3.5 py-2.5 text-[12.5px] text-slate-900 leading-relaxed font-sans">
                                            <p className="whitespace-pre-line">{creative.primaryText}</p>
                                          </div>
                                        ) : (
                                          <div className="px-3.5 py-2 text-[11.5px] text-slate-400 italic">
                                            No primary text specified yet
                                          </div>
                                        )}

                                        <div className={`relative w-full ${
                                          creative.aspectRatio === "9:16"
                                            ? "aspect-[9/16] min-h-[340px]"
                                            : creative.aspectRatio === "16:9"
                                            ? "aspect-[16/9] min-h-[190px]"
                                            : "aspect-square min-h-[270px]"
                                        } bg-slate-950 flex items-center justify-center overflow-hidden border-y border-slate-100`}>
                                          {activeMediaUrl ? (
                                            isVideoMedia ? (
                                              <video src={activeMediaUrl} controls className="w-full h-full object-cover" />
                                            ) : (
                                              <img src={activeMediaUrl} alt="Creative" className="w-full h-full object-cover" />
                                            )
                                          ) : (
                                            <div className="p-6 text-center text-slate-400 space-y-1.5 bg-slate-100 w-full h-full flex flex-col items-center justify-center">
                                              <ImageIcon className="h-8 w-8 text-slate-400 mx-auto" />
                                              <div className="font-semibold text-xs text-slate-600">Upload media in chat to preview image</div>
                                            </div>
                                          )}
                                        </div>

                                        <div className="p-3 bg-[#F0F2F5] border-t border-slate-200/90 flex items-center justify-between gap-2.5">
                                          <div className="min-w-0 flex-1">
                                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">API.WHATSAPP.COM</div>
                                            <div className="text-[12.5px] font-extrabold text-slate-900 truncate">
                                              {creative.headline?.trim() || <span className="text-slate-400 font-normal italic text-[11px]">No headline specified</span>}
                                            </div>
                                          </div>
                                          <button className="px-4 py-2 bg-[#1877F2] hover:bg-blue-700 text-white text-[12px] font-extrabold rounded-lg shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95">
                                            <MessageCircle className="h-4 w-4 fill-white text-transparent" />
                                            <span>Send WhatsApp</span>
                                          </button>
                                        </div>

                                        <div className="px-3.5 py-2.5 border-t border-slate-200/80 bg-white flex items-center justify-around text-[12px] text-slate-600 font-bold">
                                          <button className="flex items-center gap-1.5 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                                            <ThumbsUp className="h-4 w-4 text-[#1877F2]" />
                                            <span>Like</span>
                                          </button>
                                          <button className="flex items-center gap-1.5 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                                            <MessageSquare className="h-4 w-4 text-slate-500" />
                                            <span>Comment</span>
                                          </button>
                                          <button className="flex items-center gap-1.5 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                                            <Share2 className="h-4 w-4 text-slate-500" />
                                            <span>Share</span>
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}

                                {/* CARD 2: INSTAGRAM FEED / PROFILE FEED / EXPLORE */}
                                {(creative as any).previewPlatform === "INSTAGRAM_FEED" && (
                                  <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 text-left font-sans transition-all duration-300 max-w-lg mx-auto">
                                    {/* IG Header */}
                                    <div className="p-3.5 flex items-center justify-between bg-white border-b border-slate-100">
                                      <div className="flex items-center gap-2.5">
                                        <div className="h-9 w-9 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shrink-0 shadow-2xs">
                                          <div className="h-full w-full rounded-full overflow-hidden border-2 border-white">
                                            <img src={activePage?.picture || "/icon.jpeg"} alt="Avatar" className="h-full w-full object-cover" />
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-[12.5px] font-extrabold text-slate-900 leading-tight flex items-center gap-1">
                                            <span>{pageNameDisplay.toLowerCase().replace(/\s+/g, '')}</span>
                                            <span className="bg-[#0095F6] text-white rounded-full text-[8px] h-3 w-3 flex items-center justify-center font-bold">✓</span>
                                          </div>
                                          <div className="text-[10px] font-bold text-slate-500">
                                            Sponsored · Ad
                                          </div>
                                        </div>
                                      </div>
                                      <span className="text-slate-600 text-base font-extrabold cursor-pointer hover:text-slate-900">•••</span>
                                    </div>

                                    {/* Media Banner */}
                                    <div className="relative w-full aspect-square bg-slate-950 overflow-hidden flex items-center justify-center border-y border-slate-100">
                                      {activeMediaUrl ? (
                                        isVideoMedia ? (
                                          <video src={activeMediaUrl} controls className="w-full h-full object-cover" />
                                        ) : (
                                          <img src={activeMediaUrl} alt="IG Post" className="w-full h-full object-cover" />
                                        )
                                      ) : (
                                        <div className="p-6 h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-1.5 bg-slate-100 w-full">
                                          <ImageIcon className="h-8 w-8 text-slate-400 mx-auto" />
                                          <div className="font-semibold text-xs text-slate-600">Upload media in chat to preview image</div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Native Instagram Call to Action Bar */}
                                    <div className="px-4 py-2.5 bg-[#0095F6] hover:bg-[#0081D6] text-white flex items-center justify-between cursor-pointer transition-colors shadow-2xs">
                                      <span className="text-[12px] font-extrabold tracking-tight uppercase">
                                        {creative.headline?.trim() || "Send WhatsApp message"}
                                      </span>
                                      <span className="text-white text-base font-extrabold">›</span>
                                    </div>

                                    {/* Reaction Icons Row */}
                                    <div className="px-4 py-2.5 flex items-center justify-between text-slate-800 bg-white">
                                      <div className="flex items-center gap-4">
                                        <Heart className="h-5.5 w-5.5 text-rose-500 fill-rose-500 cursor-pointer transition-colors" />
                                        <MessageCircle className="h-5.5 w-5.5 cursor-pointer hover:text-slate-600" />
                                        <Send className="h-5.5 w-5.5 cursor-pointer hover:text-slate-600" />
                                      </div>
                                      <Bookmark className="h-5.5 w-5.5 cursor-pointer hover:text-slate-600" />
                                    </div>

                                    {/* Likes Counter */}
                                    <div className="px-4 text-[11px] font-extrabold text-slate-900">
                                      Liked by <span className="font-extrabold">media_buyer</span> and <span className="font-extrabold">1,482 others</span>
                                    </div>

                                    {/* Caption */}
                                    <div className="px-4 pt-1 pb-3.5 text-[12px] text-slate-900 leading-snug bg-white font-sans">
                                      <span className="font-extrabold mr-1.5 text-slate-900">{pageNameDisplay.toLowerCase().replace(/\s+/g, '')}</span>
                                      {creative.primaryText?.trim() ? creative.primaryText : <span className="text-slate-400 italic">No ad copy entered yet</span>}
                                      <span className="text-slate-400 cursor-pointer ml-1 font-semibold">...more</span>
                                      <div className="text-[9.5px] uppercase font-bold text-slate-400 mt-1">2 HOURS AGO</div>
                                    </div>
                                  </div>
                                )}

                                {/* CARD 3: MESSENGER INBOX / SPONSORED MESSAGE */}
                                {(creative as any).previewPlatform === "MESSENGER_FEED" && (
                                  <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 text-left font-sans p-4 space-y-3.5 transition-all duration-300 max-w-lg mx-auto">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                      <div className="flex items-center gap-2.5">
                                        <div className="h-9 w-9 rounded-full overflow-hidden border border-blue-200 bg-blue-50 shrink-0 shadow-2xs">
                                          <img src={activePage?.picture || "/icon.jpeg"} alt="Logo" className="h-full w-full object-cover" />
                                        </div>
                                        <div>
                                          <div className="text-[12.5px] font-extrabold text-slate-900 leading-tight">
                                            {pageNameDisplay}
                                          </div>
                                          <div className="text-[10px] text-[#0084FF] font-extrabold uppercase tracking-wider">Messenger Sponsored Ad</div>
                                        </div>
                                      </div>
                                      <span className="text-slate-400 text-xs font-bold px-2 py-0.5 bg-slate-100 rounded-full">Ad</span>
                                    </div>

                                    {/* Messenger Card Content */}
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/60 p-2.5 space-y-2.5 shadow-2xs">
                                      <div className="relative w-full aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden shadow-inner">
                                        {activeMediaUrl ? (
                                          isVideoMedia ? (
                                            <video src={activeMediaUrl} controls className="w-full h-full object-cover" />
                                          ) : (
                                            <img src={activeMediaUrl} alt="Messenger Ad" className="w-full h-full object-cover" />
                                          )
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
                                            <ImageIcon className="h-7 w-7 text-slate-400" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="px-1.5 space-y-1">
                                        <div className="text-[13px] font-extrabold text-slate-900">
                                          {creative.headline?.trim() || <span className="text-slate-400 font-normal italic text-[11.5px]">No headline specified</span>}
                                        </div>
                                        <p className="text-[11.5px] text-slate-600 line-clamp-2 leading-relaxed">
                                          {creative.primaryText?.trim() || <span className="text-slate-400 italic">No primary text specified</span>}
                                        </p>
                                      </div>
                                      <button className="w-full py-2.5 bg-[#0084FF] hover:bg-[#0073DF] text-white font-extrabold text-[12px] rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>Send Message</span>
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* CARD 4: WHATSAPP STATUS & CLICK-TO-WHATSAPP FEED */}
                                {(creative as any).previewPlatform === "WHATSAPP_FEED" && (
                                  <div className="bg-gradient-to-b from-[#075E54] to-[#054c44] rounded-2xl overflow-hidden shadow-xl border border-emerald-900 text-left font-sans text-white p-4 space-y-3.5 relative transition-all duration-300 max-w-lg mx-auto">
                                    <div className="flex items-center justify-between border-b border-emerald-600/50 pb-2.5">
                                      <div className="flex items-center gap-2.5">
                                        <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-white/60 bg-white/10 shrink-0 shadow-sm">
                                          <img src={activePage?.picture || "/icon.jpeg"} alt="Logo" className="h-full w-full object-cover" />
                                        </div>
                                        <div>
                                          <div className="text-[13px] font-extrabold text-white leading-tight flex items-center gap-1">
                                            <span>{pageNameDisplay}</span>
                                            <span className="text-[#25D366] text-[12px]">✓</span>
                                          </div>
                                          <div className="text-[10.5px] text-emerald-200 font-medium">WhatsApp Business Status & Feed Ad</div>
                                        </div>
                                      </div>
                                      <span className="text-[10px] font-extrabold bg-[#25D366] text-slate-950 px-2.5 py-0.5 rounded-full shadow-2xs">Sponsored</span>
                                    </div>

                                    {/* WhatsApp Media Box */}
                                    <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-emerald-700/50">
                                      {activeMediaUrl ? (
                                        isVideoMedia ? (
                                          <video src={activeMediaUrl} controls className="w-full h-full object-cover" />
                                        ) : (
                                          <img src={activeMediaUrl} alt="WhatsApp Ad" className="w-full h-full object-cover" />
                                        )
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-emerald-950/60 text-emerald-300 p-4 text-center">
                                          <ImageIcon className="h-8 w-8 text-emerald-400/60" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Text & Chat Prompt */}
                                    <div className="bg-[#128C7E]/90 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/40 space-y-1.5 shadow-sm">
                                      <div className="text-[13px] font-extrabold text-white flex items-center gap-1.5">
                                        <span>💬</span>
                                        <span>{creative.headline?.trim() || "Chat on WhatsApp"}</span>
                                      </div>
                                      <p className="text-[11.5px] text-emerald-50 leading-relaxed font-sans">
                                        {creative.primaryText?.trim() || <span className="text-emerald-200/70 italic">No primary message specified</span>}
                                      </p>
                                    </div>

                                    <button className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-extrabold text-[12.5px] rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98">
                                      <MessageCircle className="h-4.5 w-4.5 fill-slate-950 text-[#25D366]" />
                                      <span>Chat on WhatsApp</span>
                                    </button>
                                  </div>
                                )}

                                {/* CARD 5: STORIES & REELS */}
                                {(creative as any).previewPlatform === "STORIES_REELS" && (
                                  <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 text-left font-sans relative text-white aspect-[9/16] max-h-[500px] mx-auto flex flex-col justify-between p-4">
                                    {activeMediaUrl ? (
                                      isVideoMedia ? (
                                        <video src={activeMediaUrl} controls className="w-full h-full object-cover absolute inset-0 opacity-90" />
                                      ) : (
                                        <img src={activeMediaUrl} alt="Story" className="w-full h-full object-cover absolute inset-0 opacity-90" />
                                      )
                                    ) : (
                                      <div className="absolute inset-0 bg-slate-900 flex items-center justify-center p-6 text-center">
                                        <div className="space-y-1 text-slate-400">
                                          <ImageIcon className="h-8 w-8 text-slate-500 mx-auto" />
                                          <div className="font-semibold text-xs text-slate-300">Upload 9:16 media in chat</div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Top Gradient Overlay */}
                                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />

                                    {/* Story Header */}
                                    <div className="relative z-10 space-y-2">
                                      {/* Story progress bar */}
                                      <div className="flex gap-1 w-full">
                                        <div className="h-1 bg-white/80 rounded-full flex-1" />
                                        <div className="h-1 bg-white/30 rounded-full flex-1" />
                                      </div>

                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-pink-500 shrink-0">
                                            <img src={activePage?.picture || "/icon.jpeg"} alt="User" className="h-full w-full object-cover" />
                                          </div>
                                          <span className="text-xs font-extrabold drop-shadow-md">
                                            {pageNameDisplay}
                                          </span>
                                          <span className="text-[10px] bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full text-white font-bold border border-white/20">Sponsored</span>
                                        </div>
                                        <span className="text-white text-xs cursor-pointer drop-shadow-md">•••</span>
                                      </div>
                                    </div>

                                    {/* Bottom Gradient Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                                    {/* Story CTA Bottom Bar */}
                                    <div className="relative z-10 space-y-2.5 text-center">
                                      {creative.primaryText?.trim() && (
                                        <div className="bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/20 text-left">
                                          <p className="text-[11px] line-clamp-2 text-slate-100 font-medium leading-tight">
                                            {creative.primaryText}
                                          </p>
                                        </div>
                                      )}
                                      <button className="w-full py-3 bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95">
                                        <span>{creative.headline?.trim() || "Send WhatsApp Message"}</span>
                                        <ChevronRight className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* CARD 6: RIGHT COLUMN / AUDIENCE NETWORK */}
                                {(creative as any).previewPlatform === "RIGHT_COLUMN" && (
                                  <div className="bg-white rounded-xl overflow-hidden shadow-md border border-slate-200/90 text-left font-sans p-3.5 space-y-2 max-w-lg mx-auto">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      Sponsored • Desktop Right Column
                                    </div>
                                    <div className="flex gap-3 items-center">
                                      <div className="h-16 w-16 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                        {activeMediaUrl ? (
                                          isVideoMedia ? (
                                            <video src={activeMediaUrl} className="w-full h-full object-cover" />
                                          ) : (
                                            <img src={activeMediaUrl} alt="Ad" className="w-full h-full object-cover" />
                                          )
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                                            <ImageIcon className="h-5 w-5" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1 space-y-1">
                                        <div className="text-[12px] font-extrabold text-slate-900 leading-snug line-clamp-2">
                                          {creative.headline?.trim() || <span className="text-slate-400 font-normal italic text-[11px]">No headline specified</span>}
                                        </div>
                                        <div className="text-[10.5px] text-slate-500 truncate font-semibold">
                                          {destination.type === "WHATSAPP" ? "api.whatsapp.com" : "jisnudigital.com"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })()}

                      {/* ── INTERACTIVE DESTINATION LIVE PREVIEW MOCKUPS ── */}
                      {/* 1. WhatsApp Pre-filled Greeting Mockup */}
                      {(!destination.type || destination.type === "WHATSAPP") && (
                        <div className="px-4 py-2.5 bg-emerald-50/80 border-t border-emerald-100 flex items-start gap-2 text-xs text-emerald-900">
                          <MessageCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div className="space-y-1 w-full">
                            <div className="font-bold text-emerald-950 flex items-center justify-between">
                              <span>Pre-Filled WhatsApp Customer Message</span>
                              <span className="text-[10px] text-emerald-700 font-normal">Opens automatically on click</span>
                            </div>
                            <input
                              type="text"
                              value={destination.welcomeMessage || `Hi ${campaignTitle || 'there'}, I saw your ad on Facebook and want to know more about ${creative.headline || 'your special offer'}!`}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (session) {
                                  setSession({
                                    ...session,
                                    draft: {
                                      ...session.draft,
                                      destination: {
                                        ...session.draft.destination,
                                        welcomeMessage: val,
                                      },
                                    },
                                  });
                                }
                              }}
                              className="w-full bg-white border border-emerald-300 focus:border-emerald-600 rounded-md px-2 py-1 text-[11px] text-emerald-900 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* 2. Instant Lead Form Mockup */}
                      {(destination.type === "INSTANT_FORM" || destination.type === "LEAD_FORM") && (
                        <div className="px-4 py-2.5 bg-indigo-50/90 border-t border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-950">
                          <FileText className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                          <div className="space-y-1.5 w-full">
                            <div className="font-bold flex items-center justify-between">
                              <span>Instant Lead Form Preview (In-App Popup)</span>
                              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-semibold">Zero Friction</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                              {(destination.leadGenFormFields || ["FULL_NAME", "PHONE", "EMAIL"]).map((fld: string, fIdx: number) => (
                                <div key={fIdx} className="bg-white/90 border border-indigo-200/80 rounded px-2 py-1 text-[10px] text-slate-700 font-medium">
                                  {fld === "FULL_NAME" ? "👤 Full Name (Auto-filled)" : fld === "PHONE" ? "📞 Mobile Number" : fld === "EMAIL" ? "📧 Email Address" : fld === "CITY" ? "📍 City" : fld}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. Phone Call Direct Mockup */}
                      {destination.type === "PHONE_CALL" && (
                        <div className="px-4 py-2.5 bg-emerald-50/90 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                            <div>
                              <div className="font-bold">Direct Phone Call Prompt</div>
                              <div className="text-[11px] text-emerald-800">
                                Clicking ad opens customer's native dialer to: <span className="font-mono font-bold">{destination.phoneNumber || destination.whatsappPhoneNumber || "+91 [Set in chat]"}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">Call Now</span>
                        </div>
                      )}

                      {/* 4. Mobile App Install Mockup */}
                      {destination.type === "APP" && (
                        <div className="px-4 py-2.5 bg-blue-50/90 border-t border-blue-100 flex items-center justify-between text-xs text-blue-950">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-blue-600 shrink-0" />
                            <div>
                              <div className="font-bold">App Store / Google Play Install Card</div>
                              <div className="text-[11px] text-blue-800">⭐⭐⭐⭐⭐ 4.8 Rating · Free Download · Official Store Deep Link</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">Get App</span>
                        </div>
                      )}

                      {/* 5. Meta Shop Mockup */}
                      {destination.type === "SHOP" && (
                        <div className="px-4 py-2.5 bg-amber-50/90 border-t border-amber-100 flex items-center justify-between text-xs text-amber-950">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-amber-600 shrink-0" />
                            <div>
                              <div className="font-bold">Facebook & Instagram Shop Catalog</div>
                              <div className="text-[11px] text-amber-800">In-App Native Checkout · Product Tagging Enabled</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">View Shop</span>
                        </div>
                      )}

                      {/* 6. Instagram Profile Mockup */}
                      {destination.type === "INSTAGRAM_PROFILE" && (
                        <div className="px-4 py-2.5 bg-pink-50/90 border-t border-pink-100 flex items-center justify-between text-xs text-pink-950">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-pink-600 shrink-0" />
                            <div>
                              <div className="font-bold">Instagram Profile Growth Card</div>
                              <div className="text-[11px] text-pink-800">@{activePage?.name?.toLowerCase().replace(/\s+/g, '') || "brand"} · Drives Instagram Followers & Page Views</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-pink-600 text-white px-2 py-0.5 rounded-full">Follow</span>
                        </div>
                      )}

                      {/* 7. Facebook Page Event Mockup */}
                      {destination.type === "PAGE_EVENT" && (
                        <div className="px-4 py-2.5 bg-purple-50/90 border-t border-purple-100 flex items-center justify-between text-xs text-purple-950">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-600 shrink-0" />
                            <div>
                              <div className="font-bold">Facebook Page Event RSVP</div>
                              <div className="text-[11px] text-purple-800">{destination.eventName || `${campaign.name || 'Business'} Official Event`}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">RSVP</span>
                        </div>
                      )}

                      {/* Social Reaction Bar Mockup */}
                      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5 text-blue-600" /> Like</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> Comment</span>
                        <span className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5" /> Share</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Confirmation & Publish Action Card */}
                  <div className="pt-2">
                    <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div className="px-4 py-3 bg-slate-50/80 font-bold text-[13px] text-slate-900 border-b border-slate-200/80 flex items-center justify-between">
                        <span>
                          {session?.status === "COMPLETED" || session?.executionResult?.deploymentStatus === "FULL_SUCCESS"
                            ? "🎉 Campaign Deployed & Live on Meta Ads"
                            : "Deploy End-to-End to Meta Ads Manager?"}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          session?.status === "COMPLETED" || session?.executionResult?.deploymentStatus === "FULL_SUCCESS"
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : "text-blue-700 bg-blue-50 border-blue-200"
                        }`}>
                          {session?.status === "COMPLETED" || session?.executionResult?.deploymentStatus === "FULL_SUCCESS" ? "Status: ACTIVE / PAUSED" : "Meta Graph API v26.0"}
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {session?.status === "COMPLETED" || session?.executionResult?.deploymentStatus === "FULL_SUCCESS" ? (
                          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs font-bold text-emerald-900">Live Campaign ID: {session?.executionResult?.campaign?.id || "Deployed"}</span>
                              </div>
                              <span className="text-[11px] font-semibold text-emerald-800 bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Ready in Ads Manager
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${draft.adAccountId || activeAdAccount?.adAccountId || "1454270479625110"}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Megaphone className="h-3.5 w-3.5" />
                                <span>Open in Meta Ads Manager ↗</span>
                              </a>
                              <button
                                type="button"
                                onClick={handleResetSession}
                                className="group px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all border border-slate-200 flex items-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                              >
                                <RotateCcw className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform duration-500 ease-out group-hover:-rotate-180" />
                                <span>New Campaign Chat</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={handleConfirmPublish}
                              disabled={isPublishing}
                              className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-emerald-50/60 transition-colors cursor-pointer group disabled:opacity-50"
                            >
                              <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[12px] font-bold group-hover:scale-105 transition-transform shadow-xs shrink-0">
                                🚀
                              </div>
                              <div>
                                <span className="text-[13px] font-bold text-emerald-900 block">
                                  {isPublishing ? "Deploying Campaign, Ad Set, Creative & Ad to Meta..." : "Confirm & Launch Live Campaign to Meta Ads"}
                                </span>
                                <span className="text-[11px] text-emerald-700">
                                  Creates Campaign, Ad Set with targeting, Ad Creative, and live Ad Object on Meta.
                                </span>
                              </div>
                            </button>

                            <button
                              onClick={() => handleSendMessage("Please modify the headline and make the primary copy more aggressive with a 20% discount offer")}
                              disabled={isPublishing}
                              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer group disabled:opacity-50"
                            >
                              <div className="h-6 w-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold group-hover:scale-105 transition-transform shrink-0">
                                ✏️
                              </div>
                              <span className="text-xs font-semibold text-slate-700">
                                Tweak ad copy, budget, or target location
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>


      {/* ── HIDDEN FILE INPUT FOR "ADD FILE" ── */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* ── SELECT AD CREATIVE LIBRARY MODAL ── */}
      {showAdLibraryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Meta Creative Library</h3>
                <p className="text-xs text-gray-500">Select an existing ad creative to attach to your campaign.</p>
              </div>
              <button
                onClick={() => setShowAdLibraryModal(false)}
                className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {loadingMedia ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[#1877F2] mb-2" />
                  <p className="text-xs text-gray-500">Loading your Meta Ad library...</p>
                </div>
              ) : mediaLibrary.images?.length === 0 && mediaLibrary.videos?.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-gray-500 mb-3">No existing creatives found in your Meta Ad Account.</p>
                  <button
                    onClick={() => {
                      setShowAdLibraryModal(false);
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-[#1877F2] text-white rounded-lg text-xs font-semibold hover:bg-[#166FE5] cursor-pointer flex items-center gap-1.5 mx-auto"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload New File From Device</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {mediaLibrary.images?.map((img: any, idx: number) => (
                    <div
                      key={img.hash || idx}
                      onClick={() => handleSelectMediaFromLibrary(img, "IMAGE")}
                      className="group relative border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#1877F2] hover:shadow-md transition-all"
                    >
                      <img
                        src={img.url || img.permalink_url}
                        alt={img.name || "Ad Image"}
                        className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="p-1.5 bg-white text-[11px] truncate font-medium text-gray-700">
                        {img.name || `Image #${idx + 1}`}
                      </div>
                    </div>
                  ))}

                  {mediaLibrary.videos?.map((vid: any, idx: number) => (
                    <div
                      key={vid.id || idx}
                      onClick={() => handleSelectMediaFromLibrary(vid, "VIDEO")}
                      className="group relative border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#1877F2] hover:shadow-md transition-all"
                    >
                      {vid.picture ? (
                        <img
                          src={vid.picture}
                          alt={vid.name || "Ad Video"}
                          className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-28 bg-gray-900 flex items-center justify-center text-white text-xs">
                          🎬 Video
                        </div>
                      )}
                      <div className="p-1.5 bg-white text-[11px] truncate font-medium text-gray-700">
                        {vid.name || `Video #${idx + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BULK LOCATION & RADIUS MANAGER MODAL ── */}
      {showBulkLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden ring-1 ring-black/5">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 ring-2 ring-white">
                  <Map className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Location & Radius Manager
                    </h3>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200/80 uppercase tracking-wider">
                      Meta Precision
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure multi-city radius (15–80 km), nationwide reach, or postal PIN codes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkLocationModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200/80 bg-slate-50/50 px-6 pt-2.5 gap-2">
              <button
                type="button"
                onClick={() => setBulkActiveTab("cities")}
                className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  bulkActiveTab === "cities"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Cities & Radius</span>
                <span className={`ml-1 px-2 py-0.5 text-[10px] rounded-full font-bold transition-all ${
                  bulkActiveTab === "cities" ? "bg-blue-100 text-blue-700 shadow-2xs" : "bg-slate-200/70 text-slate-600"
                }`}>
                  {bulkCities.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBulkActiveTab("countries")}
                className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  bulkActiveTab === "countries"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Countries</span>
                <span className={`ml-1 px-2 py-0.5 text-[10px] rounded-full font-bold transition-all ${
                  bulkActiveTab === "countries" ? "bg-emerald-100 text-emerald-700 shadow-2xs" : "bg-slate-200/70 text-slate-600"
                }`}>
                  {bulkCountries.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBulkActiveTab("pincodes")}
                className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  bulkActiveTab === "pincodes"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Hash className="h-3.5 w-3.5" />
                <span>PIN Codes</span>
                <span className={`ml-1 px-2 py-0.5 text-[10px] rounded-full font-bold transition-all ${
                  bulkActiveTab === "pincodes" ? "bg-purple-100 text-purple-700 shadow-2xs" : "bg-slate-200/70 text-slate-600"
                }`}>
                  {bulkPincodes.length}
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: CITIES & RADIUS */}
              {bulkActiveTab === "cities" && (
                <div className="space-y-4">
                  {/* Premium Quick Add City Box with Live Auto-Suggest */}
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/20 border border-slate-200/90 rounded-2xl space-y-2.5 shadow-2xs relative">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>Search & Add Target Cities:</span>
                      </label>
                      {isLoadingCitySuggestions && (
                        <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-semibold animate-pulse">
                          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Searching Meta locations...</span>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <textarea
                        rows={2}
                        value={bulkCityText}
                        onChange={(e) => setBulkCityText(e.target.value)}
                        placeholder="Type starting letters (e.g. 'sat', 'pun', 'mum')... or paste: Mumbai (40km), Pune (25km)"
                        className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium text-slate-800 shadow-2xs transition-all resize-none"
                      />

                      {/* Clean Floating Suggestions Dropdown */}
                      {citySuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-blue-200/90 rounded-2xl shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-fadeIn backdrop-blur-md ring-1 ring-black/5">
                          {citySuggestions.map((sug, sIdx) => {
                            const isAlreadyAdded = bulkCities.some(
                              (c) => c.name.toLowerCase() === sug.name.toLowerCase()
                            );
                            return (
                              <button
                                key={sug.key || sIdx}
                                type="button"
                                onClick={() => handleSelectCitySuggestion(sug)}
                                className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-all cursor-pointer ${
                                  isAlreadyAdded
                                    ? "bg-slate-50/70 text-slate-400"
                                    : "hover:bg-blue-50/80 text-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                                    📍
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900">{sug.name}</span>
                                    {sug.region && (
                                      <span className="text-[11px] text-slate-500 ml-1.5">
                                        ({sug.region}, India)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                                  isAlreadyAdded
                                    ? "bg-slate-200 text-slate-600"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                                }`}>
                                  {isAlreadyAdded ? "Added ✓" : "+ Add City"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-semibold">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const metros = [
                              { name: "Mumbai", radiusKm: 40 },
                              { name: "Delhi", radiusKm: 40 },
                              { name: "Bangalore", radiusKm: 35 },
                              { name: "Hyderabad", radiusKm: 30 },
                              { name: "Pune", radiusKm: 25 },
                              { name: "Chennai", radiusKm: 30 },
                            ];
                            const existing = new Set(bulkCities.map((c) => c.name.toLowerCase()));
                            const merged = [...bulkCities];
                            for (const m of metros) {
                              if (!existing.has(m.name.toLowerCase())) {
                                merged.push(m);
                              }
                            }
                            setBulkCities(merged);
                          }}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-lg text-[11px] font-semibold text-slate-600 cursor-pointer shadow-2xs transition-colors"
                        >
                          + Top Metros
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const tier2 = [
                              { name: "Ahmedabad", radiusKm: 30 },
                              { name: "Jaipur", radiusKm: 25 },
                              { name: "Surat", radiusKm: 25 },
                              { name: "Indore", radiusKm: 25 },
                              { name: "Lucknow", radiusKm: 30 },
                            ];
                            const existing = new Set(bulkCities.map((c) => c.name.toLowerCase()));
                            const merged = [...bulkCities];
                            for (const t of tier2) {
                              if (!existing.has(t.name.toLowerCase())) {
                                merged.push(t);
                              }
                            }
                            setBulkCities(merged);
                          }}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-lg text-[11px] font-semibold text-slate-600 cursor-pointer shadow-2xs transition-colors"
                        >
                          + Tier-2 Hubs
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddBulkCitiesFromText}
                        disabled={!bulkCityText.trim()}
                        className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all"
                      >
                        + Add to List
                      </button>
                    </div>
                  </div>

                  {/* Bulk Radius Uniform Adjuster */}
                  {bulkCities.length > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs">
                      <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                        <Sliders className="h-3.5 w-3.5 text-blue-600" />
                        Apply uniform radius to all {bulkCities.length} cities:
                      </span>
                      <div className="flex items-center gap-1">
                        {[20, 30, 40, 50, 80].map((rVal) => (
                          <button
                            key={rVal}
                            type="button"
                            onClick={() => {
                              setBulkCities(bulkCities.map((c) => ({ ...c, radiusKm: rVal })));
                            }}
                            className="px-2.5 py-0.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 rounded-lg text-[11px] font-bold text-blue-700 transition-all cursor-pointer shadow-2xs"
                          >
                            {rVal} km
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* List of Configured Cities with Individual Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                      <span>Configured Target Cities ({bulkCities.length})</span>
                      {bulkCities.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setBulkCities([])}
                          className="text-red-500 hover:text-red-700 text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {bulkCities.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <Compass className="h-9 w-9 text-slate-300 mx-auto mb-2.5" />
                        <p className="text-xs font-bold text-slate-700">No specific cities added yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Search and add cities above or target entire countries.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {bulkCities.map((city, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                                {idx + 1}
                              </div>
                              <div>
                                <span className="text-xs font-extrabold text-slate-900 block">{city.name}</span>
                                <span className="text-[10px] text-slate-400">Individual Geo-Radius</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-1 sm:max-w-xs">
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="range"
                                  min={15}
                                  max={80}
                                  step={1}
                                  value={city.radiusKm}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setBulkCities(
                                      bulkCities.map((c, i) => (i === idx ? { ...c, radiusKm: val } : c))
                                    );
                                  }}
                                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <span className="inline-block w-14 text-center px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold rounded-lg font-mono">
                                  {city.radiusKm} km
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                {[20, 40].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => {
                                      setBulkCities(
                                        bulkCities.map((c, i) =>
                                          i === idx ? { ...c, radiusKm: preset } : c
                                        )
                                      );
                                    }}
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md border cursor-pointer transition-all ${
                                      city.radiusKm === preset
                                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                    }`}
                                  >
                                    {preset}k
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBulkCities(bulkCities.filter((_, i) => i !== idx));
                                  }}
                                  className="w-6 h-6 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center cursor-pointer transition-colors ml-0.5"
                                  title="Remove city"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: COUNTRIES */}
              {bulkActiveTab === "countries" && (
                <div className="space-y-4">
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/10 border border-slate-200/90 rounded-2xl space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Targeted Countries & Regions:</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Meta Graph API & Global Registry
                      </span>
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={bulkCountryText}
                            onChange={(e) => setBulkCountryText(e.target.value)}
                            placeholder="Type starting letters (e.g. 'chi' for China, 'ind' for India, 'uni' for USA/UK)..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && bulkCountryText.trim()) {
                                e.preventDefault();
                                if (countrySuggestions.length > 0) {
                                  handleAddBulkCountry(countrySuggestions[0].name);
                                } else {
                                  handleAddBulkCountry(bulkCountryText);
                                }
                                setBulkCountryText("");
                                setCountrySuggestions([]);
                              }
                            }}
                            className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 shadow-2xs transition-all pr-8"
                          />
                          {isLoadingCountrySuggestions && (
                            <div className="absolute right-2.5 top-3">
                              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (bulkCountryText.trim()) {
                              if (countrySuggestions.length > 0) {
                                handleAddBulkCountry(countrySuggestions[0].name);
                              } else {
                                handleAddBulkCountry(bulkCountryText);
                              }
                              setBulkCountryText("");
                              setCountrySuggestions([]);
                            }
                          }}
                          disabled={!bulkCountryText.trim()}
                          className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-emerald-500/20 transition-all shrink-0"
                        >
                          + Add Country
                        </button>
                      </div>

                      {/* Live Country Suggestions Dropdown */}
                      {countrySuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md border border-emerald-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100 animate-fadeIn ring-1 ring-black/5">
                          {countrySuggestions.map((sug, sIdx) => {
                            const isAlreadyAdded = bulkCountries.some(
                              (c) => c.toLowerCase() === sug.name.toLowerCase()
                            );
                            return (
                              <div
                                key={sug.key || sIdx}
                                onClick={() => {
                                  if (!isAlreadyAdded) {
                                    handleAddBulkCountry(sug.name);
                                  }
                                  setBulkCountryText("");
                                  setCountrySuggestions([]);
                                }}
                                className={`px-4 py-2.5 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer select-none ${
                                  isAlreadyAdded
                                    ? "bg-emerald-50/50 text-slate-400"
                                    : "hover:bg-emerald-50/80 text-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-700 font-extrabold text-[11px]">
                                    {sug.countryCode || "🌐"}
                                  </span>
                                  <div>
                                    <span className="font-bold text-slate-900 block">{sug.name}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {sug.region ? `${sug.region} · ` : ""}Verified Meta Ad Country
                                    </span>
                                  </div>
                                </div>

                                <span
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                    isAlreadyAdded
                                      ? "bg-slate-100 text-slate-400"
                                      : "bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700"
                                  }`}
                                >
                                  {isAlreadyAdded ? "✓ Added" : "+ Add Country"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="pt-1">
                      <span className="text-[11px] text-slate-400 font-semibold block mb-2">
                        Quick Add Global Commercial Markets:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "India",
                          "United States",
                          "United Arab Emirates",
                          "United Kingdom",
                          "Canada",
                          "Australia",
                          "Singapore",
                          "Saudi Arabia",
                          "Germany",
                        ].map((cName) => {
                          const isAdded = bulkCountries.some(
                            (c) => c.toLowerCase() === cName.toLowerCase()
                          );
                          return (
                            <button
                              key={cName}
                              type="button"
                              onClick={() => {
                                if (isAdded) {
                                  setBulkCountries(
                                    bulkCountries.filter(
                                      (c) => c.toLowerCase() !== cName.toLowerCase()
                                    )
                                  );
                                } else {
                                  handleAddBulkCountry(cName);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                                isAdded
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs font-bold"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30"
                              }`}
                            >
                              {isAdded ? "✓ " : "+ "}
                              {cName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                      <span>Selected Countries ({bulkCountries.length})</span>
                      {bulkCountries.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setBulkCountries([])}
                          className="text-red-500 hover:text-red-700 text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 p-3.5 bg-white border border-slate-200/90 rounded-2xl min-h-[60px] items-center shadow-2xs">
                      {bulkCountries.length === 0 ? (
                        <p className="text-xs text-slate-400">No countries selected yet.</p>
                      ) : (
                        bulkCountries.map((c, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 shadow-2xs"
                          >
                            <Globe className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{c}</span>
                            <button
                              type="button"
                              onClick={() => setBulkCountries(bulkCountries.filter((_, i) => i !== idx))}
                              className="text-emerald-400 hover:text-red-600 cursor-pointer ml-1 font-bold text-sm leading-none"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: POSTAL / PIN CODES */}
              {bulkActiveTab === "pincodes" && (
                <div className="space-y-4">
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/10 border border-slate-200/90 rounded-2xl space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-purple-600" />
                        <span>Search or Bulk Paste Postal PIN Codes:</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        5–6 Digit Official Meta Postal Format
                      </span>
                    </div>

                    <div className="relative">
                      <textarea
                        rows={2}
                        value={bulkPincodeText}
                        onChange={(e) => setBulkPincodeText(e.target.value)}
                        placeholder="Type starting digits (e.g. '4000', '4110', '1100', '5600') or paste multiple codes..."
                        className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 font-mono text-slate-800 shadow-2xs transition-all resize-none"
                      />
                      {isLoadingPincodeSuggestions && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                        </div>
                      )}

                      {/* Live PIN Code Suggestions Dropdown */}
                      {pincodeSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md border border-purple-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100 animate-fadeIn ring-1 ring-black/5">
                          {pincodeSuggestions.map((sug, pIdx) => {
                            const pinVal = sug.postalCode || sug.name;
                            const isAdded = bulkPincodes.includes(pinVal);
                            return (
                              <div
                                key={sug.key || pIdx}
                                onClick={() => handleSelectPincodeSuggestion(sug)}
                                className={`px-4 py-2.5 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer select-none ${
                                  isAdded
                                    ? "bg-purple-50/50 text-slate-400"
                                    : "hover:bg-purple-50/80 text-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100/70 text-purple-800 font-mono font-extrabold text-[12px]">
                                    {pinVal}
                                  </span>
                                  <div>
                                    <span className="font-bold text-slate-900 block">{sug.displayName || pinVal}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {sug.city ? `${sug.city} · ` : ""}{sug.region ? `${sug.region} · ` : ""}Verified Meta Postal Geolocation
                                    </span>
                                  </div>
                                </div>

                                <span
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                    isAdded
                                      ? "bg-slate-100 text-slate-400"
                                      : "bg-purple-600 text-white shadow-2xs hover:bg-purple-700"
                                  }`}
                                >
                                  {isAdded ? "✓ Added" : "+ Add PIN"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                      <p className="text-[11px] text-slate-500">
                        Extracts and auto-validates 5–6 digit Indian & global postal codes automatically.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddBulkPincodesFromText}
                        disabled={!bulkPincodeText.trim()}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-purple-500/20 active:scale-98"
                      >
                        + Add PIN Codes
                      </button>
                    </div>

                    {/* Quick Add Popular High-Intent Metro Hub PINs */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 font-semibold block mb-2">
                        Quick Add High-Density Commercial Hubs:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { pin: "400051", label: "Mumbai (BKC)" },
                          { pin: "400050", label: "Mumbai (Bandra)" },
                          { pin: "411045", label: "Pune (Baner)" },
                          { pin: "411057", label: "Pune (Hinjawadi)" },
                          { pin: "415001", label: "Satara (Center)" },
                          { pin: "110001", label: "Delhi (CP)" },
                          { pin: "122002", label: "Gurugram (CyberCity)" },
                          { pin: "560034", label: "Bengaluru (Koramangala)" },
                          { pin: "500081", label: "Hyderabad (HITEC City)" },
                        ].map((hub) => {
                          const isAdded = bulkPincodes.includes(hub.pin);
                          return (
                            <button
                              key={hub.pin}
                              type="button"
                              onClick={() => {
                                if (isAdded) {
                                  setBulkPincodes(bulkPincodes.filter((p) => p !== hub.pin));
                                } else {
                                  setBulkPincodes([...bulkPincodes, hub.pin]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                                isAdded
                                  ? "bg-purple-50 text-purple-800 border-purple-300 shadow-2xs font-bold"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-purple-400 hover:bg-purple-50/30"
                              }`}
                            >
                              <span className="font-mono font-bold mr-1">{hub.pin}</span>
                              <span className="text-[10px] text-slate-500 font-normal">({hub.label})</span>
                              <span className="ml-1.5 text-[10px] font-bold">{isAdded ? "✓" : "+"}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                      <span>Configured Postal PIN Codes ({bulkPincodes.length})</span>
                      {bulkPincodes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setBulkPincodes([])}
                          className="text-red-500 hover:text-red-700 text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 p-3.5 bg-white border border-slate-200/90 rounded-2xl min-h-[64px] max-h-48 overflow-y-auto items-center shadow-2xs">
                      {bulkPincodes.length === 0 ? (
                        <p className="text-xs text-slate-400">No postal codes added yet. Search by prefix or click hubs above.</p>
                      ) : (
                        bulkPincodes.map((pin, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-xs font-bold text-purple-800 font-mono shadow-2xs"
                          >
                            <Hash className="h-3.5 w-3.5 text-purple-600" />
                            <span>{pin}</span>
                            <button
                              type="button"
                              onClick={() => setBulkPincodes(bulkPincodes.filter((_, i) => i !== idx))}
                              className="text-purple-400 hover:text-red-600 cursor-pointer ml-1 font-bold text-sm leading-none"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                  {bulkCities.length} cities
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                  {bulkCountries.length} countries
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                  {bulkPincodes.length} PIN codes
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBulkLocationModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkLocations}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  Save & Apply Targeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILED TARGETING (DEMOGRAPHICS, INTERESTS, BEHAVIOURS) MODAL ── */}
      {showDetailedTargetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl ring-1 ring-black/5 border border-slate-200/80 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Meta Ads Detailed Targeting</span>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Demographics · Interests · Behaviours
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target verified audiences with precision across lifestyle interests, professions, and purchase signals.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailedTargetingModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Bar & Custom Tag Adder */}
            <div className="p-4 sm:p-5 bg-slate-50/60 border-b border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={targetingSearchQuery}
                    onChange={(e) => setTargetingSearchQuery(e.target.value)}
                    placeholder="Search Demographics, Interests & Behaviours (e.g. Engaged Shoppers, Married, Tech)..."
                    className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
                  />
                  {targetingSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTargetingSearchQuery("")}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customInterestInput}
                    onChange={(e) => setCustomInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customInterestInput.trim()) {
                        e.preventDefault();
                        handleAddCustomTargetingTag(customInterestInput);
                      }
                    }}
                    placeholder="Custom keyword (e.g. Sarees)..."
                    className="w-full sm:w-48 py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomTargetingTag(customInterestInput)}
                    disabled={!customInterestInput.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all shrink-0"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Selected Pills Ribbon */}
              {selectedTargetingTags.length > 0 && (
                <div className="pt-1 flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                    Selected ({selectedTargetingTags.length}):
                  </span>
                  {selectedTargetingTags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200/80 text-blue-900 rounded-lg text-xs font-semibold shadow-2xs animate-fadeIn"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleTargetingTag(tag)}
                        className="text-blue-400 hover:text-red-600 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedTargetingTags([])}
                    className="text-[10px] text-red-500 hover:underline font-bold ml-1 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Category Pillars Navigation Tabs */}
            <div className="flex border-b border-slate-200/80 bg-white px-6 pt-2.5 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setTargetingActiveTab("all")}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  targetingActiveTab === "all"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Target className="h-3.5 w-3.5" />
                <span>All Pillars</span>
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                  targetingActiveTab === "all" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                }`}>
                  {META_DETAILED_TARGETING_CATALOG.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTargetingActiveTab("demographics")}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  targetingActiveTab === "demographics"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Demographics</span>
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                  targetingActiveTab === "demographics" ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-600"
                }`}>
                  {META_DETAILED_TARGETING_CATALOG.filter((i) => i.category === "demographics").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTargetingActiveTab("interests")}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  targetingActiveTab === "interests"
                    ? "border-sky-600 text-sky-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Heart className="h-3.5 w-3.5" />
                <span>Interests</span>
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                  targetingActiveTab === "interests" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-600"
                }`}>
                  {META_DETAILED_TARGETING_CATALOG.filter((i) => i.category === "interests").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTargetingActiveTab("behaviours")}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  targetingActiveTab === "behaviours"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Behaviours</span>
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                  targetingActiveTab === "behaviours" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                }`}>
                  {META_DETAILED_TARGETING_CATALOG.filter((i) => i.category === "behaviours").length}
                </span>
              </button>
            </div>

            {/* Items Grid Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh]">
              {(() => {
                const query = targetingSearchQuery.toLowerCase().trim();

                // If live search results are returned from Meta Graph API, prioritize them dynamically
                const sourceList = (liveTargetingResults.length > 0 && query.length >= 2)
                  ? liveTargetingResults
                  : META_DETAILED_TARGETING_CATALOG;

                const filtered = sourceList.filter((item) => {
                  const matchesTab = targetingActiveTab === "all" || item.category === targetingActiveTab;
                  const matchesQuery =
                    !query ||
                    item.name.toLowerCase().includes(query) ||
                    item.subCategory.toLowerCase().includes(query) ||
                    (item.description && item.description.toLowerCase().includes(query));
                  return matchesTab && matchesQuery;
                });

                if (isSearchingLiveTargeting) {
                  return (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs font-semibold text-slate-600">
                        Querying Meta Graph API live targeting database for "{targetingSearchQuery}"...
                      </p>
                    </div>
                  );
                }

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center space-y-3">
                      <Target className="h-10 w-10 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-700">No matching categories found</p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Type a custom interest name in the input box above and click "+ Add" to include it in your ad set.
                      </p>
                    </div>
                  );
                }

                // Group by subCategory
                const grouped: Record<string, TargetingCategoryItem[]> = {};
                for (const item of filtered) {
                  if (!grouped[item.subCategory]) grouped[item.subCategory] = [];
                  grouped[item.subCategory].push(item);
                }

                const isLiveResultsActive = liveTargetingResults.length > 0 && query.length >= 2;

                return (
                  <div className="space-y-6">
                    {isLiveResultsActive && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Showing <strong>live Meta Graph API verified targeting options</strong> for "{query}"</span>
                      </div>
                    )}
                    {Object.entries(grouped).map(([subCat, items]) => (
                      <div key={subCat} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {subCat}
                          </span>
                          <span className="text-[11px] text-slate-400">{items.length} options</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {items.map((item) => {
                            const isSelected = selectedTargetingTags.some(
                              (t) => t.toLowerCase() === item.name.toLowerCase() || t === item.name
                            );
                            const badgeColor =
                              item.category === "demographics"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : item.category === "interests"
                                ? "bg-sky-50 text-sky-700 border-sky-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200";

                            const formatAudience = (num?: number | null) => {
                              if (!num) return null;
                              if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
                              if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
                              if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
                              return String(num);
                            };

                            const audienceText = item.audienceSizeLower
                              ? `${formatAudience(item.audienceSizeLower)}${item.audienceSizeUpper ? `–${formatAudience(item.audienceSizeUpper)}` : ""} people`
                              : null;

                            return (
                              <div
                                key={item.id}
                                onClick={() => handleToggleTargetingTag(item.name)}
                                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-start justify-between gap-3 ${
                                  isSelected
                                    ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-sm"
                                    : "bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-xs hover:bg-slate-50/50"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl shrink-0">{item.icon || "🎯"}</span>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-bold text-slate-900">{item.name}</span>
                                      <span className={`text-[9.5px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${badgeColor}`}>
                                        {item.category}
                                      </span>
                                      {audienceText && (
                                        <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200/80">
                                          👥 {audienceText}
                                        </span>
                                      )}
                                    </div>
                                    {item.description && (
                                      <p className="text-[11px] text-slate-500 leading-snug">{item.description}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0 pt-0.5">
                                  <div
                                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                      isSelected
                                        ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                <span className="font-extrabold text-slate-900">{selectedTargetingTags.length}</span> detailed categories active
                {selectedTargetingTags.length === 0 && (
                  <span className="text-slate-400 italic ml-1.5">(Advantage+ broad expansion active)</span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDetailedTargetingModal(false)}
                  className="px-4 py-2 hover:bg-slate-200/70 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyDetailedTargeting}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 cursor-pointer transition-all active:scale-98"
                >
                  Apply to Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DEDICATED PRE-FLIGHT INTERACTIVE EDIT MODALS                  */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* ── 1. AD MEDIA & CREATIVE STUDIO MODAL ── */}
      {activeEditModal === "media" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200/80 overflow-hidden ring-1 ring-black/5 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-purple-50/30 to-indigo-50/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Ad Creative & Media Studio</h3>
                  <p className="text-xs text-slate-500">Attach an image or video for Facebook & Instagram placements</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Option 1: Upload from device */}
              <div
                onClick={() => {
                  setActiveEditModal(null);
                  fileInputRef.current?.click();
                }}
                className="p-4 rounded-2xl border border-purple-200/90 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer flex items-center gap-3.5 group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Upload Image or Video from Device</span>
                    <span className="text-[10px] text-purple-700 font-bold bg-purple-100/80 px-2 py-0.5 rounded-full">Recommended</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Supports JPG, PNG (1080×1080 square) or MP4/MOV reels</p>
                </div>
              </div>

              {/* Option 2: Meta Ad Library */}
              <div
                onClick={() => {
                  setActiveEditModal(null);
                  setShowAdLibraryModal(true);
                  fetchMediaLibrary();
                }}
                className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer flex items-center gap-3.5 group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900">Choose from Meta Ad Account Library</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Select previously approved image creatives or video assets</p>
                </div>
              </div>

              {/* Option 3: Generate with AI */}
              <div
                onClick={() => {
                  setActiveEditModal(null);
                  handleSendMessage("Generate a compelling high-converting ad image for my campaign");
                }}
                className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:bg-sky-50 hover:border-sky-300 transition-all cursor-pointer flex items-center gap-3.5 group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900">Generate Ad Graphic with JISNU AI</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Creates studio-quality promotional creative based on your business offer</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveEditModal(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. AD COPY & HEADLINE EDITOR MODAL ── */}
      {activeEditModal === "headline" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200/80 overflow-hidden ring-1 ring-black/5 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Edit Ad Copy & Headline</h3>
                  <p className="text-xs text-slate-500">Fine-tune your headline, hook, primary text, and CTA button</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Quick Variations Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Quick Angle Presets:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditHeadline("🚗 Rent a Car Today – No Hidden Fees!");
                      setEditPrimaryText("Need a car for a day, weekend, or event? Ak Cars offers hassle-free rentals with flexible rates, 24/7 support, and top-condition vehicles. Book now via WhatsApp and get an instant discount!");
                      setEditDescription("Fast, reliable, and affordable car rentals in Mumbai & Pune.");
                    }}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1"
                  >
                    <span>🔥 Direct Offer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditHeadline("⚡ Stop Overpaying for Taxis & Cabs!");
                      setEditPrimaryText("Tired of cab cancellations and surge pricing? Get clean, reliable self-drive and rental cars at flat daily rates with zero hidden charges. Direct WhatsApp booking with instant confirmation.");
                      setEditDescription("Transparent Pricing • 100% Guaranteed Fleet");
                    }}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1"
                  >
                    <span>⚡ Pain Point & Hook</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditHeadline("⭐ 500+ Happy Renters in Mumbai & Pune!");
                      setEditPrimaryText("See why travelers and families rate Ak Cars 4.9/5 stars for clean, serviced vehicles. From road trips to airport drops, we guarantee the best rates and seamless WhatsApp support.");
                      setEditDescription("Rated 4.9/5 by 500+ verified customers");
                    }}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1"
                  >
                    <span>⭐ Social Proof</span>
                  </button>
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Ad Headline:</label>
                  <span className="text-[10px] text-slate-400 font-medium">{editHeadline.length}/40 char recommended</span>
                </div>
                <input
                  type="text"
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  placeholder="e.g. 🚗 Rent a Car Today – No Hidden Fees!"
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-semibold text-slate-900 shadow-2xs"
                />
              </div>

              {/* Primary Text */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Primary Text (Hook & Body):</label>
                  <span className="text-[10px] text-slate-400 font-medium">{editPrimaryText.length} characters</span>
                </div>
                <textarea
                  rows={4}
                  value={editPrimaryText}
                  onChange={(e) => setEditPrimaryText(e.target.value)}
                  placeholder="Explain your offer, key benefits, and why customers should take action..."
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-normal text-slate-800 shadow-2xs resize-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Link Description:</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="e.g. Fast, reliable, and affordable car rentals in Mumbai & Pune."
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-700 shadow-2xs"
                />
              </div>

              {/* CTA Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Call To Action Button:</label>
                <select
                  value={editCta}
                  onChange={(e) => setEditCta(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-semibold text-slate-800 shadow-2xs"
                >
                  <option value="WHATSAPP_MESSAGE">💬 Send WhatsApp Message (Recommended)</option>
                  <option value="LEARN_MORE">👉 Learn More</option>
                  <option value="BOOK_NOW">📅 Book Now</option>
                  <option value="CONTACT_US">📞 Contact Us</option>
                  <option value="APPLY_NOW">📋 Apply Now</option>
                  <option value="GET_QUOTE">💰 Get Quote</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveEditModal(null);
                  handleSendMessage("Generate alternative copy variations and text hooks for my ad");
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask AI to rewrite</span>
              </button>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveEditModal(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveHeadline}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 cursor-pointer transition-all active:scale-98"
                >
                  Save & Apply Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. CAMPAIGN BUDGET & PACING MODAL ── */}
      {activeEditModal === "budget" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200/80 overflow-hidden ring-1 ring-black/5 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-emerald-50/30 to-teal-50/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Campaign Budget & ROI Pacing</h3>
                  <p className="text-xs text-slate-500">Configure daily spend and Advantage+ budget optimization</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Daily Budget Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Daily Spend Amount:</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min={100}
                    step={50}
                    value={editDailyBudget}
                    onChange={(e) => setEditDailyBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-16 py-2.5 text-base font-extrabold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 shadow-2xs"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">/day</span>
                </div>
              </div>

              {/* Quick Amount Chips */}
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">Recommended Daily Presets:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[500, 750, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setEditDailyBudget(amt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        editDailyBudget === amt
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs scale-102"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      ₹{amt}/day
                    </button>
                  ))}
                </div>
              </div>

              {/* Advantage+ CBO Toggle Card */}
              <div className="p-3.5 rounded-2xl border border-emerald-200/90 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>Advantage+ Campaign Budget (CBO)</span>
                    <span className="text-[9px] font-extrabold bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded">Meta AI</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5">Automatically distributes budget to highest-converting placements</p>
                </div>
                <input
                  type="checkbox"
                  checked={editIsCbo}
                  onChange={(e) => setEditIsCbo(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Dynamic ROI Forecast Box */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Projected Monthly Yield (@ ₹16 CPA):</span>
                  <span className="text-emerald-700 font-extrabold">~₹{(editDailyBudget * 30).toLocaleString("en-IN")}/month</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/70 text-center">
                  <div className="p-2 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Est. Leads / Mo</span>
                    <span className="text-sm font-extrabold text-slate-900">~{Math.round((editDailyBudget * 30) / 16).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Est. Impressions</span>
                    <span className="text-sm font-extrabold text-slate-900">~{Math.round(editDailyBudget * 30 * 42).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveEditModal(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBudget}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 cursor-pointer transition-all active:scale-98"
              >
                Save & Apply Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. AD DESTINATION & LEAD ROUTING MODAL ── */}
      {activeEditModal === "destination" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200/80 overflow-hidden ring-1 ring-black/5 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-teal-50/30 to-emerald-50/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Ad Destination & Lead Routing</h3>
                  <p className="text-xs text-slate-500">Choose where prospects land when tapping your ad</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Destination Type Radio Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "WHATSAPP", label: "Click-to-WhatsApp", icon: "💬", desc: "Highest conversion in India" },
                  { id: "INSTANT_FORM", label: "Instant Lead Form", icon: "📋", desc: "Native on-platform form" },
                  { id: "WEBSITE", label: "Website Landing Page", icon: "🌐", desc: "Direct traffic to your URL" },
                  { id: "PHONE_CALL", label: "Click to Call", icon: "📞", desc: "Direct customer dial" },
                ].map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setEditDestType(d.id as any)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      editDestType === d.id
                        ? "bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{d.icon}</span>
                      <span className="text-xs font-bold text-slate-900">{d.label}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-1 leading-tight">{d.desc}</p>
                  </div>
                ))}
              </div>

              {/* WhatsApp Specific Controls */}
              {editDestType === "WHATSAPP" && (
                <div className="p-4 rounded-2xl border border-teal-200/90 bg-teal-50/50 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Verified WhatsApp Number:</label>
                    <select
                      value={editWhatsappPhone}
                      onChange={(e) => setEditWhatsappPhone(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-teal-200 rounded-xl font-bold text-slate-800 shadow-2xs"
                    >
                      <option value="+91 77099 36965">+91 77099 36965 (Jisnu Digital Solutions - Verified WABA)</option>
                      <option value="+1 555-174-6047">+1 555-174-6047 (Test WhatsApp Number)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Pre-Filled Customer Message:</label>
                    <textarea
                      rows={2}
                      value={editGreetingMsg}
                      onChange={(e) => setEditGreetingMsg(e.target.value)}
                      placeholder="Hi Ak Cars, I saw your ad on Facebook and want to know more about..."
                      className="w-full text-xs p-2.5 bg-white border border-teal-200 rounded-xl font-normal text-slate-800 shadow-2xs resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Website Specific Controls */}
              {editDestType === "WEBSITE" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Destination Website URL:</label>
                  <input
                    type="url"
                    value={editWebsiteUrl}
                    onChange={(e) => setEditWebsiteUrl(e.target.value)}
                    placeholder="https://yourwebsite.com/rentals"
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium text-slate-900 shadow-2xs"
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveEditModal(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDestination}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/25 cursor-pointer transition-all active:scale-98"
              >
                Save & Apply Destination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. META AD ACCOUNT & BILLING MODAL ── */}
      {activeEditModal === "account" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200/80 overflow-hidden ring-1 ring-black/5 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-blue-50/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Meta Ad Account & Billing</h3>
                  <p className="text-xs text-slate-500">Connected advertising identity and Meta Pixel tracking</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-2xl border border-indigo-200/80 bg-indigo-50/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950">JISNU Digital Solution's Marketing Agency</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Verified</span>
                </div>
                <p className="text-[11px] text-indigo-800/80">Currency: INR (₹) · Timezone: Asia/Kolkata (+05:30)</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Meta Ad Account ID:</label>
                <input
                  type="text"
                  value={editAdAccountId}
                  onChange={(e) => setEditAdAccountId(e.target.value)}
                  placeholder="act_1454270479625110"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Meta Pixel Dataset ID:</label>
                <input
                  type="text"
                  value={editPixelId}
                  onChange={(e) => setEditPixelId(e.target.value)}
                  placeholder="1380912777544016"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-700 shadow-2xs"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveEditModal(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAccount}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 cursor-pointer transition-all active:scale-98"
              >
                Save & Apply Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. FACEBOOK PAGE & IDENTITY MODAL ── */}
      {activeEditModal === "page" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200/80 overflow-hidden ring-1 ring-black/5 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-sky-50/30 to-blue-50/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Facebook Page & Identity</h3>
                  <p className="text-xs text-slate-500">Official publisher branding displayed on your live ad</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Business Page Name:</label>
                <input
                  type="text"
                  value={editPageName}
                  onChange={(e) => setEditPageName(e.target.value)}
                  placeholder="e.g. JISNU Digital Solutions Pvt.Ltd"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Facebook Page ID:</label>
                <input
                  type="text"
                  value={editPageId}
                  onChange={(e) => setEditPageId(e.target.value)}
                  placeholder="1062234726963242"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-700 shadow-2xs"
                />
              </div>

              <div className="p-3.5 rounded-2xl border border-sky-200/80 bg-sky-50/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-sky-950 block">Instagram Placement Linking</span>
                  <span className="text-[11px] text-sky-800/80">Ads automatically run with your verified Facebook profile on Instagram</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Connected</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveEditModal(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePage}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/25 cursor-pointer transition-all active:scale-98"
              >
                Save & Apply Identity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. DEMOGRAPHICS & PLACEMENTS MODAL ── */}
      {activeEditModal === "audience" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200/80 overflow-hidden ring-1 ring-black/5 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-violet-50/30 to-purple-50/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Demographics & Advantage+ Placements</h3>
                  <p className="text-xs text-slate-500">Configure target age, gender distribution, and network delivery</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Age Range Slider / Inputs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Target Age Range:</label>
                  <span className="text-xs font-extrabold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-200">
                    {editAgeMin} to {editAgeMax} years
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block uppercase">Min Age</label>
                    <input
                      type="number"
                      min={18}
                      max={editAgeMax}
                      value={editAgeMin}
                      onChange={(e) => setEditAgeMin(Math.min(Number(e.target.value), editAgeMax))}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block uppercase">Max Age</label>
                    <input
                      type="number"
                      min={editAgeMin}
                      max={65}
                      value={editAgeMax}
                      onChange={(e) => setEditAgeMax(Math.max(Number(e.target.value), editAgeMin))}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Age Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: "18–35 (Youth)", min: 18, max: 35 },
                    { label: "20–45 (Core)", min: 20, max: 45 },
                    { label: "25–55 (Affluent)", min: 25, max: 55 },
                    { label: "18–65 (All Adults)", min: 18, max: 65 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setEditAgeMin(p.min);
                        setEditAgeMax(p.max);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        editAgeMin === p.min && editAgeMax === p.max
                          ? "bg-violet-50 text-violet-800 border-violet-300 font-bold"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Gender Targeting:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "ALL", label: "All Genders", desc: "Men & Women" },
                    { id: "MEN", label: "Men Only", desc: "Male audience" },
                    { id: "WOMEN", label: "Women Only", desc: "Female audience" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setEditGender(g.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        editGender === g.id
                          ? "bg-violet-600 text-white border-violet-600 shadow-xs scale-101"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span className="text-xs font-bold block">{g.label}</span>
                      <span className={`text-[9.5px] ${editGender === g.id ? "text-violet-100" : "text-slate-400"}`}>{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Placements Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Placement Network:</label>
                <div className="p-3 rounded-2xl border border-violet-200/90 bg-violet-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-violet-950 block">Advantage+ Automated Placements</span>
                    <span className="text-[11px] text-violet-800/80">Meta dynamically delivers across Facebook, Instagram, Reels & Stories</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Recommended</span>
                </div>
              </div>

              {/* Detailed Targeting / Interests Shortcut */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Detailed Interests & Behaviours:</span>
                  <span className="text-[10px] text-violet-700 bg-violet-100 font-bold px-2 py-0.5 rounded-full">
                    {session?.draft?.targeting?.interests?.length || selectedTargetingTags.length || 0} active signals
                  </span>
                </div>

                {((session?.draft?.targeting?.interests && session.draft.targeting.interests.length > 0) || selectedTargetingTags.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200/80">
                    {(session?.draft?.targeting?.interests || selectedTargetingTags).map((tag: string) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-[10.5px] font-semibold bg-violet-50 text-violet-800 px-2.5 py-1 rounded-lg border border-violet-200">
                        <span>🎯 {tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveEditModal(null);
                      handleSendMessage("Suggest and add detailed targeting (demographics, interests & behaviours) for my business");
                    }}
                    className="py-2.5 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>✨ AI Suggest & Add All</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveEditModal(null);
                      openDetailedTargetingModal();
                    }}
                    className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                  >
                    <Target className="h-3.5 w-3.5 text-blue-600" />
                    <span>🏷️ Browse Meta Catalog</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveEditModal(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAudience}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/25 cursor-pointer transition-all active:scale-98"
              >
                Save & Apply Demographics
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
  );
}
