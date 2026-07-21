import { useState } from 'react';
import { Search, Users, BookOpen, FileText, DollarSign, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

const searchCategories = [
  { key: 'students', label: '', icon: Users, basePath: '/assistant/students' },
  { key: 'courses', label: '', icon: BookOpen, basePath: '/assistant/groups' },
  { key: 'invoices', label: '', icon: FileText, basePath: '/assistant/invoices' },
  { key: 'payments', label: '', icon: DollarSign, basePath: '/assistant/payments' },
] as const;

export default function SearchPage() {
  const { lang } = useLang();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const catLabels: Record<string, string> = {
    students: t('nav.students', lang),
    courses: t('nav.courses', lang),
    invoices: t('nav.invoices', lang),
    payments: t('nav.payments', lang),
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.search', lang)}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('search.subtitle', lang)}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder={t('search.placeholder', lang)}
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="h-14 pl-12 text-lg rounded-2xl"
          autoFocus
        />
      </div>

      {debouncedQuery && (
        <div className="space-y-4">
          {searchCategories.map(cat => (
            <Card key={cat.key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`${cat.basePath}?search=${debouncedQuery}`)}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <cat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{catLabels[cat.key]}</p>
                    <p className="text-xs text-muted-foreground">{t('search.search_in', lang, debouncedQuery, catLabels[cat.key].toLowerCase())}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!debouncedQuery && (
        <div className="text-center py-16">
          <Search className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
          <p className="text-sm text-muted-foreground">{t('search.start_typing', lang)}</p>
        </div>
      )}
    </div>
  );
}