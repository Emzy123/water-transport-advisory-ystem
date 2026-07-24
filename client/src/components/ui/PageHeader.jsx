export default function PageHeader({ eyebrow, title, description, action, children }) {
  return (
    <header className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-teal-600">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-base leading-relaxed text-slate-600">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </header>
  );
}
