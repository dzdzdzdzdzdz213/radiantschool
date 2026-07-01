import { useState } from 'react';
import { DollarSign, CreditCard, Calendar, Download, CheckCircle, XCircle, Search, Receipt } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export default function StudentPaymentsPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');

  const { data: paymentData, isLoading } = useQuery({
    queryKey: ['student_payments', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { payments: [], stats: { total: 0, paid: 0, pending: 0 } };
      const { data: payments } = await (supabase as any)
        .from('payments')
        .select('id, amount, method, status, receipt_number, created_at, invoice:invoices(reference)')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
      const items = (payments ?? []).map((p: any) => ({ ...p, invoiceRef: p.invoice?.reference ?? '' }));
      const filtered = search ? items.filter((i: any) => i.receipt_number?.toLowerCase().includes(search.toLowerCase()) || i.invoiceRef?.toLowerCase().includes(search.toLowerCase())) : items;
      const paid = items.filter((i: any) => i.status === 'paid');
      const pending = items.filter((i: any) => i.status === 'pending');
      return { payments: filtered, stats: { total: items.reduce((s: number, i: any) => s + (i.amount ?? 0), 0), paid: paid.reduce((s: number, i: any) => s + (i.amount ?? 0), 0), pending: pending.reduce((s: number, i: any) => s + (i.amount ?? 0), 0) } };
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Paiements</h1><p className="text-sm text-muted-foreground mt-1">Historique de vos transactions</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total payé</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-500">{paymentData?.stats.paid ?? 0} DA</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">En attente</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-500">{paymentData?.stats.pending ?? 0} DA</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{paymentData?.stats.total ?? 0} DA</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher une transaction..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" /></div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Réf.</TableHead><TableHead>Date</TableHead><TableHead>Méthode</TableHead><TableHead>Montant</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Reçu</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 4 }).map((_, i) => (<TableRow key={i}>{[1, 2, 3, 4, 5, 6].map(c => <TableCell key={c}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))
              : (paymentData?.payments ?? []).length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Aucun paiement</TableCell></TableRow>
              : (paymentData?.payments ?? []).map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm font-mono">{p.receipt_number ?? '—'}</TableCell>
                  <TableCell className="text-sm">{formatDate(p.created_at)}</TableCell>
                  <TableCell className="text-sm capitalize">{p.method === 'card' ? 'Carte' : p.method === 'cash' ? 'Espèces' : p.method === 'cheque' ? 'Chèque' : p.method ?? '—'}</TableCell>
                  <TableCell className="text-sm font-medium">{p.amount ?? 0} DA</TableCell>
                  <TableCell><Badge variant={p.status === 'paid' ? 'success' : 'warning'}>{p.status === 'paid' ? 'Payé' : 'En attente'}</Badge></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm" className="h-8 w-8"><Download className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}