import { motion } from 'framer-motion';
import { BookOpen, Users, ClipboardCheck, Clock, BarChart3, DollarSign, Star, GraduationCap, FileText, UserPlus, Calendar } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { TeacherKpi } from '../useTeacherDashboard';

interface TeacherKpiCardsProps {
  kpi: TeacherKpi;
  loading?: boolean;
}

const kpiConfig = [
  { key: 'todayClasses', label: 'Cours aujourd\'hui', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', format: (v: number) => String(v) },
  { key: 'studentsToday', label: 'Élèves aujourd\'hui', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950', format: (v: number) => String(v) },
  { key: 'attendanceRate', label: 'Taux de présence', icon: ClipboardCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', format: (v: number) => `${v}%` },
  { key: 'absentStudents', label: 'Absents', icon: Clock, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', format: (v: number) => String(v) },
  { key: 'upcomingClasses', label: 'Cours à venir', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950', format: (v: number) => String(v) },
  { key: 'assignmentsPending', label: 'Devoirs à corriger', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950', format: (v: number) => String(v) },
  { key: 'resourcesUploaded', label: 'Ressources', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', format: (v: number) => String(v) },
  { key: 'teachingHoursMonth', label: 'Heures ce mois', icon: Clock, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950', format: (v: number) => `${v}h` },
  { key: 'revenueMonth', label: 'Revenu du mois', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', format: (v: number) => formatCurrency(v) },
  { key: 'completedLessons', label: 'Leçons complétées', icon: GraduationCap, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950', format: (v: number) => String(v) },
  { key: 'privateLessonsToday', label: 'Cours particuliers', icon: UserPlus, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950', format: (v: number) => String(v) },
  { key: 'vipSessionsToday', label: 'Sessions VIP', icon: Star, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950', format: (v: number) => String(v) },
] as const;

export default function TeacherKpiCards({ kpi, loading }: TeacherKpiCardsProps) {
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
          <div className="mt-3 flex items-center gap-1">
            <span className={cn('text-xs font-medium', value > 0 ? 'text-emerald-600' : 'text-muted-foreground')}>{value > 0 ? `+${value}` : '0'}</span>
            <span className="text-xs text-muted-foreground">vs hier</span>
          </div>
        </motion.div>
      );
    })}
  </>;
}