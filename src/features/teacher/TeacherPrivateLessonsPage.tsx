import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutationWithFeedback } from '@/hooks/useMutationFeedback';

export default function TeacherPrivateLessonsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ['teacher-inquiries'],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('private_lesson_inquiries')
        .select('*')
        .in('course_id', (
          await supabase.from('courses').select('id').eq('teacher_id', profile.id)
        ).data?.map(c => c.id) ?? [])
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const { data: privateLessons } = useQuery({
    queryKey: ['teacher-private-lessons'],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('private_lessons')
        .select('*, student:students!student_id(user:users!students_id_fkey(id, first_name, last_name, email, phone))')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const acceptMutation = useMutationWithFeedback(
    async (id: number) => {
      const { error } = await supabase.from('private_lessons').update({ status: 'accepted' }).eq('id', id);
      if (error) throw error;
    },
    { successMessage: 'Demande acceptée', invalidateQueries: [['teacher-private-lessons']] }
  );

  const rejectMutation = useMutationWithFeedback(
    async (id: number) => {
      const { error } = await supabase.from('private_lessons').update({ status: 'rejected' }).eq('id', id);
      if (error) throw error;
    },
    { successMessage: 'Demande refusée', invalidateQueries: [['teacher-private-lessons']] }
  );

  const allItems = [
    ...(inquiries ?? []).map((i) => ({ ...i, type: 'inquiry' as const, studentName: `${i.first_name} ${i.last_name}`, studentContact: i.email || i.phone, dateText: i.preferred_date })),
    ...(privateLessons ?? []).map((p) => ({ ...p, type: 'lesson' as const, studentName: `${p.student?.user?.first_name} ${p.student?.user?.last_name}`, studentContact: p.student?.user?.email || p.student?.user?.phone, status: p.status, dateText: p.date })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <UserPlus className="h-6 w-6" />
        Demandes de cours particuliers
      </h1>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : allItems.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune demande pour le moment</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {allItems.map((item) => (
            <Card key={`${item.type}-${item.id}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary shrink-0">
                  {item.studentName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{item.studentName}</p>
                  <p className="text-xs text-muted-foreground">{item.studentContact}</p>
                  {item.dateText && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.dateText} · {item.start_time?.slice(0,5)}-{item.end_time?.slice(0,5)}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  {item.type === 'lesson' && item.student?.user?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => navigate(`/teacher/messages?to=${item.student?.user?.id}&subject=Demande de cours particulier`)}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />Message
                    </Button>
                  )}
                  {item.type === 'lesson' ? (
                    item.status === 'pending' ? (
                      <div className="flex gap-1">
                        <button onClick={() => acceptMutation.mutate(item.id)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full hover:bg-green-200 font-medium">Accepter</button>
                        <button onClick={() => rejectMutation.mutate(item.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full hover:bg-red-200 font-medium">Refuser</button>
                      </div>
                    ) : (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        item.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{item.status}</span>
                    )
                  ) : (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Nouveau</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
