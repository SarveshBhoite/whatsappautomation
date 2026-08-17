'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ConnectInstagramButtonProps {
  redirectUri?: string;
  className?: string;
}

export default function ConnectInstagramButton({
  redirectUri,
  className,
}: ConnectInstagramButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [showPreRequisites, setShowPreRequisites] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    let extractedCode = manualInput.trim();
    const match = extractedCode.match(/[?&#]code=([^&]+)/);
    if (match) {
      extractedCode = decodeURIComponent(match[1]);
    }

    window.location.href = `/instagram/callback?code=${extractedCode}`;
  };

  const handleInstagramLogin = () => {
    setIsRedirecting(true);
    setShowManualInput(true);

    const appId = process.env.NEXT_PUBLIC_META_APP_ID || process.env.META_APP_ID || '36702477879366478';
    const version = process.env.NEXT_PUBLIC_META_GRAPH_VERSION || 'v20.0';

    const scopes = [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_messages',
      'instagram_manage_comments',
      'pages_show_list',
      'pages_read_engagement',
      'business_management',
    ].join(',');

    const loginSuccessUri = 'https://www.facebook.com/connect/login_success.html';
    const oauthUrl = `https://www.facebook.com/${version}/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      loginSuccessUri
    )}&scope=${scopes}&response_type=code`;

    console.log('[Instagram OAuth Popup Flow]:', oauthUrl);

    const width = 620;
    const height = 740;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      oauthUrl,
      'InstagramBusinessLogin',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      const callbackUri =
        redirectUri ||
        process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI ||
        `${window.location.origin}/instagram/callback`;
      window.location.href = `https://www.facebook.com/${version}/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
        callbackUri
      )}&scope=${scopes}&response_type=code`;
      return;
    }

    const timer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(timer);
          setIsRedirecting(false);
          return;
        }

        const currentUrl = popup.location.href;
        if (currentUrl && currentUrl.includes('login_success.html')) {
          const urlObj = new URL(currentUrl);
          const codeMatch = currentUrl.match(/[?&#]code=([^&]+)/);
          const code = codeMatch ? decodeURIComponent(codeMatch[1]) : urlObj.searchParams.get('code');

          if (code) {
            popup.close();
            clearInterval(timer);
            window.location.href = `/instagram/callback?code=${code}`;
          }
        }
      } catch {
        // Cross-origin restriction expected on login_success.html domain
      }
    }, 500);
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md max-w-xl w-full text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-xl text-white">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Instagram Business</h3>
            <p className="text-xs text-slate-400">Meta Business Login for Instagram</p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
          OAuth 2.0
        </span>
      </div>

      {/* Tech Provider Disclosure */}
      <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
        <p className="text-slate-300 leading-relaxed">
          Connect your Instagram Business account to manage customer direct messages, story replies, and comment automations via Meta&apos;s Graph API.
        </p>

        <div className="pt-2 border-t border-slate-850 flex flex-wrap gap-2 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Requested Permissions:</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-[10px] text-pink-300">instagram_basic</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-[10px] text-pink-300">instagram_manage_messages</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-[10px] text-pink-300">pages_show_list</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-[10px] text-pink-300">business_management</span>
        </div>
      </div>

      {/* Pre-requisite Helper Toggle */}
      <div className="border border-slate-800/80 bg-slate-950/30 rounded-xl overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setShowPreRequisites(!showPreRequisites)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-slate-300 hover:text-white font-medium transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span>📋</span> Pre-requisites for Instagram Business Connection
          </span>
          <span className="text-slate-500">{showPreRequisites ? '▲ Hide' : '▼ View'}</span>
        </button>

        {showPreRequisites && (
          <div className="p-4 pt-0 border-t border-slate-850 space-y-2 text-[11px] text-slate-400">
            <p className="flex items-start gap-2">
              <span className="text-pink-400">✓</span> Your Instagram account must be converted to a <strong>Professional (Business or Creator)</strong> account.
            </p>
            <p className="flex items-start gap-2">
              <span className="text-pink-400">✓</span> Your Instagram account must be connected to a Facebook Business Page you administer.
            </p>
            <p className="flex items-start gap-2">
              <span className="text-pink-400">✓</span> Allow access to messages under Instagram App &gt; Settings &gt; Messages &gt; Connected Tools.
            </p>
          </div>
        )}
      </div>

      {/* Compliance & Policy Notice */}
      <p className="text-[11px] text-slate-400 leading-normal">
        By connecting, you agree to our{' '}
        <Link href="/terms" className="text-pink-400 hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-pink-400 hover:underline">
          Privacy Policy
        </Link>
        . Your page token is stored securely for real-time DM webhook synchronization.
      </p>

      <button
        onClick={handleInstagramLogin}
        disabled={isRedirecting}
        className={`flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs transition-all duration-200 shadow-lg cursor-pointer ${
          isRedirecting
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 text-white shadow-md shadow-pink-500/10'
        } ${className || ''}`}
      >
        {isRedirecting ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Connecting to Meta...
          </>
        ) : (
          'Connect Instagram with Meta (1-Click)'
        )}
      </button>

      {/* Manual Code / URL Paste Box */}
      {showManualInput && (
        <form onSubmit={handleManualSubmit} className="mt-2 p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 animate-fadeIn">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <span>📋</span> Paste Meta Success URL or Code:
            </label>
            <p className="text-[11px] text-slate-400 leading-normal">
              Copy the address bar URL from the Meta popup window and paste it below:
            </p>
          </div>
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste URL or code here (e.g. https://www.facebook.com/connect/login_success.html#code=...)"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={!manualInput.trim()}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Complete Instagram Connection
          </button>
        </form>
      )}
    </div>
  );
}
