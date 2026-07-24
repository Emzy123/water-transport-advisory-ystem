import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../context/ThemeContext';
import { TILE_LAYERS } from '../utils/vesselMarkers';
import WarningZoneLayer from './map/WarningZoneLayer';
import FitBoundsToZones from './map/FitBoundsToZones';
import { MapSkeleton } from './ui/Skeleton';

export default function WarningZoneMap({ zones = [], loading = false, height = '360px' }) {
  const { isDark } = useTheme();
  const tiles = isDark ? TILE_LAYERS.dark : TILE_LAYERS.light;

  if (loading) return <MapSkeleton height={height} />;

  return (
    <div className="map-container relative overflow-hidden rounded-xl">
      <MapContainer
        center={[7.8, 6.73]}
        zoom={7}
        style={{ height, width: '100%' }}
        scrollWheelZoom
        className="z-0"
      >
        <TileLayer url={tiles.url} attribution={tiles.attribution} />
        <WarningZoneLayer zones={zones} />
        <FitBoundsToZones zones={zones} />
      </MapContainer>
    </div>
  );
}
