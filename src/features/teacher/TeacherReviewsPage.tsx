import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TeacherReviewsPage() {
  const { profile } = useAuth();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['teacher-reviews', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('evaluations')
        .select('*, student:users!student_id(first_name, last_name, photo_url)')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const avgScore = reviews?.length
    ? (reviews.reduce((sum, r) => sum + (r.average_score ?? (r.teaching_quality + r.communication + r.punctuality + r.organization) / 4), 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Star className="h-6 w-6 text-amber-500" />
        Évaluations
        {reviews?.length ? <span className="text-sm font-normal text-muted-foreground ml-2">· {avgScore}/5 ({reviews.length} avis)</span> : ''}
      </h1>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : !reviews?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune évaluation pour le moment</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const score = r.average_score ?? (r.teaching_quality + r.communication + r.punctuality + r.organization) / 4;
            return (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                      {r.student?.first_name?.[0]}{r.student?.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{r.student?.first_name} {r.student?.last_name}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < Math.round(score) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{score.toFixed(1)}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground ml-12">"{r.comment}"</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
