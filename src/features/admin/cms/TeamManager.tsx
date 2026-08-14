import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useToast } from '@/hooks/useToast';
import { Plus, Search, Pencil, Trash2, X, Loader, Eye, EyeOff, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface TeamMemberRow {
  id: number;
  name: string;
  role: string;
  years: string;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM = { name: '', role: '', years: '', photo_url: '', is_active: true };

export default function TeamManager() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);

  const { data: members, isLoading } = useQuery({
    queryKey: ['cms_team'],
    queryFn: async () => {
      const { data } = await supabase.from('team_members').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });
      return (data ?? []) as TeamMemberRow[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['cms_team'], refetchType: 'all' });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim() || !form.role.trim()) throw new Error(t('validation.required', lang));
      const payload = { name: form.name.trim(), role: form.role.trim(), years: form.years.trim(), photo_url: form.photo_url.trim() || null, is_active: form.is_active };
      if (editingId) {
        const { error } = await supabase.from('team_members').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data: rows } = await supabase.from('team_members').select('sort_order').order('sort_order', { ascending: false }).limit(1);
        const nextOrder = (rows?.[0]?.sort_order ?? -1) + 1;
        const { error } = await supabase.from('team_members').insert({ ...payload, sort_order: nextOrder });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      toast(t('success.saved', lang, t('cms.team', lang)), 'success');
      setShowModal(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
    onError: (err: Error) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast(t('success.deleted', lang, t('cms.team', lang)), 'success');
    },
    onError: (err: Error) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, dir }: { id: number; dir: -1 | 1 }) => {
      const sorted = [...(members ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
      const index = sorted.findIndex((m) => m.id === id);
      const swap = sorted[index + dir];
      if (!swap) return;
      const { error: e1 } = await supabase.from('team_members').update({ sort_order: swap.sort_order }).eq('id', id);
      const { error: e2 } = await supabase.from('team_members').update({ sort_order: sorted[index].sort_order }).eq('id', swap.id);
      if (e1) throw e1;
      if (e2) throw e2;
    },
    onSuccess: invalidate,
    onError: (err: Error) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const { error } = await supabase.from('team_members').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (err: Error) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const filtered = (members ?? []).filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.id, { onSettled: () => setConfirmDelete(null) }); }}
        message={`${t('common.confirm_delete', lang)} "${confirmDelete?.name ?? ''}" ?`}
        loading={deleteMutation.isPending}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 bg-black/50" onClick={() => setShowModal(false)}>
          <Card className="bg-card rounded-xl p-6 w-full max-w-lg space-y-4 shadow-xl my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingId ? t('common.edit', lang) : t('common.add', lang)} — {t('cms.team', lang)}</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-xl border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {form.photo_url ? (
                    <img src={form.photo_url} alt="preview" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <ImageOff className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">{t('common.url', lang)}</Label>
                  <Input value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))} placeholder="https://..." className="h-9" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.name', lang)} *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('cms.role', lang)} *</Label>
                <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="h-9" placeholder="Prof de Mathématiques" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('cms.years', lang)}</Label>
                <Input value={form.years} onChange={e => setForm(f => ({ ...f, years: e.target.value }))} className="h-9" placeholder="12 ans d'expérience" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div><p className="text-sm font-medium">{t('common.status', lang)}</p><p className="text-xs text-muted-foreground">{form.is_active ? t('cms.visible', lang) : t('cms.hidden', lang)}</p></div>
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : null}
                {t('common.save', lang)}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search', lang)} className="pl-9 h-9" />
        </div>
        <Button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowModal(true); }}>
          <Plus className="h-4 w-4 mr-1.5" /> {t('common.add', lang)}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-8 text-sm text-muted-foreground">{t('common.loading', lang)}</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-8 text-sm text-muted-foreground">{t('common.no_data', lang)}</div>
        ) : filtered.map((member, i) => (
          <Card key={member.id} className="p-4 flex items-center gap-3 relative">
            <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted shrink-0">
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageOff className="h-5 w-5 text-muted-foreground" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{member.name}</p>
              <p className="text-xs text-primary truncate">{member.role}</p>
              {member.years && <p className="text-xs text-muted-foreground truncate mt-0.5">{member.years}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title={t('common.actions', lang)} onClick={() => toggleMutation.mutate({ id: member.id, is_active: !member.is_active })}>
                {member.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={i === 0} onClick={() => moveMutation.mutate({ id: member.id, dir: -1 })}>↑</Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={i === filtered.length - 1} onClick={() => moveMutation.mutate({ id: member.id, dir: 1 })}>↓</Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingId(member.id); setForm({ name: member.name, role: member.role, years: member.years ?? '', photo_url: member.photo_url ?? '', is_active: member.is_active }); setShowModal(true); }}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setConfirmDelete({ id: member.id, name: member.name })}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            {!member.is_active && (
              <Badge variant="outline" className="absolute top-2 right-2">{t('cms.hidden', lang)}</Badge>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
