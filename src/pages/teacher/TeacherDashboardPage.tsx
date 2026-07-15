import { Sparkles, BookOpen, Calendar, Users, Clock, MapPin, GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeacherDashboard } from '@/hooks/useTeacherDashboard';

function PageHeader({ name }: { name: string }) {
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const today = new Date().toLocaleDateString(localeMap[lang] ?? 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
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
  );
}

export default function TeacherDashboardPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const { kpi, todaySchedule, upcomingCourses, recentEnrollments, isLoading } = useTeacherDashboard(profile?.id, lang);

  return (
    <div className="space-y-6">
      <PageHeader name={profile?.firstName ?? ''} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('nav.my_courses', lang)}</p>
              <p className="text-2xl font-bold">{isLoading ? '...' : kpi.courseCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('nav.schedule', lang)}</p>
              <p className="text-2xl font-bold">{isLoading ? '...' : kpi.scheduleCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('nav.students', lang)}</p>
              <p className="text-2xl font-bold">{isLoading ? '...' : kpi.studentCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('nav.attendance', lang)}</p>
              <p className="text-2xl font-bold">{isLoading ? '...' : kpi.attendanceToday}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun cours programmé aujourd'hui</p>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                    <div className="flex flex-col items-center min-w-[60px]">
                      <span className="text-lg font-bold leading-tight">{s.start_time?.slice(0, 5)}</span>
                      <span className="text-[10px] text-muted-foreground">{s.end_time?.slice(0, 5)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{s.course?.name}</p>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Dernières inscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEnrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune inscription récente</p>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                       {e.student?.user?.first_name?.[0]}{e.student?.user?.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {e.student?.user?.first_name} {e.student?.user?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{e.course?.name}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(e.enrollment_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Mes formations
          </CardTitle>
          <span className="text-xs text-muted-foreground">{upcomingCourses.length} formation{upcomingCourses.length > 1 ? 's' : ''}</span>
        </CardHeader>
        <CardContent>
          {upcomingCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucune formation active</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingCourses.map((c: any) => (
                <div key={c.id}
                  className="block p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-sm truncate">{c.name}</p>
                    {c.type === 'vip' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-amber-700 bg-amber-100 shrink-0 ml-2">VIP</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{c.subject?.name} · {c.level?.name}{c.level?.stream ? ` · ${c.level.stream}` : ''}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.current_enrollments ?? 0}/{c.capacity} places</span>
                    {c.schedules?.[0] && (
                      <span>{c.schedules[0].day_of_week} {c.schedules[0].start_time?.slice(0, 5)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
