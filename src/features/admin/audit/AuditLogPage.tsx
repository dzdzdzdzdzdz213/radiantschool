import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { downloadCSV } from '@/lib/csv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Clock } from 'lucide-react';

interface AuditEntry {
  id: number;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

const actionColors: Record<string, string> = {
  INSERT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function AuditLogPage() {
  const { lang } = useLang();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const { data, isLoading } = useQuery({
    queryKey: ['audit_logs', search, page],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (search) {
        query = query.or(
          `action.ilike.%${search}%,entity_type.ilike.%${search}%,entity_id.ilike.%${search}%`
        );
      }

      const { data, count } = await query;
      return { data: (data ?? []) as AuditEntry[], count: count ?? 0 };
    },
    staleTime: 15_000,
  });

  const totalPages = Math.ceil((data?.count ?? 0) / pageSize);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{t('nav.audit_log', lang)}</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (!data?.data) return;
            downloadCSV(
              data.data.map(e => ({
                action: e.action,
                entity: `${e.entity_type}#${e.entity_id}`,
                user_id: e.user_id,
                ip: e.ip_address ?? '',
                date: new Date(e.created_at).toISOString(),
              })),
              `audit-log-${new Date().toISOString().split('T')[0]}`
            );
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          CSV
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder={t('common.search', lang)}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {data?.count ?? 0} {t('common.entries', lang)}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Chargement...</div>
          ) : !data?.data?.length ? (
            <div className="p-8 text-center text-muted-foreground">{t('common.no_results', lang)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Entité</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map(entry => (
                    <tr key={entry.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={actionColors[entry.action] ?? 'bg-gray-100 text-gray-800'}>
                          {entry.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">{entry.entity_type}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{entry.entity_id}</td>
                      <td className="px-4 py-3 text-muted-foreground">{entry.ip_address ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            {t('common.previous', lang)}
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            {t('common.next', lang)}
          </Button>
        </div>
      )}
    </div>
  );
}
