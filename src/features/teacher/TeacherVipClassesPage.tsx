import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TeacherVipClassesPage() {
  const { profile } = useAuth();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['teacher-vip-courses', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('courses')
        .select('id, name, current_enrollments, capacity, price, status, subject:subjects(name), level:levels(name, stream), schedules:course_schedules(day_of_week, start_time, end_time)')
        .eq('teacher_id', profile.id)
        .eq('type', 'vip')
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Star className="h-6 w-6 text-amber-500" />
        Classes VIP
      </h1>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />)}
        </div>
      ) : !courses?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune classe VIP</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c: any) => (
            <Card key={c.id} className="border-amber-200/50">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold">{c.name}</p>
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0 ml-2" />
                </div>
                <p className="text-xs text-muted-foreground mb-3">{c.subject?.name} · {c.level?.name}{c.level?.stream ? ` · ${c.level.stream}` : ''}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-amber-600">{Number(c.price).toLocaleString()} DA</span>
                  <span className="text-xs text-muted-foreground">{c.current_enrollments ?? 0}/{c.capacity} places</span>
                </div>
                {c.schedules?.[0] && (
                  <p className="text-xs text-muted-foreground mt-2">{c.schedules[0].day_of_week} {c.schedules[0].start_time?.slice(0,5)}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
