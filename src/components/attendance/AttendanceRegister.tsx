import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lang } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useToast } from '@/hooks/useToast';
import { Select, SelectItem } from '@/components/ui/select';
import { getFullName } from '@/lib/utils';
import { Check, Clock, X } from 'lucide-react';

type AttendanceStatus = 'present' | 'late' | 'absent';
const CYCLE: AttendanceStatus[] = ['present', 'late', 'absent'];
const CELL_STYLE: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-500/90 text-white',
  late: 'bg-amber-500/90 text-white',
  absent: 'bg-red-500/90 text-white',
};
const CELL_ICON: Record<AttendanceStatus, typeof Check> = { present: Check, late: Clock, absent: X };
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LETTER = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const WEEKDAY_INDEX: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };

interface CourseBrief { id: number; name: string }
interface StudentBrief {
  id: string;
  registration_number: string | null;
  level: { name: string } | null;
  user: { id: string; first_name: string | null; last_name: string | null; phone: string | null } | null;
}

export default function AttendanceRegister({ courses }: { courses: CourseBrief[] }) {
  const { profile } = useAuth();
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();

  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [courseId, setCourseId] = useState<string>('');

  const effectiveCourseId = courseId || courses?.[0]?.id?.toString() || '';

  const { data: students } = useQuery({
    queryKey: ['register-students', effectiveCourseId],
    queryFn: async (): Promise<StudentBrief[]> => {
      if (!effectiveCourseId) return [];
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('student:students!student_id(id, registration_number, level:levels(name), user:users(id, first_name, last_name, phone))')
        .eq('course_id', Number(effectiveCourseId));
      if (error) throw error;
      return ((data ?? []) as unknown as Array<{ student: StudentBrief | null }>).map((r) => r.student).filter((s): s is StudentBrief => !!s);
    },
    enabled: !!effectiveCourseId,
    staleTime: 30_000,
  });

  // weekday -> schedule_id for this course (needed for RLS-compliant inserts)
  const { data: schedules } = useQuery({
    queryKey: ['register-schedules', effectiveCourseId],
    queryFn: async (): Promise<Record<number, number>> => {
      if (!effectiveCourseId) return {};
      const { data, error } = await supabase
        .from('course_schedules')
        .select('id, day_of_week')
        .eq('course_id', Number(effectiveCourseId));
      if (error) throw error;
      const map: Record<number, number> = {};
      for (const s of data ?? []) {
        const idx = WEEKDAY_INDEX[s.day_of_week as unknown as string];
        if (idx !== undefined) map[idx] = s.id;
      }
      return map;
    },
    enabled: !!effectiveCourseId,
    staleTime: 60_000,
  });

  const [year, monthNum] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const monthDates = useMemo(() => {
    const dates: { day: number; weekday: number; iso: string }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, monthNum - 1, d);
      dates.push({ day: d, weekday: dt.getDay(), iso: `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }
    return dates;
  }, [year, monthNum, daysInMonth]);

  const scheduleIds = useMemo(() => Object.values(schedules ?? {}), [schedules]);

  const { data: monthMarks, isLoading } = useQuery({
    queryKey: ['register-marks', effectiveCourseId, month],
    queryFn: async (): Promise<Record<string, AttendanceStatus>> => {
      if (!effectiveCourseId || !scheduleIds.length) return {};
      const from = `${month}-01`;
      const to = `${month}-${String(daysInMonth).padStart(2, '0')}`;
      const { data, error } = await supabase
        .from('attendance')
        .select('student_id, date, status')
        .in('course_schedule_id', scheduleIds)
        .gte('date', from)
        .lte('date', to);
      if (error) throw error;
      const map: Record<string, AttendanceStatus> = {};
      for (const r of data ?? []) map[`${r.student_id}|${r.date}`] = r.status as AttendanceStatus;
      return map;
    },
    enabled: !!effectiveCourseId && scheduleIds.length > 0,
  });

  const upsert = useMutation({
    mutationFn: async ({ studentId, iso, status }: { studentId: string; iso: string; status: AttendanceStatus | null }) => {
      if (!profile?.id) throw new Error('Not authenticated');
      const weekday = new Date(iso + 'T12:00:00').getDay();
      const scheduleId = schedules?.[weekday];
      const existing = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('date', iso)
        .in('course_schedule_id', scheduleIds.length ? scheduleIds : [0])
        .maybeSingle();
      if (status === null) {
        if (existing.data) {
          const { error } = await supabase.from('attendance').delete().eq('id', existing.data.id);
          if (error) throw error;
        }
        return;
      }
      const payload = { status, recorded_by: profile.id, method: 'manual' as const, ...(scheduleId ? { course_schedule_id: scheduleId } : {}) };
      if (existing.data) {
        const { error } = await supabase.from('attendance').update(payload).eq('id', existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('attendance').insert({ student_id: studentId, date: iso, ...payload });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['register-marks'] });
      qc.invalidateQueries({ queryKey: ['teacher-attendance-counts'] });
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err) => toast(err?.message ?? 'Erreur', 'error'),
  });

  const cellClick = (studentId: string, iso: string, weekday: number) => {
    if (!schedules?.[weekday]) { toast('Aucun créneau ce jour pour ce cours', 'error'); return; }
    const current = monthMarks?.[`${studentId}|${iso}`];
    const idx = current ? CYCLE.indexOf(current) : -1;
    const next = idx === CYCLE.length - 1 ? null : CYCLE[idx + 1];
    upsert.mutate({ studentId, iso, status: next });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Feuille de présence</h1>
        <div className="flex items-center gap-3">
          <Select value={effectiveCourseId} onValueChange={setCourseId} placeholder="Choisir un cours…" className="min-w-[200px]">
            {(courses ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
            ))}
          </Select>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 rounded-xl px-3 text-sm border bg-background" />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-emerald-500" /> Présent</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-amber-500" /> Retard</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-red-500" /> Absent</span>
        <span>· cliquer une case pour changer (P → R → A → vide)</span>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">{t('common.loading', lang as Lang)}</div>
      ) : !students?.length ? (
        <div className="p-8 text-center text-muted-foreground">Aucun élève inscrit à ce cours.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="sticky left-0 z-10 bg-card px-3 py-2 text-left font-semibold min-w-[180px]">Élève</th>
                {monthDates.map((d) => (
                  <th key={d.day} className={`px-1 py-2 text-center text-[11px] font-medium ${schedules?.[d.weekday] ? 'text-foreground' : 'text-muted-foreground/30'}`}>
                    <div>{DAY_LETTER[d.weekday]}</div>
                    <div>{d.day}</div>
                  </th>
                ))}
                <th className="px-2 py-2 text-center text-[11px] font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const counts = { present: 0, late: 0, absent: 0 };
                return (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="sticky left-0 z-10 bg-card px-3 py-1.5">
                      <p className="font-medium text-[13px] leading-tight">{getFullName(s.user?.first_name ?? '', s.user?.last_name ?? '')}</p>
                      {s.level?.name && <p className="text-[10px] text-muted-foreground leading-tight">{s.level.name}</p>}
                    </td>
                    {monthDates.map((d) => {
                      const status = monthMarks?.[`${s.id}|${d.iso}`];
                      const marked = status ? counts[status]++ : null;
                      const clickable = !!schedules?.[d.weekday];
                      const Icon = status ? CELL_ICON[status] : null;
                      void marked;
                      return (
                        <td key={d.day} className="px-0.5 py-1 text-center">
                          <button
                            disabled={!clickable || upsert.isPending}
                            onClick={() => cellClick(s.id, d.iso, d.weekday)}
                            className={`mx-auto flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold transition-transform active:scale-90 ${
                              status ? CELL_STYLE[status] : clickable ? 'hover:bg-accent text-muted-foreground/40' : 'text-muted-foreground/15 cursor-not-allowed'
                            }`}
                            title={clickable ? `${d.day} — cliquer pour marquer` : 'Pas de cours ce jour'}
                          >
                            {Icon ? <Icon className="h-3.5 w-3.5" /> : clickable ? '·' : ''}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-2 py-1 text-center text-[11px] whitespace-nowrap">
                      <span className="text-emerald-600 font-semibold">{counts.present}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-amber-600">{counts.late}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-red-600">{counts.absent}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
