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

/**
 * Create a new car via multipart/form-data POST request.
 *
 * Constructs a FormData object from the provided file, brand, model, year,
 * and price, then sends it to the backend.  Returns the created Car on success.
 */
export async function createCar(
  image: File | null,
  brand: string,
  model: string,
  year: number,
  price: number,
): Promise<Car> {
  const formData = new FormData();

  if (image) {
    formData.append("file", image);
  }

  formData.append("brand", brand);
  formData.append("model", model);
  formData.append("year", String(year));
  formData.append("price", String(price));

  const res = await fetch(BASE_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errorMessage = `Failed to create car: ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.detail) {
        // FastAPI validation error shape
        errorMessage = typeof body.detail === "string"
          ? body.detail
          : body.detail.map((d: { msg: string }) => d.msg).join("; ");
      } else if (body.message) {
        errorMessage = body.message;
      }
    } catch {
      // Use the default error message
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
