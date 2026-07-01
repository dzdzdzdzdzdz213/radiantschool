import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { usePayments } from './usePayments';

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = usePayments(debouncedSearch, page);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paiements</h1>
          <p className="text-sm text-muted-foreground mt-1">Enregistrer et suivre les paiements</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />Nouveau paiement</Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un paiement..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead className="hidden sm:table-cell">Méthode</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell">Reçu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{[1, 2, 3, 4, 5].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun paiement trouvé</TableCell></TableRow>
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
              <p className="text-sm text-muted-foreground">{data.meta.total} paiements</p>
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