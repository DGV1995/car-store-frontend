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

const INITIAL_FILTERS: CarFilterParams = {};

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
  const loadCars = useCallback(async (f: CarFilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCars(f);
      setCars(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(msg);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load with no filters.
  useEffect(() => {
    loadCars(INITIAL_FILTERS);
  }, [loadCars]);

  const handleFilterChange = useCallback(
    (newFilters: CarFilterParams) => {
      setFilters(newFilters);
      loadCars(newFilters);
    },
    [loadCars],
  );

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Car Store
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Browse our inventory and find your next car.
        </p>
      </header>

      {/* Filters */}
      <section className="mb-8">
        <FilterBar
          brands={brands}
          filters={filters}
          onChange={handleFilterChange}
        />
      </section>

      {/* Results */}
      <section>
        {loading && <LoadingSkeleton />}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => loadCars(filters)}
              className="mt-3 inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && cars.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-sm">
            <svg
              className="mb-4 h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <p className="text-lg font-medium text-gray-500">No cars found</p>
            <p className="mt-1 text-sm text-gray-400">
              Try adjusting your filters to see more results.
            </p>
          </div>
        )}

        {!loading && !error && cars.length > 0 && (
          <>
            <p className="mb-4 text-sm text-gray-500">
              Showing {cars.length} car{cars.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cars.map((car, idx) => (
                <div
                  key={car.id}
                  className="animate-fadeIn opacity-0"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${idx * 60}ms forwards`,
                  }}
                >
                  <CarCard car={car} index={idx} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
