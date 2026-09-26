import React, { useState } from 'react';
import { CloudRain, CloudLightning, Sun, Cloud, Droplet, ArrowRight } from 'lucide-react';
import { WEATHER_FORECAST_DAYS } from '../data/mockData';
import { WeatherDay } from '../types';

interface WeatherHazardChartProps {
  isLightMode?: boolean;
}

export const WeatherHazardChart: React.FC<WeatherHazardChartProps> = ({
  isLightMode = true,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'storm':
        return <CloudLightning size={18} className="text-amber-500" />;
      case 'rain-heavy':
        return <CloudRain size={18} className="text-blue-500" />;
      case 'rain-moderate':
        return <CloudRain size={18} className="text-cyan-500" />;
      case 'rain-light':
        return <CloudRain size={18} className="text-cyan-400" />;
      case 'cloudy-sun':
        return <Cloud size={18} className="text-slate-400" />;
      default:
        return <Sun size={18} className="text-amber-500" />;
    }
  };

  const cardBg = isLightMode
    ? 'bg-white border border-slate-200/90 shadow-xs'
    : 'bg-slate-900/90 border border-slate-800 shadow-sm';
  const headingText = isLightMode ? 'text-slate-900' : 'text-slate-100';
  const labelText = isLightMode ? 'text-slate-500' : 'text-slate-400';
  const linkText = isLightMode ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300';
  const innerBg = isLightMode ? 'bg-slate-50/80 border border-slate-200' : 'bg-slate-950/70 border border-slate-800';
  const gridStroke = isLightMode ? '#e2e8f0' : '#334155';
  const axisFill = isLightMode ? '#64748b' : '#94a3b8';

  return (
    <div className={`${cardBg} rounded-xl p-3.5 flex flex-col justify-between transition-colors`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-bold text-sm ${headingText}`}>
          7-Day Weather & Hazard Forecast
        </h3>
        <button className={`text-xs font-semibold flex items-center gap-1 ${linkText}`}>
          <span>View All</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* 7 Daily Forecast Tiles matching screenshot */}
      <div className="grid grid-cols-7 gap-1.5 text-center mb-3 text-xs">
        {WEATHER_FORECAST_DAYS.map((d, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              hoveredIndex === i
                ? isLightMode
                  ? 'bg-blue-50 border-blue-400 shadow-xs'
                  : 'bg-slate-800 border-blue-500 shadow-md'
                : isLightMode
                ? 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
            }`}
          >
            <div className={`text-[11px] font-bold ${isLightMode ? 'text-slate-800' : 'text-slate-300'}`}>{d.day}</div>
            <div className={`text-[10px] mb-1 ${labelText}`}>{d.date}</div>
            <div className="flex justify-center my-1">
              {getWeatherIcon(d.condition)}
            </div>
            <div className={`text-[11px] font-bold mt-1 ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>
              {d.high}° / {d.low}°
            </div>
            <div className="text-[10px] text-blue-600 flex items-center justify-center gap-0.5 mt-0.5 font-bold">
              <Droplet size={9} />
              <span>{d.rainProb}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dual Axis Chart Container */}
      <div className={`${innerBg} rounded-lg p-3`}>
        {/* Legend */}
        <div className={`flex items-center justify-end gap-4 text-[10px] mb-2 font-semibold ${labelText}`}>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-orange-500 inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block -ml-2.5" />
            <span className={`ml-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>Temperature (°C)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs inline-block" />
            <span className={isLightMode ? 'text-slate-700' : 'text-slate-300'}>Rainfall (mm)</span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative h-28 w-full">
          <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
            {/* Grid lines */}
            {[0, 30, 60, 90].map((y, idx) => (
              <line
                key={idx}
                x1="30"
                y1={y}
                x2="470"
                y2={y}
                stroke={gridStroke}
                strokeWidth="0.8"
                strokeDasharray="4 4"
                opacity={isLightMode ? 0.9 : 0.4}
              />
            ))}

            {/* Left Axis Labels (°C) */}
            <text x="22" y="10" fill={axisFill} fontSize="9" textAnchor="end" fontWeight="500">40</text>
            <text x="22" y="40" fill={axisFill} fontSize="9" textAnchor="end" fontWeight="500">30</text>
            <text x="22" y="70" fill={axisFill} fontSize="9" textAnchor="end" fontWeight="500">20</text>
            <text x="22" y="100" fill={axisFill} fontSize="9" textAnchor="end" fontWeight="500">0</text>

            {/* Right Axis Labels (mm) */}
            <text x="478" y="10" fill="#2563eb" fontSize="9" textAnchor="start" fontWeight="600">100</text>
            <text x="478" y="40" fill="#2563eb" fontSize="9" textAnchor="start" fontWeight="600">75</text>
            <text x="478" y="70" fill="#2563eb" fontSize="9" textAnchor="start" fontWeight="600">25</text>
            <text x="478" y="100" fill="#2563eb" fontSize="9" textAnchor="start" fontWeight="600">0</text>

            {/* Rainfall Bars */}
            {WEATHER_FORECAST_DAYS.map((d, i) => {
              const x = 55 + i * 60;
              const barHeight = (d.rainfallMm / 100) * 85;
              const y = 95 - barHeight;
              const isHovered = hoveredIndex === i;

              return (
                <g key={i}>
                  <rect
                    x={x - 10}
                    y={y}
                    width="20"
                    height={barHeight}
                    rx="3"
                    fill="#3b82f6"
                    fillOpacity={isHovered ? 0.95 : 0.75}
                    className="transition-all"
                  />
                  {/* Bottom Day Date Label */}
                  <text
                    x={x}
                    y="114"
                    fill={axisFill}
                    fontSize="9"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {d.date}
                  </text>
                </g>
              );
            })}

            {/* Temperature Line Path */}
            <path
              d="M 55,34 L 115,31 L 175,37 L 235,40 L 295,35 L 355,32 L 415,29"
              fill="none"
              stroke="#f97316"
              strokeWidth="2.5"
            />

            {/* Temperature Points */}
            {[
              { x: 55, y: 34, val: 35 },
              { x: 115, y: 31, val: 34 },
              { x: 175, y: 37, val: 32 },
              { x: 235, y: 40, val: 31 },
              { x: 295, y: 35, val: 32 },
              { x: 355, y: 32, val: 33 },
              { x: 415, y: 29, val: 34 },
            ].map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#f97316"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};
