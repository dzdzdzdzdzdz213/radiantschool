import { useState } from 'react';
import { Plus, Loader, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { useMutationWithFeedback } from '@/hooks/useMutationFeedback';
export default function StudentPrivateLessonsPage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ teacher_id: '', course_id: '', date: '', start_time: '', end_time: '', price: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  useErrorToast(isError, lang, t('nav.private_lessons', lang));

  const bookMutation = useMutationWithFeedback<unknown, Error, { teacher_id: string; course_id: string; date: string; start_time: string; end_time: string; price: number }, unknown>(
    async (formData) => {
      if (!profile?.id) return;
      const { error } = await (supabase as any).from('private_lessons').insert({
        student_id: profile.id,
        teacher_id: formData.teacher_id,
        course_id: formData.course_id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        price: formData.price,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    { successMessage: t('success.sent', lang, t('nav.private_lessons', lang)), invalidateQueries: [['student_private_lessons']], onSuccess: () => { setShowForm(false); setForm({ teacher_id: '', course_id: '', date: '', start_time: '', end_time: '', price: '' }); } },
  );

  function validate() {
    const e: Record<string, string> = {};
    if (!form.teacher_id) e.teacher_id = t('errors.required', lang);
    if (!form.course_id) e.course_id = t('errors.required', lang);
    if (!form.date) e.date = t('errors.required', lang);
    if (!form.start_time) e.start_time = t('errors.required', lang);
    if (!form.end_time) e.end_time = t('errors.required', lang);
    if (!form.price || Number(form.price) <= 0) e.price = t('errors.required', lang);
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    bookMutation.mutate({ teacher_id: form.teacher_id, course_id: form.course_id, date: form.date, start_time: form.start_time, end_time: form.end_time, price: Number(form.price) });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.private_lessons', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('nav.private_lessons', lang)}</p></div>
        <Button className="h-9 gap-2" onClick={() => setShowForm(true)}>{showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{t('common.add', lang)}</Button>
      </div>
      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">{t('role.teacher', lang)}</label><Input value={form.teacher_id} onChange={e => setForm(p => ({ ...p, teacher_id: e.target.value }))} className={errors.teacher_id ? 'border-red-500' : ''} /></div>
              <div><label className="text-xs font-medium">{t('common.course', lang)}</label><Input value={form.course_id} onChange={e => setForm(p => ({ ...p, course_id: e.target.value }))} className={errors.course_id ? 'border-red-500' : ''} /></div>
              <div><label className="text-xs font-medium">{t('common.date', lang)}</label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={errors.date ? 'border-red-500' : ''} /></div>
              <div><label className="text-xs font-medium">{t('common.start_time', lang)}</label><Input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} className={errors.start_time ? 'border-red-500' : ''} /></div>
              <div><label className="text-xs font-medium">{t('common.end_time', lang)}</label><Input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} className={errors.end_time ? 'border-red-500' : ''} /></div>
              <div><label className="text-xs font-medium">{t('common.price', lang)}</label><Input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className={errors.price ? 'border-red-500' : ''} /></div>
            </div>
            {Object.keys(errors).length > 0 && <p className="text-xs text-red-500">{t('errors.required', lang)}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>{t('common.cancel', lang)}</Button>
              <Button size="sm" onClick={handleSubmit} disabled={bookMutation.isPending}>{bookMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : null}{t('common.submit', lang)}</Button>
            </div>
          </CardContent>
        </Card>
      )}
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
