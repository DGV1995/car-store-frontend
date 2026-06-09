import type { Car, CarFilterParams, CarFormErrors } from "@/types";

/**
 * Build the base URL for the cars API endpoint.
 *
 * Behaviour:
 * - If `NEXT_PUBLIC_API_BASE_URL` is undefined → default to `"/api/cars"`.
 * - If it is an empty string → return `"/cars"`.
 * - Otherwise append `/cars` to the configured base (trailing slashes are trimmed).
 */
function getCarsBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (apiBaseUrl === undefined) {
    return "/api/cars";
  }

  if (apiBaseUrl === "") {
    return "/cars";
  }

  const trimmed = apiBaseUrl.endsWith("/") ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  return `${trimmed}/cars`;
}

/**
 * Custom error that carries both a human-readable message and an optional map
 * of field-level validation errors parsed from a 422 response.
 */
export class ApiValidationError extends Error {
  public readonly fieldErrors: CarFormErrors | null;

  constructor(message: string, fieldErrors: CarFormErrors | null = null) {
    super(message);
    this.name = "ApiValidationError";
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Attempt to parse a FastAPI 422 validation error response body into
 * field-level error messages. Returns a partial CarFormErrors object
 * (only fields that were recognised) or null if the payload can't be parsed.
 */
function parse422FieldErrors(body: unknown): CarFormErrors | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const detail = (body as Record<string, unknown>).detail;
  if (!Array.isArray(detail)) {
    return null;
  }

  const FIELD_MAP: Record<string, keyof CarFormErrors> = {
    brand: "brand",
    model: "model",
    year: "year",
    price: "price",
    image: "image",
  };

  const errors: CarFormErrors = {};

  for (const item of detail) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as Record<string, unknown>).msg !== "string"
    ) {
      continue;
    }
    const err = item as { loc?: Array<string | number>; msg: string; type?: string };
    // loc typically looks like ["body", "brand"]
    const fieldName = Array.isArray(err.loc) && err.loc.length >= 2
      ? String(err.loc[err.loc.length - 1])
      : null;

    if (fieldName && FIELD_MAP[fieldName]) {
      const target = FIELD_MAP[fieldName];
      // Only set the first error per field.
      if (!errors[target]) {
        errors[target] = err.msg.charAt(0).toUpperCase() + err.msg.slice(1);
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

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

  const baseUrl = getCarsBaseUrl();
  const qs = params.toString();
  const url = qs ? `${baseUrl}?${qs}` : baseUrl;

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
 * and price, then sends it to the backend. Returns the created Car on success.
 *
 * The image file is appended under the field name **'image'** to match the
 * backend API contract (UploadFile field).
 *
 * Throws an ApiValidationError when the backend responds with 422, carrying
 * field-level error messages parsed from the FastAPI validation response.
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
    formData.append("image", image);
  }

  formData.append("brand", brand);
  formData.append("model", model);
  formData.append("year", String(year));
  formData.append("price", String(price));

  const res = await fetch(getCarsBaseUrl(), {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let fieldErrors: CarFormErrors | null = null;

    try {
      const body = await res.json();

      // Attempt to parse 422 field-level errors from FastAPI.
      if (res.status === 422) {
        fieldErrors = parse422FieldErrors(body);
      }

      // Build a human-readable message.
      let errorMessage = `Failed to create car: ${res.status} ${res.statusText}`;

      if (body.detail) {
        errorMessage = typeof body.detail === "string"
          ? body.detail
          : body.detail.map((d: { msg: string }) => d.msg).join("; ");
      } else if (body.message) {
        errorMessage = body.message;
      }

      throw new ApiValidationError(errorMessage, fieldErrors);
    } catch (err) {
      if (err instanceof ApiValidationError) {
        throw err;
      }
      // JSON parsing failed, throw a generic error.
      throw new Error(`Failed to create car: ${res.status} ${res.statusText}`);
    }
  }

  return res.json();
}
