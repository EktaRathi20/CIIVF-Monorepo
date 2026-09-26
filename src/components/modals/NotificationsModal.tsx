import React from 'react';
import { X } from 'lucide-react';
import { NotificationHubView } from '../NotificationHubView';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  isLightMode?: boolean;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-50 border border-slate-300 rounded-3xl shadow-2xl p-4 sm:p-6 my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
          <div className="text-xs font-mono font-bold text-slate-500 uppercase">
            GovPush Notification & Emergency Dispatch Console
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <NotificationHubView onBack={onClose} />
      </div>
    </div>
  );
};
