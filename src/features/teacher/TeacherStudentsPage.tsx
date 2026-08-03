import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Users, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

export default function TeacherStudentsPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['teacher-students', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: courseIds } = await supabase.from('courses').select('id').eq('teacher_id', profile.id);
      if (!courseIds?.length) return [];
      const { data } = await supabase
        .from('course_enrollments')
        .select(`
          id, enrollment_date, status,
          student:students!student_id(id, user:users!id(id, first_name, last_name, email, phone, photo_url)),
          course:courses!course_id(name)
        `)
        .in('course_id', courseIds.map(c => c.id))
        .order('enrollment_date', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 2,
  });

  const uniqueStudents = new Map<string, any>();
  for (const e of enrollments ?? []) {
    const s = (e as any).student;
    const u = s?.user;
    if (u && !uniqueStudents.has(u.id)) uniqueStudents.set(u.id, { ...u, course: (e as any).course, enrolledAt: (e as any).enrollment_date });
  }

  const filtered = Array.from(uniqueStudents.values()).filter((s) =>
    `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Mes élèves ({uniqueStudents.size})
        </h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..." className="w-full h-10 rounded-xl pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary bg-muted/50 border" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun élève trouvé</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {filtered.map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary shrink-0">
                  {s.first_name?.[0]}{s.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{s.first_name} {s.last_name}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{s.course?.name}</p>
                  <p>depuis {new Date(s.enrolledAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
