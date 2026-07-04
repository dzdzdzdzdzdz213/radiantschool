import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '@/hooks/useQueries';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate, getStatusColor, getFullName } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Search, Plus, BookOpen, X, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function CoursesPage() {
  const { data: courses, isLoading } = useCourses();
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', price: '', capacity: '', start_date: '', end_date: '' });

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: '', price: '', capacity: '', start_date: '', end_date: '' });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setForm({
      name: item.name ?? '',
      price: item.price?.toString() ?? '',
      capacity: item.capacity?.toString() ?? '',
      start_date: item.start_date ?? '',
      end_date: item.end_date ?? '',
    });
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        price: form.price ? parseFloat(form.price) : 0,
        capacity: form.capacity ? parseInt(form.capacity, 10) : 1,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      if (editingId) {
        const { error } = await (supabase as any).from('courses').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('courses').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      toast(t(editingId ? 'success.updated' : 'success.created', lang, t('nav.courses', lang)), 'success');
      setShowModal(false);
      setEditingId(null);
      setForm({ name: '', price: '', capacity: '', start_date: '', end_date: '' });
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('courses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      toast(t('success.deleted', lang, t('nav.courses', lang)), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const filtered = (courses ?? []).filter((c: any) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.id, { onSettled: () => setConfirmDelete(null) }); }}
        message={`${t('common.confirm_delete', lang)} "${confirmDelete?.name ?? ''}" ?`}
        loading={deleteMutation.isPending}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.courses', lang)}</h1>
        <Button className="h-9 gap-2" onClick={openCreateModal} disabled={saveMutation.isPending}><Plus className="h-4 w-4" />{t('common.add', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <Card className="bg-card rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingId ? t('common.edit', lang) : t('common.add', lang)}</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.name', lang)} *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">{t('common.price', lang)}</Label>
                  <Input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">{t('groups.capacity', lang)}</Label>
                  <Input type="number" min="1" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} className="h-9" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">{'Début'}</Label>
                  <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">{'Fin'}</Label>
                  <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="h-9" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" className="h-9" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
              <Button size="sm" className="h-9" disabled={!form.name || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                {saveMutation.isPending ? t('common.loading', lang) : (editingId ? t('common.save', lang) : t('common.create', lang))}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search_course', lang)} className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">{t('common.all', lang)}</option>
          <option value="normal">Normal</option>
          <option value="vip">VIP</option>
          <option value="private">Particulier</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-muted">{t('common.loading', lang)}</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted">{t('common.no_results', lang)}</div>
        ) : (
          filtered.map((c: any) => (
            <div key={c.id} className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`./${c.id}`)}>
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{c.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(c.status)}`}>{c.status}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmDelete({ id: c.id, name: c.name })} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-muted">
                <p>Enseignant: {c.teacher ? getFullName(c.teacher.first_name, c.teacher.last_name) : 'Non assigné'}</p>
                <p>Niveau: {c.level?.name}{c.level?.stream ? ` - ${c.level.stream}` : ''}</p>
                <p>Capacité: {c.current_enrollments}/{c.capacity}</p>
                <p>{t('common.price', lang)}: {formatCurrency(c.price)}</p>
                <p>{t('common.from', lang)} {formatDate(c.start_date)} {t('common.to', lang)} {formatDate(c.end_date)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
