"use client";

import { useState, useRef, useCallback } from "react";
import type { CarFilterParams } from "@/types";

interface FilterBarProps {
  brands: string[];
  filters: CarFilterParams;
  onChange: (filters: CarFilterParams) => void;
}

export default function FilterBar({ brands, filters, onChange }: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState<CarFilterParams>(filters);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedOnChange = useCallback(
    (updated: CarFilterParams) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(updated);
      }, 400);
    },
    [onChange],
  );

  const updateFilter = (patch: Partial<CarFilterParams>) => {
    const next = { ...localFilters, ...patch };
    setLocalFilters(next);
    debouncedOnChange(next);
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md transition-shadow duration-300">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Filters
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <label htmlFor="filter-brand" className="mb-1 block text-xs font-medium text-gray-600">
            Brand
          </label>
          <select
            id="filter-brand"
            value={localFilters.brand ?? ""}
            onChange={(e) =>
              updateFilter({ brand: e.target.value || undefined })
            }
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Year min */}
        <div>
          <label htmlFor="filter-year-min" className="mb-1 block text-xs font-medium text-gray-600">
            Year (min)
          </label>
          <input
            id="filter-year-min"
            type="number"
            min={1886}
            max={2026}
            placeholder="e.g. 2010"
            value={localFilters.year_min ?? ""}
            onChange={(e) =>
              updateFilter({
                year_min: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
        </div>

        {/* Year max */}
        <div>
          <label htmlFor="filter-year-max" className="mb-1 block text-xs font-medium text-gray-600">
            Year (max)
          </label>
          <input
            id="filter-year-max"
            type="number"
            min={1886}
            max={2026}
            placeholder="e.g. 2023"
            value={localFilters.year_max ?? ""}
            onChange={(e) =>
              updateFilter({
                year_max: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
        </div>

        {/* Price min */}
        <div>
          <label htmlFor="filter-price-min" className="mb-1 block text-xs font-medium text-gray-600">
            Price (min $)
          </label>
          <input
            id="filter-price-min"
            type="number"
            min={0}
            placeholder="e.g. 10000"
            value={localFilters.price_min ?? ""}
            onChange={(e) =>
              updateFilter({
                price_min: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
        </div>

        {/* Price max */}
        <div>
          <label htmlFor="filter-price-max" className="mb-1 block text-xs font-medium text-gray-600">
            Price (max $)
          </label>
          <input
            id="filter-price-max"
            type="number"
            min={0}
            placeholder="e.g. 50000"
            value={localFilters.price_max ?? ""}
            onChange={(e) =>
              updateFilter({
                price_max: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
