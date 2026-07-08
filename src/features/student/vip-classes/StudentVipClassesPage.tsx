import { useState } from 'react';
import { Plus, Star, Calendar, Clock, Euro, Loader, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { useMutationWithFeedback } from '@/hooks/useMutationFeedback';
export default function StudentVipClassesPage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ teacher_id: '', course_id: '', date: '', start_time: '', end_time: '', price: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: lessons, isLoading, isError } = useQuery({
    queryKey: ['student_vip_classes', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('vip_classes')
        .select('id, date, start_time, end_time, price, status, notes, teacher:users!teacher_id(first_name, last_name)')
        .eq('student_id', profile.id)
        .order('date', { ascending: false });
      return (data ?? []).map((l: any) => ({ ...l, teacherName: `${l.teacher?.first_name ?? ''} ${l.teacher?.last_name ?? ''}` }));
    },
    enabled: !!profile?.id,
  });

  useErrorToast(isError, lang, t('nav.vip_classes', lang));

  const bookMutation = useMutationWithFeedback<unknown, Error, { teacher_id: string; course_id: string; date: string; start_time: string; end_time: string; price: number }, unknown>(
    async (formData) => {
      if (!profile?.id) return;
      const { error } = await (supabase as any).from('vip_classes').insert({
        student_id: profile.id,
        teacher_id: formData.teacher_id,
        course_id: formData.course_id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        price: formData.price,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    { successMessage: t('success.sent', lang, t('nav.vip_classes', lang)), invalidateQueries: [['student_vip_classes']], onSuccess: () => { setShowForm(false); setForm({ teacher_id: '', course_id: '', date: '', start_time: '', end_time: '', price: '' }); } },
  );

  function validate() {
    const e: Record<string, string> = {};
    if (!form.teacher_id) e.teacher_id = t('errors.required', lang);
    if (!form.course_id) e.course_id = t('errors.required', lang);
    if (!form.date) e.date = t('errors.required', lang);
    if (!form.start_time) e.start_time = t('errors.required', lang);
    if (!form.end_time) e.end_time = t('errors.required', lang);
    if (!form.price || Number(form.price) <= 0) e.price = t('errors.required', lang);
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    bookMutation.mutate({ teacher_id: form.teacher_id, course_id: form.course_id, date: form.date, start_time: form.start_time, end_time: form.end_time, price: Number(form.price) });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><h1 className="text-2xl font-bold tracking-tight">{t('nav.vip_classes', lang)}</h1><Star className="h-5 w-5 text-amber-500" /></div>
        <Button className="h-9 gap-2" onClick={() => setShowForm(true)}>{showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{t('common.add', lang)}</Button>
      </div>
      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">{t('role.teacher', lang)}</label><Input value={form.teacher_id} onChange={e => setForm(p => ({ ...p, teacher_id: e.target.value }))} className={errors.teacher_id ? 'border-red-500' : ''} /></div>
              <div><label className="text-xs font-medium">{t('common.course', lang)}</label><Input value={form.course_id} onChange={e => setForm(p => ({ ...p, course_id: e.target.value }))} className={errors.course_id ? 'border-red-500' : ''} /></div>
              <div><label className="text-xs font-medium">{t('common.date', lang)}</label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={errors.date ? 'border-red-500' : ''} /></div>
              <div><label className="text-xs font-medium">{t('common.start_time', lang)}</label><Input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} className={errors.start_time ? 'border-red-500' : ''} /></div>
              <div><label className="text-xs font-medium">{t('common.end_time', lang)}</label><Input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} className={errors.end_time ? 'border-red-500' : ''} /></div>
              <div><label className="text-xs font-medium">{t('common.price', lang)}</label><Input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className={errors.price ? 'border-red-500' : ''} /></div>
            </div>
            {Object.keys(errors).length > 0 && <p className="text-xs text-red-500">{t('errors.required', lang)}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>{t('common.cancel', lang)}</Button>
              <Button size="sm" onClick={handleSubmit} disabled={bookMutation.isPending}>{bookMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : null}{t('common.submit', lang)}</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-32 rounded-xl" />))
        : (lessons ?? []).length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-16 text-muted-foreground"><Star className="h-16 w-16 mx-auto mb-4 opacity-20" /><p className="text-lg font-medium">{t('common.no_data', lang)}</p><p className="text-sm">{t('common.not_found', lang)}</p></div>
        ) : (lessons ?? []).map((l: any) => (
          <Card key={l.id} className="border-amber-200 dark:border-amber-900 hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Badge variant={l.status === 'completed' ? 'success' : l.status === 'cancelled' ? 'destructive' : 'outline'} className="text-[10px]">{l.status === 'completed' ? t('status.completed', lang) : l.status === 'cancelled' ? t('status.cancelled', lang) : t('status.upcoming', lang)}</Badge>
                <span className="text-sm font-semibold flex items-center gap-1"><Euro className="h-3.5 w-3.5" />{formatCurrency(l.price ?? 0)}</span>
              </div>
              <p className="font-medium text-sm">{l.teacherName}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(l.date)}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(l.start_time)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}