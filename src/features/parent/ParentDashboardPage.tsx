import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, DollarSign, BookOpen, CalendarCheck, TrendingUp, ArrowRight, Clock, UserPlus, type LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { formatCurrency, getFullName } from '@/lib/utils';
import { Link } from 'react-router-dom';
import HonestyBoxWidget from '@/features/shared/HonestyBoxWidget';

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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
      <div className="cahier-margin rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{today}</p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{t('dashboard.greeting', lang, name)}</h1>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, color, delay }: { icon: LucideIcon; label: string; value: string | number; color: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}>
      <div className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className={`h-1 bg-gradient-to-r ${color}`} />
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ChildCard({ child, delay }: { child: ChildSummary; delay: number }) {
  const { lang } = useLang();
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}>
      <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:shadow-pink-500/5 transition-all duration-300">
        <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
        <div className="p-5">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white text-sm font-bold shrink-0">
              {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{getFullName(child.firstName, child.lastName)}</p>
              <p className="text-xs text-muted-foreground">{child.activeCourses} cours actifs</p>
            </div>
            <Link to={`/parent/progress/${child.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <CalendarCheck className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
              <p className="text-lg font-bold">
                {child.attendanceRate != null ? `${child.attendanceRate}%` : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Présence</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <BookOpen className="h-4 w-4 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold">{child.activeCourses}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Cours</p>
            </div>
          </div>

          {child.upcomingClass && (
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground border-t border-border/50 pt-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-pink-500/10">
                <Clock className="h-3 w-3 text-pink-500" />
              </div>
              <span className="truncate">{child.upcomingClass}</span>
              {child.nextClassTime && <span className="shrink-0 font-semibold">{child.nextClassTime}</span>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
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
      return (links ?? []).map((l) => ({ ...l.student?.user, relationship: l.relationship })).filter(Boolean);
    },
    enabled: !!profile?.id,
  });

  const childIds = (children ?? []).map((c) => c.id);

  const { data: summaries } = useQuery({
    queryKey: ['parent-children-summary', childIds.join(',')],
    queryFn: async () => {
      if (!childIds.length) return [];

      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
      const today = dayNames[new Date().getDay()];

      const [enrRes, attRes, schedRes] = await Promise.all([
        supabase.from('course_enrollments').select('student_id, course:courses(id, name)').in('student_id', childIds).eq('status', 'active'),
        supabase.from('attendance').select('student_id, status').in('student_id', childIds),
        supabase.from('course_schedules').select('id, start_time, end_time, course:courses!inner(id, name, course_enrollments!inner(student_id))').eq('day_of_week', today).in('course.course_enrollments.student_id', childIds).order('start_time', { ascending: true }),
      ]);

      const enrollmentsByStudent: Record<string, NonNullable<NonNullable<(typeof enrRes.data)>[number]['course']>[]> = {};
      (enrRes.data ?? []).forEach((e) => {
        if (!enrollmentsByStudent[e.student_id]) enrollmentsByStudent[e.student_id] = [];
        if (e.course) enrollmentsByStudent[e.student_id].push(e.course);
      });

      const attendanceByStudent: Record<string, { present: number; total: number }> = {};
      (attRes.data ?? []).forEach((a) => {
        if (!attendanceByStudent[a.student_id]) attendanceByStudent[a.student_id] = { present: 0, total: 0 };
        attendanceByStudent[a.student_id].total++;
        if (a.status === 'present') attendanceByStudent[a.student_id].present++;
      });

      const nextClassByStudent: Record<string, { name: string; time: string }> = {};
      (schedRes.data ?? []).forEach((s) => {
        const sid = s.course?.course_enrollments?.[0]?.student_id;
        if (sid && !nextClassByStudent[sid]) {
          nextClassByStudent[sid] = { name: s.course?.name ?? '', time: s.start_time?.slice(0, 5) ?? '' };
        }
      });

      return childIds.map((id: string): ChildSummary => {
        const child = (children ?? []).find((c) => c.id === id);
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
      return { enrollments: enr.count ?? 0, totalPaid: (pay.data ?? []).reduce((s, p) => s + Number(p.amount), 0) };
    },
    enabled: childIds.length > 0,
  });

  const { data: privateLessons } = useQuery({
    queryKey: ['parent-children-private-lessons', childIds.join(',')],
    queryFn: async () => {
      if (!childIds.length) return [];
      const { data } = await supabase
        .from('private_lessons')
        .select('*, student:users!student_id(first_name, last_name), teacher:users!teacher_id(first_name, last_name)')
        .in('student_id', childIds)
        .order('created_at', { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: childIds.length > 0,
  });

  const statsData = [
    { icon: Users, label: t('nav.students', lang), value: children?.length ?? 0, color: 'from-pink-500 to-pink-600' },
    { icon: BookOpen, label: t('nav.registrations', lang), value: stats?.enrollments ?? 0, color: 'from-blue-500 to-blue-600' },
    { icon: DollarSign, label: t('nav.payments', lang), value: stats ? formatCurrency(stats.totalPaid) : '—', color: 'from-violet-500 to-violet-600' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader name={profile?.firstName ?? ''} />

      <div className="grid gap-4 sm:grid-cols-3">
        {statsData.map((s, i) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} delay={0.05 + i * 0.05} />
        ))}
      </div>

      {summaries && summaries.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pink-500" />
              Suivi des enfants
            </h2>
            <Link to="/parent/enroll" className="text-sm text-primary hover:underline flex items-center gap-1">
              {t('common.enroll', lang)} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summaries.map((child, i) => <ChildCard key={child.id} child={child} delay={0.25 + i * 0.05} />)}
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}>
          <div className="rounded-2xl border border-border bg-card overflow-hidden h-full">
            <div className="flex items-center gap-2.5 p-5 pb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10">
                <BookOpen className="h-4 w-4 text-pink-600" />
              </div>
              <h2 className="text-sm font-semibold">Actions rapides</h2>
            </div>
            <div className="p-5 space-y-2">
              <Link to="/parent/enroll" className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-sm group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10">
                  <BookOpen className="h-4 w-4 text-pink-500" />
                </div>
                <span className="font-medium group-hover:text-foreground transition-colors">{t('common.enroll', lang)} un enfant</span>
              </Link>
              <Link to="/parent/payments" className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-sm group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                  <DollarSign className="h-4 w-4 text-violet-500" />
                </div>
                <span className="font-medium group-hover:text-foreground transition-colors">Voir les paiements</span>
              </Link>
              <Link to="/parent/enroll" className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-sm group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <UserPlus className="h-4 w-4 text-blue-500" />
                </div>
                <span className="font-medium group-hover:text-foreground transition-colors">Demander un cours particulier</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Private lessons */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <div className="rounded-2xl border border-border bg-card overflow-hidden h-full">
            <div className="flex items-center gap-2.5 p-5 pb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <UserPlus className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-sm font-semibold">Cours particuliers</h2>
            </div>
            <div className="p-5">
              {!privateLessons?.length ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30 mb-3">
                    <UserPlus className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">Aucun cours particulier</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {privateLessons.map((pl) => (
                    <div key={pl.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{pl.student?.first_name} {pl.student?.last_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {pl.teacher?.first_name} {pl.teacher?.last_name}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        pl.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600' :
                        pl.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                        'bg-amber-500/10 text-amber-600'
                      }`}>
                        {pl.status === 'accepted' ? 'Accepté' : pl.status === 'rejected' ? 'Refusé' : 'En attente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <HonestyBoxWidget />
    </div>
  );
}
