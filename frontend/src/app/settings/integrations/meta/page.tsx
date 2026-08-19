'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ConnectWhatsAppButton from '@/components/meta/ConnectWhatsAppButton';
import ConnectInstagramButton from '@/components/meta/ConnectInstagramButton';
import ConnectedInstagramCard from '@/components/meta/ConnectedInstagramCard';
import { WhatsAppTokenExchangeResponse } from '@/types/meta';

interface ConnectionDetails {
  whatsapp: {
    connected: boolean;
    wabaId?: string;
    phoneNumberId?: string;
    phoneNumber?: string;
    verifiedName?: string;
    businessName?: string;
    qualityRating?: string;
    codeVerificationStatus?: string;
    phoneNumbers?: Array<{
      id: string;
      display_phone_number: string;
      verified_name?: string;
      quality_rating?: string;
      code_verification_status?: string;
      is_primary?: boolean;
    }>;
  };
  instagram: {
    connected: boolean;
    username?: string;
    instagramAccountId?: string;
    pageId?: string;
    name?: string;
    profilePictureUrl?: string;
    accountType?: string;
    verificationStatus?: string;
    followersCount?: number;
    mediaCount?: number;
    webhookActive?: boolean;
    accounts?: Array<{
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
    }>;
  };
}

function MetaIntegrationsContent() {
  const searchParams = useSearchParams();

  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionDetails>({
    whatsapp: {
      connected: false,
      wabaId: '',
      phoneNumberId: '',
      phoneNumber: '',
      verifiedName: '',
      businessName: '',
      qualityRating: 'GREEN',
      codeVerificationStatus: 'VERIFIED',
      phoneNumbers: [],
    },
    instagram: {
      connected: false,
      username: '',
      instagramAccountId: '',
      name: '',
    },
  });

  const fetchStatus = () => {
    fetch('/api/auth/meta/status')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.data) {
          setStatus((prev) => ({
            whatsapp: {
              ...data.data.whatsapp,
              connected: prev.whatsapp.connected || data.data.whatsapp.connected,
              phoneNumbers: data.data.whatsapp.phoneNumbers || prev.whatsapp.phoneNumbers,
            },
            instagram: {
              ...data.data.instagram,
              connected: prev.instagram.connected || data.data.instagram.connected,
            },
          }));
        }
      })
      .catch((err) => console.warn('Meta status load skipped:', err.message || err));
  };

  useEffect(() => {
    fetchStatus();

    // Check query params for post-OAuth redirect status
    const whatsappParam = searchParams.get('whatsapp');
    const instagramParam = searchParams.get('instagram');

    if (whatsappParam === 'connected') {
      setSuccessToast('WhatsApp connected successfully via Meta Embedded Signup.');
      fetchStatus();
    }

    if (instagramParam === 'connected') {
      setSuccessToast('Instagram connected successfully.');
      fetchStatus();
    }
  }, [searchParams]);

  const handleSelectActivePhoneNumber = async (phone: {
    id: string;
    display_phone_number: string;
    verified_name?: string;
    quality_rating?: string;
    code_verification_status?: string;
  }) => {
    try {
      await fetch('/api/auth/meta/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'whatsapp',
          phoneNumberId: phone.id,
        }),
      });

      setStatus((prev) => ({
        ...prev,
        whatsapp: {
          ...prev.whatsapp,
          phoneNumberId: phone.id,
          phoneNumber: phone.display_phone_number,
          verifiedName: phone.verified_name || prev.whatsapp.verifiedName,
          qualityRating: phone.quality_rating || prev.whatsapp.qualityRating,
          codeVerificationStatus: phone.code_verification_status || prev.whatsapp.codeVerificationStatus,
          phoneNumbers: prev.whatsapp.phoneNumbers?.map((p) => ({
            ...p,
            is_primary: p.id === phone.id,
          })),
        },
      }));

      setSuccessToast(`Active sender number switched to ${phone.display_phone_number} (ID: ${phone.id})`);
    } catch (err) {
      console.error('Failed to switch active phone number:', err);
    }
  };

  const handleWhatsAppSuccess = (data: WhatsAppTokenExchangeResponse) => {
    const received = data.phoneNumbers || (data.phoneNumberId ? [{
      id: data.phoneNumberId,
      display_phone_number: data.phoneNumber || data.phoneNumberId,
      verified_name: data.verifiedName || '',
      quality_rating: data.qualityRating || 'UNKNOWN',
      code_verification_status: data.codeVerificationStatus || 'UNKNOWN',
      is_primary: true,
    }] : []);

    const activeNum = received.find((p) => p.is_primary) || received[0];

    setStatus((prev) => ({
      ...prev,
      whatsapp: {
        connected: true,
        wabaId: data.wabaId || prev.whatsapp.wabaId || '',
        phoneNumberId: activeNum?.id || data.phoneNumberId || prev.whatsapp.phoneNumberId || '',
        phoneNumber: activeNum?.display_phone_number || data.phoneNumber || prev.whatsapp.phoneNumber || '',
        verifiedName: activeNum?.verified_name || data.verifiedName || prev.whatsapp.verifiedName || '',
        businessName: data.businessName || prev.whatsapp.businessName || '',
        qualityRating: activeNum?.quality_rating || data.qualityRating || 'UNKNOWN',
        codeVerificationStatus: activeNum?.code_verification_status || data.codeVerificationStatus || 'UNKNOWN',
        phoneNumbers: received,
      },
    }));
    setSuccessToast(
      received.length > 0
        ? `WhatsApp connected with ${received.length} registered number(s).`
        : 'WhatsApp connected successfully!'
    );
  };

  const handleDisconnectWhatsApp = async () => {
    if (confirm('Disconnect WhatsApp Business Account?')) {
      try {
        await fetch('/api/auth/meta/status?platform=whatsapp', { method: 'DELETE' });
      } catch (e) {
        console.error(e);
      }
      setStatus((prev) => ({
        ...prev,
        whatsapp: { connected: false },
      }));
      setSuccessToast('WhatsApp Business disconnected.');
    }
  };

  const handleDisconnectInstagram = async () => {
    if (confirm('Disconnect Instagram Business Account?')) {
      try {
        await fetch('/api/auth/meta/status?platform=instagram', { method: 'DELETE' });
      } catch (e) {
        console.error(e);
      }
      setStatus((prev) => ({
        ...prev,
        instagram: { connected: false },
      }));
      setSuccessToast('Instagram Business disconnected.');
    }
  };

  return (
    <div className="w-full h-full min-h-screen overflow-y-auto bg-slate-950 text-slate-100 p-6 md:p-10 pb-24 font-sans space-y-8">
      {/* Success Notification Banner */}
      {successToast && (
        <div className="max-w-5xl mx-auto p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="text-lg">✅</span>
            <span className="text-sm font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Meta Integrations
          </h1>
          <p className="text-sm text-slate-400">
            Connect your official WhatsApp Business and Instagram accounts to enable messaging automation.
          </p>
        </div>
        <Link
          href="/settings?tab=settings"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
        >
          ← Back to Main Settings
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* CARD 1: WHATSAPP BUSINESS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">WhatsApp Business</h3>
                  <p className="text-xs text-slate-400">Automated Customer Messaging</p>
                </div>
              </div>

              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                  status.whatsapp.connected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {status.whatsapp.connected ? '● Connected' : '○ Not Connected'}
              </span>
            </div>

            {status.whatsapp.connected ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-400">WABA ID:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{status.whatsapp.wabaId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-400">Business Account:</span>
                    <span className="text-slate-200 font-semibold">{status.whatsapp.businessName || 'Connected WhatsApp Account'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Connected Numbers:</span>
                    <span className="text-emerald-400 font-semibold">{(status.whatsapp.phoneNumbers?.length || (status.whatsapp.phoneNumberId ? 1 : 0))} Registered</span>
                  </div>
                </div>

                {/* All Numbers list */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Registered Business Numbers ({status.whatsapp.phoneNumbers?.length || (status.whatsapp.phoneNumberId ? 1 : 0)}):
                  </span>
                  {((status.whatsapp.phoneNumbers && status.whatsapp.phoneNumbers.length > 0)
                    ? status.whatsapp.phoneNumbers
                    : (status.whatsapp.phoneNumberId
                        ? [{
                            id: status.whatsapp.phoneNumberId,
                            display_phone_number: status.whatsapp.phoneNumber || status.whatsapp.phoneNumberId,
                            verified_name: status.whatsapp.verifiedName || "WhatsApp Business Number",
                            quality_rating: status.whatsapp.qualityRating || "UNKNOWN",
                            code_verification_status: status.whatsapp.codeVerificationStatus || "UNKNOWN",
                            is_primary: true,
                          }]
                        : []
                      )
                  ).map((phone, idx) => {
                    const isCurrent = phone.id === status.whatsapp.phoneNumberId || phone.is_primary;
                    return (
                      <div
                        key={phone.id || idx}
                        className={`p-4 rounded-2xl border text-xs space-y-3 transition-all ${
                          isCurrent
                            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-md shadow-emerald-950/20'
                            : 'bg-slate-950 border-slate-850'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100 text-sm whitespace-nowrap">{phone.display_phone_number}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] whitespace-nowrap">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20 whitespace-nowrap">
                            {phone.quality_rating || 'GREEN'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-850/60">
                          <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                            <span className="font-mono text-emerald-400 font-bold text-xs">{phone.id}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(phone.id);
                                setSuccessToast(`Copied Phone ID ${phone.id}!`);
                              }}
                              className="text-[10px] text-slate-400 hover:text-white font-semibold ml-1 cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>

                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleSelectActivePhoneNumber(phone)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                            >
                              Set as Primary
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleDisconnectWhatsApp}
                  className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Disconnect WhatsApp
                </button>
              </div>
            ) : (
              <ConnectWhatsAppButton onSuccess={handleWhatsAppSuccess} />
            )}
          </div>
        </div>

        {/* CARD 2: INSTAGRAM BUSINESS */}
        {status.instagram.connected ? (
          <ConnectedInstagramCard
            instagramData={status.instagram}
            onDisconnect={handleDisconnectInstagram}
            onRefresh={fetchStatus}
          />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-xl text-white">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Instagram Business</h3>
                    <p className="text-xs text-slate-400">Direct Messages & Comments</p>
                  </div>
                </div>

                <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-slate-800 text-slate-400 border-slate-700">
                  ○ Not Connected
                </span>
              </div>

              <ConnectInstagramButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MetaIntegrationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
          Loading Meta Integrations...
        </div>
      }
    >
      <MetaIntegrationsContent />
    </Suspense>
  );
}
