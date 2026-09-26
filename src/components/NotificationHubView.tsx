import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Shield, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Smartphone, 
  Radio, 
  MessageSquare, 
  PhoneCall, 
  Zap, 
  Check, 
  ChevronDown, 
  ArrowLeft
} from 'lucide-react';

interface Officer {
  id: string;
  name: string;
  role: string;
  rank: string;
  department: string;
  phone: string;
  deviceId: string;
  isKeyOfficer: boolean;
  avatarIcon: 'gov' | 'military' | 'engineer' | 'medical' | 'police' | 'port';
}

const ALL_OFFICERS: Officer[] = [
  {
    id: 'off-1',
    name: 'Dr. Aarav Sundaram, IAS',
    role: 'Municipal Commissioner & DDMA Head',
    rank: 'Apex Level 5',
    department: 'Municipal Administration & DDMA',
    phone: '+91 94401 23456',
    deviceId: 'govpush-ap-ddma-001',
    isKeyOfficer: true,
    avatarIcon: 'gov',
  },
  {
    id: 'off-2',
    name: 'Col. Vikram Rathore (Retd.)',
    role: 'NDRF 10th Battalion Commandant',
    rank: 'Tactical Level 4',
    department: 'National Disaster Response Force (NDRF)',
    phone: '+91 98110 98765',
    deviceId: 'govpush-ndrf-10bn-042',
    isKeyOfficer: true,
    avatarIcon: 'military',
  },
  {
    id: 'off-3',
    name: 'Er. Ananya Sharma',
    role: 'Chief Drainage & Sluice SCADA Lead',
    rank: 'Field Level 3',
    department: 'Irrigation & Water Resources Dept',
    phone: '+91 97003 44123',
    deviceId: 'govpush-scada-w17-09',
    isKeyOfficer: true,
    avatarIcon: 'engineer',
  },
  {
    id: 'off-4',
    name: 'Dr. Rajeshwari Sen, FIAI',
    role: 'Parametric Insurance & SDRF Relief Auditor',
    rank: 'Financial Risk Level 4',
    department: 'State Disaster Management Authority (SDMA)',
    phone: '+91 98200 81122',
    deviceId: 'govpush-sdma-risk-04',
    isKeyOfficer: true,
    avatarIcon: 'gov',
  },
  {
    id: 'off-5',
    name: 'Dr. K. Srinivas, MS',
    role: 'Director of Emergency Health & Trauma Services',
    rank: 'Medical Level 4',
    department: 'King George Hospital & EMS Network',
    phone: '+91 98480 11234',
    deviceId: 'govpush-ems-kgh-01',
    isKeyOfficer: true,
    avatarIcon: 'medical',
  },
  {
    id: 'off-6',
    name: 'Shri T. Mohan Rao, IPS',
    role: 'Superintendent of Police (Coastal Security)',
    rank: 'Law Enforcement Level 4',
    department: 'Coastal Security Police Wing',
    phone: '+91 94407 88901',
    deviceId: 'govpush-police-coast-02',
    isKeyOfficer: false,
    avatarIcon: 'police',
  },
  {
    id: 'off-7',
    name: 'Er. Sandeep Mukherjee',
    role: 'Superintending Engineer (Embankments)',
    rank: 'Field Level 3',
    department: 'Public Works Department (PWD)',
    phone: '+91 98301 22345',
    deviceId: 'govpush-pwd-embank-11',
    isKeyOfficer: false,
    avatarIcon: 'engineer',
  },
  {
    id: 'off-8',
    name: 'Capt. R. K. Nair',
    role: 'Director of Marine Operations',
    rank: 'Port Operations Level 4',
    department: 'Visakhapatnam Port Authority',
    phone: '+91 98205 33456',
    deviceId: 'govpush-port-ops-07',
    isKeyOfficer: false,
    avatarIcon: 'port',
  },
  {
    id: 'off-9',
    name: 'Smt. V. Meenakshi',
    role: 'Joint Collector (Civil Supplies & Relief Logistics)',
    rank: 'Civil Admin Level 4',
    department: 'Civil Supplies & Food Distribution',
    phone: '+91 94409 66789',
    deviceId: 'govpush-civil-supplies-03',
    isKeyOfficer: false,
    avatarIcon: 'gov',
  },
  {
    id: 'off-10',
    name: 'Er. Pradeep Verma',
    role: 'Chief Transmission Officer (Substations)',
    rank: 'Grid Resiliency Level 3',
    department: 'AP Eastern Power Distribution Co.',
    phone: '+91 94901 55678',
    deviceId: 'govpush-power-grid-15',
    isKeyOfficer: false,
    avatarIcon: 'engineer',
  },
  {
    id: 'off-11',
    name: 'Dr. N. Chandrasekhar',
    role: 'Zonal Epidemiologist & Sanitation Chief',
    rank: 'Public Health Level 3',
    department: 'Municipal Health Directorate',
    phone: '+91 98495 77890',
    deviceId: 'govpush-health-zonal-05',
    isKeyOfficer: false,
    avatarIcon: 'medical',
  },
  {
    id: 'off-12',
    name: 'Shri B. Jagannath',
    role: 'Regional Fire & Search Extrication Officer',
    rank: 'Tactical Level 3',
    department: 'State Disaster Fire Services',
    phone: '+91 94411 99012',
    deviceId: 'govpush-fire-rescue-08',
    isKeyOfficer: false,
    avatarIcon: 'military',
  },
];

