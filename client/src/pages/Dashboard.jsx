import { Link } from 'react-router-dom';
import {
  Ship,
  Route,
  AlertCircle,
  CloudSun,
  Anchor,
  Calendar,
  MapPin,
  ShieldAlert,
  Radio,
  ClipboardList,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatRole } from '../utils/cn';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import { useDashboardStats } from '../hooks/useQueries';

const dashboards = {
  VESSEL_OPERATOR: {
    eyebrow: 'Operator workspace',
    title: 'Vessel Operator',
    description: 'Track your fleet, request route advisories, and report incidents in the field.',
    links: [
      { to: '/vessels', label: 'Track Vessels', desc: 'Live map and fleet positions', icon: Ship, accent: 'bg-blue-500/10 text-blue-600' },
      { to: '/route-advisory', label: 'Route Advisory', desc: 'Voyage risk assessment', icon: Route, accent: 'bg-teal-500/10 text-teal-600' },
      { to: '/incidents', label: 'Report Incident', desc: 'Submit field reports', icon: AlertCircle, accent: 'bg-rose-500/10 text-rose-600' },
      { to: '/weather', label: 'Weather Advisory', desc: 'Current corridor conditions', icon: CloudSun, accent: 'bg-amber-500/10 text-amber-600' },
    ],
  },
  PORT_MANAGER: {
    eyebrow: 'Port operations',
    title: 'Port Manager',
    description: 'Manage berth availability and publish ferry schedules for your assigned ports.',
    links: [
      { to: '/berths', label: 'Manage Berths', desc: 'Update berth status in real time', icon: Anchor, accent: 'bg-violet-500/10 text-violet-600' },
      { to: '/schedules/manage', label: 'Ferry Schedules', desc: 'Publish and edit departures', icon: Calendar, accent: 'bg-emerald-500/10 text-emerald-600' },
      { to: '/ports', label: 'Port Directory', desc: 'View all port information', icon: MapPin, accent: 'bg-blue-500/10 text-blue-600' },
      { to: '/schedules', label: 'Public Schedules', desc: 'Preview published timetables', icon: Calendar, accent: 'bg-slate-500/10 text-slate-600' },
    ],
  },
  REGULATORY_OFFICIAL: {
    eyebrow: 'Regulatory control',
    title: 'Regulatory Official',
    description: 'Publish warnings, broadcast emergencies, and oversee compliance across the corridor.',
    links: [
      { to: '/warnings/manage', label: 'Nav Warnings', desc: 'Create and clear hazard notices', icon: ShieldAlert, accent: 'bg-amber-500/10 text-amber-600' },
      { to: '/emergency', label: 'Emergency Alerts', desc: 'Site-wide broadcast messages', icon: Radio, accent: 'bg-red-500/10 text-red-600' },
      { to: '/incidents/manage', label: 'Incident Review', desc: 'Manage submitted reports', icon: AlertCircle, accent: 'bg-rose-500/10 text-rose-600' },
      { to: '/audit', label: 'Audit Log', desc: 'System activity history', icon: ClipboardList, accent: 'bg-slate-500/10 text-slate-600' },
      { to: '/vessels', label: 'Vessel Overview', desc: 'Fleet positions map', icon: Ship, accent: 'bg-blue-500/10 text-blue-600' },
    ],
  },
  PUBLIC: {
    eyebrow: 'Public access',
    title: 'Welcome',
    description: 'Browse publicly available advisories, schedules, and vessel tracking data.',
    links: [
      { to: '/vessels', label: 'Vessel Tracking', desc: 'Live positions on the map', icon: Ship, accent: 'bg-blue-500/10 text-blue-600' },
      { to: '/weather', label: 'Weather Advisory', desc: 'Current conditions', icon: CloudSun, accent: 'bg-teal-500/10 text-teal-600' },
      { to: '/warnings', label: 'Nav Warnings', desc: 'Active hazard notices', icon: ShieldAlert, accent: 'bg-amber-500/10 text-amber-600' },
      { to: '/ports', label: 'Port Directory', desc: 'Ports and contact info', icon: MapPin, accent: 'bg-violet-500/10 text-violet-600' },
      { to: '/schedules', label: 'Ferry Schedules', desc: 'Departure timetables', icon: Calendar, accent: 'bg-emerald-500/10 text-emerald-600' },
    ],
  },
};

function StatsSkeleton() {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="flex flex-col gap-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-8 w-16" />
        </Card>
      ))}
    </div>
  );
}

