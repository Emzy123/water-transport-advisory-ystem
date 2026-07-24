import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function FitBoundsToVessels({ vessels }) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (!vessels?.length || hasFit.current) return;
    hasFit.current = true;
    const bounds = L.latLngBounds(vessels.map((v) => [v.latitude, v.longitude]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 9 });
  }, [vessels, map]);

  return null;
}
