"use client";

import React, { useState, useEffect } from "react";
import { Star, Send, CheckCircle2, MessageSquare, ShieldCheck, ExternalLink } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_ORG_ID = "demo-org-123";

export default function PublicReviewSubmit() {
  const [orgId, setOrgId] = useState(DEFAULT_ORG_ID);
  const [businessName, setBusinessName] = useState("Our Business");
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string | null>(null);

  // Extract org query parameter in useEffect client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const orgParam = params.get("org") || params.get("orgId");
      if (orgParam) {
        setOrgId(orgParam);
      }
      
      // Fetch GMB config to get the correct business name and redirect link
      const fetchConfig = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/gmb/config?orgId=${orgParam || DEFAULT_ORG_ID}`);
          if (res.ok) {
            const config = await res.json();
            if (config.locationName) {
              setBusinessName(config.locationName);
            }
            if (config.googleReviewUrl) {
              setGoogleReviewUrl(config.googleReviewUrl);
            }
          }
        } catch (err) {
          console.error("Failed to load business config:", err);
        }
      };
      
      fetchConfig();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || rating === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmb/reviews/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerName,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRedirectUrl(data.redirect);
        setSubmitted(true);
        
        // Auto-copy text to clipboard for easy pasting on Google Maps
        if (data.redirect && comment && comment.trim()) {
          try {
            await navigator.clipboard.writeText(comment);
          } catch (clipErr) {
            console.warn("Could not copy review text to clipboard:", clipErr);
          }
        }
        
        // Auto-redirect if it is a positive review and redirect URL is present
        if (data.redirect) {
          setTimeout(() => {
            window.location.href = data.redirect;
          }, 3500); // 3.5 seconds to let them read the clipboard message
        }
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingSelect = (val: number) => {
    setRating(val);
  };

  const handleGoogleRedirect = () => {
    setSubmitted(true);
    setRedirectUrl(googleReviewUrl);
    if (googleReviewUrl) {
      window.location.href = googleReviewUrl;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      
      {/* Background radial gradients for premium feel */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-slate-950 to-slate-950 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-secondary/5 rounded-full filter blur-3xl pointer-events-none z-0" />

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-slideUp">
        
        {/* Header area with clean Star graphic unique to client name */}
        <div className="flex flex-col items-center gap-3 mb-6 text-center animate-fadeIn">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-md">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
          </div>
          
          <div className="space-y-1 mt-1">
            <h1 className="text-lg font-bold text-slate-100">{businessName}</h1>
            <p className="text-xs text-slate-400">Share your thoughts to help us serve you better</p>
          </div>
        </div>

        {/* Dynamic content view */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Rating Stars Picker */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">How was your experience?</label>
              <div className="flex items-center gap-1.5 py-2">
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
                    >
                      <Star 
                        className={`h-9 w-9 transition-colors ${
                          isActive 
                            ? "text-amber-500 fill-amber-500" 
                            : "text-slate-800"
                        }`} 
                      />
                    </button>
                  );
                })}
              </div>
              {rating > 0 && (
                <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded-full text-amber-500 font-bold border border-slate-800/40">
                  {rating === 1 && "Terrible"}
                  {rating === 2 && "Could be better"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Great!"}
                  {rating === 5 && "Excellent!"}
                </span>
              )}
            </div>

            {/* If rating >= 3, show a clean submit button to redirect to Google directly */}
            {rating >= 3 && (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  Thank you for the {rating}-star rating! Click below to share your experience on our Google Business page.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleRedirect}
                  className="w-full bg-primary hover:bg-secondary text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Send className="h-4 w-4" />
                  Post Review on Google
                </button>
              </div>
            )}

            {/* Inputs (Only shown for negative ratings to capture private feedback) */}
            {rating > 0 && rating < 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-semibold">Your Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                      className="bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-semibold">Your Review / Comments</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your experience..."
                      rows={4}
                      className="bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed w-full"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-secondary disabled:opacity-40 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            )}
          </form>
        ) : (
          /* SUCCESS VIEW */
          <div className="flex flex-col items-center text-center py-4 space-y-6 animate-fadeIn">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 stroke-1" />
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-100">Feedback Submitted!</h2>
              {redirectUrl ? (
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto animate-pulse">
                  Thank you for the {rating}-star rating! We are redirecting you to Google to share your experience...
                </p>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Thank you for your valuable feedback, <strong>{customerName}</strong>. Your comments help us maintain the highest standard of service.
                </p>
              )}
            </div>

            {/* Positive review: Google redirection card */}
            {redirectUrl ? (
              <div className="w-full border border-slate-800 bg-slate-950/30 p-5 rounded-2xl space-y-3.5 mt-2 shadow-inner">
                <span className="text-[10px] uppercase text-primary font-bold tracking-wider block">Support us on Google</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  We are redirecting you to our Google Business listing review page so you can share your rating with everyone! If it doesn't open automatically, click below.
                </p>
                <a
                  href={redirectUrl}
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-secondary text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all animate-bounce"
                >
                  Post Review on Google <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ) : (
              /* Negative review: capturing locally only */
              <div className="w-full border border-slate-850 bg-slate-900/20 p-4 rounded-2xl flex items-center gap-3 text-left mt-2">
                <ShieldCheck className="h-8 w-8 text-primary shrink-0 stroke-1" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-slate-200">Management Review Queue</span>
                  <span className="text-[10px] text-slate-500 leading-normal">
                    Your rating has been successfully captured and escalated to our internal service managers for quick review.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer credits */}
      <footer className="mt-8 text-center text-[10px] text-slate-600 flex items-center gap-1 relative z-10 pointer-events-none">
        <ShieldCheck className="h-3.5 w-3.5" /> Protected by reputation filter systems.
      </footer>
    </div>
  );
}
