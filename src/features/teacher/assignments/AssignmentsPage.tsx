import { useState } from 'react';
import { Search, Plus, FileText, Calendar, Clock, Download, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/utils';
import { useDownloadFile } from '@/hooks/useMutationFeedback';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function AssignmentsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { lang } = useLang();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const downloadFile = useDownloadFile();

  const { data: assignments, isLoading, isError } = useQuery({
    queryKey: ['teacher_assignments', profile?.id, debouncedSearch],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('assignments')
        .select('id, title, description, due_date, created_at, file_url, course:courses(name)')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      let items = data ?? [];
      if (debouncedSearch) items = items.filter((i: any) => i.title?.toLowerCase().includes(debouncedSearch.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

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
      qc.invalidateQueries({ queryKey: ['teacher_assignments'] });
      setShowModal(false);
      setForm({ title: '', description: '', due_date: '', course_id: '' });
      toast(t('success.created', lang, 'Devoir'), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.assignments', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('common.description', lang)}</p></div>
        <Button className="h-9 gap-2" onClick={() => setShowModal(true)} disabled={createMutation.isPending}><Plus className="h-4 w-4" />{createMutation.isPending ? t('common.loading', lang) : t('common.add', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
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
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('common.search', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 rounded-xl border p-4"><div className="flex-1 space-y-2"><div className="h-5 bg-muted rounded animate-pulse w-1/3" /><div className="h-4 bg-muted rounded animate-pulse w-2/3" /></div></div>
            )) : isError ? (
              <div className="text-center py-12 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('errors.load_error', lang, '')}</p></div>
            ) : (assignments ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>{t('common.no_data', lang)}</p>
              </div>
            ) : (assignments ?? []).map((a: any) => (
              <div key={a.id} className="flex items-start gap-4 rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm">{a.title}</h4>
                    <Badge variant="outline" className="text-[10px]">{a.course?.name ?? ''}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description ?? ''}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{'Créé le'} {formatDate(a.created_at)}</span>
                    {a.due_date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{'Remise: '}{formatDate(a.due_date)}</span>}
                  </div>
                </div>
                {a.file_url && <Button variant="ghost" size="sm" className="shrink-0" onClick={() => downloadFile.mutate({ fileUrl: a.file_url, filename: a.title })} disabled={downloadFile.isPending}><Download className="h-4 w-4" /></Button>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
