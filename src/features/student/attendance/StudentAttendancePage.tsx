import { useEffect, useState } from 'react';
import { Search, Calendar, CheckCircle, XCircle, Clock, CreditCard as RfidIcon, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function StudentAttendancePage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const { data: attendanceData, isLoading, isError } = useQuery({
    queryKey: ['student_attendance', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { records: [], stats: { present: 0, late: 0, absent: 0, total: 0 } };
      const { data: records } = await (supabase as any)
        .from('attendance')
        .select('id, date, status, method, created_at, course_schedule:course_schedules!inner(course:courses!inner(name), start_time, end_time)')
        .eq('student_id', profile.id)
        .order('date', { ascending: false })
        .limit(100);
      const items = (records ?? []).map((r: any) => ({
        id: r.id,
        date: r.date,
        status: r.status,
        method: r.method ?? 'manual',
        courseName: r.course_schedule?.course?.name ?? '',
        startTime: r.course_schedule?.start_time ?? '',
        endTime: r.course_schedule?.end_time ?? '',
      }));
      const filtered = search ? items.filter((i: any) => i.courseName.toLowerCase().includes(search.toLowerCase())) : items;
      const present = items.filter((i: any) => i.status === 'present').length;
      const late = items.filter((i: any) => i.status === 'late').length;
      const absent = items.filter((i: any) => i.status === 'absent').length;
      return { records: filtered, stats: { present, late, absent, total: items.length } };
    },
    enabled: !!profile?.id,
  });

  useEffect(() => { if (isError) toast('Erreur lors du chargement des présences', 'error'); }, [isError]);

  const rate = attendanceData && attendanceData.stats.total > 0
    ? Math.round(((attendanceData.stats.present + attendanceData.stats.late) / attendanceData.stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Présences</h1><p className="text-sm text-muted-foreground mt-1">Historique de vos présences</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Taux de présence</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{rate}%</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-500" /> Présent</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-emerald-500">{attendanceData?.stats.present ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3 text-amber-500" /> En retard</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-amber-500">{attendanceData?.stats.late ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" /> Absent</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-red-500">{attendanceData?.stats.absent ?? 0}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher par cours..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" /></div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Cours</TableHead><TableHead>Horaire</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Méthode</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (<TableRow key={i}>{[1, 2, 3, 4, 5].map(c => <TableCell key={c}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))
              : (attendanceData?.records ?? []).length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucune présence trouvée</TableCell></TableRow>
              : (attendanceData?.records ?? []).map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm">{formatDate(r.date)}</TableCell>
                  <TableCell className="text-sm">{r.courseName}</TableCell>
                  <TableCell className="text-sm">{formatTime(r.startTime)} - {formatTime(r.endTime)}</TableCell>
                  <TableCell><Badge variant={r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'destructive'}>{r.status === 'present' ? 'Présent' : r.status === 'late' ? 'En retard' : 'Absent'}</Badge></TableCell>
                  <TableCell className="text-right"><span className="text-xs text-muted-foreground flex items-center justify-end gap-1">{r.method === 'rfid' ? <><RfidIcon className="h-3 w-3" />RFID</> : 'Manuel'}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}