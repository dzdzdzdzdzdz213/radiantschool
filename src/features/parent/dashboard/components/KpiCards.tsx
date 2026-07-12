import { motion } from 'framer-motion';
import { Users, Calendar, FileText, TrendingUp, DollarSign, Bell, GraduationCap } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { ParentKpi } from '../useParentDashboard';

interface KpiCardsProps {
  kpi: ParentKpi;
  loading?: boolean;
}

export default function KpiCards({ kpi, loading }: KpiCardsProps) {
  const { lang } = useLang();

  const kpiConfig = [
    { key: 'childrenCount', label: t('dashboard.kpi_children_enrolled', lang), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', format: (v: number) => String(v) },
    { key: 'totalUpcomingClasses', label: t('dashboard.kpi_courses_today', lang), icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950', format: (v: number) => String(v) },
    { key: 'totalPendingHomework', label: t('dashboard.kpi_homework_pending', lang), icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950', format: (v: number) => String(v) },
    { key: 'totalCompletedHomework', label: t('dashboard.kpi_homework_completed', lang), icon: GraduationCap, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', format: (v: number) => String(v) },
    { key: 'overallAttendanceRate', label: t('dashboard.kpi_attendance_rate', lang), icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950', format: (v: number) => `${v}%` },
    { key: 'totalOutstandingBalance', label: t('dashboard.kpi_outstanding_balance', lang), icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', format: (v: number) => formatCurrency(v) },
    { key: 'unreadNotifications', label: t('dashboard.kpi_notifications', lang), icon: Bell, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', format: (v: number) => String(v) },
  ] as const;
  if (loading) {
    return <>{Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3 shimmer">
        <div className="h-3 w-24 rounded shimmer" />
        <div className="h-8 w-20 rounded shimmer" />
        <div className="h-3 w-16 rounded shimmer" />
      </div>
    ))}</>;
  }

  return <>
    {kpiConfig.map((cfg, idx) => {
      const Icon = cfg.icon;
      const value = kpi[cfg.key as keyof ParentKpi] as number;
      return (
        <motion.div key={cfg.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.03 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">{cfg.label}</p>
              <p className="text-2xl font-bold tracking-tight">{cfg.format(value)}</p>
            </div>
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', cfg.bg)}>
              <Icon className={cn('h-5 w-5', cfg.color)} />
            </div>
          </div>
        </motion.div>
      );
    })}
  </>;
}
