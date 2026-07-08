import { useState } from 'react';
import { Search, FileText, Download, Video, Image, File, FolderOpen, Loader, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { useDownloadFile } from '@/hooks/useMutationFeedback';

const typeIcons: Record<string, any> = { pdf: FileText, video: Video, image: Image, document: File };
const typeColors: Record<string, string> = { pdf: 'text-red-500 bg-red-500/10', video: 'text-violet-500 bg-violet-500/10', image: 'text-sky-500 bg-sky-500/10', document: 'text-blue-500 bg-blue-500/10' };

export default function StudentResourcesPage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const downloadFile = useDownloadFile();

  const { data: resources, isLoading } = useQuery({
    queryKey: ['student_resources', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: enrollments } = await (supabase as any).from('course_enrollments').select('course_id').eq('student_id', profile.id).eq('status', 'active');
      const courseIds = (enrollments ?? []).map((e: any) => e.course_id);
      if (courseIds.length === 0) return [];
      const { data } = await (supabase as any)
        .from('resources')
        .select('id, title, description, type, file_url, created_at, course:courses(name)')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false });
      let items = (data ?? []).map((r: any) => ({ ...r, courseName: r.course?.name ?? '' }));
      if (search) items = items.filter((i: any) => i.title?.toLowerCase().includes(search.toLowerCase()) || i.courseName?.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.resources', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('nav.resources', lang)}</p></div>
      <Card>
        <CardHeader className="pb-3"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('common.search', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" /></div></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-28 rounded-xl" />))
            : (resources ?? []).length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground"><FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p></div>
            ) : (resources ?? []).map((r: any) => {
              const isLink = r.type === 'link';
              const Icon = isLink ? LinkIcon : (typeIcons[r.type] ?? FileText);
              const color = isLink ? 'text-sky-500 bg-sky-500/10' : (typeColors[r.type] ?? 'text-primary bg-primary/10');
              return (
                <div key={r.id} className="group rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                  <div className={`h-10 w-10 rounded-xl ${color.split(' ')[1]} flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 ${color.split(' ')[0]}`} />
                  </div>
                  <h4 className="text-sm font-semibold truncate">{r.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description ?? ''}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{r.courseName}</span>
                    <span>{formatDate(r.created_at)}</span>
                  </div>
                  {isLink ? (
                    <Button variant="outline" size="sm" className="w-full mt-3 h-8 text-xs gap-1.5" asChild>
                      <a href={r.file_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" />{t('nav.online_classes', lang)}</a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full mt-3 h-8 text-xs gap-1.5" onClick={() => { if (r.file_url) downloadFile.mutate({ fileUrl: r.file_url, filename: r.title }); }} disabled={downloadFile.isPending}>
                      {downloadFile.isPending ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}{t('common.download', lang)}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
