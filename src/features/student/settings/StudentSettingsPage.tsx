import { useState, useEffect, useRef } from 'react';
import { Bell, Shield, Globe, Lock, Moon, Eye, Save, Smartphone, Mail, MessageSquare, ChevronDown, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectItem } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { useUpdateUserSettings, useUpdatePassword } from '@/hooks/useMutationFeedback';

const LANGUAGES = ['Français', 'English', 'العربية'];
const TIMEZONES = ['Africa/Algiers (UTC+1)', 'Europe/Paris (UTC+1)', 'Africa/Casablanca (UTC+0)'];
const THEMES = ['Système', 'Clair', 'Sombre'];

export default function StudentSettingsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({ email_notifications: true, push_notifications: true, sms_notifications: false, homework_reminders: true, message_alerts: true, payment_reminders: true, announcement_alerts: true, grade_alerts: false });
  const [privacy, setPrivacy] = useState({ show_profile: true, show_attendance: true, show_courses: false });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState('Français');
  const [timezone, setTimezone] = useState('Africa/Algiers (UTC+1)');
  const [theme, setTheme] = useState('Système');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const notifDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const privacyDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: userSettings, isError: settingsError } = useQuery({
    queryKey: ['student_settings', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return {};
      const { data } = await (supabase as any)
        .from('users')
        .select('email_notifications, push_notifications, sms_notifications, homework_reminders, message_alerts, payment_reminders, announcement_alerts, grade_alerts, show_profile, show_attendance, show_courses, language, timezone, theme')
        .eq('id', profile.id)
        .single();
      return data ?? {};
    },
    enabled: !!profile?.id,
  });

  useEffect(() => { if (settingsError) toast('Erreur lors du chargement des paramètres', 'error'); }, [settingsError]);

  useEffect(() => {
    if (!userSettings) return;
    setNotifications(prev => ({ ...prev, ...userSettings }));
    setPrivacy(prev => ({ ...prev, ...userSettings }));
    if (userSettings.language) setLanguage(userSettings.language);
    if (userSettings.timezone) setTimezone(userSettings.timezone);
    if (userSettings.theme) setTheme(userSettings.theme);
  }, [userSettings]);

  const updateSettings = useUpdateUserSettings();
  const updatePassword = useUpdatePassword();

  const updateSetting = (key: string, value: unknown) => {
    setNotifications(s => ({ ...s, [key]: value }));
    if (notifDebounce.current) clearTimeout(notifDebounce.current);
    notifDebounce.current = setTimeout(() => {
      updateSettings.mutate({ userId: profile?.id ?? '', settings: { [key]: value } });
    }, 500);
  };

  const updatePrivacy = (key: string, value: unknown) => {
    setPrivacy(s => ({ ...s, [key]: value }));
    if (privacyDebounce.current) clearTimeout(privacyDebounce.current);
    privacyDebounce.current = setTimeout(() => {
      updateSettings.mutate({ userId: profile?.id ?? '', settings: { [key]: value } });
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (notifDebounce.current) clearTimeout(notifDebounce.current);
      if (privacyDebounce.current) clearTimeout(privacyDebounce.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Paramètres</h1><p className="text-sm text-muted-foreground mt-1">Gérez vos préférences</p></div>
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" />Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'email_notifications', label: 'Notifications par email', desc: 'Recevoir les mises à jour par email' },
              { key: 'push_notifications', label: 'Notifications push', desc: 'Alertes sur votre appareil' },
              { key: 'sms_notifications', label: 'Notifications SMS', desc: 'Alertes par SMS' },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                <Switch checked={(notifications as any)[n.key]} onCheckedChange={v => updateSetting(n.key, v)} />
              </div>
            ))}
            <div className="h-px bg-border" />
            {[
              { key: 'homework_reminders', label: 'Rappels de devoirs', icon: Mail },
              { key: 'message_alerts', label: 'Alertes messages', icon: MessageSquare },
              { key: 'payment_reminders', label: 'Rappels de paiement', icon: Bell },
              { key: 'announcement_alerts', label: 'Annonces du centre', icon: Bell },
              { key: 'grade_alerts', label: 'Nouvelles notes', icon: Bell },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><n.icon className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">{n.label}</p></div></div>
                <Switch checked={(notifications as any)[n.key]} onCheckedChange={v => updateSetting(n.key, v)} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" />Confidentialité</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'show_profile', label: 'Profil visible', desc: 'Visible par les autres élèves' },
              { key: 'show_attendance', label: 'Présences visibles', desc: 'Visible par les parents' },
              { key: 'show_courses', label: 'Cours visibles', desc: 'Visible sur votre profil' },
            ].map(p => (
              <div key={p.key} className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{p.label}</p><p className="text-xs text-muted-foreground">{p.desc}</p></div>
                <Switch checked={(privacy as any)[p.key]} onCheckedChange={v => updatePrivacy(p.key, v)} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />Sécurité</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="text-xs text-muted-foreground">Mot de passe actuel</Label><Input type="password" className="h-9 mt-1" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></div>
            <div><Label className="text-xs text-muted-foreground">Nouveau mot de passe</Label><Input type="password" className="h-9 mt-1" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
            <div><Label className="text-xs text-muted-foreground">Confirmer</Label><Input type="password" className="h-9 mt-1" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
            <Button size="sm" className="h-9" onClick={() => {
              if (newPassword !== confirmPassword) { toast('Les mots de passe ne correspondent pas', 'error'); return; }
              if (!currentPassword || !newPassword) { toast('Veuillez remplir tous les champs', 'error'); return; }
              updatePassword.mutate({ currentPassword, newPassword });
            }} disabled={updatePassword.isPending}>
              {updatePassword.isPending ? <Loader className="h-4 w-4 mr-1 animate-spin" /> : null}Modifier le mot de passe
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />Préférences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Langue</p><p className="text-xs text-muted-foreground">{language}</p></div>
              <div className="relative">
                <Button variant="outline" size="sm" className="h-8" onClick={() => setOpenDropdown(openDropdown === 'language' ? null : 'language')}>Modifier</Button>
                {openDropdown === 'language' && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl border border-border bg-popover p-1 shadow-md">
                    {LANGUAGES.map(l => (
                      <button key={l} className="w-full text-left rounded-lg px-2 py-1.5 text-sm hover:bg-accent" onClick={() => { setLanguage(l); setOpenDropdown(null); updateSettings.mutate({ userId: profile?.id ?? '', settings: { language: l } }); }}>{l}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Fuseau horaire</p><p className="text-xs text-muted-foreground">{timezone}</p></div>
              <div className="relative">
                <Button variant="outline" size="sm" className="h-8" onClick={() => setOpenDropdown(openDropdown === 'timezone' ? null : 'timezone')}>Modifier</Button>
                {openDropdown === 'timezone' && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl border border-border bg-popover p-1 shadow-md">
                    {TIMEZONES.map(t => (
                      <button key={t} className="w-full text-left rounded-lg px-2 py-1.5 text-sm hover:bg-accent" onClick={() => { setTimezone(t); setOpenDropdown(null); updateSettings.mutate({ userId: profile?.id ?? '', settings: { timezone: t } }); }}>{t}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Thème</p><p className="text-xs text-muted-foreground">{theme}</p></div>
              <div className="relative">
                <Button variant="outline" size="sm" className="h-8" onClick={() => setOpenDropdown(openDropdown === 'theme' ? null : 'theme')}>Modifier</Button>
                {openDropdown === 'theme' && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl border border-border bg-popover p-1 shadow-md">
                    {THEMES.map(t => (
                      <button key={t} className="w-full text-left rounded-lg px-2 py-1.5 text-sm hover:bg-accent" onClick={() => { setTheme(t); setOpenDropdown(null); updateSettings.mutate({ userId: profile?.id ?? '', settings: { theme: t } }); }}>{t}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
