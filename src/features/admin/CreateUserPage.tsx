import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useToast } from '@/hooks/useToast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader } from 'lucide-react';

export default function CreateUserPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'Le prénom est requis';
    if (!lastName.trim()) errs.lastName = 'Le nom est requis';
    if (/[0-9]/.test(firstName)) errs.firstName = 'Le prénom ne peut pas contenir de chiffres';
    if (/[0-9]/.test(lastName)) errs.lastName = 'Le nom ne peut pas contenir de chiffres';
    if (!email.trim()) errs.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Email invalide";
    if (!password || password.length < 8) errs.password = 'Le mot de passe doit contenir au moins 8 caractères';
    if (!role) errs.role = 'Le rôle est requis';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const qc = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('VALIDATION_FAILED');
      const { data: { session: prevSession } } = await supabase.auth.getSession();
      const { data: signUpResponse, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName, role } },
      });
      if (signUpError) throw signUpError;
      if (signUpResponse?.session && prevSession) {
        await supabase.auth.setSession({ access_token: prevSession.access_token, refresh_token: prevSession.refresh_token });
      }
      if (signUpResponse?.user) {
        const { error: rpcError } = await supabase.rpc('register_user', {
          p_id: signUpResponse.user.id, p_email: email, p_first_name: firstName, p_last_name: lastName,
          p_role: role, p_status: 'pending', p_phone: undefined,
        });
        if (rpcError) {
          const msg = rpcError.hint || rpcError.message || 'Erreur lors de la création du profil';
          throw new Error(msg);
        }
      }
    },
    onSuccess: () => {
      toast('Compte créé avec succès', 'success');
      qc.invalidateQueries({ queryKey: ['users'] });
      navigate('/admin/users');
    },
    onError: (err: Error) => { if (err?.message !== 'VALIDATION_FAILED') toast(err?.message ?? t('common.error', lang), 'error'); },
  });

  return (
    <div className="space-y-6 max-w-lg">
      <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <h1 className="text-2xl font-bold">Nouvel utilisateur</h1>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Prénom *</Label>
              <Input value={firstName} onChange={e => { setFirstName(e.target.value.replace(/[0-9]/g, '')); setErrors(e => ({ ...e, firstName: '' })); }} className="h-9" />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nom *</Label>
              <Input value={lastName} onChange={e => { setLastName(e.target.value.replace(/[0-9]/g, '')); setErrors(e => ({ ...e, lastName: '' })); }} className="h-9" />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Email *</Label>
            <Input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(e => ({ ...e, email: '' })); }} className="h-9" />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Mot de passe *</Label>
            <Input type="password" value={password} onChange={e => { setPassword(e.target.value); setErrors(e => ({ ...e, password: '' })); }} className="h-9" placeholder="Min. 8 caractères" />
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Rôle *</Label>
            <Select value={role} onValueChange={v => { setRole(v); setErrors(e => ({ ...e, role: '' })); }} placeholder="Sélectionner un rôle">
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="assistant">Assistant</SelectItem>
              <SelectItem value="teacher">Enseignant</SelectItem>
              <SelectItem value="student">Élève</SelectItem>
            </Select>
            {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" className="h-9" onClick={() => navigate('/admin/users')}>Annuler</Button>
            <Button size="sm" className="h-9" disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
              {createMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : null}
              Créer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
