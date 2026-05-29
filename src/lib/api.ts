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

export interface CarCreateData {
  brand: string;
  model: string;
  year: number;
  price: number;
  image: File;
}

export interface ValidationError {
  field: string;
  message: string;
}

export async function createCar(data: CarCreateData): Promise<void> {
  const formData = new FormData();
  formData.append("image", data.image);
  formData.append("brand", data.brand);
  formData.append("model", data.model);
  formData.append("year", String(data.year));
  formData.append("price", String(data.price));

  const response = await fetch(`${API_BASE_URL}/cars`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 422) {
      const body = await response.json().catch(() => null);
      const errors: ValidationError[] = [];

      if (body?.detail && Array.isArray(body.detail)) {
        // FastAPI validation error format: [{loc: ["body","brand"], msg: "...", type: "..."}]
        for (const err of body.detail) {
          const loc = err.loc ?? [];
          // loc is like ["body", "brand"] — take the last element
          const field =
            loc.length > 1
              ? String(loc[loc.length - 1])
              : "__global__";
          errors.push({
            field,
            message: err.msg ?? "Validation error",
          });
        }
      } else if (body?.message) {
        errors.push({ field: "__global__", message: body.message });
      } else {
        errors.push({ field: "__global__", message: "Validation failed" });
      }

      throw errors;
    }

    throw new Error(`Failed to create car: ${response.statusText}`);
  }
}
