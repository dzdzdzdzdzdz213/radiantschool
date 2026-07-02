import { useState, useEffect } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function RoomsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: rooms, isLoading, isError } = useQuery({
    queryKey: ['assistant_rooms'],
    queryFn: async () => {
      const { data } = await (supabase as any).from('rooms').select('*').order('name');
      return data ?? [];
    },
  });

  useEffect(() => {
    if (isError) toast(t('errors.load_error', lang, t('nav.rooms', lang)), 'error');
  }, [isError]);

  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState('');
  const [roomFloor, setRoomFloor] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!roomName.trim()) throw new Error(t('rooms.name_required', lang));
      const capacity = parseInt(roomCapacity, 10);
      if (isNaN(capacity) || capacity <= 0) throw new Error(t('rooms.capacity_invalid', lang));
      const { error } = await (supabase as any).from('rooms').insert({ name: roomName.trim(), capacity, floor: roomFloor.trim() || null, status: 'available' });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_rooms'] }); toast(t('success.created', lang, t('rooms.room', lang)), 'success'); setShowModal(false); setRoomName(''); setRoomCapacity(''); setRoomFloor(''); },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.rooms', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('rooms.subtitle', lang)}</p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)} disabled={createMutation.isPending}><Plus className="h-4 w-4" />{t('rooms.new', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('rooms.new', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('rooms.name', lang)} *</Label>
                <Input placeholder={t('common.name', lang)} value={roomName} onChange={e => setRoomName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('rooms.capacity', lang)} *</Label>
                <Input type="number" placeholder={t('rooms.capacity_placeholder', lang)} value={roomCapacity} onChange={e => setRoomCapacity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('rooms.floor', lang)}</Label>
                <Input placeholder={t('rooms.floor_placeholder', lang)} value={roomFloor} onChange={e => setRoomFloor(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                  {createMutation.isPending ? t('common.loading', lang) : t('rooms.create', lang)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardHeader className="pb-3"><div className="h-24 bg-muted rounded-xl animate-pulse" /></CardHeader></Card>
        )) : (rooms ?? []).length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p>
          </div>
        ) : (rooms ?? []).map((room: any) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{room.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t('rooms.floor', lang)} {room.floor ?? '—'}</p>
                  </div>
                </div>
                <Badge variant={room.status === 'available' ? 'success' : room.status === 'occupied' ? 'destructive' : 'warning'}>
                  {room.status === 'available' ? t('rooms.available', lang) : room.status === 'occupied' ? t('rooms.occupied', lang) : t('rooms.reserved', lang)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('rooms.capacity', lang)}</span>
                <span className="font-medium">{room.capacity} {t('rooms.seats', lang)}</span>
              </div>
              {room.equipment && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(room.equipment as string[] ?? []).map((eq: string) => (
                    <span key={eq} className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">{eq}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
