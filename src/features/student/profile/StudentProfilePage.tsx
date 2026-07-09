import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Calendar, BookOpen, Award, Save, User, Shield, Loader, Bell, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';
import { uploadAvatar } from '@/lib/storage';
import { useToast } from '@/components/ui/Toast';
import { useUpdateUserSettings, useUpdatePassword } from '@/hooks/useMutationFeedback';
import { profileSchema } from '@/lib/validation';

const studentFormSchema = profileSchema.pick({ firstName: true, lastName: true, phone: true });

export default function StudentProfilePage() {
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const { profile } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', address: '', bio: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [notifications, setNotifications] = useState({ email_notifications: true, push_notifications: true, sms_notifications: false, homework_reminders: true, message_alerts: true, payment_reminders: true, announcement_alerts: true, grade_alerts: false });
  const [privacy, setPrivacy] = useState({ show_profile: true, show_attendance: true, show_courses: false });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateSettings = useUpdateUserSettings();
  const updatePasswordMutation = useUpdatePassword();

  const validate = useCallback(() => {
    const result = studentFormSchema.safeParse({ firstName: form.first_name, lastName: form.last_name, phone: form.phone || undefined });
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

  const { data: studentProfile, isLoading, isError } = useQuery({
    queryKey: ['student_profile', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { data } = await (supabase as any).from('users').select('*, students!inner(*)').eq('id', profile.id).single();
      return data;
    },
    enabled: !!profile?.id,
  });

  const { data: userSettings, isError: settingsError } = useQuery({
    queryKey: ['student_settings', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return {};
      const { data } = await (supabase as any).from('users').select('email_notifications, push_notifications, sms_notifications, homework_reminders, message_alerts, payment_reminders, announcement_alerts, grade_alerts, show_profile, show_attendance, show_courses, language, timezone, theme').eq('id', profile.id).single();
      return data ?? {};
    },
    enabled: !!profile?.id,
  });
  useErrorToast(settingsError, lang, t('nav.profile', lang));

  useErrorToast(isError, lang, t('nav.profile', lang));

  useEffect(() => {
    if (!userSettings) return;
    setNotifications(prev => ({ ...prev, ...userSettings }));
    setPrivacy(prev => ({ ...prev, ...userSettings }));
  }, [userSettings]);

  useEffect(() => {
    if (!studentProfile) return;
    setForm({ first_name: studentProfile.first_name ?? '', last_name: studentProfile.last_name ?? '', phone: studentProfile.phone ?? '', address: studentProfile.address ?? '', bio: studentProfile.bio ?? '' });
  }, [studentProfile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      if (!validate()) throw new Error('VALIDATION_FAILED');
      const { error } = await (supabase as any).from('users').update({ first_name: form.first_name, last_name: form.last_name, phone: form.phone, address: form.address }).eq('id', profile.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student_profile'] }); setEditing(false); toast(t('success.updated', lang, t('nav.profile', lang)), 'success'); },
    onError: (err: any) => { if (err?.message !== 'VALIDATION_FAILED') toast(err?.message ?? t('errors.update_error', lang, t('nav.profile', lang)), 'error'); },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    setUploadingAvatar(true);
    try {
      await uploadAvatar(profile.id, file);
      qc.invalidateQueries({ queryKey: ['student_profile'] });
      toast(t('success.updated', lang, t('nav.profile', lang)), 'success');
    } catch (err: any) {
      toast(err?.message ?? t('errors.update_error', lang, t('nav.profile', lang)), 'error');
    } finally { setUploadingAvatar(false); }
  };

  const notifDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateSetting = (key: string, value: unknown) => {
    setNotifications(s => ({ ...s, [key]: value }));
    if (notifDebounce.current) clearTimeout(notifDebounce.current);
    notifDebounce.current = setTimeout(() => {
      updateSettings.mutate(
        { userId: profile?.id ?? '', settings: { [key]: value } },
        { onSuccess: () => qc.invalidateQueries({ queryKey: ['student_settings', profile?.id] }) },
      );
    }, 500);
  };

  const privacyDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updatePrivacySetting = (key: string, value: unknown) => {
    setPrivacy(s => ({ ...s, [key]: value }));
    if (privacyDebounce.current) clearTimeout(privacyDebounce.current);
    privacyDebounce.current = setTimeout(() => {
      updateSettings.mutate(
        { userId: profile?.id ?? '', settings: { [key]: value } },
        { onSuccess: () => qc.invalidateQueries({ queryKey: ['student_settings', profile?.id] }) },
      );
    }, 500);
  };

  useEffect(() => { return () => { if (notifDebounce.current) clearTimeout(notifDebounce.current); if (privacyDebounce.current) clearTimeout(privacyDebounce.current); }; }, []);

  if (isLoading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-48 rounded-2xl" />))}</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.profile', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('common.description', lang)}</p></div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
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
            <p className="text-sm text-muted-foreground">{t('role.student', lang)}</p>
            {studentProfile?.students?.registration_number && (
              <Badge variant="outline" className="mt-2 text-[10px] font-mono">{studentProfile.students.registration_number}</Badge>
            )}
            <Separator className="my-4" />
            <div className="space-y-2 text-left text-sm">
              <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{studentProfile?.email ?? ''}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{studentProfile?.phone ?? t('common.not_found', lang)}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{studentProfile?.address ?? t('common.not_found', lang)}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{t('common.date', lang)}: {new Date(studentProfile?.created_at ?? Date.now()).toLocaleDateString(localeMap[lang])}</p>
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm"><User className="h-4 w-4 inline mr-2" />{t('common.info', lang)}</CardTitle>
              <Button variant={editing ? 'default' : 'outline'} size="sm" className="h-8" onClick={() => { if (editing) updateMutation.mutate(); else setEditing(true); }} disabled={updateMutation.isPending}>
                {editing ? <>{updateMutation.isPending ? <Loader className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}{t('common.save', lang)}</> : t('common.edit', lang)}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground mb-1 block">{t('common.first_name', lang)}</label><Input value={form.first_name} onChange={e => { setForm(f => ({ ...f, first_name: e.target.value })); setTimeout(validate); }} disabled={!editing} className="h-9" />{fieldErrors.firstName && <p className="mt-1 text-xs text-red-500">{fieldErrors.firstName}</p>}</div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{t('common.last_name', lang)}</label><Input value={form.last_name} onChange={e => { setForm(f => ({ ...f, last_name: e.target.value })); setTimeout(validate); }} disabled={!editing} className="h-9" />{fieldErrors.lastName && <p className="mt-1 text-xs text-red-500">{fieldErrors.lastName}</p>}</div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{t('common.phone', lang)}</label><Input value={form.phone} onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setTimeout(validate); }} disabled={!editing} className="h-9" />{fieldErrors.phone && <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>}</div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{t('common.address', lang)}</label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} disabled={!editing} className="h-9" /></div>
                <div className="sm:col-span-2"><label className="text-xs text-muted-foreground mb-1 block">{t('common.description', lang)}</label><Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} disabled={!editing} className="min-h-[80px]" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm"><Award className="h-4 w-4 inline mr-2" />{t('dashboard.stat.evaluations', lang)}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { labelKey: 'nav.my_courses', value: 0, icon: BookOpen },
                  { labelKey: 'nav.attendance', value: '0%', icon: Shield },
                  { labelKey: 'nav.certificates', value: 0, icon: Award },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-accent/50">
                    <stat.icon className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{t(stat.labelKey, lang)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" />{t('nav.notifications', lang)}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'email_notifications', label: t('common.email', lang) },
                { key: 'push_notifications', label: t('nav.notifications', lang) },
                { key: 'sms_notifications', label: `${t('common.email', lang)} ${t('settings.sms_suffix', lang)}` },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{n.label}</p>
                  <Switch checked={(notifications as any)[n.key]} onCheckedChange={v => updateSetting(n.key, v)} />
                </div>
              ))}
              <div className="h-px bg-border" />
              {[
                { key: 'homework_reminders', label: t('nav.homework', lang) },
                { key: 'message_alerts', label: t('nav.messages', lang) },
                { key: 'payment_reminders', label: t('nav.payments', lang) },
                { key: 'announcement_alerts', label: t('nav.announcements', lang) },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{n.label}</p>
                  <Switch checked={(notifications as any)[n.key]} onCheckedChange={v => updateSetting(n.key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" />{t('settings.visibility', lang)}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'show_profile', label: t('nav.profile', lang) },
                { key: 'show_attendance', label: t('nav.attendance', lang) },
                { key: 'show_courses', label: t('nav.courses', lang) },
              ].map(p => (
                <div key={p.key} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{p.label}</p>
                  <Switch checked={(privacy as any)[p.key]} onCheckedChange={v => updatePrivacySetting(p.key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />{t('common.security', lang)}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('auth.password', lang)}</Label>
                <Input type="password" className="h-9" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder={t('common.current_password', lang)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('auth.new_password', lang)}</Label>
                <Input type="password" className="h-9" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('auth.new_password', lang)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('auth.confirm_password', lang)}</Label>
                <Input type="password" className="h-9" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={t('common.confirm', lang)} />
              </div>
              <Button size="sm" className="h-9" onClick={() => {
                if (newPassword !== confirmPassword) { toast(t('auth.confirm_password', lang), 'error'); return; }
                if (!currentPassword || !newPassword) { toast(t('common.required', lang), 'error'); return; }
                updatePasswordMutation.mutate({ currentPassword, newPassword, email: profile?.email });
              }} disabled={updatePasswordMutation.isPending}>
                {updatePasswordMutation.isPending ? <Loader className="h-4 w-4 mr-1 animate-spin" /> : null}{t('auth.reset_password', lang)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
