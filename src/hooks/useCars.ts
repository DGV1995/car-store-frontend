"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Car, CarFilters } from "@/types/car";
import { fetchCars } from "@/lib/api";

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
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
