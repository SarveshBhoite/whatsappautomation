"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Package,
  CheckCircle2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Search,
  Tag,
  Store,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Sparkles
} from "lucide-react";

interface MerchantProductItem {
  id: string;
  title: string;
  description?: string;
  link?: string;
  imageLink?: string;
  price?: string | { value?: string; currency?: string };
  availability?: string;
  brand?: string;
  channel?: string;
  condition?: string;
  googleProductCategory?: string;
}

function MerchantProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "";
  const merchantId = searchParams.get("merchantId") || "";
  const storeName = searchParams.get("storeName") || "Connected Google Merchant Store";

  const [orgId, setOrgId] = useState<string>("");
  const [products, setProducts] = useState<MerchantProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOrg = localStorage.getItem("organization_id") || "";
      setOrgId(storedOrg);
    }
  }, []);

  const fetchProducts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    try {
      const storedOrg = typeof window !== "undefined" ? localStorage.getItem("organization_id") || "" : "";
      const res = await fetch(
        `${BACKEND}/api/ads/merchant-products?orgId=${encodeURIComponent(storedOrg)}&customerId=${encodeURIComponent(customerId)}&merchantId=${encodeURIComponent(merchantId)}`,
        {
          headers: {
            "x-organization-id": storedOrg,
            "x-customer-id": customerId
          }
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load products from Google Merchant Center");
      }
      setProducts(data.products || []);
    } catch (err: any) {
      console.error("Fetch merchant products error:", err);
      setError(err.message || "Unable to retrieve products. Please verify Merchant Center connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchProducts();
    }
  }, [customerId, merchantId]);

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 lg:px-8 py-3 shadow-xs">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => router.push(`/ads/profile?customerId=${customerId}&tab=merchant_apps`)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95"
              title="Return to Profile"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Profile</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                  Google Merchant Center Products
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 block truncate">
                  {merchantId ? `Merchant ID: ${merchantId}` : `CID: ${customerId}`} • {storeName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchProducts(true)}
              disabled={refreshing || loading}
              className="px-3 sm:px-3.5 py-1.5 rounded-xl border border-emerald-300 hover:border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden xs:inline">{refreshing ? "Refreshing..." : "Refresh Feed"}</span>
            </button>

            <a
              href="https://merchants.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
            >
              <span>Console</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-blue-500/10 border border-emerald-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Live Feed Synced</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {products.length} Products Found
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {storeName}
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              These products are actively synchronized with your Google Merchant Center account and available for Google Shopping &amp; Performance Max ad campaigns.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:self-center shrink-0">
            <button
              onClick={() => router.push(`/ads/campaigns/create?customerId=${customerId}`)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Shopping Campaign</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title, ID, or brand..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold text-right">
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of {products.length} products
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-600">Retrieving Merchant Center product catalog…</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-rose-900">Product Fetch Notice</h3>
            <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => fetchProducts(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 rounded-3xl bg-white border border-slate-200 text-center p-6 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Products Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery ? "No products match your search query." : "No product items were returned for this Google Merchant Center feed. You can add products via Merchant Center or your store feed."}
            </p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const priceText = typeof p.price === "string" ? p.price : (p.price?.value ? `${p.price.currency || "INR"} ${p.price.value}` : "Price On Request");
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2.5">
                    {/* Image / Thumbnail placeholder */}
                    <div className="h-32 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden relative">
                      {p.imageLink ? (
                        <img
                          src={p.imageLink}
                          alt={p.title}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-slate-300" />
                      )}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/90 text-emerald-800 border border-emerald-200 shadow-2xs">
                        {p.availability || "In Stock"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>ID: {p.id}</span>
                        {p.brand && <span className="font-semibold text-slate-600">{p.brand}</span>}
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors" title={p.title}>
                        {p.title}
                      </h3>

                      {p.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-emerald-700 font-mono">
                      {priceText}
                    </span>

                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                        title="View Live Product Page"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MerchantProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
          Loading Merchant Products...
        </div>
      }
    >
      <MerchantProductsContent />
    </Suspense>
  );
}
