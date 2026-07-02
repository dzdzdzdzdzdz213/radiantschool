import { motion } from 'framer-motion';
import { Users, DollarSign, ClipboardCheck, FileText, Bell, Clock, UserPlus, GraduationCap } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { AssistantKpi } from '../useAssistantDashboard';

interface KpiCardsProps {
  kpi: AssistantKpi;
  loading?: boolean;
}

function KpiSkeleton() {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-pulse">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-8 w-20 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
      ))}
    </>
  );
}

export default function KpiCards({ kpi, loading }: KpiCardsProps) {
  const { lang } = useLang();
  if (loading) return <KpiSkeleton />;

  const kpiConfig = [
    { key: 'todayRegistrations', label: t('common.today', lang) + ' ' + t('nav.registrations', lang), icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', format: (v: number) => String(v) },
    { key: 'pendingRegistrations', label: t('status.pending', lang), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950', format: (v: number) => String(v) },
    { key: 'todayAttendance', label: t('status.present', lang), icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950', format: (v: number) => String(v) },
    { key: 'absentStudents', label: t('status.absent', lang), icon: Users, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', format: (v: number) => String(v) },
    { key: 'todayRevenue', label: t('dashboard.stat.revenue', lang), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', format: (v: number) => formatCurrency(v) },
    { key: 'pendingPayments', label: t('status.pending', lang) + ' ' + t('nav.payments', lang), icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', format: (v: number) => String(v) },
    { key: 'invoicesGenerated', label: t('nav.invoices', lang), icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', format: (v: number) => String(v) },
    { key: 'rfidScansToday', label: 'RFID', icon: Bell, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950', format: (v: number) => String(v) },
    { key: 'upcomingClasses', label: t('status.upcoming', lang) + ' ' + t('nav.courses', lang), icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950', format: (v: number) => String(v) },
    { key: 'waitingList', label: t('status.waiting', lang), icon: Users, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950', format: (v: number) => String(v) },
    { key: 'privateLessonRequests', label: t('nav.private_lessons', lang), icon: UserPlus, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950', format: (v: number) => String(v) },
    { key: 'vipStudentsToday', label: t('type.vip', lang) + ' ' + t('role.student', lang), icon: GraduationCap, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950', format: (v: number) => String(v) },
  ] as const;

  return (
    <>
      {kpiConfig.map((cfg, idx) => {
        const Icon = cfg.icon;
        const value = kpi[cfg.key as keyof AssistantKpi] as number;
        return (
          <motion.div
            key={cfg.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.03 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
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
            <div className="mt-3 flex items-center gap-1">
              <span className={cn('text-xs font-medium', value > 0 ? 'text-emerald-600' : 'text-muted-foreground')}>
                {value > 0 ? `+${value}` : '0'}
              </span>
              <span className="text-xs text-muted-foreground">{t('common.yesterday', lang)}</span>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}