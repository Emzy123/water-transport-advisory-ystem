import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function MapFullscreenToggle({ containerRef }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'map-control-btn flex h-9 w-9 items-center justify-center rounded-xl',
        'bg-white/95 text-navy-900 shadow-card ring-1 ring-slate-200/80',
        'transition hover:bg-white dark:bg-navy-800/95 dark:text-white dark:ring-slate-600'
      )}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
    </button>
  );
}
