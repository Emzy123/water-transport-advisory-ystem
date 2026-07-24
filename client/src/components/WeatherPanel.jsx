import { useEffect, useState } from 'react';
import { Wind, CloudRain, Eye } from 'lucide-react';
import api from '../utils/api';
import { copy } from '../content/copy';
import SeverityBadge from './SeverityBadge';
import Card from './ui/Card';
import { WeatherPanelSkeleton } from './ui/Skeleton';

export default function WeatherPanel() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/weather')
      .then((r) => setWeather(r.data))
      .catch(() => setError('Unable to reach the weather service. Showing last known data if available.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div data-testid="weather-panel"><WeatherPanelSkeleton /></div>;
  if (error && !weather) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30" data-testid="weather-panel">
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </Card>
    );
  }
  if (!weather) return null;

  const typeMap = { info: 'LOW', caution: 'MEDIUM', warning: 'HIGH' };

  const metrics = [
    { icon: Wind, label: 'Wind speed', value: weather.wind, unit: 'km/h' },
    { icon: CloudRain, label: 'Rainfall', value: weather.rain, unit: 'mm/hr' },
    { icon: Eye, label: 'Visibility', value: weather.visibility?.toFixed(1), unit: 'km' },
  ];

  return (
    <Card padding={false} className="overflow-hidden" data-testid="weather-panel">
      <div className="border-b border-slate-100 bg-gradient-to-r from-navy-900 to-navy-800 px-6 py-5 text-white dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-teal-400">
              Live advisory
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">{weather.location}</h2>
          </div>
          <SeverityBadge severity={typeMap[weather.type] || 'INFO'} size="md" />
        </div>
      </div>

      <div className="p-6">
        {weather.stale && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            Cached data — live feed temporarily unavailable.
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {metrics.map(({ icon: Icon, label, value, unit }) => (
            <div key={label} className="surface-muted p-4 text-center">
              <Icon className="mx-auto mb-2 h-5 w-5 text-teal-600 dark:text-teal-400" />
              <p className="text-2xl font-bold tabular-nums text-navy-900">{value}</p>
              <p className="text-xs text-slate-500">
                {label} ({unit})
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-teal-50/80 px-4 py-3.5 text-sm leading-relaxed text-navy-800 ring-1 ring-teal-100 dark:bg-teal-950/30 dark:text-teal-100 dark:ring-teal-900">
          {weather.text}
        </div>
      </div>
    </Card>
  );
}
