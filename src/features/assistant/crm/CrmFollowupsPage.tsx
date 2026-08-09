import { Link } from 'react-router-dom';
import { CheckCircle2, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useFollowupsDue, useCompleteActivity } from './useCrm';

function dueState(dueAt: string | null, completedAt: string | null): 'overdue' | 'today' | 'soon' | 'done' {
  if (completedAt) return 'done';
  if (!dueAt) return 'soon';
  const due = new Date(dueAt).getTime();
  const now = Date.now();
  if (due < now) return 'overdue';
  if (due - now < 24 * 3600 * 1000) return 'today';
  if (due - now < 3 * 24 * 3600 * 1000) return 'soon';
  return 'soon';
}

export default function CrmFollowupsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const { data: followups, isLoading, isError } = useFollowupsDue();
  const completeActivity = useCompleteActivity();
  useErrorToast(isError, lang, t('nav.followups', lang));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.followups', lang)}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('crm.followups_subtitle', lang)}</p>
      </div>

      <Card>
        <CardHeader className="pb-0" />
        <CardContent className="space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl border border-border bg-card animate-pulse" />
            ))
          ) : !followups || followups.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">{t('common.no_data', lang)}</p>
          ) : (
            followups.map(f => {
              const state = dueState(f.due_at, f.completed_at);
              return (
                <div key={f.id} className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${state === 'done' ? 'border-border bg-muted/40' : 'border-border bg-card/50'}`}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={state === 'overdue' ? 'destructive' : state === 'done' ? 'outline' : 'warning'}>{f.type}</Badge>
                      <p className={`truncate text-sm font-medium ${state === 'done' ? 'line-through text-muted-foreground' : ''}`}>{f.subject}</p>
                      {state === 'overdue' && <Badge variant="destructive">{t('crm.overdue', lang)}</Badge>}
                      {state === 'today' && <Badge variant="warning">{t('crm.today', lang)}</Badge>}
                    </div>
                    {f.body && <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{f.body}</p>}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {f.lead_name && (
                        <Link to={`/assistant/crm/leads/${f.lead_id}`} className="hover:text-foreground underline underline-offset-2">
                          {f.lead_name}
                        </Link>
                      )}
                      {f.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{f.phone}</span>}
                      {f.deal_title && <span>{f.deal_title}</span>}
                      {f.due_at && !f.completed_at && <span>{t('crm.due_at', lang)} : {formatDateTime(f.due_at)}</span>}
                      {f.completed_at && <span>{t('crm.completed', lang)} : {formatDateTime(f.completed_at)}</span>}
                    </div>
                  </div>
                  {!f.completed_at && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 text-emerald-600"
                      onClick={() => completeActivity.mutate(Number(f.id), { onError: (err) => toast(err?.message ?? t('common.error', lang), 'error') })}
                      disabled={completeActivity.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
