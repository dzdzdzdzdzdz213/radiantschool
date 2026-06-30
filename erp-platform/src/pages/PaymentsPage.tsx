import { useState } from 'react';
import { usePayments } from '@/hooks/useQueries';
import { formatCurrency, formatDateTime, getFullName } from '@/lib/utils';
import { Search, Plus, DollarSign } from 'lucide-react';

export default function PaymentsPage() {
  const { data: payments, isLoading } = usePayments();
  const [search, setSearch] = useState('');

  const filtered = (payments ?? []).filter((p: any) =>
    getFullName(p.student?.first_name || '', p.student?.last_name || '').toLowerCase().includes(search.toLowerCase()) ||
    p.receipt_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Paiements</h1>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"><Plus className="h-4 w-4" /> Nouveau paiement</button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm" />
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted">
            <DollarSign className="mx-auto mb-2 h-8 w-8" />
            <p>Aucun paiement</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted">
                <th className="px-4 py-3 font-medium">Reçu</th>
                <th className="px-4 py-3 font-medium">Élève</th>
                <th className="px-4 py-3 font-medium">Montant</th>
                <th className="px-4 py-3 font-medium">Méthode</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.id} className="border-b text-sm last:border-0">
                  <td className="px-4 py-3 font-medium">{p.receipt_number}</td>
                  <td className="px-4 py-3">{getFullName(p.student?.first_name || '', p.student?.last_name || '')}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-muted">{p.payment_method}</td>
                  <td className="px-4 py-3 text-muted">{p.payment_type}</td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
