import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

export default function StudentCoursesPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: enrollments, isLoading, isError } = useQuery({
    queryKey: ['student_courses', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('course_enrollments')
        .select('id, status, enrollment_date, progress, course:courses!inner(id, name, description, type, price, duration, capacity, status, teacher:users!teacher_id(first_name, last_name))')
        .eq('student_id', profile.id)
        .order('enrollment_date', { ascending: false });
      return (data ?? []).map((e: any) => ({
        id: e.id,
        progress: e.progress ?? 0,
        status: e.status,
        enrolledAt: e.enrollment_date,
        course: {
          id: e.course?.id,
          name: e.course?.name ?? '',
          description: e.course?.description ?? '',
          type: e.course?.type ?? '',
          price: e.course?.price ?? 0,
          duration: e.course?.duration ?? '',
          teacher: `${e.course?.teacher?.first_name ?? ''} ${e.course?.teacher?.last_name ?? ''}`,
          capacity: e.course?.capacity ?? 0,
          status: e.course?.status ?? '',
        },
      }));
    },
    enabled: !!profile?.id,
  });

  useEffect(() => { if (isError) toast('Erreur lors du chargement des cours', 'error'); }, [isError]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Mes cours</h1><p className="text-sm text-muted-foreground mt-1">{enrollments?.length ?? 0} cours inscrits</p></div>
        <Button className="h-9 gap-2" onClick={() => navigate('/student/enroll')}><BookOpen className="h-4 w-4" />S'inscrire</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />))
        : (enrollments ?? []).length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-16 text-muted-foreground">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-1">Aucun cours inscrit</p>
            <p className="text-sm mb-4">Inscrivez-vous à un cours pour commencer</p>
            <Button onClick={() => navigate('/student/enroll')}>Parcourir les cours</Button>
          </div>
        ) : (enrollments ?? []).map((e: any) => (
          <Card key={e.id} className="hover:shadow-md transition-all duration-300 cursor-pointer group" onClick={() => navigate(`/student/courses/${e.course.id}`)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><BookOpen className="h-5 w-5 text-primary" /></div>
                <Badge variant={e.status === 'active' ? 'success' : 'outline'} className="text-[10px]">{e.status === 'active' ? 'Actif' : e.status}</Badge>
              </div>
              <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{e.course.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{e.course.description}</p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><Users className="h-3 w-3" />{e.course.teacher}</p>
                <p className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{e.course.duration || 'À déterminer'}</p>
                <p className="flex items-center gap-1.5"><DollarSign className="h-3 w-3" />{e.course.price} DA</p>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] mb-1"><span>Progression</span><span>{e.progress}%</span></div>
                <div className="h-1.5 bg-accent rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${e.progress}%` }} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}