import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface OccupancyItem {
  name: string;
  current_enrollments: number;
  capacity: number;
  room: { name: string } | null;
}

interface OccupancyChartWidgetProps {
  data: OccupancyItem[];
  loading?: boolean;
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-44" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupation des salles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-[280px]">
          <p className="text-sm text-muted-foreground">Aucune salle attribuée</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Les données apparaîtront après l'assignation des salles</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface PayloadItem {
  payload: OccupancyItem & { roomName: string; pct: number };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold">{d.room?.name ?? d.name}</p>
      <p className="text-xs mt-1 text-muted-foreground">{d.current_enrollments}/{d.capacity} élèves ({d.pct}%)</p>
    </div>
  );
}

function getBarColor(pct: number): string {
  if (pct >= 90) return '#ef4444';
  if (pct >= 75) return '#f59e0b';
  if (pct >= 50) return '#3b82f6';
  return '#10b981';
}

export default function OccupancyChartWidget({ data, loading }: OccupancyChartWidgetProps) {
  if (loading) return <ChartSkeleton />;
  if (!data || data.length === 0) return <EmptyState />;

  const chartData = data
    .map(d => ({
      ...d,
      roomName: d.room?.name ?? 'Sans salle',
      pct: d.capacity > 0 ? Math.round((d.current_enrollments / d.capacity) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">Occupation des salles</CardTitle>
        <span className="text-xs font-medium rounded-lg px-2.5 py-1 bg-accent/10 text-accent">
          {chartData.length} cours
        </span>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
              <YAxis type="category" dataKey="roomName" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border)' }} />
              <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={getBarColor(entry.pct)} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
