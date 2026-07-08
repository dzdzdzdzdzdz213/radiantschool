import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Clock, ChevronDown, ChevronRight, Calendar, Timer, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

function useCountdown(target: string | null): string {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    if (!target) { setDisplay(''); return; }
    const deadline = new Date(target).getTime() + 3600000;
    const tick = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) { setDisplay('00:00'); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDisplay(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return display;
}

export default function TeacherAttendancePage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { lang } = useLang();
  const qc = useQueryClient();
  const [courseId, setCourseId] = useState('');
  const [courseType, setCourseType] = useState<'normal' | 'private' | 'vip'>('normal');
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [expandedMonth, setExpandedMonth] = useState<string>('');

  const { data: courses } = useQuery({
    queryKey: ['teacher_courses_attendance', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any).from('courses').select('id, name, type').eq('teacher_id', profile.id).order('name');
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const selectedCourse = (courses ?? []).find((c: any) => String(c.id) === courseId);

  const { data: sessions } = useQuery({
    queryKey: ['course_sessions', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { data } = await (supabase as any)
        .from('attendance_sessions')
        .select('id, date, title, check_in_opened_at, check_in_closed_at')
        .eq('course_id', courseId)
        .order('date');
      return data ?? [];
    },
    enabled: !!courseId && selectedCourse?.type === 'normal',
  });

  const { data: enrolled } = useQuery({
    queryKey: ['enrolled_students', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { data: enrollments } = await (supabase as any)
        .from('course_enrollments')
        .select('student_id, student:users!student_id(first_name, last_name)')
        .eq('course_id', courseId)
        .not('status', 'eq', 'cancelled');
      return (enrollments ?? []).map((e: any) => ({
        id: e.student_id,
        name: `${e.student?.first_name ?? ''} ${e.student?.last_name ?? ''}`.trim(),
      }));
    },
    enabled: !!courseId,
  });

  const { data: records } = useQuery({
    queryKey: ['attendance_records', courseId],
    queryFn: async () => {
      if (!courseId || !sessions?.length) return [];
      const ids = sessions.map((s: any) => s.id);
      const { data } = await (supabase as any)
        .from('attendance_records')
        .select('session_id, student_id, status')
        .in('session_id', ids);
      return data ?? [];
    },
    enabled: !!courseId && !!sessions?.length && selectedCourse?.type === 'normal',
  });

  const recordsMap: Record<string, Record<string, string>> = {};
  for (const r of records ?? []) {
    if (!recordsMap[r.session_id]) recordsMap[r.session_id] = {};
    recordsMap[r.session_id][r.student_id] = r.status;
  }

  const markAttendance = useMutation({
    mutationFn: async ({ session_id, student_id, status }: { session_id: number; student_id: string; status: string }) => {
      const session = (sessions ?? []).find((s: any) => s.id === session_id);
      if (!session) return;

      const { error } = await (supabase as any)
        .from('attendance_records')
        .upsert({ session_id, student_id, status }, { onConflict: 'session_id,student_id' });
      if (error) throw error;

      if (!session?.check_in_opened_at && (status === 'present' || status === 'late')) {
        await (supabase as any).from('attendance_sessions').update({ check_in_opened_at: new Date().toISOString() }).eq('id', session_id);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attendance_records', courseId] }); qc.invalidateQueries({ queryKey: ['course_sessions', courseId] }); },
    onError: (err: any) => toast(err?.message ?? 'Erreur', 'error'),
  });

  const addSession = useMutation({
    mutationFn: async () => {
      if (!courseId || !newSessionDate) throw new Error('Date requise');
      const { error } = await (supabase as any).from('attendance_sessions').insert({ course_id: parseInt(courseId), date: newSessionDate, title: newSessionTitle.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course_sessions', courseId] });
      setShowAddSession(false);
      setNewSessionDate(new Date().toISOString().split('T')[0]);
      setNewSessionTitle('');
      toast('Séance ajoutée', 'success');
    },
    onError: (err: any) => toast(err?.message ?? 'Erreur', 'error'),
  });

  const sessionsByMonth: Record<string, any[]> = {};
  for (const s of sessions ?? []) {
    const month = s.date.substring(0, 7);
    (sessionsByMonth[month] ??= []).push(s);
  }

  const privateScheduleQuery = useQuery({
    queryKey: ['private_schedules', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { data: schedules } = await (supabase as any)
        .from('course_schedules')
        .select('id, day_of_week, start_time, end_time')
        .eq('course_id', courseId);
      return schedules ?? [];
    },
    enabled: !!courseId && (selectedCourse?.type === 'private' || selectedCourse?.type === 'vip'),
  });

  const privateAttendanceQuery = useQuery({
    queryKey: ['private_attendance', courseId, privateScheduleQuery.data],
    queryFn: async () => {
      if (!courseId) return [];
      const ids = (privateScheduleQuery.data ?? []).map((s: any) => s.id);
      if (ids.length === 0) return [];
      const { data } = await (supabase as any)
        .from('attendance')
        .select('id, student_id, course_schedule_id, date, status, check_in_time, check_in_closed_at, method, recorded_by')
        .in('course_schedule_id', ids)
        .order('date', { ascending: false });
      return data ?? [];
    },
    enabled: !!courseId && (selectedCourse?.type === 'private' || selectedCourse?.type === 'vip'),
  });

  const markPrivateAttendance = useMutation({
    mutationFn: async ({ student_id, course_schedule_id, date, status }: { student_id: string; course_schedule_id: number; date: string; status: string }) => {
      const existing = (privateAttendanceQuery.data ?? []).find((r: any) => r.course_schedule_id === course_schedule_id && r.student_id === student_id && r.date === date);
      const now = new Date().toISOString();
      const hasAnyCheckIn = (privateAttendanceQuery.data ?? []).some((r: any) => r.course_schedule_id === course_schedule_id && r.date === date && r.check_in_time);
      if (existing) {
        const { error } = await (supabase as any).from('attendance').update({ status, check_in_time: existing.check_in_time ?? now, recorded_by: profile?.id }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('attendance').insert({ student_id, course_schedule_id, date, status, method: 'manual', recorded_by: profile?.id, check_in_time: now });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['private_attendance', courseId] }); toast('Présence enregistrée', 'success'); },
    onError: (err: any) => toast(err?.message ?? 'Erreur', 'error'),
  });

  const [newAppointmentDate, setNewAppointmentDate] = useState('');
  const [newAppointmentSlot, setNewAppointmentSlot] = useState('');

  const closePrivateAttendances = useMutation({
    mutationFn: async () => {
      if (!courseId) return;
      const ids = (privateScheduleQuery.data ?? []).map((s: any) => s.id);
      if (!ids.length) return;
      const now = new Date().toISOString();
      const { error } = await (supabase as any)
        .from('attendance')
        .update({ check_in_closed_at: now })
        .in('course_schedule_id', ids)
        .not('check_in_time', 'is', null)
        .is('check_in_closed_at', null)
        .lte('check_in_time', new Date(Date.now() - 3600000).toISOString());
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['private_attendance', courseId] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.attendance', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérer les présences</p>
        </div>
        <Select value={courseId} onValueChange={v => { setCourseId(v); setExpandedMonth(''); setShowAddSession(false); }} placeholder="Choisir un cours">
          {(courses ?? []).map((c: any) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
              <Badge variant="outline" className="ml-2 text-[10px]">{c.type === 'normal' ? 'Groupe' : c.type === 'private' ? 'Particulier' : 'VIP'}</Badge>
            </SelectItem>
          ))}
        </Select>
      </div>

      {!courseId && (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Sélectionnez un cours pour voir les présences</CardContent></Card>
      )}

      {courseId && selectedCourse?.type === 'normal' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{enrolled?.length ?? 0} élèves · {sessions?.length ?? 0} séances</p>
            <Button size="sm" className="gap-2" onClick={() => setShowAddSession(true)}><Plus className="h-4 w-4" />Ajouter une séance</Button>
          </div>

          {showAddSession && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Date</Label>
                    <Input type="date" value={newSessionDate} onChange={e => setNewSessionDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Titre (optionnel)</Label>
                    <Input value={newSessionTitle} onChange={e => setNewSessionTitle(e.target.value)} placeholder="Ex: Révision" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowAddSession(false)}>Annuler</Button>
                  <Button size="sm" onClick={() => addSession.mutate()} disabled={addSession.isPending}>Ajouter</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {Object.entries(sessionsByMonth).map(([month, monthSessions]) => {
            const isOpen = expandedMonth === month;
            const monthLabel = new Date(month + '-01').toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
            return (
              <Card key={month}>
                <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpandedMonth(isOpen ? '' : month)}>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    {monthLabel}
                    <Badge variant="outline" className="ml-auto">{monthSessions.length} séance{monthSessions.length > 1 ? 's' : ''}</Badge>
                  </div>
                </CardHeader>
                {isOpen && (
                  <CardContent className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium sticky left-0 bg-card z-10">Élève</th>
                          {monthSessions.map((s: any) => {
                            const isClosed = !!s.check_in_closed_at;
                            const hasTimer = !!s.check_in_opened_at && !isClosed;
                            return (
                              <th key={s.id} className="text-center py-2 px-3 min-w-[110px]">
                                <div className="text-xs font-medium">{s.title ?? 'Séance'}</div>
                                <div className="text-[10px] text-muted-foreground">{new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                                {isClosed && <Lock className="h-3 w-3 mx-auto mt-1 text-muted-foreground" />}
                                {hasTimer && <div className="flex items-center justify-center gap-1 mt-1"><Timer className="h-3 w-3 text-amber-500" /><span className="text-[10px] text-amber-600"><TimerCountdown target={s.check_in_opened_at} /></span></div>}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {(enrolled ?? []).map((student: any) => (
                          <tr key={student.id} className="border-b last:border-0">
                            <td className="py-2 pr-4 font-medium sticky left-0 bg-card">{student.name}</td>
                            {monthSessions.map((s: any) => {
                              const status = recordsMap[s.id]?.[student.id] ?? '';
                              const isClosed = !!s.check_in_closed_at;
                              const isPastDeadline = s.check_in_opened_at && !s.check_in_closed_at && new Date(s.check_in_opened_at).getTime() + 3600000 < Date.now();
                              return (
                                <td key={s.id} className="text-center py-2 px-3">
                                  {isClosed || isPastDeadline ? (
                                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                                      {status === 'present' && <><Check className="h-4 w-4 text-emerald-600" /><span className="text-xs">Présent</span></>}
                                      {status === 'late' && <><Clock className="h-4 w-4 text-amber-600" /><span className="text-xs">Retard</span></>}
                                      {status === 'absent' && <><X className="h-4 w-4 text-red-600" /><span className="text-xs">Absent</span></>}
                                      {!status && <span className="text-xs text-muted-foreground">—</span>}
                                    </span>
                                  ) : (
                                    <div className="flex items-center justify-center gap-1">
                                      <button onClick={() => markAttendance.mutate({ session_id: s.id, student_id: student.id, status: 'present' })}
                                        className={`p-1.5 rounded transition-colors ${status === 'present' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-400' : 'hover:bg-emerald-50 text-muted-foreground'}`}
                                        title="Présent"><Check className="h-4 w-4" /></button>
                                      <button onClick={() => markAttendance.mutate({ session_id: s.id, student_id: student.id, status: 'late' })}
                                        className={`p-1.5 rounded transition-colors ${status === 'late' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-400' : 'hover:bg-amber-50 text-muted-foreground'}`}
                                        title="Retard"><Clock className="h-4 w-4" /></button>
                                      <button onClick={() => markAttendance.mutate({ session_id: s.id, student_id: student.id, status: 'absent' })}
                                        className={`p-1.5 rounded transition-colors ${status === 'absent' ? 'bg-red-100 text-red-700 ring-1 ring-red-400' : 'hover:bg-red-50 text-muted-foreground'}`}
                                        title="Absent"><X className="h-4 w-4" /></button>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        {(enrolled ?? []).length === 0 && (
                          <tr><td colSpan={monthSessions.length + 1} className="py-8 text-center text-muted-foreground">Aucun élève inscrit</td></tr>
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                )}
              </Card>
            );
          })}

          {sessions?.length === 0 && (
            <Card><CardContent className="p-12 text-center text-muted-foreground">{t('common.no_data', lang)}</CardContent></Card>
          )}
        </>
      )}

      {courseId && (selectedCourse?.type === 'private' || selectedCourse?.type === 'vip') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {enrolled?.length ?? 0} élève{(enrolled?.length ?? 0) > 1 ? 's' : ''} · {privateAttendanceQuery.data?.length ?? 0} présences enregistrées
            </p>
            <Button variant="outline" size="sm" onClick={() => closePrivateAttendances.mutate()} disabled={closePrivateAttendances.isPending}>
              <Timer className="h-4 w-4 mr-1" />Fermer sessions expirées
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-sm font-semibold">Nouvelle séance</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="space-y-1 flex-1 max-w-[200px]">
                  <Label className="text-xs">Créneau</Label>
                  <Select value={newAppointmentSlot} onValueChange={setNewAppointmentSlot} placeholder="Choisir un créneau">
                    {(privateScheduleQuery.data ?? []).map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.day_of_week} {s.start_time?.substring(0, 5)}-{s.end_time?.substring(0, 5)}
                      </SelectItem>
                    ))}
                    {(privateScheduleQuery.data ?? []).length === 0 && (
                      <SelectItem value="__none__">— Aucun créneau —</SelectItem>
                    )}
                  </Select>
                </div>
                <div className="space-y-1 flex-1 max-w-[200px]">
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={newAppointmentDate} onChange={e => setNewAppointmentDate(e.target.value)} />
                </div>
                <Button size="sm" className="gap-2" onClick={() => {
                  if (!newAppointmentSlot || !newAppointmentDate) { toast('Sélectionnez un créneau et une date', 'error'); return; }
                  (enrolled ?? []).forEach((student: any) => {
                    markPrivateAttendance.mutate({
                      student_id: student.id,
                      course_schedule_id: parseInt(newAppointmentSlot),
                      date: newAppointmentDate,
                      status: 'present',
                    });
                  });
                  toast('Séance créée', 'success');
                }} disabled={markPrivateAttendance.isPending}>
                  <Calendar className="h-4 w-4" />Créer la séance
                </Button>
              </div>
            </CardContent>
          </Card>

          {enrolled?.length >= 1 && (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Créneau</th>
                      <th className="text-center py-3 px-4 font-medium">Statut</th>
                      <th className="text-center py-3 px-4 font-medium">Timer</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(privateAttendanceQuery.data ?? []).length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Aucune séance enregistrée</td></tr>
                    )}
                    {(privateAttendanceQuery.data ?? []).map((r: any) => {
                      const schedule = (privateScheduleQuery.data ?? []).find((s: any) => s.id === r.course_schedule_id);
                      const checkInTime = r.check_in_time;
                      const isClosed = !!r.check_in_closed_at;
                      const isPastDeadline = checkInTime && !isClosed && new Date(checkInTime).getTime() + 3600000 < Date.now();
                      return (
                        <tr key={r.id} className={`border-b last:border-0 ${isClosed || isPastDeadline ? 'opacity-70' : ''}`}>
                          <td className="py-3 px-4">{new Date(r.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {schedule ? `${schedule.day_of_week} ${schedule.start_time?.substring(0, 5)}-${schedule.end_time?.substring(0, 5)}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'destructive'}>
                              {r.status === 'present' ? 'Présent' : r.status === 'late' ? 'Retard' : 'Absent'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isClosed ? (
                              <span className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Lock className="h-3 w-3" />Fermé</span>
                            ) : checkInTime ? (
                              <span className="text-xs text-amber-600 flex items-center justify-center gap-1"><Timer className="h-3 w-3" /><TimerCountdown target={checkInTime} /></span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isClosed || isPastDeadline ? (
                              <span className="text-xs text-muted-foreground">Verrouillé</span>
                            ) : (
                              <div className="flex justify-end gap-1">
                                <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => markPrivateAttendance.mutate({ student_id: r.student_id, course_schedule_id: r.course_schedule_id, date: r.date, status: 'present' })} disabled={markPrivateAttendance.isPending}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-amber-600" onClick={() => markPrivateAttendance.mutate({ student_id: r.student_id, course_schedule_id: r.course_schedule_id, date: r.date, status: 'late' })} disabled={markPrivateAttendance.isPending}>
                                  <Clock className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => markPrivateAttendance.mutate({ student_id: r.student_id, course_schedule_id: r.course_schedule_id, date: r.date, status: 'absent' })} disabled={markPrivateAttendance.isPending}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {(enrolled ?? []).length === 0 && (
            <Card><CardContent className="p-12 text-center text-muted-foreground">Aucun élève inscrit à ce cours</CardContent></Card>
          )}
        </div>
      )}
    </div>
  );
}

function TimerCountdown({ target }: { target: string }) {
  const display = useCountdown(target);
  const expired = display === '00:00';
  return <span className={expired ? 'text-red-500 font-bold' : ''}>{display}</span>;
}
