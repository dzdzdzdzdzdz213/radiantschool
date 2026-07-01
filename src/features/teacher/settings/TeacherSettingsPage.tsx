import { useState } from 'react';
import { Bell, Shield, Globe, Palette, Lock, Moon, Smartphone, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function TeacherSettingsPage() {
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false, homework: true, messages: true, grades: false });
  const [visibility, setVisibility] = useState({ showEmail: false, showPhone: true, showSchedule: true });
  const [saving, setSaving] = useState(false);

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
                <Switch checked={(notifications as any)[n.key]} onCheckedChange={v => setNotifications(s => ({ ...s, [n.key]: v }))} />
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
                <Switch checked={(visibility as any)[v.key]} onCheckedChange={val => setVisibility(s => ({ ...s, [v.key]: val }))} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />Sécurité</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="text-xs text-muted-foreground">Mot de passe actuel</Label><Input type="password" className="h-9 mt-1" /></div>
            <div><Label className="text-xs text-muted-foreground">Nouveau mot de passe</Label><Input type="password" className="h-9 mt-1" /></div>
            <div><Label className="text-xs text-muted-foreground">Confirmer le mot de passe</Label><Input type="password" className="h-9 mt-1" /></div>
            <Button size="sm" className="h-9">Mettre à jour le mot de passe</Button>
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
        <div className="flex justify-end"><Button className="h-9 gap-2" onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 1000); }}><Save className="h-4 w-4" />{saving ? 'Enregistré' : 'Enregistrer'}</Button></div>
      </div>
    </div>
  );
}