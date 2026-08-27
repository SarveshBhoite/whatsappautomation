"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type PlatformType = 
  | "whatsapp" 
  | "instagram" 
  | "gmail" 
  | "youtube" 
  | "linkedin" 
  | "gmb" 
  | "meta_ads" 
  | "google_ads" 
  | "ai_agent";

export interface AccountInfo {
  id: string;
  platform: PlatformType;
  name: string;
  identifier?: string;
  avatarUrl?: string;
  isDefault?: boolean;
  rawConfig?: any;
}

interface AccountContextType {
  activeAccounts: Record<string, string>; // platform -> accountId
  accountData: Record<string, AccountInfo>; // platform -> AccountInfo
  setActiveAccount: (platform: PlatformType, accountId: string, info?: Partial<AccountInfo>) => void;
  getActiveAccountId: (platform: PlatformType) => string;
  getActiveAccount: (platform: PlatformType) => AccountInfo | null;
  buildAccountUrl: (pathname: string, platform: PlatformType, accountId?: string) => string;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const STORAGE_KEY = "jisnu_active_accounts_v1";

export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <React.Suspense fallback={null}>
      <AccountProviderContent>{children}</AccountProviderContent>
    </React.Suspense>
  );
};

const AccountProviderContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Map of platform -> selected account ID
  const [activeAccounts, setActiveAccountsState] = useState<Record<string, string>>({});
  // Map of platform -> detailed account info
  const [accountData, setAccountData] = useState<Record<string, AccountInfo>>({});

  // Load initial selections from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setActiveAccountsState(JSON.parse(saved));
        }
      } catch (err) {
        console.warn("Could not parse saved active accounts from localStorage:", err);
      }
    }
  }, []);

  // Sync URL query params with active accounts state if accountId is in URL
  useEffect(() => {
    if (typeof window !== "undefined" && searchParams) {
      const urlAccountId = searchParams.get("accountId");
      if (urlAccountId) {
        // Detect current platform from pathname
        let currentPlatform: PlatformType | null = null;
        if (pathname.startsWith("/instagram")) currentPlatform = "instagram";
        else if (pathname.startsWith("/whatsapp")) currentPlatform = "whatsapp";
        else if (pathname.startsWith("/gmail")) currentPlatform = "gmail";
        else if (pathname.startsWith("/youtube")) currentPlatform = "youtube";
        else if (pathname.startsWith("/linkedin")) currentPlatform = "linkedin";
        else if (pathname.startsWith("/gmb") || pathname.startsWith("/reviews")) currentPlatform = "gmb";
        else if (pathname.startsWith("/meta-ads")) currentPlatform = "meta_ads";
        else if (pathname.startsWith("/ads")) currentPlatform = "google_ads";
        else if (pathname.startsWith("/ai-agent")) currentPlatform = "ai_agent";

        if (currentPlatform) {
          setActiveAccountsState((prev) => {
            if (prev[currentPlatform!] !== urlAccountId) {
              const updated = { ...prev, [currentPlatform!]: urlAccountId };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              return updated;
            }
            return prev;
          });
        }
      }
    }
  }, [pathname, searchParams]);

  const setActiveAccount = useCallback((platform: PlatformType, accountId: string, info?: Partial<AccountInfo>) => {
    setActiveAccountsState((prev) => {
      const updated = { ...prev, [platform]: accountId };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        // Clear old session cache keys for real-time update
        try {
          sessionStorage.removeItem(`session_${platform}_cache`);
          sessionStorage.removeItem(`session_${platform}_active_id`);
          sessionStorage.setItem(`session_${platform}_active_id`, accountId);
        } catch (e) {
          console.warn("Could not access sessionStorage:", e);
        }
      }
      return updated;
    });

    if (info) {
      setAccountData((prev) => ({
        ...prev,
        [platform]: {
          id: accountId,
          platform,
          name: info.name || accountId,
          identifier: info.identifier,
          avatarUrl: info.avatarUrl,
          isDefault: info.isDefault,
          rawConfig: info.rawConfig,
        },
      }));
    }

    // Update URL query param & dispatch real-time account-changed event
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("accountId", accountId);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);

      window.dispatchEvent(new CustomEvent("account-changed", { detail: { platform, accountId } }));
    }
  }, []);

  const getActiveAccountId = useCallback((platform: PlatformType): string => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("accountId");
      if (urlId) return urlId;
    }
    return activeAccounts[platform] || "";
  }, [activeAccounts]);

  const getActiveAccount = useCallback((platform: PlatformType): AccountInfo | null => {
    return accountData[platform] || null;
  }, [accountData]);

  const buildAccountUrl = useCallback((targetPathname: string, platform: PlatformType, accountId?: string): string => {
    const accId = accountId || activeAccounts[platform];
    if (!accId) return targetPathname;
    return `${targetPathname}?accountId=${encodeURIComponent(accId)}`;
  }, [activeAccounts]);

  return (
    <AccountContext.Provider
      value={{
        activeAccounts,
        accountData,
        setActiveAccount,
        getActiveAccountId,
        getActiveAccount,
        buildAccountUrl,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};

export const useAccountContext = useAccount;
