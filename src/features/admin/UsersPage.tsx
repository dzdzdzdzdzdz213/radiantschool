import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getFullName, getRoleLabel, getStatusColor, formatDate } from '@/lib/utils';
import { Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';

const PAGE_SIZE = 25;

export default function UsersPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [dropdownId, setDropdownId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users-paginated', page, search, roleFilter],
    queryFn: async () => {
      let query = supabase.from('users').select('*', { count: 'exact' });
      if (roleFilter) query = query.eq('role', roleFilter as never);
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      query = query.order('created_at', { ascending: false });
      const from = (page - 1) * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);
      const { data: rows, count, error } = await query;
      if (error) throw error;
      return { rows: rows ?? [], total: count ?? 0 };
    },
  });
  useErrorToast(isError, lang, t('nav.users', lang));

  const users = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('users').update({ status: status === 'active' ? 'inactive' : 'active' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users-paginated'] }); toast(t('success.updated', lang, 'Statut'), 'success'); setDropdownId(null); },
    onError: (err: Error) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleRole = (val: string) => { setRoleFilter(val); setPage(1); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.users', lang)}</h1>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90" onClick={() => navigate('./new')}><Plus className="h-4 w-4" /> {t('common.add', lang)}</button>
      </div>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder={t('common.search', lang)} className="h-10 pl-10" />
        </div>
        <Select value={roleFilter} onValueChange={handleRole} placeholder={t('common.all', lang)}>
          <SelectItem value="">{t('common.all', lang)}</SelectItem>
          <SelectItem value="admin">{t('role.admin', lang)}</SelectItem>
          <SelectItem value="assistant">{t('role.assistant', lang)}</SelectItem>
          <SelectItem value="teacher">{t('role.teacher', lang)}</SelectItem>
          <SelectItem value="student">{t('role.student', lang)}</SelectItem>
          <SelectItem value="parent">{t('role.parent', lang)}</SelectItem>
        </Select>
      </div>
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">{t('common.loading', lang)}</div>
        ) : (
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">{t('common.name', lang)}</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">{t('common.email', lang)}</th>
                <th className="hidden md:table-cell px-4 py-3 font-medium">{t('common.type', lang)}</th>
                <th className="px-4 py-3 font-medium">{t('common.status', lang)}</th>
                <th className="hidden lg:table-cell px-4 py-3 font-medium">{t('common.date', lang)}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b text-sm last:border-0">
                  <td className="px-4 py-3 font-medium">{getFullName(u.first_name, u.last_name)}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-muted-foreground truncate max-w-[200px]">{u.email}</td>
                  <td className="hidden md:table-cell px-4 py-3">{getRoleLabel(u.role)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(u.status)}`}>{u.status}</span></td>
                  <td className="hidden lg:table-cell px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 relative">
                    <button className="rounded p-1 hover:bg-page" onClick={(e) => { e.stopPropagation(); setDropdownId(dropdownId === u.id ? null : u.id); }}><MoreHorizontal className="h-4 w-4" /></button>
                    {dropdownId === u.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setDropdownId(null)} />
                        <div className="absolute right-0 top-8 z-20 w-36 rounded-xl border bg-card shadow-lg overflow-hidden">
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent" onClick={(e) => { e.stopPropagation(); toggleStatusMutation.mutate({ id: u.id, status: u.status }); }}>
                            {u.status === 'active' ? t('common.deactivate', lang) : t('common.activate', lang)}
                          </button>
<button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-accent" onClick={(e) => { e.stopPropagation(); navigate(`/admin/users/edit/${u.id}`); }}>
                             {t('common.edit', lang)}
                           </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">{t('common.no_results', lang)}</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{total} {t('nav.users', lang)} — Page {page}/{totalPages}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-ghost h-8 w-8 p-0 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) p = i + 1;
              else if (page <= 4) p = i + 1;
              else if (page >= totalPages - 3) p = totalPages - 6 + i;
              else p = page - 3 + i;
              return (
                <button key={p} onClick={() => setPage(p)} className={`h-8 min-w-[32px] rounded-lg px-2 text-sm font-medium ${p === page ? 'bg-primary text-white' : 'hover:bg-page'}`}>
                  {p}
                </button>
              );
            })}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn-ghost h-8 w-8 p-0 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
