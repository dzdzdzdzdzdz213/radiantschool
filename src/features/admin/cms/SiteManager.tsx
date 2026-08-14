import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useToast } from '@/hooks/useToast';
import { Loader, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DEFAULT_IDENTITY, fetchSiteIdentity, type SiteIdentity } from '@/lib/site-content';
import type { Database } from '@/types/database';

export default function SiteManager() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<SiteIdentity>(DEFAULT_IDENTITY);

  const { data, isLoading } = useQuery({
    queryKey: ['cms_site_identity'],
    queryFn: fetchSiteIdentity,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('system_settings').upsert({ key: 'site_identity', value: form as unknown as Database['public']['Tables']['system_settings']['Insert']['value'] }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cms_site_identity'] });
      toast(t('success.saved', lang, t('cms.identity', lang)), 'success');
    },
    onError: (err: Error) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const set = (key: keyof SiteIdentity) => (value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <p className="text-sm text-muted-foreground">{t('cms.identity', lang)}</p>
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          {t('cms.preview_site', lang)} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">{t('common.loading', lang)}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">{t('cms.identity', lang)}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('cms.tagline', lang)}</Label>
                <Input value={form.tagline} onChange={e => set('tagline')(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.address', lang)}</Label>
                <Input value={form.address} onChange={e => set('address')(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.url', lang)} — Maps</Label>
                <Input value={form.maps_url} onChange={e => set('maps_url')(e.target.value)} className="h-9" placeholder="https://www.google.com/maps/..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">{t('cms.site', lang)}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.phone', lang)}</Label>
                <Input value={form.phone} onChange={e => set('phone')(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('cms.whatsapp', lang)}</Label>
                <Input value={form.whatsapp} onChange={e => set('whatsapp')(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.email', lang)}</Label>
                <Input value={form.email} onChange={e => set('email')(e.target.value)} className="h-9" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-sm">{t('cms.social', lang)}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Facebook</Label>
                  <Input value={form.facebook} onChange={e => set('facebook')(e.target.value)} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Instagram</Label>
                  <Input value={form.instagram} onChange={e => set('instagram')(e.target.value)} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">LinkedIn</Label>
                  <Input value={form.linkedin} onChange={e => set('linkedin')(e.target.value)} className="h-9" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader className="h-4 w-4 animate-spin mr-1.5" /> : null}
          {t('common.save', lang)}
        </Button>
      </div>
    </div>
  );
}
