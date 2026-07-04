import { useState } from 'react';

import { useToast } from '@/components/ui/Toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function SettingsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const [centerName, setCenterName] = useState('Radiant Learning');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('Alger');
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [currency, setCurrency] = useState('DZD');

  const { isLoading: settingsLoading } = useQuery({
    queryKey: ['admin_settings'],
    queryFn: async () => {
      const { data } = await (supabase as any).from('center_settings').select('*').single();
      if (data) {
        setCenterName(data.center_name ?? 'Radiant Learning');
        setAddress(data.address ?? '');
        setPhone(data.phone ?? '');
        setWilaya(data.wilaya ?? 'Alger');
        setEmailNotif(data.email_notifications ?? true);
        setSmsNotif(data.sms_notifications ?? false);
        setAutoInvoice(data.auto_invoice ?? true);
        setCurrency(data.currency ?? 'DZD');
      }
      return data;
    },
  });

  const handleSave = () => {
    if (!centerName.trim()) { toast(t('common.required', lang), 'error'); return; }
    if (!address.trim()) { toast(t('common.required', lang), 'error'); return; }
    saveMutation.mutate();
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from('center_settings').upsert({
        center_name: centerName,
        address,
        phone,
        wilaya,
        email_notifications: emailNotif,
        sms_notifications: smsNotif,
        auto_invoice: autoInvoice,
        currency,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast(t('success.saved', lang, t('nav.settings', lang)), 'success'); },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('nav.settings', lang)}</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">{t('common.info', lang)}</h2>
          <div className="space-y-3">
            <div><label className="mb-1 block text-sm font-medium">{t('common.name', lang)}</label><input className="w-full rounded-lg border px-3 py-2 text-sm" value={centerName} onChange={e => setCenterName(e.target.value)} /></div>
            <div><label className="mb-1 block text-sm font-medium">{t('common.address', lang)}</label><input className="w-full rounded-lg border px-3 py-2 text-sm" value={address} onChange={e => setAddress(e.target.value)} /></div>
            <div><label className="mb-1 block text-sm font-medium">{t('common.phone', lang)}</label><input className="w-full rounded-lg border px-3 py-2 text-sm" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div><label className="mb-1 block text-sm font-medium">Wilaya</label>
              <select className="w-full rounded-lg border px-3 py-2 text-sm" value={wilaya} onChange={e => setWilaya(e.target.value)}>
                <option>Alger</option><option>Oran</option><option>Constantine</option>
              </select>
            </div>
            {settingsLoading ? (
              <div className="p-4 text-center text-muted">{t('common.loading', lang)}</div>
            ) : (
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90" onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? t('common.save', lang) + '...' : t('common.save', lang)}
              </button>
            )}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">{t('nav.settings', lang)}</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm">{t('nav.notifications', lang)}</span>
              <input type="checkbox" checked={emailNotif} onChange={e => setEmailNotif(e.target.checked)} className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">{t('nav.notifications', lang)} SMS</span>
              <input type="checkbox" checked={smsNotif} onChange={e => setSmsNotif(e.target.checked)} className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">{t('nav.invoices', lang)}</span>
              <input type="checkbox" checked={autoInvoice} onChange={e => setAutoInvoice(e.target.checked)} className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">{t('common.type', lang)}</span>
              <select className="rounded-lg border px-3 py-1 text-sm" value={currency} onChange={e => setCurrency(e.target.value)}><option>DZD</option><option>EUR</option><option>USD</option></select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
