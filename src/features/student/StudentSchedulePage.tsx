import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Calendar, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface ScheduleRow {
  id: number;
  start_time: string;
  end_time: string;
  day_of_week: string;
  course: { id: number; name: string; type: string } | null;
  room: { name: string } | null;
}

export default function StudentSchedulePage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

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
        .select('id, start_time, end_time, day_of_week, course:courses(id, name, type), room:rooms(name)')
        .in('course_id', courseIds)
        .order('start_time');
      return (data ?? []) as ScheduleRow[];
    },
    enabled: !!profile?.id,
  });

  const byDay = useMemo(() => {
    const map: Record<string, ScheduleRow[]> = {};
    for (const s of schedules ?? []) (map[s.day_of_week] ??= []).push(s);
    return map;
  }, [schedules]);

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); };

  const eventsForDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayName = DAY_NAMES[(date.getDay() + 6) % 7];
    return byDay[dayName] ?? [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" /> {t('nav.schedule', lang)}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium min-w-32 text-center">{MONTH_NAMES[currentMonth]} {currentYear}</span>
          <Button variant="outline" size="sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('schedule.subtitle', lang)}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-7 gap-px bg-accent rounded-xl overflow-hidden">
              {WEEK_DAYS.map(d => <div key={d} className="bg-card p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>)}
              {Array.from({ length: 35 }).map((_, i) => <div key={i} className="bg-card min-h-[80px] animate-pulse" />)}
            </div>
          ) : (schedules?.length ?? 0) === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{t('dashboard.no_courses_today', lang)}</p>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-accent rounded-xl overflow-hidden">
              {WEEK_DAYS.map(d => <div key={d} className="bg-card p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>)}
              {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="bg-card min-h-[80px]" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                const events = eventsForDay(day);
                return (
                  <div key={day} className={`bg-card p-1.5 min-h-[80px] border-t border-accent ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}>
                    <span className={`text-xs font-medium ${isToday ? 'text-primary' : ''}`}>{day}</span>
                    {events.slice(0, 2).map((e) => (
                      <div key={e.id} title={e.course?.name} className="mt-1 rounded bg-primary/10 px-1 py-0.5 text-[9px] leading-tight text-primary truncate">
                        {e.start_time?.slice(0, 5)} {e.course?.name ?? ''}
                      </div>
                    ))}
                    {events.length > 2 && <div className="text-[8px] text-muted-foreground mt-0.5">+{events.length - 2}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {(schedules?.length ?? 0) > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('groups.schedule', lang)}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[...(schedules ?? [])].sort((a, b) => (DAY_NAMES.indexOf(a.day_of_week) - DAY_NAMES.indexOf(b.day_of_week)) || a.start_time.localeCompare(b.start_time)).map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="text-center min-w-[50px]">
                  <p className="text-sm font-bold">{s.start_time?.slice(0, 5)}</p>
                  <p className="text-[10px] text-muted-foreground">{s.end_time?.slice(0, 5)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.course?.name}</p>
                  {s.room?.name && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{s.room.name}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}