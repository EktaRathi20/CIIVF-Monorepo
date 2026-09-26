import React, { useState } from 'react';
import { 
  History, Search, Filter, ShieldCheck, Wind, Waves, 
  Users, MapPin, ExternalLink, ChevronRight, X, AlertTriangle, 
  Layers, CheckCircle2, TrendingDown, Eye, FileText, ArrowUpDown
} from 'lucide-react';
import { HISTORICAL_DISASTERS } from '../data/mockData';
import { HistoricalDisaster } from '../types';

interface HistoricalDisastersViewProps {
  onBackToOverview?: () => void;
}

export const HistoricalDisastersView: React.FC<HistoricalDisastersViewProps> = ({
  onBackToOverview
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHazard, setSelectedHazard] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'year_desc' | 'year_asc' | 'wind_desc' | 'surge_desc'>('year_desc');
  const [selectedDisaster, setSelectedDisaster] = useState<HistoricalDisaster | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter and sort disasters
  const filteredDisasters = HISTORICAL_DISASTERS.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.impactedAreas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.year.toString().includes(searchQuery);

    const matchesHazard = selectedHazard === 'all' || item.hazardType === selectedHazard;

    return matchesSearch && matchesHazard;
  }).sort((a, b) => {
    if (sortBy === 'year_desc') return b.year - a.year;
    if (sortBy === 'year_asc') return a.year - b.year;
    if (sortBy === 'wind_desc') return b.windSpeedMaxKmH - a.windSpeedMaxKmH;
    if (sortBy === 'surge_desc') return b.surgeHeightM - a.surgeHeightM;
    return 0;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
            <History size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Historical Disaster Archive & Fingerprint Database
              </h1>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                Retrospective Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Empirical historical cyclone and storm surge archive across the Bay of Bengal & Arabian Sea basin. 
              Calibrated via IMD Doppler, Copernicus Sentinel-1 SAR flood indices, and Google Earth Engine (GEE) bio-shield benchmarks.
            </p>
          </div>
        </div>

        {onBackToOverview && (
          <button
            onClick={onBackToOverview}
            className="self-start md:self-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors whitespace-nowrap"
          >
            ← Back to Live Operations
          </button>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Cataloged Historical Events</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">7 Events</div>
          <div className="text-[10px] text-slate-400 mt-0.5">1999–2024 Basin Record</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Peak Recorded Historic Wind</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">260 km/h</div>
          <div className="text-[10px] text-slate-400 mt-0.5">1999 Odisha Super Cyclone</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Avg. Mangrove Buffer Reduction</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">-38.4%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Surge kinetic energy absorbed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Total Lives Safely Evacuated</div>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1">4.8+ Million</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across modern shelter corridors</div>
        </div>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cyclone name, region, or year..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Hazard Level Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Hazards' },
            { id: 'Super Cyclone', label: 'Super Cyclone' },
            { id: 'Extremely Severe', label: 'Extremely Severe' },
            { id: 'Very Severe', label: 'Very Severe' },
            { id: 'Severe Cyclonic Storm', label: 'Severe' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedHazard(item.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedHazard === item.id
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Sort & View Mode Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown size={13} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="year_desc">Year (Newest First)</option>
              <option value="year_asc">Year (Oldest First)</option>
              <option value="wind_desc">Peak Wind (Highest)</option>
              <option value="surge_desc">Storm Surge (Highest)</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                viewMode === 'cards' ? 'bg-white shadow-xs text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-xs text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Disaster List (Cards View) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDisasters.map((disaster) => {
            const isSuper = disaster.hazardType === 'Super Cyclone';
            const isExtremelySevere = disaster.hazardType === 'Extremely Severe';

            return (
              <div
                key={disaster.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-sm transition-all duration-150 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Title, Year, Hazard Tag */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {disaster.name}
                        </h2>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {disaster.year}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{disaster.impactedAreas}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap border ${
                      isSuper
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : isExtremelySevere
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {disaster.category}
                    </span>
                  </div>

                  {/* 4 Metric Badges Strip */}
                  <div className="grid grid-cols-4 gap-2 my-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                        <Wind size={11} className="text-blue-600" /> Peak Wind
                      </div>
                      <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                        {disaster.peakGusts}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                        <Waves size={11} className="text-cyan-600" /> Surge Ht.
                      </div>
                      <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                        {disaster.stormSurge}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                        <Users size={11} className="text-emerald-600" /> Evacuated
                      </div>
                      <div className="font-mono font-bold text-xs text-slate-900 mt-0.5 truncate px-1">
                        {disaster.displaced}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500">Inundated</div>
                      <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                        {disaster.inundatedWardsCount} Wards
                      </div>
                    </div>
                  </div>

                  {/* Operational Narrative Description */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                    {disaster.description}
                  </p>

                  {/* Key Lessons Applied */}
                  <div className="space-y-1.5 mb-4">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Municipal Disaster Takeaways & Upgrades
                    </div>
                    {disaster.lessonsApplied.slice(0, 2).map((lesson, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{lesson}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Strip & Action Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]" title={disaster.satelliteTag}>
                    🛰️ {disaster.satelliteTag}
                  </span>

                  <button
                    onClick={() => setSelectedDisaster(disaster)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold rounded-lg text-xs flex items-center gap-1 transition-all border border-blue-200 shrink-0"
                  >
                    <Eye size={13} />
                    <span>View Dossier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View Alternative */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Cyclone / Event</th>
                  <th className="p-3.5">Landfall Date</th>
                  <th className="p-3.5">Hazard Scale</th>
                  <th className="p-3.5">Peak Gusts</th>
                  <th className="p-3.5">Storm Surge</th>
                  <th className="p-3.5">Evacuated / Impact</th>
                  <th className="p-3.5">Economic Loss</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDisasters.map((disaster) => (
                  <tr key={disaster.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{disaster.name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{disaster.impactedAreas}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {disaster.date}
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        disaster.hazardType === 'Super Cyclone'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : disaster.hazardType === 'Extremely Severe'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {disaster.hazardType}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {disaster.peakGusts}
                    </td>
                    <td className="p-3.5 font-mono text-cyan-700 font-semibold whitespace-nowrap">
                      {disaster.stormSurge}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{disaster.displaced}</div>
                      <div className="text-[10px] text-slate-500">{disaster.inundatedWardsCount} wards inundated</div>
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono whitespace-nowrap">
                      {disaster.economicDamage}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedDisaster(disaster)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-md font-medium text-xs transition-colors border border-blue-200"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDisasters.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <History size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Historical Disasters Matched</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to view all cataloged events.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedHazard('all');
            }}
            className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Retrospective Disaster Detail Modal */}
      {selectedDisaster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div 
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedDisaster.name} ({selectedDisaster.year})</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedDisaster.hazardType === 'Super Cyclone'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {selectedDisaster.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{selectedDisaster.date} · {selectedDisaster.impactedAreas}</p>
              </div>
              <button
                onClick={() => setSelectedDisaster(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Detailed Metrics Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500">Peak Gust Velocity</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{selectedDisaster.peakGusts}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500">Max Storm Surge</div>
                  <div className="text-lg font-bold font-mono text-cyan-700 mt-0.5">{selectedDisaster.stormSurge}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500">Economic Damage</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{selectedDisaster.economicDamage}</div>
                </div>
              </div>

              {/* Comprehensive Retrospective Narrative */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1.5">Historical Event Analysis & Landfall Impact</h4>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {selectedDisaster.description}
                </p>
              </div>

              {/* Bio-Shielding & Mangrove Impact */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-900 font-bold mb-1">
                  <ShieldCheck size={16} className="text-emerald-700" />
                  Ecosystem Bio-Shielding Observation
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Geospatial post-disaster assessments proved that coastal sectors protected by intact mangrove corridors (Sundarbans & Bhitarkanika) experienced between 30% to 55% reduction in wave momentum, saving tens of thousands of homes compared to deforested embankments.
                </p>
              </div>

              {/* Lessons Learned */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">ClimaGuard Architecture Adaptations Derived From This Event</h4>
                <div className="space-y-2">
                  {selectedDisaster.lessonsApplied.map((lesson, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span className="text-slate-700 font-medium">{lesson}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Satellite Tag */}
              <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-mono">🛰️ {selectedDisaster.satelliteTag}</span>
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                  Copernicus EMS Verified
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedDisaster(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
