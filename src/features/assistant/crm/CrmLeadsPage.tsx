import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, X, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useCrmLeads, useCreateLead } from './useCrm';
import type { Database } from '@/types/database';

const SOURCES: Database['public']['Enums']['crm_lead_source'][] = ['website', 'campaign', 'walk_in', 'referral', 'social', 'phone', 'other'];

export default function CrmLeadsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data: leads, isLoading, isError } = useCrmLeads(debouncedSearch);
  const createLead = useCreateLead();
  useErrorToast(isError, lang, t('nav.crm_leads', lang));

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    source: 'website',
    notes: '',
  });

  const openModal = () => {
    setForm({ first_name: '', last_name: '', phone: '', whatsapp: '', email: '', address: '', source: 'website', notes: '' });
    setShowModal(true);
  };

  const handleCreate = () => {
    if (!form.first_name.trim() || !form.phone.trim()) {
      toast(t('invoices.fill_fields', lang), 'error');
      return;
    }
    createLead.mutate(
      {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || null,
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        source: form.source as Database['public']['Enums']['crm_lead_source'],
        notes: form.notes.trim() || null,
      },
      {
        onSuccess: () => {
          toast(t('success.created', lang, t('crm.lead', lang)), 'success');
          setShowModal(false);
        },
        onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
      },
    );
  };

  const openDeals = (lead: NonNullable<typeof leads>[number]) =>
    (lead.deals ?? []).filter(d => !d.deleted_at);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.crm_leads', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('crm.leads_subtitle', lang)}</p>
        </div>
        <Button className="gap-2" onClick={openModal}><Plus className="h-4 w-4" />{t('crm.new_lead', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4 my-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('crm.new_lead', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('crm.first_name', lang)}</Label>
                  <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t('crm.last_name', lang)}</Label>
                  <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('crm.phone', lang)}</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t('crm.whatsapp', lang)}</Label>
                  <Input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('crm.email', lang)}</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t('crm.address', lang)}</Label>
                  <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('crm.source', lang)}</Label>
                <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
                  <SelectContent>
                    {SOURCES.map(s => (
                      <SelectItem key={s} value={s}>{t(`crm.source_${s}`, lang)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('crm.notes', lang)}</Label>
                <Textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={handleCreate} disabled={createLead.isPending}>
                  {createLead.isPending ? t('common.loading', lang) : t('common.create', lang)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('common.search', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('crm.lead', lang)}</TableHead>
                <TableHead className="hidden md:table-cell">{t('crm.phone', lang)}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('crm.source', lang)}</TableHead>
                <TableHead>{t('crm.leads', lang)}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('common.created_on', lang)}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{[1, 2, 3, 4, 5, 6].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
                ))
              ) : !leads || leads.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('common.no_results', lang)}</TableCell></TableRow>
              ) : (
                leads.map(lead => {
                  const deals = openDeals(lead);
                  const won = deals.filter(d => d.stage?.is_won).length;
                  return (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{`${lead.first_name} ${lead.last_name ?? ''}`.trim()}</p>
                        <p className="text-xs text-muted-foreground">{lead.email}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{lead.phone || lead.whatsapp || '—'}</TableCell>
                      <TableCell className="hidden sm:table-cell"><Badge variant="outline">{lead.source}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline">{deals.length}</Badge>
                          {won > 0 && <Badge variant="success">{won}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(lead.created_at)}</TableCell>
                      <TableCell>
                        <Link to={`/assistant/crm/leads/${lead.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ArrowRight className="h-4 w-4" /></Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
