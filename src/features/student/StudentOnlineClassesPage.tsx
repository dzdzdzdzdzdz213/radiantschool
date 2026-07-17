import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Video, ExternalLink, Monitor } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function StudentOnlineClassesPage() {
  const { profile } = useAuth();

  const { data: onlineClasses, isLoading } = useQuery({
    queryKey: ['student-online-classes', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', profile.id)
        .eq('status', 'active');
      const courseIds = (enrollments ?? []).map((e: any) => e.course_id);
      if (!courseIds.length) return [];

      const { data } = await supabase
        .from('online_classes')
        .select('*, course:courses!course_id(name, teacher_id, teacher:users!teacher_id(first_name, last_name))')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Video className="h-6 w-6" />Cours en ligne</h1>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : !onlineClasses?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun cours en ligne pour le moment</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {onlineClasses.map((oc: any) => (
            <Card key={oc.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{oc.title}</p>
                    {oc.course && <span className="text-xs text-muted-foreground">· {oc.course.name}</span>}
                  </div>
                  {oc.course?.teacher && (
                    <p className="text-xs text-muted-foreground">{oc.course.teacher.first_name} {oc.course.teacher.last_name}</p>
                  )}
                  {oc.platform && <p className="text-xs text-muted-foreground mt-0.5">Sur {oc.platform}</p>}
                  {oc.description && <p className="text-xs text-muted-foreground mt-1">{oc.description}</p>}
                </div>
                <a
                  href={oc.meeting_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
                  onClick={e => !oc.meeting_url && e.preventDefault()}
                  style={!oc.meeting_url ? { pointerEvents: 'none', opacity: 0.5 } as React.CSSProperties : {}}
                >
                  Rejoindre <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
