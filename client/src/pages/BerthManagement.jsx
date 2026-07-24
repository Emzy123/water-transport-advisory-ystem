import { useEffect, useState } from 'react';
import api from '../utils/api';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { Select } from '../components/ui/Input';
import { cn } from '../utils/cn';

const statusStyles = {
  AVAILABLE: 'border-emerald-200 bg-emerald-50/50',
  OCCUPIED: 'border-red-200 bg-red-50/50',
  MAINTENANCE: 'border-amber-200 bg-amber-50/50',
};

export default function BerthManagement() {
  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/ports').then((r) => {
      setPorts(r.data);
      if (r.data.length) loadPort(r.data[0].id);
    });
  }, []);

  const loadPort = async (id) => {
    const { data } = await api.get(`/ports/${id}`);
    setSelectedPort(data);
  };

  const updateBerth = async (berthId, status) => {
    try {
      await api.put(`/ports/${selectedPort.id}/berths/${berthId}`, { status });
      setMessage(`Berth updated to ${status.replace(/_/g, ' ').toLowerCase()}`);
      loadPort(selectedPort.id);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Update failed');
    }
  };

  return (
    <PageLayout size="lg">
      <PageHeader
        eyebrow="Port operations"
        title="Berth Management"
        description="Update real-time berth availability for your assigned river ports."
        action={
          <div className="w-56">
            <Select
              value={selectedPort?.id || ''}
              onChange={(e) => loadPort(parseInt(e.target.value, 10))}
            >
              {ports.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.portName}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {message && (
        <p className="mb-6 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800 ring-1 ring-teal-100">
          {message}
        </p>
      )}

      {selectedPort && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {selectedPort.berths?.map((berth) => (
            <Card
              key={berth.id}
              className={cn('!p-5', statusStyles[berth.status])}
            >
              <h3 className="font-semibold text-navy-900">{berth.berthName}</h3>
              <p className="mb-4 mt-1 text-sm font-medium capitalize text-slate-600">
                {berth.status.toLowerCase()}
              </p>
              <div className="flex flex-wrap gap-2">
                {['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateBerth(berth.id, s)}
                    disabled={berth.status === s}
                    className="rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold text-navy-900 ring-1 ring-slate-200/80 transition hover:bg-white disabled:opacity-40"
                  >
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
