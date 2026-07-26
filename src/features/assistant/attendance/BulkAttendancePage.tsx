import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { useToast } from '@/hooks/useToast';
import { t } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, CheckCheck, Search } from 'lucide-react';

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  status: 'present' | 'absent' | 'late' | null;
  enrollmentId?: number;
}

interface CourseOption {
  id: number;
  name: string;
  subject: string;
  scheduleId?: number;
}

const STATUS_ORDER = ['present', 'late', 'absent'] as const;
const STATUS_ICONS = { present: Check, late: Clock, absent: X };
const STATUS_COLORS = {
  present: 'bg-emerald-500 hover:bg-emerald-600 text-white ring-emerald-300',
  late: 'bg-amber-500 hover:bg-amber-600 text-white ring-amber-300',
  absent: 'bg-red-500 hover:bg-red-600 text-white ring-red-300',
};
const STATUS_INACTIVE = 'bg-muted hover:bg-accent text-muted-foreground';

export default function BulkAttendancePage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: courses } = useQuery({
    queryKey: ['active-courses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, name, subject')
        .eq('status', 'active')
        .order('name');
      return (data ?? []) as unknown as CourseOption[];
    },
    staleTime: 60_000,
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['course-students', selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return [];
      const { data: enr } = await supabase
        .from('course_enrollments')
        .select('id, student:students!student_id(user:users!students_id_fkey(id, first_name, last_name))')
        .eq('course_id', selectedCourseId)
        .eq('status', 'active');

      const rows: StudentRow[] = (enr ?? []).map((e: any) => ({
        id: e.student?.user?.id ?? '',
        firstName: e.student?.user?.first_name ?? '',
        lastName: e.student?.user?.last_name ?? '',
        status: null,
        enrollmentId: e.id,
      }));

      const { data: todayAtt } = await supabase
        .from('attendance')
        .select('student_id, status')
        .in('student_id', rows.map(r => r.id))
        .eq('date', date);

      if (todayAtt) {
        for (const att of todayAtt) {
          const match = rows.find(r => r.id === att.student_id);
          if (match) match.status = att.status as StudentRow['status'];
        }
      }

      return rows;
    },
    enabled: !!selectedCourseId,
    staleTime: 10_000,
  });

  const upsertAttendance = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: 'present' | 'absent' | 'late' }) => {
      const existing = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('date', date)
        .maybeSingle();

      const payload = { status, recorded_by: profile?.id ?? null, method: 'manual' as const };
      if (existing.data) {
        const { error } = await supabase
          .from('attendance')
          .update(payload as any)
          .eq('id', existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendance')
          .insert({ student_id: studentId, date, ...payload } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-students', selectedCourseId] }),
    onError: (err: any) => toast(err?.message ?? 'Erreur', 'error'),
  });

  const markAll = useCallback(async (status: 'present' | 'absent' | 'late') => {
    if (!students || !profile?.id) return;
    for (const s of students) {
      await upsertAttendance.mutateAsync({ studentId: s.id, status });
    }
    toast(`${students.length} élèves marqués ${status === 'present' ? 'présents' : status === 'late' ? 'en retard' : 'absents'}`, 'success');
  }, [students, profile?.id, upsertAttendance, toast]);

  const cycleStatus = useCallback((current: StudentRow['status'] | null): 'present' | 'late' | 'absent' => {
    if (!current) return 'present';
    const idx = STATUS_ORDER.indexOf(current);
    return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
  }, []);

  const presentCount = students?.filter(s => s.status === 'present').length ?? 0;
  const lateCount = students?.filter(s => s.status === 'late').length ?? 0;
  const absentCount = students?.filter(s => s.status === 'absent').length ?? 0;
  const uncheckedCount = (students?.length ?? 0) - presentCount - lateCount - absentCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pointage des présences</h1>
          <p className="text-sm text-muted-foreground mt-1">Sélectionnez un cours et pointez les élèves en un tap</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm" />
          <select value={selectedCourseId ?? ''} onChange={e => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm min-w-[200px]">
            <option value="">Choisir un cours...</option>
            {courses?.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.subject})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourseId && (
        <div className="grid grid-cols-1 gap-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground w-full sm:w-auto">Actions rapides:</span>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => markAll('present')} disabled={upsertAttendance.isPending}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <CheckCheck className="h-4 w-4 mr-1.5" />Tous présents
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => markAll('late')} disabled={upsertAttendance.isPending}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400">
                    <Clock className="h-4 w-4 mr-1.5" />Tous en retard
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => markAll('absent')} disabled={upsertAttendance.isPending}
                    className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400">
                    <X className="h-4 w-4 mr-1.5" />Tous absents
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="text-emerald-600 font-medium">✓ {presentCount}</span>
                <span className="text-amber-600 font-medium">⏰ {lateCount}</span>
                <span className="text-red-600 font-medium">✗ {absentCount}</span>
                {uncheckedCount > 0 && <span className="text-muted-foreground">— {uncheckedCount} à pointer</span>}
              </div>
            </CardContent>
          </Card>

          {studentsLoading ? (
            <div className="col-span-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : students?.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              Aucun élève inscrit à ce cours
            </div>
          ) : (
            <div className="col-span-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {students?.map(s => {
                const Icon = s.status ? STATUS_ICONS[s.status] : Search;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      const next = cycleStatus(s.status);
                      upsertAttendance.mutate({ studentId: s.id, status: next });
                    }}
                    disabled={upsertAttendance.isPending}
                    className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 text-center min-h-[7rem] ${
                      s.status
                        ? STATUS_COLORS[s.status] + ' border-transparent shadow-md'
                        : STATUS_INACTIVE + ' border-dashed'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                      s.status ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      {s.firstName?.charAt(0)}{s.lastName?.charAt(0)}
                    </div>
                    <span className={`text-sm font-medium leading-tight ${s.status ? 'text-white' : ''}`}>
                      {s.firstName} {s.lastName}
                    </span>
                    {s.status && (
                      <Badge className={`absolute top-2 right-2 ${s.status === 'present' ? 'bg-white/20 text-white' : s.status === 'late' ? 'bg-white/20 text-white' : 'bg-white/20 text-white'}`}>
                        <Icon className="h-3 w-3" />
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
