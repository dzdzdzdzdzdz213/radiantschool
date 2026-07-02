import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { ChevronRight, ChevronLeft, Check, Loader, GraduationCap, BookOpen, Users, Clock, MapPin, DollarSign, Star } from 'lucide-react';

interface Level {
  id: number; name: string; category: string; stream: string | null; year: number | null; sort_order: number;
}
interface Subject {
  id: number; name: string;
}
interface TeacherInfo {
  id: string; first_name: string; last_name: string; photo_url: string | null; specialties: string[];
}
interface ScheduleInfo {
  id: number; day_of_week: string; start_time: string; end_time: string; room: { name: string } | null;
}
interface CourseResult {
  id: number; name: string; type: string; price: number; capacity: number; current_enrollments: number;
  teacher: TeacherInfo;
  schedules: ScheduleInfo[];
}

const CATEGORIES = [
  { value: 'primaire', label: 'Primaire', icon: '📚' },
  { value: 'college', label: 'CEM', icon: '📖' },
  { value: 'lycee', label: 'Lycée', icon: '🎓' },
];

const DAY_LABELS_FR: Record<string, string> = {
  saturday: 'Sam', sunday: 'Dim', monday: 'Lun', tuesday: 'Mar', wednesday: 'Mer', thursday: 'Jeu',
};

const MAX_COURSES_PER_STUDENT = 5;

