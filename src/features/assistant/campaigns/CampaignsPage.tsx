import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, X, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function CampaignsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: campaigns, isLoading, isError } = useQuery({
    queryKey: ['assistant_campaigns'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('campaigns')
        .select('*')
        .order('start_date', { ascending: false });
      return data ?? [];
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isError) toast(t('errors.load_error', lang, t('nav.campaigns', lang)), 'error');
  }, [isError]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' });

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: '', description: '', start_date: '', end_date: '' });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setForm({
      name: item.name ?? '',
      description: item.description ?? '',
      start_date: item.start_date ?? '',
      end_date: item.end_date ?? '',
    });
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error(t('campaigns.name_required', lang));
      if (!form.start_date || !form.end_date) throw new Error(t('campaigns.dates_required', lang));
      if (new Date(form.end_date) <= new Date(form.start_date)) throw new Error(t('campaigns.date_order', lang));
      const payload = { name: form.name.trim(), description: form.description.trim() || null, start_date: form.start_date, end_date: form.end_date };
      if (editingId) {
        const { error } = await (supabase as any).from('campaigns').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('campaigns').insert({ ...payload, is_active: true });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_campaigns'] });
      toast(t(editingId ? 'success.updated' : 'success.created', lang, t('campaigns.campaign', lang)), 'success');
      setShowModal(false);
      setEditingId(null);
      setForm({ name: '', description: '', start_date: '', end_date: '' });
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_campaigns'] });
      toast(t('success.deleted', lang, t('campaigns.campaign', lang)), 'success');
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.campaigns', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('campaigns.subtitle', lang)}</p>
        </div>
        <Button className="gap-2" onClick={openCreateModal} disabled={saveMutation.isPending}><Plus className="h-4 w-4" />{t('campaigns.new', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{editingId ? t('common.edit', lang) : t('campaigns.new', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('common.name', lang)} *</Label>
                <Input placeholder={t('campaigns.name_placeholder', lang)} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.description', lang)}</Label>
                <Textarea placeholder={t('campaigns.desc_placeholder', lang)} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('campaigns.start_date', lang)} *</Label>
                  <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t('campaigns.end_date', lang)} *</Label>
                  <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? t('common.loading', lang) : (editingId ? t('common.save', lang) : t('campaigns.create', lang))}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardHeader className="pb-3"><div className="h-24 bg-muted rounded-xl animate-pulse" /></CardHeader></Card>
        )) : (campaigns ?? []).length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p>
          </div>
        ) : (campaigns ?? []).map((c: any) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{c.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Badge variant={c.is_active ? 'success' : 'outline'}>{c.is_active ? t('status.active', lang) : t('status.inactive', lang)}</Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmDelete({ id: c.id, name: c.name })} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(c.start_date)} - {formatDate(c.end_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{t('campaigns.max_seats', lang)}: {c.max_seats ?? t('campaigns.unlimited', lang)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
