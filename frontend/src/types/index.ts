/** Matches the backend CarBase model. */
export interface CarBase {
  image_url: string;
  brand: string;
  model: string;
  year: number;
  price: number;
}

/** Full car model returned from the API (includes id). */
export interface Car extends CarBase {
  id: number;
}

/** Payload for creating a new car via multipart/form-data. */
export interface CarCreatePayload {
  brand: string;
  model: string;
  year: number;
  price: number;
  /** Optional — the image file to upload. */
  image?: File | null;
}

/** Filter parameters sent as query string to GET /api/cars. */
export interface CarFilterParams {
  brand?: string;
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
}

/** Default/initial filter values. */
export const INITIAL_FILTERS: CarFilterParams = {
  brand: "",
  year_min: undefined,
  year_max: undefined,
  price_min: undefined,
  price_max: undefined,
};

/** Validation errors keyed by field name. */
export interface CarFormErrors {
  image?: string;
  brand?: string;
  model?: string;
  year?: string;
  price?: string;
}
