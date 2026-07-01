import { useState } from 'react';
import { Search, FileText, Download, CreditCard, Calendar, AlertCircle } from 'lucide-react';
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

export default function StudentInvoicesPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['student_invoices', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('invoices')
        .select('id, reference, description, total_amount, paid_amount, remaining_amount, status, due_date, created_at')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
      let items = data ?? [];
      if (search) items = items.filter((i: any) => i.reference?.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  const totalDue = (invoices ?? []).filter((i: any) => i.status === 'sent').reduce((s: number, i: any) => s + (i.remaining_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Factures</h1><p className="text-sm text-muted-foreground mt-1">Consultez et payez vos factures</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total impayé</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-500">{totalDue} DA</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Payé</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-500">{(invoices ?? []).filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + (i.paid_amount ?? 0), 0)} DA</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Factures</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{invoices?.length ?? 0}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" /></div></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Référence</TableHead><TableHead>Description</TableHead><TableHead>Échéance</TableHead><TableHead>Montant</TableHead><TableHead>Restant</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 4 }).map((_, i) => (<TableRow key={i}>{[1, 2, 3, 4, 5, 6, 7].map(c => <TableCell key={c}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))
              : (invoices ?? []).length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Aucune facture</TableCell></TableRow>
              : (invoices ?? []).map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-sm font-mono">{inv.reference ?? '—'}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{inv.description ?? ''}</TableCell>
                  <TableCell className="text-sm">{inv.due_date ? formatDate(inv.due_date) : '—'}{inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid' ? <AlertCircle className="h-3 w-3 text-red-500 inline ml-1" /> : null}</TableCell>
                  <TableCell className="text-sm">{inv.total_amount ?? 0} DA</TableCell>
                  <TableCell className="text-sm">{inv.remaining_amount ?? 0} DA</TableCell>
                  <TableCell><Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'cancelled' ? 'destructive' : inv.status === 'overdue' ? 'destructive' : 'warning'}>{inv.status === 'paid' ? 'Payée' : inv.status === 'sent' ? 'Envoyée' : inv.status === 'overdue' ? 'En retard' : inv.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                      {inv.status !== 'paid' && <Button size="sm" className="h-8 gap-1 text-xs"><CreditCard className="h-3 w-3" />Payer</Button>}
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