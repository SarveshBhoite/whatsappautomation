"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Layers,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  FolderTree,
  Tag,
  DollarSign,
  Info,
  ShieldAlert,
  Sliders,
  Check,
  Package,
  Image as ImageIcon
} from "lucide-react";

interface GoogleAdsShoppingSectionProps {
  customerId: string;
  orgId: string;
}

interface ProductIssue {
  code: string;
  severity: "DISAPPROVED" | "WARNING" | "INFO" | string;
  resolution: string;
  attributeName: string;
  description: string;
  detail: string;
  documentation?: string;
  applicableCountries?: string[];
}

interface ProductDiagnosticItem {
  productId: string;
  title: string;
  link: string;
  imageLink?: string;
  additionalImageLinks?: string[];
  description?: string;
  brand?: string;
  availability?: string;
  condition?: string;
  channel?: string;
  googleProductCategory?: string;
  price?: string;
  salePrice?: string;
  status: "APPROVED" | "DISAPPROVED" | "PENDING" | string;
  destinations: Array<{
    destination: string;
    status: string;
    approvedCountries: string[];
    pendingCountries: string[];
    disapprovedCountries: string[];
  }>;
  issues: ProductIssue[];
  issueCount: number;
  lastUpdateDate: string;
  creationDate: string;
  merchantId: string;
}

interface ListingGroupNode {
  id: string;
  resourceName: string;
  campaignType: "SHOPPING" | "PERFORMANCE_MAX" | string;
  campaignId: string;
  campaignName: string;
  groupScopeId: string;
  groupScopeName: string;
  scopeType: "AD_GROUP" | "ASSET_GROUP";
  type: string; // SUBDIVISION or UNIT or UNIT_INCLUDED or UNIT_EXCLUDED
  isSubdivision: boolean;
  isExcluded: boolean;
  status: string;
  parentId: string | null;
  parentResourceName: string | null;
  dimension: string;
  value: string;
  cpcBidMicros?: number | null;
  children?: ListingGroupNode[];
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export function GoogleAdsShoppingSection({ customerId, orgId }: GoogleAdsShoppingSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<"products" | "diagnostics" | "listing-groups">("products");

  // Diagnostics State
  const [diagnosticsItems, setDiagnosticsItems] = useState<ProductDiagnosticItem[]>([]);
  const [diagnosticsSummary, setDiagnosticsSummary] = useState<{
    totalProducts: number;
    approved: number;
    disapproved: number;
    expiring: number;
    pending: number;
  }>({ totalProducts: 0, approved: 0, disapproved: 0, expiring: 0, pending: 0 });
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagError, setDiagError] = useState<string | null>(null);
  const [diagNotice, setDiagNotice] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDiagnosticItem | null>(null);

  // Diagnostics Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [productSearch, setProductSearch] = useState<string>("");

