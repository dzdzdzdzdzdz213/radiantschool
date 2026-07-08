import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { PendingRegistration } from '../useAssistantDashboard';

interface PendingRegistrationsProps {
  data: PendingRegistration[];
  loading?: boolean;
}

export default function PendingRegistrations({ data, loading }: PendingRegistrationsProps) {
  const { lang } = useLang();
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          {t('nav.registrations', lang)}
        </h3>
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link to="/assistant/registrations">
            {t('common.view_all', lang)} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
      <div className="space-y-2">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">{t('common.no_data', lang)}</p>
        ) : (
          data.slice(0, 5).map((reg) => (
            <div key={reg.id} className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-950/50 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{reg.studentName}</p>
                <p className="text-xs text-muted-foreground">{reg.courseName} • {formatDateTime(reg.requestedAt)}</p>
              </div>
              <Link
                to={`/assistant/registrations?id=${reg.id}`}
                className="shrink-0 text-xs font-medium text-primary hover:underline ml-2"
              >
                {t('common.edit', lang)}
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}