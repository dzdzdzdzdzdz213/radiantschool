import { useState, useRef } from 'react';
import { Camera, Mail, Phone, MapPin, BookOpen, Calendar, Award, Save, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function TeacherProfilePage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '', bio: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: teacherProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['teacher_profile', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { data } = await (supabase as any).from('users').select('*').eq('id', profile.id).single();
      if (data) setForm({ first_name: data.first_name ?? '', last_name: data.last_name ?? '', email: data.email ?? '', phone: data.phone ?? '', address: data.address ?? '', bio: data.bio ?? '' });
      return data;
    },
    enabled: !!profile?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['teacher_profile_stats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { count: courseCount } = await (supabase as any).from('courses').select('*', { count: 'exact', head: true }).eq('teacher_id', profile.id);
      const { data: enrollments } = await (supabase as any).from('course_enrollments').select('student_id', { count: 'exact', head: true }).eq('course.teacher_id', profile.id);
      const { data: reviews } = await (supabase as any).from('evaluations').select('overall_rating').eq('teacher_id', profile.id);
      const avgRating = reviews?.length ? (reviews.reduce((s: number, r: any) => s + (r.overall_rating ?? 0), 0) / reviews.length) : 0;
      const yearsActive = teacherProfile?.created_at ? Math.floor((Date.now() - new Date(teacherProfile.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
      return { courseCount: courseCount ?? 0, studentCount: enrollments?.length ?? 0, avgRating, yearsActive };
    },
    enabled: !!profile?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      if (!form.first_name.trim() || !form.last_name.trim()) throw new Error('Le prénom et le nom sont requis');
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) throw new Error('Format d\'email invalide');
      await (supabase as any).from('users').update({ first_name: form.first_name, last_name: form.last_name, phone: form.phone, address: form.address, bio: form.bio }).eq('id', profile.id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teacher_profile'] }); setEditing(false); toast('Profil mis à jour', 'success'); },
    onError: (err: any) => toast(err?.message ?? 'Erreur', 'error'),
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!profile?.id) return;
      const filePath = `avatars/${profile.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await (supabase as any).storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = (supabase as any).storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await (supabase as any).from('users').update({ photo_url: urlData.publicUrl }).eq('id', profile.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teacher_profile'] }); toast('Photo mise à jour', 'success'); },
    onError: (err: any) => toast(err?.message ?? 'Erreur', 'error'),
  });

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) avatarMutation.mutate(e.target.files[0]); }} />
      <div><h1 className="text-2xl font-bold tracking-tight">Mon profil</h1><p className="text-sm text-muted-foreground mt-1">Gérer vos informations personnelles</p></div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            {profileLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-5 w-32 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
                <div className="space-y-2 mt-4">
                  {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-4 w-full" />))}
                </div>
              </div>
            ) : (
              <>
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 mx-auto"><AvatarImage src={teacherProfile?.photo_url ?? ''} /><AvatarFallback className="text-lg bg-primary/10 text-primary">{getInitials(teacherProfile?.first_name ?? '', teacherProfile?.last_name ?? '')}</AvatarFallback></Avatar>
                  <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow" onClick={() => fileInputRef.current?.click()}><Camera className="h-3.5 w-3.5" /></button>
                </div>
                <h2 className="text-lg font-semibold mt-4">{teacherProfile?.first_name ?? ''} {teacherProfile?.last_name ?? ''}</h2>
                <p className="text-sm text-muted-foreground">Professeur</p>
                <div className="flex justify-center gap-2 mt-3">
                  <Badge variant="secondary" className="flex items-center gap-1"><BookOpen className="h-3 w-3" />Enseignant</Badge>
                </div>
                <div className="mt-4 space-y-2 text-left text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{teacherProfile?.email ?? ''}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{teacherProfile?.phone ?? 'Non renseigné'}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{teacherProfile?.address ?? 'Non renseigné'}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />Membre depuis {formatDate(teacherProfile?.created_at ?? new Date().toISOString())}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Informations</CardTitle><Button variant={editing ? 'default' : 'outline'} size="sm" className="h-8" onClick={() => { if (editing) updateMutation.mutate(); else setEditing(true); }} disabled={updateMutation.isPending}>{editing ? <><Save className="h-3.5 w-3.5 mr-1" />{updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}</> : 'Modifier'}</Button></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground mb-1 block">Prénom</label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} disabled={!editing} className="h-9" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Nom</label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} disabled={!editing} className="h-9" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Téléphone</label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={!editing} className="h-9" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Adresse</label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} disabled={!editing} className="h-9" /></div>
                <div className="sm:col-span-2"><label className="text-xs text-muted-foreground mb-1 block">Bio</label><textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} disabled={!editing} className="w-full min-h-[80px] rounded-xl border border-border bg-background px-3 py-2 text-sm" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Statistiques</CardTitle></CardHeader>
            <CardContent><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-xl bg-accent/50"><Award className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-lg font-bold">{stats?.yearsActive ?? 0}</p><p className="text-xs text-muted-foreground">Années d'expérience</p></div>
              <div className="text-center p-3 rounded-xl bg-accent/50"><BookOpen className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-lg font-bold">{stats?.courseCount ?? 0}</p><p className="text-xs text-muted-foreground">Cours donnés</p></div>
              <div className="text-center p-3 rounded-xl bg-accent/50"><Star className="h-5 w-5 mx-auto text-amber-500 mb-1" /><p className="text-lg font-bold">{stats?.avgRating?.toFixed(1) ?? '0.0'}</p><p className="text-xs text-muted-foreground">Note moyenne</p></div>
              <div className="text-center p-3 rounded-xl bg-accent/50"><Users className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-lg font-bold">{stats?.studentCount ?? 0}</p><p className="text-xs text-muted-foreground">Élèves</p></div>
            </div></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function formatDate(d: string) { try { return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return d; } }
