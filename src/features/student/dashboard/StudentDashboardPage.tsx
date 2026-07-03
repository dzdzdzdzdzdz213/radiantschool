import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, BookOpen, ClipboardCheck, FileText, DollarSign,
  Award, Star, UserPlus, Video, GraduationCap,
  ArrowRight, Download, MessageSquare, CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLang } from '@/contexts/LangContext';
import { t, type Lang } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useStudentDashboard } from '@/features/student/dashboard/useStudentDashboard';

const kpiConfig = [
  { key: 'attendanceRate', labelKey: 'dashboard.stat.attendance_rate', icon: ClipboardCheck, suffix: '%', color: 'text-emerald-500' },
  { key: 'todayClasses', labelKey: 'dashboard.stat.courses', icon: Calendar, suffix: '', color: 'text-blue-500' },
  { key: 'homeworkDue', labelKey: 'nav.homework', icon: FileText, suffix: '', color: 'text-amber-500' },
  { key: 'homeworkCompleted', labelKey: 'status.completed', icon: FileText, suffix: '', color: 'text-emerald-500' },
  { key: 'coursesEnrolled', labelKey: 'nav.my_courses', icon: BookOpen, suffix: '', color: 'text-violet-500' },
  { key: 'upcomingLessons', labelKey: 'status.upcoming', icon: Clock, suffix: '', color: 'text-sky-500' },
  { key: 'pendingPayments', labelKey: 'status.pending', icon: DollarSign, suffix: '', color: 'text-red-500' },
  { key: 'remainingBalance', labelKey: 'common.total', icon: CreditCard, suffix: ' DA', color: 'text-orange-500' },

  { key: 'privateLessons', labelKey: 'nav.private_lessons', icon: UserPlus, suffix: '', color: 'text-indigo-500' },
  { key: 'vipLessons', labelKey: 'nav.vip_classes', icon: Star, suffix: '', color: 'text-amber-500' },
  { key: 'certificatesEarned', labelKey: 'nav.certificates', icon: Award, suffix: '', color: 'text-emerald-500' },
];

const quickActions = [
  { labelKey: 'nav.online_classes', path: '/student/online-classes', icon: Video, color: 'bg-violet-500/10 text-violet-600' },
  { labelKey: 'nav.schedule', path: '/student/schedule', icon: Calendar, color: 'bg-blue-500/10 text-blue-600' },
  { labelKey: 'nav.homework', path: '/student/homework', icon: FileText, color: 'bg-amber-500/10 text-amber-600' },
  { labelKey: 'nav.resources', path: '/student/resources', icon: Download, color: 'bg-emerald-500/10 text-emerald-600' },
  { labelKey: 'nav.payments', path: '/student/payments', icon: CreditCard, color: 'bg-red-500/10 text-red-600' },
  { labelKey: 'nav.private_lessons', path: '/student/private-lessons', icon: UserPlus, color: 'bg-indigo-500/10 text-indigo-600' },
  { labelKey: 'nav.messages', path: '/student/messages', icon: MessageSquare, color: 'bg-sky-500/10 text-sky-600' },
  { labelKey: 'nav.attendance', path: '/student/attendance', icon: ClipboardCheck, color: 'bg-primary/10 text-primary' },
];

