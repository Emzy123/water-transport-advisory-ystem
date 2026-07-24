import { useEffect } from 'react';
import { Ship } from 'lucide-react';
import VesselMap from '../components/VesselMap';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import LiveIndicator from '../components/map/LiveIndicator';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/States';
import { useLiveVessels, useWarningZones } from '../hooks/useQueries';
import { copy, vesselTypeLabels } from '../content/copy';
import toast from 'react-hot-toast';

export default function VesselTracking({ openFirstPopup = false }) {
  const { data: vessels = [], isLoading, isError, connectionStatus } = useLiveVessels();
  const { data: warningZones = [] } = useWarningZones();

  useEffect(() => {
    if (isError) toast.error('Unable to load vessel data. Please try again.');
  }, [isError]);

  return (
    <PageLayout size="full">
      <PageHeader
        eyebrow="Live monitoring"
        title="Vessel Tracking"
        description="Real-time positions across the Niger–Benue corridor via WebSocket stream."
        action={<LiveIndicator status={connectionStatus} />}
      />

      <Card padding={false} className="overflow-hidden" data-testid="vessel-map-section">
        <VesselMap
          vessels={vessels}
          warningZones={warningZones}
          loading={isLoading}
          connectionStatus={connectionStatus}
          height="520px"
          openFirstPopup={openFirstPopup}
          showWarningZones
        />
      </Card>

      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-navy-900">
          <Ship className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          Fleet registry
          {!isLoading && (
            <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-navy-800 dark:text-slate-400">
              {vessels.length} vessels
            </span>
          )}
        </h2>

        {isLoading ? (
          <TableSkeleton rows={4} cols={6} />
        ) : vessels.length === 0 ? (
          <EmptyState
            icon={Ship}
            title={copy.empty.vessels.title}
            description={copy.empty.vessels.description}
          />
        ) : (
          <Card padding={false} className="overflow-x-auto">
            <table className="table-premium w-full">
              <thead>
                <tr>
                  <th scope="col">Vessel</th>
                  <th scope="col">Type</th>
                  <th scope="col">Speed</th>
                  <th scope="col">Heading</th>
                  <th scope="col">Position</th>
                  <th scope="col">Operator</th>
                </tr>
              </thead>
              <tbody>
                {vessels.map((v) => (
                  <tr key={v.id}>
                    <td className="font-medium text-navy-900">{v.vesselName}</td>
                    <td className="text-slate-600">
                      {vesselTypeLabels[v.vesselType] || v.vesselType}
                    </td>
                    <td className="tabular-nums">{v.speed} kn</td>
                    <td className="tabular-nums">{v.heading}&deg;</td>
                    <td className="font-mono text-xs text-slate-500">
                      {v.latitude.toFixed(3)}, {v.longitude.toFixed(3)}
                    </td>
                    <td className="text-slate-600">{v.operator?.fullName ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
