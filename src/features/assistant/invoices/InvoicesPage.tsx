import { useState } from 'react';
import { Search, Plus, X, Pencil, Trash2, Banknote } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice, useRecordInvoicePayment, type InvoiceRecord } from './useInvoices';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useStudents } from '@/features/assistant/students/useStudents';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card', 'check'] as const;

export default function InvoicesPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError } = useInvoices(debouncedSearch, page, statusFilter);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const recordPayment = useRecordInvoicePayment();

  useErrorToast(isError, lang, t('nav.invoices', lang));

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [studentIdError, setStudentIdError] = useState('');
  const [form, setForm] = useState({ student_id: '', total_amount: '', due_date: '' });
  const [studentSearch, setStudentSearch] = useState('');
  const [studentOpen, setStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);
  const debouncedStudentSearch = useDebounce(studentSearch, 300);
  const { data: studentResults } = useStudents(debouncedStudentSearch, 1, 10);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ student_id: '', total_amount: '', due_date: '' });
    setStudentSearch('');
    setStudentOpen(false);
    setSelectedStudent(null);
    setShowModal(true);
  };

  const openEditModal = (item: NonNullable<NonNullable<typeof data>['data']>[number]) => {
    setEditingId(item.id);
    setForm({
      student_id: item.student_id ?? '',
      total_amount: item.totalAmount?.toString() ?? '',
      due_date: item.dueDate ?? '',
    });
    setStudentSearch('');
    setStudentOpen(false);
    setSelectedStudent(null);
    if (item.student_id) {
      supabase.from('users').select('first_name, last_name').eq('id', item.student_id).maybeSingle().then(({ data: s }) => {
        if (s) setSelectedStudent({ id: item.student_id, name: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() });
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.total_amount || !form.due_date) {
      toast(t('invoices.fill_fields', lang), 'error');
      return;
    }
    const total = parseFloat(form.total_amount);
    if (isNaN(total) || total <= 0) {
      toast(t('invoices.fill_fields', lang), 'error');
      return;
    }
    if (!editingId && form.student_id && !UUID_REGEX.test(form.student_id)) {
      setStudentIdError(t('errors.invalid_uuid', lang));
      return;
    }
    const editingItem = editingId ? data?.data?.find(i => i.id === editingId) : null;
    if (editingItem && total < (editingItem.paidAmount ?? 0)) {
      toast('Le montant ne peut pas être inférieur à la somme déjà payée', 'error');
      return;
    }
    setStudentIdError('');
    if (editingId) {
      updateInvoice.mutate(
        { id: editingId, data: { total_amount: total, due_date: form.due_date } },
        {
          onSuccess: () => {
            toast(t('success.updated', lang, t('nav.invoices', lang)), 'success');
            setShowModal(false);
            setEditingId(null);
            setForm({ student_id: '', total_amount: '', due_date: '' });
          },
          onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
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
          onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
        },
      );
    }
  };

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [payInvoice, setPayInvoice] = useState<InvoiceRecord | null>(null);
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash', date: '', notes: '' });

  const openPayModal = (inv: InvoiceRecord) => {
    const remaining = inv.totalAmount - inv.paidAmount;
    const now = new Date();
    const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    setPayInvoice(inv);
    setPayForm({ amount: remaining > 0 ? remaining.toString() : '', method: 'cash', date: localToday, notes: '' });
  };

  const handleRecordPayment = () => {
    if (!payInvoice) return;
    const amount = parseFloat(payForm.amount);
    if (!amount || amount <= 0 || !payForm.date) {
      toast(t('invoices.fill_fields', lang), 'error');
      return;
    }
    recordPayment.mutate(
      { invoice_id: Number(payInvoice.id), amount, payment_method: payForm.method as never, payment_date: payForm.date, notes: payForm.notes || undefined },
      {
        onSuccess: (res) => {
          toast(res.receipt_number ? `${t('payments.recorded', lang)} — ${res.receipt_number}` : t('payments.recorded', lang), 'success');
          setPayInvoice(null);
        },
        onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
      },
    );
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteInvoice.mutate(confirmDelete.id, { onSuccess: () => toast(t('success.deleted', lang, t('nav.invoices', lang)), 'success'), onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'), onSettled: () => setConfirmDelete(null) }); }}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4 my-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{editingId ? t('common.edit', lang) : t('invoices.new', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('nav.students', lang)}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 pr-8"
                    placeholder={t('invoices.student_placeholder', lang)}
                    value={studentSearch}
                    onChange={e => { setStudentSearch(e.target.value); setStudentOpen(true); }}
                    onFocus={() => setStudentOpen(true)}
                    onBlur={() => setTimeout(() => setStudentOpen(false), 150)}
                  />
                  {selectedStudent && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => { setSelectedStudent(null); setForm(f => ({ ...f, student_id: '' })); setStudentSearch(''); }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {studentOpen && (
                    <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border bg-background shadow-lg">
                      {studentResults?.data.length ? studentResults.data.map(s => (
                        <button
                          type="button"
                          key={s.id}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                          onMouseDown={() => {
                            setSelectedStudent({ id: s.id, name: `${s.firstName} ${s.lastName}`.trim() });
                            setForm(f => ({ ...f, student_id: s.id }));
                            setStudentSearch('');
                            setStudentOpen(false);
                          }}
                        >
                          <span className="font-medium truncate">{`${s.firstName} ${s.lastName}`.trim()}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[40%]">{s.email}</span>
                        </button>
                      )) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">{t('common.no_results', lang)}</div>
                      )}
                    </div>
                  )}
                </div>
                {selectedStudent && <p className="text-xs text-muted-foreground">{selectedStudent.name}</p>}
                {studentIdError && <p className="text-xs text-destructive mt-1">{studentIdError}</p>}
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
      {payInvoice && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setPayInvoice(null)} />
          <Card className="relative w-full max-w-lg mx-4 my-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('payments.record_title', lang)}</CardTitle>
              <button onClick={() => setPayInvoice(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm bg-muted/40 rounded-lg px-3 py-2">
                <span className="font-medium">{payInvoice.invoiceNumber} · {payInvoice.studentName}</span>
                <span className="text-muted-foreground">{t('payments.remaining', lang)} : <span className="font-semibold text-foreground">{formatCurrency(payInvoice.totalAmount - payInvoice.paidAmount)}</span></span>
              </div>
              <div className="space-y-2">
                <Label>{t('common.amount', lang)}</Label>
                <Input type="number" min="0" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('payments.method', lang)}</Label>
                <Select value={payForm.method} onValueChange={v => setPayForm(f => ({ ...f, method: v }))} placeholder={t('payments.method', lang)}>
                  {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{t(`payments.method_${m === 'bank_transfer' ? 'transfer' : m}`, lang)}</SelectItem>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('payments.date', lang)}</Label>
                <Input type="date" value={payForm.date} onChange={e => setPayForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('payments.notes', lang)}</Label>
                <Input value={payForm.notes} onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setPayInvoice(null)}>{t('common.cancel', lang)}</Button>
                <Button onClick={handleRecordPayment} disabled={recordPayment.isPending}>
                  {recordPayment.isPending ? t('common.loading', lang) : t('payments.record', lang)}
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
                  const isOverdue = remaining > 0 && inv.status !== 'cancelled' && !!inv.dueDate && inv.dueDate < new Date().toISOString().slice(0, 10);
                  return (
                    <TableRow key={inv.id}>
                      <TableCell><span className="text-sm font-mono">{inv.invoiceNumber}</span></TableCell>
                      <TableCell><span className="text-sm font-medium">{inv.studentName}</span></TableCell>
                      <TableCell><span className="text-sm font-semibold">{formatCurrency(inv.totalAmount)}</span></TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{formatCurrency(inv.paidAmount)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={inv.status === 'paid' ? 'success' : isOverdue ? 'destructive' : inv.status === 'partially_paid' ? 'warning' : 'outline'}>
                          {remaining <= 0 ? t('status.paid', lang) : isOverdue ? t('status.late', lang) : `${formatCurrency(remaining)}`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openPayModal(inv)} disabled={remaining <= 0 || inv.status === 'cancelled'} title={t('payments.record', lang)}><Banknote className="h-4 w-4" /></Button>
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
