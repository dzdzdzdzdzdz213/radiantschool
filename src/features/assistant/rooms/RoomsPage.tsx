import { useState, useMemo, useEffect } from 'react';
import { MapPin, Plus, X, Pencil, Trash2, Search, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function RoomsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel('rooms_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        qc.invalidateQueries({ queryKey: ['assistant_rooms'] });
      })
      .subscribe();
    return () => { channel.unsubscribe(); supabase.removeChannel(channel); };
  }, [qc]);

  const { data: rooms, isLoading, isError } = useQuery({
    queryKey: ['assistant_rooms'],
    queryFn: async () => {
      const { data } = await supabase
        .from('rooms')
        .select('*, courses!courses_room_id_fkey(id, name, status)')
        .order('name');
      return data ?? [];
    },
  });

  useErrorToast(isError, lang, t('nav.rooms', lang));

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', capacity: '', floor: '', status: 'active', equipment: '' });

  const filteredRooms = useMemo(() => {
    return (rooms ?? []).filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || r.name.toLowerCase().includes(q) || String(r.floor).includes(q);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rooms, search, statusFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: '', capacity: '', floor: '', status: 'active', equipment: '' });
    setShowModal(true);
  };

  const openEditModal = (item: NonNullable<typeof rooms>[number]) => {
    setEditingId(item.id);
    setForm({
      name: item.name ?? '',
      capacity: item.capacity?.toString() ?? '',
      floor: item.floor?.toString() ?? '',
      status: item.status ?? 'active',
      equipment: Array.isArray(item.equipment) ? item.equipment.join(', ') : '',
    });
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error(t('rooms.name_required', lang));
      const capacity = parseInt(form.capacity, 10);
      if (isNaN(capacity) || capacity <= 0) throw new Error(t('rooms.capacity_invalid', lang));
      const equipment = form.equipment.trim() ? form.equipment.split(',').map((e: string) => e.trim()).filter(Boolean) : [];
      const payload: Database['public']['Tables']['rooms']['Insert'] = {
        name: form.name.trim(),
        capacity,
        floor: form.floor ? parseInt(form.floor, 10) : null,
        status: form.status as never,
        equipment,
      };
      if (editingId) {
        const { error } = await supabase.from('rooms').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('rooms').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_rooms'] });
      toast(t(editingId ? 'success.updated' : 'success.created', lang, t('rooms.room', lang)), 'success');
      setShowModal(false);
      setEditingId(null);
      setForm({ name: '', capacity: '', floor: '', status: 'active', equipment: '' });
    },
    onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_rooms'] });
      toast(t('success.deleted', lang, t('rooms.room', lang)), 'success');
    },
    onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { error } = await supabase.from('rooms').update({ status: status as never }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_rooms'] });
      toast(t('success.updated', lang, t('rooms.room', lang)), 'success');
    },
    onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4 my-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{editingId ? t('common.edit', lang) : t('rooms.new', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('rooms.name', lang)} *</Label>
                <Input placeholder={t('common.name', lang)} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('rooms.capacity', lang)} *</Label>
                  <Input type="number" placeholder={t('rooms.capacity_placeholder', lang)} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t('rooms.floor', lang)}</Label>
                  <Input type="number" placeholder={t('rooms.floor_placeholder', lang)} value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('groups.status', lang)}</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectItem value="active">{t('rooms.available', lang)}</SelectItem>
                  <SelectItem value="maintenance">{t('rooms.reserved', lang)}</SelectItem>
                  <SelectItem value="inactive">{t('rooms.occupied', lang)}</SelectItem>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('rooms.equipment', lang)}</Label>
                <Textarea
                  placeholder={lang === 'fr' ? 'tableau, climatisation, vidéoprojecteur...' : lang === 'ar' ? 'سبورة، تكييف، جهاز عرض...' : 'whiteboard, AC, projector...'}
                  value={form.equipment}
                  onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))}
                  rows={2}
                />
                <p className="text-[10px] text-muted-foreground">{lang === 'fr' ? 'Séparer par des virgules' : lang === 'ar' ? 'افصل بفواصل' : 'Separate with commas'}</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? t('common.loading', lang) : (editingId ? t('common.save', lang) : t('rooms.create', lang))}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.rooms', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('rooms.subtitle', lang)}</p>
        </div>
        <Button className="gap-2" onClick={openCreateModal} disabled={saveMutation.isPending}><Plus className="h-4 w-4" />{t('rooms.new', lang)}</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('rooms.search_placeholder', lang)} className="h-9 pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter} className="min-w-[130px]">
          <SelectItem value="all">{t('groups.all_levels', lang)}</SelectItem>
          <SelectItem value="active">{t('rooms.available', lang)}</SelectItem>
          <SelectItem value="maintenance">{t('rooms.reserved', lang)}</SelectItem>
          <SelectItem value="inactive">{t('rooms.occupied', lang)}</SelectItem>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardHeader className="pb-3"><div className="h-24 bg-muted rounded-xl animate-pulse" /></CardHeader></Card>
        )) : filteredRooms.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p>
          </div>
        ) : filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{room.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {t('rooms.floor', lang)} {room.floor ?? '—'} · {room.capacity} {t('rooms.seats', lang)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(room)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmDelete({ id: room.id, name: room.name })} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Status + Course count */}
              <div className="flex items-center justify-between">
                <Select value={room.status} onValueChange={v => statusMutation.mutate({ id: room.id, status: v })} className="h-7 w-auto text-xs">
                  <SelectItem value="active">{t('rooms.available', lang)}</SelectItem>
                  <SelectItem value="maintenance">{t('rooms.reserved', lang)}</SelectItem>
                  <SelectItem value="inactive">{t('rooms.occupied', lang)}</SelectItem>
                </Select>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{room.courses?.length ?? 0} {t('rooms.courses', lang)}</span>
                </div>
              </div>

              {/* Equipment */}
              {(Array.isArray(room.equipment) ? room.equipment as string[] : []).length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(room.equipment) ? room.equipment as string[] : []).map((eq: string) => (
                    <span key={eq} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{eq}</span>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground">{t('rooms.no_equipment', lang)}</p>
              )}

              {/* Courses assigned */}
              {room.courses && room.courses.length > 0 && (
                <div className="space-y-1">
                  {room.courses.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-xs">
                      <span className="truncate">{c.name}</span>
                      <Badge variant={c.status === 'active' ? 'success' : 'outline'} className="text-[9px] shrink-0">{c.status}</Badge>
                    </div>
                  ))}
                  {room.courses.length > 3 && (
                    <p className="text-[10px] text-muted-foreground">+{room.courses.length - 3} {t('rooms.courses', lang)}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
