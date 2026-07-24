import { cn } from '../utils/cn';

const styles = {
  LOW: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-800 ring-amber-200',
  HIGH: 'bg-orange-50 text-orange-800 ring-orange-200',
  CRITICAL: 'bg-red-50 text-red-800 ring-red-200',
  MODERATE: 'bg-amber-50 text-amber-800 ring-amber-200',
  INFO: 'bg-blue-50 text-blue-800 ring-blue-200',
  WARNING: 'bg-amber-50 text-amber-800 ring-amber-200',
  MINOR: 'bg-slate-100 text-slate-700 ring-slate-200',
  SERIOUS: 'bg-orange-50 text-orange-800 ring-orange-200',
};

export default function SeverityBadge({ severity, size = 'sm' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold uppercase ring-1 ring-inset',
        styles[severity] || 'bg-slate-100 text-slate-700 ring-slate-200',
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px] tracking-wider' : 'px-3 py-1 text-xs'
      )}
    >
      {severity?.replace(/_/g, ' ')}
    </span>
  );
}
