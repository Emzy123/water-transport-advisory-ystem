import { useEffect, useState } from 'react';
import api from '../utils/api';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { Select } from '../components/ui/Input';

export default function FerrySchedules() {
  const [schedules, setSchedules] = useState([]);
  const [ports, setPorts] = useState([]);
  const [portFilter, setPortFilter] = useState('');

  useEffect(() => {
    api.get('/ports').then((r) => setPorts(r.data));
  }, []);

  useEffect(() => {
    const params = portFilter ? { portId: portFilter } : {};
    api.get('/schedules', { params }).then((r) => setSchedules(r.data));
  }, [portFilter]);

  return (
    <PageLayout size="xl">
      <PageHeader
        eyebrow="Passenger & cargo"
        title="Ferry Schedules"
        description="Published departure timetables and fares for river ferry services."
        action={
          <div className="w-48">
            <Select
              value={portFilter}
              onChange={(e) => setPortFilter(e.target.value)}
            >
              <option value="">All ports</option>
              {ports.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.portName}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <Card padding={false} className="overflow-x-auto">
        <table className="table-premium w-full">
          <thead>
            <tr>
              <th>Port</th>
              <th>Destination</th>
              <th>Departure</th>
              <th>Days</th>
              <th>Vessel</th>
              <th>Fare (NGN)</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id}>
                <td className="font-medium text-navy-900">{s.port.portName}</td>
                <td>{s.destination}</td>
                <td className="tabular-nums font-medium">{s.departure}</td>
                <td className="text-slate-600">{s.daysOfWeek}</td>
                <td className="text-slate-600">{s.vesselName || '—'}</td>
                <td className="tabular-nums font-medium text-teal-700">
                  {s.fare?.toLocaleString() ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageLayout>
  );
}
