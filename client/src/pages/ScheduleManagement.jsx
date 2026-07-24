import { useEffect, useState } from 'react';
import api from '../utils/api';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';
import Card, { CardHeader } from '../components/ui/Card';
import Input, { Select } from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function ScheduleManagement() {
  const [ports, setPorts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({
    portId: '',
    destination: '',
    departure: '',
    daysOfWeek: '',
    vesselName: '',
    fare: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/ports').then((r) => {
      setPorts(r.data);
      if (r.data.length) setForm((f) => ({ ...f, portId: String(r.data[0].id) }));
    });
    api.get('/schedules').then((r) => setSchedules(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/schedules', form);
      setMessage('Schedule published successfully.');
      setForm((f) => ({
        ...f,
        destination: '',
        departure: '',
        daysOfWeek: '',
        vesselName: '',
        fare: '',
      }));
      const { data } = await api.get('/schedules');
      setSchedules(data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create schedule');
    }
  };

  return (
    <PageLayout size="md">
      <PageHeader
        eyebrow="Timetable publishing"
        title="Manage Ferry Schedules"
        description="Add and maintain departure schedules for your assigned ports."
      />

      <Card className="mb-8">
        <CardHeader title="Add new schedule" />
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Port"
            required
            value={form.portId}
            onChange={(e) => setForm({ ...form, portId: e.target.value })}
          >
            {ports.map((p) => (
              <option key={p.id} value={p.id}>
                {p.portName}
              </option>
            ))}
          </Select>
          <Input
            label="Destination"
            required
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Departure time"
              required
              placeholder="07:00"
              value={form.departure}
              onChange={(e) => setForm({ ...form, departure: e.target.value })}
            />
            <Input
              label="Days of week"
              required
              placeholder="Mon,Wed,Fri"
              value={form.daysOfWeek}
              onChange={(e) => setForm({ ...form, daysOfWeek: e.target.value })}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Vessel name"
              value={form.vesselName}
              onChange={(e) => setForm({ ...form, vesselName: e.target.value })}
            />
            <Input
              label="Fare (NGN)"
              type="number"
              value={form.fare}
              onChange={(e) => setForm({ ...form, fare: e.target.value })}
            />
          </div>
          {message && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">{message}</p>
          )}
          <Button type="submit">Add schedule</Button>
        </form>
      </Card>

      <p className="text-sm text-slate-500">{schedules.length} active schedules published</p>
    </PageLayout>
  );
}
