import { useState } from 'react';
import { Search, Download, CreditCard, AlertCircle, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { useDownloadFile, useMutationWithFeedback } from '@/hooks/useMutationFeedback';
export default function StudentInvoicesPage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const downloadFile = useDownloadFile();

  const { data: invoices, isLoading, isError } = useQuery({
    queryKey: ['student_invoices', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('invoices')
        .select('id, invoice_number, total_amount, paid_amount, status, due_date, created_at, pdf_url')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
      let items = data ?? [];
      if (search) items = items.filter((i: any) => i.invoice_number?.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  useErrorToast(isError, lang, t('nav.invoices', lang));

  const payMutation = useMutationWithFeedback(
    async ({ invoiceId }: { invoiceId: string }) => {
      if (!profile?.id) return;
      const { data: inv } = await (supabase as any).from('invoices').select('total_amount, paid_amount').eq('id', invoiceId).single();
      const remaining = (inv?.total_amount ?? 0) - (inv?.paid_amount ?? 0);
      const { error } = await supabase.functions.invoke('process-payment', {
        body: {
          student_id: profile.id,
          amount: remaining,
          payment_method: 'bank_transfer',
          payment_type: 'monthly',
          recorded_by: profile.id,
          invoice_ids: [invoiceId],
        },
      });
      if (error) throw error;
    },
    { successMessage: t('success.paid', lang), invalidateQueries: [['student_invoices'], ['student_payments']] },
  );

  const totalDue = (invoices ?? []).filter((i: any) => i.status !== 'paid' && i.status !== 'cancelled').reduce((s: number, i: any) => s + ((i.total_amount ?? 0) - (i.paid_amount ?? 0)), 0);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.invoices', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('nav.invoices', lang)}</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">{t('status.unpaid', lang)}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-500">{totalDue} DA</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">{t('status.paid', lang)}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-500">{(invoices ?? []).filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + (i.paid_amount ?? 0), 0)} DA</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">{t('nav.invoices', lang)}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{invoices?.length ?? 0}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('common.search', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" /></div></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>{t('common.type', lang)}</TableHead><TableHead>{t('common.description', lang)}</TableHead><TableHead>{t('common.date', lang)}</TableHead><TableHead>{t('common.amount', lang)}</TableHead><TableHead>{t('common.total', lang)}</TableHead><TableHead>{t('common.status', lang)}</TableHead><TableHead className="text-right">{t('common.actions', lang)}</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 4 }).map((_, i) => (<TableRow key={i}>{[1, 2, 3, 4, 5, 6, 7].map(c => <TableCell key={c}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))
              : (invoices ?? []).length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">{t('common.no_data', lang)}</TableCell></TableRow>
              : (invoices ?? []).map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-sm font-mono">{inv.invoice_number ?? '—'}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{t('common.type', lang)}</TableCell>
                  <TableCell className="text-sm">{inv.due_date ? formatDate(inv.due_date) : '—'}{inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid' ? <AlertCircle className="h-3 w-3 text-red-500 inline ml-1" /> : null}</TableCell>
                  <TableCell className="text-sm">{inv.total_amount ?? 0} DA</TableCell>
                  <TableCell className="text-sm">{((inv.total_amount ?? 0) - (inv.paid_amount ?? 0))} DA</TableCell>
                  <TableCell><Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'cancelled' ? 'destructive' : 'warning'}>{inv.status === 'paid' ? t('status.paid', lang) : inv.status === 'unpaid' ? t('status.unpaid', lang) : inv.status === 'partially_paid' ? t('status.partial', lang) : inv.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => { if (inv.pdf_url) downloadFile.mutate({ fileUrl: inv.pdf_url, filename: `${t('invoices.invoice_prefix', lang)}_${inv.invoice_number ?? inv.id}.pdf` }); }} disabled={downloadFile.isPending}>
                        {downloadFile.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      </Button>
                      {inv.status !== 'paid' && <Button size="sm" className="h-8 gap-1 text-xs" onClick={() => payMutation.mutate({ invoiceId: inv.id })} disabled={payMutation.isPending}>
                        {payMutation.isPending ? <Loader className="h-3 w-3 animate-spin" /> : <CreditCard className="h-3 w-3" />}{t('nav.payments', lang)}
                      </Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
