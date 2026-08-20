import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Loader } from 'lucide-react';

export default function InvitePage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const errs: Record<string, string> = {};
      if (!password || password.length < 8) errs.password = 'Le mot de passe doit contenir au moins 8 caractères';
      if (confirm !== password) errs.confirm = 'Les mots de passe ne correspondent pas';
      setErrors(errs);
      if (Object.keys(errs).length > 0) throw new Error('VALIDATION_FAILED');
      if (!token) throw new Error('Lien d\'invitation invalide');

      const { data, error } = await supabase.functions.invoke('accept-invite', {
        body: { token, password },
      });
      if (error) throw new Error(error.message ?? 'Erreur lors de l\'activation');
      if (!data?.success) throw new Error(data?.error ?? 'Erreur lors de l\'activation');
      return data;
    },
    onSuccess: (data) => {
      toast(`Bienvenue ${data.first_name} ${data.last_name} ! Votre compte est activé.`, 'success');
      navigate('/login');
    },
    onError: (err: Error) => { if (err?.message !== 'VALIDATION_FAILED') toast(err?.message ?? 'Erreur', 'error'); },
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <GraduationCap className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-xl font-bold">Lien d'invitation invalide</h1>
            <p className="text-sm text-muted-foreground">Ce lien est invalide ou incomplet. Vérifiez l'email que vous avez reçu.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Activer mon compte</h1>
            <p className="text-sm text-muted-foreground">Radiant Academy vous a invité. Choisissez votre mot de passe pour activer votre compte.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Mot de passe *</Label>
              <Input type="password" value={password} onChange={e => { setPassword(e.target.value); setErrors(e => ({ ...e, password: '' })); }} className="h-10" placeholder="Min. 8 caractères" />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Confirmer le mot de passe *</Label>
              <Input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setErrors(e => ({ ...e, confirm: '' })); }} className="h-10" placeholder="Répéter le mot de passe" />
              {errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
            </div>
            <Button className="w-full h-10" disabled={acceptMutation.isPending} onClick={() => acceptMutation.mutate()}>
              {acceptMutation.isPending ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
              Activer mon compte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}