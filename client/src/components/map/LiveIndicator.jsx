import { cn } from '../../utils/cn';

const labels = {
  connecting: 'Connecting…',
  connected: 'Live',
  reconnecting: 'Reconnecting…',
  disconnected: 'Offline',
};

export default function LiveIndicator({ status, className }) {
  const isLive = status === 'connected';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        isLive
          ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
          : status === 'reconnecting' || status === 'connecting'
            ? 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
            : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          isLive
            ? 'animate-pulse bg-emerald-500'
            : status === 'reconnecting' || status === 'connecting'
              ? 'animate-pulse bg-amber-500'
              : 'bg-slate-400'
        )}
        aria-hidden="true"
      />
      {labels[status] || labels.disconnected}
    </span>
  );
}
