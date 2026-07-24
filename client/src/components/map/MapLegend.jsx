import { VESSEL_LEGEND } from '../../utils/vesselMarkers';

export default function MapLegend() {
  return (
    <div className="map-legend surface-card !rounded-xl !p-3 !shadow-elevated">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        Vessel types
      </p>
      <ul className="space-y-1.5">
        {VESSEL_LEGEND.map(({ type, label, fill, stroke }) => (
          <li key={type} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <span
              className="h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: fill, boxShadow: `0 0 0 1px ${stroke}` }}
            />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
