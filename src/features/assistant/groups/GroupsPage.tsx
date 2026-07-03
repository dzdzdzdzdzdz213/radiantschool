import { useState, useEffect } from 'react';
import { Search, Plus, Users, X, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function GroupsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: groups, isLoading, isError } = useQuery({
    queryKey: ['assistant_groups'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('courses')
        .select('id, name, type, capacity, current_enrollments, status, level:levels(name)')
        .order('name');
      return data ?? [];
    },
  });

  useEffect(() => {
    if (isError) toast(t('errors.load_error', lang, t('nav.groups', lang)), 'error');
  }, [isError]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', capacity: '' });

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: '', description: '', capacity: '' });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setForm({ name: item.name ?? '', description: item.description ?? '', capacity: item.capacity?.toString() ?? '' });
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error(t('groups.name_required', lang));
      const capacity = parseInt(form.capacity, 10);
      if (isNaN(capacity) || capacity <= 0) throw new Error(t('groups.capacity_invalid', lang));
      const payload = { name: form.name.trim(), description: form.description.trim(), capacity, type: 'normal', status: 'active' };
      if (editingId) {
        const { error } = await (supabase as any).from('courses').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('courses').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_groups'] });
      toast(t(editingId ? 'success.updated' : 'success.created', lang, t('nav.groups', lang)), 'success');
      setShowModal(false);
      setEditingId(null);
      setForm({ name: '', description: '', capacity: '' });
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('courses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_groups'] });
      toast(t('success.deleted', lang, t('nav.groups', lang)), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`${t('common.confirm_delete', lang)} "${name}" ?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.groups', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('groups.subtitle', lang)}</p>
        </div>
        <Button className="gap-2" onClick={openCreateModal} disabled={saveMutation.isPending}><Plus className="h-4 w-4" />{t('groups.new', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{editingId ? t('common.edit', lang) : t('groups.new', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('common.name', lang)} *</Label>
                <Input placeholder={t('common.name', lang)} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.description', lang)}</Label>
                <Textarea placeholder={t('groups.desc_placeholder', lang)} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t('groups.capacity', lang)} *</Label>
                <Input type="number" placeholder={t('groups.capacity_placeholder', lang)} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? t('common.loading', lang) : (editingId ? t('common.save', lang) : t('groups.create', lang))}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardHeader className="pb-3"><div className="h-24 bg-muted rounded-xl animate-pulse" /></CardHeader></Card>
        )) : (groups ?? []).length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p>
          </div>
        ) : (groups ?? []).map((g: any) => (
          <Card key={g.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{g.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{g.level?.name ?? '—'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={g.status === 'active' ? 'success' : 'outline'}>
                    {g.status === 'active' ? t('status.active', lang) : t('status.inactive', lang)}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(g)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => confirmDelete(g.id, g.name)} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{g.current_enrollments ?? 0}/{g.capacity}</span>
                </div>
                <span className="text-xs text-muted-foreground">{g.type}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-accent overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(((g.current_enrollments ?? 0) / (g.capacity || 1)) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
