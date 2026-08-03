import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getDayLabel, formatTime } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];

export default function SchedulesPage() {
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 1) % 7));
  const [startDate, setStartDate] = useState(weekStart);

  const { data: schedules, isLoading, isError } = useQuery({
    queryKey: ['assistant_schedules', startDate.toISOString()],
    queryFn: async () => {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      const { data } = await supabase
        .from('course_schedules')
        .select('id, day_of_week, start_time, end_time, course:courses!inner(name), teacher:users!teacher_id(first_name, last_name), room:rooms(name)')
        .filter('courses.start_date', 'lte', endStr)
        .filter('courses.end_date', 'gte', startStr)
        .order('start_time');
      const grouped: Record<string, NonNullable<typeof data>[number][]> = {};
      for (const day of DAYS) grouped[day] = [];
      for (const s of data ?? []) {
        if (grouped[s.day_of_week]) grouped[s.day_of_week].push(s);
      }
      return grouped;
    },
  });

  useErrorToast(isError, lang, t('nav.schedule', lang));

  const changeWeek = (direction: number) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + direction * 7);
    setStartDate(d);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.schedule', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('schedule.subtitle', lang)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => changeWeek(-7)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {startDate.toLocaleDateString(localeMap[lang], { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" size="sm" onClick={() => changeWeek(7)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
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
                  schedules?.[day]?.slice(0, 4).map((s) => (
                    <div key={s.id} className="rounded-lg bg-accent/50 p-2 text-[11px]">
                      <p className="font-medium truncate">{s.course?.name ?? ''}</p>
                      <p className="text-muted-foreground truncate">{s.teacher ? `${s.teacher.first_name} ${s.teacher.last_name}`.slice(0, 20) : ''}</p>
                      <p className="text-muted-foreground">{formatTime(s.start_time)} - {formatTime(s.end_time)}</p>
                    </div>
                  ))
                )}
                {(schedules?.[day]?.length ?? 0) > 4 && (
                  <p className="text-[10px] text-muted-foreground text-center">+{schedules![day].length - 4} {t('schedule.others', lang)}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
