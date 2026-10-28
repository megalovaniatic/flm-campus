import { AnimatePresence, motion } from 'motion/react';
import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/design';
import { MESSAGES } from '@/lib/messages';

/** Aviso de interrupción de red (y confirmación al recuperarla). */
export function OfflineBanner() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  useEffect(() => {
    const off = () => setOffline(true);
    const on = () => {
      setOffline(false);
      toast.success(MESSAGES.backOnline);
    };
    window.addEventListener('offline', off);
    window.addEventListener('online', on);
    return () => {
      window.removeEventListener('offline', off);
      window.removeEventListener('online', on);
    };
  }, []);
  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          role="status"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          style={{ overflow: 'hidden', background: 'var(--warning-soft)', color: 'var(--warning)' }}
        >
          <p className="container" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px var(--gutter)', fontSize: 'var(--text-sm)', fontWeight: 550 }}>
            <WifiOff size={16} aria-hidden="true" /> {MESSAGES.offline}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
