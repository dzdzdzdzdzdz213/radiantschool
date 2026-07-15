import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function TeacherOnlineClassesPage() {
  const { profile } = useAuth();
  const [link, setLink] = useState('');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['teacher-online-courses', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('courses')
        .select('id, name, type, schedules:course_schedules(day_of_week, start_time, end_time)')
        .eq('teacher_id', profile.id)
        .in('status', ['active'])
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Video className="h-6 w-6" />Cours en ligne</h1>

      {courses?.map((c: any) => (
        <Card key={c.id}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{c.name}</p>
                {c.schedules?.[0] && (
                  <p className="text-xs text-muted-foreground">{c.schedules[0].day_of_week} {c.schedules[0].start_time?.slice(0,5)}-{c.schedules[0].end_time?.slice(0,5)}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Lien Google Meet/Zoom" value={link} onChange={e => setLink(e.target.value)} className="h-9 text-sm w-56" />
                <a href={link || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50" onClick={e => !link && e.preventDefault()} style={!link ? { pointerEvents: 'none', opacity: 0.5 } : {}}>Rejoindre</a>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {!isLoading && !courses?.length && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun cours actif</CardContent></Card>
      )}
    </div>
  );
}
