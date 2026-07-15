import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
              <Sparkles className="h-7 w-7 text-amber-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('dashboard.greeting', lang, name)}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <p className="text-sm text-muted-foreground">{today}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function StudentDashboardPage() {
  const { profile } = useAuth();
  const { lang } = useLang();

  const { data: stats } = useQuery({
    queryKey: ['student-dashboard', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { enrollments: 0, payments: 0, totalPaid: 0, attendances: 0 };
      const [enr, pay, att] = await Promise.all([
        supabase.from('course_enrollments').select('id', { count: 'exact', head: true }).eq('student_id', profile.id),
        supabase.from('payments').select('amount').eq('student_id', profile.id).is('deleted_at', null),
        supabase.from('attendance_records').select('id', { count: 'exact', head: true }).eq('student_id', profile.id),
      ]);
      const totalPaid = (pay.data ?? []).reduce((s, p: any) => s + Number(p.amount), 0);
      return { enrollments: enr.count ?? 0, payments: (pay.data ?? []).length, totalPaid, attendances: att.count ?? 0 };
    },
    enabled: !!profile?.id,
  });

  const { data: upcoming } = useQuery({
    queryKey: ['student-upcoming', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const today = DAY_NAMES[new Date().getDay()];
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', profile.id)
        .eq('status', 'active');
      const courseIds = (enrollments ?? []).map(e => e.course_id);
      if (!courseIds.length) return [];
      const { data } = await supabase
        .from('course_schedules')
        .select('id, start_time, end_time, course:courses(name), room:rooms(name)')
        .in('course_id', courseIds)
        .eq('day_of_week', today as any)
        .order('start_time')
        .limit(5);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  if (!profile) return null;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader name={profile.firstName ?? ''} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('nav.my_courses', lang)}</p>
              <p className="text-2xl font-bold">{stats?.enrollments ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('nav.attendance', lang)}</p>
              <p className="text-2xl font-bold">{stats?.attendances ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('nav.payments', lang)}</p>
              <p className="text-2xl font-bold">{stats ? formatCurrency(stats.totalPaid) : '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.view_all', lang)}</p>
              <p className="text-2xl font-bold">{stats?.payments ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      {upcoming && upcoming.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">{t('nav.schedule', lang)} — {new Date().toLocaleDateString('fr-FR', { weekday: 'long' })}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((s: any) => (
              <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                <div className="text-center min-w-[60px]">
                  <p className="text-sm font-bold">{s.start_time?.slice(0, 5)}</p>
                  <p className="text-[10px] text-muted-foreground">{s.end_time?.slice(0, 5)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{s.course?.name}</p>
                  {s.room && <p className="text-xs text-muted-foreground">{s.room.name}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
