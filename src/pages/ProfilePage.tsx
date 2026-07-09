import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getFullName, getRoleLabel } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Mail, Phone, Shield, UserCircle, Pencil, Check, Bell, Lock } from 'lucide-react';
import AvatarUpload from '@/components/AvatarUpload';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { profileSchema } from '@/lib/validation';
import { useUpdateUserSettings, useUpdatePassword } from '@/hooks/useMutationFeedback';
import { useErrorToast } from '@/hooks/useErrorToast';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const { lang } = useLang();
  const { toast } = useToast();
  const [photoPath, setPhotoPath] = useState<string | null | undefined>(profile?.photoUrl);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [lastName, setLastName] = useState(profile?.lastName ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [notifications, setNotifications] = useState({ email_notifications: true, push_notifications: true, sms_notifications: false });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateSettings = useUpdateUserSettings();
  const updatePasswordMutation = useUpdatePassword();

  const { data: userSettings, isError } = useQuery({
    queryKey: ['profile_settings', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return {};
      const { data } = await (supabase as any).from('users').select('email_notifications, push_notifications, sms_notifications').eq('id', profile.id).single();
      return data ?? {};
    },
    enabled: !!profile?.id,
  });
  useErrorToast(isError, lang, t('nav.profile', lang));

  useEffect(() => {
    if (!userSettings) return;
    setNotifications(prev => ({ ...prev, ...userSettings }));
  }, [userSettings]);

  const notifDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleNotifChange = (key: string, value: boolean) => {
    setNotifications(s => { const next = { ...s, [key]: value }; return next; });
    if (notifDebounce.current) clearTimeout(notifDebounce.current);
    notifDebounce.current = setTimeout(() => { updateSettings.mutate({ userId: profile?.id ?? '', settings: { [key]: value } }); }, 500);
  };

  useEffect(() => { return () => { if (notifDebounce.current) clearTimeout(notifDebounce.current); }; }, []);

  const validate = useCallback(() => {
    const result = profileSchema.safeParse({ firstName, lastName, email, phone: phone || undefined });
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
  }, [firstName, lastName, email, phone, lang]);

  const handleSave = useCallback(() => {
    if (!validate()) return;
    updateMutation.mutate();
  }, [validate]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (email !== profile?.email) {
        const { error: authErr } = await supabase.auth.updateUser({ email });
        if (authErr) throw authErr;
      }

      const { error } = await supabase.from('users').update({ first_name: firstName, last_name: lastName, email, phone: phone || null }).eq('id', profile!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast(t('success.updated', lang, 'Profil'), 'success'); setEditing(false); refreshProfile(); },
    onError: (err: any) => { toast(err?.message ?? t('errors.unknown', lang), 'error'); },
  });

  if (!profile) return <div className="p-8 text-center text-muted-foreground">{t('common.loading', lang)}</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.profile', lang)}</h1>
        <button onClick={() => editing ? handleSave() : setEditing(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {editing ? t('common.save', lang) : t('common.edit', lang)}
        </button>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-5">
          <AvatarUpload userId={profile.id} url={photoPath} name={getFullName(profile.firstName, profile.lastName)} size={80}
            onUpdate={(p) => { setPhotoPath(p); refreshProfile(); }} />
          <div>
            <h2 className="text-xl font-bold">{getFullName(profile.firstName, profile.lastName)}</h2>
            <p className="text-muted-foreground">{getRoleLabel(profile.role)}</p>
          </div>
        </div>
        <div className="space-y-4">
          {editing ? (
            <>
              <div className="rounded-lg bg-page p-3">
                <label className="mb-1 block text-xs text-muted-foreground">{t('common.first_name', lang)}</label>
                <Input value={firstName} onChange={e => { setFirstName(e.target.value.replace(/\d/g, '')); setTimeout(validate); }} className="h-9 bg-transparent border-0 p-0 shadow-none focus-visible:ring-0" />
                {fieldErrors.firstName && <p className="mt-1 text-xs text-red-500">{fieldErrors.firstName}</p>}
              </div>
              <div className="rounded-lg bg-page p-3">
                <label className="mb-1 block text-xs text-muted-foreground">{t('common.last_name', lang)}</label>
                <Input value={lastName} onChange={e => { setLastName(e.target.value.replace(/\d/g, '')); setTimeout(validate); }} className="h-9 bg-transparent border-0 p-0 shadow-none focus-visible:ring-0" />
                {fieldErrors.lastName && <p className="mt-1 text-xs text-red-500">{fieldErrors.lastName}</p>}
              </div>
              <div className="rounded-lg bg-page p-3">
                <label className="mb-1 block text-xs text-muted-foreground">{t('common.email', lang)}</label>
                <Input value={email} onChange={e => { setEmail(e.target.value); setTimeout(validate); }} className="h-9 bg-transparent border-0 p-0 shadow-none focus-visible:ring-0" />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
              </div>
              <div className="rounded-lg bg-page p-3">
                <label className="mb-1 block text-xs text-muted-foreground">{t('common.phone', lang)}</label>
                <Input value={phone} onChange={e => { setPhone(e.target.value); setTimeout(validate); }} placeholder={t('common.not_assigned', lang)} className="h-9 bg-transparent border-0 p-0 shadow-none focus-visible:ring-0" />
                {fieldErrors.phone && <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-lg bg-page p-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div><p className="text-sm text-muted-foreground">{t('common.email', lang)}</p><p className="font-medium">{profile.email}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-page p-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div><p className="text-sm text-muted-foreground">{t('common.phone', lang)}</p><p className="font-medium">{profile.phone || t('common.not_assigned', lang)}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-page p-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div><p className="text-sm text-muted-foreground">{t('common.type', lang)}</p><p className="font-medium">{getRoleLabel(profile.role)}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-page p-3">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <div><p className="text-sm text-muted-foreground">{t('common.status', lang)}</p><p className="font-medium">{profile.status}</p></div>
              </div>
            </>
          )}
        </div>
      </div>

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
              <Switch checked={(notifications as any)[n.key]} onCheckedChange={v => handleNotifChange(n.key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />{t('common.security', lang)}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground-foreground">{t('auth.password', lang)}</Label>
            <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="h-9" placeholder={t('common.current_password', lang)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground-foreground">{t('auth.new_password', lang)}</Label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-9" placeholder={t('auth.new_password', lang)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground-foreground">{t('auth.confirm_password', lang)}</Label>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-9" placeholder={t('common.confirm', lang)} />
          </div>
          <Button size="sm" className="h-9" onClick={() => {
            if (!currentPassword || !newPassword) { toast(t('common.required', lang), 'error'); return; }
            if (newPassword.length < 8) { toast(t('validation.min_length', lang, '8'), 'error'); return; }
            if (newPassword !== confirmPassword) { toast(t('validation.password_mismatch', lang), 'error'); return; }
            updatePasswordMutation.mutate({ currentPassword, newPassword, email: profile?.email });
          }} disabled={updatePasswordMutation.isPending}>
            {t('common.update', lang)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
