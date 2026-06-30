import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '@/hooks/useQueries';
import { getFullName, getRoleLabel, getStatusColor, formatDate } from '@/lib/utils';
import { Search, Plus, MoreHorizontal } from 'lucide-react';

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filtered = (users ?? []).filter((u) => {
    const name = getFullName(u.first_name, u.last_name).toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"><Plus className="h-4 w-4" /> Ajouter</button>
      </div>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="assistant">Assistant</option>
          <option value="teacher">Enseignant</option>
          <option value="student">Élève</option>
          <option value="parent">Parent</option>
        </select>
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted">Chargement...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted">
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rôle</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Inscription</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b text-sm last:border-0 hover:bg-page cursor-pointer" onClick={() => navigate(`./${u.id}`)}>
                  <td className="px-4 py-3 font-medium">{getFullName(u.first_name, u.last_name)}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3">{getRoleLabel(u.role)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(u.status)}`}>{u.status}</span></td>
                  <td className="px-4 py-3 text-muted">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3"><button className="rounded p-1 hover-bg-page"><MoreHorizontal className="h-4 w-4" /></button></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted">Aucun utilisateur trouvé</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
