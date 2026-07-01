import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RfidRecord {
  id: string;
  studentName: string;
  scannedAt: string;
  status: string;
}

interface RfidSummaryProps {
  data: RfidRecord[];
  totalScans: number;
  loading?: boolean;
}

export default function RfidSummary({ data, totalScans, loading }: RfidSummaryProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-28 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4 text-cyan-500" />
          Scans RFID
        </h3>
        <span className="text-xs font-medium text-muted-foreground">Total: {totalScans}</span>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Aucun scan aujourd'hui</p>
      ) : (
        <div className="space-y-2">
          {data.slice(0, 5).map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {r.studentName.charAt(0)}
                </div>
                <span className="text-sm font-medium">{r.studentName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{r.scannedAt}</span>
                <span className={cn(
                  'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                  r.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                )}>
                  {r.status === 'success' ? 'OK' : 'Échec'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}