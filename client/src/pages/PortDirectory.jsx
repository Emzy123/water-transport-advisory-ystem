import { useEffect, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { copy } from '../content/copy';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { CardGridSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/States';
import { usePorts } from '../hooks/useQueries';

export default function PortDirectory() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: ports = [], isLoading } = usePorts(debounced);

  return (
    <PageLayout size="xl">
      <PageHeader
        eyebrow="Infrastructure"
        title="Port Directory"
        description="River ports along the Niger–Benue corridor — contact details, hours, and berth capacity."
      />

      <div className="relative mb-8 max-w-md">
        <label htmlFor="port-search" className="sr-only">
          Search ports
        </label>
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="port-search"
          type="search"
          placeholder="Search by port or state…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
          data-testid="port-search"
        />
      </div>

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : ports.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={copy.empty.ports.title}
          description={copy.empty.ports.description}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2" data-testid="port-grid">
          {ports.map((port) => (
            <Card key={port.id} hover className="!p-5">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-navy-900">{port.portName}</h2>
                  <p className="text-sm text-slate-500">{port.locationName}</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Hours
                  </dt>
                  <dd className="mt-0.5 text-navy-900">{port.operationalHours || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Berths
                  </dt>
                  <dd className="mt-0.5 text-navy-900">{port.berthCount}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Contact
                  </dt>
                  <dd className="mt-0.5 text-navy-900">{port.contactPhone || '—'}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
