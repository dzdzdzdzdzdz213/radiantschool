import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { OverduePayment } from '../useAssistantDashboard';

interface OverduePaymentsProps {
  data: OverduePayment[];
  loading?: boolean;
}

export default function OverduePayments({ data, loading }: OverduePaymentsProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-36 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          Paiements en retard
        </h3>
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link to="/assistant/payments">
            Tout voir <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
      <div className="space-y-2">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Aucun paiement en retard</p>
        ) : (
          data.slice(0, 5).map((pay) => (
            <div key={pay.id} className="flex items-center justify-between rounded-xl bg-red-50 dark:bg-red-950/50 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{pay.studentName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(pay.amount)} • {formatDate(pay.dueDate)} • {pay.daysOverdue}j de retard
                </p>
              </div>
              <Link
                to={`/assistant/payments?id=${pay.id}`}
                className="shrink-0 text-xs font-medium text-primary hover:underline ml-2"
              >
                Relancer
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}