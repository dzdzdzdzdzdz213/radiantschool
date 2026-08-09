import { useState } from 'react';
import { Plus, MoreHorizontal, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useCrmStages, useCrmPipeline, useCrmLeads, useCreateDeal, useMoveDeal } from './useCrm';
import { useCourses, useLevels } from '@/hooks/useQueries';

export default function CrmPipelinePage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const { data: stages, isError: stagesError } = useCrmStages();
  const { data: deals, isLoading, isError } = useCrmPipeline();
  const { data: leads } = useCrmLeads('');
  const { data: courses } = useCourses();
  const { data: levels } = useLevels();
  const createDeal = useCreateDeal();
  const moveDeal = useMoveDeal();

  useErrorToast(isError || stagesError, lang, t('nav.crm', lang));

  const [showModal, setShowModal] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{ dealId: number; stageId: number; lostName: string } | null>(null);
  const [lostReason, setLostReason] = useState('');
  const [form, setForm] = useState({
    title: '',
    child_name: '',
    amount: '',
    lead_id: '',
    course_id: '',
    level_id: '',
    expected_close_date: '',
  });

  const openModal = () => {
    setForm({ title: '', child_name: '', amount: '', lead_id: '', course_id: '', level_id: '', expected_close_date: '' });
    setShowModal(true);
  };

  const handleCreate = () => {
    if (!form.title || !form.amount) {
      toast(t('invoices.fill_fields', lang), 'error');
      return;
    }
    if (!form.lead_id) {
      toast(t('crm.lead', lang) + ' : ' + t('common.required', lang), 'error');
      return;
    }
    createDeal.mutate(
      {
        title: form.title,
        child_name: form.child_name || null,
        amount: parseFloat(form.amount),
        lead_id: Number(form.lead_id),
        course_id: form.course_id ? Number(form.course_id) : null,
        level_id: form.level_id ? Number(form.level_id) : null,
        expected_close_date: form.expected_close_date || null,
      },
      {
        onSuccess: () => {
          toast(t('success.created', lang, t('crm.new_deal', lang)), 'success');
          setShowModal(false);
        },
        onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
      },
    );
  };

  const requestMove = (dealId: number, stageId: number, lostName: string) => {
    const stage = stages?.find(s => s.id === stageId);
    if (stage?.is_lost) {
      setMoveTarget({ dealId, stageId, lostName });
      setLostReason('');
    } else if (stage) {
      moveDeal.mutate(
        { id: dealId, stage },
        { onError: (err) => toast(err?.message ?? t('common.error', lang), 'error') },
      );
    }
  };

  const confirmLostMove = () => {
    if (!moveTarget) return;
    const stage = stages?.find(s => s.id === moveTarget.stageId);
    if (stage) {
      moveDeal.mutate(
        { id: moveTarget.dealId, stage, reason: lostReason || t('crm.notes', lang) },
        { onSuccess: () => setMoveTarget(null), onError: (err) => toast(err?.message ?? t('common.error', lang), 'error') },
      );
    }
  };

  const openAmount = stages?.reduce((sum, s) => {
    if (s.is_won || s.is_lost) return sum;
    return sum + (deals ?? []).filter(d => d.stage_id === s.id).reduce((a, d) => a + d.amount, 0);
  }, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.crm', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('crm.pipeline_subtitle', lang)} · {formatCurrency(openAmount)}</p>
        </div>
        <Button className="gap-2" onClick={openModal}><Plus className="h-4 w-4" />{t('crm.new_deal', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4 my-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('crm.new_deal', lang)}</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowModal(false)}>✕</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('crm.deal_title', lang)}</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={t('crm.deal_title', lang)} />
              </div>
              <div className="space-y-2">
                <Label>{t('crm.lead', lang)}</Label>
                <Select value={form.lead_id} onValueChange={v => setForm(f => ({ ...f, lead_id: v }))} placeholder={t('common.select', lang)}>
                  <SelectContent>
                    {(leads ?? []).map(l => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {`${l.first_name} ${l.last_name ?? ''}`.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('crm.child_name', lang)}</Label>
                  <Input value={form.child_name} onChange={e => setForm(f => ({ ...f, child_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t('crm.amount', lang)}</Label>
                  <Input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('crm.courses', lang)}</Label>
                  <Select value={form.course_id} onValueChange={v => setForm(f => ({ ...f, course_id: v }))} placeholder={t('common.select', lang)}>
                    <SelectContent>
                      {(courses ?? []).map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('crm.levels', lang)}</Label>
                  <Select value={form.level_id} onValueChange={v => setForm(f => ({ ...f, level_id: v }))} placeholder={t('common.select', lang)}>
                    <SelectContent>
                      {(levels ?? []).map(l => (
                        <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('crm.expected_close', lang)}</Label>
                <Input type="date" value={form.expected_close_date} onChange={e => setForm(f => ({ ...f, expected_close_date: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={handleCreate} disabled={createDeal.isPending}>
                  {createDeal.isPending ? t('common.loading', lang) : t('common.create', lang)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {moveTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMoveTarget(null)} />
          <Card className="relative w-full max-w-md mx-4 my-auto">
            <CardHeader><CardTitle className="text-sm">{t('crm.move_to', lang)} « {moveTarget.lostName} »</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('crm.notes', lang)}</Label>
                <Textarea value={lostReason} onChange={e => setLostReason(e.target.value)} rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMoveTarget(null)}>{t('common.cancel', lang)}</Button>
                <Button onClick={confirmLostMove} disabled={moveDeal.isPending}>
                  {moveDeal.isPending ? t('common.loading', lang) : t('common.confirm', lang)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {(stages ?? []).map(stage => {
            const stageDeals = (deals ?? []).filter(d => d.stage_id === stage.id);
            const total = stageDeals.reduce((a, d) => a + d.amount, 0);
            return (
              <div key={stage.id} className="flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-card/50">
                <div className="flex items-center justify-between rounded-t-2xl px-4 py-3" style={{ backgroundColor: `${stage.color}1a` }}>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm font-semibold">{stage.name}</span>
                    <Badge variant="outline" className="ml-1">{stageDeals.length}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatCurrency(total)}</span>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-3" style={{ maxHeight: '60vh' }}>
                  {stageDeals.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-6">{t('crm.no_deals', lang)}</p>
                  ) : (
                    stageDeals.map(deal => (
                      <div key={deal.id} className="rounded-xl border border-border bg-card p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-tight">{deal.title}</p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(stages ?? []).filter(s => s.id !== stage.id).map(s => (
                                <DropdownMenuItem key={s.id} onSelect={() => requestMove(deal.id, s.id, s.name)}>
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                                  {t('crm.move_to', lang)} · {s.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {deal.child_name && <p className="mt-1 text-xs text-muted-foreground">{deal.child_name}</p>}
                        <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                          {deal.lead && (
                            <>
                              <span className="flex items-center gap-1.5"><User className="h-3 w-3" />{`${deal.lead.first_name} ${deal.lead.last_name ?? ''}`.trim()}</span>
                              {(deal.lead.phone || deal.lead.whatsapp) && (
                                <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{deal.lead.whatsapp || deal.lead.phone}</span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-bold">{formatCurrency(deal.amount)}</span>
                          {deal.expected_close_date && (
                            <span className="text-[11px] text-muted-foreground">{formatDate(deal.expected_close_date)}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
