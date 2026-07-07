import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WILAYAS = ['Alger', 'Oran', 'Constantine'];

export default function SettingsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const [centerName, setCenterName] = useState('');
  const [centerNameError, setCenterNameError] = useState('');
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [wilaya, setWilaya] = useState('Alger');
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [currency, setCurrency] = useState('DZD');
  const [settingsId, setSettingsId] = useState<number | null>(null);

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['admin_settings'],
    queryFn: async () => {
      const { data } = await (supabase as any).from('center_settings').select('*').maybeSingle();
      return data ?? null;
    },
  });

  useEffect(() => {
    if (!settingsData) return;
    setSettingsId(settingsData.id);
    setCenterName(settingsData.center_name ?? '');
    setAddress(settingsData.address ?? '');
    setPhone(settingsData.phone ?? '');
    setWilaya(settingsData.wilaya ?? 'Alger');
    setEmailNotif(settingsData.email_notifications ?? true);
    setSmsNotif(settingsData.sms_notifications ?? false);
    setAutoInvoice(settingsData.auto_invoice ?? true);
    setCurrency(settingsData.currency ?? 'DZD');
  }, [settingsData]);

  const validate = () => {
    let valid = true;
    if (!centerName.trim()) { setCenterNameError(t('validation.required', lang)); valid = false; } else setCenterNameError('');
    if (!address.trim()) { setAddressError(t('validation.required', lang)); valid = false; } else setAddressError('');
    if (phone && !/^(\+213|0)(5|6|7)\d{8}$/.test(phone)) { setPhoneError(t('validation.phone_start', lang)); valid = false; } else setPhoneError('');
    return valid;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, any> = {
        center_name: centerName,
        address,
        phone,
        wilaya,
        email_notifications: emailNotif,
        sms_notifications: smsNotif,
        auto_invoice: autoInvoice,
        currency,
      };
      if (settingsId) payload.id = settingsId;
      const { error } = await (supabase as any).from('center_settings').upsert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast(t('success.saved', lang, t('nav.settings', lang)), 'success'); },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const handleSave = () => {
    if (!validate()) return;
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('nav.settings', lang)}</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('common.info', lang)}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('common.name', lang)}</Label>
              <Input value={centerName} onChange={e => { setCenterName(e.target.value); setCenterNameError(''); }} />
              {centerNameError && <p className="text-xs text-red-500">{centerNameError}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t('common.address', lang)}</Label>
              <Input value={address} onChange={e => { setAddress(e.target.value); setAddressError(''); }} />
              {addressError && <p className="text-xs text-red-500">{addressError}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t('common.phone', lang)}</Label>
              <Input placeholder={t('settings.phone_placeholder', lang)} value={phone} onChange={e => { setPhone(e.target.value); setPhoneError(''); }} />
              {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t('settings.wilaya', lang)}</Label>
              <select className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm" value={wilaya} onChange={e => setWilaya(e.target.value)}>
                {WILAYAS.map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
            {settingsLoading ? (
              <div className="flex items-center justify-center py-4 text-sm text-muted">{t('common.loading', lang)}</div>
            ) : (
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : null}
                {t('common.save', lang)}
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('nav.settings', lang)}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{t('common.email', lang)}</p></div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{t('common.email', lang)} {t('settings.sms_suffix', lang)}</p></div>
              <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{t('nav.invoices', lang)}</p></div>
              <Switch checked={autoInvoice} onCheckedChange={setAutoInvoice} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{t('common.type', lang)}</p></div>
              <select className="flex h-9 rounded-lg border border-border bg-background px-3 py-1 text-sm" value={currency} onChange={e => setCurrency(e.target.value)}>
                <option>DZD</option><option>EUR</option><option>USD</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
