import { useState } from 'react';
import { Search, Plus, Star, Calendar, Clock, Euro } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/utils';

export default function VipClassesPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['teacher_vip_classes', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('vip_classes')
        .select('id, date, start_time, end_time, price, status, notes, student:users!student_id(first_name, last_name)')
        .eq('teacher_id', profile.id)
        .order('date', { ascending: false });
      const { data } = await q;
      let items = (data ?? []).map((l: any) => ({ ...l, studentName: `${l.student?.first_name ?? ''} ${l.student?.last_name ?? ''}` }));
      if (search) items = items.filter((i: any) => i.studentName.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><h1 className="text-2xl font-bold tracking-tight">Cours VIP</h1><Star className="h-5 w-5 text-amber-500" /></div>
        <Button className="h-9 gap-2"><Plus className="h-4 w-4" />Nouveau cours VIP</Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />))
            : (lessons ?? []).length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>Aucun cours VIP</p>
              </div>
            ) : (lessons ?? []).map((l: any) => (
              <div key={l.id} className="rounded-xl border border-amber-200 dark:border-amber-900 p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={l.status === 'completed' ? 'success' : l.status === 'cancelled' ? 'destructive' : 'outline'} className="text-[10px]">
                    {l.status === 'completed' ? 'Effectué' : l.status === 'cancelled' ? 'Annulé' : 'Planifié'}
                  </Badge>
                  <span className="text-sm font-semibold flex items-center gap-1"><Euro className="h-3.5 w-3.5" />{l.price ?? 0}</span>
                </div>
                <h4 className="text-sm font-medium">{l.studentName}</h4>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(l.date)}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(l.start_time)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}