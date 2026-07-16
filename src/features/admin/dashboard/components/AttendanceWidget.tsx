import { motion } from 'framer-motion';
import { ClipboardCheck, UserCheck, UserX, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
  rate: number;
}

interface AttendanceWidgetProps {
  data: AttendanceSummary;
  loading?: boolean;
}

function WidgetSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AttendanceWidget({ data, loading }: AttendanceWidgetProps) {
  const { lang } = useLang();
  if (loading) return <WidgetSkeleton />;

  const pct = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
  const barColor = pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2.5 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <ClipboardCheck className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-sm font-semibold">{t('nav.attendance', lang)}</CardTitle>
        </div>
        {data.total > 0 && (
          <Badge variant={pct >= 90 ? 'success' : pct >= 75 ? 'warning' : 'destructive'}>
            {pct}%
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-emerald-500/5 p-3">
            <UserCheck className="h-5 w-5 text-emerald-500" />
            <span className="text-lg font-bold">{data.present}</span>
            <span className="text-[10px] text-muted-foreground">{t('status.present', lang)}</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-red-500/5 p-3">
            <UserX className="h-5 w-5 text-red-500" />
            <span className="text-lg font-bold">{data.absent}</span>
            <span className="text-[10px] text-muted-foreground">{t('status.absent', lang)}</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-amber-500/5 p-3">
            <Clock className="h-5 w-5 text-amber-500" />
            <span className="text-lg font-bold">{data.late}</span>
            <span className="text-[10px] text-muted-foreground">{t('status.late', lang)}</span>
          </div>
        </div>

        {data.total === 0 && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            {t('common.no_data', lang)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
