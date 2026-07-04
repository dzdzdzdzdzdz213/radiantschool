import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/useDebounce';
import { getInitials } from '@/lib/utils';
import { useParents } from './useParents';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function ParentsPage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useParents(debouncedSearch, page);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.parents', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('parents.subtitle', lang)}</p>
        </div>
        <Button onClick={() => navigate('/assistant/parents/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('parents.new', lang)}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('parents.search', lang)}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="h-9 pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('role.parent', lang)}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('common.email', lang)}</TableHead>
                <TableHead className="hidden md:table-cell">{t('common.phone', lang)}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('parents.children', lang)}</TableHead>
                <TableHead className="text-right">{t('common.status', lang)}</TableHead>
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
                data?.data.map((parent) => (
                  <TableRow key={parent.id} className="cursor-pointer hover:bg-accent/50" onClick={() => navigate(`/assistant/parents/${parent.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(parent.firstName, parent.lastName)}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{parent.firstName} {parent.lastName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{parent.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{parent.phone ?? '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{parent.childrenCount} {t('parents.children_label', lang)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={parent.status === 'active' ? 'success' : 'outline'}>{parent.status === 'active' ? t('status.active', lang) : t('status.inactive', lang)}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">{t('common.total', lang)} : {data.meta.total}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('common.previous', lang)}</Button>
                <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}>{t('common.next', lang)}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}