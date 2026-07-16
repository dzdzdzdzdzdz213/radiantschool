import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function TeacherAnnouncementsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', course_id: '' });

  const { data: courses } = useQuery({
    queryKey: ['teacher-courses-simple', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase.from('courses').select('id, name').eq('teacher_id', profile.id).in('status', ['active']);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['teacher-announcements', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('announcements')
        .select('*, course:courses(name)')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      const { error } = await supabase.from('announcements').insert({
        teacher_id: profile.id,
        course_id: Number(form.course_id),
        title: form.title,
        content: form.content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-announcements'] });
      toast('Annonce publiée', 'success');
      setShowForm(false);
      setForm({ title: '', content: '', course_id: '' });
    },
    onError: (err: any) => toast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await supabase.from('announcements').delete().eq('id', id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teacher-announcements'] }); toast('Supprimée', 'success'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="h-6 w-6" />Annonces</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" />Nouvelle annonce</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} className="w-full h-10 rounded-xl px-3 text-sm border bg-background">
              <option value="">Toutes les formations</option>
              {courses?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Input placeholder="Titre" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea placeholder="Contenu" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} className="w-full rounded-xl px-3 py-2 text-sm border bg-background resize-none" />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!form.title || !form.content || createMutation.isPending}>Publier</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : !announcements?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune annonce</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{a.course?.name} · {new Date(a.created_at).toLocaleDateString()}</p>
                    <p className="text-sm whitespace-pre-wrap">{a.content}</p>
                  </div>
                  <button onClick={() => deleteMutation.mutate(a.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-4 shrink-0"><Trash2 className="h-4 w-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
