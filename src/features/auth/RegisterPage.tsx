import React, { useState, useEffect, useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, ArrowLeft, GraduationCap, UserCheck, Mail, Phone, Lock, Users, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t, type Lang } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { asset } from '@/lib/assets';

const NAME_FIELDS = ['firstName', 'lastName', 'childFirstName', 'childLastName', 'guardianName'];
const PHONE_FIELDS = ['phone', 'guardianPhone'];
const NAME_REGEX = /^[a-zA-Za-zÀ-ž\s\-']+$/;

function validateName(v: string, lang: Lang): string | null {
  if (!v.trim()) return t('validation.required', lang);
  if (/\d/.test(v)) return t('validation.digits_not_allowed', lang);
  if (!NAME_REGEX.test(v)) return t('validation.invalid_characters', lang);
  return null;
}

function validatePhone(v: string, lang: Lang): string | null {
  const cleaned = v.replace(/\s/g, '');
  if (!cleaned) return null;
  if (!/^(05|06|07)/.test(cleaned)) return t('validation.phone_start', lang);
  if (cleaned.length !== 10) return t('validation.phone_length', lang);
  return null;
}

function validatePassword(v: string, lang: Lang): string | null {
  if (!v) return t('validation.password_required', lang);
  if (v.length < 8) return t('common.min_8_chars', lang);
  return null;
}

function validateEmail(v: string, lang: Lang): string | null {
  if (!v.trim()) return t('validation.email_required', lang);
  if (!v.includes('@')) return t('validation.email_contains_at', lang);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return t('validation.email_format', lang);
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
  lang: Lang;
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

function Field({ name, label, lang, type = 'text', icon, required, placeholder, className, inputMode, form, fieldErrors, setField, setFieldErrors, checkEmail }: FieldProps) {
  const val = form[name];
  const err = fieldErrors[name];
  const isPhone = PHONE_FIELDS.includes(name);
  return (
    <div className={className || 'mb-3'}>
      <label className="mb-1.5 block text-sm font-medium flex items-center gap-1.5">
        {icon && <span className="inline-flex [&>svg]:h-3.5 [&>svg]:w-3.5" style={{ color: 'var(--primary)' }}>{icon}</span>}
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <Input
        type={type}
        value={val || ''}
        inputMode={inputMode || (isPhone ? 'numeric' : undefined)}
        maxLength={isPhone ? 10 : undefined}
        onChange={e => setField(name, e.target.value)}
        onKeyDown={e => handleKeyDown(name, e)}
        onPaste={e => handlePaste(name, e)}
        onBlur={() => {
          if (name === 'email' && checkEmail) checkEmail(val);
          else if (isPhone) setFieldErrors(p => { const n = { ...p }; const e = validatePhone(val, lang); if (e) n[name] = e; else delete n[name]; return n; });
          else if (NAME_FIELDS.includes(name)) setFieldErrors(p => { const n = { ...p }; const e = validateName(val, lang); if (e) n[name] = e; else delete n[name]; return n; });
        }}
        placeholder={placeholder}
        className={err ? 'border-[#ef4444]' : ''}
        required={required}
      />
      {err && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{err}</p>}
    </div>
  );
}

function getPasswordStrength(pw: string, lang: Lang): { label: string; color: string; width: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: t('validation.password_weak', lang), color: '#ef4444', width: 'w-1/5' };
  if (score <= 2) return { label: t('validation.password_medium', lang), color: '#f59e0b', width: 'w-2/5' };
  if (score <= 3) return { label: t('validation.password_good', lang), color: '#3b82f6', width: 'w-3/5' };
  if (score <= 4) return { label: t('validation.password_strong', lang), color: '#10b981', width: 'w-4/5' };
  return { label: t('validation.password_very_strong', lang), color: '#10b981', width: 'w-full' };
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
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
    const n1 = validateName(form.firstName, lang);
    if (n1) errs.firstName = n1;
    const n2 = validateName(form.lastName, lang);
    if (n2) errs.lastName = n2;
    const e = validateEmail(form.email, lang);
    if (e) errs.email = e;
    const p = validatePhone(form.phone, lang);
    if (p) errs.phone = p;
    const pw = validatePassword(form.password, lang);
    if (pw) errs.password = pw;

    if (type === 'parent') {
      const cn1 = validateName(form.childFirstName, lang);
      if (cn1) errs.childFirstName = cn1;
      const cn2 = validateName(form.childLastName, lang);
      if (cn2) errs.childLastName = cn2;
      if (!form.childLevel) errs.childLevel = t('validation.select_level', lang);
    } else {
      const gn = validateName(form.guardianName || '', lang);
      if (gn && !form.guardianName?.trim()) errs.guardianName = t('validation.parent_name_required', lang);
      else if (gn) errs.guardianName = gn;
      const ge = validateEmail(form.guardianEmail || '', lang);
      if (ge) errs.guardianEmail = ge;
      const gp = validatePhone(form.guardianPhone || '', lang);
      if (gp) errs.guardianPhone = gp;
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (emailBusy) { setError(t('validation.invalid_email', lang)); return; }
    if (!validateAll()) { setError(t('validation.check_fields', lang)); return; }

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

  const fieldProps = { form, fieldErrors, setField, setFieldErrors, checkEmail, lang };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: `color-mix(in srgb, #22c55e 10%, transparent)` }}>
            <UserCheck className="h-7 w-7" style={{ color: '#22c55e' }} />
          </div>
              <h2 className="text-xl font-bold mb-2">{t('auth.register_success', lang)}</h2>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            {t(type === 'parent' ? 'register.success_parent' : 'register.success_student', lang)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page relative flex min-h-screen items-center justify-center p-4 overflow-hidden bg-black" style={{ color: 'var(--fg)', '--fg': '#f3ead9', '--fg-muted': 'rgba(243,234,217,0.65)', '--bg': '#0c0704', '--bg-card': 'rgba(19,14,10,0.72)', '--border': 'rgba(255,255,255,0.12)', '--primary-light': 'rgba(212,175,55,0.15)' } as React.CSSProperties}>
      <img src={asset('images/login-alex.webp')} alt="Peinture classique d'Alexandre le Grand" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(9,7,12,0.82) 0%, rgba(9,7,12,0.66) 50%, rgba(9,7,12,0.88) 100%)' }} />
      <div className="w-full max-w-lg relative">
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
                    <h3 className="font-bold text-lg mb-1">{t('register.parent_tutor', lang)}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{t('register.parent_tutor_desc', lang)}</p>
                  </div>
                </div>
              </button>
              <button onClick={() => { setType('student'); setStep('form'); }} className="group relative rounded-2xl p-6 text-left transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 group-hover:shadow-md" style={{ backgroundColor: `color-mix(in srgb, #f59e0b 10%, transparent)` }}>
                    <GraduationCap className="h-6 w-6" style={{ color: '#f59e0b' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{t('register.student_label', lang)}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{t('register.student_desc', lang)}</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#D4AF37]/30" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 font-medium tracking-wide text-[#D4AF37]/80" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>{t('common.or', lang)}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => { setGoogleLoading(true); signInWithGoogle(); }}
              disabled={googleLoading}
              className="w-full"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              {t('auth.continue_with_google', lang)}
            </Button>

            <p className="mt-5 text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
              {t('auth.already_have_account', lang)} <Link to="/login" className="font-medium transition-all hover:opacity-80" style={{ color: 'var(--primary)' }}>{t('auth.sign_in', lang)}</Link>
            </p>
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg" style={{ backgroundColor: 'var(--primary)' }}>
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-black">{type === 'parent' ? t('register.parent_registration', lang) : t('register.student_registration', lang)}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
                {type === 'parent' ? t('register.create_parent_account', lang) : t('register.create_student_account', lang)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border p-8 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              {error && <div className="mb-4 rounded-xl p-3 text-sm font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</div>}

              <div className="mb-6">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                  {type === 'parent' ? t('register.your_info', lang) : t('register.my_info', lang)}
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <Field name="firstName" label={t('common.first_name', lang)} required icon={<UserCheck />} {...fieldProps} />
                  <Field name="lastName" label={t('common.last_name', lang)} required icon={<UserCheck />} {...fieldProps} />
                </div>
                <Field name="email" label={t('auth.email', lang)} type="email" required icon={<Mail />} {...fieldProps} />
                <Field name="phone" label={t('common.phone', lang)} type="tel" placeholder="05XX XX XX XX" icon={<Phone />} {...fieldProps} />
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                    {t('auth.password', lang)} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setField('password', e.target.value)}
                      className="w-full pr-11"
                      style={{ borderColor: fieldErrors.password ? '#ef4444' : undefined }}
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
                          <div className={`h-full rounded-full transition-all ${getPasswordStrength(form.password, lang).width}`} style={{ backgroundColor: getPasswordStrength(form.password, lang).color }} />
                        </div>
                        <span className="text-[10px] font-semibold" style={{ color: getPasswordStrength(form.password, lang).color }}>{getPasswordStrength(form.password, lang).label}</span>
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--fg-muted)' }}>{t('register.password_hint_text', lang)}</p>
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
                    {t('register.child_info', lang)}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <Field name="childFirstName" label={t('register.child_first_name', lang)} required icon={<GraduationCap />} {...fieldProps} />
                    <Field name="childLastName" label={t('register.child_last_name', lang)} required icon={<GraduationCap />} {...fieldProps} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t('register.school_level', lang)} <span style={{ color: '#ef4444' }}>*</span></label>
                    <Select value={form.childLevel} onValueChange={v => setField('childLevel', v)} placeholder={t('register.select_level_option', lang)} className="w-full">
                      <SelectItem value="primary">{t('enroll.category_primaire', lang)}</SelectItem>
                      <SelectItem value="middle">{t('enroll.category_cem', lang)}</SelectItem>
                    </Select>
                    {fieldErrors.childLevel && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{fieldErrors.childLevel}</p>}
                    <p className="text-xs mt-2" style={{ color: 'var(--fg-muted)' }}>{t('register.child_level_desc', lang)}</p>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" style={{ color: '#f59e0b' }} />
                    {t('register.parent_section', lang)}
                  </h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--fg-muted)' }}>{t('register.parent_section_desc', lang)}</p>
                  <Field name="guardianName" label={t('register.parent_full_name', lang)} required icon={<Users />} {...fieldProps} />
                  <Field name="guardianEmail" label={t('register.parent_email', lang)} type="email" required icon={<Mail />} {...fieldProps} />
                  <Field name="guardianPhone" label={t('register.parent_phone_emergency', lang)} type="tel" placeholder="05XX XX XX XX" icon={<Phone />} {...fieldProps} />
                </div>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#D4AF37]/30" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 font-medium tracking-wide text-[#D4AF37]/80" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>{t('common.or', lang)}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => { setGoogleLoading(true); signInWithGoogle(); }}
                disabled={googleLoading}
                className="w-full mb-4"
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                {t('auth.continue_with_google', lang)}
              </Button>

              <Button type="submit" disabled={isLoading} variant="default" className="w-full">
                {isLoading ? t('register.loading', lang) : t('auth.register', lang)}
              </Button>

              <p className="mt-5 text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
                {t('auth.already_have_account', lang)} <Link to="/login" className="font-medium transition-all hover:opacity-80" style={{ color: 'var(--primary)' }}>{t('auth.sign_in', lang)}</Link>
              </p>
            </form>

            <Button variant="outline" onClick={() => setStep('choose')} className="mt-4 w-full">
              {t('register.back_to_choice', lang)}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
