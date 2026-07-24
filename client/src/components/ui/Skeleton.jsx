import { cn } from '../../utils/cn';

export default function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/60', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function WeatherPanelSkeleton() {
  return (
    <div className="surface-card overflow-hidden">
      <Skeleton className="h-24 rounded-none" />
      <div className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-muted space-y-2 p-4">
              <Skeleton className="mx-auto h-5 w-5 rounded-full" />
              <Skeleton className="mx-auto h-8 w-16" />
              <Skeleton className="mx-auto h-3 w-20" />
            </div>
          ))}
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function MapSkeleton({ height = '520px' }) {
  return (
    <div className="surface-card overflow-hidden" style={{ height }}>
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-100 dark:bg-navy-800">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="surface-card overflow-hidden p-0">
      <div className="border-b border-slate-100 p-4 dark:border-slate-700">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-t border-slate-100 p-4 dark:border-slate-700/50">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="surface-card space-y-3 p-5">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-2/3" />
          <SkeletonText lines={2} />
        </div>
      ))}
    </div>
  );
}

export function WarningListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="surface-card space-y-3 p-5">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <SkeletonText lines={3} />
        </div>
      ))}
    </div>
  );
}
