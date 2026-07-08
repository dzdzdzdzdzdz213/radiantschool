import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getDayLabel, formatTime } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];

export default function TeacherSchedulePage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const today = new Date();
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - ((today.getDay() + 1) % 7));
  const [startDate, setStartDate] = useState(weekStart);

  const { data: schedules, isLoading, isError } = useQuery({
    queryKey: ['teacher_schedule', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return {};
      const { data, error } = await (supabase as any)
        .from('course_schedules')
        .select('id, day_of_week, start_time, end_time, course:courses!inner(name), room:rooms(name)')
        .eq('teacher_id', profile.id)
        .order('start_time');
      if (error) throw error;
      const grouped: Record<string, any[]> = {};
      for (const day of DAYS) grouped[day] = [];
      for (const s of data ?? []) { if (grouped[s.day_of_week]) grouped[s.day_of_week].push(s); }
      return grouped;
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.my_schedule', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('nav.schedule', lang)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { const d = new Date(startDate); d.setDate(d.getDate() - 7); setStartDate(d); }}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium">{startDate.toLocaleDateString(localeMap[lang], { month: 'long', year: 'numeric' })}</span>
          <Button variant="outline" size="sm" onClick={() => { const d = new Date(startDate); d.setDate(d.getDate() + 7); setStartDate(d); }}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 text-center">
          <p className="text-red-600 font-medium text-sm">{t('errors.load_error', lang, '')}</p>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-6">
        {isLoading ? DAYS.map(day => (
          <Card key={day}>
            <CardHeader className="pb-2 text-center"><CardTitle className="text-xs font-semibold">{getDayLabel(day)}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-16 rounded-lg" />))}
            </CardContent>
          </Card>
        )) : DAYS.map(day => (
          <Card key={day} className={new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day ? 'ring-2 ring-primary' : ''}>
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-xs font-semibold">{getDayLabel(day)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(schedules?.[day] ?? []).length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-4">—</p>
              ) : (
                schedules?.[day]?.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="rounded-lg bg-accent/50 p-2 text-[11px]">
                    <p className="font-medium truncate">{s.course?.name ?? ''}</p>
                    <p className="text-muted-foreground">{s.room?.name ?? ''}</p>
                    <p className="text-muted-foreground">{formatTime(s.start_time)} - {formatTime(s.end_time)}</p>
                  </div>
                ))
              )}
              {(schedules?.[day]?.length ?? 0) > 5 && (
                <p className="text-[10px] text-muted-foreground text-center">+{(schedules?.[day]?.length ?? 0) - 5} {t('schedule.more', lang)}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
