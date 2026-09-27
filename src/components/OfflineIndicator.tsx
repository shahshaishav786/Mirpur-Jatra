import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xl ring-1 ring-white/20 animate-bounce">
      <WifiOff className="w-4 h-4 text-white" />
      <span>ઓફલાઇન મોડ (Offline Mode) — કેશ્ડ ડેટા ઉપલબ્ધ છે</span>
    </div>
  );
};
