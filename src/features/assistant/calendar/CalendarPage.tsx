import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { useErrorToast } from '@/hooks/useErrorToast';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function CalendarPage() {
  const { lang } = useLang();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['assistant_calendar', currentMonth, currentYear],
    queryFn: async () => {
      const dayNames = DAY_NAMES.map((_, i) => {
        const d = new Date(currentYear, currentMonth, 1 + i);
        return DAY_NAMES[(d.getDay() + 6) % 7];
      });
      const uniqueDays = [...new Set(dayNames)];
      const { data } = await (supabase as any)
        .from('course_schedules')
        .select('id, start_time, end_time, day_of_week, course:courses(name)')
        .in('day_of_week', uniqueDays);
      return data ?? [];
    },
  });

  useErrorToast(isError, lang, 'Erreur lors du chargement du calendrier');

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); };

  const getDayEvents = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayName = DAY_NAMES[(date.getDay() + 6) % 7];
    return (events ?? []).filter((e: any) => e.day_of_week === dayName);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendrier</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble des cours et événements</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base">{MONTHS[currentMonth]} {currentYear}</CardTitle>
            <Button variant="outline" size="sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-7 gap-px bg-accent rounded-xl overflow-hidden">
              {DAYS.map(d => <div key={d} className="bg-card p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>)}
              {Array.from({ length: 35 }).map((_, i) => <div key={i} className="bg-card p-2 min-h-[80px] animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-accent rounded-xl overflow-hidden">
              {DAYS.map(d => <div key={d} className="bg-card p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>)}
              {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="bg-card p-2 min-h-[80px]" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                const dayEvents = getDayEvents(day);
                return (
                  <div key={day} className={`bg-card p-1.5 min-h-[80px] border-t border-accent ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}>
                    <span className={`text-xs font-medium ${isToday ? 'text-primary' : ''}`}>{day}</span>
                    {dayEvents.slice(0, 2).map((e: any) => (
                      <div key={e.id} className="mt-1 rounded bg-primary/10 px-1 py-0.5 text-[9px] leading-tight text-primary truncate">
                        {e.course?.name ?? ''}
                      </div>
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
