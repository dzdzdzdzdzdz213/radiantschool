import { useState } from 'react';
import { Search, Megaphone, Pin, Calendar, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
export default function StudentAnnouncementsPage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');

  const { data: announcements, isLoading, isError } = useQuery({
    queryKey: ['student_announcements', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: enrollments } = await (supabase as any).from('course_enrollments').select('course_id').eq('student_id', profile.id).eq('status', 'active');
      const courseIds = (enrollments ?? []).map((e: any) => e.course_id);
      let q = (supabase as any)
        .from('announcements')
        .select('id, title, content, created_at, course:courses(name)')
        .in('course_id', courseIds.length > 0 ? courseIds : [-1])
        .order('created_at', { ascending: false });
      const { data } = await q;
      let items = (data ?? []).map((a: any) => ({ ...a, courseName: a.course?.name ?? '' }));
      if (search) items = items.filter((i: any) => i.title?.toLowerCase().includes(search.toLowerCase()) || i.content?.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  useErrorToast(isError, lang, t('nav.announcements', lang));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.announcements', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('nav.announcements', lang)}</p></div>
      <Card>
        <CardHeader className="pb-3"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('common.search', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" /></div></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-24 rounded-xl" />))
            : (announcements ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Megaphone className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p></div>
            ) : (announcements ?? []).map((a: any) => (
              <div key={a.id} className="rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-accent">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold">{a.title}</h4>
                      {a.courseName && <Badge variant="secondary" className="text-[9px]">{a.courseName}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.content}</p>
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