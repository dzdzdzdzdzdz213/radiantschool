import { useMemo, useState } from 'react';
import { Plus, X, Trash2, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import ConfirmDialog from '@/components/ui/confirm-dialog';import {
  useAccounts,
  useJournalEntries,
  useLedger,
  useTrialBalance,
  useIncomeStatement,
  useReceivablesAging,
  usePostJournalEntry,
  useCancelJournalEntry,
} from './useAccounting';
import type { Database } from '@/types/database';

type VoucherType = Database['public']['Enums']['acct_voucher_type'];

const VOUCHER_TYPES: VoucherType[] = ['journal', 'bank', 'cash', 'opening', 'sales_invoice', 'payment', 'payroll', 'credit_note', 'debit_note'];

const VOUCHER_KEY: Record<VoucherType, string> = {
  journal: 'accounting.voucher_journal',
  bank: 'accounting.voucher_bank',
  cash: 'accounting.voucher_cash',
  opening: 'accounting.voucher_opening',
  sales_invoice: 'accounting.voucher_sales_invoice',
  payment: 'accounting.voucher_payment',
  payroll: 'accounting.voucher_payroll',
  credit_note: 'accounting.voucher_credit_note',
  debit_note: 'accounting.voucher_debit_note',
};

const STATUS_VARIANT: Record<string, 'outline' | 'success' | 'destructive'> = {
  draft: 'outline',
  posted: 'success',
  cancelled: 'destructive',
};

interface LineForm {
  account_id: string;
  debit: string;
  credit: string;
  description: string;
}

export default function AccountingPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const { data: accounts } = useAccounts();
  const { data: entries, isLoading: entriesLoading, isError } = useJournalEntries();
  const { data: ledgerRows, isLoading: ledgerLoading } = useLedger(null);
  const { data: trialBalance } = useTrialBalance();
  const { data: incomeStatement } = useIncomeStatement();
  const { data: aging } = useReceivablesAging();
  const postEntry = usePostJournalEntry();
  const cancelEntry = useCancelJournalEntry();

  useErrorToast(isError, lang, t('nav.accounting', lang));

  const [activeTab, setActiveTab] = useState('journal');
  const [showModal, setShowModal] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState<{ id: number; title: string } | null>(null);
  const [form, setForm] = useState({ title: '', posting_date: new Date().toISOString().slice(0, 10), voucher_type: 'journal' as VoucherType, remarks: '' });
  const [lines, setLines] = useState<LineForm[]>([]);

  const totals = useMemo(() => {
    return lines.reduce(
      (acc, line) => ({
        debit: acc.debit + (parseFloat(line.debit) || 0),
        credit: acc.credit + (parseFloat(line.credit) || 0),
      }),
      { debit: 0, credit: 0 },
    );
  }, [lines]);

  const openModal = () => {
    setForm({ title: '', posting_date: new Date().toISOString().slice(0, 10), voucher_type: 'journal', remarks: '' });
    setLines([{ account_id: '', debit: '', credit: '', description: '' }]);
    setShowModal(true);
  };

  const updateLine = (idx: number, patch: Partial<LineForm>) => {
    setLines(prev => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const handlePost = () => {
    if (!form.title.trim()) {
      toast(t('invoices.fill_fields', lang), 'error');
      return;
    }
    const validLines = lines
      .filter(l => l.account_id)
      .map(l => ({
        account_id: Number(l.account_id),
        debit: parseFloat(l.debit) || 0,
        credit: parseFloat(l.credit) || 0,
        description: l.description.trim() || null,
      }));
    if (validLines.length === 0 || !validLines.some(l => l.debit > 0) || !validLines.some(l => l.credit > 0)) {
      toast(t('accounting.no_lines', lang), 'error');
      return;
    }
    if (Math.abs(totals.debit - totals.credit) > 0.001) {
      toast(t('accounting.unbalanced', lang), 'error');
      return;
    }
    postEntry.mutate(
      {
        posting_date: form.posting_date,
        title: form.title.trim(),
        voucher_type: form.voucher_type,
        remarks: form.remarks.trim() || null,
        lines: validLines,
      },
      {
        onSuccess: () => {
          toast(t('success.updated', lang, t('accounting.journal', lang)), 'success');
          setShowModal(false);
        },
        onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
      },
    );
  };

  const runningBalances = useMemo(() => {
    if (!ledgerRows) return new Map<number, number>();
    const map = new Map<number, number>();
    const asc = [...ledgerRows].reverse();
    for (const row of asc) {
      const prev = map.get(row.account_id ?? -1) ?? 0;
      const sign = row.root_type === 'asset' || row.root_type === 'expense' ? 1 : -1;
      map.set(row.account_id ?? -1, prev + sign * ((row.debit ?? 0) - (row.credit ?? 0)));
    }
    return map;
  }, [ledgerRows]);

  const balanceFor = (row: NonNullable<typeof ledgerRows>[number]) => {
    const sign = row.root_type === 'asset' || row.root_type === 'expense' ? 1 : -1;
    return sign * ((row.debit ?? 0) - (row.credit ?? 0));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.accounting', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('accounting.subtitle', lang)}</p>
        </div>
        {activeTab === 'journal' && (
          <Button className="gap-2" onClick={openModal}><Plus className="h-4 w-4" />{t('accounting.new_entry', lang)}</Button>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmCancel}
        onClose={() => setConfirmCancel(null)}
        onConfirm={() => {
          if (confirmCancel) {
            cancelEntry.mutate(confirmCancel.id, {
              onSuccess: () => { toast(t('success.updated', lang, t('accounting.journal', lang)), 'success'); setConfirmCancel(null); },
              onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
            });
          }
        }}
        message={`${t('common.confirm_delete', lang)} "${confirmCancel?.title ?? ''}" ?`}
        loading={cancelEntry.isPending}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-2xl mx-4 my-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('accounting.new_entry', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('accounting.title', lang)}</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={t('accounting.title', lang)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('accounting.posting_date', lang)}</Label>
                  <Input type="date" value={form.posting_date} onChange={e => setForm(f => ({ ...f, posting_date: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('accounting.voucher_type', lang)}</Label>
                  <Select value={form.voucher_type} onValueChange={v => setForm(f => ({ ...f, voucher_type: v as VoucherType }))}>
                    <SelectContent>
                      {VOUCHER_TYPES.map(vt => (
                        <SelectItem key={vt} value={vt}>{t(VOUCHER_KEY[vt], lang)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('accounting.remarks', lang)}</Label>
                  <Input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t('accounting.journal', lang)}</Label>
                  <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setLines(prev => [...prev, { account_id: '', debit: '', credit: '', description: '' }])}>
                    <Plus className="h-3.5 w-3.5" />{t('accounting.add_line', lang)}
                  </Button>
                </div>
                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_90px_90px_32px] items-end gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px]">{t('accounting.account', lang)}</Label>
                        <Select value={line.account_id} onValueChange={v => updateLine(idx, { account_id: v })} placeholder={t('common.select', lang)}>
                          <SelectContent>
                            {(accounts ?? []).filter(a => !a.is_group).map(a => (
                              <SelectItem key={a.id} value={String(a.id)}>{`${a.account_number ?? ''} ${a.account_name}`.trim()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">{t('accounting.debit', lang)}</Label>
                        <Input type="number" min="0" step="0.01" value={line.debit} onChange={e => updateLine(idx, { debit: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">{t('accounting.credit', lang)}</Label>
                        <Input type="number" min="0" step="0.01" value={line.credit} onChange={e => updateLine(idx, { credit: e.target.value })} />
                      </div>
                      <Button variant="ghost" size="sm" className="h-9 w-8 p-0 text-destructive" onClick={() => setLines(prev => prev.filter((_, i) => i !== idx))} disabled={lines.length <= 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{t('accounting.totals', lang)}</span>
                  <span className="font-semibold">{formatCurrency(totals.debit)} = {formatCurrency(totals.credit)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={handlePost} disabled={postEntry.isPending}>
                  {postEntry.isPending ? t('common.loading', lang) : t('accounting.post', lang)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="journal">{t('accounting.journal', lang)}</TabsTrigger>
          <TabsTrigger value="ledger">{t('accounting.ledger', lang)}</TabsTrigger>
          <TabsTrigger value="trial_balance">{t('accounting.trial_balance', lang)}</TabsTrigger>
          <TabsTrigger value="income_statement">{t('accounting.income_statement', lang)}</TabsTrigger>
          <TabsTrigger value="aging">{t('accounting.aging', lang)}</TabsTrigger>
        </TabsList>

        <TabsContent value="journal">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{t('accounting.journal_subtitle', lang)}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('accounting.posting_date', lang)}</TableHead>
                    <TableHead>{t('accounting.title', lang)}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('accounting.voucher_type', lang)}</TableHead>
                    <TableHead className="text-right">{t('accounting.debit', lang)}</TableHead>
                    <TableHead className="text-right">{t('accounting.credit', lang)}</TableHead>
                    <TableHead>{t('common.status', lang)}</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entriesLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>{[1, 2, 3, 4, 5, 6, 7].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
                    ))
                  ) : !entries || entries.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('common.no_results', lang)}</TableCell></TableRow>
                  ) : (
                    entries.map(entry => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(entry.posting_date)}</TableCell>
                        <TableCell className="text-sm font-medium">{entry.title}</TableCell>
                        <TableCell className="hidden sm:table-cell"><Badge variant="outline">{t(VOUCHER_KEY[entry.voucher_type], lang)}</Badge></TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(entry.total_debit)}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(entry.total_credit)}</TableCell>
                        <TableCell><Badge variant={STATUS_VARIANT[entry.status]}>{t(`accounting.${entry.status}`, lang)}</Badge></TableCell>
                        <TableCell>
                          {entry.status === 'posted' && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmCancel({ id: entry.id, title: entry.title })} title={t('accounting.cancel', lang)}>
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{t('accounting.ledger_subtitle', lang)}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('accounting.posting_date', lang)}</TableHead>
                    <TableHead>{t('accounting.account', lang)}</TableHead>
                    <TableHead className="text-right">{t('accounting.debit', lang)}</TableHead>
                    <TableHead className="text-right">{t('accounting.credit', lang)}</TableHead>
                    <TableHead className="text-right">{t('accounting.balance', lang)}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('accounting.remarks', lang)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>{[1, 2, 3, 4, 5, 6].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
                    ))
                  ) : !ledgerRows || ledgerRows.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('common.no_results', lang)}</TableCell></TableRow>
                  ) : (
                    ledgerRows.map((row, idx) => {
                      const balance = balanceFor(row);
                      const running = runningBalances.get(row.account_id ?? -1) ?? balance;
                      return (
                        <TableRow key={idx}>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(row.posting_date ?? '')}</TableCell>
                          <TableCell className="text-sm">
                            <p className="font-medium">{row.account_name}</p>
                            <p className="text-xs text-muted-foreground">{row.title}</p>
                          </TableCell>
                          <TableCell className="text-right text-sm">{row.debit ? formatCurrency(row.debit) : '—'}</TableCell>
                          <TableCell className="text-right text-sm">{row.credit ? formatCurrency(row.credit) : '—'}</TableCell>
                          <TableCell className="text-right text-sm font-medium">{formatCurrency(Math.abs(running))} {balance < 0 ? '(C)' : '(D)'}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{row.remarks ?? row.against_account ?? '—'}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial_balance">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{t('accounting.trial_balance_subtitle', lang)}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('accounting.account', lang)}</TableHead>
                    <TableHead className="text-right">{t('accounting.debit', lang)}</TableHead>
                    <TableHead className="text-right">{t('accounting.credit', lang)}</TableHead>
                    <TableHead className="text-right">{t('accounting.balance', lang)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!trialBalance || trialBalance.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t('common.no_results', lang)}</TableCell></TableRow>
                  ) : (
                    trialBalance.map(row => {
                      const debit = row.total_debit ?? 0;
                      const credit = row.total_balance_credit ?? 0;
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="text-sm">
                            <span className="font-mono text-xs text-muted-foreground mr-2">{row.account_number}</span>
                            <span className={row.is_group ? 'font-semibold' : 'font-normal'}>{row.account_name}</span>
                          </TableCell>
                          <TableCell className="text-right text-sm">{debit ? formatCurrency(debit) : '—'}</TableCell>
                          <TableCell className="text-right text-sm">{credit ? formatCurrency(credit) : '—'}</TableCell>
                          <TableCell className="text-right text-sm font-medium">{formatCurrency(row.balance ?? 0)}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income_statement">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{t('accounting.income_statement_subtitle', lang)}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('accounting.account', lang)}</TableHead>
                    <TableHead className="text-right">{t('common.amount', lang)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!incomeStatement || incomeStatement.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-8 text-muted-foreground">{t('common.no_results', lang)}</TableCell></TableRow>
                  ) : (
                    incomeStatement.map(row => (
                      <TableRow key={row.id}>
                        <TableCell className="text-sm">
                          <span className="font-mono text-xs text-muted-foreground mr-2">{row.account_number}</span>{row.account_name}
                        </TableCell>
                        <TableCell className={`text-right text-sm font-medium ${row.root_type === 'expense' ? 'text-destructive' : ''}`}>
                          {formatCurrency(row.amount ?? 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{t('accounting.aging_subtitle', lang)}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('invoices.number', lang)}</TableHead>
                    <TableHead>{t('nav.students', lang)}</TableHead>
                    <TableHead className="text-right">{t('common.amount', lang)}</TableHead>
                    <TableHead className="text-right">{t('accounting.balance', lang)}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('invoices.due_date', lang)}</TableHead>
                    <TableHead className="text-right">{t('common.status', lang)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!aging || aging.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('common.no_results', lang)}</TableCell></TableRow>
                  ) : (
                    aging.map(row => (
                      <TableRow key={row.invoice_number}>
                        <TableCell className="text-sm font-mono">{row.invoice_number}</TableCell>
                        <TableCell className="text-sm font-medium">{row.student_name}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(row.total_amount ?? 0)}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">{formatCurrency(row.balance ?? 0)}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{row.due_date ? formatDate(row.due_date) : '—'}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={(row.days_overdue ?? 0) > 0 ? 'destructive' : row.balance ? 'warning' : 'success'}>
                            {(row.days_overdue ?? 0) > 0 ? `${t('crm.overdue', lang)} ${row.days_overdue} j` : t(`status.${row.status ?? 'unpaid'}`, lang)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
