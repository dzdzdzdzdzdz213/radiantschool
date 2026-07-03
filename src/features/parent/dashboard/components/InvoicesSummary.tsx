import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { InvoiceSummary } from '../useParentDashboard';

interface InvoicesSummaryProps {
  data: InvoiceSummary[];
  loading?: boolean;
}

export default function InvoicesSummary({ data, loading }: InvoicesSummaryProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  const unpaid = data.filter(inv => inv.status !== 'paid');

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Factures
        </h3>
        {data.length > 0 && (
          <button onClick={() => navigate('/parent/invoices')} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            Voir tout <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Aucune facture</p>
      ) : (
        <div className="space-y-2">
          {(unpaid.length > 0 ? unpaid : data).slice(0, 5).map((inv) => {
            const remaining = inv.totalAmount - inv.paidAmount;
            return (
              <div key={inv.id} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{inv.childName}</p>
                  <p className="text-xs text-muted-foreground">{inv.invoiceNumber} · {formatDate(inv.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${remaining > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatCurrency(remaining)}
                  </p>
                  <p className={`text-[10px] font-medium ${
                    inv.status === 'paid' ? 'text-emerald-600' :
                    inv.status === 'overdue' ? 'text-red-600' :
                    'text-amber-600'
                  }`}>
                    {inv.status === 'paid' ? 'Payée' : inv.status === 'overdue' ? 'En retard' : 'En attente'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
