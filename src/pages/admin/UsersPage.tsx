import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '@/hooks/useQueries';
import { getFullName, getRoleLabel, getStatusColor, formatDate } from '@/lib/utils';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function UsersPage() {
  const { lang } = useLang();
  const { data: users, isLoading } = useUsers();
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [dropdownId, setDropdownId] = useState<string | null>(null);

  const filtered = (users ?? []).filter((u) => {
    const name = getFullName(u.first_name, u.last_name).toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from('users').update({ status: status === 'active' ? 'inactive' : 'active' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast(t('success.updated', lang, 'Statut'), 'success'); setDropdownId(null); },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.users', lang)}</h1>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90" onClick={() => navigate('./new')}><Plus className="h-4 w-4" /> {t('common.add', lang)}</button>
      </div>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search', lang)} className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">{t('common.all', lang)}</option>
          <option value="admin">{t('role.admin', lang)}</option>
          <option value="assistant">{t('role.assistant', lang)}</option>
          <option value="teacher">{t('role.teacher', lang)}</option>
          <option value="student">{t('role.student', lang)}</option>
          <option value="parent">{t('role.parent', lang)}</option>
        </select>
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">{t('common.loading', lang)}</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">{t('common.name', lang)}</th>
                <th className="px-4 py-3 font-medium">{t('common.email', lang)}</th>
                <th className="px-4 py-3 font-medium">{t('common.type', lang)}</th>
                <th className="px-4 py-3 font-medium">{t('common.status', lang)}</th>
                <th className="px-4 py-3 font-medium">{t('common.date', lang)}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b text-sm last:border-0 hover:bg-page cursor-pointer" onClick={() => navigate(`./${u.id}`)}>
                  <td className="px-4 py-3 font-medium">{getFullName(u.first_name, u.last_name)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">{getRoleLabel(u.role)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(u.status)}`}>{u.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 relative">
                    <button className="rounded p-1 hover:bg-page" onClick={(e) => { e.stopPropagation(); setDropdownId(dropdownId === u.id ? null : u.id); }}><MoreHorizontal className="h-4 w-4" /></button>
                    {dropdownId === u.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setDropdownId(null)} />
                        <div className="absolute right-0 top-8 z-20 w-36 rounded-xl border bg-card shadow-lg overflow-hidden">
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent" onClick={(e) => { e.stopPropagation(); toggleStatusMutation.mutate({ id: u.id, status: u.status }); }}>
                            {u.status === 'active' ? t('common.deactivate', lang) : t('common.activate', lang)}
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-accent" onClick={(e) => { e.stopPropagation(); navigate(`./${u.id}`); }}>
                            {t('common.edit', lang)}
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">{t('common.no_results', lang)}</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
