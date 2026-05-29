import { CarListResponse, CarFilters } from "@/types/car";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchCars(filters: CarFilters = {}): Promise<CarListResponse> {
  const params = new URLSearchParams();

  if (filters.brand) {
    params.set("brand", filters.brand);
  }
  if (filters.year) {
    params.set("year", filters.year);
  }
  if (filters.max_price) {
    params.set("max_price", filters.max_price);
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/cars${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cars: ${response.statusText}`);
  }

  return response.json() as Promise<CarListResponse>;
}
