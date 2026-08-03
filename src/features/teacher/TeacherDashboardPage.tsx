import { Sparkles, BookOpen, Calendar, Users, Clock, MapPin, GraduationCap, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { useTeacherDashboard } from '@/hooks/useTeacherDashboard';
import { motion } from 'framer-motion';

function PageHeader({ name }: { name: string }) {
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const today = new Date().toLocaleDateString(localeMap[lang] ?? 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle,currentColor 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{t('dashboard.greeting', lang, name)}</h1>
              <p className="mt-0.5 text-sm text-white/70">{today}</p>
            </div>
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

const DAY_LABELS: Record<string, string> = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mer',
  thursday: 'Jeu', friday: 'Ven', saturday: 'Sam', sunday: 'Dim',
};

export default function TeacherDashboardPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const { kpi, todaySchedule, upcomingCourses, recentEnrollments, isLoading } = useTeacherDashboard(profile?.id);

  const statsData = [
    { icon: BookOpen, label: t('nav.my_courses', lang), value: isLoading ? '...' : kpi.courseCount, color: 'from-violet-500 to-violet-600' },
    { icon: Calendar, label: t('nav.schedule', lang), value: isLoading ? '...' : kpi.scheduleCount, color: 'from-blue-500 to-blue-600' },
    { icon: Users, label: t('nav.students', lang), value: isLoading ? '...' : kpi.studentCount, color: 'from-emerald-500 to-emerald-600' },
    { icon: Clock, label: t('nav.attendance', lang), value: isLoading ? '...' : kpi.attendanceToday, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader name={profile?.firstName ?? ''} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((s, i) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} delay={0.05 + i * 0.05} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's schedule */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}>
          <div className="rounded-2xl border border-border bg-card overflow-hidden h-full">
            <div className="flex items-center gap-2.5 p-5 pb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                <Calendar className="h-4 w-4 text-violet-600" />
              </div>
              <h2 className="text-sm font-semibold">Aujourd'hui</h2>
            </div>
            <div className="p-5">
              {todaySchedule.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30 mb-3">
                    <Calendar className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">Aucun cours programmé</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todaySchedule.map((s) => (
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
                      {s.course?.type === 'vip' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-amber-700 bg-amber-100">VIP</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent enrollments */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          <div className="rounded-2xl border border-border bg-card overflow-hidden h-full">
            <div className="flex items-center gap-2.5 p-5 pb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-sm font-semibold">Dernières inscriptions</h2>
            </div>
            <div className="p-5">
              {recentEnrollments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30 mb-3">
                    <GraduationCap className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">Aucune inscription récente</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentEnrollments.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600">
                        {e.student?.user?.first_name?.[0]}{e.student?.user?.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{e.student?.user?.first_name} {e.student?.user?.last_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{e.course?.name}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(e.enrollment_date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Active formations */}
      {upcomingCourses.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="text-sm font-semibold">Mes formations</h2>
              </div>
              <span className="text-xs text-muted-foreground">{upcomingCourses.length} formation{upcomingCourses.length > 1 ? 's' : ''}</span>
            </div>
            <div className="p-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingCourses.map((c) => (
                  <div key={c.id} className="group p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{c.name}</p>
                      {c.type === 'vip' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-amber-700 bg-amber-100 shrink-0 ml-2">VIP</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{c.subject?.name} · {c.level?.name}{c.level?.stream ? ` · ${c.level.stream}` : ''}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{c.current_enrollments ?? 0}/{c.capacity} places</span>
                      {c.schedules?.[0] && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {DAY_LABELS[c.schedules[0].day_of_week] || c.schedules[0].day_of_week} {c.schedules[0].start_time?.slice(0, 5)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
