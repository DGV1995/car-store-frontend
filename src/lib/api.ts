/**
 * src/lib/api.ts — Central API configuration for the Car Store frontend.
 *
 * All HTTP requests to the backend MUST resolve paths against API_BASE_URL
 * so that every call reaches the FastAPI server at http://localhost:8000.
 */

/**
 * The root URL of the FastAPI backend.
 *
 * Priority:
 *  1. NEXT_PUBLIC_API_BASE_URL environment variable (available at build-time
 *     and client-side for Next.js)
 *  2. Hard-coded fallback http://localhost:8000
 */
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ??
  'http://localhost:8000';

/**
 * Build the full URL for a given API path.
 *
 * Example:
 *   apiUrl('/api/cars')        → 'http://localhost:8000/api/cars'
 *   apiUrl('/health')          → 'http://localhost:8000/health'
 *   apiUrl('/uploads/foo.jpg') → 'http://localhost:8000/uploads/foo.jpg'
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Thin wrapper around the native `fetch` that automatically prefixes every
 * request with API_BASE_URL.
 *
 * Usage:
 *   const res = await apiFetch('/api/cars');
 *   const cars = await res.json();
 */
export function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> | undefined),
    },
  });
}
