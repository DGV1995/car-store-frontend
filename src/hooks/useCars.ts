"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Car, CarFilters } from "@/types/car";
import { fetchCars } from "@/lib/api";
import { ApiError } from "@/types/errors";

interface UseCarsResult {
  cars: Car[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: CarFilters;
  setFilters: (filters: CarFilters) => void;
  refetch: () => void;
}

export function useCars(initialFilters: CarFilters = {}): UseCarsResult {
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CarFilters>(initialFilters);
  const abortRef = useRef<AbortController | null>(null);

  const loadCars = useCallback(async (currentFilters: CarFilters) => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCars(currentFilters);
      if (!controller.signal.aborted) {
        setCars(data.cars);
        setTotal(data.total);
        setLoading(false);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        // Derive a user-friendly message from the ApiError
        let userMessage: string;

        if (err instanceof ApiError) {
          if (err.isCorsError) {
            userMessage =
              "Unable to connect to the server due to a network or CORS issue. " +
              "Please check your connection and try again.";
          } else if (err.status >= 400 && err.status < 500) {
            userMessage = `Request failed (${err.status}): ${err.message}`;
          } else if (err.status >= 500) {
            userMessage =
              "The server encountered an error. Please try again later.";
          } else {
            userMessage = err.message;
          }
        } else if (err instanceof Error) {
          userMessage = err.message;
        } else {
          userMessage = "An unexpected error occurred.";
        }

        setError(userMessage);
        setCars([]);
        setTotal(0);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadCars(filters);

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [filters, loadCars]);

  const refetch = useCallback(() => {
    loadCars(filters);
  }, [filters, loadCars]);

  return {
    cars,
    total,
    loading,
    error,
    filters,
    setFilters,
    refetch,
  };
}
