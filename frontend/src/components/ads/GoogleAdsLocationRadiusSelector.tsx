"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  X,
  Plus,
  Trash2,
  Navigation,
  Globe,
  Check,
  ChevronDown,
  Layers,
  Info,
  Maximize2,
  Sliders,
  AlertCircle
} from "lucide-react";

export interface GeoTargetItem {
  id?: string;
  name: string;
  canonicalName: string;
  targetType?: string; // 'Country' | 'City' | 'State / Region' | 'Postal Code' | 'Radius'
  mode?: "LOCATION" | "RADIUS";
  isExcluded?: boolean;
  lat?: number;
  lng?: number;
  radius?: number;
  radiusUnit?: "km" | "mi";
}

interface GoogleAdsLocationRadiusSelectorProps {
  selectedLocation: "ALL" | "INDIA" | "CUSTOM";
  onLocationTypeChange: (type: "ALL" | "INDIA" | "CUSTOM") => void;
  customLocations: GeoTargetItem[];
  onCustomLocationsChange: (locations: GeoTargetItem[]) => void;
  customerId?: string;
  locationOptionsPresence?: string;
  onLocationOptionsPresenceChange?: (val: string) => void;
  locationOptionsExclude?: string;
  onLocationOptionsExcludeChange?: (val: string) => void;
}

