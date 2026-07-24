import L from 'leaflet';

export const VESSEL_MARKER_COLORS = {
  CARGO_FERRY: { fill: '#3b82f6', stroke: '#1d4ed8' },
  PASSENGER_FERRY: { fill: '#14b8a6', stroke: '#0f766e' },
  TANKER: { fill: '#f59e0b', stroke: '#b45309' },
  PATROL: { fill: '#8b5cf6', stroke: '#6d28d9' },
  TUG: { fill: '#64748b', stroke: '#475569' },
  OTHER: { fill: '#94a3b8', stroke: '#64748b' },
};

export const VESSEL_LEGEND = Object.entries(VESSEL_MARKER_COLORS).map(([type, colors]) => ({
  type,
  label: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  ...colors,
}));

export function createVesselIcon(vesselType, heading = 0) {
  const { fill, stroke } = VESSEL_MARKER_COLORS[vesselType] || VESSEL_MARKER_COLORS.OTHER;

  const html = `
    <div class="vessel-marker-pin" style="transform: rotate(${heading}deg)">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="12" fill="${fill}" stroke="${stroke}" stroke-width="2" opacity="0.95"/>
        <path d="M14 6 L18 20 L14 17 L10 20 Z" fill="white" opacity="0.95"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'vessel-marker-wrapper',
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export const TILE_LAYERS = {
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
};