interface AuditLog {
  id: string;
  type: 'AUTO THREAT' | 'MANUAL PUSH';
  severity: 'CRITICAL' | 'URGENT' | 'WARNING' | 'ADVISORY';
  subject: string;
  directive: string;
  recipientsCount: number;
  recipientsPreview: string;
  channels: string[];
  dispatchedTime: string;
  status: string;
}

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    type: 'AUTO THREAT',
    severity: 'CRITICAL',
    subject: '🚨 AUTOMATIC THREAT TRIGGER: Cyclone Hudhud-Analog Landfall Alert (T-48h)',
    directive: 'IMD synoptic forecast Doppler radar eye trajectory confirmation with wind speeds exceeding 150 km/h.',
    recipientsCount: 5,
    recipientsPreview: 'Dr. Aarav Sun...',
    channels: ['PUSH', 'SMS', 'WHATSAPP', 'WEA'],
    dispatchedTime: '14 minutes ago',
    status: '100% Delivered',
  },
  {
    id: 'log-2',
    type: 'AUTO THREAT',
    severity: 'URGENT',
    subject: '⚠️ AUTOMATIC THREAT TRIGGER: Ward 17 Lowland Inundation Sensor Breach',
    directive: 'Telemetry sensor #S-17 reached 1.94m threshold. Tidal estuary surge gate auto-shut engaged.',
    recipientsCount: 4,
    recipientsPreview: 'Col. Vikram R...',
    channels: ['PUSH', 'SMS'],
    dispatchedTime: '42 minutes ago',
    status: '100% Delivered',
  },
  {
    id: 'log-3',
    type: 'MANUAL PUSH',
    severity: 'WARNING',
    subject: '📢 Operational Readiness Check: 44 Cyclone Shelters Stocking Verification',
    directive: 'All shelter superintendents confirm generator diesel and rations stockpiled for 72 hours.',
    recipientsCount: 4,
    recipientsPreview: 'Dr. Aarav Sun...',
    channels: ['PUSH', 'WHATSAPP'],
    dispatchedTime: '2 hours ago',
    status: '100% Delivered',
  },
];

interface NotificationHubViewProps {
  onBack?: () => void;
}

