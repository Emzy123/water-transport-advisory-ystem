import { Link } from 'react-router-dom';
import {
  Anchor,
  ArrowRight,
  CloudSun,
  MapPin,
  Ship,
  ShieldAlert,
  Calendar,
  Route,
  ChevronRight,
} from 'lucide-react';
const features = [
  {
    to: '/vessels',
    icon: Ship,
    title: 'Vessel Tracking',
    desc: 'Monitor live positions across the Niger–Benue corridor with interactive maps.',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    to: '/weather',
    icon: CloudSun,
    title: 'Weather Intelligence',
    desc: 'Real-time wind, rainfall, and visibility data with automated navigation advisories.',
    color: 'bg-teal-500/10 text-teal-600',
  },
  {
    to: '/warnings',
    icon: ShieldAlert,
    title: 'Nav Warnings',
    desc: 'Official hazard notices from regulatory authorities along inland routes.',
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    to: '/ports',
    icon: MapPin,
    title: 'Port Directory',
    desc: 'River port locations, berth availability, and operational contact details.',
    color: 'bg-violet-500/10 text-violet-600',
  },
  {
    to: '/schedules',
    icon: Calendar,
    title: 'Ferry Schedules',
    desc: 'Departure times, routes, and fares for passenger and cargo ferries.',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    to: '/route-advisory',
    icon: Route,
    title: 'Route Advisory',
    desc: 'Intelligent voyage risk assessment combining weather and hazard data.',
    color: 'bg-rose-500/10 text-rose-600',
  },
];

const stats = [
  { value: '4+', label: 'River ports' },
  { value: 'Live', label: 'Weather feed' },
  { value: '24/7', label: 'Alert system' },
  { value: '4', label: 'User roles' },
];

export default function Home() {
  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgb(13_148_136_/_0.3),transparent)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggIGQ9Ik0zNiAzNGg2djZoLTZ6bTAtMjRoNnY2aC02em0tMjQgMjRoNnY2aC02em0wLTI0aDZ2NmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-teal-300 ring-1 ring-white/10">
              <Anchor className="h-4 w-4" />
              Niger–Benue Inland Waterways
            </div>

            <h1 className="animate-fade-up animate-fade-up-delay-1 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Navigate with clarity.
              <span className="mt-2 block text-teal-400">Operate with confidence.</span>
            </h1>

            <p className="animate-fade-up animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              The Water Transport Advisory Portal brings together vessel tracking, weather
              intelligence, and regulatory advisories — purpose-built for Nigeria&apos;s inland
              waterway community.
            </p>

            <div className="animate-fade-up animate-fade-up-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/vessels" className="btn-primary bg-teal-600 hover:bg-teal-500 px-8 py-3">
                Explore live map
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30 px-8 py-3">
                Create free account
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-navy-900/80 px-6 py-5 text-center backdrop-blur-sm">
                <p className="font-display text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative h-16">
          <svg className="absolute bottom-0 w-full text-sand-50" viewBox="0 0 1440 64" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,32 C360,64 720,0 1080,32 C1260,48 1380,48 1440,32 L1440,64 L0,64 Z" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
            Platform capabilities
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
            Everything you need for safe passage
          </h2>
          <p className="mt-4 text-slate-600">
            From public weather updates to regulatory emergency broadcasts — one unified
            platform for every stakeholder on the water.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="group surface-card flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-navy-900 group-hover:text-teal-700 transition">
                {f.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{f.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 opacity-0 transition group-hover:opacity-100">
                Open module
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-8 py-14 text-center sm:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(13_148_136_/_0.2),transparent_70%)]" />
          <div className="relative">
            <h2 className="font-display text-3xl font-semibold text-white">
              Ready to get on board?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-300">
              Register as a vessel operator, port manager, or browse publicly available
              advisories — no account required for basic access.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register" className="btn-primary bg-teal-600 hover:bg-teal-500 px-8">
                Create account
              </Link>
              <Link to="/login" className="btn-secondary border-white/20 bg-transparent text-white hover:bg-white/10 px-8">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
