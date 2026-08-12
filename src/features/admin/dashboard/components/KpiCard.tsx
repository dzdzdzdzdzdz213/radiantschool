import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import PhotoBackdrop from '@/components/PhotoBackdrop';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { up: boolean; pct: string };
  icon: LucideIcon;
  sparklineData?: { value: number }[];
  loading?: boolean;
  className?: string;
}

function KpiSkeleton() {
  return (
    <Card className="p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-16" />
    </Card>
  );
}

export default function KpiCard({ title, value, subtitle, trend, icon: Icon, loading, className }: KpiCardProps) {
  if (loading) return <KpiSkeleton />;

  return (
    <PhotoBackdrop className={cn('p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 min-w-0 z-10">
          <p className="text-xs font-medium tracking-wider uppercase text-white/80">{title}</p>
          <p className="text-3xl font-bold tracking-tight truncate text-white drop-shadow">{value}</p>
          {subtitle && (
            <p className="text-xs text-white/70">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {trend.up ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              )}
              <span className={trend.up ? 'text-emerald-400' : 'text-red-400'}>{trend.pct}</span>
              <span className="text-white/60">vs hier</span>
            </div>
          )}
        </div>
        <div className="shrink-0 rounded-xl p-3.5 bg-white/15 backdrop-blur-sm z-10">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </PhotoBackdrop>
  );
}