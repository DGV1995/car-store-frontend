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

/** Filter parameters sent as query string to GET /api/cars. */
export interface CarFilterParams {
  brand?: string;
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
}