function StatsGrid({ role, stats }) {
  if (role === 'REGULATORY_OFFICIAL') {
    return (
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col justify-between border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Warnings</span>
            <ShieldAlert className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-4 text-3xl font-bold text-navy-900">{stats.activeWarnings}</p>
        </Card>
        <Card className="flex flex-col justify-between border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Incidents</span>
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </div>
          <p className="mt-4 text-3xl font-bold text-navy-900">{stats.pendingIncidents}</p>
        </Card>
        <Card className="flex flex-col justify-between border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tracked Vessels</span>
            <Ship className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-4 text-3xl font-bold text-navy-900">{stats.totalVessels}</p>
        </Card>
        <Card className="flex flex-col justify-between border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Broadcast Alerts</span>
            <Radio className="h-5 w-5 text-red-500" />
          </div>
          <p className="mt-4 text-3xl font-bold text-navy-900">{stats.activeAlerts}</p>
        </Card>
      </div>
    );
  }

  if (role === 'PORT_MANAGER') {
    return (
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="flex flex-col justify-between border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Managed Ports</span>
            <Anchor className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="mt-4 text-3xl font-bold text-navy-900">{stats.managedPortsCount}</p>
        </Card>
        <Card className="flex flex-col justify-between border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Berth Availability</span>
            <span className="text-xs font-medium text-slate-500">Available / Total</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-navy-900">
              {stats.availableBerths} / {stats.totalBerths}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {stats.occupiedBerths} occupied, {stats.maintenanceBerths} maintenance
          </p>
        </Card>
        <Card className="flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Schedules</span>
            <Calendar className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-4 text-3xl font-bold text-navy-900">{stats.activeSchedules}</p>
        </Card>
      </div>
    );
  }

  if (role === 'VESSEL_OPERATOR') {
    return (
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col justify-between border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your Vessels</span>
            <Ship className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-4 text-3xl font-bold text-navy-900">{stats.operatedVessels}</p>
        </Card>
        <Card className="flex flex-col justify-between border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Submitted Reports</span>
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </div>
          <p className="mt-4 text-3xl font-bold text-navy-900">{stats.submittedIncidents}</p>
        </Card>
        <Card className="flex flex-col justify-between border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Corridor Warnings</span>
            <ShieldAlert className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-4 text-3xl font-bold text-navy-900">{stats.activeWarnings}</p>
        </Card>
        <Card className="flex flex-col justify-between border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Alerts</span>
            <Radio className="h-5 w-5 text-red-500" />
          </div>
          <p className="mt-4 text-3xl font-bold text-navy-900">{stats.activeAlerts}</p>
        </Card>
      </div>
    );
  }

  // Default PUBLIC
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      <Card className="flex flex-col justify-between border-l-4 border-l-amber-500">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Warnings</span>
          <ShieldAlert className="h-5 w-5 text-amber-500" />
        </div>
        <p className="mt-4 text-3xl font-bold text-navy-900">{stats.activeWarnings}</p>
      </Card>
      <Card className="flex flex-col justify-between border-l-4 border-l-indigo-500">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total River Ports</span>
          <Anchor className="h-5 w-5 text-indigo-500" />
        </div>
        <p className="mt-4 text-3xl font-bold text-navy-900">{stats.totalPorts}</p>
      </Card>
      <Card className="flex flex-col justify-between border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ferry Trips Today</span>
          <Calendar className="h-5 w-5 text-emerald-500" />
        </div>
        <p className="mt-4 text-3xl font-bold text-navy-900">{stats.activeSchedules}</p>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useDashboardStats();
  const config = dashboards[user?.role] || dashboards.PUBLIC;

  return (
    <PageLayout size="lg" data-testid="dashboard">
      <PageHeader
        eyebrow={config.eyebrow}
        title={`Good day, ${user?.fullName?.split(' ')[0] ?? 'Operator'}`}
        description={config.description}
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => refetch()}
              className="h-9 w-9 p-0"
              title="Refresh stats"
            >
              <RefreshCw className="h-4 w-4 text-slate-400 hover:text-navy-900 dark:hover:text-white" />
            </Button>
            <span className="rounded-full bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700 ring-1 ring-teal-200">
              {formatRole(user?.role)}
            </span>
          </div>
        }
      />

      {/* Dynamic Metrics Section */}
      {isLoading && <StatsSkeleton />}
      
      {isError && (
        <Card className="mb-8 border-red-100 bg-red-50/30 dark:border-red-900/30 dark:bg-red-950/15">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-200">Failed to load live statistics</p>
                <p className="text-sm text-red-700 dark:text-red-400/80">Please check your connection and try again.</p>
              </div>
            </div>
            <Button onClick={() => refetch()} variant="secondary" className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!isLoading && !isError && data && (
        <StatsGrid role={data.role} stats={data.stats} />
      )}

      {/* Actions Section */}
      <h2 className="mb-4 text-lg font-semibold text-navy-900 dark:text-white">Workspace Quick Links</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {config.links.map((link) => (
          <Link key={link.to} to={link.to} className="group">
            <Card hover className="flex h-full items-start gap-4 !p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${link.accent}`}>
                <link.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-navy-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-400 transition">
                    {link.label}
                  </h3>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{link.desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
