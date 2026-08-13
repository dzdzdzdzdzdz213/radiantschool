import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const TINT = ['bg-violet-500/15 text-violet-700', 'bg-emerald-500/15 text-emerald-700', 'bg-blue-500/15 text-blue-700', 'bg-orange-500/15 text-orange-700', 'bg-pink-500/15 text-pink-700', 'bg-cyan-500/15 text-cyan-700', 'bg-red-500/15 text-red-700', 'bg-yellow-500/15 text-yellow-700'];

interface CalendarSession {
  id: number;
  date: string;
  check_in_opened_at: string | null;
  check_in_closed_at: string | null;
  course: { id: number; name: string } | null;
}

function hashTint(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return TINT[Math.abs(h) % TINT.length];
}

function toIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function CalendarPage() {
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

  const { data: sessions, isLoading, isError } = useQuery({
    queryKey: ['assistant-calendar', currentMonth, currentYear],
    queryFn: async () => {
      const { data } = await supabase
        .from('attendance_sessions')
        .select('id, date, check_in_opened_at, check_in_closed_at, course:courses!course_id(id, name)')
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date');
      return (data ?? []) as CalendarSession[];
    },
  });

  useErrorToast(isError, lang, t('calendar.load_error', lang));

  const byDay = new Map<string, CalendarSession[]>();
  for (const s of sessions ?? []) {
    const list = byDay.get(s.date) ?? [];
    list.push(s);
    byDay.set(s.date, list);
  }

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendrier</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {sessions && sessions.length > 0 ? `${sessions.length} séances ce mois-ci` : 'Vue d\'ensemble des séances réelles'}
        </p>
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
                const daySessions = byDay.get(toIso(new Date(currentYear, currentMonth, day))) ?? [];
                const live = daySessions.filter(s => s.check_in_opened_at && !s.check_in_closed_at).length;
                return (
                  <div key={day} className={`bg-card p-1.5 min-h-[80px] border-t border-accent ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}>
                    <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{day}</span>
                    {daySessions.slice(0, 2).map((s) => (
                      <div
                        key={s.id}
                        className={`mt-1 rounded px-1 py-0.5 text-[9px] leading-tight truncate ${hashTint(s.course?.name ?? '')} ${s.check_in_closed_at ? 'opacity-50' : ''}`}
                        title={s.course?.name ?? ''}
                      >
                        {s.course?.name ?? 'Séance'}
                        {s.check_in_opened_at && !s.check_in_closed_at && <span className="ml-1 inline-block h-1 w-1 rounded-full bg-emerald-500 align-middle" />}
                      </div>
                    ))}
                    {daySessions.length > 2 && <div className="text-[8px] text-muted-foreground mt-0.5">+{daySessions.length - 2} autre{daySessions.length - 2 > 1 ? 's' : ''}</div>}
                    {live > 0 && <div className="mt-0.5 flex items-center gap-1 text-[8px] font-medium text-emerald-600"><span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />{live} en cours</div>}
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