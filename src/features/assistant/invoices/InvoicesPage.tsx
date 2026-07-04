import { useState, useEffect } from 'react';
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice } from './useInvoices';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function InvoicesPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError } = useInvoices(debouncedSearch, page, statusFilter);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isError) toast(t('errors.load_error', lang, t('nav.invoices', lang)), 'error');
  }, [isError]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ student_id: '', total_amount: '', due_date: '' });

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ student_id: '', total_amount: '', due_date: '' });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setForm({
      student_id: item.student_id ?? item.studentName ?? '',
      total_amount: item.totalAmount?.toString() ?? '',
      due_date: item.dueDate ?? '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.total_amount || !form.due_date) {
      toast(t('invoices.fill_fields', lang), 'error');
      return;
    }
    if (editingId) {
      updateInvoice.mutate(
        { id: editingId, data: { total_amount: parseFloat(form.total_amount), due_date: form.due_date } },
        {
          onSuccess: () => {
            toast(t('success.updated', lang, t('nav.invoices', lang)), 'success');
            setShowModal(false);
            setEditingId(null);
            setForm({ student_id: '', total_amount: '', due_date: '' });
          },
          onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
        },
      );
    } else {
      const studentId = form.student_id || undefined;
      createInvoice.mutate(
        { student_id: studentId, total_amount: parseFloat(form.total_amount), due_date: form.due_date, status: 'unpaid', paid_amount: 0 },
        {
          onSuccess: () => {
            toast(t('success.created', lang, t('nav.invoices', lang)), 'success');
            setShowModal(false);
            setForm({ student_id: '', total_amount: '', due_date: '' });
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
        onConfirm={() => { if (confirmDelete) deleteInvoice.mutate(confirmDelete.id, { onSuccess: () => toast(t('success.deleted', lang, t('nav.invoices', lang)), 'success'), onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'), onSettled: () => setConfirmDelete(null) }); }}
        message={`${t('common.confirm_delete', lang)} "${confirmDelete?.name ?? ''}" ?`}
        loading={deleteInvoice.isPending}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.invoices', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('invoices.subtitle', lang)}</p>
        </div>
        <Button className="gap-2" onClick={openCreateModal}><Plus className="h-4 w-4" />{t('invoices.new', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{editingId ? t('common.edit', lang) : t('invoices.new', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('nav.students', lang)}</Label>
                <Input placeholder={t('invoices.student_placeholder', lang)} value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.amount', lang)}</Label>
                <Input type="number" placeholder={t('common.amount', lang)} value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('invoices.due_date', lang)}</Label>
                <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={handleSave} disabled={createInvoice.isPending || updateInvoice.isPending}>
                  {(createInvoice.isPending || updateInvoice.isPending) ? t('common.loading', lang) : (editingId ? t('common.save', lang) : t('invoices.create', lang))}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('common.search', lang)} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="h-9 pl-9" />
            </div>
            <div className="flex gap-2">
              {['', 'unpaid', 'paid', 'partially_paid', 'overdue'].map(s => (
                <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => { setStatusFilter(s); setPage(1); }} className="h-8">
                  {s ? (s === 'unpaid' ? t('status.unpaid', lang) : s === 'paid' ? t('status.paid', lang) : s === 'partially_paid' ? t('status.partial', lang) : s === 'overdue' ? t('status.late', lang) : '') : t('common.all', lang)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('invoices.number', lang)}</TableHead>
                <TableHead>{t('nav.students', lang)}</TableHead>
                <TableHead>{t('common.amount', lang)}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('status.paid', lang)}</TableHead>
                <TableHead className="hidden md:table-cell">{t('invoices.due_date', lang)}</TableHead>
                <TableHead className="text-right">{t('common.status', lang)}</TableHead>
                <TableHead className="w-20">{t('common.actions', lang)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{[1, 2, 3, 4, 5, 6, 7].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('common.no_results', lang)}</TableCell></TableRow>
              ) : (
                data?.data.map((inv) => {
                  const remaining = inv.totalAmount - inv.paidAmount;
                  return (
                    <TableRow key={inv.id}>
                      <TableCell><span className="text-sm font-mono">{inv.invoiceNumber}</span></TableCell>
                      <TableCell><span className="text-sm font-medium">{inv.studentName}</span></TableCell>
                      <TableCell><span className="text-sm font-semibold">{formatCurrency(inv.totalAmount)}</span></TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{formatCurrency(inv.paidAmount)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'partially_paid' ? 'warning' : inv.status === 'overdue' ? 'destructive' : 'outline'}>
                          {remaining <= 0 ? t('status.paid', lang) : inv.status === 'overdue' ? t('status.late', lang) : `${formatCurrency(remaining)}`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(inv)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmDelete({ id: inv.id, name: inv.invoiceNumber })} disabled={deleteInvoice.isPending}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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
