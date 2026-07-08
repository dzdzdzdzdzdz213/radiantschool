import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

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

export default function KpiCard({ title, value, subtitle, trend, icon: Icon, sparklineData, loading, className }: KpiCardProps) {
  if (loading) return <KpiSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className={cn('relative overflow-hidden p-5', className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0 z-10">
            <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight truncate">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1.5 text-xs font-medium">
                {trend.up ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                )}
                <span className={trend.up ? 'text-emerald-500' : 'text-red-400'}>{trend.pct}</span>
                <span className="text-muted-foreground">vs hier</span>
              </div>
            )}
          </div>
          <div className="shrink-0 rounded-xl p-3.5 bg-primary/10 z-10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {sparklineData && sparklineData.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
