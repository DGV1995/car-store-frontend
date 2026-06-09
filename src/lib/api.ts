import type { Car, CarFilterParams } from "@/types";

const BASE_URL = "/api/cars";

/**
 * Fetch cars from the backend, optionally filtered.
 * Builds a query string from the provided filter params (skipping undefined values).
 */
export async function fetchCars(filters?: CarFilterParams): Promise<Car[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.year_min !== undefined) params.set("year_min", String(filters.year_min));
    if (filters.year_max !== undefined) params.set("year_max", String(filters.year_max));
    if (filters.price_min !== undefined) params.set("price_min", String(filters.price_min));
    if (filters.price_max !== undefined) params.set("price_max", String(filters.price_max));
  }

  const qs = params.toString();
  const url = qs ? `${BASE_URL}?${qs}` : BASE_URL;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch cars: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
