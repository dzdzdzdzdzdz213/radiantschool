import { useState } from 'react';
import { Bell, Shield, Globe, Palette, Lock, Moon, Smartphone, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateUserSettings, useUpdatePassword } from '@/hooks/useMutationFeedback';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/Toast';

export default function TeacherSettingsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false, homework: true, messages: true, grades: false });
  const [visibility, setVisibility] = useState({ showEmail: false, showPhone: true, showSchedule: true });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateSettings = useUpdateUserSettings();
  const updatePassword = useUpdatePassword();

  const debouncedNotif = useDebounce(notifications, 500);
  const debouncedVis = useDebounce(visibility, 500);

  const handleNotifChange = (key: string, value: boolean) => {
    setNotifications(s => {
      const next = { ...s, [key]: value };
      if (profile?.id) updateSettings.mutate({ userId: profile.id, settings: { [`notifications_${key}`]: value } });
      return next;
    });
  };

  const handleVisChange = (key: string, value: boolean) => {
    setVisibility(s => {
      const next = { ...s, [key]: value };
      if (profile?.id) updateSettings.mutate({ userId: profile.id, settings: { [`visibility_${key}`]: value } });
      return next;
    });
  };

  const handlePasswordUpdate = () => {
    if (!currentPassword) { toast('Veuillez entrer votre mot de passe actuel', 'error'); return; }
    if (!newPassword) { toast('Veuillez entrer un nouveau mot de passe', 'error'); return; }
    if (newPassword.length < 6) { toast('Le mot de passe doit contenir au moins 6 caractères', 'error'); return; }
    if (newPassword !== confirmPassword) { toast('Les mots de passe ne correspondent pas', 'error'); return; }
    updatePassword.mutate({ currentPassword, newPassword });
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  const handleSave = () => {
    if (!profile?.id) return;
    updateSettings.mutate({ userId: profile.id, settings: { ...notifications, ...visibility } });
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Paramètres</h1><p className="text-sm text-muted-foreground mt-1">Gérer vos préférences et configuration</p></div>
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" />Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'email', label: 'Notifications par email', desc: 'Recevoir les mises à jour par email' },
              { key: 'push', label: 'Notifications push', desc: 'Notifications sur votre appareil' },
              { key: 'sms', label: 'Notifications SMS', desc: 'Alertes par message texte' },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                <Switch checked={(notifications as any)[n.key]} onCheckedChange={v => handleNotifChange(n.key, v)} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" />Visibilité du profil</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'showEmail', label: 'Afficher l\'email', desc: 'Visible par les élèves' },
              { key: 'showPhone', label: 'Afficher le téléphone', desc: 'Visible par les élèves' },
              { key: 'showSchedule', label: 'Afficher l\'emploi du temps', desc: 'Visible par les parents' },
            ].map(v => (
              <div key={v.key} className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{v.label}</p><p className="text-xs text-muted-foreground">{v.desc}</p></div>
                <Switch checked={(visibility as any)[v.key]} onCheckedChange={val => handleVisChange(v.key, val)} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />Sécurité</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="text-xs text-muted-foreground">Mot de passe actuel</Label><Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="h-9 mt-1" /></div>
            <div><Label className="text-xs text-muted-foreground">Nouveau mot de passe</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-9 mt-1" /></div>
            <div><Label className="text-xs text-muted-foreground">Confirmer le mot de passe</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-9 mt-1" /></div>
            <Button size="sm" className="h-9" onClick={handlePasswordUpdate} disabled={updatePassword.isPending || !currentPassword || !newPassword || newPassword !== confirmPassword}>
              {updatePassword.isPending ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />Préférences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Langue</p><p className="text-xs text-muted-foreground">Français (par défaut)</p></div>
              <Button variant="outline" size="sm" className="h-8">Modifier</Button>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Fuseau horaire</p><p className="text-xs text-muted-foreground">Africa/Algiers (UTC+1)</p></div>
              <Button variant="outline" size="sm" className="h-8">Modifier</Button>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button className="h-9 gap-2" onClick={handleSave} disabled={updateSettings.isPending}>
            <Save className="h-4 w-4" />{updateSettings.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
