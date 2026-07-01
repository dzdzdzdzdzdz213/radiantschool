import { useState } from 'react';
import { Search, Plus, FileText, FolderOpen, Download, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/utils';

export default function ResourcesPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: resources, isLoading } = useQuery({
    queryKey: ['teacher_resources', profile?.id, debouncedSearch],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('resources')
        .select('id, title, description, type, file_url, created_at, course:courses(name)')
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
        <div><h1 className="text-2xl font-bold tracking-tight">Ressources</h1><p className="text-sm text-muted-foreground mt-1">Documents et supports de cours</p></div>
        <Button className="h-9 gap-2"><Plus className="h-4 w-4" />Ajouter</Button>
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
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />))
            : (resources ?? []).length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>Aucune ressource</p>
              </div>
            ) : (resources ?? []).map((r: any) => (
              <div key={r.id} className="group rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <h4 className="text-sm font-medium mt-3 truncate">{r.title}</h4>
                {r.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>}
                <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                  <span>{r.type ?? 'Document'}</span>
                  <span>{formatDate(r.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}