export const NotificationHubView: React.FC<NotificationHubViewProps> = ({ onBack }) => {
  // Selected officers
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>([
    'off-1', 'off-2', 'off-3', 'off-4', 'off-5'
  ]);
  
  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Push form state
  const [alertSeverity, setAlertSeverity] = useState<'CRITICAL' | 'URGENT' | 'WARNING' | 'ADVISORY'>('CRITICAL');
  const [channels, setChannels] = useState<{ [key: string]: boolean }>({
    push: true,
    cellBroadcast: true,
    sms: true,
    whatsapp: true,
  });
  const [alertSubject, setAlertSubject] = useState('EMERGENCY: Rapid Cyclone Escalation Threat Order');
  const [payloadText, setPayloadText] = useState(
    'IMD radar confirms cyclone eye landfall track centered on Visakhapatnam coast. Wind speeds gusting to 155 km/h with 2.8m tidal surge. All designated incident commanders activate standard operating procedures immediately.'
  );

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [dispatchSuccessToast, setDispatchSuccessToast] = useState<string | null>(null);

  // Template handling
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    if (val === 't48') {
      setAlertSubject('EMERGENCY: Rapid Cyclone Escalation Threat Order');
      setPayloadText('IMD radar confirms cyclone eye landfall track centered on Visakhapatnam coast. Wind speeds gusting to 155 km/h with 2.8m tidal surge. All designated incident commanders activate standard operating procedures immediately.');
      setAlertSeverity('CRITICAL');
    } else if (val === 'sluice') {
      setAlertSubject('URGENT: Estuary Sluice Gate 4 Overtopping Alert');
      setPayloadText('Canal 4 hydraulic sensor reports estuarine surge of 2.1m. Ward 17 field engineers deploy secondary sandbag bulkheads and clear downstream culverts.');
      setAlertSeverity('URGENT');
    } else if (val === 'evac') {
      setAlertSubject('MANDATORY EVACUATION: Coastal Wards 17 & 8 Zone Alpha');
      setPayloadText('District Magistrate orders mandatory evacuation of all coastal settlements within 1.5km of high-tide line to designated Multi-Hazard Shelters 1 through 6.');
      setAlertSeverity('CRITICAL');
    } else if (val === 'medical') {
      setAlertSubject('ADVISORY: Trauma & Blood Bank 72-Hour Stocking Protocol');
      setPayloadText('All Level-1 hospitals verify diesel generator fuel reserves, emergency oxygen manifolds, and critical surgical staff shifts for landfall zero hour.');
      setAlertSeverity('WARNING');
    }
  };

  const handleToggleOfficer = (id: string) => {
    setSelectedOfficerIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectKeyOfficers = () => {
    setSelectedOfficerIds(['off-1', 'off-2', 'off-3', 'off-4', 'off-5']);
  };

  const handleSelectAll = () => {
    setSelectedOfficerIds(ALL_OFFICERS.map(o => o.id));
  };

  const handleClearSelection = () => {
    setSelectedOfficerIds([]);
  };

  const handleFireSimulatedThreat = () => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      type: 'AUTO THREAT',
      severity: 'CRITICAL',
      subject: '⚡ AUTOMATIC THREAT TRIGGER: Rapid Cyclone Yaas-02B Intensification (>1.8m Surge)',
      directive: 'Automated sensor handshake triggered push broadcast to 5 Key Incident Commanders under Section 34 DMA.',
      recipientsCount: 5,
      recipientsPreview: '5 Key Incident Commanders',
      channels: ['PUSH', 'SMS', 'WHATSAPP', 'WEA'],
      dispatchedTime: 'Just now',
      status: '100% Delivered',
    };
    setAuditLogs([newLog, ...auditLogs]);
    setDispatchSuccessToast('Simulated DMA Section 34 threat trigger fired! 5 Key Incident Commanders alerted.');
    setTimeout(() => setDispatchSuccessToast(null), 5000);
  };

  const handleSendPush = () => {
    if (selectedOfficerIds.length === 0) {
      alert('Please select at least one officer recipient.');
      return;
    }
    const activeChannels = Object.entries(channels)
      .filter(([_, val]) => val)
      .map(([key]) => key.toUpperCase());

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      type: 'MANUAL PUSH',
      severity: alertSeverity,
      subject: alertSubject,
      directive: payloadText.slice(0, 95) + '...',
      recipientsCount: selectedOfficerIds.length,
      recipientsPreview: `${selectedOfficerIds.length} Officers`,
      channels: activeChannels.length > 0 ? activeChannels : ['PUSH'],
      dispatchedTime: 'Just now',
      status: '100% Delivered',
    };

    setAuditLogs([newLog, ...auditLogs]);
    setDispatchSuccessToast(`Emergency push dispatched successfully to ${selectedOfficerIds.length} officers across ${activeChannels.join(', ')}!`);
    setTimeout(() => setDispatchSuccessToast(null), 5000);
  };

  const filteredOfficers = ALL_OFFICERS.filter(off => {
    const matchesSearch = 
      off.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.phone.includes(searchQuery);
    
    if (departmentFilter === 'all') return matchesSearch;
    return matchesSearch && off.department.toLowerCase().includes(departmentFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Top Navigation if returning to overview */}
      {onBack && (
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard Overview</span>
          </button>
          <span className="text-xs font-mono text-slate-500">GovPush Dispatch Console v4.2</span>
        </div>
      )}

      {/* Toast Notification */}
      {dispatchSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-600 text-white font-medium text-xs flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{dispatchSuccessToast}</span>
          </div>
          <button onClick={() => setDispatchSuccessToast(null)} className="text-white/80 hover:text-white font-bold ml-4 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* 1. Top KPI Row - Clean Light Mode */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Registered Officers */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              REGISTERED OFFICERS
            </span>
            <div className="mt-2 text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>12 Active</span>
            </div>
            <div className="mt-1 text-[11px] text-emerald-700 font-medium">
              100% Device Push Handshake
            </div>
          </div>

          {/* Card 2: Key Incident Commanders */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              KEY INCIDENT COMMANDERS
            </span>
            <div className="mt-2 text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>5 Officers</span>
            </div>
            <div className="mt-1 text-[11px] text-amber-800 font-medium">
              Auto-Triggered on Threat Influx
            </div>
          </div>

          {/* Card 3: Selected Recipients */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              SELECTED RECIPIENTS
            </span>
            <div className="mt-2 text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>{selectedOfficerIds.length} Target</span>
            </div>
            <div className="mt-1 text-[11px] text-blue-700 font-medium">
              Ready for immediate dispatch
            </div>
          </div>

          {/* Card 4: Alerts Dispatched */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              ALERTS DISPATCHED
            </span>
            <div className="mt-2 text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{auditLogs.length} Logs</span>
            </div>
            <div className="mt-1 text-[11px] text-emerald-700 font-medium">
              Full Audit Trail Retained
            </div>
          </div>
        </div>
      </div>

      {/* 2. Automated Threat Alert Trigger Protocol Banner - Clean Light Style */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Automated Threat Alert Trigger Protocol (Section 34 DMA)
            </h3>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              When meteorological or hydrological sensors detect a rapid cyclone intensification or storm surge breach (&gt;1.8m), the system <strong className="font-semibold text-slate-900">automatically dispatches instant push alerts</strong> to the <strong className="font-semibold text-slate-900">5 Key Incident Commanders</strong> without manual intervention.
            </p>
          </div>
        </div>

        <button
          onClick={handleFireSimulatedThreat}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-2xs cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Fire Simulated Threat Trigger</span>
        </button>
      </div>

      {/* 3. Middle Section: Two Columns (Officers Directory + Compose Push & Lockscreen Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select Officers & Responders Directory (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Select Officers & Responders Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Choose specific recipients or select quick groups for emergency push delivery
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {selectedOfficerIds.length} of {ALL_OFFICERS.length} Selected
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSelectKeyOfficers}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-current" />
                <span>Select Key Officers (5)</span>
              </button>
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-slate-700" />
                <span>Select All ({ALL_OFFICERS.length})</span>
              </button>
              <button
                onClick={handleClearSelection}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 font-semibold text-xs transition cursor-pointer"
              >
                Clear Selection
              </button>
            </div>

            {/* Search & Department Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, role, phone, or department..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Departments ({ALL_OFFICERS.length})</option>
                <option value="Municipal">Municipal / DDMA</option>
                <option value="NDRF">NDRF Tactical</option>
                <option value="Water">Irrigation / Drainage</option>
                <option value="SDMA">SDMA Insurance / Relief</option>
                <option value="Health">Emergency Medical / KGH</option>
                <option value="Police">Coastal Police</option>
                <option value="Port">Port Authority</option>
              </select>
            </div>

            {/* Officers List - Scrollable */}
            <div className="max-h-[460px] overflow-y-auto space-y-2.5 pr-1">
              {filteredOfficers.map((officer) => {
                const isSelected = selectedOfficerIds.includes(officer.id);
                return (
                  <div
                    key={officer.id}
                    onClick={() => handleToggleOfficer(officer.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-blue-50/40 border-blue-400 ring-1 ring-blue-300 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Icon Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      {officer.avatarIcon === 'gov' && '🏛️'}
                      {officer.avatarIcon === 'military' && '🎖️'}
                      {officer.avatarIcon === 'engineer' && '📐'}
                      {officer.avatarIcon === 'medical' && '🏥'}
                      {officer.avatarIcon === 'police' && '🛡️'}
                      {officer.avatarIcon === 'port' && '⚓'}
                    </div>

                    {/* Officer Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {officer.name}
                        </span>
                        {officer.isKeyOfficer && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5 fill-current" />
                            KEY OFFICER (AUTO-ALERT)
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-700 mt-0.5 font-medium">
                        <span className="font-mono text-slate-500">{officer.rank}</span> · {officer.role}
                      </div>

                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {officer.department}
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                        <span className="font-mono">{officer.phone}</span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-emerald-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Push Connected
                          </span>
                          <span className="font-mono text-slate-400">{officer.deviceId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Directory Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Targeting <strong>{selectedOfficerIds.length}</strong> of <strong>{ALL_OFFICERS.length}</strong> officers</span>
            <button
              onClick={handleSelectKeyOfficers}
              className="text-blue-600 font-bold hover:text-blue-800 transition cursor-pointer"
            >
              Reset to 5 Key Commanders
            </button>
          </div>
        </div>

        {/* Right Column: Compose Push & Lockscreen Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Compose & Dispatch Emergency Push */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Compose & Dispatch Emergency Push</h3>
                <p className="text-[11px] text-slate-500">Pushed to selected officers across devices</p>
              </div>
            </div>

            {/* Template Selector */}
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                LOAD OFFICIAL EMERGENCY TEMPLATE
              </label>
              <select
                onChange={handleTemplateChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">-- Choose an Incident Template --</option>
                <option value="t48">Rapid Cyclone Landfall Escalation (T-48h)</option>
                <option value="sluice">Estuary Sluice Gate Overtopping Alert</option>
                <option value="evac">Mandatory Coastal Evacuation Directive</option>
                <option value="medical">Trauma & Emergency Blood Bank Standby</option>
              </select>
            </div>

            {/* Severity Level Buttons */}
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1.5">
                ALERT SEVERITY LEVEL
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['CRITICAL', 'URGENT', 'WARNING', 'ADVISORY'] as const).map((sev) => {
                  const isSelected = alertSeverity === sev;
                  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
                  if (isSelected) {
                    if (sev === 'CRITICAL') colorClass = 'bg-rose-600 text-white border-rose-600 shadow-2xs font-bold';
                    else if (sev === 'URGENT') colorClass = 'bg-amber-600 text-white border-amber-600 shadow-2xs font-bold';
                    else if (sev === 'WARNING') colorClass = 'bg-yellow-500 text-slate-950 border-yellow-500 shadow-2xs font-bold';
                    else colorClass = 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold';
                  }

                  return (
                    <button
                      key={sev}
                      onClick={() => setAlertSeverity(sev)}
                      className={`py-1.5 rounded-lg text-[10px] font-mono tracking-wider border transition text-center cursor-pointer ${colorClass}`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Channels Toggles */}
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1.5">
                PRIORITY COMMUNICATION CHANNELS
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setChannels({ ...channels, push: !channels.push })}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    channels.push
                      ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>GovPush App</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannels({ ...channels, cellBroadcast: !channels.cellBroadcast })}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    channels.cellBroadcast
                      ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cell Broadcast (WEA)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannels({ ...channels, sms: !channels.sms })}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    channels.sms
                      ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>C-DoT SMS Gateway</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannels({ ...channels, whatsapp: !channels.whatsapp })}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    channels.whatsapp
                      ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                  <span>WhatsApp GovAlert</span>
                </button>
              </div>
            </div>

            {/* Subject Input */}
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                ALERT SUBJECT / HEADING
              </label>
              <input
                type="text"
                value={alertSubject}
                onChange={(e) => setAlertSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Payload Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  NOTIFICATION PAYLOAD TEXT
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {payloadText.length} chars
                </span>
              </div>
              <textarea
                rows={3}
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-blue-500 focus:bg-white resize-none"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendPush}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Push Notification to {selectedOfficerIds.length} Selected Officers</span>
            </button>
          </div>

          {/* Card 2: Officer Mobile Lockscreen Preview - Clean Light Style */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-4 text-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono pb-2 border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                Officer Mobile Lockscreen Preview
              </span>
              <span>GovPush v4.2</span>
            </div>

            {/* Notification Banner on Light Device Frame */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>AP-DDMA DISASTER ALERT</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">NOW</span>
              </div>

              <div className="text-xs font-bold text-slate-900 leading-snug">
                {alertSubject || 'EMERGENCY: Rapid Cyclone Escalation Threat Order'}
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {payloadText || 'IMD radar confirms cyclone eye landfall track centered on Visakhapatnam coast...'}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <span>
                  Channels: {Object.entries(channels).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ')}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  Sound Override Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Live Push Notification Dispatch & Delivery Audit Log - Clean Light Mode */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Live Push Notification Dispatch & Delivery Audit Log
            </h3>
            <p className="text-xs text-slate-500">
              Chronological log of automated threat triggers and manual officer dispatches
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {auditLogs.length} Historical Dispatches Recorded
          </span>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">TYPE</th>
                <th className="py-2.5 px-3">SEVERITY</th>
                <th className="py-2.5 px-3">SUBJECT & DIRECTIVE</th>
                <th className="py-2.5 px-3">RECIPIENTS</th>
                <th className="py-2.5 px-3">CHANNELS</th>
                <th className="py-2.5 px-3">DISPATCHED</th>
                <th className="py-2.5 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => {
                const isAuto = log.type === 'AUTO THREAT';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* TYPE */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isAuto 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {log.type}
                      </span>
                    </td>

                    {/* SEVERITY */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        log.severity === 'CRITICAL' ? 'bg-rose-600 text-white' :
                        log.severity === 'URGENT' ? 'bg-amber-600 text-white' :
                        log.severity === 'WARNING' ? 'bg-amber-500 text-slate-950' :
                        'bg-slate-600 text-white'
                      }`}>
                        {log.severity}
                      </span>
                    </td>

                    {/* SUBJECT & DIRECTIVE */}
                    <td className="py-3.5 px-3 min-w-[280px]">
                      <div className="font-bold text-slate-900 leading-snug">
                        {log.subject}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {log.directive}
                      </div>
                    </td>

                    {/* RECIPIENTS */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{log.recipientsCount} Officers</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.recipientsPreview}</div>
                    </td>

                    {/* CHANNELS */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-mono text-[9px] text-slate-500">
                        {log.channels.map((ch, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* DISPATCHED */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                      {log.dispatchedTime}
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{log.status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
