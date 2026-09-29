import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Clock, Users, Shield, Send, 
  CheckCircle2, Map, Radio, MessageSquare, AlertOctagon, X, Route, MapPin
} from 'lucide-react';
import { MapComponent } from '../MapComponent';
import { CityLocation } from '../../types';

// --- DATA MODELS ---
interface AuditLog {
  id: string; 
  type: 'AUTO THREAT' | 'MANUAL PUSH' | 'EVACUATION'; 
  severity: 'CRITICAL' | 'URGENT' | 'WARNING';
  subject: string; 
  directive: string; 
  recipientsCount: number; 
  channels: string[]; 
  dispatchedTime: string; 
  status: string;
}

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', type: 'AUTO THREAT', severity: 'CRITICAL', subject: '🚨 AUTO THREAT: Cyclone Landfall Alert (T-48h)', directive: 'IMD Doppler radar confirms eye trajectory > 150 km/h.', recipientsCount: 5, channels: ['PUSH', 'SMS', 'WHATSAPP'], dispatchedTime: '14 mins ago', status: 'Delivered' },
  { id: 'log-2', type: 'AUTO THREAT', severity: 'URGENT', subject: '⚠️ AUTO THREAT: Lowland Sensor Breach', directive: 'Sensor #S-17 reached 1.94m threshold. Gates shut.', recipientsCount: 4, channels: ['PUSH', 'SMS'], dispatchedTime: '42 mins ago', status: 'Delivered' },
];

const WARD_OPTIONS = [
  { id: 'w17', label: 'Ward 17 (Estuary Zone Alpha)', population: '42,500', route: 'EM Bypass Logistics Corridor', shelters: 'Shelter 1 & Shelter 2' },
  { id: 'w24', label: 'Ward 24 (Riverbank Settlement)', population: '18,200', route: 'Coastal Highway Evacuation Route', shelters: 'Shelter 4' },
  { id: 'w58', label: 'Ward 58 (Topsia Wetlands)', population: '31,000', route: 'Northern Arterial Road', shelters: 'Shelter 7 & Shelter 9' },
  { id: 'w12', label: 'Ward 12 (Industrial Port Sector)', population: '9,450', route: 'Port Authority Heavy Transport Corridor', shelters: 'Shelter 3' },
  { id: 'w04', label: 'Ward 04 (Historic Old City)', population: '65,000', route: 'Central Bazaar One-Way Conversion Route', shelters: 'Shelters 10, 11, & 12' },
];

interface ThreatDetectionModeViewProps {
  city: CityLocation;
  showMangroveLayer: boolean; 
  onToggleMangrove: (val: boolean) => void;
  showHistoricalLayer: boolean; 
  onToggleHistorical: (val: boolean) => void;
  responses?: any;
}

