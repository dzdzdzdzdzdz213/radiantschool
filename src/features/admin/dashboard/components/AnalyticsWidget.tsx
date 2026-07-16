import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { AnalyticsMetric } from '@/features/admin/dashboard/useAdminDashboard';

interface AnalyticsWidgetProps {
  metrics: AnalyticsMetric[];
  loading?: boolean;
  title?: string;
}

function AnalyticsWidgetSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColors = {
  up: 'text-emerald-500',
  down: 'text-red-400',
  neutral: 'text-muted-foreground',
};

const trendBg = {
  up: 'bg-emerald-500/10',
  down: 'bg-red-500/10',
  neutral: 'bg-muted',
};

function AnalyticsMetricRow({ metric }: { metric: AnalyticsMetric }) {
  const TrendIcon = trendIcons[metric.trend];
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-xs text-muted-foreground">{metric.label}</p>
        <p className="text-base font-semibold mt-0.5">{metric.value}</p>
      </div>
      <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${trendBg[metric.trend]}`}>
        <TrendIcon className={`h-3.5 w-3.5 ${trendColors[metric.trend]}`} />
        <span className={`text-xs font-medium ${trendColors[metric.trend]}`}>
          {metric.change > 0 ? '+' : ''}{metric.change}%
        </span>
      </div>
    </div>
  );
}

export default function AnalyticsWidget({ metrics, loading, title }: AnalyticsWidgetProps) {
  const { lang } = useLang();
  if (loading) return <AnalyticsWidgetSkeleton />;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title ?? t('dashboard.stat.analytics', lang)}</CardTitle>
      </CardHeader>
      <CardContent>
        {metrics.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucune donnée disponible
          </p>
        ) : (
          <div className="divide-y divide-border">
            {metrics.map((m, i) => (
              <AnalyticsMetricRow key={i} metric={m} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
