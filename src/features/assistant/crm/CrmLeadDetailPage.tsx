import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, Plus, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useCrmLead, useLeadDeals, useLeadActivities, useCreateActivity, useCompleteActivity, useTouchLead } from './useCrm';
import type { Database } from '@/types/database';

const ACTIVITY_TYPES: Database['public']['Enums']['crm_activity_type'][] = ['note', 'call', 'email', 'meeting', 'task'];

export default function CrmLeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const leadId = id ? Number(id) : null;
  const { lang } = useLang();
  const { toast } = useToast();
  const { data: lead, isError } = useCrmLead(leadId);
  const { data: deals } = useLeadDeals(leadId);
  const { data: activities } = useLeadActivities(leadId);
  const createActivity = useCreateActivity();
  const completeActivity = useCompleteActivity();
  const touchLead = useTouchLead();
  useErrorToast(isError, lang, t('crm.lead', lang));

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'note', subject: '', due_at: '', body: '' });

  const openModal = () => {
    setForm({ type: 'note', subject: '', due_at: '', body: '' });
    setShowModal(true);
  };

  const handleCreate = () => {
    if (!leadId) return;
    if (!form.subject.trim()) {
      toast(t('invoices.fill_fields', lang), 'error');
      return;
    }
    createActivity.mutate(
      {
        lead_id: leadId,
        type: form.type as Database['public']['Enums']['crm_activity_type'],
        subject: form.subject.trim(),
        body: form.body.trim() || null,
        due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
      },
      {
        onSuccess: (activity) => {
          touchLead.mutate({ id: leadId, dealId: activity.deal_id });
          toast(t('success.created', lang, t('crm.activities', lang)), 'success');
          setShowModal(false);
        },
        onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
      },
    );
  };

  const handleComplete = (activityId: number) => {
    if (!leadId) return;
    completeActivity.mutate(activityId, {
      onSuccess: () => touchLead.mutate({ id: leadId }),
      onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
    });
  };

  if (!lead) {
    return (
      <div className="space-y-6">
        <Link to="/assistant/crm" className="text-sm text-muted-foreground hover:text-foreground">{t('crm.back_to_pipeline', lang)}</Link>
        <div className="h-40 rounded-2xl border border-border bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/assistant/crm" className="text-sm text-muted-foreground hover:text-foreground">{t('crm.back_to_pipeline', lang)}</Link>
        <Button className="gap-2" onClick={openModal}><Plus className="h-4 w-4" />{t('crm.new_activity', lang)}</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{`${lead.first_name} ${lead.last_name ?? ''}`.trim()}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {lead.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{lead.phone}</span>}
                {lead.whatsapp && <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" />{lead.whatsapp}</span>}
                {lead.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{lead.email}</span>}
                {lead.address && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{lead.address}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{t(`crm.source_${lead.source}`, lang)}</Badge>
              {lead.notes && <Badge variant="secondary">{t('crm.notes', lang)}</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {lead.notes && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">{t('crm.notes', lang)}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">{t('crm.leads', lang)} / {t('nav.crm', lang)}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {!deals || deals.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">{t('crm.no_deals', lang)}</p>
            ) : (
              deals.map(deal => (
                <div key={deal.id} className="flex items-center justify-between rounded-xl border border-border bg-card/50 p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{deal.title}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: deal.stage?.color ?? '#94a3b8' }} />
                        {deal.stage?.name}
                      </span>
                      {deal.course && <span>{deal.course.name}</span>}
                      {deal.level && <span>{deal.level.name}</span>}
                      {deal.closed_at && <span>{formatDateTime(deal.closed_at)}</span>}
                    </div>
                  </div>
                  <span className="text-sm font-bold">{formatCurrency(deal.amount)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">{t('crm.activities', lang)}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {!activities || activities.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">{t('common.no_data', lang)}</p>
            ) : (
              activities.map(activity => (
                <div key={activity.id} className={`rounded-xl border p-3 ${activity.completed_at ? 'border-border bg-muted/40' : 'border-border bg-card/50'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={activity.completed_at ? 'outline' : activity.due_at ? 'warning' : 'secondary'}>{activity.type}</Badge>
                      <p className={`text-sm font-medium ${activity.completed_at ? 'line-through text-muted-foreground' : ''}`}>{activity.subject}</p>
                    </div>
                    {!activity.completed_at && (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600" onClick={() => handleComplete(activity.id)} title={t('crm.mark_completed', lang)}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {activity.body && <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{activity.body}</p>}
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {formatDateTime(activity.created_at)}
                    {activity.due_at && !activity.completed_at && ` · ${t('crm.due_at', lang)} : ${formatDateTime(activity.due_at)}`}
                    {activity.completed_at && ` · ${t('crm.completed', lang)} : ${formatDateTime(activity.completed_at)}`}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4 my-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('crm.new_activity', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('crm.activity_type', lang)}</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectContent>
                      {ACTIVITY_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('crm.due_at', lang)}</Label>
                  <Input type="datetime-local" value={form.due_at} onChange={e => setForm(f => ({ ...f, due_at: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('crm.subject', lang)}</Label>
                <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('crm.body', lang)}</Label>
                <Textarea rows={3} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={handleCreate} disabled={createActivity.isPending}>
                  {createActivity.isPending ? t('common.loading', lang) : t('common.create', lang)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
