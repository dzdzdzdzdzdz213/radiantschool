import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

import { useToast } from '@/hooks/useToast';
import { BookOpen, Check, Clock, Loader2, UserRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectItem } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { getFullName } from '@/lib/utils';

interface ChildRow {
  student_id: string;
  students: { user: { id: string; first_name: string | null; last_name: string | null } | null } | null;
}

export default function StudentEnrollPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isParent = profile?.role === 'parent';
  const [selectedChildId, setSelectedChildId] = useState<string>('');

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

  // Parents enroll one of their children, not themselves.
  const { data: children } = useQuery({
    queryKey: ['parent-children', profile?.id],
    queryFn: async (): Promise<ChildRow[]> => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('student_parent')
        .select('student_id, students(user:users(id, first_name, last_name))')
        .eq('parent_id', profile.id);
      if (error) throw error;
      return (data ?? []) as unknown as ChildRow[];
    },
    enabled: isParent && !!profile?.id,
  });

  const effectiveStudentId = isParent ? selectedChildId : (profile?.id ?? '');

  const { data: myEnrollments } = useQuery({
    queryKey: ['my-enrollments-ids', effectiveStudentId],
    queryFn: async () => {
      if (!effectiveStudentId) return [];
      const { data } = await supabase
        .from('course_enrollments')
        .select('course_id, status')
        .eq('student_id', effectiveStudentId);
      return data ?? [];
    },
    enabled: !!effectiveStudentId,
  });

  const enrollMut = useMutation({
    mutationFn: async (courseId: number) => {
      if (!profile?.id) throw new Error('Not logged in');
      if (!effectiveStudentId) throw new Error("Veuillez d'abord sélectionner un enfant.");
      const { error } = await supabase.from('course_enrollments').insert({
        student_id: effectiveStudentId,
        course_id: courseId,
        status: 'pending_approval',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-enrollments-ids'] });
      qc.invalidateQueries({ queryKey: ['student-courses'] });
      qc.invalidateQueries({ queryKey: ['student-dashboard'] });
      qc.invalidateQueries({ queryKey: ['registrations'] });
      toast(isParent ? "Demande d'inscription envoyée pour votre enfant ! En attente de validation." : 'Demande d\'inscription envoyée ! En attente de validation.', 'success');
    },
    onError: (err) => toast(err?.message || 'Erreur lors de l\'inscription', 'error'),
  });

  const activeCount = (myEnrollments ?? []).filter(e => e.status === 'active' || e.status === 'pending_approval').length;
  const remaining = Math.max(0, 8 - activeCount);

  const getEnrollmentStatus = (courseId: number) => {
    const found = myEnrollments?.find(e => e.course_id === courseId && e.status !== 'cancelled' && e.status !== 'completed');
    return found?.status ?? null;
  };

  const needsChildPick = isParent && !selectedChildId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6" /> Inscription aux formations</h1>
        {!needsChildPick && (
          <p className="text-sm text-muted-foreground">{activeCount}/8 inscriptions · {remaining} restante{remaining !== 1 ? 's' : ''}</p>
        )}
      </div>

      {isParent && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <UserRound className="h-5 w-5 text-primary shrink-0" />
          <span className="text-sm text-muted-foreground shrink-0">Enfant à inscrire :</span>
          {children === undefined ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : children.length === 0 ? (
            <span className="text-sm font-medium text-destructive">Aucun enfant lié à votre compte. Contactez l'administration.</span>
          ) : (
            <Select value={selectedChildId} onValueChange={setSelectedChildId} placeholder="Choisir un enfant…" className="max-w-xs">
              {children.map((c) => {
                const u = c.students?.user;
                return (
                  <SelectItem key={c.student_id} value={c.student_id}>
                    {getFullName(u?.first_name ?? '', u?.last_name ?? '')}
                  </SelectItem>
                );
              })}
            </Select>
          )}
        </div>
      )}

      {needsChildPick ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Sélectionnez un enfant ci-dessus pour voir les formations disponibles.
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses?.map((course) => {
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
                    <span>{course.price != null ? formatCurrency(course.price) : '—'}</span>
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
