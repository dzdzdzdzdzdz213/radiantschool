import { useState } from 'react';
import { Search, Plus, DollarSign, X, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { Select, SelectItem } from '@/components/ui/select';

export default function PrivateLessonsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { lang } = useLang();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: lessons, isLoading, isError } = useQuery({
    queryKey: ['teacher_private_lessons', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('private_lessons')
        .select('id, date, start_time, end_time, price, status, notes, student:users!student_id(first_name, last_name)')
        .eq('teacher_id', profile.id)
        .order('date', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      let items = (data ?? []).map((l: any) => ({ ...l, studentName: `${l.student?.first_name ?? ''} ${l.student?.last_name ?? ''}` }));
      if (search) items = items.filter((i: any) => i.studentName.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });
  useErrorToast(isError, lang, t('nav.private_lessons', lang));

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ student_id: '', date: '', start_time: '', end_time: '', price: '' });

  const { data: students, isError: studentsError } = useQuery({
    queryKey: ['teacher_students_select', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: courseIds } = await (supabase as any).from('courses').select('id').eq('teacher_id', profile.id);
      if (!courseIds?.length) return [];
      const { data } = await (supabase as any)
        .from('course_enrollments')
        .select('student:users!student_id(id, first_name, last_name)')
        .in('course_id', courseIds.map((c: any) => c.id));
      const unique = new Map();
      for (const e of data ?? []) {
        if (e.student?.id) unique.set(e.student.id, { id: e.student.id, name: `${e.student.first_name ?? ''} ${e.student.last_name ?? ''}` });
      }
      return Array.from(unique.values());
    },
    enabled: !!profile?.id,
  });
  useErrorToast(studentsError, lang, t('nav.students', lang));

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ student_id: '', date: '', start_time: '', end_time: '', price: '' });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setForm({ student_id: item.student_id ?? '', date: item.date ?? '', start_time: item.start_time ?? '', end_time: item.end_time ?? '', price: item.price?.toString() ?? '' });
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      const payload = {
        teacher_id: profile.id,
        student_id: form.student_id || null,
        date: form.date || new Date().toISOString().split('T')[0],
        start_time: form.start_time || '09:00',
        end_time: form.end_time || '10:00',
        price: form.price ? parseFloat(form.price) : 0,
      };
      if (editingId) {
        const { error } = await (supabase as any).from('private_lessons').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('private_lessons').insert({ ...payload, status: 'scheduled' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher_private_lessons'] });
      setShowModal(false);
      setEditingId(null);
      setForm({ student_id: '', date: '', start_time: '', end_time: '', price: '' });
      toast(t(editingId ? 'success.updated' : 'success.created', lang, t('common.private_lesson', lang)), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('private_lessons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher_private_lessons'] });
      toast(t('success.deleted', lang, t('common.private_lesson', lang)), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.id, { onSettled: () => setConfirmDelete(null) }); }}
        message={`${t('common.confirm_delete', lang)} "${confirmDelete?.name ?? ''}" ?`}
        loading={deleteMutation.isPending}
      />
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.private_lessons', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('common.description', lang)}</p></div>
        <Button className="h-9 gap-2" onClick={openCreateModal} disabled={saveMutation.isPending}><Plus className="h-4 w-4" />{t('common.add', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingId ? t('common.edit', lang) : t('common.add', lang)}</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('nav.students', lang)}</Label>
                <Select value={form.student_id} onValueChange={value => setForm(f => ({ ...f, student_id: value }))} placeholder={t('common.select_student', lang)}>
                  {(students ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.date', lang)}</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-9" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">{t('common.time', lang)}</Label>
                  <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">{t('common.end', lang)}</Label>
                  <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className="h-9" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.price', lang)}</Label>
                <Input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" className="h-9" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" className="h-9" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
               <Button size="sm" className="h-9" disabled={saveMutation.isPending || !form.student_id || !form.date} onClick={() => saveMutation.mutate()}>
                  {saveMutation.isPending ? t('common.loading', lang) : (editingId ? t('common.save', lang) : t('common.create', lang))}
              </Button>
            </div>
          </div>
        </div>
      )}
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('common.search_student', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('nav.students', lang)}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('common.date', lang)}</TableHead>
                <TableHead className="hidden md:table-cell">{t('common.time', lang)}</TableHead>
                <TableHead>{t('common.price', lang)}</TableHead>
                <TableHead className="text-right">{t('common.status', lang)}</TableHead>
                <TableHead className="w-20">{t('common.actions', lang)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 4 }).map((_, i) => (<TableRow key={i}>{[1, 2, 3, 4, 5, 6].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>))
              : isError ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('errors.load_error', lang, '')}</TableCell></TableRow>
              : (lessons ?? []).length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('common.no_data', lang)}</TableCell></TableRow>
              : (lessons ?? []).map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-sm font-medium">{l.studentName}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{formatDate(l.date)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{formatTime(l.start_time)} - {formatTime(l.end_time)}</TableCell>
                  <TableCell className="text-sm"><span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{formatCurrency(l.price ?? 0)}</span></TableCell>
                  <TableCell className="text-right">
                    <Badge variant={l.status === 'completed' ? 'success' : l.status === 'cancelled' ? 'destructive' : 'outline'}>
                      {l.status === 'completed' ? t('status.completed', lang) : l.status === 'cancelled' ? t('status.cancelled', lang) : t('status.upcoming', lang)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(l)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmDelete({ id: l.id, name: l.studentName })} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
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
