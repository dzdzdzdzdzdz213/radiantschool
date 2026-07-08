import { useState } from 'react';
import { usePayments } from '@/hooks/useQueries';
import { formatCurrency, formatDateTime, getFullName } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Search, Plus, DollarSign, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentsPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const { toast } = useToast();
  const { data: payments, isLoading } = usePayments();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student_id: '', amount: '', payment_method: 'cash', payment_type: 'tuition', receipt_number: '' });

  const createPayment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('payments').insert({
        student_id: form.student_id,
        amount: Number(form.amount),
        payment_method: form.payment_method,
        payment_type: form.payment_type,
        recorded_by: profile!.id,
        receipt_number: form.receipt_number || `PAY-${Date.now()}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast(t('success.created', lang, 'Paiement'), 'success');
      setShowModal(false);
      setForm({ student_id: '', amount: '', payment_method: 'cash', payment_type: 'tuition', receipt_number: '' });
    },
    onError: (err: any) => toast(err?.message ?? t('errors.unknown', lang), 'error'),
  });

  const filtered = (payments ?? []).filter((p: any) =>
    getFullName(p.student?.first_name || '', p.student?.last_name || '').toLowerCase().includes(search.toLowerCase()) ||
    p.receipt_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.payments', lang)}</h1>
        <button className="btn-primary h-9 gap-2" onClick={() => setShowModal(true)}><Plus className="h-4 w-4" /> {t('common.add', lang)}</button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search', lang)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pl-10 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" />
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">{t('common.loading', lang)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <DollarSign className="mx-auto mb-2 h-8 w-8" />
            <p>{t('common.no_data', lang)}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">{t('payments.receipt', lang)}</th>
                <th className="px-4 py-3 font-medium">{t('common.student', lang)}</th>
                <th className="px-4 py-3 font-medium">{t('common.amount', lang)}</th>
                <th className="px-4 py-3 font-medium">{t('payments.method', lang)}</th>
                <th className="px-4 py-3 font-medium">{t('common.type', lang)}</th>
                <th className="px-4 py-3 font-medium">{t('common.date', lang)}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.id} className="border-b text-sm last:border-0">
                  <td className="px-4 py-3 font-medium">{p.receipt_number}</td>
                  <td className="px-4 py-3">{getFullName(p.student?.first_name || '', p.student?.last_name || '')}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.payment_method}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.payment_type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(p.created_at)}</td>
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
              <h2 className="text-lg font-semibold">{t('common.add', lang)}</h2>
              <button onClick={() => setShowModal(false)} className="rounded p-1 hover:bg-page"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">{t('common.name', lang)}</label>
                <input className="w-full rounded-lg border px-3 py-2 text-sm" value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))} placeholder={t('common.search_payment', lang)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t('common.amount', lang)} (DZD)</label>
                <input type="number" className="w-full rounded-lg border px-3 py-2 text-sm" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t('payments.method', lang)}</label>
                <select className="w-full rounded-lg border px-3 py-2 text-sm" value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                  <option value="cash">{t('payments.method_cash', lang)}</option>
                  <option value="card">{t('payments.method_card', lang)}</option>
                  <option value="check">{t('payments.method_check', lang)}</option>
                  <option value="transfer">{t('payments.method_transfer', lang)}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t('common.type', lang)}</label>
                <select className="w-full rounded-lg border px-3 py-2 text-sm" value={form.payment_type} onChange={e => setForm(f => ({ ...f, payment_type: e.target.value }))}>
                  <option value="tuition">{t('payments.type_tuition', lang)}</option>
                  <option value="registration">{t('payments.type_registration', lang)}</option>
                  <option value="material">{t('payments.type_material', lang)}</option>
                  <option value="other">{t('payments.type_other', lang)}</option>
                </select>
              </div>
              <button
                onClick={() => createPayment.mutate()}
                disabled={createPayment.isPending || !form.student_id || !form.amount}
                className="btn-primary w-full"
              >
                {createPayment.isPending ? t('common.loading', lang) : t('common.save', lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
