import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Download, Film, File as FileIcon, Image } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const typeIcons: Record<string, any> = { pdf: FileText, video: Film, image: Image, doc: FileText };
const typeColors: Record<string, string> = { pdf: 'text-red-600 bg-red-100', video: 'text-purple-600 bg-purple-100', image: 'text-green-600 bg-green-100', doc: 'text-blue-600 bg-blue-100' };

export default function TeacherResourcesPage() {
  const { profile } = useAuth();

  const { data: resources, isLoading } = useQuery({
    queryKey: ['teacher-resources', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('resources')
        .select('*, course:courses(name)')
        .eq('uploaded_by', profile.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6" />Ressources</h1>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted/30 animate-pulse" />)}
        </div>
      ) : !resources?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune ressource</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r: any) => {
            const Icon = typeIcons[r.file_type] ?? FileIcon;
            const color = typeColors[r.file_type] ?? 'text-gray-600 bg-gray-100';
            return (
              <Card key={r.id} className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.course?.name} · {r.file_type}</p>
                    </div>
                    <a href={r.file_path} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80"><Download className="h-4 w-4" /></a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
