import { useAuth } from '@/hooks/useAuth';
import { useTeacherDashboard } from './useTeacherDashboard';
import TeacherKpiCards from './components/TeacherKpiCards';
import { BookOpen, ClipboardCheck, FileText, Bell, Calendar, BarChart3, Users, Video, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };

function PageHeader({ name }: { name: string }) {
  const { lang } = useLang();
  const today = new Date().toLocaleDateString(localeMap[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[140%] bg-gradient-radial from-primary/[0.06] to-transparent" />
        </div>
        <CardContent className="relative z-10 p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t('dashboard.greeting', lang, name)}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <p className="text-sm text-muted-foreground">{today}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoadingGrid() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[104px] rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function TeacherDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLang();
  const { kpi, todayClasses, isLoading, isError } = useTeacherDashboard();

  const quickActions = [
    { label: t('dashboard.take_attendance', lang), icon: ClipboardCheck, path: '/teacher/attendance', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
    { label: t('dashboard.upload_resource', lang), icon: FileText, path: '/teacher/resources', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400' },
    { label: t('dashboard.create_assignment', lang), icon: BookOpen, path: '/teacher/assignments', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
    { label: t('dashboard.publish_announcement', lang), icon: Bell, path: '/teacher/announcements', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400' },
    { label: t('dashboard.start_online_class', lang), icon: Video, path: '/teacher/online-classes', color: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' },
    { label: t('dashboard.view_schedule', lang), icon: Calendar, path: '/teacher/schedule', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' },
    { label: t('dashboard.attendance_report', lang), icon: BarChart3, path: '/teacher/reports', color: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400' },
    { label: t('dashboard.student_list', lang), icon: Users, path: '/teacher/students', color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400' },
  ];

  if (isLoading) return <LoadingGrid />;

  if (isError) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader name={profile?.firstName ?? ''} />
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-6 text-center">
          <p className="text-red-600 font-medium">{t('dashboard.load_error', lang)}</p>
          <p className="text-sm text-red-500 mt-1">{t('dashboard.load_error_retry', lang)}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader name={profile?.firstName ?? ''} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
        <TeacherKpiCards kpi={kpi} loading={isLoading} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">{t('dashboard.quick_actions', lang)}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickActions.map((action, idx) => (
            <motion.button key={action.path} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, delay: idx * 0.02 }}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all hover:bg-accent hover:shadow-sm active:scale-95"
            >
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', action.color)}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium leading-tight">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {t('dashboard.courses_today', lang)}
          </h3>
          {todayClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{t('dashboard.no_courses_today', lang)}</p>
          ) : (
            <div className="space-y-2">
              {todayClasses.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl bg-accent/50 p-3">
                  <div className="flex flex-col items-center justify-center min-w-[48px]">
                    <span className="text-sm font-bold">{c.startTime?.slice(0, 5)}</span>
                    <span className="text-[10px] text-muted-foreground">{c.endTime?.slice(0, 5)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.courseName}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.roomName} • {c.studentCount} {t('dashboard.students_count', lang)}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {c.studentCount} {t('dashboard.present_count', lang)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t('dashboard.month_overview', lang)}
          </h3>
          <div className="space-y-4">
            {[
              { label: t('dashboard.teaching_hours', lang), value: `${kpi.teachingHoursMonth}h`, color: 'text-blue-600', progress: Math.min(kpi.teachingHoursMonth / 40 * 100, 100) },
              { label: t('common.revenue', lang), value: `${(kpi.revenueMonth / 1000).toFixed(1)}k DA`, color: 'text-green-600', progress: Math.min(kpi.revenueMonth / 100000 * 100, 100) },
              { label: t('dashboard.stat.attendance_rate', lang), value: `${kpi.attendanceRate}%`, color: 'text-emerald-600', progress: kpi.attendanceRate },
              { label: t('teacher.kpi_homework_pending', lang), value: String(kpi.assignmentsPending), color: 'text-amber-600', progress: Math.min(kpi.assignmentsPending * 10, 100) },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={cn('font-semibold', item.color)}>{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-accent overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', item.color.replace('text-', 'bg-'))} style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}