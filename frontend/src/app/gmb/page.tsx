"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Store, 
  Eye, 
  Globe, 
  Phone, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  AlertCircle, 
  Settings, 
  ExternalLink,
  Info,
  Calendar,
  Smartphone,
  Monitor,
  Search,
  Map,
  ArrowUpRight,
  GitMerge,
  Star,
  Sparkles,
  Plus,
  Trash2,
  Send,
  HelpCircle,
  MessageSquare,
  Camera,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check
} from "lucide-react";
import Link from "next/link";
import { io } from "socket.io-client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";


// Native SVG Instagram & WhatsApp icons matching main page
const Instagram = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WhatsApp = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_ORG_ID = "demo-org-123";

interface SelectOption {
  value: string;
  label: string;
}

function ShadcnSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select"
}: {
  value: string;
  onValueChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full text-center" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-full items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-1 py-2 text-xs font-bold text-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer text-center select-none"
      >
        <span className="truncate text-center w-full block ml-2">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-55 shrink-0 text-slate-500 mr-1.5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-850 bg-slate-955 p-1 text-slate-200 shadow-2xl animate-fadeIn scrollbar-none">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onValueChange(opt.value);
                  setIsOpen(false);
                }}
                className={`relative flex w-full cursor-pointer select-none items-center justify-center rounded-lg py-2 text-xs text-slate-350 outline-none transition-colors hover:bg-slate-900 hover:text-slate-100 ${
                  isSelected ? "bg-slate-900 font-bold text-primary" : ""
                }`}
              >
                {isSelected && (
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                )}
                <span className="truncate text-center w-full">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const hourOptions = Array.from({ length: 12 }, (_, i) => {
  const val = (i + 1).toString().padStart(2, "0");
  return { value: val, label: val };
});

const minuteOptions = Array.from({ length: 12 }, (_, i) => {
  const val = (i * 5).toString().padStart(2, "0");
  return { value: val, label: val };
});

const ampmOptions = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" }
];

const getInitialTimeState = () => {
  if (typeof window === "undefined") {
    return { hour: "09", minute: "30", ampm: "AM" };
  }
  const now = new Date();
  const currentHour24 = now.getHours();
  const currentHour12 = currentHour24 % 12 || 12;
  const hour = currentHour12.toString().padStart(2, "0");
  
  const currentMinute = now.getMinutes();
  const nearest5 = Math.round(currentMinute / 5) * 5;
  const normalizedMinute = nearest5 >= 60 ? 0 : nearest5;
  const minute = normalizedMinute.toString().padStart(2, "0");
  
  const ampm = currentHour24 >= 12 ? "PM" : "AM";
  return { hour, minute, ampm };
};

interface PerformanceSummary {
  totalViews: number;
  totalActions: number;
  websiteClicks: number;
  callClicks: number;
  directionsRequests: number;
  conversations: number;
  desktopViews: number;
  mobileViews: number;
  searchViews: number;
  mapsViews: number;
}

interface TimelineDay {
  date: string;
  WEBSITE_CLICKS: number;
  CALL_CLICKS: number;
  BUSINESS_DIRECTION_REQUESTS: number;
  BUSINESS_IMPRESSIONS_DESKTOP_MAPS: number;
  BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: number;
  BUSINESS_IMPRESSIONS_MOBILE_MAPS: number;
  BUSINESS_IMPRESSIONS_MOBILE_SEARCH: number;
  BUSINESS_CONVERSATIONS: number;
  totalViews: number;
  totalActions: number;
}

interface PerformanceData {
  locationName: string;
  googleLocationId: string;
  range: {
    startDate: string;
    endDate: string;
    label: string;
    previousLabel: string;
  };
  summary: PerformanceSummary;
  previousSummary: PerformanceSummary;
  growth: {
    totalViews: string;
    websiteClicks: string;
    callClicks: string;
    directionsRequests: string;
  };
  timeline: TimelineDay[];
}

// Popover components mimicking shadcn Popover API locally
const PopoverContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function Popover({
  children,
  open: controlledOpen,
  onOpenChange
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setLocalOpen(newOpen);
    }
  };

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      {children}
    </PopoverContext.Provider>
  );
}

function PopoverTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverTrigger must be used inside Popover");

  const { open, setOpen } = context;

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setOpen(!open);
        if (child.props && typeof child.props.onClick === "function") {
          child.props.onClick(e);
        }
      }
    });
  }

  return (
    <button type="button" onClick={() => setOpen(!open)}>
      {children}
    </button>
  );
}

function PopoverContent({
  children,
  align = "start",
  side = "bottom",
  sideOffset = 4,
  avoidCollisions = false,
  className = ""
}: {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  avoidCollisions?: boolean;
  className?: string;
}) {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverContent must be used inside Popover");

  const { open } = context;

  if (!open) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "100%",
        marginTop: `${sideOffset}px`,
        zIndex: 50
      }}
      className={`bg-[#020617] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden animate-fadeIn ${className}`}
    >
      {children}
    </div>
  );
}

