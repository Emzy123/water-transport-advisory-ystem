import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Anchor, Menu, X, ChevronDown, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn, formatRole } from '../utils/cn';

const publicLinks = [
  { to: '/vessels', label: 'Tracking' },
  { to: '/weather', label: 'Weather' },
  { to: '/warnings', label: 'Warnings' },
  { to: '/ports', label: 'Ports' },
  { to: '/schedules', label: 'Schedules' },
];

const roleLinks = {
  VESSEL_OPERATOR: [
    { to: '/route-advisory', label: 'Route Advisory' },
    { to: '/incidents', label: 'Incidents' },
  ],
  PORT_MANAGER: [
    { to: '/berths', label: 'Berths' },
    { to: '/schedules/manage', label: 'Schedules' },
  ],
  REGULATORY_OFFICIAL: [
    { to: '/warnings/manage', label: 'Warnings' },
    { to: '/emergency', label: 'Alerts' },
    { to: '/incidents/manage', label: 'Incidents' },
    { to: '/audit', label: 'Audit' },
  ],
};

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/15 ring-1 ring-teal-400/25 transition group-hover:bg-teal-500/25">
            <Anchor className="h-4 w-4 text-teal-400" />
          </div>
          <div className="hidden sm:block">
            <span className="font-display text-base font-semibold text-white">WTAP</span>
            <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Water Transport
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          {publicLinks.map((link) => (
            <NavItem key={link.to} to={link.to} label={link.label} />
          ))}
          {user &&
            (roleLinks[user.role] || []).map((link) => (
              <NavItem key={link.to} to={link.to} label={link.label} />
            ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode (bridge ops)'}
            data-testid="theme-toggle"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/30 text-xs font-bold text-teal-200">
                  {user.fullName?.charAt(0)}
                </div>
                <span className="max-w-[120px] truncate font-medium">{user.fullName}</span>
                <ChevronDown className={cn('h-4 w-4 transition', userMenuOpen && 'rotate-180')} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-elevated">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-navy-900">{user.fullName}</p>
                      <p className="text-xs text-teal-600">{formatRole(user.role)}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-white"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-navy-900 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {publicLinks.map((link) => (
              <NavItem key={link.to} {...link} onClick={closeMobile} />
            ))}
            {user &&
              (roleLinks[user.role] || []).map((link) => (
                <NavItem key={link.to} {...link} onClick={closeMobile} />
              ))}
            <hr className="my-2 border-white/10" />
            {user ? (
              <>
                <NavItem to="/dashboard" label="Dashboard" onClick={closeMobile} />
                <button
                  onClick={handleLogout}
                  className="nav-link text-left text-red-300"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavItem to="/login" label="Sign in" onClick={closeMobile} />
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="mt-2 rounded-xl bg-teal-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
