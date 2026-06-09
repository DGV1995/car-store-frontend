"use client";

interface LoadingSkeletonProps {
  count?: number;
}

export default function LoadingSkeleton({ count = 6 }: LoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl bg-white shadow-md"
        >
          {/* Image skeleton */}
          <div className="aspect-[4/3] rounded-t-2xl bg-zinc-200" />
          {/* Content skeleton */}
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-16 rounded-full bg-zinc-200" />
              <div className="h-4 w-10 rounded bg-zinc-200" />
            </div>
            <div className="h-5 w-3/4 rounded bg-zinc-200" />
            <div className="h-6 w-1/3 rounded bg-zinc-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
