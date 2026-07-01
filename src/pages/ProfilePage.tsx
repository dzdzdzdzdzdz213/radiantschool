import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getFullName, getRoleLabel } from '@/lib/utils';
import { Mail, Phone, Shield, UserCircle } from 'lucide-react';
import AvatarUpload from '@/components/AvatarUpload';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [photoPath, setPhotoPath] = useState<string | null | undefined>(profile?.photoUrl);

  if (!profile) return <div className="p-8 text-center text-muted">Chargement...</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Mon Profil</h1>
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
          <div className="flex items-center gap-3 rounded-lg bg-page p-3">
            <Mail className="h-5 w-5 text-muted" />
            <div><p className="text-sm text-muted">Email</p><p className="font-medium">{profile.email}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-page p-3">
            <Phone className="h-5 w-5 text-muted" />
            <div><p className="text-sm text-muted">Téléphone</p><p className="font-medium">{profile.phone || 'Non renseigné'}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-page p-3">
            <Shield className="h-5 w-5 text-muted" />
            <div><p className="text-sm text-muted">Rôle</p><p className="font-medium">{getRoleLabel(profile.role)}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-page p-3">
            <UserCircle className="h-5 w-5 text-muted" />
            <div><p className="text-sm text-muted">Statut</p><p className="font-medium">{profile.status}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
