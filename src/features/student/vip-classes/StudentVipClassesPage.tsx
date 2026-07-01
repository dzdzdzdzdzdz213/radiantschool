import { Plus, Star, Calendar, Clock, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/utils';

export default function StudentVipClassesPage() {
  const { profile } = useAuth();

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['student_vip_classes', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('vip_classes')
        .select('id, date, start_time, end_time, price, status, notes, teacher:users!teacher_id(first_name, last_name)')
        .eq('student_id', profile.id)
        .order('date', { ascending: false });
      return (data ?? []).map((l: any) => ({ ...l, teacherName: `${l.teacher?.first_name ?? ''} ${l.teacher?.last_name ?? ''}` }));
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><h1 className="text-2xl font-bold tracking-tight">Cours VIP</h1><Star className="h-5 w-5 text-amber-500" /></div>
        <Button className="h-9 gap-2"><Plus className="h-4 w-4" />Réserver</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-32 rounded-xl" />))
        : (lessons ?? []).length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-16 text-muted-foreground"><Star className="h-16 w-16 mx-auto mb-4 opacity-20" /><p className="text-lg font-medium">Aucun cours VIP</p><p className="text-sm">Réservez une session exclusive</p></div>
        ) : (lessons ?? []).map((l: any) => (
          <Card key={l.id} className="border-amber-200 dark:border-amber-900 hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Badge variant={l.status === 'completed' ? 'success' : l.status === 'cancelled' ? 'destructive' : 'outline'} className="text-[10px]">{l.status === 'completed' ? 'Effectué' : l.status === 'cancelled' ? 'Annulé' : 'Planifié'}</Badge>
                <span className="text-sm font-semibold flex items-center gap-1"><Euro className="h-3.5 w-3.5" />{l.price ?? 0}</span>
              </div>
              <p className="font-medium text-sm">{l.teacherName}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(l.date)}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(l.start_time)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}