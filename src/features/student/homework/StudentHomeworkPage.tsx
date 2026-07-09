import { useState } from 'react';
import { Search, FileText, Calendar, Clock, AlertCircle, Upload, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { useMutationWithFeedback } from '@/hooks/useMutationFeedback';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useDebounce } from '@/hooks/useDebounce';

export default function StudentHomeworkPage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: homework, isLoading, isError } = useQuery({
    queryKey: ['student_homework', profile?.id, debouncedSearch],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: enrollments } = await (supabase as any).from('course_enrollments').select('course_id').eq('student_id', profile.id).eq('status', 'active');
      const courseIds = (enrollments ?? []).map((e: any) => e.course_id);
      if (courseIds.length === 0) return [];
      const { data: assignments } = await (supabase as any)
        .from('assignments')
        .select('id, title, description, due_date, created_at, file_url, course:courses(name)')
        .in('course_id', courseIds)
        .order('due_date', { ascending: true });
      let items = (assignments ?? []).map((a: any) => ({ ...a, courseName: a.course?.name ?? '' }));
      if (search) items = items.filter((i: any) => i.title?.toLowerCase().includes(search.toLowerCase()) || i.courseName?.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });
  useErrorToast(isError, lang, t('nav.homework', lang));

  const submitMutation = useMutationWithFeedback(
    async (assignmentId: string) => {
      if (!profile?.id) return;
      const { data: existing } = await (supabase as any)
        .from('assignment_submissions')
        .select('id')
        .eq('assignment_id', assignmentId)
        .eq('student_id', profile.id)
        .maybeSingle();
      if (existing) {
        throw new Error('Vous avez déjà soumis ce devoir.');
      }
      const { error } = await (supabase as any).from('assignment_submissions').insert({
        assignment_id: assignmentId,
        student_id: profile.id,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    { successMessage: t('success.saved', lang, t('nav.homework', lang)), invalidateQueries: [['student_homework']] },
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.homework', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('nav.assignments', lang)}</p></div>
      <Card>
        <CardHeader className="pb-3"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('common.search', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" /></div></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-24 rounded-xl" />))
            : (homework ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-3 opacity-20" /><p className="text-sm">{t('common.no_data', lang)}</p></div>
            ) : (homework ?? []).map((h: any) => {
              const isOverdue = h.due_date && new Date(h.due_date) < new Date();
              return (
                <div key={h.id} className="flex items-start gap-4 rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                    {isOverdue ? <AlertCircle className="h-5 w-5 text-red-500" /> : <FileText className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-medium">{h.title}</h4>
                      <Badge variant="outline" className="text-[10px]">{h.courseName}</Badge>
                      {isOverdue && <Badge variant="destructive" className="text-[10px]">{t('status.late', lang)}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{h.description ?? ''}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {h.due_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{t('common.submission_date', lang)}: {formatDate(h.due_date)}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t('common.date', lang)}: {formatDate(h.created_at)}</span>
                    </div>
                  </div>
                  <Button size="sm" className="h-8 shrink-0 gap-1.5" onClick={() => submitMutation.mutate(h.id)} disabled={submitMutation.isPending}>
                    {submitMutation.isPending ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}{t('common.submit', lang)}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
