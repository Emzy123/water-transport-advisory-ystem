import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">
            Something went wrong
          </h1>
          <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            An unexpected error occurred. Please refresh the page or return to the dashboard.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 max-w-lg overflow-auto rounded-lg bg-slate-100 p-3 text-left text-xs dark:bg-navy-800">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Refresh page
            </Button>
            <Button onClick={() => (window.location.href = '/')}>Go home</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
