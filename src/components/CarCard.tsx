"use client";

import type { Car } from "@/types";

interface CarCardProps {
  car: Car;
  index: number;
}

export default function CarCard({ car, index }: CarCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-xl"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={car.image_url}
          alt={`${car.brand} ${car.model}`}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            {car.brand}
          </span>
          <span className="text-xs text-gray-400">{car.year}</span>
        </div>

        <h3 className="mb-2 text-lg font-bold text-gray-900">{car.model}</h3>

        <p className="text-xl font-semibold text-gray-800">
          ${car.price.toLocaleString("en-US", { minimumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
}
