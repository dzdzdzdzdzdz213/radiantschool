import { useState } from 'react';
import { Search, Plus, User, Calendar, Clock, Euro, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/utils';

export default function PrivateLessonsPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['teacher_private_lessons', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('private_lessons')
        .select('id, date, start_time, end_time, price, status, notes, student:users!student_id(first_name, last_name)')
        .eq('teacher_id', profile.id)
        .order('date', { ascending: false });
      const { data } = await q;
      let items = (data ?? []).map((l: any) => ({ ...l, studentName: `${l.student?.first_name ?? ''} ${l.student?.last_name ?? ''}` }));
      if (search) items = items.filter((i: any) => i.studentName.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Cours particuliers</h1><p className="text-sm text-muted-foreground mt-1">Gérer vos leçons individuelles</p></div>
        <Button className="h-9 gap-2"><Plus className="h-4 w-4" />Nouveau cours</Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par élève..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Horaire</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 4 }).map((_, i) => (<TableRow key={i}>{[1, 2, 3, 4, 5].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>))
              : (lessons ?? []).length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun cours particulier</TableCell></TableRow>
              : (lessons ?? []).map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-sm font-medium">{l.studentName}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{formatDate(l.date)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{formatTime(l.start_time)} - {formatTime(l.end_time)}</TableCell>
                  <TableCell className="text-sm flex items-center gap-1"><Euro className="h-3 w-3" />{l.price ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={l.status === 'completed' ? 'success' : l.status === 'cancelled' ? 'destructive' : 'outline'}>
                      {l.status === 'completed' ? 'Effectué' : l.status === 'cancelled' ? 'Annulé' : 'Planifié'}
                    </Badge>
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