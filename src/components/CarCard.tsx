"use client";

import type { Car } from "@/types";

interface CarCardProps {
  car: Car;
  index: number;
}

export default function CarCard({ car, index }: CarCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(car.price);

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
          <span className="inline-block rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
            {car.brand}
          </span>
          <span className="text-sm font-medium text-zinc-500">{car.year}</span>
        </div>
        <h3 className="truncate text-lg font-semibold text-zinc-900">
          {car.model}
        </h3>
        <p className="mt-1 text-xl font-bold text-primary-600">
          {formattedPrice}
        </p>
      </div>
    </div>
  );
}
