import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { copy } from '../content/copy';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={copy.auth.loginTitle}
      subtitle={copy.auth.loginSubtitle}
      footer={
        <p className="mt-8 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
            Register free
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
        <Input
          label="Email address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@portal.ng"
          error={error && !password ? error : undefined}
        />
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && password && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full py-3">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <Card className="mt-8 !bg-slate-50/80 !p-4 !shadow-none ring-1 ring-slate-200/60">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {copy.auth.demoHint}
        </p>
        <div className="space-y-1 text-xs text-slate-600">
          <p>
            <span className="font-medium text-navy-900">admin@portal.ng</span> — Regulatory
          </p>
          <p>
            <span className="font-medium text-navy-900">pm@portal.ng</span> — Port Manager
          </p>
          <p>
            <span className="font-medium text-navy-900">capt@portal.ng</span> — Vessel Operator
          </p>
          <p className="pt-1 text-slate-400">Password: Password@1</p>
        </div>
      </Card>
    </AuthLayout>
  );
}
