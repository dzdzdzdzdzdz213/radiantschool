import { useState } from 'react';
import { Search, Check, X, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useDebounce } from '@/hooks/useDebounce';
import { useAttendance, useCorrectAttendance } from './useAttendance';

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useAttendance(date, debouncedSearch);
  const correct = useCorrectAttendance();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Présences</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérer les présences, corrections manuelles et historique</p>
        </div>
        <div className="flex items-center gap-3">
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9 w-40" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un élève..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead className="hidden sm:table-cell">Cours</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">Méthode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{[1, 2, 3, 4, 5].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
                ))
              ) : data?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucune présence pour cette date</TableCell></TableRow>
              ) : (
                data?.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell><span className="text-sm font-medium">{rec.studentName}</span></TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{rec.courseName}</TableCell>
                    <TableCell>
                      <Badge variant={rec.status === 'present' ? 'success' : rec.status === 'late' ? 'warning' : 'destructive'}>
                        {rec.status === 'present' ? 'Présent' : rec.status === 'late' ? 'En retard' : 'Absent'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {rec.method === 'rfid' ? 'RFID' : 'Manuel'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => correct.mutate({ id: rec.id, data: { status: 'present' } })}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-amber-600" onClick={() => correct.mutate({ id: rec.id, data: { status: 'late' } })}>
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => correct.mutate({ id: rec.id, data: { status: 'absent' } })}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}