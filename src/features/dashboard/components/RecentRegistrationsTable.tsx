import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials, formatDateTime } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { RecentRegistration } from '@/features/dashboard/useAdminDashboard';

interface RecentRegistrationsTableProps {
  data: RecentRegistration[];
  loading?: boolean;
}

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'outline'> = {
  active: 'success',
  pending: 'warning',
  suspended: 'destructive',
  inactive: 'outline',
};

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecentRegistrationsTable({ data, loading }: RecentRegistrationsTableProps) {
  const { lang } = useLang();
  if (loading) return <TableSkeleton />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">{t('nav.registrations', lang)}</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/users" className="gap-1">
            {t('common.view_all', lang)} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Users className="mb-2 h-6 w-6 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">{t('common.no_data', lang)}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('role.student', lang)}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('common.email', lang)}</TableHead>
                <TableHead className="hidden md:table-cell">{t('common.date', lang)}</TableHead>
                <TableHead className="text-right">{t('common.status', lang)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 8).map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user.phone ?? '—'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {formatDateTime(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={statusVariant[user.status] ?? 'outline'}>
                      {user.status === 'active' ? t('status.active', lang) : user.status === 'pending' ? t('status.pending', lang) : user.status === 'suspended' ? t('status.suspended', lang) : user.status === 'inactive' ? t('status.inactive', lang) : user.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
