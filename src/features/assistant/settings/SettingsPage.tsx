import { useState, useEffect, useRef } from 'react';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateUserSettings } from '@/hooks/useMutationFeedback';
import { useToast } from '@/hooks/useToast';
const settingsSections = [
  { id: 'profile', labelKey: 'nav.profile', icon: User },
  { id: 'notifications', labelKey: 'nav.notifications', icon: Bell },
] as const;

export default function SettingsPage() {
  const { toast } = useToast();
  const { profile, refreshProfile } = useAuth();
  const [section, setSection] = useState('profile');
  const { lang } = useLang();
  const updateSettings = useUpdateUserSettings();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [notifPrefs, setNotifPrefs] = useState({ inscriptions: true, payments: true, absences: true, rfid: false });

  const notifTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      setEmail(profile.email ?? '');
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  const handleSave = () => {
    if (!profile?.id) return;
    updateSettings.mutate(
      { userId: profile.id, settings: { first_name: firstName, last_name: lastName, email, phone } },
      {
        onSuccess: () => { refreshProfile(); },
        onError: (err) => toast(err?.message ?? t('errors.update_error', lang, t('settings.profile', lang)), 'error'),
      },
    );
  };

  const handleNotifChange = (key: string, value: boolean) => {
    setNotifPrefs(s => ({ ...s, [key]: value }));
    if (notifTimers.current[key]) clearTimeout(notifTimers.current[key]);
    notifTimers.current[key] = setTimeout(() => {
      if (profile?.id) {
        updateSettings.mutate(
          { userId: profile.id, settings: { [`notif_${key}`]: value } },
          { onError: (err) => toast(err?.message ?? t('common.error', lang), 'error') },
        );
      }
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.settings', lang)}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('settings.subtitle', lang)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-1">
          {settingsSections.map(s => (
            <button
              key={s.id}
              className={`w-full text-left rounded-xl p-3 transition-colors flex items-center gap-3 ${section === s.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent'}`}
              onClick={() => setSection(s.id)}
            >
              <s.icon className="h-4 w-4" />
              <span className="text-sm">{t(s.labelKey, lang)}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {section === 'profile' && (
            <Card>
              <CardHeader><CardTitle className="text-sm">{t('settings.profile_info', lang)}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('common.first_name', lang)}</Label>
                    <Input placeholder={t('common.first_name', lang)} value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.last_name', lang)}</Label>
                    <Input placeholder={t('common.last_name', lang)} value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.email', lang)}</Label>
                  <Input type="email" placeholder="email@exemple.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.phone', lang)}</Label>
                  <Input placeholder="+213 5XX XX XX XX" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={updateSettings.isPending}>{updateSettings.isPending ? t('common.loading', lang) : t('common.save', lang)}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {section === 'notifications' && (
            <Card>
              <CardHeader><CardTitle className="text-sm">{t('settings.notif_prefs', lang)}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'inscriptions', label: t('settings.notif_inscriptions', lang), desc: t('settings.notif_inscriptions_desc', lang) },
                  { key: 'payments', label: t('settings.notif_payments', lang), desc: t('settings.notif_payments_desc', lang) },
                  { key: 'absences', label: t('settings.notif_absences', lang), desc: t('settings.notif_absences_desc', lang) },
                  { key: 'rfid', label: t('settings.notif_rfid', lang), desc: t('settings.notif_rfid_desc', lang) },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={notifPrefs[item.key as keyof typeof notifPrefs]} onCheckedChange={v => handleNotifChange(item.key, v)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}


        </div>
      </div>
    </div>
  );
}
