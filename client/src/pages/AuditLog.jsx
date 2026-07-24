import { useEffect, useState } from 'react';
import api from '../utils/api';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleExport = async () => {
    try {
      const res = await api.get('/audit/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'audit-logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  useEffect(() => {
    api.get('/audit', { params: { page } }).then((r) => {
      setLogs(r.data.logs);
      setTotalPages(r.data.totalPages);
    });
  }, [page]);

  return (
    <PageLayout size="full">
      <div className="flex items-center justify-between">
        <PageHeader
          eyebrow="System governance"
          title="Audit Log"
          description="Complete history of authenticated actions across the platform."
        />
        <Button variant="secondary" onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      <Card padding={false} className="overflow-x-auto">
        <table className="table-premium w-full">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="whitespace-nowrap font-mono text-xs text-slate-500">
                  {new Date(log.loggedAt).toLocaleString()}
                </td>
                <td className="font-medium text-navy-900">{log.user?.fullName ?? 'System'}</td>
                <td>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    {log.action}
                  </span>
                </td>
                <td className="max-w-xs truncate text-slate-600">{log.details}</td>
                <td className="font-mono text-xs text-slate-400">{log.ipAddress || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <span className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </span>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </PageLayout>
  );
}
