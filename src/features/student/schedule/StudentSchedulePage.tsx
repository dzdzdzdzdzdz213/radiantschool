import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatTime, getDayLabel } from '@/lib/utils';
const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];

export default function StudentSchedulePage() {
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const { profile } = useAuth();
  const today = new Date();
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - ((today.getDay() + 1) % 7));
  const [startDate, setStartDate] = useState(weekStart);

  const { data: scheduleData, isLoading, isError } = useQuery({
    queryKey: ['student_schedule', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return {};
      const { data: enrollments } = await (supabase as any)
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', profile.id)
        .eq('status', 'active');
      const courseIds = (enrollments ?? []).map((e: any) => e.course_id);
      if (courseIds.length === 0) return {};
      const { data } = await (supabase as any)
        .from('course_schedules')
        .select('id, day_of_week, start_time, end_time, course:courses!inner(name, teacher:users!teacher_id(first_name, last_name)), room:rooms(name)')
        .in('course_id', courseIds)
        .order('start_time');
      const grouped: Record<string, any[]> = {};
      for (const day of DAYS) grouped[day] = [];
      for (const s of data ?? []) { if (grouped[s.day_of_week]) grouped[s.day_of_week].push(s); }
      return grouped;
    },
    enabled: !!profile?.id,
  });

  useErrorToast(isError, lang, t('nav.schedule', lang));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.schedule', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('nav.my_schedule', lang)}</p></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { const d = new Date(startDate); d.setDate(d.getDate() - 7); setStartDate(d); }}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium">{startDate.toLocaleDateString(localeMap[lang], { month: 'long', year: 'numeric' })}</span>
          <Button variant="outline" size="sm" onClick={() => { const d = new Date(startDate); d.setDate(d.getDate() + 7); setStartDate(d); }}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-6">
        {DAYS.map(day => (
          <Card key={day} className={new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day ? 'ring-2 ring-primary' : ''}>
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-xs font-semibold">{getDayLabel(day)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? Array.from({ length: 2 }).map((_, i) => (<Skeleton key={i} className="h-16 rounded-xl" />))
              : (!scheduleData || (scheduleData[day] ?? []).length === 0) ? (
                <p className="text-[10px] text-muted-foreground text-center py-4">—</p>
              ) : scheduleData[day]?.slice(0, 4).map((s: any) => (
                <div key={s.id} className="rounded-xl bg-accent/50 p-2.5 space-y-1">
                  <p className="text-xs font-semibold truncate">{s.course?.name ?? ''}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />{s.course?.teacher ? `${s.course.teacher.first_name ?? ''} ${s.course.teacher.last_name ?? ''}` : ''}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{s.room?.name ?? ''}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(s.start_time)} - {formatTime(s.end_time)}</p>
                </div>
              ))}
              {(scheduleData?.[day]?.length ?? 0) > 4 && (
                <p className="text-[10px] text-muted-foreground text-center">+{scheduleData![day].length - 4} {t('common.and', lang)}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}