import { cn } from '../../utils/cn';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:pointer-events-none disabled:opacity-50',
};

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  return (
    <button className={cn(variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', className = '', children, ...props }) {
  return (
    <a className={cn(variants[variant], className)} {...props}>
      {children}
    </a>
  );
}
