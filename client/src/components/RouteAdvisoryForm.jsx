import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../utils/api';
import { copy } from '../content/copy';
import SeverityBadge from './SeverityBadge';
import Card, { CardHeader } from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

export default function RouteAdvisoryForm({ onResult }) {
  const [form, setForm] = useState({
    departure: 'Lokoja River Port',
    destination: 'Onitsha River Port',
    vesselId: '',
    estTransitHours: '6',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/routes', {
        ...form,
        vesselId: form.vesselId || undefined,
      });
      onResult?.(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate advisory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Request route advisory"
        description={copy.forms.routeAdvisoryHint}
      />
      <form onSubmit={handleSubmit} className="space-y-5" data-testid="route-advisory-form">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Departure"
            required
            value={form.departure}
            onChange={(e) => setForm({ ...form, departure: e.target.value })}
          />
          <Input
            label="Destination"
            required
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
          />
          <Input
            label="Vessel ID"
            hint="Optional — links draught data for depth warnings"
            value={form.vesselId}
            onChange={(e) => setForm({ ...form, vesselId: e.target.value })}
            placeholder="e.g. 1"
          />
          <Input
            label="Est. transit hours"
            type="number"
            min="0"
            step="0.5"
            value={form.estTransitHours}
            onChange={(e) => setForm({ ...form, estTransitHours: e.target.value })}
          />
        </div>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analysing route...
            </>
          ) : (
            'Generate advisory'
          )}
        </Button>
      </form>
    </Card>
  );
}

export function RouteAdvisoryResult({ result }) {
  if (!result) return null;

  const severityMap = { HIGH: 'CRITICAL', MODERATE: 'MEDIUM', LOW: 'LOW' };

  return (
    <Card className="mt-6 border-teal-200 bg-gradient-to-br from-teal-50/80 to-white">
      <div className="mb-4 flex items-center gap-3">
        <h3 className="font-display text-xl font-semibold text-navy-900">Advisory result</h3>
        <SeverityBadge severity={severityMap[result.riskLevel] || result.riskLevel} size="md" />
      </div>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">Route</dt>
          <dd className="mt-0.5 font-medium text-navy-900">
            {result.departure} → {result.destination}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">Recommendation</dt>
          <dd className="mt-0.5 leading-relaxed text-slate-700">{result.recommendedRoute}</dd>
        </div>
        <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-teal-100">
          <dd className="leading-relaxed text-navy-800">{result.advisoryText}</dd>
        </div>
      </dl>
    </Card>
  );
}
