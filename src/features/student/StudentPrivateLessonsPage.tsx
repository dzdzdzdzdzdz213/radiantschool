import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatTime } from '@/lib/utils';

export default function StudentPrivateLessonsPage() {
  const { profile } = useAuth();

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['student_private_lessons', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data } = await supabase
        .from('private_lessons')
        .select('*, teacher:users!teacher_id(first_name, last_name), course:courses(name)')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><UserPlus className="h-6 w-6" />Mes cours particuliers</h1>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : !lessons?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          Aucune demande de cours particulier. <a href="/formations" className="text-primary hover:underline">Parcourir les formations</a>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {lessons.map((l: any) => (
            <Card key={l.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary shrink-0">
                  {l.teacher?.first_name?.[0]}{l.teacher?.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">
                      {l.teacher ? `${l.teacher.first_name} ${l.teacher.last_name}` : 'Professeur'}
                    </p>
                    {l.course && <span className="text-xs text-muted-foreground">· {l.course.name}</span>}
                  </div>
                  {l.date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatDate(l.date)} · {formatTime(l.start_time)} — {formatTime(l.end_time)}
                    </p>
                  )}
                  {l.price != null && (
                    <p className="text-xs text-muted-foreground mt-0.5">{Number(l.price).toLocaleString()} DA</p>
                  )}
                </div>
                <div className="shrink-0">
                  {l.status === 'accepted' && <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full"><CheckCircle className="h-3 w-3" />Accepté</span>}
                  {l.status === 'rejected' && <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-full"><XCircle className="h-3 w-3" />Refusé</span>}
                  {l.status === 'pending' && <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full"><Clock className="h-3 w-3" />En attente</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
