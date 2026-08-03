import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DAYS_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export default function StudentSchedulePage() {
  const { profile } = useAuth();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['student-schedule', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', profile.id)
        .eq('status', 'active');
      const courseIds = (enrollments ?? []).map(e => e.course_id);
      if (!courseIds.length) return [];
      const { data } = await supabase
        .from('course_schedules')
        .select('id, day_of_week, start_time, end_time, course:courses(id, name, type), room:rooms(name)')
        .in('course_id', courseIds)
        .order('start_time');
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const grouped: Record<string, any[]> = {};
  for (const s of schedules ?? []) {
    const day = (s as any).day_of_week;
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(s);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Calendar className="h-6 w-6" /> Emploi du temps
      </h1>
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun cours programmé</CardContent></Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DAYS_EN.map((enDay, i) => {
            const daySchedules = grouped[enDay];
            if (!daySchedules) return null;
            const frDay = DAYS_FR[i];
            return (
              <Card key={enDay}>
                <CardHeader className={DAYS_EN[new Date().getDay()] === enDay ? 'bg-primary/5 rounded-t-xl' : ''}>
                  <CardTitle className="text-sm capitalize">{frDay}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {daySchedules.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="text-center min-w-[50px]">
                        <p className="text-sm font-bold">{s.start_time?.slice(0, 5)}</p>
                        <p className="text-[10px] text-muted-foreground">{s.end_time?.slice(0, 5)}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{s.course?.name}</p>
                        {s.room && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{s.room.name}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
