import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function FitBoundsToZones({ zones }) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (!zones?.length || hasFit.current) return;

    const layer = L.geoJSON(
      zones.filter((z) => z.zoneGeoJson).map((z) => z.zoneGeoJson)
    );
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      hasFit.current = true;
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 9 });
    }
  }, [zones, map]);

  return null;
}
