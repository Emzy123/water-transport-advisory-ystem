import { useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../context/ThemeContext';
import { TILE_LAYERS } from '../utils/vesselMarkers';
import { copy } from '../content/copy';
import MapLegend from './map/MapLegend';
import MapFullscreenToggle from './map/MapFullscreenToggle';
import LiveIndicator from './map/LiveIndicator';
import FitBoundsToVessels from './map/FitBoundsToVessels';
import VesselMarker from './map/VesselMarker';
import WarningZoneLayer from './map/WarningZoneLayer';
import { MapSkeleton } from './ui/Skeleton';

export default function VesselMap({
  vessels = [],
  warningZones = [],
  loading = false,
  connectionStatus = 'connecting',
  height = '520px',
  openFirstPopup = false,
  showWarningZones = false,
}) {
  const containerRef = useRef(null);
  const { isDark } = useTheme();
  const tiles = isDark ? TILE_LAYERS.dark : TILE_LAYERS.light;

  if (loading && !vessels.length) {
    return <MapSkeleton height={height} />;
  }

  return (
    <div ref={containerRef} className="map-container relative">
      <MapContainer
        center={[7.8, 6.73]}
        zoom={7}
        style={{ height, width: '100%' }}
        scrollWheelZoom
        className="z-0"
      >
        <TileLayer url={tiles.url} attribution={tiles.attribution} />
        {showWarningZones && <WarningZoneLayer zones={warningZones} />}
        <FitBoundsToVessels vessels={vessels} />
        {vessels.map((v, index) => (
          <VesselMarker
            key={v.id}
            vessel={v}
            openPopupOnMount={openFirstPopup && index === 0}
          />
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[400]">
        <div className="pointer-events-auto absolute right-3 top-3 flex flex-col items-end gap-2">
          <LiveIndicator status={connectionStatus} />
          <MapFullscreenToggle containerRef={containerRef} />
        </div>
        <div className="pointer-events-auto absolute bottom-3 left-3">
          <MapLegend />
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
        {connectionStatus === 'connected' ? copy.map.liveNote : copy.map.liveFallback}
      </p>
    </div>
  );
}
