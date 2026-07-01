import { useState } from 'react';
import { Plus, Calendar, Clock, Euro, CheckCircle, XCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/utils';

export default function StudentPrivateLessonsPage() {
  const { profile } = useAuth();

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['student_private_lessons', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('private_lessons')
        .select('id, date, start_time, end_time, price, status, notes, teacher:users!teacher_id(first_name, last_name)')
        .eq('student_id', profile.id)
        .order('date', { ascending: false });
      return (data ?? []).map((l: any) => ({ ...l, teacherName: `${l.teacher?.first_name ?? ''} ${l.teacher?.last_name ?? ''}` }));
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Cours particuliers</h1><p className="text-sm text-muted-foreground mt-1">Demandez et suivez vos cours individuels</p></div>
        <Button className="h-9 gap-2"><Plus className="h-4 w-4" />Réserver</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Professeur</TableHead><TableHead>Date</TableHead><TableHead>Horaire</TableHead><TableHead>Prix</TableHead><TableHead className="text-right">Statut</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 4 }).map((_, i) => (<TableRow key={i}>{[1, 2, 3, 4, 5].map(c => <TableCell key={c}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))
              : (lessons ?? []).length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Aucun cours particulier</TableCell></TableRow>
              : (lessons ?? []).map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-sm font-medium">{l.teacherName}</TableCell>
                  <TableCell className="text-sm">{formatDate(l.date)}</TableCell>
                  <TableCell className="text-sm">{formatTime(l.start_time)} - {formatTime(l.end_time)}</TableCell>
                  <TableCell className="text-sm">{l.price ?? 0} €</TableCell>
                  <TableCell className="text-right"><Badge variant={l.status === 'completed' ? 'success' : l.status === 'cancelled' ? 'destructive' : 'outline'}>{l.status === 'completed' ? 'Effectué' : l.status === 'cancelled' ? 'Annulé' : 'Planifié'}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}