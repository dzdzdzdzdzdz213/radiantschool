import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

interface RevenueChartWidgetProps {
  data: { date: string; amount: number }[];
  loading?: boolean;
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

function EmptyState({ lang }: { lang: 'fr' | 'en' | 'ar' }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.stat.revenue', lang)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-[280px]">
          <p className="text-sm text-muted-foreground">{t('common.no_data', lang)}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">{t('common.info', lang)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface TooltipPayload {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !label) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold mt-0.5">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function RevenueChartWidget({ data, loading }: RevenueChartWidgetProps) {
  const { lang } = useLang();
  if (loading) return <ChartSkeleton />;
  if (!data || data.length === 0) return <EmptyState lang={lang} />;

  const formatted = data.map(d => ({ ...d, label: d.date.slice(5) }));
  const maxVal = Math.max(...data.map(d => d.amount), 1);
  const yTicks = [0, Math.round(maxVal * 0.5), maxVal];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">{t('dashboard.stat.revenue', lang)}</CardTitle>
        <span className="text-xs font-medium rounded-lg px-2.5 py-1 bg-primary/10 text-primary">
          +{data.length} {t('common.today', lang)}
        </span>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formatted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} domain={[0, maxVal]} ticks={yTicks} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: 'var(--primary)', stroke: 'var(--card)', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
