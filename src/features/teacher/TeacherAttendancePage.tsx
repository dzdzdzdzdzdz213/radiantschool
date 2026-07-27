import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Lang } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { formatDate } from '@/lib/utils';

export default function TeacherAttendancePage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['teacher-attendance-sessions', date],
    queryFn: async () => {
      if (!date || !profile?.id) return [];
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(date).getDay()];
      const courseIds = await supabase.from('courses').select('id').eq('teacher_id', profile.id).in('status', ['active']).then(r => r.data?.map(c => c.id) ?? []);
      if (!courseIds.length) return [];
      const { data } = await supabase
        .from('course_schedules')
        .select(`id, start_time, end_time, course:courses(id, name), room:rooms(name)`)
        .in('course_id', courseIds)
        .eq('day_of_week', dayName as any)
        .order('start_time');
      return data ?? [];
    },
    enabled: !!date,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('nav.attendance', lang as Lang)}</h1>
      <div className="flex gap-4">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-10 rounded-xl px-3 text-sm border bg-background" />
      </div>
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">{t('common.loading', lang as Lang)}</div>
      ) : (
        <div className="space-y-4">
          {sessions?.map((s: any) => (
            <div key={s.id} className="rounded-xl border bg-card p-4">
              <p className="font-medium">{s.course?.name}</p>
              <p className="text-sm text-muted-foreground">{s.start_time} - {s.end_time} · {s.room?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatDate(date)}</p>
            </div>
          ))}
          {!sessions?.length && <p className="text-muted-foreground text-center py-8">{t('common.no_data', lang as Lang)}</p>}
        </div>
      )}
    </div>
  );
}
