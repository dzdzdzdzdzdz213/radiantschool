import { useState } from 'react';
import { Search, Plus, Video, Monitor, Calendar, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/utils';

export default function OnlineClassesPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['teacher_online_sessions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('online_classes')
        .select('id, title, description, platform, meeting_url, start_time, end_time, status, created_at, course:courses(name)')
        .eq('teacher_id', profile.id)
        .order('start_time', { ascending: false });
      let items = data ?? [];
      if (search) items = items.filter((i: any) => i.title?.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Cours en ligne</h1><p className="text-sm text-muted-foreground mt-1">Sessions virtuelles et classes à distance</p></div>
        <Button className="h-9 gap-2"><Plus className="h-4 w-4" />Planifier</Button>
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
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />))
            : (sessions ?? []).length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>Aucune session planifiée</p>
              </div>
            ) : (sessions ?? []).map((s: any) => (
              <div key={s.id} className="rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={s.status === 'completed' ? 'secondary' : s.status === 'live' ? 'success' : 'outline'}>
                    {s.status === 'completed' ? 'Terminé' : s.status === 'live' ? 'En direct' : 'Planifié'}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Monitor className="h-3 w-3" />{s.platform ?? 'Zoom'}
                  </div>
                </div>
                <h4 className="text-sm font-medium truncate">{s.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{s.course?.name ?? ''}</p>
                <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(s.start_time)}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{formatTime(s.start_time)}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 h-8 text-xs gap-2" asChild>
                  <a href={s.meeting_url ?? '#'} target="_blank" rel="noreferrer"><Video className="h-3.5 w-3.5" />Rejoindre</a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}