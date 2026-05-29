export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  image_url: string;
}

export interface CarListResponse {
  cars: Car[];
  total: number;
}

export interface CarFilters {
  brand?: string;
  year?: string;
  max_price?: string;
}
