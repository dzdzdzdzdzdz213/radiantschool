import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useToast } from '@/hooks/useToast';
import { Plus, Search, Pencil, Trash2, X, Loader, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface FaqRow {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM = { question: '', answer: '', is_active: true };

export default function FaqManager() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; question: string } | null>(null);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['cms_faqs'],
    queryFn: async () => {
      const { data } = await supabase.from('faqs').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });
      return (data ?? []) as FaqRow[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['cms_faqs'], refetchType: 'all' });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.question.trim() || !form.answer.trim()) throw new Error(t('validation.required', lang));
      const payload = { question: form.question.trim(), answer: form.answer.trim(), is_active: form.is_active };
      if (editingId) {
        const { error } = await supabase.from('faqs').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data: rows } = await supabase.from('faqs').select('sort_order').order('sort_order', { ascending: false }).limit(1);
        const nextOrder = (rows?.[0]?.sort_order ?? -1) + 1;
        const { error } = await supabase.from('faqs').insert({ ...payload, sort_order: nextOrder });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      toast(t('success.saved', lang, t('cms.faq', lang)), 'success');
      setShowModal(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
    onError: (err: Error) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast(t('success.deleted', lang, t('cms.faq', lang)), 'success');
    },
    onError: (err: Error) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, dir }: { id: number; dir: -1 | 1 }) => {
      const sorted = [...(faqs ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
      const index = sorted.findIndex((f) => f.id === id);
      const swap = sorted[index + dir];
      if (!swap) return;
      const { error: e1 } = await supabase.from('faqs').update({ sort_order: swap.sort_order }).eq('id', id);
      const { error: e2 } = await supabase.from('faqs').update({ sort_order: sorted[index].sort_order }).eq('id', swap.id);
      if (e1) throw e1;
      if (e2) throw e2;
    },
    onSuccess: invalidate,
    onError: (err: Error) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const { error } = await supabase.from('faqs').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (err: Error) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const filtered = (faqs ?? []).filter((f) => !search || f.question.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.id, { onSettled: () => setConfirmDelete(null) }); }}
        message={`${t('common.confirm_delete', lang)} "${confirmDelete?.question ?? ''}" ?`}
        loading={deleteMutation.isPending}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 bg-black/50" onClick={() => setShowModal(false)}>
          <Card className="bg-card rounded-xl p-6 w-full max-w-lg space-y-4 shadow-xl my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingId ? t('common.edit', lang) : t('common.add', lang)} — {t('cms.faq', lang)}</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('cms.question', lang)} *</Label>
                <Input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('cms.answer', lang)} *</Label>
                <Textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} rows={4} />
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

      <Card className="divide-y divide-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">{t('common.loading', lang)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">{t('common.no_data', lang)}</div>
        ) : filtered.map((faq, i) => (
          <div key={faq.id} className="flex items-center gap-3 px-4 py-3">
            <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{faq.question}</p>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{faq.answer}</p>
            </div>
            <Badge variant={faq.is_active ? 'success' : 'outline'} className="shrink-0">
              {faq.is_active ? t('cms.visible', lang) : t('cms.hidden', lang)}
            </Badge>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title={t('common.actions', lang)} onClick={() => toggleMutation.mutate({ id: faq.id, is_active: !faq.is_active })}>
                {faq.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={i === 0} onClick={() => moveMutation.mutate({ id: faq.id, dir: -1 })}>
                ↑
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={i === filtered.length - 1} onClick={() => moveMutation.mutate({ id: faq.id, dir: 1 })}>
                ↓
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingId(faq.id); setForm({ question: faq.question, answer: faq.answer, is_active: faq.is_active }); setShowModal(true); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmDelete({ id: faq.id, question: faq.question })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
