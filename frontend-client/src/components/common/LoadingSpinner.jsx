import clsx from 'clsx';

function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-neutral-200 dark:border-neutral-700" />
        <div className="absolute inset-0 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-sm text-neutral-500">Loading...</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl glass overflow-hidden animate-pulse">
      <div className="aspect-square bg-neutral-200 dark:bg-neutral-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
        <div className="flex justify-between">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-20" />
          <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default LoadingSpinner;
