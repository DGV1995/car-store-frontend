/**
 * src/redux/api/baseApi.ts — RTK Query base API configuration.
 *
 * The base URL is sourced from the VITE_API_BASE_URL environment variable
 * with a sensible fallback default.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL: string =
  (typeof import.meta !== 'undefined' &&
    (import.meta as Record<string, unknown>).env &&
    ((import.meta as Record<string, Record<string, string>>).env
      .VITE_API_BASE_URL as string | undefined)) ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8000/api';

/**
 * Base RTK Query API slice.
 * All feature-specific API slices should extend this via `injectEndpoints`.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Car'],
  endpoints: () => ({}),
});

/**
 * Build the full URL for a given API path using the same base URL.
 * Useful for endpoints (e.g., refresh-token) that may need the full URL.
 */
export function buildApiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
}

/** URL for the token refresh endpoint. */
export const REFRESH_TOKEN_URL: string = buildApiUrl('auth/refresh');
