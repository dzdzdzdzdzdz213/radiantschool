import { useState, useEffect } from 'react';
import { Bell, Globe, Lock, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateUserSettings, useUpdatePassword } from '@/hooks/useMutationFeedback';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function TeacherSettingsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { lang } = useLang();
  const [notifications, setNotifications] = useState({ email_notifications: true, push_notifications: true, sms_notifications: false, homework_reminders: true, message_alerts: true, grade_alerts: false });
  const [visibility, setVisibility] = useState({ show_email: false, show_phone: true, show_schedule: true });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateSettings = useUpdateUserSettings();
  const updatePassword = useUpdatePassword();

  const { data: userSettings } = useQuery({
    queryKey: ['teacher_settings', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return {};
      const { data } = await (supabase as any)
        .from('users')
        .select('email_notifications, push_notifications, sms_notifications, homework_reminders, message_alerts, grade_alerts, show_email, show_phone, show_schedule')
        .eq('id', profile.id)
        .single();
      return data ?? {};
    },
    enabled: !!profile?.id,
  });

  useEffect(() => {
    if (!userSettings) return;
    setNotifications(prev => ({ ...prev, ...userSettings }));
    setVisibility(prev => ({ ...prev, ...userSettings }));
  }, [userSettings]);

  const handleNotifChange = (key: string, value: boolean) => {
    setNotifications(s => {
      const next = { ...s, [key]: value };
      if (profile?.id) updateSettings.mutate({ userId: profile.id, settings: { [key]: value } });
      return next;
    });
  };

  const handleVisChange = (key: string, value: boolean) => {
    setVisibility(s => {
      const next = { ...s, [key]: value };
      if (profile?.id) updateSettings.mutate({ userId: profile.id, settings: { [key]: value } });
      return next;
    });
  };

  const handlePasswordUpdate = () => {
    if (!currentPassword) { toast(t('validation.required', lang), 'error'); return; }
    if (!newPassword) { toast(t('validation.required', lang), 'error'); return; }
    if (newPassword.length < 6) { toast(t('validation.min_length', lang, '6'), 'error'); return; }
    if (newPassword !== confirmPassword) { toast(t('validation.password_mismatch', lang), 'error'); return; }
    updatePassword.mutate({ currentPassword, newPassword, email: profile?.email });
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  const handleSave = () => {
    if (!profile?.id) return;
    updateSettings.mutate({ userId: profile.id, settings: { ...notifications, ...visibility } });
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.settings', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('common.description', lang)}</p></div>
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" />{t('dashboard.notifications', lang)}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'email_notifications', label: t('common.email', lang), desc: 'Notifications par email' },
              { key: 'push_notifications', label: 'Notifications push', desc: 'Notifications push' },
              { key: 'sms_notifications', label: 'Notifications SMS', desc: 'Notifications SMS' },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                <Switch checked={(notifications as any)[n.key]} onCheckedChange={v => handleNotifChange(n.key, v)} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" />{'Visibilité du profil'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'show_email', label: t('common.email', lang), desc: 'Visible par les élèves' },
              { key: 'show_phone', label: t('common.phone', lang), desc: 'Visible par les élèves' },
              { key: 'show_schedule', label: t('nav.schedule', lang), desc: 'Visible par les parents' },
            ].map(v => (
              <div key={v.key} className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{v.label}</p><p className="text-xs text-muted-foreground">{v.desc}</p></div>
                <Switch checked={(visibility as any)[v.key]} onCheckedChange={val => handleVisChange(v.key, val)} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />{'Sécurité'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="text-xs text-muted-foreground">{t('auth.password', lang)}</Label><Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="h-9 mt-1" /></div>
            <div><Label className="text-xs text-muted-foreground">{t('auth.new_password', lang)}</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-9 mt-1" /></div>
            <div><Label className="text-xs text-muted-foreground">{t('auth.confirm_password', lang)}</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-9 mt-1" /></div>
            <Button size="sm" className="h-9" onClick={handlePasswordUpdate} disabled={updatePassword.isPending || !currentPassword || !newPassword || newPassword !== confirmPassword}>
              {updatePassword.isPending ? t('common.loading', lang) : t('common.update', lang)}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />{'Préférences'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{'Langue'}</p><p className="text-xs text-muted-foreground">{'Français (par défaut)'}</p></div>
              <Button variant="outline" size="sm" className="h-8">{t('common.edit', lang)}</Button>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{'Fuseau horaire'}</p><p className="text-xs text-muted-foreground">{'Africa/Algiers (UTC+1)'}</p></div>
              <Button variant="outline" size="sm" className="h-8">{t('common.edit', lang)}</Button>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button className="h-9 gap-2" onClick={handleSave} disabled={updateSettings.isPending}>
            <Save className="h-4 w-4" />{updateSettings.isPending ? t('common.loading', lang) : t('common.save', lang)}
          </Button>
        </div>
      </div>
    </div>
  );
}
