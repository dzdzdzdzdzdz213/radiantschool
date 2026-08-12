import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, DollarSign, FileText, Clock, MapPin, GraduationCap, type LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { formatCurrency } from '@/lib/utils';
import HonestyBoxWidget from '@/features/shared/HonestyBoxWidget';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function PageHeader({ name }: { name: string }) {
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const today = new Date().toLocaleDateString(localeMap[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
      <div className="cahier-margin rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
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

export default function StudentDashboardPage() {
  const { profile } = useAuth();
  const { lang } = useLang();

  const { data: stats } = useQuery({
    queryKey: ['student-dashboard', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { enrollments: 0, totalPaid: 0, attendances: 0, unpaidInvoices: 0 };
      const [enr, pay, att, inv] = await Promise.all([
        supabase.from('course_enrollments').select('id', { count: 'exact', head: true }).eq('student_id', profile.id),
        supabase.from('payments').select('amount').eq('student_id', profile.id).is('deleted_at', null),
        supabase.from('attendance_records').select('id', { count: 'exact', head: true }).eq('student_id', profile.id),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('student_id', profile.id).in('status', ['unpaid', 'partially_paid']),
      ]);
      const totalPaid = (pay.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
      return { enrollments: enr.count ?? 0, totalPaid, attendances: att.count ?? 0, unpaidInvoices: inv.count ?? 0 };
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
        .eq('day_of_week', today)
        .order('start_time')
        .limit(5);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  if (!profile) return null;

  const statsData = [
    { icon: BookOpen, label: t('nav.my_courses', lang), value: stats?.enrollments ?? 0, color: 'from-blue-500 to-blue-600' },
    { icon: Calendar, label: t('nav.attendance', lang), value: stats?.attendances ?? 0, color: 'from-emerald-500 to-emerald-600' },
    { icon: DollarSign, label: t('nav.payments', lang), value: stats ? formatCurrency(stats.totalPaid) : '—', color: 'from-violet-500 to-violet-600' },
    { icon: FileText, label: t('nav.invoices', lang), value: stats?.unpaidInvoices ?? 0, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader name={profile.firstName ?? ''} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((s, i) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} delay={0.05 + i * 0.05} />
        ))}
      </div>

      {upcoming && upcoming.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2.5 p-5 pb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold">{t('nav.schedule', lang)} — {new Date().toLocaleDateString('fr-FR', { weekday: 'long' })}</h2>
            </div>
            <div className="p-5 space-y-2">
              {upcoming.map((s) => (
                <div key={s.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center min-w-[56px]">
                    <span className="text-base font-bold leading-tight">{s.start_time?.slice(0, 5)}</span>
                    <span className="text-[10px] text-muted-foreground">{s.end_time?.slice(0, 5)}</span>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.course?.name}</p>
                    {s.room && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {s.room.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <HonestyBoxWidget />
    </div>
  );
}
