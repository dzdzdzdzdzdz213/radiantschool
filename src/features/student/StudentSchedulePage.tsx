import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

interface SessionRow {
  id: number;
  date: string;
  status: string;
  course: { id: number; name: string; type: string } | null;
  schedule: { start_time: string; end_time: string; room: { name: string } | null } | null;
}

function toIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
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
  const monthStart = toIso(new Date(currentYear, currentMonth, 1));
  const monthEnd = toIso(lastDay);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['student-schedule', profile?.id, currentMonth, currentYear],
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
        .from('attendance_sessions')
        .select(`
          id, date, status,
          course:courses!course_id(id, name, type),
          schedule:course_schedules!schedule_id(start_time, end_time, room:rooms(name))
        `)
        .in('course_id', courseIds)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date');
      return (data ?? []) as SessionRow[];
    },
    enabled: !!profile?.id,
  });

  const byDay = useMemo(() => {
    const map = new Map<string, SessionRow[]>();
    for (const s of sessions ?? []) {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    }
    return map;
  }, [sessions]);

  const upcoming = useMemo(() => {
    const todayIso = toIso(new Date());
    return [...(sessions ?? [])]
      .filter((s) => s.date >= todayIso)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.schedule?.start_time ?? '').localeCompare(b.schedule?.start_time ?? ''))
      .slice(0, 10);
  }, [sessions]);

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); };

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
          ) : (sessions?.length ?? 0) === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{t('dashboard.no_courses_today', lang)}</p>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-accent rounded-xl overflow-hidden">
              {WEEK_DAYS.map(d => <div key={d} className="bg-card p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>)}
              {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="bg-card min-h-[80px]" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                const events = byDay.get(toIso(new Date(currentYear, currentMonth, day))) ?? [];
                return (
                  <div key={day} className={`bg-card p-1.5 min-h-[80px] border-t border-accent ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}>
                    <span className={`text-xs font-medium ${isToday ? 'text-primary' : ''}`}>{day}</span>
                    {events.slice(0, 2).map((e) => (
                      <div key={e.id} title={e.course?.name} className="mt-1 rounded bg-primary/10 px-1 py-0.5 text-[9px] leading-tight text-primary truncate">
                        {e.schedule?.start_time?.slice(0, 5) ?? '--:--'} {e.course?.name ?? ''}
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

      {upcoming.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('groups.schedule', lang)}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {upcoming.map((s) => {
              const [y, m, d] = s.date.split('-').map(Number);
              const dayLabel = new Date(y, m - 1, d).toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'ar' ? 'ar-DZ' : 'fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="text-center min-w-[50px]">
                    <p className="text-sm font-bold">{s.schedule?.start_time?.slice(0, 5) ?? '--:--'}</p>
                    <p className="text-[10px] text-muted-foreground">{s.schedule?.end_time?.slice(0, 5) ?? ''}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.course?.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{dayLabel}{s.schedule?.room?.name ? ` • ${s.schedule.room.name}` : ''}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}