import { useState } from 'react';
import { Search, Plus, Star, Calendar, Clock, DollarSign, X, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function VipClassesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { lang } = useLang();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: lessons, isLoading, isError } = useQuery({
    queryKey: ['teacher_vip_classes', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('vip_classes')
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

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ student_id: '', date: '', start_time: '', end_time: '', price: '' });

  const { data: students } = useQuery({
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
        const { error } = await (supabase as any).from('vip_classes').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('vip_classes').insert({ ...payload, status: 'scheduled' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher_vip_classes'] });
      setShowModal(false);
      setEditingId(null);
      setForm({ student_id: '', date: '', start_time: '', end_time: '', price: '' });
      toast(t(editingId ? 'success.updated' : 'success.created', lang, 'Cours VIP'), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('vip_classes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher_vip_classes'] });
      toast(t('success.deleted', lang, 'Cours VIP'), 'success');
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
        <div className="flex items-center gap-2"><h1 className="text-2xl font-bold tracking-tight">{t('nav.vip_classes', lang)}</h1><Star className="h-5 w-5 text-amber-500" /></div>
        <Button className="h-9 gap-2" onClick={openCreateModal} disabled={saveMutation.isPending}><Plus className="h-4 w-4" />{t('common.add', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingId ? t('common.edit', lang) : t('common.add', lang)}</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('nav.students', lang)}</Label>
                <select value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))} className="flex h-9 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                  <option value="">{'Sélectionner un élève'}</option>
                  {(students ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
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
                  <Label className="text-xs text-muted-foreground mb-1 block">{'Fin'}</Label>
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
            <Input placeholder={t('common.search', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />))
            : isError ? (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('errors.load_error', lang, '')}</p>
              </div>
            ) : (lessons ?? []).length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p>
              </div>
            ) : (lessons ?? []).map((l: any) => (
              <div key={l.id} className="rounded-xl border border-amber-200 dark:border-amber-900 p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={l.status === 'completed' ? 'success' : l.status === 'cancelled' ? 'destructive' : 'outline'} className="text-[10px]">
                    {l.status === 'completed' ? t('status.completed', lang) : l.status === 'cancelled' ? t('status.cancelled', lang) : t('status.upcoming', lang)}
                  </Badge>
                  <span className="text-sm font-semibold flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{formatCurrency(l.price ?? 0)}</span>
                </div>
                <h4 className="text-sm font-medium">{l.studentName}</h4>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(l.date)}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(l.start_time)}</span>
                </div>
                <div className="flex gap-1 mt-3">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(l)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmDelete({ id: l.id, name: l.studentName })} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
