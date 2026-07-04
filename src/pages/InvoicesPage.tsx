import { useInvoices } from '@/hooks/useQueries';
import { formatCurrency, formatDate, getStatusColor, getFullName } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { FileText } from 'lucide-react';
import { useErrorToast } from '@/hooks/useErrorToast';

export default function InvoicesPage() {
  const { lang } = useLang();
  const { data: invoices, isLoading, isError } = useInvoices();

  useErrorToast(isError, lang, 'des factures');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('nav.invoices', lang)}</h1>
      <div className="rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted">{t('common.loading', lang)}</div>
        ) : invoices && invoices.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted">
                <th className="px-4 py-3 font-medium">N° Facture</th>
                <th className="px-4 py-3 font-medium">Élève</th>
                <th className="px-4 py-3 font-medium">{t('common.total', lang)}</th>
                <th className="px-4 py-3 font-medium">{t('status.paid', lang)}</th>
                <th className="px-4 py-3 font-medium">Solde</th>
                <th className="px-4 py-3 font-medium">{t('common.status', lang)}</th>
                <th className="px-4 py-3 font-medium">{t('common.date', lang)}</th>
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
            <p>{t('common.no_data', lang)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
