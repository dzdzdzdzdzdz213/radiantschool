import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useToast } from '@/hooks/useToast';
import { useErrorToast } from '@/hooks/useErrorToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader } from 'lucide-react';

type EditableUser = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
};

export default function EditUserPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [form, setForm] = useState<EditableUser | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isLoading, isError } = useQuery({
    queryKey: ['user-edit', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('User not found');
      const u = data as unknown as EditableUser;
      setForm({ first_name: u.first_name ?? '', last_name: u.last_name ?? '', email: u.email ?? '', phone: u.phone ?? '', role: u.role ?? '', status: u.status ?? '' });
      return data;
    },
    enabled: !!id,
  });
  useErrorToast(isError, lang, t('nav.users', lang));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form) return false;
    if (!form.first_name.trim()) errs.firstName = 'Le prénom est requis';
    if (!form.last_name.trim()) errs.lastName = 'Le nom est requis';
    if (/[0-9]/.test(form.first_name)) errs.firstName = 'Le prénom ne peut pas contenir de chiffres';
    if (/[0-9]/.test(form.last_name)) errs.lastName = 'Le nom ne peut pas contenir de chiffres';
    if (!form.email.trim()) errs.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Email invalide';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!validate() || !form) throw new Error('VALIDATION_FAILED');
      const { error } = await supabase.from('users').update({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || null,
        role: form.role as never,
        status: form.status as never,
      }).eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast(t('success.updated', lang, 'Utilisateur'), 'success');
      qc.invalidateQueries({ queryKey: ['users-paginated'] });
      qc.invalidateQueries({ queryKey: ['users'] });
      navigate('/admin/users');
    },
    onError: (err: Error) => { if (err?.message !== 'VALIDATION_FAILED') toast(err?.message ?? t('common.error', lang), 'error'); },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!form) {
    return (
      <div className="space-y-6 max-w-lg">
        <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        <h1 className="text-2xl font-bold">{t('common.error', lang)}</h1>
      </div>
    );
  }

  const set = (patch: Partial<EditableUser>) => setForm(f => (f ? { ...f, ...patch } : f));

  return (
    <div className="space-y-6 max-w-lg">
      <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <h1 className="text-2xl font-bold">{t('common.edit', lang)} — {form.first_name} {form.last_name}</h1>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Prénom *</Label>
              <Input value={form.first_name} onChange={e => { set({ first_name: e.target.value.replace(/[0-9]/g, '') }); setErrors(e => ({ ...e, firstName: '' })); }} className="h-9" />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nom *</Label>
              <Input value={form.last_name} onChange={e => { set({ last_name: e.target.value.replace(/[0-9]/g, '') }); setErrors(e => ({ ...e, lastName: '' })); }} className="h-9" />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Email *</Label>
            <Input type="email" value={form.email} onChange={e => { set({ email: e.target.value }); setErrors(e => ({ ...e, email: '' })); }} className="h-9" />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Téléphone</Label>
            <Input value={form.phone ?? ''} onChange={e => set({ phone: e.target.value })} className="h-9" placeholder="+213 5 55 55 55 55" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Rôle *</Label>
            <Select value={form.role} onValueChange={v => set({ role: v })} placeholder="Sélectionner un rôle">
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="assistant">Assistant</SelectItem>
              <SelectItem value="teacher">Enseignant</SelectItem>
              <SelectItem value="student">Élève</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Statut *</Label>
            <Select value={form.status} onValueChange={v => set({ status: v })} placeholder="Sélectionner un statut">
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </Select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" className="h-9" onClick={() => navigate('/admin/users')}>Annuler</Button>
            <Button size="sm" className="h-9" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : null}
              {t('common.save', lang)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}