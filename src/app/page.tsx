"use client";

import { useState, useEffect, useCallback } from "react";
import type { Car, CarFilterParams } from "@/types";
import { fetchCars } from "@/lib/api";
import CarCard from "@/components/CarCard";
import FilterBar from "@/components/FilterBar";
import LoadingSkeleton from "@/components/LoadingSkeleton";

/** Extract unique brands from a list of cars, preserving order. */
function extractBrands(cars: Car[]): string[] {
  const seen = new Set<string>();
  return cars.filter((c) => {
    if (seen.has(c.brand)) return false;
    seen.add(c.brand);
    return true;
  }).map((c) => c.brand);
}

/** Default empty filter state. */
const INITIAL_FILTERS: CarFilterParams = {
  brand: "",
  year_min: undefined,
  year_max: undefined,
  price_min: undefined,
  price_max: undefined,
};

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [filters, setFilters] = useState<CarFilterParams>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all cars once on mount to populate the brand dropdown.
  useEffect(() => {
    (async () => {
      try {
        const all = await fetchCars();
        setBrands(extractBrands(all));
      } catch {
        // Brands will remain empty; the filter dropdown will just show "All Brands".
      }
    })();
  }, []);

  // Fetch cars (possibly filtered).
  const loadCars = useCallback(async (currentFilters: CarFilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCars(currentFilters);
      setCars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cars");
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and re-fetch on filter change.
  useEffect(() => {
    loadCars(filters);
  }, [filters, loadCars]);

  const handleFilterChange = (newFilters: CarFilterParams) => {
    setFilters(newFilters);
  };

  const hasFilters =
    filters.brand ||
    filters.year_min !== undefined ||
    filters.year_max !== undefined ||
    filters.price_min !== undefined ||
    filters.price_max !== undefined;

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Car Store
        </h1>
        <p className="mt-1 text-zinc-500">
          Browse our collection of {loading ? "…" : `${cars.length}`} car
          {cars.length !== 1 ? "s" : ""}
          {hasFilters ? " matching your filters" : ""}
        </p>
      </header>

      {/* Filter bar */}
      <section className="mb-8">
        <FilterBar
          brands={brands}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </section>

      {/* Main content */}
      <section>
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton count={6} />
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-sm">
            <svg
              className="mb-4 h-16 w-16 text-zinc-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-zinc-700">
              No cars found
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Try adjusting your filters to see more results.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car, index) => (
              <div
                key={car.id}
                className="animate-fade-in opacity-0"
                style={{
                  animationDelay: `${index * 60}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <CarCard car={car} index={index} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
