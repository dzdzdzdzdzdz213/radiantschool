import { useState, useEffect } from 'react';
import { Search, Check, X, Clock, Timer, Lock, Unlock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectItem } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';

function useCountdown(target: string | null): string {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    if (!target) { setDisplay(''); return; }
    const ms = new Date(target).getTime();
    if (isNaN(ms)) { setDisplay('—'); return; }
    const deadline = ms + 3600000;
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

export default function AdminAttendanceOversightPage() {
  const { toast } = useToast();
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const qc = useQueryClient();
  const [teacherFilter, setTeacherFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: teachers, isError: teachersError } = useQuery({
    queryKey: ['teachers_list'],
    queryFn: async () => {
      const { data } = await (supabase as any).from('users').select('id, first_name, last_name').eq('role', 'teacher').order('first_name');
      return data ?? [];
    },
  });
  useErrorToast(teachersError, lang, t('nav.users', lang));

  const { data: groupSessions, isLoading: groupLoading, isError: groupError } = useQuery({
    queryKey: ['admin_oversight_group', teacherFilter],
    queryFn: async () => {
      let q = (supabase as any)
        .from('attendance_sessions')
        .select('id, date, title, check_in_opened_at, check_in_closed_at, price_calculated, course:courses!inner(id, name, type, teacher_id, teacher:users!teacher_id(first_name, last_name))')
        .order('date', { ascending: false })
        .limit(100);
      if (teacherFilter) q = q.eq('course.teacher_id', teacherFilter);
      const { data } = await q;
      return data ?? [];
    },
  });
  useErrorToast(groupError, lang, t('nav.attendance', lang));

  const { data: privateRecords, isLoading: privateLoading, isError: privateError } = useQuery({
    queryKey: ['admin_oversight_private', teacherFilter],
    queryFn: async () => {
      let q = (supabase as any)
        .from('attendance')
        .select('id, date, status, check_in_time, check_in_closed_at, method, course_schedule:course_schedules!inner(id, course_id, course:courses!inner(id, name, type, teacher_id, teacher:users!teacher_id(first_name, last_name)))')
        .order('date', { ascending: false })
        .limit(100);
      if (teacherFilter) q = q.eq('course_schedule.course.teacher_id', teacherFilter);
      const { data } = await q;
      return data ?? [];
    },
  });
  useErrorToast(privateError, lang, t('nav.attendance', lang));

  const openSessions = (groupSessions ?? []).filter((s: any) => s.check_in_opened_at && !s.check_in_closed_at);
  const closedSessions = (groupSessions ?? []).filter((s: any) => s.check_in_closed_at);
  const pendingSessions = (groupSessions ?? []).filter((s: any) => !s.check_in_opened_at);

  const filteredPrivate = (privateRecords ?? []).filter((r: any) => {
    const t = r.course_schedule?.course?.type;
    if (typeFilter === 'group' && t !== 'normal') return false;
    if (typeFilter === 'private' && t !== 'private') return false;
    if (typeFilter === 'vip' && t !== 'vip') return false;
    return true;
  });

  const searchTerm = search.toLowerCase();
  const matchSearch = (s: any) => !searchTerm || s.course?.name?.toLowerCase().includes(searchTerm) || `${s.course?.teacher?.first_name} ${s.course?.teacher?.last_name}`.toLowerCase().includes(searchTerm);
  const matchSearchR = (r: any) => !searchTerm || r.course_schedule?.course?.name?.toLowerCase().includes(searchTerm) || `${r.course_schedule?.course?.teacher?.first_name} ${r.course_schedule?.course?.teacher?.last_name}`.toLowerCase().includes(searchTerm);

  const displayedOpen = openSessions.filter(matchSearch);
  const displayedClosed = closedSessions.filter(matchSearch);
  const displayedPrivate = filteredPrivate.filter(matchSearchR);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supervision des présences</h1>
          <p className="text-sm text-muted-foreground mt-1">Surveiller les séances et tarifs enseignants</p>
        </div>
        <div />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Unlock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{openSessions.length}</p>
              <p className="text-xs text-muted-foreground">Séances en cours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Check className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{closedSessions.length + filteredPrivate.length}</p>
              <p className="text-xs text-muted-foreground">Séances fermées (30j)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{pendingSessions.length}</p>
              <p className="text-xs text-muted-foreground">Séances en attente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('common.search_course', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
        </div>
        <Select value={teacherFilter} onValueChange={setTeacherFilter} placeholder="Tous les enseignants">
          {(teachers ?? []).map((t: any) => (
            <SelectItem key={t.id} value={t.id}>{t.first_name} {t.last_name}</SelectItem>
          ))}
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectItem value="all">Tous types</SelectItem>
          <SelectItem value="group">Groupe</SelectItem>
          <SelectItem value="private">Particulier</SelectItem>
          <SelectItem value="vip">VIP</SelectItem>
        </Select>
      </div>

      {(groupLoading || privateLoading) && (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Chargement...</CardContent></Card>
      )}
      {!groupLoading && !privateLoading && displayedOpen.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><h3 className="text-sm font-semibold text-amber-600 flex items-center gap-2"><Timer className="h-4 w-4" />Séances en cours ({displayedOpen.length})</h3></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Cours</th>
                <th className="text-left py-3 px-4 font-medium">Enseignant</th>
                <th className="text-center py-3 px-4 font-medium">Date</th>
                <th className="text-center py-3 px-4 font-medium">Timer restant</th>
                <th className="text-right py-3 px-4 font-medium">Prix</th>
              </tr></thead>
              <tbody>
                {displayedOpen.map((s: any) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{s.course?.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.course?.teacher?.first_name} {s.course?.teacher?.last_name}</td>
                    <td className="py-3 px-4 text-center">{new Date(s.date).toLocaleDateString(localeMap[lang])}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-amber-600 font-mono font-bold"><TimerCountdown target={s.check_in_opened_at} /></span>
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{s.price_calculated ? `${s.price_calculated} DA` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {(displayedClosed.length > 0 || typeFilter !== 'all') && (
        <Card>
          <CardHeader className="pb-3"><h3 className="text-sm font-semibold flex items-center gap-2"><Lock className="h-4 w-4" />Historique des séances</h3></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Cours</th>
                <th className="text-left py-3 px-4 font-medium">Enseignant</th>
                <th className="text-center py-3 px-4 font-medium">Date</th>
                <th className="text-center py-3 px-4 font-medium">Type</th>
                <th className="text-center py-3 px-4 font-medium">Statut</th>
                <th className="text-right py-3 px-4 font-medium">Prix calculé</th>
              </tr></thead>
              <tbody>
                {displayedClosed.slice(0, 50).map((s: any) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{s.course?.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.course?.teacher?.first_name} {s.course?.teacher?.last_name}</td>
                    <td className="py-3 px-4 text-center">{new Date(s.date).toLocaleDateString(localeMap[lang])}</td>
                    <td className="py-3 px-4 text-center"><Badge variant="outline">Groupe</Badge></td>
                    <td className="py-3 px-4 text-center"><Badge variant="success">Fermé</Badge></td>
                    <td className="py-3 px-4 text-right font-mono">{s.price_calculated ? `${s.price_calculated} DA` : <span className="text-muted-foreground">—</span>}</td>
                  </tr>
                ))}
                {displayedPrivate.slice(0, 50).map((r: any) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{r.course_schedule?.course?.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.course_schedule?.course?.teacher?.first_name} {r.course_schedule?.course?.teacher?.last_name}</td>
                    <td className="py-3 px-4 text-center">{new Date(r.date).toLocaleDateString(localeMap[lang])}</td>
                    <td className="py-3 px-4 text-center"><Badge variant="outline">{r.course_schedule?.course?.type === 'private' ? t('courses.type_private', lang) : r.course_schedule?.course?.type === 'vip' ? t('type.vip', lang) : 'Groupe'}</Badge></td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'destructive'}>
                        {r.status === 'present' ? t('status.present', lang) : r.status === 'late' ? t('status.late', lang) : t('status.absent', lang)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">—</td>
                  </tr>
                ))}
                {displayedClosed.length === 0 && displayedPrivate.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Aucune séance fermée</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {!groupLoading && !privateLoading && displayedOpen.length === 0 && displayedClosed.length === 0 && (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Aucune séance trouvée. Les données apparaîtront quand les enseignants commenceront à pointer les présences.</CardContent></Card>
      )}
    </div>
  );
}

function TimerCountdown({ target }: { target: string }) {
  const display = useCountdown(target);
  const expired = display === '00:00';
  return <span className={expired ? 'text-red-500 font-bold' : ''}>{display}</span>;
}
