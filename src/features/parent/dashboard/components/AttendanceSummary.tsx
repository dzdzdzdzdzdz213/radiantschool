import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import type { ChildInfo } from '../useParentDashboard';

interface AttendanceSummaryProps {
  children: ChildInfo[];
  loading?: boolean;
}

export default function AttendanceSummary({ children, loading }: AttendanceSummaryProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        {[1, 2].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-primary" />
          Présences du jour
        </h3>
        <p className="text-sm text-muted-foreground py-6 text-center">Aucune donnée de présence</p>
      </div>
    );
  }

  const avgRate = children.length > 0
    ? Math.round(children.reduce((s, c) => s + c.attendanceRate, 0) / children.length)
    : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <CalendarCheck className="h-4 w-4 text-primary" />
        Présences
      </h3>
      <div className="mb-4">
        <div className="flex items-end justify-between mb-1">
          <span className="text-xs text-muted-foreground">Moyenne générale</span>
          <span className="text-sm font-bold">{avgRate}%</span>
        </div>
        <div className="h-2 rounded-full bg-accent overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${avgRate}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${avgRate >= 90 ? 'bg-emerald-500' : avgRate >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
          />
        </div>
      </div>
      <div className="space-y-2">
        {children.map((child) => (
          <div key={child.id} className="flex items-center justify-between">
            <span className="text-sm">{child.firstName} {child.lastName}</span>
            <span className={`text-xs font-medium ${child.attendanceRate >= 90 ? 'text-emerald-600' : child.attendanceRate >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
              {child.attendanceRate}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
