import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { BookOpen, Star, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function TeacherCoursesPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const [search, setSearch] = useState('');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['teacher-courses', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('courses')
        .select(`
          id, name, type, capacity, current_enrollments, price, status, start_date, end_date,
          subject:subjects(name),
          level:levels(name, category, stream),
          schedules:course_schedules(id, day_of_week, start_time, end_time)
        `)
        .eq('teacher_id', profile.id)
        .in('status', ['active', 'pending'] as any)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 2,
  });

  const filtered = (courses ?? []).filter((c: any) =>
    [c.name, c.subject?.name, c.level?.name, c.level?.stream].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.my_courses', lang)}</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..." className="w-full h-10 rounded-xl pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary bg-muted/50 border" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Aucune formation trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c: any) => (
            <div key={c.id} className="rounded-xl border bg-card p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <p className="font-semibold truncate">{c.name}</p>
                {c.type === 'vip' && <Star className="h-4 w-4 text-amber-500 shrink-0 ml-2" />}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{c.subject?.name} · {c.level?.name}{c.level?.stream ? ` · ${c.level.stream}` : ''}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{c.current_enrollments ?? 0}/{c.capacity} places</span>
                <span className={`font-medium ${c.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>{c.status}</span>
              </div>
              {c.schedules?.[0] && (
                <p className="text-xs text-muted-foreground mt-2">{c.schedules[0].day_of_week} {c.schedules[0].start_time?.slice(0, 5)}-{c.schedules[0].end_time?.slice(0, 5)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
