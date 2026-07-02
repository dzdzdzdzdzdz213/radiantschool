import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '@/hooks/useQueries';
import { formatCurrency, formatDate, getStatusColor, getFullName } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Search, Plus, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function CoursesPage() {
  const { data: courses, isLoading } = useCourses();
  const { lang } = useLang();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = (courses ?? []).filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.courses', lang)}</h1>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90" onClick={() => navigate('/admin/courses/new')}><Plus className="h-4 w-4" /> {t('common.add', lang)}</button>
      </div>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search_course', lang)} className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">{t('common.all', lang)}</option>
          <option value="normal">Normal</option>
          <option value="vip">VIP</option>
          <option value="private">Particulier</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-muted">{t('common.loading', lang)}</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted">{t('common.no_results', lang)}</div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md" onClick={() => navigate(`./${c.id}`)}>
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{c.name}</h3>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(c.status)}`}>{c.status}</span>
              </div>
              <div className="space-y-1 text-sm text-muted">
                <p>Enseignant: {c.teacher ? getFullName(c.teacher.first_name, c.teacher.last_name) : 'Non assigné'}</p>
                <p>Niveau: {c.level?.name}{c.level?.stream ? ` - ${c.level.stream}` : ''}</p>
                <p>Capacité: {c.current_enrollments}/{c.capacity}</p>
                <p>{t('common.price', lang)}: {formatCurrency(c.price)}</p>
                <p>{t('common.from', lang)} {formatDate(c.start_date)} {t('common.to', lang)} {formatDate(c.end_date)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
