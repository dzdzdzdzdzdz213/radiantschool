import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Loader, UserPlus, Check } from 'lucide-react';
import { useMutationWithFeedback } from '@/hooks/useMutationFeedback';
import { useToast } from '@/hooks/useToast';

export default function PrivateRequestPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['public-course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const { data } = await supabase
        .from('courses')
        .select('id, name, type, price, subject:subjects(name), level:levels(name, stream, category), teacher:users!teacher_id(id, first_name, last_name, accepts_private_lessons)')
        .eq('id', Number(courseId))
        .single();
      return data ?? null;
    },
    enabled: !!courseId,
  });

  useEffect(() => {
    if (course && course.teacher?.accepts_private_lessons === false) {
      navigate('/formations');
      toast('Ce professeur n\'accepte pas les demandes de cours particuliers pour le moment.', 'error');
    }
  }, [course, navigate, toast]);

  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', date: '', start_time: '', end_time: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bookMutation = useMutationWithFeedback<unknown, Error, void, unknown>(
    async () => {
      if (!profile?.id || !courseId || !course?.teacher?.id) return;
      const price = course.price ? Number(course.price) : 0;
      const { error } = await (supabase as any).from('private_lessons').insert({
        student_id: profile.id,
        teacher_id: course.teacher.id,
        course_id: Number(courseId),
        price,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    {
      successMessage: 'Demande envoyée au professeur',
      invalidateQueries: [['student_private_lessons']],
      onSuccess: () => {
        if (profile?.role === 'student') navigate('/student/private-lessons');
        else if (profile?.role === 'parent') navigate('/parent/dashboard');
        else navigate('/');
      },
    },
  );

  const inquiryMutation = useMutation({
    mutationFn: async () => {
      if (!courseId) return;
      const { error } = await (supabase as any).from('private_lesson_inquiries').insert({
        course_id: Number(courseId),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        preferred_date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        notes: form.notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast('Votre demande a été envoyée. Nous vous contacterons rapidement.', 'success');
      setForm({ first_name: '', last_name: '', email: '', phone: '', date: '', start_time: '', end_time: '', notes: '' });
    },
    onError: (err: any) => {
      toast(err?.message ?? 'Une erreur est survenue', 'error');
    },
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!profile) {
      const name = form.first_name.trim();
      if (!name) e.first_name = 'Requis';
      else if (name.length < 2) e.first_name = 'Minimum 2 caractères';
      else if (/[0-9]/.test(name)) e.first_name = 'Ne peut pas contenir de chiffres';

      const lname = form.last_name.trim();
      if (!lname) e.last_name = 'Requis';
      else if (lname.length < 2) e.last_name = 'Minimum 2 caractères';
      else if (/[0-9]/.test(lname)) e.last_name = 'Ne peut pas contenir de chiffres';

      const email = form.email.trim();
      if (!email) e.email = 'Requis';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email invalide';

      const phone = form.phone.trim();
      if (phone && !/^(\+213|0)[5-7]\s?\d(\s?\d{2}){3}$/.test(phone) && !/^\+\d+$/.test(phone)) e.phone = 'Numéro invalide (ex: 0555 12 34 56)';
    }

    if (!form.date) e.date = 'Requis';
    else {
      const d = new Date(form.date + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) e.date = 'La date doit être dans le futur';
    }

    if (!form.start_time) e.start_time = 'Requis';
    if (!form.end_time) e.end_time = 'Requis';
    if (form.start_time && form.end_time) {
      if (form.start_time >= form.end_time) e.end_time = 'Doit être après le début';
      else {
        const [sh, sm] = form.start_time.split(':').map(Number);
        const [eh, em] = form.end_time.split(':').map(Number);
        const diff = (eh * 60 + em) - (sh * 60 + sm);
        if (diff < 30) e.end_time = 'Minimum 30 minutes';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (profile) {
      if (profile.role !== 'student' && profile.role !== 'parent') { navigate('/'); return; }
      bookMutation.mutate();
      return;
    }
    if (!validate()) return;
    inquiryMutation.mutate();
  }

  if (courseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ color: 'var(--fg)' }}>
        <p className="text-lg font-medium">Formation introuvable</p>
        <Link to="/formations" className="text-sm" style={{ color: 'var(--primary)' }}>Voir toutes les formations</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ color: 'var(--fg)' }}>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link to="/formations" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--fg-muted)' }}>
          <ArrowLeft className="h-4 w-4" />
          Retour aux formations
        </Link>

        <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 10%, transparent)` }}>
              <UserPlus className="h-6 w-6" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Demande de cours particulier</h1>
              <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{course.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm mb-8 p-4 rounded-xl" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 5%, transparent)` }}>
            <div><span style={{ color: 'var(--fg-muted)' }}>Matière :</span> <span className="font-medium">{course.subject?.name ?? '—'}</span></div>
            <div><span style={{ color: 'var(--fg-muted)' }}>Niveau :</span> <span className="font-medium">{course.level?.name ?? '—'}{course.level?.stream ? ` — ${course.level.stream}` : ''}</span></div>
            {course.price && <div><span style={{ color: 'var(--fg-muted)' }}>Prix :</span> <span className="font-medium">{Number(course.price).toLocaleString()} DA</span></div>}
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--fg-muted)' }}>Professeur suggéré</p>
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: `color-mix(in srgb, var(--accent) 8%, transparent)`, border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: 'var(--primary)' }}>
                {course.teacher ? `${course.teacher.first_name?.[0] ?? ''}${course.teacher.last_name?.[0] ?? ''}` : '?'}
              </div>
              <div>
                <p className="font-semibold text-sm">{course.teacher ? `${course.teacher.first_name} ${course.teacher.last_name}` : 'À définir'}</p>
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Enseignant spécialisé</p>
              </div>
              <Check className="h-4 w-4 ml-auto shrink-0" style={{ color: 'var(--accent)' }} />
            </div>
          </div>

          {!profile && (
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--fg-muted)' }}>Prénom *</label>
                <input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value.replace(/[0-9]/g, '') })}
                  className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ backgroundColor: 'var(--bg)', border: `1px solid ${errors.first_name ? '#ef4444' : 'var(--border)'}`, color: 'var(--fg)' }} />
                {errors.first_name && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.first_name}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--fg-muted)' }}>Nom *</label>
                <input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value.replace(/[0-9]/g, '') })}
                  className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ backgroundColor: 'var(--bg)', border: `1px solid ${errors.last_name ? '#ef4444' : 'var(--border)'}`, color: 'var(--fg)' }} />
                {errors.last_name && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.last_name}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--fg-muted)' }}>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ backgroundColor: 'var(--bg)', border: `1px solid ${errors.email ? '#ef4444' : 'var(--border)'}`, color: 'var(--fg)' }} />
                {errors.email && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--fg-muted)' }}>Téléphone</label>
                <input type="tel" value={form.phone} onChange={e => {
                  const raw = e.target.value.replace(/[^0-9+]/g, '');
                  let formatted = raw;
                  if (raw.startsWith('+213')) {
                    const rest = raw.slice(4).replace(/\D/g, '');
                    formatted = rest ? `+213 ${rest.slice(0,1)} ${rest.slice(1,3)} ${rest.slice(3,5)} ${rest.slice(5,7)}`.trim() : '+213';
                  } else if (raw.startsWith('0')) {
                    const digits = raw.replace(/\D/g, '');
                    formatted = digits ? `${digits.slice(0,2)} ${digits.slice(2,4)} ${digits.slice(4,6)} ${digits.slice(6,8)}`.trim() : '';
                  } else if (raw.startsWith('213')) {
                    const rest = raw.slice(3).replace(/\D/g, '');
                    formatted = rest ? `+213 ${rest.slice(0,1)} ${rest.slice(1,3)} ${rest.slice(3,5)} ${rest.slice(5,7)}`.trim() : '+213';
                  } else {
                    const digits = raw.replace(/\D/g, '');
                    if (digits.length <= 2) formatted = digits;
                    else formatted = `${digits.slice(0,2)} ${digits.slice(2,4)} ${digits.slice(4,6)} ${digits.slice(6,8)}`.trim();
                  }
                  setForm({ ...form, phone: formatted });
                }}
                  className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }} />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--fg-muted)' }}>Date *</label>
              <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]"
                style={{ backgroundColor: 'var(--bg)', border: `1px solid ${errors.date ? '#ef4444' : 'var(--border)'}`, color: 'var(--fg)' }}
              />
              {errors.date && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.date}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--fg-muted)' }}>Début *</label>
              <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })}
                className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]"
                style={{ backgroundColor: 'var(--bg)', border: `1px solid ${errors.start_time ? '#ef4444' : 'var(--border)'}`, color: 'var(--fg)' }}
              />
              {errors.start_time && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.start_time}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--fg-muted)' }}>Fin *</label>
              <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })}
                className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]"
                style={{ backgroundColor: 'var(--bg)', border: `1px solid ${errors.end_time ? '#ef4444' : 'var(--border)'}`, color: 'var(--fg)' }}
              />
              {errors.end_time && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.end_time}</p>}
            </div>
          </div>

          <div className="mb-8">
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--fg-muted)' }}>Notes (optionnel)</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
              placeholder="Précisions sur votre demande..."
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] resize-none"
              style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            />
          </div>

          <button onClick={handleSubmit} disabled={bookMutation.isPending || inquiryMutation.isPending}
            className="w-full h-12 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
            style={{ background: 'var(--primary)' }}
          >
            {bookMutation.isPending || inquiryMutation.isPending ? 'Envoi...' : profile ? 'Envoyer la demande' : 'Envoyer ma demande'}
          </button>

          {!profile && (
            <p className="text-xs text-center mt-3" style={{ color: 'var(--fg-muted)' }}>
              Un professeur vous contactera par email ou téléphone.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
