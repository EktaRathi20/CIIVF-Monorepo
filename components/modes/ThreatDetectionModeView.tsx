import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Clock, Gauge, Database, 
  ArrowRight, ShieldAlert, Sparkles, CheckCircle2, RotateCcw
} from 'lucide-react';
import { MapComponent } from '../MapComponent';
import { CityLocation } from '../../types';

interface ThreatDetectionModeViewProps {
  city: CityLocation;
  showMangroveLayer: boolean;
  onToggleMangrove: (val: boolean) => void;
  showHistoricalLayer: boolean;
  onToggleHistorical: (val: boolean) => void;
  isLightMode?: boolean;
}

export const ThreatDetectionModeView: React.FC<ThreatDetectionModeViewProps> = ({
  city,
  showMangroveLayer,
  onToggleMangrove,
  showHistoricalLayer,
  onToggleHistorical,
  isLightMode = true,
}) => {
  // Countdown Timer state: starts at 47 hours, 59 mins, 42 secs
  const [secondsRemaining, setSecondsRemaining] = useState<number>(48 * 3600 - 18);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Simple "What-If" slider (110 km/h to 170 km/h)
  const [windSpeed, setWindSpeed] = useState<number>(135);

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  // Dynamic calculations based on slider (110 km/h to 170 km/h)
  // Normalized factor from 0 (at 110) to 1 (at 170)
  const factor = (windSpeed - 110) / 60;

  const inundationDepth = (0.75 + factor * 1.85).toFixed(2); // 0.75m to 2.60m
  const surgeHeight = (1.4 + factor * 2.3).toFixed(1); // 1.4m to 3.7m
  const displacedCount = Math.round(110000 + factor * 510000); // 110,000 to 620,000
  const wardsAffectedCount = Math.round(14 + factor * 38); // 14 to 52 wards
  const powerSubstationsRisk = Math.round(12 + factor * 64); // 12% to 76%
  const dischargeSurgeRate = Math.round(2800 + factor * 4900); // 2800 to 7700 m³/s

  return (
    <div className="space-y-4">
      {/* 1. Prominent Countdown Banner matching prompt */}
      <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 transition-colors ${
        isLightMode
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-amber-300'
          : 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-amber-600/70'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
            isLightMode
              ? 'bg-amber-100 border-amber-300 text-amber-800'
              : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
          }`}>
            <Clock size={28} className="animate-spin" style={{ animationDuration: '16s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs uppercase font-mono tracking-widest font-bold ${
                isLightMode ? 'text-amber-800' : 'text-amber-400'
              }`}>
                THREAT DETECTION // AMBER PROTOCOL
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 uppercase shadow-xs">
                Phase 2 Active
              </span>
            </div>
            <h1 className={`text-lg sm:text-xl font-extrabold tracking-tight ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              T-48 Hours to Landfall
            </h1>
            <p className={`text-xs mt-0.5 ${
              isLightMode ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Bay of Bengal Cyclone Yaas-02B rapidly intensifying. Municipal emergency response teams on high alert.
            </p>
          </div>
        </div>

        {/* Live Countdown Clock */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-inner ${
          isLightMode
            ? 'bg-white border-amber-300 text-slate-900'
            : 'bg-slate-950/80 border-amber-700/60'
        }`}>
          <div className="text-center min-w-[50px]">
            <span className={`text-2xl font-mono font-black tabular-nums ${
              isLightMode ? 'text-amber-800' : 'text-amber-400'
            }`}>
              {String(hours).padStart(2, '0')}
            </span>
            <span className={`block text-[9px] uppercase tracking-wider font-semibold ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}>Hours</span>
          </div>
          <span className="text-xl font-bold text-amber-500 pb-3">:</span>
          <div className="text-center min-w-[50px]">
            <span className={`text-2xl font-mono font-black tabular-nums ${
              isLightMode ? 'text-amber-800' : 'text-amber-400'
            }`}>
              {String(minutes).padStart(2, '0')}
            </span>
            <span className={`block text-[9px] uppercase tracking-wider font-semibold ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}>Mins</span>
          </div>
          <span className="text-xl font-bold text-amber-500 pb-3">:</span>
          <div className="text-center min-w-[50px]">
            <span className={`text-2xl font-mono font-black tabular-nums ${
              isLightMode ? 'text-amber-800' : 'text-amber-400'
            }`}>
              {String(seconds).padStart(2, '0')}
            </span>
            <span className={`block text-[9px] uppercase tracking-wider font-semibold ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}>Secs</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Map and Dynamic "What-If" Simulation Table Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map on Left (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className={`flex items-center justify-between text-xs px-1 ${
            isLightMode ? 'text-slate-600' : 'text-slate-400'
          }`}>
            <span className={`font-semibold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>
              Hazard Forecast Grid & Risk Projections
            </span>
            <span className="text-amber-700 font-mono font-bold">Simulated Gusts: {windSpeed} km/h</span>
          </div>
          <MapComponent
            showMangroveLayer={showMangroveLayer}
            onToggleMangrove={onToggleMangrove}
            showHistoricalLayer={showHistoricalLayer}
            onToggleHistorical={onToggleHistorical}
            systemStatusLabel="Threat Level: Amber"
            systemStatusColor="amber"
            windSpeedSim={windSpeed}
            isLightMode={isLightMode}
          />
        </div>

        {/* Dynamic "What-If" Slider & Basic Data Table on Right (5 cols) */}
        <div className={`lg:col-span-5 border rounded-xl p-4 flex flex-col justify-between shadow-sm transition-colors ${
          isLightMode
            ? 'bg-white border-slate-200/90'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className={`font-bold text-sm flex items-center gap-1.5 ${
                  isLightMode ? 'text-slate-900' : 'text-white'
                }`}>
                  <Gauge size={16} className={isLightMode ? 'text-amber-600' : 'text-amber-400'} />
                  <span>"What-If" Landfall Intensity Slider</span>
                </h3>
                <p className={`text-[11px] mt-0.5 ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Simulate wind velocities from 110 km/h to 170 km/h to forecast urban impact.
                </p>
              </div>
              <button
                onClick={() => setWindSpeed(135)}
                className={`text-xs p-1 cursor-pointer transition-colors ${
                  isLightMode ? 'text-slate-400 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                }`}
                title="Reset to default forecast (135 km/h)"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Slider Control */}
            <div className={`p-3 rounded-xl border mb-4 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-semibold ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                  Simulated Wind Velocity
                </span>
                <span className={`text-base font-extrabold font-mono ${
                  isLightMode ? 'text-amber-800' : 'text-amber-400'
                }`}>
                  {windSpeed} <span className="text-xs text-slate-500 font-sans font-normal">km/h</span>
                </span>
              </div>
              <input
                type="range"
                min="110"
                max="170"
                step="5"
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className={`flex justify-between text-[10px] font-mono mt-1.5 ${
                isLightMode ? 'text-slate-500 font-medium' : 'text-slate-500'
              }`}>
                <span>110 km/h (Cat 1)</span>
                <span>140 km/h (Cat 2)</span>
                <span>170 km/h (Cat 3 Extreme)</span>
              </div>
            </div>

            {/* Basic Data Table dynamically updated next to the map */}
            <div className="text-xs">
              <div className={`font-semibold mb-2 flex items-center justify-between ${
                isLightMode ? 'text-slate-800' : 'text-slate-300'
              }`}>
                <span>Projected Impact Metrics</span>
                <span className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>Live Calculated</span>
              </div>

              <div className={`divide-y border rounded-lg overflow-hidden ${
                isLightMode
                  ? 'divide-slate-200 border-slate-200 bg-slate-50/70'
                  : 'divide-slate-800/80 border-slate-800 bg-slate-950/70'
              }`}>
                <div className={`flex justify-between p-2.5 ${isLightMode ? 'hover:bg-slate-100/60' : 'hover:bg-slate-900/40'}`}>
                  <span className={isLightMode ? 'text-slate-600 font-medium' : 'text-slate-400'}>Projected Inundation Depth</span>
                  <span className={`font-mono font-bold ${isLightMode ? 'text-rose-700' : 'text-rose-400'}`}>{inundationDepth} m</span>
                </div>
                <div className={`flex justify-between p-2.5 ${isLightMode ? 'hover:bg-slate-100/60' : 'hover:bg-slate-900/40'}`}>
                  <span className={isLightMode ? 'text-slate-600 font-medium' : 'text-slate-400'}>Severely Impacted Wards</span>
                  <span className={`font-mono font-bold ${isLightMode ? 'text-amber-800' : 'text-amber-400'}`}>{wardsAffectedCount} Wards</span>
                </div>
                <div className={`flex justify-between p-2.5 ${isLightMode ? 'hover:bg-slate-100/60' : 'hover:bg-slate-900/40'}`}>
                  <span className={isLightMode ? 'text-slate-600 font-medium' : 'text-slate-400'}>Storm Surge Height</span>
                  <span className={`font-mono font-bold ${isLightMode ? 'text-blue-700' : 'text-cyan-400'}`}>+{surgeHeight} m MSL</span>
                </div>
                <div className={`flex justify-between p-2.5 ${isLightMode ? 'hover:bg-slate-100/60' : 'hover:bg-slate-900/40'}`}>
                  <span className={isLightMode ? 'text-slate-600 font-medium' : 'text-slate-400'}>Estimated Displaced Population</span>
                  <span className={`font-mono font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{displacedCount.toLocaleString()}</span>
                </div>
                <div className={`flex justify-between p-2.5 ${isLightMode ? 'hover:bg-slate-100/60' : 'hover:bg-slate-900/40'}`}>
                  <span className={isLightMode ? 'text-slate-600 font-medium' : 'text-slate-400'}>Substation Submersion Risk</span>
                  <span className={`font-mono font-bold ${isLightMode ? 'text-orange-700' : 'text-orange-400'}`}>{powerSubstationsRisk}%</span>
                </div>
                <div className={`flex justify-between p-2.5 ${isLightMode ? 'hover:bg-slate-100/60' : 'hover:bg-slate-900/40'}`}>
                  <span className={isLightMode ? 'text-slate-600 font-medium' : 'text-slate-400'}>Hooghly River Discharge Surge</span>
                  <span className={`font-mono font-bold ${isLightMode ? 'text-blue-700' : 'text-blue-400'}`}>+{dischargeSurgeRate.toLocaleString()} m³/s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt requirement: Data Provenance text tag at the bottom to build trust */}
          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-mono ${
            isLightMode ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
          }`}>
            <span className={`font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-300'}`}>Data Provenance:</span>
            <span className={`px-2 py-0.5 rounded border ${
              isLightMode
                ? 'bg-slate-100 text-slate-800 border-slate-300 font-semibold'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}>
              IMD | GEE | Copernicus
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
