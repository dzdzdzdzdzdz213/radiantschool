import { useCallback, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastContext } from '@/hooks/useToast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
  error: <AlertCircle className="h-5 w-5 text-red-400" />,
  info: <Info className="h-5 w-5 text-blue-400" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
};

const GRADIENT: Record<ToastType, string> = {
  success: 'from-emerald-500/20 to-emerald-500/5',
  error: 'from-red-500/20 to-red-500/5',
  info: 'from-blue-500/20 to-blue-500/5',
  warning: 'from-amber-500/20 to-amber-500/5',
};

const BORDER: Record<ToastType, string> = {
  success: 'border-emerald-500/30',
  error: 'border-red-500/30',
  info: 'border-blue-500/30',
  warning: 'border-amber-500/30',
};

const TOPBAR: Record<ToastType, string> = {
  success: 'from-emerald-500 to-emerald-600',
  error: 'from-red-500 to-red-600',
  info: 'from-blue-500 to-blue-600',
  warning: 'from-amber-500 to-amber-600',
};

function ToastItem({ toast: t, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl ${BORDER[t.type]}`}
      style={{ background: 'color-mix(in srgb, var(--card) 85%, transparent)' }}
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${TOPBAR[t.type]}`} />
      <div className="flex items-start gap-3 p-4">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${GRADIENT[t.type]}`}>
          {ICONS[t.type]}
        </div>
        <p className="text-sm font-medium flex-1 pt-1.5 text-foreground">{t.message}</p>
        <button onClick={onClose} className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
