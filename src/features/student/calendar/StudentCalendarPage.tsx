import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
const DAY_KEYS = ['calendar.mon_lun', 'calendar.mon_mar', 'calendar.mon_mer', 'calendar.mon_jeu', 'calendar.mon_ven', 'calendar.mon_sam', 'calendar.mon_dim'];
const MONTH_KEYS = ['calendar.january', 'calendar.february', 'calendar.march', 'calendar.april', 'calendar.may', 'calendar.june', 'calendar.july', 'calendar.august', 'calendar.september', 'calendar.october', 'calendar.november', 'calendar.december'];

export default function StudentCalendarPage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const days = DAY_KEYS.map(k => t(k, lang));
  const months = MONTH_KEYS.map(k => t(k, lang));

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['student_calendar', profile?.id, currentMonth, currentYear],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: enrollments } = await (supabase as any)
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', profile.id)
        .eq('status', 'active');
      const courseIds = (enrollments ?? []).map((e: any) => e.course_id);
      if (courseIds.length === 0) return [];
      const { data } = await (supabase as any)
        .from('course_schedules')
        .select('id, start_time, day_of_week, course:courses(name)')
        .in('course_id', courseIds);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  useErrorToast(isError, lang, t('nav.calendar', lang));

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); };

  const getDayEvents = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return (events ?? []).filter((e: any) => e.day_of_week === dayName);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.calendar', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('nav.schedule', lang)}</p></div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base">{months[currentMonth]} {currentYear}</CardTitle>
            <Button variant="outline" size="sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-7 gap-px bg-accent rounded-xl overflow-hidden">
              {Array.from({ length: 35 }).map((_, i) => (<div key={i} className="bg-card p-2 min-h-[80px]"><div className="h-4 w-8 rounded bg-accent animate-pulse" /></div>))}
            </div>
          ) : (
          <div className="grid grid-cols-7 gap-px bg-accent rounded-xl overflow-hidden">
            {DAY_KEYS.map((key, i) => <div key={key} className="bg-card p-2 text-center text-xs font-medium text-muted-foreground">{days[i]}</div>)}
            {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="bg-card p-2 min-h-[80px]" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const dayEvents = getDayEvents(day);
              return (
                <div key={day} className={`bg-card p-1.5 min-h-[80px] border-t border-accent ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}>
                  <span className={`text-xs font-medium ${isToday ? 'text-primary' : ''}`}>{day}</span>
                  {dayEvents.slice(0, 2).map((e: any) => (
                    <div key={e.id} className="mt-1 rounded bg-primary/10 px-1 py-0.5 text-[9px] leading-tight text-primary truncate">{e.course?.name ?? ''}</div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-[8px] text-muted-foreground mt-0.5">+{dayEvents.length - 2}</div>}
                </div>
              );
            })}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}