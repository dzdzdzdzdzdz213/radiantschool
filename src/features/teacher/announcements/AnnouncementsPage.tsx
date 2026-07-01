import { useState } from 'react';
import { Search, Plus, Megaphone, Pin, Calendar, MessageSquare, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function AnnouncementsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: announcements, isLoading, isError } = useQuery({
    queryKey: ['teacher_announcements', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('announcements')
        .select('id, title, content, is_pinned, created_at, course:courses(name)')
        .eq('teacher_id', profile.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      let items = data ?? [];
      if (search) items = items.filter((i: any) => i.title?.toLowerCase().includes(search.toLowerCase()) || i.content?.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', course_id: '' });

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
      const { error } = await (supabase as any).from('announcements').insert({
        teacher_id: profile.id,
        title: form.title,
        content: form.content,
        course_id: form.course_id || null,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher_announcements'] });
      setShowModal(false);
      setForm({ title: '', content: '', course_id: '' });
      toast('Annonce créée', 'success');
    },
    onError: (err: any) => toast(err?.message ?? 'Erreur', 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Annonces</h1><p className="text-sm text-muted-foreground mt-1">Communiquer avec vos élèves</p></div>
        <Button className="h-9 gap-2" onClick={() => setShowModal(true)} disabled={createMutation.isPending}><Plus className="h-4 w-4" />{createMutation.isPending ? 'Création...' : 'Nouvelle annonce'}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Nouvelle annonce</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Titre *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre de l'annonce" className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Message *</Label>
                <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Contenu de l'annonce" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Matière (optionnelle)</Label>
                <select value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} className="flex h-9 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                  <option value="">Toutes les matières</option>
                  {(courses ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" className="h-9" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button size="sm" className="h-9" disabled={!form.title || !form.content || createMutation.isPending} onClick={() => createMutation.mutate()}>
                {createMutation.isPending ? 'Création...' : 'Publier'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />))
            : isError ? (
              <div className="text-center py-12 text-muted-foreground"><Megaphone className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>Erreur de chargement des annonces</p></div>
            ) : (announcements ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Megaphone className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>Aucune annonce</p></div>
            ) : (announcements ?? []).map((a: any) => (
              <div key={a.id} className="rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-start gap-3">
                  {a.is_pinned && <Pin className="h-4 w-4 text-primary shrink-0 mt-1" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-medium">{a.title}</h4>
                      {a.is_pinned && <Badge variant="outline" className="text-[9px]">Épinglé</Badge>}
                      {a.course?.name && <Badge variant="secondary" className="text-[9px]">{a.course.name}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(a.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