export default function EnrollPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Data
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Selections
  const [category, setCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [stream, setStream] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [courseType, setCourseType] = useState('');
  const [results, setResults] = useState<CourseResult[]>([]);

  // For parent flow
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);

  const isParent = profile?.role === 'parent';
  const isStudent = profile?.role === 'student';
  const userId = selectedChild?.id || profile?.id;

  useEffect(() => {
    (async () => {
      const { data: l } = await supabase.from('levels').select('*').order('sort_order');
      setLevels(l || []);
      const { data: s } = await supabase.from('subjects').select('*').order('name');
      setSubjects(s || []);
      if (isParent) loadChildren();
    })().catch(() => setError(t('errors.load_error', lang, 'des données')));
  }, [profile]);

  const loadChildren = async () => {
    if (!profile) return;
    const { data: relations } = await supabase
      .from('student_parent')
      .select('student_id')
      .eq('parent_id', profile.id);
    if (!relations || relations.length === 0) {
      setChildren([]);
      return;
    }
    const studentIds = relations.map(r => r.student_id);
    const { data } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .in('id', studentIds);
    setChildren(data || []);
  };

  const categoryLevels = levels.filter(l => l.category === category);
  const filteredByStream = stream ? categoryLevels.filter(l => l.stream === stream) : categoryLevels;
  const filteredLevels = selectedLevel ? [selectedLevel] : filteredByStream;

  const availableStreams = [...new Set(categoryLevels.filter((l): l is Level & { stream: string } => !!l.stream).map(l => l.stream))];

  const subjectsForLevel = selectedLevel
    ? subjects
    : [];

  const handleSearch = async () => {
    if (!selectedLevel || !selectedSubject || !courseType) return;
    setLoading(true);
    setError('');

    const { data } = await supabase
      .from('courses')
      .select('*, teacher:teacher_id(id, first_name, last_name, photo_url), schedules:course_schedules(*, room:rooms(name))')
      .eq('level_id', selectedLevel.id)
      .eq('subject_id', selectedSubject.id)
      .eq('type', courseType)
      .in('status', ['active']);

    if (data) {
      setResults(data.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        price: c.price,
        capacity: c.capacity,
        current_enrollments: c.current_enrollments,
        teacher: c.teacher,
        schedules: (c.schedules || []).map((s: any) => ({
          ...s,
          room: s.room || null,
        })),
      })));
    }
    setLoading(false);
    setStep(6);
  };

  const handleEnroll = async (courseId: number) => {
    if (!userId) return;
    setEnrolling(courseId);
    setError('');

    const { count: enrolledCount } = await supabase
      .from('course_enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', userId)
      .eq('status', 'enrolled');

    if (enrolledCount && enrolledCount >= MAX_COURSES_PER_STUDENT) {
      setError(`Tu es déjà inscrit à ${MAX_COURSES_PER_STUDENT} cours. Pour t'inscrire à un nouveau cours, désinscris-toi d'abord d'un autre.`);
      setEnrolling(null);
      return;
    }

    const { data: existing } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('student_id', userId)
      .eq('course_id', courseId)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (existing) {
      setError('Tu es déjà inscrit à ce cours.');
      setEnrolling(null);
      return;
    }

    const { error: err } = await supabase.from('course_enrollments').insert({
      student_id: userId,
      course_id: courseId,
      status: 'enrolled',
    });

    if (err) {
      if (err.code === '23505') {
        setError('Tu es déjà inscrit à ce cours.');
      } else {
        setError(err.message);
      }
    } else {
      toast(t('success.created', lang, 'Inscription'), 'success');
      setResults(prev => prev.map(c => c.id === courseId ? { ...c, current_enrollments: c.current_enrollments + 1 } : c));
    }
    setEnrolling(null);
  };

  const goToStep = (s: number) => { setStep(s); setError(''); };

  const steps = [
    { label: 'Niveau', done: !!category },
    { label: 'Année', done: !!selectedLevel },
    { label: stream ? 'Branche' : null, done: stream ? !!stream : true },
    { label: 'Matière', done: !!selectedSubject },
    { label: 'Type', done: !!courseType },
    { label: 'Résultats', done: false },
  ].filter(s => s.label);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-6 w-6" style={{ color: 'var(--primary)' }} />
        <div>
          <h1 className="text-2xl font-bold">{isParent ? "Inscrire mon enfant" : "S'inscrire à un cours"}</h1>
          <p className="text-muted text-sm">Suis les étapes pour trouver le cours parfait</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => s.done && goToStep(i)}
            className={`flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              step === i ? 'shadow-sm' : s.done ? 'cursor-pointer' : 'opacity-50 cursor-default'
            }`}
            style={{
              backgroundColor: step === i ? 'var(--primary)' : s.done ? 'var(--primary-light)' : 'var(--bg-card)',
              color: step === i ? 'white' : s.done ? 'var(--primary)' : 'var(--fg-muted)',
              border: step === i ? 'none' : '1px solid var(--border)',
            }}
          >
            {s.done && step !== i ? <Check className="h-3 w-3" /> : <span className="font-bold">{i + 1}</span>}
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border p-4 text-sm font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* Step 0: Parent child selection */}
      {isParent && step === 0 && (
        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4">Choisir un enfant</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {children.map((c: any) => (
              <button
                key={c.id}
                onClick={() => { setSelectedChild(c); goToStep(1); }}
                className="flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md"
                style={{ borderColor: 'var(--border)', backgroundColor: selectedChild?.id === c.id ? 'var(--primary-light)' : 'transparent' }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                  {c.first_name[0]}{c.last_name[0]}
                </div>
                <div>
                  <p className="font-medium">{c.first_name} {c.last_name}</p>
                  <p className="text-xs text-muted">{c.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Category */}
      {(step === (isParent ? 1 : 0)) && (
        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4">Quel niveau ?</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => { setCategory(c.value); setSelectedLevel(null); setStream(''); setSelectedSubject(null); setCourseType(''); setResults([]); goToStep(step + 1); }}
                className="flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ borderColor: category === c.value ? 'var(--primary)' : 'var(--border)', backgroundColor: category === c.value ? 'var(--primary-light)' : 'var(--bg-card)' }}
              >
                <span className="text-3xl">{c.icon}</span>
                <span className="font-semibold">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Year / Level */}
      {(step === (isParent ? 2 : 1)) && category && (
        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4">Choisis l'année</h2>
          {category === 'lycee' && availableStreams.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Branche</p>
              <div className="flex gap-2">
                {availableStreams.map(s => (
                  <button
                    key={s}
                    onClick={() => setStream(s)}
                    className="rounded-lg px-4 py-2 text-sm font-medium transition-all"
                    style={{
                      backgroundColor: stream === s ? 'var(--primary)' : 'var(--primary-light)',
                      color: stream === s ? 'white' : 'var(--primary)',
                    }}
                  >
                    {s === 'sci' ? 'Scientifique' : s === 'lettres' ? 'Lettres' : s === 'gestion' ? 'Gestion & Économie' : s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {filteredByStream.map(l => (
              <button
                key={l.id}
                onClick={() => { setSelectedLevel(l); setSelectedSubject(null); setCourseType(''); setResults([]); goToStep(step + 1); }}
                className="rounded-xl border p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{
                  borderColor: selectedLevel?.id === l.id ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: selectedLevel?.id === l.id ? 'var(--primary-light)' : 'var(--bg-card)',
                }}
              >
                <p className="font-semibold text-lg">{l.name}</p>
                <p className="text-xs text-muted mt-1">{l.category}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Subject */}
      {(step === (isParent ? 3 : 2)) && selectedLevel && (
        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-1">Choisis la matière</h2>
          <p className="text-sm text-muted mb-4">{selectedLevel.name}</p>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {subjects.map(s => (
              <button
                key={s.id}
                onClick={() => { setSelectedSubject(s); setCourseType(''); setResults([]); goToStep(step + 1); }}
                className="rounded-xl border p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{
                  borderColor: selectedSubject?.id === s.id ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: selectedSubject?.id === s.id ? 'var(--primary-light)' : 'var(--bg-card)',
                }}
              >
                <BookOpen className="mx-auto mb-2 h-5 w-5" style={{ color: 'var(--primary)' }} />
                <p className="font-medium text-sm">{s.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Type */}
      {(step === (isParent ? 4 : 3)) && selectedSubject && (
        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-1">Type de cours</h2>
          <p className="text-sm text-muted mb-4">{selectedLevel?.name} — {selectedSubject?.name}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { value: 'normal', label: 'Normal', desc: 'Cours en groupe', icon: '👥', price: 'À partir de 3000 DA' },
              { value: 'vip', label: 'VIP', desc: 'Groupe réduit', icon: '⭐', price: 'À partir de 5000 DA' },
              { value: 'private', label: 'Particulier', desc: 'Cours individuel', icon: '👤', price: 'À partir de 8000 DA' },
            ].map(t => (
              <button
                key={t.value}
                onClick={() => { setCourseType(t.value); handleSearch(); }}
                className="rounded-xl border p-5 text-center transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{
                  borderColor: courseType === t.value ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: courseType === t.value ? 'var(--primary-light)' : 'var(--bg-card)',
                }}
              >
                <span className="text-3xl block mb-2">{t.icon}</span>
                <p className="font-semibold">{t.label}</p>
                <p className="text-xs text-muted mt-1">{t.desc}</p>
                <p className="text-xs font-medium mt-2" style={{ color: 'var(--primary)' }}>{t.price}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Results */}
      {(step === 6) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {results.length} cours trouvé{results.length > 1 ? 's' : ''}
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-20" style={{ color: 'var(--fg-muted)' }} />
              <p className="font-medium">Aucun cours disponible</p>
              <p className="text-sm text-muted mt-1">Essaie de modifier tes critères de recherche.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map(c => (
                <div
                  key={c.id}
                  className="rounded-2xl border overflow-hidden transition-all hover:shadow-md"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
                          {c.teacher.first_name[0]}{c.teacher.last_name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-lg">{c.name}</p>
                          <p className="text-sm text-muted">{c.teacher.first_name} {c.teacher.last_name}</p>
                          {c.teacher.specialties.length > 0 && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>{c.teacher.specialties.join(', ')}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{c.price.toLocaleString()} DA</p>
                        <p className="text-xs text-muted">{c.current_enrollments}/{c.capacity} places</p>
                      </div>
                    </div>

                    {c.schedules.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {c.schedules.map((s: any) => (
                          <div
                            key={s.id}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs"
                            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
                          >
                            <Clock className="h-3 w-3" />
                            <span className="font-medium">{DAY_LABELS_FR[s.day_of_week] || s.day_of_week}</span>
                            <span>{s.start_time?.slice(0, 5)}-{s.end_time?.slice(0, 5)}</span>
                            {s.room?.name && (
                              <>
                                <span className="opacity-40">|</span>
                                <MapPin className="h-3 w-3" />
                                <span>{s.room.name}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleEnroll(c.id)}
                      disabled={enrolling === c.id || c.current_enrollments >= c.capacity}
                      className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ backgroundColor: c.current_enrollments >= c.capacity ? 'var(--fg-muted)' : 'var(--primary)' }}
                    >
                      {enrolling === c.id ? (
                        <Loader className="inline h-4 w-4 animate-spin" />
                      ) : c.current_enrollments >= c.capacity ? (
                        'Complet'
                      ) : (
                        "S'inscrire — " + c.price.toLocaleString() + ' DA'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => goToStep(step - 1)}
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: 'var(--fg-muted)' }}
          >
            <ChevronLeft className="h-4 w-4" /> Modifier les critères
          </button>
        </div>
      )}
    </div>
  );
}
