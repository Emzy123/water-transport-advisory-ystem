import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';

export default function Forbidden() {
  return (
    <PageLayout size="md">
      <div className="flex flex-col items-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
          <ShieldX className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-navy-900">Access denied</h1>
        <p className="mt-3 max-w-md text-slate-600 dark:text-slate-400">
          Your account does not have permission to view this page. Contact your port authority
          if you believe this is an error.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
          <Link to="/">
            <Button>Go home</Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
