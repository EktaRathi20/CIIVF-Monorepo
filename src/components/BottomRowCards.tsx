import React from 'react';
import { Users, Home, Cross, Info } from 'lucide-react';
import { CityLocation } from '../types';
import { InfrastructureResponse } from '../api';

interface BottomRowCardsProps {
  city: CityLocation;
  infrastructure: InfrastructureResponse | null;
  isLightMode?: boolean;
}

export const BottomRowCards: React.FC<BottomRowCardsProps> = ({
  city,
  infrastructure,
  isLightMode = true,
}) => {
  const cardClass = isLightMode ? 'bg-white border-slate-200/90' : 'bg-slate-900/90 border-slate-800';
  const textClass = isLightMode ? 'text-slate-900' : 'text-slate-100';
  const mutedClass = isLightMode ? 'text-slate-500' : 'text-slate-400';
  const facilities = infrastructure ? [...infrastructure.shelters, ...infrastructure.hospitals] : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
      <section className={`border rounded-xl p-3.5 shadow-sm ${cardClass}`}>
        <h3 className={`flex items-center gap-1.5 font-bold text-sm mb-3 ${textClass}`}>
          <Users size={16} className="text-blue-600" /> Population
        </h3>
        <div className={`text-2xl font-bold font-mono ${textClass}`}>{city.populationFormatted}</div>
        <p className={`text-[11px] mt-1 ${mutedClass}`}>
          {city.populationFormatted === 'Unavailable'
            ? city.evidenceQuality.items.find(source => source.label === 'Population data')?.detail ?? 'Population data unavailable from the backend.'
            : 'Total population reported by the population API'}
        </p>
      </section>

      <section className={`border rounded-xl p-3.5 shadow-sm ${cardClass}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`flex items-center gap-1.5 font-bold text-sm ${textClass}`}>
            <Home size={15} className="text-emerald-600" /> Nearby Facilities
          </h3>
          <span className={`text-[10px] ${mutedClass}`}>API results</span>
        </div>
        {!infrastructure ? (
          <p className={`text-xs ${mutedClass}`}>Facility data is unavailable.</p>
        ) : facilities.length === 0 ? (
          <div className="space-y-1">
            <p className={`text-xs ${mutedClass}`}>No facilities returned for this region.</p>
            {Object.entries(infrastructure.source_errors ?? {}).map(([source, error]) => (
              <p key={source} className="text-[10px] leading-relaxed text-amber-800">{source}: {error}</p>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-44 overflow-y-auto">
            {infrastructure.shelters.slice(0, 3).map((facility, index) => (
              <div key={`shelter-${index}`} className={`p-2 rounded-lg border text-xs ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <div className={`flex items-center gap-1.5 font-semibold ${textClass}`}><Home size={13} className="text-emerald-600" />{facility.name}</div>
                <div className={`mt-0.5 ${mutedClass}`}>{facility.address || 'Address not provided'}</div>
              </div>
            ))}
            {infrastructure.hospitals.slice(0, 3).map((facility, index) => (
              <div key={`hospital-${index}`} className={`p-2 rounded-lg border text-xs ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <div className={`flex items-center gap-1.5 font-semibold ${textClass}`}><Cross size={13} className="text-rose-600" />{facility.name}</div>
                <div className={`mt-0.5 ${mutedClass}`}>{facility.address || 'Address not provided'}</div>
              </div>
            ))}
          </div>
        )}
        {infrastructure && facilities.length > 0 && <p className={`text-[10px] mt-2 ${mutedClass}`}>{infrastructure.shelters.length} shelters · {infrastructure.hospitals.length} hospitals returned</p>}
      </section>

      <section className={`border rounded-xl p-3.5 shadow-sm ${cardClass}`}>
        <h3 className={`flex items-center gap-1.5 font-bold text-sm mb-3 ${textClass}`}>
          <Info size={15} className="text-amber-600" /> Evacuation Routes
        </h3>
        <p className={`text-xs leading-relaxed ${mutedClass}`}>
          Route data is not currently exposed by the backend API. No route status or safety recommendation is shown.
        </p>
      </section>
    </div>
  );
};
