import { Clock, CheckCircle2, XCircle, DollarSign, FileText } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { ActivityItem } from '../useParentDashboard';

interface ActivityTimelineProps {
  data: ActivityItem[];
  loading?: boolean;
}

const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };

const typeConfig: Record<string, { icon: React.ElementType; bg: string; iconColor: string }> = {
  presence: { icon: CheckCircle2, bg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
  absence: { icon: XCircle, bg: 'bg-red-500/10', iconColor: 'text-red-500' },
  retard: { icon: Clock, bg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
  payment: { icon: DollarSign, bg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
  homework: { icon: FileText, bg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
  homework_done: { icon: CheckCircle2, bg: 'bg-green-500/10', iconColor: 'text-green-500' },
};

export default function ActivityTimeline({ data, loading }: ActivityTimelineProps) {
  const { lang } = useLang();
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        {t('dashboard.recent_activity', lang)}
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">{t('dashboard.no_activity', lang)}</p>
      ) : (
        <div className="space-y-2">
          {data.slice(0, 8).map((item, idx) => {
            const cfg = typeConfig[item.type] ?? typeConfig.homework;
            const Icon = cfg.icon;
            return (
              <div key={`${item.type}-${item.id}-${idx}`} className="flex items-start gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 mt-0.5 ${cfg.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(item.timestamp).toLocaleDateString(localeMap[lang])}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
