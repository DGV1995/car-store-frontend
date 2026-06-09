"use client";

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl bg-white shadow-md"
        >
          <div className="aspect-[4/3] rounded-t-2xl bg-gray-200" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-1/3 rounded bg-gray-200" />
            <div className="h-5 w-2/3 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
