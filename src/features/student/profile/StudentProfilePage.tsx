import { useState, useRef, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Calendar, BookOpen, Award, Save, User, Shield, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';
import { uploadAvatar } from '@/lib/storage';
import { useToast } from '@/components/ui/Toast';

export default function StudentProfilePage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', address: '', bio: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { data: studentProfile, isLoading, isError } = useQuery({
    queryKey: ['student_profile', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { data } = await (supabase as any)
        .from('users')
        .select('*, students!inner(*)')
        .eq('id', profile.id)
        .single();
      if (data) setForm({ first_name: data.first_name ?? '', last_name: data.last_name ?? '', phone: data.phone ?? '', address: data.address ?? '', bio: data.bio ?? '' });
      return data;
    },
    enabled: !!profile?.id,
  });

  useEffect(() => { if (isError) toast('Erreur lors du chargement du profil', 'error'); }, [isError]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      const { error } = await (supabase as any).from('users').update({ first_name: form.first_name, last_name: form.last_name, phone: form.phone, address: form.address, bio: form.bio }).eq('id', profile.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student_profile'] }); setEditing(false); toast('Profil mis à jour', 'success'); },
    onError: (err: any) => { toast(err?.message ?? 'Erreur lors de la mise à jour', 'error'); },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    setUploadingAvatar(true);
    try {
      await uploadAvatar(profile.id, file);
      qc.invalidateQueries({ queryKey: ['student_profile'] });
      toast('Photo mise à jour', 'success');
    } catch (err: any) {
      toast(err?.message ?? 'Erreur lors du téléchargement', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (isLoading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-48 rounded-2xl" />))}</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Mon profil</h1><p className="text-sm text-muted-foreground mt-1">Gérez vos informations personnelles</p></div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src={studentProfile?.photo_url ?? ''} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">{getInitials(studentProfile?.first_name ?? '', studentProfile?.last_name ?? '')}</AvatarFallback>
              </Avatar>
              {uploadingAvatar && <div className="absolute inset-0 flex items-center justify-center"><Loader className="h-6 w-6 animate-spin text-primary" /></div>}
              <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg" onClick={() => fileInputRef.current?.click()}><Camera className="h-3.5 w-3.5" /></button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <h2 className="text-lg font-semibold mt-4">{studentProfile?.first_name ?? ''} {studentProfile?.last_name ?? ''}</h2>
            <p className="text-sm text-muted-foreground">Élève</p>
            {studentProfile?.students?.registration_number && (
              <Badge variant="outline" className="mt-2 text-[10px] font-mono">{studentProfile.students.registration_number}</Badge>
            )}
            <Separator className="my-4" />
            <div className="space-y-2 text-left text-sm">
              <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{studentProfile?.email ?? ''}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{studentProfile?.phone ?? 'Non renseigné'}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{studentProfile?.address ?? 'Non renseigné'}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />Membre depuis le {new Date(studentProfile?.created_at ?? Date.now()).toLocaleDateString('fr-FR')}</p>
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm"><User className="h-4 w-4 inline mr-2" />Informations</CardTitle><Button variant={editing ? 'default' : 'outline'} size="sm" className="h-8" onClick={() => { if (editing) { if (!form.first_name.trim() || !form.last_name.trim()) { toast('Le prénom et le nom sont requis', 'error'); return; } updateMutation.mutate(); } else setEditing(true); }} disabled={updateMutation.isPending}>{editing ? <>{updateMutation.isPending ? <Loader className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}Enregistrer</> : 'Modifier'}</Button></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground mb-1 block">Prénom</label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} disabled={!editing} className="h-9" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Nom</label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} disabled={!editing} className="h-9" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Téléphone</label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={!editing} className="h-9" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Adresse</label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} disabled={!editing} className="h-9" /></div>
                <div className="sm:col-span-2"><label className="text-xs text-muted-foreground mb-1 block">Bio</label><textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} disabled={!editing} className="w-full min-h-[80px] rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm"><Award className="h-4 w-4 inline mr-2" />Statistiques</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Cours suivis', value: studentProfile?.students?.total_courses ?? 0, icon: BookOpen },
                  { label: 'Présences', value: `${studentProfile?.students?.attendance_rate ?? 0}%`, icon: Shield },
                  { label: 'Certificats', value: studentProfile?.students?.certificates_count ?? 0, icon: Award },
                  { label: 'Moyenne', value: `${studentProfile?.students?.average_grade ?? '-'}/20`, icon: Award },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-accent/50">
                    <stat.icon className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}