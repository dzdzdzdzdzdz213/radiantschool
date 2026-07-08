import { useNavigate } from 'react-router-dom';
import { DollarSign, ArrowRight } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PaymentRecord } from '../useParentDashboard';

interface RecentPaymentsProps {
  data: PaymentRecord[];
  loading?: boolean;
}

export default function RecentPayments({ data, loading }: RecentPaymentsProps) {
  const navigate = useNavigate();
  const { lang } = useLang();

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          {t('dashboard.recent_payments', lang)}
        </h3>
        {data.length > 0 && (
          <button onClick={() => navigate('/parent/payments')} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            {t('common.view_all', lang)} <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">{t('dashboard.no_recent_payments', lang)}</p>
      ) : (
        <div className="space-y-2">
          {data.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{p.childName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(p.paymentDate)} · {p.paymentMethod}</p>
              </div>
              <span className="text-sm font-bold text-emerald-600">{formatCurrency(p.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
