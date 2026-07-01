import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getFullName } from '@/lib/utils';
import { Star, Trophy, Medal, Award, Funnel } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface TeacherRating {
  teacherId: string;
  firstName: string;
  lastName: string;
  speciality: string | null;
  avgTeaching: number;
  avgCommunication: number;
  avgPunctuality: number;
  avgOrganization: number;
  avgOverall: number;
  reviewCount: number;
  photoUrl: string | null;
}

interface Level {
  id: number; name: string; category: string; stream: string | null; sort_order: number;
}
interface Subject {
  id: number; name: string;
}

const MEDAL_COLORS = ['#f59e0b', '#94a3b8', '#cd7f32'];
const CATEGORIES = [
  { value: '', label: 'Tous' },
  { value: 'primaire', label: 'Primaire' },
  { value: 'college', label: 'CEM' },
  { value: 'lycee', label: 'Lycée' },
];

export default function LeaderboardPage() {
  const { toast } = useToast();
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | ''>('');
  const [filterSubject, setFilterSubject] = useState<number | ''>('');

  const [showFilters, setShowFilters] = useState(false);

  const { data: levels = [] } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const { data } = await supabase.from('levels').select('*').order('sort_order');
      return (data ?? []) as Level[];
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data } = await supabase.from('subjects').select('*').order('name');
      return (data ?? []) as Subject[];
    },
  });

  const { data: teachers = [], isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data: evals, error: evalError } = await supabase
        .from('evaluations')
        .select('teacher_id, teaching_quality, communication, punctuality, organization, average_score');
      if (evalError) throw evalError;
      if (!evals || evals.length === 0) return [];

      const grouped: Record<string, { sums: number[]; count: number }> = {};
      evals.forEach(e => {
        if (!grouped[e.teacher_id]) grouped[e.teacher_id] = { sums: [0, 0, 0, 0, 0], count: 0 };
        grouped[e.teacher_id].sums[0] += e.teaching_quality;
        grouped[e.teacher_id].sums[1] += e.communication;
        grouped[e.teacher_id].sums[2] += e.punctuality;
        grouped[e.teacher_id].sums[3] += e.organization;
        grouped[e.teacher_id].sums[4] += e.average_score;
        grouped[e.teacher_id].count++;
      });

      const teacherIds = Object.keys(grouped);
      const [usersRes, teacherRes] = await Promise.all([
        supabase.from('users').select('id, first_name, last_name, photo_url').in('id', teacherIds),
        supabase.from('teachers').select('id, speciality').in('id', teacherIds),
      ]);

      const specMap = new Map((teacherRes.data || []).map(t => [t.id, t.speciality]));
      const userMap = new Map((usersRes.data || []).map(u => [u.id, u]));

      const list: TeacherRating[] = teacherIds.map(id => {
        const g = grouped[id];
        const u = userMap.get(id);
        return {
          teacherId: id,
          firstName: u?.first_name || '',
          lastName: u?.last_name || '',
          speciality: specMap.get(id) || null,
          avgTeaching: Math.round((g.sums[0] / g.count) * 10) / 10,
          avgCommunication: Math.round((g.sums[1] / g.count) * 10) / 10,
          avgPunctuality: Math.round((g.sums[2] / g.count) * 10) / 10,
          avgOrganization: Math.round((g.sums[3] / g.count) * 10) / 10,
          avgOverall: Math.round((g.sums[4] / g.count) * 10) / 10,
          reviewCount: g.count,
          photoUrl: u?.photo_url || null,
        };
      });

      list.sort((a, b) => b.avgOverall - a.avgOverall || b.reviewCount - a.reviewCount);
      return list;
    },
  });

  useEffect(() => {
    if (error) toast('Erreur de chargement', 'error');
  }, [error]);

  const displayList = (() => {
    if (!filterCategory && !filterLevel) return teachers;
    let result = [...teachers];
    return result;
  })();

  const filteredLevels = filterCategory ? levels.filter(l => l.category === filterCategory) : levels;

  if (isLoading) {
    return <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
    </div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6" style={{ color: 'var(--primary)' }} />
          <div>
            <h1 className="text-2xl font-bold">Classement des enseignants</h1>
            <p className="text-muted text-sm">Basé sur les évaluations des élèves</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:shadow-sm"
          style={{ backgroundColor: showFilters ? 'var(--primary)' : 'var(--primary-light)', color: showFilters ? 'white' : 'var(--primary)' }}
        >
          <Funnel className="h-4 w-4" />
          Filtres
        </button>
      </div>

      {showFilters && (
        <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--fg-muted)' }}>Niveau</label>
              <div className="flex gap-1.5">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => { setFilterCategory(c.value); setFilterLevel(''); }}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                    style={{
                      backgroundColor: filterCategory === c.value ? 'var(--primary)' : 'var(--primary-light)',
                      color: filterCategory === c.value ? 'white' : 'var(--primary)',
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--fg-muted)' }}>Année</label>
              <select
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
              >
                <option value="">Toutes les années</option>
                {filteredLevels.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--fg-muted)' }}>Matière</label>
              <select
                value={filterSubject}
                onChange={e => setFilterSubject(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
              >
                <option value="">Toutes les matières</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {displayList.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <Award className="mx-auto mb-3 h-10 w-10" style={{ color: 'var(--fg-muted)', opacity: 0.2 }} />
          <p className="font-medium">Aucun résultat</p>
          <p className="text-sm text-muted mt-1">Essaie de modifier les filtres.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((t, i) => {
            const pos = i + 1;
            const showMedal = pos <= 3;
            return (
              <div
                key={t.teacherId}
                className="relative rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: showMedal ? MEDAL_COLORS[i] : 'var(--border)',
                }}
              >
                {showMedal && (
                  <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-10" style={{ backgroundColor: MEDAL_COLORS[i] }} />
                )}
                <div className="flex items-center gap-4 p-5">
                  {showMedal ? (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold" style={{ backgroundColor: `${MEDAL_COLORS[i]}20`, color: MEDAL_COLORS[i] }}>
                      <Medal className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                      #{pos}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{getFullName(t.firstName, t.lastName)}</p>
                      <span className="flex items-center gap-1 text-sm font-bold" style={{ color: MEDAL_COLORS[i] || 'var(--primary)' }}>
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {t.avgOverall}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {t.speciality && <span className="text-xs text-muted">{t.speciality}</span>}
                      <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                        {t.reviewCount} avis
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3 text-xs" style={{ color: 'var(--fg-muted)' }}>
                    <div className="text-center">
                      <p className="font-semibold" style={{ color: 'var(--fg)' }}>{t.avgTeaching}</p>
                      <p>Pédagogie</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold" style={{ color: 'var(--fg)' }}>{t.avgCommunication}</p>
                      <p>Communication</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold" style={{ color: 'var(--fg)' }}>{t.avgPunctuality}</p>
                      <p>Ponctualité</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold" style={{ color: 'var(--fg)' }}>{t.avgOrganization}</p>
                      <p>Organisation</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
