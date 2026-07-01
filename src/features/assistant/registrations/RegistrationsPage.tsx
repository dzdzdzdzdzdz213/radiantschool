import { useState } from 'react';
import { Check, X, Clock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils';
import { useRegistrations, useApproveRegistration, useRejectRegistration } from './useRegistrations';

export default function RegistrationsPage() {
  const [tab, setTab] = useState('pending');
  const { data, isLoading } = useRegistrations('', 1, tab === 'pending' ? 'pending' : '');
  const approve = useApproveRegistration();
  const reject = useRejectRegistration();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inscriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérer les inscriptions, validations et liste d'attente</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            En attente
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <Check className="h-4 w-4" />
            Confirmées
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Toutes
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Élève</TableHead>
                    <TableHead>Cours</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {[1, 2, 3, 4, 5].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}
                      </TableRow>
                    ))
                  ) : data?.data.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucune inscription trouvée</TableCell></TableRow>
                  ) : (
                    data?.data.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell><span className="text-sm font-medium">{reg.studentName}</span></TableCell>
                        <TableCell><span className="text-sm">{reg.courseName}</span></TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDateTime(reg.enrollmentDate)}</TableCell>
                        <TableCell>
                          <Badge variant={reg.status === 'active' ? 'success' : reg.status === 'pending' ? 'warning' : 'destructive'}>
                            {reg.status === 'active' ? 'Confirmé' : reg.status === 'pending' ? 'En attente' : 'Rejeté'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {reg.status === 'pending' && (
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => approve.mutate(reg.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => reject.mutate(reg.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}