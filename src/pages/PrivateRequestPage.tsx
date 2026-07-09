import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Loader, UserPlus, Check } from 'lucide-react';
import { useMutationWithFeedback } from '@/hooks/useMutationFeedback';

export default function PrivateRequestPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['public-course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const { data } = await supabase
        .from('courses')
        .select('id, name, type, price, subject:subjects(name), level:levels(name, stream, category), teacher:users!teacher_id(id, first_name, last_name)')
        .eq('id', Number(courseId))
        .single();
      return data ?? null;
    },
    enabled: !!courseId,
  });

  const [form, setForm] = useState({ date: '', start_time: '', end_time: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bookMutation = useMutationWithFeedback<unknown, Error, void, unknown>(
    async () => {
      if (!profile?.id || !courseId || !course?.teacher?.id) return;
      const price = course.price ? Number(course.price) : 0;
      const { error } = await (supabase as any).from('private_lessons').insert({
        student_id: profile.id,
        teacher_id: course.teacher.id,
        course_id: Number(courseId),
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        price,
        notes: form.notes || null,
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

  function validate() {
    const e: Record<string, string> = {};
    if (!form.date) e.date = 'Requis';
    if (!form.start_time) e.start_time = 'Requis';
    if (!form.end_time) e.end_time = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!profile) { navigate(`/enroll?redirect=/private-request/${courseId}`); return; }
    if (profile.role !== 'student' && profile.role !== 'parent') { navigate('/'); return; }
    if (!validate()) return;
    bookMutation.mutate();
  }

  if (courseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <Loader className="h-8 w-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>
        <p className="text-lg font-medium">Formation introuvable</p>
        <Link to="/formations" className="text-sm" style={{ color: 'var(--primary)' }}>Voir toutes les formations</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>
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

          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--fg-muted)' }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
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

          <button onClick={handleSubmit} disabled={bookMutation.isPending}
            className="w-full h-12 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
            style={{ background: 'var(--primary)' }}
          >
            {bookMutation.isPending ? 'Envoi...' : profile ? 'Envoyer la demande' : 'Connectez-vous pour envoyer'}
          </button>

          {!profile && (
            <p className="text-xs text-center mt-3" style={{ color: 'var(--fg-muted)' }}>
              Vous devez avoir un compte pour envoyer une demande.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
