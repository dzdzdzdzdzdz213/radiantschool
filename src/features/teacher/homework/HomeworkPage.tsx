import { useState } from 'react';
import { Search, Plus, BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = { completed: 'text-emerald-600', pending: 'text-amber-600', overdue: 'text-red-600' };
const STATUS_ICONS: Record<string, any> = { completed: CheckCircle, pending: Clock, overdue: AlertCircle };
const STATUS_LABELS: Record<string, string> = { completed: 'Rendu', pending: 'En attente', overdue: 'En retard' };

export default function HomeworkPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['teacher_homework', profile?.id, debouncedSearch],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('assignment_submissions')
        .select('id, status, submitted_at, grade, feedback, student:users!student_id(first_name, last_name), assignment:assignments!inner(title, due_date, course:courses(name))')
        .eq('assignment.teacher_id', profile.id)
        .order('submitted_at', { ascending: false });
      const { data } = await q;
      let items = (data ?? []).map((s: any) => ({ ...s, studentName: `${s.student?.first_name ?? ''} ${s.student?.last_name ?? ''}` }));
      if (debouncedSearch) items = items.filter((i: any) => i.studentName.toLowerCase().includes(debouncedSearch.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Devoirs à rendre</h1><p className="text-sm text-muted-foreground mt-1">Suivi des travaux remis par les élèves</p></div>
        <Button variant="outline" className="h-9 gap-2"><Plus className="h-4 w-4" />Nouveau devoir</Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par élève..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />))
            : (submissions ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>Aucune soumission pour le moment</p></div>
            ) : (submissions ?? []).map((s: any) => {
              const Icon = STATUS_ICONS[s.status] ?? Clock;
              return (
                <div key={s.id} className="flex items-center gap-4 rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                  <Icon className={`h-5 w-5 shrink-0 ${STATUS_COLORS[s.status] ?? 'text-muted-foreground'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{s.studentName}</p>
                    <p className="text-xs text-muted-foreground">{s.assignment?.title ?? ''} — {s.assignment?.course?.name ?? ''}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Remis le {formatDate(s.submitted_at)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{STATUS_LABELS[s.status] ?? s.status}</p>
                    {s.grade && <p className="text-sm font-semibold">{s.grade}/20</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}