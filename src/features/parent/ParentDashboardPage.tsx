import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Users, DollarSign, BookOpen, CalendarCheck, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { formatCurrency, getFullName } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface ChildSummary {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  attendanceRate: number | null;
  activeCourses: number;
  upcomingClass: string | null;
  nextClassTime: string | null;
}

function PageHeader({ name }: { name: string }) {
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const today = new Date().toLocaleDateString(localeMap[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
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
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('dashboard.greeting', lang, name)}</h1>
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

function ChildCard({ child }: { child: ChildSummary }) {
  const { lang } = useLang();
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary shrink-0">
            {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{getFullName(child.firstName, child.lastName)}</p>
            <p className="text-xs text-muted-foreground">{child.activeCourses} cours actifs</p>
          </div>
          <Link to={`/parent/progress/${child.id}`} className="text-primary hover:text-primary/80 shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <CalendarCheck className="h-4 w-4 mx-auto mb-1 text-green-600" />
            <p className="text-lg font-bold">
              {child.attendanceRate != null ? `${child.attendanceRate}%` : '—'}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('dashboard.stat.attendance', lang)}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <BookOpen className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <p className="text-lg font-bold">{child.activeCourses}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('nav.courses', lang)}</p>
          </div>
        </div>

        {child.upcomingClass && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="truncate">Prochain cours: {child.upcomingClass}</span>
            {child.nextClassTime && <span className="shrink-0 font-medium">{child.nextClassTime}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ParentDashboardPage() {
  const { profile } = useAuth();
  const { lang } = useLang();

  const { data: children } = useQuery({
    queryKey: ['parent-children', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: links } = await supabase
        .from('student_parent')
        .select('student_id, relationship, student:students!student_id(id, user:users!students_id_fkey(id, first_name, last_name, photo_url))')
        .eq('parent_id', profile.id);
      return (links ?? []).map((l: any) => ({ ...l.student?.user, relationship: l.relationship })).filter(Boolean);
    },
    enabled: !!profile?.id,
  });

  const childIds = (children ?? []).map((c: any) => c.id);

  const { data: summaries } = useQuery({
    queryKey: ['parent-children-summary', childIds.join(',')],
    queryFn: async () => {
      if (!childIds.length) return [];

      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = dayNames[new Date().getDay()];

      const [enrRes, attRes, schedRes] = await Promise.all([
        supabase.from('course_enrollments').select('student_id, course:courses(id, name)').in('student_id', childIds).eq('status', 'active'),
        supabase.from('attendance').select('student_id, status').in('student_id', childIds),
        supabase.from('course_schedules').select('id, start_time, end_time, course:courses!inner(id, name), course:courses!inner(course_enrollments!inner(student_id))').eq('day_of_week', today).in('course.course_enrollments.student_id', childIds).order('start_time', { ascending: true }),
      ]);

      const enrollmentsByStudent: Record<string, any[]> = {};
      (enrRes.data ?? []).forEach((e: any) => {
        if (!enrollmentsByStudent[e.student_id]) enrollmentsByStudent[e.student_id] = [];
        enrollmentsByStudent[e.student_id].push(e.course);
      });

      const attendanceByStudent: Record<string, { present: number; total: number }> = {};
      (attRes.data ?? []).forEach((a: any) => {
        if (!attendanceByStudent[a.student_id]) attendanceByStudent[a.student_id] = { present: 0, total: 0 };
        attendanceByStudent[a.student_id].total++;
        if (a.status === 'present') attendanceByStudent[a.student_id].present++;
      });

      const nextClassByStudent: Record<string, { name: string; time: string }> = {};
      (schedRes.data ?? []).forEach((s: any) => {
        const sid = s.course?.course_enrollments?.[0]?.student_id;
        if (sid && !nextClassByStudent[sid]) {
          nextClassByStudent[sid] = { name: s.course.name, time: s.start_time?.slice(0, 5) };
        }
      });

      return childIds.map((id: string): ChildSummary => {
        const child = (children ?? []).find((c: any) => c.id === id);
        const courses = enrollmentsByStudent[id] ?? [];
        const att = attendanceByStudent[id];
        return {
          id,
          firstName: child?.first_name ?? '',
          lastName: child?.last_name ?? '',
          photoUrl: child?.photo_url ?? null,
          attendanceRate: att && att.total > 0 ? Math.round((att.present / att.total) * 100) : null,
          activeCourses: courses.length,
          upcomingClass: nextClassByStudent[id]?.name ?? null,
          nextClassTime: nextClassByStudent[id]?.time ?? null,
        };
      });
    },
    enabled: childIds.length > 0,
  });

  const { data: stats } = useQuery({
    queryKey: ['parent-stats-summary', childIds.join(',')],
    queryFn: async () => {
      if (!childIds.length) return { enrollments: 0, totalPaid: 0 };
      const [enr, pay] = await Promise.all([
        supabase.from('course_enrollments').select('id', { count: 'exact', head: true }).in('student_id', childIds),
        supabase.from('payments').select('amount').in('student_id', childIds).is('deleted_at', null),
      ]);
      return { enrollments: enr.count ?? 0, totalPaid: (pay.data ?? []).reduce((s: any, p: any) => s + Number(p.amount), 0) };
    },
    enabled: childIds.length > 0,
  });

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader name={profile?.firstName ?? ''} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('nav.students', lang)}</p>
              <p className="text-2xl font-bold">{children?.length ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('nav.registrations', lang)}</p>
              <p className="text-2xl font-bold">{stats?.enrollments ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('nav.payments', lang)}</p>
              <p className="text-2xl font-bold">{stats ? formatCurrency(stats.totalPaid) : '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {summaries && summaries.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Suivi des enfants
            </h2>
            <Link to="/parent/enroll" className="text-sm text-primary hover:underline flex items-center gap-1">
              {t('common.enroll', lang)} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summaries.map(child => <ChildCard key={child.id} child={child} />)}
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Actions rapides</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Link to="/parent/enroll" className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              {t('common.enroll', lang)} un enfant
            </Link>
            <Link to="/parent/payments" className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm">
              <DollarSign className="h-4 w-4 text-primary" />
              Voir les paiements
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Dernières notifications</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground text-center py-6">
            Aucune notification récente
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
