import { useState } from 'react';
import { Search, Plus, Video, Monitor, Calendar, Users, X, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function OnlineClassesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { lang } = useLang();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: sessions, isLoading, isError } = useQuery({
    queryKey: ['teacher_online_sessions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await (supabase as any)
        .from('online_classes')
        .select('id, title, description, platform, meeting_url, start_time, end_time, status, created_at, course:courses(name)')
        .eq('teacher_id', profile.id)
        .order('start_time', { ascending: false });
      if (error) throw error;
      let items = data ?? [];
      if (search) items = items.filter((i: any) => i.title?.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', course_id: '', date: '', start_time: '', end_time: '', meeting_link: '' });

  const { data: courses } = useQuery({
    queryKey: ['teacher_courses_select', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any).from('courses').select('id, name').eq('teacher_id', profile.id);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ title: '', course_id: '', date: '', start_time: '', end_time: '', meeting_link: '' });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    const startDate = item.start_time ? item.start_time.split('T')[0] : '';
    const startTime = item.start_time ? item.start_time.split('T')[1]?.substring(0, 5) : '';
    const endTime = item.end_time ? item.end_time.split('T')[1]?.substring(0, 5) : '';
    setEditingId(item.id);
    setForm({ title: item.title ?? '', course_id: item.course_id ?? '', date: startDate, start_time: startTime, end_time: endTime, meeting_link: item.meeting_url ?? '' });
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      const startDateTime = form.date ? new Date(`${form.date}T${form.start_time || '09:00'}`).toISOString() : new Date().toISOString();
      const endDateTime = form.date ? new Date(`${form.date}T${form.end_time || '10:00'}`).toISOString() : new Date().toISOString();
      const payload = {
        teacher_id: profile.id,
        title: form.title,
        course_id: form.course_id || null,
        meeting_url: form.meeting_link || null,
        start_time: startDateTime,
        end_time: endDateTime,
      };
      if (editingId) {
        const { error } = await (supabase as any).from('online_classes').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('online_classes').insert({ ...payload, status: 'scheduled', created_at: new Date().toISOString() });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher_online_sessions'] });
      setShowModal(false);
      setEditingId(null);
      setForm({ title: '', course_id: '', date: '', start_time: '', end_time: '', meeting_link: '' });
      toast(t(editingId ? 'success.updated' : 'success.created', lang, 'Session'), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('online_classes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher_online_sessions'] });
      toast(t('success.deleted', lang, 'Session'), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const confirmDelete = (id: string, title: string) => {
    if (window.confirm(`${t('common.confirm_delete', lang)} "${title}" ?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.online_classes', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('common.description', lang)}</p></div>
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
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.name', lang)} *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={t('common.name', lang)} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{'Matière'}</Label>
                <select value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} className="flex h-9 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                  <option value="">{'Sélectionner une matière'}</option>
                  {(courses ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.details', lang)}</Label>
                <Input value={form.meeting_link} onChange={e => setForm(f => ({ ...f, meeting_link: e.target.value }))} placeholder="https://meet.google.com/..." className="h-9" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" className="h-9" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
              <Button size="sm" className="h-9" disabled={!form.title || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
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
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />))
            : isError ? (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('errors.load_error', lang, '')}</p>
              </div>
            ) : (sessions ?? []).length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p>
              </div>
            ) : (sessions ?? []).map((s: any) => (
              <div key={s.id} className="rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={s.status === 'completed' ? 'secondary' : s.status === 'live' ? 'success' : 'outline'}>
                    {s.status === 'completed' ? t('status.completed', lang) : s.status === 'live' ? t('status.live', lang) : t('status.upcoming', lang)}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Monitor className="h-3 w-3" />{s.platform ?? 'Zoom'}
                  </div>
                </div>
                <h4 className="text-sm font-medium truncate">{s.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{s.course?.name ?? ''}</p>
                <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(s.start_time)}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{formatTime(s.start_time)}</span>
                </div>
                <div className="flex gap-1 mt-3">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-2" asChild>
                    <a href={s.meeting_url ?? '#'} target="_blank" rel="noreferrer"><Video className="h-3.5 w-3.5" />{'Rejoindre'}</a>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => confirmDelete(s.id, s.title)} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
