import { Loader2 } from 'lucide-react';

/** Inline spinner — use for form submissions and discrete actions only */
export default function LoadingState({ message = 'Please wait…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
      <Loader2 className="mb-3 h-8 w-8 animate-spin text-teal-600 dark:text-teal-400" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div
      className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center dark:border-slate-700 dark:bg-navy-900/50"
      data-testid="empty-state"
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="font-semibold text-navy-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
