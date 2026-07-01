import { useState } from 'react';
import { Search, Check, X, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/Toast';

export default function TeacherAttendancePage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [courseFilter, setCourseFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: courses } = useQuery({
    queryKey: ['teacher_courses_attendance', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any).from('courses').select('id, name').eq('teacher_id', profile.id);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const { data: records, isLoading } = useQuery({
    queryKey: ['teacher_attendance', profile?.id, date, courseFilter],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('attendance')
        .select('id, date, status, method, created_at, student:users!student_id(first_name, last_name, id), course_schedule:course_schedules!inner(course:courses!inner(name, teacher_id), start_time, end_time)')
        .eq('course_schedule.course.teacher_id', profile.id);
      if (date) q = q.eq('date', date);
      if (courseFilter) q = q.eq('course_schedule.course_id', courseFilter);
      const { data } = await q.order('created_at', { ascending: false });
      let items = (data ?? []).map((r: any) => ({ id: r.id, studentName: r.student ? `${r.student.first_name ?? ''} ${r.student.last_name ?? ''}` : '', courseName: r.course_schedule?.course?.name ?? '', status: r.status, method: r.method ?? 'manual' }));
      if (debouncedSearch) items = items.filter((i: any) => i.studentName.toLowerCase().includes(debouncedSearch.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  const correctMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from('attendance').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teacher_attendance'] }); toast('Présence mise à jour', 'success'); },
    onError: (err: any) => toast(err?.message ?? 'Erreur lors de la correction', 'error'),
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Présences</h1><p className="text-sm text-muted-foreground mt-1">Gérer les présences de vos cours</p></div>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un élève..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
            </div>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9 w-40" />
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="h-9 w-48"><SelectValue placeholder="Tous les cours" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les cours</SelectItem>
                {(courses ?? []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead className="hidden sm:table-cell">Cours</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">Méthode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (<TableRow key={i}>{[1, 2, 3, 4, 5].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>))
              : (records ?? []).length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucune présence trouvée</TableCell></TableRow>
              : (records ?? []).map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell><span className="text-sm font-medium">{r.studentName}</span></TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{r.courseName}</TableCell>
                  <TableCell><Badge variant={r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'destructive'}>{r.status === 'present' ? 'Présent' : r.status === 'late' ? 'En retard' : 'Absent'}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{r.method === 'rfid' ? 'RFID' : 'Manuel'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => correctMutation.mutate({ id: r.id, status: 'present' })} disabled={correctMutation.isPending}><Check className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-amber-600" onClick={() => correctMutation.mutate({ id: r.id, status: 'late' })} disabled={correctMutation.isPending}><Clock className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => correctMutation.mutate({ id: r.id, status: 'absent' })} disabled={correctMutation.isPending}><X className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
