import { motion } from 'framer-motion';
import { BookOpen, Users, ClipboardCheck, Clock, BarChart3, DollarSign, Star, GraduationCap, FileText, UserPlus, Calendar } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { TeacherKpi } from '../useTeacherDashboard';

interface TeacherKpiCardsProps {
  kpi: TeacherKpi;
  loading?: boolean;
}

export default function TeacherKpiCards({ kpi, loading }: TeacherKpiCardsProps) {
  const { lang } = useLang();

  const kpiConfig = [
    { key: 'todayClasses', label: t('teacher.kpi_courses_today', lang), icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', format: (v: number) => String(v) },
    { key: 'studentsToday', label: t('teacher.kpi_students_today', lang), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950', format: (v: number) => String(v) },
    { key: 'attendanceRate', label: t('teacher.kpi_attendance_rate', lang), icon: ClipboardCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', format: (v: number) => `${v}%` },
    { key: 'absentStudents', label: t('teacher.kpi_absent', lang), icon: Clock, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', format: (v: number) => String(v) },
    { key: 'upcomingClasses', label: t('teacher.kpi_upcoming', lang), icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950', format: (v: number) => String(v) },
    { key: 'assignmentsPending', label: t('teacher.kpi_homework_pending', lang), icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950', format: (v: number) => String(v) },
    { key: 'resourcesUploaded', label: t('teacher.kpi_resources', lang), icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', format: (v: number) => String(v) },
    { key: 'teachingHoursMonth', label: t('teacher.kpi_hours', lang), icon: Clock, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950', format: (v: number) => `${v}h` },
    { key: 'revenueMonth', label: t('teacher.kpi_revenue', lang), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', format: (v: number) => formatCurrency(v) },
    { key: 'completedLessons', label: t('teacher.kpi_lessons', lang), icon: GraduationCap, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950', format: (v: number) => String(v) },
    { key: 'privateLessonsToday', label: t('teacher.kpi_private', lang), icon: UserPlus, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950', format: (v: number) => String(v) },
    { key: 'vipSessionsToday', label: t('teacher.kpi_vip', lang), icon: Star, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950', format: (v: number) => String(v) },
  ] as const;
  if (loading) {
    return <>{Array.from({ length: 12 }).map((_, i) => <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-pulse"><div className="h-3 w-24 bg-muted rounded" /><div className="h-8 w-20 bg-muted rounded" /><div className="h-3 w-16 bg-muted rounded" /></div>)}</>;
  }

  return <>
    {kpiConfig.map((cfg, idx) => {
      const Icon = cfg.icon;
      const value = kpi[cfg.key as keyof TeacherKpi] as number;
      return (
        <motion.div key={cfg.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.03 }}
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
        </motion.div>
      );
    })}
  </>;
}