import { useState } from 'react';
import { Search, Check, X, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';

export default function AssistantPrivateLessonsPage() {
  const { toast } = useToast();
  const { lang } = useLang();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: lessons, isLoading, isError } = useQuery({
    queryKey: ['assistant_private_lessons', search],
    queryFn: async () => {
      let q = (supabase as any)
        .from('private_lessons')
        .select('id, date, start_time, end_time, price, status, notes, created_at, student:users!student_id(first_name, last_name), teacher:users!teacher_id(first_name, last_name), course:courses(name)')
        .order('created_at', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      let items = (data ?? []).map((l: any) => ({
        ...l,
        studentName: `${l.student?.first_name ?? ''} ${l.student?.last_name ?? ''}`,
        teacherName: `${l.teacher?.first_name ?? ''} ${l.teacher?.last_name ?? ''}`,
        courseName: l.course?.name ?? '',
      }));
      if (search) items = items.filter((i: any) =>
        i.studentName.toLowerCase().includes(search.toLowerCase()) ||
        i.teacherName.toLowerCase().includes(search.toLowerCase()) ||
        i.courseName.toLowerCase().includes(search.toLowerCase())
      );
      return items;
    },
  });
  useErrorToast(isError, lang, 'Cours particuliers');

  const acceptMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await (supabase as any).from('private_lessons').update({ status: 'accepted' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast('Demande acceptée', 'success'); qc.invalidateQueries({ queryKey: ['assistant_private_lessons'] }); },
    onError: (e: any) => toast(e?.message ?? 'Erreur', 'error'),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await (supabase as any).from('private_lessons').update({ status: 'rejected' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast('Demande refusée', 'success'); qc.invalidateQueries({ queryKey: ['assistant_private_lessons'] }); },
    onError: (e: any) => toast(e?.message ?? 'Erreur', 'error'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cours particuliers</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Gérer les demandes de cours particuliers</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--fg-muted)' }} />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Étudiant</TableHead>
                <TableHead>Professeur</TableHead>
                <TableHead>Formation</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Horaire</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
                  ))}
                </TableRow>
              ))}
              {!isLoading && (lessons ?? []).length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-10" style={{ color: 'var(--fg-muted)' }}>Aucune demande</TableCell></TableRow>
              )}
              {(lessons ?? []).map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.studentName}</TableCell>
                  <TableCell>{l.teacherName}</TableCell>
                  <TableCell>{l.courseName}</TableCell>
                  <TableCell>{formatDate(l.date)}</TableCell>
                  <TableCell>{formatTime(l.start_time)} — {formatTime(l.end_time)}</TableCell>
                  <TableCell>{Number(l.price ?? 0).toLocaleString()} DA</TableCell>
                  <TableCell>
                    <Badge className={l.status === 'accepted' ? 'bg-green-100 text-green-800' : l.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}>
                      {l.status === 'accepted' ? 'Accepté' : l.status === 'rejected' ? 'Refusé' : 'En attente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {l.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => acceptMutation.mutate(l.id)} disabled={acceptMutation.isPending}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors bg-green-600 hover:bg-green-500 disabled:opacity-50"
                        ><Check className="h-3 w-3" />Accepter</button>
                        <button onClick={() => rejectMutation.mutate(l.id)} disabled={rejectMutation.isPending}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors bg-red-600 hover:bg-red-500 disabled:opacity-50"
                        ><X className="h-3 w-3" />Refuser</button>
                      </div>
                    )}
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
