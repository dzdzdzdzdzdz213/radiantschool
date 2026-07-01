import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoomStatus } from '../useAssistantDashboard';

interface RoomOccupancyProps {
  data: RoomStatus[];
  loading?: boolean;
}

export default function RoomOccupancy({ data, loading }: RoomOccupancyProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        Salles
      </h3>
      <div className="space-y-2">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Aucune salle</p>
        ) : (
          data.slice(0, 5).map((room) => (
            <div key={room.id} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{room.name}</p>
                  <p className="text-xs text-muted-foreground">Capacité: {room.capacity}</p>
                </div>
              </div>
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                room.status === 'available' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                room.status === 'occupied' ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400' :
                'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
              )}>
                {room.status === 'available' ? 'Libre' : room.status === 'occupied' ? 'Occupée' : 'Réservée'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}