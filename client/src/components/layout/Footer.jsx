import { Link } from 'react-router-dom';
import { Anchor, Mail, MapPin } from 'lucide-react';

const footerLinks = {
  Services: [
    { to: '/vessels', label: 'Vessel Tracking' },
    { to: '/weather', label: 'Weather Advisory' },
    { to: '/warnings', label: 'Nav Warnings' },
    { to: '/ports', label: 'Port Directory' },
  ],
  Operations: [
    { to: '/schedules', label: 'Ferry Schedules' },
    { to: '/route-advisory', label: 'Route Advisory' },
    { to: '/login', label: 'Sign In' },
    { to: '/register', label: 'Register' },
  ],
};

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900">
                <Anchor className="h-4 w-4 text-teal-400" />
              </div>
              <span className="font-display text-lg font-semibold text-navy-900">
                Water Transport Portal
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
              Official advisory platform for safe navigation across Nigeria&apos;s Niger–Benue
              inland waterway corridor. Built for operators, port authorities, and regulatory
              officials.
            </p>
            <div className="mt-6 flex flex-col gap-2 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal-600" />
                Niger–Benue Confluence Region
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-600" />
                support@portal.ng
              </span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-900">
                {group}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-600 transition hover:text-teal-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Water Transport Advisory Portal. All rights reserved.
          </p>
          <p className="text-xs text-slate-400">
            Map data &copy; OpenStreetMap contributors &middot; Weather via Open-Meteo
          </p>
        </div>
      </div>
    </footer>
  );
}
