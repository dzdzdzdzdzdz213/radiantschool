import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';

export default function TeacherAssignmentsPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', course_id: '', max_grade: '' });

  const { data: courses } = useQuery({
    queryKey: ['teacher-courses-simple', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase.from('courses').select('id, name').eq('teacher_id', profile.id).in('status', ['active']);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['teacher-assignments', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('assignments')
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
      const { error } = await supabase.from('assignments').insert({
        teacher_id: profile.id,
        course_id: Number(form.course_id),
        title: form.title,
        description: form.description || null,
        due_date: form.due_date || null,
        max_grade: form.max_grade ? Number(form.max_grade) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-assignments'] });
      toast('Devoir créé', 'success');
      setShowForm(false);
      setForm({ title: '', description: '', due_date: '', course_id: '', max_grade: '' });
    },
    onError: (err: any) => toast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teacher-assignments'] }); toast('Supprimé', 'success'); },
    onError: (err: any) => toast(err.message, 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6" />Devoirs</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" />Nouveau devoir</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} className="w-full h-10 rounded-xl px-3 text-sm border bg-background">
              <option value="">Sélectionner une formation...</option>
              {courses?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Input placeholder="Titre du devoir" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea placeholder="Description (optionnel)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-xl px-3 py-2 text-sm border bg-background resize-none" />
            <div className="flex gap-4">
              <div className="flex-1"><label className="text-xs font-semibold mb-1 block">Date limite</label><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
              <div className="flex-1"><label className="text-xs font-semibold mb-1 block">Note max</label><Input type="number" placeholder="20" value={form.max_grade} onChange={e => setForm({ ...form, max_grade: e.target.value })} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!form.title || !form.course_id || createMutation.isPending}>Créer</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : !assignments?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun devoir pour le moment</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0"><FileText className="h-5 w-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.course?.name}{a.due_date ? ` · À rendre le ${new Date(a.due_date).toLocaleDateString()}` : ''}{a.max_grade ? ` · /${a.max_grade}` : ''}</p>
                </div>
                <button onClick={() => deleteMutation.mutate(a.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
