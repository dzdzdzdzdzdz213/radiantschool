import { useState, useEffect, useRef } from 'react';
import { Bell, Globe, Palette, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';
import { useLang } from '@/contexts/LangContext';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateUserSettings } from '@/hooks/useMutationFeedback';
import { useToast } from '@/components/ui/Toast';

const settingsSections = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Apparence', icon: Palette },
  { id: 'language', label: 'Langue', icon: Globe },
] as const;

export default function SettingsPage() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [section, setSection] = useState('profile');
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
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
        onError: (err: any) => toast(err?.message ?? 'Erreur lors de la mise à jour', 'error'),
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
          { onError: (err: any) => toast(err?.message ?? 'Erreur', 'error') },
        );
      }
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">Préférences de l'assistant</p>
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
              <span className="text-sm">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {section === 'profile' && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Informations du profil</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input placeholder="Votre prénom" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input placeholder="Votre nom" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="email@exemple.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="+213 5XX XX XX XX" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={updateSettings.isPending}>{updateSettings.isPending ? 'Enregistrement...' : 'Enregistrer'}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {section === 'notifications' && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Préférences de notification</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'inscriptions', label: 'Nouvelles inscriptions', desc: 'Notifications pour les inscriptions en attente' },
                  { key: 'payments', label: 'Paiements reçus', desc: 'Alertes lors des nouveaux paiements' },
                  { key: 'absences', label: 'Absences signalées', desc: 'Notifications pour les absences' },
                  { key: 'rfid', label: 'Scans RFID', desc: 'Alertes pour les échecs de scan RFID' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={(notifPrefs as any)[item.key]} onCheckedChange={v => handleNotifChange(item.key, v)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {section === 'appearance' && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Apparence</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-accent/50 p-4">
                  <div>
                    <p className="text-sm font-medium">Thème sombre</p>
                    <p className="text-xs text-muted-foreground">Basculer entre le mode clair et sombre</p>
                  </div>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>
              </CardContent>
            </Card>
          )}

          {section === 'language' && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Langue</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { code: 'fr', label: 'Français', flag: '🇫🇷' },
                  { code: 'en', label: 'English', flag: '🇬🇧' },
                  { code: 'ar', label: 'العربية', flag: '🇩🇿' },
                ].map(l => (
                  <button
                    key={l.code}
                    className={`w-full text-left rounded-xl p-3 transition-colors flex items-center gap-3 ${lang === l.code ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent'}`}
                    onClick={() => setLang(l.code as any)}
                  >
                    <span className="text-lg">{l.flag}</span>
                    <span className="text-sm">{l.label}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
