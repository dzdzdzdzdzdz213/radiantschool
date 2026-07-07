import React, { useState, useEffect, useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { UserPlus, ArrowLeft, GraduationCap, UserCheck, Mail, Phone, Lock, Users, Eye, EyeOff } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

const LEVELS = [
  { value: 'primary', label: 'Primaire' },
  { value: 'middle', label: 'CEM' },
  { value: 'high_school', label: 'Lycée' },
];

const NAME_FIELDS = ['firstName', 'lastName', 'childFirstName', 'childLastName', 'guardianName'];
const PHONE_FIELDS = ['phone', 'guardianPhone'];
const NAME_REGEX = /^[a-zA-Za-zÀ-ž\s\-']+$/;

function validateName(v: string): string | null {
  if (!v.trim()) return 'Ce champ est requis';
  if (/\d/.test(v)) return 'Les chiffres ne sont pas autorisés';
  if (!NAME_REGEX.test(v)) return 'Caractères invalides';
  return null;
}

function validatePhone(v: string): string | null {
  const cleaned = v.replace(/\s/g, '');
  if (!cleaned) return null;
  if (!/^(05|06|07)/.test(cleaned)) return 'Le numéro doit commencer par 05, 06 ou 07';
  if (cleaned.length !== 10) return 'Le numéro doit faire exactement 10 chiffres';
  return null;
}

function validatePassword(v: string): string | null {
  if (!v) return 'Mot de passe requis';
  if (v.length < 8) return 'Minimum 8 caractères';
  return null;
}

function validateEmail(v: string): string | null {
  if (!v.trim()) return 'Email requis';
  if (!v.includes('@')) return 'L\'email doit contenir un @';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Email invalide (ex: nom@domaine.com)';
  return null;
}

function handleKeyDown(field: string, e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  if (NAME_FIELDS.includes(field) && e.key >= '0' && e.key <= '9') {
    e.preventDefault();
  } else if (PHONE_FIELDS.includes(field) && !(e.key >= '0' && e.key <= '9')) {
    e.preventDefault();
  } else if (field === 'email' && e.key === ' ') {
    e.preventDefault();
  }
}

function handlePaste(field: string, e: ClipboardEvent) {
  const pasted = e.clipboardData.getData('text');
  if (NAME_FIELDS.includes(field) && /\d/.test(pasted)) {
    e.preventDefault();
  } else if (PHONE_FIELDS.includes(field) && /[^\d]/.test(pasted)) {
    e.preventDefault();
  } else if (field === 'email' && /\s/.test(pasted)) {
    e.preventDefault();
  }
}

interface FieldProps {
  name: string;
  label: string;
  type?: string;
  icon?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  className?: string;
  inputMode?: 'text' | 'search' | 'none' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal';
  form: Record<string, string>;
  fieldErrors: Record<string, string>;
  setField: (field: string, value: string) => void;
  setFieldErrors: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  checkEmail?: (email: string) => void;
}

function Field({ name, label, type = 'text', icon, required, placeholder, className, inputMode, form, fieldErrors, setField, setFieldErrors, checkEmail }: FieldProps) {
  const val = form[name];
  const err = fieldErrors[name];
  const isPhone = PHONE_FIELDS.includes(name);
  return (
    <div className={className || 'mb-3'}>
      <label className="mb-1.5 block text-sm font-medium flex items-center gap-1.5">
        {icon && <span className="inline-flex [&>svg]:h-3.5 [&>svg]:w-3.5" style={{ color: 'var(--primary)' }}>{icon}</span>}
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        type={type}
        value={val || ''}
        inputMode={inputMode || (isPhone ? 'numeric' : undefined)}
          maxLength={isPhone ? 10 : undefined}
        onChange={e => setField(name, e.target.value)}
        onKeyDown={e => handleKeyDown(name, e)}
        onPaste={e => handlePaste(name, e)}
        onBlur={() => {
          if (name === 'email' && checkEmail) checkEmail(val);
          else if (isPhone) setFieldErrors(p => { const n = { ...p }; const e = validatePhone(val); if (e) n[name] = e; else delete n[name]; return n; });
          else if (NAME_FIELDS.includes(name)) setFieldErrors(p => { const n = { ...p }; const e = validateName(val); if (e) n[name] = e; else delete n[name]; return n; });
        }}
        placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--ring)]"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: err ? '#ef4444' : 'var(--border)',
          color: 'var(--fg)',
        }}
        required={required}
      />
      {err && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{err}</p>}
    </div>
  );
}

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Faible', color: '#ef4444', width: 'w-1/5' };
  if (score <= 2) return { label: 'Moyen', color: '#f59e0b', width: 'w-2/5' };
  if (score <= 3) return { label: 'Bon', color: '#3b82f6', width: 'w-3/5' };
  if (score <= 4) return { label: 'Fort', color: '#10b981', width: 'w-4/5' };
  return { label: 'Très fort', color: '#10b981', width: 'w-full' };
}

