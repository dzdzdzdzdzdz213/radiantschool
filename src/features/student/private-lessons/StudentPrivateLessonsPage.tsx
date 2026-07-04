import { useEffect } from 'react';
import { Plus, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { useMutationWithFeedback } from '@/hooks/useMutationFeedback';
import { useToast } from '@/components/ui/Toast';

export default function StudentPrivateLessonsPage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const { toast } = useToast();

  const { data: lessons, isLoading, isError } = useQuery({
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isError) toast(t('errors.load_error', lang, t('nav.private_lessons', lang)), 'error'); }, [isError]);

  const bookMutation = useMutationWithFeedback<unknown, Error, void, unknown>(
    async () => {
      if (!profile?.id) return;
      const { error } = await (supabase as any).from('private_lessons').insert({
        student_id: profile.id,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    { successMessage: t('success.sent', lang, t('nav.private_lessons', lang)), invalidateQueries: [['student_private_lessons']] },
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.private_lessons', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('nav.private_lessons', lang)}</p></div>
        <Button className="h-9 gap-2" onClick={() => bookMutation.mutate()} disabled={bookMutation.isPending}>{bookMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{t('common.add', lang)}</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>{t('role.teacher', lang)}</TableHead><TableHead>{t('common.date', lang)}</TableHead><TableHead>{t('common.time', lang)}</TableHead><TableHead>{t('common.price', lang)}</TableHead><TableHead className="text-right">{t('common.status', lang)}</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 4 }).map((_, i) => (<TableRow key={i}>{[1, 2, 3, 4, 5].map(c => <TableCell key={c}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))
              : (lessons ?? []).length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">{t('common.no_data', lang)}</TableCell></TableRow>
              : (lessons ?? []).map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-sm font-medium">{l.teacherName}</TableCell>
                  <TableCell className="text-sm">{formatDate(l.date)}</TableCell>
                  <TableCell className="text-sm">{formatTime(l.start_time)} - {formatTime(l.end_time)}</TableCell>
                  <TableCell className="text-sm">{formatCurrency(l.price ?? 0)}</TableCell>
                  <TableCell className="text-right"><Badge variant={l.status === 'completed' ? 'success' : l.status === 'cancelled' ? 'destructive' : 'outline'}>{l.status === 'completed' ? t('status.completed', lang) : l.status === 'cancelled' ? t('status.cancelled', lang) : t('status.upcoming', lang)}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
