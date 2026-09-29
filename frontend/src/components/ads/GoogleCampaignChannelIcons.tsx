"use client";

import React from "react";

// 1. Google "G" multicolor logo (Search)
export const GoogleSearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="Google Search">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

// 2. YouTube red play icon
export const GoogleYoutubeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="YouTube">
    <path
      fill="#FF0000"
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
    />
    <polygon fill="#FFFFFF" points="9.545,15.568 15.818,12 9.545,8.432" />
  </svg>
);

// 3. Gmail icon
export const GoogleGmailIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="Gmail">
    <path fill="#4285F4" d="M1.5 6.5v12a1 1 0 0 0 1 1h3.5v-8.5L1.5 7.5z" />
    <path fill="#34A853" d="M22.5 6.5v12a1 1 0 0 1-1 1H18v-8.5l4.5-3.5z" />
    <path fill="#EA4335" d="M18 4.5l-6 4.5-6-4.5H3.5a1 1 0 0 0-1 1v1.5l9.5 7.125L21.5 6.5V5.5a1 1 0 0 0-1-1H18z" />
    <path fill="#FBBC05" d="M18 4.5H6l6 4.5 6-4.5z" />
  </svg>
);

// 4. Google Maps pin icon
export const GoogleMapsIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="Google Maps">
    <path
      fill="#34A853"
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
    />
    <path
      fill="#FBBC04"
      d="M12 2c-3.87 0-7 3.13-7 7 0 1.94.79 3.7 2.06 4.97L12 9V2z"
    />
    <path
      fill="#EA4335"
      d="M12 2v7l4.94 4.97A6.98 6.98 0 0 0 19 9c0-3.87-3.13-7-7-7z"
    />
    <path
      fill="#4285F4"
      d="M12 22s-7-7.75-7-13c0-.68.1-1.34.28-1.96L12 17.5V22z"
    />
    <circle fill="#FFFFFF" cx="12" cy="9" r="2.8" />
  </svg>
);

// 5. Google Discover asterisk icon (Multi-color Google star with dot)
export const GoogleDiscoverIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="Google Discover">
    <path fill="#EA4335" d="M12 2.5a2 2 0 0 1 2 2v3.76a2 2 0 0 1-4 0V4.5a2 2 0 0 1 2-2z" />
    <path fill="#34A853" d="M12 15.74a2 2 0 0 1 2 2v3.76a2 2 0 1 1-4 0v-3.76a2 2 0 0 1 2-2z" />
    <path fill="#4285F4" d="M2.5 12a2 2 0 0 1 2-2h3.76a2 2 0 1 1 0 4H4.5a2 2 0 0 1-2-2z" />
    <path fill="#FBBC05" d="M15.74 12a2 2 0 0 1 2-2h3.76a2 2 0 1 1 0 4h-3.76a2 2 0 0 1-2-2z" />
    <path fill="#4285F4" d="M5.3 5.3a2 2 0 0 1 2.83 0l2.66 2.66a2 2 0 1 1-2.83 2.83L5.3 8.13a2 2 0 0 1 0-2.83z" />
    <path fill="#FBBC05" d="M13.21 13.21a2 2 0 0 1 2.83 0l2.66 2.66a2 2 0 0 1-2.83 2.83l-2.66-2.66a2 2 0 0 1 0-2.83z" />
    <path fill="#34A853" d="M18.7 5.3a2 2 0 0 1 0 2.83l-2.66 2.66a2 2 0 0 1-2.83-2.83l2.66-2.66a2 2 0 0 1 2.83 0z" />
    <path fill="#EA4335" d="M10.79 13.21a2 2 0 0 1 0 2.83l-2.66 2.66a2 2 0 0 1-2.83-2.83l2.66-2.66a2 2 0 0 1 2.83 0z" />
    <circle cx="12" cy="12" r="2.2" fill="#4285F4" />
  </svg>
);

// 6. Google Display Network icon (Green layout grid / web pages)
export const GoogleDisplayIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="Display Network">
    <rect x="2" y="3" width="20" height="18" rx="2" fill="#34A853" />
    <rect x="4" y="6" width="16" height="3" fill="#FFFFFF" />
    <rect x="4" y="11" width="7" height="8" fill="#FFFFFF" />
    <rect x="13" y="11" width="7" height="8" fill="#FFFFFF" />
  </svg>
);

// 7. Google Play Store icon (for App campaigns)
export const GooglePlayIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="Google Play">
    <path fill="#4285F4" d="M3.61 2.22c-.37.39-.59.98-.59 1.74v16.08c0 .76.22 1.35.59 1.74l.09.08 9.02-9.02v-.22L3.7 2.14l-.09.08z" />
    <path fill="#FBBC04" d="M15.73 14.85l-3.01-3.01v-.22l3.01-3.01.07.04 3.56 2.02c1.02.58 1.02 1.52 0 2.1l-3.56 2.04-.07.04z" />
    <path fill="#EA4335" d="M15.8 14.81L12.72 11.73 3.61 20.84c.34.36.9.4 1.54.04l10.65-6.07" />
    <path fill="#34A853" d="M15.8 8.65L5.15 2.58c-.64-.36-1.2-.32-1.54.04l9.11 9.11 3.08-3.08z" />
  </svg>
);

// Channel icons by campaign type matching official Google Ads UI
export const CAMPAIGN_CHANNEL_ICONS: Record<string, React.FC<{ className?: string }>[]> = {
  PERFORMANCE_MAX: [
    GoogleSearchIcon,
    GoogleYoutubeIcon,
    GoogleGmailIcon,
    GoogleMapsIcon,
    GoogleDiscoverIcon,
    GoogleDisplayIcon,
  ],
  SEARCH: [
    GoogleSearchIcon,
  ],
  SHOPPING: [
    GoogleSearchIcon,
  ],
  DEMAND_GEN: [
    GoogleYoutubeIcon,
    GoogleGmailIcon,
    GoogleMapsIcon,
    GoogleDiscoverIcon,
    GoogleDisplayIcon,
  ],
  VIDEO: [
    GoogleYoutubeIcon,
    GoogleDisplayIcon,
  ],
  DISPLAY: [
    GoogleYoutubeIcon,
    GoogleGmailIcon,
    GoogleDisplayIcon,
  ],
  APP: [
    GoogleSearchIcon,
    GoogleYoutubeIcon,
    GooglePlayIcon,
    GoogleDisplayIcon,
  ],
  LOCAL: [
    GoogleSearchIcon,
    GoogleMapsIcon,
    GoogleYoutubeIcon,
    GoogleGmailIcon,
    GoogleDisplayIcon,
  ],
};

// Component to render the row of channel logos for a given campaign type
export const GoogleCampaignChannelIcons = ({
  campaignType,
  className = "flex items-center gap-1.5",
  iconClassName = "w-4 h-4 shrink-0",
}: {
  campaignType?: string;
  className?: string;
  iconClassName?: string;
}) => {
  const normType = (campaignType || "").toUpperCase();
  const icons = CAMPAIGN_CHANNEL_ICONS[normType] || [GoogleSearchIcon];

  return (
    <div className={className} aria-label={`${normType} Channels`}>
      {icons.map((IconComponent, idx) => (
        <IconComponent key={idx} className={iconClassName} />
      ))}
    </div>
  );
};
