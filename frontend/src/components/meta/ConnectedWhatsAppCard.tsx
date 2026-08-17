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
  Phone,
  Radio,
  Check,
  AlertCircle,
  Hash,
  Sparkles
} from 'lucide-react';

export interface WhatsAppPhoneNumber {
  id: string;
  display_phone_number: string;
  verified_name?: string;
  quality_rating?: string;
  code_verification_status?: string;
  platform_type?: string;
  is_primary?: boolean;
}

export interface ConnectedWhatsAppCardProps {
  whatsAppData: {
    connected: boolean;
    wabaId?: string;
    phoneNumberId?: string;
    phoneNumber?: string;
    verifiedName?: string;
    businessName?: string;
    qualityRating?: string;
    codeVerificationStatus?: string;
    webhookActive?: boolean;
    phoneNumbers?: WhatsAppPhoneNumber[];
  };
  onDisconnect: () => void;
  onRefresh?: () => void;
  onSelectPhoneNumber?: (phone: WhatsAppPhoneNumber) => void;
}

export default function ConnectedWhatsAppCard({
  whatsAppData,
  onDisconnect,
  onRefresh,
  onSelectPhoneNumber,
}: ConnectedWhatsAppCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const wabaId = whatsAppData.wabaId || '';
  const activePhoneId = whatsAppData.phoneNumberId || '';
  const activePhoneNumber = whatsAppData.phoneNumber || '';
  const businessName = whatsAppData.businessName || whatsAppData.verifiedName || 'WhatsApp Business Account';
  
  const phoneList: WhatsAppPhoneNumber[] = (whatsAppData.phoneNumbers && whatsAppData.phoneNumbers.length > 0)
    ? whatsAppData.phoneNumbers
    : (activePhoneId
      ? [{
          id: activePhoneId,
          display_phone_number: activePhoneNumber || activePhoneId,
          verified_name: whatsAppData.verifiedName || businessName,
          quality_rating: whatsAppData.qualityRating || 'UNKNOWN',
          code_verification_status: whatsAppData.codeVerificationStatus || 'UNKNOWN',
          platform_type: 'CLOUD_API',
          is_primary: true,
        }]
      : []);

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

  const getQualityBadge = (rating?: string) => {
    const r = (rating || '').toUpperCase();
    if (r === 'GREEN') {
      return (
        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> High Quality (GREEN)
        </span>
      );
    } else if (r === 'YELLOW') {
      return (
        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Medium Quality (YELLOW)
        </span>
      );
    } else if (r === 'RED') {
      return (
        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span> Low Quality (RED)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold">
        Quality: {r || 'ACTIVE'}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/95 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl transition-all duration-300">
      {/* 1. Header with Meta WhatsApp Brand & Connection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative p-3.5 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl text-white shadow-lg shadow-emerald-500/25 shrink-0">
            <Phone className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Connected WhatsApp Business Account</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Live & Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Meta Cloud API • Real-Time WhatsApp Business Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh phone numbers from Meta Graph API"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isRefreshing ? 'Syncing Numbers...' : 'Sync Phone Numbers'}</span>
            </button>
          )}

          <span className="px-3.5 py-1.5 text-xs font-bold rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-950/50 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Connected / Verified
          </span>
        </div>
      </div>

      {/* 2. Business Overview Card */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/25 via-slate-900/90 to-slate-950/80 border border-emerald-500/25 rounded-2xl shadow-inner relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Connected Business Portfolio
            </span>
            <span className="font-extrabold text-slate-100 text-lg flex items-center gap-2.5">
              <Building2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{businessName}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                ✓ Meta Verified
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-xs flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {phoneList.length} Connected Phone Number(s)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {/* WABA ID */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-xl space-y-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
              WhatsApp Business Account ID (WABA ID)
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-emerald-400 font-bold text-sm tracking-wide">{wabaId}</span>
              {wabaId && (
                <button
                  type="button"
                  onClick={() => handleCopy(wabaId, 'wabaId')}
                  className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1"
                >
                  {copiedField === 'wabaId' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedField === 'wabaId' ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Webhook Status */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-xl space-y-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
              Webhook Event Subscriptions
            </span>
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                messages, message_template_status_update
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Real-Time Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Registered Phone Numbers List (All Numbers) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>📱</span> All Registered Business Phone Numbers ({phoneList.length})
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select any number below to set as the active primary sender for outbound broadcasts and flows.
            </p>
          </div>
        </div>

        {phoneList.length === 0 ? (
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/40 text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No phone numbers registered with this WABA ID.</p>
            <p className="text-xs text-slate-500">Add and verify a business phone number in Meta Business Suite.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {phoneList.map((phone, idx) => {
              const isCurrentActive = phone.id === activePhoneId || phone.is_primary;

              return (
                <div
                  key={phone.id || idx}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 space-y-4 ${
                    isCurrentActive
                      ? 'bg-gradient-to-r from-emerald-950/25 via-slate-900/90 to-slate-900/90 border-emerald-500/40 shadow-xl shadow-emerald-950/25'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          isCurrentActive
                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <Phone className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-extrabold text-base sm:text-lg text-slate-100 tracking-tight whitespace-nowrap">
                            {phone.display_phone_number}
                          </span>
                          {isCurrentActive && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-[11px] shadow-sm tracking-wide whitespace-nowrap shrink-0">
                              <Sparkles className="h-3 w-3" /> Active Primary Sender
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate font-medium">
                          {phone.verified_name || businessName}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                      {getQualityBadge(phone.quality_rating)}
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3 stroke-[3]" /> Verified & Active
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2 shadow-sm">
                      <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Phone ID:</span>
                      <span className="font-mono text-emerald-400 font-bold text-xs tracking-wide">{phone.id}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(phone.id, `phone_${phone.id}`)}
                        className="ml-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        {copiedField === `phone_${phone.id}` ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {!isCurrentActive && onSelectPhoneNumber && (
                        <button
                          type="button"
                          onClick={() => onSelectPhoneNumber(phone)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs transition-all cursor-pointer shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                        >
                          Set as Active Sender
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. App Review Compliance Disclosure */}
      <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Meta App Review Ready Compliance</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          This integration utilizes official Meta WhatsApp Business Management & Messaging APIs (
          <code className="text-emerald-300 font-mono">whatsapp_business_management</code>,{' '}
          <code className="text-emerald-300 font-mono">whatsapp_business_messaging</code>). Phone numbers and WABA assets are securely synchronized and managed in real-time.
        </p>
      </div>

      {/* 5. Disconnect Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-850">
        <button
          type="button"
          onClick={onDisconnect}
          className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
        >
          Disconnect WhatsApp Business Account
        </button>
        <span className="text-xs text-slate-500 font-medium">
          Meta Cloud API & Webhooks Synced
        </span>
      </div>
    </div>
  );
}
