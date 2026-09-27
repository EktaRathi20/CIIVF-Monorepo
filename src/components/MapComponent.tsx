import React, { useEffect, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { Hospital, Home, MapPin } from 'lucide-react';
import { ApiRegion } from '../api';
import { MapPOI } from '../types';

interface MapComponentProps {
  showMangroveLayer?: boolean;
  onToggleMangrove?: (value: boolean) => void;
  showHistoricalLayer?: boolean;
  onToggleHistorical?: (value: boolean) => void;
  showWard17Box?: boolean;
  showSafeCorridor?: boolean;
  systemStatusLabel?: string;
  systemStatusColor?: 'green' | 'amber' | 'red';
  windSpeedSim?: number;
  interactive?: boolean;
  isLightMode?: boolean;
  pois?: MapPOI[];
  cityLabel?: string;
  bounds?: ApiRegion;
  emptyMessage?: string;
}

function FitRegionBounds({ bounds }: { bounds: ApiRegion }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(
      [
        [bounds.min_lat, bounds.min_lon],
        [bounds.max_lat, bounds.max_lon],
      ],
      { padding: [28, 28], maxZoom: 11 },
    );
  }, [bounds.max_lat, bounds.max_lon, bounds.min_lat, bounds.min_lon, map]);

  return null;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  pois = [],
  cityLabel = 'Selected region',
  bounds,
  emptyMessage = 'No mapped facility coordinates were returned.',
}) => {
  const [activeType, setActiveType] = useState<'all' | 'shelter' | 'hospital'>('all');
  const visiblePois = pois.filter(poi =>
    (activeType === 'all' || poi.type === activeType) && poi.lat != null && poi.lon != null,
  );
  const center: [number, number] = bounds
    ? [(bounds.min_lat + bounds.max_lat) / 2, (bounds.min_lon + bounds.max_lon) / 2]
    : [17.6868, 83.2185];

  return (
    <section className="relative h-[440px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs md:h-[480px]">
      <MapContainer key={cityLabel} center={center} zoom={8} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bounds && <FitRegionBounds bounds={bounds} />}
        {visiblePois.map(poi => (
          <CircleMarker
            key={poi.id}
            center={[poi.lat!, poi.lon!] as [number, number]}
            radius={8}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: poi.type === 'shelter' ? '#059669' : '#e11d48',
              fillOpacity: 0.95,
            }}
          >
            <Popup>
              <div className="min-w-36">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  {poi.type === 'shelter' ? <Home size={14} /> : <Hospital size={14} />}
                  {poi.name}
                </div>
                <p className="mt-1 text-xs text-slate-600">{poi.details ?? 'Address not provided'}</p>
                <p className="mt-1 text-[10px] text-slate-500">{poi.lat?.toFixed(5)}, {poi.lon?.toFixed(5)}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="absolute left-3 top-3 z-[1000] max-w-[55%] rounded-md border border-white/80 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
        <div className="text-xs font-bold text-slate-900">{cityLabel}</div>
        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-600">
          <MapPin size={11} /> {pois.length} mapped facilities
        </div>
      </div>

      <div className="absolute right-3 top-3 z-[1000] flex items-center gap-1 rounded-md border border-slate-200 bg-white/95 p-1 shadow-sm">
        {(['all', 'shelter', 'hospital'] as const).map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            aria-pressed={activeType === type}
            className={`rounded px-2 py-1.5 text-[11px] font-semibold capitalize ${activeType === type ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            {type === 'all' ? 'All' : type === 'shelter' ? 'Shelters' : 'Hospitals'}
          </button>
        ))}
      </div>

      {visiblePois.length === 0 && (
        <div className="pointer-events-none absolute inset-x-4 top-1/2 z-[900] mx-auto max-w-lg -translate-y-1/2 rounded-md border border-slate-200 bg-white/95 px-4 py-3 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-900">No facility markers for {cityLabel}</p>
          <p className="mt-1 break-words text-xs leading-relaxed text-slate-600">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
};
