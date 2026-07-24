import { Link } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <PageLayout size="md">
      <div className="flex flex-col items-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400">
          <MapPinOff className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-navy-900">Page not found</h1>
        <p className="mt-3 max-w-md text-slate-600 dark:text-slate-400">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/">
            <Button>Return home</Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
