import React, { useState } from 'react';
import { 
  CloudRain, MapPin, ChevronRight
} from 'lucide-react';
import { OperationalMode, CityLocation } from './types';
import { CITIES } from './data/mockData';

// Layout & Authentication Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginPage, OfficerUser, OPERATIONAL_ROLES } from './components/LoginPage';

// View Pages
import { HistoricalDisastersView } from './components/HistoricalDisastersView';
import { NotificationHubView } from './components/NotificationHubView';

// Overview Dashboard Components
import { AssessmentCards } from './components/AssessmentCards';
import { MapComponent } from './components/MapComponent';
import { WeatherHazardChart } from './components/WeatherHazardChart';
import { RightColumnCards } from './components/RightColumnCards';
import { BottomRowCards } from './components/BottomRowCards';

// Project Flow Mode Components (Baseline Intelligence removed per instruction)
import { ThreatDetectionModeView } from './components/modes/ThreatDetectionModeView';
import { TaskEvacuationModeView } from './components/modes/TaskEvacuationModeView';
import { LandfallRescueModeView } from './components/modes/LandfallRescueModeView';
import { InsuranceRecoveryModeView } from './components/modes/InsuranceRecoveryModeView';

// Modals
import { EvacuationModal } from './components/modals/EvacuationModal';
import { AIPlanModal } from './components/modals/AIPlanModal';
import { AlternativeRoutesModal } from './components/modals/AlternativeRoutesModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { SettingsModal } from './components/modals/SettingsModal';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<OfficerUser>(OPERATIONAL_ROLES[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // App Navigation States
  const [selectedCity, setSelectedCity] = useState<CityLocation>(CITIES[0]);
  const [currentMode, setCurrentMode] = useState<OperationalMode>('overview');
  const [isHistoricalView, setIsHistoricalView] = useState<boolean>(false);
  const [isNotificationView, setIsNotificationView] = useState<boolean>(false);
  const [unreadAlerts, setUnreadAlerts] = useState<number>(3);

  // Global Layer States for Map
  const [showMangroveLayer, setShowMangroveLayer] = useState<boolean>(true);
  const [showHistoricalLayer, setShowHistoricalLayer] = useState<boolean>(false);

  // Modal States
  const [isEvacuationModalOpen, setIsEvacuationModalOpen] = useState(false);
  const [isAiPlanModalOpen, setIsAiPlanModalOpen] = useState(false);
  const [aiModalMode, setAiModalMode] = useState<'why' | 'plan'>('plan');
  const [isAlternativeRoutesModalOpen, setIsAlternativeRoutesModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleOpenWhy = () => {
    setAiModalMode('why');
    setIsAiPlanModalOpen(true);
  };

  const handleOpenPlan = () => {
    setAiModalMode('plan');
    setIsAiPlanModalOpen(true);
  };

  // If not logged in, render the Login Page matching attached screenshot
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={(officer) => {
          setCurrentUser(officer);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white bg-slate-100 text-slate-800">
      {/* Top Navigation Bar with Profile Dropdown & Settings */}
      <Header
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onOpenNotifications={() => {
          setIsNotificationView(true);
          setIsHistoricalView(false);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHistoricalDisasters={() => {
          setIsHistoricalView(true);
          setIsNotificationView(false);
        }}
        unreadAlertsCount={unreadAlerts}
        currentUser={currentUser}
        onLogout={() => setIsLoggedIn(false)}
      />

      <div className="flex-1 flex flex-row">
        {/* Left Navigation Sidebar with PROJECT FLOW Tabs */}
        <Sidebar
          currentMode={currentMode}
          onSelectMode={(mode) => {
            setCurrentMode(mode);
            setIsHistoricalView(false);
            setIsNotificationView(false);
          }}
          isHistoricalView={isHistoricalView}
          onSelectHistoricalView={(isHistory) => {
            setIsHistoricalView(isHistory);
            if (isHistory) setIsNotificationView(false);
          }}
          isNotificationView={isNotificationView}
          onSelectNotificationView={(isNotif) => {
            setIsNotificationView(isNotif);
            if (isNotif) setIsHistoricalView(false);
          }}
          onOpenAlerts={() => {
            setIsNotificationView(true);
            setIsHistoricalView(false);
          }}
          alertsCount={unreadAlerts}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden max-w-[1600px] w-full mx-auto">
          {/* 1. If on Notifications Hub View */}
          {isNotificationView ? (
            <NotificationHubView onBack={() => setIsNotificationView(false)} />
          ) : isHistoricalView ? (
            /* 2. If on Historical Disasters View */
            <HistoricalDisastersView onBackToOverview={() => setIsHistoricalView(false)} />
          ) : (
            /* 3. Main Dashboard & Project Flow Modes */
            <>
              {/* Top City Location & Weather Bar */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Location Pin & Coordinates */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border bg-blue-50 border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <span>{selectedCity.name}, {selectedCity.region}, {selectedCity.country}</span>
                    </h1>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">
                      {selectedCity.coordinatesFormatted} <span className="text-slate-300">|</span> Population (est.): <span className="font-semibold text-slate-800">{selectedCity.populationFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Weather & 7-Day Average Badges */}
                <div className="flex items-center gap-3 text-xs shrink-0 self-start md:self-center">
                  {/* Current Weather */}
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border bg-slate-50 border-slate-200">
                    <CloudRain size={20} className="text-blue-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium">Current Weather</div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-sm font-mono text-slate-900">{selectedCity.currentTemp}°C</span>
                        <span className="text-[11px] font-medium text-slate-600">{selectedCity.currentWeather}</span>
                      </div>
                    </div>
                  </div>

                  {/* Next 7 Days Average */}
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border bg-slate-50 border-slate-200">
                    <CloudRain size={20} className="text-cyan-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium">Next 7 Days (avg.)</div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-sm font-mono text-slate-900">{selectedCity.tempRangeAvg}</span>
                        <span className="text-[11px] font-medium text-slate-600">{selectedCity.forecastSummary}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </div>
              </div>

              {/* DYNAMIC MODE RENDERING BASED ON PROJECT FLOW (SELECTED IN SIDEBAR) */}

              {/* 1. Complete Integrated Dashboard (Overview) */}
              {currentMode === 'overview' && (
                <div className="space-y-4">
                  {/* 4 Assessment Cards: IMD Warning, Operational Risk, AI Brief, Evidence Quality */}
                  <AssessmentCards
                    city={selectedCity}
                    onOpenWhyModal={handleOpenWhy}
                    onOpenPlanModal={handleOpenPlan}
                    isLightMode={true}
                  />

                  {/* Center Layout: Interactive Map + 7-Day Forecast on Left (8 cols) and Global Vulnerability on Right (4 cols) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Center Column: Map & Weather Chart (8 of 12 cols) */}
                    <div className="lg:col-span-8 space-y-4">
                      <MapComponent
                        showMangroveLayer={showMangroveLayer}
                        onToggleMangrove={setShowMangroveLayer}
                        showHistoricalLayer={showHistoricalLayer}
                        onToggleHistorical={setShowHistoricalLayer}
                        systemStatusLabel="System: Operational"
                        systemStatusColor="amber"
                        isLightMode={true}
                      />

                      <WeatherHazardChart isLightMode={true} />
                    </div>

                    {/* Right Column: Global Climate Vulnerability, Recent Alerts, AI Safety Banner (4 of 12 cols) */}
                    <div className="lg:col-span-4">
                      <RightColumnCards isLightMode={true} />
                    </div>
                  </div>

                  {/* Bottom Row: Population Exposure, Shelters, and Evacuation Routes */}
                  <BottomRowCards
                    city={selectedCity}
                    onOpenEvacuationRouteModal={() => setIsAlternativeRoutesModalOpen(true)}
                    isLightMode={true}
                  />
                </div>
              )}

              {/* 2. Threat Detection (Amber Mode) */}
              {currentMode === 'threat' && (
                <ThreatDetectionModeView
                  city={selectedCity}
                  showMangroveLayer={showMangroveLayer}
                  onToggleMangrove={setShowMangroveLayer}
                  showHistoricalLayer={showHistoricalLayer}
                  onToggleHistorical={setShowHistoricalLayer}
                  isLightMode={true}
                />
              )}

              {/* 3. Task Management & Evacuation */}
              {currentMode === 'tasks' && (
                <TaskEvacuationModeView
                  city={selectedCity}
                  showMangroveLayer={showMangroveLayer}
                  onToggleMangrove={setShowMangroveLayer}
                  showHistoricalLayer={showHistoricalLayer}
                  onToggleHistorical={setShowHistoricalLayer}
                  onOpenEvacuationModal={() => setIsEvacuationModalOpen(true)}
                  isLightMode={true}
                />
              )}

              {/* 4. Landfall Rescue (Red Mode) */}
              {currentMode === 'landfall' && (
                <LandfallRescueModeView city={selectedCity} isLightMode={true} />
              )}

              {/* 5. Insurance & Recovery */}
              {currentMode === 'recovery' && (
                <InsuranceRecoveryModeView city={selectedCity} isLightMode={true} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Action Modals */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <EvacuationModal
        isOpen={isEvacuationModalOpen}
        onClose={() => setIsEvacuationModalOpen(false)}
        isLightMode={true}
      />

      <AIPlanModal
        isOpen={isAiPlanModalOpen}
        onClose={() => setIsAiPlanModalOpen(false)}
        city={selectedCity}
        mode={aiModalMode}
        isLightMode={true}
      />

      <AlternativeRoutesModal
        isOpen={isAlternativeRoutesModalOpen}
        onClose={() => setIsAlternativeRoutesModalOpen(false)}
        isLightMode={true}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        onClear={() => {
          setUnreadAlerts(0);
          setIsNotificationsModalOpen(false);
        }}
        isLightMode={true}
      />
    </div>
  );
}
