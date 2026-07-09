import { useState } from 'react';
import { Star, MessageSquare, Calendar, Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, getInitials } from '@/lib/utils';
import { useSubmitReview } from '@/hooks/useMutationFeedback';
import { useErrorToast } from '@/hooks/useErrorToast';

export default function StudentReviewsPage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const submitReview = useSubmitReview();

  const { data: teachers, isLoading: teachersLoading, isError: teachersError } = useQuery({
    queryKey: ['student_teachers', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('course_enrollments')
        .select('course:courses!inner(teacher:users!teacher_id(id, first_name, last_name, photo_url))')
        .eq('student_id', profile.id)
        .eq('status', 'active');
      const seen = new Map();
      for (const e of data ?? []) {
        const t = e.course?.teacher;
        if (t && !seen.has(t.id)) seen.set(t.id, t);
      }
      return Array.from(seen.values());
    },
    enabled: !!profile?.id,
  });
  useErrorToast(teachersError, lang, t('nav.reviews', lang));

  const { data: reviews, isError: reviewsError } = useQuery({
    queryKey: ['student_my_reviews', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('evaluations')
        .select('id, teaching_quality, communication, punctuality, organization, average_score, comment, created_at, teacher:users!teacher_id(first_name, last_name)')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
      return (data ?? []).map((r: any) => ({ ...r, teacherName: `${r.teacher?.first_name ?? ''} ${r.teacher?.last_name ?? ''}` }));
    },
    enabled: !!profile?.id,
  });
  useErrorToast(reviewsError, lang, t('nav.reviews', lang));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.reviews', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('nav.reviews', lang)}</p></div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('common.add', lang)}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">{t('role.teacher', lang)}</label>
              <div className="grid grid-cols-2 gap-2">
                {teachersLoading ? Array.from({ length: 2 }).map((_, i) => (<Skeleton key={i} className="h-12 rounded-xl" />))
                : (teachers ?? []).length === 0 ? <p className="text-xs text-muted-foreground col-span-2">{t('common.no_data', lang)}</p>
                : (teachers ?? []).map((t: any) => (
                  <button key={t.id} onClick={() => setSelectedTeacher(t.id)} className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-colors ${selectedTeacher === t.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}>
                    <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{getInitials(t.first_name ?? '', t.last_name ?? '')}</AvatarFallback></Avatar>
                    <span className="text-xs font-medium truncate">{t.first_name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">{t('common.notes', lang)}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="p-1 transition-transform hover:scale-110">
                    <Star className={`h-7 w-7 ${star <= (hoverRating || rating) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div><label className="text-xs text-muted-foreground mb-2 block">{t('common.description', lang)}</label><Textarea placeholder={t('common.notes', lang)} value={comment} onChange={e => setComment(e.target.value)} className="min-h-[100px]" /></div>
            <Button className="h-9 gap-2" disabled={!selectedTeacher || rating === 0 || submitReview.isPending} onClick={() => { if (profile?.id && selectedTeacher) submitReview.mutate({ studentId: profile.id, teacherId: selectedTeacher, rating, comment }); }}>{submitReview.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{t('common.send', lang)}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('nav.reviews', lang)}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(reviews ?? []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" /><p className="text-sm">{t('common.no_data', lang)}</p></div>
              ) : (reviews ?? []).map((r: any) => (
                <div key={r.id} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{r.teacherName}</p>
                    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(r.average_score ?? 0) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />))}</div>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(r.created_at)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}