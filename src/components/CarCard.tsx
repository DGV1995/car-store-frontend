"use client";

import { useState } from "react";
import { Car } from "@/types/car";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(car.price);

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image container */}
      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
          </div>
        )}

        {imageError ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <svg
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                />
              </svg>
              <span className="text-sm">No image</span>
            </div>
          </div>
        ) : (
          <img
            src={car.image_url}
            alt={`${car.brand} ${car.model}`}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        )}

        {/* Year badge */}
        <div className="absolute right-3 top-3 rounded-lg bg-white/90 px-3 py-1 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
          {car.year}
        </div>
      </div>

      {/* Car details */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 truncate">
          {car.brand} {car.model}
        </h3>
        <div className="mt-1 text-sm text-gray-500 truncate">
          {car.brand}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">
            {formattedPrice}
          </span>
        </div>
      </div>
    </div>
  );
}
