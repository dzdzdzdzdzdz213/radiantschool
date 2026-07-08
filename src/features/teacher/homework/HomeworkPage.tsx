import { useState } from 'react';
import { Search, Plus, BookOpen, CheckCircle, Clock, AlertCircle, X, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

const STATUS_COLORS: Record<string, string> = { completed: 'text-emerald-600', pending: 'text-amber-600', overdue: 'text-red-600' };
const STATUS_ICONS: Record<string, any> = { completed: CheckCircle, pending: Clock, overdue: AlertCircle };
const STATUS_LABELS: Record<string, string> = { completed: 'Rendu', pending: 'En attente', overdue: 'En retard' };

export default function HomeworkPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { lang } = useLang();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: submissions, isLoading, isError } = useQuery({
    queryKey: ['teacher_homework', profile?.id, debouncedSearch],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('assignment_submissions')
        .select('id, status, submitted_at, grade, feedback, student:users!student_id(first_name, last_name), assignment:assignments!inner(title, due_date, course:courses(name))')
        .eq('assignment.teacher_id', profile.id)
        .order('submitted_at', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      let items = (data ?? []).map((s: any) => ({ ...s, studentName: `${s.student?.first_name ?? ''} ${s.student?.last_name ?? ''}` }));
      if (debouncedSearch) items = items.filter((i: any) => i.studentName.toLowerCase().includes(debouncedSearch.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', course_id: '' });

  const { data: courses } = useQuery({
    queryKey: ['teacher_courses_select', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any).from('courses').select('id, name').eq('teacher_id', profile.id);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const [editTarget, setEditTarget] = useState<any>(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editTarget) return;
      const { error } = await (supabase as any)
        .from('assignment_submissions')
        .update({ grade: gradeForm.grade ? Number(gradeForm.grade) : null, feedback: gradeForm.feedback || null })
        .eq('id', editTarget.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher_homework'] });
      setEditTarget(null);
      setGradeForm({ grade: '', feedback: '' });
      toast(t('success.updated', lang, 'Note'), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) return;
      const { error } = await (supabase as any).from('assignment_submissions').delete().eq('id', deleteTarget.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher_homework'] });
      setDeleteTarget(null);
      toast(t('success.deleted', lang, ''), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      const { error } = await (supabase as any).from('assignments').insert({
        teacher_id: profile.id,
        title: form.title,
        description: form.description,
        due_date: form.due_date || null,
        course_id: form.course_id || null,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher_homework'] });
      setShowModal(false);
      setForm({ title: '', description: '', due_date: '', course_id: '' });
      toast(t('success.created', lang, 'Devoir'), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.homework', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('common.description', lang)}</p></div>
        <Button variant="outline" className="h-9 gap-2" disabled={createMutation.isPending} onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />{createMutation.isPending ? t('common.loading', lang) : t('common.add', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t('common.add', lang)}</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.name', lang)} *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={t('common.name', lang)} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.description', lang)}</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={t('common.description', lang)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.date', lang)}</Label>
                <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{'Matière'}</Label>
                <select value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} className="flex h-9 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                  <option value="">{'Sélectionner une matière'}</option>
                  {(courses ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" className="h-9" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
              <Button size="sm" className="h-9" disabled={!form.title || createMutation.isPending} onClick={() => createMutation.mutate()}>
                {createMutation.isPending ? t('common.loading', lang) : t('common.create', lang)}
              </Button>
            </div>
          </div>
        </div>
      )}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 bg-black/50" onClick={() => { setEditTarget(null); setGradeForm({ grade: '', feedback: '' }); }}>
          <div className="bg-card rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{'Noter'}</h2>
              <button onClick={() => { setEditTarget(null); setGradeForm({ grade: '', feedback: '' }); }} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground">{editTarget.studentName} — {editTarget.assignment?.title}</p>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{'Note /20'}</Label>
                <Input type="number" min="0" max="20" step="0.5" value={gradeForm.grade} onChange={e => setGradeForm(f => ({ ...f, grade: e.target.value }))} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{'Feedback'}</Label>
                <Textarea value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))} placeholder={'Commentaire...'} />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" className="h-9" onClick={() => { setEditTarget(null); setGradeForm({ grade: '', feedback: '' }); }}>{t('common.cancel', lang)}</Button>
              <Button size="sm" className="h-9" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate()}>
                {updateMutation.isPending ? t('common.loading', lang) : t('common.save', lang)}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('common.confirm_delete', lang, '')}
        message={deleteTarget ? `${'Supprimer la remise de'} ${deleteTarget.studentName} ?` : ''}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('common.search_student', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />))
            : isError ? (
              <div className="text-center py-12 text-muted-foreground"><AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('errors.load_error', lang, '')}</p></div>
            ) : (submissions ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p></div>
            ) : (submissions ?? []).map((s: any) => {
              const Icon = STATUS_ICONS[s.status] ?? Clock;
              return (
                <div key={s.id} className="flex items-center gap-4 rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                  <Icon className={`h-5 w-5 shrink-0 ${STATUS_COLORS[s.status] ?? 'text-muted-foreground'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{s.studentName}</p>
                    <p className="text-xs text-muted-foreground">{s.assignment?.title ?? ''} — {s.assignment?.course?.name ?? ''}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{'Remis le'} {formatDate(s.submitted_at)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{STATUS_LABELS[s.status] ?? s.status}</p>
                    {s.grade && <p className="text-sm font-semibold">{s.grade}/20</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditTarget(s); setGradeForm({ grade: String(s.grade ?? ''), feedback: s.feedback ?? '' }); }} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteTarget(s)} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
