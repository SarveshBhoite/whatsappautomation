'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { InstagramTokenExchangeResponse } from '@/types/meta';

function InstagramCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InstagramTokenExchangeResponse | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorReason = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorReason || errorDescription) {
      setError(errorDescription || errorReason || 'Instagram authorization was cancelled or declined.');
      setIsLoading(false);
      return;
    }

    if (!code) {
      setError('No authorization code was returned in the callback request URL.');
      setIsLoading(false);
      return;
    }

    // Perform server-side token exchange
    fetch('/api/auth/instagram/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirect_uri: `${window.location.origin}/instagram/callback`,
      }),
    })
      .then((res) => res.json())
      .then((data: InstagramTokenExchangeResponse) => {
        if (data.success) {
          setResult(data);
          // Automatically redirect to /settings Instagram tab after a brief moment
          setTimeout(() => {
            router.push('/settings?tab=settings&subtab=instagram&instagram=connected');
          }, 1200);
        } else {
          setError(data.error || 'Failed to complete Instagram token exchange.');
        }
      })
      .catch((err) => {
        setError(err.message || 'An unexpected network error occurred.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-xl text-white shadow-lg shadow-pink-500/20">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Instagram Business Authorization</h1>
            <p className="text-xs text-slate-400">Processing Business OAuth credentials</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <svg className="animate-spin h-8 w-8 text-pink-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p className="text-sm text-slate-300 font-medium">Exchanging OAuth code for long-lived Instagram token...</p>
          </div>
        )}

        {error && (
          <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-3 text-rose-300">
            <h3 className="font-bold text-base">Authorization Failed</h3>
            <p className="text-xs text-rose-400">{error}</p>
            <div className="pt-2">
              <Link
                href="/settings?tab=settings&subtab=instagram"
                className="inline-block px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                Back to Settings
              </Link>
            </div>
          </div>
        )}

        {result && result.success && (
          <div className="space-y-5">
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 space-y-2">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>✅</span> Instagram Business Account Connected!
              </h3>
              <p className="text-xs text-slate-300">
                Long-lived access token acquired. Redirecting to your Settings dashboard...
              </p>
            </div>

            {result.accounts && result.accounts.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Connected Accounts & Pages:</h4>
                {result.accounts.map((acc) => (
                  <div key={acc.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-white">{acc.name}</p>
                      <p className="text-xs text-slate-400">Facebook Page ID: {acc.id}</p>
                      {acc.instagram_business_account ? (
                        <p className="text-xs text-pink-400 mt-1 font-semibold">
                          Instagram Business ID: {acc.instagram_business_account.id}
                          {acc.instagram_business_account.username && ` (@${acc.instagram_business_account.username})`}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-400 mt-1">No linked Instagram Business account found on this page.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                ⚠️ No Facebook Pages with linked Instagram Business accounts were retrieved for this Meta User.
              </p>
            )}

            <div className="pt-2 flex gap-3">
              <Link
                href="/settings?tab=settings&subtab=instagram&instagram=connected"
                className="w-full text-center px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
              >
                Go to Settings Now →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InstagramCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 text-sm">
          Loading callback handler...
        </div>
      }
    >
      <InstagramCallbackHandler />
    </Suspense>
  );
}
