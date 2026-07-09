import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { ChildInfo } from '../useParentDashboard';

interface AttendanceSummaryProps {
  childList: ChildInfo[];
  loading?: boolean;
}

export default function AttendanceSummary({ childList: children, loading }: AttendanceSummaryProps) {
  const { lang } = useLang();
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        {[1, 2].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-primary" />
          {t('dashboard.attendance_today', lang)}
        </h3>
        <p className="text-sm text-muted-foreground py-6 text-center">{t('dashboard.no_attendance_data', lang)}</p>
      </div>
    );
  }

  const avgRate = children.length > 0 ? Math.round(children.reduce((sum, c) => sum + (c.attendanceRate ?? 0), 0) / children.length) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <CalendarCheck className="h-4 w-4 text-primary" />
        {t('dashboard.stat.attendance', lang)}
      </h3>
      <div className="mb-4">
        <div className="flex items-end justify-between mb-1">
          <span className="text-xs text-muted-foreground">{t('dashboard.avg_attendance_rate', lang)}</span>
          <span className="text-sm font-bold">{avgRate}%</span>
        </div>
        <div className="h-2 rounded-full bg-accent overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${avgRate}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${avgRate >= 90 ? 'bg-emerald-500' : avgRate >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
          />
        </div>
      </div>
      <div className="space-y-2">
        {children.map((child) => (
          <div key={child.id} className="flex items-center justify-between">
            <span className="text-sm">{child.firstName} {child.lastName}</span>
            <span className="text-xs font-medium text-muted-foreground">
              {child.attendanceRate ?? 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
