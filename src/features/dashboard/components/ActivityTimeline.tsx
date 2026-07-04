import { Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

interface ActivityItem {
  time: string;
  icon: string;
  title: string;
  description: string;
}

interface ActivityTimelineProps {
  items: ActivityItem[];
  loading?: boolean;
}

function TimelineSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(dateStr: string, lang: 'fr' | 'en' | 'ar'): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return t('common.today', lang);
  if (diffMin < 60) return `${diffMin}min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function ActivityTimeline({ items, loading }: ActivityTimelineProps) {
  const { lang } = useLang();
  if (loading) return <TimelineSkeleton />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2.5 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <CardTitle className="text-sm font-semibold">{t('common.today', lang)}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Clock className="mb-2 h-6 w-6 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">{t('common.no_data', lang)}</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[320px] pr-3">
            <div className="space-y-0">
              {items.map((item, i) => (
                <div key={i} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < items.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                  )}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm bg-primary/5">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <span className="text-[10px] shrink-0 font-medium text-muted-foreground">{formatTimeAgo(item.time, lang)}</span>
                    </div>
                    <p className="text-xs mt-0.5 line-clamp-1 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
