import { useState } from 'react';
import { Lock, Bell, Save, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useUpdatePassword } from '@/hooks/useMutationFeedback';
import { useToast } from '@/components/ui/Toast';

export default function TeacherSettingsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const updatePassword = useUpdatePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifications, setNotifications] = useState({
    email_new_student: true,
    email_lesson_reminder: true,
    email_payment_notification: false,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    if (profile?.email) {
      updatePassword.mutate(
        { currentPassword, newPassword, email: profile.email },
        { onSuccess: () => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); } }
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Gérer votre mot de passe et vos préférences</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" /> Mot de passe</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label>Mot de passe actuel</Label>
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </div>
            <div>
              <Label>Nouveau mot de passe</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <Label>Confirmer le mot de passe</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" disabled={updatePassword.isPending}>
              {updatePassword.isPending && <Loader className="h-4 w-4 animate-spin" />}
              Modifier le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {([
            { key: 'email_new_student', label: 'Nouvel élève inscrit' },
            { key: 'email_lesson_reminder', label: 'Rappel de cours' },
            { key: 'email_payment_notification', label: 'Notification de paiement' },
          ] as const).map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <Switch checked={notifications[key]} onCheckedChange={v => setNotifications(p => ({ ...p, [key]: v }))} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
