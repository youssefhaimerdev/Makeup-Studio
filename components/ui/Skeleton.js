"use client";

/** Base shimmer block */
export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Card-shaped skeleton — matches ProductCard dimensions */
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#1e140c] border border-nude-100 dark:border-[#2e1f12] rounded-xl p-4 space-y-3">
      <Skeleton className="h-3 w-20 rounded-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

/** Grid of skeleton cards */
export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Look library card skeleton */
export function SkeletonLookCard() {
  return (
    <div className="bg-white dark:bg-[#1e140c] border border-nude-100 dark:border-[#2e1f12] rounded-2xl overflow-hidden">
      <Skeleton className="h-14 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Step list skeleton */
export function SkeletonSteps({ count = 5 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#1e140c] border border-nude-100 dark:border-[#2e1f12] rounded-xl px-4 py-3.5 flex items-center gap-3">
          <Skeleton className="w-7 h-7 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}
