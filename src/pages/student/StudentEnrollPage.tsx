import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useToast } from '@/hooks/useToast';
import { BookOpen, Check, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentEnrollPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['available-courses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, name, type, price, capacity, current_enrollments, subject:subjects(name), level:levels(name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const { data: myEnrollments } = useQuery({
    queryKey: ['my-enrollments-ids', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('course_enrollments')
        .select('course_id, status')
        .eq('student_id', profile.id);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const enrollMut = useMutation({
    mutationFn: async (courseId: number) => {
      if (!profile?.id) throw new Error('Not logged in');
      const { error } = await supabase.from('course_enrollments').insert({
        student_id: profile.id,
        course_id: courseId,
        status: 'pending_approval',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-enrollments-ids'] });
      qc.invalidateQueries({ queryKey: ['student-courses'] });
      qc.invalidateQueries({ queryKey: ['student-dashboard'] });
      toast('Demande d\'inscription envoyée ! En attente de validation.', 'success');
    },
    onError: (err: any) => toast(err?.message || 'Erreur lors de l\'inscription', 'error'),
  });

  const getEnrollmentStatus = (courseId: number) => {
    const found = myEnrollments?.find(e => e.course_id === courseId);
    return found?.status ?? null;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6" /> Inscription aux formations</h1>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses?.map((course: any) => {
            const status = getEnrollmentStatus(course.id);
            const full = course.capacity > 0 && (course.current_enrollments ?? 0) >= course.capacity;
            const borderClass = status === 'active' ? 'border-green-300' : status === 'pending_approval' ? 'border-amber-300' : '';
            return (
              <Card key={course.id} className={borderClass}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{course.name}</p>
                      <p className="text-xs text-muted-foreground">{course.subject?.name} · {course.level?.name}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">{course.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{course.price?.toLocaleString()} DA</span>
                    {course.capacity > 0 && <span className="text-muted-foreground">{course.current_enrollments ?? 0}/{course.capacity}</span>}
                  </div>
                  <button
                    onClick={() => enrollMut.mutate(course.id)}
                    disabled={!!status || full || enrollMut.isPending}
                    className={`mt-4 w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium ${
                      status === 'active' ? 'bg-green-100 text-green-700 cursor-default' :
                      status === 'pending_approval' ? 'bg-amber-100 text-amber-700 cursor-default' :
                      full ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                      'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    {enrollMut.isPending && enrollMut.variables === course.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : status === 'active' ? (
                      <><Check className="h-4 w-4" /> Inscrit</>
                    ) : status === 'pending_approval' ? (
                      <><Clock className="h-4 w-4" /> En attente</>
                    ) : full ? (
                      'Complet'
                    ) : (
                      "S'inscrire"
                    )}
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
