import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, User, Phone, Mail, ShieldCheck, Sparkles, CheckCircle2, Tv, Globe } from "lucide-react";
import { useAccount, PlatformType } from "@/context/AccountContext";

export interface AccountOption {
  id: string;
  label: string;
  sublabel?: string;
  isDefault?: boolean;
  isActive?: boolean;
  type?: "instagram" | "whatsapp" | "gmail" | "google" | "meta" | "youtube";
  avatarUrl?: string;
}

export type SwitcherTheme = "emerald" | "pink" | "rose" | "indigo" | "red" | "blue";

interface AccountSwitcherProps {
  title?: string;
  accounts: AccountOption[];
  selectedAccountId: string;
  onSelectAccount: (accountId: string) => void;
  onAddNewAccount?: () => void;
  addNewAccountText?: string;
  onToggleOpen?: () => void;
  className?: string;
  theme?: SwitcherTheme;
}

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  title = "Select Account",
  accounts,
  selectedAccountId,
  onSelectAccount,
  onAddNewAccount,
  addNewAccountText,
  onToggleOpen,
  className = "",
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  let activeAccountContext: any = null;
  try {
    activeAccountContext = useAccount();
  } catch (e) {
    // Context fallback if mounted outside provider
  }

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId) || accounts[0];

  // Resolve theme: explicit prop OR auto-detected from selectedAccount type
  const activeTheme: SwitcherTheme = theme
    ? theme
    : selectedAccount?.type === "instagram"
    ? "pink"
    : selectedAccount?.type === "gmail"
    ? "rose"
    : selectedAccount?.type === "youtube"
    ? "red"
    : selectedAccount?.type === "whatsapp"
    ? "emerald"
    : selectedAccount?.type === "google"
    ? "blue"
    : "indigo";

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && onToggleOpen) {
      onToggleOpen();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getAccountIcon = (type?: string) => {
    switch (type) {
      case "whatsapp":
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case "gmail":
        return <Mail className="w-4 h-4 text-rose-600" />;
      case "instagram":
        return <User className="w-4 h-4 text-pink-600" />;
      case "youtube":
        return <Tv className="w-4 h-4 text-red-600" />;
      case "google":
        return <Globe className="w-4 h-4 text-blue-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
    }
  };

  // Dynamic theme style maps
  const themeMap: Record<SwitcherTheme, any> = {
    emerald: {
      hoverBorder: "hover:border-emerald-400",
      focusRing: "focus:ring-emerald-500/20",
      pulse: "bg-emerald-500",
      iconBox: "bg-emerald-50 text-emerald-600 border-emerald-100/90",
      activeBadge: "bg-emerald-100/90 text-emerald-800 border-emerald-200/80",
      headerBadge: "bg-emerald-100/80 text-emerald-700 border-emerald-200/80",
      sparkle: "text-emerald-500",
      selectedBg: "bg-emerald-50/90 border-emerald-300/90 text-emerald-950",
      selectedCheck: "bg-emerald-600",
      buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20",
      chevronActive: "text-emerald-600",
      btnText: "Link New WhatsApp Number",
    },
    pink: {
      hoverBorder: "hover:border-pink-400",
      focusRing: "focus:ring-pink-500/20",
      pulse: "bg-pink-500",
      iconBox: "bg-pink-50 text-pink-600 border-pink-100/90",
      activeBadge: "bg-pink-100/90 text-pink-800 border-pink-200/80",
      headerBadge: "bg-pink-100/80 text-pink-700 border-pink-200/80",
      sparkle: "text-pink-500",
      selectedBg: "bg-pink-50/90 border-pink-300/90 text-pink-950",
      selectedCheck: "bg-pink-600",
      buttonBg: "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-pink-600/20",
      chevronActive: "text-pink-600",
      btnText: "Link New Instagram Account",
    },
    rose: {
      hoverBorder: "hover:border-rose-400",
      focusRing: "focus:ring-rose-500/20",
      pulse: "bg-rose-500",
      iconBox: "bg-rose-50 text-rose-600 border-rose-100/90",
      activeBadge: "bg-rose-100/90 text-rose-800 border-rose-200/80",
      headerBadge: "bg-rose-100/80 text-rose-700 border-rose-200/80",
      sparkle: "text-rose-500",
      selectedBg: "bg-rose-50/90 border-rose-300/90 text-rose-950",
      selectedCheck: "bg-rose-600",
      buttonBg: "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-600/20",
      chevronActive: "text-rose-600",
      btnText: "Connect New Gmail Account",
    },
    red: {
      hoverBorder: "hover:border-red-400",
      focusRing: "focus:ring-red-500/20",
      pulse: "bg-red-500",
      iconBox: "bg-red-50 text-red-600 border-red-100/90",
      activeBadge: "bg-red-100/90 text-red-800 border-red-200/80",
      headerBadge: "bg-red-100/80 text-red-700 border-red-200/80",
      sparkle: "text-red-500",
      selectedBg: "bg-red-50/90 border-red-300/90 text-red-950",
      selectedCheck: "bg-red-600",
      buttonBg: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-600/20",
      chevronActive: "text-red-600",
      btnText: "Link Another YouTube Channel",
    },
    blue: {
      hoverBorder: "hover:border-blue-400",
      focusRing: "focus:ring-blue-500/20",
      pulse: "bg-blue-500",
      iconBox: "bg-blue-50 text-blue-600 border-blue-100/90",
      activeBadge: "bg-blue-100/90 text-blue-800 border-blue-200/80",
      headerBadge: "bg-blue-100/80 text-blue-700 border-blue-200/80",
      sparkle: "text-blue-500",
      selectedBg: "bg-blue-50/90 border-blue-300/90 text-blue-950",
      selectedCheck: "bg-blue-600",
      buttonBg: "bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-blue-600/20",
      chevronActive: "text-blue-600",
      btnText: "Link Google Calendar",
    },
    indigo: {
      hoverBorder: "hover:border-indigo-400",
      focusRing: "focus:ring-indigo-500/20",
      pulse: "bg-indigo-500",
      iconBox: "bg-indigo-50 text-indigo-600 border-indigo-100/90",
      activeBadge: "bg-indigo-100/90 text-indigo-800 border-indigo-200/80",
      headerBadge: "bg-indigo-100/80 text-indigo-700 border-indigo-200/80",
      sparkle: "text-indigo-500",
      selectedBg: "bg-indigo-50/90 border-indigo-300/90 text-indigo-950",
      selectedCheck: "bg-indigo-600",
      buttonBg: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-600/20",
      chevronActive: "text-indigo-600",
      btnText: "Link New Account",
    },
  };

  const themeStyles = themeMap[activeTheme] || themeMap.indigo;

  return (
    <div className={`relative ${className || "w-full sm:w-auto"}`} ref={dropdownRef}>
      {/* Sleek Trigger Button with Dynamic Theme Styling */}
      <button
        type="button"
        onClick={handleToggle}
        className={`group relative w-full inline-flex items-center justify-between gap-3 px-3.5 py-2 min-h-[44px] text-xs font-semibold text-slate-800 bg-white border border-slate-200/90 rounded-2xl shadow-2xs ${themeStyles.hoverBorder} hover:shadow-md hover:bg-slate-50/80 focus:outline-none focus:ring-2 ${themeStyles.focusRing} transition-all duration-200 cursor-pointer`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 truncate">
          <div className="relative flex items-center justify-center shrink-0">
            {selectedAccount?.avatarUrl ? (
              <img src={selectedAccount.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-200" />
            ) : (
              <div className={`p-1.5 rounded-xl border flex items-center justify-center ${themeStyles.iconBox}`}>
                {getAccountIcon(selectedAccount?.type)}
              </div>
            )}
            <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${themeStyles.pulse} ring-2 ring-white animate-pulse`} />
          </div>

          <div className="flex flex-col text-left truncate min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 truncate">
              <span className="truncate">{selectedAccount?.label || title}</span>
              {selectedAccount?.isDefault && (
                <span className={`px-1.5 py-0.2 text-[9px] font-extrabold tracking-wide border rounded-md shrink-0 ${themeStyles.activeBadge}`}>
                  Primary
                </span>
              )}
            </div>
            {selectedAccount?.sublabel && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-slate-600 font-mono tracking-tight font-medium bg-slate-100/90 border border-slate-200/80 px-1.5 py-0.2 rounded-md inline-flex items-center gap-1">
                  <span className="text-[9px] font-bold text-slate-400">WABA:</span>
                  <span className="font-semibold text-slate-700">
                    {selectedAccount.sublabel.replace(/^WABA:\s*/i, "")}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 shrink-0 ${isOpen ? `rotate-180 ${themeStyles.chevronActive}` : ""}`} />
      </button>

      {/* Floating Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-96 origin-top-right rounded-2xl bg-white shadow-2xl border border-slate-200/90 ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
          {/* Header Bar */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className={`w-3.5 h-3.5 ${themeStyles.sparkle}`} /> Connected Accounts ({accounts.length})
            </span>
            <span className={`text-[10px] border px-2.5 py-0.5 rounded-full font-extrabold ${themeStyles.headerBadge}`}>
              Org Isolated
            </span>
          </div>

          {/* Account Items List */}
          <div className="max-h-72 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {accounts.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-slate-400 space-y-1.5">
                <p className="font-bold text-slate-600">No linked accounts or IDs</p>
                <p className="text-[11px] text-slate-500">Click below to link a new account.</p>
              </div>
            ) : (
              accounts.map((acc) => {
                const isSelected = acc.id === selectedAccountId;
                return (
                  <button
                    key={acc.id}
                    onClick={() => {
                      if (activeAccountContext && activeAccountContext.setActiveAccount) {
                        const plat = (acc.type || "whatsapp") as PlatformType;
                        activeAccountContext.setActiveAccount(plat, acc.id, {
                          name: acc.label,
                          identifier: acc.sublabel,
                          avatarUrl: acc.avatarUrl,
                          isDefault: acc.isDefault,
                        });
                      }
                      onSelectAccount(acc.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 text-left rounded-xl transition-all duration-150 border cursor-pointer ${
                      isSelected
                        ? `${themeStyles.selectedBg} shadow-2xs`
                        : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {acc.avatarUrl ? (
                        <img src={acc.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 shrink-0" />
                      ) : (
                        <div className={`p-2 rounded-xl border flex-shrink-0 ${themeStyles.iconBox}`}>
                          {getAccountIcon(acc.type)}
                        </div>
                      )}
                      <div className="min-w-0 space-y-0.5 flex-1">
                        <div className="text-xs font-extrabold text-slate-900 truncate flex items-center justify-between gap-2">
                          <span className="truncate">{acc.label}</span>
                          {acc.isDefault && (
                            <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md shrink-0 ${themeStyles.activeBadge}`}>Primary</span>
                          )}
                        </div>
                        {acc.sublabel && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-slate-600 font-mono tracking-tight bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 rounded-md inline-flex items-center gap-1">
                              <span className="text-[9px] font-bold text-slate-400">WABA:</span>
                              <span className="font-semibold text-slate-700">
                                {acc.sublabel.replace(/^WABA:\s*/i, "")}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className={`p-1 rounded-full text-white shrink-0 ml-2 shadow-xs ${themeStyles.selectedCheck}`}>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Action Footer */}
          {onAddNewAccount && (
            <div className="p-2.5 border-t border-slate-100 bg-slate-50/90">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddNewAccount();
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white rounded-xl transition-all shadow-md cursor-pointer ${themeStyles.buttonBg}`}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                {addNewAccountText || themeStyles.btnText}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
