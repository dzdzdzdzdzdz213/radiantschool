import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function StudentCoursesPage() {
  const { profile } = useAuth();
  const { lang } = useLang();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['student-courses', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('course_enrollments')
        .select('*, course:courses(name, type, price, status, subject:subjects(name), level:levels(name))')
        .eq('student_id', profile.id)
        .in('status', ['active', 'pending_approval'])
        .order('enrollment_date', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6" /> {t('nav.my_courses', lang)}</h1>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : !enrollments?.length ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">{t('common.no_data', lang)}</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e: any) => (
            <Card key={e.id}>
              <CardContent className="p-5">
                <p className="font-semibold">{e.course?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{e.course?.subject?.name} · {e.course?.level?.name}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{e.course?.type}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{e.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
