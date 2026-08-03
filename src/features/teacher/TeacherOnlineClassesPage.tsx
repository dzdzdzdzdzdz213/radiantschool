import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Video, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatTime } from '@/lib/utils';

export default function TeacherOnlineClassesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newForm, setNewForm] = useState({ course_id: '', title: '', meeting_url: '', platform: '', description: '' });
  const [editForm, setEditForm] = useState({ title: '', meeting_url: '', platform: '', description: '' });

  const { data: courses } = useQuery({
    queryKey: ['teacher-courses-simple', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('courses')
        .select('id, name')
        .eq('teacher_id', profile.id)
        .in('status', ['active'])
        .order('name');
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const { data: onlineClasses, isLoading } = useQuery({
    queryKey: ['teacher-online-classes', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('online_classes')
        .select('*, course:courses(name)')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (vals: { course_id: number; title: string; meeting_url: string; platform: string; description: string }) => {
      if (!profile?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('online_classes').insert({
        course_id: vals.course_id,
        teacher_id: profile.id,
        title: vals.title || `Cours en ligne`,
        meeting_url: vals.meeting_url || null,
        platform: vals.platform || null,
        description: vals.description || null,
        status: 'scheduled',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast('Cours en ligne créé', 'success');
      qc.invalidateQueries({ queryKey: ['teacher-online-classes'] });
      setNewForm({ course_id: '', title: '', meeting_url: '', platform: '', description: '' });
    },
    onError: (e) => toast(e?.message ?? 'Erreur', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async (vals: { id: number; title: string; meeting_url: string; platform: string; description: string }) => {
      const { error } = await supabase.from('online_classes').update({
        title: vals.title,
        meeting_url: vals.meeting_url || null,
        platform: vals.platform || null,
        description: vals.description || null,
      }).eq('id', vals.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast('Lien mis à jour', 'success');
      qc.invalidateQueries({ queryKey: ['teacher-online-classes'] });
      setEditingId(null);
    },
    onError: (e) => toast(e?.message ?? 'Erreur', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('online_classes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast('Cours en ligne supprimé', 'success');
      qc.invalidateQueries({ queryKey: ['teacher-online-classes'] });
    },
    onError: (e) => toast(e?.message ?? 'Erreur', 'error'),
  });

  function startEdit(oc: any) {
    setEditingId(oc.id);
    setEditForm({ title: oc.title, meeting_url: oc.meeting_url || '', platform: oc.platform || '', description: oc.description || '' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Video className="h-6 w-6" />Cours en ligne</h1>
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus className="h-4 w-4" />Nouveau cours en ligne</h2>
          <div className="grid gap-4 sm:grid-cols-5">
            <select
              value={newForm.course_id}
              onChange={e => setNewForm({ ...newForm, course_id: e.target.value })}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Choisir un cours...</option>
              {courses?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Input
              placeholder="Titre (optionnel)"
              value={newForm.title}
              onChange={e => setNewForm({ ...newForm, title: e.target.value })}
              className="h-10"
            />
            <Input
              placeholder="Lien Google Meet/Zoom"
              value={newForm.meeting_url}
              onChange={e => setNewForm({ ...newForm, meeting_url: e.target.value })}
              className="h-10"
            />
            <Input
              placeholder="Plateforme"
              value={newForm.platform}
              onChange={e => setNewForm({ ...newForm, platform: e.target.value })}
              className="h-10"
            />
            <Button
              onClick={() => {
                if (!newForm.course_id) { toast('Sélectionnez un cours', 'error'); return; }
                if (!newForm.meeting_url) { toast('Ajoutez un lien', 'error'); return; }
                createMutation.mutate({
                  course_id: Number(newForm.course_id),
                  title: newForm.title,
                  meeting_url: newForm.meeting_url,
                  platform: newForm.platform,
                  description: newForm.description,
                });
              }}
              disabled={createMutation.isPending}
            >Créer</Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : !onlineClasses?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun cours en ligne programmé</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {onlineClasses.map((oc) => (
            <Card key={oc.id}>
              <CardContent className="p-4">
                {editingId === oc.id ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-4">
                      <Input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="Titre" className="h-9 text-sm" />
                      <Input value={editForm.meeting_url} onChange={e => setEditForm({ ...editForm, meeting_url: e.target.value })} placeholder="Lien" className="h-9 text-sm" />
                      <Input value={editForm.platform} onChange={e => setEditForm({ ...editForm, platform: e.target.value })} placeholder="Plateforme" className="h-9 text-sm" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateMutation.mutate({ id: oc.id, ...editForm })} disabled={updateMutation.isPending}>
                          {updateMutation.isPending ? '...' : 'Sauver'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Annuler</Button>
                      </div>
                    </div>
                    <Input value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description (optionnelle)" className="h-9 text-sm" />
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{oc.title}</p>
                        {oc.course && <span className="text-xs text-muted-foreground">· {oc.course.name}</span>}
                      </div>
                      {oc.meeting_url && (
                        <a href={oc.meeting_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                          {oc.meeting_url} <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {oc.platform && <p className="text-xs text-muted-foreground mt-0.5">{oc.platform}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={oc.meeting_url || '#'} target="_blank" rel="noopener noreferrer"
                        className="inline-flex h-8 items-center px-3 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        onClick={e => !oc.meeting_url && e.preventDefault()}
                        style={!oc.meeting_url ? { pointerEvents: 'none', opacity: 0.5 } as React.CSSProperties : {}}
                      >Rejoindre</a>
                      <button onClick={() => startEdit(oc)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
                      <button onClick={() => deleteMutation.mutate(oc.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4 text-red-500" /></button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
