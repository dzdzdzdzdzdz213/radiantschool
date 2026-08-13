import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DAYS_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

interface SessionRow {
  id: number;
  date: string;
  schedule_id: number | null;
  course: { id: number; name: string; type: string; teacher_id: string | null } | null;
  schedule: { start_time: string; end_time: string; room: { name: string } | null } | null;
}

function toIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function TeacherSchedulePage() {
  const { profile } = useAuth();

  const week = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay() + 1);
    return { start, end: new Date(start.getTime() + 6 * 86400000) };
  }, []);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['teacher-schedule', profile?.id, toIso(week.start), toIso(week.end)],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: schedules } = await supabase
        .from('course_schedules')
        .select('id')
        .eq('teacher_id', profile.id);
      const scheduleIds = (schedules ?? []).map(s => s.id);

      const { data } = await supabase
        .from('attendance_sessions')
        .select(`
          id, date, schedule_id,
          course:courses!course_id(id, name, type, teacher_id),
          schedule:course_schedules!schedule_id(start_time, end_time, room:rooms(name))
        `)
        .gte('date', toIso(week.start))
        .lte('date', toIso(week.end))
        .order('date');
      return (data ?? []).filter(
        (s) => s.schedule_id !== null && scheduleIds.includes(s.schedule_id as number)
      ) as SessionRow[];
    },
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 2,
  });

  const grouped: Record<string, SessionRow[]> = {};
  for (const s of sessions ?? []) {
    const [y, m, d] = s.date.split('-').map(Number);
    const dayKey = DAYS_EN[new Date(y, m - 1, d).getDay()];
    if (!grouped[dayKey]) grouped[dayKey] = [];
    grouped[dayKey].push(s);
  }

  const todayKey = DAYS_EN[new Date().getDay()];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        Emploi du temps
      </h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Aucune séance cette semaine</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DAYS_EN.map((enDay, i) => {
            const daySessions = grouped[enDay];
            if (!daySessions) return null;
            const frDay = DAYS_FR[i];
            const isToday = enDay === todayKey;
            return (
              <Card key={enDay}>
                <CardHeader className={isToday ? 'bg-primary/5 rounded-t-xl' : ''}>
                  <CardTitle className="text-sm capitalize flex items-center gap-2">
                    {frDay}
                    {isToday && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">AUJOURD'HUI</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {daySessions.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="text-center min-w-[50px]">
                        <p className="text-sm font-bold">{s.schedule?.start_time?.slice(0, 5)}</p>
                        <p className="text-[10px] text-muted-foreground">{s.schedule?.end_time?.slice(0, 5)}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{s.course?.name}</p>
                        {s.schedule?.room && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />{s.schedule.room.name}
                          </p>
                        )}
                      </div>
                      {s.course?.type === 'vip' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">VIP</span>
                      )}
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