import { useState } from 'react';
import { Search, Plus, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useInvoices } from './useInvoices';

export default function InvoicesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useInvoices(debouncedSearch, page, statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Factures</h1>
          <p className="text-sm text-muted-foreground mt-1">Générer et gérer les factures</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />Nouvelle facture</Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="h-9 pl-9" />
            </div>
            <div className="flex gap-2">
              {['', 'unpaid', 'paid', 'partially_paid', 'overdue'].map(s => (
                <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => { setStatusFilter(s); setPage(1); }} className="h-8">
                  {s ? (s === 'unpaid' ? 'Impayé' : s === 'paid' ? 'Payé' : s === 'partially_paid' ? 'Partiel' : s === 'overdue' ? 'En retard' : '') : 'Toutes'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Élève</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead className="hidden sm:table-cell">Payé</TableHead>
                <TableHead className="hidden md:table-cell">Échéance</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{[1, 2, 3, 4, 5, 6].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune facture trouvée</TableCell></TableRow>
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
                          {remaining <= 0 ? 'Payée' : inv.status === 'overdue' ? 'En retard' : `${formatCurrency(remaining)}`}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">{data.meta.total} factures</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
                <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}