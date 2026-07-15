import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse, useCourseEnrollments } from '@/hooks/useQueries';
import { formatCurrency, formatDate, getStatusColor, getFullName, formatTime, getDayLabel } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { ArrowLeft, Users } from 'lucide-react';
import { getCourseImageUrl } from '@/lib/storage';
import { useToast } from '@/hooks/useToast';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const { toast } = useToast();
  const courseId = Number(id);
  const { data: course, isLoading, isError: courseError } = useCourse(courseId);
  const { data: enrollments, isLoading: enrollLoading } = useCourseEnrollments(courseId);

  useEffect(() => {
    if (courseError) toast(t('errors.load_error', lang, t('nav.courses', lang)), 'error');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseError]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground-foreground">{t('common.loading', lang)}</div>;
  if (!course) return <div className="p-8 text-center text-muted-foreground-foreground">{t('errors.not_found_resource', lang, t('nav.courses', lang))}</div>;

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
            <div><dt className="text-muted-foreground">{t('classes.teacher', lang)}</dt><dd className="font-medium">{getFullName(course.teacher?.first_name, course.teacher?.last_name)}</dd></div>
            <div><dt className="text-muted-foreground">{t('classes.room', lang)}</dt><dd className="font-medium">{course.room?.name || t('courses.room_not_assigned', lang)}</dd></div>
            <div><dt className="text-muted-foreground">{t('classes.capacity', lang)}</dt><dd className="font-medium">{course.current_enrollments}/{course.capacity}</dd></div>
            <div><dt className="text-muted-foreground">{t('common.price', lang)}</dt><dd className="font-medium">{formatCurrency(course.price)}</dd></div>
            <div><dt className="text-muted-foreground">{t('courses.period', lang)}</dt><dd className="font-medium">{formatDate(course.start_date)} - {formatDate(course.end_date)}</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">{t('nav.schedule', lang)}</h2>
          {(course.schedules ?? []).length > 0 ? (
            <div className="space-y-2">
              {(course.schedules ?? []).map((s: any) => (
                <div key={s.id} className="rounded-lg bg-page p-3 text-sm">
                  <p className="font-medium">{getDayLabel(s.day_of_week)}</p>
                  <p className="text-muted-foreground">{formatTime(s.start_time)} - {formatTime(s.end_time)}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">{t('common.no_data', lang)}</p>}
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
              {enrollments.map((e: any) => (
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
