import { useEffect, useState } from 'react';
import api from '../utils/api';
import WarningCard from '../components/WarningCard';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';
import Card, { CardHeader } from '../components/ui/Card';
import Input, { Textarea, Select } from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function WarningManagement() {
  const [warnings, setWarnings] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    affectedZone: '',
    zoneTemplate: '',
  });
  const [message, setMessage] = useState('');

  const load = () => api.get('/warnings?status=ALL').then((r) => setWarnings(r.data));

  useEffect(() => {
    load();
    api.get('/warnings/templates').then((r) => setTemplates(r.data));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/warnings', {
        title: form.title,
        description: form.description,
        severity: form.severity,
        affectedZone: form.affectedZone || undefined,
        zoneTemplate: form.zoneTemplate || undefined,
      });
      setMessage('Warning published successfully.');
      setForm({
        title: '',
        description: '',
        severity: 'MEDIUM',
        affectedZone: '',
        zoneTemplate: '',
      });
      load();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create warning');
    }
  };

  const handleClear = async (id) => {
    await api.patch(`/warnings/${id}/clear`);
    load();
  };

  return (
    <PageLayout size="lg">
      <PageHeader
        eyebrow="Regulatory publishing"
        title="Manage Nav Warnings"
        description="Create georeferenced hazard notices with corridor zone templates."
      />

      <Card className="mb-8">
        <CardHeader title="Publish new warning" />
        <form onSubmit={handleCreate} className="space-y-5" data-testid="warning-form">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label="Description"
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Severity"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
            <Select
              label="Corridor zone template"
              value={form.zoneTemplate}
              onChange={(e) => setForm({ ...form, zoneTemplate: e.target.value })}
            >
              <option value="">No georeferenced zone</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <Input
            label="Affected zone label (optional override)"
            value={form.affectedZone}
            onChange={(e) => setForm({ ...form, affectedZone: e.target.value })}
          />
          {message && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">
              {message}
            </p>
          )}
          <Button type="submit">Publish warning</Button>
        </form>
      </Card>

      <div className="space-y-4">
        {warnings.map((w) => (
          <WarningCard
            key={w.id}
            warning={w}
            actions={
              w.status === 'ACTIVE' ? (
                <button
                  onClick={() => handleClear(w.id)}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  Mark cleared
                </button>
              ) : (
                <span className="text-xs text-slate-400">{w.status}</span>
              )
            }
          />
        ))}
      </div>
    </PageLayout>
  );
}
