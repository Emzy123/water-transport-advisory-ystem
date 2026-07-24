import { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createVesselIcon } from '../../utils/vesselMarkers';
import { copy, vesselTypeLabels } from '../../content/copy';

export default function VesselMarker({ vessel, openPopupOnMount = false }) {
  const markerRef = useRef(null);
  const opened = useRef(false);

  useEffect(() => {
    if (openPopupOnMount && markerRef.current && !opened.current) {
      opened.current = true;
      const t = setTimeout(() => markerRef.current.openPopup(), 600);
      return () => clearTimeout(t);
    }
  }, [openPopupOnMount]);

  return (
    <Marker
      ref={markerRef}
      position={[vessel.latitude, vessel.longitude]}
      icon={createVesselIcon(vessel.vesselType, vessel.heading)}
    >
      <Popup className="vessel-popup">
        <div className="min-w-[180px] space-y-1.5 p-1">
          <p className="font-semibold text-navy-900">{vessel.vesselName}</p>
          <p className="text-xs text-slate-600">
            {vesselTypeLabels[vessel.vesselType] || vessel.vesselType}
          </p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <dt className="text-slate-400">Speed</dt>
            <dd className="font-medium tabular-nums">{vessel.speed} kn</dd>
            <dt className="text-slate-400">Heading</dt>
            <dd className="font-medium tabular-nums">{vessel.heading}&deg;</dd>
            <dt className="text-slate-400">Operator</dt>
            <dd className="font-medium">{vessel.operator?.fullName ?? '—'}</dd>
          </dl>
          <p className="border-t border-slate-100 pt-1.5 text-[10px] text-slate-400">
            {copy.map.lastUpdated}: {new Date(vessel.lastUpdated).toLocaleString()}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}
