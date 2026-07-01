import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { AlertItem } from '@/features/dashboard/useAdminDashboard';

interface AlertBannerProps {
  items: AlertItem[];
  loading?: boolean;
}

const severityConfig = {
  critical: {
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
    dot: 'bg-red-500',
    Icon: AlertCircle,
    iconColor: 'text-red-500',
  },
  warning: {
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    dot: 'bg-amber-500',
    Icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  info: {
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    dot: 'bg-blue-500',
    Icon: Info,
    iconColor: 'text-blue-500',
  },
};

function AlertSkeleton() {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-4 animate-pulse">
      <div className="h-5 w-5 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="h-3 w-32 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function AlertBanner({ items, loading }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  if (loading) {
    return (
      <div className="space-y-2" role="alert" aria-live="polite" aria-busy="true">
        <AlertSkeleton />
        <AlertSkeleton />
      </div>
    );
  }

  const visible = items.filter((_, i) => !dismissed.has(i));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2" role="alert" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="popLayout">
        {visible.map((alert, i) => {
          const cfg = severityConfig[alert.severity];
          const Icon = cfg.Icon;
          return (
            <motion.div
              key={`alert-${i}`}
              layout
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn('relative flex items-start gap-3 rounded-xl border p-4', cfg.border, cfg.bg)}
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-card">
                <Icon className={cn('h-3.5 w-3.5', cfg.iconColor)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="text-xs mt-0.5 text-muted-foreground">{alert.description}</p>
                {alert.action && (
                  <Link
                    to={alert.action.path}
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium rounded-lg px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {alert.action.label}
                    <span className="ml-0.5">→</span>
                  </Link>
                )}
              </div>
              <button
                onClick={() => setDismissed(prev => new Set(prev).add(i))}
                className="shrink-0 rounded-lg p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                aria-label="Fermer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
