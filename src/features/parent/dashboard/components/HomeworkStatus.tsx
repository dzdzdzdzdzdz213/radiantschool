import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { HomeworkItem } from '../useParentDashboard';

interface HomeworkStatusProps {
  data: HomeworkItem[];
  loading?: boolean;
}

export default function HomeworkStatus({ data, loading }: HomeworkStatusProps) {
  const navigate = useNavigate();
  const { lang } = useLang();

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  const pending = data.filter(h => h.status === 'pending');
  const recent = data.slice(0, 8);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          {t('nav.homework', lang)}
        </h3>
        {pending.length > 0 && (
          <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-amber-500/10 text-amber-600">
            {pending.length} {t('homework.pending', lang)}
          </span>
        )}
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">{t('dashboard.no_homework', lang)}</p>
      ) : (
        <div className="space-y-2">
          {recent.map((h) => (
            <div key={h.id} className="flex items-center gap-3 rounded-xl bg-accent/50 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{h.assignmentTitle}</p>
                <p className="text-xs text-muted-foreground truncate">{h.childName} · {h.courseName}</p>
              </div>
              <span className={`shrink-0 text-[10px] font-medium px-2 py-1 rounded-full ${
                h.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-amber-500/10 text-amber-600'
              }`}>
                {h.status === 'completed' ? (h.grade != null ? `${h.grade}/20` : t('homework.submitted', lang)) : t('dashboard.to_submit', lang)}
              </span>
            </div>
          ))}
        </div>
      )}
      {data.length > 8 && (
        <button onClick={() => navigate('/parent/children')} className="mt-3 text-xs text-primary font-medium flex items-center gap-1 hover:underline">
          {t('common.view_all', lang)} <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
