'use client';

import { useEffect, useState } from 'react';
import { Car } from '@/types';
import { apiUrl } from '@/lib/api';

type PageState = 'loading' | 'error' | 'empty' | 'success';

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const fetchCars = async () => {
      setPageState('loading');
      setErrorMessage('');

      try {
        const response = await fetch(apiUrl('/api/cars'));

        if (!response.ok) {
          throw new Error(`Failed to fetch cars (status ${response.status})`);
        }

        const data = await response.json();

        const carList: Car[] = data.cars ?? data ?? [];

        if (!Array.isArray(carList)) {
          throw new Error('Unexpected API response format');
        }

        if (carList.length === 0) {
          setPageState('empty');
          setCars([]);
        } else {
          setCars(carList);
          setPageState('success');
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setErrorMessage(message);
        setPageState('error');
      }
    };

    fetchCars();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Car Store</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse our collection of available cars
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pageState === 'loading' && <LoadingState />}
        {pageState === 'error' && <ErrorState message={errorMessage} />}
        {pageState === 'empty' && <EmptyState />}
        {pageState === 'success' && (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Showing {cars.length} {cars.length === 1 ? 'car' : 'cars'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* ─────── Car Card ─────── */

function CarCard({ car }: { car: Car }) {
  const formattedPrice = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(car.price);

  const formattedKm = new Intl.NumberFormat('de-DE').format(car.km);

  /**
   * Resolve image URL:
   * - If the backend returns a relative path like "/uploads/foo.jpg", prefix
   *   it with the API base URL so the browser fetches it from the backend.
   * - Absolute URLs (http://… or https://…) are used as-is.
   */
  const resolvedImageUrl =
    car.image_url &&
    !car.image_url.startsWith('http://') &&
    !car.image_url.startsWith('https://')
      ? apiUrl(car.image_url)
      : car.image_url;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col">
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-200">
        {resolvedImageUrl ? (
          <img
            src={resolvedImageUrl}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.classList.add(
                  'flex',
                  'items-center',
                  'justify-center'
                );
                const placeholder = document.createElement('span');
                placeholder.className = 'text-gray-400 text-4xl';
                placeholder.textContent = '🚗';
                target.parentElement.appendChild(placeholder);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-4xl">🚗</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        <h2 className="text-lg font-semibold text-gray-900">
          {car.brand} {car.model}
        </h2>
        <p className="text-sm text-gray-500 mt-1">{car.year}</p>

        <div className="mt-auto pt-4 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Odometer</span>
            <span className="font-medium text-gray-700">
              {formattedKm} km
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Price</span>
            <span className="font-bold text-lg text-green-600">
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────── Loading State ─────── */

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="mt-4 text-gray-500 text-sm">Loading cars...</p>
    </div>
  );
}

/* ─────── Error State ─────── */

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <span className="text-red-500 text-3xl">!</span>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">
        Something went wrong
      </h2>
      <p className="mt-2 text-gray-500 text-sm max-w-md">{message}</p>
    </div>
  );
}

/* ─────── Empty State ─────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <span className="text-gray-400 text-3xl">🚗</span>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">
        No cars available yet.
      </h2>
      <p className="mt-2 text-gray-500 text-sm max-w-md">
        Check back later — new cars are added to our store regularly.
      </p>
    </div>
  );
}
