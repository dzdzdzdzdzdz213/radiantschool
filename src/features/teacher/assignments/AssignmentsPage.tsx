import { useState } from 'react';
import { Search, Plus, FileText, Calendar, Clock, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/utils';

export default function AssignmentsPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['teacher_assignments', profile?.id, debouncedSearch],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('assignments')
        .select('id, title, description, due_date, created_at, file_url, course:courses(name)')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });
      const { data } = await q;
      let items = data ?? [];
      if (debouncedSearch) items = items.filter((i: any) => i.title?.toLowerCase().includes(debouncedSearch.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Devoirs</h1><p className="text-sm text-muted-foreground mt-1">Gérer les devoirs et exercices</p></div>
        <Button className="h-9 gap-2"><Plus className="h-4 w-4" />Nouveau devoir</Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un devoir..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 rounded-xl border p-4"><div className="flex-1 space-y-2"><div className="h-5 bg-muted rounded animate-pulse w-1/3" /><div className="h-4 bg-muted rounded animate-pulse w-2/3" /></div></div>
            )) : (assignments ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Aucun devoir créé</p>
              </div>
            ) : (assignments ?? []).map((a: any) => (
              <div key={a.id} className="flex items-start gap-4 rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm">{a.title}</h4>
                    <Badge variant="outline" className="text-[10px]">{a.course?.name ?? ''}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description ?? ''}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Créé le {formatDate(a.created_at)}</span>
                    {a.due_date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Remise: {formatDate(a.due_date)}</span>}
                  </div>
                </div>
                {a.file_url && <Button variant="ghost" size="sm" className="shrink-0"><Download className="h-4 w-4" /></Button>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}