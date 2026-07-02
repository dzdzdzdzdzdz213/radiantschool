import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { getFullName } from '@/lib/utils';
import { Star, Check, Loader, User, MessageSquare } from 'lucide-react';

interface TeacherEval {
  teacherId: string;
  firstName: string;
  lastName: string;
  specialties: string[];
  existing: {
    teaching_quality: number;
    communication: number;
    punctuality: number;
    organization: number;
    comment: string | null;
  } | null;
}

const FACTORS = [
  { key: 'teaching_quality', label: 'Qualité pédagogique' },
  { key: 'communication', label: 'Communication' },
  { key: 'punctuality', label: 'Ponctualité' },
  { key: 'organization', label: 'Organisation' },
];

export default function StudentReviewsPage() {
  const { profile } = useAuth();
  const [teachers, setTeachers] = useState<TeacherEval[]>([]);
  const [ratings, setRatings] = useState<Record<string, Record<string, number>>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    loadTeachers();
  }, [profile]);

  const loadTeachers = async () => {
    setLoading(true);
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('student_id', profile!.id);

    if (!enrollments || enrollments.length === 0) {
      setLoading(false);
      return;
    }

    const courseIds = enrollments.map(e => e.course_id);
    const { data: courses } = await supabase
      .from('courses')
      .select('teacher_id')
      .in('id', courseIds);

    if (!courses) { setLoading(false); return; }

    const teacherIds = [...new Set(courses.map(c => c.teacher_id))];
    const { data: users } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .in('id', teacherIds);

    const { data: teacherProfiles } = await supabase
      .from('teachers')
      .select('id, specialties')
      .in('id', teacherIds);

    const { data: existingEvals } = await supabase
      .from('evaluations')
      .select('teacher_id, teaching_quality, communication, punctuality, organization, comment')
      .eq('student_id', profile!.id)
      .in('teacher_id', teacherIds);

    const specMap = new Map((teacherProfiles || []).map(t => [t.id, t.specialties]));
    const evalMap = new Map((existingEvals || []).map(e => [e.teacher_id, e]));

    const list: TeacherEval[] = (users || [])
      .filter(u => teacherIds.includes(u.id))
      .map(u => ({
        teacherId: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        specialties: (specMap.get(u.id) ?? []) as string[],
        existing: evalMap.get(u.id) ? {
          teaching_quality: evalMap.get(u.id)!.teaching_quality,
          communication: evalMap.get(u.id)!.communication,
          punctuality: evalMap.get(u.id)!.punctuality,
          organization: evalMap.get(u.id)!.organization,
          comment: evalMap.get(u.id)!.comment,
        } : null,
      }));

    setTeachers(list);

    const initRatings: Record<string, Record<string, number>> = {};
    const initComments: Record<string, string> = {};
    list.forEach(t => {
      if (t.existing) {
        initRatings[t.teacherId] = {
          teaching_quality: t.existing.teaching_quality,
          communication: t.existing.communication,
          punctuality: t.existing.punctuality,
          organization: t.existing.organization,
        };
        initComments[t.teacherId] = t.existing.comment || '';
        setSubmitted(prev => ({ ...prev, [t.teacherId]: true }));
      } else {
        initRatings[t.teacherId] = { teaching_quality: 0, communication: 0, punctuality: 0, organization: 0 };
        initComments[t.teacherId] = '';
      }
    });
    setRatings(initRatings);
    setComments(initComments);
    setLoading(false);
  };

  const submitEval = async (teacherId: string) => {
    setSubmitting(prev => ({ ...prev, [teacherId]: true }));
    setError('');

    const r = ratings[teacherId];
    const payload = {
      student_id: profile!.id,
      teacher_id: teacherId,
      teaching_quality: r.teaching_quality,
      communication: r.communication,
      punctuality: r.punctuality,
      organization: r.organization,
      comment: comments[teacherId] || undefined,
    };

    const { error: err } = await (supabase.from('evaluations') as any).upsert(payload, { onConflict: 'student_id, teacher_id' });

    if (err) {
      setError(err.message);
    } else {
      setSubmitted(prev => ({ ...prev, [teacherId]: true }));
      toast('Évaluation enregistrée !', 'success');
    }
    setSubmitting(prev => ({ ...prev, [teacherId]: false }));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
    </div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Évaluer mes enseignants</h1>
        <p className="text-muted mt-1">Note les profs avec qui tu as étudié</p>
      </div>

      {error && (
        <div className="rounded-xl border p-4 text-sm font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {teachers.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <User className="mx-auto mb-3 h-10 w-10" style={{ color: 'var(--fg-muted)', opacity: 0.2 }} />
          <p className="font-medium">Aucun enseignant trouvé</p>
          <p className="text-sm text-muted mt-1">Tu dois être inscrit à des cours pour évaluer tes profs.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {teachers.map(t => {
            const r = ratings[t.teacherId] || { teaching_quality: 0, communication: 0, punctuality: 0, organization: 0 };
            const done = submitted[t.teacherId];
            const loading = submitting[t.teacherId];

            return (
              <div key={t.teacherId} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-4 p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
                    {t.firstName[0]}{t.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg">{getFullName(t.firstName, t.lastName)}</p>
                    {t.specialties.length > 0 && <p className="text-sm text-muted">{t.specialties.join(', ')}</p>}
                  </div>
                  {done && (
                    <span className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                      <Check className="h-3 w-3" /> Noté
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  {FACTORS.map(f => (
                    <div key={f.key}>
                      <p className="text-sm font-medium mb-1.5">{f.label}</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatings(prev => ({
                              ...prev,
                              [t.teacherId]: { ...(prev[t.teacherId] || r), [f.key]: star },
                            }))}
                            className="p-0.5 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-6 w-6 ${star <= (r[f.key as keyof typeof r] || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted opacity-30'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div>
                    <p className="text-sm font-medium mb-1.5">Commentaire (optionnel)</p>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted" />
                      <textarea
                        value={comments[t.teacherId] || ''}
                        onChange={e => setComments(prev => ({ ...prev, [t.teacherId]: e.target.value }))}
                        placeholder="Partage ton expérience..."
                        rows={2}
                        className="w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm outline-none resize-none"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => submitEval(t.teacherId)}
                    disabled={loading || Object.values(r).some(v => v === 0)}
                    className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {loading ? (
                      <Loader className="inline h-4 w-4 animate-spin" />
                    ) : done ? (
                      'Mettre à jour'
                    ) : (
                      'Soumettre'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
