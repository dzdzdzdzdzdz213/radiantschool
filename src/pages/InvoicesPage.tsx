import { useInvoices } from '@/hooks/useQueries';
import { formatCurrency, formatDate, getStatusColor, getFullName } from '@/lib/utils';
import { FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useEffect } from 'react';

export default function InvoicesPage() {
  const { data: invoices, isLoading, isError } = useInvoices();
  const { toast } = useToast();

  useEffect(() => {
    if (isError) toast('Erreur de chargement des factures', 'error');
  }, [isError]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Factures</h1>
      <div className="rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted">Chargement...</div>
        ) : invoices && invoices.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted">
                <th className="px-4 py-3 font-medium">N° Facture</th>
                <th className="px-4 py-3 font-medium">Élève</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payé</th>
                <th className="px-4 py-3 font-medium">Solde</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Échéance</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="border-b text-sm last:border-0">
                  <td className="px-4 py-3 font-medium">{inv.invoice_number}</td>
                  <td className="px-4 py-3">{getFullName(inv.student?.first_name || '', inv.student?.last_name || '')}</td>
                  <td className="px-4 py-3">{formatCurrency(inv.total_amount)}</td>
                  <td className="px-4 py-3">{formatCurrency(inv.paid_amount)}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(inv.total_amount - inv.paid_amount)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                  <td className="px-4 py-3 text-muted">{formatDate(inv.due_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-muted">
            <FileText className="mx-auto mb-2 h-8 w-8" />
            <p>Aucune facture</p>
          </div>
        )}
      </div>
    </div>
  );
}
