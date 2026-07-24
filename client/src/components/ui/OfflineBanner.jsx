import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-600 px-4 py-2 text-center text-xs font-semibold text-white shadow-md flex items-center justify-center gap-2">
      <WifiOff className="h-4 w-4 animate-pulse" />
      <span>Offline Mode Active — Viewing Cached Waterway Charts & Local Portal Data</span>
    </div>
  );
}
