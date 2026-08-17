'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FacebookSDKLoader from './FacebookSDKLoader';
import { WhatsAppTokenExchangeResponse, WhatsAppEmbeddedSignupData } from '@/types/meta';

interface ConnectWhatsAppButtonProps {
  onSuccess?: (data: WhatsAppTokenExchangeResponse) => void;
  onError?: (error: string) => void;
}

export default function ConnectWhatsAppButton({
  onSuccess,
  onError,
}: ConnectWhatsAppButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [signupResult, setSignupResult] = useState<WhatsAppTokenExchangeResponse | null>(null);
  const [showPreRequisites, setShowPreRequisites] = useState(false);

  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [flowLogs, setFlowLogs] = useState<Array<{ time: string; msg: string; type: 'info' | 'success' | 'warn' | 'error' }>>([]);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    console.log(`[Meta WhatsApp ${type.toUpperCase()}] ${time}: ${msg}`);
    setFlowLogs((prev) => [...prev, { time, msg, type }]);
  };

  useEffect(() => {
    // Official Meta Tech Provider session listener for Embedded Signup v4
    const handleMessage = async (event: MessageEvent) => {
      let payload: any = event.data;

      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }

      if (
        payload &&
        (payload.type === 'WA_EMBEDDED_SIGNUP' ||
          payload.event === 'WA_EMBEDDED_SIGNUP' ||
          payload.type === 'session_info')
      ) {
        const data: WhatsAppEmbeddedSignupData = payload.data || payload;

        addLog(`Received Meta Embedded Signup event: ${data.event || payload.type || 'SDK Callback'}`, 'info');
        console.log('[Meta Tech Provider WhatsApp Embedded Signup Event]:', data);

        // Check for cancellation or error events
        if (data.event === 'CANCEL') {
          setIsLoading(false);
          setStatusMessage('Signup was cancelled. You can retry at any time.');
          addLog('Signup was cancelled by user.', 'warn');
          return;
        }

        if (data.event === 'ERROR') {
          setIsLoading(false);
          setErrorDetails('An error occurred during Meta signup. Please verify your business details and try again.');
          addLog('Meta returned signup error event.', 'error');
          return;
        }

        if (data.code || (data.waba_id && data.phone_number_id)) {
          setStatusMessage('Synchronizing Business Account (WABA) & Registering Phone Number with Meta...');
          setIsLoading(true);
          addLog(`Exchanging Meta authorization code (WABA ID: ${data.waba_id || 'Auto-Discover'})...`, 'info');

          try {
            const response = await fetch('/api/auth/whatsapp/exchange', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                code: data.code,
                waba_id: data.waba_id,
                phone_number_id: data.phone_number_id,
              }),
            });

            const result: WhatsAppTokenExchangeResponse = await response.json();

            if (result.success) {
              setSignupResult(result);
              setStatusMessage('WhatsApp Business connected successfully via Meta Tech Provider!');
              addLog(`WhatsApp Business connected! Discovered ${result.phoneNumbers?.length || 1} phone number(s).`, 'success');
              if (onSuccess) onSuccess(result);
            } else {
              const errMsg = result.error || 'Failed to exchange authorization token with Meta.';
              setErrorDetails(errMsg);
              addLog(`Token exchange failed: ${errMsg}`, 'error');
              if (onError) onError(errMsg);
            }
          } catch (err: any) {
            const errMsg = err.message || 'Network error while contacting backend API.';
            setErrorDetails(errMsg);
            addLog(`Network exception: ${errMsg}`, 'error');
            if (onError) onError(err.message);
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onError]);

  const processCodeExchange = async (code: string) => {
    setIsLoading(true);
    setStatusMessage('Exchanging authorization code with Meta Graph API...');
    setErrorDetails(null);
    addLog('Exchanging pasted/received authorization code with Meta Graph API...', 'info');

    try {
      const response = await fetch('/api/auth/whatsapp/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const result: WhatsAppTokenExchangeResponse = await response.json();

      if (result.success) {
        setSignupResult(result);
        setStatusMessage('WhatsApp Business connected successfully!');
        addLog(`Connected successfully! Discovered WABA ID: ${result.wabaId || 'Synced'}`, 'success');
        if (onSuccess) onSuccess(result);
      } else {
        const errMsg = result.error || 'Failed to exchange code';
        setErrorDetails(errMsg);
        addLog(`Exchange error: ${errMsg}`, 'error');
        if (onError) onError(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Failed to connect';
      setErrorDetails(errMsg);
      addLog(`Network error: ${errMsg}`, 'error');
      if (onError) onError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };



  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    let extractedCode = manualInput.trim();
    // If user pasted full URL (e.g. https://www.facebook.com/connect/login_success.html#code=AQD...)
    const match = extractedCode.match(/[?&#]code=([^&]+)/);
    if (match) {
      extractedCode = decodeURIComponent(match[1]);
    }

    processCodeExchange(extractedCode);
  };

  const handleConnectWhatsApp = () => {
    console.log('[Meta Button Clicked]: User triggered WhatsApp connection flow.');
    setErrorDetails(null);
    setStatusMessage(null);

    const appId = process.env.NEXT_PUBLIC_META_APP_ID || process.env.META_APP_ID || '36702477879366478';
    const configId = process.env.NEXT_PUBLIC_WHATSAPP_CONFIG_ID;
    const version = process.env.NEXT_PUBLIC_META_GRAPH_VERSION || 'v20.0';
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

    setIsLoading(true);
    setStatusMessage('Launching Meta WhatsApp Embedded Signup...');
    setShowManualInput(true);

    const openDirectOAuthFlow = () => {
      const loginSuccessUri = 'https://www.facebook.com/connect/login_success.html';
      const targetRedirect = encodeURIComponent(loginSuccessUri);

      let oauthUrl = `https://www.facebook.com/${version}/dialog/oauth?client_id=${appId}&response_type=code&redirect_uri=${targetRedirect}`;

      if (configId && configId !== 'your_whatsapp_config_id_here') {
        oauthUrl += `&config_id=${configId}`;
      } else {
        const scopes = 'whatsapp_business_management,whatsapp_business_messaging,business_management';
        oauthUrl += `&scope=${scopes}`;
      }

      console.log('[Meta Tech Provider Direct Flow]:', oauthUrl);

      const width = 620;
      const height = 740;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        oauthUrl,
        'WhatsAppEmbeddedSignup',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.location.href = oauthUrl;
        return;
      }

      const timer = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(timer);
            setIsLoading(false);
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
              processCodeExchange(code);
            }
          }
        } catch {
          // Cross-origin restriction expected on login_success.html domain
        }
      }, 500);
    };

    if (!isHttps || !window.FB) {
      openDirectOAuthFlow();
      return;
    }

    // Official Meta Tech Provider Embedded Signup v4 Options
    const loginOptions: any = {
      scope: 'whatsapp_business_management, whatsapp_business_messaging, business_management',
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        feature: 'whatsapp_embedded_signup',
        version: 2,
        sessionInfoVersion: 2,
        setup: {},
      },
    };

    if (configId && configId !== 'your_whatsapp_config_id_here') {
      loginOptions.config_id = configId;
    }

    try {
      window.FB.login((response) => {
        if (response.authResponse?.code) {
          processCodeExchange(response.authResponse.code);
        } else {
          setIsLoading(false);
          setStatusMessage('Complete signup in popup or paste URL below if needed.');
        }
      }, loginOptions);
    } catch {
      openDirectOAuthFlow();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md max-w-xl w-full text-slate-100 font-sans">
      <FacebookSDKLoader onLoaded={() => setSdkReady(true)} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">WhatsApp Business</h3>
            <p className="text-xs text-slate-400">Meta Embedded Signup v4 (Official Tech Provider)</p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Tech Provider (OBO)
        </span>
      </div>

      {/* Tech Provider Disclosure */}
      <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
        <p className="text-slate-300 leading-relaxed">
          <strong className="text-emerald-400">JISNU CRM</strong> is an authorized Meta Tech Provider. Connect your WhatsApp Business Account (WABA) to automate conversations, manage templates, and receive delivery webhooks on your behalf.
        </p>

        <div className="pt-2 border-t border-slate-850 flex flex-wrap gap-2 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Requested Permissions:</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-[10px] text-emerald-300">whatsapp_business_messaging</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-[10px] text-emerald-300">whatsapp_business_management</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-[10px] text-emerald-300">business_management</span>
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
            <span>📋</span> Pre-requisites for Meta App Review & Signup
          </span>
          <span className="text-slate-500">{showPreRequisites ? '▲ Hide' : '▼ View'}</span>
        </button>

        {showPreRequisites && (
          <div className="p-4 pt-0 border-t border-slate-850 space-y-2 text-[11px] text-slate-400">
            <p className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span> A valid Meta Business Manager account with Admin access.
            </p>
            <p className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span> A phone number capable of receiving SMS/Voice verification (not linked to consumer WhatsApp).
            </p>
            <p className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span> Business details matching your official registration documents.
            </p>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-medium animate-pulse flex items-center gap-2">
          <span>ℹ️</span> {statusMessage}
        </div>
      )}

      {errorDetails && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-medium flex items-center gap-2">
          <span>❌</span> {errorDetails}
        </div>
      )}

      {signupResult && signupResult.success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1.5">
          <p className="font-semibold text-sm flex items-center gap-1.5">
            <span>✅</span> WhatsApp Business Account Connected Successfully!
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
            <div><span className="text-slate-400">WABA ID:</span> {signupResult.wabaId || 'Connected'}</div>
            <div><span className="text-slate-400">Phone ID:</span> {signupResult.phoneNumberId || 'Connected'}</div>
            <div><span className="text-slate-400">Quality:</span> <span className="text-emerald-400 font-bold">{signupResult.qualityRating || 'UNKNOWN'}</span></div>
            <div><span className="text-slate-400">Status:</span> <span className="text-emerald-400 font-bold">{signupResult.codeVerificationStatus || 'UNKNOWN'}</span></div>
          </div>
        </div>
      )}

      {/* Live Progress Log Panel */}
      {flowLogs.length > 0 && (
        <div className="p-3.5 bg-slate-950/90 border border-slate-800/90 rounded-xl space-y-2 font-mono text-[11px] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Meta Connection Logs ({flowLogs.length})
            </span>
            <button
              type="button"
              onClick={() => setFlowLogs([])}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Clear Logs
            </button>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-[10.5px]">
            {flowLogs.map((log, idx) => (
              <div key={idx} className={`flex items-start gap-2 ${
                log.type === 'error' ? 'text-rose-400 font-semibold' :
                log.type === 'success' ? 'text-emerald-400 font-semibold' :
                log.type === 'warn' ? 'text-amber-400' : 'text-slate-300'
              }`}>
                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                <span className="break-all">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance & Policy Notice */}
      <p className="text-[11px] text-slate-400 leading-normal">
        By connecting, you agree to our{' '}
        <Link href="/terms" className="text-emerald-400 hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-emerald-400 hover:underline">
          Privacy Policy
        </Link>
        . Your access token is stored securely for automated webhook handling and CRM messaging.
      </p>

      {/* Connect Action Button */}
      <button
        onClick={handleConnectWhatsApp}
        disabled={isLoading}
        className={`flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs transition-all duration-200 shadow-lg cursor-pointer ${
          isLoading
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Connecting to Meta...
          </>
        ) : (
          'Connect WhatsApp with Meta (1-Click)'
        )}
      </button>

      {/* Manual Code / URL Paste Box (if popup opens Meta Success page) */}
      {showManualInput && (
        <form onSubmit={handleManualSubmit} className="mt-2 p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 animate-fadeIn">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <span>📋</span> Paste Meta Success URL or Authorization Code:
            </label>
            <p className="text-[11px] text-slate-400 leading-normal">
              If Meta popup displays &quot;Success&quot; with a URL bar, copy the URL and paste it below:
            </p>
          </div>
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste URL or code here (e.g. https://www.facebook.com/connect/login_success.html#code=...)"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!manualInput.trim() || isLoading}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Complete WhatsApp Connection
          </button>
        </form>
      )}
    </div>
  );
}
