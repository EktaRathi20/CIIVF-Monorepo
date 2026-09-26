import React from 'react';
import { 
  ShieldAlert, AlertTriangle, Cpu, CheckCircle2, 
  ArrowRight, ShieldCheck, ChevronRight
} from 'lucide-react';
import { CityLocation } from '../types';

interface AssessmentCardsProps {
  city: CityLocation;
  onOpenWhyModal: () => void;
  onOpenPlanModal: () => void;
  isLightMode?: boolean;
}

export const AssessmentCards: React.FC<AssessmentCardsProps> = ({
  city,
  onOpenWhyModal,
  onOpenPlanModal,
  isLightMode = true,
}) => {
  const cardBg = isLightMode
    ? 'bg-white border border-slate-200/90 shadow-xs'
    : 'bg-slate-900/90 border border-slate-800 shadow-sm';
  const labelText = isLightMode ? 'text-slate-500' : 'text-slate-400';
  const headingText = isLightMode ? 'text-slate-900' : 'text-slate-100';
  const bodyText = isLightMode ? 'text-slate-600' : 'text-slate-300';
  const linkText = isLightMode ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300';
  const borderDivider = isLightMode ? 'border-slate-100' : 'border-slate-800';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
      {/* 1. Official Warning (IMD) */}
      <div className={`${cardBg} rounded-xl p-3.5 flex flex-col justify-between transition-colors`}>
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs">
            {/* National emblem representation / icon */}
            <div className="w-5 h-5 rounded bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-[10px]">
              🏛️
            </div>
            <span className={`font-semibold uppercase tracking-wider text-[11px] ${labelText}`}>
              OFFICIAL WARNING ({city.officialWarning.agency})
            </span>
          </div>

          {/* Orange Warning badge */}
          <div className="inline-block px-3 py-1 rounded-md bg-amber-500 text-slate-950 font-bold text-xs tracking-wider uppercase mb-2 shadow-xs">
            {city.officialWarning.level}
          </div>

          <h3 className={`font-bold text-sm leading-snug ${headingText}`}>
            {city.officialWarning.title}
          </h3>
          <p className={`text-[11px] mt-1 ${labelText}`}>
            {city.officialWarning.validity}
          </p>
        </div>

        <button 
          onClick={onOpenPlanModal}
          className={`mt-3 text-xs font-semibold flex items-center gap-1 group self-start ${linkText}`}
        >
          <span>View Details</span>
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* 2. ClimaGuard Operational Risk */}
      <div className={`${cardBg} rounded-xl p-3.5 flex flex-col justify-between transition-colors`}>
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-xs">
            <ShieldAlert size={14} className="text-amber-500" />
            <span className={`font-semibold uppercase tracking-wider text-[11px] ${labelText}`}>
              CLIMAGUARD OPERATIONAL RISK
            </span>
          </div>

          {/* Operational Risk Badge and Score */}
          <div className="flex items-center gap-3 mb-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-bold text-xs shadow-xs">
              <ShieldAlert size={14} />
              <span>{city.operationalRisk.level}</span>
            </div>
            <div className={`text-2xl font-bold font-mono ${headingText}`}>
              {city.operationalRisk.score} <span className={`text-xs font-sans font-normal ${labelText}`}>/ 100</span>
            </div>
          </div>

          {/* Key Risk Factors */}
          <div className="text-xs">
            <div className={`text-[11px] font-semibold mb-1 ${labelText}`}>Key Risk Factors:</div>
            <ul className={`space-y-1 text-[11px] list-disc list-inside ${bodyText}`}>
              {city.operationalRisk.factors.map((factor, i) => (
                <li key={i} className="truncate">{factor}</li>
              ))}
            </ul>
          </div>
        </div>

        <button 
          onClick={onOpenPlanModal}
          className={`mt-3 text-xs font-semibold flex items-center gap-1 group self-start ${linkText}`}
        >
          <span>View Details</span>
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* 3. AI Preparedness Brief */}
      <div className={`${cardBg} rounded-xl p-3.5 flex flex-col justify-between transition-colors`}>
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-xs">
            <Cpu size={14} className="text-blue-600" />
            <span className={`font-semibold uppercase tracking-wider text-[11px] ${labelText}`}>
              AI PREPAREDNESS BRIEF
            </span>
          </div>

          <p className={`text-xs leading-relaxed line-clamp-4 ${bodyText}`}>
            {city.aiPreparednessBrief.summary}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onOpenWhyModal}
            className={`px-3 py-1.5 font-semibold rounded-lg text-xs transition-colors border ${
              isLightMode
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            Why?
          </button>
          <button
            onClick={onOpenPlanModal}
            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs text-center"
          >
            View Full Plan
          </button>
        </div>
      </div>

      {/* 4. Evidence Quality */}
      <div className={`${cardBg} rounded-xl p-3.5 flex flex-col justify-between transition-colors`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-semibold uppercase tracking-wider text-[11px] ${labelText}`}>
              EVIDENCE QUALITY
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isLightMode
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {city.evidenceQuality.rating}
            </span>
          </div>

          {/* List of Evidence verification items */}
          <div className="grid grid-cols-1 gap-1 text-[11px]">
            {city.evidenceQuality.items.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                <span className={`truncate font-medium ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`mt-2 pt-2 border-t ${borderDivider} text-[10px] ${labelText} font-mono`}>
          Last assessment: {city.evidenceQuality.lastAssessment}
        </div>
      </div>
    </div>
  );
};
