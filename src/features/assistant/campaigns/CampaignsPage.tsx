import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function CampaignsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: campaigns, isLoading, isError } = useQuery({
    queryKey: ['assistant_campaigns'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('campaigns')
        .select('*')
        .order('start_date', { ascending: false });
      return data ?? [];
    },
  });

  useEffect(() => {
    if (isError) toast(t('errors.load_error', lang, t('nav.campaigns', lang)), 'error');
  }, [isError]);

  const [showModal, setShowModal] = useState(false);
  const [campName, setCampName] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campStart, setCampStart] = useState('');
  const [campEnd, setCampEnd] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!campName.trim()) throw new Error(t('campaigns.name_required', lang));
      if (!campStart || !campEnd) throw new Error(t('campaigns.dates_required', lang));
      if (new Date(campEnd) <= new Date(campStart)) throw new Error(t('campaigns.date_order', lang));
      const { error } = await (supabase as any).from('campaigns').insert({
        name: campName.trim(),
        description: campDesc.trim() || null,
        start_date: campStart,
        end_date: campEnd,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_campaigns'] }); toast(t('success.created', lang, t('campaigns.campaign', lang)), 'success'); setShowModal(false); setCampName(''); setCampDesc(''); setCampStart(''); setCampEnd(''); },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.campaigns', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('campaigns.subtitle', lang)}</p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)} disabled={createMutation.isPending}><Plus className="h-4 w-4" />{t('campaigns.new', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('campaigns.new', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('common.name', lang)} *</Label>
                <Input placeholder={t('campaigns.name_placeholder', lang)} value={campName} onChange={e => setCampName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.description', lang)}</Label>
                <Textarea placeholder={t('campaigns.desc_placeholder', lang)} value={campDesc} onChange={e => setCampDesc(e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('campaigns.start_date', lang)} *</Label>
                  <Input type="date" value={campStart} onChange={e => setCampStart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('campaigns.end_date', lang)} *</Label>
                  <Input type="date" value={campEnd} onChange={e => setCampEnd(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                  {createMutation.isPending ? t('common.loading', lang) : t('campaigns.create', lang)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardHeader className="pb-3"><div className="h-24 bg-muted rounded-xl animate-pulse" /></CardHeader></Card>
        )) : (campaigns ?? []).length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p>
          </div>
        ) : (campaigns ?? []).map((c: any) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{c.name}</CardTitle>
                <Badge variant={c.is_active ? 'success' : 'outline'}>{c.is_active ? t('status.active', lang) : t('status.inactive', lang)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(c.start_date)} - {formatDate(c.end_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{t('campaigns.max_seats', lang)}: {c.max_seats ?? t('campaigns.unlimited', lang)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
