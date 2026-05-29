"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CarFilters } from "@/types/car";

interface FilterBarProps {
  filters: CarFilters;
  onFiltersChange: (filters: CarFilters) => void;
  loading: boolean;
}

export default function FilterBar({ filters, onFiltersChange, loading }: FilterBarProps) {
  const [localBrand, setLocalBrand] = useState(filters.brand || "");
  const [localYear, setLocalYear] = useState(filters.year || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.max_price || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Sync local state when filters change externally
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setLocalBrand(filters.brand || "");
    setLocalYear(filters.year || "");
    setLocalMaxPrice(filters.max_price || "");
  }, [filters.brand, filters.year, filters.max_price]);

  const debouncedApply = useCallback(
    (newFilters: CarFilters) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onFiltersChange(newFilters);
      }, 400);
    },
    [onFiltersChange]
  );

  const handleBrandChange = (value: string) => {
    setLocalBrand(value);
    debouncedApply({
      brand: value || undefined,
      year: localYear || undefined,
      max_price: localMaxPrice || undefined,
    });
  };

  const handleYearChange = (value: string) => {
    setLocalYear(value);
    debouncedApply({
      brand: localBrand || undefined,
      year: value || undefined,
      max_price: localMaxPrice || undefined,
    });
  };

  const handleMaxPriceChange = (value: string) => {
    setLocalMaxPrice(value);
    debouncedApply({
      brand: localBrand || undefined,
      year: localYear || undefined,
      max_price: value || undefined,
    });
  };

  const handleClear = () => {
    setLocalBrand("");
    setLocalYear("");
    setLocalMaxPrice("");
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onFiltersChange({});
  };

  const hasActiveFilters = !!(
    filters.brand || filters.year || filters.max_price
  );

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="rounded-xl bg-white p-4 shadow-md sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
        {/* Brand filter */}
        <div className="flex-1">
          <label
            htmlFor="filter-brand"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Brand
          </label>
          <input
            id="filter-brand"
            type="text"
            value={localBrand}
            onChange={(e) => handleBrandChange(e.target.value)}
            placeholder="e.g., Toyota, BMW"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Year filter */}
        <div className="flex-1">
          <label
            htmlFor="filter-year"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Year
          </label>
          <select
            id="filter-year"
            value={localYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Any year</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Max price filter */}
        <div className="flex-1">
          <label
            htmlFor="filter-price"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Max Price
          </label>
          <input
            id="filter-price"
            type="number"
            min="0"
            step="1000"
            value={localMaxPrice}
            onChange={(e) => handleMaxPriceChange(e.target.value)}
            placeholder="e.g., 50000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Clear button */}
        <button
          onClick={handleClear}
          disabled={!hasActiveFilters}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            hasActiveFilters
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
              : "cursor-not-allowed bg-gray-50 text-gray-400"
          }`}
        >
          Clear
        </button>
      </div>

      {/* Loading indicator bar */}
      <div className="relative mt-3 h-0.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`absolute inset-0 rounded-full bg-blue-500 transition-all duration-300 ${
            loading ? "animate-pulse opacity-100" : "opacity-0"
          }`}
          style={{
            width: loading ? "40%" : "0%",
            transition: "width 0.3s ease, opacity 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
