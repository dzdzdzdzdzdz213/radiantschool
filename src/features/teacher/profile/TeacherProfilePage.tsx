import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Camera, Mail, Phone, MapPin, BookOpen, Calendar, Award, Save, Star, Users, Bell, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { useUpdateUserSettings, useUpdatePassword } from '@/hooks/useMutationFeedback';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { teacherProfileSchema } from '@/lib/validation';

export default function TeacherProfilePage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { lang } = useLang();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '', bio: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState({ email_notifications: true, push_notifications: true, sms_notifications: false, homework_reminders: true, message_alerts: true, grade_alerts: false });
  const [visibility, setVisibility] = useState({ show_email: false, show_phone: true, show_schedule: true });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateSettings = useUpdateUserSettings();
  const updatePasswordMutation = useUpdatePassword();

  const validate = useCallback(() => {
    const result = teacherProfileSchema.safeParse({ firstName: form.first_name, lastName: form.last_name, email: form.email, phone: form.phone || undefined, bio: form.bio || undefined });
    if (result.success) { setFieldErrors({}); return true; }
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (errors[field]) continue;
      if (issue.code === 'too_small') errors[field] = t(issue.message, lang, String(issue.minimum));
      else if (issue.code === 'too_big') errors[field] = t(issue.message, lang, String(issue.maximum));
      else errors[field] = t(issue.message, lang);
    }
    setFieldErrors(errors);
    return false;
  }, [form, lang]);

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
      const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('teacher_id', profile.id);
      const { data: teacherCourseIds } = await supabase.from('courses').select('id').eq('teacher_id', profile.id);
      const studentCount = teacherCourseIds?.length
        ? (await supabase.from('course_enrollments').select('student_id', { count: 'exact', head: true }).in('course_id', teacherCourseIds.map((c) => c.id))).count ?? 0
        : 0;
      const { data: reviews } = await supabase.from('evaluations').select('average_score').eq('teacher_id', profile.id);
      const avgRating = reviews?.length ? (reviews.reduce((s: number, r: any) => s + (r.average_score ?? 0), 0) / reviews.length) : 0;
      return { courseCount: courseCount ?? 0, studentCount, avgRating };
    },
    enabled: !!profile?.id,
  });

  const yearsActive = useMemo(() => {
    if (!teacherProfile?.created_at) return 0;
    return Math.floor((Date.now() - new Date(teacherProfile.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }, [teacherProfile?.created_at]);

  const { data: userSettings } = useQuery({
    queryKey: ['teacher_settings', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return {};
      const { data } = await (supabase as any).from('users').select('email_notifications, push_notifications, sms_notifications, homework_reminders, message_alerts, grade_alerts, show_email, show_phone, show_schedule').eq('id', profile.id).single();
      return data ?? {};
    },
    enabled: !!profile?.id,
  });

  useEffect(() => {
    if (!userSettings) return;
    const { email_notifications, push_notifications, sms_notifications, homework_reminders, message_alerts, grade_alerts, show_email, show_phone, show_schedule } = userSettings as any;
    setNotifications(prev => ({ ...prev, email_notifications, push_notifications, sms_notifications, homework_reminders, message_alerts, grade_alerts }));
    setVisibility(prev => ({ ...prev, show_email, show_phone, show_schedule }));
  }, [userSettings]);

  const handleNotifChange = (key: string, value: boolean) => {
    setNotifications(s => { const next = { ...s, [key]: value }; if (profile?.id) updateSettings.mutate({ userId: profile.id, settings: { [key]: value } }); return next; });
  };

  const handleVisChange = (key: string, value: boolean) => {
    setVisibility(s => { const next = { ...s, [key]: value }; if (profile?.id) updateSettings.mutate({ userId: profile.id, settings: { [key]: value } }); return next; });
  };

  const handlePasswordUpdate = () => {
    if (!currentPassword) { toast(t('validation.required', lang), 'error'); return; }
    if (!newPassword) { toast(t('validation.required', lang), 'error'); return; }
    if (newPassword.length < 8) { toast(t('validation.min_length', lang, '8'), 'error'); return; }
    if (newPassword !== confirmPassword) { toast(t('validation.password_mismatch', lang), 'error'); return; }
    updatePasswordMutation.mutate({ currentPassword, newPassword, email: profile?.email });
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      if (!validate()) throw new Error('VALIDATION_FAILED');
      await (supabase as any).from('users').update({ first_name: form.first_name, last_name: form.last_name, phone: form.phone, address: form.address, bio: form.bio }).eq('id', profile.id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teacher_profile'] }); setEditing(false); toast(t('success.updated', lang, 'Profil'), 'success'); },
    onError: (err: any) => { if (err?.message !== 'VALIDATION_FAILED') toast(err?.message ?? t('common.error', lang), 'error'); },
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teacher_profile'] }); toast(t('success.updated', lang, 'Photo'), 'success'); },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) avatarMutation.mutate(e.target.files[0]); }} />
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.my_profile', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('common.description', lang)}</p></div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-6 text-center">
            {profileLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-5 w-32 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
                <div className="space-y-2 mt-4">{Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-4 w-full" />))}</div>
              </div>
            ) : (
              <>
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 mx-auto"><AvatarImage src={teacherProfile?.photo_url ?? ''} /><AvatarFallback className="text-lg bg-primary/10 text-primary">{getInitials(teacherProfile?.first_name ?? '', teacherProfile?.last_name ?? '')}</AvatarFallback></Avatar>
                  <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow" onClick={() => fileInputRef.current?.click()}><Camera className="h-3.5 w-3.5" /></button>
                </div>
                <h2 className="text-lg font-semibold mt-4">{teacherProfile?.first_name ?? ''} {teacherProfile?.last_name ?? ''}</h2>
                <p className="text-sm text-muted-foreground">{t('role.teacher', lang)}</p>
                <div className="flex justify-center gap-2 mt-3"><Badge variant="secondary" className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{t('role.teacher', lang)}</Badge></div>
                <div className="mt-4 space-y-2 text-left text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{teacherProfile?.email ?? ''}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{teacherProfile?.phone ?? t('common.none', lang)}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{teacherProfile?.address ?? t('common.none', lang)}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />Membre depuis {formatDate(teacherProfile?.created_at ?? new Date().toISOString())}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">{t('common.details', lang)}</CardTitle>
              <Button variant={editing ? 'default' : 'outline'} size="sm" className="h-8" onClick={() => { if (editing) updateMutation.mutate(); else setEditing(true); }} disabled={updateMutation.isPending}>
                {editing ? <><Save className="h-3.5 w-3.5 mr-1" />{updateMutation.isPending ? t('common.loading', lang) : t('common.save', lang)}</> : t('common.edit', lang)}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground mb-1 block">{t('common.first_name', lang)}</label><Input value={form.first_name} onChange={e => { setForm(f => ({ ...f, first_name: e.target.value })); setTimeout(validate); }} disabled={!editing} className="h-9" />{fieldErrors.firstName && <p className="mt-1 text-xs text-red-500">{fieldErrors.firstName}</p>}</div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{t('common.last_name', lang)}</label><Input value={form.last_name} onChange={e => { setForm(f => ({ ...f, last_name: e.target.value })); setTimeout(validate); }} disabled={!editing} className="h-9" />{fieldErrors.lastName && <p className="mt-1 text-xs text-red-500">{fieldErrors.lastName}</p>}</div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{t('common.phone', lang)}</label><Input value={form.phone} onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setTimeout(validate); }} disabled={!editing} className="h-9" />{fieldErrors.phone && <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>}</div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{t('common.address', lang)}</label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} disabled={!editing} className="h-9" /></div>
                <div className="sm:col-span-2"><label className="text-xs text-muted-foreground mb-1 block">{t('common.notes', lang)}</label><textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} disabled={!editing} className="w-full min-h-[80px] rounded-xl border border-border bg-background px-3 py-2 text-sm" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">{t('common.details', lang)}</CardTitle></CardHeader>
            <CardContent><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-xl bg-accent/50"><Award className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-lg font-bold">{yearsActive}</p><p className="text-xs text-muted-foreground">{'Années d\'expérience'}</p></div>
              <div className="text-center p-3 rounded-xl bg-accent/50"><BookOpen className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-lg font-bold">{stats?.courseCount ?? 0}</p><p className="text-xs text-muted-foreground">{t('dashboard.stat.courses', lang)}</p></div>
              <div className="text-center p-3 rounded-xl bg-accent/50"><Star className="h-5 w-5 mx-auto text-amber-500 mb-1" /><p className="text-lg font-bold">{stats?.avgRating?.toFixed(1) ?? '0.0'}</p><p className="text-xs text-muted-foreground">{t('dashboard.stat.avg_rating', lang)}</p></div>
              <div className="text-center p-3 rounded-xl bg-accent/50"><Users className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-lg font-bold">{stats?.studentCount ?? 0}</p><p className="text-xs text-muted-foreground">{t('dashboard.stat.active_students', lang)}</p></div>
            </div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" />{t('nav.notifications', lang)}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'email_notifications', label: t('common.email', lang) },
                { key: 'push_notifications', label: t('nav.notifications', lang) },
                { key: 'sms_notifications', label: `${t('common.email', lang)} ${t('settings.sms_suffix', lang)}` },
                { key: 'homework_reminders', label: t('nav.homework', lang) },
                { key: 'message_alerts', label: t('nav.messages', lang) },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{n.label}</p>
                  <Switch checked={(notifications as any)[n.key]} onCheckedChange={v => handleNotifChange(n.key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" />Visibilité</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'show_email', label: t('common.email', lang) },
                { key: 'show_phone', label: t('common.phone', lang) },
                { key: 'show_schedule', label: t('nav.schedule', lang) },
              ].map(v => (
                <div key={v.key} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{v.label}</p>
                  <Switch checked={(visibility as any)[v.key]} onCheckedChange={val => handleVisChange(v.key, val)} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />Sécurité</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-accent/50 p-3">
                <span className="text-sm font-medium">{t('settings.language', lang)}</span>
                <span className="text-sm">{t('settings.french', lang)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-accent/50 p-3">
                <span className="text-sm font-medium">{t('common.time', lang)}</span>
                <span className="text-sm">{t('settings.timezone_algiers', lang)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('auth.password', lang)}</Label>
                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="h-9" placeholder="Mot de passe actuel" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('auth.new_password', lang)}</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-9" placeholder="Nouveau mot de passe" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('auth.confirm_password', lang)}</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-9" placeholder="Confirmer" />
              </div>
              <Button size="sm" className="h-9" onClick={handlePasswordUpdate} disabled={updatePasswordMutation.isPending || !currentPassword || !newPassword || newPassword !== confirmPassword}>
                {updatePasswordMutation.isPending ? t('common.loading', lang) : t('common.update', lang)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function formatDate(d: string) { try { return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return d; } }