function ScrollArea({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 ${className}`}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#334155 #0f172a"
      }}
    >
      {children}
    </div>
  );
}

interface CustomGmbTimePickerProps {
  selectedTime: Date;
  onChange: (date: Date) => void;
}

function CustomGmbTimePicker({ selectedTime, onChange }: CustomGmbTimePickerProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Synchronize internal input value with the selectedTime prop in HH:MM format
  useEffect(() => {
    if (selectedTime) {
      const hStr = selectedTime.getHours().toString().padStart(2, "0");
      const mStr = selectedTime.getMinutes().toString().padStart(2, "0");
      setInputValue(`${hStr}:${mStr}`);
    }
  }, [selectedTime]);

  const times = React.useMemo(() => {
    const list: string[] = [];
    for (let h = 0; h < 24; h++) {
      const hStr = h.toString().padStart(2, "0");
      list.push(`${hStr}:00`);
      list.push(`${hStr}:30`);
    }
    return list;
  }, []);

  // Validate and format value or revert on blur / click outside
  const validateAndRevertOrFormat = (val: string) => {
    const cleaned = val.trim();
    
    // Parse formats like H:M, HH:M, H:MM, HH:MM
    const match = cleaned.match(/^(\d{1,2}):(\d{1,2})$/);
    if (match) {
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        const hStr = h.toString().padStart(2, "0");
        const mStr = m.toString().padStart(2, "0");
        const formatted = `${hStr}:${mStr}`;
        setInputValue(formatted);
        
        const newDate = new Date(selectedTime);
        newDate.setHours(h);
        newDate.setMinutes(m);
        newDate.setSeconds(0);
        onChange(newDate);
        return;
      }
    }

    // Try parsing numbers only (e.g. 9 or 09 or 905)
    const numOnly = parseInt(cleaned, 10);
    if (!isNaN(numOnly) && !cleaned.includes(":")) {
      if (cleaned.length <= 2 && numOnly >= 0 && numOnly <= 23) {
        const hStr = numOnly.toString().padStart(2, "0");
        const formatted = `${hStr}:00`;
        setInputValue(formatted);
        
        const newDate = new Date(selectedTime);
        newDate.setHours(numOnly);
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        onChange(newDate);
        return;
      }
      if (cleaned.length === 3 || cleaned.length === 4) {
        const hVal = parseInt(cleaned.slice(0, cleaned.length - 2), 10);
        const mVal = parseInt(cleaned.slice(cleaned.length - 2), 10);
        if (hVal >= 0 && hVal <= 23 && mVal >= 0 && mVal <= 59) {
          const hStr = hVal.toString().padStart(2, "0");
          const mStr = mVal.toString().padStart(2, "0");
          const formatted = `${hStr}:${mStr}`;
          setInputValue(formatted);
          
          const newDate = new Date(selectedTime);
          newDate.setHours(hVal);
          newDate.setMinutes(mVal);
          newDate.setSeconds(0);
          onChange(newDate);
          return;
        }
      }
    }
    
    // Revert if completely invalid
    if (selectedTime) {
      const hStr = selectedTime.getHours().toString().padStart(2, "0");
      const mStr = selectedTime.getMinutes().toString().padStart(2, "0");
      setInputValue(`${hStr}:${mStr}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Input filtering: allow digits and colons only
    val = val.replace(/[^0-9:]/g, "");
    
    // Apply basic mask: if 2 digits are typed without colon, insert colon
    if (val.length === 2 && !val.includes(":") && e.target.value.length > inputValue.length) {
      val = val + ":";
    }
    
    if (val.length > 5) {
      val = val.slice(0, 5);
    }
    
    setInputValue(val);

    // Live validation (optional, propagate if already perfectly matches HH:MM format)
    const match = val.match(/^(\d{2}):(\d{2})$/);
    if (match) {
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        const newDate = new Date(selectedTime);
        newDate.setHours(h);
        newDate.setMinutes(m);
        newDate.setSeconds(0);
        onChange(newDate);
      }
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        validateAndRevertOrFormat(inputValue);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputValue, selectedTime]);

  // Scroll active/selected item into view when dropdown is opened
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: "nearest", behavior: "auto" });
    }
  }, [isOpen]);

  const selectTime = (timeStr: string) => {
    setInputValue(timeStr);
    setIsOpen(false);
    
    const [hStr, mStr] = timeStr.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    
    const newDate = new Date(selectedTime);
    newDate.setHours(h);
    newDate.setMinutes(m);
    newDate.setSeconds(0);
    onChange(newDate);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsOpen(false);
      validateAndRevertOrFormat(inputValue);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      validateAndRevertOrFormat(inputValue);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="HH:MM"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer text-center"
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={4}
          avoidCollisions={false}
          className="w-full p-0"
        >
          <ScrollArea className="h-60">
            {times.map((time) => {
              const isSelected = time === inputValue;
              return (
                <button
                  key={time}
                  type="button"
                  ref={isSelected ? activeItemRef : null}
                  onClick={() => selectTime(time)}
                  className={`w-full text-center px-4 py-2 text-xs transition-colors cursor-pointer block text-left px-3 py-2 hover:bg-accent ${
                    isSelected
                      ? "bg-primary/20 text-primary font-bold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function GmbPerformanceDashboard() {
  const [orgId, setOrgId] = useState(DEFAULT_ORG_ID);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PerformanceData | null>(null);
  const [activeMetricTab, setActiveMetricTab] = useState<"actions" | "views">("actions");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<"performance" | "profile" | "posts" | "qa" | "media">("performance");

  // GMB Profile Editor States
  const [profileTitle, setProfileTitle] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddPhone1, setProfileAddPhone1] = useState("");
  const [profileAddPhone2, setProfileAddPhone2] = useState("");
  const [profileWebsite, setProfileWebsite] = useState("");
  const [profileDesc, setProfileDesc] = useState("");
  const [profileCategory, setProfileCategory] = useState("");
  const [profileAddCategoriesText, setProfileAddCategoriesText] = useState("");
  const [profileOpeningDate, setProfileOpeningDate] = useState({ year: "", month: "", day: "" });
  const [profileAddress, setProfileAddress] = useState<any>({
    addressLines: [""],
    locality: "",
    administrativeArea: "",
    postalCode: "",
    regionCode: "IN"
  });
  const [profileHours, setProfileHours] = useState<any>({ periods: [] });
  const [profileSpecialHours, setProfileSpecialHours] = useState<any[]>([]);
  const [profileServiceAreas, setProfileServiceAreas] = useState<any[]>([]);
  const [newServiceAreaName, setNewServiceAreaName] = useState("");
  const [placesSuggestions, setPlacesSuggestions] = useState<{ placeId: string; placeName: string }[]>([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const latestSearchQuery = useRef("");
  const [profileLabelsText, setProfileLabelsText] = useState("");
  const [profileAttributes, setProfileAttributes] = useState<any>({
    accessibility: {
      wheelchair_accessible_toilet: false,
      wheelchair_accessible_car_park: false,
      wheelchair_accessible_entrance: false,
      wheelchair_accessible_seating: false
    },
    amenities: {
      gender_neutral_toilets: false
    },
    crowd: {
      lgqbtq_friendly: false
    },
    parking: {
      free_multistorey_car_park: false,
      free_parking_lot: false
    },
    planning: {
      appointment_required: false
    },
    serviceOptions: {
      offers_online_appointments: false,
      onsite_services_available: false
    }
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // GMB Posts States
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postSummary, setPostSummary] = useState("");
  const [postMediaUrl, setPostMediaUrl] = useState("");
  const [postCTA, setPostCTA] = useState("NONE");
  const [postCTAUrl, setPostCTAUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isScheduledOnly, setIsScheduledOnly] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);

  // Detect if user locale prefers 12-hour or 24-hour format
  const is12HourFormat = React.useMemo(() => {
    if (typeof window === "undefined") return true;
    try {
      const formatter = new Intl.DateTimeFormat(undefined, { hour: "numeric" });
      const resolved = formatter.resolvedOptions();
      if (resolved.hour12 !== undefined) {
        return resolved.hour12;
      }
      const sample = formatter.format(new Date(2026, 0, 1, 13, 0, 0));
      return /am|pm|a\s*m|p\s*m/i.test(sample);
    } catch (e) {
      return true;
    }
  }, []);

  const [scheduleTime, setScheduleTime] = useState<Date>(() => {
    const d = new Date();
    const minutes = d.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;
    d.setMinutes(roundedMinutes);
    d.setSeconds(0);
    return d;
  });

  const formattedTimeStr = React.useMemo(() => {
    if (!scheduleTime) return "";
    return format(scheduleTime, is12HourFormat ? "hh:mm a" : "HH:mm");
  }, [scheduleTime, is12HourFormat]);

  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Synchronize scheduledAt whenever date or time changes
  useEffect(() => {
    if (isScheduledOnly && scheduleDate && scheduleTime) {
      const y = scheduleDate.getFullYear();
      const m = (scheduleDate.getMonth() + 1).toString().padStart(2, "0");
      const d = scheduleDate.getDate().toString().padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      const hours = scheduleTime.getHours().toString().padStart(2, "0");
      const minutes = scheduleTime.getMinutes().toString().padStart(2, "0");
      setScheduledAt(`${dateStr}T${hours}:${minutes}:00`);
    } else {
      setScheduledAt("");
    }
  }, [isScheduledOnly, scheduleDate, scheduleTime]);

  // GMB Q&A States
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [replyingToQuestionId, setReplyingToQuestionId] = useState<string | null>(null);
  const [questionReplyText, setQuestionReplyText] = useState("");
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // GMB Media States
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaCategory, setMediaCategory] = useState("ADDITIONAL");
  const [mediaFileBase64, setMediaFileBase64] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  // Determine standard default months based on 3-day data delay
  const latestDate = new Date();
  latestDate.setDate(latestDate.getDate() - 3);
  const defaultAMonth = latestDate.getMonth() + 1;
  const defaultAYear = latestDate.getFullYear();

  let defaultBMonth = latestDate.getMonth();
  let defaultBYear = latestDate.getFullYear();
  if (defaultBMonth === 0) {
    defaultBMonth = 12;
    defaultBYear -= 1;
  }

  const [selectedAMonth, setSelectedAMonth] = useState(defaultAMonth);
  const [selectedAYear, setSelectedAYear] = useState(defaultAYear);
  const [selectedBMonth, setSelectedBMonth] = useState(defaultBMonth);
  const [selectedBYear, setSelectedBYear] = useState(defaultBYear);
  
  useEffect(() => {
    fetchPosts();
    fetchQuestions();
    fetchMedia();
    fetchProfileDetails();
  }, [orgId]);

  // Real-time updates for Google My Business Posts via Socket.io
  useEffect(() => {
    const socket = io(BACKEND_URL);

    // Join the organization room
    socket.emit("join-org", orgId);

    // Sync event: Updates the entire posts list
    socket.on("posts-synced", (syncedPosts: any[]) => {
      setPosts(syncedPosts);
    });

    // New post event: Prepends the new post avoiding duplicate gmbPostId/id
    socket.on("new-post", (newPost: any) => {
      setPosts((prev) => {
        if (newPost.gmbPostId && prev.some((p) => p.gmbPostId === newPost.gmbPostId)) {
          return prev;
        }
        if (prev.some((p) => p.id === newPost.id)) {
          return prev;
        }
        return [newPost, ...prev];
      });
    });

    // Post updated event: Updates fields for a matching post in local state
    socket.on("post-updated", (updatedPost: any) => {
      setPosts((prev) =>
        prev.map((p) => {
          if (updatedPost.gmbPostId && p.gmbPostId === updatedPost.gmbPostId) {
            return updatedPost;
          }
          if (p.id === updatedPost.id) {
            return updatedPost;
          }
          return p;
        })
      );
    });

    // Post deleted event: Removes the post from state
    socket.on("post-deleted", (deletedPostId: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== deletedPostId && p.gmbPostId !== deletedPostId));
    });

    // Disconnect when component unmounts
    return () => {
      socket.disconnect();
    };
  }, [orgId]);

  // Fetch GMB Profile Details
  const fetchProfileDetails = async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/profile?orgId=${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setProfileTitle(data.title || "");
        
        setProfilePhone(data.phoneNumbers?.primaryPhone || "");
        setProfileAddPhone1(data.phoneNumbers?.additionalPhones?.[0] || "");
        setProfileAddPhone2(data.phoneNumbers?.additionalPhones?.[1] || "");
        
        setProfileWebsite(data.websiteUri || "");
        setProfileDesc(data.profile?.description || "");
        
        const primaryCat = data.categories?.primaryCategory;
        setProfileCategory(primaryCat ? (primaryCat.displayName || primaryCat.name) : "Internet marketing service");
        setProfileAddCategoriesText((data.categories?.additionalCategories || []).map((c: any) => c.displayName || c.name).join(", "));
        
        if (data.openInfo?.openingDate) {
          setProfileOpeningDate({
            year: String(data.openInfo.openingDate.year || ""),
            month: String(data.openInfo.openingDate.month || ""),
            day: String(data.openInfo.openingDate.day || "")
          });
        } else {
          setProfileOpeningDate({ year: "", month: "", day: "" });
        }
        
        setProfileAddress(data.storefrontAddress || {
          addressLines: [""],
          locality: "",
          administrativeArea: "",
          postalCode: "",
          regionCode: "IN"
        });
        
        const pad = (num: number) => String(num).padStart(2, "0");
        const mappedPeriods = (data.regularHours?.periods || []).map((p: any) => {
          const openH = p.openTime ? pad(p.openTime.hours ?? 0) : "09";
          const openM = p.openTime ? pad(p.openTime.minutes ?? 0) : "30";
          const closeH = p.closeTime ? pad(p.closeTime.hours ?? 0) : "18";
          const closeM = p.closeTime ? pad(p.closeTime.minutes ?? 0) : "30";
          return {
            openDay: p.openDay,
            openTime: `${openH}:${openM}`,
            closeDay: p.closeDay,
            closeTime: `${closeH}:${closeM}`
          };
        });
        
        setProfileHours({ periods: mappedPeriods });

        const mappedSpecial = (data.specialHours?.specialHourPeriods || []).map((sh: any) => {
          const parseDate = (dObj: any) => {
            if (!dObj) return "";
            return `${dObj.year}-${pad(dObj.month)}-${pad(dObj.day)}`;
          };
          const parseTime = (tObj: any) => {
            if (!tObj) return "09:00";
            return `${pad(tObj.hours)}:${pad(tObj.minutes)}`;
          };
          return {
            startDate: parseDate(sh.startDate),
            endDate: parseDate(sh.endDate || sh.startDate),
            openTime: parseTime(sh.openTime),
            closeTime: parseTime(sh.closeTime),
            closed: !!sh.closed
          };
        });
        setProfileSpecialHours(mappedSpecial);

        setProfileServiceAreas(data.serviceArea?.places?.placeInfos || []);
        setProfileLabelsText((data.labels || []).join(", "));
      }
    } catch (err) {
      console.error("Failed to fetch GMB profile details:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Update GMB Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const googlePeriods = (profileHours?.periods || []).map((p: any) => {
        const [openH, openM] = (p.openTime || "09:30").split(":").map(Number);
        const [closeH, closeM] = (p.closeTime || "18:30").split(":").map(Number);
        return {
          openDay: p.openDay,
          openTime: { hours: openH, minutes: openM, seconds: 0, nanos: 0 },
          closeDay: p.closeDay,
          closeTime: { hours: closeH, minutes: closeM, seconds: 0, nanos: 0 }
        };
      });

      const formattedSpecialHours = profileSpecialHours.map((sh: any) => {
        const parseTime = (timeStr: string) => {
          if (!timeStr) return { hours: 9, minutes: 0, seconds: 0, nanos: 0 };
          const [h, m] = timeStr.split(":").map(Number);
          return { hours: h || 0, minutes: m || 0, seconds: 0, nanos: 0 };
        };
        const parseDate = (dateStr: string) => {
          if (!dateStr) return { year: 2026, month: 1, day: 1 };
          const [y, m, d] = dateStr.split("-").map(Number);
          return { year: y || 0, month: m || 0, day: d || 0 };
        };
        return {
          startDate: parseDate(sh.startDate),
          endDate: parseDate(sh.endDate || sh.startDate),
          openTime: sh.closed ? undefined : parseTime(sh.openTime),
          closeTime: sh.closed ? undefined : parseTime(sh.closeTime),
          closed: !!sh.closed
        };
      });

      const additionalPhonesList = [profileAddPhone1, profileAddPhone2].filter(Boolean);
      const labelsList = profileLabelsText
        ? profileLabelsText.split(",").map(l => l.trim()).filter(Boolean)
        : [];

      const locationData: any = {
        title: profileTitle,
        phoneNumbers: {
          primaryPhone: profilePhone,
          additionalPhones: additionalPhonesList
        },
        websiteUri: profileWebsite,
        profile: {
          description: profileDesc
        },
        storefrontAddress: profileAddress,
        regularHours: {
          periods: googlePeriods
        },
        specialHours: {
          specialHourPeriods: formattedSpecialHours
        },
        openInfo: {
          status: "OPEN",
          openingDate: {
            year: profileOpeningDate.year ? Number(profileOpeningDate.year) : undefined,
            month: profileOpeningDate.month ? Number(profileOpeningDate.month) : undefined,
            day: profileOpeningDate.day ? Number(profileOpeningDate.day) : undefined
          }
        },
        labels: labelsList,
        serviceArea: {
          places: {
            placeInfos: profileServiceAreas
          }
        }
      };

      const res = await fetch(`${BACKEND_URL}/api/gmb/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          updateMask: "title,phoneNumbers,websiteUri,profile.description,storefrontAddress,regularHours,specialHours,openInfo.openingDate,labels,serviceArea",
          locationData
        })
      });
      if (res.ok) {
        alert("Business profile details successfully updated!");
        await fetchProfileDetails();
      } else {
        const errData = await res.json();
        alert(`Failed to save profile: ${errData.error}`);
      }
    } catch (err) {
      console.error("Failed to save GMB profile:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  // AI Description Generator (uses Groq backend)
  const handleGenerateDescription = async () => {
    setIsGeneratingDesc(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/profile/ai-suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: profileTitle,
          primaryCategory: profileCategory,
          additionalCategoriesText: profileAddCategoriesText
        })
      });

      if (res.ok) {
        const result = await res.json();
        setProfileDesc(result.suggestion || "");
      } else {
        const err = await res.json();
        alert(`AI Generation failed: ${err.error}`);
      }
    } catch (err) {
      console.error("Failed to generate AI description:", err);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // Autocomplete Service Areas using Google Places API proxy on backend
  const handlePlacesSearch = async (val: string) => {
    setNewServiceAreaName(val);
    latestSearchQuery.current = val;
    if (!val.trim()) {
      setPlacesSuggestions([]);
      return;
    }
    setSearchingPlaces(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/places/search?query=${encodeURIComponent(val)}`);
      if (res.ok) {
        const list = await res.json();
        // Prevent race condition: only update suggestions if query matches current value
        if (latestSearchQuery.current === val) {
          setPlacesSuggestions(list);
        }
      }
    } catch (err) {
      console.error("Autocomplete failed:", err);
    } finally {
      if (latestSearchQuery.current === val) {
        setSearchingPlaces(false);
      }
    }
  };

  // Helper to toggle a day open/closed
  const handleHoursDayToggle = (day: string, checked: boolean) => {
    const updatedPeriods = [...(profileHours?.periods || [])];
    if (checked) {
      // Add default period: 09:30 to 18:30
      updatedPeriods.push({
        openDay: day,
        openTime: "09:30",
        closeDay: day,
        closeTime: "18:30"
      });
    } else {
      // Remove all periods for this day
      const filtered = updatedPeriods.filter((p: any) => p.openDay !== day);
      setProfileHours({ periods: filtered });
      return;
    }
    setProfileHours({ periods: updatedPeriods });
  };

  // Helper to update hours for a day
  const handleHoursTimeChange = (day: string, field: "openTime" | "closeTime", value: string) => {
    const updatedPeriods = (profileHours?.periods || []).map((p: any) => {
      if (p.openDay === day) {
        return {
          ...p,
          [field]: value,
          closeDay: field === "closeTime" ? day : p.closeDay
        };
      }
      return p;
    });
    setProfileHours({ periods: updatedPeriods });
  };

  // Extract org query parameter in useEffect client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const orgParam = params.get("org") || params.get("orgId");
      if (orgParam) {
        setOrgId(orgParam);
      }
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchQuestions();
    fetchMedia();
  }, [orgId]);

  // Fetch GMB Posts
  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/posts?orgId=${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch GMB posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch GMB Questions
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/questions?orgId=${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Failed to fetch GMB questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Fetch GMB Gallery Photos
  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/media?orgId=${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch GMB media:", err);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Sync Q&A Questions from Google
  const handleSyncQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/questions/sync?orgId=${orgId}`);
      if (res.ok) {
        const result = await res.json();
        setQuestions(result.questions || []);
      }
    } catch (err) {
      console.error("Failed to sync GMB questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Submit New GMB Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postSummary) return;

    let finalScheduledAt = undefined;
    if (isScheduledOnly && scheduleDate && scheduleTime) {
      const y = scheduleDate.getFullYear();
      const m = (scheduleDate.getMonth() + 1).toString().padStart(2, "0");
      const d = scheduleDate.getDate().toString().padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      const hours = scheduleTime.getHours().toString().padStart(2, "0");
      const minutes = scheduleTime.getMinutes().toString().padStart(2, "0");
      finalScheduledAt = `${dateStr}T${hours}:${minutes}:00`;
    }

    setIsSubmittingPost(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/posts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          title: postTitle,
          summary: postSummary,
          mediaUrl: postMediaUrl || undefined,
          callToActionType: postCTA,
          callToActionUrl: postCTAUrl || undefined,
          scheduledAt: finalScheduledAt
        })
      });

      if (res.ok) {
        setPostTitle("");
        setPostSummary("");
        setPostMediaUrl("");
        setPostCTA("NONE");
        setPostCTAUrl("");
        setScheduledAt("");
        setScheduleDate(null);
        const d = new Date();
        const minutes = d.getMinutes();
        const roundedMinutes = Math.round(minutes / 15) * 15;
        d.setMinutes(roundedMinutes);
        d.setSeconds(0);
        setScheduleTime(d);
        setIsScheduledOnly(false);
        await fetchPosts();
      }
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Delete GMB Post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/posts/${postId}?orgId=${orgId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchPosts();
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  // Answer GMB Question
  const handlePostAnswer = async (questionId: string) => {
    if (!questionReplyText) return;

    setIsSubmittingAnswer(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/questions/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          questionId,
          replyText: questionReplyText
        })
      });

      if (res.ok) {
        setQuestionReplyText("");
        setReplyingToQuestionId(null);
        await fetchQuestions();
      }
    } catch (err) {
      console.error("Failed to reply to question:", err);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Gemini AI Copy Generator for Posts
  const handleGeneratePostCopy = async () => {
    setIsGeneratingPost(true);
    try {
      const prompt = `Write a short, engaging Google Business Profile local post updates for a service/marketing business. Output only the body text of the post and keep it under 300 characters.`;
      
      const res = await fetch(`${BACKEND_URL}/api/gmb/questions/ai-suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          questionText: prompt
        })
      });

      if (res.ok) {
        const result = await res.json();
        setPostSummary(result.suggestion || "");
      }
    } catch (err) {
      console.error("AI Post Copy generation failed:", err);
    } finally {
      setIsGeneratingPost(false);
    }
  };

  // Gemini AI Answer Generator for Questions
  const handleGenerateAnswerSuggestion = async (questionText: string) => {
    setIsGeneratingAnswer(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/questions/ai-suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          questionText
        })
      });

      if (res.ok) {
        const result = await res.json();
        setQuestionReplyText(result.suggestion || "");
      }
    } catch (err) {
      console.error("AI Answer suggestion failed:", err);
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  // Handle Photo Selector File Change
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload Selected Gallery Photo
  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFileBase64) return;

    setUploadingPhoto(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/media/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          image: mediaFileBase64,
          category: mediaCategory
        })
      });

      if (res.ok) {
        setMediaFileBase64(null);
        await fetchMedia();
      } else {
        const errData = await res.json();
        alert(`Failed to upload photo: ${errData.error}`);
      }
    } catch (err) {
      console.error("Failed to upload photo:", err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const fetchPerformance = async (
    aM = selectedAMonth, 
    aY = selectedAYear, 
    bM = selectedBMonth, 
    bY = selectedBYear
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/performance?orgId=${orgId}&aMonth=${aM}&aYear=${aY}&bMonth=${bM}&bYear=${bY}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load GMB performance metrics.");
      }
      const perfData = await res.json();
      setData(perfData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance(defaultAMonth, defaultAYear, defaultBMonth, defaultBYear);
  }, [orgId]);

  // Render SVG Chart based on fetched timeline
  const renderSvgAreaChart = (timeline: TimelineDay[], metrics: Array<keyof TimelineDay>, colors: string[]) => {
    if (!timeline || timeline.length === 0) return null;

    const width = 500;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 10;
    const paddingTop = 10;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Find max value across all selected metrics to scale Y axis
    let maxVal = 10;
    timeline.forEach(d => {
      metrics.forEach(m => {
        const val = Number(d[m] || 0);
        if (val > maxVal) maxVal = val;
      });
    });
    // Add 10% headroom
    maxVal = Math.ceil(maxVal * 1.1);

    const pointsCount = timeline.length;
    const stepX = chartWidth / (pointsCount - 1 || 1);

    return (
      <div className="relative w-full h-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Y Axis Gridlines & Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const yVal = Math.round(maxVal * ratio);
            const yPos = paddingTop + chartHeight * (1 - ratio);
            return (
              <g key={idx} className="opacity-40">
                <line 
                  x1={paddingLeft} 
                  y1={yPos} 
                  x2={width - paddingRight} 
                  y2={yPos} 
                  stroke="#334155" 
                  strokeWidth={1} 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={paddingLeft - 8} 
                  y={yPos + 3} 
                  fill="#94a3b8" 
                  fontSize={8} 
                  textAnchor="end"
                  className="font-medium"
                >
                  {yVal}
                </text>
              </g>
            );
          })}

          {/* X Axis Date Labels (every 7 days to avoid congestion) */}
          {timeline.map((d, idx) => {
            if (idx % 7 !== 0 && idx !== pointsCount - 1) return null;
            const xPos = paddingLeft + idx * stepX;
            const displayDate = d.date.substring(5); // MM-DD
            return (
              <g key={idx} className="opacity-60">
                <line 
                  x1={xPos} 
                  y1={paddingTop} 
                  x2={xPos} 
                  y2={paddingTop + chartHeight} 
                  stroke="#1e293b" 
                  strokeWidth={1} 
                />
                <text 
                  x={xPos} 
                  y={height - 8} 
                  fill="#94a3b8" 
                  fontSize={8} 
                  textAnchor="middle"
                  className="font-medium"
                >
                  {displayDate}
                </text>
              </g>
            );
          })}

          {/* Chart Lines and Area Paths */}
          {metrics.map((metric, metricIdx) => {
            const color = colors[metricIdx];
            const pathPoints = timeline.map((d, idx) => {
              const val = Number(d[metric] || 0);
              const x = paddingLeft + idx * stepX;
              const y = paddingTop + chartHeight * (1 - val / maxVal);
              return `${x},${y}`;
            });

            if (pathPoints.length === 0) return null;

            const linePath = `M ${pathPoints.join(" L ")}`;
            const areaPath = `${linePath} L ${paddingLeft + (pointsCount - 1) * stepX},${paddingTop + chartHeight} L ${paddingLeft},${paddingTop + chartHeight} Z`;

            return (
              <g key={metric}>
                {/* Fill Area */}
                <path 
                  d={areaPath} 
                  fill={color} 
                  opacity={0.06} 
                />
                {/* Line */}
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke={color} 
                  strokeWidth={2} 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Dot Markers at key intervals */}
                {timeline.map((d, idx) => {
                  if (idx % 5 !== 0 && idx !== pointsCount - 1) return null;
                  const val = Number(d[metric] || 0);
                  const x = paddingLeft + idx * stepX;
                  const y = paddingTop + chartHeight * (1 - val / maxVal);
                  return (
                    <circle 
                      key={idx} 
                      cx={x} 
                      cy={y} 
                      r={3} 
                      fill={color} 
                      stroke="#0f172a" 
                      strokeWidth={1} 
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Hover guidelines and point markers overlay */}
          {hoveredIndex !== null && (
            <g pointerEvents="none">
              {/* Vertical line indicator */}
              <line
                x1={paddingLeft + hoveredIndex * stepX}
                y1={paddingTop}
                x2={paddingLeft + hoveredIndex * stepX}
                y2={paddingTop + chartHeight}
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              
              {/* Target dots on line intersections */}
              {metrics.map((metric, metricIdx) => {
                const val = Number(timeline[hoveredIndex][metric] || 0);
                const x = paddingLeft + hoveredIndex * stepX;
                const y = paddingTop + chartHeight * (1 - val / maxVal);
                return (
                  <circle
                    key={`hover-dot-${metric}`}
                    cx={x}
                    cy={y}
                    r={5.5}
                    fill={colors[metricIdx]}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                );
              })}
            </g>
          )}

          {/* Invisible interactive hover rects mapping the X timeline points */}
          {timeline.map((d, idx) => {
            const colWidth = chartWidth / (pointsCount - 1 || 1);
            const colX = paddingLeft + idx * stepX - colWidth / 2;
            return (
              <rect
                key={`hitbox-${idx}`}
                x={colX}
                y={paddingTop}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Box Overlay */}
        {hoveredIndex !== null && (
          <div 
            className="absolute bg-slate-950/95 border border-slate-800 p-2.5 rounded-xl shadow-xl pointer-events-none text-[10px] space-y-1 z-30 text-left font-sans animate-fadeIn"
            style={{
              left: `${((paddingLeft + hoveredIndex * stepX) / width) * 100}%`,
              top: "-5px",
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="font-bold text-slate-300 border-b border-slate-900 pb-1 mb-1.5 whitespace-nowrap">
              {timeline[hoveredIndex].date}
            </div>
            <div className="space-y-1">
              {metrics.map((metric, metricIdx) => {
                let label = "Views";
                if (metric === "WEBSITE_CLICKS") label = "Website Clicks";
                if (metric === "CALL_CLICKS") label = "Calls";
                if (metric === "BUSINESS_DIRECTION_REQUESTS") label = "Directions";
                const val = Number(timeline[hoveredIndex][metric] || 0);
                return (
                  <div key={metric} className="flex items-center gap-4 justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors[metricIdx] }} />
                      {label}
                    </span>
                    <span className="font-bold text-slate-200">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-900 text-slate-100 font-sans">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight sm:text-2xl">Google Business Profile</h1>
                <p className="text-xs text-slate-400">
                  {data ? `${data.locationName} • GMB Complete Solution` : "Manage and track Google Business profile details"}
                </p>
              </div>
            </div>

            {/* Horizontal Sub-tabs Navigation */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 shadow-inner gap-1">
              <button
                type="button"
                onClick={() => setActiveSubTab("performance")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${activeSubTab === "performance" ? "bg-primary text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              >
                <TrendingUp className="h-3.5 w-3.5" /> Performance
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("profile")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${activeSubTab === "profile" ? "bg-primary text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              >
                <Settings className="h-3.5 w-3.5" /> Profile Details
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("posts")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${activeSubTab === "posts" ? "bg-primary text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              >
                <Calendar className="h-3.5 w-3.5" /> Updates & Posts
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("qa")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${activeSubTab === "qa" ? "bg-primary text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              >
                <HelpCircle className="h-3.5 w-3.5" /> Q&A Inbox
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("media")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${activeSubTab === "media" ? "bg-primary text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              >
                <Camera className="h-3.5 w-3.5" /> Photos Gallery
              </button>
            </div>
          </div>

          {activeSubTab === "performance" && (
            <>
              {/* Calendar Month Selectors Panel */}
          {(() => {
            const list = [];
            const listCursor = new Date();
            for (let i = 0; i < 12; i++) {
              const d = new Date(listCursor.getFullYear(), listCursor.getMonth() - i, 1);
              const m = d.getMonth() + 1;
              const y = d.getFullYear();
              const name = d.toLocaleString("default", { month: "long" });
              list.push({ month: m, year: y, label: `${name} ${y}`, value: `${m}-${y}` });
            }

            return (
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Target Period (A)</label>
                    <select
                      value={`${selectedAMonth}-${selectedAYear}`}
                      onChange={(e) => {
                        const [m, y] = e.target.value.split("-").map(Number);
                        setSelectedAMonth(m);
                        setSelectedAYear(y);
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-primary transition-all cursor-pointer"
                    >
                      {list.map(item => (
                        <option key={`a-${item.value}`} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </div>

                  <span className="text-slate-600 text-xs font-bold mt-5">vs</span>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Comparison Period (B)</label>
                    <select
                      value={`${selectedBMonth}-${selectedBYear}`}
                      onChange={(e) => {
                        const [m, y] = e.target.value.split("-").map(Number);
                        setSelectedBMonth(m);
                        setSelectedBYear(y);
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-primary transition-all cursor-pointer"
                    >
                      {list.map(item => (
                        <option key={`b-${item.value}`} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => fetchPerformance(selectedAMonth, selectedAYear, selectedBMonth, selectedBYear)}
                  className="w-full sm:w-auto bg-primary hover:bg-secondary text-slate-950 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                >
                  Compare Months
                </button>
              </div>
            );
          })()}

          {/* LOADING STATE */}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400 animate-pulse">Querying Google Business Profile API...</p>
            </div>
          )}

          {/* ERROR / UNAUTHORIZED STATE */}
          {!loading && error && (
            <div className="w-full max-w-2xl mx-auto border border-slate-800 bg-slate-900/40 rounded-3xl p-8 text-center space-y-6">
              <AlertCircle className="h-16 w-16 text-rose-500 mx-auto stroke-1 animate-bounce" />
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-100">GMB Integration Connection Required</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  We could not retrieve GMB stats. This could be because your Google account has not been authorized yet, or the Location ID is incorrect.
                </p>
                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl max-w-md mx-auto text-[10px] text-rose-400 font-mono text-left leading-normal">
                  Error: {error}
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => fetchPerformance()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                >
                  Retry Request
                </button>
                <Link 
                  href="/?tab=settings" 
                  className="bg-primary hover:bg-secondary text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5"
                >
                  Go to Settings <Settings className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* DASHBOARD LIVE CONTENT */}
          {!loading && !error && data && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* 1. KPI Stats Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Total Views */}
                {(() => {
                  const growth = data.growth.totalViews;
                  const isNeg = growth.startsWith("-");
                  return (
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
                      <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full filter blur-xl group-hover:bg-primary/10 transition-all pointer-events-none" />
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Search & Maps Views</span>
                        <Eye className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-100">{data.summary.totalViews.toLocaleString()}</h3>
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                          {isNeg ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />} {growth} MoM
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Card 2: Website Clicks */}
                {(() => {
                  const growth = data.growth.websiteClicks;
                  const isNeg = growth.startsWith("-");
                  return (
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
                      <div className="absolute top-0 right-0 h-24 w-24 bg-sky-500/5 rounded-full filter blur-xl group-hover:bg-sky-500/10 transition-all pointer-events-none" />
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Website Clicks</span>
                        <Globe className="h-4 w-4 text-sky-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-100">
                          {data.summary.websiteClicks.toLocaleString()}
                        </h3>
                        {data.summary.websiteClicks === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                            <Info className="h-3 w-3" /> Zero clicks recorded
                          </span>
                        ) : (
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${isNeg ? "text-rose-450" : "text-emerald-400"}`}>
                            {isNeg ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />} {growth} MoM
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Card 3: Call button clicks */}
                {(() => {
                  const growth = data.growth.callClicks;
                  const isNeg = growth.startsWith("-");
                  return (
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
                      <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full filter blur-xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Call Buttons Clicks</span>
                        <Phone className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-100">{data.summary.callClicks.toLocaleString()}</h3>
                        {data.summary.callClicks === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                            <Info className="h-3 w-3" /> No phone calls made
                          </span>
                        ) : (
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${isNeg ? "text-rose-450" : "text-emerald-400"}`}>
                            {isNeg ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />} {growth} MoM
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Card 4: Direction Requests */}
                {(() => {
                  const growth = data.growth.directionsRequests;
                  const isNeg = growth.startsWith("-");
                  return (
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
                      <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-full filter blur-xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Direction Requests</span>
                        <MapPin className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-100">{data.summary.directionsRequests.toLocaleString()}</h3>
                        {data.summary.directionsRequests === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                            <Info className="h-3 w-3" /> No requests captured
                          </span>
                        ) : (
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${isNeg ? "text-rose-450" : "text-emerald-400"}`}>
                            {isNeg ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />} {growth} MoM
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Zero Stats Helpful Banner */}
              {(data.summary.websiteClicks === 0 || data.summary.callClicks === 0 || data.summary.directionsRequests === 0) && (
                <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-slate-200">Helpful GMB Note</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Some performance metrics like **Website Clicks** or **Call Clicks** might remain zero if your Google Business listing does not have a website URL or phone number published, or if no customer has selected those buttons on Google Maps during this 30-day window.
                    </p>
                  </div>
                </div>
              )}

              {/* 2. Main Performance Time Series Chart */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-6">
                
                {/* Tab Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-4 gap-4">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-200">GMB Traffic Trends</h3>
                    <p className="text-[10px] text-slate-500">Daily performance metrics queried from Google</p>
                  </div>

                  <div className="flex gap-2 bg-slate-950/60 p-1.5 border border-slate-850 rounded-xl">
                    <button
                      onClick={() => setActiveMetricTab("actions")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeMetricTab === "actions" 
                          ? "bg-primary text-slate-950 shadow-md" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Customer Actions
                    </button>
                    <button
                      onClick={() => setActiveMetricTab("views")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeMetricTab === "views" 
                          ? "bg-primary text-slate-950 shadow-md" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Daily Views
                    </button>
                  </div>
                </div>

                {/* Rendering actual Svg chart based on tabs */}
                <div className="h-64 flex items-center justify-center relative">
                  {activeMetricTab === "actions" ? (
                    renderSvgAreaChart(
                      data.timeline,
                      ["WEBSITE_CLICKS", "CALL_CLICKS", "BUSINESS_DIRECTION_REQUESTS"],
                      ["#38bdf8", "#34d399", "#fbbf24"] // Sky, Emerald, Amber colors
                    )
                  ) : (
                    renderSvgAreaChart(
                      data.timeline,
                      ["totalViews"],
                      ["#14b8a6"] // Teal colors
                    )
                  )}
                </div>

                {/* Chart Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-2 border-t border-slate-850">
                  {activeMetricTab === "actions" ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Website Clicks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Call Buttons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Direction Requests</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Impressions (Search + Maps)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Comparison Table */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-200">Month-over-Month Performance Comparison</h3>
                  <p className="text-[10px] text-slate-500">Detailed metrics comparison between the selected months</p>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Metric</th>
                        <th className="py-3 px-4 text-right">{data.range.label}</th>
                        <th className="py-3 px-4 text-right">{data.range.previousLabel}</th>
                        <th className="py-3 px-4 text-right">Growth / Change %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      
                      {/* Row 1: Search & Maps Views */}
                      {(() => {
                        const growth = data.growth.totalViews;
                        const isNeg = growth.startsWith("-");
                        return (
                          <tr className="hover:bg-slate-800/20 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-slate-250">Search & Maps Views (Impressions)</td>
                            <td className="py-3.5 px-4 text-right font-semibold text-slate-100">{data.summary.totalViews.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right text-slate-400">{(data.previousSummary?.totalViews ?? 0).toLocaleString()}</td>
                            <td className={`py-3.5 px-4 text-right font-bold inline-flex items-center justify-end gap-1 w-full ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                              {isNeg ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                              <span>{growth}</span>
                            </td>
                          </tr>
                        );
                      })()}

                      {/* Row 2: Website Clicks */}
                      {(() => {
                        const growth = data.growth.websiteClicks;
                        const isNeg = growth.startsWith("-");
                        return (
                          <tr className="hover:bg-slate-800/20 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-slate-250">Website Clicks</td>
                            <td className="py-3.5 px-4 text-right font-semibold text-slate-100">{data.summary.websiteClicks.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right text-slate-400">{(data.previousSummary?.websiteClicks ?? 0).toLocaleString()}</td>
                            <td className={`py-3.5 px-4 text-right font-bold inline-flex items-center justify-end gap-1 w-full ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                              {isNeg ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                              <span>{growth}</span>
                            </td>
                          </tr>
                        );
                      })()}

                      {/* Row 3: Call button clicks */}
                      {(() => {
                        const growth = data.growth.callClicks;
                        const isNeg = growth.startsWith("-");
                        return (
                          <tr className="hover:bg-slate-800/20 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-slate-250">Call Button Clicks</td>
                            <td className="py-3.5 px-4 text-right font-semibold text-slate-100">{data.summary.callClicks.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right text-slate-400">{(data.previousSummary?.callClicks ?? 0).toLocaleString()}</td>
                            <td className={`py-3.5 px-4 text-right font-bold inline-flex items-center justify-end gap-1 w-full ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                              {isNeg ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                              <span>{growth}</span>
                            </td>
                          </tr>
                        );
                      })()}

                      {/* Row 4: Direction Requests */}
                      {(() => {
                        const growth = data.growth.directionsRequests;
                        const isNeg = growth.startsWith("-");
                        return (
                          <tr className="hover:bg-slate-800/20 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-slate-250">Direction Requests</td>
                            <td className="py-3.5 px-4 text-right font-semibold text-slate-100">{data.summary.directionsRequests.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right text-slate-400">{(data.previousSummary?.directionsRequests ?? 0).toLocaleString()}</td>
                            <td className={`py-3.5 px-4 text-right font-bold inline-flex items-center justify-end gap-1 w-full ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                              {isNeg ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                              <span>{growth}</span>
                            </td>
                          </tr>
                        );
                      })()}

                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Detailed Variations (Devices & Search Platforms) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Box 1: Platform breakdown (Search vs Maps) */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-200">Google Views Breakdown</h4>
                    <p className="text-[10px] text-slate-500">Impressions split between search platforms</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Row 1: Search */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Search className="h-3.5 w-3.5 text-primary" /> Google Search
                      </div>
                      
                      {/* Period A */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{data.range.label}</span>
                          <span className="font-bold text-slate-200">
                            {data.summary.searchViews.toLocaleString()} ({data.summary.totalViews > 0 ? Math.round((data.summary.searchViews / data.summary.totalViews) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${data.summary.totalViews > 0 ? (data.summary.searchViews / data.summary.totalViews) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Period B */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-550">
                          <span>{data.range.previousLabel}</span>
                          <span className="font-bold text-slate-350">
                            {(data.previousSummary?.searchViews ?? 0).toLocaleString()} ({(data.previousSummary?.totalViews ?? 0) > 0 ? Math.round(((data.previousSummary?.searchViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary/40 rounded-full transition-all duration-300"
                            style={{ width: `${(data.previousSummary?.totalViews ?? 0) > 0 ? ((data.previousSummary?.searchViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Maps */}
                    <div className="space-y-2 pt-2 border-t border-slate-850/50">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Map className="h-3.5 w-3.5 text-secondary" /> Google Maps
                      </div>
                      
                      {/* Period A */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{data.range.label}</span>
                          <span className="font-bold text-slate-200">
                            {data.summary.mapsViews.toLocaleString()} ({data.summary.totalViews > 0 ? Math.round((data.summary.mapsViews / data.summary.totalViews) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary rounded-full transition-all duration-300"
                            style={{ width: `${data.summary.totalViews > 0 ? (data.summary.mapsViews / data.summary.totalViews) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Period B */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-550">
                          <span>{data.range.previousLabel}</span>
                          <span className="font-bold text-slate-350">
                            {(data.previousSummary?.mapsViews ?? 0).toLocaleString()} ({(data.previousSummary?.totalViews ?? 0) > 0 ? Math.round(((data.previousSummary?.mapsViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary/40 rounded-full transition-all duration-300"
                            style={{ width: `${(data.previousSummary?.totalViews ?? 0) > 0 ? ((data.previousSummary?.mapsViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box 2: Device Breakdown (Mobile vs Desktop) */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-200">Device Breakdown</h4>
                    <p className="text-[10px] text-slate-500">Impressions split between device platforms</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Row 1: Mobile */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Smartphone className="h-3.5 w-3.5 text-sky-400" /> Mobile Devices
                      </div>
                      
                      {/* Period A */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{data.range.label}</span>
                          <span className="font-bold text-slate-200">
                            {data.summary.mobileViews.toLocaleString()} ({data.summary.totalViews > 0 ? Math.round((data.summary.mobileViews / data.summary.totalViews) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-sky-400 rounded-full transition-all duration-300"
                            style={{ width: `${data.summary.totalViews > 0 ? (data.summary.mobileViews / data.summary.totalViews) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Period B */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-555">
                          <span>{data.range.previousLabel}</span>
                          <span className="font-bold text-slate-350">
                            {(data.previousSummary?.mobileViews ?? 0).toLocaleString()} ({(data.previousSummary?.totalViews ?? 0) > 0 ? Math.round(((data.previousSummary?.mobileViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-sky-400/40 rounded-full transition-all duration-300"
                            style={{ width: `${(data.previousSummary?.totalViews ?? 0) > 0 ? ((data.previousSummary?.mobileViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Desktop */}
                    <div className="space-y-2 pt-2 border-t border-slate-850/50">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Monitor className="h-3.5 w-3.5 text-amber-400" /> Desktop Devices
                      </div>
                      
                      {/* Period A */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{data.range.label}</span>
                          <span className="font-bold text-slate-200">
                            {data.summary.desktopViews.toLocaleString()} ({data.summary.totalViews > 0 ? Math.round((data.summary.desktopViews / data.summary.totalViews) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all duration-300"
                            style={{ width: `${data.summary.totalViews > 0 ? (data.summary.desktopViews / data.summary.totalViews) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Period B */}
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-[10px] text-slate-555">
                          <span>{data.range.previousLabel}</span>
                          <span className="font-bold text-slate-350">
                            {(data.previousSummary?.desktopViews ?? 0).toLocaleString()} ({(data.previousSummary?.totalViews ?? 0) > 0 ? Math.round(((data.previousSummary?.desktopViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400/40 rounded-full transition-all duration-300"
                            style={{ width: `${(data.previousSummary?.totalViews ?? 0) > 0 ? ((data.previousSummary?.desktopViews ?? 0) / (data.previousSummary?.totalViews ?? 1)) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

          {/* =========================================================
              SUB-TAB 1.5: PROFILE DETAILS (EDIT PROFILE PANEL)
              ========================================================= */}
          {activeSubTab === "profile" && (
            <div className="bg-slate-950/20 border border-slate-850/80 rounded-3xl p-6 lg:p-10 shadow-2xl max-w-4xl mx-auto space-y-10 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-850 pb-6">
                <div className="flex items-center gap-4.5">
                  <div className="h-12 w-12 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-2xl">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-100 text-lg tracking-tight">Business Profile Settings</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Manage storefront categories, primary contact numbers, location coverage, regular & special hours, and listing attributes</p>
                  </div>
                </div>
              </div>

              {loadingProfile ? (
                <div className="flex justify-center items-center py-24">
                  <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-10">
                  
                  {/* SECTION 1: ABOUT YOUR BUSINESS */}
                  <div className="bg-slate-900/30 border border-slate-855 rounded-3xl p-8 space-y-6 shadow-md hover:border-slate-800 transition-all duration-300">
                    <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-3 border-b border-slate-850 pb-4 mb-4">
                      <Info className="h-5 w-5 text-primary" /> 1. About Your Business
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Name</label>
                        <input
                          type="text"
                          value={profileTitle}
                          onChange={(e) => setProfileTitle(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4.5 py-3 text-sm text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Category</label>
                        <input
                          type="text"
                          value={profileCategory}
                          disabled
                          className="bg-slate-900/50 border border-slate-850 rounded-xl px-4.5 py-3 text-sm text-slate-450 outline-none select-none font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Additional Categories (Comma-separated)</label>
                      <input
                        type="text"
                        value={profileAddCategoriesText}
                        onChange={(e) => setProfileAddCategoriesText(e.target.value)}
                        placeholder="e.g. Website designer, Social media marketing, SEO agency"
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4.5 py-3 text-sm text-slate-200 outline-none focus:border-primary transition-all duration-200 font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Description</label>
                        <button
                          type="button"
                          onClick={handleGenerateDescription}
                          disabled={isGeneratingDesc}
                          className="bg-primary text-slate-950 hover:bg-secondary transition-all font-black text-[10px] uppercase tracking-widest px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
                        >
                          <Sparkles className={`h-3.5 w-3.5 ${isGeneratingDesc ? "animate-spin" : ""}`} />
                          {isGeneratingDesc ? "AI Writing..." : "AI Write Description"}
                        </button>
                      </div>
                      <textarea
                        value={profileDesc}
                        onChange={(e) => setProfileDesc(e.target.value)}
                        rows={6}
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        className="bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed font-sans transition-all duration-200 resize-y"
                        placeholder="Provide details about your business..."
                        required
                      />
                    </div>

                    {/* Opening Date Fields */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Opening Date</label>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <input
                            type="text"
                            placeholder="Year (e.g. 2025)"
                            value={profileOpeningDate.year}
                            onChange={(e) => setProfileOpeningDate({ ...profileOpeningDate, year: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-primary font-mono text-center font-bold"
                          />
                        </div>
                        <div>
                          <select
                            value={profileOpeningDate.month}
                            onChange={(e) => setProfileOpeningDate({ ...profileOpeningDate, month: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-primary cursor-pointer font-semibold"
                          >
                            <option value="">Month</option>
                            {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((m) => (
                              <option key={m} value={m}>
                                {new Date(2020, Number(m) - 1).toLocaleString("default", { month: "long" })}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Day (Optional)"
                            value={profileOpeningDate.day}
                            onChange={(e) => setProfileOpeningDate({ ...profileOpeningDate, day: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-primary font-mono text-center font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: CONTACT INFORMATION */}
                  <div className="bg-slate-900/30 border border-slate-855 rounded-3xl p-8 space-y-6 shadow-md hover:border-slate-800 transition-all duration-300">
                    <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-3 border-b border-slate-850 pb-4 mb-4">
                      <Phone className="h-5 w-5 text-primary" /> 2. Contact Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Phone Number</label>
                        <input
                          type="text"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4.5 py-3 text-sm text-slate-200 outline-none focus:border-primary font-bold"
                          placeholder="e.g. +91 77099 36965"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Additional Phone 1</label>
                        <input
                          type="text"
                          value={profileAddPhone1}
                          onChange={(e) => setProfileAddPhone1(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4.5 py-3 text-sm text-slate-200 outline-none focus:border-primary font-semibold"
                          placeholder="Mobile or landline"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Additional Phone 2</label>
                        <input
                          type="text"
                          value={profileAddPhone2}
                          onChange={(e) => setProfileAddPhone2(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4.5 py-3 text-sm text-slate-200 outline-none focus:border-primary font-semibold"
                          placeholder="Mobile or landline"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Website URL</label>
                      <input
                        type="url"
                        value={profileWebsite}
                        onChange={(e) => setProfileWebsite(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4.5 py-3 text-sm text-slate-200 outline-none focus:border-primary font-mono text-[13px] font-bold"
                        placeholder="https://www.example.com"
                      />
                    </div>
                  </div>

                  {/* SECTION 3: LOCATION AND AREAS */}
                  <div className="bg-slate-900/30 border border-slate-855 rounded-3xl p-8 space-y-8 shadow-md hover:border-slate-800 transition-all duration-300">
                    <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-3 border-b border-slate-850 pb-4 mb-4">
                      <MapPin className="h-5 w-5 text-primary" /> 3. Location and Areas
                    </h3>

                    {/* Storefront address */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider border-l-2 border-primary pl-2">Storefront Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-3 flex flex-col gap-2">
                          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Street Address Line 1</label>
                          <input
                            type="text"
                            value={profileAddress?.addressLines?.[0] || ""}
                            onChange={(e) => {
                              const lines = [...(profileAddress?.addressLines || ["", ""])];
                              lines[0] = e.target.value;
                              setProfileAddress({ ...profileAddress, addressLines: lines });
                            }}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-primary font-semibold"
                            placeholder="Street, suite, building"
                          />
                        </div>
                        <div className="md:col-span-3 flex flex-col gap-2">
                          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Street Address Line 2 (Optional)</label>
                          <input
                            type="text"
                            value={profileAddress?.addressLines?.[1] || ""}
                            onChange={(e) => {
                              const lines = [...(profileAddress?.addressLines || ["", ""])];
                              lines[1] = e.target.value;
                              setProfileAddress({ ...profileAddress, addressLines: lines });
                            }}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-primary font-semibold"
                            placeholder="Floor, landmark, sublocality"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">City / Locality</label>
                          <input
                            type="text"
                            value={profileAddress?.locality || ""}
                            onChange={(e) => setProfileAddress({ ...profileAddress, locality: e.target.value })}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-primary font-bold"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">State / Administrative Area</label>
                          <input
                            type="text"
                            value={profileAddress?.administrativeArea || ""}
                            onChange={(e) => setProfileAddress({ ...profileAddress, administrativeArea: e.target.value })}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-primary font-bold"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Postal / Zip Code</label>
                          <input
                            type="text"
                            value={profileAddress?.postalCode || ""}
                            onChange={(e) => setProfileAddress({ ...profileAddress, postalCode: e.target.value })}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-primary font-mono text-center font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Service Area Place Tags */}
                    <div className="space-y-4 pt-6 border-t border-slate-850/50">
                      <label className="text-xs font-bold text-slate-350 uppercase tracking-wider border-l-2 border-primary pl-2">Service Areas (Places you serve)</label>
                      
                      <div className="flex flex-wrap gap-2.5 py-3">
                        {profileServiceAreas.length === 0 ? (
                          <span className="text-sm text-slate-500 italic">No specific service areas added (Storefront operations only)</span>
                        ) : (
                          profileServiceAreas.map((item, idx) => (
                            <div key={idx} className="bg-slate-900 border border-slate-800 hover:border-slate-750 px-4 py-2 rounded-xl text-xs text-slate-200 font-semibold flex items-center gap-2 transition-all">
                              <span>{item.placeName}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = profileServiceAreas.filter((_, i) => i !== idx);
                                  setProfileServiceAreas(filtered);
                                }}
                                className="text-slate-400 hover:text-rose-400 font-black cursor-pointer text-base leading-none"
                              >
                                &times;
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-3 relative">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Search regions, cities, or districts served..."
                            value={newServiceAreaName}
                            onChange={(e) => handlePlacesSearch(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-primary font-semibold animate-fadeIn"
                          />
                          {searchingPlaces && (
                            <div className="absolute right-3.5 top-3.5">
                              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                          
                          {/* Autocomplete Predictions Dropdown */}
                          {placesSuggestions.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-850 max-h-60 overflow-y-auto scrollbar-none">
                              {placesSuggestions.map((sug) => (
                                <button
                                  key={sug.placeId}
                                  type="button"
                                  onClick={() => {
                                    // Add suggestion to the listing's service areas
                                    if (!profileServiceAreas.some(a => a.placeId === sug.placeId)) {
                                      setProfileServiceAreas([...profileServiceAreas, {
                                        placeId: sug.placeId,
                                        placeName: sug.placeName
                                      }]);
                                    }
                                    setNewServiceAreaName("");
                                    setPlacesSuggestions([]);
                                  }}
                                  className="w-full text-left px-5 py-3.5 text-xs font-semibold text-slate-350 hover:text-slate-100 hover:bg-slate-950 transition-all flex items-center gap-2.5 cursor-pointer"
                                >
                                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
                                  <span className="truncate">{sug.placeName}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (!newServiceAreaName.trim()) return;
                            // Fallback add as manual entry if not selected from suggestions
                            setProfileServiceAreas([...profileServiceAreas, {
                              placeId: `manual-${Date.now()}`,
                              placeName: newServiceAreaName
                            }]);
                            setNewServiceAreaName("");
                            setPlacesSuggestions([]);
                          }}
                          className="bg-primary text-slate-950 px-6 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-secondary transition-all cursor-pointer shadow-lg shrink-0"
                        >
                          Add Area
                        </button>
                      </div>
                    </div>

                    {/* Labels List */}
                    <div className="space-y-2 pt-6 border-t border-slate-850/50">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Internal Labels (Comma-separated, for sorting)</label>
                      <input
                        type="text"
                        value={profileLabelsText}
                        onChange={(e) => setProfileLabelsText(e.target.value)}
                        placeholder="e.g. Pune-Office, Agency-HQ, Solitaire-Hub"
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4.5 py-3 text-sm text-slate-200 outline-none focus:border-primary font-semibold"
                      />
                    </div>
                  </div>

                  {/* SECTION 4: HOURS & SCHEDULE */}
                  <div className="bg-slate-900/30 border border-slate-855 rounded-3xl p-8 space-y-8 shadow-md hover:border-slate-800 transition-all duration-300">
                    <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-3 border-b border-slate-850 pb-4 mb-4">
                      <Clock className="h-5 w-5 text-primary" /> 4. Opening Hours
                    </h3>

                    {/* Regular Hours Grid */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider border-l-2 border-primary pl-2">Regular Main Hours</h4>
                      <div className="space-y-4 pt-2">
                        {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => {
                          const period = (profileHours?.periods || []).find((p: any) => p.openDay === day);
                          const isOpen = !!period;

                          return (
                            <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-slate-850/50 last:border-b-0">
                              <span className="text-sm font-bold text-slate-200 w-28 uppercase tracking-wider">
                                {day.toLowerCase()}
                              </span>

                              <div className="flex items-center gap-6">
                                <label className="relative inline-flex items-center cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={isOpen}
                                    onChange={(e) => handleHoursDayToggle(day, e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-slate-950" />
                                  <span className="ml-3 text-xs font-extrabold uppercase tracking-widest w-16 text-center text-slate-400">
                                    {isOpen ? "Open" : "Closed"}
                                  </span>
                                </label>

                                {isOpen && (
                                  <div className="flex items-center gap-3 animate-fadeIn">
                                    <input
                                      type="time"
                                      value={period.openTime || "09:30"}
                                      onChange={(e) => handleHoursTimeChange(day, "openTime", e.target.value)}
                                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono font-bold outline-none focus:border-primary"
                                    />
                                    <span className="text-xs text-slate-500 font-bold uppercase">To</span>
                                    <input
                                      type="time"
                                      value={period.closeTime || "18:30"}
                                      onChange={(e) => handleHoursTimeChange(day, "closeTime", e.target.value)}
                                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono font-bold outline-none focus:border-primary"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Special hours / Holidays */}
                    <div className="space-y-4 pt-6 border-t border-slate-850/50">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider border-l-2 border-primary pl-2">Special Hours (Holiday exceptions)</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileSpecialHours([
                              ...profileSpecialHours,
                              {
                                startDate: new Date().toISOString().split("T")[0],
                                endDate: new Date().toISOString().split("T")[0],
                                openTime: "09:30",
                                closeTime: "18:30",
                                closed: false
                              }
                            ]);
                          }}
                          className="bg-primary text-slate-950 text-[10px] uppercase font-black tracking-widest px-4 py-2.5 rounded-xl hover:bg-secondary transition-all cursor-pointer shadow-md"
                        >
                          + Add Holiday Exception
                        </button>
                      </div>

                      {profileSpecialHours.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2">No special holiday hours configured.</p>
                      ) : (
                        <div className="space-y-4">
                          {profileSpecialHours.map((sh, idx) => (
                            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 animate-fadeIn hover:border-slate-750 transition-all">
                              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Start Date</span>
                                  <input
                                    type="date"
                                    value={sh.startDate}
                                    onChange={(e) => {
                                      const updated = [...profileSpecialHours];
                                      updated[idx].startDate = e.target.value;
                                      setProfileSpecialHours(updated);
                                    }}
                                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-primary font-bold"
                                  />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">End Date</span>
                                  <input
                                    type="date"
                                    value={sh.endDate || sh.startDate}
                                    onChange={(e) => {
                                      const updated = [...profileSpecialHours];
                                      updated[idx].endDate = e.target.value;
                                      setProfileSpecialHours(updated);
                                    }}
                                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-primary font-bold"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-end flex-wrap gap-5">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={sh.closed}
                                    onChange={(e) => {
                                      const updated = [...profileSpecialHours];
                                      updated[idx].closed = e.target.checked;
                                      setProfileSpecialHours(updated);
                                    }}
                                    className="accent-primary h-4.5 w-4.5 rounded"
                                  />
                                  <span className="text-xs font-extrabold uppercase text-slate-350 tracking-wider">Closed All-Day</span>
                                </label>

                                {!sh.closed && (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="time"
                                      value={sh.openTime || "09:30"}
                                      onChange={(e) => {
                                        const updated = [...profileSpecialHours];
                                        updated[idx].openTime = e.target.value;
                                        setProfileSpecialHours(updated);
                                      }}
                                      className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-mono font-bold outline-none"
                                    />
                                    <span className="text-xs text-slate-500 font-bold uppercase">To</span>
                                    <input
                                      type="time"
                                      value={sh.closeTime || "18:30"}
                                      onChange={(e) => {
                                        const updated = [...profileSpecialHours];
                                        updated[idx].closeTime = e.target.value;
                                        setProfileSpecialHours(updated);
                                      }}
                                      className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-mono font-bold outline-none"
                                    />
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    const filtered = profileSpecialHours.filter((_, i) => i !== idx);
                                    setProfileSpecialHours(filtered);
                                  }}
                                  className="text-rose-450 hover:text-rose-400 text-xs font-black uppercase tracking-widest px-3 py-1 cursor-pointer transition-all border border-rose-950 rounded-lg hover:bg-rose-950/20"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECTION 5: MORE (ATTRIBUTES) */}
                  <div className="bg-slate-900/30 border border-slate-855 rounded-3xl p-8 space-y-8 shadow-md hover:border-slate-800 transition-all duration-300">
                    <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-3 border-b border-slate-850 pb-4 mb-4">
                      <Settings className="h-5 w-5 text-primary" /> 5. More (Listing Attributes)
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      
                      {/* Box 1: Accessibility */}
                      <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-850">
                        <h4 className="text-xs font-extrabold text-slate-350 uppercase tracking-wider border-l-2 border-primary pl-2">Accessibility</h4>
                        <div className="space-y-3">
                          {[
                            { key: "wheelchair_accessible_toilet", label: "Wheelchair-accessible toilet" },
                            { key: "wheelchair_accessible_car_park", label: "Wheelchair-accessible car park" },
                            { key: "wheelchair_accessible_entrance", label: "Wheelchair-accessible entrance" },
                            { key: "wheelchair_accessible_seating", label: "Wheelchair-accessible seating" }
                          ].map((item) => (
                            <label key={item.key} className="flex items-center gap-3.5 bg-slate-900/30 border border-slate-850 hover:bg-slate-900/60 hover:border-slate-800 rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none">
                              <input
                                type="checkbox"
                                checked={profileAttributes.accessibility[item.key] || false}
                                onChange={(e) => {
                                  const updatedAttr = { ...profileAttributes };
                                  updatedAttr.accessibility[item.key] = e.target.checked;
                                  setProfileAttributes(updatedAttr);
                                }}
                                className="accent-primary h-5 w-5 rounded border-slate-800 cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-slate-200">{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Box 2: Amenities & Crowd */}
                      <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-850">
                        <h4 className="text-xs font-extrabold text-slate-350 uppercase tracking-wider border-l-2 border-primary pl-2">Amenities & Crowd</h4>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3.5 bg-slate-900/30 border border-slate-850 hover:bg-slate-900/60 hover:border-slate-800 rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none">
                            <input
                              type="checkbox"
                              checked={profileAttributes.amenities.gender_neutral_toilets || false}
                              onChange={(e) => {
                                const updatedAttr = { ...profileAttributes };
                                updatedAttr.amenities.gender_neutral_toilets = e.target.checked;
                                setProfileAttributes(updatedAttr);
                              }}
                              className="accent-primary h-5 w-5 rounded cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-slate-200">Gender-neutral toilets</span>
                          </label>
                          <label className="flex items-center gap-3.5 bg-slate-900/30 border border-slate-850 hover:bg-slate-900/60 hover:border-slate-800 rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none">
                            <input
                              type="checkbox"
                              checked={profileAttributes.crowd.lgqbtq_friendly || false}
                              onChange={(e) => {
                                const updatedAttr = { ...profileAttributes };
                                updatedAttr.crowd.lgqbtq_friendly = e.target.checked;
                                setProfileAttributes(updatedAttr);
                              }}
                              className="accent-primary h-5 w-5 rounded cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-slate-200">LGBTQ+ friendly</span>
                          </label>
                        </div>
                      </div>

                      {/* Box 3: Parking */}
                      <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-850">
                        <h4 className="text-xs font-extrabold text-slate-350 uppercase tracking-wider border-l-2 border-primary pl-2">Parking Options</h4>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3.5 bg-slate-900/30 border border-slate-850 hover:bg-slate-900/60 hover:border-slate-800 rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none">
                            <input
                              type="checkbox"
                              checked={profileAttributes.parking.free_multistorey_car_park || false}
                              onChange={(e) => {
                                const updatedAttr = { ...profileAttributes };
                                updatedAttr.parking.free_multistorey_car_park = e.target.checked;
                                setProfileAttributes(updatedAttr);
                              }}
                              className="accent-primary h-5 w-5 rounded cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-slate-200">Free multi-storey car park</span>
                          </label>
                          <label className="flex items-center gap-3.5 bg-slate-900/30 border border-slate-850 hover:bg-slate-900/60 hover:border-slate-800 rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none">
                            <input
                              type="checkbox"
                              checked={profileAttributes.parking.free_parking_lot || false}
                              onChange={(e) => {
                                const updatedAttr = { ...profileAttributes };
                                updatedAttr.parking.free_parking_lot = e.target.checked;
                                setProfileAttributes(updatedAttr);
                              }}
                              className="accent-primary h-5 w-5 rounded cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-slate-200">Free parking lot</span>
                          </label>
                        </div>
                      </div>

                      {/* Box 4: Planning & Service Options */}
                      <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-850">
                        <h4 className="text-xs font-extrabold text-slate-350 uppercase tracking-wider border-l-2 border-primary pl-2">Planning & Booking</h4>
                        <label className="flex items-center gap-3.5 bg-slate-900/30 border border-slate-850 hover:bg-slate-900/60 hover:border-slate-800 rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none">
                          <input
                            type="checkbox"
                            checked={profileAttributes.planning.appointment_required || false}
                            onChange={(e) => {
                              const updatedAttr = { ...profileAttributes };
                              updatedAttr.planning.appointment_required = e.target.checked;
                              setProfileAttributes(updatedAttr);
                            }}
                            className="accent-primary h-5 w-5 rounded cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-slate-200">Appointment required</span>
                        </label>
                      </div>

                      <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-850 md:col-span-2">
                        <h4 className="text-xs font-extrabold text-slate-350 uppercase tracking-wider border-l-2 border-primary pl-2">Service Options</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="flex items-center gap-3.5 bg-slate-900/30 border border-slate-850 hover:bg-slate-900/60 hover:border-slate-800 rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none">
                            <input
                              type="checkbox"
                              checked={profileAttributes.serviceOptions.offers_online_appointments || false}
                              onChange={(e) => {
                                const updatedAttr = { ...profileAttributes };
                                updatedAttr.serviceOptions.offers_online_appointments = e.target.checked;
                                setProfileAttributes(updatedAttr);
                              }}
                              className="accent-primary h-5 w-5 rounded cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-slate-200">Offers online appointments</span>
                          </label>
                          <label className="flex items-center gap-3.5 bg-slate-900/30 border border-slate-850 hover:bg-slate-900/60 hover:border-slate-800 rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none">
                            <input
                              type="checkbox"
                              checked={profileAttributes.serviceOptions.onsite_services_available || false}
                              onChange={(e) => {
                                const updatedAttr = { ...profileAttributes };
                                updatedAttr.serviceOptions.onsite_services_available = e.target.checked;
                                setProfileAttributes(updatedAttr);
                              }}
                              className="accent-primary h-5 w-5 rounded cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-slate-200">On-site services available</span>
                          </label>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Submission Row */}
                  <div className="flex justify-end pt-6">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-primary hover:bg-secondary text-slate-950 font-black text-sm px-10 py-4.5 rounded-2xl transition-all shadow-2xl flex items-center gap-2 cursor-pointer disabled:opacity-50 tracking-wider uppercase"
                    >
                      {savingProfile ? "Saving Profile Changes..." : "Save Business Profile Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* =========================================================
              SUB-TAB 2: UPDATES & POSTS (AI POST CREATOR)
              ========================================================= */}
          {activeSubTab === "posts" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
              {/* Creator Form Column */}
              <div className="lg:col-span-1 space-y-6">
                <form onSubmit={handleCreatePost} className="bg-slate-950/30 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="h-4.5 w-4.5 text-primary" /> Create Google Post
                    </h3>
                    <button
                      type="button"
                      onClick={handleGeneratePostCopy}
                      disabled={isGeneratingPost}
                      className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-slate-950 transition-all font-bold text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`h-3 w-3 ${isGeneratingPost ? "animate-spin" : ""}`} />
                      {isGeneratingPost ? "Drafting..." : "AI Write"}
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Post Title (Optional)</label>
                    <input
                      type="text"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="monsoon special deal"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Post Summary / Body</label>
                    <textarea
                      value={postSummary}
                      onChange={(e) => setPostSummary(e.target.value)}
                      placeholder="Write post content here..."
                      rows={4}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CTA Button Action</label>
                    <select
                      value={postCTA}
                      onChange={(e) => setPostCTA(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="NONE">No Button</option>
                      <option value="BOOK">Book Appointment</option>
                      <option value="ORDER">Order Online</option>
                      <option value="SHOP">Shop Products</option>
                      <option value="LEARN_MORE">Learn More</option>
                      <option value="SIGN_UP">Sign Up</option>
                      <option value="CALL">Call Now</option>
                    </select>
                  </div>

                  {postCTA !== "NONE" && postCTA !== "CALL" && (
                    <div className="flex flex-col gap-1.5 animate-fadeIn">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CTA Action URL</label>
                      <input
                        type="url"
                        value={postCTAUrl}
                        onChange={(e) => setPostCTAUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Media Photo URL (Optional)</label>
                    <input
                      type="url"
                      value={postMediaUrl}
                      onChange={(e) => setPostMediaUrl(e.target.value)}
                      placeholder="Image address"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-[10px]"
                    />
                  </div>

                   <div className="flex items-center gap-2 select-none py-1">
                    <input
                      type="checkbox"
                      id="schedule-toggle"
                      checked={isScheduledOnly}
                      onChange={(e) => {
                        setIsScheduledOnly(e.target.checked);
                        if (!e.target.checked) {
                          setScheduleDate(null);
                        }
                      }}
                      className="accent-primary h-4 w-4 rounded cursor-pointer"
                    />
                    <label htmlFor="schedule-toggle" className="text-xs font-bold text-slate-350 cursor-pointer select-none">
                      Schedule this post
                    </label>
                  </div>

                  {isScheduledOnly && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Publish Date</label>
                          <DatePicker
                            selected={scheduleDate}
                            onChange={(date: Date | null) => setScheduleDate(date)}
                            minDate={new Date()}
                            placeholderText="Select a date"
                            dateFormat="dd MMM yyyy"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer text-center"
                            required={isScheduledOnly}
                            portalId="gmb-datepicker-portal"
                            renderCustomHeader={({
                              date,
                              changeYear,
                              changeMonth,
                              decreaseMonth,
                              increaseMonth,
                              prevMonthButtonDisabled,
                              nextMonthButtonDisabled,
                            }) => {
                              const monthNames = [
                                "January", "February", "March", "April", "May", "June",
                                "July", "August", "September", "October", "November", "December"
                              ];
                              const currentYear = new Date().getFullYear();
                              const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

                              return (
                                <div className="flex items-center justify-between px-2 py-1.5 gap-2 bg-slate-950 border-b border-slate-850">
                                  <button
                                    type="button"
                                    onClick={decreaseMonth}
                                    disabled={prevMonthButtonDisabled}
                                    className="p-1 hover:bg-slate-900 border border-slate-900 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </button>

                                  <div className="flex items-center gap-1.5">
                                    <select
                                      value={date.getMonth()}
                                      onChange={({ target: { value } }) => changeMonth(Number(value))}
                                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-bold outline-none cursor-pointer hover:border-slate-700"
                                    >
                                      {monthNames.map((monthName, idx) => (
                                        <option key={monthName} value={idx}>
                                          {monthName}
                                        </option>
                                      ))}
                                    </select>

                                    <select
                                      value={date.getFullYear()}
                                      onChange={({ target: { value } }) => changeYear(Number(value))}
                                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-bold outline-none cursor-pointer hover:border-slate-700"
                                    >
                                      {years.map((y) => (
                                        <option key={y} value={y}>
                                          {y}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={increaseMonth}
                                    disabled={nextMonthButtonDisabled}
                                    className="p-1 hover:bg-slate-900 border border-slate-900 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                </div>
                              );
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Publish Time</label>
                          <CustomGmbTimePicker
                            selectedTime={scheduleTime}
                            onChange={setScheduleTime}
                          />
                        </div>
                      </div>

                      {/* Live Preview Banner */}
                      {scheduleDate && (
                        <div className="bg-slate-900/40 border border-slate-850/60 p-3.5 rounded-xl flex flex-col gap-1.5 text-xs select-none">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Post will publish on</span>
                          <div className="flex items-center gap-2 text-slate-200 font-extrabold text-sm">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>
                              {format(scheduleDate, "dd MMM yyyy")} • {formattedTimeStr}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Custom Dark Theme Styles for DatePicker */}
                      <style>{`
                        .react-datepicker {
                          background-color: #020617 !important;
                          border: 1px solid #1e293b !important;
                          border-radius: 12px !important;
                          font-family: inherit !important;
                          color: #e2e8f0 !important;
                          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
                        }
                        .react-datepicker__header {
                          background-color: #090d16 !important;
                          border-bottom: 1px solid #1e293b !important;
                          border-top-left-radius: 12px !important;
                          border-top-right-radius: 12px !important;
                          padding-top: 10px !important;
                        }
                        .react-datepicker__current-month,
                        .react-datepicker__day-name,
                        .react-datepicker__day {
                          color: #cbd5e1 !important;
                        }
                        .react-datepicker__day:hover {
                          background-color: #1e293b !important;
                          color: #ffffff !important;
                        }
                        .react-datepicker__day--selected {
                          background-color: var(--color-primary, #38bdf8) !important;
                          color: #020617 !important;
                          font-weight: bold !important;
                        }
                        .react-datepicker__day--disabled {
                          color: #475569 !important;
                          opacity: 0.25;
                        }
                        .react-datepicker__navigation-icon::before {
                          border-color: #94a3b8 !important;
                        }
                        .react-datepicker__header__dropdown {
                          margin-top: 6px;
                          display: flex;
                          justify-content: center;
                          gap: 8px;
                        }
                        .react-datepicker__month-select,
                        .react-datepicker__year-select {
                          background-color: #0f172a !important;
                          color: #cbd5e1 !important;
                          border: 1px solid #334155 !important;
                          border-radius: 6px !important;
                          padding: 2px 4px !important;
                          font-size: 11px !important;
                          outline: none !important;
                          cursor: pointer;
                        }
                        .react-datepicker__time-container {
                          background-color: #020617 !important;
                          border-left: 1px solid #1e293b !important;
                          width: 85px !important;
                        }
                        .react-datepicker__time-container .react-datepicker__time {
                          background-color: #020617 !important;
                          color: #cbd5e1 !important;
                        }
                        .react-datepicker__time-list-item {
                          background-color: #020617 !important;
                          color: #cbd5e1 !important;
                          font-size: 11px !important;
                          padding: 6px 10px !important;
                          cursor: pointer;
                        }
                        .react-datepicker__time-list-item:hover {
                          background-color: #1e293b !important;
                          color: #ffffff !important;
                        }
                        .react-datepicker__time-list-item--selected {
                          background-color: var(--color-primary, #38bdf8) !important;
                          color: #020617 !important;
                          font-weight: bold !important;
                        }
                        .react-datepicker--time-only .react-datepicker__time-container {
                          border-left: none !important;
                          width: 100% !important;
                        }
                        .react-datepicker__time-box {
                          width: 100% !important;
                          border-radius: 12px !important;
                        }
                      `}</style>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingPost || !postSummary || (isScheduledOnly && !scheduleDate)}
                    className="w-full bg-primary hover:bg-secondary disabled:opacity-50 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-md mt-4 cursor-pointer"
                  >
                    {isSubmittingPost ? "Processing..." : isScheduledOnly ? "Schedule Google Post" : "Publish Post on Google Maps"}
                  </button>
                </form>
              </div>

              {/* Posts Feed Grid */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Active Updates Feed</h3>
                    <span className="text-[10px] text-slate-500 leading-normal">Manage scheduled and live posts on Google Maps</span>
                  </div>
                  <button
                    onClick={fetchPosts}
                    className="p-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`h-4.5 w-4.5 ${loadingPosts ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {loadingPosts && posts.length === 0 ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-12 text-center text-slate-400">
                    <Calendar className="h-14 w-14 text-slate-650 mx-auto mb-4 stroke-1" />
                    <p className="text-xs font-semibold">No active updates or local posts found.</p>
                    <p className="text-[10px] text-slate-550 mt-1">Use the writer form on the left to publish your first post.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-slate-950/20 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg">
                        <div className="p-5 space-y-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                post.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400" :
                                post.status === "SCHEDULED" ? "bg-blue-500/10 text-blue-400" :
                                post.status === "PUBLISHING" ? "bg-amber-500/10 text-amber-400 animate-pulse" :
                                post.status === "FAILED" ? "bg-rose-500/10 text-rose-400" :
                                "bg-slate-800 text-slate-400"
                              }`}>
                                {post.status}
                              </span>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="text-rose-400 hover:text-rose-300 p-1.5 bg-slate-900/50 border border-slate-850 hover:border-rose-900/50 rounded-xl transition-all cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            
                            {post.status === "SCHEDULED" && post.scheduledAt && (
                              <div className="text-[10px] text-blue-400 flex items-center gap-1 font-semibold">
                                <Clock className="h-3.5 w-3.5" /> Scheduled for: {new Date(post.scheduledAt).toLocaleString()}
                              </div>
                            )}

                            {post.status === "FAILED" && post.publishError && (
                              <div className="text-[10px] text-rose-400 border border-rose-950/40 bg-rose-950/10 p-2 rounded-xl leading-relaxed select-all">
                                Error: {post.publishError}
                              </div>
                            )}
                          </div>

                          {post.mediaUrl && (
                            <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-855">
                              <img src={post.mediaUrl} alt="Post Cover" className="w-full h-full object-cover" />
                            </div>
                          )}

                          <div className="space-y-1.5">
                            {post.title && <h4 className="font-extrabold text-sm text-slate-200">{post.title}</h4>}
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">{post.summary}</p>
                          </div>
                        </div>

                        {post.callToActionType && post.callToActionType !== "NONE" && (
                          <div className="bg-slate-950/40 p-4 border-t border-slate-855 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">CTA: {post.callToActionType}</span>
                            <a
                              href={post.callToActionUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-primary hover:text-secondary font-bold flex items-center gap-1"
                            >
                              Link Landing Page <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              SUB-TAB 3: Q&A INBOX (CUSTOMER QUESTIONS)
              ========================================================= */}
          {activeSubTab === "qa" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex flex-col">
                  <h2 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Customer Questions Inbox</h2>
                  <span className="text-[10px] text-slate-500 leading-normal">Monitor and auto-reply to questions posted on Google Maps</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncQuestions}
                    disabled={loadingQuestions}
                    className="bg-primary hover:bg-secondary disabled:opacity-50 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingQuestions ? "animate-spin" : ""}`} />
                    Sync Questions
                  </button>
                </div>
              </div>

              {loadingQuestions && questions.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                  <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : questions.length === 0 ? (
                <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-12 text-center text-slate-400 max-w-2xl mx-auto">
                  <HelpCircle className="h-14 w-14 text-slate-650 mx-auto mb-4 stroke-1 animate-pulse" />
                  <p className="text-xs font-semibold">Q&A inbox is currently empty.</p>
                  <p className="text-[10px] text-slate-550 mt-1">Click **Sync Questions** to scan live customer comments from Google Maps.</p>
                </div>
              ) : (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {questions.map((q) => (
                    <div key={q.id} className="bg-slate-950/20 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                            {q.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-200">{q.authorName}</span>
                            <span className="text-[9px] text-slate-500">{new Date(q.createdAt).toLocaleDateString([], { dateStyle: "medium" })}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          q.status === "ANSWERED" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {q.status}
                        </span>
                      </div>

                      <div className="bg-slate-900/40 p-4 border border-slate-855 rounded-2xl flex gap-3">
                        <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-300 font-semibold leading-relaxed font-sans italic">
                          "{q.text}"
                        </p>
                      </div>

                      {q.answerText ? (
                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850 space-y-2 border-l-2 border-l-emerald-500">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Posted Answer</span>
                          <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{q.answerText}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Merchant Reply Panel</span>
                            <button
                              onClick={() => {
                                setReplyingToQuestionId(q.id);
                                handleGenerateAnswerSuggestion(q.text);
                              }}
                              disabled={isGeneratingAnswer && replyingToQuestionId === q.id}
                              className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-slate-950 transition-all font-bold text-[9px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Sparkles className={`h-3 w-3 ${isGeneratingAnswer && replyingToQuestionId === q.id ? "animate-spin" : ""}`} />
                              AI Draft Reply
                            </button>
                          </div>

                          <div className="flex gap-3">
                            <textarea
                              value={replyingToQuestionId === q.id ? questionReplyText : ""}
                              onChange={(e) => {
                                setReplyingToQuestionId(q.id);
                                setQuestionReplyText(e.target.value);
                              }}
                              placeholder="Type answer to post on Google Maps..."
                              rows={2}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-primary"
                            />
                            <button
                              onClick={() => handlePostAnswer(q.id)}
                              disabled={isSubmittingAnswer || replyingToQuestionId !== q.id || !questionReplyText}
                              className="bg-primary hover:bg-secondary disabled:opacity-50 text-slate-950 font-bold rounded-2xl p-3 px-5 flex items-center justify-center shrink-0 shadow-lg cursor-pointer"
                            >
                              <Send className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              SUB-TAB 4: LISTING GALLERY (PHOTOS & IMAGES MANAGEMENT)
              ========================================================= */}
          {activeSubTab === "media" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
              {/* Photo Upload Card Column */}
              <div className="lg:col-span-1 space-y-6">
                <form onSubmit={handleUploadPhoto} className="bg-slate-950/30 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Upload className="h-4.5 w-4.5 text-primary" /> Upload Photo
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Photo Category</label>
                    <select
                      value={mediaCategory}
                      onChange={(e) => setMediaCategory(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="ADDITIONAL">Additional Photo</option>
                      <option value="COVER">Cover Photo</option>
                      <option value="PROFILE">Profile Logo</option>
                      <option value="INTERIOR">Interior Photo</option>
                      <option value="EXTERIOR">Exterior Photo</option>
                      <option value="TEAMS">Team Photo</option>
                    </select>
                  </div>

                  {/* Visual Dropzone File Picker */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Select Image File</label>
                    <div className="relative border-2 border-dashed border-slate-800 hover:border-primary/50 bg-slate-900/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {mediaFileBase64 ? (
                        <div className="space-y-3">
                          <img src={mediaFileBase64} alt="Preview" className="h-24 mx-auto object-cover rounded-xl border border-slate-850" />
                          <span className="text-[10px] text-emerald-400 font-bold block">Image loaded successfully!</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ImageIcon className="h-8 w-8 text-slate-600 mx-auto" />
                          <span className="text-xs font-semibold text-slate-350 block">Click or Drag Image Here</span>
                          <span className="text-[10px] text-slate-550 block font-mono">PNG, JPG, or WEBP up to 5MB</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingPhoto || !mediaFileBase64}
                    className="w-full bg-primary hover:bg-secondary disabled:opacity-50 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-md mt-4 cursor-pointer"
                  >
                    {uploadingPhoto ? "Uploading to Google..." : "Upload Photo to Live Profile"}
                  </button>
                </form>
              </div>

              {/* Photos Gallery Feed Grid */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Listing Image Gallery</h3>
                    <span className="text-[10px] text-slate-550 leading-normal">Live storefront and workspace media from your business page</span>
                  </div>
                  <button
                    onClick={fetchMedia}
                    className="p-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`h-4.5 w-4.5 ${loadingMedia ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {loadingMedia && mediaItems.length === 0 ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : mediaItems.length === 0 ? (
                  <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-12 text-center text-slate-400">
                    <Camera className="h-14 w-14 text-slate-650 mx-auto mb-4 stroke-1" />
                    <p className="text-xs font-semibold">Your gallery has no photos.</p>
                    <p className="text-[10px] text-slate-550 mt-1">Use the upload box on the left to upload brand storefront photos.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaItems.map((item, idx) => (
                      <div 
                        key={item.name || idx} 
                        onClick={() => setSelectedPhoto(item)}
                        className="group relative aspect-square bg-slate-950/30 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col justify-end cursor-pointer transition-all hover:border-primary/40 hover:shadow-lg"
                      >
                        <img
                          src={item.googleUrl || item.thumbnailUrl}
                          alt="Listing Media"
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-85 p-3 flex flex-col justify-end gap-1 select-none">
                          <span className="text-[9px] bg-primary/95 text-slate-950 font-bold px-2 py-0.5 rounded-lg w-max uppercase tracking-wider">
                            {item.category}
                          </span>
                          <span className="text-[8px] text-slate-400">
                            Uploaded {new Date(item.createTime).toLocaleDateString([], { dateStyle: "short" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      {/* Lightbox Photo Preview Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Left side: Large Image */}
            <div className="md:w-2/3 bg-slate-950 flex items-center justify-center p-4 relative min-h-[300px] md:min-h-[500px]">
              <img 
                src={selectedPhoto.googleUrl || selectedPhoto.thumbnailUrl} 
                alt="Storefront Preview" 
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
            </div>

            {/* Right side: Photo Details Metadata */}
            <div className="md:w-1/3 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/60">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Photo Category</h4>
                  <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-xl uppercase tracking-wider block w-max">
                    {selectedPhoto.category}
                  </span>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Creation Timestamp</h4>
                  <p className="text-xs font-semibold text-slate-200">
                    {new Date(selectedPhoto.createTime).toLocaleString([], { dateStyle: "long", timeStyle: "short" })}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Resource Path</h4>
                  <p className="text-[9px] text-slate-400 font-mono break-all bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                    {selectedPhoto.name || "simulated/media/node"}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <a 
                  href={selectedPhoto.googleUrl || selectedPhoto.thumbnailUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-3 rounded-xl transition-all shadow-md text-center block cursor-pointer"
                >
                  Open Original URL
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
