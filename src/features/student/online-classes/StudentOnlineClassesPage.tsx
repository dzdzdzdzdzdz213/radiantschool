import { Video, ExternalLink, Calendar, Clock, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/utils';
export default function StudentOnlineClassesPage() {
  const { lang } = useLang();
  const { profile } = useAuth();

  const { data: sessions, isLoading, isError } = useQuery({
    queryKey: ['student_online_classes', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: enrollments } = await (supabase as any).from('course_enrollments').select('course_id').eq('student_id', profile.id).eq('status', 'active');
      const courseIds = (enrollments ?? []).map((e: any) => e.course_id);
      if (courseIds.length === 0) return [];
      const { data } = await (supabase as any)
        .from('online_classes')
        .select('id, title, description, platform, meeting_url, start_time, end_time, status, course:courses(name)')
        .in('course_id', courseIds)
        .order('start_time', { ascending: true });
      return (data ?? []).map((s: any) => ({ ...s, courseName: s.course?.name ?? '' }));
    },
    enabled: !!profile?.id,
  });

  useErrorToast(isError, lang, t('nav.online_classes', lang));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.online_classes', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('nav.online_classes', lang)}</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-44 rounded-xl" />))
        : (sessions ?? []).length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-16 text-muted-foreground">
            <Video className="h-16 w-16 mx-auto mb-4 opacity-20" /><p className="text-lg font-medium">{t('common.no_data', lang)}</p><p className="text-sm">{t('common.not_found', lang)}</p>
          </div>
        ) : (sessions ?? []).map((s: any) => (
          <Card key={s.id} className="hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center"><Video className="h-5 w-5 text-violet-600" /></div>
                <Badge variant={s.status === 'live' ? 'success' : s.status === 'completed' ? 'secondary' : 'outline'} className="text-[10px]">
                  {s.status === 'live' ? t('status.live', lang) : s.status === 'completed' ? t('status.completed', lang) : t('status.upcoming', lang)}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{s.courseName}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(s.start_time)}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(s.start_time)}</span>
                <span className="flex items-center gap-1"><Monitor className="h-3 w-3" />{s.platform ?? 'Zoom'}</span>
              </div>
              <Button variant={s.status === 'live' ? 'default' : 'outline'} size="sm" className="w-full h-8 text-xs gap-1.5" asChild>
                <a href={s.meeting_url ?? '#'} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" />{t('nav.registrations', lang)}</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}