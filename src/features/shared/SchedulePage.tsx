import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { formatTime } from '@/lib/utils';
import { useErrorToast } from '@/hooks/useErrorToast';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Clock, AlertCircle } from 'lucide-react';

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

const FALLBACK_TIME = { start: '09:00', end: '10:00' };

interface SessionRow {
  id: number;
  date: string;
  status: string;
  check_in_opened_at: string | null;
  check_in_closed_at: string | null;
  course: { id: number; name: string; type: string } | null;
  schedule: { start_time: string; end_time: string; room: { name: string } | null } | null;
}

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

function toIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function formatDate(d: Date, lang: string): string {
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  return d.toLocaleDateString(localeMap[lang], { day: 'numeric' });
}

function isToday(d: Date): boolean {
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

function isPast(d: Date): boolean {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  return day.getTime() < t.getTime();
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
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = useMemo(() => {
    const ref = new Date();
    ref.setDate(ref.getDate() + weekOffset * 7);
    return getWeekDates(ref);
  }, [weekOffset]);

  const weekStart = toIso(weekDates[0]);
  const weekEnd = toIso(weekDates[weekDates.length - 1]);

  const { data: sessions, isLoading, isError } = useQuery({
    queryKey: ['schedule-sessions', weekStart, weekEnd],
    queryFn: async () => {
      const { data } = await supabase
        .from('attendance_sessions')
        .select(`
          id, date, status, check_in_opened_at, check_in_closed_at,
          course:courses!course_id(id, name, type),
          schedule:course_schedules!schedule_id(start_time, end_time, room:rooms(name))
        `)
        .gte('date', weekStart)
        .lte('date', weekEnd)
        .order('date');
      return (data ?? []) as SessionRow[];
    },
  });

  useErrorToast(isError, lang, t('errors.load_error', lang, 'des séances'));

  const eventsByDay = useMemo(() => {
    const map: Record<string, SessionRow[]> = {};
    for (const s of sessions ?? []) (map[s.date] ??= []).push(s);
    for (const d of weekDates) (map[toIso(d)] ??= []).sort((a, b) => {
      const sa = toMinutes(a.schedule?.start_time ?? FALLBACK_TIME.start);
      const sb = toMinutes(b.schedule?.start_time ?? FALLBACK_TIME.start);
      return sa - sb;
    });
    return map;
  }, [sessions, weekDates]);

  const visibleCount = weekDates.reduce((acc, d) => acc + (eventsByDay[toIso(d)]?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('nav.schedule', lang)}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {visibleCount > 0
                ? `${visibleCount} séance${visibleCount > 1 ? 's' : ''} cette semaine`
                : 'Aucune séance programmée cette semaine'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
            {t('common.today', lang)}
          </Button>
          <div className="flex items-center rounded-lg border-border">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm font-medium whitespace-nowrap">{formatWeekRange(weekDates, lang)}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="flex items-center justify-center gap-2 py-20 text-red-500">
          <AlertCircle className="h-5 w-5" />
          {t('errors.load_error', lang, 'des séances')}
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : visibleCount === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-20 text-muted-foreground">
          <CalendarDays className="h-10 w-10 opacity-40" />
          <p className="text-sm">Aucune séance cette semaine</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex min-w-[900px]">
            <div className="shrink-0 w-14 pt-[52px]">
              {HOURS.map(h => (
                <div key={h} className="flex items-start justify-center pr-2 text-[11px] font-medium text-muted-foreground leading-none" style={{ height: HOUR_HEIGHT }}>
                  <span className="-mt-2">{h}:00</span>
                </div>
              ))}
            </div>

            {weekDates.map((date, idx) => {
              const day = DAYS[idx];
              const daySessions = eventsByDay[toIso(date)] ?? [];
              const todayFlag = isToday(date);
              const pastFlag = isPast(date);

              return (
                <div key={day} className="flex-1 mx-1 first:ml-2 last:mr-2">
                  <div
                    className={`rounded-t-xl px-2 py-2.5 text-center ${todayFlag ? 'bg-primary/10 text-primary' : 'bg-card text-foreground'}`}
                    style={{ borderTop: `2px solid ${todayFlag ? 'var(--primary)' : 'transparent'}` }}
                  >
                    <span className="text-[11px] font-medium uppercase tracking-wide block leading-none opacity-70">
                      {DAY_LABELS[lang]?.[day] ?? day}
                    </span>
                    <span className={`text-lg font-bold block mt-0.5 ${todayFlag ? 'text-primary' : ''}`}>{formatDate(date, lang)}</span>
                    {todayFlag && <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>

                  <div
                    className="relative rounded-b-xl border-x border-b overflow-hidden bg-card"
                    style={{ height: HOUR_HEIGHT * (HOURS.length - 1) }}
                  >
                    {HOURS.map((h, i) => (
                      <div
                        key={h}
                        className="border-t border-border transition-colors"
                        style={{ height: HOUR_HEIGHT, backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.02)' }}
                      />
                    ))}

                    {daySessions.map((s, i) => {
                      const color = hashColor(s.course?.name ?? '');
                      const start = s.schedule?.start_time ?? FALLBACK_TIME.start;
                      const end = s.schedule?.end_time ?? FALLBACK_TIME.end;
                      const startMin = toMinutes(start);
                      const top = ((startMin - HOURS[0] * 60) / 60) * HOUR_HEIGHT;
                      const height = Math.max(((toMinutes(end) - startMin) / 60) * HOUR_HEIGHT, 36);
                      const sameStart = daySessions.filter(
                        (o) => toMinutes(o.schedule?.start_time ?? FALLBACK_TIME.start) === startMin && toMinutes(o.schedule?.end_time ?? FALLBACK_TIME.end) === toMinutes(end)
                      );
                      const n = sameStart.length;
                      const slotIdx = sameStart.indexOf(s);
                      const open = !!s.check_in_opened_at && !s.check_in_closed_at;
                      const closed = !!s.check_in_closed_at;

                      return (
                        <div
                          key={s.id}
                          className={`absolute top-0 overflow-hidden rounded-xl p-2.5 transition-all duration-200 hover:shadow-lg hover:z-10 cursor-default ${pastFlag ? 'opacity-60' : ''}`}
                          style={{
                            top,
                            height,
                            left: `calc(${(slotIdx * 100) / n}% + 4px)`,
                            width: `calc(${100 / n}% - 8px)`,
                            backgroundColor: color.light,
                            borderLeft: `3px solid ${color.text}`,
                            zIndex: 1,
                          }}
                        >
                          <p className="text-sm font-semibold leading-tight truncate">{s.course?.name ?? 'Séance'}</p>
                          {height >= 56 && (
                            <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5 shrink-0" />
                                <span>{formatTime(start)} - {formatTime(end)}</span>
                              </div>
                              {s.schedule?.room?.name && height >= 72 && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                                  <span className="truncate">{s.schedule.room.name}</span>
                                </div>
                              )}
                            </div>
                          )}
                          {open && (
                            <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                              En cours
                            </span>
                          )}
                          {closed && (
                            <span className="absolute right-1.5 top-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                              Clôturée
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {daySessions.length === 0 && (
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