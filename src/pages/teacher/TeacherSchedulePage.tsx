import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DAYS_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export default function TeacherSchedulePage() {
  const { profile } = useAuth();
  const { lang } = useLang();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['teacher-schedule', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('course_schedules')
        .select(`
          id, day_of_week, start_time, end_time,
          course:courses!course_id(id, name, type),
          room:rooms(name)
        `)
        .eq('teacher_id', profile.id)
        .order('start_time');
      return data ?? [];
    },
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 2,
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
        <Calendar className="h-6 w-6" />
        Emploi du temps
      </h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Aucun cours programmé</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DAYS_EN.map((enDay, i) => {
            const daySchedules = grouped[enDay];
            if (!daySchedules) return null;
            const frDay = DAYS_FR[i];
            return (
              <Card key={enDay}>
                <CardHeader className={new Date().toLocaleDateString('fr-FR', { weekday: 'long' }) === frDay ? 'bg-primary/5 rounded-t-xl' : ''}>
                  <CardTitle className="text-sm capitalize">{frDay}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {daySchedules.map((s: any) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="text-center min-w-[50px]">
                        <p className="text-sm font-bold">{s.start_time?.slice(0, 5)}</p>
                        <p className="text-[10px] text-muted-foreground">{s.end_time?.slice(0, 5)}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{s.course?.name}</p>
                        {s.room && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />{s.room.name}
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
