import { Calendar, MapPin, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScheduleItem {
  id: number;
  start_time: string;
  end_time: string;
  course: { name: string; room: { name: string } | null } | null;
  teacher: { first_name: string; last_name: string } | null;
}

interface TodayScheduleProps {
  data: ScheduleItem[];
  loading?: boolean;
}

function ScheduleSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center gap-1 w-14 shrink-0">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function TodaySchedule({ data, loading }: TodayScheduleProps) {
  if (loading) return <ScheduleSkeleton />;

  const todayName = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2.5 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Calendar className="h-4 w-4 text-accent" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-sm font-semibold">Aujourd'hui</CardTitle>
          <p className="text-[10px] text-muted-foreground capitalize">{todayName}</p>
        </div>
        {data && data.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {data.length} cours
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Calendar className="mb-2 h-6 w-6 text-muted-foreground/15" />
            <p className="text-sm text-muted-foreground">Aucun cours aujourd'hui</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[320px] pr-2">
            <div className="space-y-3">
              {data.map(item => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-xl bg-primary/5 p-3.5 transition-colors hover:bg-primary/10"
                >
                  <div className="flex flex-col items-center gap-0.5 w-14 shrink-0">
                    <span className="text-base font-bold tracking-tight">{item.start_time?.slice(0, 5)}</span>
                    <span className="text-[10px] font-medium text-muted-foreground">{item.end_time?.slice(0, 5)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{item.course?.name ?? 'Cours'}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {item.teacher && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="truncate">{item.teacher.first_name} {item.teacher.last_name}</span>
                        </div>
                      )}
                      {item.course?.room && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{item.course.room.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
