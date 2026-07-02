import { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { usePayments, useCreatePayment } from './usePayments';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function PaymentsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError } = usePayments(debouncedSearch, page);
  const createPayment = useCreatePayment();

  useEffect(() => {
    if (isError) toast(t('errors.load_error', lang, t('nav.payments', lang)), 'error');
  }, [isError]);

  const [showModal, setShowModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentType, setPaymentType] = useState('');

  const handleCreatePayment = () => {
    if (!studentName || !amount || !paymentMethod || !paymentType) {
      toast(t('payments.fill_fields', lang), 'error');
      return;
    }
    createPayment.mutate(
      { student_id: studentName, amount: parseFloat(amount), payment_method: paymentMethod, payment_type: paymentType },
      {
        onSuccess: () => {
          toast(t('success.created', lang, t('nav.payments', lang)), 'success');
          setShowModal(false);
          setStudentName(''); setAmount(''); setPaymentMethod(''); setPaymentType('');
        },
        onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.payments', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('payments.subtitle', lang)}</p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />{t('payments.new', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('payments.new', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('nav.students', lang)}</Label>
                <Input placeholder={t('payments.student_placeholder', lang)} value={studentName} onChange={e => setStudentName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.amount', lang)}</Label>
                <Input type="number" placeholder={t('common.amount', lang)} value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('payments.method', lang)}</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod} placeholder={t('payments.select_method', lang)}>
                  <SelectItem value="cash">{t('payments.cash', lang)}</SelectItem>
                  <SelectItem value="card">{t('payments.card', lang)}</SelectItem>
                  <SelectItem value="check">{t('payments.check', lang)}</SelectItem>
                  <SelectItem value="transfer">{t('payments.transfer', lang)}</SelectItem>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.type', lang)}</Label>
                <Select value={paymentType} onValueChange={setPaymentType} placeholder={t('payments.select_type', lang)}>
                  <SelectItem value="tuition">{t('payments.tuition', lang)}</SelectItem>
                  <SelectItem value="registration">{t('nav.registrations', lang)}</SelectItem>
                  <SelectItem value="material">{t('payments.material', lang)}</SelectItem>
                  <SelectItem value="other">{t('common.other', lang)}</SelectItem>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={handleCreatePayment} disabled={createPayment.isPending}>
                  {createPayment.isPending ? t('common.loading', lang) : t('payments.create', lang)}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{[1, 2, 3, 4, 5].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('common.no_results', lang)}</TableCell></TableRow>
              ) : (
                data?.data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell><span className="text-sm font-medium">{p.studentName}</span></TableCell>
                    <TableCell><span className="text-sm font-semibold">{formatCurrency(p.amount)}</span></TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{p.method}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDateTime(p.paymentDate)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{p.receiptNumber ?? '—'}</TableCell>
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
