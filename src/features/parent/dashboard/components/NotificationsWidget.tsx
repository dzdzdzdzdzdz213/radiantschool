import { Bell } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsWidgetProps {
  data: Notification[];
  loading?: boolean;
}

export default function NotificationsWidget({ data, loading }: NotificationsWidgetProps) {
  const { lang } = useLang();
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          {t('dashboard.notifications', lang)}
        </h3>
        <div className="flex flex-col items-center py-6">
          <Bell className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
          <p className="text-sm text-muted-foreground">{t('dashboard.no_notifications', lang)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{t('dashboard.notifications', lang)}</h3>
        {data.filter(n => !n.is_read).length > 0 && (
          <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {t('dashboard.new_notifications', lang, String(data.filter(n => !n.is_read).length))}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {data.slice(0, 5).map((n) => (
          <div key={n.id} className={`flex items-start gap-3 rounded-xl p-3 ${!n.is_read ? 'bg-primary/5' : ''}`}>
            <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${!n.is_read ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug truncate">{n.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