export const ThreatDetectionModeView: React.FC<ThreatDetectionModeViewProps> = ({
  city, 
  showMangroveLayer, 
  onToggleMangrove, 
  showHistoricalLayer, 
  onToggleHistorical,
}) => {
  // --- STATE ---
  const [secondsRemaining, setSecondsRemaining] = useState<number>(48 * 3600 - 18);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  
  // CAP Modal State
  const [isEvacModalOpen, setIsEvacModalOpen] = useState(false);
  const [selectedWardId, setSelectedWardId] = useState<string>('w17');
  const [channelWEA, setChannelWEA] = useState(true);
  const [channelSMS, setChannelSMS] = useState(true);

  // Timer Effect
  useEffect(() => {
    const interval = setInterval(() => setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = String(Math.floor(secondsRemaining / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((secondsRemaining % 3600) / 60)).padStart(2, '0');
  const seconds = String(secondsRemaining % 60).padStart(2, '0');

  const selectedWardData = WARD_OPTIONS.find(w => w.id === selectedWardId) || WARD_OPTIONS[0];

  // --- HANDLERS ---
  const handleAuthorizeEvacuation = () => {
    const activeChannels = [];
    if (channelWEA) activeChannels.push('WEA SIREN');
    if (channelSMS) activeChannels.push('SMS BLAST');

    const newLog: AuditLog = {
      id: `log-${Date.now()}`, 
      type: 'EVACUATION', 
      severity: 'CRITICAL', 
      subject: `🚨 CAP EVACUATION: ${selectedWardData.label.toUpperCase()}`,
      directive: `Mandatory targeted evacuation ordered for ${selectedWardData.population} residents to ${selectedWardData.shelters} via ${selectedWardData.route}.`, 
      recipientsCount: parseInt(selectedWardData.population.replace(',', '')),
      channels: activeChannels.length > 0 ? activeChannels : ['SYS LOG'], 
      dispatchedTime: 'Just now', 
      status: 'Broadcasting'
    };
    
    setAuditLogs([newLog, ...auditLogs]);
    setIsEvacModalOpen(false);
  };

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-300">
      
      {/* 1. Sleek Top Banner & KPIs */}
      <div className="space-y-4">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col xl:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4 w-full xl:w-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                T-48 Hours to Landfall
              </h1>
              
            </div>
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto">
            {/* Clock */}
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-amber-200 rounded-xl shadow-inner flex-1 sm:flex-none">
              <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-lg font-black font-mono text-amber-700 tracking-tight">
                {hours}:{minutes}:{seconds}
              </span>
            </div>
            
            {/* Evacuation Button */}
            <button 
              onClick={() => setIsEvacModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-none whitespace-nowrap"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Issue Targeted Evacuation Order</span>
            </button>
          </div>
        </div>

        {/* KPIs (Now spanning full width properly) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Officers</span>
            <div className="text-sm font-black text-slate-800 flex items-center gap-1.5 mt-1">
              <Users className="w-4 h-4 text-blue-600"/> 12 Active
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Commanders</span>
            <div className="text-sm font-black text-slate-800 flex items-center gap-1.5 mt-1">
              <Shield className="w-4 h-4 text-amber-600"/> 5 Officers
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">At-Risk Population</span>
            <div className="text-sm font-black text-slate-800 flex items-center gap-1.5 mt-1">
              <AlertOctagon className="w-4 h-4 text-rose-600"/> {city.populationFormatted}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Dispatches</span>
            <div className="text-sm font-black text-slate-800 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600"/> {auditLogs.length} Logs
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Map (Left) + Vertical Audit Log Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Interactive Map */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-xl">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Map className="w-4 h-4 text-blue-600" />
              Hazard Forecast Grid & Affected Sectors
            </h3>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">Wind: 135 km/h</span>
          </div>
          <div className="h-[480px] w-full relative overflow-hidden rounded-b-xl z-0">
             <MapComponent
                showMangroveLayer={showMangroveLayer} 
                onToggleMangrove={onToggleMangrove}
                showHistoricalLayer={showHistoricalLayer} 
                onToggleHistorical={onToggleHistorical}
                systemStatusLabel="Threat Level: Amber" 
                systemStatusColor="amber"
                windSpeedSim={135} 
                isLightMode={true}
                pois={[]}
                cityLabel={city.name}
                bounds={{min_lat: city.lat - 0.1, max_lat: city.lat + 0.1, min_lon: city.lng - 0.1, max_lon: city.lng + 0.1} as any}
             />
          </div>
        </div>

        {/* Vertical Audit Log Feed (Redesigned for Narrow Column) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden max-h-[530px]">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between z-10">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Dispatch Audit Log
            </h3>
            <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
              {auditLogs.length} Records
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    log.type === 'AUTO THREAT' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    log.type === 'EVACUATION' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {log.dispatchedTime}
                  </span>
                </div>
                
                <h4 className="font-bold text-xs text-slate-900 leading-tight">
                  {log.subject}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-2">
                  {log.directive}
                </p>
                
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px]">
                  <span className="font-bold text-slate-700">
                    {log.recipientsCount.toLocaleString()} Target(s)
                  </span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5"/> 
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CAP Evacuation Modal --- */}
      {isEvacModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-none">Issue Targeted Evacuation Order</h2>
                  <p className="text-xs text-slate-500 mt-1">Common Alerting Protocol (CAP) Integration</p>
                </div>
              </div>
              <button onClick={() => setIsEvacModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6 bg-white">
              
              {/* Target Ward Dropdown Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Target Municipal Ward / Sector</label>
                <select 
                  value={selectedWardId}
                  onChange={(e) => setSelectedWardId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 hover:bg-slate-100 transition cursor-pointer appearance-none"
                >
                  {WARD_OPTIONS.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      {ward.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Data Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600"><Users className="w-4 h-4 text-blue-500" /> Target Evacuation Population:</span>
                  <span className="font-bold font-mono text-slate-900 tracking-tight">{selectedWardData.population} Residents</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600"><MapPin className="w-4 h-4 text-emerald-500" /> Designated Receiving Shelters:</span>
                  <span className="font-bold text-emerald-700 truncate max-w-[200px] text-right" title={selectedWardData.shelters}>{selectedWardData.shelters}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600"><Route className="w-4 h-4 text-blue-500" /> Designated Safe Route:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[200px] text-right" title={selectedWardData.route}>{selectedWardData.route}</span>
                </div>
              </div>

              {/* Broadcast Channels */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Broadcast Alert Channels</label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition bg-white">
                    <div className="mt-0.5 text-amber-500"><Radio className="w-5 h-5" /></div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">Cell Broadcast Siren (WEA)</div>
                      <div className="text-xs text-slate-500 mt-0.5">High-pitch audible alarm to all mobile devices in geofence</div>
                    </div>
                    <input type="checkbox" checked={channelWEA} onChange={() => setChannelWEA(!channelWEA)} className="w-4 h-4 mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  </label>
                  
                  <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition bg-white">
                    <div className="mt-0.5 text-emerald-500"><MessageSquare className="w-5 h-5" /></div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">Automated SMS Blast</div>
                      <div className="text-xs text-slate-500 mt-0.5">Bengali, Hindi, and English multi-lingual evacuation notices</div>
                    </div>
                    <input type="checkbox" checked={channelSMS} onChange={() => setChannelSMS(!channelSMS)} className="w-4 h-4 mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  </label>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsEvacModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleAuthorizeEvacuation}
                className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" /> Authorize Evacuation
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};