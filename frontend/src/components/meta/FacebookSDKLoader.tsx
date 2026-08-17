'use client';

import { useEffect, useState } from 'react';

interface FacebookSDKLoaderProps {
  onLoaded?: () => void;
}

export default function FacebookSDKLoader({ onLoaded }: FacebookSDKLoaderProps) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If window.FB is already initialized, notify callback
    if (window.FB) {
      setIsLoaded(true);
      if (onLoaded) onLoaded();
      return;
    }

    const appId = process.env.NEXT_PUBLIC_META_APP_ID || process.env.META_APP_ID || '36702477879366478';
    const version = process.env.NEXT_PUBLIC_META_GRAPH_VERSION || 'v20.0';

    if (!appId || appId.includes('your_meta_app_id')) {
      setError('NEXT_PUBLIC_META_APP_ID is not configured in environment variables.');
    } else {
      setError(null);
    }

    // Define fbAsyncInit callback before loading SDK script
    window.fbAsyncInit = function () {
      if (window.FB && appId) {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: version,
        });
        setIsLoaded(true);
        if (onLoaded) onLoaded();
      }
    };

    // Load SDK script asynchronously if not already injected
    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.async = true;
      js.defer = true;
      js.onerror = () => {
        setError('Failed to load Facebook JS SDK script from CDN.');
      };
      document.head.appendChild(js);
    }
  }, [onLoaded]);

  if (error) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono">
        ⚠️ Facebook SDK Warning: {error}
      </div>
    );
  }

  return null;
}