function KpiCard({ item, value, isLoading, lang }: { item: typeof kpiConfig[0]; value: number | string; isLoading: boolean; lang: Lang }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl ${item.color.replace('text-', 'bg-').replace('600', '500')}/10 flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${item.color}`} />
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-2"><Skeleton className="h-8 w-20" /><Skeleton className="h-3 w-28" /></div>
      ) : (
        <>
          <p className="text-2xl font-bold tracking-tight">{value}{item.suffix}</p>
          <p className="text-xs text-muted-foreground mt-1">{t(item.labelKey, lang)}</p>
        </>
      )}
    </motion.div>
  );
}

export default function StudentDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLang();
  const { kpi, kpiLoading, kpiError } = useStudentDashboard();

  if (kpiError) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">{t('dashboard.greeting', lang, profile?.firstName ?? '')}</h1><p className="text-sm text-muted-foreground mt-1">Votre tableau de bord</p></div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-6 text-center">
          <p className="text-red-600 font-medium">Erreur de chargement des données</p>
          <p className="text-sm text-red-500 mt-1">Veuillez rafraîchir la page ou réessayer plus tard.</p>
        </div>
      </div>
    );
  }

  const kpiValues: Record<string, number> = {
    attendanceRate: kpi?.attendanceRate ?? 0,
    todayClasses: kpi?.todayClasses ?? 0,
    homeworkDue: kpi?.homeworkDue ?? 0,
    homeworkCompleted: kpi?.homeworkCompleted ?? 0,
    coursesEnrolled: kpi?.coursesEnrolled ?? 0,
    upcomingLessons: kpi?.upcomingLessons ?? 0,
    pendingPayments: kpi?.pendingPayments ?? 0,
    remainingBalance: kpi?.remainingBalance ?? 0,
    learningProgress: kpi?.learningProgress ?? 0,
    privateLessons: kpi?.privateLessons ?? 0,
    vipLessons: kpi?.vipLessons ?? 0,
    certificatesEarned: kpi?.certificatesEarned ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.greeting', lang, profile?.firstName ?? '')}</h1>
              <p className="text-sm text-muted-foreground">
                {kpi?.nextClassToday ? (
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{t('status.upcoming', lang)}: {kpi.nextClassCourse} — {kpi.nextClassTime}</span>
                ) : (
                  t('common.no_data', lang)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kpiConfig.slice(0, 8).map(item => (
          <KpiCard key={item.key} item={item} value={kpiValues[item.key]} isLoading={kpiLoading} lang={lang} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiConfig.slice(8).map(item => (
          <KpiCard key={item.key} item={item} value={kpiValues[item.key]} isLoading={kpiLoading} lang={lang} />
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">{t('dashboard.quick_actions', lang)}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 hover:bg-accent/50 hover:shadow-sm transition-all duration-200"
                >
                  <div className={`h-10 w-10 rounded-xl ${action.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">{t(action.labelKey, lang)}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">{t('nav.my_courses', lang)}</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate('/student/courses')}>
              {t('common.view_all', lang)} <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {kpiLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-16 rounded-xl" />))}</div>
            ) : kpi && kpi.todayClasses > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4 rounded-xl bg-accent/50 p-4">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="h-4 w-4 text-primary" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{kpi.nextClassCourse ?? 'Cours'}</p>
                    <p className="text-xs text-muted-foreground">{kpi.nextClassTime ?? ''} · {kpi.nextClassRoom ?? ''}</p>
                  </div>
                  <Badge variant="outline">{kpi.todayClasses} {t('nav.courses', lang)}</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground"><Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" /><p className="text-sm">{t('common.no_data', lang)}</p></div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">{t('dashboard.stat.avg_grade', lang)}</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate('/student/courses')}>
              {t('nav.my_courses', lang)} <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {kpiLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-12 rounded-xl" />))}</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between text-sm"><span>{t('dashboard.stat.attendance', lang)}</span><span className="font-medium">{kpi?.attendanceRate ?? 0}%</span></div>
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${kpi?.attendanceRate ?? 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-2 rounded-lg bg-accent/50"><p className="text-lg font-bold">{kpi?.coursesEnrolled ?? 0}</p><p className="text-[10px] text-muted-foreground">{t('nav.my_courses', lang)}</p></div>
                  <div className="text-center p-2 rounded-lg bg-accent/50"><p className="text-lg font-bold">{kpi?.homeworkCompleted ?? 0}</p><p className="text-[10px] text-muted-foreground">{t('status.completed', lang)}</p></div>
                  <div className="text-center p-2 rounded-lg bg-accent/50"><p className="text-lg font-bold">{kpi?.certificatesEarned ?? 0}</p><p className="text-[10px] text-muted-foreground">{t('nav.certificates', lang)}</p></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}