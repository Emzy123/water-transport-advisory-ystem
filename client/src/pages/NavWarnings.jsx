import { ShieldAlert } from 'lucide-react';
import { copy } from '../content/copy';
import WarningCard from '../components/WarningCard';
import WarningZoneMap from '../components/WarningZoneMap';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { WarningListSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/States';
import { useWarnings, useWarningZones } from '../hooks/useQueries';

export default function NavWarnings() {
  const { data: warnings = [], isLoading } = useWarnings('ACTIVE');
  const { data: zones = [], isLoading: zonesLoading } = useWarningZones();

  return (
    <PageLayout size="md">
      <PageHeader
        eyebrow="Safety notices"
        title="Navigational Warnings"
        description="Official hazard advisories with georeferenced zones along the Niger–Benue corridor."
      />

      {zones.length > 0 && (
        <Card padding={false} className="mb-8 overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3 dark:border-navy-700">
            <p className="text-sm font-medium text-navy-900">Active hazard zones</p>
            <p className="text-xs text-slate-500">{copy.map.zoneLegendHint}</p>
          </div>
          <WarningZoneMap zones={zones} loading={zonesLoading} />
        </Card>
      )}

      {isLoading ? (
        <WarningListSkeleton />
      ) : warnings.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title={copy.empty.warnings.title}
          description={copy.empty.warnings.description}
        />
      ) : (
        <div className="space-y-4" data-testid="warnings-list">
          {warnings.map((w) => (
            <WarningCard key={w.id} warning={w} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
