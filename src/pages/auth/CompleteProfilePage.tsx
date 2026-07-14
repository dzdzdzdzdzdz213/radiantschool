import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Phone, Users, GraduationCap, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, isLoading, refreshProfile } = useAuth();

  const [role, setRole] = useState<'student' | 'parent' | ''>('');
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [child, setChild] = useState({ first_name: '', last_name: '', level: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    if (profile) { navigate(`/${profile.role}/dashboard`, { replace: true }); return; }
    const name = user.user_metadata?.full_name || user.user_metadata?.name || '';
    const parts = name.split(' ');
    setForm({
      first_name: user.user_metadata?.first_name || parts[0] || '',
      last_name: user.user_metadata?.last_name || parts.slice(1).join(' ') || '',
      phone: '',
    });
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !form.first_name.trim() || !form.last_name.trim()) {
      toast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    setSaving(true);
    try {
      const { error: rpcErr } = await supabase.rpc('register_user', {
        p_id: user!.id,
        p_email: user!.email || '',
        p_first_name: form.first_name.trim(),
        p_last_name: form.last_name.trim(),
        p_role: role,
        p_status: role === 'student' ? 'active' : 'pending',
        p_phone: form.phone || null,
      });
      if (rpcErr) throw rpcErr;

      if (role === 'parent' && child.first_name.trim()) {
        const { error: childErr } = await supabase.rpc('register_child', {
          p_parent_id: user!.id,
          p_first_name: child.first_name.trim(),
          p_last_name: child.last_name.trim() || '',
          p_level_category: child.level || '',
        });
        if (childErr) {
          try { await supabase.rpc('unregister_user', { p_id: user!.id }); } catch { /* best-effort rollback */ }
          throw new Error("Échec de la création du profil enfant");
        }
      }

      if (user?.user_metadata?.avatar_url) {
        await supabase.from('users').update({ photo_url: user.user_metadata.avatar_url }).eq('id', user.id);
      }

      await refreshProfile();
      toast('Profil complété avec succès', 'success');
      navigate(role === 'student' ? '/student/dashboard' : '/parent/dashboard');
    } catch (err: any) {
      toast(err?.message || 'Erreur lors de la création du profil', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Retour à l'accueil
        </button>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black">Finalisez votre inscription</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Choisissez votre rôle et complétez vos informations</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border p-8 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <UserCheck className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              Qui êtes-vous ?
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button type="button" onClick={() => setRole('parent')}
                className={`rounded-xl p-4 text-center transition-all border-2 ${role === 'parent' ? 'border-primary' : 'border-border'}`}
                style={{ backgroundColor: role === 'parent' ? 'var(--primary-light)' : 'var(--bg)' }}>
                <Users className="h-6 w-6 mx-auto mb-1" style={{ color: 'var(--primary)' }} />
                <p className="text-sm font-semibold">Parent / Tuteur</p>
              </button>
              <button type="button" onClick={() => setRole('student')}
                className={`rounded-xl p-4 text-center transition-all border-2 ${role === 'student' ? 'border-amber-400' : 'border-border'}`}
                style={{ backgroundColor: role === 'student' ? 'rgba(251,191,36,0.1)' : 'var(--bg)' }}>
                <GraduationCap className="h-6 w-6 mx-auto mb-1" style={{ color: '#f59e0b' }} />
                <p className="text-sm font-semibold">Élève</p>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <UserCheck className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              Vos informations
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Prénom <span style={{ color: '#ef4444' }}>*</span></label>
                <Input value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value.replace(/[^a-zA-Z\u00C0-\u024F\s-]/g, '') }))} required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nom <span style={{ color: '#ef4444' }}>*</span></label>
                <Input value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value.replace(/[^a-zA-Z\u00C0-\u024F\s-]/g, '') }))} required />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                Téléphone
              </label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} placeholder="05XX XX XX XX" maxLength={10} />
            </div>
          </div>

          {role === 'parent' && (
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" style={{ color: '#f59e0b' }} />
                Enfant à inscrire (optionnel)
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <Input value={child.first_name} onChange={e => setChild(p => ({ ...p, first_name: e.target.value }))} placeholder="Prénom de l'enfant" />
                <Input value={child.last_name} onChange={e => setChild(p => ({ ...p, last_name: e.target.value }))} placeholder="Nom de l'enfant" />
              </div>
              <Select value={child.level} onValueChange={v => setChild(p => ({ ...p, level: v }))}>
                <SelectItem value="">Niveau scolaire</SelectItem>
                <SelectItem value="primary">Primaire</SelectItem>
                <SelectItem value="middle">CEM / Moyen</SelectItem>
                <SelectItem value="high_school">Lycée / Secondaire</SelectItem>
              </Select>
            </div>
          )}

          <Button type="submit" disabled={saving || !role} className="w-full">
            {saving && <Loader className="h-4 w-4 animate-spin" />}
            Confirmer et continuer
          </Button>
        </form>
      </div>
    </div>
  );
}
