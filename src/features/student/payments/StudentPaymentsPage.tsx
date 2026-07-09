import { useState } from 'react';
import { Download, Search, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { useDownloadFile } from '@/hooks/useMutationFeedback';
import { useErrorToast } from '@/hooks/useErrorToast';

export default function StudentPaymentsPage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const downloadFile = useDownloadFile();

  const { data: paymentData, isLoading, isError } = useQuery({
    queryKey: ['student_payments', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return { payments: [], stats: { total: 0, paid: 0, pending: 0 } };
      const { data: payments } = await (supabase as any)
        .from('payments')
        .select('id, amount, payment_method, payment_type, receipt_number, payment_date, status')
        .eq('student_id', profile.id)
        .order('payment_date', { ascending: false });
      const items = (payments ?? []).map((p: any) => p);
      const filtered = search ? items.filter((i: any) => i.receipt_number?.toLowerCase().includes(search.toLowerCase())) : items;
      return { payments: filtered, stats: { total: items.reduce((s: number, i: any) => s + (i.amount ?? 0), 0), paid: items.reduce((s: number, i: any) => s + (i.amount ?? 0), 0), pending: 0 } };
    },
    enabled: !!profile?.id,
  });
  useErrorToast(isError, lang, t('nav.payments', lang));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.payments', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('nav.payments', lang)}</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">{t('status.paid', lang)}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-500">{paymentData?.stats.paid ?? 0} DA</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">{t('status.pending', lang)}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-500">{paymentData?.stats.pending ?? 0} DA</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">{t('common.total', lang)}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{paymentData?.stats.total ?? 0} DA</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('common.search_payment', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" /></div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>{t('common.type', lang)}</TableHead><TableHead>{t('common.date', lang)}</TableHead><TableHead>{t('common.type', lang)}</TableHead><TableHead>{t('common.amount', lang)}</TableHead><TableHead>{t('common.status', lang)}</TableHead><TableHead className="text-right">{t('common.download', lang)}</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 4 }).map((_, i) => (<TableRow key={i}>{[1, 2, 3, 4, 5, 6].map(c => <TableCell key={c}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))
              : (paymentData?.payments ?? []).length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">{t('common.no_data', lang)}</TableCell></TableRow>
              : (paymentData?.payments ?? []).map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm font-mono">{p.receipt_number ?? '—'}</TableCell>
                  <TableCell className="text-sm">{formatDate(p.payment_date)}</TableCell>
                  <TableCell className="text-sm capitalize">{p.payment_method ?? '—'}</TableCell>
                  <TableCell className="text-sm font-medium">{p.amount ?? 0} DA</TableCell>
                  <TableCell><Badge variant={p.status === 'paid' ? 'success' : 'warning'}>{p.status === 'paid' ? t('status.paid', lang) : t('status.pending', lang)}</Badge></TableCell>
                  <TableCell className="text-right">—</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
