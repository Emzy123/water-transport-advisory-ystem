import { useState } from 'react';
import api from '../utils/api';
import { copy } from '../content/copy';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';
import Card, { CardHeader } from '../components/ui/Card';
import Input, { Textarea, Select } from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function IncidentReport() {
  const [form, setForm] = useState({
    incidentType: '',
    description: '',
    severity: 'MODERATE',
    latitude: '',
    longitude: '',
    vesselId: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/incidents', {
        ...form,
        vesselId: form.vesselId || undefined,
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined,
      });
      setSuccess('Incident report submitted successfully.');
      setForm({
        incidentType: '',
        description: '',
        severity: 'MODERATE',
        latitude: '',
        longitude: '',
        vesselId: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report');
    }
  };

  return (
    <PageLayout size="md">
      <PageHeader
        eyebrow="Field reporting"
        title="Report an Incident"
        description={copy.forms.incidentHint}
      />

      <Card>
        <CardHeader title="Incident details" />
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Incident type"
            value={form.incidentType}
            onChange={(e) => setForm({ ...form, incidentType: e.target.value })}
            placeholder="Collision, grounding, mechanical failure..."
          />
          <Textarea
            label="Description"
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Select
            label="Severity"
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
          >
            <option value="MINOR">Minor</option>
            <option value="MODERATE">Moderate</option>
            <option value="SERIOUS">Serious</option>
            <option value="CRITICAL">Critical</option>
          </Select>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            />
          </div>
          <Input
            label="Vessel ID"
            hint="Optional"
            value={form.vesselId}
            onChange={(e) => setForm({ ...form, vesselId: e.target.value })}
          />
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</p>
          )}
          {success && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">{success}</p>
          )}
          <Button type="submit">Submit report</Button>
        </form>
      </Card>
    </PageLayout>
  );
}
