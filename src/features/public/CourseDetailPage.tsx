import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCourse, useCourseEnrollments } from '@/hooks/useQueries';
import { useRooms } from '@/hooks/useQueries';
import { formatCurrency, formatDate, getStatusColor, getFullName, formatTime, getDayLabel } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { ArrowLeft, Users, Trash2, Plus, X } from 'lucide-react';
import { getCourseImageUrl } from '@/lib/storage';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const { toast } = useToast();
  const { profile } = useAuth();
  const qc = useQueryClient();
  const courseId = Number(id);
  const isValidId = !isNaN(courseId) && !!id;
  const { data: course, isLoading, isError: courseError } = useCourse(isValidId ? courseId : 0);
  const { data: enrollments, isLoading: enrollLoading } = useCourseEnrollments(isValidId ? courseId : 0);
  const { data: rooms } = useRooms();
  const canManage = profile?.role === 'admin' || profile?.role === 'assistant';

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [schedForm, setSchedForm] = useState({ day: '', start: '09:00', end: '10:00', room_id: '' });

  useEffect(() => {
    if (courseError) toast(t('errors.load_error', lang, t('nav.courses', lang)), 'error');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseError]);

  const addSchedule = useMutation({
    mutationFn: async () => {
      if (!schedForm.day) throw new Error(t('errors.schedule_need_day', lang));
      if (schedForm.end <= schedForm.start) throw new Error(t('errors.schedule_time_order', lang));
      if (!course) throw new Error('course missing');
      const { error } = await supabase.from('course_schedules').insert({
        course_id: course.id,
        day_of_week: schedForm.day as never,
        start_time: schedForm.start,
        end_time: schedForm.end,
        teacher_id: course.teacher_id,
        room_id: schedForm.room_id ? parseInt(schedForm.room_id, 10) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', courseId] });
      qc.invalidateQueries({ queryKey: ['schedule-sessions'] });
      qc.invalidateQueries({ queryKey: ['assistant_schedules'] });
      toast(t('success.created', lang, t('nav.schedule', lang)), 'success');
      setShowScheduleForm(false);
      setSchedForm({ day: '', start: '09:00', end: '10:00', room_id: '' });
    },
    onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteSchedule = useMutation({
    mutationFn: async (scheduleId: number) => {
      const { error } = await supabase.from('course_schedules').delete().eq('id', scheduleId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', courseId] });
      qc.invalidateQueries({ queryKey: ['schedule-sessions'] });
      qc.invalidateQueries({ queryKey: ['assistant_schedules'] });
      toast(t('success.deleted', lang, t('nav.schedule', lang)), 'success');
    },
    onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{t('common.loading', lang)}</div>;
  if (!course) return <div className="p-8 text-center text-muted-foreground">{t('errors.not_found_resource', lang, t('nav.courses', lang))}</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="btn-ghost h-8 gap-1.5 text-sm"><ArrowLeft className="h-4 w-4" /> {t('common.back', lang)}</button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <p className="text-muted-foreground">{course.subject?.name} · {course.level?.name}{course.level?.stream ? ` - ${course.level.stream}` : ''}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(course.status)}`}>{course.status}</span>
      </div>
      {course.image_url && (
        <div className="rounded-xl overflow-hidden max-h-64">
          <img src={getCourseImageUrl(course.image_url) || ''} alt={course.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-semibold">{t('common.info', lang)}</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted-foreground">{t('common.type', lang)}</dt><dd className="font-medium">{course.type}</dd></div>
            <div><dt className="text-muted-foreground">{t('classes.teacher', lang)}</dt><dd className="font-medium">{getFullName(course.teacher?.first_name ?? '', course.teacher?.last_name ?? '')}</dd></div>
            <div><dt className="text-muted-foreground">{t('classes.room', lang)}</dt><dd className="font-medium">{course.room?.name || t('courses.room_not_assigned', lang)}</dd></div>
            <div><dt className="text-muted-foreground">{t('classes.capacity', lang)}</dt><dd className="font-medium">{course.current_enrollments ?? 0}/{course.capacity}</dd></div>
            <div><dt className="text-muted-foreground">{t('common.price', lang)}</dt><dd className="font-medium">{formatCurrency(course.price ?? 0)}</dd></div>
            <div><dt className="text-muted-foreground">{t('courses.period', lang)}</dt><dd className="font-medium">{formatDate(course.start_date)} - {formatDate(course.end_date)}</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{t('nav.schedule', lang)}</h2>
            {canManage && (
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => setShowScheduleForm(v => !v)}>
                {showScheduleForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {showScheduleForm ? t('common.cancel', lang) : t('common.add', lang)}
              </Button>
            )}
          </div>
          {showScheduleForm && canManage && (
            <div className="mb-4 space-y-3 rounded-lg bg-muted/40 p-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.day', lang)}</Label>
                <Select value={schedForm.day} onValueChange={v => setSchedForm(f => ({ ...f, day: v }))} placeholder={t('common.select', lang)}>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>{getDayLabel(d)}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">{t('common.start', lang)}</Label>
                  <Input type="time" value={schedForm.start} onChange={e => setSchedForm(f => ({ ...f, start: e.target.value }))} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">{t('common.end', lang)}</Label>
                  <Input type="time" value={schedForm.end} onChange={e => setSchedForm(f => ({ ...f, end: e.target.value }))} className="h-9" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.room', lang)}</Label>
                <Select value={schedForm.room_id} onValueChange={v => setSchedForm(f => ({ ...f, room_id: v }))} placeholder={t('common.select', lang)}>
                  <SelectItem value="">—</SelectItem>
                  {(rooms ?? []).map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                  ))}
                </Select>
              </div>
              <Button size="sm" className="h-8 w-full" disabled={addSchedule.isPending} onClick={() => addSchedule.mutate()}>
                {addSchedule.isPending ? t('common.loading', lang) : t('common.create', lang)}
              </Button>
            </div>
          )}
          {(course.schedules ?? []).length > 0 ? (
            <div className="space-y-2">
              {(course.schedules ?? []).map((s) => (
                <div key={s.id} className="rounded-lg bg-page p-3 text-sm flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{getDayLabel(s.day_of_week)}</p>
                    <p className="text-muted-foreground">{formatTime(s.start_time)} - {formatTime(s.end_time)}{s.room?.name ? ` · ${s.room.name}` : ''}</p>
                  </div>
                  {canManage && (
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive shrink-0" disabled={deleteSchedule.isPending} onClick={() => deleteSchedule.mutate(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">{t('common.no_data', lang)}</p>}
          {canManage && (course.schedules ?? []).length === 0 && !showScheduleForm && (
            <p className="text-xs text-muted-foreground mt-3">Ajoutez un horaire pour générer les séances de présence.</p>
          )}
        </div>
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold">{t('nav.registrations', lang)} ({enrollments?.length || 0})</h2>
        </div>
        {enrollLoading ? (
          <div className="p-8 text-center text-muted-foreground">{t('common.loading', lang)}</div>
        ) : enrollments && enrollments.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-5 py-3 font-medium">{t('common.name', lang)}</th>
                <th className="px-5 py-3 font-medium">{t('common.status', lang)}</th>
                <th className="px-5 py-3 font-medium">{t('common.date', lang)}</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-b text-sm last:border-0">
                  <td className="px-5 py-3 font-medium">{getFullName(e.student?.user?.first_name ?? '', e.student?.user?.last_name ?? '')}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(e.status)}`}>{e.status}</span></td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(e.enrollment_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Users className="mx-auto mb-2 h-8 w-8" />
            <p>{t('common.no_data', lang)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
