import React from 'react';
import { 
  Globe2, ArrowRight, Waves, Wind, Sun, 
  Flame, CloudLightning, AlertCircle, ShieldCheck
} from 'lucide-react';

interface RightColumnCardsProps {
  isLightMode?: boolean;
}

export const RightColumnCards: React.FC<RightColumnCardsProps> = ({
  isLightMode = true,
}) => {
  const affectedRegions = [
    { type: 'Floods', icon: Waves, color: 'text-blue-500', regions: 'Asia, Africa, Americas' },
    { type: 'Cyclones', icon: Wind, color: 'text-amber-500', regions: 'Indian Ocean, Pacific' },
    { type: 'Droughts', icon: Sun, color: 'text-yellow-500', regions: 'Africa, Australia, Americas' },
    { type: 'Wildfires', icon: Flame, color: 'text-orange-500', regions: 'North America, Australia, Mediterranean' },
    { type: 'Heat Waves', icon: Sun, color: 'text-rose-500', regions: 'Europe, Asia, North America' },
    { type: 'Storms', icon: CloudLightning, color: 'text-purple-500', regions: 'Coastal regions worldwide' },
  ];

  const recentAlerts = [
    {
      title: 'Heavy Rainfall Warning',
      location: 'West Bengal',
      source: 'IMD',
      time: '24 Sep, 13:00 IST',
      urgency: 'high',
      icon: '🚨'
    },
    {
      title: 'Rising River Levels',
      location: 'Hooghly',
      source: 'GloFAS',
      time: '24 Sep, 11:30 IST',
      urgency: 'warning',
      icon: '🌊'
    },
    {
      title: 'Flood Risk',
      location: 'Neighboring District (North 24 Parganas)',
      source: 'ClimaGuard',
      time: '24 Sep, 10:15 IST',
      urgency: 'moderate',
      icon: '⚠️'
    }
  ];

  const cardBg = isLightMode
    ? 'bg-white border border-slate-200/90 shadow-xs'
    : 'bg-slate-900/90 border border-slate-800 shadow-sm';
  const headingText = isLightMode ? 'text-slate-900' : 'text-slate-100';
  const labelText = isLightMode ? 'text-slate-500' : 'text-slate-400';
  const linkText = isLightMode ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300';
  const dividerBorder = isLightMode ? 'border-slate-100' : 'border-slate-800/60';

  return (
    <div className="space-y-4">
      {/* 1. Global Climate Vulnerability */}
      <div className={`${cardBg} rounded-xl p-3.5 transition-colors`}>
        <div className="flex items-center justify-between mb-2.5">
          <div className={`flex items-center gap-1.5 font-bold text-sm ${headingText}`}>
            <Globe2 size={15} className="text-blue-600" />
            <span>Global Climate Vulnerability</span>
          </div>
          <button className={`text-xs font-semibold flex items-center gap-1 ${linkText}`}>
            <span>View All</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Global World Map Heatmap Graphic matching clean light theme */}
        <div className={`relative h-28 w-full rounded-lg overflow-hidden border mb-3 shadow-2xs ${
          isLightMode ? 'border-slate-200 bg-[#eef3f8]' : 'border-slate-800 bg-slate-950'
        }`}>
          <svg viewBox="0 0 400 180" className="w-full h-full">
            <defs>
              <radialGradient id="vulnerabilityHotspot" cx="55%" cy="48%" r="40%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#f97316" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#eab308" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
              </radialGradient>
            </defs>

            {/* Ocean background */}
            <rect width="400" height="180" fill={isLightMode ? "#e8eff6" : "#091428"} />

            {/* Stylized World Continents */}
            <path d="M 40,30 Q 80,25 110,45 Q 90,75 70,85 Q 50,70 30,50 Z" fill={isLightMode ? "#cbd5e1" : "#1e293b"} />
            <path d="M 80,95 Q 110,105 105,145 Q 90,165 75,135 Z" fill={isLightMode ? "#cbd5e1" : "#1e293b"} />
            <path d="M 160,30 Q 200,32 195,55 Q 165,58 155,45 Z" fill={isLightMode ? "#cbd5e1" : "#1e293b"} />
            <path d="M 160,65 Q 210,65 205,115 Q 185,150 165,115 Z" fill={isLightMode ? "#cbd5e1" : "#1e293b"} />
            <path d="M 215,25 Q 310,25 320,70 Q 280,100 240,80 Q 230,60 215,50 Z" fill={isLightMode ? "#cbd5e1" : "#1e293b"} />
            <path d="M 300,115 Q 350,115 345,150 Q 305,155 295,130 Z" fill={isLightMode ? "#cbd5e1" : "#1e293b"} />

            {/* Vulnerability Heatmap Overlay Centered on South Asia / Indian Ocean / SE Asia */}
            <ellipse cx="255" cy="72" rx="75" ry="40" fill="url(#vulnerabilityHotspot)" />
            <ellipse cx="90" cy="75" rx="35" ry="20" fill="#f97316" fillOpacity="0.4" />
            <ellipse cx="185" cy="90" rx="30" ry="25" fill="#ef4444" fillOpacity="0.4" />

            {/* Indicator Ping on Kolkata/Bay of Bengal */}
            <circle cx="258" cy="68" r="4" fill="#ef4444" className="animate-ping" />
            <circle cx="258" cy="68" r="3" fill="#dc2626" />
          </svg>
        </div>

        {/* Most Affected Regions */}
        <div>
          <div className={`text-[11px] font-bold mb-2 ${labelText}`}>
            Most Affected Regions <span className="text-[10px] font-normal">(historical data)</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {affectedRegions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className={`flex items-center justify-between text-[11px] py-1 border-b last:border-0 ${dividerBorder}`}>
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} className={item.color} />
                    <span className={`font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                      {item.type}
                    </span>
                  </div>
                  <span className={`truncate max-w-[170px] text-right font-medium ${labelText}`}>
                    {item.regions}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Recent Alerts */}
      <div className={`${cardBg} rounded-xl p-3.5 transition-colors`}>
        <div className="flex items-center justify-between mb-2.5">
          <div className={`flex items-center gap-1.5 font-bold text-sm ${headingText}`}>
            <AlertCircle size={15} className="text-rose-500" />
            <span>Recent Alerts</span>
          </div>
          <button className={`text-xs font-semibold flex items-center gap-1 ${linkText}`}>
            <span>View All</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="space-y-2">
          {recentAlerts.map((alert, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-lg border transition-colors flex items-start gap-2.5 ${
                isLightMode
                  ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/70'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                alert.urgency === 'high' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                alert.urgency === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {alert.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`font-semibold text-xs truncate ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>
                  {alert.title} <span className={`font-normal ${labelText}`}>- {alert.location}</span>
                </div>
                <div className={`text-[10px] font-mono mt-0.5 ${labelText}`}>
                  {alert.source} <span className="opacity-40">|</span> {alert.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Safety Verification Banner */}
      <div className="rounded-xl p-3 bg-emerald-50/80 border border-emerald-200 shadow-2xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div>
          <div className="font-bold text-slate-900 text-xs leading-snug">
            Verified Official Early Warning Protocol
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Always verify official alerts and follow municipal emergency directives.
          </p>
        </div>
      </div>
    </div>
  );
};
