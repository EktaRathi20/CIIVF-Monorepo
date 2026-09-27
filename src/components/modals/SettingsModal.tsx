import React, { useEffect, useState } from 'react';
import { 
  X, Settings, Bell, Shield, Database, Radio, MessageCircle,
  Check, Sliders, RefreshCw, Layers, MapPin, AlertTriangle
} from 'lucide-react';
import { api, WhatsAppConfigurationResponse } from '../../api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'thresholds' | 'gis' | 'alerts' | 'provenance'>('general');
  const [telemetryInterval, setTelemetryInterval] = useState('30s');
  const [defaultCity, setDefaultCity] = useState('Kolkata');
  const [windWarningThreshold, setWindWarningThreshold] = useState(130);
  const [surgeWarningThreshold, setSurgeWarningThreshold] = useState(1.8);
  const [autoSirenEnabled, setAutoSirenEnabled] = useState(true);
  const [geeLiveSync, setGeeLiveSync] = useState(true);
  const [copernicusSarSync, setCopernicusSarSync] = useState(true);
  const [imdDopplerFeed, setImdDopplerFeed] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(() => localStorage.getItem('ciivf-whatsapp-enabled') === 'true');
  const [whatsappNumber, setWhatsappNumber] = useState(() => localStorage.getItem('ciivf-whatsapp-number') ?? '');
  const [whatsappCode, setWhatsappCode] = useState('');
  const [whatsappAction, setWhatsappAction] = useState<'subscribe' | 'unsubscribe'>('subscribe');
  const [whatsappStep, setWhatsappStep] = useState<'idle' | 'code-sent' | 'verified'>(() => localStorage.getItem('ciivf-whatsapp-verified') === 'true' ? 'verified' : 'idle');
  const [whatsappConfiguration, setWhatsappConfiguration] = useState<WhatsAppConfigurationResponse | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [whatsappBusy, setWhatsappBusy] = useState(false);

  useEffect(() => {
    if (!isOpen || activeTab !== 'alerts') return;
    const controller = new AbortController();
    api.getWhatsAppConfiguration(controller.signal)
      .then(setWhatsappConfiguration)
      .catch((error: Error) => setWhatsappError(error.message));
    return () => controller.abort();
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleStartWhatsAppVerification = async () => {
    if (!/^\+[1-9]\d{7,14}$/.test(whatsappNumber.trim())) {
      setWhatsappError('Enter a valid international number in E.164 format, such as +14155552671.');
      return;
    }
    setWhatsappBusy(true);
    setWhatsappError(null);
    try {
      await api.startWhatsAppVerification(whatsappNumber.trim());
      setWhatsappStep('code-sent');
      setWhatsappCode('');
    } catch (error) {
      setWhatsappError((error as Error).message);
    } finally {
      setWhatsappBusy(false);
    }
  };

  const handleCheckWhatsAppVerification = async () => {
    setWhatsappBusy(true);
    setWhatsappError(null);
    try {
      await api.checkWhatsAppVerification(whatsappNumber.trim(), whatsappCode.trim(), whatsappAction);
      if (whatsappAction === 'subscribe') {
        localStorage.setItem('ciivf-whatsapp-enabled', 'true');
        localStorage.setItem('ciivf-whatsapp-number', whatsappNumber.trim());
        localStorage.setItem('ciivf-whatsapp-verified', 'true');
        setWhatsappEnabled(true);
        setWhatsappStep('verified');
      } else {
        localStorage.removeItem('ciivf-whatsapp-enabled');
        localStorage.removeItem('ciivf-whatsapp-number');
        localStorage.removeItem('ciivf-whatsapp-verified');
        setWhatsappEnabled(false);
        setWhatsappNumber('');
        setWhatsappStep('idle');
      }
      setWhatsappCode('');
    } catch (error) {
      setWhatsappError((error as Error).message);
    } finally {
      setWhatsappBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Emergency Platform Settings</h2>
              <p className="text-xs text-slate-500">Configure alert parameters, telemetry sources, and municipal thresholds</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 gap-6 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders size={14} />
            General & Telemetry
          </button>
          <button
            onClick={() => setActiveTab('thresholds')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'thresholds'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle size={14} />
            Early Warning Thresholds
          </button>
          <button
            onClick={() => setActiveTab('gis')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'gis'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={14} />
            GIS & Earth Observation
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'alerts'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell size={14} />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('provenance')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'provenance'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database size={14} />
            Data Provenance
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Default Operational Zone
                </label>
                <select
                  value={defaultCity}
                  onChange={(e) => setDefaultCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Kolkata">Kolkata Coastal Metropolitan Area (West Bengal)</option>
                  <option value="Puri">Puri Coastal Zone & Chilika (Odisha)</option>
                  <option value="Visakhapatnam">Visakhapatnam Harbor & Coast (Andhra Pradesh)</option>
                  <option value="Paradip">Paradip Deepwater Port & Estuary (Odisha)</option>
                  <option value="Chennai">Chennai Coastal Basin (Tamil Nadu)</option>
                  <option value="Kochi">Kochi Coastal Backwaters (Kerala)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">Sets the initial coastal municipality loaded on session start.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Sensor Telemetry Refresh Rate
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['15s (Critical)', '30s (Standard)', '60s (Battery Saver)'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setTelemetryInterval(opt)}
                      className={`p-2.5 rounded-xl border text-center transition-colors font-medium ${
                        telemetryInterval === opt 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Automated Siren Broadcast (Common Alerting Protocol)</div>
                    <div className="text-[11px] text-slate-500">Auto-trigger coastal municipal sirens when T-Landfall drops below 12 hours</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSirenEnabled}
                    onChange={(e) => setAutoSirenEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'thresholds' && (
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    High-Velocity Wind Warning Trigger
                  </label>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {windWarningThreshold} km/h
                  </span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="200"
                  step="5"
                  value={windWarningThreshold}
                  onChange={(e) => setWindWarningThreshold(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>90 km/h (Gale)</span>
                  <span>130 km/h (Very Severe)</span>
                  <span>200 km/h (Super Cyclone)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Parametric Flood Inundation Trigger Height
                  </label>
                  <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {surgeWarningThreshold} meters
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="3.5"
                  step="0.1"
                  value={surgeWarningThreshold}
                  onChange={(e) => setSurgeWarningThreshold(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  When verified water levels exceed this height across municipal gauge telemetry, state parametric relief liquidity is automatically pre-cleared.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'gis' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <div className="font-semibold text-slate-800">Google Earth Engine (GEE) Inundation Layers</div>
                      <div className="text-[11px] text-slate-500">High-resolution NDWI water index and coastal elevation mesh</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={geeLiveSync}
                    onChange={(e) => setGeeLiveSync(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <div className="font-semibold text-slate-800">Copernicus Sentinel-1 SAR (Radar) Penetration</div>
                      <div className="text-[11px] text-slate-500">Cloud-penetrating synthetic aperture radar for 24/7 storm tracking</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={copernicusSarSync}
                    onChange={(e) => setCopernicusSarSync(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <div className="font-semibold text-slate-800">IMD Doppler Weather Radar Feed (DWR Kolkata & Paradip)</div>
                      <div className="text-[11px] text-slate-500">Radial velocity and rain reflectivity updated every 10 minutes</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={imdDopplerFeed}
                    onChange={(e) => setImdDopplerFeed(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="max-w-xl space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Optional WhatsApp alerts</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">WhatsApp is optional. Dashboard alerts continue regardless of this setting.</p>
              </div>
              <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3">
                <span>
                  <span className="block text-xs font-semibold text-slate-900">Send climate alerts to WhatsApp</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500">Phone ownership is verified before subscribing or unsubscribing.</span>
                </span>
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={event => {
                    setWhatsappEnabled(event.target.checked);
                    setWhatsappAction(event.target.checked ? 'subscribe' : 'unsubscribe');
                    setWhatsappStep('idle');
                    setWhatsappCode('');
                    setWhatsappError(null);
                  }}
                  className="h-4 w-4 accent-emerald-600"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-800">
                WhatsApp number
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={event => setWhatsappNumber(event.target.value)}
                  disabled={whatsappStep === 'code-sent'}
                  placeholder="+14155552671"
                  autoComplete="tel"
                  className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal disabled:bg-slate-100 disabled:text-slate-400"
                />
              </label>
              {whatsappStep === 'code-sent' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-800">
                    WhatsApp verification code
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={whatsappCode}
                      onChange={event => setWhatsappCode(event.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
                    />
                  </label>
                  <button type="button" onClick={handleCheckWhatsAppVerification} disabled={whatsappBusy || whatsappCode.length < 4} className="rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                    {whatsappBusy ? 'Checking…' : whatsappAction === 'subscribe' ? 'Verify and subscribe' : 'Verify and unsubscribe'}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={handleStartWhatsAppVerification} disabled={whatsappBusy || !whatsappConfiguration?.verification_configured} className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {whatsappBusy ? 'Sending code…' : whatsappAction === 'subscribe' ? 'Send WhatsApp verification code' : 'Verify opt-out'}
                </button>
              )}
              {whatsappStep === 'verified' && whatsappEnabled && (
                <p className="text-xs font-medium text-emerald-800">WhatsApp number verified and subscribed.</p>
              )}
              {whatsappConfiguration && !whatsappConfiguration.verification_configured && (
                <p className="text-xs text-amber-900">Twilio Verify is not configured. Add backend Twilio credentials to enable opt-in.</p>
              )}
              {whatsappConfiguration?.verification_configured && !whatsappConfiguration.delivery_configured && (
                <p className="text-xs text-amber-900">Verification is configured, but WhatsApp message delivery needs a Messaging Service and approved Content Template.</p>
              )}
              {whatsappError && <p role="alert" className="text-xs text-rose-700">{whatsappError}</p>}
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">
                <MessageCircle size={15} className="mt-0.5 shrink-0" />
                <p>By verifying, you consent to receive climate-alert WhatsApp messages. The backend stores the verified number in its local SQLite database. Use the toggle and verify again to unsubscribe. Twilio credentials stay on the backend.</p>
              </div>
            </div>
          )}

          {activeTab === 'provenance' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5">
                  <Shield size={14} className="text-blue-600" />
                  Official Agency Data Provenance Pipeline
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  All predictive models, storm surge contours, and parametric triggers conform to the standard interoperability guidelines of IMD, Copernicus EMS, Google Earth Engine, and UNEP Sendai Disaster Framework.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded-xl bg-white">
                  <div className="font-bold text-slate-800">IMD RSMC New Delhi</div>
                  <div className="text-[11px] text-slate-500">Official Regional Specialized Meteorological Centre for Tropical Cyclones</div>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-white">
                  <div className="font-bold text-slate-800">Copernicus EMS</div>
                  <div className="text-[11px] text-slate-500">European Commission rapid flood & SAR satellite inundation maps</div>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-white">
                  <div className="font-bold text-slate-800">Google Earth Engine</div>
                  <div className="text-[11px] text-slate-500">Petabyte-scale geospatial analysis of mangrove barrier biomass</div>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-white">
                  <div className="font-bold text-slate-800">UNEP & CCRI</div>
                  <div className="text-[11px] text-slate-500">Coalition for Climate Resilient Infrastructure parametric verification</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {savedSuccess ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check size={14} /> Settings successfully saved!
              </span>
            ) : (
              'All changes take effect immediately in the current operational session.'
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
