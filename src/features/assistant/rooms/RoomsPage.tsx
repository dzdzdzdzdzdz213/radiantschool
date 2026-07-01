import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function RoomsPage() {
  const { data: rooms } = useQuery({
    queryKey: ['assistant_rooms'],
    queryFn: async () => {
      const { data } = await (supabase as any).from('rooms').select('*').order('name');
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salles</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérer les salles et réservations</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />Nouvelle salle</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(rooms ?? []).map((room: any) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{room.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">Étage {room.floor ?? '—'}</p>
                  </div>
                </div>
                <Badge variant={room.status === 'available' ? 'success' : room.status === 'occupied' ? 'destructive' : 'warning'}>
                  {room.status === 'available' ? 'Libre' : room.status === 'occupied' ? 'Occupée' : 'Réservée'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Capacité</span>
                <span className="font-medium">{room.capacity} places</span>
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