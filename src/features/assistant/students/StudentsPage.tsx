import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/useDebounce';
import { getInitials, formatDateTime, getStatusColor } from '@/lib/utils';
import { useStudents } from './useStudents';

export default function StudentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useStudents(debouncedSearch, page, 20, statusFilter ? { status: statusFilter } : undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Élèves</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérer les inscriptions et informations des élèves</p>
        </div>
        <Button onClick={() => navigate('/assistant/students/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel élève
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un élève..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="h-9 pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              {['active', 'pending', 'inactive', 'suspended'].map(s => (
                <Button
                  key={s}
                  variant={statusFilter === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setStatusFilter(statusFilter === s ? '' : s); setPage(1); }}
                  className="h-8"
                >
                  {s === 'active' ? 'Actif' : s === 'pending' ? 'En attente' : s === 'inactive' ? 'Inactif' : 'Suspendu'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Téléphone</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1, 2, 3, 4, 5].map(c => (
                      <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucun élève trouvé
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((student) => (
                  <TableRow
                    key={student.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => navigate(`/assistant/students/${student.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(student.firstName, student.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground">Inscrit le {formatDateTime(student.createdAt)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{student.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{student.phone ?? '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{student.studentType ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={student.status === 'active' ? 'success' : student.status === 'pending' ? 'warning' : student.status === 'suspended' ? 'destructive' : 'outline'}>
                        {student.status === 'active' ? 'Actif' : student.status === 'pending' ? 'En attente' : student.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">{data.meta.total} élèves</p>
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