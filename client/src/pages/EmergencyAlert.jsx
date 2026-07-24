import { useState } from 'react';
import { Radio } from 'lucide-react';
import api from '../utils/api';
import { copy } from '../content/copy';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';
import Card, { CardHeader } from '../components/ui/Card';
import Input, { Textarea, Select } from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function EmergencyAlert() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    severity: 'WARNING',
    expiresAt: '',
    sendEmail: true,
    sendSms: false,
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/alerts', {
        ...form,
        expiresAt: form.expiresAt || undefined,
      });
      const summary = res.data.notificationSummary;
      const dispatchMsg = summary
        ? ` (Notified ${summary.totalRecipients} recipients via ${summary.emailDispatched} email(s) & ${summary.smsDispatched} SMS)`
        : '';
      setSuccess(`Emergency alert broadcast successfully.${dispatchMsg}`);
      setForm({ title: '', message: '', severity: 'WARNING', expiresAt: '', sendEmail: true, sendSms: false });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to broadcast alert');
    }
  };

  return (
    <PageLayout size="md">
      <PageHeader
        eyebrow="Critical communications"
        title="Emergency Broadcast"
        description="Issue site-wide alerts visible to all users. Use with discretion for genuine emergencies."
      />

      <Card>
        <CardHeader
          title="New alert"
          description={copy.forms.emergencyHint}
        />
        <form onSubmit={handleSubmit} className="space-y-5" data-testid="emergency-form">
          <Input
            label="Alert title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label="Message"
            required
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <Select
            label="Severity"
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
          >
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </Select>
          <Input
            label="Expires at"
            type="datetime-local"
            hint="Optional — alert auto-hides after this time"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          />
          <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Multi-Channel Dispatches</span>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={form.sendEmail}
                onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Send Email Notifications to Operators & Port Managers
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={form.sendSms}
                onChange={(e) => setForm({ ...form, sendSms: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Send Urgent SMS Alerts
            </label>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</p>
          )}
          {success && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">{success}</p>
          )}
          <Button type="submit" variant="danger" className="gap-2">
            <Radio className="h-4 w-4" />
            Broadcast alert
          </Button>
        </form>
      </Card>
    </PageLayout>
  );
}
