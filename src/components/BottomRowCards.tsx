import React from 'react';
import { 
  Users, Home, Cross, Shield, Flame, 
  Droplets, Bus, ArrowRight, ChevronRight, AlertTriangle, Info
} from 'lucide-react';
import { SHELTERS, EVACUATION_ROUTES } from '../data/mockData';
import { CityLocation } from '../types';

interface BottomRowCardsProps {
  city: CityLocation;
  onOpenEvacuationRouteModal: () => void;
  isLightMode?: boolean;
}

export const BottomRowCards: React.FC<BottomRowCardsProps> = ({
  city,
  onOpenEvacuationRouteModal,
  isLightMode = true,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
      {/* 1. Population & Exposure */}
      <div className={`border rounded-xl p-3.5 flex flex-col justify-between shadow-sm transition-colors ${
        isLightMode
          ? 'bg-white border-slate-200/90'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-1.5 font-bold text-sm mb-3">
            <Users size={16} className={isLightMode ? 'text-blue-600' : 'text-blue-400'} />
            <span className={isLightMode ? 'text-slate-900' : 'text-slate-100'}>Population & Exposure</span>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className={`p-2 rounded-lg border ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'
            }`}>
              <div className={`text-[11px] ${isLightMode ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
                Total Population (est.)
              </div>
              <div className={`text-base font-bold font-mono mt-0.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                {city.populationFormatted}
              </div>
            </div>
            <div className={`p-2 rounded-lg border ${
              isLightMode ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/20 border-amber-800/40'
            }`}>
              <div className={`text-[11px] ${isLightMode ? 'text-amber-800 font-medium' : 'text-slate-400'}`}>
                Population in Risk Zone
              </div>
              <div className={`text-base font-bold font-mono mt-0.5 ${isLightMode ? 'text-amber-900' : 'text-white'}`}>
                1,782,000 <span className={`text-xs font-semibold font-sans ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>(39.6%)</span>
              </div>
            </div>
          </div>

          {/* Segmented Exposure Color Bar */}
          <div className={`w-full h-3 rounded-full overflow-hidden flex mb-3 ${isLightMode ? 'bg-slate-200' : 'bg-slate-800'}`}>
            <div className="bg-red-500 h-full" style={{ width: '12.4%' }} title="Red Zone: 12.4%" />
            <div className="bg-orange-500 h-full" style={{ width: '27.1%' }} title="Orange Zone: 27.1%" />
            <div className="bg-yellow-400 h-full" style={{ width: '45.3%' }} title="Yellow Zone: 45.3%" />
            <div className="bg-emerald-500 h-full" style={{ width: '15.2%' }} title="Green Zone: 15.2%" />
          </div>

          {/* Breakdown percentages */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className={isLightMode ? 'text-slate-700 font-medium' : 'text-slate-300'}>Red Zone</span>
              </div>
              <span className={`font-mono font-medium ${isLightMode ? 'text-slate-800' : 'text-slate-300'}`}>12.4%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className={isLightMode ? 'text-slate-700 font-medium' : 'text-slate-300'}>Orange Zone</span>
              </div>
              <span className={`font-mono font-medium ${isLightMode ? 'text-slate-800' : 'text-slate-300'}`}>27.1%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className={isLightMode ? 'text-slate-700 font-medium' : 'text-slate-300'}>Yellow Zone</span>
              </div>
              <span className={`font-mono font-medium ${isLightMode ? 'text-slate-800' : 'text-slate-300'}`}>45.3%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className={isLightMode ? 'text-slate-700 font-medium' : 'text-slate-300'}>Green Zone</span>
              </div>
              <span className={`font-mono font-medium ${isLightMode ? 'text-slate-800' : 'text-slate-300'}`}>15.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Nearby Shelters & Resources */}
      <div className={`border rounded-xl p-3.5 flex flex-col justify-between shadow-sm transition-colors ${
        isLightMode
          ? 'bg-white border-slate-200/90'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <Home size={15} className={isLightMode ? 'text-emerald-600' : 'text-cyan-400'} />
              <span className={isLightMode ? 'text-slate-900' : 'text-slate-100'}>Nearby Shelters & Resources</span>
            </div>
            <button className={`text-xs font-semibold flex items-center gap-1 cursor-pointer ${
              isLightMode ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
            }`}>
              <span>View All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Shelters list */}
          <div className="space-y-2 mb-3">
            {SHELTERS.map((s) => (
              <div
                key={s.id}
                className={`p-2 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                  isLightMode
                    ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${
                    s.status === 'Safe' 
                      ? (isLightMode ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-emerald-950 text-emerald-400 border border-emerald-800')
                      : (isLightMode ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-amber-950 text-amber-400 border border-amber-800')
                  }`}>
                    <Home size={14} />
                  </div>
                  <div>
                    <div className={`font-semibold text-xs ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>
                      {s.name} <span className={`font-normal ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>({s.distance})</span>
                    </div>
                    <div className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Capacity: {s.capacity} <span className={isLightMode ? 'text-slate-300' : 'text-slate-600'}>|</span> Available: <span className={`font-semibold ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>{s.available}</span>
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                  s.status === 'Safe' 
                    ? (isLightMode ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-emerald-950 text-emerald-300 border-emerald-800')
                    : (isLightMode ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-rose-950 text-rose-300 border-rose-800')
                }`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resources count grid matching screenshot */}
        <div className={`grid grid-cols-4 gap-1.5 pt-2 border-t text-center ${
          isLightMode ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className={`p-1.5 rounded-md border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
          }`}>
            <div className={`flex items-center justify-center gap-1 text-xs ${isLightMode ? 'text-rose-600' : 'text-rose-400'}`}>
              <Cross size={11} />
              <span className={`text-[10px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Hospitals</span>
            </div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>12</div>
          </div>

          <div className={`p-1.5 rounded-md border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
          }`}>
            <div className={`flex items-center justify-center gap-1 text-xs ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`}>
              <Shield size={11} />
              <span className={`text-[10px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Police</span>
            </div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>8</div>
          </div>

          <div className={`p-1.5 rounded-md border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
          }`}>
            <div className={`flex items-center justify-center gap-1 text-xs ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`}>
              <Flame size={11} />
              <span className={`text-[10px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Fire Stations</span>
            </div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>5</div>
          </div>

          <div className={`p-1.5 rounded-md border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
          }`}>
            <div className={`flex items-center justify-center gap-1 text-xs ${isLightMode ? 'text-cyan-600' : 'text-cyan-400'}`}>
              <Droplets size={11} />
              <span className={`text-[10px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Water Points</span>
            </div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>20</div>
          </div>
        </div>
      </div>

      {/* 3. Transportation & Evacuation Routes */}
      <div className={`border rounded-xl p-3.5 flex flex-col justify-between shadow-sm transition-colors ${
        isLightMode
          ? 'bg-white border-slate-200/90'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <Bus size={15} className={isLightMode ? 'text-blue-600' : 'text-blue-400'} />
              <span className={isLightMode ? 'text-slate-900' : 'text-slate-100'}>Transportation & Evacuation Routes</span>
            </div>
            <button className={`text-xs font-semibold flex items-center gap-1 cursor-pointer ${
              isLightMode ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
            }`}>
              <span>View All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Evacuation Routes matching screenshot */}
          <div className="space-y-2 mb-3">
            {EVACUATION_ROUTES.map((route) => (
              <div
                key={route.id}
                onClick={onOpenEvacuationRouteModal}
                className={`p-2 rounded-lg border transition-colors flex items-center justify-between text-xs cursor-pointer group ${
                  isLightMode
                    ? 'bg-slate-50/80 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${
                    route.riskStatus === 'Safe' 
                      ? (isLightMode ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-emerald-950 text-emerald-400 border border-emerald-800')
                      : route.riskStatus === 'Moderate'
                      ? (isLightMode ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-amber-950 text-amber-400 border border-amber-800')
                      : (isLightMode ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-rose-950 text-rose-400 border border-rose-800')
                  }`}>
                    <Bus size={14} />
                  </div>
                  <div>
                    <div className={`font-semibold text-xs ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>
                      {route.title}
                    </div>
                    <div className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {route.distance} <span className={isLightMode ? 'text-slate-300' : 'text-slate-600'}>|</span> {route.estimatedTime} <span className={isLightMode ? 'text-slate-300' : 'text-slate-600'}>|</span> <span className={`font-semibold ${
                        route.riskStatus === 'Safe' ? (isLightMode ? 'text-emerald-700' : 'text-emerald-400') :
                        route.riskStatus === 'Moderate' ? (isLightMode ? 'text-amber-700' : 'text-amber-400') : (isLightMode ? 'text-rose-700' : 'text-rose-400')
                      }`}>{route.riskStatus}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight size={14} className={`${isLightMode ? 'text-slate-400 group-hover:text-blue-600' : 'text-slate-500 group-hover:text-slate-200'} transition-transform group-hover:translate-x-0.5`} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <button
            onClick={onOpenEvacuationRouteModal}
            className={`w-full py-2 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
              isLightMode
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200'
            }`}
          >
            <span>View Alternative Routes</span>
            <ChevronRight size={14} />
          </button>
          
          <div className={`mt-2 text-[10px] flex items-center gap-1.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <Info size={11} className={isLightMode ? 'text-blue-600 shrink-0' : 'text-cyan-400 shrink-0'} />
            <span>Routes may be affected by flooding. Use real-time updates.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
