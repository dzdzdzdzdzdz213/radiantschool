import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getFullName } from '@/lib/utils';
import { Star, MessageSquare, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Evaluation {
  id: number;
  teaching_quality: number;
  communication: number;
  punctuality: number;
  organization: number;
  average_score: number;
  comment: string | null;
  created_at: string;
  student: { first_name: string; last_name: string } | null;
}

export default function TeacherEvaluationsPage() {
  const { profile } = useAuth();
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: evaluations = [], isLoading, error } = useQuery({
    queryKey: ['teacher_evaluations', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from('evaluations')
        .select('*, student:student_id(first_name, last_name)')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Evaluation[];
    },
    enabled: !!profile,
  });

  if (isLoading) return <div className="p-8 text-center text-muted">Chargement...</div>;
  if (error) return <div className="flex items-center justify-center gap-2 p-8 text-center text-red-500"><AlertCircle className="h-5 w-5" />Erreur de chargement</div>;

  const stats = {
    total: evaluations.length,
    avg: evaluations.length ? (evaluations.reduce((s, e) => s + e.average_score, 0) / evaluations.length).toFixed(1) : '—',
    teaching: evaluations.length ? (evaluations.reduce((s, e) => s + e.teaching_quality, 0) / evaluations.length).toFixed(1) : '—',
    communication: evaluations.length ? (evaluations.reduce((s, e) => s + e.communication, 0) / evaluations.length).toFixed(1) : '—',
    punctuality: evaluations.length ? (evaluations.reduce((s, e) => s + e.punctuality, 0) / evaluations.length).toFixed(1) : '—',
    organization: evaluations.length ? (evaluations.reduce((s, e) => s + e.organization, 0) / evaluations.length).toFixed(1) : '—',
  };

  const factors = [
    { key: 'teaching_quality' as const, label: 'Qualité pédagogique', value: stats.teaching },
    { key: 'communication' as const, label: 'Communication', value: stats.communication },
    { key: 'punctuality' as const, label: 'Ponctualité', value: stats.punctuality },
    { key: 'organization' as const, label: 'Organisation', value: stats.organization },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Mes Évaluations</h1>

      {evaluations.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted">
          <Star className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>Aucune évaluation pour le moment.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-5">
            <div className="rounded-xl border bg-card p-4 text-center">
              <p className="text-2xl font-bold">{stats.avg}</p>
              <p className="text-xs text-muted">Moyenne</p>
            </div>
            {factors.map(f => (
              <div key={f.key} className="rounded-xl border bg-card p-4 text-center">
                <p className="text-2xl font-bold">{f.value}</p>
                <p className="text-xs text-muted">{f.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {evaluations.map(e => {
              const isOpen = expanded === e.id;
              return (
                <div key={e.id} className="rounded-xl border bg-card overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : e.id)}
                    className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover-bg-page"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{e.average_score.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-muted">
                        {e.student ? getFullName(e.student.first_name, e.student.last_name) : 'Anonyme'}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(e.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
                  </button>
                  {isOpen && (
                    <div className="border-t px-5 py-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {factors.map(f => (
                          <div key={f.key} className="rounded-lg bg-page p-3 text-center">
                            <p className="text-xs text-muted">{f.label}</p>
                            <div className="mt-1 flex items-center justify-center gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={cn('h-3.5 w-3.5', star <= e[f.key] ? 'fill-yellow-400 text-yellow-400' : 'text-muted opacity-30')}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {e.comment && (
                        <div className="flex items-start gap-2 rounded-lg bg-page p-3">
                          <MessageSquare className="mt-0.5 h-4 w-4 text-muted shrink-0" />
                          <p className="text-sm">{e.comment}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
