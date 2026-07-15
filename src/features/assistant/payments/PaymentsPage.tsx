import { useState } from 'react';
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { usePayments, useCreatePayment, useUpdatePayment, useDeletePayment } from './usePayments';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { useAuth } from '@/hooks/useAuth';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useUsers } from '@/hooks/useQueries';

export default function PaymentsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError } = usePayments(debouncedSearch, page);
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();
  const { data: allUsers } = useUsers();
  const students = (allUsers ?? []).filter((u: any) => u.role === 'student');

  useErrorToast(isError, lang, t('nav.payments', lang));

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ student_id: '', amount: '', payment_method: '', payment_type: '' });

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ student_id: '', amount: '', payment_method: '', payment_type: '' });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setForm({
      student_id: item.student_id ?? '',
      amount: item.amount?.toString() ?? '',
      payment_method: item.method ?? '',
      payment_type: item.type ?? '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.amount || !form.payment_method || !form.payment_type) {
      toast(t('payments.fill_fields', lang), 'error');
      return;
    }
    if (editingId) {
      updatePayment.mutate(
        { id: editingId, data: { amount: parseFloat(form.amount), payment_method: form.payment_method, payment_type: form.payment_type } },
        {
          onSuccess: () => {
            toast(t('success.updated', lang, t('nav.payments', lang)), 'success');
            setShowModal(false);
            setEditingId(null);
            setForm({ student_id: '', amount: '', payment_method: '', payment_type: '' });
          },
          onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
        },
      );
    } else {
      const studentId = form.student_id || undefined;
      createPayment.mutate(
        { student_id: studentId, amount: parseFloat(form.amount), payment_method: form.payment_method, payment_type: form.payment_type, recorded_by: profile?.id },
        {
          onSuccess: () => {
            toast(t('success.created', lang, t('nav.payments', lang)), 'success');
            setShowModal(false);
            setForm({ student_id: '', amount: '', payment_method: '', payment_type: '' });
          },
          onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
        },
      );
    }
  };

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deletePayment.mutate(confirmDelete.id, { onSuccess: () => toast(t('success.deleted', lang, t('nav.payments', lang)), 'success'), onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'), onSettled: () => setConfirmDelete(null) }); }}
        message={`${t('common.confirm_delete', lang)} "${confirmDelete?.name ?? ''}" ?`}
        loading={deletePayment.isPending}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.payments', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('payments.subtitle', lang)}</p>
        </div>
        <Button className="gap-2" onClick={openCreateModal}><Plus className="h-4 w-4" />{t('payments.new', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4 my-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{editingId ? t('common.edit', lang) : t('payments.new', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('nav.students', lang)}</Label>
                <Select value={form.student_id} onValueChange={v => setForm(f => ({ ...f, student_id: v }))} placeholder={t('payments.student_placeholder', lang)}>
                  {students.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.amount', lang)}</Label>
                <Input type="number" placeholder={t('common.amount', lang)} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('payments.method', lang)}</Label>
                <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))} placeholder={t('payments.select_method', lang)}>
                  <SelectItem value="cash">{t('payments.cash', lang)}</SelectItem>
                  <SelectItem value="card">{t('payments.card', lang)}</SelectItem>
                  <SelectItem value="check">{t('payments.check', lang)}</SelectItem>
                  <SelectItem value="bank_transfer">{t('payments.transfer', lang)}</SelectItem>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.type', lang)}</Label>
                <Select value={form.payment_type} onValueChange={v => setForm(f => ({ ...f, payment_type: v }))} placeholder={t('payments.select_type', lang)}>
                  <SelectItem value="monthly">{t('payments.monthly', lang)}</SelectItem>
                  <SelectItem value="per_session">{t('payments.per_session', lang)}</SelectItem>
                  <SelectItem value="vip">{t('payments.vip', lang)}</SelectItem>
                  <SelectItem value="private">{t('payments.private', lang)}</SelectItem>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={handleSave} disabled={createPayment.isPending || updatePayment.isPending}>
                  {(createPayment.isPending || updatePayment.isPending) ? t('common.loading', lang) : (editingId ? t('common.save', lang) : t('payments.create', lang))}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('common.search_payment', lang)} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('nav.students', lang)}</TableHead>
                <TableHead>{t('common.amount', lang)}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('payments.method', lang)}</TableHead>
                <TableHead className="hidden md:table-cell">{t('common.date', lang)}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('payments.receipt', lang)}</TableHead>
                <TableHead className="w-20">{t('common.actions', lang)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{[1, 2, 3, 4, 5, 6].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('common.no_results', lang)}</TableCell></TableRow>
              ) : (
                data?.data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell><span className="text-sm font-medium">{p.studentName}</span></TableCell>
                    <TableCell><span className="text-sm font-semibold">{formatCurrency(p.amount)}</span></TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{p.method}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDateTime(p.paymentDate)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{p.receiptNumber ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmDelete({ id: p.id, name: p.studentName })} disabled={deletePayment.isPending}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">{t('common.total', lang)} : {data.meta.total}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('common.previous', lang)}</Button>
                <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}>{t('common.next', lang)}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
