"use client";

import { useEffect, useState, useRef } from "react";
import { Car } from "@/types/car";
import CarCard from "./CarCard";

interface CarGridProps {
  cars: Car[];
  total: number;
  loading: boolean;
  error: string | null;
}

type GridState = "loading" | "empty" | "error" | "results";

function getGridState(
  loading: boolean,
  error: string | null,
  cars: Car[]
): GridState {
  if (error) return "error";
  if (loading && cars.length === 0) return "loading";
  if (!loading && cars.length === 0) return "empty";
  return "results";
}

export default function CarGrid({ cars, total, loading, error }: CarGridProps) {
  const [visibleState, setVisibleState] = useState<GridState>(
    getGridState(loading, error, cars)
  );
  const [transitionPhase, setTransitionPhase] = useState<
    "visible" | "fading-out" | "entering"
  >("visible");
  const prevStateRef = useRef<GridState>(
    getGridState(loading, error, cars)
  );

  const currentState = getGridState(loading, error, cars);

  // Smoothly transition between grid states
  useEffect(() => {
    const prevState = prevStateRef.current;
    if (prevState === currentState) return;

    // If we were showing results and filtering (loading), keep results visible
    // with a subtle opacity dip instead of swapping to skeleton
    if (
      prevState === "results" &&
      currentState === "loading"
    ) {
      // Keep results visible, just show a loading overlay
      prevStateRef.current = currentState;
      return;
    }

    // From loading back to results: quick fade
    if (prevState === "loading" && currentState === "results") {
      setTransitionPhase("entering");
      setVisibleState(currentState);
      const timer = setTimeout(() => setTransitionPhase("visible"), 50);
      prevStateRef.current = currentState;
      return () => clearTimeout(timer);
    }

    // Any other state change: fade out, swap, fade in
    setTransitionPhase("fading-out");
    const fadeOutTimer = setTimeout(() => {
      setVisibleState(currentState);
      setTransitionPhase("entering");
      const fadeInTimer = setTimeout(
        () => setTransitionPhase("visible"),
        50
      );
      prevStateRef.current = currentState;
      return () => clearTimeout(fadeInTimer);
    }, 150);

    return () => clearTimeout(fadeOutTimer);
  }, [currentState]);

  const containerClasses =
    transitionPhase === "fading-out"
      ? "opacity-0 translate-y-1"
      : transitionPhase === "entering"
        ? "opacity-0 translate-y-2"
        : "opacity-100 translate-y-0";

  // --- Loading skeleton ---
  if (visibleState === "loading") {
    return (
      <div
        className={`transition-all duration-300 ease-out ${containerClasses}`}
      >
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

  // --- Error state ---
  if (visibleState === "error") {
    return (
      <div
        className={`transition-all duration-300 ease-out ${containerClasses}`}
      >
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
          <h3 className="text-lg font-semibold text-gray-800">
            Something went wrong
          </h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // --- Empty state ---
  if (visibleState === "empty") {
    return (
      <div
        className={`transition-all duration-300 ease-out ${containerClasses}`}
      >
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-md">
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
          <h3 className="text-lg font-semibold text-gray-500">
            No cars found
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Try adjusting your filters to see more results.
          </p>
        </div>
      </div>
    );
  }

  // --- Results grid ---
  // Show stale results with a loading overlay when re-fetching (filter changes)
  const showLoadingOverlay = loading && cars.length > 0;

  return (
    <div className="relative transition-all duration-300 ease-out">
      <p className="mb-4 text-sm text-gray-500">
        Showing {cars.length} of {total} car{total !== 1 ? "s" : ""}
      </p>

      {/* Grid content */}
      <div
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity duration-300 ${
          showLoadingOverlay ? "opacity-50" : "opacity-100"
        }`}
      >
        {cars.map((car, index) => (
          <div
            key={car.id}
            className="animate-fade-in"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: "backwards",
            }}
          >
            <CarCard car={car} />
          </div>
        ))}
      </div>

      {/* Loading overlay for in-place filter updates */}
      {showLoadingOverlay && (
        <div className="absolute inset-0 flex items-start justify-center pt-24">
          <div className="flex items-center gap-3 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Updating results…
          </div>
        </div>
      )}
    </div>
  );
}
