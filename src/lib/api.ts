import { CarListResponse, CarFilters } from "@/types/car";
import { ApiError } from "@/types/errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Fetches a paginated, filtered list of cars from the backend API.
 *
 * @throws {ApiError} When the request fails. CORS / network errors produce
 *   status=0 with isCorsError=true; HTTP error responses produce the actual
 *   status code with isCorsError=false.
 */
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

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    // A TypeError is thrown by fetch when the request fails to reach the
    // server — this includes CORS policy violations, DNS failures, and
    // network connectivity issues. We treat all of these as CORS / network
    // errors with status 0.
    if (err instanceof TypeError) {
      throw new ApiError(
        0,
        "Network error: CORS policy blocked the request or the server is unreachable.",
        true
      );
    }

    // Re-throw any other unexpected error with status 0
    throw new ApiError(
      0,
      err instanceof Error ? err.message : "An unexpected network error occurred.",
      false
    );
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Failed to fetch cars: ${response.statusText}`,
      false
    );
  }

  return response.json() as Promise<CarListResponse>;
}
