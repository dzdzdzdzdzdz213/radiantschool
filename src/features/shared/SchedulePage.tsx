import { useMemo, useState } from 'react';
import { useCourses } from '@/hooks/useQueries';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { formatTime } from '@/lib/utils';
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Clock, User, AlertCircle } from 'lucide-react';

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] as const;

const DAY_LABELS: Record<string, Record<string, string>> = {
  fr: { saturday: 'Sam', sunday: 'Dim', monday: 'Lun', tuesday: 'Mar', wednesday: 'Mer', thursday: 'Jeu' },
  en: { saturday: 'Sat', sunday: 'Sun', monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu' },
  ar: { saturday: 'سبت', sunday: 'أحد', monday: 'اثن', tuesday: 'ثلاث', wednesday: 'أرب', thursday: 'خميس' },
};

const HOURS = Array.from({ length: 17 }, (_, i) => i + 8);

const HOUR_HEIGHT = 72;

const COLORS = [
  { bg: 'from-violet-500 to-purple-600', light: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', text: '#8b5cf6' },
  { bg: 'from-emerald-500 to-green-600', light: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
  { bg: 'from-blue-500 to-indigo-600', light: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
  { bg: 'from-orange-500 to-amber-600', light: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', text: '#f97316' },
  { bg: 'from-pink-500 to-rose-600', light: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', text: '#ec4899' },
  { bg: 'from-cyan-500 to-teal-600', light: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.3)', text: '#06b6d4' },
  { bg: 'from-red-500 to-rose-600', light: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' },
  { bg: 'from-yellow-500 to-amber-600', light: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', text: '#eab308' },
  { bg: 'from-lime-500 to-green-600', light: 'rgba(132,204,22,0.12)', border: 'rgba(132,204,22,0.3)', text: '#84cc16' },
  { bg: 'from-sky-500 to-blue-600', light: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.3)', text: '#0ea5e9' },
];

function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
}

function getWeekDates(ref: Date): Date[] {
  const start = new Date(ref);
  start.setDate(start.getDate() - start.getDay() + 6);
  return DAYS.map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDate(d: Date, lang: string): string {
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  return d.toLocaleDateString(localeMap[lang], { day: 'numeric' });
}

function isToday(d: Date): boolean {
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

function formatWeekRange(dates: Date[], lang: string): string {
  const start = dates[0];
  const end = dates[dates.length - 1];
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const locale = localeMap[lang] ?? lang;
  const opts: Intl.DateTimeFormatOptions = { month: 'long' };
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString(locale, opts)} ${start.getFullYear()}`;
  }
  return `${start.getDate()} ${start.toLocaleDateString(locale, opts)} - ${end.getDate()} ${end.toLocaleDateString(locale, opts)} ${end.getFullYear()}`;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export default function SchedulePage() {
  const { lang } = useLang();
  const { data: courses, isLoading, isError } = useCourses();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = useMemo(() => {
    const ref = new Date();
    ref.setDate(ref.getDate() + weekOffset * 7);
    return getWeekDates(ref);
  }, [weekOffset]);

  const allSchedules = useMemo(() => {
    if (!courses) return [];
    return courses.flatMap((c) =>
      (c.schedules || []).map((s: { start_time: string; end_time: string }) => ({
        ...s,
        courseName: c.name,
        courseType: c.type,
        teacherName: c.teacher ? `${c.teacher.first_name} ${c.teacher.last_name}` : '',
        roomName: c.room?.name || '',
        levelName: c.level?.name || '',
        subjectName: c.subject?.name || '',
        color: hashColor(c.subject?.name || c.name),
        startMin: toMinutes(s.start_time),
        endMin: toMinutes(s.end_time),
      }))
    );
  }, [courses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6" style={{ color: 'var(--primary)' }} />
          <h1 className="text-2xl font-bold">{t('nav.schedule', lang)}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(0)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-page"
            style={{ color: 'var(--fg-muted)' }}
          >
            {t('common.today', lang)}
          </button>
          <div className="flex items-center rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => setWeekOffset(o => o - 1)} className="p-2 transition-colors hover:bg-page rounded-l-lg">
              <ChevronLeft className="h-4 w-4" style={{ color: 'var(--fg-muted)' }} />
            </button>
            <span className="px-3 text-sm font-medium" style={{ color: 'var(--fg)' }}>
              {formatWeekRange(weekDates, lang)}
            </span>
            <button onClick={() => setWeekOffset(o => o + 1)} className="p-2 transition-colors hover:bg-page rounded-r-lg">
              <ChevronRight className="h-4 w-4" style={{ color: 'var(--fg-muted)' }} />
            </button>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="flex items-center justify-center gap-2 py-20 text-red-500"><AlertCircle className="h-5 w-5" />{t('errors.load_error', lang, 'des cours')}</div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex min-w-[900px]">
            <div className="shrink-0 pt-[52px] w-14">
              {HOURS.map(h => (
                <div
                  key={h}
                  className="flex items-start justify-center pr-2 text-[11px] font-medium leading-none"
                  style={{ height: HOUR_HEIGHT, color: 'var(--fg-muted)', paddingTop: h === 8 ? 0 : -6 }}
                >
                  <span className="-mt-2">{h}:00</span>
                </div>
              ))}
            </div>

            {weekDates.map((date, idx) => {
              const day = DAYS[idx];
              const daySchedules = allSchedules.filter((s) => s.day_of_week === day);
              const todayFlag = isToday(date);

              return (
                <div key={day} className="flex-1 mx-1 first:ml-2 last:mr-2">
                  <div
                    className="rounded-t-xl px-2 py-2.5 text-center text-sm font-semibold"
                    style={{
                      backgroundColor: todayFlag ? 'var(--primary-light)' : 'var(--bg-card)',
                      borderTop: `2px solid ${todayFlag ? 'var(--primary)' : 'transparent'}`,
                      color: todayFlag ? 'var(--primary)' : 'var(--fg)',
                    }}
                  >
                    <span className="text-[11px] font-medium uppercase tracking-wide block leading-none opacity-70">{DAY_LABELS[lang]?.[day] ?? day}</span>
                    <span className="text-lg font-bold block mt-0.5">{formatDate(date, lang)}</span>
                    {todayFlag && <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />}
                  </div>

                  <div
                    className="relative rounded-b-xl border-x border-b overflow-hidden"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border)',
                      height: HOUR_HEIGHT * (HOURS.length - 1),
                    }}
                  >
                    {HOURS.map((h, i) => (
                      <div
                        key={h}
                        className="border-t transition-colors"
                        style={{
                          height: HOUR_HEIGHT,
                          borderColor: 'var(--border)',
                          backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.02)',
                        }}
                      />
                    ))}

                    {daySchedules.map((s) => {
                      const top = ((s.startMin - HOURS[0] * 60) / 60) * HOUR_HEIGHT;
                      const height = Math.max(((s.endMin - s.startMin) / 60) * HOUR_HEIGHT, 36);

                      return (
                        <div
                          key={s.id}
                          className="absolute left-1 right-1 rounded-xl p-2.5 overflow-hidden transition-all duration-200 hover:shadow-lg hover:z-10 cursor-default"
                          style={{
                            top,
                            height,
                            backgroundColor: s.color.light,
                            borderLeft: `3px solid ${s.color.text}`,
                            zIndex: 1,
                          }}
                        >
                          <p className="text-sm font-semibold leading-tight truncate">{s.courseName}</p>
                          {height >= 56 && (
                            <div className="mt-1 space-y-0.5 text-[11px]" style={{ color: 'var(--fg-muted)' }}>
                              <div className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5 shrink-0" />
                                <span>{formatTime(s.start_time)} - {formatTime(s.end_time)}</span>
                              </div>
                              {s.teacherName && height >= 72 && (
                                <div className="flex items-center gap-1">
                                  <User className="h-2.5 w-2.5 shrink-0" />
                                  <span className="truncate">{s.teacherName}</span>
                                </div>
                              )}
                              {(s.roomName || s.levelName) && height >= 88 && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                                  <span className="truncate">{s.roomName || s.levelName}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {daySchedules.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <CalendarDays className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