export default function RegisterPage() {
  const [step, setStep] = useState<'choose' | 'form'>('choose');
  const [type, setType] = useState<'parent' | 'student' | ''>('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
    childFirstName: '', childLastName: '', childLevel: '',
    guardianName: '', guardianEmail: '', guardianPhone: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const { signUp } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const successTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(successTimer.current), []);

  function setField(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }));
    setFieldErrors(p => { const n = { ...p }; delete n[field]; return n; });
    if (field === 'email') setEmailBusy(false);
  }

  async function checkEmail(_email: string) {
    // Email uniqueness is enforced server-side. Do NOT reveal whether
    // an email is registered (email enumeration vulnerability).
  }

  function validateAll(): boolean {
    const errs: Record<string, string> = {};
    const n1 = validateName(form.firstName);
    if (n1) errs.firstName = n1;
    const n2 = validateName(form.lastName);
    if (n2) errs.lastName = n2;
    const e = validateEmail(form.email);
    if (e) errs.email = e;
    const p = validatePhone(form.phone);
    if (p) errs.phone = p;
    const pw = validatePassword(form.password);
    if (pw) errs.password = pw;

    if (type === 'parent') {
      const cn1 = validateName(form.childFirstName);
      if (cn1) errs.childFirstName = cn1;
      const cn2 = validateName(form.childLastName);
      if (cn2) errs.childLastName = cn2;
      if (!form.childLevel) errs.childLevel = 'Sélectionnez un niveau';
    } else {
      const gn = validateName(form.guardianName || '');
      if (gn && !form.guardianName?.trim()) errs.guardianName = 'Nom du parent requis';
      else if (gn) errs.guardianName = gn;
      const ge = validateEmail(form.guardianEmail || '');
      if (ge) errs.guardianEmail = ge;
      const gp = validatePhone(form.guardianPhone || '');
      if (gp) errs.guardianPhone = gp;
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (emailBusy) { setError('Email invalide'); return; }
    if (!validateAll()) { setError('Vérifiez les champs en rouge'); return; }

    setIsLoading(true);
    const opts = type === 'parent'
      ? { phone: form.phone, childFirstName: form.childFirstName, childLastName: form.childLastName, childLevelCategory: form.childLevel }
      : { phone: form.phone, guardianName: form.guardianName, guardianEmail: form.guardianEmail, guardianPhone: form.guardianPhone };

    const result = await signUp(
      form.email, form.password, form.firstName, form.lastName,
      type === 'parent' ? 'parent' : 'student', opts
    );
    setIsLoading(false);
    if (result.error) setError(result.error);
    else { setSuccess(true); successTimer.current = setTimeout(() => navigate('/login'), 3000); }
  };

  const fieldProps = { form, fieldErrors, setField, setFieldErrors, checkEmail };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="w-full max-w-md rounded-2xl border p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: `color-mix(in srgb, #22c55e 10%, transparent)` }}>
            <UserCheck className="h-7 w-7" style={{ color: '#22c55e' }} />
          </div>
              <h2 className="text-xl font-bold mb-2">{t('auth.register_success', lang)}</h2>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            {type === 'parent'
              ? 'Votre compte parent a été créé. Vous allez être redirigé vers la page de connexion.'
              : 'Votre compte a été créé. Vous allez être redirigé vers la page de connexion.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-lg">
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 hover:bg-[var(--primary-light)]" style={{ color: 'var(--fg-muted)' }}>
          <ArrowLeft className="h-3.5 w-3.5" /> {t('common.back', lang)}
        </Link>

        {step === 'choose' ? (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg" style={{ backgroundColor: 'var(--primary)' }}>
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-black">{t('auth.create_account', lang)}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>{t('auth.select_role', lang)}</p>
            </div>

            <div className="grid gap-4">
              <button onClick={() => { setType('parent'); setStep('form'); }} className="group relative rounded-2xl p-6 text-left transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 group-hover:shadow-md" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 10%, transparent)` }}>
                    <Users className="h-6 w-6" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Parent / Tuteur</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>Pour inscrire un ou plusieurs enfants en Primaire ou au CEM.</p>
                  </div>
                </div>
              </button>
              <button onClick={() => { setType('student'); setStep('form'); }} className="group relative rounded-2xl p-6 text-left transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 group-hover:shadow-md" style={{ backgroundColor: `color-mix(in srgb, #f59e0b 10%, transparent)` }}>
                    <GraduationCap className="h-6 w-6" style={{ color: '#f59e0b' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Élève (Lycée)</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>Pour les lycéens qui s'inscrivent par eux-mêmes. Les informations du parent/tuteur seront requises pour les notifications.</p>
                  </div>
                </div>
              </button>
            </div>

            <p className="mt-8 text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
              {t('auth.already_have_account', lang)} <Link to="/login" className="font-medium transition-all hover:opacity-80" style={{ color: 'var(--primary)' }}>{t('auth.sign_in', lang)}</Link>
            </p>
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg" style={{ backgroundColor: 'var(--primary)' }}>
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-black">{type === 'parent' ? 'Inscription Parent' : 'Inscription Élève'}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
                {type === 'parent' ? 'Créez votre compte pour inscrire votre enfant' : 'Créez votre compte et renseignez les informations de votre tuteur'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border p-8 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              {error && <div className="mb-4 rounded-xl p-3 text-sm font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</div>}

              <div className="mb-6">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                  {type === 'parent' ? 'Vos informations' : 'Mes informations'}
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <Field name="firstName" label="Prénom" required icon={<UserCheck />} {...fieldProps} />
                  <Field name="lastName" label="Nom" required icon={<UserCheck />} {...fieldProps} />
                </div>
                <Field name="email" label={t('auth.email', lang)} type="email" required icon={<Mail />} {...fieldProps} />
                <Field name="phone" label={t('common.phone', lang)} type="tel" placeholder="05XX XX XX XX" icon={<Phone />} {...fieldProps} />
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                    {t('auth.password', lang)} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setField('password', e.target.value)}
                      className="w-full rounded-xl border px-4 py-2.5 pr-11 text-sm outline-none transition-all duration-200 focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--ring)]"
                      style={{ backgroundColor: 'var(--bg)', borderColor: fieldErrors.password ? '#ef4444' : 'var(--border)', color: 'var(--fg)' }}
                      minLength={8} required
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--fg-muted)' }}>
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                          <div className={`h-full rounded-full transition-all ${getPasswordStrength(form.password).width}`} style={{ backgroundColor: getPasswordStrength(form.password).color }} />
                        </div>
                        <span className="text-[10px] font-semibold" style={{ color: getPasswordStrength(form.password).color }}>{getPasswordStrength(form.password).label}</span>
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--fg-muted)' }}>Min. 8 caractères, majuscule, chiffre et symbole recommandés</p>
                    </div>
                  )}
                  {fieldErrors.password && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{fieldErrors.password}</p>}
                </div>
              </div>

              <div className="divider-gradient my-6" />

              {type === 'parent' ? (
                <div className="mb-6">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                    Informations de l'enfant
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <Field name="childFirstName" label="Prénom de l'enfant" required icon={<GraduationCap />} {...fieldProps} />
                    <Field name="childLastName" label="Nom de l'enfant" required icon={<GraduationCap />} {...fieldProps} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Niveau scolaire <span style={{ color: '#ef4444' }}>*</span></label>
                    <select value={form.childLevel} onChange={e => setField('childLevel', e.target.value)} className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-[var(--primary)]" style={{ backgroundColor: 'var(--bg)', borderColor: fieldErrors.childLevel ? '#ef4444' : 'var(--border)', color: 'var(--fg)' }} required>
                      <option value="">Sélectionner un niveau</option>
                      {LEVELS.filter(l => l.value !== 'high_school').map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                    {fieldErrors.childLevel && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{fieldErrors.childLevel}</p>}
                    <p className="text-xs mt-2" style={{ color: 'var(--fg-muted)' }}>Votre enfant pourra suivre des cours adaptés à son niveau.</p>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" style={{ color: '#f59e0b' }} />
                    Parent / Tuteur (pour les notifications)
                  </h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--fg-muted)' }}>Votre parent recevra les notifications concernant votre scolarité par email.</p>
                  <Field name="guardianName" label="Nom complet du parent" required icon={<Users />} {...fieldProps} />
                  <Field name="guardianEmail" label="Email du parent" type="email" required icon={<Mail />} {...fieldProps} />
                  <Field name="guardianPhone" label="Téléphone du parent (urgences)" type="tel" placeholder="05XX XX XX XX" icon={<Phone />} {...fieldProps} />
                </div>
              )}

              <button type="submit" disabled={isLoading} className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50" style={{ backgroundColor: 'var(--primary)' }}>
                {isLoading ? 'Inscription...' : t('auth.register', lang)}
              </button>

              <p className="mt-5 text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
                {t('auth.already_have_account', lang)} <Link to="/login" className="font-medium transition-all hover:opacity-80" style={{ color: 'var(--primary)' }}>{t('auth.sign_in', lang)}</Link>
              </p>
            </form>

            <button onClick={() => setStep('choose')} className="mt-4 w-full rounded-xl py-3 text-sm font-medium transition-all" style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
              Retour au choix
            </button>
          </>
        )}
      </div>
    </div>
  );
}
