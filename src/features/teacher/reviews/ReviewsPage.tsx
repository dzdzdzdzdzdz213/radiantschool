import { useState } from 'react';
import { Search, Star, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, getInitials } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function ReviewsPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const [search, setSearch] = useState('');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['teacher_reviews', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('teacher_reviews')
        .select('id, rating, comment, created_at, student:users!student_id(first_name, last_name, photo_url)')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });
      const { data } = await q;
      let items = (data ?? []).map((r: any) => ({ ...r, studentName: `${r.student?.first_name ?? ''} ${r.student?.last_name ?? ''}` }));
      if (search) items = items.filter((i: any) => i.studentName.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  const avgRating = (reviews ?? []).length > 0 ? (reviews ?? []).reduce((s: number, r: any) => s + r.rating, 0) / (reviews ?? []).length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.reviews', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{reviews?.length ?? 0} avis · {avgRating.toFixed(1)}/5 moyenne</p></div>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('common.search', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" /></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />))
            : (reviews ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Star className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p></div>
            ) : (reviews ?? []).map((r: any) => (
              <div key={r.id} className="rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(r.student?.first_name ?? '', r.student?.last_name ?? '')}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{r.studentName}</p>
                      <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />))}</div>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(r.created_at)}</p>
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
