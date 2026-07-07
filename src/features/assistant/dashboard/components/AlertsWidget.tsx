import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { DashboardAlert } from '../useAssistantDashboard';

interface AlertsWidgetProps {
  alerts: DashboardAlert[];
  loading?: boolean;
}

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900' },
};

export default function AlertsWidget({ alerts, loading }: AlertsWidgetProps) {
  const { lang } = useLang();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        {[1, 2].map(i => (
          <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        {t('common.warning', lang)}
      </h3>
      <div className="space-y-2">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className={cn('flex items-start gap-3 rounded-xl border p-3.5 transition-colors', config.bg)}
            >
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.color)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
              </div>
              {alert.action && (
                <button
                  onClick={() => navigate(alert.action?.path ?? '')}
                  className="shrink-0 text-xs font-medium text-primary hover:underline whitespace-nowrap"
                >
                  {alert.action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}