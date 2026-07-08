import { useState } from 'react';
import { Check, X, Clock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils';
import { useRegistrations, useApproveRegistration, useRejectRegistration } from './useRegistrations';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';

export default function RegistrationsPage() {
  const { lang } = useLang();
  const [tab, setTab] = useState('pending');
  const { data, isLoading, isError } = useRegistrations('', 1, tab === 'all' ? 'all' : tab);
  useErrorToast(isError, lang, t('nav.registrations', lang));
  const approve = useApproveRegistration();
  const reject = useRejectRegistration();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.registrations', lang)}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('registrations.subtitle', lang)}</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            {t('status.pending', lang)}
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <Check className="h-4 w-4" />
            {t('status.confirmed', lang)}
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <UserPlus className="h-4 w-4" />
            {t('common.all', lang)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('nav.students', lang)}</TableHead>
                    <TableHead>{t('nav.courses', lang)}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('common.date', lang)}</TableHead>
                    <TableHead>{t('common.status', lang)}</TableHead>
                    <TableHead className="text-right">{t('common.actions', lang)}</TableHead>
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
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('common.no_results', lang)}</TableCell></TableRow>
                  ) : (
                    data?.data.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell><span className="text-sm font-medium">{reg.studentName}</span></TableCell>
                        <TableCell><span className="text-sm">{reg.courseName}</span></TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDateTime(reg.enrollmentDate)}</TableCell>
                        <TableCell>
                          <Badge variant={reg.status === 'active' ? 'success' : reg.status === 'pending' ? 'warning' : 'destructive'}>
                            {reg.status === 'active' ? t('status.confirmed', lang) : reg.status === 'pending' ? t('status.pending', lang) : t('status.cancelled', lang)}
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