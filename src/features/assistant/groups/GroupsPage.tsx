import { useState, useMemo, useEffect } from 'react';
import { Plus, Users, X, Pencil, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useSubjects, useLevels, useRooms, useUsers } from '@/hooks/useQueries';
import { getFullName } from '@/lib/utils';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function GroupsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel('groups_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        qc.invalidateQueries({ queryKey: ['assistant_groups'] });
      })
      .subscribe();
    return () => { channel.unsubscribe(); supabase.removeChannel(channel); };
  }, [qc]);

  const { data: groups, isLoading, isError } = useQuery({
    queryKey: ['assistant_groups'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('courses')
        .select('id, name, type, capacity, current_enrollments, status, level:levels(name, category), subject:subjects(name), teacher:users!courses_teacher_id_fkey(first_name, last_name)')
        .order('name');
      return data ?? [];
    },
  });

  const { data: subjects } = useSubjects();
  const { data: levels } = useLevels();
  const { data: rooms } = useRooms();
  const { data: allUsers } = useUsers();
  const teachers = (allUsers ?? []).filter((u: any) => u.role === 'teacher');

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const levelsByCat = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    for (const l of levels ?? []) {
      (grouped[l.category] ??= []).push(l);
    }
    return grouped;
  }, [levels]);
  const filteredLevels = catFilter ? (levelsByCat[catFilter] ?? []) : (levels ?? []);

  const filteredGroups = (groups ?? []).filter((c: any) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.subject?.name?.toLowerCase().includes(q) || c.level?.name?.toLowerCase().includes(q);
    const matchesCat = !catFilter || c.level?.category === catFilter;
    const matchesLevel = !levelFilter || c.level_id === parseInt(levelFilter);
    const matchesSubject = !subjectFilter || c.subject_id === parseInt(subjectFilter);
    return matchesSearch && matchesCat && matchesLevel && matchesSubject;
  });

  useErrorToast(isError, lang, t('nav.groups', lang));

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', type: 'normal', description: '', price: '', capacity: '', start_date: '', end_date: '', subject_id: '', level_id: '', teacher_id: '', room_id: '' });

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: '', type: 'normal', description: '', price: '', capacity: '', start_date: '', end_date: '', subject_id: '', level_id: '', teacher_id: '', room_id: '' });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setForm({ name: item.name ?? '', type: item.type ?? 'normal', description: item.description ?? '', price: item.price?.toString() ?? '', capacity: item.capacity?.toString() ?? '', start_date: item.start_date ?? '', end_date: item.end_date ?? '', subject_id: item.subject_id?.toString() ?? '', level_id: item.level_id?.toString() ?? '', teacher_id: item.teacher_id ?? '', room_id: item.room_id?.toString() ?? '' });
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error(t('groups.name_required', lang));
      if (!form.level_id) throw new Error('Niveau requis');
      if (!form.subject_id) throw new Error('Matière requise');
      if (!form.teacher_id) throw new Error('Enseignant requis');
      if (!form.start_date) throw new Error('Date de début requise');
      if (!form.end_date) throw new Error('Date de fin requise');
      const price = parseFloat(form.price);
      if (isNaN(price) || price <= 0) throw new Error('Prix invalide');
      const capacity = parseInt(form.capacity, 10);
      if (isNaN(capacity) || capacity <= 0) throw new Error(t('groups.capacity_invalid', lang));
      const payload: Record<string, any> = {
        name: form.name.trim(),
        description: form.description.trim(),
        capacity,
        price,
        start_date: form.start_date,
        end_date: form.end_date,
        type: form.type,
      };
      if (!editingId) payload.status = 'active';
      payload.subject_id = parseInt(form.subject_id, 10);
      payload.level_id = parseInt(form.level_id, 10);
      payload.teacher_id = form.teacher_id;
      payload.room_id = form.room_id ? parseInt(form.room_id, 10) : undefined;
      if (editingId) {
        const { error } = await (supabase as any).from('courses').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('courses').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_groups'] });
      toast(t(editingId ? 'success.updated' : 'success.created', lang, t('nav.groups', lang)), 'success');
      setShowModal(false);
      setEditingId(null);
      setForm({ name: '', type: 'normal', description: '', price: '', capacity: '', start_date: '', end_date: '', subject_id: '', level_id: '', teacher_id: '', room_id: '' });
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await (supabase as any).from('courses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_groups'] });
      toast(t('success.deleted', lang, t('nav.groups', lang)), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.id, { onSettled: () => setConfirmDelete(null) }); }}
        message={`${t('common.confirm_delete', lang)} "${confirmDelete?.name ?? ''}" ?`}
        loading={deleteMutation.isPending}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.groups', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('groups.subtitle', lang)}</p>
        </div>
        <Button className="gap-2" onClick={openCreateModal} disabled={saveMutation.isPending}><Plus className="h-4 w-4" />{t('groups.new', lang)}</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un cours..." className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm" />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setLevelFilter(''); }} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Tous niveaux</option>
          <option value="primary">Primaire</option>
          <option value="middle">CEM</option>
          <option value="high_school">Lycée</option>
        </select>
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm min-w-[140px]">
          <option value="">Toutes classes</option>
          {filteredLevels.map((l: any) => (
            <option key={l.id} value={String(l.id)}>{l.name}{l.stream ? ` - ${l.stream}` : ''}</option>
          ))}
        </select>
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Toutes matières</option>
          {(subjects ?? []).map((s: any) => (
            <option key={s.id} value={String(s.id)}>{s.name}</option>
          ))}
        </select>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{editingId ? t('common.edit', lang) : t('groups.new', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('common.name', lang)} *</Label>
                <Input placeholder={t('common.name', lang)} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))} placeholder={t('common.select', lang)}>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="private">Particulier</SelectItem>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.description', lang)}</Label>
                <Textarea placeholder={t('groups.desc_placeholder', lang)} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.price', lang)} *</Label>
                <Input type="number" min="0" placeholder="5000" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('groups.capacity', lang)} *</Label>
                <Input type="number" placeholder={t('groups.capacity_placeholder', lang)} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Début *</Label>
                  <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Fin *</Label>
                  <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Niveau *</Label>
                <Select value={form.level_id} onValueChange={v => setForm(f => ({ ...f, level_id: v }))} placeholder={t('common.select', lang)}>
                  {(levels ?? [])
                    .sort((a: any, b: any) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
                    .map((l: any) => {
                      const catLabel = l.category === 'primary' ? 'Primaire' : l.category === 'middle' ? 'CEM' : 'Lycée';
                      return (
                        <SelectItem key={l.id} value={String(l.id)}>
                          [{catLabel}] {l.name}{l.stream ? ` - ${l.stream}` : ''}
                        </SelectItem>
                      );
                    })}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Matière *</Label>
                <Select value={form.subject_id} onValueChange={v => setForm(f => ({ ...f, subject_id: v }))} placeholder={t('common.select', lang)}>
                  {(subjects ?? []).map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Enseignant *</Label>
                <Select value={form.teacher_id} onValueChange={v => setForm(f => ({ ...f, teacher_id: v }))} placeholder={t('common.select', lang)}>
                  {teachers.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{getFullName(t.first_name, t.last_name)}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Salle</Label>
                <Select value={form.room_id} onValueChange={v => setForm(f => ({ ...f, room_id: v }))} placeholder={t('common.select', lang)}>
                  <SelectItem value="">—</SelectItem>
                  {(rooms ?? []).map((r: any) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? t('common.loading', lang) : (editingId ? t('common.save', lang) : t('groups.create', lang))}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardHeader className="pb-3"><div className="h-24 bg-muted rounded-xl animate-pulse" /></CardHeader></Card>
        )) : filteredGroups.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p>
          </div>
        ) : filteredGroups.map((g: any) => (
          <Card key={g.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{g.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{g.level?.name ?? '—'} · {g.subject?.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{g.teacher ? getFullName(g.teacher.first_name, g.teacher.last_name) : '—'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={g.status === 'active' ? 'success' : 'outline'}>
                    {g.status === 'active' ? t('status.active', lang) : t('status.inactive', lang)}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(g)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmDelete({ id: g.id, name: g.name })} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                </div>
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
