import React, { useState } from 'react';
import { 
  Plus, Minus, Layers, Shield, Droplets, Flame, 
  Bus, Cross, Info, Check, Eye
} from 'lucide-react';
import { MapPOI } from '../types';
import { MAP_POIS } from '../data/mockData';

interface MapComponentProps {
  showMangroveLayer: boolean;
  onToggleMangrove: (val: boolean) => void;
  showHistoricalLayer: boolean;
  onToggleHistorical: (val: boolean) => void;
  showWard17Box?: boolean;
  showSafeCorridor?: boolean;
  systemStatusLabel?: string;
  systemStatusColor?: 'green' | 'amber' | 'red';
  windSpeedSim?: number; // for dynamic surge effects in amber mode
  interactive?: boolean;
  isLightMode?: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  showMangroveLayer,
  onToggleMangrove,
  showHistoricalLayer,
  onToggleHistorical,
  showWard17Box = false,
  showSafeCorridor = false,
  systemStatusLabel,
  systemStatusColor = 'green',
  windSpeedSim = 120,
  isLightMode = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activePoiFilter, setActivePoiFilter] = useState<{ [key: string]: boolean }>({
    shelter: true,
    hospital: true,
    police: true,
    fire: true,
    water: true,
    transport: true,
  });
  const [selectedPoi, setSelectedPoi] = useState<MapPOI | null>(null);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'topography'>('satellite');

  const toggleFilter = (type: string) => {
    setActivePoiFilter(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredPois = MAP_POIS.filter(poi => activePoiFilter[poi.type]);

  // Surge intensity factor for amber mode
  const surgeIntensity = Math.min(1.4, Math.max(0.6, (windSpeedSim - 110) / 45 + 0.6));

  return (
    <div className={`relative w-full h-[440px] md:h-[480px] rounded-2xl overflow-hidden border select-none shadow-xs transition-colors ${
      isLightMode ? 'border-slate-200 bg-[#edf3f8]' : 'border-slate-700/80 bg-slate-950 shadow-inner'
    }`}>
      {/* SVG Map Canvas */}
      <svg
        viewBox="0 0 1000 680"
        className="w-full h-full object-cover transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
      >
        <defs>
          {/* Gradients for satellite delta terrain */}
          <radialGradient id="satelliteGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={isLightMode ? '#e2edf7' : '#1e3a2f'} />
            <stop offset="60%" stopColor={isLightMode ? '#d5e4f1' : '#15261d'} />
            <stop offset="100%" stopColor={isLightMode ? '#c7dbe9' : '#0c1912'} />
          </radialGradient>

          {/* Urban core texture gradient */}
          <radialGradient id="urbanCore" cx="48%" cy="48%" r="40%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.85 * surgeIntensity} />
            <stop offset="45%" stopColor="#ef4444" stopOpacity={0.9 * surgeIntensity} />
            <stop offset="75%" stopColor="#d97706" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.15} />
          </radialGradient>

          {/* Red Zone Gradient */}
          <radialGradient id="redZoneGlow" cx="46%" cy="46%" r="25%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#b91c1c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
          </radialGradient>

          {/* Mangrove buffer gradient */}
          <linearGradient id="mangroveGlow" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.1" />
          </linearGradient>

          {/* River flow pattern */}
          <linearGradient id="hooghlyWater" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Grid pattern for GIS feeling */}
          <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.4" strokeOpacity="0.35" />
          </pattern>
        </defs>

        {/* Base Geography Layer */}
        <rect width="1000" height="680" fill="url(#satelliteGlow)" />
        <rect width="1000" height="680" fill="url(#gisGrid)" />

        {/* Topography elevation curves / satellite landscape */}
        <path
          d="M0,80 Q300,120 600,60 T1000,100 L1000,0 L0,0 Z"
          fill="#1b3327"
          opacity="0.6"
        />
        <path
          d="M0,450 Q280,390 550,480 T1000,420 L1000,680 L0,680 Z"
          fill="#162c21"
          opacity="0.8"
        />

        {/* Urban settlements background tint (Kolkata & surrounding municipalities) */}
        <ellipse cx="500" cy="340" rx="360" ry="240" fill="#3b2b18" opacity="0.45" />

        {/* Risk Zones Operational Screening Layers */}
        {/* Green Zone (Low Risk) */}
        <ellipse cx="490" cy="340" rx="320" ry="210" fill="#10b981" opacity="0.22" />
        
        {/* Yellow Zone (Moderate Risk) */}
        <ellipse cx="485" cy="340" rx="240" ry="165" fill="#facc15" opacity="0.32" />

        {/* Orange Zone (High Risk) */}
        <ellipse cx="475" cy="340" rx="170" ry="120" fill="url(#urbanCore)" />

        {/* Red Zone (Very High Risk) */}
        <circle cx="455" cy="335" r="75" fill="url(#redZoneGlow)" />

        {/* The Hooghly River winding through Kolkata & Howrah */}
        <path
          d="M 390,0 
             C 410,100 425,180 395,260 
             C 365,340 375,410 415,480 
             C 455,550 435,620 440,680"
          fill="none"
          stroke="url(#hooghlyWater)"
          strokeWidth="32"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* River inner flow highlight */}
        <path
          d="M 390,0 
             C 410,100 425,180 395,260 
             C 365,340 375,410 415,480 
             C 455,550 435,620 440,680"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="18 12"
          opacity="0.75"
        />

        {/* Canals & Waterways: Circular Canal, Beliaghata, Tolly Nullah */}
        <path
          d="M 395,260 C 470,265 540,280 620,310"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="6"
          opacity="0.7"
        />
        <path
          d="M 415,480 C 490,490 580,520 660,560"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="7"
          opacity="0.7"
        />

        {/* Primary Arteries / Highways */}
        {/* Kona Expressway across Howrah Bridge */}
        <path
          d="M 120,380 C 260,360 365,340 460,340 C 560,340 680,360 840,400"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="3.5"
          opacity="0.5"
        />
        {/* EM Bypass & Belghoria */}
        <path
          d="M 560,110 C 580,240 610,380 570,580"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="3.5"
          opacity="0.5"
        />

        {/* OPTIONAL LAYER 1: Mangrove Protection Layers (Sundarbans Bio-shield) */}
        {showMangroveLayer && (
          <g className="transition-opacity duration-300">
            {/* Coastal Mangrove canopy barrier */}
            <path
              d="M 0,550 C 180,520 340,540 480,590 C 620,640 820,580 1000,560 L 1000,680 L 0,680 Z"
              fill="url(#mangroveGlow)"
              opacity="0.88"
            />
            {/* Mangrove buffer boundary dashed line */}
            <path
              d="M 0,550 C 180,520 340,540 480,590 C 620,640 820,580 1000,560"
              fill="none"
              stroke="#34d399"
              strokeWidth="3"
              strokeDasharray="8 6"
            />
            <g transform="translate(140, 620)">
              <rect width="320" height="34" rx="6" fill="#064e3b" fillOpacity="0.85" stroke="#10b981" strokeWidth="1" />
              <text x="14" y="22" fill="#a7f3d0" fontSize="13" fontWeight="600">
                🌿 Sundarbans Mangrove Bio-shield (-42% Wave Surge)
              </text>
            </g>
          </g>
        )}

        {/* OPTIONAL LAYER 2: Historical Disaster Fingerprint (Amphan 2020 & Yaas 2021) */}
        {showHistoricalLayer && (
          <g className="transition-opacity duration-300">
            {/* Cyclone Amphan Trajectory (May 2020) */}
            <path
              d="M 180,680 C 280,520 440,360 540,80"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="4"
              strokeDasharray="10 8"
              opacity="0.9"
            />
            {/* Surge footprint contour */}
            <path
              d="M 330,420 C 370,300 480,260 580,310 C 640,370 540,490 410,480 Z"
              fill="#fb7185"
              fillOpacity="0.25"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <g transform="translate(480, 140)">
              <rect width="210" height="28" rx="4" fill="#881337" fillOpacity="0.9" stroke="#f43f5e" strokeWidth="1" />
              <text x="10" y="19" fill="#fecdd3" fontSize="12" fontWeight="600">
                ⚠️ Amphan 2020 Track (155 km/h)
              </text>
            </g>
          </g>
        )}

        {/* TASK MANAGEMENT OVERLAY: Ward 17 Red Box & Green Safe Corridor */}
        {showWard17Box && (
          <g>
            {/* Red Box for Ward 17 */}
            <rect
              x="425"
              y="310"
              width="100"
              height="80"
              rx="6"
              fill="#ef4444"
              fillOpacity="0.4"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeDasharray="8 5"
              className="animate-pulse"
            />
            {/* Ward 17 Callout */}
            <g transform="translate(425, 280)">
              <rect width="130" height="26" rx="4" fill="#991b1b" stroke="#fca5a5" strokeWidth="1.5" />
              <text x="10" y="18" fill="#ffffff" fontSize="12" fontWeight="700">
                🚨 WARD 17 (HIGH RISK)
              </text>
            </g>
          </g>
        )}

        {showSafeCorridor && (
          <g>
            {/* Green Line: Safe Logistics Corridor */}
            <path
              d="M 480,350 L 590,360 L 670,420 L 730,520"
              fill="none"
              stroke="#22c55e"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="14 8"
              className="animate-pulse"
            />
            {/* Start and end node */}
            <circle cx="480" cy="350" r="7" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
            <circle cx="730" cy="520" r="9" fill="#16a34a" stroke="#ffffff" strokeWidth="2.5" />
            
            <g transform="translate(560, 460)">
              <rect width="195" height="26" rx="4" fill="#14532d" stroke="#86efac" strokeWidth="1.5" />
              <text x="8" y="18" fill="#dcfce7" fontSize="12" fontWeight="700">
                🟢 Safe Logistics Corridor (EM Bypass)
              </text>
            </g>
          </g>
        )}

        {/* Urban Labels / Cities matching the image */}
        <g className="font-semibold text-slate-100 select-none">
          <text x="495" y="195" fill="#f8fafc" fontSize="15" fontWeight="700" letterSpacing="0.5">Barasat</text>
          <text x="385" y="270" fill="#f8fafc" fontSize="16" fontWeight="700">Dum Dum</text>
          <text x="415" y="325" fill="#f8fafc" fontSize="15" fontWeight="700">Bidhannagar</text>
          <text x="250" y="380" fill="#f8fafc" fontSize="18" fontWeight="800">Howrah</text>
          <text x="450" y="410" fill="#ffffff" fontSize="22" fontWeight="800" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">Kolkata</text>
          <text x="365" y="555" fill="#f8fafc" fontSize="15" fontWeight="700">Sonarpur</text>
        </g>

        {/* Interactive POIs */}
        {filteredPois.map(poi => {
          const px = (poi.x / 100) * 1000;
          const py = (poi.y / 100) * 680;

          let bg = '#3b82f6';
          if (poi.type === 'shelter') bg = poi.status === 'safe' ? '#10b981' : '#f59e0b';
          if (poi.type === 'hospital') bg = '#ef4444';
          if (poi.type === 'police') bg = '#3b82f6';
          if (poi.type === 'fire') bg = '#f97316';
          if (poi.type === 'water') bg = '#06b6d4';
          if (poi.type === 'transport') bg = '#10b981';

          return (
            <g
              key={poi.id}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => setSelectedPoi(poi)}
              transform={`translate(${px}, ${py})`}
            >
              <circle cx="0" cy="0" r="14" fill={bg} stroke="#ffffff" strokeWidth="2.5" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                {poi.type === 'shelter' ? 'S' : poi.type === 'hospital' ? '+' : poi.type === 'police' ? 'P' : poi.type === 'fire' ? 'F' : poi.type === 'water' ? 'W' : 'T'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Top Left Risk Zone Operational Screening Card matching screenshot */}
      <div className={`absolute top-3 left-3 backdrop-blur-md rounded-xl p-3 border shadow-md text-xs max-w-[215px] z-10 transition-colors ${
        isLightMode
          ? 'bg-white/95 text-slate-800 border-slate-200/90'
          : 'bg-slate-900/90 text-slate-200 border-slate-700/80'
      }`}>
        <div className={`font-bold mb-2 text-[11px] leading-tight flex items-center justify-between ${
          isLightMode ? 'text-slate-900' : 'text-slate-100'
        }`}>
          <span>Risk Zone (Operational Screening)</span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
            <span className={isLightMode ? 'text-slate-700 font-medium' : 'text-slate-300'}>Red Zone (Very High Risk)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
            <span className={isLightMode ? 'text-slate-700 font-medium' : 'text-slate-300'}>Orange Zone (High Risk)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" />
            <span className={isLightMode ? 'text-slate-700 font-medium' : 'text-slate-300'}>Yellow Zone (Moderate Risk)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className={isLightMode ? 'text-slate-700 font-medium' : 'text-slate-300'}>Green Zone (Low Risk)</span>
          </div>
        </div>

        {/* Checkbox controls requested in prompt */}
        <div className={`mt-2.5 pt-2 border-t space-y-1.5 ${isLightMode ? 'border-slate-200' : 'border-slate-700/80'}`}>
          <label className={`flex items-center gap-1.5 cursor-pointer text-[11px] ${
            isLightMode ? 'text-slate-700 hover:text-slate-950 font-medium' : 'text-slate-300 hover:text-white'
          }`}>
            <input
              type="checkbox"
              checked={showMangroveLayer}
              onChange={(e) => onToggleMangrove(e.target.checked)}
              className="rounded border-slate-400 text-emerald-600 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Mangrove Protection Layers</span>
          </label>
          <label className={`flex items-center gap-1.5 cursor-pointer text-[11px] ${
            isLightMode ? 'text-slate-700 hover:text-slate-950 font-medium' : 'text-slate-300 hover:text-white'
          }`}>
            <input
              type="checkbox"
              checked={showHistoricalLayer}
              onChange={(e) => onToggleHistorical(e.target.checked)}
              className="rounded border-slate-400 text-rose-600 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Historical Disaster Fingerprint</span>
          </label>
        </div>
      </div>

      {/* Top Right Zoom and Layer Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.2))}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors shadow-xs ${
            isLightMode
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
          }`}
          title="Zoom In"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.85))}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors shadow-xs ${
            isLightMode
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
          }`}
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => setMapStyle(prev => prev === 'satellite' ? 'topography' : 'satellite')}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors shadow-xs ${
            isLightMode
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
          }`}
          title="Toggle Satellite / Topo View"
        >
          <Layers size={16} />
        </button>
      </div>

      {/* Right Side POI Overlay Filters matching screenshot */}
      <div className="absolute bottom-12 right-3 flex flex-col gap-1 z-10">
        {[
          { key: 'shelter', label: 'Shelters', icon: Shield, color: 'text-emerald-500', activeBg: isLightMode ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-emerald-950/90 border-emerald-600 text-emerald-300' },
          { key: 'hospital', label: 'Hospitals', icon: Cross, color: 'text-rose-500', activeBg: isLightMode ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold' : 'bg-rose-950/90 border-rose-600 text-rose-300' },
          { key: 'police', label: 'Police', icon: Shield, color: 'text-blue-500', activeBg: isLightMode ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold' : 'bg-blue-950/90 border-blue-600 text-blue-300' },
          { key: 'fire', label: 'Fire Station', icon: Flame, color: 'text-orange-500', activeBg: isLightMode ? 'bg-orange-50 border-orange-300 text-orange-800 font-bold' : 'bg-orange-950/90 border-orange-600 text-orange-300' },
          { key: 'water', label: 'Water Points', icon: Droplets, color: 'text-cyan-500', activeBg: isLightMode ? 'bg-cyan-50 border-cyan-300 text-cyan-800 font-bold' : 'bg-cyan-950/90 border-cyan-600 text-cyan-300' },
          { key: 'transport', label: 'Transport', icon: Bus, color: 'text-green-500', activeBg: isLightMode ? 'bg-green-50 border-green-300 text-green-800 font-bold' : 'bg-green-950/90 border-green-600 text-green-300' },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activePoiFilter[item.key];
          return (
            <button
              key={item.key}
              onClick={() => toggleFilter(item.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors backdrop-blur-md shadow-xs ${
                isActive
                  ? item.activeBg
                  : isLightMode
                  ? 'bg-white/95 border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-900/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={14} className={item.color} />
              <span className="font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Scale & System Status Indicator */}
      <div className={`absolute bottom-3 left-3 flex items-center gap-3 backdrop-blur-md px-3 py-1.5 rounded-lg border text-[11px] shadow-xs ${
        isLightMode
          ? 'bg-white/95 border-slate-200 text-slate-700'
          : 'bg-slate-900/90 border-slate-700/80 text-slate-300'
      }`}>
        <div className="flex items-center gap-1.5">
          <span className={`border-b-2 border-l-2 border-r-2 w-8 h-1 inline-block ${
            isLightMode ? 'border-slate-600' : 'border-slate-300'
          }`} />
          <span className="font-mono font-semibold">10 km</span>
        </div>
        <span className="text-slate-400">|</span>
        {systemStatusLabel && (
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                systemStatusColor === 'green'
                  ? 'bg-emerald-500'
                  : systemStatusColor === 'amber'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span className={`font-bold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
              {systemStatusLabel}
            </span>
          </div>
        )}
      </div>

      {/* Selected POI Detail Modal Popup */}
      {selectedPoi && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-20">
          <div className={`border rounded-2xl p-4 max-w-sm w-full shadow-2xl transition-colors ${
            isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-mono tracking-wider uppercase ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {selectedPoi.type} Facility
                </span>
                <h4 className={`text-base font-bold mt-0.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  {selectedPoi.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedPoi(null)}
                className={`p-1 cursor-pointer ${isLightMode ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                ✕
              </button>
            </div>
            <div className={`mt-3 text-xs space-y-1.5 ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
              <p>{selectedPoi.details || 'Operational readiness verified by disaster management team.'}</p>
              {selectedPoi.capacity && (
                <div className={`flex justify-between py-1 border-t ${isLightMode ? 'border-slate-100 text-slate-700' : 'border-slate-800 text-slate-400'}`}>
                  <span>Capacity:</span>
                  <span className="font-semibold">{selectedPoi.capacity} people</span>
                </div>
              )}
              <div className={`flex justify-between py-1 border-t ${isLightMode ? 'border-slate-100 text-slate-700' : 'border-slate-800 text-slate-400'}`}>
                <span>Status:</span>
                <span className={`font-semibold ${selectedPoi.status === 'safe' ? (isLightMode ? 'text-emerald-700' : 'text-emerald-400') : (isLightMode ? 'text-amber-700' : 'text-amber-400')}`}>
                  {selectedPoi.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSelectedPoi(null)}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs cursor-pointer shadow-2xs"
              >
                Focus On Map
              </button>
              <button
                onClick={() => setSelectedPoi(null)}
                className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                  isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
