import { GeoJSON } from 'react-leaflet';

const SEVERITY_STYLE = {
  LOW: { color: '#3b82f6', weight: 2, fillColor: '#3b82f6', fillOpacity: 0.12 },
  MEDIUM: { color: '#f59e0b', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.18 },
  HIGH: { color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.22 },
  CRITICAL: { color: '#dc2626', weight: 3, fillColor: '#dc2626', fillOpacity: 0.3 },
};

function zoneStyle(severity) {
  return SEVERITY_STYLE[severity] || SEVERITY_STYLE.MEDIUM;
}

function onEachZone(feature, layer) {
  const { title, severity, affectedZone } = feature.properties || {};
  layer.bindPopup(
    `<div class="min-w-[160px] space-y-1 p-1">
      <p class="font-semibold text-navy-900">${title || 'Hazard zone'}</p>
      <p class="text-xs text-slate-600">${severity || ''}${affectedZone ? ` · ${affectedZone}` : ''}</p>
    </div>`
  );
}

export default function WarningZoneLayer({ zones = [] }) {
  return zones
    .filter((z) => z.zoneGeoJson)
    .map((zone) => (
      <GeoJSON
        key={zone.id}
        data={{
          type: 'Feature',
          properties: {
            title: zone.title,
            severity: zone.severity,
            affectedZone: zone.affectedZone,
          },
          geometry: zone.zoneGeoJson,
        }}
        style={() => zoneStyle(zone.severity)}
        onEachFeature={onEachZone}
      />
    ));
}
