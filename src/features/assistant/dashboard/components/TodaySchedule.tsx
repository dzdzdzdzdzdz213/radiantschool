import { Calendar } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

interface ScheduleItem {
  id: string;
  courseName: string;
  teacherName: string;
  roomName: string;
  startTime: string;
  endTime: string;
}

interface TodayScheduleProps {
  data: ScheduleItem[];
  loading?: boolean;
}

export default function TodaySchedule({ data, loading }: TodayScheduleProps) {
  const { lang } = useLang();
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        {t('dashboard.courses_today', lang)}
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">{t('dashboard.no_courses_today', lang)}</p>
      ) : (
        <div className="space-y-2">
          {data.slice(0, 6).map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl bg-accent/50 p-3">
              <div className="flex flex-col items-center justify-center min-w-[48px]">
                <span className="text-sm font-bold">{item.startTime?.slice(0, 5)}</span>
                <span className="text-[10px] text-muted-foreground">{item.endTime?.slice(0, 5)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.courseName}</p>
                <p className="text-xs text-muted-foreground truncate">{item.teacherName} • {item.roomName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}