import React from 'react';
import { 
  LayoutDashboard, History, Bell, 
  AlertTriangle, CheckSquare, LifeBuoy, Banknote, 
  Leaf, ChevronRight
} from 'lucide-react';
import { OperationalMode } from '../types';

interface SidebarProps {
  currentMode: OperationalMode;
  onSelectMode: (mode: OperationalMode) => void;
  isHistoricalView: boolean;
  onSelectHistoricalView: (isHistory: boolean) => void;
  isNotificationView?: boolean;
  onSelectNotificationView?: (isNotification: boolean) => void;
  onOpenAlerts: () => void;
  alertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onSelectMode,
  isHistoricalView,
  onSelectHistoricalView,
  isNotificationView = false,
  onSelectNotificationView,
  onOpenAlerts,
  alertsCount = 3,
}) => {
  // Project flow modes - Baseline intelligence removed per user instruction
  const projectFlowItems: {
    mode: OperationalMode;
    label: string;
    subLabel: string;
    dotColor: string;
    activeClass: string;
    icon: React.ElementType;
  }[] = [
    {
      mode: 'threat',
      label: 'Threat Detection',
      subLabel: 'Amber Mode · T-48 Countdown',
      dotColor: 'bg-amber-500',
      activeClass: 'bg-amber-50 text-amber-900 border-l-4 border-amber-500',
      icon: AlertTriangle,
    },
    {
      mode: 'tasks',
      label: 'Task & Evacuation',
      subLabel: 'Kanban & Logistics Corridor',
      dotColor: 'bg-blue-500',
      activeClass: 'bg-blue-50 text-blue-900 border-l-4 border-blue-600',
      icon: CheckSquare,
    },
    {
      mode: 'landfall',
      label: 'Landfall Rescue',
      subLabel: 'Red Mode · Dispatch Chat',
      dotColor: 'bg-rose-500',
      activeClass: 'bg-rose-50 text-rose-900 border-l-4 border-rose-600',
      icon: LifeBuoy,
    },
    {
      mode: 'recovery',
      label: 'Insurance & Recovery',
      subLabel: 'Parametric Relief & UNEP SDG',
      dotColor: 'bg-teal-500',
      activeClass: 'bg-teal-50 text-teal-900 border-l-4 border-teal-600',
      icon: Banknote,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)] select-none">
      <div className="p-3 space-y-5">
        {/* Core Nav Group */}
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Navigation
          </div>
          <div className="space-y-1">
            {/* Dashboard Overview */}
            <button
              onClick={() => {
                onSelectHistoricalView(false);
                if (onSelectNotificationView) onSelectNotificationView(false);
                onSelectMode('overview');
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                !isHistoricalView && !isNotificationView && currentMode === 'overview'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard 
                  size={16} 
                  className={!isHistoricalView && !isNotificationView && currentMode === 'overview' ? 'text-blue-600' : 'text-slate-400'} 
                />
                <span>Dashboard Overview</span>
              </div>
            </button>

            {/* Historical Disasters Page */}
            <button
              onClick={() => {
                onSelectHistoricalView(true);
                if (onSelectNotificationView) onSelectNotificationView(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isHistoricalView
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History 
                  size={16} 
                  className={isHistoricalView ? 'text-blue-600' : 'text-slate-400'} 
                />
                <span>Historical Disasters</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                7
              </span>
            </button>

            {/* Notifications - renamed from Active Alerts per user prompt */}
            <button
              onClick={() => {
                if (onSelectNotificationView) {
                  onSelectNotificationView(true);
                  onSelectHistoricalView(false);
                } else {
                  onOpenAlerts();
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isNotificationView
                  ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell size={16} className={isNotificationView ? 'text-purple-600' : 'text-slate-400'} />
                <span>Notifications</span>
              </div>
              {alertsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                  {alertsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Project Flow Stages Group (Baseline Intelligence removed) */}
        <div>
          <div className="px-3 pb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Project Flow:
            </span>
            <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
              4 Modes
            </span>
          </div>

          <div className="space-y-1">
            {projectFlowItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = !isHistoricalView && !isNotificationView && currentMode === item.mode;

              return (
                <button
                  key={item.mode}
                  onClick={() => {
                    onSelectHistoricalView(false);
                    if (onSelectNotificationView) onSelectNotificationView(false);
                    onSelectMode(item.mode);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? `${item.activeClass} shadow-2xs font-bold`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.dotColor}`} />
                    <div>
                      <div className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>
                        {index + 1}. {item.label}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.subLabel}
                      </div>
                    </div>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-slate-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Light Theme Clean Bio-Shield Card */}
      <div className="p-3 m-3 rounded-2xl relative overflow-hidden border border-emerald-200 bg-gradient-to-b from-emerald-50/80 via-white to-emerald-50/40 shadow-xs">
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Bio-Shield Defense
            </span>
            <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Leaf size={12} />
            </div>
          </div>
          <p className="text-[11px] text-emerald-900 leading-snug">
            Mangroves absorb up to <strong className="font-bold">66%</strong> of storm wave energy in coastal delta zones.
          </p>
          <div className="text-[10px] font-mono text-emerald-700 flex items-center gap-1">
            <span>● UNEP Protected Canopy</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
