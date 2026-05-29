"use client";

import { Car } from "@/types/car";
import CarCard from "./CarCard";

interface CarGridProps {
  cars: Car[];
  total: number;
  loading: boolean;
  error: string | null;
}

export default function CarGrid({ cars, total, loading, error }: CarGridProps) {
  // Show loading skeleton when data is being fetched
  if (loading) {
    return (
      <div className="transition-opacity duration-300">
        {/* Result count skeleton */}
        <div className="mb-4">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl bg-white shadow-md"
            >
              <div className="h-52 animate-pulse bg-gray-200" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-md">
        <svg
          className="mb-4 h-16 w-16 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-800">Something went wrong</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  // Show empty state
  if (cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-md transition-all duration-300">
        <svg
          className="mb-4 h-16 w-16 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-500">No cars found</h3>
        <p className="mt-1 text-sm text-gray-400">
          Try adjusting your filters to see more results.
        </p>
      </div>
    );
  }

  // Car grid
  return (
    <div className="transition-all duration-300">
      <p className="mb-4 text-sm text-gray-500">
        Showing {cars.length} of {total} car{total !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cars.map((car) => (
          <div
            key={car.id}
            className="animate-fadeIn opacity-0"
            style={{
              animation: `fadeIn 0.3s ease-out forwards`,
            }}
          >
            <CarCard car={car} />
          </div>
        ))}
      </div>
    </div>
  );
}
