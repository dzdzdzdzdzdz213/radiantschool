import { useState } from 'react';
import { Bell, Shield, Globe, Lock, Moon, Eye, Save, Smartphone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectItem } from '@/components/ui/select';

export default function StudentSettingsPage() {
  const [notifications, setNotifications] = useState({ email_notifications: true, push_notifications: true, sms_notifications: false, homework_reminders: true, message_alerts: true, payment_reminders: true, announcement_alerts: true, grade_alerts: false });
  const [privacy, setPrivacy] = useState({ show_profile: true, show_attendance: true, show_courses: false });
  const [saving, setSaving] = useState(false);

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
                <Switch checked={(notifications as any)[n.key]} onCheckedChange={v => setNotifications(s => ({ ...s, [n.key]: v }))} />
              </div>
            ))}
            <Separator />
            {[
              { key: 'homework_reminders', label: 'Rappels de devoirs', icon: Mail },
              { key: 'message_alerts', label: 'Alertes messages', icon: MessageSquare },
              { key: 'payment_reminders', label: 'Rappels de paiement', icon: Bell },
              { key: 'announcement_alerts', label: 'Annonces du centre', icon: Bell },
              { key: 'grade_alerts', label: 'Nouvelles notes', icon: Bell },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><n.icon className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">{n.label}</p></div></div>
                <Switch checked={(notifications as any)[n.key]} onCheckedChange={v => setNotifications(s => ({ ...s, [n.key]: v }))} />
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
                <Switch checked={(privacy as any)[p.key]} onCheckedChange={v => setPrivacy(s => ({ ...s, [p.key]: v }))} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />Sécurité</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="text-xs text-muted-foreground">Mot de passe actuel</Label><Input type="password" className="h-9 mt-1" /></div>
            <div><Label className="text-xs text-muted-foreground">Nouveau mot de passe</Label><Input type="password" className="h-9 mt-1" /></div>
            <div><Label className="text-xs text-muted-foreground">Confirmer</Label><Input type="password" className="h-9 mt-1" /></div>
            <Button size="sm" className="h-9">Modifier le mot de passe</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />Préférences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Langue</p><p className="text-xs text-muted-foreground">Français</p></div><Button variant="outline" size="sm" className="h-8">Modifier</Button></div>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Fuseau horaire</p><p className="text-xs text-muted-foreground">Africa/Algiers (UTC+1)</p></div><Button variant="outline" size="sm" className="h-8">Modifier</Button></div>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Thème</p><p className="text-xs text-muted-foreground">Système</p></div><Button variant="outline" size="sm" className="h-8">Modifier</Button></div>
          </CardContent>
        </Card>
        <div className="flex justify-end"><Button className="h-9 gap-2" onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 1500); }}><Save className="h-4 w-4" />{saving ? 'Enregistré' : 'Enregistrer'}</Button></div>
      </div>
    </div>
  );
}

function Separator() { return <div className="h-px bg-border" />; }