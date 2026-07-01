import { useState } from 'react';
import { usePayments } from '@/hooks/useQueries';
import { formatCurrency, formatDateTime, getFullName } from '@/lib/utils';
import { Search, Plus, DollarSign, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function PaymentsPage() {
  const { toast } = useToast();
  const { data: payments, isLoading } = usePayments();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student_id: '', amount: '', payment_method: 'cash', payment_type: 'tuition', receipt_number: '' });

  const createPayment = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from('payments').insert({
        student_id: form.student_id,
        amount: Number(form.amount),
        payment_method: form.payment_method,
        payment_type: form.payment_type,
        receipt_number: form.receipt_number || `PAY-${Date.now()}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast('Paiement enregistré', 'success');
      setShowModal(false);
      setForm({ student_id: '', amount: '', payment_method: 'cash', payment_type: 'tuition', receipt_number: '' });
    },
    onError: (err: any) => toast(err?.message ?? 'Erreur', 'error'),
  });

  const filtered = (payments ?? []).filter((p: any) =>
    getFullName(p.student?.first_name || '', p.student?.last_name || '').toLowerCase().includes(search.toLowerCase()) ||
    p.receipt_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Paiements</h1>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90" onClick={() => setShowModal(true)}><Plus className="h-4 w-4" /> Nouveau paiement</button>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Nouveau paiement</h2>
              <button onClick={() => setShowModal(false)} className="rounded p-1 hover:bg-page"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">ID Élève</label>
                <input className="w-full rounded-lg border px-3 py-2 text-sm" value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))} placeholder="ID de l'élève" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Montant (DZD)</label>
                <input type="number" className="w-full rounded-lg border px-3 py-2 text-sm" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Méthode</label>
                <select className="w-full rounded-lg border px-3 py-2 text-sm" value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                  <option value="cash">Espèces</option>
                  <option value="card">Carte</option>
                  <option value="check">Chèque</option>
                  <option value="transfer">Virement</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>
                <select className="w-full rounded-lg border px-3 py-2 text-sm" value={form.payment_type} onChange={e => setForm(f => ({ ...f, payment_type: e.target.value }))}>
                  <option value="tuition">Frais de scolarité</option>
                  <option value="registration">Inscription</option>
                  <option value="material">Matériel</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <button
                onClick={() => createPayment.mutate()}
                disabled={createPayment.isPending || !form.student_id || !form.amount}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {createPayment.isPending ? 'Enregistrement...' : 'Enregistrer le paiement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
