import { useEffect, useState } from 'react';
import api from '../utils/api';
import SeverityBadge from '../components/SeverityBadge';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState([]);

  const load = () =>
    api.get('/incidents').then((r) => setIncidents(r.data.incidents));

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/incidents/${id}/status`, { status });
    load();
  };

  return (
    <PageLayout size="full">
      <PageHeader
        eyebrow="Compliance review"
        title="Incident Management"
        description="Review and resolve incident reports submitted by vessel operators."
      />

      <Card padding={false} className="overflow-x-auto">
        <table className="table-premium w-full">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Reporter</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((i) => (
              <tr key={i.id}>
                <td className="font-medium">{i.incidentType || '—'}</td>
                <td className="max-w-xs truncate text-slate-600">{i.description}</td>
                <td>
                  <SeverityBadge severity={i.severity} />
                </td>
                <td className="text-slate-600">{i.status.replace(/_/g, ' ')}</td>
                <td className="text-slate-600">{i.reporter.fullName}</td>
                <td>
                  <div className="flex gap-2">
                    {i.status !== 'UNDER_REVIEW' && (
                      <Button
                        variant="ghost"
                        className="!px-2 !py-1 text-xs"
                        onClick={() => updateStatus(i.id, 'UNDER_REVIEW')}
                      >
                        Review
                      </Button>
                    )}
                    {i.status !== 'RESOLVED' && (
                      <Button
                        variant="ghost"
                        className="!px-2 !py-1 text-xs text-emerald-700"
                        onClick={() => updateStatus(i.id, 'RESOLVED')}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageLayout>
  );
}
