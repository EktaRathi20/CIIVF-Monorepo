import React, { useState } from 'react';
import { 
  AlertOctagon, Send, ShieldAlert, Navigation, 
  MapPin, CheckCircle2, AlertTriangle, Clock, RefreshCw, UserCheck
} from 'lucide-react';
import { ChatMessage, CityLocation } from '../../types';
import { INITIAL_CHAT } from '../../data/mockData';

interface LandfallRescueModeViewProps {
  city: CityLocation;
  isLightMode?: boolean;
}

export const LandfallRescueModeView: React.FC<LandfallRescueModeViewProps> = ({
  city,
  isLightMode = true,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    'Request safe route for Ambulance Unit 3 to Medical College',
    'Is Kona Expressway passable for 5-ton relief trucks?',
    'Report water depth at Chittaranjan Avenue & MG Road crossing',
    'Alternative route to Bidhannagar Sector V from Alipore'
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'officer',
      senderName: 'Officer In-Charge (EMS Dispatch)',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate system verified path response
    setTimeout(() => {
      let response: ChatMessage;

      if (query.toLowerCase().includes('kona') || query.toLowerCase().includes('truck')) {
        response = {
          id: `msg-${Date.now() + 1}`,
          sender: 'system',
          senderName: 'ClimaGuard Verified Dispatch',
          text: 'Verified Transit Clearance for Kona Expressway Corridor:',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
          verifiedRoute: {
            origin: 'Howrah Toll Plaza',
            destination: 'Kolkata Central Logistics Depot',
            clearanceStatus: 'CAUTION_RESTRICTED',
            waterDepth: '0.22m max (Outer left lane pooled)',
            recommendedPath: 'Maintain center 2 lanes on Kona Flyover. Avoid Nibra underpass. Cross via Vidyasagar Setu (Second Hooghly Bridge).',
            waypoints: [
              'Nibra Junction (Diverted to upper elevated deck)',
              'Second Hooghly Bridge (Wind gusts 85 km/h - Speed limit 30 km/h)',
              'AJC Bose Ramp (Clear)'
            ],
            sensorVerification: 'GloFAS Bridge Anemometer #B-09 & Toll CCTV Telemetry active.',
            validityWindow: 'Valid for next 30 minutes.'
          }
        };
      } else if (query.toLowerCase().includes('chittaranjan') || query.toLowerCase().includes('depth')) {
        response = {
          id: `msg-${Date.now() + 1}`,
          sender: 'system',
          senderName: 'ClimaGuard Verified Dispatch',
          text: 'Verified Water Depth Telemetry for Chittaranjan Ave & Central Kolkata:',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
          verifiedRoute: {
            origin: 'Central Metro Corridor',
            destination: 'MG Road Junction',
            clearanceStatus: 'IMPASSABLE_FLOOD',
            waterDepth: '0.62m (Severe Urban Pooling)',
            recommendedPath: 'DO NOT ENTER Chittaranjan Ave. Divert all light and emergency vehicles via Amherst Street (Raja Rammohan Roy Sarani). Water depth: 0.15m.',
            waypoints: [
              'CR Avenue (IMPASSABLE: Sluice gate W-17 overflow)',
              'Amherst Street (Passable for emergency ambulances)',
              'Bidhan Sarani (Clear elevated tramway)'
            ],
            sensorVerification: 'KMC Sump Ultrasonic Sensor US-412 reports 0.62m at 14:10 IST.',
            validityWindow: 'Critical flood crest active until 16:30 IST.'
          }
        };
      } else {
        response = {
          id: `msg-${Date.now() + 1}`,
          sender: 'system',
          senderName: 'ClimaGuard Verified Dispatch',
          text: `Verified Routing & Hazard Clearance for: "${query}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
          verifiedRoute: {
            origin: 'Current Sector Staging Post',
            destination: 'Designated Safe Medical Center',
            clearanceStatus: 'VERIFIED_CLEAR',
            waterDepth: '0.18m (Passable for all emergency vehicles)',
            recommendedPath: 'Route verified via Eastern Metropolitan Bypass (EM Bypass) elevated expressway. All culverts clear.',
            waypoints: [
              'Ultadanga Underpass (Pumps operational, water cleared)',
              'Science City Interchange (Elevated corridor open)',
              'Ruby Crossing (Clear runway)'
            ],
            sensorVerification: 'Disaster Command Center Verified GPS & GloFAS river telemetry grid.',
            validityWindow: 'Cleared for next 45 minutes.'
          }
        };
      }

      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="space-y-4">
      {/* 1. Critical Alert Banner matching clean light theme */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-2xs text-rose-950 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs">
              <AlertOctagon size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider text-rose-800 font-bold">
                  CRITICAL RESCUE PROTOCOL // ACTIVE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase shadow-2xs">
                  CODE RED EMERGENCY
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Cyclone Landfall in Progress — River Basin Overflows
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Hooghly River tidal surge reaching 3.4m (+1.2m above danger mark). All non-essential vehicular traffic barred.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 bg-white px-4 py-2 rounded-xl border border-rose-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Operations Command</div>
            <div className="text-sm font-bold text-rose-700 font-mono">100% Emergency Priority</div>
          </div>
        </div>
      </div>

      {/* 2. Standard, Clean Chat Interface (Like standard support/dispatch, NOT sci-fi bot) */}
      <div className={`border rounded-xl overflow-hidden shadow-sm flex flex-col h-[520px] transition-colors ${
        isLightMode
          ? 'bg-white border-slate-200/90'
          : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Chat Header */}
        <div className={`px-4 py-3 border-b flex items-center justify-between ${
          isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
              isLightMode ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-blue-600/20 border-blue-500/40 text-blue-400'
            }`}>
              <UserCheck size={16} />
            </div>
            <div>
              <div className={`text-xs font-bold flex items-center gap-1.5 ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}>
                <span>Emergency Operations Dispatch Terminal</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Ground Officer Safe Route Verification & Inundation Telemetry
              </div>
            </div>
          </div>

          <div className={`text-[11px] font-mono hidden sm:block ${
            isLightMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Connected to GloFAS & KMC IoT Sump Grid
          </div>
        </div>

        {/* Chat Message History */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-3.5 ${
          isLightMode ? 'bg-slate-50/50' : 'bg-slate-950/40'
        }`}>
          {messages.map((msg) => {
            const isOfficer = msg.sender === 'officer';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOfficer ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={`text-[11px] font-bold font-mono ${
                    isLightMode ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    {msg.senderName}
                  </span>
                  <span className={`text-[10px] font-mono ${
                    isLightMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>

                <div
                  className={`max-w-xl rounded-xl p-3.5 text-xs ${
                    isOfficer
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                      : isLightMode
                      ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                      : 'bg-slate-900 border border-slate-700/80 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Verified Route Data Card from system */}
                  {msg.verifiedRoute && (
                    <div className={`mt-3 p-3 rounded-lg border text-xs space-y-2 ${
                      isLightMode
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}>
                      <div className={`flex items-center justify-between pb-1.5 border-b ${
                        isLightMode ? 'border-slate-200' : 'border-slate-800'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold">
                          <Navigation size={13} className={isLightMode ? 'text-emerald-700' : 'text-emerald-400'} />
                          <span>Routing Telemetry</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                          msg.verifiedRoute.clearanceStatus === 'VERIFIED_CLEAR'
                            ? (isLightMode ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-300 border border-emerald-800')
                            : msg.verifiedRoute.clearanceStatus === 'CAUTION_RESTRICTED'
                            ? (isLightMode ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950 text-amber-300 border border-amber-800')
                            : (isLightMode ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-950 text-rose-300 border border-rose-800')
                        }`}>
                          {msg.verifiedRoute.clearanceStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Max Water Depth:</span>
                          <div className={`font-mono font-bold mt-0.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                            {msg.verifiedRoute.waterDepth}
                          </div>
                        </div>
                        <div>
                          <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Validity Window:</span>
                          <div className={`font-mono font-semibold mt-0.5 ${isLightMode ? 'text-blue-700' : 'text-cyan-300'}`}>
                            {msg.verifiedRoute.validityWindow}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Recommended Path:</span>
                        <div className={`font-semibold text-xs mt-0.5 leading-snug ${
                          isLightMode ? 'text-emerald-800' : 'text-emerald-300'
                        }`}>
                          {msg.verifiedRoute.recommendedPath}
                        </div>
                      </div>

                      <div>
                        <span className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Cleared Waypoints:</span>
                        <ul className={`mt-1 space-y-1 text-[11px] list-disc list-inside ${
                          isLightMode ? 'text-slate-700' : 'text-slate-300'
                        }`}>
                          {msg.verifiedRoute.waypoints.map((wp, idx) => (
                            <li key={idx}>{wp}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={`pt-1.5 border-t text-[10px] font-mono ${
                        isLightMode ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-500'
                      }`}>
                        {msg.verifiedRoute.sensorVerification}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className={`flex items-center gap-2 text-xs italic p-2.5 rounded-lg max-w-xs ${
              isLightMode
                ? 'bg-white border border-slate-200 text-slate-600 shadow-xs'
                : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}>
              <RefreshCw size={13} className="animate-spin text-blue-600" />
              <span>Cross-verifying water depth sensors & bridge gates...</span>
            </div>
          )}
        </div>

        {/* Quick Query Suggestions */}
        <div className={`px-4 py-2 border-t flex items-center gap-2 overflow-x-auto text-xs ${
          isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
        }`}>
          <span className={`text-[10px] font-mono uppercase shrink-0 ${
            isLightMode ? 'text-slate-500' : 'text-slate-400'
          }`}>Quick Queries:</span>
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap text-[11px] transition-colors shrink-0 cursor-pointer ${
                isLightMode
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className={`p-3 border-t flex items-center gap-2 ${
          isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Officer dispatch query (e.g. Request clearance for Ward 17 to SSKM Hospital)..."
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 ${
              isLightMode
                ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                : 'bg-slate-900 border border-slate-700 text-white placeholder-slate-400'
            }`}
          />
          <button
            onClick={() => handleSendMessage()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span>Dispatch</span>
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

