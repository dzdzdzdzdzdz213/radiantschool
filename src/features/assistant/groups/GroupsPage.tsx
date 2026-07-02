import { useState, useEffect } from 'react';
import { Search, Plus, Users, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function GroupsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: groups, isLoading, isError } = useQuery({
    queryKey: ['assistant_groups'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('courses')
        .select('id, name, type, capacity, current_enrollments, status, level:levels(name)')
        .order('name');
      return data ?? [];
    },
  });

  useEffect(() => {
    if (isError) toast(t('errors.load_error', lang, t('nav.groups', lang)), 'error');
  }, [isError]);

  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupCapacity, setGroupCapacity] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!groupName.trim()) throw new Error(t('groups.name_required', lang));
      const capacity = parseInt(groupCapacity, 10);
      if (isNaN(capacity) || capacity <= 0) throw new Error(t('groups.capacity_invalid', lang));
      const { error } = await (supabase as any).from('courses').insert({ name: groupName.trim(), description: groupDesc.trim(), capacity, type: 'normal', status: 'active' });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_groups'] }); toast(t('success.created', lang, t('nav.groups', lang)), 'success'); setShowModal(false); setGroupName(''); setGroupDesc(''); setGroupCapacity(''); },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.groups', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('groups.subtitle', lang)}</p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)} disabled={createMutation.isPending}><Plus className="h-4 w-4" />{t('groups.new', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('groups.new', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('common.name', lang)} *</Label>
                <Input placeholder={t('common.name', lang)} value={groupName} onChange={e => setGroupName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.description', lang)}</Label>
                <Textarea placeholder={t('groups.desc_placeholder', lang)} value={groupDesc} onChange={e => setGroupDesc(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t('groups.capacity', lang)} *</Label>
                <Input type="number" placeholder={t('groups.capacity_placeholder', lang)} value={groupCapacity} onChange={e => setGroupCapacity(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                  {createMutation.isPending ? t('common.loading', lang) : t('groups.create', lang)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardHeader className="pb-3"><div className="h-24 bg-muted rounded-xl animate-pulse" /></CardHeader></Card>
        )) : (groups ?? []).length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p>
          </div>
        ) : (groups ?? []).map((g: any) => (
          <Card key={g.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{g.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{g.level?.name ?? '—'}</p>
                </div>
                <Badge variant={g.status === 'active' ? 'success' : 'outline'}>
                  {g.status === 'active' ? t('status.active', lang) : t('status.inactive', lang)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{g.current_enrollments ?? 0}/{g.capacity}</span>
                </div>
                <span className="text-xs text-muted-foreground">{g.type}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-accent overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(((g.current_enrollments ?? 0) / (g.capacity || 1)) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
