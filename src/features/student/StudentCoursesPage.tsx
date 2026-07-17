import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { BookOpen, CalendarDays, MapPin, User, Clock, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
  thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche',
};

export default function StudentCoursesPage() {
  const { profile } = useAuth();
  const { lang } = useLang();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['student-courses', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('course_enrollments')
        .select(
          `id, status, enrollment_date,
          course:courses(
            id, name, type, price, status, start_date, end_date, image_url,
            subject:subjects(name),
            level:levels(name, category, stream, year),
            teacher:users!teacher_id(first_name, last_name),
            room:rooms(name),
            schedules:course_schedules(day_of_week, start_time, end_time)
          )`
        )
        .eq('student_id', profile.id)
        .in('status', ['active', 'pending_approval'])
        .order('enrollment_date', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const formatTime = (t?: string) => t ? t.slice(0, 5) : '';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6" /> {t('nav.my_courses', lang)}</h1>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : !enrollments?.length ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">{t('common.no_data', lang)}</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e: any) => {
            const c = e.course;
            const schedule = c?.schedules?.[0];
            return (
              <Card key={e.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{c?.name}</p>
                      <p className="text-xs text-muted-foreground">{c?.subject?.name}{c?.level?.name ? ` · ${c.level.name}` : ''}</p>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {e.status === 'active' ? 'Actif' : 'En attente'}
                    </span>
                  </div>

                  {c?.teacher && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span>{c.teacher.first_name} {c.teacher.last_name}</span>
                    </div>
                  )}

                  {c?.room && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{c.room.name}</span>
                    </div>
                  )}

                  {c?.schedules?.length > 0 && (
                    <div className="space-y-1">
                      {c.schedules.map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                          <span>{DAY_LABELS[s.day_of_week] || s.day_of_week} · {formatTime(s.start_time)} - {formatTime(s.end_time)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {c?.start_date && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.start_date.slice(0, 10)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c?.type}</span>
                      {c?.price != null && c.price > 0 && (
                        <span className="text-xs font-semibold flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />{c.price.toLocaleString()} DZD
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
