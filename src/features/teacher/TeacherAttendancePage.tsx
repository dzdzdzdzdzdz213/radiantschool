import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lang } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Clock, Lock, Unlock, Users } from 'lucide-react';

function localToday(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
}

interface SessionRow {
  id: number;
  date: string;
  check_in_opened_at: string | null;
  check_in_closed_at: string | null;
  course: { id: number; name: string } | null;
  schedule: { start_time: string; end_time: string; room: { name: string } | null } | null;
}

export default function TeacherAttendancePage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [date, setDate] = useState(localToday());

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['teacher-attendance-sessions', profile?.id, date],
    queryFn: async () => {
      if (!date || !profile?.id) return [];
      const courseIds = await supabase.from('courses').select('id').eq('teacher_id', profile.id).in('status', ['active']).then(r => r.data?.map(c => c.id) ?? []);
      if (!courseIds.length) return [];
      const { data } = await supabase
        .from('attendance_sessions')
        .select(`
          id, date, check_in_opened_at, check_in_closed_at,
          course:courses!course_id(id, name),
          schedule:course_schedules!schedule_id(start_time, end_time, room:rooms(name))
        `)
        .in('course_id', courseIds)
        .eq('date', date)
        .order('id');
      const rows = (data ?? []) as SessionRow[];
      const expiredIds = rows
        .filter((s) => s.check_in_opened_at && !s.check_in_closed_at && Date.now() > new Date(s.check_in_opened_at).getTime() + 3600000)
        .map((s) => s.id);
      if (expiredIds.length > 0) {
        await supabase.from('attendance_sessions').update({ check_in_closed_at: new Date().toISOString() }).in('id', expiredIds);
        return rows.map((s) => (expiredIds.includes(s.id) ? { ...s, check_in_closed_at: new Date().toISOString() } : s));
      }
      return rows;
    },
    enabled: !!date,
    staleTime: 10_000,
  });

  const { data: todayCounts } = useQuery({
    queryKey: ['teacher-attendance-counts', profile?.id, date],
    queryFn: async () => {
      if (!date || !profile?.id) return { present: 0, late: 0, absent: 0 };
      const { data: schedules } = await supabase
        .from('course_schedules')
        .select('id')
        .eq('teacher_id', profile.id);
      const ids = (schedules ?? []).map(s => s.id);
      if (!ids.length) return { present: 0, late: 0, absent: 0 };
      const { data } = await supabase
        .from('attendance')
        .select('status')
        .in('course_schedule_id', ids)
        .eq('date', date);
      const rows = data ?? [];
      return {
        present: rows.filter(r => r.status === 'present').length,
        late: rows.filter(r => r.status === 'late').length,
        absent: rows.filter(r => r.status === 'absent').length,
      };
    },
    enabled: !!date,
    staleTime: 10_000,
  });

  const toggleCheckIn = useMutation({
    mutationFn: async (session: SessionRow) => {
      const opening = !session.check_in_opened_at;
      const { error } = await supabase
        .from('attendance_sessions')
        .update(opening
          ? { check_in_opened_at: new Date().toISOString(), check_in_closed_at: null }
          : { check_in_closed_at: new Date().toISOString() })
        .eq('id', session.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-attendance-sessions'] });
      qc.invalidateQueries({ queryKey: ['schedule-sessions'] });
      qc.invalidateQueries({ queryKey: ['attendance', 'admin-oversight-group'] });
      toast('Pointage mis à jour', 'success');
    },
    onError: (err) => toast(err?.message ?? 'Erreur lors du pointage', 'error'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('nav.attendance', lang as Lang)}</h1>
      <div className="flex gap-4 items-center">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-10 rounded-xl px-3 text-sm border bg-background" />
      </div>

      {todayCounts && (todayCounts.present > 0 || todayCounts.late > 0 || todayCounts.absent > 0) && (
        <div className="flex flex-wrap gap-3">
          <Badge variant="success" className="gap-1"><Users className="h-3 w-3" /> {todayCounts.present} présent{todayCounts.present > 1 ? 's' : ''}</Badge>
          <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" /> {todayCounts.late} retard{todayCounts.late > 1 ? 's' : ''}</Badge>
          <Badge variant="destructive" className="gap-1">{todayCounts.absent} absent{todayCounts.absent > 1 ? 's' : ''}</Badge>
        </div>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">{t('common.loading', lang as Lang)}</div>
      ) : (
        <div className="space-y-4">
          {sessions?.map((s) => {
            const open = !!s.check_in_opened_at && !s.check_in_closed_at;
            const closed = !!s.check_in_closed_at;
            return (
              <div key={s.id} className="rounded-xl border bg-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{s.course?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.schedule?.start_time?.slice(0, 5) ?? '--:--'} - {s.schedule?.end_time?.slice(0, 5) ?? ''}
                    {s.schedule?.room?.name ? ` · ${s.schedule.room.name}` : ''} · {formatDate(date)}
                  </p>
                  {open && <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />Pointage ouvert</p>}
                  {closed && <p className="text-xs text-muted-foreground mt-1">Pointage clôturé</p>}
                </div>
                <Button
                  size="sm"
                  variant={open ? 'outline' : closed ? 'ghost' : 'default'}
                  disabled={closed || toggleCheckIn.isPending}
                  onClick={() => toggleCheckIn.mutate(s)}
                >
                  {open ? <Lock className="h-4 w-4 mr-1.5" /> : <Unlock className="h-4 w-4 mr-1.5" />}
                  {open ? 'Clôturer le pointage' : closed ? 'Clôturé' : 'Ouvrir le pointage'}
                </Button>
              </div>
            );
          })}
          {!sessions?.length && <p className="text-muted-foreground text-center py-8">{t('common.no_data', lang as Lang)}</p>}
        </div>
      )}
    </div>
  );
}