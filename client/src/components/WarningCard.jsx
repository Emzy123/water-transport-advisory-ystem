import SeverityBadge from './SeverityBadge';

export default function WarningCard({ warning, actions }) {
  return (
    <article className="surface-card p-5 transition hover:shadow-elevated">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug text-navy-900">{warning.title}</h3>
        <SeverityBadge severity={warning.severity} />
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{warning.description}</p>
      {warning.affectedZone && (
        <p className="mt-3 inline-flex rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80 dark:bg-navy-800 dark:text-slate-300">
          {warning.affectedZone}
        </p>
      )}
      {warning.zoneGeoJson && (
        <p className="mt-2 inline-flex rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200/80 dark:bg-amber-950 dark:text-amber-300">
          Georeferenced hazard zone
        </p>
      )}
      <footer className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-400">
          {new Date(warning.publishedAt).toLocaleString()}
          {warning.publisher && ` · ${warning.publisher.fullName}`}
        </p>
        {actions}
      </footer>
    </article>
  );
}
