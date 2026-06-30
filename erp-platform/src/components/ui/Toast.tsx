import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="h-5 w-5" style={{ color: '#22c55e' }} />,
  error: <AlertCircle className="h-5 w-5" style={{ color: '#ef4444' }} />,
  info: <Info className="h-5 w-5" style={{ color: '#3b82f6' }} />,
  warning: <AlertTriangle className="h-5 w-5" style={{ color: '#f59e0b' }} />,
};

const BG_COLORS: Record<ToastType, string> = {
  success: 'rgba(34,197,94,0.1)',
  error: 'rgba(239,68,68,0.1)',
  info: 'rgba(59,130,246,0.1)',
  warning: 'rgba(245,158,11,0.1)',
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: 'rgba(34,197,94,0.25)',
  error: 'rgba(239,68,68,0.25)',
  info: 'rgba(59,130,246,0.25)',
  warning: 'rgba(245,158,11,0.25)',
};

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
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md animate-slide-up"
            style={{
              backgroundColor: BG_COLORS[t.type],
              borderColor: BORDER_COLORS[t.type],
            }}
          >
            <span className="shrink-0 mt-0.5">{ICONS[t.type]}</span>
            <p className="text-sm font-medium flex-1" style={{ color: 'var(--fg)' }}>{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 opacity-40 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--fg-muted)' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </ToastContext.Provider>
  );
}
