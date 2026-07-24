import { cn } from '../../utils/cn';

export default function Card({ children, className = '', padding = true, hover = false }) {
  return (
    <div
      className={cn(
        'surface-card',
        padding && 'p-6',
        hover && 'transition hover:-translate-y-0.5 hover:shadow-elevated',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        {title && <h2 className="text-lg font-semibold text-navy-900">{title}</h2>}
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
