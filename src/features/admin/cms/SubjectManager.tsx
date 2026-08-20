import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useToast } from '@/hooks/useToast';
import { Plus, Search, Pencil, Trash2, X, Loader, BookOpen, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface SubjectRow {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

const EMPTY_FORM = { name: '', description: '' };

export default function SubjectManager() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data } = await supabase.from('subjects').select('*').order('name', { ascending: true });
      return (data ?? []) as SubjectRow[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['subjects'], refetchType: 'all' });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const name = form.name.trim();
      if (!name) throw new Error(t('subjects.name_required', lang));
      const payload = { name, description: form.description.trim() || null };
      if (editingId) {
        const { error } = await supabase.from('subjects').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('subjects').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      toast(t('success.saved', lang, t('subjects.subject', lang)), 'success');
      setShowModal(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
    onError: (err: Error) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast(t('success.deleted', lang, t('subjects.subject', lang)), 'success');
    },
    onError: (err: Error) => {
      const msg = err?.message ?? '';
      toast(
        msg.includes('foreign key') || msg.includes('23503')
          ? t('subjects.in_use', lang)
          : (msg || t('common.error', lang)),
        'error',
      );
    },
  });

  const filtered = (subjects ?? []).filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()));

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
              <h2 className="text-lg font-semibold">{editingId ? t('common.edit', lang) : t('subjects.new', lang)}</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('subjects.subject', lang)} *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('subjects.description', lang)}</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : null}
                {editingId ? t('common.save', lang) : t('subjects.create', lang)}
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
          <Plus className="h-4 w-4 mr-1.5" /> {t('subjects.new', lang)}
        </Button>
      </div>

      <Card className="divide-y divide-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">{t('common.loading', lang)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">{t('common.no_data', lang)}</div>
        ) : filtered.map((subject) => (
          <div key={subject.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{subject.name}</p>
              {subject.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{subject.description}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingId(subject.id); setForm({ name: subject.name, description: subject.description ?? '' }); setShowModal(true); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmDelete({ id: subject.id, name: subject.name })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <AlertTriangle className="h-3.5 w-3.5" />
        {t('subjects.delete_warning', lang)}
      </p>
    </div>
  );
}