  // Listing Groups State
  const [listingNodes, setListingNodes] = useState<ListingGroupNode[]>([]);
  const [listingHierarchy, setListingHierarchy] = useState<ListingGroupNode[]>([]);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingError, setListingError] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [campaignsList, setCampaignsList] = useState<Array<{ id: string; name: string }>>([]);
  const [adGroupsList, setAdGroupsList] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedAdGroupId, setSelectedAdGroupId] = useState<string>("");

  // Create Listing Group Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createAdGroupId, setCreateAdGroupId] = useState("");
  const [createDimension, setCreateDimension] = useState<"BRAND" | "ITEM_ID" | "PRODUCT_TYPE">("BRAND");
  const [createValue, setCreateValue] = useState("");
  const [createIsExcluded, setCreateIsExcluded] = useState(false);
  const [createCpcBid, setCreateCpcBid] = useState("");
  const [creatingListing, setCreatingListing] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete Listing Group Confirmation
  const [nodeToDelete, setNodeToDelete] = useState<ListingGroupNode | null>(null);
  const [deletingListing, setDeletingListing] = useState(false);

  // Feedback Toast / Banner
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Load Campaigns
  const loadCampaigns = useCallback(async () => {
    if (!customerId) return;
    try {
      const res = await fetch(`${BACKEND}/api/ads/campaigns?customerId=${encodeURIComponent(customerId)}`, {
        headers: { "x-organization-id": orgId },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data.map((c: any) => ({ id: String(c.id), name: c.name }))
          : data?.campaigns?.map((c: any) => ({ id: String(c.id), name: c.name })) || [];
        setCampaignsList(list);
      }
    } catch {
      // Fallback
    }
  }, [customerId, orgId]);

  // Load Ad Groups
  const loadAdGroups = useCallback(async () => {
    if (!customerId) return;
    try {
      const res = await fetch(`${BACKEND}/api/ads/ad-groups?customerId=${encodeURIComponent(customerId)}`, {
        headers: { "x-organization-id": orgId },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data.map((ag: any) => ({ id: String(ag.id), name: ag.name }))
          : [];
        setAdGroupsList(list);
      }
    } catch {
      // Fallback
    }
  }, [customerId, orgId]);

  useEffect(() => {
    loadCampaigns();
    loadAdGroups();
  }, [loadCampaigns, loadAdGroups]);

  // Fetch Product Diagnostics (Merchant Center)
  const fetchDiagnostics = useCallback(async () => {
    if (!customerId) return;
    setDiagLoading(true);
    setDiagError(null);
    setDiagNotice(null);

    try {
      const params = new URLSearchParams({ customerId });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (severityFilter !== "ALL") params.append("severity", severityFilter);
      if (countryFilter.trim()) params.append("country", countryFilter.trim());

      const res = await fetch(`${BACKEND}/api/ads/shopping/product-diagnostics?${params.toString()}`, {
        headers: { "x-organization-id": orgId },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load product diagnostics");
      }

      setDiagnosticsItems(data.items || []);
      if (data.summary) setDiagnosticsSummary(data.summary);
      if (data.notice) setDiagNotice(data.notice);
    } catch (err: any) {
      setDiagError(err.message || "Failed to retrieve Product Diagnostics");
    } finally {
      setDiagLoading(false);
    }
  }, [customerId, orgId, statusFilter, severityFilter, countryFilter]);

  // Fetch Listing Groups
  const fetchListingGroups = useCallback(async () => {
    if (!customerId) return;
    setListingLoading(true);
    setListingError(null);

    try {
      const params = new URLSearchParams({ customerId });
      if (selectedCampaignId) params.append("campaignId", selectedCampaignId);
      if (selectedAdGroupId) params.append("adGroupId", selectedAdGroupId);

      const res = await fetch(`${BACKEND}/api/ads/shopping/listing-groups?${params.toString()}`, {
        headers: { "x-organization-id": orgId },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load listing groups");
      }

      setListingNodes(data.nodes || []);
      setListingHierarchy(data.hierarchy || []);
    } catch (err: any) {
      setListingError(err.message || "Failed to retrieve Listing Groups");
    } finally {
      setListingLoading(false);
    }
  }, [customerId, orgId, selectedCampaignId, selectedAdGroupId]);

  // Trigger loads based on active subtab
  useEffect(() => {
    if (activeSubTab === "diagnostics" || activeSubTab === "products") {
      fetchDiagnostics();
    } else {
      fetchListingGroups();
    }
  }, [activeSubTab, fetchDiagnostics, fetchListingGroups]);

  // Handle Create Listing Group
  const handleCreateListingGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createAdGroupId) {
      setCreateError("Please select a target Shopping Ad Group.");
      return;
    }
    if (!createValue.trim()) {
      setCreateError("Please provide a dimension value (e.g. Nike, SKU-123).");
      return;
    }

    setCreatingListing(true);
    setCreateError(null);

    try {
      const bidMicros = createCpcBid && !createIsExcluded
        ? Math.round(parseFloat(createCpcBid) * 1_000_000)
        : undefined;

      const res = await fetch(`${BACKEND}/api/ads/shopping/listing-groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId,
        },
        body: JSON.stringify({
          customerId,
          adGroupId: createAdGroupId,
          type: "UNIT",
          isExcluded: createIsExcluded,
          dimension: createDimension,
          value: createValue.trim(),
          cpcBidMicros: bidMicros,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create listing group unit.");
      }

      setActionSuccess(`Listing group unit "${createValue}" created successfully.`);
      setShowCreateModal(false);
      setCreateValue("");
      setCreateCpcBid("");
      fetchListingGroups();
    } catch (err: any) {
      setCreateError(err.message || "Mutation failed");
    } finally {
      setCreatingListing(false);
    }
  };

  // Handle Delete Listing Group
  const handleDeleteListingGroup = async () => {
    if (!nodeToDelete) return;

    if (nodeToDelete.campaignType === "PERFORMANCE_MAX") {
      alert("Performance Max listing group filters must be adjusted within the Asset Group configuration.");
      setNodeToDelete(null);
      return;
    }

    setDeletingListing(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/shopping/listing-groups`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId,
        },
        body: JSON.stringify({
          customerId,
          criterionResourceName: nodeToDelete.resourceName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove listing group.");
      }

      setActionSuccess(`Listing group criterion removed successfully.`);
      setNodeToDelete(null);
      fetchListingGroups();
    } catch (err: any) {
      alert(`Removal failed: ${err.message}`);
    } finally {
      setDeletingListing(false);
    }
  };

  // Filter diagnostics by search term
  const filteredDiagnostics = diagnosticsItems.filter((item) => {
    if (!productSearch.trim()) return true;
    const term = productSearch.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.productId.toLowerCase().includes(term) ||
      item.issues.some((iss) => iss.description.toLowerCase().includes(term) || iss.detail.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("products")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "products"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Package className="h-4 w-4" />
            Merchant Products Catalog
          </button>
          <button
            onClick={() => setActiveSubTab("diagnostics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "diagnostics"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Product Diagnostics & Policy
          </button>
          <button
            onClick={() => setActiveSubTab("listing-groups")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "listing-groups"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <FolderTree className="h-4 w-4" />
            Listing Groups & Partitions
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Account: {customerId || "None"}
          </span>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <span className="font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 0. MERCHANT PRODUCTS CATALOG SUB-TAB */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "products" && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <p className="text-xs font-semibold text-slate-500">Live Merchant Products</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{diagnosticsSummary.totalProducts}</p>
              <p className="text-[11px] text-slate-400 mt-1">Fetched via Content API</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 shadow-2xs">
              <p className="text-xs font-semibold text-emerald-700">Eligible For Shopping</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">{diagnosticsSummary.approved}</p>
              <p className="text-[11px] text-emerald-600 mt-1">Ready for Shopping & PMax</p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 shadow-2xs">
              <p className="text-xs font-semibold text-rose-700">Needs Attention</p>
              <p className="text-2xl font-bold text-rose-800 mt-1">{diagnosticsSummary.disapproved}</p>
              <p className="text-[11px] text-rose-600 mt-1">Disapproved or policy issue</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 shadow-2xs">
              <p className="text-xs font-semibold text-amber-700">Pending Review</p>
              <p className="text-2xl font-bold text-amber-800 mt-1">{diagnosticsSummary.pending}</p>
              <p className="text-[11px] text-amber-600 mt-1">Google review in progress</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DISAPPROVED">Disapproved</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              {/* Product Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search live products by title, SKU, brand..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={fetchDiagnostics}
              disabled={diagLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${diagLoading ? "animate-spin" : ""}`} />
              Refresh Feed
            </button>
          </div>

          {/* Notice Alert */}
          {diagNotice && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-bold">Merchant Center Feed Status</p>
                <p className="mt-1">{diagNotice}</p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {diagError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <p className="font-bold">Feed Fetch Error</p>
                <p className="mt-1">{diagError}</p>
              </div>
            </div>
          )}

          {/* Product Cards Grid */}
          {diagLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-xs font-medium text-slate-500">Loading live product feed from Google Merchant Center...</p>
            </div>
          ) : filteredDiagnostics.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center px-8 bg-white rounded-2xl border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Package className="h-7 w-7 text-blue-600" />
              </div>
              <p className="text-slate-900 font-bold text-sm">No live products found</p>
              <p className="text-slate-500 text-xs max-w-sm">
                No merchant products returned. Make sure your Google Merchant Center is linked to this Google Ads customer account.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDiagnostics.map((prod, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedProduct(prod)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Image & Status Badge */}
                    <div className="relative w-full h-44 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden mb-3">
                      {prod.imageLink ? (
                        <img
                          src={prod.imageLink}
                          alt={prod.title}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-slate-300" />
                      )}
                      <span
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs ${
                          prod.status === "APPROVED"
                            ? "text-emerald-700 bg-white/90 border-emerald-300"
                            : prod.status === "DISAPPROVED"
                            ? "text-rose-700 bg-white/90 border-rose-300"
                            : "text-amber-700 bg-white/90 border-amber-300"
                        }`}
                      >
                        {prod.status}
                      </span>
                    </div>

                    {/* Brand & Category */}
                    <div className="flex items-center gap-1.5 mb-1">
                      {prod.brand && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          {prod.brand}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono truncate">
                        {prod.productId}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors" title={prod.title}>
                      {prod.title}
                    </h4>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-2">
                    <div>
                      {prod.price ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-slate-900">{prod.price}</span>
                          {prod.salePrice && (
                            <span className="text-[10px] text-emerald-600 font-semibold line-through">
                              {prod.salePrice}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Price on store</span>
                      )}
                      {prod.availability && (
                        <p className={`text-[9px] font-semibold ${
                          prod.availability.toLowerCase().includes("in") ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {prod.availability}
                        </p>
                      )}
                    </div>

                    <span className="text-xs text-blue-600 font-bold inline-flex items-center gap-0.5 group-hover:underline">
                      Inspect <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. PRODUCT DIAGNOSTICS & ISSUES SUB-TAB */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "diagnostics" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <p className="text-xs font-semibold text-slate-500">Total Products Synced</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{diagnosticsSummary.totalProducts}</p>
              <p className="text-[11px] text-slate-400 mt-1">From Merchant Center</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 shadow-2xs">
              <p className="text-xs font-semibold text-emerald-700">Approved Products</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">{diagnosticsSummary.approved}</p>
              <p className="text-[11px] text-emerald-600 mt-1">Ready to serve in Shopping ads</p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 shadow-2xs">
              <p className="text-xs font-semibold text-rose-700">Disapproved Products</p>
              <p className="text-2xl font-bold text-rose-800 mt-1">{diagnosticsSummary.disapproved}</p>
              <p className="text-[11px] text-rose-600 mt-1">Policy or data violations</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 shadow-2xs">
              <p className="text-xs font-semibold text-amber-700">Pending Review</p>
              <p className="text-2xl font-bold text-amber-800 mt-1">{diagnosticsSummary.pending}</p>
              <p className="text-[11px] text-amber-600 mt-1">Under automated review</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="DISAPPROVED">Disapproved</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="DISAPPROVED">Disapproved</option>
                <option value="WARNING">Warnings</option>
                <option value="INFO">Informational</option>
              </select>
            </div>

            {/* Country Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Country:</span>
              <input
                type="text"
                placeholder="e.g. IN, US"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Product Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, SKU, or issue description..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={fetchDiagnostics}
              disabled={diagLoading}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 cursor-pointer"
              title="Refresh Diagnostics"
            >
              <RefreshCw className={`h-4 w-4 ${diagLoading ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>

          {/* Notice Alert */}
          {diagNotice && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-bold">Merchant Center Link Notice</p>
                <p className="mt-1">{diagNotice}</p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {diagError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <p className="font-bold">Diagnostics Query Error</p>
                <p className="mt-1">{diagError}</p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-blue-600" />
                  Product Diagnostics & Issues
                  <span className="text-slate-500 font-normal">({filteredDiagnostics.length} items)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time product eligibility and policy compliance reported by Google Merchant Center Content API.
                </p>
              </div>
            </div>

            {diagLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-xs font-medium text-slate-500">Retrieving product statuses from Merchant Center...</p>
              </div>
            ) : filteredDiagnostics.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-center px-8 bg-slate-50/50">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <ShoppingBag className="h-7 w-7 text-blue-600" />
                </div>
                <p className="text-slate-900 font-bold text-sm">No Product Diagnostics found</p>
                <p className="text-slate-500 text-xs max-w-sm">
                  No products or issues returned for the selected filters. Verify your Merchant Center account has products synced and approved.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="p-4">Product / Title</th>
                      <th className="p-4">Price / Availability</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Issues Detected</th>
                      <th className="p-4">Destinations</th>
                      <th className="p-4">Last Updated</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredDiagnostics.map((prod, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setSelectedProduct(prod)}
                        className="hover:bg-blue-50/50 transition-all cursor-pointer group"
                      >
                        <td className="p-4 max-w-sm">
                          <div className="flex items-center gap-3">
                            {prod.imageLink ? (
                              <img
                                src={prod.imageLink}
                                alt={prod.title}
                                className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-xs" title={prod.title}>
                                {prod.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-400 font-mono truncate">
                                  ID: {prod.productId}
                                </span>
                                {prod.brand && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                                    {prod.brand}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {prod.price && (
                              <div className="flex items-center gap-1 font-bold text-slate-900">
                                <span>{prod.price}</span>
                                {prod.salePrice && (
                                  <span className="text-[10px] text-emerald-600 font-semibold line-through">
                                    {prod.salePrice}
                                  </span>
                                )}
                              </div>
                            )}
                            {prod.availability && (
                              <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                prod.availability.toLowerCase().includes("in") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                              }`}>
                                {prod.availability}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              prod.status === "APPROVED"
                                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                : prod.status === "DISAPPROVED"
                                ? "text-rose-700 bg-rose-50 border-rose-200"
                                : "text-amber-700 bg-amber-50 border-amber-200"
                            }`}
                          >
                            {prod.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {prod.issues.length === 0 ? (
                            <span className="text-emerald-600 flex items-center gap-1 font-medium">
                              <Check className="h-3.5 w-3.5" /> No issues
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {prod.issues.slice(0, 2).map((iss, iIdx) => (
                                <span
                                  key={iIdx}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    iss.severity === "DISAPPROVED"
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  <AlertTriangle className="h-3 w-3 shrink-0" />
                                  <span className="truncate max-w-[200px]">{iss.description}</span>
                                </span>
                              ))}
                              {prod.issues.length > 2 && (
                                <span className="text-[10px] text-slate-400">
                                  +{prod.issues.length - 2} more issues
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {prod.destinations.map((d, dIdx) => (
                              <span
                                key={dIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                              >
                                {d.destination} ({d.status})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 font-mono text-[11px]">
                          {prod.lastUpdateDate ? prod.lastUpdateDate.split("T")[0] : "—"}
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 group-hover:underline">
                            Inspect <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. LISTING GROUPS & PRODUCT PARTITIONS SUB-TAB */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "listing-groups" && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Campaign Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600">Campaign:</span>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
                >
                  <option value="">All Shopping / PMax Campaigns</option>
                  {campaignsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ad Group Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600">Ad Group:</span>
                <select
                  value={selectedAdGroupId}
                  onChange={(e) => setSelectedAdGroupId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
                >
                  <option value="">All Ad Groups</option>
                  {adGroupsList.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchListingGroups}
                disabled={listingLoading}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 cursor-pointer"
                title="Refresh Listing Groups"
              >
                <RefreshCw className={`h-4 w-4 ${listingLoading ? "animate-spin text-blue-600" : ""}`} />
              </button>
            </div>

            {/* Create Listing Group Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Product Partition Unit
            </button>
          </div>

          {/* Listing Groups Tree / Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-blue-600" />
                  Product Partitions & Listing Group Hierarchy
                  <span className="text-slate-500 font-normal">({listingNodes.length} partitions)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hierarchical product segmentation tree for Standard Shopping ad groups and Performance Max retail asset groups.
                </p>
              </div>
            </div>

            {listingLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-xs font-medium text-slate-500">Querying Google Ads API v24 for listing groups...</p>
              </div>
            ) : listingNodes.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-center px-8 bg-slate-50/50">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <FolderTree className="h-7 w-7 text-blue-600" />
                </div>
                <p className="text-slate-900 font-bold text-sm">No Listing Groups Configured</p>
                <p className="text-slate-500 text-xs max-w-sm">
                  No product partition criteria found in this account. Use &quot;Add Product Partition Unit&quot; to partition your products by Brand, Item ID, or Product Type.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="p-4">Partition Node / Value</th>
                      <th className="p-4">Dimension</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Status / Target</th>
                      <th className="p-4">Max CPC</th>
                      <th className="p-4">Campaign & Scope</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {listingNodes.map((node, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-all">
                        <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span>{node.value || "All Products"}</span>
                          {node.parentId && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              (sub of #{node.parentId})
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-600 font-medium">
                          {node.dimension}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              node.isSubdivision
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {node.isSubdivision ? "SUBDIVISION" : "UNIT"}
                          </span>
                        </td>
                        <td className="p-4">
                          {node.isExcluded ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              Excluded
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Included ({node.status})
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-700 font-mono">
                          {node.cpcBidMicros ? `₹${(node.cpcBidMicros / 1_000_000).toFixed(2)}` : "—"}
                        </td>
                        <td className="p-4 max-w-xs text-slate-600">
                          <p className="font-semibold truncate">{node.campaignName || "Campaign"}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {node.groupScopeName} ({node.campaignType})
                          </p>
                        </td>
                        <td className="p-4 text-right">
                          {node.campaignType === "SHOPPING" ? (
                            <button
                              onClick={() => setNodeToDelete(node)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Remove Partition Criterion"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">
                              Managed in PMax
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PRODUCT DIAGNOSTICS DETAIL MODAL (READ-ONLY) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 truncate max-w-md">
                    {selectedProduct.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Offer ID: {selectedProduct.productId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Product Hero / Image & Attributes */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start gap-4">
                {selectedProduct.imageLink ? (
                  <div className="shrink-0 space-y-2">
                    <img
                      src={selectedProduct.imageLink}
                      alt={selectedProduct.title}
                      className="w-28 h-28 object-contain rounded-xl border border-slate-200 bg-white p-1"
                    />
                    {selectedProduct.additionalImageLinks && selectedProduct.additionalImageLinks.length > 0 && (
                      <div className="flex gap-1 overflow-x-auto max-w-[120px]">
                        {selectedProduct.additionalImageLinks.slice(0, 3).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="w-8 h-8 object-contain rounded-md border border-slate-200 bg-white"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0 space-y-2 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedProduct.title}</h4>
                    {selectedProduct.description && (
                      <p className="text-slate-500 text-[11px] mt-1 line-clamp-3 leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {selectedProduct.price && (
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 font-bold text-emerald-800 text-xs flex items-center gap-1">
                        <span>Price: {selectedProduct.price}</span>
                        {selectedProduct.salePrice && (
                          <span className="text-[10px] text-emerald-600 line-through">
                            {selectedProduct.salePrice}
                          </span>
                        )}
                      </div>
                    )}
                    {selectedProduct.brand && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700 font-semibold">
                        Brand: {selectedProduct.brand}
                      </span>
                    )}
                    {selectedProduct.availability && (
                      <span className={`px-2 py-0.5 rounded-lg font-bold ${
                        selectedProduct.availability.toLowerCase().includes("in")
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {selectedProduct.availability}
                      </span>
                    )}
                    {selectedProduct.condition && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                        Condition: {selectedProduct.condition}
                      </span>
                    )}
                    {selectedProduct.channel && (
                      <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-medium">
                        Channel: {selectedProduct.channel}
                      </span>
                    )}
                  </div>

                  {selectedProduct.googleProductCategory && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      Category: <span className="text-slate-600">{selectedProduct.googleProductCategory}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 font-medium">Merchant Center Account</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{selectedProduct.merchantId}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 font-medium">Overall Approval Status</p>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      selectedProduct.status === "APPROVED"
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : selectedProduct.status === "DISAPPROVED"
                        ? "text-rose-700 bg-rose-50 border-rose-200"
                        : "text-amber-700 bg-amber-50 border-amber-200"
                    }`}
                  >
                    {selectedProduct.status}
                  </span>
                </div>
              </div>

              {selectedProduct.link && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Live Product Page URL:</span>
                    <a
                      href={selectedProduct.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-bold inline-flex items-center gap-1 hover:underline"
                    >
                      Open Live Store URL <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="font-mono text-slate-800 break-all mt-1">{selectedProduct.link}</p>
                </div>
              )}

              {/* Issues Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Detected Item-Level Issues ({selectedProduct.issues.length})
                </h4>
                {selectedProduct.issues.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    No policy or data quality issues detected for this item.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProduct.issues.map((iss, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-2xl border text-xs space-y-2 ${
                          iss.severity === "DISAPPROVED"
                            ? "bg-rose-50/50 border-rose-200"
                            : "bg-amber-50/50 border-amber-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              iss.severity === "DISAPPROVED"
                                ? "bg-rose-200 text-rose-900"
                                : "bg-amber-200 text-amber-900"
                            }`}
                          >
                            {iss.severity}
                          </span>
                          <span className="text-slate-500 text-[10px] font-mono">
                            Attribute: {iss.attributeName}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900">{iss.description}</p>
                        <p className="text-slate-600">{iss.detail}</p>
                        {iss.documentation && (
                          <a
                            href={iss.documentation}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline mt-1"
                          >
                            Google Policy Documentation <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Statuses */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Destination Breakdown
                </h4>
                <div className="space-y-2">
                  {selectedProduct.destinations.map((d, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{d.destination}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Approved: {d.approvedCountries.join(", ") || "None"} | Disapproved:{" "}
                          {d.disapprovedCountries.join(", ") || "None"}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CREATE LISTING GROUP MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" />
                Add Listing Group Partition Unit
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListingGroup} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Shopping Ad Group
                </label>
                <select
                  value={createAdGroupId}
                  onChange={(e) => setCreateAdGroupId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Ad Group...</option>
                  {adGroupsList.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} (ID: {ag.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dimension</label>
                  <select
                    value={createDimension}
                    onChange={(e: any) => setCreateDimension(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="BRAND">Product Brand</option>
                    <option value="ITEM_ID">Item ID / SKU</option>
                    <option value="PRODUCT_TYPE">Product Type</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Value</label>
                  <input
                    type="text"
                    placeholder="e.g. Nike or SKU-001"
                    value={createValue}
                    onChange={(e) => setCreateValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chkExcluded"
                  checked={createIsExcluded}
                  onChange={(e) => setCreateIsExcluded(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="chkExcluded" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Exclude this partition (negative criterion)
                </label>
              </div>

              {!createIsExcluded && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max CPC Bid (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      placeholder="10.00"
                      value={createCpcBid}
                      onChange={(e) => setCreateCpcBid(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingListing}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {creatingListing ? "Creating Partition..." : "Save Partition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {nodeToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Listing Group Partition?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove partition &quot;{nodeToDelete.value}&quot; ({nodeToDelete.dimension}) from Ad Group &quot;{nodeToDelete.groupScopeName}&quot;?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setNodeToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteListingGroup}
                disabled={deletingListing}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {deletingListing ? "Removing..." : "Confirm Removal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
