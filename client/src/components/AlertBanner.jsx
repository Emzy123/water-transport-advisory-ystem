import { useEffect, useState } from 'react';
import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { useActiveAlerts } from '../hooks/useQueries';
import { cn } from '../utils/cn';

const config = {
  INFO: { bar: 'bg-blue-950/95 text-blue-100 border-blue-800/50', icon: Info },
  WARNING: { bar: 'bg-amber-950/95 text-amber-100 border-amber-800/50', icon: AlertTriangle },
  CRITICAL: { bar: 'bg-red-950/95 text-red-100 border-red-800/50', icon: XCircle },
};

export default function AlertBanner() {
  const { data: alerts = [] } = useActiveAlerts();

  if (!alerts.length) return null;

  const top = alerts[0];
  const { bar, icon: Icon } = config[top.severity] || config.WARNING;

  return (
    <div
      className={cn('border-b px-4 py-2.5', bar, top.severity === 'CRITICAL' && 'animate-pulse')}
      role="alert"
      aria-live="assertive"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center text-sm">
        <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
        <p>
          <span className="font-semibold">{top.title}</span>
          <span className="mx-2 opacity-40" aria-hidden="true">
            |
          </span>
          <span className="opacity-90">{top.message}</span>
        </p>
      </div>
    </div>
  );
}
