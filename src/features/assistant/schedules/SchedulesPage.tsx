import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getDayLabel, formatTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];

export default function SchedulesPage() {
  const { toast } = useToast();
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 6 ? 0 : 1));
  const [startDate, setStartDate] = useState(weekStart);
  const [changingWeek, setChangingWeek] = useState(false);

  const { data: schedules, isLoading, isError } = useQuery({
    queryKey: ['assistant_schedules', startDate.toISOString()],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('course_schedules')
        .select('id, day_of_week, start_time, end_time, course:courses(name), teacher:users!teacher_id(first_name, last_name), room:rooms(name)')
        .order('start_time');
      const grouped: Record<string, any[]> = {};
      for (const day of DAYS) grouped[day] = [];
      for (const s of data ?? []) {
        if (grouped[s.day_of_week]) grouped[s.day_of_week].push(s);
      }
      return grouped;
    },
  });

  useEffect(() => {
    if (isError) toast('Erreur lors du chargement de l\'emploi du temps', 'error');
  }, [isError]);

  const changeWeek = (direction: number) => {
    setChangingWeek(true);
    const d = new Date(startDate);
    d.setDate(d.getDate() + direction * 7);
    setStartDate(d);
    setTimeout(() => setChangingWeek(false), 300);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Emploi du temps</h1>
          <p className="text-sm text-muted-foreground mt-1">Planning des cours, enseignants et salles</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => changeWeek(-7)} disabled={changingWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" size="sm" onClick={() => changeWeek(7)} disabled={changingWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading || changingWeek ? (
        <div className="grid gap-4 lg:grid-cols-6">
          {DAYS.map(day => (
            <Card key={day}>
              <CardHeader className="pb-2 text-center"><div className="h-4 bg-muted rounded animate-pulse w-1/2 mx-auto" /></CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-6">
          {DAYS.map(day => (
            <Card key={day} className={new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-xs font-semibold">{getDayLabel(day)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(schedules?.[day] ?? []).length === 0 ? (
                  <p className="text-[10px] text-muted-foreground text-center py-4">—</p>
                ) : (
                  schedules?.[day]?.slice(0, 4).map((s: any) => (
                    <div key={s.id} className="rounded-lg bg-accent/50 p-2 text-[11px]">
                      <p className="font-medium truncate">{s.course?.name ?? ''}</p>
                      <p className="text-muted-foreground truncate">{s.teacher ? `${s.teacher.first_name} ${s.teacher.last_name}`.slice(0, 20) : ''}</p>
                      <p className="text-muted-foreground">{formatTime(s.start_time)} - {formatTime(s.end_time)}</p>
                    </div>
                  ))
                )}
                {(schedules?.[day]?.length ?? 0) > 4 && (
                  <p className="text-[10px] text-muted-foreground text-center">+{schedules![day].length - 4} autres</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
