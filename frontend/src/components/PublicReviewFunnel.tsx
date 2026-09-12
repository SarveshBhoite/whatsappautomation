"use client";

import React, { useState, useEffect } from "react";
import { Star, Send, CheckCircle2, ShieldCheck, ExternalLink, RefreshCw, AlertCircle, MapPin } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const TEMPLATE_REVIEWS = [
  "Excellent service, prompt response, and very professional team. Highly recommended!",
  "Amazing experience! The staff was extremely friendly and the quality was top-notch.",
  "Very satisfied with the service. Transparent, reliable, and exceeded my expectations!"
];

interface PublicReviewFunnelProps {
  initialOrgId?: string;
}

export default function PublicReviewFunnel({ initialOrgId }: PublicReviewFunnelProps) {
  const routeParams = useParams();
  const searchParams = useSearchParams();

  // Resolve orgId from props, route params (e.g. /review/[orgId]), or search params (?org=... or ?orgId=...)
  const resolvedOrgId = 
    initialOrgId || 
    (routeParams?.orgId as string) || 
    searchParams?.get("org") || 
    searchParams?.get("orgId") || 
    "";

  const accountIdParam = searchParams?.get("accountId") || searchParams?.get("account") || "";

  const [orgId, setOrgId] = useState(resolvedOrgId);
  const [businessName, setBusinessName] = useState("Our Business");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(3);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const [copiedMessage, setCopiedMessage] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (resolvedOrgId) {
      setOrgId(resolvedOrgId);
    }
  }, [resolvedOrgId]);

  useEffect(() => {
    const fetchBusinessConfig = async () => {
      if (!orgId) {
        setLoadingConfig(false);
        return;
      }

      setLoadingConfig(true);
      setConfigError(null);

      try {
        const query = new URLSearchParams({ orgId });
        if (accountIdParam) {
          query.append("accountId", accountIdParam);
        }

        const res = await fetch(`${BACKEND_URL}/api/gmb/config?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const targetConfig = data?.config || data;

          if (targetConfig) {
            const locName = targetConfig.locationName || targetConfig.accountName;
            if (locName) {
              setBusinessName(locName);
            }
            if (targetConfig.autoReplyMinRating) {
              setMinRating(Number(targetConfig.autoReplyMinRating));
            }

            // Build Google Review / Google Maps redirect URL with smart fallbacks
            let reviewLink = targetConfig.googleReviewUrl;
            if (!reviewLink && targetConfig.googlePlaceId) {
              reviewLink = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(targetConfig.googlePlaceId)}`;
            } else if (!reviewLink && locName) {
              reviewLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locName)}`;
            }
            if (reviewLink) {
              setGoogleReviewUrl(reviewLink);
            }
          }
        } else {
          console.warn("Failed to fetch business configuration from server");
        }
      } catch (err: any) {
        console.error("Network error loading business details:", err);
        setConfigError("Unable to load business details. You can still leave your rating below.");
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchBusinessConfig();
  }, [orgId, accountIdParam]);

  const handleTemplateSelect = async (text: string) => {
    setSelectedTemplate(text);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(true);
      setTimeout(() => {
        setCopiedMessage(false);
        const destination = googleReviewUrl || (businessName ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName)}` : "https://www.google.com/maps");
        window.location.href = destination;
      }, 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      const destination = googleReviewUrl || (businessName ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName)}` : "https://www.google.com/maps");
      window.location.href = destination;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    // For negative rating, customer name is required
    if (rating < minRating && !customerName.trim()) {
      alert("Please provide your name so we can address your feedback.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/reviews/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          accountId: accountIdParam || undefined,
          customerName: customerName.trim() || "Google Customer",
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const targetRedirect = data.redirect || (rating >= minRating ? googleReviewUrl : null);
        setRedirectUrl(targetRedirect);
        setSubmitted(true);

        // If customer entered comment and is redirected to Google, copy to clipboard for easy paste
        if (targetRedirect && comment.trim()) {
          try {
            await navigator.clipboard.writeText(comment.trim());
          } catch (clipErr) {
            console.warn("Could not copy review text to clipboard:", clipErr);
          }
        }

        // Automatic redirect for positive review
        if (targetRedirect) {
          setTimeout(() => {
            window.location.href = targetRedirect;
          }, 3200);
        }
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      // Fallback redirect for positive review on network issue
      if (rating >= minRating && googleReviewUrl) {
        window.location.href = googleReviewUrl;
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingSelect = (val: number) => {
    setRating(val);
  };

  const handleGoogleRedirect = () => {
    setSubmitted(true);
    const destination = googleReviewUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName)}`;
    setRedirectUrl(destination);
    window.location.href = destination;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none">
      
      {/* Background radial gradients for sleek aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none z-0" />

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        
        {/* Header with Business Identification */}
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/15 flex items-center justify-center border border-amber-500/30 shadow-lg text-amber-500">
            <Star className="h-7 w-7 fill-amber-500" />
          </div>
          
          <div className="space-y-1 mt-1">
            {loadingConfig ? (
              <div className="flex flex-col items-center gap-2 py-1">
                <div className="h-5 w-40 bg-slate-800 animate-pulse rounded-md" />
                <div className="h-3 w-56 bg-slate-800/60 animate-pulse rounded-md" />
              </div>
            ) : (
              <>
                <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">{businessName}</h1>
                <p className="text-xs text-slate-400">Share your feedback to help us serve you better</p>
              </>
            )}
          </div>
        </div>

        {configError && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{configError}</span>
          </div>
        )}

        {/* Dynamic Content View */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Rating Stars Picker */}
            <div className="flex flex-col items-center gap-2.5">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                How was your experience?
              </label>

              <div className="flex items-center gap-2 py-2">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const ratingValue = idx + 1;
                  const isActive = ratingValue <= (hoverRating || rating);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRatingSelect(ratingValue)}
                      onMouseEnter={() => setHoverRating(ratingValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-all duration-150 hover:scale-125 focus:outline-none cursor-pointer"
                      title={`${ratingValue} Stars`}
                    >
                      <Star 
                        className={`h-10 w-10 transition-colors ${
                          isActive 
                            ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                            : "text-slate-800 stroke-slate-700"
                        }`} 
                      />
                    </button>
                  );
                })}
              </div>

              {rating > 0 && (
                <span className="text-xs bg-slate-850 px-3 py-1 rounded-full text-amber-400 font-bold border border-slate-800">
                  {rating === 1 && "Terrible"}
                  {rating === 2 && "Could be better"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Great Experience!"}
                  {rating === 5 && "Outstanding 5-Star!"}
                </span>
              )}
            </div>

            {/* Positive Flow (Rating >= minRating, default 3 or 4) */}
            {rating >= minRating && (
              <div className="space-y-4 border-t border-slate-800/80 pt-4">
                <div className="text-center">
                  <label className="text-xs text-slate-300 font-bold uppercase tracking-wider block mb-1">
                    Select a quick review suggestion
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Click to copy instantly and share on Google Maps.
                  </p>
                </div>
                
                <div className="space-y-2.5">
                  {TEMPLATE_REVIEWS.map((text, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTemplateSelect(text)}
                      className="w-full text-left bg-slate-950/60 hover:bg-amber-500/10 active:bg-amber-500/20 border border-slate-800 hover:border-amber-500/30 p-3 rounded-2xl transition-all flex items-start gap-2.5 group cursor-pointer text-xs"
                    >
                      <span className="h-5 w-5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0 group-hover:text-amber-400 group-hover:border-amber-500/30">
                        {idx + 1}
                      </span>
                      <p className="text-slate-300 leading-relaxed group-hover:text-slate-100">
                        "{text}"
                      </p>
                    </button>
                  ))}
                </div>

                {copiedMessage && (
                  <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl p-3 text-xs font-semibold text-center animate-pulse">
                    ✓ Review copied to clipboard! Opening Google Maps...
                  </div>
                )}

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Or write your own</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleRedirect}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <MapPin className="h-4 w-4" />
                  Write Custom Review on Google Maps
                </button>
              </div>
            )}

            {/* Negative Flow (Rating < minRating: Buffering feedback privately) */}
            {rating > 0 && rating < minRating && (
              <div className="space-y-4 border-t border-slate-800/80 pt-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-left">
                  <p className="text-xs text-amber-300 font-semibold leading-relaxed">
                    We're truly sorry your experience wasn't ideal. Please share your critique below so our leadership can resolve it immediately.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs text-slate-300 font-semibold">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs text-slate-300 font-semibold">Your Contact Number (Optional)</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="For management follow-up"
                      className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs text-slate-300 font-semibold">What went wrong? *</label>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Please describe your experience so we can improve..."
                      rows={3}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed w-full"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Send className="h-4 w-4 text-amber-500" />
                  {submitting ? "Sending Feedback..." : "Submit Private Feedback"}
                </button>
              </div>
            )}
          </form>
        ) : (
          /* Submission Completed View */
          <div className="flex flex-col items-center text-center py-4 space-y-6">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 stroke-1" />
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-100">Feedback Submitted!</h2>
              {redirectUrl ? (
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto animate-pulse">
                  Thank you for the {rating}-star rating! Redirecting you to Google to publish your review...
                </p>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Thank you, <strong>{customerName}</strong>. Your feedback has been received privately and forwarded directly to our management.
                </p>
              )}
            </div>

            {/* Positive Review Google Action Card */}
            {redirectUrl ? (
              <div className="w-full border border-slate-800 bg-slate-950/50 p-5 rounded-2xl space-y-3 mt-2 shadow-inner">
                <span className="text-[10px] uppercase text-amber-400 font-bold tracking-wider block">
                  Support {businessName} on Google
                </span>
                <p className="text-xs text-slate-400 leading-normal">
                  If you are not redirected automatically, click below to leave your review on Google Maps.
                </p>
                <a
                  href={redirectUrl}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
                >
                  Post Review on Google <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ) : (
              /* Negative Review Shield Card */
              <div className="w-full border border-slate-800 bg-slate-900/40 p-4 rounded-2xl flex items-center gap-3 text-left mt-2">
                <ShieldCheck className="h-8 w-8 text-amber-500 shrink-0 stroke-1" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-slate-200">Management Customer Care</span>
                  <span className="text-[11px] text-slate-400 leading-normal">
                    Your notes have been recorded in our priority queue. A supervisor will review your feedback.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="mt-8 text-center text-[10px] text-slate-600 flex items-center gap-1.5 relative z-10 pointer-events-none">
        <ShieldCheck className="h-3.5 w-3.5 text-amber-500/60" /> Smart Review Shield &amp; Reputation Funnel
      </footer>
    </div>
  );
}
