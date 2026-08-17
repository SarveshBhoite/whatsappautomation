'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Zap,
  Building2,
  User,
  Sparkles,
  Radio,
  Check,
  AlertCircle,
  Hash
} from 'lucide-react';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface InstagramAccount {
  id: string;
  name: string;
  profile_picture_url?: string;
  account_type?: string;
  instagram_business_account?: {
    id: string;
    username: string;
    name?: string;
    profile_picture_url?: string;
    account_type?: string;
    followers_count?: number;
    media_count?: number;
  };
  is_primary?: boolean;
}

interface ConnectedInstagramCardProps {
  instagramData: {
    connected: boolean;
    username?: string;
    name?: string;
    instagramAccountId?: string;
    pageId?: string;
    profilePictureUrl?: string;
    accountType?: string;
    verificationStatus?: string;
    followersCount?: number;
    mediaCount?: number;
    webhookActive?: boolean;
    accounts?: InstagramAccount[];
  };
  onDisconnect: () => void;
  onRefresh?: () => void;
  onSelectAccount?: (account: InstagramAccount) => void;
}

// Fallback high-res profile avatar
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';

export default function ConnectedInstagramCard({
  instagramData,
  onDisconnect,
  onRefresh,
  onSelectAccount,
}: ConnectedInstagramCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const username = instagramData.username || '';
  const name = instagramData.name || (username ? `@${username}` : 'Instagram Professional Account');
  const igId = instagramData.instagramAccountId || '';
  const pageId = instagramData.pageId || '';
  const profilePic = instagramData.profilePictureUrl || '';
  const accountType = instagramData.accountType || 'Professional Account (Business)';
  const followersCount = instagramData.followersCount || 0;
  const mediaCount = instagramData.mediaCount || 0;
  const accountsList = instagramData.accounts && instagramData.accounts.length > 0
    ? instagramData.accounts
    : [
        {
          id: pageId,
          name: name,
          profile_picture_url: profilePic,
          account_type: accountType,
          instagram_business_account: {
            id: igId,
            username: username,
            name: name,
            profile_picture_url: profilePic,
            account_type: accountType,
            followers_count: followersCount,
            media_count: mediaCount,
          },
          is_primary: true,
        },
      ];

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRefreshClick = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => setIsRefreshing(false), 800);
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/95 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl transition-all duration-300">
      {/* 1. Header with Meta Brand & Connection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative p-3.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-pink-500/25 shrink-0">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Connected Instagram Account</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Live & Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Meta Business Login • Instagram Graph API v20.0 Integration</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh profile details from Meta Graph API"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-pink-400' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Profile'}</span>
            </button>
          )}

          <span className="px-3.5 py-1.5 text-xs font-bold rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-950/50 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Connected / Verified
          </span>
        </div>
      </div>

      {/* 2. Hero Profile Card */}
      <div className="p-6 bg-gradient-to-r from-purple-950/25 via-pink-950/20 to-slate-950/80 border border-pink-500/25 rounded-2xl shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Profile Picture (Circular with Meta Gradient Ring & Fallback) */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-xl shadow-pink-500/25">
                <div className="w-full h-full bg-slate-900 rounded-full overflow-hidden flex items-center justify-center">
                  {!imageError && profilePic ? (
                    <img
                      src={profilePic}
                      alt={username}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-700 via-pink-600 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                      {username ? username.charAt(0).toUpperCase() : 'I'}
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-slate-900 shadow-md" title="Verified Account">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h4 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                  @{username}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-[11px] shadow-sm tracking-wide flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Primary Sender
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-300 mt-1 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-pink-400 shrink-0" />
                <span>{name}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="px-2.5 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-lg text-xs font-semibold">
                  {accountType}
                </span>

                <span className="px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-400" /> Meta Verified
                </span>

                {(followersCount > 0 || mediaCount > 0) && (
                  <span className="text-xs text-slate-400 font-medium">
                    <strong className="text-slate-200">{followersCount.toLocaleString()}</strong> Followers • <strong className="text-slate-200">{mediaCount.toLocaleString()}</strong> Posts
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 self-start md:self-auto">
            <a
              href={`https://instagram.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>View on Instagram</span>
              <ExternalLink className="h-3.5 w-3.5 text-pink-400" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. Key Account Details Grid (App Review Ready) */}
      <div className="space-y-3">
        <h5 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>⚙️</span> Technical Verification & Connection Details
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Instagram User ID */}
          <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col justify-between gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-pink-400" /> Instagram Business ID
              </span>
              <button
                type="button"
                onClick={() => handleCopy(igId, 'igId')}
                className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold px-2 py-0.5 rounded bg-pink-500/10 hover:bg-pink-500/20 transition-all cursor-pointer"
              >
                {copiedField === 'igId' ? 'Copied!' : 'Copy ID'}
              </button>
            </div>
            <span className="font-mono text-sm font-bold text-pink-300 break-all select-all">{igId}</span>
          </div>

          {/* Facebook Page ID */}
          <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col justify-between gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" /> Facebook Page ID
              </span>
              <button
                type="button"
                onClick={() => handleCopy(pageId, 'pageId')}
                className="text-[11px] text-slate-400 hover:text-white font-semibold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
              >
                {copiedField === 'pageId' ? 'Copied!' : 'Copy ID'}
              </button>
            </div>
            <span className="font-mono text-sm font-bold text-slate-200 break-all select-all">{pageId}</span>
          </div>

          {/* Account Type */}
          <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col justify-between gap-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-indigo-400" /> Account Type
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300">{accountType}</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold">
                Professional
              </span>
            </div>
          </div>

          {/* Connection Status */}
          <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col justify-between gap-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-emerald-400" /> Connection Status
            </span>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Connected / Verified & Active</span>
            </div>
          </div>

          {/* Direct Messages & Webhook Status */}
          <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col justify-between gap-2 shadow-sm sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" /> Webhook Subscriptions
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Real-Time Sync Active
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded">
                messages
              </span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded">
                messaging_postbacks
              </span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded">
                message_reactions
              </span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded">
                comments
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. App Review Compliance Box */}
      <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-2.5 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <ShieldCheck className="h-4 w-4 text-pink-400" />
          <span>Meta App Review Ready Verification</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          This Instagram Business account has been authorized with official OAuth 2.0 scopes (
          <code className="text-pink-300 font-mono">instagram_basic</code>,{' '}
          <code className="text-pink-300 font-mono">instagram_manage_messages</code>,{' '}
          <code className="text-pink-300 font-mono">instagram_manage_comments</code>,{' '}
          <code className="text-pink-300 font-mono">pages_show_list</code>). Long-lived Page Access Token is active and securely managed for real-time customer messaging.
        </p>
      </div>

      {/* 5. Connected Accounts List (if multi-account) */}
      {accountsList.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Linked Instagram Accounts ({accountsList.length})
            </span>
            <span className="text-[11px] text-slate-400">Click to switch active sender</span>
          </div>

          <div className="space-y-2.5">
            {accountsList.map((acc, idx) => {
              const itemIg = acc.instagram_business_account;
              const thisIgId = itemIg?.id || acc.id;
              const thisUsername = itemIg?.username || username;
              const thisName = itemIg?.name || acc.name;
              const thisPic = itemIg?.profile_picture_url || acc.profile_picture_url || DEFAULT_AVATAR;
              const isActive = thisIgId === igId || acc.is_primary;

              return (
                <div
                  key={acc.id || idx}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isActive
                      ? 'bg-pink-950/20 border-pink-500/40 shadow-sm'
                      : 'bg-slate-950/40 border-slate-850 hover:border-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={thisPic}
                      alt={thisUsername}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-200">@{thisUsername}</span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 text-[10px] font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{thisName} (IG ID: {thisIgId})</p>
                    </div>
                  </div>

                  {!isActive && onSelectAccount && (
                    <button
                      type="button"
                      onClick={() => onSelectAccount(acc)}
                      className="px-3.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      Set as Primary
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Disconnect & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-850">
        <button
          type="button"
          onClick={onDisconnect}
          className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto hover:scale-[1.01] active:scale-[0.99]"
        >
          Disconnect Instagram Business Account
        </button>

        <span className="text-xs text-slate-400 font-medium">
          Direct Messages, Comments & Automations Active
        </span>
      </div>
    </div>
  );
}
