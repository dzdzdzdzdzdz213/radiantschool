import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Users, DollarSign, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Overview {
  students_total: number;
  students_active: number;
  courses_total: number;
  enrollments_total: number;
  revenue_total: number;
  revenue_month: number;
  unpaid_invoices: number;
  unpaid_amount: number;
  absent_today: number;
}

interface AbsenceAlert {
  student: string;
  course: string | null;
  absences_30d: number;
}

export default function AiInsightsCard() {
  const { profile } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [alerts, setAlerts] = useState<AbsenceAlert[] | null>(null);
  const [loading, setLoading] = useState(true);

  const isStaff = profile?.role === 'admin' || profile?.role === 'assistant';

  useEffect(() => {
    if (!isStaff) return;
    let cancelled = false;
    (async () => {
      const [ovRes, alRes] = await Promise.all([
        supabase.rpc('ai_tool_school_overview'),
        supabase.rpc('ai_tool_attendance_alerts'),
      ]);
      if (cancelled) return;
      if (!ovRes.error && ovRes.data) setOverview(ovRes.data as unknown as Overview);
      if (!alRes.error && alRes.data) setAlerts((alRes.data as unknown as AbsenceAlert[]).slice(0, 3));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [isStaff]);

  if (!isStaff) return null;

  return (
    <Card className="border-gradient-to-br from-indigo-500/10 via-purple-500/10 to-fuchsia-500/10 p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">Insights IA</h3>
          <p className="text-[11px] text-muted-foreground">Analyse intelligente en temps réel</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : overview ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Users className="h-3 w-3" /> Élèves actifs
              </div>
              <p className="mt-1 text-lg font-semibold text-foreground">{overview.students_active}<span className="text-xs font-normal text-muted-foreground"> / {overview.students_total}</span></p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <DollarSign className="h-3 w-3" /> Revenu du mois
              </div>
              <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(overview.revenue_month)}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> Cours actifs
              </div>
              <p className="mt-1 text-lg font-semibold text-foreground">{overview.courses_total}<span className="text-xs font-normal text-muted-foreground"> / {overview.enrollments_total} inscrits</span></p>
            </div>
            <div className={`rounded-xl p-3 ${overview.unpaid_amount > 0 ? 'bg-destructive/5' : 'bg-muted/50'}`}>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <AlertTriangle className="h-3 w-3" /> Impayés
              </div>
              <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(overview.unpaid_amount)}<span className="text-xs font-normal text-muted-foreground"> / {overview.unpaid_invoices} factures</span></p>
            </div>
          </div>

          {alerts && alerts.length > 0 && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-destructive">
                <Clock className="h-3 w-3" /> Absentéisme à surveiller
              </div>
              <ul className="mt-2 space-y-1.5">
                {alerts.map((a) => (
                  <li key={a.student} className="flex items-center justify-between text-xs text-foreground">
                    <span className="truncate">{a.student}</span>
                    <span className="shrink-0 font-medium text-destructive">{a.absences_30d} abs. / 30j</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {overview.absent_today > 0 && (
            <p className="text-[11px] text-muted-foreground">
              {overview.absent_today} absence{overview.absent_today > 1 ? 's' : ''} aujourd'hui.
            </p>
          )}
        </div>
      ) : null}
    </Card>
  );
}
