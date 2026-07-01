import { useState } from 'react';
import { Search, Plus, Megaphone, Pin, Calendar, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export default function AnnouncementsPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['teacher_announcements', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('announcements')
        .select('id, title, content, is_pinned, created_at, course:courses(name)')
        .eq('teacher_id', profile.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      const { data } = await q;
      let items = data ?? [];
      if (search) items = items.filter((i: any) => i.title?.toLowerCase().includes(search.toLowerCase()) || i.content?.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Annonces</h1><p className="text-sm text-muted-foreground mt-1">Communiquer avec vos élèves</p></div>
        <Button className="h-9 gap-2"><Plus className="h-4 w-4" />Nouvelle annonce</Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />))
            : (announcements ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Megaphone className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>Aucune annonce</p></div>
            ) : (announcements ?? []).map((a: any) => (
              <div key={a.id} className="rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-start gap-3">
                  {a.is_pinned && <Pin className="h-4 w-4 text-primary shrink-0 mt-1" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-medium">{a.title}</h4>
                      {a.is_pinned && <Badge variant="outline" className="text-[9px]">Épinglé</Badge>}
                      {a.course?.name && <Badge variant="secondary" className="text-[9px]">{a.course.name}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(a.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}