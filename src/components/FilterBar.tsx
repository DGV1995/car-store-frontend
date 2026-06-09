"use client";

import type { CarFilterParams } from "@/types";

interface FilterBarProps {
  brands: string[];
  filters: CarFilterParams;
  onFilterChange: (filters: CarFilterParams) => void;
}

export default function FilterBar({
  brands,
  filters,
  onFilterChange,
}: FilterBarProps) {
  const handleChange = (field: keyof CarFilterParams, value: string) => {
    const parsedValue =
      field === "brand"
        ? value
        : value === ""
          ? undefined
          : Number(value);

    onFilterChange({ ...filters, [field]: parsedValue || undefined });
  };

  const handleReset = () => {
    onFilterChange({
      brand: "",
      year_min: undefined,
      year_max: undefined,
      price_min: undefined,
      price_max: undefined,
    });
  };

  const hasActiveFilters =
    filters.brand ||
    filters.year_min !== undefined ||
    filters.year_max !== undefined ||
    filters.price_min !== undefined ||
    filters.price_max !== undefined;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
      <div className="flex flex-wrap items-end gap-4">
        {/* Brand dropdown */}
        <div className="min-w-[160px] flex-1 sm:flex-none">
          <label
            htmlFor="brand-filter"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Brand
          </label>
          <select
            id="brand-filter"
            value={filters.brand || ""}
            onChange={(e) => handleChange("brand", e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Year range */}
        <div className="min-w-[140px] flex-1 sm:flex-none">
          <label
            htmlFor="year-min"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Year Min
          </label>
          <input
            id="year-min"
            type="number"
            min={1886}
            max={2026}
            placeholder="e.g. 2010"
            value={filters.year_min ?? ""}
            onChange={(e) => handleChange("year_min", e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        <div className="min-w-[140px] flex-1 sm:flex-none">
          <label
            htmlFor="year-max"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Year Max
          </label>
          <input
            id="year-max"
            type="number"
            min={1886}
            max={2026}
            placeholder="e.g. 2024"
            value={filters.year_max ?? ""}
            onChange={(e) => handleChange("year_max", e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        {/* Price range */}
        <div className="min-w-[140px] flex-1 sm:flex-none">
          <label
            htmlFor="price-min"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Price Min ($)
          </label>
          <input
            id="price-min"
            type="number"
            min={0}
            placeholder="e.g. 10000"
            value={filters.price_min ?? ""}
            onChange={(e) => handleChange("price_min", e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        <div className="min-w-[140px] flex-1 sm:flex-none">
          <label
            htmlFor="price-max"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Price Max ($)
          </label>
          <input
            id="price-max"
            type="number"
            min={0}
            placeholder="e.g. 50000"
            value={filters.price_max ?? ""}
            onChange={(e) => handleChange("price_max", e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <div className="flex items-end sm:flex-none">
            <button
              type="button"
              onClick={handleReset}
              className="mb-0.5 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-800"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
