import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getFullName, getRoleLabel } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Mail, Phone, Shield, UserCircle, Pencil, Check, Bell, Lock, UserPlus, Camera } from 'lucide-react';
import AvatarUpload from '@/components/AvatarUpload';
import { useToast } from '@/hooks/useToast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { profileSchema } from '@/lib/validation';
import { useUpdateUserSettings, useUpdatePassword } from '@/hooks/useMutationFeedback';
import { useErrorToast } from '@/hooks/useErrorToast';
import { motion } from 'framer-motion';

const ROLE_COLORS: Record<string, string> = {
  student: 'from-blue-500 to-blue-600',
  teacher: 'from-violet-500 to-violet-600',
  admin: 'from-amber-500 to-orange-500',
  assistant: 'from-emerald-500 to-emerald-600',
  parent: 'from-pink-500 to-pink-600',
};

const ROLE_BG: Record<string, string> = {
  student: 'bg-blue-500/10 text-blue-600',
  teacher: 'bg-violet-500/10 text-violet-600',
  admin: 'bg-amber-500/10 text-amber-600',
  assistant: 'bg-emerald-500/10 text-emerald-600',
  parent: 'bg-pink-500/10 text-pink-600',
};

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const { lang } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [photoPath, setPhotoPath] = useState<string | null | undefined>(profile?.photoUrl);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [lastName, setLastName] = useState(profile?.lastName ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [notifications, setNotifications] = useState({ email_notifications: true, push_notifications: true, sms_notifications: false });
  const [acceptsPrivateLessons, setAcceptsPrivateLessons] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateSettings = useUpdateUserSettings();
  const updatePasswordMutation = useUpdatePassword();

  const { data: userSettings, isError } = useQuery({
    queryKey: ['profile_settings', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return {};
      const { data } = await supabase.from('users').select('email_notifications, push_notifications, sms_notifications, accepts_private_lessons').eq('id', profile.id).single();
      return data ?? {};
    },
    enabled: !!profile?.id,
  });
  useErrorToast(isError, lang, t('nav.profile', lang));

  useEffect(() => {
    if (!userSettings) return;
    setNotifications(prev => ({ ...prev, ...userSettings }));
    if (typeof (userSettings as any).accepts_private_lessons === 'boolean') setAcceptsPrivateLessons((userSettings as any).accepts_private_lessons);
  }, [userSettings]);

  const notifDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleNotifChange = (key: string, value: boolean) => {
    setNotifications(s => { const next = { ...s, [key]: value }; return next; });
    if (notifDebounce.current) clearTimeout(notifDebounce.current);
    notifDebounce.current = setTimeout(() => { updateSettings.mutate({ userId: profile?.id ?? '', settings: { [key]: value } }); }, 500);
  };

  useEffect(() => { return () => { if (notifDebounce.current) clearTimeout(notifDebounce.current); }; }, []);

  const validate = useCallback(() => {
    const result = profileSchema.safeParse({ firstName, lastName, email, phone: phone || undefined });
    if (result.success) { setFieldErrors({}); return true; }
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (errors[field]) continue;
      if (issue.code === 'too_small') errors[field] = t(issue.message, lang, String(issue.minimum));
      else if (issue.code === 'too_big') errors[field] = t(issue.message, lang, String(issue.maximum));
      else errors[field] = t(issue.message, lang);
    }
    setFieldErrors(errors);
    return false;
  }, [firstName, lastName, email, phone, lang]);

  const handleSave = useCallback(() => {
    if (!validate()) return;
    updateMutation.mutate();
  }, [validate]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (email !== profile?.email) {
        const { error: authErr } = await supabase.auth.updateUser({ email });
        if (authErr) throw authErr;
      }
      const { error } = await supabase.from('users').update({ first_name: firstName, last_name: lastName, email, phone: phone || null }).eq('id', profile!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast(t('success.updated', lang, 'Profil'), 'success'); setEditing(false); refreshProfile(); },
    onError: (err) => { toast(err?.message ?? t('errors.unknown', lang), 'error'); },
  });

  if (!profile) return <div className="p-8 text-center text-muted-foreground">{t('common.loading', lang)}</div>;

  const roleGradient = ROLE_COLORS[profile.role] || ROLE_COLORS.student;
  const roleBg = ROLE_BG[profile.role] || ROLE_BG.student;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-border"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${roleGradient}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.08),transparent_50%)]" />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-white/20 blur-sm group-hover:blur-md transition-all" />
              <AvatarUpload
                userId={profile.id}
                url={photoPath}
                name={getFullName(profile.firstName, profile.lastName)}
                size={88}
                onUpdate={(p) => { setPhotoPath(p); refreshProfile(); }}
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">{getFullName(profile.firstName, profile.lastName)}</h1>
              <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBg}`}>
                  <Shield className="h-3 w-3" />
                  {getRoleLabel(profile.role)}
                </span>
              </div>
            </div>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white hover:bg-white/25 transition-colors"
            >
              {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {editing ? t('common.save', lang) : t('common.edit', lang)}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Personal Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t('nav.profile', lang)}</h2>
        <div className="space-y-3">
          {editing ? (
            <>
              {[
                { label: t('common.first_name', lang), value: firstName, set: setFirstName, field: 'firstName', noDigit: true },
                { label: t('common.last_name', lang), value: lastName, set: setLastName, field: 'lastName', noDigit: true },
                { label: t('common.email', lang), value: email, set: setEmail, field: 'email' },
                { label: t('common.phone', lang), value: phone, set: setPhone, field: 'phone', placeholder: t('common.not_assigned', lang) },
              ].map(f => (
                <div key={f.field} className="rounded-xl bg-muted/30 p-3.5">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
                  <Input
                    value={f.value}
                    onChange={e => {
                      const v = f.noDigit ? e.target.value.replace(/\d/g, '') : e.target.value;
                      f.set(v);
                      setTimeout(validate);
                    }}
                    placeholder={f.placeholder}
                    className="h-8 bg-transparent border-0 p-0 shadow-none focus-visible:ring-0 text-sm"
                  />
                  {fieldErrors[f.field] && <p className="mt-1 text-xs text-destructive">{fieldErrors[f.field]}</p>}
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                { icon: Mail, label: t('common.email', lang), value: profile.email },
                { icon: Phone, label: t('common.phone', lang), value: profile.phone || t('common.not_assigned', lang) },
                { icon: Shield, label: t('common.type', lang), value: getRoleLabel(profile.role) },
                { icon: UserCircle, label: t('common.status', lang), value: profile.status },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-3.5 rounded-xl bg-muted/30 p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <row.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{row.label}</p>
                    <p className="text-sm font-medium truncate">{row.value}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4" />
          {t('nav.notifications', lang)}
        </h2>
        <div className="space-y-1">
          {[
            { key: 'email_notifications', label: t('common.email', lang), desc: 'Recevez les notifications par email' },
            { key: 'push_notifications', label: 'Push', desc: 'Notifications dans le navigateur' },
            { key: 'sms_notifications', label: 'SMS', desc: 'Notifications par message texte' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between rounded-xl p-3 hover:bg-muted/30 transition-colors">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <Switch checked={(notifications as any)[n.key]} onCheckedChange={v => handleNotifChange(n.key, v)} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Teacher private lessons */}
      {profile.role === 'teacher' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Cours particuliers
          </h2>
          <div className="flex items-center justify-between rounded-xl p-3 hover:bg-muted/30 transition-colors">
            <div>
              <p className="text-sm font-medium">Accepter les demandes de cours particuliers</p>
              <p className="text-xs text-muted-foreground">Les visiteurs pourront demander des cours privés</p>
            </div>
            <Switch checked={acceptsPrivateLessons} onCheckedChange={v => {
              setAcceptsPrivateLessons(v);
              updateSettings.mutate(
                { userId: profile?.id ?? '', settings: { accepts_private_lessons: v } },
                { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['public-courses'] }) }
              );
            }} />
          </div>
        </motion.div>
      )}

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          {t('common.security', lang)}
        </h2>
        <div className="space-y-3">
          {[
            { label: t('auth.password', lang), value: currentPassword, set: setCurrentPassword, placeholder: t('common.current_password', lang) },
            { label: t('auth.new_password', lang), value: newPassword, set: setNewPassword, placeholder: t('auth.new_password', lang) },
            { label: t('auth.confirm_password', lang), value: confirmPassword, set: setConfirmPassword, placeholder: t('common.confirm', lang) },
          ].map(f => (
            <div key={f.label} className="rounded-xl bg-muted/30 p-3.5">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
              <Input
                type="password"
                value={f.value}
                onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder}
                className="h-8 bg-transparent border-0 p-0 shadow-none focus-visible:ring-0 text-sm"
              />
            </div>
          ))}
          <Button
            size="sm"
            className="h-9 mt-1"
            onClick={() => {
              if (!currentPassword || !newPassword) { toast(t('common.required', lang), 'error'); return; }
              if (newPassword.length < 8) { toast(t('validation.min_length', lang, '8'), 'error'); return; }
              if (newPassword !== confirmPassword) { toast(t('validation.password_mismatch', lang), 'error'); return; }
              updatePasswordMutation.mutate({ currentPassword, newPassword });
            }}
            disabled={updatePasswordMutation.isPending}
          >
            {t('common.update', lang)}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