export function GoogleAdsLocationRadiusSelector({
  selectedLocation,
  onLocationTypeChange,
  customLocations,
  onCustomLocationsChange,
  customerId,
  locationOptionsPresence,
  onLocationOptionsPresenceChange,
  locationOptionsExclude,
  onLocationOptionsExcludeChange
}: GoogleAdsLocationRadiusSelectorProps) {
  const [activeTab, setActiveTab] = useState<"LOCATION" | "RADIUS">("LOCATION");
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Radius mode inputs
  const [radiusValue, setRadiusValue] = useState<number>(20);
  const [radiusUnit, setRadiusUnit] = useState<"km" | "mi">("km");
  const [selectedMapTarget, setSelectedMapTarget] = useState<GeoTargetItem | null>(null);

  // Advanced Location Options Accordion
  const [showLocationOptions, setShowLocationOptions] = useState<boolean>(false);

  // Fetch Autocomplete Predictions via Backend Google Places / Ads proxy
  useEffect(() => {
    if (searchInput.trim().length >= 2) {
      setIsSearching(true);
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
      const cid = customerId || "8627341950";

      const timer = setTimeout(async () => {
        try {
          const queryTrimmed = searchInput.trim();
          const isPin = /^\d{3,10}$/.test(queryTrimmed.replace(/\s+/g, ""));

          // If in Radius mode, query places autocomplete
          if (activeTab === "RADIUS") {
            const res = await fetch(`${BACKEND}/api/ads/places/autocomplete?input=${encodeURIComponent(queryTrimmed)}&mode=radius`);
            if (res.ok) {
              const data = await res.json();
              setSearchResults(data.predictions || []);
            } else {
              setSearchResults([]);
            }
          } else {
            // Location mode: query Places Autocomplete AND Google Ads Geo-Targets
            // Fetch both in parallel for complete coverage of any city, town, village, district, or landmark
            const [placesRes, geoRes] = await Promise.allSettled([
              fetch(`${BACKEND}/api/ads/places/autocomplete?input=${encodeURIComponent(queryTrimmed)}&mode=location`),
              isPin ? Promise.resolve(null) : fetch(`${BACKEND}/api/ads/geo-targets/search?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(cid)}&q=${encodeURIComponent(queryTrimmed)}`)
            ]);

            let merged: any[] = [];
            const seenIds = new Set<string>();

            // 1. Ingest Places Predictions
            if (placesRes.status === "fulfilled" && placesRes.value && placesRes.value.ok) {
              const pData = await placesRes.value.json();
              const pList = pData.predictions || [];
              for (const p of pList) {
                const id = p.placeId || p.id;
                if (!seenIds.has(id)) {
                  seenIds.add(id);
                  merged.push({
                    id: p.placeId || p.id,
                    placeId: p.placeId,
                    name: p.mainText || p.name || p.description?.split(",")[0],
                    canonicalName: p.description || p.canonicalName || p.mainText,
                    targetType: p.types?.includes("postal_code")
                      ? "Postal Code"
                      : p.types?.includes("country")
                        ? "Country"
                        : p.types?.includes("administrative_area_level_1")
                          ? "State / Region"
                          : p.types?.includes("administrative_area_level_2")
                            ? "District"
                            : p.types?.includes("locality")
                              ? "City / Town"
                              : p.types?.includes("sublocality")
                                ? "Locality / Area"
                                : "Location",
                    lat: p.lat,
                    lng: p.lng
                  });
                }
              }
            }

            // 2. Ingest Google Ads Geo-Targets
            if (geoRes.status === "fulfilled" && geoRes.value && geoRes.value.ok) {
              const gData = await geoRes.value.json();
              const gList = Array.isArray(gData) ? gData : (gData.results || gData.predictions || []);
              for (const g of gList) {
                const id = String(g.id || g.geoTargetConstant?.id || "");
                const canon = g.canonicalName || g.name || g.geoTargetConstant?.canonicalName;
                if (id && !seenIds.has(id) && !seenIds.has(canon)) {
                  seenIds.add(id);
                  merged.push({
                    id: id,
                    name: g.name || g.geoTargetConstant?.name || canon.split(",")[0],
                    canonicalName: canon,
                    targetType: g.targetType || g.geoTargetConstant?.targetType || "City",
                    countryCode: g.countryCode
                  });
                }
              }
            }

            setSearchResults(merged);
          }
        } catch (err) {
          console.error("Location search error:", err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchInput, activeTab, customerId]);

  // Add a targeted or excluded Location
  const handleAddLocation = async (item: any, isExcluded = false) => {
    const canonical = item.canonicalName || item.description || item.name;
    const exists = customLocations.some(l => l.canonicalName.toLowerCase() === canonical.toLowerCase() && l.isExcluded === isExcluded);
    if (!exists) {
      let lat = item.lat;
      let lng = item.lng;

      // Geocode to obtain exact coordinates for map preview and precision
      if ((lat === undefined || lng === undefined) && (item.placeId || item.id)) {
        try {
          const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
          const queryParam = item.placeId ? `placeId=${encodeURIComponent(item.placeId)}` : `address=${encodeURIComponent(canonical)}`;
          const detRes = await fetch(`${BACKEND}/api/ads/places/details?${queryParam}`);
          if (detRes.ok) {
            const det = await detRes.json();
            lat = det.lat;
            lng = det.lng;
          }
        } catch (e) {}
      }

      const newItem: GeoTargetItem = {
        id: item.id || item.placeId,
        name: item.name || item.mainText || canonical.split(",")[0],
        canonicalName: canonical,
        targetType: item.targetType || "Location",
        mode: "LOCATION",
        lat,
        lng,
        isExcluded
      };
      const updated = [...customLocations, newItem];
      onCustomLocationsChange(updated);
      setSelectedMapTarget(newItem);
    }
    setSearchInput("");
    setSearchResults([]);
  };

  // Add a Radius Target
  const handleAddRadiusLocation = async (placeItem: any, isExcluded = false) => {
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    let lat: number | undefined = placeItem.lat;
    let lng: number | undefined = placeItem.lng;
    let canonical = placeItem.description || placeItem.canonicalName || placeItem.name;

    try {
      if (placeItem.placeId || (!lat && canonical)) {
        const queryParam = placeItem.placeId ? `placeId=${encodeURIComponent(placeItem.placeId)}` : `address=${encodeURIComponent(canonical)}`;
        const detRes = await fetch(`${BACKEND}/api/ads/places/details?${queryParam}`);
        if (detRes.ok) {
          const det = await detRes.json();
          lat = det.lat;
          lng = det.lng;
          canonical = det.formattedAddress || canonical;
        }
      }
    } catch (e) {
      console.warn("Geocoding notice:", e);
    }

    const baseName = placeItem.mainText || placeItem.name || canonical.split(",")[0];
    const radiusLabel = `${radiusValue} ${radiusUnit} around ${baseName}`;
    const newItem: GeoTargetItem = {
      id: placeItem.placeId || `rad_${Date.now()}`,
      name: radiusLabel,
      canonicalName: `${radiusLabel} (${canonical})`,
      targetType: `Radius (${radiusValue} ${radiusUnit})`,
      mode: "RADIUS",
      radius: radiusValue,
      radiusUnit: radiusUnit,
      lat,
      lng,
      isExcluded
    };

    const updated = [...customLocations, newItem];
    onCustomLocationsChange(updated);
    setSelectedMapTarget(newItem);
    setSearchInput("");
    setSearchResults([]);
  };

  // Remove a location
  const handleRemoveLocation = (index: number) => {
    const updated = customLocations.filter((_, i) => i !== index);
    onCustomLocationsChange(updated);
    if (selectedMapTarget && customLocations[index]?.canonicalName === selectedMapTarget.canonicalName) {
      setSelectedMapTarget(updated[0] || null);
    }
  };

  // Active target for map preview
  const activeMapTarget = selectedMapTarget || customLocations[0] || null;
  const mapCenterQuery = activeMapTarget
    ? (activeMapTarget.lat && activeMapTarget.lng
        ? `${activeMapTarget.lat},${activeMapTarget.lng}`
        : encodeURIComponent(activeMapTarget.canonicalName.replace(/\(.*?\)/g, "").trim()))
    : "India";

  return (
    <div className="space-y-4 pt-1 text-xs">
      <p className="text-slate-600 font-medium leading-relaxed">
        Select the geographic areas where you want your ads to appear, or exclude specific territories.
      </p>

      {/* Preset Radio Options */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="gadsPmaxLocationPreset"
            checked={selectedLocation === "ALL"}
            onChange={() => onLocationTypeChange("ALL")}
            className="text-primary h-4 w-4 focus:ring-primary/20"
          />
          <span className="text-slate-800 font-medium group-hover:text-slate-900">All countries and territories</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="gadsPmaxLocationPreset"
            checked={selectedLocation === "INDIA"}
            onChange={() => onLocationTypeChange("INDIA")}
            className="text-primary h-4 w-4 focus:ring-primary/20"
          />
          <span className="text-slate-800 font-medium group-hover:text-slate-900">India</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="gadsPmaxLocationPreset"
            checked={selectedLocation === "CUSTOM"}
            onChange={() => onLocationTypeChange("CUSTOM")}
            className="text-primary h-4 w-4 focus:ring-primary/20"
          />
          <span className="text-slate-800 font-bold group-hover:text-slate-900">Enter another location (Advanced Location & Radius Targeting)</span>
        </label>
      </div>

      {/* ADVANCED LOCATION & RADIUS SELECTOR PANEL */}
      {selectedLocation === "CUSTOM" && (
        <div className="mt-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 animate-in fade-in duration-200">
          
          {/* Mode Switch Tabs: Location vs Radius */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => { setActiveTab("LOCATION"); setSearchResults([]); }}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "LOCATION"
                    ? "bg-primary text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Location</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("RADIUS"); setSearchResults([]); }}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "RADIUS"
                    ? "bg-primary text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Radius Targeting</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block">
              Powered by Google Places &amp; Google Ads Geo API
            </span>
          </div>

          {/* Search Bar & Radius Controls */}
          <div className="space-y-2">
            {activeTab === "RADIUS" && (
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs max-w-md">
                <span className="text-slate-700 font-semibold shrink-0">Radius Distance:</span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={radiusValue}
                  onChange={(e) => setRadiusValue(Math.max(1, Number(e.target.value) || 1))}
                  className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 font-bold text-xs focus:outline-none focus:border-primary"
                />
                <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setRadiusUnit("km")}
                    className={`px-2 py-1 text-[11px] font-bold cursor-pointer ${radiusUnit === "km" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600"}`}
                  >
                    km
                  </button>
                  <button
                    type="button"
                    onClick={() => setRadiusUnit("mi")}
                    className={`px-2 py-1 text-[11px] font-bold cursor-pointer ${radiusUnit === "mi" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600"}`}
                  >
                    mi
                  </button>
                </div>
              </div>
            )}

            {/* Autocomplete Input Box */}
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={
                  activeTab === "RADIUS"
                    ? `Search address, city, landmark, or coordinates (e.g. Pune, Mumbai Airport, 18.5204, 73.8567)...`
                    : `Enter a country, state, city, territory, or postal code to target or exclude...`
                }
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary shadow-xs"
              />
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Dropdown Predictions with Include / Exclude Buttons */}
            {searchResults.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 z-20 relative">
                {searchResults.map((item, idx) => {
                  const title = item.name || item.mainText || item.description;
                  const subtitle = item.canonicalName || item.secondaryText || item.description;
                  const typeBadge = item.targetType || (activeTab === "RADIUS" ? "Point of Interest" : "Location");

                  return (
                    <div
                      key={idx}
                      className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-900 truncate">{title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold shrink-0">
                            {typeBadge}
                          </span>
                        </div>
                        {subtitle && subtitle !== title && (
                          <p className="text-[11px] text-slate-500 truncate ml-5.5 mt-0.5">
                            {subtitle}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons: Target / Exclude */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeTab === "RADIUS") handleAddRadiusLocation(item, false);
                            else handleAddLocation(item, false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Target</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (activeTab === "RADIUS") handleAddRadiusLocation(item, true);
                            else handleAddLocation(item, true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 cursor-pointer"
                        >
                          <span>Exclude</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dual Column Layout: Selected Locations List + Interactive Map Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
            
            {/* Left Column (5 cols): Selected Locations & Exclusions */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  Targeted locations ({customLocations.length})
                </span>
                {customLocations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onCustomLocationsChange([])}
                    className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {customLocations.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-white text-center space-y-1">
                  <MapPin className="h-5 w-5 text-slate-300 mx-auto" />
                  <p className="text-slate-500 font-medium text-xs">No custom locations added yet.</p>
                  <p className="text-slate-400 text-[11px]">Search places above to add target areas or radius circles.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {customLocations.map((loc, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedMapTarget(loc)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        selectedMapTarget?.canonicalName === loc.canonicalName
                          ? "bg-primary/10 border-primary shadow-xs"
                          : loc.isExcluded
                            ? "bg-rose-50/60 border-rose-200 hover:border-rose-300"
                            : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${loc.isExcluded ? "bg-rose-500" : "bg-emerald-500"}`} />
                          <span className="font-bold text-slate-900 truncate block">{loc.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 truncate">
                          <span className={`px-1.5 py-0.2 rounded font-semibold ${
                            loc.isExcluded ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {loc.isExcluded ? "Excluded" : "Targeted"}
                          </span>
                          <span>&bull;</span>
                          <span className="truncate">{loc.targetType}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLocation(idx);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white transition-colors"
                        title="Remove location"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column (7 cols): Map Preview Canvas */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
              <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-primary" />
                  <span className="font-bold text-slate-800 text-[11px]">
                    Map Preview: {activeMapTarget ? activeMapTarget.name : "India"}
                  </span>
                </div>
                {activeMapTarget && (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    activeMapTarget.isExcluded ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {activeMapTarget.isExcluded ? "Exclusion Zone" : "Active Target"}
                  </span>
                )}
              </div>

              {/* Embed Google Maps View */}
              <div className="relative w-full h-64 bg-slate-100 flex items-center justify-center">
                <iframe
                  title="Google Maps Location Preview"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${mapCenterQuery}&z=${activeMapTarget?.mode === "RADIUS" ? 11 : 7}&output=embed`}
                />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Location Options Accordion */}
      <div className="pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setShowLocationOptions(!showLocationOptions)}
          className="flex items-center justify-between w-full py-1 text-slate-700 font-semibold cursor-pointer hover:text-primary transition-colors"
        >
          <span>Location options</span>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showLocationOptions ? "rotate-180" : ""}`} />
        </button>

        {showLocationOptions && (
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
            {/* Target Options */}
            <div className="space-y-2">
              <label className="block text-slate-800 font-bold text-xs">Target</label>
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pmaxLocPresence"
                    checked={(locationOptionsPresence || "PRESENCE_INTEREST") === "PRESENCE_INTEREST"}
                    onChange={() => onLocationOptionsPresenceChange && onLocationOptionsPresenceChange("PRESENCE_INTEREST")}
                    className="mt-0.5 text-primary h-3.5 w-3.5"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Presence or interest: People in, regularly in, or who've shown interest in your targeted locations (Recommended)</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pmaxLocPresence"
                    checked={locationOptionsPresence === "PRESENCE"}
                    onChange={() => onLocationOptionsPresenceChange && onLocationOptionsPresenceChange("PRESENCE")}
                    className="mt-0.5 text-primary h-3.5 w-3.5"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Presence: People in or regularly in your targeted locations</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Exclude Options */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-slate-800 font-bold text-xs">Exclude</label>
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pmaxLocExclude"
                    checked={(locationOptionsExclude || "PRESENCE") === "PRESENCE"}
                    onChange={() => onLocationOptionsExcludeChange && onLocationOptionsExcludeChange("PRESENCE")}
                    className="mt-0.5 text-primary h-3.5 w-3.5"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Presence: People in your excluded locations (Recommended)</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pmaxLocExclude"
                    checked={locationOptionsExclude === "PRESENCE_INTEREST"}
                    onChange={() => onLocationOptionsExcludeChange && onLocationOptionsExcludeChange("PRESENCE_INTEREST")}
                    className="mt-0.5 text-primary h-3.5 w-3.5"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Presence or interest: People in, regularly in, or who've shown interest in your excluded locations</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoogleAdsLocationRadiusSelector;
