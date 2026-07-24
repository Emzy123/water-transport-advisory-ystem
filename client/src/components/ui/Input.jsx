import { cn } from '../../utils/cn';

export default function Input({ label, hint, error, className = '', id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy-900">
          {label}
        </label>
      )}
      <input id={inputId} className={cn('input-field', error && 'border-red-300 focus:border-red-400 focus:ring-red-200', className)} {...props} />
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ label, hint, error, className = '', id, rows = 4, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy-900">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={cn('input-field resize-y', error && 'border-red-300', className)}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className = '', id, children, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy-900">
          {label}
        </label>
      )}
      <select id={inputId} className={cn('input-field', className)} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
