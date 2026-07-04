import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getFullName, getRoleLabel } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Mail, Phone, Shield, UserCircle, Pencil, Check } from 'lucide-react';
import AvatarUpload from '@/components/AvatarUpload';
import { useToast } from '@/components/ui/Toast';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const { lang } = useLang();
  const { toast } = useToast();
  const [photoPath, setPhotoPath] = useState<string | null | undefined>(profile?.photoUrl);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [lastName, setLastName] = useState(profile?.lastName ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('users').update({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
      }).eq('id', profile!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast(t('success.updated', lang, 'Profil'), 'success');
      setEditing(false);
      refreshProfile();
    },
    onError: (err: any) => toast(err?.message ?? t('errors.unknown', lang), 'error'),
  });

  if (!profile) return <div className="p-8 text-center text-muted">{t('common.loading', lang)}</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.profile', lang)}</h1>
        <button
          onClick={() => editing ? updateMutation.mutate() : setEditing(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {editing ? t('common.save', lang) : t('common.edit', lang)}
        </button>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-5">
          <AvatarUpload
            userId={profile.id}
            url={photoPath}
            name={getFullName(profile.firstName, profile.lastName)}
            size={80}
            onUpdate={(p) => { setPhotoPath(p); refreshProfile(); }}
          />
          <div>
            <h2 className="text-xl font-bold">{getFullName(profile.firstName, profile.lastName)}</h2>
            <p className="text-muted">{getRoleLabel(profile.role)}</p>
          </div>
        </div>
        <div className="space-y-4">
          {editing ? (
            <>
              <div className="rounded-lg bg-page p-3">
                <label className="mb-1 block text-xs text-muted">{t('common.first_name', lang)}</label>
                <input className="w-full bg-transparent text-sm font-medium outline-none" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="rounded-lg bg-page p-3">
                <label className="mb-1 block text-xs text-muted">{t('common.last_name', lang)}</label>
                <input className="w-full bg-transparent text-sm font-medium outline-none" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <div className="rounded-lg bg-page p-3">
                <label className="mb-1 block text-xs text-muted">{t('common.email', lang)}</label>
                <input className="w-full bg-transparent text-sm font-medium outline-none" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="rounded-lg bg-page p-3">
                <label className="mb-1 block text-xs text-muted">{t('common.phone', lang)}</label>
                <input className="w-full bg-transparent text-sm font-medium outline-none" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Non renseigné" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-lg bg-page p-3">
                <Mail className="h-5 w-5 text-muted" />
                <div><p className="text-sm text-muted">{t('common.email', lang)}</p><p className="font-medium">{profile.email}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-page p-3">
                <Phone className="h-5 w-5 text-muted" />
                <div><p className="text-sm text-muted">{t('common.phone', lang)}</p><p className="font-medium">{profile.phone || 'Non renseigné'}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-page p-3">
                <Shield className="h-5 w-5 text-muted" />
                <div><p className="text-sm text-muted">{t('common.type', lang)}</p><p className="font-medium">{getRoleLabel(profile.role)}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-page p-3">
                <UserCircle className="h-5 w-5 text-muted" />
                <div><p className="text-sm text-muted">{t('common.status', lang)}</p><p className="font-medium">{profile.status}</p></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
