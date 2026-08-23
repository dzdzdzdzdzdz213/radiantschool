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
import { formatDate, getFullName } from '@/lib/utils';
import { Check, Clock, Lock, Unlock, Users, X } from 'lucide-react';

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
  schedule: { id?: number; start_time: string; end_time: string; room: { name: string } | null } | null;
}

type AttendanceStatus = 'present' | 'late' | 'absent';

const STATUS_CYCLE: AttendanceStatus[] = ['present', 'late', 'absent'];
const STATUS_CHIP: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  late: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  absent: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
};

interface StudentBrief {
  id: string;
  user: { id: string; first_name: string | null; last_name: string | null } | null;
}

function SessionRoster({ session, date, teacherId }: { session: SessionRow; date: string; teacherId?: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const scheduleId = session.schedule?.id ?? null;
  const open = !!session.check_in_opened_at && !session.check_in_closed_at;

  const { data: students } = useQuery({
    queryKey: ['teacher-roster', session.course?.id],
    queryFn: async (): Promise<StudentBrief[]> => {
      if (!session.course?.id) return [];
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('student:students!student_id(id, user:users(id, first_name, last_name))')
        .eq('course_id', session.course.id);
      if (error) throw error;
      return ((data ?? []) as unknown as Array<{ student: StudentBrief | null }>)
        .map((r) => r.student)
        .filter((s): s is StudentBrief => !!s);
    },
    enabled: !!session.course?.id,
    staleTime: 30_000,
  });

  const { data: marks } = useQuery({
    queryKey: ['teacher-session-marks', session.id, date],
    queryFn: async () => {
      if (!scheduleId) return {} as Record<string, AttendanceStatus>;
      const { data, error } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('course_schedule_id', scheduleId)
        .eq('date', date);
      if (error) throw error;
      const map: Record<string, AttendanceStatus> = {};
      for (const r of data ?? []) map[r.student_id] = r.status as AttendanceStatus;
      return map;
    },
    enabled: !!scheduleId,
  });

  const upsert = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: AttendanceStatus }) => {
      if (!teacherId) throw new Error('Not authenticated');
      const payload = { status, recorded_by: teacherId, method: 'manual' as const };
      let existingId: number | null = null;
      if (scheduleId) {
        const { data: existing } = await supabase
          .from('attendance')
          .select('id')
          .eq('student_id', studentId)
          .eq('course_schedule_id', scheduleId)
          .eq('date', date)
          .maybeSingle();
        existingId = existing?.id ?? null;
      }
      if (existingId) {
        const { error } = await supabase.from('attendance').update(payload).eq('id', existingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('attendance').insert({
          student_id: studentId,
          date,
          status,
          recorded_by: teacherId,
          method: 'manual' as const,
          ...(scheduleId ? { course_schedule_id: scheduleId } : {}),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-session-marks', session.id, date] });
      qc.invalidateQueries({ queryKey: ['teacher-attendance-counts'] });
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err) => toast(err?.message ?? 'Erreur', 'error'),
  });

  const cycle = (current: AttendanceStatus | undefined): AttendanceStatus =>
    STATUS_CYCLE[(STATUS_CYCLE.indexOf(current ?? 'absent') + 1) % STATUS_CYCLE.length];

  const markAll = async () => {
    if (!students?.length) return;
    for (const s of students) await upsert.mutateAsync({ studentId: s.id, status: 'present' });
    toast(`${students.length} élèves marqués présents`, 'success');
  };

  if (!students?.length) {
    return <p className="mt-3 text-xs text-muted-foreground">Aucun élève inscrit à ce cours.</p>;
  }

  return (
    <div className="mt-3 border-t pt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Élèves ({students.length})</p>
        {open && (
          <Button size="sm" variant="outline" className="h-7 text-xs" disabled={upsert.isPending} onClick={markAll}>
            <Check className="h-3.5 w-3.5 mr-1" /> Tous présents
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {students.map((s) => {
          const status = marks?.[s.id];
          return (
            <button
              key={s.id}
              disabled={!open || upsert.isPending}
              onClick={() => upsert.mutate({ studentId: s.id, status: cycle(status) })}
              className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                status ? STATUS_CHIP[status] : 'border-border bg-background hover:bg-accent'
              } ${!open ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={open ? 'Cliquer pour changer le statut' : 'Pointage clôturé'}
            >
              <span className="truncate font-medium">{getFullName(s.user?.first_name ?? '', s.user?.last_name ?? '')}</span>
              {status === 'present' && <Check className="h-4 w-4 shrink-0" />}
              {status === 'late' && <Clock className="h-4 w-4 shrink-0" />}
              {status === 'absent' && <X className="h-4 w-4 shrink-0" />}
            </button>
          );
        })}
      </div>
      {!open && !session.check_in_closed_at && (
        <p className="text-[11px] text-muted-foreground mt-2">Ouvrez le pointage pour marquer les élèves.</p>
      )}
    </div>
  );
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
          schedule:course_schedules!schedule_id(id, start_time, end_time, room:rooms(name))
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
              <div key={s.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-4">
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
                <SessionRoster session={s} date={date} teacherId={profile?.id} />
              </div>
            );
          })}
          {!sessions?.length && <p className="text-muted-foreground text-center py-8">{t('common.no_data', lang as Lang)}</p>}
        </div>
      )}
    </div>
  );
}
